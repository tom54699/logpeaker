## Why

閱讀 EPUB/TXT 時，字體大小與行距直接影響閱讀舒適度，但目前兩者皆寫死在 CSS（12px、1.55）。不同使用者、不同螢幕解析度、不同書籍排版需要不同設定。Reading chrome toolbar 已作為功能承載區，是加入顯示設定控制的自然位置。

## What Changes

- **字體大小選擇器**：在 reading chrome toolbar 新增 S / M / L / XL 四段選擇（11 / 13 / 15 / 18px），預設 M（13px）
- **行距選擇器**：在 reading chrome toolbar 新增緊 / 標準 / 鬆 三段選擇（1.4 / 1.6 / 1.9），預設標準（1.6）
- **即時生效**：透過 CSS custom property 注入，不重新 render 行列
- **持久化**：設定存於 `workspaceState`，重開 VS Code 後保留
- **TXT 與 EPUB 共用**：兩種格式使用相同設定

## Capabilities

### New Capabilities

- `reading-display-settings`: 字體大小與行距的 in-panel 選擇器，透過 CSS variable 即時套用

### Modified Capabilities

- `chapter-navigation`: toolbar 需容納新的控制元素（layout 調整）

## Impact

- `src/panel/logPeakPanelViewProvider.ts`：新增設定狀態、toolbar render、message handler、workspaceState 持久化
- `media/panel.css`：新增 CSS custom property、選擇器按鈕樣式
- 無新依賴
