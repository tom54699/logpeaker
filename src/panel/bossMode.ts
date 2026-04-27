import { type ReadingChromeMode } from "./readingChrome";

export type ReadingChromeSnapshot = {
  mode: ReadingChromeMode;
  pinned: boolean;
};

export type BossModeRow = {
  line: number;
  tag: string;
  tone: "info" | "warn" | "trace" | "io" | "core";
  content: string;
};

export function createDefaultReadingChromeSnapshot(): ReadingChromeSnapshot {
  return {
    mode: "expanded",
    pinned: false,
  };
}

export function normalizeReadingChromeSnapshot(
  value: Partial<ReadingChromeSnapshot> | null | undefined,
): ReadingChromeSnapshot {
  return {
    mode: value?.mode === "collapsed" ? "collapsed" : "expanded",
    pinned: value?.pinned === true,
  };
}

export function formatBossModeMeta(_fileName?: string): string {
  return "service :: runtime-stream :: attached";
}

export function createBossModeRows(_fileName?: string, rowCount = 96): BossModeRow[] {
  const serviceName = "runtime-stream";
  const workers = ["edge-gateway", "sync-loop", "cache-proxy", "relay-core"];
  const upstreams = ["metrics", "profile-cache", "upstream-a", "upstream-b"];

  const rows: BossModeRow[] = [
    {
      line: 1,
      tag: "CORE",
      tone: "core",
      content: `worker boot complete service=${serviceName} profile=attached`,
    },
    {
      line: 2,
      tag: "TRACE",
      tone: "trace",
      content: "runtime config source=attached-buffer checksum=warm",
    },
    {
      line: 3,
      tag: "IO",
      tone: "io",
      content: `upstream stream attached target=${upstreams[0]} worker=${workers[0]}`,
    },
  ];

  for (let line = 4; line <= rowCount; line += 1) {
    const worker = workers[line % workers.length];
    const upstream = upstreams[line % upstreams.length];
    const requestId = `${line.toString(16).padStart(4, "0")}-${(line * 13).toString(16)}`;

    if (line % 13 === 0) {
      rows.push({
        line,
        tag: "WARN",
        tone: "warn",
        content: `retry scheduled upstream=${upstream} attempt=2 backoff=${80 + line}ms`,
      });
      continue;
    }

    if (line % 7 === 0) {
      rows.push({
        line,
        tag: "IO",
        tone: "io",
        content: `request completed id=${requestId} status=200 worker=${worker} duration=${12 + (line % 9)}ms`,
      });
      continue;
    }

    if (line % 5 === 0) {
      rows.push({
        line,
        tag: "TRACE",
        tone: "trace",
        content: `heartbeat emitted worker=${worker} uptime=${line * 3}s queue=${line % 6}`,
      });
      continue;
    }

    rows.push({
      line,
      tag: "INFO",
      tone: "info",
      content: `dispatch accepted id=${requestId} route=/runtime/stream upstream=${upstream}`,
    });
  }

  return rows;
}
