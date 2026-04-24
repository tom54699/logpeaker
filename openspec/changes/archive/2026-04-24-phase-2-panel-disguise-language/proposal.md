## Why

`Phase 1` 已證明 LogPeak 可以在底部 Panel 載入並顯示本機 TXT，但目前仍然偏向「能讀 TXT 的工具」。下一步需要把預設視覺語言收斂成更像 VS Code output / build log viewer 的樣子，才能驗證偽裝感是否成立。

## What Changes

- 將已載入文字內容的 panel 視覺基準收斂為 `Output / build log`，混入少量 `code viewer` 節奏。
- 定義 loaded state 的 header 結構、行號存在感、前綴 tag 風格、toolbar 骨架與整體顏色層級。
- 保留輕量 hover 與版面分隔節奏，但避免把互動或閱讀器感做得太重。
- 明確排除 toolbar 開關化、hover 前後偽裝切換、老闆鍵與其他後續互動能力。

## Capabilities

### New Capabilities
- `panel-disguise-language`: Define the Phase 2 visual language that makes loaded text content look like a VS Code output / build log viewer instead of a reader.

### Modified Capabilities

None.

## Impact

- Affected code: panel webview rendering, loaded-state HTML structure, panel CSS, possible lightweight client-side row tag generation.
- APIs: existing VS Code Webview View API only.
- Dependencies: no new runtime dependencies expected.
- Systems: Log Peak loaded-state presentation and related test coverage.
