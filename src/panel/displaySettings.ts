export type DisplaySettings = {
  fontSize: number;
  lineHeight: number;
  contentWidth: number;
};

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  fontSize: 13,
  lineHeight: 1.6,
  contentWidth: 0,
};

export function resolveContentWidthVar(contentWidth: number): string | null {
  return contentWidth > 0 ? `${contentWidth}ch` : null;
}
