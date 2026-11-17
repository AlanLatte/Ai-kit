# Read-only tool readiness

Use this route for a task-specific check or workspace report, not installation. Select the supplied canonical workspace/repository and requested tools first. A full inventory report checks the entire owning-kit inventory; a task-specific check covers only that task. Missing scope or inventory is not permission to choose a machine baseline.

## Inspect without side effects

- Read the relevant project inventory, repository pins/locks/native runners, existing wrappers and effective environment configuration. Review config hooks and sourced code before executing anything. Do not print secret environment values.
- Resolve plain executable paths and safe version commands in the intended environment. Repository runners and pins win over workspace baselines; policy wrappers must not be shadowed by raw managed binaries. Do not invoke `npx`, `uv run`, a client or any runner merely to discover a tool if it might download or install dependencies.
- If mise is configured, use its installed executable and supported read-only `mise config ls`, `mise ls --current` and `mise which <executable>` to inspect selection. Before execution through a reviewed environment, require the offline installed-selection preflight `MISE_OFFLINE=1 mise install --dry-run-code`. If absent, unsupported or failing, report the limit; do not bootstrap, trust config, resolve remote versions or install anything.
- No-auto-install flags alone do not reject a missing pin reliably. After a successful preflight, automation may use `MISE_AUTO_INSTALL=0 MISE_EXEC_AUTO_INSTALL=0 mise exec -- <safe-version-command>`. Verify the actual executable path/version; exit zero is not proof of the selected version.
- Reuse the existing reviewed direnv environment without `allow` or edits. A long-lived client retains its startup PATH; changing cwd does not reselect a child repository's environment or venv. Inspect native precedence in the requested checkout rather than claiming isolation from a workspace marker.

## Report the actual boundary

Separate executable installed, selected version/path, native dependencies prepared, authorization/access, service health and exercised behavior. Check only task-authorized access through the owning project skill; never start login, refresh, signing agents, mesh, Docker or other services to make a report green. Preserve identities, credentials, keys, wrappers, pins/locks, environment files and global settings.

Name each checked tool and any missing, failed or unverified step. Readiness does not authorize push, merge, deploy, secret reads or remote probes. If installation or activation repair is subsequently assigned, route to the [full workspace setup](workspace.md); do not preload it for a read-only check.
