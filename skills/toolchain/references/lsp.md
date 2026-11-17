# Language selection and native LSP setup

This is agent-executed setup, not a list of commands left for the user. Execute only when the LSP component was selected; check/report must not install, start servers or write configuration. Reuse the language answer from the toolchain form. Free text defaults to `go, python`; accept comma/newline/space-separated names, normalize aliases such as golang/py/ts/c++, and deduplicate. Empty text means no languages, not the defaults. Treat names as data, never shell commands, package names or executable paths. Resolve ambiguous names before installing that language; continue independent known languages. Do not restrict users to this document's examples.

## Discover and install

Inspect the OS, existing runtimes, project pins and effective OMP profile plus project LSP configuration. Reuse a healthy compatible server, including project-local installations, rather than adding a competing server or upgrading runtimes. A selected language authorizes its missing server and required official runtime/package-manager dependencies, not replacement of an existing default runtime or arbitrary package installation.

| Language | Default server when none is configured | Installation |
|---|---|---|
| Go | gopls | Reuse a compatible Go; otherwise install Go by the official OS route. With that Go: `go install golang.org/x/tools/gopls@latest`. Respect project/toolchain version pins; select a compatible gopls release if required. |
| Python | basedpyright | Reuse uv or install it by the approved official route, then `uv tool install basedpyright`. Do not install LSP tooling into the application's virtualenv. Reuse working pyright, ty or pylsp instead if already selected. |
| JavaScript / TypeScript | typescript-language-server | Reuse the established Node/package manager; install `typescript-language-server` and compatible `typescript` in a user-owned tools location. Native TypeScript 7 LSP is selected by current OMP automatically; do not wrap it with an incompatible server. |
| Rust | rust-analyzer | Reuse rustup and the selected toolchain: `rustup component add rust-analyzer`; preserve pinned toolchains. |
| C / C++ | clangd | Reuse the existing compiler toolchain or install clangd through the OS's official LLVM packages. Preserve compile_commands.json. |

For any other entered language, consult its maintained server's official installation and OMP's current bundled definitions, choose the supported server and dependencies yourself, install them, then perform the same configuration and readiness checks. Never silently drop an unknown language or claim support without an actual server. If no maintained server exists, report that language as unavailable and finish the others.

Ensure the binary is visible to a fresh shell and OMP: Go uses `go env GOBIN`, falling back to the first GOPATH entry plus `/bin`; uv exposes its tool bin directory through `uv tool dir --bin`. Add only missing user-owned PATH entries using the existing shell convention, or use an absolute command in native LSP configuration. Never use sudo for `go install`, `uv tool install` or npm installs. Do not force-install over an unrelated executable.

## Configure OMP, not a parallel LSP client

Inspect the installed OMP version's native LSP loader, client workspace-folder handling and defaults before writing. Distinguish the OMP launch directory from each repository's language-project root. OMP 18.22.1 filters configured servers by markers in the launch directory and by executable availability before handling a file request. A missing launch-root marker can therefore produce `No language servers configured for this project` even when the requested child repository has its own markers and a working server. Diagnose discovery before reinstalling. No extra config is needed when discovery and the selected server already work. Do not install an LSP MCP server or invent `omp setup lsp`.

Native overrides belong in `lsp.json` under the resolved agent directory for environment-wide setup, or `<project>/.omp/lsp.json` for explicitly project-local setup. Inspect higher-priority root `lsp.*` and other discovered layers too. Merge only selected server fields into the existing file, back it up privately, preserve unrelated servers/settings and resolve conflicting overrides. Do not put LSP definitions in `config.yml` or hardcode another machine's paths. Example for a basedpyright installed outside PATH:

```json
{
  "servers": {
    "basedpyright": {
      "command": "/absolute/user-tools/bin/basedpyright-langserver",
      "args": ["--stdio"]
    }
  }
}
```

Bundled server overrides inherit fileTypes/rootMarkers. For a server absent from bundled defaults, provide its real `command`, argument array, `fileTypes`, `rootMarkers` and languageId if required. If multiple primary servers resolve for the same language, preserve a deliberate existing setup; when adding a newly selected primary, resolve any conflict rather than disabling unrelated servers silently. Do not change lint/format policies as an installation side effect.

## Sessions launched from a multi-repository workspace

Keep the user's normal entrypoint: activate the existing workspace and run `omp` there to work across its repositories. Do not require separate repository sessions or change the launcher as an LSP fix. A shell `cd` inside a tool does not change the running session's LSP configuration root or inherited PATH.

During approved LSP configuration:

1. Inspect the actual launch directory, existing workspace marker, selected languages, effective LSP layers and representative child repositories, including linked worktrees. Check marker filtering separately from binary lookup: a server installed only in a child's environment may not resolve from the workspace. Reuse its existing absolute executable path when needed; do not activate one application's venv for the whole workspace.
2. Merge a workspace-local `.omp/lsp.json` override for each selected server that fails discovery. Append the existing workspace marker to that server's effective `rootMarkers`, retaining its language markers. Arrays are replaced, not appended, by OMP's server-field merge. Do not create a fake `pyproject.toml`, `package.json` or `go.mod` in the coordination root; do not enable every installed language with an unconditional marker or write project paths into the user-wide profile or Ai-Kit.
3. Keep server discovery separate from analysis scope. OMP 18.22.1 initializes the client at the session cwd and, before opening a file, adds its owning Git checkout as a workspace folder when the server advertises workspace-folder change notifications. Verify that capability and actual folder delivery for the installed version/server; do not assume child configs are loaded merely because the server starts. Preserve repository-native configuration and independent roots, interpreters, dependencies and import paths.
4. For Python, verify each relevant checkout's source roots, import roots and existing `.venv`, including worktrees with a different environment. Reuse its own Pyright/basedpyright configuration through verified workspace-folder handling. Do not make the whole coordination root one Python project, collect every checkout into one `extraPaths`, or assign one child's `python.pythonPath`/venv to all Python repositories. `executionEnvironments` separates analysis roots but is not by itself proof of independent virtualenv selection. If additional local overrides are necessary, use only settings supported by the installed server and prove their per-repository effect without changing application code, locks or global settings.
5. If the client/server cannot represent the required independent projects, report that exact limitation rather than claiming readiness from marker changes. Do not silently replace the user's workspace workflow with per-repository OMP processes or a custom LSP bridge.

The workspace owns concrete markers, paths and local overrides; Ai-Kit owns this procedure. A marker-only override is a discovery fix, not proof of correct Python imports or multi-root isolation.

## Prove readiness

Check executable versions (Go: `gopls version`; Python: `basedpyright --version`) and dependency compatibility. Version output alone is not readiness. Start OMP from the user's actual activated launch directory, reload all native LSP configuration with `lsp` action `reload`, file `"*"`, and exercise a real child-repository file without changing session cwd. A file-specific reload does not substitute for rediscovering the workspace configuration.

Verify hover returns the expected type, definition follows a repository-local import to the correct file, and an installed dependency resolves through that repository's interpreter. Check another independent repository and any relevant linked worktree; same-named modules must not resolve into the wrong checkout. For Python, also inspect import diagnostics and the selected environment; for Go, verify the selected module/toolchain. Do not suppress missing-import diagnostics to make the check pass.

Without an approved application target, use an isolated workspace fixture outside application repositories: an existing-style workspace marker, two independent Git checkouts with native language markers and distinguishable imported symbols, and separate Python environments when testing interpreter isolation. Run from the parent workspace through the actual OMP LSP tool; a direct language-server protocol check proves server behavior only, not OMP discovery or folder routing. Remove the fixture afterward. Do not modify an application just to make discovery work, print secrets or send model requests as a health check.

Repeat read-only discovery to confirm configuration is reused without rewrites. Report each language separately: reused/installed, actual launch root, native config and analysis scope, passed functional checks, failed or unverified repository/environment cases. An installed server with no matching launch-root marker is installed, not workspace-ready. Restart affected OMP sessions when PATH/profile changes cannot be reloaded.

## Authoritative references

- [OMP 18.22.1 native configuration loader](https://github.com/can1357/oh-my-pi/blob/v18.22.1/packages/coding-agent/src/lsp/config.ts)
- [OMP 18.22.1 bundled server definitions](https://github.com/can1357/oh-my-pi/blob/v18.22.1/packages/coding-agent/src/lsp/defaults.json)
- [OMP 18.22.1 client and checkout workspace folders](https://github.com/can1357/oh-my-pi/blob/v18.22.1/packages/coding-agent/src/lsp/client.ts)
- [basedpyright project and execution environment configuration](https://docs.basedpyright.com/latest/configuration/config-files/)
- [basedpyright language-server settings](https://docs.basedpyright.com/latest/configuration/language-server-settings/)
- [gopls installation](https://go.dev/gopls/)
- [basedpyright installation](https://docs.basedpyright.com/latest/installation/)
- [typescript-language-server](https://github.com/typescript-language-server/typescript-language-server)
- [rust-analyzer installation](https://rust-analyzer.github.io/book/installation.html)
- [clangd installation](https://clangd.llvm.org/installation)
