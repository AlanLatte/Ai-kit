---
name: toolchain
description: Set up or inspect workspace tools, OMP, model roles, memory and local/remote bridges.
---
# Toolchain

Choose only the requested operation; loading this skill authorizes no mutation. Keep actual roots, inventories, credentials and local settings outside Ai-Kit. Use `skill://no-ai-slop` only for drafting or substantially revising substantive documentation/reports, not routine questions or readiness statuses; reuse it once loaded and preserve commands, evidence and required format.

| Request | Read and execute |
|---|---|
| Workspace setup, pins or activation changes | [Workspace setup](references/workspace.md), with the caller's existing canonical root and ENTIRE owning-kit inventory; no machine questionnaire, Git/auth/service setup or startup installation |
| Task-specific tool check or workspace inventory report | [Read-only readiness](references/readiness.md); no setup procedure, installation, downloads, authorization or service startup |
| Machine setup or diagnostics | [Machine selector and full procedure](references/machine-setup.md); report/check stays read-only, cancellation means no mutation |
| OMP UI, installation or MCP | [Native OMP/MCP](references/omp-mcp.md) |
| Model discovery, roles or planner/executor/reviewer setup | [Native model setup and handoff](references/models.md), also required for approved OMP setup |
| Browser/callback, SSH-agent or clipboard bridge | [Native bridges](references/bridges.md); discover direction and trust before approval |
| Hindsight or bank routing | Machine procedure section 4 and [memory charter](../../docs/memory.md); preserve banks/auth/backend, no migration |
| One integration | Read only its reference: [Backlog](references/backlog.md), [Whiteboard](references/whiteboard.md), [direnv](references/direnv.md), [LSP](references/lsp.md) |

For workspace requests Ai-Kit owns shared mise/bootstrap and direnv activation, the project kit owns inventory/compatibility, and the workspace owns native pins/locks/`.envrc`; repositories retain their runners and environments. Reuse the [existing workspace layout](../project-setup/references/workspace-layout.md), not another directory layer. Preserve unselected tools, identities, profiles, services and settings. Private auth, conflicting configuration and OS permissions require the owner; continue independent approved components. A binary or handshake alone is not readiness.
