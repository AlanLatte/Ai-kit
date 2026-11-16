---
name: ponytail-help
hide: true
description: Show OMP Ponytail commands, mode persistence and Ai-Kit update steps.
---
# Ponytail in OMP

One-shot help; do not change mode, files or configuration.

- `/ponytail lite|full|ultra|off` changes the current session mode; `/ponytail status` reports it. Bare `/ponytail` reports an active mode or reactivates the configured default (full when that default is off). `normal mode` and `stop ponytail` disable it.
- `/ponytail default lite|full|ultra|off` changes the default for fresh sessions; review is not a runtime/default level. Existing branch transitions win on resume; `PONYTAIL_DEFAULT_MODE` overrides the saved default. Use `/skill:ponytail-review` for its review instructions.
- Explicit skills: `/skill:ponytail`, `/skill:ponytail-review`, `/skill:ponytail-audit`, `/skill:ponytail-debt`, `/skill:ponytail-gain`, `/skill:ponytail-help`. Auxiliary skills are hidden from the startup catalog, not absent.
- Coding/refactoring/review only: requested full scope, assignment-specific verification ownership, existing frameworks and global/project comment rules override upstream examples. No compulsory shortcut comments or duplicate self-check scaffolds.

Ai-Kit's OMP update commands are `omp plugin marketplace update alanlatte`, then `omp plugin upgrade ai-kit@alanlatte`; restart OMP afterwards. These are guidance, not approval to update. OMP `/settings` -> Marketplace Auto-Update `notify` reports available versions without installing. Do not suggest Claude Code `/plugin`, `/reload-plugins` or installing another host to repair OMP.

The pinned upstream help remains in [vendor](../../vendor/ponytail/skills/ponytail-help/SKILL.md) for provenance; its other-host commands are not this host's setup contract. MIT notice: [license](../../vendor/ponytail/LICENSE).
