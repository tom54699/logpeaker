import * as vscode from "vscode";
import { LogPeakPanelViewProvider } from "./panel/logPeakPanelViewProvider";

export function activate(context: vscode.ExtensionContext): void {
  const provider = new LogPeakPanelViewProvider(
    context.extensionUri,
    context.workspaceState,
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      LogPeakPanelViewProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
    vscode.commands.registerCommand("logPeak.toggleBossMode", async () => {
      await provider.toggleBossMode();
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("logPeak.hoverDisguise")) {
        provider.updateHoverDisguiseSetting();
      }
    }),
  );
}

export function deactivate(): void {}
