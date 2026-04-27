## Context

目前 `Log Peak` 已完成底部 Panel 容器、TXT 載入、偽裝語言、閱讀位置保存、可縮合 chrome，以及大檔 TXT 的第一輪性能優化。接下來真正的新能力是老闆鍵，但第一版必須刻意收斂，不要把多模板、複雜互動、或整套模式系統一起拉進來。

目前已收斂的方向是：

- 假畫面基準採 `Service / Runtime Log`
- 第一版只用 `command / 快捷鍵` 觸發
- 第一版預設快捷鍵採跨平台對應：`Cmd/Ctrl + Alt + \``
- 快捷鍵僅在 `Log Peak` 可見時生效
- 切回時採中等恢復：原本 TXT、閱讀位置、閱讀 chrome 狀態

## Goals / Non-Goals

**Goals:**
- 在同一個 `Log Peak` panel 內快速切換成看起來像工作中的 runtime log 畫面。
- 保持切換速度快，不重開新 tab，不改整個 VS Code layout。
- 切回閱讀模式時，恢復原本閱讀現場，而不是只回到檔案頂部。
- 儘量沿用現有 panel / session / chrome 結構，不引入不必要的新狀態面。

**Non-Goals:**
- 多種假畫面模板
- 工具列上的可見老闆鍵入口
- Stealth / Normal / Focus 模式
- 自動偽裝策略
- 搜尋、跳行、書籤
- 新的資料來源或 editor-tab fallback

## Decisions

### Keep boss mode inside the existing panel instead of switching views
第一版不切新 tab、不切新 editor，也不切整個 VS Code layout。老闆鍵只是在同一個 `Log Peak` panel 內切換資料呈現，這樣最自然、最快，也最不容易破壞目前的閱讀狀態。

### Use a single runtime-log disguise template for the first iteration
第一版假畫面統一採 `Service / Runtime Log` 語言，例如 `INFO`、`TRACE`、`WARN`、request/retry/upstream/worker 類型訊息。這比多模板更容易控管氣質，也更適合底部 Panel。

### Keep disguise metadata generic and avoid leaking the active TXT identity
第一版假畫面的 header 與 row 內容不應直接帶出真實檔名或閱讀來源。即使 boss mode 是在既有閱讀 session 上切換，也應使用泛化的 service/runtime 語言，例如固定的 runtime service label，而不是把目前 TXT 名稱拼進假畫面。

### Trigger boss mode only through commands and keybindings
老闆鍵本質上是快速切換，不適合在面板上放明顯按鈕。第一版只透過 command / 快捷鍵觸發，避免破壞目前 panel 的低調外觀與閱讀空間。

### Restrict the default keybinding to when Log Peak is visible
第一版預設 keybinding 採跨平台對應：Mac 使用 `Cmd + Option + \``，Windows / Linux 使用 `Ctrl + Alt + \``。為避免在其他 editor 或 panel 中誤觸，快捷鍵只在 `Log Peak` 可見時生效。

### Restore the reading session plus reading chrome state
切回閱讀模式時，不只恢復檔案與位置，也要恢復當時的閱讀 chrome 狀態，例如展開/縮合/pinned。這樣回到閱讀時才是同一個使用情境，而不是只把檔案重新打開。

## Risks / Trade-offs

- [假畫面太刻意，反而不像真工作畫面] → 第一版只做單一 runtime-log 模板，先追求 boring 和自然。
- [boss mode 狀態與 reading session 狀態互相覆蓋] → 明確把「閱讀 session」與「目前顯示的是閱讀或假畫面」分成不同概念處理。
- [快捷鍵與 VS Code 內建操作衝突] → 先註冊 command，後續再用保守的 keybinding 條件限制降低衝突。
- [切回後恢復不完整] → 第一版只承諾恢復 TXT、位置、chrome 狀態，不擴大到所有瞬時 UI 細節。

## Open Questions

- runtime-log 假畫面的 header 與 row 視覺是否要和閱讀模式完全共用，或只共用大方向。
