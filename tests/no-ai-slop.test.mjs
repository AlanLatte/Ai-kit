import assert from "node:assert/strict";
import test from "node:test";
import noAiSlop from "../omp/no-ai-slop.mjs";
import ponytail from "../omp/ponytail.mjs";

test("prose policy survives Ponytail composition and fresh turns in rebound sessions", async () => {
  for (const factories of [[ponytail, noAiSlop], [noAiSlop, ponytail]]) {
    for (const kind of ["main", "sub"]) {
      const handlers = new Map();
      const commands = new Map();
      const api = {
        on(name, handler) {
          const list = handlers.get(name) ?? [];
          list.push(handler);
          handlers.set(name, list);
        },
        registerCommand: (name, command) => commands.set(name, command),
      };
      for (const factory of factories) factory(api);
      const base = Object.freeze([`${kind} policy`, "Exact evidence: command --flag\nerror=17"]);
      for (const prompt of ["Explain the result", "Write the incident update"]) {
        let systemPrompt = base;
        for (const handler of handlers.get("before_agent_start")) {
          const event = Object.freeze({ type: "before_agent_start", reason: "prompt", prompt, systemPrompt });
          const result = await handler(event, { agent: { kind } });
          systemPrompt = result?.systemPrompt ?? systemPrompt;
        }
        assert.deepEqual(systemPrompt.slice(0, base.length), base);
        assert.equal(systemPrompt.length, base.length + 2);
        assert.equal(systemPrompt.filter((part) => part.includes("skill://no-ai-slop")).length, 1);
        assert.equal(systemPrompt.filter((part) => part.includes("skill://ponytail")).length, 1);
      }
    }
  }
});
