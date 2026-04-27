## Context

目前 loaded TXT 的渲染模型是「整份文件一次送進 webview，並渲染成完整 DOM tree」。這在小檔案時可行，但在大 TXT 上會同時放大三個問題：

- DOM 節點數與文件行數 1:1 對應
- `topLine` 目前會在 scroll 路徑中做 O(n) 的 `.row` 掃描
- host 端與 webview 端對同一份文本做重複拆分，且 `rowDecorations` payload 隨行數線性成長

目前先不直接把整個渲染模型重做成虛擬列表，而是先做低風險優化，觀察回報與剩餘瓶頸。

## Goals / Non-Goals

**Goals:**
- 明顯降低大 TXT 的滾動卡頓與初始載入壓力。
- 避免在每次 scroll 時做完整可見行掃描。
- 保持現有 reading-session 保存 / 恢復功能不退化。
- 保留之後升級到虛擬滾動的空間。

**Non-Goals:**
- 立即導入完整虛擬滾動
- 重新設計 panel 視覺語言
- 新的閱讀功能（搜尋、跳行、書籤）
- 老闆鍵與其他後續互動

## Decisions

### Move top-line calculation out of the hot scroll path
目前 scroll 路徑的主要浪費，是每次都要掃描所有 `.row` 找第一個可見行。第一步應該把 `topLine` 計算移出 hot path，只在必要時機計算，例如 debounce flush、hidden/unload flush，或更低頻的節點。

### Reduce duplicate row splitting and oversized payloads
同一份文本不應在 host 端與 webview 端各做一次完整拆分。第一步至少要減少不必要的重複 split 與每行物件 payload，避免初始載入時的額外成本。

### Keep the current reading-session model intact
性能優化不能把 `workspaceState` session schema、restore target 或實際的滾動容器再弄壞。任何性能調整都要以「不回歸 Phase 3」為前提。

### Treat virtual scrolling as a likely follow-up, not an immediate requirement
完整 DOM 仍是根本限制，但虛擬滾動實作成本較高，也可能影響選字、tag、restore 行為。這次 change 先把最便宜且高回報的瓶頸壓掉，再決定是否升級為虛擬化。

## Risks / Trade-offs

- [低風險優化不夠解根因] → 先接受這一輪是階段性改善，必要時再開第二階段做虛擬滾動。
- [延後 `topLine` 計算會降低恢復精度] → 保留 `scrollTop` 為主要依據，並在 flush 時補計算 `topLine`。
- [壓縮 payload 後讓渲染邏輯變複雜] → 優先選擇簡單、可測的資料格式收斂。

## Open Questions

- 第一輪優化後，大 TXT 的剩餘瓶頸是否仍主要來自完整 DOM。
- 若後續需要虛擬滾動，行高是否要固定，或需支援可變高度測量。
