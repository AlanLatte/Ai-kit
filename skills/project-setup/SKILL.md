---
name: project-setup
description: Create or connect a project workspace with ghq, scoped Git profiles, GCM authentication and existing SSH signing keys independent of Bitwarden.
---
# Project and Git setup

Set up a workspace or repository only when requested. Adding or reading this skill does not authorize installation, account changes, key export, remote creation or publication. Keep project descriptions, actual hosts/accounts/paths, private keys and local configuration out of Ai-Kit.

## 1. Discover before changing

A development root contains workspaces; a workspace contains independent repository checkouts. Do not turn the workspace into a Git repository or scaffold an application without a separate requirement.

Inspect the OS, shell, installed `git`, `ghq` and `git credential-manager --version`, existing `ghq root --all`, `GHQ_ROOT`, conditional Git includes and relevant workspace `.gitconfig`/`.config`. In an existing checkout use `git rev-parse --show-toplevel --git-dir --git-common-dir` and `git remote -v`. Inspect configuration sources with `git config --show-origin --get <key>`; do not dump credentials or helper commands containing secrets.

Reuse the existing development root and directory layout. If none exists, propose a configurable root such as `~/Developments`; never assume its spelling, case or that it must be on the home volume. Ask together only for missing decisions: root/workspace, clone versus new repository, canonical remote and protocol, author identity, authentication account, existing signing-key fingerprint and initial branch policy. Do not infer author name/email from a host login.

Keep these separate: Git author identity, HTTPS authentication handled by GCM, SSH transport authentication, and commit/tag signing. A successful public `ls-remote` does not establish which account was used.

Back up only affected local configuration privately. Preserve unrelated include rules, helper chains, remotes, signing identity, hooks, shells and already configured workspaces. Confirm conflicts before overwriting anything. Check whether files are managed by dotfiles tooling and keep its source consistent when authorized.

## 2. Install missing prerequisites explicitly

Reuse `toolchain` for diagnostics, but do not install its entire inventory for this task. With installation approval, install only missing prerequisites using the OS's supported package manager. On macOS with Homebrew:

```sh
brew install git ghq
brew install --cask git-credential-manager
```

Skip already installed tools; do not install Homebrew silently. GCM installers can configure Git globally: inspect their effects and obtain explicit approval before installation if an existing helper chain could be reset. A request for one workspace does not authorize a machine-wide credential migration. For other OSes follow the official installation links below. Git for Windows may already include GCM; Linux requires an explicitly selected secure credential store. The signing recipe below is macOS-specific, not a claim of Windows/Linux support.

## 3. Keep workspace configuration local

Use the existing layout or this neutral structure:

```text
<development-root>/<workspace>/
  .gitconfig
  .config/
    git-sign.sh
    signing.gitconfig
  <host>/<owner>/<repository>/
~/.ssh/signing/
  <profile>
  <profile>.pub
  agent.sock
```

`.config` contains scripts and configuration, never private key material. `.gitconfig`, `.config` and `.ssh` remain outside application repositories and are not copied into Ai-Kit. Do not add secrets to a repository's excludes as a substitute for keeping them outside it.

Add an idempotent conditional include to the existing global Git configuration, using an absolute canonical workspace prefix with a trailing slash:

```gitconfig
[includeIf "gitdir:/absolute/development-root/workspace/"]
    path = /absolute/development-root/workspace/.gitconfig
```

Set the approved author name/email in the workspace profile using `git config --file <profile>`. Preserve the existing signing public key, fingerprint and signing requirements. Do not set a global author as a shortcut. Git uses matching Git directories, not the current shell directory; `includeIf` does not activate merely by entering a non-Git workspace. Later configuration and repository-local overrides can win: verify effective values inside a real checkout before a first commit.

For linked worktrees, inspect `--git-dir`/`--git-common-dir`: the administrative Git directory can remain inside the primary checkout's workspace even when the worktree is elsewhere. Verify identity there too; do not silently enable `extensions.worktreeConfig` or relabel all worktrees to fix one mismatch.

## 4. Route ghq before creating a checkout

Keep URL routing in global Git configuration where `ghq` can read it outside a checkout, not solely behind `includeIf gitdir`. Match the approved host and owner/path prefix; do not route an entire shared host to one workspace unnecessarily. Neutral example:

```gitconfig
[ghq "https://code.example/team/"]
    root = /absolute/development-root/workspace
[ghq "ssh://git@code.example/team/"]
    root = /absolute/development-root/workspace
```

Git URL matching treats HTTPS and SSH separately, and path case matters. SCP-style SSH URLs normalize to `ssh://`; inspect the actual match instead of guessing it. `root` changes the base directory, not the preserved `<host>/<owner>/<repository>` suffix. `ghq.root` may have multiple values; the last is primary. An existing clone under another configured root may be reused. `GHQ_ROOT` overrides all normal and URL-specific roots; do not introduce a global shell export or silently migrate an existing clone.

Before acting, check `git config --get-urlmatch ghq.root <normalized-url>`, `ghq root --all` and `ghq list --full-path --exact <host/owner/repository>`. If missing URL routing is intentional, an explicit per-command `GHQ_ROOT` may select the agreed root; explain that it overrides all other roots.

- Existing remote: `ghq get <approved-url>`. Preserve HTTPS versus SSH; `-p` explicitly switches to SSH, so do not add it automatically.
- New local repository: `ghq create --vcs git <host/owner/repository>`. This does not create a remote hosting project. Inspect the resulting branch and remote before changing them.
- A purely local repository without a remote identity may use `git init` at the agreed path. Do not invent a remote owner just to satisfy ghq layout.

Do not update an existing checkout with `ghq get -u`, move it with `ghq migrate`, create a hosted repository, push or create an initial application commit implicitly.

## 5. Configure and verify HTTPS authentication

Reuse working GCM configuration without running `configure`. That command changes global Git helpers, including an empty reset entry; use it only for explicitly approved machine-wide bootstrap or migration, never as a workspace-scoped operation. For an approved workspace-only change, configure the resolved `manager` helper in its local Git profile, scoped to the target HTTPS host. An empty helper entry clears inherited helpers only for that matching scope; review this deliberate replacement and preserve helpers needed by other hosts/workspaces. Neutral profile fragment:

```gitconfig
[credential "https://code.example"]
    helper =
    helper = manager
```

Verify `git credential-manager --version` resolves the installed executable, then re-read effective helpers for the intended URL and a nonmatching host/workspace. Do not hardcode another machine's executable path, globally clear helpers, enable plaintext storage or bypass TLS. On macOS use the existing Keychain store.

Keep host-specific provider/account settings in the appropriate local profile. For multiple accounts on one host, explicitly select the intended username/provider according to that provider's documentation; an author email is not an authentication selector. For GitHub, inspect `git credential-manager github list` and, if needed, use `git credential-manager github login --username <account> --browser`. The user completes authentication privately. Verify the intended account in the authentication flow; never infer it solely from access to a public repository.

Self-hosted providers may require their own OAuth application settings. Reuse existing working settings or obtain the correct values from the owner; never copy another instance's client configuration. `credential.useHttpPath` changes credential lookup scope and must be a deliberate host-specific choice, not a blanket workaround.

Never run `git credential fill` into chat, enable `credential.traceSecrets`, or place tokens in URLs, command arguments, environment snippets or Git config. GCM is for HTTPS; do not configure it as an SSH or signing fix.

## 6. Set up independent signing and accept the result

For existing SSH signing keys on macOS, read [references/ssh-signing.md](references/ssh-signing.md) before importing or changing anything. Do not generate a replacement key, duplicate a private key into `.config`, change fingerprint or disable signing because the password manager is unavailable.

Verify the actual checkout's root, remote, author name/email, signing public key and `gpg.ssh.program` with configuration origins. Check a neighboring workspace for identity isolation. Verify ghq's resolved location rather than only the configuration text. With remote-access authorization, a read-only remote check proves access, not account identity or write permission.

Signing acceptance requires the same fingerprint and a successful cryptographically verified signature with the password-manager socket unavailable, including reloading into a fresh dedicated agent. Use a throwaway signed Git commit outside application repositories if testing the Git integration. Never restart or empty a shared agent containing another session's keys. Report what was installed or changed, actual checks, Keychain interaction or missing prerequisites, and how to restore the affected local files. Leave an incomplete signing change inactive.

## Authoritative references

- [ghq configuration and commands](https://github.com/x-motemen/ghq/blob/master/README.adoc)
- [GCM installation](https://github.com/git-ecosystem/git-credential-manager/blob/main/docs/install.md)
- [GCM configuration](https://github.com/git-ecosystem/git-credential-manager/blob/main/docs/configuration.md)
- [Git conditional includes](https://git-scm.com/docs/git-config#_conditional_includes)
