import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";

const execute = promisify(execFile);
const script = fileURLToPath(new URL("../scripts/hindsight.mjs", import.meta.url));

function fixture(t, settings = {}) {
  const root = mkdtempSync(join(tmpdir(), "ai-kit-hindsight-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, "bin");
  mkdirSync(bin);
  symlinkSync(process.execPath, join(bin, "node"));
  const config = join(root, "settings.json");
  const calls = join(root, "calls.jsonl");
  const marker = join(root, "started");
  const directory = join(root, "config", "hindsight");
  writeFileSync(config, JSON.stringify({ "memory.backend": "hindsight", "hindsight.apiUrl": "http://127.0.0.1:1", "hindsight.apiToken": "config-secret", unrelated: { bank: "user-bank", profile: "kept" }, ...settings }));
  writeFileSync(join(bin, "omp"), `#!/usr/bin/env node
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
const args=process.argv.slice(2);
appendFileSync(process.env.TEST_CALLS,JSON.stringify({binary:'omp',args,profile:process.env.OMP_PROFILE,agentDir:process.env.PI_CODING_AGENT_DIR})+'\\n');
const config=JSON.parse(readFileSync(process.env.TEST_CONFIG,'utf8'));
if(process.env.TEST_OMP_FAILURE){console.error('config-secret env-secret');process.exit(1);}
if(args[1]==='get') console.log(JSON.stringify({key:args[2],value:process.env.TEST_OMP_PINNED && args[2]==='memory.backend'?'off':config[args[2]]}));
else {config[args[2]]=args[3];writeFileSync(process.env.TEST_CONFIG,JSON.stringify(config));}
`, { mode: 0o755 });
  writeFileSync(join(bin, "docker"), `#!/usr/bin/env node
import {appendFileSync,writeFileSync} from 'node:fs';
const args=process.argv.slice(2);
appendFileSync(process.env.TEST_CALLS,JSON.stringify({binary:'docker',args})+'\\n');
if(process.env.TEST_DOCKER_FAILURE===args[0] || (process.env.TEST_DOCKER_FAILURE==='up' && args.includes('up'))){console.error('config-secret env-secret llm-secret');process.exit(1);}
if(args[0]==='ps') console.log(process.env.TEST_COLLISION ? 'container-id' : '');
if(args[0]==='container') console.log(process.env.TEST_LABELS || '{}');
if(args.includes('up')) writeFileSync(process.env.TEST_MARKER,'ready');
`, { mode: 0o755 });
  const preload = join(root, "lifecycle.mjs");
  writeFileSync(preload, `import {existsSync} from 'node:fs';
globalThis.fetch=async(url)=>{if(!existsSync(process.env.TEST_MARKER))throw new Error('unavailable');return {ok:true,json:async()=>url.includes('/health')?{status:'healthy',database:'connected'}:{banks:[]}};};
`);
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(HINDSIGHT_|OMP_|PI_|NODE_OPTIONS$|OPENAI_API_KEY$)/.test(key)));
  return {
    root, config, directory, marker,
    calls: () => existsSync(calls) ? readFileSync(calls, "utf8").trim().split("\n").map(JSON.parse) : [],
    settings: () => JSON.parse(readFileSync(config, "utf8")),
    async run(mode, overrides = {}, lifecycle = false) {
      const options = { cwd: root, encoding: "utf8", timeout: 12000, env: { ...env, PATH: `${bin}${delimiter}${process.env.PATH}`, HOME: root, XDG_CONFIG_HOME: join(root, "config"), AI_KIT_CLIENT: "omp", TEST_CONFIG: config, TEST_CALLS: calls, TEST_MARKER: marker, ...overrides } };
      try {
        const result = await execute(process.execPath, [...(lifecycle ? ["--import", preload] : []), script, mode], options);
        return { ...result, code: 0 };
      } catch (error) {
        return { stdout: error.stdout, stderr: error.stderr, code: error.code };
      }
    },
  };
}

async function server(t, handler) {
  const http = createServer(handler);
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => http.close(resolve)));
  return `http://127.0.0.1:${http.address().port}`;
}

async function healthy(t, token = "config-secret") {
  return server(t, (request, response) => {
    assert.equal(request.method, "GET");
    assert.equal(request.headers.authorization, `Bearer ${token}`);
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify(request.url === "/health" ? { status: "healthy", database: "connected" } : { banks: [], total: 0 }));
  });
}

test("check is quiet and read-only; report and repeat install reuse a healthy configured remote without Docker", async (t) => {
  const url = await healthy(t);
  const f = fixture(t, { "hindsight.apiUrl": url });
  const before = readFileSync(f.config, "utf8");
  for (const mode of ["check", "report", "install", "install"]) {
    const result = await f.run(mode, { OMP_PROFILE: "user-profile", PI_CODING_AGENT_DIR: join(f.root, "custom-agent") });
    assert.equal(result.code, 0, result.stderr);
    assert.equal(result.stderr, "");
    if (mode === "check") assert.equal(result.stdout, "");
    else assert.match(result.stdout, /database connected.*omp native/);
  }
  assert.equal(readFileSync(f.config, "utf8"), before);
  assert.equal(existsSync(f.directory), false);
  assert.ok(f.calls().every((call) => call.binary === "omp" && call.args[1] === "get" && call.profile === "user-profile" && call.agentDir.endsWith("custom-agent")));
});

for (const body of ["not JSON", { status: "healthy" }, { status: "unhealthy", database: "connected" }, { status: "healthy", database: "error" }]) {
  test(`rejects deceptive health HTTP 200: ${JSON.stringify(body)}`, async (t) => {
    const url = await server(t, (_, response) => response.end(typeof body === "string" ? body : JSON.stringify(body)));
    const f = fixture(t, { "hindsight.apiUrl": url });
    for (const mode of ["check", "report", "install"]) assert.notEqual((await f.run(mode)).code, 0);
    assert.ok(f.calls().every((call) => call.binary === "omp" && call.args[1] === "get"));
    assert.equal(existsSync(f.directory), false);
  });
}

test("environment endpoint/token override settings without persisting or printing secrets", async (t) => {
  const url = await healthy(t, "env-secret");
  const f = fixture(t);
  const result = await f.run("check", { HINDSIGHT_API_URL: url, HINDSIGHT_API_TOKEN: "env-secret" });
  assert.equal(result.code, 0, result.stderr);
  assert.equal(f.settings()["hindsight.apiUrl"], "http://127.0.0.1:1");
  assert.doesNotMatch(result.stdout + result.stderr, /config-secret|env-secret/);
});

test("an unset optional API token works with an unauthenticated local server", async (t) => {
  const url = await server(t, (request, response) => {
    assert.equal(request.headers.authorization, undefined);
    response.end(JSON.stringify(request.url === "/health" ? { status: "healthy", database: "connected" } : { banks: [] }));
  });
  const f = fixture(t, { "hindsight.apiUrl": url, "hindsight.apiToken": undefined });
  const result = await f.run("report");
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /bank API accessible/);
});

test("unavailable configured remote fails without Docker or endpoint changes", async (t) => {
  const f = fixture(t);
  for (const mode of ["check", "report", "install"]) {
    const result = await f.run(mode);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /unavailable/);
  }
  assert.ok(f.calls().every((call) => call.binary === "omp" && call.args[1] === "get"));
  assert.equal(existsSync(f.directory), false);
  assert.equal(f.settings()["hindsight.apiUrl"], "http://127.0.0.1:1");
});

test("explicit alternative backend is preserved even during install", async (t) => {
  const f = fixture(t, { "memory.backend": "mnemopi" });
  for (const mode of ["check", "report", "install"]) {
    const result = await f.run(mode);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /omp config set memory.backend hindsight/);
  }
  assert.equal(f.settings()["memory.backend"], "mnemopi");
  assert.ok(f.calls().every((call) => call.binary === "omp" && call.args[1] === "get"));
});

test("healthy API with memory off is not ready until explicit install changes only the backend", async (t) => {
  const url = await healthy(t);
  const f = fixture(t, { "hindsight.apiUrl": url, "memory.backend": "off" });
  const before = f.settings();
  assert.notEqual((await f.run("check")).code, 0);
  assert.equal(f.settings()["memory.backend"], "off");
  assert.equal((await f.run("install")).code, 0);
  assert.deepEqual(f.settings(), { ...before, "memory.backend": "hindsight" });
  assert.equal(f.calls().filter((call) => call.args[1] === "set").length, 1);
});

test("a settings override cannot make a successful config write look like enabled memory", async (t) => {
  const url = await healthy(t);
  const f = fixture(t, { "hindsight.apiUrl": url, "memory.backend": "off" });
  const result = await f.run("install", { TEST_OMP_PINNED: "yes" });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /another settings layer/);
  assert.doesNotMatch(result.stdout, /Hindsight ready/);
});

test("protected bank API must be accessible despite healthy public health", async (t) => {
  const url = await server(t, (request, response) => {
    response.statusCode = request.url === "/health" ? 200 : 401;
    response.end(JSON.stringify({ status: "healthy", database: "connected" }));
  });
  const f = fixture(t, { "hindsight.apiUrl": url });
  const result = await f.run("install");
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /bank API/);
  assert.ok(f.calls().every((call) => call.binary === "omp"));
});

test("redirects do not forward authentication to another server", async (t) => {
  let leaked = false;
  const destination = await server(t, (_, response) => { leaked = true; response.end("{}"); });
  const url = await server(t, (_, response) => { response.writeHead(302, { location: destination }); response.end(); });
  const f = fixture(t, { "hindsight.apiUrl": url });
  assert.notEqual((await f.run("check")).code, 0);
  assert.equal(leaked, false);
});

test("local lifecycle creates private explicit credentials and preserves runtime files on repeat install", async (t) => {
  const f = fixture(t, { "hindsight.apiUrl": "http://localhost:8888", "memory.backend": "off" });
  const result = await f.run("install", { HINDSIGHT_API_LLM_PROVIDER: "openai", HINDSIGHT_API_LLM_MODEL: "test-model", HINDSIGHT_API_LLM_API_KEY: "llm-secret", OPENAI_API_KEY: "unrelated-auth" }, true);
  assert.equal(result.code, 0, result.stderr);
  const compose = readFileSync(join(f.directory, "compose.yaml"), "utf8");
  const credentials = readFileSync(join(f.directory, "llm.env"), "utf8");
  assert.doesNotMatch(compose, /llm-secret|unrelated-auth/);
  assert.match(credentials, /llm-secret/);
  assert.doesNotMatch(credentials, /unrelated-auth/);
  assert.equal(statSync(join(f.directory, "llm.env")).mode & 0o777, 0o600);
  assert.equal((await f.run("install", {}, true)).code, 0);
  assert.equal(readFileSync(join(f.directory, "compose.yaml"), "utf8"), compose);
  assert.equal(readFileSync(join(f.directory, "llm.env"), "utf8"), credentials);
  const up = f.calls().filter((call) => call.binary === "docker" && call.args.includes("up"));
  assert.equal(up.length, 1);
  assert.ok(up[0].args.includes("--no-recreate"));
  assert.doesNotMatch(result.stdout + result.stderr, /config-secret|llm-secret|unrelated-auth/);
});

test("existing compose and credentials are never overwritten, including failed startup", async (t) => {
  const f = fixture(t, { "hindsight.apiUrl": "http://localhost:8888" });
  mkdirSync(f.directory, { recursive: true });
  writeFileSync(join(f.directory, "compose.yaml"), "user runtime\n");
  writeFileSync(join(f.directory, "llm.env"), "user credential sentinel\n");
  const result = await f.run("install", { TEST_DOCKER_FAILURE: "up" }, true);
  assert.notEqual(result.code, 0);
  assert.equal(readFileSync(join(f.directory, "compose.yaml"), "utf8"), "user runtime\n");
  assert.equal(readFileSync(join(f.directory, "llm.env"), "utf8"), "user credential sentinel\n");
  assert.doesNotMatch(result.stdout + result.stderr, /config-secret|env-secret|llm-secret|user credential sentinel/);
});

for (const [overrides, message] of [[{ TEST_COLLISION: "yes" }, /unmanaged/], [{ TEST_DOCKER_FAILURE: "info" }, /daemon/], [{}, /Missing Hindsight LLM credentials/]]) {
  test(`local install boundary fails safely: ${message}`, async (t) => {
    const f = fixture(t, { "hindsight.apiUrl": "http://localhost:8888" });
    const result = await f.run("install", overrides, true);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, message);
    assert.equal(existsSync(f.directory), false);
    assert.doesNotMatch(result.stdout + result.stderr, /config-secret|env-secret|llm-secret/);
    assert.ok(f.calls().every((call) => !call.args.includes("up") && !call.args.includes("set")));
  });
}

test("configuration subprocess diagnostics and credential-bearing endpoints are never forwarded", async (t) => {
  const f = fixture(t);
  const failure = await f.run("check", { TEST_OMP_FAILURE: "yes" });
  assert.notEqual(failure.code, 0);
  assert.doesNotMatch(failure.stdout + failure.stderr, /config-secret|env-secret/);
  const invalid = await f.run("report", { HINDSIGHT_API_URL: "https://user:password@host.invalid/?token=url-secret" });
  assert.notEqual(invalid.code, 0);
  assert.doesNotMatch(invalid.stdout + invalid.stderr, /password|url-secret/);
});

test("local check/report never create credentials, run Docker or enable memory", async (t) => {
  const f = fixture(t, { "hindsight.apiUrl": "http://localhost:8888", "memory.backend": "off" });
  for (const mode of ["check", "report"]) {
    const result = await f.run(mode, { HINDSIGHT_API_LLM_PROVIDER: "openai", HINDSIGHT_API_LLM_MODEL: "model", HINDSIGHT_API_LLM_API_KEY: "llm-secret" }, true);
    assert.notEqual(result.code, 0);
    assert.doesNotMatch(result.stdout + result.stderr, /llm-secret/);
  }
  assert.equal(existsSync(f.directory), false);
  assert.equal(f.settings()["memory.backend"], "off");
  assert.ok(f.calls().every((call) => call.binary === "omp" && call.args[1] === "get"));
});

test("omp client requires the CLI while other clients can use a healthy server without it", async (t) => {
  const url = await healthy(t, "env-secret");
  const f = fixture(t);
  rmSync(join(f.root, "bin", "omp"));
  const env = { PATH: join(f.root, "bin"), HINDSIGHT_API_URL: url, HINDSIGHT_API_TOKEN: "env-secret" };
  const missing = await f.run("check", env);
  assert.notEqual(missing.code, 0);
  assert.match(missing.stderr, /Missing omp CLI/);
  assert.equal((await f.run("check", { ...env, AI_KIT_CLIENT: "claude" })).code, 0);
  assert.equal(existsSync(f.directory), false);
});

test("missing Docker CLI is named without creating local runtime files", async (t) => {
  const f = fixture(t, { "hindsight.apiUrl": "http://localhost:8888" });
  rmSync(join(f.root, "bin", "docker"));
  const result = await f.run("install", { PATH: join(f.root, "bin") }, true);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /Missing Docker CLI/);
  assert.equal(existsSync(f.directory), false);
});

test("a stopped Compose-owned runtime restarts without recreating containers or rewriting user files", async (t) => {
  const f = fixture(t, { "hindsight.apiUrl": "http://localhost:8888" });
  mkdirSync(f.directory, { recursive: true });
  const compose = join(f.directory, "compose.yaml");
  writeFileSync(compose, "custom runtime kept\n");
  writeFileSync(join(f.directory, "llm.env"), "custom credentials kept\n");
  const result = await f.run("install", {
    TEST_COLLISION: "yes",
    TEST_LABELS: JSON.stringify({ "com.docker.compose.project.config_files": compose }),
  }, true);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(readFileSync(compose, "utf8"), "custom runtime kept\n");
  assert.equal(readFileSync(join(f.directory, "llm.env"), "utf8"), "custom credentials kept\n");
  const docker = f.calls().filter((call) => call.binary === "docker");
  assert.ok(docker.some((call) => call.args.includes("up") && call.args.includes("--no-recreate")));
  assert.ok(docker.every((call) => !call.args.some((arg) => ["down", "rm", "volume", "--force-recreate"].includes(arg))));
});

test("an existing Compose runtime supplies its own credentials without a kit llm.env", async (t) => {
  const f = fixture(t, { "hindsight.apiUrl": "http://localhost:8888" });
  mkdirSync(f.directory, { recursive: true });
  const compose = join(f.directory, "compose.yaml");
  writeFileSync(compose, "custom runtime with another credential source\n");
  const result = await f.run("install", {}, true);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(existsSync(join(f.directory, "llm.env")), false);
  assert.equal(readFileSync(compose, "utf8"), "custom runtime with another credential source\n");
});
