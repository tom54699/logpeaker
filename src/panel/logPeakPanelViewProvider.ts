import * as vscode from "vscode";

type SeededEntry = {
  kind: "info" | "warn" | "code";
  label: string;
  content: string;
};

const SEEDED_ENTRIES: SeededEntry[] = [
  {
    kind: "info",
    label: "INFO",
    content: "watcher attached: panel-shell bootstrap sequence",
  },
  {
    kind: "info",
    label: "INFO",
    content: "render target: panel/output-region/log-peak",
  },
  {
    kind: "warn",
    label: "WARN",
    content: "deferred capability: file-loading remains disabled in phase-0",
  },
  {
    kind: "code",
    label: "TS",
    content: "const panelMode = \"output-shell\";",
  },
  {
    kind: "code",
    label: "TS",
    content: "registerView(\"logPeak.panelView\", provider);",
  },
  {
    kind: "info",
    label: "INFO",
    content: "theme bridge active: foreground/background bound to vscode tokens",
  },
  {
    kind: "info",
    label: "INFO",
    content: "seed stream complete: awaiting future txt ingestion pipeline",
  },
];

export class LogPeakPanelViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "logPeak.panelView";

  public constructor(private readonly extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    const { webview } = webviewView;
    const stylesheetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "panel.css"),
    );

    webview.options = {
      enableScripts: false,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "media")],
    };

    webviewView.webview.html = this.getHtml(webview, stylesheetUri);
  }

  private getHtml(webview: vscode.Webview, stylesheetUri: vscode.Uri): string {
    const rows = SEEDED_ENTRIES.map((entry, index) => {
      return `
        <div class="row row--${entry.kind}">
          <span class="row__index">${String(index + 1).padStart(2, "0")}</span>
          <span class="row__label">${entry.label}</span>
          <span class="row__content">${escapeHtml(entry.content)}</span>
        </div>
      `;
    }).join("");

    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link href="${stylesheetUri}" rel="stylesheet" />
          <title>Log Peak</title>
        </head>
        <body>
          <section class="shell">
            <header class="shell__header">
              <span class="shell__title">output :: log-peak.panel</span>
              <span class="shell__meta">phase-0 shell validation</span>
            </header>
            <div class="shell__rows">${rows}</div>
          </section>
        </body>
      </html>`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
