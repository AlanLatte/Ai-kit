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
  const helper = join(scripts, "hindsight.mjs");
  const calls = join(directory, "calls");
  const state = join(directory, "ready");
  copyFileSync(new URL("../scripts/toolchain.sh", import.meta.url), script);
  writeFileSync(helper, "");
  writeFileSync(calls, "");
  if (ready) writeFileSync(state, "ready");
  symlinkSync("/usr/bin/dirname", join(bin, "dirname"));
  for (const name of ["git", "python3", "uv", "docker", "pre-commit", "ripwire", "jq", "shellcheck", "tre"]) {
    if (!missing.includes(name)) writeFileSync(join(bin, name), "#!/bin/bash\nexit 0\n", { mode: 0o755 });
  }
  writeFileSync(join(bin, "brew"), '#!/bin/bash\nprintf "brew %s\\n" "$*" >> "$CALLS"\nexit "$BREW_STATUS"\n', { mode: 0o755 });
  writeFileSync(join(bin, "node"), `#!/bin/bash
printf '%s\\t%s\\n' "$1" "$2" >> "$CALLS"
case "$2" in
  check)
    [ -f "$STATE" ] && exit 0
    printf 'Hindsight: API unavailable; start Docker explicitly.\\n' >&2
    exit 1
    ;;
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
    run: (mode) => spawnSync("/bin/bash", [script, mode], {
      cwd: directory,
      encoding: "utf8",
      env: { PATH: bin, HOME: directory, AI_KIT_CLIENT: "omp", CALLS: calls, STATE: state, INSTALL_READY: installReady ? "1" : "0", INSTALL_STATUS: installStatus, BREW_STATUS: brewStatus },
    }),
  };
}

test("startup check and report expose service failure without installation or state changes", (t) => {
  const context = fixture(t);
  const check = context.run("check");
  assert.equal(check.status, 0);
  assert.equal(check.stdout, "");
  assert.match(check.stderr, /Hindsight: API unavailable/);
  const report = context.run("report");
  assert.equal(report.status, 0);
  assert.match(report.stdout, /hindsight/);
  assert.match(report.stdout, /Hindsight: API unavailable/);
  assert.ok(context.calls().every((call) => !call.includes("install")));
  assert.equal(existsSync(context.state), false);
});

test("ready startup stays quiet and explicit installation works from a spaced package path", (t) => {
  const context = fixture(t, { ready: true, installReady: true });
  const check = context.run("check");
  assert.equal(check.status, 0);
  assert.equal(check.stdout + check.stderr, "");
  rmSync(context.state);
  const install = context.run("install");
  assert.equal(install.status, 0);
  assert.equal(existsSync(context.state), true);
});

test("successful install command cannot hide an unavailable runtime", (t) => {
  const context = fixture(t);
  const result = context.run("install");
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Hindsight: API unavailable/);
});

test("remaining missing binaries make installation fail even when Hindsight becomes ready", (t) => {
  const context = fixture(t, { missing: ["jq"], installReady: true });
  const result = context.run("install");
  assert.equal(result.status, 1);
  assert.match(result.stdout, /jq/);
  assert.equal(existsSync(context.state), true);
});

test("helper installation failure is nonzero even when the final API check succeeds", (t) => {
  const context = fixture(t, { ready: true, installStatus: "7" });
  const result = context.run("install");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /hindsight/);
});

test("binary installation failure remains nonzero and does not skip Hindsight", (t) => {
  const context = fixture(t, { missing: ["jq"], ready: true, brewStatus: "3" });
  const result = context.run("install");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /jq/);
  assert.match(result.stdout, /==> hindsight/);
});
