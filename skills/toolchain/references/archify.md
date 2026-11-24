# Archify setup

Archify is a third-party Agent Skill with a Node.js CLI for interactive HTML diagrams and explainers. It is not an MCP server or an OS package. Run setup only for an approved target client and scope; a report or a workspace tool inventory does not install it. Default to the current client and the scope already approved in machine or project setup. Do not install into other clients or profiles by association.

## Install the selected skill

1. Discover the effective skill paths and any existing `archify` installation for the target. Reuse a working copy; stop on unmanaged files or conflicting copies rather than replacing them. Check the selected release's Node.js requirement (`>=18` for v3.3.0). Reuse a compatible runtime or install the approved prerequisite through [host-native installation](native-installation.md). No `npm install` is needed inside the released skill.
2. Stage `archify.zip` from an approved stable [upstream release](https://github.com/tt-a1i/archify/releases) in private scratch. Use the published asset digest, check that entries stay under the `archify/` directory without escaping or linking outside it, and review the staged files before activation. Follow `skill://ripwire-security-scan` for the security check where available; inspect `SKILL.md`, the scripts the setup or verification will run, and their dependencies. Do not install if a critical finding remains; resolve warnings with the owner. Install only the reviewed release and not the optional `archify-pr` companion.
3. Use the target client's documented skill location. For OMP, copy the whole reviewed `archify/` directory into `<effective-agent-dir>/skills/` for user scope (`omp config path` resolves the agent directory) or `<approved-workspace>/.omp/skills/` for project scope. The resulting path ends in `skills/archify/SKILL.md`; `bin/`, references and assets stay beside it. Do not use a Skillshare registry command for the ZIP or select a different client on OMP's behalf. For clients listed by [Archify's upstream setup](https://raw.githubusercontent.com/tt-a1i/archify/main/llms.txt), follow their supported location and scope; do not switch to a different, unreviewed installer payload. If a client's installation route cannot be verified, report that client as unsupported rather than guessing a path.
4. Keep artifact generation on demand. In OMP, add `archify` to the effective scope's existing `skills.manualSkills` patterns without removing other entries; invoke it explicitly with `/skill:archify` or `skill://archify`. In a client using upstream's rules setting, merge `[archify explainer: on-demand]` into the approved instruction scope, preserving other rules. Do not add startup hooks, background update jobs or a new service. If a client cannot enforce the intended scope without changing broader settings, stop before activation and report the limitation.

## Verify without a model turn

From a clean scratch directory, run the installed CLI with the selected Node.js executable:

```sh
node "$archify_dir/bin/archify.mjs" doctor
```

`archify_dir` is the actual installed directory, not the checkout or current working directory. Then start a fresh target client and verify that it resolves this exact copy and is configured for explicit invocation. In OMP, inspect `omp skill list --json` or read `skill://archify` using the same profile and workspace; do not send a prompt to a model just to check discovery. Report CLI and client discovery separately. Do not generate a diagram, scan a repository, publish anything, or update other installations during setup. The doctor check does not prove browser-based export or diagram rendering.
