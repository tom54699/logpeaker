## Why

使用者希望能在 LogPeak 內直接閱讀 EPUB 電子書，而不只是 TXT。EPUB 是最普及的開放電子書格式，支援章節結構；目前 TXT 顯示模式沒有章節概念，長篇閱讀體驗不連貫。

## What Changes

- 新增 `adm-zip` 依賴，用於在 Extension Host 解壓 EPUB（ZIP 容器）
- 新增 EPUB 解析邏輯：讀取 `META-INF/container.xml` → OPF → spine 章節順序 → XHTML 轉純文字
- **BREAKING**：`LoadedPanelState.content: string` 改為 `chapters: Chapter[]` + `currentChapterIndex: number`；TXT 包成 `chapters[0]` 保持相容
- 開檔入口新增 `.epub` 副檔名選項（與現有 `.txt` 並存）
- Reading chrome toolbar 加入章節導覽：prev/next 按鈕 + 章節偽裝標籤（`stream-offset: N/M` 風格）
- Session store 新增 `chapterIndex` 欄位，切換章節時記住位置；恢復時先跳到對應章節再恢復 scroll
- 移除 `content: string` 相關的 host→webview payload（改傳 chapter 內容）

## Capabilities

### New Capabilities

- `epub-loading`: 開啟並解析 EPUB 檔案，提取章節列表與純文字內容
- `chapter-navigation`: 多章節閱讀狀態管理與 UI 導覽（prev/next），適用於 EPUB 與 TXT

### Modified Capabilities

- `local-txt-loading`: TXT 開檔流程需適配新的 chapters 結構（TXT → 單一章節）
- `reading-session-restore`: session store 新增 `chapterIndex` 欄位，恢復流程需先切換章節

## Impact

- `package.json`: 新增 `adm-zip` production dependency
- `src/panel/logPeakPanelViewProvider.ts`: state model 重構，新增 EPUB 開檔路徑
- `src/panel/sessionStore.ts`: 新增 `chapterIndex` 欄位
- `src/panel/epubFile.ts`: 新增（EPUB 解析模組）
- `src/panel/textFile.ts`: 不改介面，但 TXT 路徑需包成 chapter 陣列
- `media/panel.css`: 章節導覽 UI 樣式
- `tests/`: epub 解析、章節導覽、session restore with chapterIndex 測試
