# Project Context

## 專案名稱

LogPeak

## 專案目標

開發一個 VS Code Extension，提供低調閱讀 TXT 的能力。

核心定位：

- 閱讀區必須放在 VS Code 底部 Panel
- 整體外觀偏向 code viewer / log viewer / output panel
- 不做成一般小說閱讀器
- 不優先做成 editor tab 或 status bar 工具

專案想解決的問題：

- 使用者希望在 IDE 內低調閱讀 TXT
- 閱讀畫面要自然融入 VS Code 工作環境
- 在必要時可往更高隱蔽性功能演進，但前期先驗證基本方向

## 業務邏輯摘要

核心使用流程：

1. 使用者在 VS Code 底部 Panel 開啟 `Log Peak` view
2. 使用者手動選取本機 `.txt` 檔案
3. 內容以類似程式碼或 log 的樣式顯示
4. 使用者在不突兀的情況下持續閱讀
5. 後續版本再逐步加入閱讀位置保存與老闆鍵能力

關鍵原則：

- 外觀要像 IDE 面板，不像閱讀器
- 每個階段只解決一個主要問題
- 未定功能可先記錄，但不提前實作

## 目前範圍

目前採用超小步推進，先寫文件、後定規格、再實作。

目前已確認：

- 技術方向：TypeScript + VS Code Extension API + Webview View
- 容器位置：底部 Panel
- 第一版資料來源：使用者手動選取本機 `.txt`
- 視覺方向：偏 Output / Log Viewer，不偏 Terminal
- `Phase 1` 先只支援 UTF-8 / UTF-8 with BOM
- `Phase 1` 開檔入口先放在 panel 內容內

目前尚不在第一步定稿內：

- 老闆鍵完整互動
- 多種顯示模式
- hover 淡化細節
- 多種假畫面模板
- 大檔最佳化策略

## 功能清單

目前規劃中的功能：

| 功能 | 目的 | 狀態 |
| --- | --- | --- |
| 底部 Panel View | 讓閱讀器自然存在於 VS Code 底部區塊 | phase-0 |
| Webview 靜態假內容 | 驗證容器與視覺方向 | phase-0 |
| 手動開啟 TXT | 讀取本機文字內容 | planned |
| 類 code / log 顯示 | 建立偽裝感 | planned |
| 記住閱讀位置 | 提升連續閱讀體驗 | planned |
| 老闆鍵 | 快速切換到假工作畫面 | future |
| Stealth / Normal / Focus | 調整隱蔽程度 | future |

## 限制與假設

- 第一版只支援 `.txt`
- 第一版先優先支援底部 Panel，不做 editor tab
- 初期視覺重點是像 Output / Log Viewer，而不是像 Terminal
- 需求討論採小步確認，不一次定完整產品
- 未定稿功能應保留為規劃，不直接混入當前 scope

## 開發品質要求

- 新功能必須搭配可重複執行的測試
- 測試應偏向硬驗證，不以純手動檢查為主要依據
- `git push` 前必須先確認相關測試通過

## 待確認問題

- `Phase 0` 的 view title 是否固定為 `Log Peak`，或先同步規劃可自訂命名
- `Phase 1` 是否就加入行號
- `Phase 1` 是否就加入閱讀位置保存
- `Phase 1` 是否同時提供 command-based 檔案路徑輸入
- 老闆鍵應在哪個 milestone 才開始設計
- 本地 repo 與 GitHub remote 綁定時機

## 討論決議

- `README.md` 作為 GitHub 對外介紹，不承載內部技術與協作細節
- 內部協作總覽放在 `docs/project/overview.md`
- 功能要有相對硬的測試
- `git push` 前必須先通過相關測試
- 討論方式採階段式、小步前進，一次只收斂一個 phase
- `Phase 0` 視覺方向偏 Output / Log Viewer
- `Phase 0` 內容以 log 為主，可穿插少量 code
- `Phase 0` 已建立 OpenSpec change：`phase-0-panel-shell`
- `Phase 1` 先只支援 UTF-8 / UTF-8 with BOM
- `Phase 1` 暫時不做檔案大小限制
- `Phase 1` 開檔入口先從 panel 內容內開始驗證

## 文件同步紀錄

| 日期 | 變更摘要 | 來源 |
| --- | --- | --- |
| 2026-04-23 | 初始化專案骨架與 agent 協作文件 | Codex |
| 2026-04-23 | 調整 README 定位，新增內部總覽與測試規範 | Codex |
| 2026-04-23 | 補充專案目標、階段方向與討論決議 | Codex |
| 2026-04-23 | 建立 `phase-0-panel-shell` OpenSpec change 與 artifacts | Codex |
| 2026-04-23 | 補充 `Phase 1` 初步決議：UTF-8、panel 內入口、先不限制檔案大小 | Codex |
