## Find and define work

1. Search meaningful words and existing domain labels before creating anything. Inspect matching open records and their parents; reuse the appropriate task rather than duplicate it. Use focused filters and the native pagination hints instead of listing the whole tracker. Multiple label filters are AND.
2. Keep the description a short, stable account of the outcome, why it matters, and scope; aim for 1-3 sentences without dropping substantive requirements. Add only confirmed context, unknowns and sources needed to act; keep detailed AC, plans and progress in their native fields rather than repeating them. Follow the project's title language and required format. Do not turn an unresearched implementation idea into a requirement or create speculative follow-up work without authorization.
3. Apply the project's required type, priority, due date, labels, initial status, and other metadata. Read those values from policy/config, not another project's defaults. Do not invent native defaults or treat a deadline as a priority. If a required decision is missing, ask for the missing decisions together before saving.
4. Dates come from an agreed commitment or confirmed milestone, with calculation assumptions recorded. Never fabricate dates, silently roll overdue work forward, or put a child beyond its parent's deadline without resolving the conflict. Use only confirmed assignee identifiers or an explicitly agreed configured default; Git identity is not an assignee. Establish the executor before execution, not necessarily before initial recording.
5. Split initiatives into independently verifiable deliverables, not daily/file/test chores. Use an existing parent ID and real prerequisite dependencies; identify each prerequisite's output. Avoid cycles, including a parent depending on its own children. Unresolved or ambiguous dependency IDs are not satisfied prerequisites.
6. Acceptance criteria describe observable outcomes, relevant edge cases and safety boundaries. Preserve every owner requirement. Keep AC distinct from inherited Definition of Done. For research/docs, evidence can be a sourced document with conclusions and explicit unknowns; do not require code changes just to close it.
7. Create/refine through native tools and inspect the returned metadata, including parent, dependencies, date, priority, labels, and assignee. A metadata correction alone does not authorize implementation or a status transition. Report IDs, changed commitments, and unresolved assumptions briefly.

### Task format

Use native structured fields instead of maintaining a second checklist in the description. Follow the project's language and template; absent one, use these defaults:

- Title: action and concrete outcome/component, one line. Avoid vague titles such as "Fix things", status prefixes, labels in brackets, or manually assigned IDs; Backlog generates IDs.
- Description: 1-3 sentences explaining the problem/need, intended outcome and scope boundaries. Include essential unknowns or source links, not a transcript, daily report or copied AC.
- Acceptance criteria: one observable condition per native item, initially unchecked. State behavior and relevant failure/safety cases, not a file list or "code written". Inherit project DoD rather than copying it into every task.
- Metadata: native status, type, priority, project, assignee, due date, milestone, parent and dependencies where applicable. Keep this information out of free-text tags when a native field exists.
- References/documentation: exact repository/path, issue, design or other source needed to execute without this conversation. Never include secrets. Use a linked task artifact for necessary long detail.
- Plan: researched steps recorded when execution starts, not speculative instructions for future work. Notes: concise progress/evidence deltas. Comments: discussion and decisions. Final summary: verified outcome and limitations at closure.

Use real newlines for multi-line Markdown, short paragraphs, lists and literal code spans for identifiers/commands. Quote shell arguments so Markdown backticks do not execute commands. Native tools own frontmatter, section markers and checkbox numbering; do not hand-format generated task files. An unknown requirement remains explicit, not silently filled with a guess.

### Tags are native labels

Here "tag" means a Backlog task label, not a Git release tag. Reuse the project's existing vocabulary and spelling from policy, configuration and relevant tasks. Search first: case variants, synonyms and plural forms are not new categories. A configured empty label list does not prove existing tasks have no labels.

When the project has no label convention:

- Use short lowercase ASCII kebab-case nouns for stable product areas or cross-cutting concerns, such as `notifications`, `admin-ui`, `security`, `backup`. These are examples, not labels to seed into every tracker.
- Add only labels that help retrieve or route this task. Prefer 1-3 meaningful labels; zero is better than an invented category, and cross-cutting work may need more.
- Keep task type (`bug`, `feature`, `docs`), priority, assignee, status (`review`, `on-dev`, `done`), dates, task IDs and release versions in their native fields or references. Do not duplicate them as labels, invent per-task labels or use labels as hidden workflow states.
- Add a new label only for a distinct reusable classification not covered by existing labels. Within authorized task work, record its meaning in the canonical vocabulary when needed; ask before a taxonomy redesign, bulk rename or an ambiguous category choice. Do not rename unrelated tasks opportunistically.

Read installed command help before label edits. On CLIs supporting them, creation uses `--labels`; editing with `--add-label`/`--remove-label` preserves other labels, while `--label` replaces the entire set. Use additive/removal operations for a small correction, re-read the result and retain unrelated labels. Do not invent a separate label-management command or assume CLI and MCP field names match.
