import * as vscode from "vscode";
import { LogPeakPanelViewProvider } from "./panel/logPeakPanelViewProvider";

export function activate(context: vscode.ExtensionContext): void {
  const provider = new LogPeakPanelViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      LogPeakPanelViewProvider.viewType,
      provider,
    ),
  );
}

export function deactivate(): void {}
