## Why

`Phase 2` 已讓 LogPeak 的 loaded state 更像 IDE panel，但閱讀體驗仍然是一次性的。下一步需要記住工作區內最近閱讀的檔案與位置，讓使用者重新打開 panel 時可以延續上次閱讀進度。

## What Changes

- 在工作區範圍內保存最近一次閱讀 session。
- 記錄檔案識別與閱讀位置欄位：`fileUri`、`fileName`、`scrollTop`、`topLine`、`fileMtimeMs`。
- 當 `Log Peak` panel 被打開時，若 session 可用則自動恢復檔案與位置。
- 加入檔案變更或恢復失敗時的安全退化處理，不把後續 phase 的互動或設定開關混進來。

## Capabilities

### New Capabilities
- `reading-session-restore`: Persist and restore the last reading session for the current workspace when the Log Peak panel is reopened.

### Modified Capabilities

None.

## Impact

- Affected code: extension activation path, panel state management, file loading flow, workspace persistence integration.
- APIs: VS Code `workspaceState`, existing file system APIs, existing Webview View messaging.
- Dependencies: no new runtime dependencies expected.
- Systems: panel lifecycle, session persistence, and restoration behavior.
