import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

test("workspace memory owns only its routing overrides across settings, directory and worktree transitions", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ai-kit memory "));
  const originalConfigHome = process.env.XDG_CONFIG_HOME;
  const originalSettings = globalThis.aiKitMemoryTestSettings;
  t.after(() => {
    if (originalConfigHome === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = originalConfigHome;
    if (originalSettings === undefined) delete globalThis.aiKitMemoryTestSettings;
    else globalThis.aiKitMemoryTestSettings = originalSettings;
    rmSync(root, { recursive: true, force: true });
  });
  process.env.XDG_CONFIG_HOME = join(root, "config");
  const workspace = join(root, "workspace");
  const nested = join(workspace, "nested");
  const sibling = join(root, "workspace-other");
  const outside = join(root, "outside");
  const primary = join(workspace, "primary");
  const worktree = join(root, "external-worktree");
  const alias = join(root, "alias");
  const escape = join(workspace, "escape");
  const configDir = join(process.env.XDG_CONFIG_HOME, "ai-kit");
  const sdk = join(root, "node_modules", "@oh-my-pi", "pi-coding-agent");
  for (const path of [nested, sibling, outside, primary, configDir, sdk]) mkdirSync(path, { recursive: true });
  symlinkSync(nested, alias, "dir");
  symlinkSync(outside, escape, "dir");
  writeFileSync(join(sdk, "package.json"), JSON.stringify({
    type: "module",
    exports: { "./config/settings": "./settings.mjs", "./hindsight/settings": "./hindsight.mjs" },
  }));
  writeFileSync(join(sdk, "settings.mjs"), "export const findScopedSettings = () => globalThis.aiKitMemoryTestSettings;\n");
  writeFileSync(join(sdk, "hindsight.mjs"), `const handle = key => ({
  id: "hindsight." + key,
  override: (settings, value) => settings.write(key, value),
  clearOverride: settings => settings.write(key, undefined),
});
export const cfgHindsightBankId = handle("bankId");
export const cfgHindsightBankIdPrefix = handle("bankIdPrefix");
export const cfgHindsightScoping = handle("scoping");
`);
  const extensionPath = join(root, "memory.mjs");
  copyFileSync(new URL("../omp/memory.mjs", import.meta.url), extensionPath);
  const { default: register } = await import(pathToFileURL(extensionPath));
  const handlers = new Map();
  register({ on: (event, handler) => handlers.set(event, handler) });
  const listeners = new Set();
  let depth = 0;
  let writes = 0;
  const settings = {
    cwd: nested,
    overrides: { hindsight: { bankIdPrefix: "personal-prefix" }, unrelated: { enabled: true } },
    project: { bankId: "initial-default", scoping: "per-project-tagged" },
    getCwd() { return this.cwd; },
    mirrorState() { return { overrides: structuredClone(this.overrides) }; },
    onLayersChange(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    emit() {
      assert.ok(++depth < 3, "runtime writes must not recursively reapply routing");
      try { for (const listener of listeners) listener(); } finally { depth--; }
    },
    write(key, value) {
      assert.ok(++writes < 100, "routing must converge without notification loops");
      if (value === undefined) delete this.overrides.hindsight[key];
      else this.overrides.hindsight[key] = value;
      this.emit();
    },
    effective(key) { return this.overrides.hindsight[key] ?? this.project[key]; },
    move(cwd, project = { bankId: "destination-default", scoping: "per-project" }) {
      this.cwd = cwd;
      this.project = project;
      this.emit();
    },
  };
  globalThis.aiKitMemoryTestSettings = settings;
  const notices = [];
  const main = { agent: { kind: "main" }, cwd: nested, ui: { notify: (...args) => notices.push(args) } };
  const start = () => handlers.get("session_start")({}, main);
  const shutdown = () => handlers.get("session_shutdown")({}, main);
  t.after(shutdown);
  const config = join(configDir, "workspaces.json");
  const saveRoutes = (workspaces) => writeFileSync(config, JSON.stringify({ workspaces }));

  start();
  assert.equal(writes, 0, "missing configuration must not touch native settings");
  assert.equal(listeners.size, 0);
  saveRoutes([
    { path: workspace, bankId: "workspace-bank" },
    { path: nested, bankId: "nested-bank" },
  ]);
  handlers.get("session_start")({}, { ...main, agent: { kind: "subagent" } });
  assert.equal(writes, 0);
  start();
  assert.equal(settings.effective("bankId"), "nested-bank");
  assert.equal(settings.effective("bankIdPrefix"), "");
  assert.equal(settings.effective("scoping"), "global");
  const settled = writes;
  settings.project = { bankId: "updated-default", scoping: "per-project" };
  settings.emit();
  assert.equal(writes, settled, "unrelated layer changes must not rewrite routing");
  settings.write("bankIdPrefix", "new-user-prefix");
  assert.equal(settings.effective("bankIdPrefix"), "");
  settings.move(workspace);
  assert.equal(settings.effective("bankId"), "workspace-bank");
  settings.move(sibling);
  assert.equal(settings.effective("bankId"), "destination-default");
  assert.equal(settings.effective("scoping"), "per-project");
  assert.equal(settings.effective("bankIdPrefix"), "new-user-prefix");
  assert.equal(Object.hasOwn(settings.overrides.hindsight, "bankId"), false);
  assert.equal(Object.hasOwn(settings.overrides.hindsight, "scoping"), false);
  settings.move(alias);
  assert.equal(settings.effective("bankId"), "nested-bank");
  settings.move(escape);
  assert.equal(settings.effective("bankId"), "destination-default", "symlink escapes must not inherit a workspace bank");

  const git = (cwd, args, input) => execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8", input, stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(root, "no-gitconfig"), GIT_DIR: undefined, GIT_WORK_TREE: undefined, GIT_COMMON_DIR: undefined },
  }).trim();
  git(primary, ["init", "--object-format=sha1"]);
  const tree = git(primary, ["hash-object", "-t", "tree", "-w", "--stdin"], "");
  const commit = git(primary, ["hash-object", "-t", "commit", "-w", "--stdin"],
    `tree ${tree}\nauthor Fixture <fixture@example.invalid> 1700000000 +0000\ncommitter Fixture <fixture@example.invalid> 1700000000 +0000\n\nfixture\n`);
  git(primary, ["update-ref", "HEAD", commit]);
  git(primary, ["worktree", "add", "--detach", worktree]);
  const worktreeChild = join(worktree, "child");
  mkdirSync(worktreeChild);
  settings.move(worktreeChild);
  assert.equal(settings.effective("bankId"), "workspace-bank", "external worktrees route through the actual primary checkout");
  settings.move(outside);
  assert.equal(settings.effective("bankId"), "destination-default");
  saveRoutes([{ path: workspace, bankId: "workspace-bank" }, { path: worktree, bankId: "explicit-worktree" }]);
  start();
  settings.move(worktreeChild);
  assert.equal(settings.effective("bankId"), "explicit-worktree", "an explicit directory route takes precedence over the primary checkout");
  handlers.get("session_shutdown")({}, { ...main, agent: { kind: "subagent" } });
  assert.equal(settings.effective("bankId"), "explicit-worktree");
  shutdown();
  assert.equal(listeners.size, 0);
  assert.deepEqual(settings.overrides, { hindsight: { bankIdPrefix: "new-user-prefix" }, unrelated: { enabled: true } });

  settings.write("bankId", "user-session-bank");
  start();
  assert.equal(settings.effective("bankId"), "explicit-worktree");
  settings.move(outside);
  assert.equal(settings.effective("bankId"), "user-session-bank", "preexisting user runtime overrides must be restored");
  settings.move(worktreeChild);
  settings.overrides.hindsight.bankId = "latest-user-bank";
  shutdown();
  assert.equal(settings.effective("bankId"), "latest-user-bank", "shutdown must not remove another writer's override");
  assert.equal(notices.length, 0);

  for (const invalid of [
    "not JSON secret-token",
    JSON.stringify({ workspaces: [{ path: workspace, bankId: "secret/token" }] }),
    JSON.stringify({ workspaces: [{ path: "relative", bankId: "bank" }] }),
    JSON.stringify({ workspaces: [{ path: join(root, "missing"), bankId: "bank" }] }),
    JSON.stringify({ workspaces: [{ path: nested, bankId: "one" }, { path: alias, bankId: "two" }] }),
  ]) {
    writeFileSync(config, invalid);
    assert.throws(start, (error) => /invalid workspace routing configuration/.test(error.message) && !/secret|token/.test(error.message));
    assert.equal(settings.effective("bankId"), "latest-user-bank");
    assert.equal(listeners.size, 0);
  }
});
