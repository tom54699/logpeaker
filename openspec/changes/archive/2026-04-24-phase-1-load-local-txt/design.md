## Context

`Phase 0` 已完成底部 Panel 容器與基礎 webview shell，接下來要把 seeded content 換成真實的本機 TXT 內容。這一階段仍然維持超小範圍，只驗證「能不能低風險地把本機 `.txt` 載入到底部 Panel」。

目前已定的限制是：
- 只支援 UTF-8 / UTF-8 with BOM
- 開檔入口先放在 panel 內容內
- 暫時不做檔案大小限制
- 暫時不做記憶位置、行號、老闆鍵與 command-based 路徑輸入

## Goals / Non-Goals

**Goals:**
- 在 panel 內提供工程師感的空狀態畫面。
- 提供 `Open TXT` 入口讓使用者手動選取本機 `.txt`。
- 成功讀取後以文字內容取代 seeded shell 內容。
- 失敗時提供清楚但低調的錯誤狀態。
- 保留目前底部 Panel 與基礎捲動模型。
- 保持樣式載入穩定，不讓 panel 因為 webview 重建而退回裸 HTML 或卡在 boot 畫面。

**Non-Goals:**
- 記住閱讀位置
- 老闆鍵
- 指令帶入檔案路徑
- 檔案大小最佳化
- 多編碼支援

## Decisions

### Use a panel-internal entry point first
第一個載入入口放在 panel 內容內，而不是先做 command-based path input。這樣最容易理解與驗證，也能保留日後擴充第二入口的空間。

### Reuse the existing webview shell with explicit UI states
不重做整個 view 型態，而是在現有 webview 上增加明確狀態：empty、loading、loaded、error。這能讓 `Phase 1` 保持最小改動範圍，也避免使用者在大檔或較慢渲染時看到半成品畫面。

### Keep one persistent webview shell and update content via messages
webview HTML 與 stylesheet 只初始化一次，後續狀態切換透過 message 更新內容區。這樣可以避免每次 state 變更都重建整頁，降低 stylesheet 偶發沒套用或 boot 畫面卡住的風險。

### Restrict decoding to UTF-8 / UTF-8 with BOM
先只支援 UTF-8 系列，避免 Phase 1 被編碼判斷與跨平台邊界問題拖大。其他編碼留待後續需求驗證。

### Load file through extension host and send rendered data to webview
本機檔案選取與讀取由 extension host 處理，webview 只負責顯示狀態與內容。這樣邊界清楚，也比較符合 VS Code extension 慣例。

### Lightweight row chrome is acceptable in Phase 1
目前 loaded 狀態保留輕量的列索引與 `TXT` 標記，作為 panel 視覺語言的一部分。這不代表已進入後續更完整的閱讀輔助功能，只是讓文字內容維持 code/log viewer 的氣質。

## Risks / Trade-offs

- [Panel-internal entry may feel less engineer-like than a command] → 後續可補 command 入口，但 Phase 1 先追求最低摩擦。
- [No file size limit may expose large-file issues] → 此階段先觀察真實使用情況，若出現卡頓再收斂限制或最佳化。
- [UTF-8-only support may reject some text files] → 這是刻意限縮，先避免把編碼複雜度帶進最小可用版本。
