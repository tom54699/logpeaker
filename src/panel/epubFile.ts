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

  return hrefs.map((href, index) => {
    const fullPath = opfDir + href;
    let html = "";
    try {
      html = readZipEntry(zip, fullPath);
    } catch {
      // fallback: try without leading opfDir
      try {
        html = readZipEntry(zip, href);
      } catch {
        html = "";
      }
    }
    const content = stripHtml(html);
    const title = `第 ${index + 1} 章`;
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
  // Build id→href map from manifest
  const manifestMap = new Map<string, string>();
  const manifestSection = opfText.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i)?.[1] ?? "";
  const itemRegex = /<item[^>]+>/gi;
  let itemMatch: RegExpExecArray | null;
  while ((itemMatch = itemRegex.exec(manifestSection)) !== null) {
    const tag = itemMatch[0];
    const id = tag.match(/\bid=["']([^"']+)["']/i)?.[1];
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    const mediaType = tag.match(/\bmedia-type=["']([^"']+)["']/i)?.[1] ?? "";
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
    if (href) {
      hrefs.push(href);
    }
  }
  return hrefs;
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
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
