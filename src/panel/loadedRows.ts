import { createTextRows } from "./textFile";

export type RowDecoration = {
  tag: string;
  tone: "trace" | "core" | "warn" | "io" | "info";
};

export type RowMetric = {
  line: number;
  offsetTop: number;
  offsetHeight: number;
};

export function normalizeContentRows(content: string): string[] {
  return createTextRows(content);
}

export function getRowDecoration(row: string, index: number): RowDecoration {
  const trimmed = row.trim();
  const lineOrdinal = index + 1;

  if (!trimmed) {
    return { tag: "TRACE", tone: "trace" };
  }

  if (trimmed.length <= 14 && lineOrdinal % 2 === 1) {
    return { tag: "CORE", tone: "core" };
  }

  if (lineOrdinal % 17 === 0) {
    return { tag: "WARN", tone: "warn" };
  }

  if (lineOrdinal % 11 === 0) {
    return { tag: "TRACE", tone: "trace" };
  }

  if (lineOrdinal % 7 === 0) {
    return { tag: "IO", tone: "io" };
  }

  return { tag: "INFO", tone: "info" };
}

export function getLineDigits(lineCount: number): number {
  return String(Math.max(1, lineCount)).length;
}

export function resolveTopLineFromMetrics(rowMetrics: RowMetric[], scrollTop: number): number {
  if (!rowMetrics.length) {
    return 1;
  }

  let low = 0;
  let high = rowMetrics.length - 1;
  let candidateIndex = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const row = rowMetrics[mid];

    if (row.offsetTop <= scrollTop) {
      candidateIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  while (candidateIndex < rowMetrics.length - 1) {
    const row = rowMetrics[candidateIndex];
    if (row.offsetTop + row.offsetHeight > scrollTop) {
      break;
    }

    candidateIndex += 1;
  }

  return rowMetrics[candidateIndex]?.line ?? 1;
}
