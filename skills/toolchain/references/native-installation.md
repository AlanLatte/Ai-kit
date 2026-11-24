# Install selected tools on the actual host

This is an agent-run procedure, not an installer or a fixed package list. Use it only for an approved setup. Project kits supply their own inventories and access policy; workspace pins stay with the workspace. For pinned workspace tools use the [mise procedure](workspace.md), not a machine package as a substitute for a workspace pin.

1. Determine which machine and user will run the tool. Detect OS, architecture, shell, install permissions and supported package manager. On Linux inspect the distribution release (for example `/etc/os-release` when present), not just the kernel name. Discover the effective executable and version first; reuse a compatible working installation. For a GUI or service, inspect the actual runtime and supervision available on this host.
2. For each approved missing tool, confirm its official package or upstream distribution supports the host, architecture and required version. Prefer the host's established package manager when it provides a suitable package: for example Homebrew on a Mac that uses it, pacman on Arch, apt on Debian/Ubuntu. These are examples, not prerequisites. Verify the actual package name and origin instead of deriving it from the executable. If the native repository cannot satisfy the requirement, choose a supported upstream user-local installation; do not add a repository, package manager or shared runtime without approval.
3. Execute the chosen install and verify the resolved executable/version in the intended shell or runtime. Prefer user-local installs when supported and preserve working manager settings and runtimes. Do not self-elevate or run mass upgrades. If the host needs an administrator, report the exact approved component, missing prerequisite and scoped command for the administrator; continue independent work. An unsupported host or missing package is a per-component result, not a reason to try commands for another OS.
4. Apply only the approved integration and run its linked readiness checks. Package presence is not proof of a configured shell hook, service, connector or authenticated account. Check/report never runs these setup steps.

The common machine inventory includes the following CLI tools. Use the linked upstream install instructions to confirm native package names or select a supported fallback. Always verify the effective invocation after installing.

| Tool | Official installation or release source |
|---|---|
| Python 3 | [Python releases](https://www.python.org/downloads/) |
| uv | [uv installation](https://docs.astral.sh/uv/getting-started/installation/) |
| Docker | [Docker installation](https://docs.docker.com/get-started/get-docker/); choose a host-supported Engine or Desktop only if needed and approved |
| pre-commit | [pre-commit installation](https://pre-commit.com/#installation) |
| Node.js | [Node.js downloads](https://nodejs.org/en/download); honor consumers' runtime constraints |
| Ripwire | [Ripwire releases](https://github.com/redhat-et/ripwire/releases) |
| jq | [jq downloads](https://jqlang.org/download/) |
| ShellCheck | [ShellCheck installation](https://github.com/koalaman/shellcheck#installing) |
| tre | [tre installation](https://github.com/dduan/tre#installation) |

For Git/ghq/GCM, OMP, Backlog, Whiteboard, direnv, LSP and optional tmux, follow the linked procedure in [machine setup](machine-setup.md#2-ask-two-questions-then-act) rather than substituting a different distribution or runtime.
