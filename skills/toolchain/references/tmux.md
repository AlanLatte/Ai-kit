# Optional tmux setup

Use this procedure only if the user selected tmux or asked to register an existing workspace with an already configured tmux. tmux is not part of recommended machine setup and is never required for project, Git, OMP or bridge setup. If it was skipped, keep normal shell use and leave existing tmux files and sessions alone.

## Machine: install and configure once per user

1. Discover the OS, package manager, shell, terminal, effective `tmux -V`, any launcher and the intended socket/config. Reuse a working installation and supported native configuration. If missing and approved, follow the [native installation guide](https://github.com/tmux/tmux/wiki/Installing) and use the host's package manager when it has a suitable package. Do not add another package manager, daemon, plugin manager or shell startup hook.
2. Preserve a working configuration. For a new setup, use the local native config path documented by the installed tmux, honoring the existing dotfile manager. If there is no existing preference, this is a small native baseline:

   ```tmux
   set -g mouse on
   set -g base-index 1
   set -g status-right 'Prefix+s: sessions | Prefix+c: window'
   ```

   Keep existing theme, bindings and status if present; use the effective prefix in any new hint. No project names, startup commands, agent sockets or credentials belong in the shared baseline. Do not change terminal passthrough or clipboard permissions as part of tmux setup.
3. Before applying a new config to a live server, load it with the installed tmux on a private temporary socket and verify the intended options and status in an attached client. For an approved change, use native `source-file` on the intended socket or let the next server start read the config. Do not kill or restart existing tmux servers. Remove only the temporary test server and its scratch files.

## Workspace: register one approved root

During [project setup](../../project-setup/references/setup.md#8-register-with-tmux-only-when-selected), take the canonical workspace root and a stable local session name from the caller's existing project setup. Keep both local. Use the workspace root, not every nested checkout. Do not enumerate all home directories, infer projects from repositories, or register anything from a startup hook.

- If the user already has a project-aware tmux launcher or local session inventory, use its documented registration method and keep its socket and naming rules. Do not replace it with a second launcher or registry.
- Otherwise use native tmux on the intended user socket. In the examples below, `session_name` and `workspace_root` are validated values supplied by the caller, not shell expressions. Use a name containing only letters, digits, underscores or hyphens. Check for an exact match first:

  ```sh
  tmux has-session -t "=$session_name"
  tmux display-message -p -t "=$session_name:" '#{session_path}'
  ```

  If it exists for the same canonical root, reuse it. If it points to a different root or the socket is inaccessible, resolve the conflict; never rename or replace a live session. If absent, register it:

  ```sh
  tmux new-session -d -s "$session_name" -c "$workspace_root"
  tmux display-message -p -t "=$session_name:" '#{session_path}'
  ```

  Run the readback after each setup and verify the exact canonical root. A detached session starts the user's shell; do not send keys, auto-launch OMP, enroll credentials or add forwards. When the user wants to open it, use `tmux attach-session -t "=$session_name"` from outside tmux or `tmux switch-client -t "=$session_name"` from the same server. Do not switch the user's active client during registration.
- Record the selected name/root and this procedure's link in the existing local project setup record, if present. Native sessions survive detach, not server restart; recreate explicitly from the same local values when needed. Persistence across restart or cwd-based routing requires an existing supported launcher or a separately requested change, not a custom Ai-Kit service.

If tmux is absent or disabled, skip registration and report it separately; do not fail workspace setup or install tmux by implication. On local/remote setups do the selected work on the machine running tmux, not necessarily the terminal client.
