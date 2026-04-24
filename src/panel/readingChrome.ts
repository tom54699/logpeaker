export const COLLAPSIBLE_CHROME_COLLAPSE_SCROLL_TOP = 24;
export const COLLAPSIBLE_CHROME_EXPAND_SCROLL_TOP = 8;

export type ReadingChromeMode = "expanded" | "collapsed";

export function resolveReadingChromeMode({
  scrollTop,
  pinned,
  hovered,
  previousMode,
}: {
  scrollTop: number;
  pinned: boolean;
  hovered: boolean;
  previousMode: ReadingChromeMode;
}): ReadingChromeMode {
  if (pinned || hovered) {
    return "expanded";
  }

  if (scrollTop > COLLAPSIBLE_CHROME_COLLAPSE_SCROLL_TOP) {
    return "collapsed";
  }

  if (scrollTop <= COLLAPSIBLE_CHROME_EXPAND_SCROLL_TOP) {
    return "expanded";
  }

  return previousMode;
}
