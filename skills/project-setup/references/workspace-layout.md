# Workspace-local configuration

Ai-Kit owns this shared layout contract; project kits declare inventory and
project policy without copying an environment loader or installer. A workspace
is the existing coordination root of independent repositories. This directory
is not a new monorepo, repository checkout, user home or global configuration
root. Reuse the caller's canonical root and existing owner.

## Placement

```text
<workspace>/
  .config/
    bin/
    libexec/
    git/
      config
    systemd/
  .envrc
  mise.toml
  mise.lock
  .omp/
  <repository>/
```

- `.config/bin`: workspace commands and reviewed links to existing launchers.
  It is not a second version-manager cache. Never copy managed tool binaries here.
- `.config/libexec`: supporting script payloads that are not public commands.
- `.config/git/config`: canonical workspace Git profile, selected by scoped Git
  includes; command-specific signing configuration can live beside it.
- `.config/systemd`: optional workspace-owned unit templates when the target
  uses systemd. Do not create this directory on other hosts by default or
  confuse any service template with an installed or enabled service.

Create only needed directories during approved setup. Keep configuration
secret-free and user-owned, with private backups and restrictive permissions
where required. Private keys, credential stores, OAuth/PAT material, sockets,
service state, application sources and tracker data do not belong here.
User-global `~/.config` remains separate. Never set `XDG_CONFIG_HOME` to a
workspace `.config`: that can redirect credentials, memory and unrelated tools.

Preserve native discovery locations: root `.envrc`, `mise.toml`/supported lock,
`.omp`, workspace markers, tracker files and repository-native locks/runners stay
where their tools expect them. A workspace `.config` or Git profile does not
activate a kit or establish access authority. Do not move all dotfiles into it.

## Activation and existing installations

Read the root `.envrc`, its sources and existing wrappers before execution or
trust. Use the shared [workspace toolchain procedure](../../toolchain/references/workspace.md)
for mise and the single direnv loader. Only if `.config/bin` exists and contains
approved commands, select it with native `PATH_add` at the reviewed position.
Mandatory policy wrappers must win over workspace-managed binaries. Preserve
repository-specific native environments and any reviewed parent loading.
Do not add global PATH entries, another launcher, `mise activate` or auth changes.

New workspace-owned commands use this layout, not `.tools`, `.config/scripts`,
a root `git-sign.sh` or a new standalone root Git profile. Existing working
paths are not permission for automatic migration. Inspect all consumers first;
keep a path outside this layout when it is user-global, native, externally
managed or requires administrator action to move safely. Report that boundary.

For an explicitly approved migration, privately back up only affected files,
stage their same contents/permissions under the canonical destination, and update
every caller together: scoped Git includes, signing paths, `.envrc`, command
links, reviewed scripts and any managed unit source references. Do not duplicate
credentials, alter identity or host enrollment, bypass signing, modify a shared
service or enable/restart units as a tooling-check side effect. Service lifecycle
changes need their own existing authorization and platform-specific procedure.

Verify plain command resolution after canonical entry, in a real nested checkout,
in a neighboring workspace and after exit. Use harmless native invocations;
inspect Git config origins and effective author/signing settings without printing
secret helper values. Confirm profile contents and service definitions unrelated
to the move are unchanged. Only then retire owned obsolete paths under the
approved scope; no compatibility shims or silent duplicate writers. An executable
path containing `.config` alone does not prove profile selection or readiness.
