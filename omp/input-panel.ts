import type { ComposerChromeContext, ComposerRowContext, ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";
import { findScopedSettings } from "@oh-my-pi/pi-coding-agent/config/settings";
import { cfgComposerShape } from "@oh-my-pi/pi-coding-agent/modes/settings";
import type { UsageReport } from "@oh-my-pi/pi-ai";
import { computed, signal } from "@oh-my-pi/pi-tui";
import { truncate, visibleWidth } from "@oh-my-pi/pi-tui/text/width";

function timeLeft(milliseconds: number): string {
  const minutes = Math.max(0, Math.ceil(milliseconds / 60_000));
  const hours = Math.floor(minutes / 60);
  return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${minutes % 60}m`;
}

function frameRow(cx: ComposerRowContext, last: boolean): string[] {
  const { box, paddingX, overflow } = cx;
  const left = last
    ? `${box.bottomLeft}${paddingX ? box.horizontal + " ".repeat(paddingX - 1) : ""}`
    : `${box.vertical}${" ".repeat(paddingX)}`;
  const gap = Math.max(0, paddingX - overflow);
  const edge = last
    ? `${gap ? `${" ".repeat(gap - 1)}${box.horizontal}` : ""}${box.bottomRight}`
    : `${" ".repeat(gap)}${box.vertical}`;
  return [cx.border(left) + cx.text + cx.pad + cx.border(edge)];
}

export default function inputPanel(pi: ExtensionAPI) {
  const report = signal<UsageReport | undefined>(undefined);
  const enabled = signal(false);
  const working = signal(false);
  let busy = false;
  let context: ExtensionContext | undefined;
  let selected = false;
  let generation = 0;
  let release: (() => void) | undefined;

  const quota = computed(() => {
    const now = Date.now();
    const windows = report()?.limits.filter(limit =>
      limit.scope.windowId && !limit.scope.tier && !limit.scope.modelId
      && typeof limit.amount.usedFraction === "number" && Number.isFinite(limit.amount.usedFraction)) ?? [];
    const labels = windows.map(window => {
      const percent = Math.round(Math.min(1, Math.max(0, window.amount.usedFraction!)) * 100);
      const reset = window.window?.resetsAt;
      return `${windows.length > 1 ? `${window.scope.windowId} ` : ""}${percent}%`
        + (typeof reset === "number" && Number.isFinite(reset) ? ` \u00b7 Reset ${timeLeft(reset - now)}` : "");
    });
    if (windows.some(window => window.scope.windowId === "7d" && Number.isFinite(window.window?.resetsAt))) {
      const day = (new Date(now).getDay() + 6) % 7;
      labels.push(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
        .map((label, index) => index === day ? `<${label}>` : label).join(" "));
    }
    const label = ` ${labels.length ? labels.join(" \u00b7 ") : "Usage unavailable"} `;
    const fraction = windows.reduce((highest, window) => Math.max(highest, window.amount.usedFraction!), 0);
    return { label, width: visibleWidth(label), fraction: Math.min(1, fraction) };
  });

  const showFooter = (cx: ComposerChromeContext) => {
    if (!enabled() || working()) return false;
    const text = context?.ui.getEditorText() ?? "";
    const contentWidth = cx.width - 2 * (cx.paddingX + 1);
    return !text.includes("\n") && visibleWidth(text) < contentWidth / 2 && cx.width >= quota().width + 6;
  };

  pi.registerComposerShape({
    id: "ai-kit.input-panel",
    label: "Ai-Kit quota input",
    description: "Framed composer with active Codex account quota and reset calendar",
    statusAttachment: "top-border",
    sideBorders: true,
    paddingX: 2,
    sideWidth: padding => padding + 1,
    top(cx) {
      const { box, width, status } = cx;
      const fill = Math.max(0, width - 2);
      const content = status ? truncate(status.content, Math.max(0, fill - 1)) : "";
      return cx.border(box.topLeft) + content
        + cx.border(box.horizontal.repeat(Math.max(0, fill - visibleWidth(content))) + box.topRight);
    },
    row(cx) {
      return frameRow(cx, cx.last && !showFooter(cx));
    },
    bottom(cx) {
      if (!showFooter(cx)) return;
      const { label, width, fraction } = quota();
      const available = cx.width - width - 2;
      const meter = Math.min(7, available);
      const used = Math.round(meter * fraction);
      const rule = (length: number) => cx.box.horizontal.repeat(length);
      return cx.border(cx.box.bottomLeft + rule(available - meter)) + cx.theme.fg("muted", label)
        + cx.accent(rule(used)) + cx.border(rule(meter - used) + cx.box.bottomRight);
    },
  });

  async function refresh(ctx: ExtensionContext) {
    if (!selected || busy || ctx.mode !== "tui") return;
    const model = ctx.model;
    enabled.set(model?.provider === "openai-codex");
    report.set(undefined);
    if (model?.provider !== "openai-codex") return;
    const auth = ctx.modelRegistry.authStorage;
    const sessionId = ctx.sessionManager.getSessionId();
    const accounts = auth.oauth.accounts(model.provider, sessionId);
    const account = accounts.find(item => item.active) ?? (accounts.length === 1 ? accounts[0] : undefined);
    const row = auth.credentials.list(model.provider).find(item => item.id === account?.credentialId);
    if (!row) return;
    busy = true;
    const requestGeneration = generation;
    try {
      const value = await auth.usage.report(model.provider, row.credential, { baseUrl: model.baseUrl, timeoutMs: 2000 });
      const current = auth.oauth.accounts(model.provider, sessionId);
      const active = current.find(item => item.active) ?? (current.length === 1 ? current[0] : undefined);
      if (selected && generation === requestGeneration && ctx.sessionManager.getSessionId() === sessionId
        && ctx.model?.provider === model.provider && active?.credentialId === row.id) report.set(value ?? undefined);
    } catch (error) {
      pi.logger.warn("Input quota unavailable", { error: String(error) });
    } finally {
      busy = false;
    }
  }

  const bindSettings = (_event: unknown, ctx: ExtensionContext) => {
    release?.();
    release = undefined;
    if (ctx.mode !== "tui") return;
    context = ctx;
    const settings = findScopedSettings(ctx.cwd);
    if (!settings) throw new Error("Ai-Kit input panel: session settings unavailable.");
    let stopPolling: (() => void) | undefined;
    const sync = () => {
      const next = cfgComposerShape.get(settings) === "ai-kit.input-panel";
      if (next === selected) return;
      selected = next;
      generation++;
      report.set(undefined);
      enabled.set(false);
      stopPolling?.();
      stopPolling = undefined;
      if (!selected) return;
      void refresh(ctx);
      const timer = ctx.setInterval(() => refresh(ctx), 60_000);
      stopPolling = () => ctx.clearTimer(timer);
    };
    const unsubscribe = settings.onLayersChange(sync);
    release = () => {
      unsubscribe();
      selected = false;
      generation++;
      enabled.set(false);
      report.set(undefined);
      context = undefined;
      stopPolling?.();
    };
    sync();
  };
  pi.on("session_start", bindSettings);
  pi.on("session_switch", bindSettings);
  pi.on("session_shutdown", () => {
    release?.();
    release = undefined;
  });
  pi.on("agent_start", () => { working.set(true); });
  pi.on("agent_end", () => { working.set(false); });
  pi.on("turn_end", (_event, ctx) => refresh(ctx));
}
