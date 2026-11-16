---
name: no-ai-slop
description: Edit or detect patterns in human prose; silently refine authored text without changing evidence or format.
license: MIT
---

# No AI slop

Read the [pinned upstream editing rules](../../vendor/no-ai-slop/SKILL.md) and [self-check](../../vendor/no-ai-slop/eval.md) when they are not already in context. This wrapper defines how those unchanged rules apply in engineering workflows: embedded output/context rules below override upstream draft requests and reporting, and preservation requirements override stylistic word bans.

## Standalone edit or detect

For an explicit request to edit a supplied draft, preserve upstream behavior: make the minimum effective edit, then return the full edited draft and a short **What changed** section, unless the user requires another format. For detect/audit-without-rewriting requests, name each observed pattern, quote the line and give a short fix; do not rewrite, score or infer AI authorship. Ask for a missing draft or genuinely missing audience/goal only when the conversation does not already supply it.

## Embedded prose pass

Apply the editing principles silently to all human prose you author: ordinary replies; commit subjects and bodies; PR/MR titles, descriptions, comments and reviews; release/hotfix notes and tag annotations; incident updates; reports, worklogs, task records and documentation. Include prose produced by native subagents and prose inside tool arguments or files, not only the final reply. Use the draft, evidence and audience already available; do not ask the user to paste the same text or announce an editing stage.

Before sending or saving, make the minimum effective prose edit and self-check in the same reasoning pass. Keep the workflow's exact output contract: no appended **What changed**, pattern report, pass/fail checklist or extra section in a commit, report, structured response or ordinary reply. An explicit standalone request above is the exception. No mandatory second agent, extra model/network call or automatic output postprocessing is needed.

## Preserve meaning and authority

- Preserve facts, caveats, uncertainty, risks, evidence boundaries and the writer's voice. Never invent claims, examples, measurements, sources, opinions or stronger confidence to make prose sound concrete.
- Preserve identifiers, code, commands, exact logs/quotes/evidence, product terminology and legal notices. Do not rotate technical terms for stylistic variety. Word and pattern lists guide human-prose judgment; they are not a regex ban, detector or reason to change protected text.
- Preserve required language, templates, headings, schemas and formatting. Project and user requirements take precedence over stylistic advice; do not flatten an incident timeline, review finding, task acceptance criterion or required report section.
- Edit user-owned prose only within the assigned scope. A prose pass grants no permission to commit, send a comment, push, publish, release or perform any other external action.

This skill edits human prose, not code; it is not `ai-slop-cleaner` or an AI-authorship detector. Unclear or unsupported content remains qualified or is raised as a substantive question, never silently repaired with an invented fact.
