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

for (const [value, expected] of [["1", 1], ["3000", 3000], ["65535", 65535]]) {
  test(`accepts TCP port ${value}`, () => {
    assert.equal(parsePort(value), expected);
  });
}

for (const value of [undefined, ""]) {
  test(`reports missing PORT for ${JSON.stringify(value)}`, () => {
    assert.throws(() => parsePort(value), {
      name: "Error",
      message: "PORT environment variable is required but was not provided.",
    });
  });
}

for (const value of [
  "0", "-1", "1.5", "65534.5", "65535.5", "65536", "99999999999999999999",
  "Infinity", "-Infinity", "1e309", "NaN", "abc", "3000abc", " ", "\t\n",
]) {
  test(`rejects invalid TCP port ${JSON.stringify(value)}`, () => {
    assert.throws(() => parsePort(value), {
      name: "Error",
      message: `Invalid PORT value: "${value}"`,
    });
  });
}
