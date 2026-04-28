import * as vscode from "vscode";
import {
  createBossModeRows,
  createDefaultReadingChromeSnapshot,
  formatBossModeMeta,
  normalizeReadingChromeSnapshot,
  type BossModeRow,
  type ReadingChromeSnapshot,
} from "./bossMode";
import {
  formatLoadedMeta,
  getToolbarSourceLabel,
} from "./disguiseLanguage";
import {
  COLLAPSIBLE_CHROME_COLLAPSE_SCROLL_TOP,
  COLLAPSIBLE_CHROME_EXPAND_SCROLL_TOP,
} from "./readingChrome";
import {
  createReadingSession,
  parseReadingSession,
  resolveRestoreTarget,
  type ReadingSession,
  type RestoreTarget,
} from "./sessionStore";
import { decodeUtf8Text } from "./textFile";

const READING_SESSION_KEY = "logPeak.readingSession";
const LOG_PEAK_VISIBLE_CONTEXT_KEY = "logPeak.visible";

type LoadedPanelState =
  {
    kind: "loaded";
    fileName: string;
    content: string;
    metaText: string;
    toolbarSourceLabel: string;
    restoreTarget: RestoreTarget | null;
    chromeState: ReadingChromeSnapshot;
    hoverDisguise: {
      enabled: boolean;
      bossMetaText: string;
      bossRows: BossModeRow[];
    };
  };

type PanelState =
  | {
      kind: "empty";
    }
  | {
      kind: "loading";
      fileName: string;
    }
  | {
      kind: "error";
      message: string;
    }
  | LoadedPanelState
  | {
      kind: "boss";
      metaText: string;
      rows: BossModeRow[];
    };

type BossModeSnapshot = {
  previousState: Exclude<PanelState, { kind: "boss" }>;
  readingSession: ReadingSession | null;
  chromeState: ReadingChromeSnapshot;
};

export class LogPeakPanelViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "logPeak.panelView";
  private view?: vscode.WebviewView;
  private state: PanelState = { kind: "empty" };
  private isRestoringSession = false;
  private currentSession: ReadingSession | null = null;
  private currentReadingChromeState: ReadingChromeSnapshot = createDefaultReadingChromeSnapshot();
  private bossModeSnapshot: BossModeSnapshot | null = null;
  private pendingBossModeEntry = false;

  public constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly workspaceState: vscode.Memento,
  ) {}

  private readHoverDisguiseSetting(): boolean {
    return vscode.workspace.getConfiguration("logPeak").get<boolean>("hoverDisguise", true);
  }

  public updateHoverDisguiseSetting(): void {
    if (this.state.kind !== "loaded") {
      return;
    }
    this.state = {
      ...this.state,
      hoverDisguise: { ...this.state.hoverDisguise, enabled: this.readHoverDisguiseSetting() },
    };
    this.render();
  }

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    this.updateVisibilityContext(webviewView.visible);

    const { webview } = webviewView;
    const stylesheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "panel.css"),
    );

    webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "media")],
    };

    webviewView.onDidChangeVisibility(() => {
      this.updateVisibilityContext(webviewView.visible);
      if (webviewView.visible) {
        void this.restoreReadingSession();
      }
    });

    webview.onDidReceiveMessage(async (message: {
      type?: string;
      scrollTop?: number;
      topLine?: number;
      mode?: string;
      pinned?: boolean;
    }) => {
      if (message.type === "openTxt") {
        await this.openTxtFile();
      }

      if (
        message.type === "saveProgress" &&
        typeof message.scrollTop === "number" &&
        typeof message.topLine === "number"
      ) {
        await this.saveReadingProgress(message.scrollTop, message.topLine);
      }

      if (message.type === "chromeStateChanged") {
        this.currentReadingChromeState = normalizeReadingChromeSnapshot({
          mode: message.mode as ReadingChromeSnapshot["mode"] | undefined,
          pinned: message.pinned,
        });
      }

      if (message.type === "bossModeReady") {
        await this.completeBossModeEntry({
          scrollTop: message.scrollTop,
          topLine: message.topLine,
          mode: message.mode,
          pinned: message.pinned,
        });
      }
    });

    webviewView.webview.html = this.getHtml(webview, stylesheetUri, this.state);
    void this.restoreReadingSession();
  }

  private updateVisibilityContext(visible: boolean): void {
    void vscode.commands.executeCommand("setContext", LOG_PEAK_VISIBLE_CONTEXT_KEY, visible);
  }

  public async toggleBossMode(): Promise<void> {
    if (this.pendingBossModeEntry) {
      return;
    }

    if (this.state.kind === "boss") {
      this.exitBossMode();
      return;
    }

    await this.enterBossMode();
  }


  private async openTxtFile(): Promise<void> {
    const selection = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        "Text Files": ["txt"],
      },
      openLabel: "Open TXT",
      title: "Load a local UTF-8 TXT file",
    });

    const fileUri = selection?.[0];
    if (!fileUri) {
      return;
    }

    try {
      await this.loadFileIntoPanel(fileUri, null);
    } catch (error) {
    this.currentSession = null;
    this.currentReadingChromeState = createDefaultReadingChromeSnapshot();
    await this.workspaceState.update(READING_SESSION_KEY, undefined);
    this.state = toErrorState(error);
    this.render();
    }
  }

  private render(): void {
    if (!this.view) {
      return;
    }

    this.view.webview.postMessage({
      type: "renderState",
      state: this.state,
    });
  }

  private async restoreReadingSession(): Promise<void> {
    if (this.isRestoringSession || this.state.kind !== "empty") {
      return;
    }

    const savedSession = parseReadingSession(this.workspaceState.get(READING_SESSION_KEY));
    if (!savedSession) {
      return;
    }

    this.isRestoringSession = true;

    try {
      const fileUri = vscode.Uri.parse(savedSession.fileUri);
      const stat = await vscode.workspace.fs.stat(fileUri);
      const restoreTarget = resolveRestoreTarget(savedSession, stat.mtime);

      await this.loadFileIntoPanel(fileUri, restoreTarget);
    } catch {
      this.currentSession = null;
      await this.workspaceState.update(READING_SESSION_KEY, undefined);
      this.state = {
        kind: "error",
        message: "Last reading session could not be restored. Open TXT to continue.",
      };
      this.render();
    } finally {
      this.isRestoringSession = false;
    }
  }

  private async loadFileIntoPanel(
    fileUri: vscode.Uri,
    restoreTarget: RestoreTarget | null,
  ): Promise<void> {
    const fileName = vscode.workspace.asRelativePath(fileUri, false);

    this.state = {
      kind: "loading",
      fileName,
    };
    this.render();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const stat = await vscode.workspace.fs.stat(fileUri);
    const bytes = await vscode.workspace.fs.readFile(fileUri);
    const content = decodeUtf8Text(bytes);

    this.currentSession = createReadingSession({
      fileUri: fileUri.toString(),
      fileName,
      scrollTop: restoreTarget?.scrollTop ?? 0,
      topLine: restoreTarget?.topLine ?? 1,
      fileMtimeMs: stat.mtime,
    });

    await this.workspaceState.update(READING_SESSION_KEY, this.currentSession);

    this.state = {
      kind: "loaded",
      fileName,
      content,
      metaText: formatLoadedMeta(fileName),
      toolbarSourceLabel: getToolbarSourceLabel(),
      restoreTarget,
      chromeState: this.currentReadingChromeState,
      hoverDisguise: {
        enabled: this.readHoverDisguiseSetting(),
        bossMetaText: formatBossModeMeta(fileName),
        bossRows: createBossModeRows(fileName),
      },
    };

    this.render();
  }

  private async saveReadingProgress(scrollTop: number, topLine: number): Promise<void> {
    if (!this.currentSession || this.state.kind !== "loaded") {
      return;
    }

    this.currentSession = createReadingSession({
      ...this.currentSession,
      scrollTop,
      topLine,
    });

    await this.workspaceState.update(READING_SESSION_KEY, this.currentSession);
  }

  private async enterBossMode(): Promise<void> {
    if (this.state.kind === "loaded" && this.view) {
      this.pendingBossModeEntry = true;
      const delivered = await this.view.webview.postMessage({ type: "prepareBossMode" });
      if (delivered) {
        return;
      }
      this.pendingBossModeEntry = false;
    }

    await this.completeBossModeEntry();
  }

  private async completeBossModeEntry(progress?: {
    scrollTop?: number;
    topLine?: number;
    mode?: string;
    pinned?: boolean;
  }): Promise<void> {
    if (this.state.kind !== "loaded" && !this.pendingBossModeEntry && this.bossModeSnapshot) {
      return;
    }

    this.pendingBossModeEntry = false;

    const previousState =
      this.state.kind === "boss"
        ? this.bossModeSnapshot?.previousState ?? { kind: "empty" }
        : this.state;
    const chromeState = normalizeReadingChromeSnapshot({
      mode: progress?.mode as ReadingChromeSnapshot["mode"] | undefined,
      pinned: progress?.pinned,
    });

    if (previousState.kind === "loaded" && this.currentSession) {
      this.currentSession = createReadingSession({
        ...this.currentSession,
        scrollTop: progress?.scrollTop ?? this.currentSession.scrollTop,
        topLine: progress?.topLine ?? this.currentSession.topLine,
      });
      await this.workspaceState.update(READING_SESSION_KEY, this.currentSession);
    }

    this.currentReadingChromeState = chromeState;
    this.bossModeSnapshot = {
      previousState,
      readingSession: this.currentSession ? createReadingSession(this.currentSession) : null,
      chromeState,
    };

    const referenceFileName =
      previousState.kind === "loaded" ? previousState.fileName : this.currentSession?.fileName;
    this.state = {
      kind: "boss",
      metaText: formatBossModeMeta(referenceFileName),
      rows: createBossModeRows(referenceFileName),
    };
    this.render();
  }

  private exitBossMode(): void {
    const snapshot = this.bossModeSnapshot;
    this.bossModeSnapshot = null;

    if (!snapshot) {
      this.state = { kind: "empty" };
      this.render();
      return;
    }

    this.currentReadingChromeState = normalizeReadingChromeSnapshot(snapshot.chromeState);
    this.currentSession = snapshot.readingSession ? createReadingSession(snapshot.readingSession) : null;

    if (snapshot.previousState.kind === "loaded") {
      const restoreTarget = this.currentSession
        ? resolveRestoreTarget(this.currentSession, this.currentSession.fileMtimeMs)
        : snapshot.previousState.restoreTarget;
      this.state = {
        ...snapshot.previousState,
        restoreTarget,
        chromeState: this.currentReadingChromeState,
      };
    } else {
      this.state = snapshot.previousState;
    }

    this.render();
  }

  private getHtml(
    webview: vscode.Webview,
    stylesheetUri: vscode.Uri,
    state: PanelState,
  ): string {
    const serializedState = serializeForScript(state);
    const chromeThresholds = serializeForScript({
      collapse: COLLAPSIBLE_CHROME_COLLAPSE_SCROLL_TOP,
      expand: COLLAPSIBLE_CHROME_EXPAND_SCROLL_TOP,
    });

    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link id="panel-stylesheet" href="${stylesheetUri}" rel="stylesheet" />
          <title>Log Peak</title>
        </head>
        <body class="booting">
          <section class="shell shell--boot">
            <div class="boot-splash">
              <div class="boot-splash__title">Log Peak</div>
              <div class="boot-splash__meta" id="boot-meta">loading panel styles...</div>
            </div>
          </section>
          <section class="shell shell--main">
            <div class="shell__content" id="panel-root"></div>
          </section>
          <script>
            const vscode = acquireVsCodeApi();
            const initialState = ${serializedState};
            const bootMeta = document.getElementById("boot-meta");
            const panelRoot = document.getElementById("panel-root");
            const stylesheet = document.getElementById("panel-stylesheet");
            const chromeThresholds = ${chromeThresholds};
            let currentRenderedState = initialState;
            let stylesReady = false;
            let scrollSaveTimer = null;
            let boundRows = null;
            let boundChrome = null;
            let boundChromeToggleLabel = null;
            let boundHoverDisguiseSection = null;
            let chromeSyncFrame = null;
            let rowsRenderToken = 0;
            let restorePending = false;
            let latestProgress = {
              scrollTop: 0,
              topLine: 1,
            };
            let readingChromeState = {
              pinned: false,
              hovered: false,
              mode: "expanded",
            };
            let lastReportedChromeState = {
              mode: "expanded",
              pinned: false,
            };

            function escapeHtml(value) {
              return value
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
            }

            function collectTopLine(rowsElement) {
              const rowElements = rowsElement.children;
              if (!(rowElements instanceof HTMLCollection) || rowElements.length === 0) {
                return 1;
              }

              const targetScrollTop = rowsElement.scrollTop;
              let low = 0;
              let high = rowElements.length - 1;
              let candidateIndex = 0;

              while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                const row = rowElements.item(mid);
                if (!(row instanceof HTMLElement)) {
                  break;
                }

                if (row.offsetTop <= targetScrollTop) {
                  candidateIndex = mid;
                  low = mid + 1;
                } else {
                  high = mid - 1;
                }
              }

              while (candidateIndex < rowElements.length - 1) {
                const row = rowElements.item(candidateIndex);
                if (!(row instanceof HTMLElement)) {
                  break;
                }

                if (row.offsetTop + row.offsetHeight > targetScrollTop) {
                  break;
                }

                candidateIndex += 1;
              }

              const candidate = rowElements.item(candidateIndex);
              return Number(candidate?.dataset.line || "1");
            }

            function persistProgress(force = false) {
              if (currentRenderedState.kind !== "loaded") {
                return;
              }

              if (restorePending) {
                return;
              }

              const rows = panelRoot?.querySelector(".shell__rows");
              if (!(rows instanceof HTMLElement)) {
                return;
              }

              latestProgress = {
                scrollTop: rows.scrollTop,
                topLine: latestProgress.topLine,
              };

              if (!force) {
                if (scrollSaveTimer) {
                  clearTimeout(scrollSaveTimer);
                }

                scrollSaveTimer = window.setTimeout(() => {
                  latestProgress.topLine = collectTopLine(rows);
                  vscode.postMessage({
                    type: "saveProgress",
                    scrollTop: latestProgress.scrollTop,
                    topLine: latestProgress.topLine,
                  });
                }, 80);
                return;
              }

              if (scrollSaveTimer) {
                clearTimeout(scrollSaveTimer);
                scrollSaveTimer = null;
              }

              latestProgress.topLine = collectTopLine(rows);
              vscode.postMessage({
                type: "saveProgress",
                scrollTop: latestProgress.scrollTop,
                topLine: latestProgress.topLine,
              });
            }

            function handleRowsScroll() {
              scheduleReadingChromeSync();
              persistProgress(false);
            }

            function cancelPendingRestore() {
              if (!restorePending || !(boundRows instanceof HTMLElement)) {
                return;
              }

              restorePending = false;
              latestProgress = {
                scrollTop: boundRows.scrollTop,
                topLine: collectTopLine(boundRows),
              };
            }

            function handleRowsIntent() {
              cancelPendingRestore();
            }

            function bindRowsScroll(rows) {
              if (!(rows instanceof HTMLElement)) {
                return;
              }

              if (boundRows === rows) {
                return;
              }

              if (boundRows instanceof HTMLElement) {
                boundRows.removeEventListener("scroll", handleRowsScroll);
                boundRows.removeEventListener("wheel", handleRowsIntent);
                boundRows.removeEventListener("pointerdown", handleRowsIntent);
                boundRows.removeEventListener("touchstart", handleRowsIntent);
              }

              boundRows = rows;
              rows.addEventListener("scroll", handleRowsScroll, { passive: true });
              rows.addEventListener("wheel", handleRowsIntent, { passive: true });
              rows.addEventListener("pointerdown", handleRowsIntent, { passive: true });
              rows.addEventListener("touchstart", handleRowsIntent, { passive: true });
              syncReadingChrome();
            }

            function unbindRowsScroll() {
              if (boundRows instanceof HTMLElement) {
                boundRows.removeEventListener("scroll", handleRowsScroll);
                boundRows.removeEventListener("wheel", handleRowsIntent);
                boundRows.removeEventListener("pointerdown", handleRowsIntent);
                boundRows.removeEventListener("touchstart", handleRowsIntent);
              }

              boundRows = null;
              rowsRenderToken += 1;
            }

            function getNextChromeMode(scrollTop) {
              if (readingChromeState.pinned || readingChromeState.hovered) {
                return "expanded";
              }

              if (scrollTop > chromeThresholds.collapse) {
                return "collapsed";
              }

              if (scrollTop <= chromeThresholds.expand) {
                return "expanded";
              }

              return readingChromeState.mode;
            }

            function applyReadingChromeState() {
              if (!(boundChrome instanceof HTMLElement)) {
                return;
              }

              if (boundChrome.dataset.mode !== readingChromeState.mode) {
                boundChrome.dataset.mode = readingChromeState.mode;
              }

              const pinnedValue = String(readingChromeState.pinned);
              if (boundChrome.dataset.pinned !== pinnedValue) {
                boundChrome.dataset.pinned = pinnedValue;
              }

              if (boundChromeToggleLabel instanceof HTMLElement) {
                const nextLabel = readingChromeState.pinned ? "collapse" : "keep open";
                if (boundChromeToggleLabel.textContent !== nextLabel) {
                  boundChromeToggleLabel.textContent = nextLabel;
                }
              }

              if (
                lastReportedChromeState.mode !== readingChromeState.mode ||
                lastReportedChromeState.pinned !== readingChromeState.pinned
              ) {
                lastReportedChromeState = {
                  mode: readingChromeState.mode,
                  pinned: readingChromeState.pinned,
                };
                vscode.postMessage({
                  type: "chromeStateChanged",
                  mode: readingChromeState.mode,
                  pinned: readingChromeState.pinned,
                });
              }
            }

            function syncReadingChrome(forceMode) {
              if (!(boundRows instanceof HTMLElement) || !(boundChrome instanceof HTMLElement)) {
                return;
              }

              const nextMode = forceMode || getNextChromeMode(boundRows.scrollTop);
              const modeChanged = nextMode !== readingChromeState.mode;
              if (modeChanged) {
                readingChromeState.mode = nextMode;
              }

              if (modeChanged || forceMode) {
                applyReadingChromeState();
              }
            }

            function scheduleReadingChromeSync() {
              if (chromeSyncFrame !== null) {
                return;
              }

              chromeSyncFrame = window.requestAnimationFrame(() => {
                chromeSyncFrame = null;
                syncReadingChrome();
              });
            }

            function handleChromeMouseEnter() {
              readingChromeState.hovered = true;
              syncReadingChrome("expanded");
            }

            function handleChromeMouseLeave() {
              readingChromeState.hovered = false;
              syncReadingChrome();
            }

            function handleHoverDisguiseMouseEnter() {
              if (boundHoverDisguiseSection instanceof HTMLElement) {
                boundHoverDisguiseSection.classList.add("mouse-inside");
              }
            }

            function handleHoverDisguiseMouseLeave() {
              if (boundHoverDisguiseSection instanceof HTMLElement) {
                boundHoverDisguiseSection.classList.remove("mouse-inside");
              }
            }

            function bindHoverDisguise(section) {
              if (!(section instanceof HTMLElement)) {
                return;
              }
              unbindHoverDisguise();
              boundHoverDisguiseSection = section;
              document.documentElement.addEventListener("mouseenter", handleHoverDisguiseMouseEnter);
              document.documentElement.addEventListener("mouseleave", handleHoverDisguiseMouseLeave);
            }

            function unbindHoverDisguise() {
              document.documentElement.removeEventListener("mouseenter", handleHoverDisguiseMouseEnter);
              document.documentElement.removeEventListener("mouseleave", handleHoverDisguiseMouseLeave);
              if (boundHoverDisguiseSection instanceof HTMLElement) {
                boundHoverDisguiseSection.classList.remove("mouse-inside");
              }
              boundHoverDisguiseSection = null;
            }

            function bindReadingChrome(chrome) {
              if (!(chrome instanceof HTMLElement)) {
                return;
              }

              if (boundChrome === chrome) {
                return;
              }

              if (boundChrome instanceof HTMLElement) {
                boundChrome.removeEventListener("mouseenter", handleChromeMouseEnter);
                boundChrome.removeEventListener("mouseleave", handleChromeMouseLeave);
              }

              boundChrome = chrome;
              boundChromeToggleLabel = chrome.querySelector("[data-role='chrome-toggle-label']");
              chrome.addEventListener("mouseenter", handleChromeMouseEnter);
              chrome.addEventListener("mouseleave", handleChromeMouseLeave);
              applyReadingChromeState();
            }

            function unbindReadingChrome() {
              if (boundChrome instanceof HTMLElement) {
                boundChrome.removeEventListener("mouseenter", handleChromeMouseEnter);
                boundChrome.removeEventListener("mouseleave", handleChromeMouseLeave);
              }

              boundChrome = null;
              boundChromeToggleLabel = null;
              if (chromeSyncFrame !== null) {
                window.cancelAnimationFrame(chromeSyncFrame);
                chromeSyncFrame = null;
              }
              readingChromeState = {
                pinned: false,
                hovered: false,
                mode: "expanded",
              };
            }

            function applyRestoreTarget(rows, restoreTarget, attempt = 0, onComplete = () => {}) {
              if (!restoreTarget || !(rows instanceof HTMLElement)) {
                onComplete();
                return;
              }

              const targetRow =
                restoreTarget.strategy === "line"
                  ? rows.querySelector('[data-line="' + restoreTarget.topLine + '"]')
                  : null;
              const layoutReady =
                stylesReady &&
                document.body.classList.contains("ready") &&
                rows.clientHeight > 0 &&
                rows.scrollHeight > 0 &&
                (restoreTarget.strategy !== "line" ||
                  restoreTarget.topLine <= 1 ||
                  (targetRow instanceof HTMLElement && targetRow.offsetTop > 0));

              if (!layoutReady) {
                if (attempt < 20) {
                  window.setTimeout(() => applyRestoreTarget(rows, restoreTarget, attempt + 1, onComplete), 50);
                } else {
                  onComplete();
                }
                return;
              }

              const tryApply = () => {
                if (restoreTarget.strategy === "exact") {
                  rows.scrollTop = restoreTarget.scrollTop;
                } else {
                  if (targetRow instanceof HTMLElement) {
                    rows.scrollTop = targetRow.offsetTop;
                  }
                }

                syncReadingChrome();

                if (attempt >= 20) {
                  onComplete();
                  return;
                }

                const restored =
                  restoreTarget.strategy === "exact"
                    ? Math.abs(rows.scrollTop - restoreTarget.scrollTop) <= 2
                    : rows.scrollTop > 0 || restoreTarget.topLine <= 1;

                if (!restored) {
                  window.setTimeout(() => applyRestoreTarget(rows, restoreTarget, attempt + 1, onComplete), 50);
                } else {
                  onComplete();
                }
              };

              window.requestAnimationFrame(tryApply);
            }

            function getRowDecoration(row, index) {
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

            function createLoadedRows(content) {
              const rows = content.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n").split("\\n");
              const lineDigits = String(rows.length).length;

              return rows
                .map((row, index) => {
                  const decoration = getRowDecoration(row, index);
                  const tag = decoration.tag;
                  const tone = decoration.tone;
                  return \`<div class="row\${tag ? " row--tagged" : ""} row--tone-\${tone}" data-line="\${index + 1}" data-index="\${String(index + 1).padStart(lineDigits, "0")}" data-tag="\${escapeHtml(tag)}"><span class="row__content">\${escapeHtml(row || " ")}</span></div>\`;
                })
                .join("");
            }

            function renderLoadedRowsChunked(rowsElement, state) {
              if (!(rowsElement instanceof HTMLElement) || state.kind !== "loaded") {
                return;
              }

              rowsRenderToken += 1;
              const renderToken = rowsRenderToken;
              restorePending = Boolean(state.restoreTarget);
              latestProgress = {
                scrollTop: state.restoreTarget?.scrollTop ?? 0,
                topLine: state.restoreTarget?.topLine ?? 1,
              };
              const rows = state.content.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n").split("\\n");
              const lineDigits = String(rows.length).length;
              let nextIndex = 0;

              rowsElement.innerHTML = "";

              const appendChunk = () => {
                if (renderToken !== rowsRenderToken) {
                  return;
                }

                const chunkSize = nextIndex === 0 ? 100 : 400;
                const endIndex = Math.min(nextIndex + chunkSize, rows.length);
                let html = "";

                for (let index = nextIndex; index < endIndex; index += 1) {
                  const row = rows[index];
                  const decoration = getRowDecoration(row, index);
                  const tag = decoration.tag;
                  const tone = decoration.tone;
                  html += \`<div class="row\${tag ? " row--tagged" : ""} row--tone-\${tone}" data-line="\${index + 1}" data-index="\${String(index + 1).padStart(lineDigits, "0")}" data-tag="\${escapeHtml(tag)}"><span class="row__content">\${escapeHtml(row || " ")}</span></div>\`;
                }

                rowsElement.insertAdjacentHTML("beforeend", html);
                nextIndex = endIndex;

                if (restorePending && state.restoreTarget?.strategy === "exact") {
                  rowsElement.scrollTop = state.restoreTarget.scrollTop;
                } else if (restorePending && state.restoreTarget?.strategy === "line") {
                  const targetRow = rowsElement.querySelector('[data-line="' + state.restoreTarget.topLine + '"]');
                  if (targetRow instanceof HTMLElement) {
                    rowsElement.scrollTop = targetRow.offsetTop;
                  }
                }

                if (nextIndex >= rows.length) {
                  if (restorePending) {
                    applyRestoreTarget(rowsElement, state.restoreTarget, 0, () => {
                      restorePending = false;
                      latestProgress = {
                        scrollTop: rowsElement.scrollTop,
                        topLine: collectTopLine(rowsElement),
                      };
                    });
                  } else {
                    latestProgress = {
                      scrollTop: rowsElement.scrollTop,
                      topLine: collectTopLine(rowsElement),
                    };
                  }
                  return;
                }

                if (typeof window.requestIdleCallback === "function") {
                  window.requestIdleCallback(appendChunk, { timeout: 60 });
                } else {
                  window.setTimeout(appendChunk, 0);
                }
              };

              appendChunk();
            }

            function renderBossRows(rows) {
              return rows
                .map((row) => \`<div class="row row--tagged row--tone-\${row.tone}" data-line="\${row.line}" data-index="\${String(row.line).padStart(3, "0")}" data-tag="\${escapeHtml(row.tag)}"><span class="row__content">\${escapeHtml(row.content)}</span></div>\`)
                .join("");
            }

            function renderPanelBody(state) {
              if (state.kind === "empty") {
                return \`
                  <section class="empty-state">
                    <div class="empty-state__eyebrow">source::stdin.local</div>
                    <h1 class="empty-state__title">No file loaded</h1>
                    <p class="empty-state__message">No input attached. Load a local UTF-8 .txt file.</p>
                    <button class="empty-state__action" data-action="open-txt" type="button">Open TXT</button>
                  </section>
                \`;
              }

              if (state.kind === "error") {
                return \`
                  <section class="empty-state empty-state--error">
                    <div class="empty-state__eyebrow">source::error</div>
                    <h1 class="empty-state__title">Load failed</h1>
                    <p class="empty-state__message">\${escapeHtml(state.message)}</p>
                    <button class="empty-state__action" data-action="open-txt" type="button">Try Again</button>
                  </section>
                \`;
              }

              if (state.kind === "loading") {
                return \`
                  <section class="empty-state empty-state--loading">
                    <div class="empty-state__eyebrow">source::loading</div>
                    <h1 class="empty-state__title">Preparing text stream</h1>
                    <p class="empty-state__message">Resolving local UTF-8 source and preparing panel output.</p>
                    <div class="loading-indicator" aria-hidden="true">
                      <span class="loading-indicator__dot"></span>
                      <span class="loading-indicator__dot"></span>
                      <span class="loading-indicator__dot"></span>
                    </div>
                  </section>
                \`;
              }

              if (state.kind === "boss") {
                return \`
                  <section class="loaded-state loaded-state--boss">
                    <div class="boss-state__header">
                      <span class="boss-state__title">runtime :: service-log</span>
                      <span class="boss-state__meta">\${escapeHtml(state.metaText)}</span>
                    </div>
                    <div class="shell__rows shell__rows--boss">\${renderBossRows(state.rows)}</div>
                  </section>
                \`;
              }

              const hoverOverlay = state.hoverDisguise?.enabled
                ? \`<div class="hover-disguise-overlay">
                    <div class="boss-state__header">
                      <span class="boss-state__title">runtime :: service-log</span>
                      <span class="boss-state__meta">\${escapeHtml(state.hoverDisguise.bossMetaText)}</span>
                    </div>
                    <div class="shell__rows shell__rows--boss">\${renderBossRows(state.hoverDisguise.bossRows)}</div>
                  </div>\`
                : "";

              return \`
                <section class="loaded-state\${state.hoverDisguise?.enabled ? " loaded-state--hover-disguise" : ""}">
                  <div class="reading-chrome" data-mode="expanded" data-pinned="false">
                    <button class="reading-chrome__peek" data-action="toggle-chrome" type="button" aria-label="Toggle reading chrome">
                      <span class="reading-chrome__peek-handle" aria-hidden="true"></span>
                    </button>
                    <div class="reading-chrome__panel">
                      <div class="reading-chrome__header">
                        <span class="reading-chrome__title">output :: log-peak.panel</span>
                        <span class="reading-chrome__meta">\${escapeHtml(state.metaText)}</span>
                      </div>
                      <div class="reading-chrome__toolbar">
                        <span class="reading-chrome__chip">\${escapeHtml(state.toolbarSourceLabel)}</span>
                        <div class="reading-chrome__actions">
                          <button class="reading-chrome__action" data-action="open-txt" type="button">Open TXT</button>
                          <button class="reading-chrome__action reading-chrome__action--ghost" data-action="toggle-chrome" type="button">
                            <span data-role="chrome-toggle-label">keep open</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="shell__rows"></div>
                  \${hoverOverlay}
                </section>
              \`;
            }

            function render(state) {
              if (!(panelRoot instanceof HTMLElement)) {
                return;
              }
              panelRoot.innerHTML = renderPanelBody(state);
              currentRenderedState = state;

              if (state.kind === "loaded") {
                readingChromeState = {
                  pinned: state.chromeState.pinned,
                  hovered: false,
                  mode: state.chromeState.mode,
                };
                lastReportedChromeState = {
                  mode: state.chromeState.mode,
                  pinned: state.chromeState.pinned,
                };
                const chrome = panelRoot.querySelector(".reading-chrome");
                const rows = panelRoot.querySelector(".shell__rows");
                const hoverSection = panelRoot.querySelector(".loaded-state--hover-disguise");
                if (chrome instanceof HTMLElement) {
                  bindReadingChrome(chrome);
                }
                if (rows instanceof HTMLElement) {
                  bindRowsScroll(rows);
                  renderLoadedRowsChunked(rows, state);
                }
                if (hoverSection instanceof HTMLElement) {
                  bindHoverDisguise(hoverSection);
                } else {
                  unbindHoverDisguise();
                }
              } else {
                restorePending = false;
                unbindReadingChrome();
                unbindRowsScroll();
                unbindHoverDisguise();
              }
            }

            function markReady() {
              stylesReady = true;
              document.body.classList.remove("booting");
              document.body.classList.add("ready");

              if (currentRenderedState.kind === "loaded") {
                const rows = panelRoot?.querySelector(".shell__rows");
                if (rows instanceof HTMLElement) {
                  window.setTimeout(() => applyRestoreTarget(rows, currentRenderedState.restoreTarget), 0);
                }
              }
            }

            document.addEventListener("click", (event) => {
              const target = event.target;
              if (!(target instanceof HTMLElement)) {
                return;
              }

              if (target.closest("[data-action='open-txt']")) {
                vscode.postMessage({ type: "openTxt" });
                return;
              }

              if (target.closest("[data-action='toggle-chrome']")) {
                readingChromeState.pinned = !readingChromeState.pinned;
                readingChromeState.hovered = false;
                syncReadingChrome(readingChromeState.pinned ? "expanded" : undefined);
              }
            });

            document.addEventListener("visibilitychange", () => {
              if (document.hidden) {
                persistProgress(true);
              }
            });

            window.addEventListener("beforeunload", () => {
              persistProgress(true);
            });

            let hoverDisguiseTimer = null;

            function setHoverDisguise(revealed) {
              const section = panelRoot?.querySelector(".loaded-state--hover-disguise");
              if (!(section instanceof HTMLElement)) {
                return;
              }
              section.classList.toggle("loaded-state--hover-disguise-revealed", revealed);
            }

            function onHoverActivity() {
              clearTimeout(hoverDisguiseTimer);
              setHoverDisguise(true);
              hoverDisguiseTimer = window.setTimeout(() => setHoverDisguise(false), 3000);
            }

            document.addEventListener("mousemove", onHoverActivity);
            document.addEventListener("scroll", onHoverActivity, true);
            window.addEventListener("blur", () => {
              clearTimeout(hoverDisguiseTimer);
              setHoverDisguise(false);
            });

            window.addEventListener("message", (event) => {
              const message = event.data;
              if (message?.type === "renderState") {
                render(message.state);
                return;
              }

              if (message?.type === "prepareBossMode") {
                if (currentRenderedState.kind === "loaded") {
                  persistProgress(true);
                  vscode.postMessage({
                    type: "bossModeReady",
                    scrollTop: latestProgress.scrollTop,
                    topLine: latestProgress.topLine,
                    mode: readingChromeState.mode,
                    pinned: readingChromeState.pinned,
                  });
                } else {
                  vscode.postMessage({
                    type: "bossModeReady",
                  });
                }
              }
            });

            render(initialState);

            if (stylesheet instanceof HTMLLinkElement) {
              stylesheet.addEventListener("load", markReady, { once: true });
              stylesheet.addEventListener(
                "error",
                () => {
                  if (bootMeta instanceof HTMLElement) {
                    bootMeta.textContent = "panel stylesheet failed to load";
                  }
                  markReady();
                },
                { once: true },
              );

              window.setTimeout(() => {
                if (stylesheet.sheet) {
                  markReady();
                }
              }, 0);

              window.setTimeout(() => {
                if (!document.body.classList.contains("ready")) {
                  if (bootMeta instanceof HTMLElement) {
                    bootMeta.textContent = "continuing without stylesheet confirmation";
                  }
                  markReady();
                }
              }, 1500);
            } else {
              markReady();
            }
          </script>
        </body>
      </html>`;
  }
}

function serializeForScript<T>(value: T): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function toErrorState(error: unknown): Extract<PanelState, { kind: "error" }> {
  return {
    kind: "error",
    message: error instanceof Error ? error.message : "Unable to read the selected text file.",
  };
}
