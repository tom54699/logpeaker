import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  createBossModeRows,
  createDefaultReadingChromeSnapshot,
  formatBossModeMeta,
  normalizeReadingChromeSnapshot,
} = require("../out/panel/bossMode.js");

test("formatBossModeMeta uses a runtime service label", () => {
  assert.equal(
    formatBossModeMeta("novels/library/chapter-01.txt"),
    "service :: runtime-stream :: attached",
  );
});

test("createBossModeRows builds runtime-log rows with mixed tones", () => {
  const rows = createBossModeRows("novels/library/chapter-01.txt", 24);

  assert.equal(rows.length, 24);
  assert.equal(rows[0].tag, "CORE");
  assert.ok(rows.every((row) => !row.content.includes("chapter-01")));
  assert.ok(rows.some((row) => row.tag === "INFO"));
  assert.ok(rows.some((row) => row.tag === "WARN"));
  assert.ok(rows.some((row) => row.tag === "TRACE"));
  assert.ok(rows.some((row) => row.tag === "IO"));
});

test("normalizeReadingChromeSnapshot falls back to a safe default", () => {
  assert.deepEqual(
    normalizeReadingChromeSnapshot({ mode: "collapsed", pinned: true }),
    { mode: "collapsed", pinned: true },
  );

  assert.deepEqual(
    normalizeReadingChromeSnapshot({ mode: "invalid", pinned: false }),
    createDefaultReadingChromeSnapshot(),
  );
});
