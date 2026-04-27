import * as vscode from "vscode";
import { LogPeakPanelViewProvider } from "./panel/logPeakPanelViewProvider";

export function activate(context: vscode.ExtensionContext): void {
  const provider = new LogPeakPanelViewProvider(context.extensionUri, context.workspaceState);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      LogPeakPanelViewProvider.viewType,
      provider,
    ),
    vscode.commands.registerCommand("logPeak.toggleBossMode", async () => {
      await provider.toggleBossMode();
    }),
  );
}

export function deactivate(): void {}
