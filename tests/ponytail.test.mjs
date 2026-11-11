import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import ponytail from "../omp/ponytail.mjs";
import { resolveSessionMode } from "../vendor/ponytail/pi-extension/index.js";

function session(t, entries = []) {
  const directory = mkdtempSync(join(tmpdir(), "ai-kit-ponytail-"));
  const names = ["XDG_CONFIG_HOME", "PONYTAIL_DEFAULT_MODE", "PONYTAIL_HIDE_STATUS", "PONYTAIL_QUIET_STARTUP"];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  process.env.XDG_CONFIG_HOME = directory;
  delete process.env.PONYTAIL_DEFAULT_MODE;
  process.env.PONYTAIL_HIDE_STATUS = "1";
  process.env.PONYTAIL_QUIET_STARTUP = "1";
  t.after(() => {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
    rmSync(directory, { recursive: true, force: true });
  });
  const handlers = new Map();
  const commands = new Map();
  const api = {
    on: (name, handler) => handlers.set(name, handler),
    registerCommand: (name, command) => commands.set(name, command),
    appendEntry: (customType, data) => entries.push({ type: "custom", customType, data }),
  };
  const context = { sessionManager: { getBranch: () => entries }, ui: { notify: () => {} } };
  return {
    entries,
    async start() {
      ponytail(api);
      await handlers.get("session_start")({}, context);
    },
    command: (args) => commands.get("ponytail").handler(args, context),
    input: (text) => handlers.get("input")({ text, source: "interactive" }),
    async instructions() {
      const event = { systemPrompt: [], systemPromptOptions: { sections: {} } };
      await handlers.get("before_agent_start")(event);
      return event.systemPromptOptions.sections.ponytail;
    },
  };
}

test("off and resumed modes preserve the user's persisted transition", async (t) => {
  const current = session(t);
  await current.start();
  await current.command("off");
  assert.equal(resolveSessionMode(current.entries), "off");
  assert.equal(await current.instructions(), undefined);
  await current.command("lite");
  assert.equal(resolveSessionMode(current.entries), "lite");
  assert.match(await current.instructions(), /Ponytail mode: lite\./);
  await current.start();
  assert.equal(resolveSessionMode(current.entries), "lite");
  assert.match(await current.instructions(), /Ponytail mode: lite\./);
});

test("a saved default applies to a fresh session but does not override an existing session mode", async (t) => {
  const current = session(t);
  await current.start();
  await current.command("default ultra");
  await current.start();
  assert.match(await current.instructions(), /Ponytail mode: ultra\./);
  await current.command("lite");
  await current.start();
  assert.match(await current.instructions(), /Ponytail mode: lite\./);
});

test("ordinary turns carry only a bounded skill reference; standalone deactivation removes it", async (t) => {
  const current = session(t);
  await current.start();
  const instructions = await current.instructions();
  assert.match(instructions, /skill:\/\/ponytail\b/);
  assert.ok(Buffer.byteLength(instructions) <= 512);
  await current.input("add a normal mode toggle");
  assert.match(await current.instructions(), /skill:\/\/ponytail\b/);
  await current.input("normal mode");
  assert.equal(await current.instructions(), undefined);
  assert.equal(resolveSessionMode(current.entries), "off");
});
