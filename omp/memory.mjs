import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, sep } from "node:path";
import { findScopedSettings } from "@oh-my-pi/pi-coding-agent/config/settings";
import {
  cfgHindsightBankId,
  cfgHindsightBankIdPrefix,
  cfgHindsightScoping,
} from "@oh-my-pi/pi-coding-agent/hindsight/settings";

function readRoutes() {
  const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  if (!isAbsolute(configHome)) throw new Error("Ai-Kit memory: XDG_CONFIG_HOME must be absolute.");
  let source;
  try {
    source = readFileSync(join(configHome, "ai-kit", "workspaces.json"), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw new Error("Ai-Kit memory: cannot read workspace routing configuration.");
  }
  try {
    const config = JSON.parse(source);
    if (!config || Object.keys(config).length !== 1 || !Array.isArray(config.workspaces)) throw new Error();
    const paths = new Set();
    return config.workspaces.map((entry) => {
      if (!entry || Object.keys(entry).length !== 2 || typeof entry.path !== "string" || !isAbsolute(entry.path) ||
          typeof entry.bankId !== "string" || !/^[A-Za-z0-9_-]+$/.test(entry.bankId)) throw new Error();
      const path = realpathSync(entry.path);
      if (!statSync(path).isDirectory() || paths.has(path)) throw new Error();
      paths.add(path);
      return { path, bankId: entry.bankId };
    }).sort((a, b) => b.path.length - a.path.length);
  } catch {
    throw new Error("Ai-Kit memory: invalid workspace routing configuration; use unique existing absolute directories and nonempty alphanumeric, underscore or hyphen bank IDs.");
  }
}

function contains(root, path) {
  const suffix = relative(root, path);
  return suffix === "" || (!isAbsolute(suffix) && suffix !== ".." && !suffix.startsWith(`..${sep}`));
}

function bankForCwd(routes, cwd) {
  const path = realpathSync(cwd);
  const direct = routes.find((route) => contains(route.path, path));
  if (direct) return direct.bankId;
  let common;
  try {
    const env = { ...process.env };
    for (const key of ["GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE", "GIT_CEILING_DIRECTORIES"]) delete env[key];
    common = realpathSync(execFileSync("git", ["--no-optional-locks", "-C", path, "rev-parse", "--path-format=absolute", "--git-common-dir"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], env, timeout: 5000,
    }).trim());
  } catch {
    return undefined;
  }
  if (basename(common) !== ".git") return undefined;
  return routes.find((route) => contains(route.path, dirname(common)))?.bankId;
}

export default function workspaceMemory(api) {
  let release;

  api.on("session_start", (_event, context) => {
    if (context.agent.kind !== "main") return;
    release?.();
    release = undefined;
    const routes = readRoutes();
    if (routes.length === 0) return;
    const settings = findScopedSettings(context.cwd);
    if (!settings) throw new Error("Ai-Kit memory: session settings unavailable.");
    const handles = [cfgHindsightBankId, cfgHindsightBankIdPrefix, cfgHindsightScoping];
    const owned = new Map();
    let applying = false;
    let previousCwd;
    let bank;
    const restore = () => {
      const current = settings.mirrorState().overrides.hindsight ?? {};
      for (const [handle, state] of owned) {
        if (current[handle.id.split(".")[1]] !== state.value) continue;
        if (state.previous === undefined) handle.clearOverride(settings);
        else handle.override(settings, state.previous);
      }
      owned.clear();
    };
    const route = () => {
      if (applying) return;
      applying = true;
      try {
        const cwd = settings.getCwd();
        if (cwd !== previousCwd) {
          bank = bankForCwd(routes, cwd);
          previousCwd = cwd;
        }
        const current = settings.mirrorState().overrides.hindsight ?? {};
        if (bank === undefined) {
          restore();
          return;
        }
        const values = [bank, "", "global"];
        handles.forEach((handle, index) => {
          const value = current[handle.id.split(".")[1]];
          let state = owned.get(handle);
          if (!state) {
            state = { previous: value, value: values[index] };
            owned.set(handle, state);
          } else {
            if (value !== state.value) state.previous = value;
            state.value = values[index];
          }
          if (value !== state.value) handle.override(settings, state.value);
        });
      } catch {
        restore();
        previousCwd = undefined;
        const message = "Ai-Kit memory: workspace route unavailable; no workspace bank override is active.";
        context.ui.notify(message, "error");
        throw new Error(message);
      } finally {
        applying = false;
      }
    };
    route();
    const unsubscribe = settings.onLayersChange(route);
    release = () => {
      unsubscribe();
      applying = true;
      try {
        restore();
      } finally {
        applying = false;
      }
    };
  });

  api.on("session_shutdown", (_event, context) => {
    if (context.agent.kind !== "main") return;
    release?.();
    release = undefined;
  });
}
