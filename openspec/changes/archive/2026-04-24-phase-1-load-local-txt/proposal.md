## Why

`Phase 0` 已經證明 LogPeak 可以自然存在於 VS Code 底部 Panel。下一步需要把靜態假畫面換成真實 TXT 內容，才能驗證這個產品作為低調閱讀器是否真正可用。

## What Changes

- 在 panel 內提供工程師感的空狀態畫面。
- 提供 `Open TXT` 入口，讓使用者手動選取本機 `.txt` 檔案。
- 讀取 UTF-8 / UTF-8 with BOM 的文字內容並顯示在 panel 中。
- 提供基本空狀態、載入後內容視圖與讀取失敗狀態。
- 保留目前底部 Panel、webview 與基礎捲動模型。

## Capabilities

### New Capabilities
- `local-txt-loading`: Load a local UTF-8 `.txt` file into the Log Peak panel and replace the seeded shell content with real text content.

### Modified Capabilities

None.

## Impact

- Affected code: panel webview rendering, command wiring, local file selection flow, text loading and error-state rendering.
- APIs: VS Code file picker API, file system read APIs, Webview View API.
- Dependencies: existing TypeScript VS Code extension tooling.
- Systems: VS Code bottom panel experience and local file access flow.
