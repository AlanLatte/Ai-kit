# Backlog.md setup

Separate the CLI, tracker initialization and MCP integration. The selector must disclose which of these will change. Installing Backlog.md does not authorize `backlog init`, adopting another workspace's task policy or pinning one private tracker globally.

## Install only when absent

On macOS with an approved Homebrew dependency:

```sh
brew install backlog-md
backlog --version
```

The official npm alternative is `npm install --global backlog.md`, with an approved compatible Node/npm runtime. The package is `backlog.md`, the executable is `backlog`. Do not install another Bun or a second distribution merely because the existing executable came from Homebrew. Preserve existing trackers and use their local CLI policy.

## Resolve or explicitly create a tracker

Read the common `backlog` skill. Resolve the owning tracker from the user's chosen workspace, existing configuration and linked-worktree relationship before operating. Inspect its config and project policy without exporting them into Ai-Kit.

If a tracker exists, do not rerun init or overwrite labels, statuses, due dates, DoD, integration instructions or git/remote-operation flags. Verify with a read-only search/list from its root. If no tracker exists, ask whether the user actually wants one and at which exact root. On explicit approval read `backlog init --help` for the installed version. A non-invasive new tracker can use:

```sh
backlog init "Approved tracker name" --defaults --integration-mode none --no-git
```

This is an example with a name to replace, not a command to execute without a decision. Choose Git integration, statuses/labels and task policy from the user's requirements; do not copy a private project template or silently generate agent instruction files. Never initialize the personal plugin checkout as a place to store the user's project descriptions.

## Configure only a selected MCP connector

Use [OMP/MCP setup](omp-mcp.md). Backlog's transport is stdio:

```text
backlog mcp start
```

Without explicit cwd binding, this server follows client MCP roots. An initialized workspace tracker is not automatically found for every nested repo: MCP root discovery checks the root itself, unlike CLI ancestor lookup. An external worktree also need not expose its primary checkout's tracker automatically.

For a fixed, approved workspace tracker, pass `--cwd <absolute-tracker-root>` in the local connector's argument array or set its `BACKLOG_CWD`. Both pin the tracker and disable following client roots. Scope that connector to the intended client/project; do not pin one workspace tracker into a global connector used by unrelated workspaces. Preserve an existing generic following-roots connector if the selected target already works.

Verify initialize/tools-list and read `backlog://workflow/overview` for the intended tracker. `backlog://init-required` means the connector started but no tracker is ready; it is not permission to initialize one. A successful `backlog --version` or MCP handshake does not prove task ownership. Do not create a real task as a setup health check or write into another tracker's MCP.

## Sources

- [Official install and CLI](https://github.com/MrLesk/Backlog.md/blob/v1.55.3/README.md)
- [MCP cwd and configuration](https://github.com/MrLesk/Backlog.md/blob/v1.55.3/src/commands/mcp.ts)
- [MCP roots and readiness](https://github.com/MrLesk/Backlog.md/blob/v1.55.3/src/mcp/server.ts)
