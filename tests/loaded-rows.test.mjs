import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  getLineDigits,
  getRowDecoration,
  normalizeContentRows,
  resolveTopLineFromMetrics,
} = require("../out/panel/loadedRows.js");

test("normalizeContentRows normalizes newline variants once", () => {
  assert.deepEqual(normalizeContentRows("a\r\nb\rc"), ["a", "b", "c"]);
});

test("getRowDecoration preserves mixed tag rules", () => {
  assert.deepEqual(getRowDecoration("", 1), { tag: "TRACE", tone: "trace" });
  assert.deepEqual(getRowDecoration("Short", 0), { tag: "CORE", tone: "core" });
  assert.deepEqual(getRowDecoration("line 7 with enough width", 6), { tag: "IO", tone: "io" });
  assert.deepEqual(getRowDecoration("line 17 with enough width", 16), { tag: "WARN", tone: "warn" });
});

test("getLineDigits scales with line count", () => {
  assert.equal(getLineDigits(9), 1);
  assert.equal(getLineDigits(99), 2);
  assert.equal(getLineDigits(1000), 4);
});

test("resolveTopLineFromMetrics finds the first visible line from row metrics", () => {
  const metrics = [
    { line: 1, offsetTop: 0, offsetHeight: 20 },
    { line: 2, offsetTop: 20, offsetHeight: 20 },
    { line: 3, offsetTop: 40, offsetHeight: 20 },
    { line: 4, offsetTop: 60, offsetHeight: 20 },
  ];

  assert.equal(resolveTopLineFromMetrics(metrics, 0), 1);
  assert.equal(resolveTopLineFromMetrics(metrics, 19), 1);
  assert.equal(resolveTopLineFromMetrics(metrics, 20), 2);
  assert.equal(resolveTopLineFromMetrics(metrics, 55), 3);
  assert.equal(resolveTopLineFromMetrics(metrics, 999), 4);
});
