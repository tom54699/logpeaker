export type ReadingSession = {
  fileUri: string;
  fileName: string;
  scrollTop: number;
  topLine: number;
  fileMtimeMs: number;
  chapterIndex?: number;
};

export type RestoreTarget = {
  scrollTop: number;
  topLine: number;
  chapterIndex: number;
  strategy: "exact" | "line";
};

export function createReadingSession(session: ReadingSession): ReadingSession {
  return {
    fileUri: session.fileUri,
    fileName: session.fileName,
    scrollTop: Math.max(0, Math.floor(session.scrollTop)),
    topLine: Math.max(1, Math.floor(session.topLine)),
    fileMtimeMs: Math.max(0, Math.floor(session.fileMtimeMs)),
    chapterIndex: Math.max(0, Math.floor(session.chapterIndex ?? 0)),
  };
}

export function parseReadingSession(value: unknown): ReadingSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const session = value as Partial<ReadingSession>;

  if (
    typeof session.fileUri !== "string" ||
    typeof session.fileName !== "string" ||
    typeof session.scrollTop !== "number" ||
    typeof session.topLine !== "number" ||
    typeof session.fileMtimeMs !== "number"
  ) {
    return null;
  }

  return createReadingSession({
    fileUri: session.fileUri,
    fileName: session.fileName,
    scrollTop: session.scrollTop,
    topLine: session.topLine,
    fileMtimeMs: session.fileMtimeMs,
    chapterIndex: typeof session.chapterIndex === "number" ? session.chapterIndex : 0,
  });
}

export function resolveRestoreTarget(
  session: ReadingSession,
  currentMtimeMs: number,
): RestoreTarget {
  return {
    scrollTop: session.scrollTop,
    topLine: session.topLine,
    chapterIndex: session.chapterIndex ?? 0,
    strategy: currentMtimeMs === session.fileMtimeMs ? "exact" : "line",
  };
}
