## Context

`Phase 0` 與 `Phase 1` 已先後驗證底部 Panel 容器與本機 TXT 載入能力。現在的主要問題不是能不能顯示內容，而是 loaded state 的氣質還不夠穩定，容易看起來像「文字閱讀工具」而不是 VS Code 的工程面板。

這一階段只處理視覺語言，不擴充新能力。討論已先收斂的方向是：

- 主視覺基準採 `Output / build log`
- 次要參考採少量 `code viewer` 節奏
- 不走 `Terminal`、`Problems`、一般閱讀器語言
- 行號保留，先維持目前強度
- header 採混合型資訊結構
- 前綴標記採低頻率、混合型 log/source tag
- toolbar 保留極簡骨架，作為未來功能承載區

## Goals / Non-Goals

**Goals:**
- 讓 loaded state 更像 VS Code output / build log viewer，而不像閱讀器。
- 明確定義 header、row、tag、toolbar 與顏色階層的預設視覺語言。
- 保持目前讀檔流程與 webview 架構不變，只調整呈現。
- 為後續互動與設定化留下擴充空間，但不在本階段實作。

**Non-Goals:**
- 視覺元素開關
- toolbar hover 前偽裝、hover 後顯示真實功能
- 老闆鍵
- 閱讀位置保存
- 搜尋、跳行、書籤
- 任何新的資料來源或編碼支援

## Decisions

### Use output/build-log as the primary disguise baseline
已載入內容的面板將優先像 output/build-log viewer，而不是像 reader。這比偏 `Terminal` 或 `Problems` 更適合長篇連續文本，也更符合目前產品定位。

### Keep the header split into a fixed panel identity and a dynamic file state
header 左側維持 `output :: log-peak.panel` 這種固定識別；右側採 `utf-8 :: <file-name> :: ready` 的動態資訊。這能保持面板感，也能讓檔案狀態自然存在，不必引入更重的工具列語言。

### Retain line numbers and introduce partial mixed tags instead of uniform TXT labels
行號先維持目前存在感，作為結構骨架。前綴標記不再整頁都是 `TXT`，改為低頻率出現、採混合型 tag，例如 `INFO`、`WARN`、`IO`、`CORE`、`TRACE`。這能保留工程感，但不需要做真正的內容語意分析。

### Keep toolbar minimal and subordinate to the content
toolbar 只保留必要骨架與現有關鍵入口，例如 `Open TXT`。它要看得出是控制區，但不能搶過文字內容本身，也不應在此階段承擔太多未來功能的 placeholder。

### Treat hover and separators as subtle panel cues, not primary interaction
row hover 只做極輕微的背景或邊界變化；分隔節奏只為了建立版面層次，不承擔章節判斷或閱讀節奏引導。這可以強化 panel 氣質，避免畫面變成 reader UI。

## Risks / Trade-offs

- [視覺語言太克制，變化不明顯] → 先確保方向正確，之後再用小幅度迭代微調強度。
- [混合型 tag 如果分布不自然，會像刻意生成] → 先採固定但低頻率規則，不做過度花俏的標記節奏。
- [toolbar 太弱可能不夠像工具面板] → 保留明確骨架與必要動作，後續再視使用體感調整強弱。
- [過早加入互動偽裝會把 scope 拉胖] → 將 toolbar hover 偽裝、設定開關與模式切換明確延後到後續 phase。

## Open Questions

- 混合型 tag 的實際分布規則要多規律，才能既像 log 又不顯得過度設計。
- toolbar 的 spacing 與對比強度是否需要先做一版偏更低調的嘗試。
