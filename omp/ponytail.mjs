import ponytailExtension from "../vendor/ponytail/pi-extension/index.js";

export default function ponytail(api) {
  ponytailExtension(api, (mode) => {
    const skill = mode === "review" ? "ponytail-review" : "ponytail";
    return `Ponytail mode: ${mode}. For coding, refactoring or code review, read skill://${skill} and apply this mode. Project comment and test policies take precedence; never reduce requested scope, correctness, security or accessibility. Non-coding requests do not load the full skill.`;
  });
}
