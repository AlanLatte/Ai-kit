---
name: project-setup
description: Create or connect a workspace or repository with scoped Git, ghq, GCM, signing and direnv.
---
# Project setup

Loading this skill does not authorize installation, credentials, key export, repository creation or publication. Keep real hosts, accounts, paths and secrets local. Apply `skill://no-ai-slop` silently to authored prose, preserving exact evidence and format.

- **Tools only:** use [workspace toolchain](../toolchain/references/workspace.md) with the existing canonical root and full owning-kit inventory. Do not run Git/auth/signing setup.
- **Machine bootstrap delegated by toolchain:** read [setup](references/setup.md); retain its selected development root and matching profiles, install only missing approved prerequisites, and skip project-creation questions and repository creation. Ask only for genuinely missing identity/key, private auth or conflicts.
- **Create/connect a workspace or repository:** follow [full setup](references/setup.md), loading [signing](references/ssh-signing.md) only when signing is in scope and [workspace layout](references/workspace-layout.md) when placing or migrating local configuration.

Preserve working profiles, helper chains, remotes, signing keys, hooks and environment runners. No global author shortcut, credential migration or service change is implied by a workspace request. Create `.envrc` only for the selected project/workspace after reviewing its code; no broad directory trust. Verify effective origins and isolation before accepting setup.
