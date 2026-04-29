import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// adm-zip is a real dependency — no mock needed
const { stripHtml, parseEpub } = require("../out/panel/epubFile.js");

// ── stripHtml ────────────────────────────────────────────────────────────────

test("stripHtml removes HTML tags", () => {
  assert.equal(stripHtml("<p>hello</p>"), "hello");
});

test("stripHtml converts </p> to newline", () => {
  const result = stripHtml("<p>line one</p><p>line two</p>");
  assert.ok(result.includes("\n"), "should contain newline between paragraphs");
  assert.ok(result.includes("line one"));
  assert.ok(result.includes("line two"));
});

test("stripHtml converts <br> to newline", () => {
  const result = stripHtml("line one<br/>line two");
  assert.ok(result.includes("\n"));
});

test("stripHtml decodes common HTML entities", () => {
  assert.ok(stripHtml("&amp;x").includes("&"), "should decode &amp;");
  assert.ok(stripHtml("&lt;x").includes("<"), "should decode &lt;");
  assert.ok(stripHtml("&gt;x").includes(">"), "should decode &gt;");
  assert.ok(stripHtml('&quot;x').includes('"'), "should decode &quot;");
  assert.ok(stripHtml("x&nbsp;y").includes(" "), "should decode &nbsp;");
});

test("stripHtml decodes numeric character references", () => {
  assert.equal(stripHtml("&#20013;&#25991;"), "中文");
});

test("stripHtml decodes hex character references", () => {
  assert.equal(stripHtml("&#x4e2d;&#x6587;"), "中文");
});

test("stripHtml strips style and script blocks", () => {
  const result = stripHtml("<style>body{color:red}</style><p>text</p><script>alert(1)</script>");
  assert.ok(!result.includes("color"));
  assert.ok(!result.includes("alert"));
  assert.equal(result.trim(), "text");
});

test("stripHtml collapses excessive blank lines", () => {
  const result = stripHtml("<p>a</p>\n\n\n\n<p>b</p>");
  assert.ok(!result.includes("\n\n\n"), "should not have 3+ consecutive newlines");
});

// ── parseEpub ─────────────────────────────────────────────────────────────────
// Build a minimal valid EPUB zip in memory using adm-zip

function buildMinimalEpub(chapters) {
  const AdmZip = require("adm-zip");
  const zip = new AdmZip();

  zip.addFile("mimetype", Buffer.from("application/epub+zip", "utf8"));

  zip.addFile(
    "META-INF/container.xml",
    Buffer.from(
      '<?xml version="1.0"?>' +
      '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
      '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>' +
      "</container>",
      "utf8",
    ),
  );

  let manifestItems = "";
  let spineItems = "";
  for (let i = 0; i < chapters.length; i++) {
    const id = `ch${i + 1}`;
    const href = `chapter${i + 1}.xhtml`;
    manifestItems += `<item id="${id}" href="${href}" media-type="application/xhtml+xml"/>`;
    spineItems += `<itemref idref="${id}"/>`;
  }

  zip.addFile(
    "OEBPS/content.opf",
    Buffer.from(
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<package xmlns="http://www.idpf.org/2007/opf" version="2.0">' +
      `<manifest>${manifestItems}</manifest>` +
      `<spine>${spineItems}</spine>` +
      "</package>",
      "utf8",
    ),
  );

  for (let i = 0; i < chapters.length; i++) {
    zip.addFile(
      `OEBPS/chapter${i + 1}.xhtml`,
      Buffer.from(
        `<?xml version="1.0"?><html><body><p>${chapters[i]}</p></body></html>`,
        "utf8",
      ),
    );
  }

  return zip.toBuffer();
}

test("parseEpub returns one chapter per spine entry", () => {
  const epubBytes = buildMinimalEpub(["第一章內容", "第二章內容", "第三章內容"]);
  const chapters = parseEpub(new Uint8Array(epubBytes));
  assert.equal(chapters.length, 3);
});

test("parseEpub extracts chapter content as plain text", () => {
  const epubBytes = buildMinimalEpub(["第一章內容"]);
  const chapters = parseEpub(new Uint8Array(epubBytes));
  assert.equal(chapters[0].content, "第一章內容");
});

test("parseEpub assigns fallback titles", () => {
  const epubBytes = buildMinimalEpub(["ch1", "ch2"]);
  const chapters = parseEpub(new Uint8Array(epubBytes));
  assert.equal(chapters[0].title, "第 1 章");
  assert.equal(chapters[1].title, "第 2 章");
});

test("parseEpub throws on invalid epub", () => {
  assert.throws(() => {
    parseEpub(new Uint8Array([0x00, 0x01, 0x02]));
  });
});

// ── NCX / nav title parsing ───────────────────────────────────────────────────

function buildEpubWithNcx(chapters, titles) {
  const AdmZip = require("adm-zip");
  const zip = new AdmZip();

  zip.addFile("mimetype", Buffer.from("application/epub+zip", "utf8"));
  zip.addFile(
    "META-INF/container.xml",
    Buffer.from(
      '<?xml version="1.0"?>' +
      '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
      '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>' +
      "</container>",
      "utf8",
    ),
  );

  let manifestItems = '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>';
  let spineItems = "";
  for (let i = 0; i < chapters.length; i++) {
    const id = `ch${i + 1}`;
    manifestItems += `<item id="${id}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`;
    spineItems += `<itemref idref="${id}"/>`;
  }

  zip.addFile(
    "OEBPS/content.opf",
    Buffer.from(
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<package xmlns="http://www.idpf.org/2007/opf" version="2.0">' +
      `<manifest>${manifestItems}</manifest>` +
      `<spine toc="ncx">${spineItems}</spine>` +
      "</package>",
      "utf8",
    ),
  );

  const navPoints = titles.map((t, i) =>
    `<navPoint id="np${i}"><navLabel><text>${t}</text></navLabel><content src="chapter${i + 1}.xhtml"/></navPoint>`
  ).join("");
  zip.addFile(
    "OEBPS/toc.ncx",
    Buffer.from(
      '<?xml version="1.0"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">' +
      `<navMap>${navPoints}</navMap></ncx>`,
      "utf8",
    ),
  );

  for (let i = 0; i < chapters.length; i++) {
    zip.addFile(
      `OEBPS/chapter${i + 1}.xhtml`,
      Buffer.from(`<?xml version="1.0"?><html><body><p>${chapters[i]}</p></body></html>`, "utf8"),
    );
  }

  return zip.toBuffer();
}

function buildEpubWithNav(chapters, titles) {
  const AdmZip = require("adm-zip");
  const zip = new AdmZip();

  zip.addFile("mimetype", Buffer.from("application/epub+zip", "utf8"));
  zip.addFile(
    "META-INF/container.xml",
    Buffer.from(
      '<?xml version="1.0"?>' +
      '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' +
      '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>' +
      "</container>",
      "utf8",
    ),
  );

  let manifestItems = '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>';
  let spineItems = "";
  for (let i = 0; i < chapters.length; i++) {
    const id = `ch${i + 1}`;
    manifestItems += `<item id="${id}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`;
    spineItems += `<itemref idref="${id}"/>`;
  }

  zip.addFile(
    "OEBPS/content.opf",
    Buffer.from(
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<package xmlns="http://www.idpf.org/2007/opf" version="3.0">' +
      `<manifest>${manifestItems}</manifest>` +
      `<spine>${spineItems}</spine>` +
      "</package>",
      "utf8",
    ),
  );

  const liItems = titles.map((t, i) =>
    `<li><a href="chapter${i + 1}.xhtml">${t}</a></li>`
  ).join("");
  zip.addFile(
    "OEBPS/nav.xhtml",
    Buffer.from(
      '<?xml version="1.0"?><html xmlns:epub="http://www.idpf.org/2007/ops">' +
      '<body><nav epub:type="toc"><ol>' + liItems + '</ol></nav></body></html>',
      "utf8",
    ),
  );

  for (let i = 0; i < chapters.length; i++) {
    zip.addFile(
      `OEBPS/chapter${i + 1}.xhtml`,
      Buffer.from(`<?xml version="1.0"?><html><body><p>${chapters[i]}</p></body></html>`, "utf8"),
    );
  }

  return zip.toBuffer();
}

test("parseEpub reads chapter titles from NCX", () => {
  const epubBytes = buildEpubWithNcx(["第一章", "第二章"], ["序章", "第一回"]);
  const chapters = parseEpub(new Uint8Array(epubBytes));
  assert.equal(chapters[0].title, "序章");
  assert.equal(chapters[1].title, "第一回");
});

test("parseEpub reads chapter titles from EPUB3 nav", () => {
  const epubBytes = buildEpubWithNav(["ch1", "ch2"], ["Introduction", "Chapter One"]);
  const chapters = parseEpub(new Uint8Array(epubBytes));
  assert.equal(chapters[0].title, "Introduction");
  assert.equal(chapters[1].title, "Chapter One");
});

test("parseEpub falls back to 第 N 章 when no NCX or nav", () => {
  const epubBytes = buildMinimalEpub(["content"]);
  const chapters = parseEpub(new Uint8Array(epubBytes));
  assert.equal(chapters[0].title, "第 1 章");
});
