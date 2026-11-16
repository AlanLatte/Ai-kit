import ponytailExtension from "../vendor/ponytail/pi-extension/index.js";

export default function ponytail(api) {
  ponytailExtension(api, (mode) => {
    const skill = mode === "review" ? "ponytail-review" : "ponytail";
    return `Ponytail mode: ${mode}. For coding/refactoring/review read skill://${skill}. Assignment verification ownership, existing test frameworks, and global/project comment rules override upstream examples: add warranted regressions, run checks only as assigned. Complete the full requested scope; preserve correctness, security and accessibility. No shortcut comments or standalone self-check scaffolds against policy. Non-coding work does not load the full skill.`;
  });
}
