import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import test from "node:test";

// The test script builds first; each case runs the production entrypoint in isolation.
const entry = fileURLToPath(new URL("../dist/index.mjs", import.meta.url));

function environment(port) {
  const env = { ...process.env, NODE_ENV: "production", LOG_LEVEL: "info" };
  delete env.PORT;
  if (port !== undefined) env.PORT = port;
  return env;
}

for (const port of [undefined, "", "0", "-1", "1.5", "65536", "Infinity", "-Infinity", "NaN", "abc", " "]) {
  test(`bootstrap rejects PORT=${JSON.stringify(port)} before listening`, () => {
    const result = spawnSync(process.execPath, [entry], {
      env: environment(port),
      encoding: "utf8",
      timeout: 5_000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stderr);
    const expected = !port
      ? "PORT environment variable is required but was not provided."
      : `Invalid PORT value: "${port}"`;
    assert.ok(result.stderr.includes(expected), result.stderr);
    assert.doesNotMatch(result.stdout, /Server listening/);
  });
}

test("valid PORT starts the server and serves the health endpoint", { timeout: 10_000 }, async (t) => {
  const reservation = createServer();
  await new Promise((resolve, reject) => {
    reservation.once("error", reject);
    reservation.listen(0, "127.0.0.1", resolve);
  });
  const { port } = reservation.address();
  await new Promise((resolve, reject) => reservation.close((err) => err ? reject(err) : resolve()));

  const child = spawn(process.execPath, [entry], {
    env: environment(String(port)),
    stdio: ["ignore", "pipe", "pipe"],
  });
  const closed = once(child, "close");
  let output = "";
  let errors = "";
  child.stderr.on("data", (chunk) => { errors += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    await closed;
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server startup timed out: ${errors}`)), 5_000);
    child.once("error", (err) => { clearTimeout(timer); reject(err); });
    child.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Server exited (${code}): ${errors}`)); });
    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.includes("Server listening")) { clearTimeout(timer); resolve(); }
    });
  });

  const response = await fetch(`http://127.0.0.1:${port}/api/healthz`, {
    signal: AbortSignal.timeout(3_000),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.ok(output.includes(`"port":${port}`), output);
});
