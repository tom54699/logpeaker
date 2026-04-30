import AdmZip from "adm-zip";

export type Chapter = {
  title: string;
  content: string;
};

export function parseEpub(bytes: Uint8Array): Chapter[] {
  const zip = new AdmZip(Buffer.from(bytes));

  const opfPath = findOpfPath(zip);
  const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";
  const opfText = readZipEntry(zip, opfPath);

  const hrefs = parseSpineHrefs(opfText);
  if (hrefs.length === 0) {
    throw new Error("EPUB spine is empty or could not be parsed.");
  }

  const titleMap = parseNcxTitles(zip, opfDir, opfText) ?? parseNavTitles(zip, opfDir, opfText) ?? new Map<number, string>();

  return hrefs.map((href, index) => {
    const fullPath = resolvePath(opfDir, href);
    let html = "";
    try {
      html = readZipEntry(zip, fullPath);
    } catch {
      // fallback: try bare href and without leading opfDir
      try {
        html = readZipEntry(zip, href);
      } catch {
        html = "";
      }
    }
    const rawContent = stripHtml(html);
    const title = titleMap.get(index) ?? `第 ${index + 1} 章`;
    const content = dedupeLeadingTitle(rawContent, title);
    return { title, content };
  });
}

function findOpfPath(zip: AdmZip): string {
  const containerXml = readZipEntry(zip, "META-INF/container.xml");
  const match = containerXml.match(/full-path=["']([^"']+\.opf)["']/i);
  if (!match) {
    throw new Error("Cannot find OPF path in META-INF/container.xml");
  }
  return match[1];
}

function parseSpineHrefs(opfText: string): string[] {
  // Build id→href map from manifest, excluding nav documents
  const manifestMap = new Map<string, string>();
  const navIds = new Set<string>();
  const manifestSection = opfText.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i)?.[1] ?? "";
  const itemRegex = /<item[^>]+>/gi;
  let itemMatch: RegExpExecArray | null;
  while ((itemMatch = itemRegex.exec(manifestSection)) !== null) {
    const tag = itemMatch[0];
    const id = tag.match(/\bid=["']([^"']+)["']/i)?.[1];
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    const mediaType = tag.match(/\bmedia-type=["']([^"']+)["']/i)?.[1] ?? "";
    const properties = tag.match(/\bproperties=["']([^"']+)["']/i)?.[1] ?? "";
    if (id && /\bnav\b/.test(properties)) {
      navIds.add(id);
    }
    if (id && href && (mediaType.includes("xhtml") || mediaType.includes("html"))) {
      manifestMap.set(id, decodeURIComponent(href));
    }
  }

  // Read spine itemref order
  const spineSection = opfText.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i)?.[1] ?? "";
  const idrefRegex = /<itemref[^>]+\bidref=["']([^"']+)["'][^>]*>/gi;
  const hrefs: string[] = [];
  let refMatch: RegExpExecArray | null;
  while ((refMatch = idrefRegex.exec(spineSection)) !== null) {
    const idref = refMatch[1];
    const href = manifestMap.get(idref);
    if (href && !navIds.has(idref)) {
      hrefs.push(href);
    }
  }
  return hrefs;
}

function parseNcxTitles(zip: AdmZip, opfDir: string, opfText: string): Map<number, string> | null {
  const manifestSection = opfText.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i)?.[1] ?? "";
  const ncxMatch = manifestSection.match(/<item[^>]+media-type=["']application\/x-dtbncx\+xml["'][^>]*>/i)
    ?? manifestSection.match(/<item[^>]+media-type=["']application\/x-dtbncx\+xml["'][^>]*>/i);
  if (!ncxMatch) {
    return null;
  }
  const hrefMatch = ncxMatch[0].match(/\bhref=["']([^"']+)["']/i);
  if (!hrefMatch) {
    return null;
  }
  let ncxText = "";
  try {
    ncxText = readZipEntry(zip, resolvePath(opfDir, hrefMatch[1]));
  } catch {
    try {
      ncxText = readZipEntry(zip, hrefMatch[1]);
    } catch {
      return null;
    }
  }
  const titles = new Map<number, string>();
  const navPointRegex = /<navPoint[^>]*>([\s\S]*?)<\/navPoint>/gi;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = navPointRegex.exec(ncxText)) !== null) {
    const labelMatch = m[1].match(/<text[^>]*>([\s\S]*?)<\/text>/i);
    if (labelMatch) {
      titles.set(i++, labelMatch[1].trim());
    }
  }
  return titles.size > 0 ? titles : null;
}

function parseNavTitles(zip: AdmZip, opfDir: string, opfText: string): Map<number, string> | null {
  const manifestSection = opfText.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i)?.[1] ?? "";
  const navMatch = manifestSection.match(/<item[^>]+properties=["'][^"']*\bnav\b[^"']*["'][^>]*>/i);
  if (!navMatch) {
    return null;
  }
  const hrefMatch = navMatch[0].match(/\bhref=["']([^"']+)["']/i);
  if (!hrefMatch) {
    return null;
  }
  let navText = "";
  try {
    navText = readZipEntry(zip, resolvePath(opfDir, hrefMatch[1]));
  } catch {
    try {
      navText = readZipEntry(zip, hrefMatch[1]);
    } catch {
      return null;
    }
  }
  // Find nav element with epub:type="toc" or first nav ol
  const tocNav = navText.match(/<nav[^>]+epub:type=["'][^"']*toc[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i)?.[1]
    ?? navText.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i)?.[1]
    ?? "";
  const titles = new Map<number, string>();
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = liRegex.exec(tocNav)) !== null) {
    const aMatch = m[1].match(/<a[^>]*>([\s\S]*?)<\/a>/i);
    if (aMatch) {
      titles.set(i++, stripHtml(aMatch[1]).trim());
    }
  }
  return titles.size > 0 ? titles : null;
}

function dedupeLeadingTitle(content: string, title: string): string {
  const lines = content.split("\n");
  let i = 0;
  // skip leading blank lines to find first non-empty line
  while (i < lines.length && lines[i].trim() === "") {
    i++;
  }
  if (i < lines.length && lines[i].trim() === title.trim()) {
    lines.splice(i, 1);
    // also remove any blank line immediately after the removed title
    while (i < lines.length && lines[i].trim() === "") {
      lines.splice(i, 1);
    }
  }
  return lines.join("\n").trim();
}

function resolvePath(base: string, relative: string): string {
  // Resolve relative path segments (e.g. opfDir="OEBPS/" + href="../Text/ch1.xhtml" → "Text/ch1.xhtml")
  const parts = (base + relative).split("/");
  const result: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      result.pop();
    } else if (part !== ".") {
      result.push(part);
    }
  }
  return result.join("/");
}

function readZipEntry(zip: AdmZip, path: string): string {
  // Try exact path first, then case-insensitive scan
  const entry = zip.getEntry(path) ?? zip.getEntries().find(
    (e) => e.entryName.toLowerCase() === path.toLowerCase(),
  );
  if (!entry) {
    throw new Error(`EPUB entry not found: ${path}`);
  }
  return entry.getData().toString("utf8");
}

export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#([0-9]+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
