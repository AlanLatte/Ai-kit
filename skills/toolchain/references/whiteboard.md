# Whiteboard setup

Ask for Desktop versus headless only after Whiteboard is selected. Reuse an installed official CLI/app and its intended stable instance; do not select preview/dev, replace its state, or start a backend during inventory. A Desktop-managed CLI may work with its own runtime even if system Node is incompatible.

## Desktop: install and operate without manual PATH setup

On macOS with approved Homebrew dependencies:

```sh
brew install --cask devdotfast/tap/whiteboard
```

The official alternative is the correct platform download from [dev.fast/install](https://dev.fast/install). Reuse the actual bundle location; do not assume every user installed into `/Applications`. Determine the installed version after installation because a package-manager cask may lag the app's release. Never use `--zap` or delete existing application state.

If `whiteboard` is already on PATH and is the intended official CLI, use it. Otherwise locate the installed Desktop's executable and bundled `review-runtime/dist/cli.js`. This is the official shim's bootstrap mechanism and needs no system Node. Validate both paths; do not import internal functions or guess hashed JavaScript filenames. A parameterized macOS invocation is:

```sh
ELECTRON_RUN_AS_NODE=1 "$app/Contents/MacOS/Whiteboard" \
  "$app/Contents/Resources/app/review-runtime/dist/cli.js" version --json
```

Use those discovered executable/script paths for every following CLI command and, if selected, the local MCP definition. Keep `ELECTRON_RUN_AS_NODE=1` confined to that child or MCP server env. Do not copy another machine's personalized shim. There is no verified non-UI command to install Desktop's managed PATH shim; do not invoke private UI endpoints or mistake the app's `bin/code` for its review CLI. Direct bundled invocation provides automatic agent setup without requiring the user to click a PATH installer.

When backend startup is included in the selected plan, run `app launch --json` through that invocation. An existing running backend is reused. Do not repeatedly launch or steal its state directory. Desktop is needed for a local canvas UI, not for headless authoring.

## Headless: install a compatible CLI runtime

The verified standalone package is `@dev.fast/whiteboard`; version0.5.2 requires Node `>=24 <25`, not arbitrary24+. Check the selected package's current engines before choosing a version. The official npm command with an approved compatible runtime is:

```sh
npm install --global @dev.fast/whiteboard
```

Do not replace a Desktop-managed shim or another default Node to make this command pass. If the existing Node is incompatible, disclose that dependency conflict. Install/reuse a separate compatible Node runtime only with approval (on macOS `brew install node@24` is an available route). Use its absolute Node/npm paths and a dedicated private installation prefix rather than silently changing the machine-wide Node/PATH. Resolve the installed package's `bin.whiteboard` entry from its package metadata; invoke it through that Node executable. Record the resolved invocation privately and use it consistently for server startup, status and MCP. Do not claim the ordinary PATH command is ready when only a managed invocation is configured.

When installing into a private prefix, run npm with the chosen runtime in that child process, for example `env PATH="$node_bin:$PATH" "$node_bin/npm" install --prefix "$tool_prefix" @dev.fast/whiteboard`. An absolute npm path alone does not override its env-node shebang. Invoke the resolved entry with `"$node_bin/node" "$cli_entry" ...`. Save only the non-secret resolved command/args/runtime/state-directory metadata under `${XDG_CONFIG_HOME:-$HOME/.config}/ai-kit/tools.json`, merging the selected component without replacing others, so future inventory can reuse it even when it is not on PATH. Never put credentials there.

For a selected new headless server, ask for a private state directory. Reuse a working existing directory/server; never share a directory between independent servers or reuse Desktop storage for a second process. Through the resolved CLI invocation run:

```text
server start --state-dir <approved-state-directory> --detach --json
server status --state-dir <approved-state-directory> --json
```

Startup is a disclosed configuration action, not a read-only probe. Stop on a storage-ownership conflict, do not remove lock/discovery files to force access. Do not enable hosted storage, trace uploads, optional hooks or other services by association.

## MCP and actual readiness

Only add the connector if the user also selected it. The transport is stdio, with resolved CLI command plus `mcp` args. For headless add the approved state selection: `whiteboard --state-dir <directory> mcp`. `mcp` is an adapter and does not itself start the backend.

For a Desktop without a PATH shim, the connector command is its discovered executable, args are `[<bundled-cli-path>, "mcp"]`, env is `{"ELECTRON_RUN_AS_NODE":"1"}`. For managed standalone Node, use that Node executable with `[<resolved-cli-entry>, ...state-args, "mcp"]`. These paths belong only in local client configuration, never Ai-Kit. Follow [OMP/MCP setup](omp-mcp.md) to preserve existing servers and auth.

Verify the version and actual intended backend. Headless `server status --json` must return `event: server.status` and `ready: true`, not just successful process exit. For a connected Desktop/MCP, call `whiteboard_status` before choosing/changing an instance, then require a successful backend-backed `session_capabilities` result without an MCP tool error. Status and `session_get_instructions` may both return offline recovery information successfully; neither proves a running backend, and a handshake is insufficient. Do not author a review or upload a trace as a health check. Restart affected MCP clients after an app update; an update may explicitly request reconnect/restart.

## Sources

- [Official installation](https://dev.fast/install)
- [Quick start](https://github.com/devdotfast/whiteboard/blob/main/docs/quick-start.md)
- [CLI package and runtime](https://github.com/devdotfast/whiteboard/blob/main/packages/review/README.md)
- [Official Desktop CLI bootstrap implementation](https://github.com/devdotfast/whiteboard/blob/main/packages/review/src/cli-install.ts)
- [Agent connection](https://github.com/devdotfast/whiteboard/blob/main/docs/connect-your-agent.md)
