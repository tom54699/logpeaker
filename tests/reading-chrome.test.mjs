import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  COLLAPSIBLE_CHROME_COLLAPSE_SCROLL_TOP,
  COLLAPSIBLE_CHROME_EXPAND_SCROLL_TOP,
  resolveReadingChromeMode,
} = require("../out/panel/readingChrome.js");

test("resolveReadingChromeMode expands when pinned or hovered", () => {
  assert.equal(
    resolveReadingChromeMode({
      scrollTop: 999,
      pinned: true,
      hovered: false,
      previousMode: "collapsed",
    }),
    "expanded",
  );

  assert.equal(
    resolveReadingChromeMode({
      scrollTop: 999,
      pinned: false,
      hovered: true,
      previousMode: "collapsed",
    }),
    "expanded",
  );
});

test("resolveReadingChromeMode collapses after the collapse threshold", () => {
  assert.equal(
    resolveReadingChromeMode({
      scrollTop: COLLAPSIBLE_CHROME_COLLAPSE_SCROLL_TOP + 1,
      pinned: false,
      hovered: false,
      previousMode: "expanded",
    }),
    "collapsed",
  );
});

test("resolveReadingChromeMode expands again near the top threshold", () => {
  assert.equal(
    resolveReadingChromeMode({
      scrollTop: COLLAPSIBLE_CHROME_EXPAND_SCROLL_TOP,
      pinned: false,
      hovered: false,
      previousMode: "collapsed",
    }),
    "expanded",
  );
});

test("resolveReadingChromeMode keeps prior mode between thresholds", () => {
  assert.equal(
    resolveReadingChromeMode({
      scrollTop:
        Math.floor(
          (COLLAPSIBLE_CHROME_COLLAPSE_SCROLL_TOP + COLLAPSIBLE_CHROME_EXPAND_SCROLL_TOP) / 2,
        ),
      pinned: false,
      hovered: false,
      previousMode: "collapsed",
    }),
    "collapsed",
  );
});
