# Integrate branches or complete an authorized merge

Record the exact source, base, worktree and unrelated changes before integration. Preserve both authors' work. A clean text merge is not proof of semantic compatibility:

- Establish both sides' invariants; check remaining callers, imports and composition roots after changes or removals.
- Exercise behavior combinations that did not exist on either branch alone. Use targeted checks for narrow overlap and broader checks when several subsystems interact, subject to repository policy.
- Compare failures against the base with the same commands and environment where needed. Distinguish regressions, existing failures and flakes. Revise tests of intentionally removed behavior according to the actual requirements.

For required independent review, the author removes unnecessary changes before handoff. Give the reviewer the exact diff base and head, request, relevant paths and observed checks. Reuse unchanged evidence; conflict resolution and subsequent fixes need review and checks of the affected delta, not a restart of every stage. A separate cleanup pass is warranted by findings or an explicit request, not by stage transitions.

A local integration assignment does not authorize remote merge. Before any authorized remote merge, verify the actual request head, required independent approval and checks, blocking comments, the project's merge actor and any owner approvals. Review or approval of a source change is not approval of a merge that triggers deployment. Use the repository's merge method and message. If someone else must merge, return the exact link and next owner action instead of merging or scheduling it.

Return the resulting snapshot, decisions at semantic conflicts, review and verification evidence, and unresolved limits. Never report a merge as a rollout.
