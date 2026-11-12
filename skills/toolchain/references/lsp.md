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

Inspect the installed OMP version's native LSP loader and defaults before writing. OMP 18.19.0 already defines gopls and basedpyright; it discovers servers from project root markers and available binaries, including `.venv/bin` and `node_modules/.bin`. No extra config is needed when discovery and the selected server already work. Do not install an LSP MCP server or invent `omp setup lsp`.

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

## Prove readiness

Check executable versions (Go: `gopls version`; Python: `basedpyright --version`) and dependency compatibility. Version output alone is not readiness. Start OMP from the project's activated direnv shell, reload native LSP configuration and request symbols or hover on a real source file. Without an approved project, create an isolated fixture outside application repositories with the server's actual root marker (Go: go.mod; Python: pyproject.toml), harmless typed source and a known symbol. Use the native LSP tool to verify the expected symbol/type, then remove the fixture. Do not modify an application just to make discovery work, print secrets or send model requests as a health check.

Verify the Python server resolves the established project interpreter/imports, and Go uses the selected module/toolchain. An installed server with no matching root marker is installed, not project-ready. Repeat read-only discovery to confirm configuration is reused without rewrites. Report each language separately: reused/installed, native discovery/config scope, passed functional check, failed or waiting on private input/OS permissions. Restart affected OMP sessions when PATH/profile changes cannot be reloaded.

## Authoritative references

- [OMP 18.19.0 native configuration loader](https://github.com/can1357/oh-my-pi/blob/v18.19.0/packages/coding-agent/src/lsp/config.ts)
- [OMP 18.19.0 bundled server definitions](https://github.com/can1357/oh-my-pi/blob/v18.19.0/packages/coding-agent/src/lsp/defaults.json)
- [gopls installation](https://go.dev/gopls/)
- [basedpyright installation](https://docs.basedpyright.com/latest/installation/)
- [typescript-language-server](https://github.com/typescript-language-server/typescript-language-server)
- [rust-analyzer installation](https://rust-analyzer.github.io/book/installation.html)
- [clangd installation](https://clangd.llvm.org/installation)
