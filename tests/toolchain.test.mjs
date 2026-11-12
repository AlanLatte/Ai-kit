import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function fixture(t, { ready = false, missing = [], installReady = false, installStatus = "0", brewStatus = "0" } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "ai-kit toolchain "));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const scripts = join(directory, "kit with spaces", "scripts");
  const bin = join(directory, "bin");
  mkdirSync(scripts, { recursive: true });
  mkdirSync(bin);
  const script = join(scripts, "toolchain.sh");
  const calls = join(directory, "calls");
  const state = join(directory, "ready");
  copyFileSync(new URL("../scripts/toolchain.sh", import.meta.url), script);
  writeFileSync(join(scripts, "hindsight.mjs"), "");
  writeFileSync(calls, "");
  if (ready) writeFileSync(state, "ready");
  symlinkSync("/usr/bin/dirname", join(bin, "dirname"));
  for (const name of ["git", "python3", "uv", "docker", "pre-commit", "ripwire", "tuicr", "jq", "shellcheck", "tre"]) {
    if (!missing.includes(name)) writeFileSync(join(bin, name), "#!/bin/bash\nexit 0\n", { mode: 0o755 });
  }
  writeFileSync(join(bin, "brew"), '#!/bin/bash\nprintf "brew %s\\n" "$*" >> "$CALLS"\nexit "$BREW_STATUS"\n', { mode: 0o755 });
  writeFileSync(join(bin, "node"), `#!/bin/bash
printf 'hindsight %s\\n' "$2" >> "$CALLS"
case "$2" in
  check) [ -f "$STATE" ] ;;
  install)
    if [ "$INSTALL_READY" = 1 ]; then printf ready > "$STATE"; fi
    exit "$INSTALL_STATUS"
    ;;
  *) exit 2 ;;
esac
`, { mode: 0o755 });
  return {
    state,
    calls: () => readFileSync(calls, "utf8").trim().split("\n").filter(Boolean),
    run: (...args) => spawnSync("/bin/bash", [script, ...args], {
      cwd: directory,
      encoding: "utf8",
      env: { PATH: bin, HOME: directory, AI_KIT_CLIENT: "omp", CALLS: calls, STATE: state, INSTALL_READY: installReady ? "1" : "0", INSTALL_STATUS: installStatus, BREW_STATUS: brewStatus },
    }),
  };
}

test("diagnostics never install binaries or create service state", (t) => {
  const context = fixture(t);
  assert.equal(context.run("check").status, 0);
  assert.equal(context.run("report").status, 0);
  assert.ok(context.calls().every((call) => call === "hindsight check"));
  assert.equal(existsSync(context.state), false);
});

test("empty, unknown and mixed-invalid selections reject before any installer or service probe", (t) => {
  for (const selection of [[], ["unknown"], ["jq", "unknown"], ["jq; false"]]) {
    const context = fixture(t, { missing: ["jq"] });
    assert.equal(context.run("install", ...selection).status, 2);
    assert.deepEqual(context.calls(), []);
    assert.equal(existsSync(context.state), false);
  }
});

test("a binary-only selection does not inspect or configure Hindsight", (t) => {
  for (const name of ["jq", "tuicr"]) {
    const context = fixture(t, { missing: [name], installReady: true });
    const result = context.run("install", name);
    assert.equal(result.status, 1);
    assert.deepEqual(context.calls(), [`brew install ${name}`]);
    assert.equal(existsSync(context.state), false);
  }
});

test("selected report does not inspect unselected service configuration", (t) => {
  const context = fixture(t);
  assert.equal(context.run("report", "jq").status, 0);
  assert.deepEqual(context.calls(), []);
});

test("unselected missing tools do not fail a successful selected service setup", (t) => {
  const context = fixture(t, { missing: ["jq"], installReady: true });
  assert.equal(context.run("install", "hindsight").status, 0);
  assert.equal(existsSync(context.state), true);
  assert.ok(context.calls().every((call) => call.startsWith("hindsight ")));
});

test("healthy selected installations are reused without another install", (t) => {
  const context = fixture(t, { ready: true });
  assert.equal(context.run("install", "hindsight", "jq", "tuicr").status, 0);
  assert.ok(context.calls().every((call) => call === "hindsight check"));
  assert.equal(existsSync(context.state), true);
});

test("installer success cannot hide selected service unavailability", (t) => {
  const context = fixture(t);
  assert.equal(context.run("install", "hindsight").status, 1);
  assert.equal(existsSync(context.state), false);
});

test("installer failure remains nonzero even if selected service becomes ready", (t) => {
  const context = fixture(t, { installReady: true, installStatus: "7" });
  assert.equal(context.run("install", "hindsight").status, 1);
  assert.equal(existsSync(context.state), true);
});

test("independent selected components continue after another installation fails", (t) => {
  const context = fixture(t, { missing: ["jq"], installReady: true, brewStatus: "3" });
  assert.equal(context.run("install", "jq", "hindsight", "hindsight").status, 1);
  assert.equal(existsSync(context.state), true);
  assert.equal(context.calls().filter((call) => call === "hindsight install").length, 1);
  assert.equal(context.calls().filter((call) => call === "brew install jq").length, 1);
});
