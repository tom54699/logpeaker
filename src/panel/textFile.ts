import { TextDecoder } from "node:util";

export function decodeUtf8Text(bytes: Uint8Array): string {
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    return decoder.decode(bytes).replace(/^\uFEFF/, "");
  } catch {
    throw new Error("Only UTF-8 and UTF-8 with BOM text files are supported.");
  }
}

export function createTextRows(content: string): string[] {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}
