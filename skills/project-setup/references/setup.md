# Project and Git setup

Set up a workspace or repository only when requested. Adding or reading this skill does not authorize installation, account changes, key export, remote creation or publication. Keep project descriptions, actual hosts/accounts/paths, private keys and local configuration out of Ai-Kit.

For a request limited to project/workspace tool binaries, delegate to [workspace setup](../../toolchain/references/workspace.md) for approved changes with the canonical root and full owning-kit inventory, or [read-only readiness](../../toolchain/references/readiness.md) for a check/report. Do not run the Git/auth/signing setup below. When tools are requested alongside project creation, prepare the complete declared inventory while preserving repository runners and pins. Shared bootstrap prerequisites remain separate; no workflow authentication or service readiness is implied.

When called by `toolchain` for recommended environment setup, reuse its approved projects location and existing matching workspace profiles. Do not show another root/workspace/account or clone-versus-new questionnaire, create a repository, invent a new identity or rewrite every workspace under that root. Install missing Git/ghq/GCM prerequisites, preserve existing routing and verify matching identity/signing settings. The separately selected direnv component owns the shell hook; create `.envrc` only for an explicitly selected project, never for a development root or every checkout. Ask only for a genuinely missing identity/key, private authentication or an actual configuration conflict. The project-creation questions below apply only when a project was explicitly requested.

## 1. Discover before changing

A workspace is the existing root of related independent repository checkouts and shared configuration: its tracker, client/environment settings and scoped Git profile. Ai-Kit's [workspace-local layout](workspace-layout.md) owns `.config/bin`, `libexec`, `git/config` and any unit templates. Reuse the supplied canonical root; do not insert a new layer, initialize it as a repository or invent another profile.

Inspect the OS, shell, installed `git`, `ghq` and `git credential-manager --version`, existing `ghq root --all`, `GHQ_ROOT`, conditional Git includes and the actual workspace profile/configuration paths. For existing layouts, discover legacy root `.gitconfig` consumers before proposing a migration; its presence alone does not authorize one. In a checkout inspect its Git/common directory and remote. Do not dump credentials or secret-bearing helper values.

Reuse the existing development root and directory layout. If none exists, propose a configurable root such as `~/Developments`; never assume its spelling, case or that it must be on the home volume. Ask together only for missing decisions: root/workspace, clone versus new repository, canonical remote and protocol, author identity, authentication account, existing signing-key fingerprint and initial branch policy. Do not infer author name/email from a host login.

Keep these separate: Git author identity, HTTPS authentication handled by GCM, SSH transport authentication, and commit/tag signing. A successful public `ls-remote` does not establish which account was used.

Back up only affected local configuration privately. Preserve unrelated include rules, helper chains, remotes, signing identity, hooks, shells and already configured workspaces. Confirm conflicts before overwriting anything. Check whether files are managed by dotfiles tooling and keep its source consistent when authorized.

## 2. Install missing prerequisites explicitly

Reuse `toolchain` for diagnostics, but do not install its entire inventory for this task. With installation approval, use the [host-native procedure](../../toolchain/references/native-installation.md) for missing Git, ghq and GCM prerequisites. Check bundled tools first and use the official ghq/GCM instructions below for the detected host. GCM installers can change global Git helpers; inspect their effects and obtain explicit approval if an existing helper chain could be reset. One workspace does not authorize a machine-wide credential migration.

## 3. Keep workspace configuration local

Read and apply the shared [workspace-local configuration contract](workspace-layout.md).
Keep workspace commands in `.config/bin`, supporting payloads in
`.config/libexec`, the canonical scoped Git profile in `.config/git/config`,
and only existing/needed unit templates in `.config/systemd`. Root `.envrc`,
mise config/lock, `.omp`, markers and tracker files keep native locations.
Never redirect global `XDG_CONFIG_HOME` or put private keys/credentials here.

New workspace setup follows this layout. A working installation's existing
locations need inventory and all-consumer proof before an explicitly approved
cutover; a tools-only request must not silently migrate Git/auth/services.
Reuse approved user-global stores/launchers instead of duplicating them.

Add an idempotent conditional include to the existing global Git configuration, using an absolute canonical workspace prefix with a trailing slash:

```gitconfig
[includeIf "gitdir:/absolute/development-root/workspace/"]
    path = /absolute/development-root/workspace/.config/git/config
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

Verify `git credential-manager --version` resolves the installed executable, then re-read effective helpers for the intended URL and a nonmatching host/workspace. Reuse the existing supported secure credential store or select one from GCM's documentation for the detected host/session. Do not hardcode another machine's path, globally clear helpers, enable plaintext storage or bypass TLS.

Keep host-specific provider/account settings in the appropriate local profile. For multiple accounts on one host, explicitly select the intended username/provider according to that provider's documentation; an author email is not an authentication selector. For GitHub, inspect `git credential-manager github list` and, if needed, use `git credential-manager github login --username <account> --browser`. The user completes authentication privately. Verify the intended account in the authentication flow; never infer it solely from access to a public repository.

Self-hosted providers may require their own OAuth application settings. Reuse existing working settings or obtain the correct values from the owner; never copy another instance's client configuration. `credential.useHttpPath` changes credential lookup scope and must be a deliberate host-specific choice, not a blanket workaround.

Never run `git credential fill` into chat, enable `credential.traceSecrets`, or place tokens in URLs, command arguments, environment snippets or Git config. GCM is for HTTPS; do not configure it as an SSH or signing fix.

## 6. Set up independent signing and accept the result

For SSH signing, follow [native signing discovery and proof](ssh-signing.md) before importing or changing anything. Reuse an authorized existing signing agent, hardware key or forwarded socket when it is the intended signer. A new independent signing store, certificate enrollment and forwarding changes are separate trust decisions; use the project's existing access procedure and the [native bridge reference](../../toolchain/references/bridges.md#ssh-agent-local-keys-scoped-forwarded-socket) when forwarding is approved. Do not generate a replacement key, duplicate a private key into `.config`, change fingerprint or disable signing.

Verify the actual checkout's root, remote, author name/email, signing public key and `gpg.ssh.program` with configuration origins. Check a neighboring workspace for identity isolation. Verify ghq's resolved location rather than only the configuration text. With remote-access authorization, a read-only remote check proves access, not account identity or write permission.

Signing acceptance requires the same fingerprint and a cryptographically verified signature using the intended signer. If independence from a password-manager socket was requested, verify with that socket unavailable and a fresh dedicated test agent. Test Git integration in a disposable repository, not an application checkout. Never restart or empty a shared agent. Report actual checks and remaining owner actions; leave an incomplete change inactive.

## 7. Configure the project environment

For an explicit workspace setup, configure its existing root environment; do not
create a new wrapper directory or rewrite every child checkout. For a separately
requested repository setup, target that repository while preserving its reviewed
parent-workspace loading. Reuse [the direnv procedure](../../toolchain/references/direnv.md)
and [shared workspace toolchain procedure](../../toolchain/references/workspace.md).
Ai-Kit owns mise bootstrap and activation; the project kit owns inventory and
compatibility, the workspace owns pins/locks/`.envrc`, and repositories retain
their native lockfiles, venv paths, Bundler and other dependency runners.
Workspace `.config` placement and migration checks come from
[the shared layout](workspace-layout.md), not another kit-specific
directory convention. Preserve global credentials/config and native root files.

Inspect an existing `.envrc` and sourced code before changing or allowing it.
Preserve its secret loading, policy wrappers and mise dependency. Merge only
missing approved behavior. The [environment template](../templates/envrc) supplies
optional private `.env` and existing `.venv` handling; it does not select mise
versions, load an arbitrary ancestor, create environments or install dependencies.
When a new child `.envrc` would hide its workspace environment, review the exact
parent first and merge its established loading before child-native overrides.
Do not introduce a second venv or `layout python` for uv projects.

Complete the one-direnv-loader activation and fresh-shell proofs from the shared
procedure. `.venv/bin` and policy wrappers must win over baseline tools. Keep
`.env`, `.venv/` and `.direnv/` ignored and `.envrc` secret-free. Never print private
environment values, broadly trust parent directories, install on entry or
silently re-allow modified clones. Normal use after setup is `cd` then `omp`;
explicit `mise exec` remains the documented automation fallback.

## 8. Register with tmux only when selected

For a workspace being explicitly created or connected, carry forward its local
tmux opt-in if one is already recorded. Otherwise offer an unchecked option
alongside the project setup choices if tmux is configured; no extra prompt if
the user already decided. An unavailable or disabled tmux never blocks project
setup. Machine bootstrap, tools-only setup, ordinary startup and settings
reports do not register projects.

After the canonical root is ready, the agent runs the [native project
registration procedure](../../toolchain/references/tmux.md#workspace-register-one-approved-root).
Keep the real root, name and registration link in the owning local setup or
existing launcher inventory, never in Ai-Kit. Registration is independent of
Git credentials, certificates, signing agents and SSH forwards.

## Authoritative references

- [ghq configuration and commands](https://github.com/x-motemen/ghq/blob/master/README.adoc)
- [GCM installation](https://github.com/git-ecosystem/git-credential-manager/blob/main/docs/install.md)
- [GCM configuration](https://github.com/git-ecosystem/git-credential-manager/blob/main/docs/configuration.md)
- [Git conditional includes](https://git-scm.com/docs/git-config#_conditional_includes)
