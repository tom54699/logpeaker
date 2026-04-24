## Context

LogPeak 已經完成底部 Panel 容器、TXT 載入，以及偽裝視覺語言。接下來最直接的產品缺口是缺乏閱讀延續性：只要關掉 panel、reload extension，使用者就得重新選檔和找位置。

這一階段已先收斂的決議是：

- 閱讀進度預設記在 `workspaceState`
- 第一版 session 欄位為 `fileUri`、`fileName`、`scrollTop`、`topLine`、`fileMtimeMs`
- 恢復時機採中間型：不在 extension 啟動時主動搶畫面，但當 panel 被打開時自動恢復

## Goals / Non-Goals

**Goals:**
- 在目前 workspace 內保存最近一次有效閱讀 session。
- 在 panel 被打開時自動嘗試恢復上次閱讀的檔案與位置。
- 對檔案已變更或無法恢復的情況提供安全退化。
- 讓 session 恢復邏輯具備可重複驗證的測試。

**Non-Goals:**
- 全域跨 workspace 的同步進度
- 多檔案最近紀錄列表
- 老闆鍵狀態保存
- 視覺設定或開關保存
- 搜尋、書籤、跳行

## Decisions

### Use workspaceState for persisted reading sessions
閱讀進度屬於工作區內的閱讀現場，而不是使用者全域偏好，因此優先使用 `context.workspaceState`。這可避免不同 workspace 之間互相污染。

### Persist a small session snapshot instead of full UI state
第一版只保存檔案識別與位置資訊，不保存暫時性的 UI 細節。這能讓資料結構保持乾淨，也比較容易在後續階段擴充。

### Restore on panel open, not on extension startup
extension 啟動時不主動重新掛載檔案，避免太侵入。當使用者打開 panel 時再自動恢復，能兼顧自然度與低驚擾。

### Use file metadata to validate restoration
除了檔案 URI 與名稱之外，也要保留 `fileMtimeMs` 來檢查檔案是否已變動。若內容已改變，恢復邏輯應安全退化，而不是盲目跳到舊位置。

### Keep scrollTop and topLine together in Phase 3
第一版先同時保存 `scrollTop` 與 `topLine`。`scrollTop` 有利於精準回到原視口，`topLine` 則可作為檔案變更或排版差異時的退化依據。

## Risks / Trade-offs

- [檔案內容變更後原位置已不準確] → 以 `fileMtimeMs` 判斷是否退化恢復，必要時改以較保守的方式回到接近位置。
- [scroll 事件過於頻繁造成額外負擔] → 採節流寫入，避免每次 scroll 都直接更新 storage。
- [恢復流程太早觸發造成畫面閃動] → 僅在 panel 打開時嘗試恢復，且先走 loading/restore 流程。
- [持久化資料結構過早擴張] → 第一版只存最小必要欄位，暫不混入更多 UI 狀態。

## Open Questions

- `scrollTop` 與 `topLine` 實作上要誰作為主要恢復依據、誰作為 fallback。
- 檔案 `mtime` 改變時，是要直接放棄自動恢復，還是做保守位置恢復。
