import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@oh-my-pi/pi-coding-agent" || specifier === "@oh-my-pi/pi-tui") {
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
        : "export class CustomEditor {}",
    };
  },
});
const { default: inputPanel } = await import("../omp/input-panel.ts");
hooks.deregister();

test("quota hint follows active account, suppresses constrained input and rejects stale account responses", async () => {
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
  inputPanel({ on: (name, handler) => handlers.set(name, handler), registerComposerShape: definition => { style = definition.style; }, logger: { warn() {} } });
  const row = { width: 120, paddingX: 1, isLastRow: true, pad: " ".repeat(110), cursorOverflow: 0, box: { horizontal: "-", bottomRight: "+" }, borderColor: text => text };
  const render = () => style.renderRow(row).pad;
  await handlers.get("turn_end")({}, ctx);
  assert.match(render(), /11% \u00b7 Reset 5d 21h/);
  const day = (new Date().getDay() + 6) % 7;
  assert.ok(render().includes(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((label, index) => index === day ? `<${label}>` : label).join(" ")));
  assert.ok(!render().includes("99%"));
  assert.equal(render().length, row.pad.length);
  const editor = { placeholder: "native hint", getText: () => "", render: () => [] };
  ctx.ui.getEditorComponent = () => () => editor;
  ctx.ui.setEditorComponent = factory => factory();
  ctx.setInterval = () => {};
  handlers.get("session_start")({}, ctx);
  editor.render(120);
  await Promise.resolve();
  assert.equal(editor.placeholder, undefined);
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
