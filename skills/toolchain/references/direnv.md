# direnv and project environments

Install only when direnv or explicit project setup was selected. Check/report is read-only. Reuse `direnv version`; on macOS the common helper installs a missing binary with `brew install direnv`. On Linux use the distribution's official package (for example `apt-get install direnv` on Debian/Ubuntu, with permission if required). Other platforms follow the [official installation guide](https://direnv.net/docs/installation.html); never apply a macOS recipe blindly.

## Configure the actual interactive shell

Inspect the shell's effective startup files and existing plugin-managed hooks. Back up only the affected file privately; add one hook only if none is active. Respect XDG_CONFIG_HOME, ZDOTDIR and dotfile management. Do not replace the user's shell configuration or add hooks to unrelated shells.

| Shell | Startup file | Hook |
|---|---|---|
| fish | `${XDG_CONFIG_HOME:-$HOME/.config}/fish/config.fish` | `direnv hook fish \| source` |
| zsh | `${ZDOTDIR:-$HOME}/.zshrc` | `eval "$(direnv hook zsh)"` |
| bash | `~/.bashrc` | `eval "$(direnv hook bash)"` |

For bash login shells ensure the existing profile sources `.bashrc`; preserve its other initialization. Put the hook after PATH/prompt managers as required by the [official shell instructions](https://direnv.net/docs/hook.html). For another shell use its documented hook, not a bash fragment. The hook's eval is direnv's native integration, not permission to evaluate language-selection or other user input.

Verify in a fresh interactive shell: enter an isolated approved project, observe a harmless marker load, leave it and verify the marker and PATH are restored. Do not dump exported secrets. A present binary without an active hook is not ready. An already running agent does not inherit later shell exports: use `direnv exec <project> <command>` for immediate commands and restart OMP from the activated shell for LSP.

## Configure only an explicitly selected project

Workspace toolchain setup owns the existing workspace-root `.envrc` and its automatic mise selection through [the shared procedure](workspace.md); it must not create another root or require users to run mise manually. A workspace request does not authorize a generated `.envrc` in every child. Explicit repository setup can own a repository-local file. For a missing file, [project-setup](../../project-setup/SKILL.md) supplies only the minimal dotenv/existing-venv template. Inspect and preserve any reviewed parent-workspace loading before adding child-native overrides; a nested `.envrc` otherwise hides its ancestor. Machine-only setup installs the binary/hook without writing either kind of environment.

`.envrc` is executable code. Inspect an existing file and its sourced scripts before allowing it; stop for a trust decision if safety cannot be established. Resolve the project to its canonical filesystem path before both allow and exec (including macOS `/var` vs `/private/var` aliases). Allow only the exact reviewed project with `direnv allow <project>`, never whitelist a whole development root. Re-review after changes; do not automatically re-allow a modified clone. Keep `.envrc` secret-free and trackable, with `.env`, `.venv/` and `.direnv/` ignored. Preserve existing env-manager logic and never read private values into chat or Ai-Kit.

The template loads an optional `.env` and prepends an existing `.venv/bin` to PATH without running activation scripts or creating an environment. Verify it both without `.env`/`.venv` and with the project's established environment. Use a boolean interpreter-path check, not printing environment contents. For uv projects resolve dependencies through their existing lockfile only when dependency installation was authorized; do not invoke `layout python` or create a second venv.

Ai-Kit owns the common mise-to-direnv contract; project kits supply tool
inventories, not another environment loader. Preserve an existing working
mise-dependent `.envrc`. The shared procedure defines checked one-shot exports,
watched config files and proof of nested selection, cross-workspace switching
and unload. Do not add a concurrent `mise activate` hook or deprecated `use_mise`
helper. Upstream does not support this combination; report that boundary rather
than removing an authorized working integration or claiming native support.
