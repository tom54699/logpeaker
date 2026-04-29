## 1. 真實標題解析（epubFile.ts）

- [x] 1.1 新增 `parseNcxTitles(zip, opfDir, opfText)`: 從 OPF manifest 找 NCX href，讀 `<navPoint>` label，回傳 `Map<number, string>`（index → title）
- [x] 1.2 新增 `parseNavTitles(zip, opfDir, opfText)`: 從 OPF manifest 找 `properties="nav"` href，讀 nav `<ol><li><a>` text，回傳 `Map<number, string>`
- [x] 1.3 在 `parseEpub()` 中整合標題解析：NCX 優先，nav 次之，fallback `第 N 章`
- [x] 1.4 更新 `tests/epub-file.test.mjs`：新增 NCX 標題解析測試、nav 標題解析測試、兩者皆無的 fallback 測試

## 2. 自動換章（webview scroll handler）

- [x] 2.1 在 `bindRowsScroll` 的 scroll handler 中加入 scroll-to-bottom 偵測：`scrollTop + clientHeight >= scrollHeight - 8`
- [x] 2.2 偵測到底部時，若有下一章，postMessage `{ type: "navigateChapter", direction: "next" }`
- [x] 2.3 確認 TXT（single chapter）不觸發此邏輯

## 3. TOC Dropdown（webview render + 事件）

- [x] 3.1 在 `renderPanelBody()` loaded HTML 中，將 `stream-offset` label 改為可點擊元素（data-action="toggle-toc"）
- [x] 3.2 新增 TOC dropdown HTML：`<div class="toc-dropdown">` 含章節清單 `<button data-action="goto-chapter" data-index="N">stream-NNN  標題</button>`
- [x] 3.3 新增 `data-action="toggle-toc"` click handler：toggle `.toc-dropdown[data-open]`
- [x] 3.4 新增 `data-action="goto-chapter"` click handler：postMessage `{ type: "navigateChapter", index: N }`
- [x] 3.5 新增 document click handler 關閉 TOC（點外部時 remove `data-open`）
- [x] 3.6 在 Extension Host 加 `index` 參數支援：`navigateChapter` handler 接受 `index` 直接跳章

## 4. chapter-nav 整合進 reading-chrome

- [x] 4.1 移除 `renderPanelBody()` 中獨立 `<div class="chapter-nav">` 的 render 邏輯
- [x] 4.2 在 reading-chrome `__panel` 內新增 `chapter-nav-row`（含 prev / label / next），僅 `chapters.length > 1` 時渲染
- [x] 4.3 更新 `media/panel.css`：移除 `.chapter-nav` 獨立 bar 樣式，新增 `.toc-dropdown` 與 `.chapter-nav-row` 樣式

## 5. 測試與驗收

- [x] 5.1 確認所有現有測試通過（無 regression）
- [x] 5.2 手動測試：F5 開 Extension Host，開啟多章 EPUB，驗證 TOC dropdown、prev/next、滾到底自動換章
- [x] 5.3 手動測試：開啟 TXT，確認無 chapter-nav、無 scroll-to-bottom advance
