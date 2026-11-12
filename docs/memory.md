# Workspace memory routing

The OMP entrypoint is `omp/memory.mjs`. It routes the existing native Hindsight
backend; it does not install a second backend, make memory API calls, poll, or
change persisted OMP settings. It uses OMP 18.18.6's public scoped-settings API,
setting handles, layer notifications and runtime-layer snapshot API.

Routing is optional. Without a configuration file (or with an empty workspace
list), the extension makes no settings changes and does not subscribe to settings
notifications. Explicit native Hindsight settings continue to work unchanged.

## Local configuration

Create `$XDG_CONFIG_HOME/ai-kit/workspaces.json`, falling back to
`~/.config/ai-kit/workspaces.json` when `XDG_CONFIG_HOME` is unset or empty:

```json
{
  "workspaces": [
    { "path": "/absolute/workspaces/project", "bankId": "project-bank" },
    { "path": "/absolute/workspaces/project/special", "bankId": "special-bank" }
  ]
}
```

These are illustrative paths, not defaults. Keep the real configuration local,
not in this public package. Do not include API URLs, credentials or memory data;
native OMP settings continue to own service configuration and authentication.
`XDG_CONFIG_HOME`, if set, must be absolute. Each route must contain exactly
`path` and `bankId`. Paths must be existing absolute directories. Bank IDs must
contain one or more ASCII letters, digits, underscores or hyphens. Duplicate
real directories, including aliases through symlinks, are rejected. The top-level
object must contain only `workspaces`.

Configuration is read when a main session starts; restart the session after
editing it. Unreadable or invalid configuration raises a descriptive error
without echoing file contents, paths, credentials or parser diagnostics.
Subagents do not install their own router.

## Scope and restoration

Both configured roots and the current directory are resolved through `realpath`.
Containment uses directory components, so `project-other` is not inside `project`.
The longest matching root wins. All nested checkouts inside a configured directory
belong to that workspace, independently of Git origin. Symlink aliases into a
workspace match it; symlinks leading out do not inherit the lexical parent's bank.

A directly matching directory route takes precedence. Otherwise, Git's common
directory is used to find a linked worktree's primary checkout when its common
directory is the primary checkout's `.git` directory. An external worktree can
then inherit the primary checkout's route. An explicit route for the worktree
can override that choice. Bare repositories and layouts without an identifiable
primary checkout require an explicit route. A failed Git lookup leaves native
settings in effect; it never reuses the last routed bank.

While routed, three runtime overrides are applied: `hindsight.bankId` is the exact
configured bank, `hindsight.bankIdPrefix` is empty, and `hindsight.scoping` is
`global` so the directory workspace shares that bank. Settings and cwd changes
are observed through the native layer-change listener, with a reentrancy guard;
there is no timer. The native backend remains responsible for state rebuilds,
queued writes, recall, retention and worktree project tags outside routing.

On leaving a route, ending the main session, or rebinding to another main
session, only still-owned routing overrides are restored or removed. Preexisting
runtime values are retained; values written by another owner are not deleted.
User runtime edits observed while routing are remembered for restoration. When
there was no earlier runtime value, removing the override reveals the destination's
current native layers/defaults, not a snapshot of the previous project's settings.
Other runtime values, persisted settings, environment variables and recall limits
are untouched. An unreadable current directory clears owned overrides and emits
an explicit routing error.

There is no fallback to a previous workspace bank or another configured bank on
memory-service failure. Native OMP reports service errors; this extension does
not mask them or retry against a different project. Outside configured routes,
the user's native settings determine whether memory is active and its scope.
Configure those defaults deliberately rather than pointing them at a project's
bank unintentionally.

## Data and personal preferences

Existing separate banks and their data stay in place. Reuse their existing bank
IDs in local routes; this feature neither reads, copies, exports, merges nor
erases stored memories. Stable personal preferences belong in the user's existing
global personal instructions, not in a project bank used as a cross-project
fallback. This preparation does not edit those instructions or reduce recall
limits.

## Local CPU inference and refresh recovery

Consolidation produces observations without replacing the source facts. Node and
link counts need not shrink when consolidation works. Check bank statistics for
`pending_consolidation`, `failed_consolidation` and `last_consolidated_at`;
check mental models separately for `is_stale` and `last_refresh_failed_at`.

On Hindsight 1.1.0, a failed mental-model refresh pauses its automatic refreshes.
A healthy service and an empty consolidation queue do not clear that pause.
Inspect failed operations and LLM request traces before retrying: the worker's
last stage label can still name an LLM call while a retrieval tool is running.
Use trace scope, duration and error to distinguish provider latency from local
embedding or reranking work.

New local installations use bounded native thread pools, one concurrent local
rerank, length-bucket batching and a 30-minute default automatic mental-model
refresh interval. The pinned Compose template supplies this profile:

```yaml
OMP_NUM_THREADS: "2"
OPENBLAS_NUM_THREADS: "2"
MKL_NUM_THREADS: "2"
NUMEXPR_NUM_THREADS: "2"
HINDSIGHT_API_RERANKER_LOCAL_MAX_CONCURRENT: "1"
HINDSIGHT_API_RERANKER_LOCAL_BUCKET_BATCHING: "true"
HINDSIGHT_API_MENTAL_MODEL_MIN_REFRESH_INTERVAL_SECONDS: "1800"
```

Keep the same model and candidate set for before/after measurements. Check score
and ranking agreement as well as latency, including simultaneous refreshes and
queueing. These defaults are a tuning starting point, not a hardware-independent
optimum. Explicit bank or per-model refresh intervals take precedence over the
server default. OMP 18.19.0's built-in seeds omit a per-model interval and inherit
it; existing models with an explicit interval retain that value.

Existing installations are not migrated or recreated by reinstalling Ai-Kit:
the helper preserves their private Compose/env files and reuses their containers.
Native pool settings take effect at process startup; applying this profile to an
existing Compose container requires an explicit recreation, preserving its image,
credentials and data volume.

After tuning, explicitly refresh failed models through
`POST /v1/default/banks/{bank_id}/mental-models/{mental_model_id}/refresh`.
Verify operation completion, nonempty content, a cleared failure marker and
freshness, then exercise automatic refresh after retain/consolidation separately.
For less frequent full rebuilds, patch the model trigger's
`min_refresh_interval_seconds` to `1800`, retaining
`refresh_after_consolidation: true` and its existing mode and scope. Early automatic
refreshes are queued until the interval expires, not discarded; explicit refreshes
ignore the interval. Back up local configuration first. Do not delete memories,
change retrieval budgets or switch full models to delta as part of CPU tuning.

## Verification boundary

`node --test tests/memory.test.mjs` exercises one deterministic behavioral
regression using temporary directories, a real linked Git worktree and a modeled
public settings layer with synchronous notifications. It covers inert missing
configuration, longest match, component boundaries, symlink containment, default
restoration, user runtime preservation, worktree precedence, shutdown and safe
configuration errors. It requires Node.js 22+ and Git and uses no service or
credentials. It does not prove native backend initialization or live recall.

Native OMP 18.18.6 integration has also been checked in fresh processes using
the installed package: optional router registration, ordinary directories,
nested checkouts, symlink aliases, external linked worktrees with their own
project installation, and native bank selection outside explicit routes.
Automatic recall and mental-model injection retained the same measured sizes
when replacing the previous router against existing banks. A loopback-only
provider observed the final request without calling a language model;
auto-retention and mental-model auto-seeding were disabled for those probes.
No memory contents or real routes are published here.

With an unavailable service, routing stayed on the selected bank and no memory
from another bank was injected. The read-only readiness command reported the
service error explicitly. Live user settings retain their original backend
and recall limits. Already-running OMP sessions must restart to load a changed
extension list; package installation does not hot-replace their modules.
