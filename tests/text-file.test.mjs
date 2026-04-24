import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createTextRows, decodeUtf8Text } = require("../out/panel/textFile.js");

test("decodeUtf8Text decodes utf-8 bytes", () => {
  const bytes = new Uint8Array(Buffer.from("hello log peak", "utf8"));

  assert.equal(decodeUtf8Text(bytes), "hello log peak");
});

test("decodeUtf8Text strips utf-8 bom", () => {
  const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...Buffer.from("hello", "utf8")]);

  assert.equal(decodeUtf8Text(bytes), "hello");
});

test("decodeUtf8Text rejects invalid utf-8", () => {
  const invalid = new Uint8Array([0xff, 0xfe, 0x00, 0x61]);

  assert.throws(
    () => decodeUtf8Text(invalid),
    /Only UTF-8 and UTF-8 with BOM text files are supported/,
  );
});

test("createTextRows normalizes windows and classic mac newlines", () => {
  assert.deepEqual(createTextRows("a\r\nb\rc"), ["a", "b", "c"]);
});
