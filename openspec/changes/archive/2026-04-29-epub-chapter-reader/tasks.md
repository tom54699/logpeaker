## 1. 依賴安裝

- [x] 1.1 安裝 `adm-zip` 與 `@types/adm-zip`（production + dev dependency）
- [x] 1.2 確認 `tsconfig.json` 可以 resolve adm-zip 型別

## 2. EPUB 解析模組（epubFile.ts）

- [x] 2.1 新建 `src/panel/epubFile.ts`，export `Chapter` type 與 `parseEpub(bytes: Uint8Array): Chapter[]`
- [x] 2.2 實作：用 adm-zip 開 bytes → 讀 `META-INF/container.xml` → 找 OPF 路徑
- [x] 2.3 實作：讀 OPF `<spine>` → 依 itemref 順序取 `<manifest>` 的 href 列表
- [x] 2.4 實作：依序讀每個 XHTML entry → `stripHtml()` → 組成 `Chapter[]`
- [x] 2.5 實作 `stripHtml(html: string): string`：strip tags、轉 paragraph 換行、decode HTML entities
- [x] 2.6 實作章節標題 fallback：無 NCX/nav title 時用「第 N 章」

## 3. State Model 重構

- [x] 3.1 在 `logPeakPanelViewProvider.ts` 新增 `Chapter` type（或從 epubFile.ts import）
- [x] 3.2 將 `LoadedPanelState.content: string` 改為 `chapters: Chapter[]` + `currentChapterIndex: number`
- [x] 3.3 更新 `loadFileIntoPanel()` 中 TXT 路徑：將 `content` 包成 `chapters[{ title: fileName, content }]`，`currentChapterIndex: 0`
- [x] 3.4 新增 EPUB 開檔路徑：呼叫 `parseEpub()`，chapters 來自解析結果
- [x] 3.5 更新 `renderPanelBody()` 中 `loaded` state 的 render：改用 `state.chapters[state.currentChapterIndex].content`

## 4. 開檔入口擴展

- [x] 4.1 在 `openTxtFile()` 的 `showOpenDialog` filters 加入 `"EPUB Files": ["epub"]`（與 txt 並列）
- [x] 4.2 依副檔名決定呼叫 TXT 或 EPUB 載入路徑

## 5. Session Store 更新

- [x] 5.1 在 `sessionStore.ts` 的 `ReadingSession` 新增 `chapterIndex?: number`
- [x] 5.2 更新 `createReadingSession()` 處理 `chapterIndex`（clamp to >= 0）
- [x] 5.3 更新 `parseReadingSession()` 讀取 `chapterIndex`（缺少時 fallback 0，向後相容）
- [x] 5.4 更新 `logPeakPanelViewProvider.ts` 的 `saveReadingProgress()` 帶入 `currentChapterIndex`
- [x] 5.5 更新 `restoreReadingSession()` 在切到正確 chapter 後再執行 scroll restore

## 6. 章節導覽 UI

- [x] 6.1 在 `renderPanelBody()` 的 loaded HTML 加入章節導覽列（僅 chapters.length > 1 時顯示）
- [x] 6.2 導覽列內容：prev 按鈕、`stream-offset: NNN/MMM` 偽裝 label、next 按鈕
- [x] 6.3 prev/next 按鈕在第一/最後章時加 `disabled` attribute
- [x] 6.4 在 webview JS 加 `data-action="prev-chapter"` / `data-action="next-chapter"` click handler，postMessage 給 host
- [x] 6.5 在 host 加 `prevChapter` / `nextChapter` message handler：更新 `currentChapterIndex`，save progress，render
- [x] 6.6 在 `media/panel.css` 加章節導覽列樣式（偏 log toolbar 風格，與現有 chrome 一致）

## 7. 測試

- [x] 7.1 新增 `tests/epub-file.test.mjs`：測試 `stripHtml()` 正確處理 tags、換行、entities
- [x] 7.2 新增測試：`parseEpub()` 從 minimal valid EPUB bytes 解出正確章節數與內容
- [x] 7.3 新增測試：`parseReadingSession()` 接受有/無 `chapterIndex` 的 session（向後相容）
- [x] 7.4 新增測試：`createReadingSession()` clamp `chapterIndex` >= 0
- [x] 7.5 確認現有所有測試通過（無 regression）
