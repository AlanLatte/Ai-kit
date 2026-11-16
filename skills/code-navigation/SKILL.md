---
name: code-navigation
description: Find source entry points, trace symbols or callers, and assess a change's dependent impact.
---
# Code navigation

Work in the exact repository or subsystem root, not its parent workspace. Reuse task-provided paths, source and maps. Read known files directly; a known-path read or typo fix does not require a graph or another search.

When an entry point is unknown, start with a narrow `rg` search in the relevant repository/path. Follow actual identifiers from source or returned evidence, not invented symbol names. Use installed Ripwire when symbol relationships answer the question; this skill does not require a separate global Ripwire skill pack.

| Question | Targeted command |
|---|---|
| Find a known symbol and its context | `ripwire <repo> --for="SymbolName" --token-budget=2500` |
| Find callers | `ripwire <repo> --callers=Symbol` |
| Trace affected dependents | `ripwire <repo> --impact=Symbol` |
| Read a specific body | `ripwire <repo> --expand=path:Symbol --top-k=0` |

Use the actual path/selector returned by source or Ripwire. Reuse a body already returned in full; expand only a missing/cut body needed for this question. Conceptual matches are candidates, not findings.

If confidence is low and candidates do not help, switch to focused source search without ritual retries. Inspect caps, truncation, unresolved links and skipped scope before claiming coverage. Ripwire maps structure, not proof of runtime data flow. Missing Ripwire is an explicit relationship/coverage limit: use direct source and targeted `rg`, not an invented graph or automatic installation.

Consult native `ripwire --help` or operation help only when the needed syntax/semantics are unclear. Do not reload maps merely because a workflow phase changed; use the repository's assigned verification owner and checks, not a new universal gate.

Delegate only substantive independent slices. Supply the concrete cwd, known files/symbols, exact question, collected evidence, scope and verification owner, plus this skill reference or its relevant guidance. Do not assume children inherit startup context. Stop exploration when the requested source relationship is supported; report remaining uncertainty rather than expanding into an unrequested audit.
