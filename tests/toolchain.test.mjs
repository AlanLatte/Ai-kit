import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

function fixture(t, { ready = false, missing = [] } = {}) {
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
  for (const name of ["git", "python3", "uv", "direnv", "docker", "pre-commit", "ripwire", "tuicr", "jq", "shellcheck", "tre", "tmux"]) {
    if (!missing.includes(name)) writeFileSync(join(bin, name), "#!/bin/bash\nexit 0\n", { mode: 0o755 });
  }
  writeFileSync(join(bin, "node"), `#!/bin/bash
printf 'hindsight %s\\n' "$2" >> "$CALLS"
[ "$2" = check ] && [ -f "$STATE" ]
`, { mode: 0o755 });
  return {
    state,
    calls: () => readFileSync(calls, "utf8").trim().split("\n").filter(Boolean),
    run: (...args) => spawnSync("/bin/bash", [script, ...args], {
      cwd: directory,
      encoding: "utf8",
      env: { PATH: bin, HOME: directory, AI_KIT_CLIENT: "omp", CALLS: calls, STATE: state },
    }),
  };
}

test("diagnostics never install binaries or create service state", (t) => {
  const context = fixture(t);
  assert.equal(context.run("check").status, 1);
  assert.equal(context.run("report").status, 0);
  assert.deepEqual(context.calls(), ["hindsight check", "hindsight check"]);
  assert.equal(existsSync(context.state), false);
});

test("diagnostics reject installer mode and unknown component IDs before probing services", (t) => {
  const context = fixture(t, { missing: ["jq"] });
  assert.equal(context.run("install", "hindsight", "jq").status, 2);
  assert.equal(context.run("check", "hindsight", "unknown").status, 2);
  assert.deepEqual(context.calls(), []);
});

test("a selected missing binary fails check but remains reportable", (t) => {
  const context = fixture(t, { missing: ["jq"] });
  const check = context.run("check", "jq");
  assert.equal(check.status, 1);
  assert.match(check.stderr, /jq\s+JSON inspection/);
  const report = context.run("report", "jq");
  assert.equal(report.status, 0);
  assert.match(report.stdout, /jq\s+JSON inspection/);
  assert.deepEqual(context.calls(), []);
});

test("selected report does not inspect unselected service configuration", (t) => {
  const context = fixture(t);
  assert.equal(context.run("report", "jq").status, 0);
  assert.deepEqual(context.calls(), []);
});

test("missing tmux fails only an explicit tmux readiness check", (t) => {
  const context = fixture(t, { ready: true, missing: ["tmux"] });
  assert.equal(context.run("check").status, 0);
  assert.equal(context.run("check", "tmux").status, 1);
  assert.match(context.run("report", "tmux").stdout, /tmux\s+optional terminal multiplexer/);
});

test("an available tmux satisfies an explicit check without probing Hindsight", (t) => {
  const context = fixture(t);
  assert.equal(context.run("check", "tmux").status, 0);
  assert.deepEqual(context.calls(), []);
});
