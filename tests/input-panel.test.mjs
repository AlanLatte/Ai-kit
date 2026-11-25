import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@oh-my-pi/pi-")) {
      return { url: `fixture:${specifier}`, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.startsWith("fixture:")) return nextLoad(url, context);
    return {
      format: "module", shortCircuit: true,
      source: ({
        "fixture:@oh-my-pi/pi-tui": "export function signal(value) { const read = () => value; read.set = next => { value = next; }; return read; } export const computed = read => read;",
        "fixture:@oh-my-pi/pi-tui/text/width": "export const visibleWidth = text => text.length; export const truncate = (text, width) => text.slice(0, width);",
        "fixture:@oh-my-pi/pi-coding-agent/config/settings": "export const findScopedSettings = () => globalThis.inputPanelSettings;",
        "fixture:@oh-my-pi/pi-coding-agent/modes/settings": "export const cfgComposerShape = {get: settings => settings.shape};",
      })[url],
    };
  },
});
const { default: inputPanel } = await import("../omp/input-panel.ts");
hooks.deregister();

function settings(t, shape = "ai-kit.input-panel") {
  const listeners = new Set();
  const value = { shape, onLayersChange: listener => { listeners.add(listener); return () => listeners.delete(listener); } };
  globalThis.inputPanelSettings = value;
  t.after(() => { delete globalThis.inputPanelSettings; });
  return next => { value.shape = next; for (const listener of listeners) listener(); };
}
test("quota hint follows the active account and leaves long drafts unobstructed", async (t) => {
  settings(t);
  const handlers = new Map();
  let shape;
  let draft = "";
  let active = "first";
  let resolveUsage;
  const now = Date.now();
  const weekly = { scope: { windowId: "7d" }, amount: { usedFraction: 0.11 }, window: { resetsAt: now + 5 * 86400000 + 21 * 3600000 } };
  let value = { limits: [weekly, { ...weekly, scope: { windowId: "7d", modelId: "other" }, amount: { usedFraction: 0.99 } }] };
  const ctx = {
    mode: "tui", model: { provider: "openai-codex" },
    ui: { getEditorText: () => draft },
    sessionManager: { getSessionId: () => "test" },
    modelRegistry: { authStorage: {
      oauth: { accounts: () => [{ active: true, credentialId: active }] },
      credentials: { list: () => [{ id: "first", credential: {} }, { id: "second", credential: {} }] },
      usage: { report: async () => value },
    } },
  };
  ctx.setInterval = () => 1;
  ctx.clearTimer = () => {};
  inputPanel({ on: (name, handler) => handlers.set(name, handler), registerComposerShape: definition => { shape = definition; }, logger: { warn() {} } });
  handlers.get("session_start")({}, ctx);
  await Promise.resolve();
  const row = {
    width: 120, paddingX: 1, first: true, last: true, text: "draft",
    pad: " ".repeat(111), overflow: 0, box: { horizontal: "-", bottomLeft: "+", bottomRight: "+", vertical: "|" },
    border: text => text, accent: text => text, theme: { fg: (_color, text) => text },
  };
  const render = () => shape.bottom(row);
  const native = `+-${row.text}${row.pad}-+`;
  await handlers.get("turn_end")({}, ctx);
  assert.match(render(), /11% \u00b7 Reset 5d 21h/);
  const day = (new Date().getDay() + 6) % 7;
  assert.ok(render().includes(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((label, index) => index === day ? `<${label}>` : label).join(" ")));
  assert.ok(!render().includes("99%"));
  assert.equal(render().length, row.width);
  assert.equal(shape.row({ ...row, paddingX: 0, pad: " ".repeat(113) })[0].length, row.width);
  draft = "long\ninput";
  assert.equal(render(), undefined);
  assert.equal(shape.row(row)[0], native);
  draft = "";
  handlers.get("agent_start")();
  assert.equal(render(), undefined);
  handlers.get("agent_end")();
  assert.equal(shape.bottom({ ...row, width: 15 }), undefined);
  value = undefined;
  await handlers.get("turn_end")({}, ctx);
  assert.match(render(), /Usage unavailable/);
  ctx.model.provider = "other";
  await handlers.get("turn_end")({}, ctx);
  assert.equal(render(), undefined);
  ctx.model.provider = "openai-codex";
  ctx.modelRegistry.authStorage.usage.report = () => new Promise(resolve => { resolveUsage = resolve; });
  const pending = handlers.get("turn_end")({}, ctx);
  active = "second";
  resolveUsage({ limits: [weekly] });
  await pending;
  assert.match(render(), /Usage unavailable/);
});

test("only the selected shape polls quota and teardown prevents further polling", async (t) => {
  const select = settings(t, "another.shape");
  const handlers = new Map();
  let usage = 0;
  let timers = 0;
  let cleared = 0;
  const ctx = {
    mode: "tui", model: { provider: "openai-codex" }, cwd: "/fixture",
    ui: { getEditorText: () => "" },
    sessionManager: { getSessionId: () => "fixture" },
    modelRegistry: { authStorage: {
      oauth: { accounts: () => [{ active: true, credentialId: "fixture" }] },
      credentials: { list: () => [{ id: "fixture", credential: {} }] },
      usage: { report: async () => { usage++; return undefined; } },
    } },
    setInterval: () => { timers++; return timers; },
    clearTimer: () => { cleared++; },
  };
  inputPanel({ on: (name, handler) => handlers.set(name, handler), registerComposerShape() {}, logger: { warn() {} } });
  handlers.get("session_start")({}, ctx);
  await handlers.get("turn_end")({}, ctx);
  await handlers.get("session_switch")({}, ctx);
  assert.deepEqual([usage, timers], [0, 0]);
  select("ai-kit.input-panel");
  await Promise.resolve();
  assert.deepEqual([usage, timers], [1, 1]);
  select("another.shape");
  assert.equal(cleared, 1);
  await handlers.get("turn_end")({}, ctx);
  assert.equal(usage, 1);
  select("ai-kit.input-panel");
  await Promise.resolve();
  handlers.get("session_shutdown")();
  select("another.shape");
  select("ai-kit.input-panel");
  assert.deepEqual([usage, timers, cleared], [2, 2, 2]);
});
