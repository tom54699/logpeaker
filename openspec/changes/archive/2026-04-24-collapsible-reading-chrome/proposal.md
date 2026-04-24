## Why

`Phase 3` 完成後，閱讀位置保存已成立，但 loaded 狀態的 chrome 仍有一個未完成的取捨：完全固定會吃掉閱讀空間，完全移除又會讓未來工具列與狀態資訊失去合理入口。這需要一個比「固定」與「刪掉」更穩的中間形態。

## What Changes

- 為 loaded 狀態加入可縮合 chrome，讓閱讀時不長期佔用頂部空間。
- 定義 chrome 的三種狀態：初始完整、縮合薄 bar、展開。
- 定義縮合後的喚出互動：滑鼠移入可展開，點一下可固定展開，再點一次可收回。
- 明確排除老闆鍵、hover 偽裝、顯示模式等後續功能，避免把這個 change 擴大成新的 milestone。

## Capabilities

### New Capabilities

- `collapsible-reading-chrome`: Allow the loaded reading chrome to collapse during reading and reappear without requiring the user to scroll back to the top.

### Modified Capabilities

None.

## Impact

- Affected code: panel webview rendering, loaded-state HTML structure, panel CSS, lightweight client-side interaction logic.
- APIs: existing VS Code Webview View API only.
- Dependencies: no new runtime dependencies expected.
- Systems: Log Peak loaded reading UI and related interaction verification.
