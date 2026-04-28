## 1. Package Configuration

- [x] 1.1 在 `package.json` 的 `contributes.configuration` 新增 `logPeak.hoverDisguise` 設定（type: boolean，default: true，附帶說明文字）
- [x] 1.2 移除 `package.json` 中 `toggleHoverDisguise` command 宣告（若存在）

## 2. Extension Host 整合

- [x] 2.1 在 `logPeakPanelViewProvider.ts` 移除 `HOVER_DISGUISE_KEY` 常數與所有 `globalState` 相關的 hoverDisguise 讀寫
- [x] 2.2 在 `logPeakPanelViewProvider.ts` 新增 `readHoverDisguiseSetting()` 方法，讀取 `vscode.workspace.getConfiguration('logPeak').get<boolean>('hoverDisguise', true)`
- [x] 2.3 更新 `loadFileIntoPanel()` 中的 `hoverDisguise.enabled` 來源，改呼叫 `readHoverDisguiseSetting()`
- [x] 2.4 新增 `updateHoverDisguiseSetting()` public 方法：讀取最新 setting 值，若 state 為 loaded 則更新 state 並 render
- [x] 2.5 移除 `toggleHoverDisguise()` 方法與對應 command handler（若存在於 `extension.ts`）
- [x] 2.6 在 `extension.ts` 的 `activate()` 中加入 `vscode.workspace.onDidChangeConfiguration` listener，偵測 `logPeak.hoverDisguise` 變更時呼叫 `provider.updateHoverDisguiseSetting()`

## 3. CSS 實作

- [x] 3.1 在 `media/panel.css` 新增 `.loaded-state` 的 `position: relative`（若尚未設定）
- [x] 3.2 新增 `.loaded-state--hover-disguise .hover-disguise-overlay` 樣式：`position: absolute; inset: 0; z-index: 20; background: var(--vscode-editor-background); display: flex; flex-direction: column; overflow: hidden`
- [x] 3.3 新增 `.loaded-state--hover-disguise:hover .hover-disguise-overlay { display: none; }` 規則

## 4. 測試

- [x] 4.1 新增測試：`logPeak.hoverDisguise` 預設值為 `true`
- [x] 4.2 新增測試：setting 為 `true` 時，loaded state 的 `hoverDisguise.enabled` 為 `true`
- [x] 4.3 新增測試：setting 為 `false` 時，loaded state 的 `hoverDisguise.enabled` 為 `false`
- [x] 4.4 新增測試：`updateHoverDisguiseSetting()` 在 setting 變更後正確更新 state 並觸發 render
- [x] 4.5 確認現有 boss mode 相關測試仍通過（無 regression）

## 5. Webview 狀態保留（retainContextWhenHidden）

- [x] 5.1 在 `extension.ts` 的 `registerWebviewViewProvider` 加入 `{ webviewOptions: { retainContextWhenHidden: true } }`
- [x] 5.2 更新 `docs/business/project-context.md` 補記此決議與 hover-disguise-panel change 決議
- [x] 5.3 跑測試確認無 regression

## 6. Hover 偵測修正（CSS :hover → JS mouseenter/mouseleave）

- [x] 6.1 CSS 改 `.loaded-state--hover-disguise.mouse-inside .hover-disguise-overlay { display: none }`，移除 `:hover` 規則
- [x] 6.2 JS 加 `bindHoverDisguise` / `unbindHoverDisguise`，綁定 `document.documentElement` 的 `mouseenter`/`mouseleave`，toggle `.mouse-inside` class
- [x] 6.3 `render()` 中依 state 呼叫 bind/unbind
- [x] 6.4 手動驗證：切 Terminal 再切回後滑鼠移入立即顯示 TXT，無卡頓
