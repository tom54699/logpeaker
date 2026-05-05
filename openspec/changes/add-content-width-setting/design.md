## Context

LogPeak 的閱讀器在較寬的面板下，文字欄會延伸到全寬，眼睛掃描距離過長。目前 `DisplaySettings` 已支援 `fontSize` / `lineHeight` 兩個可持久化的設定，並有對應的 toolbar dropdown 與 CSS 自訂屬性機制。本次變更沿用同一模式，加入 `contentWidth` 欄位。

## Goals / Non-Goals

**Goals:**
- 在 toolbar 加入一個 content width dropdown（全寬 + 幾個固定 ch 值）
- 使用 `--lp-content-width` CSS 變數套用到 `.shell__rows`（max-width + margin auto）
- 與 fontSize / lineHeight 走完全相同的持久化路徑（`DISPLAY_SETTINGS_KEY`）

**Non-Goals:**
- 不做拖曳調整寬度
- 不做百分比寬度選項
- 不影響 boss mode 或 hover disguise overlay 的寬度

## Decisions

**用 `ch` 單位而非 `px`**
`ch` 隨字型大小縮放，使用者改變 font size 後欄寬感受仍然一致。若用 `px`，換字型大小後每行字數會變動，失去設定意義。

選項：`0`（全寬，無 max-width）、`40`、`50`、`60`、`72`、`80`，儲存為數字（`0` = 不限制）。

**CSS 套在 `.shell__rows` 而非各 `.row`**
`.shell__rows` 是 scroll container，在其上加 `max-width` + `margin: 0 auto` 即可讓整個捲動區置中，不需改動 row 的 HTML 結構。

**message handler 擴充現有 `setDisplaySetting` 路徑**
`key` 允許值擴充為 `"fontSize" | "lineHeight" | "contentWidth"`，`applyDisplaySettings` postMessage 也一併帶出 `contentWidth`。

## Risks / Trade-offs

[`.shell__rows` 加 max-width 後，在極窄面板下 `0`（全寬）與任何 ch 值效果相同，無副作用] → 無需額外處理。

[現有 `DISPLAY_SETTINGS_KEY` 儲存的舊資料沒有 `contentWidth` 欄位] → 讀取時 fallback 到 `DEFAULT_DISPLAY_SETTINGS.contentWidth = 0`（全寬），行為不變，無破壞性。
