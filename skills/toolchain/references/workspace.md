# Workspace toolchain procedure

This is an agent-run procedure using native mise, not an installer script. A caller supplies the canonical workspace root and its entire declared tool inventory: tool/backend identifiers, executables, version constraints and any required runtime dependencies. Keep project inventories and conventions in the caller, not Ai-Kit. Explicit workspace setup authorizes installing that full inventory, including tools unrelated to the current task. Never silently narrow it to tools currently needed or already on PATH. An empty or missing inventory is not permission to choose the machine-wide baseline.

A workspace is the user's existing coordination root containing independent
repository checkouts, tracker, client settings and `.envrc`. Ai-Kit's
[workspace-local configuration contract](../../project-setup/references/workspace-layout.md)
defines secret-free `.config/bin`, `.config/libexec`, `.config/git/config` and
unit template placement. Reuse the supplied canonical root and preserve its
native files; neither `.config` nor a legacy root `.gitconfig` is a kit marker.
A repository is one checkout inside it; a development root can contain several
workspaces and is not itself an installation target.

Ai-Kit owns the shared mise bootstrap, full-inventory setup, activation and
verification procedure. Mise is an external user-level dependency, never bundled
in the plugin. Project kits own inventories, compatibility constraints and access
policy. Each workspace owns its `mise.toml`, supported `mise.lock` and `.envrc`;
repositories retain their own pins, lockfiles and native runners. There is no
machine-wide default tool selection and no separate environment per plugin.

During approved setup, inspect workspace-local configuration as well as tool
pins. Only the root files and missing activation/layout entries in the approved
scope may change. Never redefine global `XDG_CONFIG_HOME`, move credentials/state
into `.config`, copy tool installations there, or overwrite an existing command
policy wrapper. Existing layout migrations require explicit all-consumer cutover;
the tools-only flow reports unrelated Git/auth/service work without doing it.

## 1. Select scope and inspect without mutation

For workspace setup, reuse supplied scope and approval; ask only for missing scope/inventory or a real conflict. A task-specific check or workspace report uses [read-only readiness](readiness.md) instead; do not preload installation sections. Startup, reading a skill, check and report never authorize installation. Report mode must not bootstrap mise, trust configuration, resolve remote versions, install tools, write locks or run commands that auto-install. If mise is absent, report that prerequisite as missing.

Inspect the OS/architecture, installed mise version, relevant inherited configuration, workspace and repository version files, native runners and lockfiles. Read config, hooks, templates and sourced code before executing it or trusting it. Privately record relevant config hashes and plain executable paths/versions in a shell outside the workspace for comparison afterward. Do not print private environment values.

Priority: repository lockfiles and declared native runners first; repository runtime/tool pins next; caller workspace constraints next; otherwise resolve a compatible stable version once during approved setup. Preserve existing exact workspace pins on reruns. Do not override a repository pin with a newer baseline, rewrite application lockfiles, migrate environments or add a competing package manager. Tools used only through an established repository runner remain owned by it; account for them explicitly in the full inventory rather than duplicating them globally. Conflicting requirements need separate repository-local selections, not a compromised shared version.

An established project wrapper may enforce routing or policy and depend on an existing absolute-path native binary. Treat that wrapper and its prerequisite as an explicit inventory entry; do not install a competing raw executable ahead of it merely to satisfy the same name. Preserve wrapper contents, prerequisite paths and command precedence. If the managed execution environment shadows it, stop that entry as a conflict rather than editing authentication, adding a new wrapper or inventing another PATH convention.

## 2. Bootstrap only the manager when approved

Reuse a working mise executable, including one outside PATH. When absent, follow the [host-native procedure](native-installation.md) and [mise's official installation instructions](https://mise.jdx.dev/installing-mise.html). Prefer a supported user-local route, inspect any downloaded installer before execution, and verify the actual executable/version. Ai-Kit installs or reuses the manager once for the user; package-manager/runtime dependencies remain explicit. Use the resolved absolute path in activation rather than changing shell startup. Do not use sudo, replace a working mise or silently upgrade an incompatible installation.

Use mise's native user-private versioned installation/cache directories (respect existing MISE_DATA_DIR and MISE_CACHE_DIR after checking ownership and scope). Shared cached artifacts are fine; selected versions belong to workspace/repository config. Never copy tools into a custom bin directory, create wrapper installers, expose mise shims globally or call `mise use --global`/`mise settings` to set defaults.

## 3. Pin and install the entire inventory

Check the installed `mise use --help`, `mise install --help`, `mise lock --help`, `mise env --help` and `mise exec --help`; capabilities vary by release. Resolve each inventory identifier through the official [registry/backends](https://mise.jdx.dev/registry.html), verifying upstream origin, binary names, platform support and dependencies. Prefer native registry backends to arbitrary third-party plugins. Include every required backend runtime in the approved plan and pin it too. Do not replace an unavailable tool with an unrelated package or omit it: report that entry failed and continue independent entries.

Privately back up affected existing files. Merge only approved tool entries into workspace-root `mise.toml`, preserving existing settings, tasks, environment and unrelated tools. Never replace `.envrc`, global configuration or repository configuration as a shortcut. Use explicit target paths so writes cannot accidentally select a parent/global config. For each compatible group, pass the actual validated tool arguments as separate arguments, not evaluated shell text:

```sh
cd /absolute/workspace
mise use --path /absolute/workspace/mise.toml --pin <tool@constraint> <other-tool@constraint>
```

Angle-bracket arguments are placeholders for the complete caller inventory, not literal commands or a suggested subset. `mise use` installs missing versions and writes exact resolved versions with `--pin`; do not leave `latest`, major-only or floating requests in newly managed entries. Reuse healthy exact pins and cached installs; no `--force`, blanket upgrade, cache pruning or removal of older versions. Do not install via global npm/pip/cargo as a fallback. Review any installer hooks before running them; installation does not authorize credentials, authentication, signing/key changes, services, deployments or project initialization.

Where supported, create/update workspace-local `mise.lock` with `mise lock` after pinning; preserve unrelated lock entries. Current upstream documents `mise install --locked`, but use it only if the installed help supports it and the local lock covers the selected platform/backends. Otherwise install exact `mise.toml` pins with `mise install` and report the missing strict-lock/checksum capability; never claim a locked install. Existing repository locks remain authoritative and are not regenerated as part of workspace setup. Do not add global lockfile settings. Record backend/platform lock limitations and failures per inventory entry.

User-local installation does not eliminate host build prerequisites. Inspect
native-build failures and the owning runtime's requirements before proposing a
repair. A missing compiler, make, headers or OS library can require administrator
action even when the package itself belongs to the user. Do not use privileged
pip/gem/npm/bundle installs or grant the development user sudo. Preserve completed
entries and application locks; report the exact blocked runner, observed failure
and required administrator action separately from baseline inventory coverage.

## 4. Activate through the existing workspace environment

Normal use is `cd` into the workspace or its covered repository, then `omp` or
the repository's native command. Ai-Kit prepares the workspace-root `.envrc` and
the existing direnv hook once during explicit setup; users do not need to invoke
mise manually for each command. Read [the direnv procedure](direnv.md) for exact
trust and shell-hook handling. A kit install, report or ordinary startup never
edits `.envrc`, runs `direnv allow` or installs a tool.

Inspect and preserve an existing mise-dependent `.envrc` and everything it
sources. Do not remove mise, migrate its selected versions or replace this
activation just because uv/venv/Bundler or project directories already exist:
their coverage of other CLI versions has not thereby been established. Approved
workspace setup may merge only the missing activation into that root's `.envrc`.
Keep its private dotenv loading, runtime ownership and policy-wrapper precedence.
Project-specific `.venv/bin` and mandatory wrappers must remain ahead of the
workspace baseline. Do not enable both direnv and `mise activate`, add global
shims/selection, another shell hook, or a custom launcher.

Upstream currently marks direnv/mise integration unsupported and deprecates
`use mise`/`use_mise`. The user-selected Ai-Kit contract retains direnv as the
sole automatic loader, using reviewed native `mise env --shell bash` output
with no mise prompt hook. This is our verified integration, not an upstream
support promise. Reuse an existing working fragment when it meets these
invariants; do not reinstall deprecated integration helpers.

For a new or missing fragment, merge the following behavior at the reviewed
position in `.envrc`, substituting the actual absolute mise executable for
`/absolute/path/to/mise`. Review the selected configuration, hooks and sourced
code before evaluating its export. Never print or persist that output: it may
contain private values. This code executes only in direnv's child Bash, never by
manually sourcing `.envrc` in the interactive shell. Use `exit 1`, not `return`:
direnv's `source_env` directory cleanup can otherwise mask the source's failure.

```sh
watch_file mise.toml mise.lock
MISE_OFFLINE=1 /absolute/path/to/mise install --dry-run-code || exit 1
ai_kit_mise_env="$(MISE_AUTO_INSTALL=0 MISE_EXEC_AUTO_INSTALL=0 /absolute/path/to/mise env --shell bash)" || exit 1
eval "$ai_kit_mise_env" || exit 1
unset ai_kit_mise_env
```

The supported installed-selection preflight must reject missing selected pins;
no-auto-install flags alone can fall through to a different system executable.
Activation failure is a setup/readiness failure, not permission to use a global
version or install packages. Review and watch any additional effective config,
lock or local override files. Re-review before allowing the exact changed root.

A workspace-root export does not reselect tools when a long-lived client changes
cwd. Nor does it automatically apply a nested repository's extra mise config.
Use native repository runners and existing repository `.envrc` files; inspect
and, only within approved setup, merge reviewed parent loading with child-native
activation where needed. Verify each conflicting repository selection explicitly.
For selected LSP integration, the normal launch directory remains this workspace,
not an arbitrarily chosen child checkout. Follow the [workspace LSP procedure](lsp.md#sessions-launched-from-a-multi-repository-workspace):
verify launch-root server discovery and independent child analysis environments.
Root PATH activation alone does not make child language projects LSP-ready.
Do not scatter generated `.envrc` files or locks across every checkout.

For automation without direnv or a shell that has not loaded `.envrc`, use the
same explicit, no-install fallback from the intended directory:

```sh
MISE_OFFLINE=1 mise install --dry-run-code &&
  MISE_AUTO_INSTALL=0 MISE_EXEC_AUTO_INSTALL=0 mise exec -- omp
```

This is an automation fallback, not the normal interactive command. Use the
resolved absolute mise path if necessary. Verify actual installed executable
paths and versions rather than relying on exit status or an active shell marker.

## 5. Prove scope and report honestly

Account for every declared tool as installed, reused, repository-runner-owned, failed or blocked. Compare actual selected versions and executable paths using `mise config ls`, `mise ls --current` and `mise which <executable>`, plus each tool's safe version command in the workspace execution environment. Verify the resulting config contains exact pins and inspect local lock coverage. Repeat the read-only inventory to establish idempotency without reinstalling. Do not use `mise exec`/`mise run` as discovery if they could install or execute unreviewed hooks.

In a fresh shell, prove actual workspace entry, a representative nested checkout, switching to a neighboring workspace, and exit back outside. Compare plain tool paths/versions and relevant preexisting config with the private before snapshot. Use `direnv exec` as a scriptable check as well; do not run it on an unreviewed environment. Workspace selections must load automatically, repository-native overrides and policy wrappers must win, and managed paths must not leak outside. A tool already installed globally may still resolve outside; prove it is unchanged, not absent. Confirm no unrelated global config, shell startup, credentials, application locks or sibling workspace files changed; list any intentional target-root `.envrc` edits.

Binary installation is not workflow readiness: authentication, network/mesh access, service health, client integration and project-specific acceptance remain task-specific checks under their owning skills. Do not trigger auth flows or services to turn a binary setup green. Report full inventory coverage, scope, pins/lock limitations, actual read-only proofs and remaining workflow prerequisites separately; partial installation is not complete setup. Never clean caches or old versions as a side effect.

## Native references

- [Getting started and explicit execution](https://mise.jdx.dev/getting-started.html)
- [Explicit config target and pinning](https://mise.jdx.dev/cli/use.html)
- [Lockfiles and strict locked installs](https://mise.jdx.dev/dev-tools/mise-lock.html)
- [Direnv compatibility warning](https://mise.jdx.dev/direnv.html)
- [One-shot environment export](https://mise.jdx.dev/cli/env.html)
- [Direnv trust and shell integration](direnv.md)
