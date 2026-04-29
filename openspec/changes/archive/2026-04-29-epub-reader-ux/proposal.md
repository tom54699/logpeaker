## Why

EPUB 章節切換目前只靠 prev/next 按鈕，沒有 TOC 選章、滾到底不自動換章，且章節標題僅為 fallback `第 N 章`，不讀真實 NCX/nav 標題。這三個缺口讓 EPUB 閱讀體驗明顯不完整，需在 epub-chapter-reader 之後儘快補齊。

## What Changes

- **自動換章**：`shell__rows` 滾到底時自動載入下一章（scrollTop + clientHeight >= scrollHeight - 8px）
- **TOC dropdown**：點擊 `stream-offset` label 展開章節清單（可滾動），點選直接跳章，點外部關閉
- **真實標題解析**：`parseEpub()` 讀 NCX (`toc.ncx`) 或 EPUB3 nav (`nav.xhtml`) 取得作者定義標題，fallback 保持 `第 N 章`
- **chapter-nav 合併進 reading-chrome**：移除獨立 `.chapter-nav` bar，prev/label/next 整合進 chrome panel，節省垂直空間
- **TXT 路徑不動**：所有改動限 epub 路徑，TXT 單章行為完全不變

## Capabilities

### New Capabilities

- `epub-toc-navigation`: 章節目錄 dropdown 與 TOC 標題解析
- `epub-auto-chapter-advance`: 滾到底自動換章

### Modified Capabilities

- `epub-loading`: `parseEpub()` 新增 NCX/nav 標題解析，Chapter.title 不再只是 fallback
- `chapter-navigation`: prev/next 從獨立 bar 移入 reading-chrome panel；新增 TOC dropdown 入口

## Impact

- `src/panel/epubFile.ts`：新增 NCX/nav 解析邏輯
- `src/panel/logPeakPanelViewProvider.ts`：scroll-to-bottom handler、TOC dropdown render、chapter-nav 移位
- `media/panel.css`：移除 `.chapter-nav` bar 樣式，新增 TOC dropdown 樣式
- 無新依賴
