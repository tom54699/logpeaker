## Context

LogPeak 目前的 `LoadedPanelState` 以 `content: string` 承載整本書的純文字，不區分章節。TXT 適用，但 EPUB 有內建章節結構，需要導覽能力。Extension Host 執行於 Node.js，可以讀取本機檔案並做解析；Webview 只負責渲染與使用者互動。

## Goals / Non-Goals

**Goals:**
- 支援開啟 `.epub` 檔案，解析章節列表，以純文字顯示
- Reading chrome toolbar 加 prev/next 章節導覽
- TXT 無縫適配（包成單一章節，無 UI 差異）
- Session store 記 `chapterIndex`，恢復時先跳章節再還原 scroll
- 不破壞現有 TXT 閱讀、boss mode、hover disguise 功能

**Non-Goals:**
- EPUB 富文字渲染（保留圖片、CSS、字體）
- 章節目錄（TOC）側邊欄
- EPUB DRM 解除
- 非 UTF-8 編碼的 EPUB（GBK/Big5 留 future）
- 虛擬滾動（大 EPUB 仍用現有分批 render）

## Decisions

### 1. State model：`content: string` → `chapters: Chapter[]` + `currentChapterIndex`

```ts
type Chapter = {
  title: string;   // 章節標題（來自 OPF/NCX，或 fallback "Chapter N"）
  content: string; // 純文字內容
};

type LoadedPanelState = {
  kind: "loaded";
  fileName: string;
  chapters: Chapter[];
  currentChapterIndex: number;
  // ... 其餘不變
};
```

TXT 包成 `chapters[0]`，`currentChapterIndex: 0`。這樣所有下游邏輯（render rows、boss mode snapshot、hover disguise）完全不需感知格式差異。

### 2. EPUB 解析在 Extension Host，用 adm-zip

EPUB = ZIP。Extension Host 是 Node.js，可以直接用 `adm-zip` 讀 ZIP entry。解析流程：

```
1. adm-zip 開 .epub
2. 讀 META-INF/container.xml → 找 rootfile（OPF 路徑）
3. 讀 OPF → 從 <spine> 取 itemref 順序 → 對應 <manifest> 取 href
4. 依序讀每個 XHTML → stripHtml() → Chapter
5. 章節標題：優先從 OPF <metadata> 的 dc:title 或 NCX navPoint label 取，fallback "第 N 章"
```

stripHtml 用 regex（已驗證對中文 EPUB 效果好），不引入額外 DOM 解析依賴。

### 3. 章節導覽 UI 放在 reading-chrome toolbar

```
┌──────────────────────────────────────────┐
│ output :: log-peak.panel   utf-8 :: ready│  ← header（不變）
├──────────────────────────────────────────┤
│ [< prev]  stream-offset: 003/024  [next >]│  ← 新增這一行（只有多章節時顯示）
│ [Open]           [keep open / collapse]  │  ← 現有 toolbar
└──────────────────────────────────────────┘
```

TXT（單一章節）不顯示導覽列，行為與現在完全一致。

### 4. Session store 新增 `chapterIndex`（可選欄位，向後相容）

```ts
type ReadingSession = {
  // ... 現有欄位不變
  chapterIndex?: number; // 0-based，undefined = 舊格式 TXT session
};
```

`parseReadingSession` 沿用舊格式時 `chapterIndex` 為 `undefined`，視為 0。不破壞現有 TXT session。

### 5. host→webview 傳 chapter 內容（非全部 chapters）

切換章節時 postMessage 只傳當前 chapter 的 content，不把整個 chapters 陣列傳給 webview（避免大 EPUB 爆 payload）。Webview 只需知道：`currentContent`、`currentChapterIndex`、`totalChapters`、`chapterTitle`。

## Risks / Trade-offs

- **adm-zip 為 production dependency**：體積約 200KB，可接受。替代方案 `jszip` 類似，`adm-zip` API 更直覺。
- **OPF/NCX 格式差異**：EPUB 2 / EPUB 3 結構略有差異。EPUB 3 的 `nav.xhtml` 比 NCX 更複雜。第一版只解 spine 順序，不解 NCX label，章節標題 fallback "第 N 章"；之後再補。
- **章節超大**：單一章節仍用現有分批 render，無虛擬滾動，極大章節仍可能卡。可接受，與現有 TXT 行為一致。
- **session 切換章節**：換章節時 scrollTop reset 為 0，不保留上一章的位置。只記住「最後閱讀的章節 + 該章節位置」，符合一般閱讀習慣。
