---
name: no-ai-slop
description: Edit/audit drafts or draft substantial docs/PRs/reports. Not routine replies, statuses or titles.
license: MIT
---

# No AI slop

Choose the mode below before reading references. Reuse rules already in context; a new workflow stage or subagent result is not a reason to reload them or repeat an editing pass.

## Standalone edit or detect

For an explicit request to edit a supplied draft, preserve upstream behavior: make the minimum effective edit, then return the full edited draft and a short **What changed** section, unless the user requires another format. For detect/audit-without-rewriting requests, name each observed pattern, quote the line and give a short fix; do not rewrite, score or infer AI authorship. Ask for a missing draft or genuinely missing audience/goal only when the conversation does not already supply it.

For standalone editing or detection, read the [pinned upstream rules](../../vendor/no-ai-slop/SKILL.md) and [self-check](../../vendor/no-ai-slop/eval.md). Their draft requests and output rules apply only to this mode, subject to the user's requested format and the preservation rules below.

## Substantive artifact writing

Use this mode when drafting or substantially revising a human-facing document, PR/MR description, developed review finding, release/tag note, incident analysis, or substantive report/worklog/task artifact. It applies to assigned files, tool arguments and subagent prose as well as chat. It does not independently apply to ordinary technical replies, acknowledgements, short factual statuses, link handoffs, one-line commit subjects/titles, unchanged templates, commands, logs, code or structured receipts. An explicit editorial request still selects standalone mode, even for a short text.

Edit silently in the current authoring pass using the available draft, evidence and audience:

- Lead with the concrete result, problem or decision; remove generic introductions, repetition, unsupported importance claims and rhetorical reveals.
- Prefer exact facts and direct verbs. If a sentence could move unchanged to an unrelated project, replace it with supported detail or cut it.
- Preserve the writer's voice and useful structure; split only genuinely tangled sentences. Do not rotate technical terms or force uniform paragraphs.
- Remove decorative emphasis, fake conclusions and summaries that only repeat the text. Keep necessary headings, lists and report fields.
- Read the result once for meaning, evidence, clarity and the required format. Fix actual problems, not every stylistic difference.

These rules are sufficient for this mode; do not load the upstream catalog or self-check automatically. Do not append **What changed**, a pattern report, checklist or new section. No second agent, extra model/network call or output postprocessor is needed.

## Preserve meaning and authority

- Preserve facts, caveats, uncertainty, risks, evidence boundaries and the writer's voice. Never invent claims, examples, measurements, sources, opinions or stronger confidence to make prose sound concrete.
- Preserve identifiers, code, commands, exact logs/quotes/evidence, product terminology and legal notices. Do not rotate technical terms for stylistic variety. Word and pattern lists guide human-prose judgment; they are not a regex ban, detector or reason to change protected text.
- Preserve private tracker identifiers in their private records, not in shared artifacts. When drafting authorized commits, branches, MR/PR, tags, release notes, changelogs, repository docs or team messages, omit personal Backlog IDs and local tracker links/paths, including from copied headings and templates. Retain the substantive change, versions and shared evidence. The personal task may link the shared artifact, never the reverse; a private remote repository is still shared. This privacy boundary takes precedence over literal identifier preservation and does not authorize rewriting published history.
- Preserve required language, templates, headings, schemas and formatting. Project and user requirements take precedence over stylistic advice; do not flatten an incident timeline, review finding, task acceptance criterion or required report section.
- Edit user-owned prose only within the assigned scope. A prose pass grants no permission to commit, send a comment, push, publish, release or perform any other external action.

This skill edits human prose, not code; it is not `ai-slop-cleaner` or an AI-authorship detector. Unclear or unsupported content remains qualified or is raised as a substantive question, never silently repaired with an invented fact.
