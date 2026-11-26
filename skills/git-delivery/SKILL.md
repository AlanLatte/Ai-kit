---
name: git-delivery
description: Create atomic Git commits, prepare pull or merge requests, review changes, or integrate branches under repository delivery rules.
---

# Git delivery

Identify the exact Git root, worktree and snapshot. Read the active project and repository rules for the assigned operation. They own branch targets, naming, language, signing, checks, host access, templates, merge authority and release gates. Do not infer policy from another repository in the workspace.

Read only the relevant procedure:

| Assignment | Procedure |
| --- | --- |
| Commit local changes | [Commit](references/commit.md) |
| Push or prepare a PR/MR | [Change request](references/change-request.md) |
| Independently review a diff or PR/MR | [Review](references/review.md) |
| Integrate divergent branches or execute an authorized merge | [Integration](references/integration.md) |
| Prepare a release, tag, promotion or deploy | Load the project release procedure. Use this skill only for the Git steps it assigns. |

A local commit needs no remote. Review can use a local diff. Preparing a PR/MR, posting a comment, merging, publishing a tag and deploying have separate authorization boundaries. Do not treat a merged request, published artifact or green build as proof of rollout. When working from a tracked task, maintain its actual state and evidence using the shared `backlog` skill and project policy; keep personal tracker IDs and paths out of shared artifacts.

Use `no-ai-slop` only for substantive authored descriptions, developed findings and release text, not ordinary commit subjects or short statuses. Preserve the project's required format, language, facts and limits.
