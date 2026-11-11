---
name: toolchain
description: Select, install and configure OMP, Hindsight, Backlog.md, Whiteboard, MCP servers and common local tools; preserve existing profiles, data and credentials.
---
# Environment setup selector

This is an agent-run setup flow, not an instruction sheet for the user to install everything. Start with discovery, present a native multi-select form, then execute the selected installation and configuration steps yourself. Do not mutate the machine before selection. Reading this skill or a startup diagnostic is not installation approval.

For an explicit check/report-only request, stop after read-only inventory and findings. Do not turn diagnostics into an installation prompt or any mutation.

## 1. Read-only inventory

Resolve this skill's real directory; helper paths below are relative to it, not the target repository. Detect the OS, shell, package manager, current OMP profile/environment overrides and requested workspace. Inspect only relevant local settings and executable versions. If present, read private `${XDG_CONFIG_HOME:-$HOME/.config}/ai-kit/tools.json` for managed invocations outside PATH; validate the referenced files/version, do not execute arbitrary stored shell strings. Never publish local inventory, user paths, accounts, auth data or project descriptions in Ai-Kit.

```sh
AI_KIT_CLIENT=omp bash ../../scripts/toolchain.sh report
```

Also inspect `omp --version`, `backlog --version` and Whiteboard through its discovered CLI or Desktop bundled runtime. No external Bun is required by compiled OMP. Distinguish executable installed, configuration present, backend running and operational readiness. Inspect MCP names/scopes/transports without printing auth/header/env values. Do not start Docker, Whiteboard, a server, an installer or an auth flow during discovery.

## 2. Present an actual selector

Use the client's native interactive multi-select/form, with no boxes selected by default. Show each component's detected state and proposed action: install if absent, configure the selected target, reuse if ready. An explicitly requested component can be preselected, but unrelated components never are. Empty selection or cancellation means no installation, services, config writes or tracker initialization. If the client has no interactive selection capability, stop before mutation rather than simulating consent.

Offer these separate choices; do not reduce the selector to the components already missing:

| ID | Component | Execution after selection |
|---|---|---|
| omp | OMP CLI and chosen profile | [OMP/MCP setup](references/omp-mcp.md) |
| hindsight | Native Hindsight memory | Existing helper and section4 below |
| backlog | Backlog.md CLI and optional tracker setup | [Backlog setup](references/backlog.md) |
| whiteboard | Whiteboard Desktop or headless | [Whiteboard setup](references/whiteboard.md) |
| mcp | Selected MCP connectors | Second multi-select: Backlog, Whiteboard, custom; [OMP/MCP setup](references/omp-mcp.md) |
| git-workspace | Workspace Git/ghq/GCM/signing | Existing `project-setup` skill; no profile/key changes just from selecting Git binary |
| git, python3, uv, docker, pre-commit, node, ripwire, jq, shellcheck, tre | Individual common tools | Explicit helper IDs, or supported native OS installer |

After selection, ask only materially missing decisions for chosen components: profile/scope, existing versus local/remote service, Whiteboard mode, tracker/client root, custom MCP definition, or a conflict with existing configuration. Use another native form when needed, never request credentials in chat.

Before installing, show the exact selected set, necessary dependencies and intended config/service changes. Missing Homebrew or another package manager is an additional dependency requiring approval, not permission to bootstrap it silently. Examples: local Hindsight needs Node, OMP for native integration and running Docker/Compose; a healthy remote needs no Docker; standalone Whiteboard needs its supported Node24 runtime, whereas Desktop uses its bundled runtime; Backlog MCP needs Backlog and an OMP target. Display dependencies not initially selected and obtain consent before adding them. Do not install an optional integration merely because a binary is selected.

Selection authorizes the disclosed actions; do not ask again for every ordinary command. Ask separately only for new dependency/scope changes, destructive conflicts, credentials or OS permissions. Installing a tool is not permission to delete its data, replace another backend, log in as another account or enable transcript uploads.

## 3. Execute only the approved plan

Use the package manager and OS supported by the chosen component's official installer. Reuse working installations; do not upgrade everything or replace a different active runtime. The helper's installation recipes are macOS recipes; on other OSes use the selected tool's official native installer, not macOS commands.

For common tools, pass every approved ID explicitly. The helper rejects empty and unknown selections before acting:

```sh
bash ../../scripts/toolchain.sh install jq shellcheck
bash ../../scripts/toolchain.sh report jq shellcheck
```

Do not pass advanced IDs such as `omp`, `whiteboard` or `mcp` to this helper; execute their linked native procedures. Deduplicate dependencies and order them before consumers. For local Hindsight, install approved missing binaries first, start Docker only if its startup was disclosed and approved, then run the Hindsight helper. Never use bare `install`, add unrelated tools to fix an exit status, run `eval` on user-supplied commands, or turn an absent app into a global failure for unselected components.

Do the configuration as well as binary installation: resolve the selected profile, preserve unrelated settings, write or merge only approved fields and verify effective values. Back up affected existing files privately. An existing server with a matching name is not permission to replace its complete definition or auth. Use argument arrays for custom executable/args and keep secrets in native credential storage or local environment references, never arguments or public files.

## 4. Hindsight: reuse the existing implementation

Choose the OMP profile first, verify its effective `config path`, and use that same child environment for every check/install. `OMP_PROFILE` selects a named profile; existing `PI_CONFIG_DIR`/`PI_CODING_AGENT_DIR` overrides must be understood, not silently removed. Resolve conflicts before changing the wrong target.

```sh
AI_KIT_CLIENT=omp OMP_PROFILE=selected-profile node ../../scripts/hindsight.mjs report
AI_KIT_CLIENT=omp OMP_PROFILE=selected-profile node ../../scripts/hindsight.mjs install
```

Omit `OMP_PROFILE` only for the intentionally selected default/current profile. Inspect the current endpoint/backend before execution. A working remote remains remote; a broken configured remote is repaired with the owner, never replaced by local Docker. Another memory backend is preserved unless the owner explicitly approves switching that target. Do not add a Hindsight MCP server: OMP has a native backend.

For project-only Hindsight, do not let an install with effective backend `off` enable the whole user profile: `omp config set` writes that profile globally. Privately back up the target project YAML, set only its approved memory/endpoint fields, then run the helper from that project's cwd with the effective backend already `hindsight`. Roll back those project fields if setup fails. A pinned project override must not cause repeated writes to the global profile.

For a new local service, use the pinned Compose helper and private `${XDG_CONFIG_HOME:-$HOME/.config}/hindsight` directory. LLM credentials come from the user's private `llm.env` or explicitly supplied environment, never copied from another client's provider auth. Preserve existing Compose/env, containers, volumes and bank data. Do not recreate an existing runtime, lower recall limits or export memory contents.

After service health, configure only the approved native endpoint/backend and any chosen workspace bank bindings; see [workspace memory routing](../../docs/memory.md). Do not invent bank names or give every project another project's bank. The existing helper validates API health, connected database and bank API access, enables memory only from off, preserves another backend and fails explicitly on configuration overrides.

## 5. Verify and finish

Verify each selected component and its configuration with the linked native readiness checks. A successful installer, existing executable or MCP handshake alone is not readiness. Repeat read-only setup for the chosen target to establish idempotency; do not reinstall a healthy service to test it. Never run an LLM request, retention operation or project write as a generic health check.

Report installed/configured/reused/failed/waiting-for-private-input separately. Name actual scope, checks and remaining user/OS action without secrets. Partial failure is not a green setup: continue independent selected components, but do not operate consumers whose prerequisite failed. Preserve unselected tools and settings. Restart affected OMP sessions after plugin/MCP/profile changes; keep old runtime paths intact for still-open sessions. Do not clean caches or remove old data as an installation side effect.
