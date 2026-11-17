## Execute and hand off

Read the task, references, dependencies, blockers, and project policy before mutation. Use the configured active status and confirmed executor. Research the actual current system, then record the implementation plan before implementation. Material scope/design decisions and project-required approvals remain with the owner; routine authorized implementation does not need another approval ritual.

Keep the task as the requirements/plan/progress/evidence/acceptance record. Notes hold progress and verification; comments hold discussion and changes to decisions, priority, or commitments. Link the exact repository, relevant commits/MR and explanatory documents or Whiteboard. Do not store secrets or claim deployment/production acceptance from local source.

### Maintain the actual lifecycle

At pickup or resume, compare the latest task with observed work, review and delivery evidence; do not reset it to In Progress merely because a new session began. Activate it before beginning assigned execution, then update useful progress as it happens, not only at final response. Keep one executor responsible for reconciling delegated results; a child agent saying "done" does not close the parent.

Map the configured states to their project-defined entry gates. For a workflow using the following names:

| State | Required fact before entering |
|---|---|
| To Do | Work is recorded but has not started; requirements and known prerequisites are captured. |
| In Progress | Assigned execution has started; record the executor and researched plan before implementation. |
| Review | Implementation and required checks are complete, changes are pushed and the working MR/PR is open for the user's implementation review. Record the exact artifact/range and limitations. This is not reviewer approval. |
| Delivery to Dev | Owner review/continuation is accepted; release MR/PR, main builds/images, ops dev pins or owner deployment actions remain. No repeat implementation review. Keep this state until actual dev deployment is confirmed. |
| On Dev | Deployment to the actual development environment is confirmed; record version/commit, environment, deployment evidence and testing owner/next action. A merge or successful build is insufficient. |
| Ready for Release | Required review and dev/testing acceptance are recorded for the release candidate; name the candidate, evidence and remaining authorized release action. It is not already released. |
| Done | All applicable AC/DoD, delivery and final acceptance gates are evidenced under project policy; read finalization guidance first. |

These are semantic examples, not permission to add or rename states, require a dev deployment for documentation, or bypass the project's ordering. Use the existing workflow and applicable gates for non-code work. A queue means work is waiting; do not invent approval, successful testing or deployment just to advance a column. If required gates have no state representation, retain the last truthful state, record the missing gate and request a workflow decision instead of claiming completion.

When review finds defects, tests fail, a release is rolled back or acceptance is withdrawn, move back to the appropriate configured state with the reason and next action. Uncheck only AC/DoD invalidated by that evidence; retain valid proof. On reopening, remove or revise a stale final summary through native tools so it no longer claims current completion, preserving the earlier outcome in history. For a blocker without a dedicated state, retain the last truthful state and record the blocker explicitly. A fix on a branch does not put the task back On Dev until redeployment is verified.

Before handoff or ending the session, save the achieved state, meaningful evidence, unresolved blockers and next owner/action. Do not force Done when your assigned slice is finished but review/testing/release belongs to someone else. Report the task ID and handoff state only inside the personal tracker or private owner/agent handoff, never in a shared commit/MR/release/team artifact. Shared handoffs describe the change and link shared evidence without the personal task reference. Keeping a task current does not authorize performing those other stages.

### Continue delivery after owner review

For owner-controlled development delivery, implementation review happens on the open working MR/PR, not again when preparing delivery:

1. Complete implementation and required checks, push the scoped changes, open the working MR/PR and move the task to the configured review state. The user reviews that artifact. Review fixes return to the applicable implementation state.
2. In that working-MR/PR context, requests such as "deploy", "prepare the release MR/PR", "выкати", "сделай релизный MR", or owner messages "merged"/"done"/"смерджено"/"готово" mean continue delivery to dev. Do not ask again whether to continue, restart implementation review or require another approval of unchanged code. Outside that context, those words do not authorize an arbitrary release. Read the latest task and actual MR/PR state, preserve completed evidence and resume the first unfinished step.
3. Move to the configured delivery state when present. Open ordinary, non-Draft release MR/PR into the owning repository's main branch. Find and update an existing MR/PR for the same release scope and target instead of creating a duplicate. If it is Draft, update its content and mark it ready rather than treating Draft as a mandatory waiting stage. Making it non-Draft does not waive real CI, compatibility or artifact failures.
4. The owner merges working, release and ops MR/PR and runs manual deployment buttons. If the working or release MR/PR is not yet merged, identify the exact link and required owner merge, not a new implementation-review gate. After the owner's release merge, verify CI for the resulting main SHA and that all required main images are actually published for the expected components/platforms. Record pipeline/job links, SHA and image tags/digests; a successful build without the required published image is not sufficient.
5. Prepare or update the necessary ops MR/PR with dev pins to the verified images, preserving compatibility and migration/worker/service ordering. Do not change production pins or include unrelated changes. Name the exact owner merge or manual dev job still required. Continue with the remaining delivery checks when that action is completed; do not return the task to review merely because delivery paused.
6. Only confirmed deployment of the expected version to the actual dev environment permits On Dev. Then exercise the changed behavior on dev, not just a healthcheck or build; record version, deployment proof, result and limitations against the applicable AC. Successful dev acceptance permits the configured release-ready state, or Done when the agreed task scope ends at accepted dev delivery. Do not add a production requirement to a dev-only task.
7. Report real blockers precisely: missing image/SHA/digest, failed CI job, required owner merge, manual dev job or unavailable verification access. Include the evidence, next action and responsible person. Prior review, mandatory Draft and a redundant confirmation are not blockers. New implementation changes require review of their delta, not a fresh review of unchanged accepted code. Failed dev behavior returns to implementation; unavailable acceptance stays unverified, never Done.

Map these facts to the project's existing configured states; adding a delivery column requires workflow authorization. Without one, retain the last truthful state and record "review accepted; delivery to dev pending" plus the exact remaining action in notes, not a request to repeat review. No automatic polling, background deployments or extra review ritual is required to maintain task state. A merge is not a deployment; a build is not acceptance; dev continuation authorizes neither production nor owner-controlled merges/manual deploy actions.

### Record each status transition

Before every actual status change, read the latest task and applicable policy; use the configured statuses. Append one concise delta to native notes: `<old status> -> <new status>: <what changed and observed result>; evidence: <exact reference>; next: <action/blocker or final disposition>`. Follow the project's required format if different. Cover starts, review/release handoffs, completion, reopening, blocking and cancellation where they change status. Record the reason for reopening or stopping; neither blockage nor cancellation is Done.

Reference observed checks/results, commits, reviews or decisions precisely; if evidence is unavailable or a check was not run, say so rather than inventing it. Preserve earlier notes and meaningful progress between transitions. Summarize the new delta, not the whole task, chat transcript or raw logs; do not duplicate a transition or record a no-op as one. A genuine return to a prior status gets a new observed delta.

When supported, submit status and appended notes in the same native edit: `backlog task edit <ID> --status "<new status>" --append-notes "<delta>"`. Otherwise use the supported native operations and report any partial result; do not claim atomicity. Inspect the returned task or read it back to confirm both status and retained notes. After an error or uncertain result, inspect the current record before retrying to avoid duplicate notes.

Use the project's blocker representation with reason, unblocker, next action, and recheck date; remove it when resolved. Dependency-only `--ready` is not proof that review, blockers, access, or operational approvals permit work. Respect the project's work-in-progress limit and explicit ownership for parallel slices.

Use the configured review/release states only with their documented evidence and approvals. Review readiness, reviewer approval, release readiness, publication, deployment, and final acceptance are different facts. If MCP rejects a configured custom status, use native `backlog task edit <ID> --status <configured-status>` from the owning tracker, not a substitute label or a direct record edit.

Include the project's required review material in the task and owner handoff. Where policy requires tuicr, provide a copy-paste command using the real code repository and exact task commit range: `cd /absolute/repo/path && tuicr -r 'BASE..HEAD'`; use `COMMIT^..COMMIT` for one commit, not an accumulated branch diff. Explain non-applicability for non-code work. Do not invent a commit range for uncommitted changes.
