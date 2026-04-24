import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  createReadingSession,
  parseReadingSession,
  resolveRestoreTarget,
} = require("../out/panel/sessionStore.js");

test("createReadingSession clamps numeric fields to safe values", () => {
  const session = createReadingSession({
    fileUri: "file:///tmp/demo.txt",
    fileName: "demo.txt",
    scrollTop: -12.8,
    topLine: 0,
    fileMtimeMs: -20,
  });

  assert.deepEqual(session, {
    fileUri: "file:///tmp/demo.txt",
    fileName: "demo.txt",
    scrollTop: 0,
    topLine: 1,
    fileMtimeMs: 0,
  });
});

test("parseReadingSession rejects invalid values", () => {
  assert.equal(parseReadingSession(null), null);
  assert.equal(parseReadingSession({ fileUri: "x" }), null);
});

test("parseReadingSession returns normalized stored sessions", () => {
  const session = parseReadingSession({
    fileUri: "file:///tmp/demo.txt",
    fileName: "demo.txt",
    scrollTop: 120.7,
    topLine: 8.9,
    fileMtimeMs: 999.2,
  });

  assert.deepEqual(session, {
    fileUri: "file:///tmp/demo.txt",
    fileName: "demo.txt",
    scrollTop: 120,
    topLine: 8,
    fileMtimeMs: 999,
  });
});

test("resolveRestoreTarget uses exact restore when mtime matches", () => {
  const target = resolveRestoreTarget(
    {
      fileUri: "file:///tmp/demo.txt",
      fileName: "demo.txt",
      scrollTop: 220,
      topLine: 12,
      fileMtimeMs: 500,
    },
    500,
  );

  assert.deepEqual(target, {
    scrollTop: 220,
    topLine: 12,
    strategy: "exact",
  });
});

test("resolveRestoreTarget falls back to line restore when mtime changes", () => {
  const target = resolveRestoreTarget(
    {
      fileUri: "file:///tmp/demo.txt",
      fileName: "demo.txt",
      scrollTop: 220,
      topLine: 12,
      fileMtimeMs: 500,
    },
    800,
  );

  assert.deepEqual(target, {
    scrollTop: 220,
    topLine: 12,
    strategy: "line",
  });
});
