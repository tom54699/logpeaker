## Why

閱讀器目前文字欄跑全寬，在較寬的面板下眼睛需要掃很長的距離，閱讀體驗差。加入欄寬控制讓使用者能限制文字最大顯示寬度，讓每行字數保持在舒適範圍。

## What Changes

- 在 toolbar 的 display settings 區域新增一個 content width dropdown
- 可選項：全寬（無限制）/ 40ch / 50ch / 60ch / 72ch / 80ch
- 設定持久化，與 fontSize / lineHeight 走同一套 `displaySettings` 機制
- 文字欄寬超出限制時自動水平置中

## Capabilities

### New Capabilities

無（本次為擴充既有功能，見下方 Modified Capabilities）

### Modified Capabilities

- `reading-display-settings`: 新增 `contentWidth` 欄位，擴充 displaySettings 的設定範圍與 toolbar UI

## Impact

- `src/panel/logPeakPanelViewProvider.ts`：`DisplaySettings` 型別加欄位、message handler 擴充、toolbar HTML 新增 dropdown、CSS 變數套用
- `media/panel.css`：加入 `--lp-content-width` CSS 變數，套用在 `.shell__rows` 的 `max-width` 與 `margin: auto`
