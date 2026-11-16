const instructions = "For all authored human prose, including ordinary replies and subagent output, read skill://no-ai-slop when not already in context and apply its silent embedded pass. Preserve facts, caveats/risks, identifiers, code/commands, exact evidence, product terms, required language/format and legal notices; edit user prose only within assigned scope. Use existing context, without extra model calls, detectors/filters, output postprocessing or publishing permission. Explicit standalone edit/detect requests keep the skill's standalone output contract.";

export default function noAiSlop(api) {
  api.on("before_agent_start", (event) => ({
    systemPrompt: [...event.systemPrompt, instructions],
  }));
}
