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
