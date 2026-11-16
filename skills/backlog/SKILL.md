---
name: backlog
description: Create, plan, update or finalize Backlog.md tasks and product artifacts in their owning tracker.
---
# Backlog.md

Apply `skill://no-ai-slop` silently to authored task notes, comments, decisions and documents; preserve requirements, IDs, evidence and required format. Backlog is the sole task requirements/plan/progress/evidence index. Documents hold product/task artifacts, not generic installation recipes or a parallel memory lifecycle. Hindsight holds authorized durable knowledge/preferences/lessons; Ripwire reads current code.

## Resolve the owning tracker first

Resolve the effective target directory, not merely the terminal's starting directory. Use canonical filesystem paths and directory-component containment, not path prefixes or a repository's display name. A workspace may contain independent nested Git repositories; crossing a Git root does not by itself end the workspace's tracker scope. Tracker ownership does not grant another repository's code conventions or access permissions.

1. Read any explicit tracker location and workspace boundary in the current user/project instructions. Verify that the location exists, has `backlog/config.yml`, and covers the requested work. Do not reuse the last session's tracker or select by matching `project_name` alone.
2. Starting at the effective directory, inspect ancestor directories for an existing `backlog/config.yml`; the nearest owning tracker is the candidate. Respect an explicit workspace boundary: do not continue above it to find another project's tracker. Do not scan sibling projects or the user's home for alternatives.
3. For Git work, identify the checkout using `git -C <directory> rev-parse --show-toplevel` and inspect `git -C <checkout> worktree list --porcelain`. Git lists the primary checkout first. For a linked worktree, resolve its primary checkout and inspect the corresponding primary directory and its ancestors for the tracker, using the same boundary rules. This works when the linked checkout is outside the workspace. Do not write a copied `backlog/` in a linked checkout in place of the primary tracker. If the primary checkout is missing/bare, the relationship cannot be established, or an independent local tracker conflicts with the primary tracker or explicit instructions, stop before mutation and resolve that ownership decision; do not silently choose one.
4. Read the chosen tracker's `backlog/config.yml` and canonical project policy. Use an explicitly named policy; otherwise list its existing Backlog documents and read the workflow/policy document. If ownership or the applicable policy is still ambiguous, ask only for the missing decision. A missing tracker is not permission to run `backlog init`.

Run every CLI operation with the owning tracker root as `cwd`; research and change code in its concrete repository. With MCP, verify that the server targets this same tracker before any write. A server bound to another project is not a fallback: use the native CLI with the correct `cwd` instead. Report the selected tracker when it differs from the effective checkout or when switching projects.

## Read native guidance

Before task work, read `backlog instructions overview`. With MCP, list available resources and read the first workflow overview resource, then follow the guide resources it names. Read schemas before first use; never assume remembered field names or supported custom statuses.

Read the matching guide before its operation:

- `backlog instructions task-creation`: creating or splitting tasks.
- `backlog instructions task-execution`: planning, changing status/assignee, adding progress, or implementation.
- `backlog instructions task-finalization`: checking AC/DoD, writing final summaries, or finishing work.

Read `backlog <command> --help` for unfamiliar CLI operations, including document/config changes. Use native CLI or MCP for task, draft, document, decision, and milestone writes, never direct Markdown edits. Change native configuration only by its supported mechanism; direct config editing is limited to settings for which native guidance explicitly requires it. Do not install custom guards, scripts, or hooks to enforce this workflow.

## Operation routing

After the native overview, read only the relevant local contract and native guide:

- Create/refine/split/search: [creation](references/creation.md), plus native `task-creation` when creating.
- Plan/execute/status/progress/blockers/review handoff: [execution](references/execution.md), plus native `task-execution`.
- Acceptance/final summary/close: [finalization](references/finalization.md), plus native `task-finalization`.
- Documents/configuration: command help and owning product/task policy, not generic tool documentation copies.

## Access and storage boundaries

Task tracking never implicitly authorizes remote access, messages to other people, push, merge, tag, publication, deployment, production access, or Git commits. Keep filesystem-only, remote-operation, auto-commit, signing, and hook protections intact. Do not enable remote operations or bypass hooks to make a tracker command work; report the blocked operation and use an authorized local path when available. Local storage does not imply backup or synchronization. Project policy may impose stricter boundaries, not grant unrelated authority.
