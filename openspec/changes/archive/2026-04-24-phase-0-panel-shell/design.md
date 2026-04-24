## Context

目前專案仍在確認產品形態是否成立，因此這次變更只需要一個足以驗證方向的最小 extension shell。核心限制是閱讀區必須位於 VS Code 底部 Panel，且視覺要接近 Output / Log Viewer，而不是 terminal 或一般閱讀器。

現階段不需要真實 TXT 讀取、閱讀位置保存或老闆鍵；這些都會增加狀態管理與互動複雜度，會干擾 `Phase 0` 對容器與視覺方向的驗證。

## Goals / Non-Goals

**Goals:**
- 建立一個可在 Extension Development Host 中啟動的 TypeScript VS Code extension。
- 在底部 Panel 註冊 `Log Peak` view。
- 使用 `WebviewViewProvider` 顯示靜態內容。
- 讓畫面跟隨 VS Code theme，整體視覺偏 output/log。

**Non-Goals:**
- 本機 `.txt` 開檔流程。
- 閱讀進度或狀態保存。
- 老闆鍵或假畫面切換。
- Stealth / Normal / Focus 模式。
- 複雜滑鼠互動、hover 淡化、效能最佳化。

## Decisions

### Use a panel webview instead of an editor tab
將 `Log Peak` 放在底部 Panel，符合產品定位，也能最直接驗證它是否能自然融入 Terminal / Problems / Output 同區塊。先不提供 editor tab fallback，避免第一階段混入兩套交互模型。

### Use static seeded content for validation
`Phase 0` 只需驗證容器與視覺，因此使用固定假資料最合適。這能避免 file I/O、編碼處理與閱讀狀態保存提早進入架構。

### Keep the view visually close to VS Code native panel language
畫面會跟隨 VS Code theme、使用等寬字體、以低風險配色和簡單版面呈現。內容以 log 為主，穿插少量 code，降低被看成閱讀器的機率。

### Keep architecture minimal but extensible
第一版只需要 activation、view registration、webview provider、靜態 renderer。這個切分足夠支持後續 Phase 1 加入真實 TXT 讀取，而不需要在 `Phase 0` 引入過多 abstraction。

## Risks / Trade-offs

- [Panel shell only may feel too thin] → 這是刻意取捨；`Phase 0` 的目標是驗證位置與風格，不是交付完整功能。
- [Static content may not reveal later reading UX issues] → 後續在 `Phase 1` 再驗證真實內容載入與捲動。
- [Bottom panel height is limited] → 這正是要在此階段驗證的條件，而不是避開它。
