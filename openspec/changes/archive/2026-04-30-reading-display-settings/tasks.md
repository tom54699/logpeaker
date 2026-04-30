## 1. CSS custom property 基礎

- [x] 1.1 在 `media/panel.css` 的 `body` 改用 `--lp-font-size` / `--lp-line-height` CSS variable，設合理 fallback
- [x] 1.2 在 `.row` 改用 `line-height: var(--lp-line-height)`
- [x] 1.3 確認 chrome 內的小字元素（11px）改為固定值，不繼承 body font-size

## 2. 設定狀態與持久化（Extension Host）

- [x] 2.1 定義 `DisplaySettings` type：`{ fontSize: number; lineHeight: number }`，預設 `{ fontSize: 13, lineHeight: 1.6 }`
- [x] 2.2 在 `LoadedPanelState` 新增 `displaySettings: DisplaySettings`
- [x] 2.3 `loadFileIntoPanel()` 從 `workspaceState.get("logPeak.displaySettings")` 讀取初始值（缺少時用預設）
- [x] 2.4 新增 `setDisplaySetting(key, value)` method：更新 state、存 workspaceState、postMessage `applyDisplaySettings` 到 webview
- [x] 2.5 在 `onDidReceiveMessage` 加 `setDisplaySetting` handler

## 3. Toolbar render（webview）

- [x] 3.1 在 `renderPanelBody()` loaded state 的 toolbar 加入字體大小 segment：`S M L XL`（data-action="set-font-size" data-value="11/13/15/18"）
- [x] 3.2 加入行距 segment：`緊 標準 鬆`（data-action="set-line-height" data-value="1.4/1.6/1.9"）
- [x] 3.3 active item 依 `state.displaySettings` 加 `--active` class
- [x] 3.4 在 document click handler 加 `set-font-size` / `set-line-height` handler → postMessage `setDisplaySetting`

## 4. 即時套用（webview）

- [x] 4.1 在 `window.addEventListener("message")` 加 `applyDisplaySettings` handler
- [x] 4.2 handler 執行 `document.body.style.setProperty("--lp-font-size", fontSize + "px")` 與 `--lp-line-height`
- [x] 4.3 初始 render 時也從 `initialState.displaySettings` 套用（避免 FOUC）

## 5. 樣式

- [x] 5.1 在 `media/panel.css` 新增 segment control 樣式（`.display-setting-group`、`.display-setting-btn`、`.display-setting-btn--active`）

## 6. 測試

- [x] 6.1 確認所有現有測試通過（無 regression）
