## Context

`Phase 3` 已經完成閱讀位置保存與恢復，但過程中也確認了另一個實際使用問題：閱讀模式如果保留固定 header / toolbar，會持續吃掉可用空間；如果直接全部移除，雖然閱讀更乾淨，但之後的工具列與狀態資訊就沒有自然的存在方式。

因此這個 change 的定位不是新 phase，而是 `Phase 3` 之後的一個小型 UI refinement。目標是替 loaded 狀態建立「可見但不長期佔位」的 chrome。

已收斂的方向是：

- 初始顯示完整 chrome
- 開始閱讀後可縮成薄 bar
- 滑鼠移入可展開
- 點一下可固定展開，再點一次收回

## Goals / Non-Goals

**Goals:**
- 讓閱讀模式保有可喚出的 chrome，而不是永久固定或永久消失。
- 避免使用者必須捲回頂部才能操作後續工具列功能。
- 讓 chrome 在閱讀時大多數時間只佔極少空間。
- 保持目前保存 / 恢復鏈路不被這個 UI refinement 破壞。

**Non-Goals:**
- 老闆鍵
- Stealth / Normal / Focus
- toolbar 偽裝成 log 後 hover 才顯示功能
- 搜尋、跳行、書籤
- 任何新的資料來源或儲存邏輯

## Decisions

### Separate reading chrome behavior from milestone planning
這個需求不佔用 `Phase 4`。它是 `Phase 3` 完成後的獨立小 change，避免把 UI refine 與真正的新能力 milestone 混在一起。

### Use a mixed interaction model for collapsed chrome
單靠 hover 不夠穩，單靠點擊又太僵。採混合型：

- 預設完整顯示
- 閱讀後可自動或半自動縮為薄 bar
- 滑鼠移入可暫時展開
- 點一下可固定展開
- 再點一次可收回

這樣既不要求使用者回頂部，也保留未來工具列擴充的合理位置。

### Keep collapsed chrome visually minimal
縮合後只應保留一條很薄的 bar 或 handle，明確表示「這裡有可展開的控制區」，但不能持續搶走閱讀空間。它的視覺強度必須明顯低於正文。

### Preserve reading-session behavior unchanged
這個 change 不應改動 `workspaceState`、session schema、restore target、或保存頻率。若有必要調整 DOM 結構，也應確保 `.shell__rows` 仍然是實際的內容滾動容器，避免回歸先前的保存問題。

## Risks / Trade-offs

- [縮合 bar 不夠明顯，使用者不知道可展開] → 保留清楚但極簡的視覺 handle。
- [hover 與 click 狀態混在一起後互動太複雜] → 第一版只做最少狀態，不提前加動畫與過多條件。
- [調整 DOM 結構後破壞現有保存/恢復] → 將保存鏈路視為不可退化路徑，手動驗證必須包含 reopen restore。

## Open Questions

- 自動縮合的門檻要綁在滾動量、首次互動，還是明確的手動收合。
- 縮合 bar 是否需要保留極少量 meta，例如檔名或 source handle。
