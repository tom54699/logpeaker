## Context

epub-chapter-reader 已實作 EPUB 基礎解析與 prev/next 章節切換。章節標題目前全為 fallback `第 N 章`，章節列為獨立 bar，無 TOC 選章入口，滾到底不換章。改動全部限定在 Extension Host 端的 `epubFile.ts` 與 webview 端的 render/事件邏輯，不引入新依賴。

## Goals / Non-Goals

**Goals:**
- `parseEpub()` 從 NCX 或 EPUB3 nav 讀取真實章節標題
- 滾到底自動進入下一章（scroll-to-bottom advance）
- TOC dropdown：點 `stream-offset` label 展開章節清單，點選跳章
- chapter-nav 移入 reading-chrome panel，移除獨立 bar
- TXT 單章行為完全不受影響

**Non-Goals:**
- 書籤、高亮、字體設定等閱讀器功能
- EPUB metadata（作者、封面）顯示
- 搜尋功能

## Decisions

### 標題解析策略：NCX 優先，EPUB3 nav 次之，fallback `第 N 章`

EPUB 2 使用 `toc.ncx`，EPUB3 使用 nav document。解析流程：
1. OPF manifest 找 `media-type="application/x-dtbncx+xml"` → 取 href → 讀 `<navPoint>` label
2. 若無 NCX，找 `properties="nav"` item → 讀 nav `<ol><li><a>` label
3. 兩者都沒有 → 保持 `第 N 章`

標題 map 建完後依 spine 順序對應（不做模糊比對，直接 index 對齊），確保不影響解析速度。

### 自動換章：scroll-to-bottom 偵測

在 `bindRowsScroll` 的 scroll handler 內：
```
if (rows.scrollTop + rows.clientHeight >= rows.scrollHeight - 8) {
  → postMessage({ type: "navigateChapter", direction: "next" })
}
```
條件：只在有下一章時觸發（`currentChapterIndex < chapters.length - 1`）。換章後 scrollTop 歸零。不加 debounce（換章後 scrollHeight 立即變大，不會重複觸發）。

### TOC dropdown：純 webview DOM，不用 VS Code QuickPick

在 webview 內用 `<div class="toc-dropdown">` overlay，position absolute 附著在 chapter-nav 區域下方。原因：QuickPick 會焦點跳出 webview，破壞 hover-disguise 狀態；純 DOM 可控。

點 label toggle `data-open` → CSS 控制顯示/隱藏。點外部用 `document` click 事件冒泡偵測關閉。

### chapter-nav 整合進 reading-chrome panel

原本：`reading-chrome` → 獨立 `chapter-nav bar` → content
新：`reading-chrome panel` 內新增一行 `chapter-nav-row`（僅 epub 多章時渲染），移除獨立 bar。CSS 改動同步更新。

## Risks / Trade-offs

- **NCX/nav 解析失敗** → fallback `第 N 章`，不 throw，與現有行為一致
- **TOC 章節數多（100+）** → dropdown 設 `max-height` + `overflow-y: auto`，純 CSS 可滾動
- **scroll-to-bottom 在小螢幕誤觸** → 閾值 8px 已是業界常見值，可接受；如有問題之後調整
- **TXT 回滾** → chapter-nav-row 只在 `chapters.length > 1` 時渲染，TXT 永遠不顯示，回滾安全
