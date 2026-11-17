---
name: backlog
description: Create/configure Backlog.md trackers; format, label and maintain tasks and evidence-backed statuses in their owning tracker.
---
# Backlog.md

Backlog is the sole task requirements/plan/progress/evidence index. Documents hold product/task artifacts, not generic installation recipes or a parallel memory lifecycle. Hindsight holds authorized durable knowledge/preferences/lessons; Ripwire reads current code. For drafting or substantially revising a substantive task document or plan, use `skill://no-ai-slop` once; short status, AC and evidence updates do not independently require it. Preserve requirements, IDs, evidence and required format.

## Resolve the owning tracker first

Resolve the effective target directory, not merely the terminal's starting directory. Use canonical filesystem paths and directory-component containment, not path prefixes or a repository's display name. A workspace may contain independent nested Git repositories; crossing a Git root does not by itself end the workspace's tracker scope. Tracker ownership does not grant another repository's code conventions or access permissions.

1. Read any explicit tracker location and workspace boundary in the current user/project instructions. Verify the effective config and task directory exist and cover the work. Native layouts may use `backlog/config.yml`, `.backlog/config.yml`, or `backlog.config.yml` pointing to a project-relative directory. Do not reuse the last session's tracker or select by matching `project_name` alone.
2. Starting at the effective directory, inspect ancestor directories for supported tracker configuration; the nearest owning tracker is the candidate. Resolve any root config's directory using installed native guidance, not a guessed `backlog/` path. Respect an explicit workspace boundary: do not continue above it to find another project's tracker. Do not scan sibling projects or the user's home for alternatives.
3. For Git work, identify the checkout using `git -C <directory> rev-parse --show-toplevel` and inspect `git -C <checkout> worktree list --porcelain`. Git lists the primary checkout first. For a linked worktree, resolve its primary checkout and inspect the corresponding primary directory and its ancestors for the tracker, using the same boundary rules. This works when the linked checkout is outside the workspace. Do not write a copied `backlog/` in a linked checkout in place of the primary tracker. If the primary checkout is missing/bare, the relationship cannot be established, or an independent local tracker conflicts with the primary tracker or explicit instructions, stop before mutation and resolve that ownership decision; do not silently choose one.
4. Read the chosen tracker's effective configuration and canonical project policy. Use an explicitly named policy; otherwise list its existing Backlog documents and read the workflow/policy document. If ownership or the applicable policy is still ambiguous, ask only for the missing decision. A missing tracker is not permission to run `backlog init`.

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

- Create/configure a tracker or change its workflow: [setup](references/setup.md), plus installed init/config help and existing project policy.
- Create/refine/split/search, task formatting or tags/labels: [creation](references/creation.md), plus native `task-creation` when creating.
- Plan/execute/status/progress/blockers/review handoff: [execution](references/execution.md), plus native `task-execution`.
- Acceptance/final summary/close: [finalization](references/finalization.md), plus native `task-finalization`.
- Documents/configuration: command help and owning product/task policy, not generic tool documentation copies.

## Keep task state current

The agent executing assigned work owns its tracker updates, not just its chat report or session todo. Read the latest record at pickup/resume; update at actual starts, meaningful evidence or scope changes, review/testing/release handoffs, blockers, reopening and acceptance. Before handing off or ending a work session, reconcile status, AC/DoD evidence, notes and next owner/action. Do not wait for the user to remind you, and do not move tasks owned by another executor without assignment.

Use configured states with their entry evidence, never infer deployment or approval from a commit, passing tests or elapsed time. Implementation complete is not automatically Done. If the tracker is unavailable or a write fails, report the task ID, last verified state, intended update and blocker; do not claim it was saved. Reconcile once access returns, reading first to avoid duplicate history. Do not start timers, polling, background updates or autonomous deployments to keep status current.

## Access and storage boundaries

Task tracking never implicitly authorizes remote access, messages to other people, push, merge, tag, publication, deployment, production access, or Git commits. Keep filesystem-only, remote-operation, auto-commit, signing, and hook protections intact. Do not enable remote operations or bypass hooks to make a tracker command work; report the blocked operation and use an authorized local path when available. Local storage does not imply backup or synchronization. Project policy may impose stricter boundaries, not grant unrelated authority.
