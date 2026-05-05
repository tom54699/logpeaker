## 1. 型別與預設值

- [x] 1.1 在 `DisplaySettings` 型別加入 `contentWidth: number` 欄位
- [x] 1.2 更新 `DEFAULT_DISPLAY_SETTINGS` 將 `contentWidth` 設為 `0`（全寬）

## 2. CSS

- [x] 2.1 在 `media/panel.css` 的 `.shell__rows` 加入 `max-width: var(--lp-content-width, none)` 與 `margin-left: auto; margin-right: auto;`

## 3. Provider 邏輯

- [x] 3.1 擴充 `onDidReceiveMessage` 的 `setDisplaySetting` handler，允許 `key === "contentWidth"`
- [x] 3.2 擴充 `setDisplaySetting` 方法，在 `applyDisplaySettings` postMessage 中帶出 `contentWidth`

## 4. Webview UI

- [x] 4.1 在 `renderPanelBody` 的 loaded state 中，於 font size / line height 之後新增 content width `<select>`（選項：0=全寬、40、50、60、72、80，顯示為「full」/「40ch」等）
- [x] 4.2 在 `document.addEventListener("change", ...)` handler 中，加入 `action === "set-content-width"` 的分支，送出 `setDisplaySetting` message
- [x] 4.3 在 `window.addEventListener("message", ...)` 的 `applyDisplaySettings` 分支，根據 `contentWidth` 設置或移除 `--lp-content-width` CSS 變數
- [x] 4.4 在 initial state 套用時（頁面載入）同步套用 `contentWidth`

## 5. 測試

- [x] 5.1 為 `setDisplaySetting` contentWidth 邏輯撰寫單元測試（確保 0 → 無限制、非 0 → 套用對應 ch 值）
- [ ] 5.2 手動驗證：切換 content width dropdown，文字欄即時縮窄並置中，重開 panel 後設定還原
