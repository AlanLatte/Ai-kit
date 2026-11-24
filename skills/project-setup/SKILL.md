---
name: project-setup
description: Create or connect a workspace or repository with scoped Git, ghq, GCM, signing and direnv.
---
# Project setup

Loading this skill does not authorize installation, credentials, key export, repository creation or publication. Keep real hosts, accounts, paths and secrets local. Use `skill://no-ai-slop` only for drafting or substantially revising substantive documentation/reports, not routine setup questions or readiness statuses; reuse it once loaded and preserve exact evidence and format.

- **Tools only:** use [workspace setup](../toolchain/references/workspace.md) for approved changes with the existing canonical root and full owning-kit inventory, or [read-only readiness](../toolchain/references/readiness.md) for a check/report. Do not run Git/auth/signing setup.
- **Machine bootstrap delegated by toolchain:** read [setup](references/setup.md); retain its selected development root and matching profiles, install only missing approved prerequisites, and skip project-creation questions and repository creation. Ask only for genuinely missing identity/key, private auth or conflicts.
- **Create/connect a workspace or repository:** follow [full setup](references/setup.md), loading [signing](references/ssh-signing.md) only when signing is in scope and [workspace layout](references/workspace-layout.md) when placing or migrating local configuration.
- **Optional tmux registration:** follow [native tmux](../toolchain/references/tmux.md#workspace-register-one-approved-root) only when enabled for the approved workspace or explicitly requested with an existing tmux. This does not install tmux or modify Git/signing/bridge settings.

Preserve working profiles, helper chains, remotes, signing keys, hooks and environment runners. No global author shortcut, credential migration or service change is implied by a workspace request. Create `.envrc` only for the selected project/workspace after reviewing its code; no broad directory trust. Verify effective origins and isolation before accepting setup.
