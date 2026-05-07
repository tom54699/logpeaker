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

test("resolveContentWidthVar returns percentage string for positive values", () => {
  assert.equal(resolveContentWidthVar(90), "90%");
  assert.equal(resolveContentWidthVar(80), "80%");
  assert.equal(resolveContentWidthVar(70), "70%");
  assert.equal(resolveContentWidthVar(60), "60%");
  assert.equal(resolveContentWidthVar(50), "50%");
});

test("resolveContentWidthVar returns null for negative values", () => {
  assert.equal(resolveContentWidthVar(-1), null);
});
