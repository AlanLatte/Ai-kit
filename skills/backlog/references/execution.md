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
