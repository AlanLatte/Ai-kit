# Native model roles and bounded task handoff

This agent-run procedure is selected with approved OMP setup, or an explicit model-routing request. Installation/startup, workspace-tool-only and report requests do not change roles. Require OMP 18.20.2 for the contracts below; inspect `omp --version`, `omp models --help`, `omp config --help`, `omp agents --help` and native command availability first. On an unsupported version report the missing capability; do not omit it silently or upgrade the user's client without authorization.

## 1. Discover the actual execution set

Use the selected profile, exact target cwd and existing environment overrides throughout. `omp config path` identifies the local agent directory. Privately inspect effective `enabledModels`, `enabledProviders`, `disabledProviders`, `modelRoles`, `modelRoleStorage`, `task.agentModelOverrides`, `task.disabledAgents`, `retry.fallbackChains` and the explicit layers with `omp config get KEY --json` and `omp config list --scope global|project --json`. Inspect only needed keys; do not print whole settings, auth or environment. Preserve current assignments and custom agents. CLI `--models` and explicit config overlays also constrain a session; reproduce them when discovering that session.

1. Run `omp models --json` locally in that same profile/cwd for native catalog capabilities, `pricingStatus` and effective cost legs (`input`, `output`, `cacheRead`, `cacheWrite`), context/output limits, modalities and supported thinking. Catalog discovery may fetch/cache metadata and load enabled extensions; it is not a model inference or proof of account/quota readiness. Do not use `models refresh` without needing an explicit catalog refresh.
2. Obtain the **native enabled+available** session set, not merely that catalog. Start an idle native RPC process from the exact target cwd with the same profile/environment/overlays: `omp --mode rpc --no-ui --no-session`. Send one JSON line on stdin: `{"id":"setup-models","type":"get_available_models"}`. Wait for the matching successful response, consume `data.models`, then close stdin/terminate that owned idle process. Never send `prompt`, `follow_up`, `steer`, `login` or `bash` commands as a setup probe. The native RPC command waits for background discovery and calls the session's enabledModels-filtered `getAvailableModels()`. An empty set is no usable model, not permission to use the global catalog or change the allowlist.
3. Intersect exact `provider/id` identities from the RPC response with catalog metadata. Do not reimplement fuzzy/glob/path-scoped filtering. `ctx.models.list()` and `omp models --json` alone expose registry availability, not this filter. If RPC is unavailable, use the native `/model` All models view in a fresh session with its displayed session scope and verify the effective enabledModels settings; a configured nonempty scope with no matches is a setup failure, not unfiltered fallback. Do not assign models from signed-out/provider-preview views.

Keep inventory private and ephemeral. Report only the chosen selectors/roles and non-secret rationale to the owner, not accounts or tokens. Provider eligibility comes from native registration, enablement and credential availability, not a brand whitelist. Availability does not prove successful provider access; login remains private owner work through native `/login` or `omp login` when required.

## 2. Select using evidence, not labels

Choose planning and review models for analysis and verification. Choose a capable draft/implementation model for following a settled plan. Use the capabilities, context, tools/modalities, supported effort and owner preferences of the models actually available in this profile. This works with a single provider (including Claude-only or Codex-only profiles) or several; never require a particular provider, model family or tier. The planner and reviewer can use the same model in separate sessions.

Prefer a cheaper capable executor only with **known effective price** evidence for the expected input/output/cache mix. Catalog price, subscription billing and actual marginal account cost can differ. `pricingStatus=unknown`, missing cost or a zero placeholder is unknown, not free. Do not infer reasoning quality or cost from provider/model names, run paid benchmarks/judges, or invent a savings percentage.

Preserve every existing role/agent override unless changing that exact assignment is approved; proposed improvements to conflicting assignments require the owner. If no proven cheaper capable executor exists, retain a capable selection, state that cheap execution is unproven, and complete the supported routing without a fake budget claim. A single eligible model can serve all roles; that is not a cheap/strong split.

## 3. Write only local native configuration

Privately back up the affected local files. Set missing or approved role mappings through the native `/model` Roles view, or native record writes. For profile-global storage, merge into the latest `modelRoles` record and pass the resulting JSON as **one literal argument** to `omp config set modelRoles '<merged JSON>'`. Read back `omp config get modelRoles --json`. Never replace the record with a partial map. CLI `config --scope` is a listing filter, not a project-write flag. For approved project-only routing, selectively merge `modelRoles` into that project's resolved `.omp/config.yml`; preserve other YAML and inherited profile roles. Do not change `modelRoleStorage` merely to make a write land.

In `/model`, `Kind` filters the catalog; it does not assign a model to a workload. Open **Roles**, select a row and press Enter to pick a model. Use the active profile on the machine where OMP runs (the Mac and a remote shell have separate settings). For plan -> draft -> review, assign `plan`, `task` and `slow`; leave every unrelated role unchanged, including `smol` unless separately requested. Store the selected `provider/id` values only in local settings.

| Native role | Purpose |
|---|---|
| `default` | Preserve the user's ordinary-chat default; no strong-model reset is needed |
| `plan` | `/plan` in the parent session; also used by the research and task-artifact specialists below |
| `task` | Bundled `task` subagent for routine drafts or bounded implementation |
| `slow` | Bundled `reviewer` subagent for independent review |
| `smol` | Optional fast role for `sonic` or an explicitly enabled prewalk; it does not select the bundled `task` subagent's model |

No concrete provider/model IDs ship as Ai-Kit defaults. This is native role configuration, not fictional SKILL frontmatter `model` fields. Generic native task uses `@task`; reviewer uses `@slow`. A role name alone proves neither capability nor price.

Instantiate [the research agent](../templates/ai-kit-research.md) into the selected local agent directory's `agents/ai-kit-research.md` and [the task-artifact agent](../templates/ai-kit-task-artifact.md) into `agents/ai-kit-task-artifact.md`, or the approved project `.omp/agents/` scope. Resolve that directory from `config path`, not a hardcoded default profile. Keep existing same-name agents unchanged until a conflict is resolved. Definitions route through `@plan`, so no concrete IDs enter distributed templates. Do not run `agents unpack --force`: it would overwrite unrelated agents.

If an existing specialist needs role routing, merge only its approved entries into the latest `task.agentModelOverrides` record through `omp config set task.agentModelOverrides '<merged JSON>'`, or its approved project YAML. An existing override outranks agent frontmatter; expose conflicts rather than silently shadowing it. Preserve all unrelated entries. Do not enable `task.perCallModel`, eager/always, autoParallel, advisors, always-on judges or automatic prewalk to implement this workflow.

## 4. Read back without inference

Read `modelRoles` and `task.agentModelOverrides` in a fresh process at the same cwd/profile and inspect explicit global/project layers. Open native `/model` Roles and `/agents` hub to confirm effective selected selectors, scope and both role-backed agents. Close without submitting a model turn. Repeat discovery to ensure selected identities remain enabled+available. This proves configuration/discovery, not successful authenticated inference or benchmark quality. If the installed interface cannot display agent/role resolution, record that limit rather than launching a paid smoke task.

Ordinary native role/agent resolution can fall back to the parent's authenticated model when configured worker credentials are unusable. Retry/fallback chains can add other allowed selections. Preserve existing settings; inspect and list the owner-allowed fallback selectors locally. This setup is **not a hard cost cap**. During an actual authorized worker call, inspect native task progress/agent-hub routing: `resolvedModel` identifies the serving selector and `resolvedModelIsFallback` marks fallback, with `resolvedModelIdentity` and `resolvedThinkingLevel` when provided. Compare the observed selection with the approved primary/fallback set and known price; record it in task evidence. If it is outside that set, stop additional dispatch and report it. Missing serving metadata is unverified routing, never proof of cheap execution. Do not make inference calls merely to collect this evidence during setup.

## 5. Handoff for real work

For a document or other standalone draft, enter `/plan` and ask for a plan without writing the draft. After approving or exiting plan mode, ask the parent to delegate the draft to `task`, then hand the result and requirements to `reviewer` for a separate check. A role only selects a model when that workload runs; it does not start the next phase. For a direct, one-off draft, select the drafting model as the active chat model instead.

Use [the bounded handoff template](../templates/task-handoff.md), not automatic difficulty classification:

1. Strong parent or `ai-kit-research` investigates the requested current system. Strong parent or `ai-kit-task-artifact` records/refines the owning Backlog task: short outcome, complete AC, plan, decisions, dependencies and linked artifact/evidence. Backlog remains the sole lifecycle index; generic installation manuals stay in Ai-Kit, not Backlog docs.
2. Send a bounded implementation slice to the generic native task agent (omit `agent` for default) or a verified role-backed specialist. Include exact tracker/task/root, artifacts, scope/non-goals, AC, plan, allowed files, access boundaries, expected output and verification owner. Use native `tasks[]` shared `context` and each item's `task`/`solutionSpace`; no per-call concrete `model` is needed.
3. Executor implements every assigned behavior and returns files, evidence, actual selected/fallback model when observable and checks left for the authorized owner. Workers do not run the main owner's checks unless assigned.
4. The authorized verification owner runs affected checks once after integration. Dispatch native `reviewer` (`@slow`) with exact task/AC, change range/artifact, observed evidence and requested review scope. Resolve findings and record review/evidence in the owning Backlog task before acceptance. Review assignment is not optional merely because the edit was small.

The user may explicitly approve a tiny-change fast path (direct strong-parent implementation and an agreed review adjustment); record that decision and preserve AC. Never silently discard an assigned review. Native prewalk is a turn-boundary first-edit mechanism, not a Backlog/task handoff, price optimizer or promised final review; leave it off unless separately requested for a suitable task.

## Native source contracts (18.20.2)

[Model JSON](https://github.com/can1357/oh-my-pi/blob/v18.20.2/packages/coding-agent/src/cli/models-cli.ts), [RPC](https://github.com/can1357/oh-my-pi/blob/v18.20.2/docs/rpc.md), [filtered session models](https://github.com/can1357/oh-my-pi/blob/v18.20.2/packages/coding-agent/src/session/model-controls.ts), [agent discovery/precedence](https://github.com/can1357/oh-my-pi/blob/v18.20.2/docs/task-agent-discovery.md), [ordinary auth fallback](https://github.com/can1357/oh-my-pi/blob/v18.20.2/packages/coding-agent/src/config/model-resolver.ts).
