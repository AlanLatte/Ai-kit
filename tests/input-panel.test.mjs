import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@oh-my-pi/pi-coding-agent") || specifier === "@oh-my-pi/pi-tui") {
      return { url: `fixture:${specifier}`, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.startsWith("fixture:")) return nextLoad(url, context);
    return {
      format: "module", shortCircuit: true,
      source: url.endsWith("pi-tui")
        ? "export const boxComposerStyle = {renderRow: ctx => ctx}; export const visibleWidth = text => text.length;"
        : url.endsWith("/config/settings")
          ? "export const findScopedSettings = () => globalThis.inputPanelSettings;"
          : url.endsWith("/modes/settings")
            ? "export const cfgComposerShape = {get: settings => settings.shape};"
            : "export class CustomEditor {}",
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
test("quota hint follows active account and selected editor preserves its placeholder outside rendering", async (t) => {
  settings(t);
  const handlers = new Map();
  let style;
  let active = "first";
  let resolveUsage;
  const now = Date.now();
  const weekly = { scope: { windowId: "7d" }, amount: { usedFraction: 0.11 }, window: { resetsAt: now + 5 * 86400000 + 21 * 3600000 } };
  let value = { limits: [weekly, { ...weekly, scope: { windowId: "7d", modelId: "other" }, amount: { usedFraction: 0.99 } }] };
  const ctx = {
    mode: "tui", model: { provider: "openai-codex" },
    ui: { theme: { fg: (_color, text) => text } },
    sessionManager: { getSessionId: () => "test" },
    modelRegistry: { authStorage: {
      oauth: { accounts: () => [{ active: true, credentialId: active }] },
      credentials: { list: () => [{ id: "first", credential: {} }, { id: "second", credential: {} }] },
      usage: { report: async () => value },
    } },
  };
  let editor;
  let factory = () => ({
    placeholder: "native hint",
    getText: () => "",
    render() { return [this.placeholder ?? ""]; },
  });
  ctx.ui.getEditorComponent = () => factory;
  ctx.ui.setEditorComponent = next => { factory = next; editor = next(); };
  ctx.setInterval = () => 1;
  ctx.clearTimer = () => {};
  inputPanel({ on: (name, handler) => handlers.set(name, handler), registerComposerShape: definition => { style = definition.style; }, logger: { warn() {} } });
  handlers.get("session_start")({}, ctx);
  await Promise.resolve();
  const row = { width: 120, paddingX: 1, isLastRow: true, pad: " ".repeat(110), cursorOverflow: 0, box: { horizontal: "-", bottomRight: "+" }, borderColor: text => text };
  const render = () => style.renderRow(row).pad;
  await handlers.get("turn_end")({}, ctx);
  assert.match(render(), /11% \u00b7 Reset 5d 21h/);
  const day = (new Date().getDay() + 6) % 7;
  assert.ok(render().includes(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((label, index) => index === day ? `<${label}>` : label).join(" ")));
  assert.ok(!render().includes("99%"));
  assert.equal(render().length, row.pad.length);
  assert.deepEqual(editor.render(120), [""]);
  assert.equal(editor.placeholder, "native hint");
  editor.getText = () => "long\ninput";
  editor.render(120);
  assert.equal(render(), row.pad);
  editor.getText = () => "";
  editor.render(120);
  handlers.get("agent_start")();
  assert.equal(render(), row.pad);
  handlers.get("agent_end")();
  assert.equal(style.renderRow({ ...row, pad: " " }).pad, " ");
  value = undefined;
  await handlers.get("turn_end")({}, ctx);
  assert.match(render(), /Usage unavailable/);
  ctx.model.provider = "other";
  await handlers.get("turn_end")({}, ctx);
  assert.equal(render(), row.pad);
  ctx.model.provider = "openai-codex";
  ctx.modelRegistry.authStorage.usage.report = () => new Promise(resolve => { resolveUsage = resolve; });
  const pending = handlers.get("turn_end")({}, ctx);
  active = "second";
  resolveUsage({ limits: [weekly] });
  await pending;
  assert.match(render(), /Usage unavailable/);
});

test("an unselected shape leaves other editors untouched and performs no usage or timer I/O", async (t) => {
  const select = settings(t, "another.shape");
  const handlers = new Map();
  let reads = 0;
  let writes = 0;
  let usage = 0;
  let timers = 0;
  let cleared = 0;
  let factory = () => ({ placeholder: "other hint", getText: () => "", render() { return [this.placeholder ?? ""]; } });
  let editor = factory();
  const originalFactory = factory;
  const originalRender = editor.render;
  const ctx = {
    mode: "tui", model: { provider: "openai-codex" }, cwd: "/fixture",
    ui: {
      theme: { fg: (_color, text) => text },
      getEditorComponent: () => { reads++; return factory; },
      setEditorComponent: next => { writes++; factory = next; editor = next(); },
    },
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
  assert.deepEqual([reads, writes, usage, timers], [0, 0, 0, 0]);
  assert.equal(editor.render, originalRender);
  assert.deepEqual(editor.render(120), ["other hint"]);
  select("ai-kit.input-panel");
  await Promise.resolve();
  assert.deepEqual(editor.render(120), [""]);
  assert.equal(editor.placeholder, "other hint");
  assert.deepEqual([writes, usage, timers], [1, 1, 1]);
  select("another.shape");
  assert.equal(factory, originalFactory);
  assert.deepEqual(editor.render(120), ["other hint"]);
  assert.equal(cleared, 1);
  await handlers.get("turn_end")({}, ctx);
  assert.equal(usage, 1);
  select("ai-kit.input-panel");
  await Promise.resolve();
  const replacement = () => ({ placeholder: "replacement" });
  factory = replacement;
  select("another.shape");
  assert.equal(factory, replacement);
  handlers.get("session_shutdown")();
  select("ai-kit.input-panel");
  assert.equal(factory, replacement);
  assert.equal(cleared, 2);
});
