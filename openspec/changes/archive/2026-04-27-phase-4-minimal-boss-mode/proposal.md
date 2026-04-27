## Why

`Log Peak` 目前已可在底部 Panel 低調閱讀 TXT，並保留閱讀位置與可縮合 chrome。下一步需要補上最小老闆鍵能力，讓使用者能在同一個 panel 內快速切成看起來像工作中的 runtime log 畫面，再切回原本閱讀現場。

## What Changes

- 在同一個 `Log Peak` panel 內加入最小老闆鍵切換能力。
- 第一版假畫面基準採 `Service / Runtime Log`，不先做多模板。
- 第一版只用 `command / 快捷鍵` 觸發，不在畫面上加入明顯切換入口。
- 切回閱讀模式時，恢復原本 TXT、閱讀位置、以及閱讀 chrome 狀態。

## Capabilities

### New Capabilities

- `minimal-boss-mode`: Toggle a runtime-log disguise view inside the existing Log Peak panel and restore the current reading session when toggled off.

### Modified Capabilities

None.

## Impact

- Affected code: panel state management, webview render path, command registration, reading-session restore integration.
- APIs: existing VS Code commands/keybindings, Webview View messaging, existing workspace-scoped reading session state.
- Dependencies: no new runtime dependencies expected.
- Systems: loaded reading mode, panel disguise rendering, and reading-chrome/session restoration.
