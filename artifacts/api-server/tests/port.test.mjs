import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/port.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { parsePort } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

test("accepts valid TCP ports", () => {
  assert.equal(parsePort("1"), 1);
  assert.equal(parsePort("3000"), 3000);
  assert.equal(parsePort("65535"), 65535);
});

test("rejects missing and invalid TCP ports", () => {
  assert.throws(() => parsePort(undefined), /PORT environment variable is required/);
  for (const value of ["", "0", "-1", "1.5", "65536", "Infinity", "NaN", "abc"]) {
    assert.throws(() => parsePort(value), /PORT|Invalid PORT value/);
  }
});
