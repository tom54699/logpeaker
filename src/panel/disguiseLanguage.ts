import {
  getRowDecoration,
  normalizeContentRows,
  type RowDecoration,
} from "./loadedRows";

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
  return normalizeContentRows(content).map((row, index) => getRowDecoration(row, index));
}
