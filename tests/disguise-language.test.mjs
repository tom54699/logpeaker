import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  createRowDecorations,
  formatLoadedMeta,
  getDisplayFileName,
  getToolbarSourceLabel,
} = require("../out/panel/disguiseLanguage.js");

test("formatLoadedMeta uses file name and ready state", () => {
  assert.equal(formatLoadedMeta("novels/library/chapter-01.txt"), "utf-8 :: chapter-01.txt :: ready");
});

test("getDisplayFileName handles windows-style paths", () => {
  assert.equal(getDisplayFileName("novels\\library\\chapter-02.txt"), "chapter-02.txt");
});

test("getToolbarSourceLabel stays minimal", () => {
  assert.equal(getToolbarSourceLabel(), "local file");
});

test("createRowDecorations tags every row and mixes tag families", () => {
  const content = [
    "Short",
    "",
    "line 2 with enough width",
    "line 3 with enough width",
    "line 4 with enough width",
    "line 5 with enough width",
    "line 6 with enough width",
    "line 7 with enough width",
    "line 8 with enough width",
    "line 9 with enough width",
    "line 10 with enough width",
    "line 11 with enough width",
    "line 12 with enough width",
    "line 13 with enough width",
    "line 14 with enough width",
    "line 15 with enough width",
    "line 16 with enough width",
    "line 17 with enough width",
    "line 18 with enough width",
    "line 19 with enough width",
    "line 20 with enough width",
  ].join("\n");

  const decorations = createRowDecorations(content);

  assert.equal(decorations[1].tag, "TRACE");
  assert.equal(decorations[0].tag, "CORE");
  assert.ok(decorations.some((item) => item.tag === "INFO"));
  assert.ok(decorations.some((item) => item.tag === "IO"));
  assert.ok(decorations.some((item) => item.tag === "TRACE"));
  assert.ok(decorations.some((item) => item.tag === "WARN"));
  assert.ok(decorations.every((item) => typeof item.tag === "string" && item.tag.length > 0));
});
