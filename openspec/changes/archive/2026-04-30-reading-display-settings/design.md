## Context

Reading chrome toolbar 目前有 `source :: label`、open 按鈕、keep open 按鈕，以及 epub 時的 chapter-nav-row。要加入字體大小與行距選擇器，需要在不破壞現有偽裝語言的前提下找到合適位置。

## Goals / Non-Goals

**Goals:**
- 字體大小四段：S(11px) / M(13px) / L(15px) / XL(18px)，預設 M
- 行距三段：緊(1.4) / 標準(1.6) / 鬆(1.9)，預設標準
- 選擇後透過 CSS custom property 即時套用，不重新 render
- 設定存 `workspaceState` key `logPeak.displaySettings`
- TXT / EPUB 共用同一份設定

**Non-Goals:**
- 自由輸入任意數值
- 字型選擇（本次不做）
- VS Code Settings 整合（本次用 in-panel 控制）

## Decisions

### CSS custom property 注入方式

在 `<body>` 上注入 style attribute：
```html
<body style="--lp-font-size: 13px; --lp-line-height: 1.6;">
```

CSS 改用：
```css
body { font-size: var(--lp-font-size, 12px); }
.row { line-height: var(--lp-line-height, 1.55); }
```

選擇 body style attribute 而非動態 `<style>` 標籤：可直接 `document.body.style.setProperty()` 更新，不需要重新解析整個 stylesheet，也不會有 FOUC。

### 狀態管理

Extension Host 新增 `displaySettings: { fontSize: number; lineHeight: number }` 欄位到 `LoadedPanelState`（非 loaded state 不顯示控制）。

webview 送 `{ type: "setDisplaySetting", key: "fontSize" | "lineHeight", value: number }` → Host 更新 state + 存 workspaceState + 透過 postMessage `{ type: "applyDisplaySettings", fontSize, lineHeight }` 回 webview。

webview 收到後直接 `document.body.style.setProperty(...)` — 不走 full render，保留 scroll 位置。

### Toolbar 佈局

reading chrome toolbar 目前：
```
[ source :: label ]  [ Open TXT ][ keep open ]
```

改為（epub 多章時 source label 換成 chapter-nav-row，版型不變）：
```
[ source :: label ]  [ S M L XL ][ 緊─鬆 ][ Open ][ keep open ]
```

兩組選擇器以 segment control 風格呈現（active item 有背景），偽裝成 log viewer 的 density/scale 選項，視覺上與現有 chrome 一致。

### 持久化

`workspaceState.get("logPeak.displaySettings", { fontSize: 13, lineHeight: 1.6 })` — 缺少時 fallback 到預設值，forward compatible。

## Risks / Trade-offs

- **toolbar 擁擠**：加了兩組控制後 toolbar 在窄視窗可能換行。chrome 已有 `flex-wrap` 空間，可接受
- **CSS variable 覆蓋**：body font-size 改用 variable 後，所有繼承的子元素都受影響（包含 chrome 本身）。需確認 chrome 的小字（11px）改用固定值而非繼承
