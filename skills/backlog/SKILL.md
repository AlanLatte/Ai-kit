---
name: backlog
description: "Use for Backlog.md task and document work: find existing work, create or refine tasks, plan execution, record blockers and evidence, and prepare acceptance. Resolve the owning tracker before operating in nested repositories or linked worktrees; use that tracker's policy and native CLI or MCP."
---

# Backlog.md

Apply `skill://no-ai-slop` silently to authored task titles, descriptions, progress and status-transition notes, comments, decisions, documents and summaries. Reuse the available draft/context; preserve acceptance criteria, commitments, evidence, risks and the tracker's required language, metadata and format. Do not append an editing report or treat prose editing as permission to write or publish.

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

## Find and define work

1. Search meaningful words and existing domain labels before creating anything. Inspect matching open records and their parents; reuse the appropriate task rather than duplicate it. Use focused filters and the native pagination hints instead of listing the whole tracker. Multiple label filters are AND.
2. Keep the description a short, stable account of the outcome, why it matters, and scope; aim for 1-3 sentences without dropping substantive requirements. Add only confirmed context, unknowns and sources needed to act; keep detailed AC, plans and progress in their native fields rather than repeating them. Follow the project's title language and required format. Do not turn an unresearched implementation idea into a requirement or create speculative follow-up work without authorization.
3. Apply the project's required type, priority, due date, labels, initial status, and other metadata. Read those values from policy/config, not another project's defaults. Do not invent native defaults or treat a deadline as a priority. If a required decision is missing, ask for the missing decisions together before saving.
4. Dates come from an agreed commitment or confirmed milestone, with calculation assumptions recorded. Never fabricate dates, silently roll overdue work forward, or put a child beyond its parent's deadline without resolving the conflict. Use only confirmed assignee identifiers or an explicitly agreed configured default; Git identity is not an assignee. Establish the executor before execution, not necessarily before initial recording.
5. Split initiatives into independently verifiable deliverables, not daily/file/test chores. Use an existing parent ID and real prerequisite dependencies; identify each prerequisite's output. Avoid cycles, including a parent depending on its own children. Unresolved or ambiguous dependency IDs are not satisfied prerequisites.
6. Acceptance criteria describe observable outcomes, relevant edge cases and safety boundaries. Preserve every owner requirement. Keep AC distinct from inherited Definition of Done. For research/docs, evidence can be a sourced document with conclusions and explicit unknowns; do not require code changes just to close it.
7. Create/refine through native tools and inspect the returned metadata, including parent, dependencies, date, priority, labels, and assignee. A metadata correction alone does not authorize implementation or a status transition. Report IDs, changed commitments, and unresolved assumptions briefly.

## Execute and hand off

Read the task, references, dependencies, blockers, and project policy before mutation. Use the configured active status and confirmed executor. Research the actual current system, then record the implementation plan before implementation. Material scope/design decisions and project-required approvals remain with the owner; routine authorized implementation does not need another approval ritual.

Keep the task as the requirements/plan/progress/evidence/acceptance record. Notes hold progress and verification; comments hold discussion and changes to decisions, priority, or commitments. Link the exact repository, relevant commits/MR and explanatory documents or Whiteboard. Do not store secrets or claim deployment/production acceptance from local source.

### Record each status transition

Before every actual status change, read the latest task and applicable policy; use the configured statuses. Append one concise delta to native notes: `<old status> -> <new status>: <what changed and observed result>; evidence: <exact reference>; next: <action/blocker or final disposition>`. Follow the project's required format if different. Cover starts, review/release handoffs, completion, reopening, blocking and cancellation where they change status. Record the reason for reopening or stopping; neither blockage nor cancellation is Done.

Reference observed checks/results, commits, reviews or decisions precisely; if evidence is unavailable or a check was not run, say so rather than inventing it. Preserve earlier notes and meaningful progress between transitions. Summarize the new delta, not the whole task, chat transcript or raw logs; do not duplicate a transition or record a no-op as one. A genuine return to a prior status gets a new observed delta.

When supported, submit status and appended notes in the same native edit: `backlog task edit <ID> --status "<new status>" --append-notes "<delta>"`. Otherwise use the supported native operations and report any partial result; do not claim atomicity. Inspect the returned task or read it back to confirm both status and retained notes. After an error or uncertain result, inspect the current record before retrying to avoid duplicate notes.

Use the project's blocker representation with reason, unblocker, next action, and recheck date; remove it when resolved. Dependency-only `--ready` is not proof that review, blockers, access, or operational approvals permit work. Respect the project's work-in-progress limit and explicit ownership for parallel slices.

Use the configured review/release states only with their documented evidence and approvals. Review readiness, reviewer approval, release readiness, publication, deployment, and final acceptance are different facts. If MCP rejects a configured custom status, use native `backlog task edit <ID> --status <configured-status>` from the owning tracker, not a substitute label or a direct record edit.

Include the project's required review material in the task and owner handoff. Where policy requires tuicr, provide a copy-paste command using the real code repository and exact task commit range: `cd /absolute/repo/path && tuicr -r 'BASE..HEAD'`; use `COMMIT^..COMMIT` for one commit, not an accumulated branch diff. Explain non-applicability for non-code work. Do not invent a commit range for uncommitted changes.

## Close on evidence

Read finalization guidance and check every AC and applicable DoD against observed evidence. Record actual checks, results, scope, limitations, and genuine non-applicability. Do not check a box because code exists, a check was proposed, or an approval is expected; non-applicability cannot waive an explicit requirement. Complete required review, acceptance, and delivery before the configured final status. Close a parent only after its children and its own acceptance.

Write the final summary as one short paragraph or at most three compact bullets: outcome, verification and remaining limitations. Link evidence already recorded rather than repeating the progression. Include the final status transition in notes and retain finished records until separately authorized archival. Cancellation, duplication, or blockage is not successful completion; preserve the reason and history instead of marking it Done or deleting it.

## Access and storage boundaries

Task tracking never implicitly authorizes remote access, messages to other people, push, merge, tag, publication, deployment, production access, or Git commits. Keep filesystem-only, remote-operation, auto-commit, signing, and hook protections intact. Do not enable remote operations or bypass hooks to make a tracker command work; report the blocked operation and use an authorized local path when available. Local storage does not imply backup or synchronization. Project policy may impose stricter boundaries, not grant unrelated authority.
