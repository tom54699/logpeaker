## Why

使用者希望 panel 在無互動時常態呈現 boss mode 畫面（偽裝成 service log），只有在主動滑鼠 hover 時才露出真實 TXT 內容，提升日常閱讀的隱蔽性。現有 boss mode 需要快捷鍵主動觸發，缺乏被動偽裝能力。

## What Changes

- 新增 VS Code setting `logPeak.hoverDisguise`（boolean，預設 `true`）
- 啟用時：panel 預設顯示 boss mode overlay，滑鼠進入 webview 立即切換至 TXT，滑鼠離開立即還原 boss mode
- 切換邏輯由純 CSS `:hover` 實現（無 transition，無 JS 事件）
- overlay 覆蓋整個 panel，包含 reading chrome toolbar
- 移除現有 `globalState` 的 `logPeak.hoverDisguise` 依賴，改由 `vscode.workspace.getConfiguration` 讀取
- 監聽 `onDidChangeConfiguration`，setting 變更時即時更新 panel（不需重啟）
- 與現有 boss mode 快捷鍵切換並存、互不干擾

## Capabilities

### New Capabilities

- `hover-disguise`: 滑鼠 hover 觸發的被動偽裝能力——預設顯示 boss mode overlay，hover 時露出 TXT；透過 VS Code setting 開關

### Modified Capabilities

- `minimal-boss-mode`: hoverDisguise 的 enabled 狀態來源由 globalState 改為 VS Code configuration

## Impact

- `package.json`: 新增 `logPeak.hoverDisguise` configuration 宣告
- `src/extension.ts`: 監聽 `onDidChangeConfiguration`
- `src/panel/logPeakPanelViewProvider.ts`: 改讀 configuration、移除 `HOVER_DISGUISE_KEY` globalState、移除或保留 `toggleHoverDisguise()` command（視需求）
- `media/panel.css`: 補完 `hover-disguise-overlay` 樣式
- 測試：需涵蓋 setting 讀取、configuration 變更通知、overlay 啟用/停用狀態
