# Machine environment setup

Ai-Kit is a user-scoped package of shared tools and environment procedures.
Workspace roots and tool inventories are supplied by the caller.

## Select the requested scope first

For an explicit workspace setup, including a project-kit delegation with a canonical root and inventory, follow [workspace setup](workspace.md) and prepare the ENTIRE caller-declared inventory. For a workspace report or task-specific tool check, use [read-only readiness](readiness.md) instead. Both bypass the machine-wide questionnaire and installer below; neither authorizes authentication, key/credential changes or services. Startup and report remain read-only. Keep project inventories in their owning plugins.

A workspace is the existing root of related repositories, shared tracker and
client/environment settings. Ai-Kit's [local `.config` layout](../../project-setup/references/workspace-layout.md)
defines scoped commands, payloads, Git profile and unit templates, without
redirecting global configuration, credentials or native root files.
Reuse the supplied root; do not create another directory layer, Git repository
or profile. Ai-Kit owns the shared external mise setup and direnv activation;
the owning project kit supplies the complete inventory and constraints. The
workspace owns its `mise.toml`, lock and `.envrc`; repositories retain native
locks/runners and may refine versions. A user-local cache does not imply global
tool selection. Do not remove an existing mise-dependent `.envrc` because other
dependency managers happen to be present.

Do not infer machine-wide approval from a workspace request.

This is an agent-run setup flow, not an instruction sheet. Ask where projects belong, then offer "Реши все за меня" as the default with a free-form language field prefilled `go, python`. Execute the approved setup yourself, including dependencies and integrations. Reading the skill or displaying defaults is not installation approval. Do not resume a previously cancelled setup merely because the user requests changes to Ai-Kit itself.

For an explicit check/report-only request, stop after read-only inventory and findings. Do not turn diagnostics into an installation prompt or any mutation.

## 1. Read-only inventory

Resolve this reference's real directory; helper paths below are relative to this file, not the root skill or target repository. Detect the OS, shell, package manager, current OMP profile/environment overrides and requested workspace. Inspect only relevant local settings and executable versions. If present, read private `${XDG_CONFIG_HOME:-$HOME/.config}/ai-kit/tools.json` for managed invocations outside PATH; validate the referenced files/version, do not execute arbitrary stored shell strings. Never publish local inventory, user paths, accounts, auth data or project descriptions in Ai-Kit.

```sh
AI_KIT_CLIENT=omp bash ../../../scripts/toolchain.sh report
```

Also inspect `omp --version`, `backlog --version` and Whiteboard through its discovered CLI or Desktop bundled runtime. No external Bun is required by compiled OMP. Distinguish executable installed, configuration present, backend running and operational readiness. Inspect MCP names/scopes/transports without printing auth/header/env values. Do not start Docker, Whiteboard, a server, an installer or an auth flow during discovery.

## 2. Ask two questions, then act

Use answers already supplied in the conversation instead of asking again. Explicitly requesting recommended setup is a mode answer, not a reason to show another selector. Cancellation before the flow is complete means no directory creation, installation, service startup, config writes or tracker initialization.

A timer submitting preselected form values is not owner approval. Obtain explicit
authorization before installation or trust-sensitive actions; automatic answers
may select details only inside an already approved scope.

### Question 1: where will projects live?

Show one editable path, prefilled with the detected development root. If several roots exist, prefer the most specific existing root containing the current workspace. If none is known, suggest `~/Developments`. Accept another path in that same question; do not ask the user to choose profiles, repositories or accounts here. Normalize it as a filesystem path, never a shell command. Create an approved missing directory only after the setup mode is answered. A development root is not a Git repository and does not authorize rewriting every workspace beneath it.

### Question 2: how should the environment be configured?

Show only these two choices:

- **Реши все за меня (рекомендуется)**, selected by default. Disclose missing recommended tools and official dependencies, integrations, direnv shell hook, selected LSP servers, native OMP UI, five-minute ask auto-submit, plugin update notifications and model-role setup, and necessary local services. Preserve settings/data/keys and the user's ordinary-chat default; conflicting role/bar assignments need resolution. Discover requested bridge directions, but forwarding, browser tabs, clipboard access and private authentication require their explicit trust/authorization decision. Project `.envrc` is created only during explicit project setup, not across every checkout.
- **Хочу выбрать сам**. Show one component list with recommended items checked and tmux unchecked. Do not follow it with another MCP, profile, service-mode or dependency questionnaire. Include the same free-form language input in that component form when the mode form did not already collect it.

The native mode form can use this shape:

```html
<form>
<p>Агент установит недостающее, подключит интеграции, direnv и выбранные LSP, настроит native OMP UI, автоотправку ask через пять минут, уведомления об обновлениях plugins и модельные роли и запустит необходимые локальные сервисы. Данные, ключи и обычная default-модель сохраняются; конфликты настроек согласуются. Для bridges сначала определяются направления и доверие; forwarding, tabs, clipboard и приватная аутентификация требуют отдельного разрешения. .envrc создается только при настройке выбранного проекта.</p>
<p>tmux не входит в рекомендуемый набор. Его можно включить при ручном выборе или запросить отдельно.</p>
<fieldset>
<legend>Как настроить окружение?</legend>
<label><input type="radio" name="setup_mode" value="recommended" checked> Реши все за меня: OMP/роли, память, Backlog, Whiteboard, Git/ghq/GCM, подписи, direnv, LSP, discovery bridges и общие инструменты</label>
<label><input type="radio" name="setup_mode" value="custom"> Хочу выбрать сам</label>
</fieldset>
<label>Языки для LSP (свободный ввод, через пробел или запятую; пустое поле - без языков) <input type="text" name="languages" value="go, python"></label>
</form>
```

In custom mode generate one native multi-select from the following table. Only tmux starts unchecked. Empty custom selection means no mutation, not fallback to the recommended set. If forms are unavailable, ask the same questions in text and wait for answers; do not simulate consent.

| ID | Component and included setup |
|---|---|
| omp | OMP in the current profile: [native UI/MCP](omp-mcp.md) and [model roles and bounded handoff](models.md) |
| hindsight | Native Hindsight memory; existing helper and section 4 below |
| backlog | Backlog.md and its MCP connector; reuse an existing owning tracker, [Backlog setup](backlog.md) |
| whiteboard | Whiteboard and its MCP connector; [Whiteboard setup](whiteboard.md) |
| git-workspace | Git, ghq, GCM and existing-key signing; reuse `skill://project-setup` |
| tuicr | Terminal code review; [official installation methods](https://github.com/agavra/tuicr#install); verify `tuicr --version` |
| direnv | Per-project environments and an active shell hook; [direnv setup](direnv.md) |
| lsp | Install and configure native language servers for the free-form language answer; [LSP setup](lsp.md) |
| bridges | Discover requested local/remote browser, callback, SSH-agent and clipboard directions, then apply only explicitly approved [native bridges](bridges.md); never infer trust or remote access |
| python3, uv, docker, pre-commit, node, ripwire, jq, shellcheck, tre | One entry per common tool |
| tmux | Optional, unchecked: [native installation and per-user configuration](tmux.md); register workspaces only through explicit project setup |

Recommended mode selects every entry except tmux. Git is included through `git-workspace`, not a duplicate checkbox. MCP is included with Backlog and Whiteboard, not a separate choice; Hindsight uses OMP's native backend. Additional MCP servers are configured only when explicitly requested. LSP is native, not MCP: install the servers for the user's language answer yourself. Normalize language aliases and duplicates as data, never shell input. Use `go, python` only when the field was not supplied; an explicitly empty field selects no languages. If `lsp` is deselected, ignore the language field and install no language-specific dependencies.

Choose technical details yourself: retain the effective current OMP profile and its environment overrides; reuse healthy services and matching Git profiles; prefer an installed Whiteboard mode, otherwise Desktop on a supported graphical machine and headless on a server; use stdio for bundled MCP connectors and preserve appropriate existing client scopes. Keep generic user connectors generic and tracker-specific bindings project-local. Do not ask about these defaults merely because configuration has several possible shapes.

Show a short action summary and execute without another approval round: mode/custom selection authorizes its disclosed tools, required official dependencies, integration setup and necessary service startup. Deduplicate shared dependencies. Do not upgrade healthy tools, install unrelated custom MCP packages or enable uploads/telemetry. Preserve unrelated package-manager, Git, model, auth and project settings.

Ask only when execution genuinely needs private authentication, a missing author identity/key, an existing-setting conflict or an OS permission. A dependency that can be installed alongside the current runtime is not a conflict; replacing the default runtime, resetting credential helpers, moving data, replacing a remote service or changing a signing key is. Never invent identities or keys, export a private key without specific permission, disable signing, or treat recommended mode as consent to destructive changes. Continue independent approved components when one needs user input.

## 3. Execute only the approved plan

Follow [native installation](native-installation.md) for each approved missing component. The agent chooses the supported method for the detected host and executes it; `toolchain.sh` only checks/reports. Pass explicit component IDs when checking a selection:

```sh
bash ../../../scripts/toolchain.sh report jq shellcheck
```

Run linked integration procedures separately. The direnv diagnostic checks the binary only; verify its shell hook as well. Deduplicate dependencies and order them before consumers. For local Hindsight, install approved missing binaries first, start Docker only if disclosed and approved, then run the Hindsight helper. Never run `eval` on user-supplied commands or fail setup because an unselected component is absent.

Do the configuration as well as binary installation: resolve the selected profile, preserve unrelated settings, write or merge only approved fields and verify effective values. Back up affected existing files privately. An existing server with a matching name is not permission to replace its complete definition or auth. Use argument arrays for custom executable/args and keep secrets in native credential storage or local environment references, never arguments or public files.

## 4. Hindsight: reuse the existing implementation

Use the effective current OMP profile, or an explicitly requested different profile, and verify its `config path` before every check/install. Keep that same child environment throughout. `OMP_PROFILE` selects a named profile; existing `PI_CONFIG_DIR`/`PI_CODING_AGENT_DIR` overrides must be understood, not silently removed. Resolve conflicts before changing the wrong target.

```sh
AI_KIT_CLIENT=omp OMP_PROFILE=selected-profile node ../../../scripts/hindsight.mjs report
AI_KIT_CLIENT=omp OMP_PROFILE=selected-profile node ../../../scripts/hindsight.mjs install
```

Omit `OMP_PROFILE` only for the intentionally selected default/current profile. Inspect the current endpoint/backend before execution. A working remote remains remote; a broken configured remote is repaired with the owner, never replaced by local Docker. Another memory backend is preserved unless the owner explicitly approves switching that target. Do not add a Hindsight MCP server: OMP has a native backend.

For project-only Hindsight, do not let an install with effective backend `off` enable the whole user profile: `omp config set` writes that profile globally. Privately back up the target project YAML, set only its approved memory/endpoint fields, then run the helper from that project's cwd with the effective backend already `hindsight`. Roll back those project fields if setup fails. A pinned project override must not cause repeated writes to the global profile.

For a new local service, use the pinned Compose helper and private `${XDG_CONFIG_HOME:-$HOME/.config}/hindsight` directory. LLM credentials come from the user's private `llm.env` or explicitly supplied environment, never copied from another client's provider auth. Preserve existing Compose/env, containers, volumes and bank data. Do not recreate an existing runtime, lower recall limits or export memory contents.

After service health, configure only the approved native endpoint/backend and any chosen workspace bank bindings; see [workspace memory routing and charter](../../../docs/memory.md). Do not invent bank names or give every project another project's bank. The existing helper validates API health, connected database and bank API access, enables memory only from off, preserves another backend and fails explicitly on configuration overrides. Authenticated non-loopback HTTP requires HTTPS or the exact locally approved `HINDSIGHT_PROTECTED_HTTP_ORIGIN`; verify encrypted transport and peer identity, retain redirect rejection, and do not treat this helper-only exception as native OMP transport configuration.

## 5. Verify and finish

Verify each selected component and its configuration with the linked native readiness checks. A successful installer, existing executable or MCP handshake alone is not readiness. Repeat read-only setup for the chosen target to establish idempotency; do not reinstall a healthy service to test it. Never run an LLM request, retention operation or project write as a generic health check.

Report installed/configured/reused/failed/waiting-for-private-input separately. Name actual scope, checks and remaining user/OS action without secrets. Partial failure is not a green setup: continue independent selected components, but do not operate consumers whose prerequisite failed. Preserve unselected tools and settings. Restart affected OMP sessions after plugin/MCP/profile changes; keep old runtime paths intact for still-open sessions. Do not clean caches or remove old data as an installation side effect.
