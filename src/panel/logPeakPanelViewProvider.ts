import * as vscode from "vscode";
import {
  createRowDecorations,
  formatLoadedMeta,
  getDisplayFileName,
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
    | {
        kind: "loaded";
      fileName: string;
      content: string;
      displayFileName: string;
      metaText: string;
      toolbarSourceLabel: string;
      restoreTarget: RestoreTarget | null;
      rowDecorations: Array<{
        tag: string | null;
        tone: "none" | "info" | "warn" | "io" | "core" | "trace";
      }>;
    };

export class LogPeakPanelViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "logPeak.panelView";
  private view?: vscode.WebviewView;
  private state: PanelState = { kind: "empty" };
  private isRestoringSession = false;
  private currentSession: ReadingSession | null = null;

  public constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly workspaceState: vscode.Memento,
  ) {}

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;

    const { webview } = webviewView;
    const stylesheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "panel.css"),
    );

    webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "media")],
    };

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        void this.restoreReadingSession();
      }
    });

    webview.onDidReceiveMessage(async (message: {
      type?: string;
      scrollTop?: number;
      topLine?: number;
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
    });

    webviewView.webview.html = this.getHtml(webview, stylesheetUri, this.state);
    void this.restoreReadingSession();
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
      displayFileName: getDisplayFileName(fileName),
      metaText: formatLoadedMeta(fileName),
      toolbarSourceLabel: getToolbarSourceLabel(),
      restoreTarget,
      rowDecorations: createRowDecorations(content),
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
            let chromeSyncFrame = null;
            let latestProgress = {
              scrollTop: 0,
              topLine: 1,
            };
            let readingChromeState = {
              pinned: false,
              hovered: false,
              mode: "expanded",
            };

            function escapeHtml(value) {
              return value
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
            }

            function collectTopLine(rowsElement) {
              const rows = Array.from(rowsElement.querySelectorAll(".row"));
              let topLine = 1;

              for (const row of rows) {
                if (!(row instanceof HTMLElement)) {
                  continue;
                }

                if (row.offsetTop + row.offsetHeight > rowsElement.scrollTop) {
                  topLine = Number(row.dataset.line || "1");
                  break;
                }
              }

              return topLine;
            }

            function persistProgress(force = false) {
              if (currentRenderedState.kind !== "loaded") {
                return;
              }

              const rows = panelRoot?.querySelector(".shell__rows");
              if (!(rows instanceof HTMLElement)) {
                return;
              }

              latestProgress = {
                scrollTop: rows.scrollTop,
                topLine: collectTopLine(rows),
              };

              if (!force) {
                if (scrollSaveTimer) {
                  clearTimeout(scrollSaveTimer);
                }

                scrollSaveTimer = window.setTimeout(() => {
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

            function bindRowsScroll(rows) {
              if (!(rows instanceof HTMLElement)) {
                return;
              }

              if (boundRows === rows) {
                return;
              }

              if (boundRows instanceof HTMLElement) {
                boundRows.removeEventListener("scroll", handleRowsScroll);
              }

              boundRows = rows;
              rows.addEventListener("scroll", handleRowsScroll, { passive: true });
              syncReadingChrome();
            }

            function unbindRowsScroll() {
              if (boundRows instanceof HTMLElement) {
                boundRows.removeEventListener("scroll", handleRowsScroll);
              }

              boundRows = null;
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

            function applyRestoreTarget(rows, restoreTarget, attempt = 0) {
              if (!restoreTarget || !(rows instanceof HTMLElement)) {
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
                  window.setTimeout(() => applyRestoreTarget(rows, restoreTarget, attempt + 1), 50);
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
                  return;
                }

                const restored =
                  restoreTarget.strategy === "exact"
                    ? Math.abs(rows.scrollTop - restoreTarget.scrollTop) <= 2
                    : rows.scrollTop > 0 || restoreTarget.topLine <= 1;

                if (!restored) {
                  window.setTimeout(() => applyRestoreTarget(rows, restoreTarget, attempt + 1), 50);
                }
              };

              window.requestAnimationFrame(tryApply);
            }

            function createLoadedRows(content, rowDecorations) {
              return content
                .replace(/\\r\\n/g, "\\n")
                .replace(/\\r/g, "\\n")
                .split("\\n")
                .map((row, index) => {
                  const decoration = Array.isArray(rowDecorations) ? rowDecorations[index] : undefined;
                  const tag = decoration?.tag ?? "";
                  const tone = decoration?.tone ?? "none";
                  return \`
                    <div
                      class="row\${tag ? " row--tagged" : ""} row--tone-\${tone}"
                      data-line="\${index + 1}"
                      data-index="\${String(index + 1).padStart(2, "0")}"
                      data-tag="\${escapeHtml(tag)}"
                    >
                      <span class="row__content">\${escapeHtml(row || " ")}</span>
                    </div>
                  \`;
                })
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

              return \`
                <section class="loaded-state">
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
                  <div class="shell__rows">
                    \${createLoadedRows(state.content, state.rowDecorations)}
                  </div>
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
                const chrome = panelRoot.querySelector(".reading-chrome");
                const rows = panelRoot.querySelector(".shell__rows");
                if (chrome instanceof HTMLElement) {
                  bindReadingChrome(chrome);
                }
                if (rows instanceof HTMLElement) {
                  bindRowsScroll(rows);
                  window.setTimeout(() => applyRestoreTarget(rows, state.restoreTarget), 0);
                }
              } else {
                unbindReadingChrome();
                unbindRowsScroll();
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

            window.addEventListener("message", (event) => {
              const message = event.data;
              if (message?.type === "renderState") {
                render(message.state);
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
