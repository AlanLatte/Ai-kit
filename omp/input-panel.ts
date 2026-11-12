import { CustomEditor, type ExtensionAPI, type ExtensionContext } from "@oh-my-pi/pi-coding-agent";
import type { UsageReport } from "@oh-my-pi/pi-ai";
import { boxComposerStyle, visibleWidth } from "@oh-my-pi/pi-tui";

function timeLeft(milliseconds: number): string {
  const minutes = Math.max(0, Math.ceil(milliseconds / 60_000));
  const hours = Math.floor(minutes / 60);
  return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${minutes % 60}m`;
}

export default function inputPanel(pi: ExtensionAPI) {
  let theme: ExtensionContext["ui"]["theme"] | undefined;
  let report: UsageReport | undefined;
  let enabled = false;
  let busy = false;
  let working = false;
  let inputWidth = 0;

  pi.registerComposerShape({
    label: "Ai-Kit quota input",
    description: "Framed composer with active Codex account quota and reset calendar",
    style: {
      ...boxComposerStyle,
      id: "ai-kit.input-panel",
      filledSurface: false,
      renderRow(ctx) {
        const contentWidth = ctx.width - 2 * (ctx.paddingX + 1);
        if (!ctx.isLastRow || ctx.imeSafeCursorTail || !enabled || !theme || working || inputWidth >= contentWidth / 2) {
          return boxComposerStyle.renderRow(ctx);
        }
        const now = Date.now();
        const quotas = report?.limits.filter(limit =>
          limit.scope.windowId && !limit.scope.tier && !limit.scope.modelId
          && typeof limit.amount.usedFraction === "number" && Number.isFinite(limit.amount.usedFraction)) ?? [];
        const labels = quotas.map(quota => {
          const percent = Math.round(Math.min(1, Math.max(0, quota.amount.usedFraction!)) * 100);
          const reset = quota.window?.resetsAt;
          return `${quotas.length > 1 ? `${quota.scope.windowId} ` : ""}${percent}%`
            + (typeof reset === "number" && Number.isFinite(reset) ? ` \u00b7 Reset ${timeLeft(reset - now)}` : "");
        });
        if (quotas.some(quota => quota.scope.windowId === "7d" && Number.isFinite(quota.window?.resetsAt))) {
          const day = (new Date(now).getDay() + 6) % 7;
          labels.push(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
            .map((label, index) => index === day ? `<${label}>` : label).join(" "));
        }
        const hint = theme.fg("muted", ` ${labels.length ? labels.join(" \u00b7 ") : "Usage unavailable"} `);
        const available = visibleWidth(ctx.pad) - visibleWidth(hint);
        if (available < 4) return boxComposerStyle.renderRow(ctx);
        const meterWidth = Math.min(7, available);
        const tailWidth = Math.max(1, ctx.paddingX + 1 - ctx.cursorOverflow);
        const fraction = quotas.reduce((highest, quota) => Math.max(highest, quota.amount.usedFraction!), 0);
        const used = Math.round((meterWidth + tailWidth) * Math.min(1, fraction));
        const paint = (text: string, offset: number) => {
          const filled = Math.min(text.length, Math.max(0, used - offset));
          return theme!.fg("accent", text.slice(0, filled)) + theme!.fg("border", text.slice(filled));
        };
        return boxComposerStyle.renderRow({
          ...ctx,
          pad: " ".repeat(available - meterWidth) + hint + paint(ctx.box.horizontal.repeat(meterWidth), 0),
          borderColor: text => text.endsWith(ctx.box.bottomRight)
            ? paint(text.replaceAll(" ", ctx.box.horizontal), meterWidth) : ctx.borderColor(text),
        });
      },
    },
  });

  async function refresh(ctx: ExtensionContext) {
    if (busy || ctx.mode !== "tui") return;
    theme = ctx.ui.theme;
    enabled = ctx.model?.provider === "openai-codex";
    report = undefined;
    if (!enabled) return;
    const model = ctx.model!;
    const auth = ctx.modelRegistry.authStorage;
    const sessionId = ctx.sessionManager.getSessionId();
    const accounts = auth.oauth.accounts(model.provider, sessionId);
    const account = accounts.find(item => item.active) ?? (accounts.length === 1 ? accounts[0] : undefined);
    const row = auth.credentials.list(model.provider).find(item => item.id === account?.credentialId);
    if (!row) return;
    busy = true;
    try {
      const value = await auth.usage.report(model.provider, row.credential, { baseUrl: model.baseUrl, timeoutMs: 2000 });
      const current = auth.oauth.accounts(model.provider, sessionId);
      const active = current.find(item => item.active) ?? (current.length === 1 ? current[0] : undefined);
      if (ctx.model?.provider === model.provider && active?.credentialId === row.id) report = value ?? undefined;
    } catch (error) {
      pi.logger.warn("Input quota unavailable", { error: String(error) });
    } finally {
      busy = false;
    }
  }

  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== "tui") return;
    const previous = ctx.ui.getEditorComponent();
    ctx.ui.setEditorComponent((tui, palette, keybindings) => {
      const editor = previous?.(tui, palette, keybindings) ?? new CustomEditor(tui, palette, keybindings);
      const render = editor.render.bind(editor);
      editor.render = width => {
        editor.placeholder = undefined;
        const text = editor.getText();
        inputWidth = text.includes("\n") ? Infinity : visibleWidth(text);
        return render(width);
      };
      return editor;
    });
    void refresh(ctx);
    ctx.setInterval(() => refresh(ctx), 60_000);
  });
  pi.on("agent_start", () => { working = true; });
  pi.on("agent_end", () => { working = false; });
  pi.on("turn_end", (_event, ctx) => refresh(ctx));
  pi.on("session_switch", (_event, ctx) => refresh(ctx));
}
