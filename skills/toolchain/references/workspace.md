# Workspace toolchain procedure

This is an agent-run procedure using native mise, not an installer script. A caller supplies the canonical workspace root and its entire declared tool inventory: tool/backend identifiers, executables, version constraints and any required runtime dependencies. Keep project inventories and conventions in the caller, not Ai-Kit. Explicit workspace setup authorizes installing that full inventory, including tools unrelated to the current task. Never silently narrow it to tools currently needed or already on PATH. An empty or missing inventory is not permission to choose the machine-wide baseline.

## 1. Select scope and inspect without mutation

Route workspace setup/check/report here before the machine-wide questionnaire. Reuse supplied scope and approval; ask only for missing scope/inventory or a real conflict. Startup, reading a skill, check and report never authorize installation. Report mode must not bootstrap mise, trust configuration, resolve remote versions, install tools, write locks or run commands that auto-install. If mise is absent, report that prerequisite as missing.

Inspect the OS/architecture, installed mise version, relevant inherited configuration, workspace and repository version files, native runners and lockfiles. Read config, hooks, templates and sourced code before executing it or trusting it. Privately record relevant config hashes and plain executable paths/versions in a shell outside the workspace for comparison afterward. Do not print private environment values.

Priority: repository lockfiles and declared native runners first; repository runtime/tool pins next; caller workspace constraints next; otherwise resolve a compatible stable version once during approved setup. Preserve existing exact workspace pins on reruns. Do not override a repository pin with a newer baseline, rewrite application lockfiles, migrate environments or add a competing package manager. Tools used only through an established repository runner remain owned by it; account for them explicitly in the full inventory rather than duplicating them globally. Conflicting requirements need separate repository-local selections, not a compromised shared version.

An established project wrapper may enforce routing or policy and depend on an existing absolute-path native binary. Treat that wrapper and its prerequisite as an explicit inventory entry; do not install a competing raw executable ahead of it merely to satisfy the same name. Preserve wrapper contents, prerequisite paths and command precedence. If the managed execution environment shadows it, stop that entry as a conflict rather than editing authentication, adding a new wrapper or inventing another PATH convention.

## 2. Bootstrap only the manager when approved

Reuse a working mise executable, including one outside PATH. When absent, use the [official installation instructions](https://mise.jdx.dev/installing-mise.html) for the actual OS. On macOS/Linux the official user installer is:

```sh
curl -fsSL https://mise.run -o /private/temporary-directory/mise-install.sh
sh /private/temporary-directory/mise-install.sh
~/.local/bin/mise --version
```

Use an actual private temporary directory in place of the placeholder above. Inspect the downloaded official installer before the `sh` step, then check `~/.local/bin/mise --version` after installation and remove the temporary download. Use its absolute executable path in subsequent commands if necessary; no shell activation is required. Do not install a second package manager, use sudo, replace an existing mise, or modify shell startup to make the command resolve. Existing unsupported versions or required OS permissions are reported as conflicts, not silently upgraded. Shared user bootstrap tools and integrations remain a separate request.

Use mise's native user-private versioned installation/cache directories (respect existing MISE_DATA_DIR and MISE_CACHE_DIR after checking ownership and scope). Shared cached artifacts are fine; selected versions belong to workspace/repository config. Never copy tools into a custom bin directory, create wrapper installers, expose mise shims globally or call `mise use --global`/`mise settings` to set defaults.

## 3. Pin and install the entire inventory

Check the installed `mise use --help`, `mise install --help`, `mise lock --help` and `mise exec --help`; capabilities vary by release. Resolve each inventory identifier through the official [registry/backends](https://mise.jdx.dev/registry.html), verifying upstream origin, binary names, platform support and dependencies. Prefer native registry backends to arbitrary third-party plugins. Include every required backend runtime in the approved plan and pin it too. Do not replace an unavailable tool with an unrelated package or omit it: report that entry failed and continue independent entries.

Privately back up affected existing files. Merge only approved tool entries into workspace-root `mise.toml`, preserving existing settings, tasks, environment and unrelated tools. Never replace `.envrc`, global configuration or repository configuration as a shortcut. Use explicit target paths so writes cannot accidentally select a parent/global config. For each compatible group, pass the actual validated tool arguments as separate arguments, not evaluated shell text:

```sh
cd /absolute/workspace
mise use --path /absolute/workspace/mise.toml --pin <tool@constraint> <other-tool@constraint>
```

Angle-bracket arguments are placeholders for the complete caller inventory, not literal commands or a suggested subset. `mise use` installs missing versions and writes exact resolved versions with `--pin`; do not leave `latest`, major-only or floating requests in newly managed entries. Reuse healthy exact pins and cached installs; no `--force`, blanket upgrade, cache pruning or removal of older versions. Do not install via global npm/pip/cargo as a fallback. Review any installer hooks before running them; installation does not authorize credentials, authentication, signing/key changes, services, deployments or project initialization.

Where supported, create/update workspace-local `mise.lock` with `mise lock` after pinning; preserve unrelated lock entries. Current upstream documents `mise install --locked`, but use it only if the installed help supports it and the local lock covers the selected platform/backends. Otherwise install exact `mise.toml` pins with `mise install` and report the missing strict-lock/checksum capability; never claim a locked install. Existing repository locks remain authoritative and are not regenerated as part of workspace setup. Do not add global lockfile settings. Record backend/platform lock limitations and failures per inventory entry.

## 4. Run the native client and repository commands

Preserve existing direnv files and hooks. Do not add mise shell activation, `use mise`, `use_mise` or a second environment loader: upstream declares the direnv/mise hook combination unsupported. Use explicit child-process execution, not a custom launcher. After installation, launch the native client from the approved workspace shell:

```sh
cd /absolute/workspace
MISE_OFFLINE=1 mise install --dry-run-code &&
  MISE_AUTO_INSTALL=0 MISE_EXEC_AUTO_INSTALL=0 mise exec -- omp
```

Use the absolute mise path if it is not on PATH. OMP and plugin hooks inherit these tool paths without changing the parent shell. Existing reviewed direnv values may already be present; do not migrate them to mise or duplicate runtime/venv ownership. Inspect effective precedence if an existing configuration changes PATH.

A long-lived workspace client keeps its inherited PATH when changing directory.
It does not automatically switch every repository's tools. For repository
commands, enter the repository and use its documented native runner, or
repository-local `mise exec -- <command>`; repository pins outrank the workspace
baseline. Do not execute bare workspace binaries when another version is required.
`mise exec` can auto-install missing tools. For checks, disable both installation
settings in that child environment, without changing global settings:

```sh
MISE_AUTO_INSTALL=0 MISE_EXEC_AUTO_INSTALL=0 mise exec -- <safe-version-command>
```

Verify these environment settings and `install --dry-run-code` against the
installed release. Before any `exec` check, require the same successful
installed-selection preflight shown above. Disabling auto-install alone is not
fail-closed: mise can run a different system executable when the selected version
is missing. Verify the selected tool's absolute path and version, not just exit
status. Do not execute an unreviewed configuration. Normal OMP startup uses the
preflight and no-auto-install child environment; missing pins stop startup
instead of installing or silently using a global version.

## 5. Prove scope and report honestly

Account for every declared tool as installed, reused, repository-runner-owned, failed or blocked. Compare actual selected versions and executable paths using `mise config ls`, `mise ls --current` and `mise which <executable>`, plus each tool's safe version command in the workspace execution environment. Verify the resulting config contains exact pins and inspect local lock coverage. Repeat the read-only inventory to establish idempotency without reinstalling. Do not use `mise exec`/`mise run` as discovery if they could install or execute unreviewed hooks.

Compare plain PATH resolution/versions from the original outside shell, not a child of `mise exec`, with the before snapshot; workspace-managed versions must not leak into unrelated directories. Confirm unrelated global config, shell startup, `.envrc`, application locks and credential settings remain unchanged. A tool already globally installed may still resolve outside; prove it is unchanged, not that every tool is absent. Check representative repository selections independently when they override the baseline.

Binary installation is not workflow readiness: authentication, network/mesh access, service health, client integration and project-specific acceptance remain task-specific checks under their owning skills. Do not trigger auth flows or services to turn a binary setup green. Report full inventory coverage, scope, pins/lock limitations, actual read-only proofs and remaining workflow prerequisites separately; partial installation is not complete setup. Never clean caches or old versions as a side effect.

## Native references

- [Getting started and explicit execution](https://mise.jdx.dev/getting-started.html)
- [Explicit config target and pinning](https://mise.jdx.dev/cli/use.html)
- [Lockfiles and strict locked installs](https://mise.jdx.dev/dev-tools/mise-lock.html)
- [Direnv compatibility warning](https://mise.jdx.dev/direnv.html)
