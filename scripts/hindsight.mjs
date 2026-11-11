import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";

function command(binary, args, timeout = 1500) {
  return new Promise((resolve) => {
    execFile(binary, args, { encoding: "utf8", timeout, maxBuffer: 1024 * 1024, killSignal: "SIGKILL" }, (error, stdout) => {
      resolve({ ok: !error, missing: error?.code === "ENOENT", stdout });
    });
  });
}

async function configuration() {
  const keys = ["memory.backend", "hindsight.apiUrl", "hindsight.apiToken"];
  const results = await Promise.all(keys.map((key) => command("omp", ["config", "get", key, "--json"])));
  if (results.every((result) => result.missing) && process.env.AI_KIT_CLIENT !== "omp") {
    return { omp: false, backend: "hindsight", apiUrl: process.env.HINDSIGHT_API_URL || "http://localhost:8888", token: process.env.HINDSIGHT_API_TOKEN || "" };
  }
  if (results.some((result) => result.missing)) throw new Error("Missing omp CLI; install omp before configuring its native Hindsight memory.");
  if (results.some((result) => !result.ok)) throw new Error("Cannot read omp configuration within 1.5s; check `omp config get memory.backend --json` in this project/profile.");
  let values;
  try {
    values = results.map((result, index) => {
      const parsed = JSON.parse(result.stdout);
      if (parsed.key !== keys[index]) throw new Error();
      return parsed.value;
    });
  } catch {
    throw new Error("Cannot decode omp configuration; use an omp version supporting `omp config get KEY --json`.");
  }
  return { omp: true, backend: values[0], apiUrl: process.env.HINDSIGHT_API_URL || values[1] || "http://localhost:8888", token: process.env.HINDSIGHT_API_TOKEN || values[2] || "" };
}

function endpoint(apiUrl) {
  let url;
  try {
    url = new URL(apiUrl);
  } catch {
    throw new Error("Invalid Hindsight endpoint; set HINDSIGHT_API_URL or `omp config set hindsight.apiUrl URL`.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("Hindsight endpoint must be an HTTP(S) URL without credentials, query or fragment; use HINDSIGHT_API_TOKEN for authentication.");
  }
  return url;
}

async function readiness(config) {
  const headers = config.token ? { Authorization: `Bearer ${config.token}` } : {};
  const base = config.apiUrl.replace(/\/+$/, "");
  let reachable = false;
  try {
    const response = await fetch(`${base}/health`, { headers, signal: AbortSignal.timeout(1500), redirect: "error" });
    reachable = true;
    if (!response.ok) return { ready: false, reachable: true, reason: "Hindsight health request failed; check server health and HINDSIGHT_API_TOKEN." };
    const health = await response.json();
    if (health.status !== "healthy" || health.database !== "connected") {
      return { ready: false, reachable: true, reason: "Hindsight is not healthy with a connected database; inspect the existing service." };
    }
    const banks = await fetch(`${base}/v1/default/banks?limit=1`, { headers, signal: AbortSignal.timeout(1500), redirect: "error" });
    if (!banks.ok || !Array.isArray((await banks.json()).banks)) {
      return { ready: false, reachable: true, reason: "Hindsight bank API is inaccessible; check HINDSIGHT_API_TOKEN and server permissions." };
    }
    return { ready: true, reachable: true };
  } catch {
    return { ready: false, reachable, reason: "Hindsight API is unavailable or returned invalid JSON; check the configured endpoint, token and service." };
  }
}

async function startLocal(url) {
  if (url.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(url.hostname) || url.port !== "8888" || url.pathname !== "/") {
    throw new Error("Configured Hindsight endpoint is unavailable; restore that service. Local Docker setup only supports http://localhost:8888 or http://127.0.0.1:8888 and will not redirect your endpoint.");
  }
  const docker = await command("docker", ["info", "--format", "{{.ServerVersion}}"], 3000);
  if (docker.missing) throw new Error("Missing Docker CLI and Docker Compose; install Docker, start its daemon yourself, then rerun install.");
  if (!docker.ok) throw new Error("Docker daemon is unavailable; start Docker yourself, then rerun install.");
  if (!(await command("docker", ["compose", "version"], 3000)).ok) throw new Error("Missing Docker Compose plugin; install it, then rerun install.");
  const directory = resolve(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "hindsight");
  const compose = join(directory, "compose.yaml");
  const alternative = join(directory, "compose.yml");
  const file = existsSync(compose) ? compose : existsSync(alternative) ? alternative : compose;
  const containers = await command("docker", ["ps", "-a", "--filter", "name=^/hindsight$", "--format", "{{.ID}}"], 3000);
  if (!containers.ok) throw new Error("Cannot inspect Docker containers; no runtime files were changed.");
  if (containers.stdout.trim()) {
    const inspected = await command("docker", ["container", "inspect", "hindsight", "--format", "{{json .Config.Labels}}"], 3000);
    let labels;
    try { labels = JSON.parse(inspected.stdout); } catch { labels = null; }
    if (!inspected.ok || !existsSync(file) || !labels?.["com.docker.compose.project.config_files"]?.split(",").includes(file)) {
      throw new Error("An unmanaged hindsight container already exists; reuse its service or resolve the name collision manually. Nothing was replaced.");
    }
  }
  const credentials = join(directory, "llm.env");
  if (!existsSync(file) && !existsSync(credentials)) {
    const required = ["HINDSIGHT_API_LLM_PROVIDER", "HINDSIGHT_API_LLM_MODEL", "HINDSIGHT_API_LLM_API_KEY"];
    if (required.some((key) => !process.env[key]?.trim())) {
      throw new Error("Missing Hindsight LLM credentials; provide llm.env in the Hindsight config directory or explicitly export HINDSIGHT_API_LLM_PROVIDER, HINDSIGHT_API_LLM_MODEL and HINDSIGHT_API_LLM_API_KEY. omp/provider auth is never copied.");
    }
    const entries = Object.entries(process.env).filter(([key]) => /^HINDSIGHT_API_LLM_[A-Z0-9_]+$/.test(key));
    if (entries.some(([, value]) => /[\r\n\0]/.test(value))) throw new Error("Hindsight LLM environment values must be single-line; supply your own llm.env instead.");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    writeFileSync(credentials, entries.map(([key, value]) => `${key}=${JSON.stringify(value).replace(/\$/g, () => "$$")}`).join("\n") + "\n", { flag: "wx", mode: 0o600 });
  }
  if (!existsSync(file)) {
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    writeFileSync(file, readFileSync(new URL("./hindsight-compose.yaml", import.meta.url)), { flag: "wx", mode: 0o600 });
  }
  const started = await command("docker", ["compose", "-f", file, "up", "-d", "--no-recreate"], 120000);
  if (!started.ok) throw new Error("Docker Compose could not start Hindsight within 120s; inspect your runtime configuration privately and retry. Existing containers, files and volumes were preserved.");
}

async function main() {
  const mode = process.argv[2];
  if (!["check", "report", "install"].includes(mode) || process.argv.length !== 3) throw new Error("Usage: node scripts/hindsight.mjs check|report|install");
  const config = await configuration();
  const url = endpoint(config.apiUrl);
  if (!["off", "hindsight"].includes(config.backend)) {
    throw new Error("Another omp memory backend is selected and was preserved. To explicitly select Hindsight, run `omp config set memory.backend hindsight` in this project/profile.");
  }
  let health = await readiness(config);
  if (mode === "install" && !health.ready) {
    if (health.reachable) throw new Error(health.reason);
    await startLocal(url);
    const deadline = Date.now() + 90000;
    do {
      health = await readiness(config);
      if (health.ready) break;
      await setTimeout(1000);
    } while (Date.now() < deadline);
  }
  if (!health.ready) throw new Error(`${health.reason} Run \`node scripts/hindsight.mjs install\` for explicit local setup, or restore your configured remote service.`);
  if (config.omp && config.backend === "off") {
    if (mode !== "install") throw new Error("Hindsight API is ready, but omp memory is off. Run `node scripts/hindsight.mjs install` to enable the native backend explicitly.");
    if (!(await command("omp", ["config", "set", "memory.backend", "hindsight"], 3000)).ok) {
      throw new Error("Hindsight API is ready, but omp configuration could not be updated; run `omp config set memory.backend hindsight` in this project/profile.");
    }
    if ((await configuration()).backend !== "hindsight") {
      throw new Error("Hindsight API is ready, but another settings layer keeps omp memory disabled; update the active project/profile configuration explicitly.");
    }
  }
  if (mode !== "check") console.log(`Hindsight ready: API healthy, database connected, bank API accessible; ${config.omp ? "omp native memory.backend=hindsight" : "server available (omp not installed)"}.`);
}

main().catch((error) => {
  const safe = error instanceof Error && /^(Hindsight|Missing|Cannot|Invalid|Configured|Docker|An unmanaged|Another|Usage:)/.test(error.message);
  console.error(`Hindsight: ${safe ? error.message : "Setup failed; inspect prerequisites and runtime configuration privately. No secret output is forwarded."}`);
  process.exitCode = 1;
});
