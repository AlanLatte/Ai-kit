---
name: toolchain
description: Check common machine tools or explicitly set up Hindsight; project-specific dependencies remain in the project kit.
---
# Common toolchain

Resolve commands relative to this skill directory, not the target repository. Diagnostics do not authorize installation.

## Read-only checks

```sh
AI_KIT_CLIENT=omp bash ../../scripts/toolchain.sh report
AI_KIT_CLIENT=omp node ../../scripts/hindsight.mjs report
```

`check` is quiet when ready. `check` and `report` never install tools, start Docker, enable memory or replace configuration. A missing service is not a missing executable. Check the selected API, connected database and bank API without printing tokens.

## Explicit installation

Only after the user requests setup, inspect the report and install the required missing tools. Installing the whole common inventory requires the user's instruction to do so.

```sh
AI_KIT_CLIENT=omp bash ../../scripts/toolchain.sh install
AI_KIT_CLIENT=omp node ../../scripts/hindsight.mjs install
```

The common inventory covers Git, Python, uv, Docker, Node, pre-commit, Ripwire, jq, ShellCheck and tre. Git host clients, deployment tools and project-specific dependencies belong to the applicable project kit.

Hindsight setup requires a running Docker daemon and Compose for local setup. The helper does not start the daemon. Local runtime configuration lives under `${XDG_CONFIG_HOME:-$HOME/.config}/hindsight`; credentials stay in `llm.env`, never in this repository. Missing LLM credentials must be supplied privately by the user; never obtain them from unrelated provider auth.

Preserve existing Compose/env files, containers, volumes, endpoint and credentials. Do not recreate an existing runtime. A selected remote endpoint must not silently become a local service. Explicit installation may enable the native OMP Hindsight backend only if memory was off; preserve another selected backend and follow the diagnostic.

Ai-Kit does not install a Hindsight MCP server in OMP. Models, keys, memory routing and project settings remain local. Check the project kit for additional requirements. Do not change signing, hooks, shell wrappers, statusline or model settings while setting up tools.
