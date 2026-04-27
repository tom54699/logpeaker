## Why

目前 `Log Peak` 在一般大小的 TXT 上可用，但大檔案時仍然容易卡頓。問題已定位到完整 DOM 渲染、每次 scroll 的 O(n) 可見行掃描，以及 host → webview payload 過大。這些問題會直接影響閱讀體驗，也會放大後續功能的實作成本。

## What Changes

- 先做一輪低風險性能優化，減少大 TXT 的載入與滾動成本。
- 調整閱讀位置保存相關的計算時機，避免在每次 scroll 都進行完整可見行掃描。
- 收斂 host → webview 的資料量與重複字串分割成本。
- 明確記錄如果低風險優化不足，後續將評估虛擬滾動。

## Capabilities

### New Capabilities

- `large-txt-performance`: Improve large TXT loading and scrolling behavior without regressing current reading-session behavior.

### Modified Capabilities

None.

## Impact

- Affected code: panel webview render path, scroll/save progress path, large text row generation, related tests.
- APIs: existing VS Code Webview View API only.
- Dependencies: no new runtime dependencies expected in the first stage.
- Systems: Log Peak loaded reading mode, especially large TXT performance.
