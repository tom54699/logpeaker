import { createTextRows } from "./textFile";

export type RowDecoration = {
  tag: string | null;
  tone: "none" | "info" | "warn" | "io" | "core" | "trace";
};

export function getDisplayFileName(fileName: string): string {
  const normalized = fileName.replaceAll("\\", "/");
  const segments = normalized.split("/");
  return segments.at(-1) || fileName;
}

export function formatLoadedMeta(fileName: string): string {
  return `utf-8 :: ${getDisplayFileName(fileName)} :: ready`;
}

export function getToolbarSourceLabel(): string {
  return "local file";
}

export function createRowDecorations(content: string): RowDecoration[] {
  const rows = createTextRows(content);

  return rows.map((row, index) => {
    const trimmed = row.trim();
    const lineOrdinal = index + 1;

    if (!trimmed) {
      return { tag: "TRACE", tone: "trace" } satisfies RowDecoration;
    }

    if (trimmed.length <= 14 && lineOrdinal % 2 === 1) {
      return { tag: "CORE", tone: "core" } satisfies RowDecoration;
    }

    if (lineOrdinal % 17 === 0) {
      return { tag: "WARN", tone: "warn" } satisfies RowDecoration;
    }

    if (lineOrdinal % 11 === 0) {
      return { tag: "TRACE", tone: "trace" } satisfies RowDecoration;
    }

    if (lineOrdinal % 7 === 0) {
      return { tag: "IO", tone: "io" } satisfies RowDecoration;
    }

    if (lineOrdinal % 4 === 0) {
      return { tag: "INFO", tone: "info" } satisfies RowDecoration;
    }

    return { tag: "INFO", tone: "info" } satisfies RowDecoration;
  });
}
