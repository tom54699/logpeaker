import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { DEFAULT_DISPLAY_SETTINGS, resolveContentWidthVar } = require("../out/panel/displaySettings.js");

test("DEFAULT_DISPLAY_SETTINGS has contentWidth of 0", () => {
  assert.equal(DEFAULT_DISPLAY_SETTINGS.contentWidth, 0);
});

test("DEFAULT_DISPLAY_SETTINGS has expected fontSize and lineHeight", () => {
  assert.equal(DEFAULT_DISPLAY_SETTINGS.fontSize, 13);
  assert.equal(DEFAULT_DISPLAY_SETTINGS.lineHeight, 1.6);
});

test("resolveContentWidthVar returns null for 0 (full width)", () => {
  assert.equal(resolveContentWidthVar(0), null);
});

test("resolveContentWidthVar returns ch string for positive values", () => {
  assert.equal(resolveContentWidthVar(120), "120ch");
  assert.equal(resolveContentWidthVar(100), "100ch");
  assert.equal(resolveContentWidthVar(80), "80ch");
  assert.equal(resolveContentWidthVar(65), "65ch");
  assert.equal(resolveContentWidthVar(50), "50ch");
});

test("resolveContentWidthVar returns null for negative values", () => {
  assert.equal(resolveContentWidthVar(-1), null);
});
