## Why

LogPeak 需要先驗證一個最基本但關鍵的前提：VS Code 底部 Panel 能否承載這個產品形態，且畫面看起來要自然接近 Output / Log Viewer，而不是一般閱讀器。現在先做這一步，可以在投入讀檔、閱讀狀態與老闆鍵之前，先確認容器位置與視覺方向是否成立。

## What Changes

- 建立一個最小可運行的 VS Code extension 骨架。
- 在底部 Panel 註冊 `Log Peak` view。
- 使用 `WebviewViewProvider` 顯示靜態內容。
- 以 log 為主、夾少量 code 的假資料驗證視覺方向。
- 跟隨目前 VS Code theme，確保畫面不突兀。

## Capabilities

### New Capabilities
- `panel-shell`: Provide a bottom-panel webview shell for LogPeak and validate the initial output/log-style visual direction.

### Modified Capabilities

None.

## Impact

- Affected code: extension activation, panel view registration, webview provider, static panel rendering.
- APIs: VS Code Extension API, Webview View API.
- Dependencies: TypeScript-based VS Code extension tooling.
- Systems: VS Code bottom panel UI and local extension development host flow.
