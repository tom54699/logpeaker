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
5. 目前版本已可記住上次檔案與接近原本的閱讀位置，後續版本再逐步加入老闆鍵能力

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
- `Phase 2` 以 `Output / build log` 為主視覺基準，混入少量 `code viewer` 節奏
- `Phase 3` 以閱讀狀態保存為主，先處理工作區內的檔案與位置恢復

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
| 底部 Panel View | 讓閱讀器自然存在於 VS Code 底部區塊 | done |
| Webview 靜態假內容 | 驗證容器與視覺方向 | done |
| 手動開啟 TXT | 讀取本機文字內容 | done |
| 類 code / log 顯示 | 建立偽裝感 | done |
| 記住閱讀位置 | 提升連續閱讀體驗 | done |
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

- 後續是否同時提供 command-based 檔案路徑輸入
- 老闆鍵應在哪個 milestone 才開始設計
- `Log Peak` 的 view title 未來是否開放自訂
- 本地 repo 與 GitHub remote 綁定時機

## 討論決議

- `README.md` 作為 GitHub 對外介紹，不承載內部技術與協作細節
- 內部協作總覽放在 `docs/project/overview.md`
- 功能要有相對硬的測試
- `git push` 前必須先通過相關測試
- 討論方式採階段式、小步前進，一次只收斂一個 phase
- `Phase 0` 視覺方向偏 Output / Log Viewer
- `Phase 0` 內容以 log 為主，可穿插少量 code
- `Phase 0` 已 archive OpenSpec change：`2026-04-24-phase-0-panel-shell`
- `Phase 0` 主 spec 已同步到 `openspec/specs/panel-shell/spec.md`
- `Phase 1` 先只支援 UTF-8 / UTF-8 with BOM
- `Phase 1` 暫時不做檔案大小限制
- `Phase 1` 開檔入口先從 panel 內容內開始驗證
- `Phase 1` 已 archive OpenSpec change：`2026-04-24-phase-1-load-local-txt`
- `Phase 1` 主 spec 已同步到 `openspec/specs/local-txt-loading/spec.md`
- `Phase 1` 改為固定單一 webview shell，後續只以 message 更新狀態
- `Phase 1` 手動驗證已通過，可視為完成
- `Phase 2` 目標是讓已可用的 TXT panel 更像 VS Code 的 output / build log viewer，而不像閱讀器
- `Phase 2` 主視覺基準採 `Output / build log`，次要參考採少量 `code viewer` 節奏
- `Phase 2` 不走 `Terminal`、`Problems`、一般閱讀器語言
- `Phase 2` 預設保留行號，先維持目前強度
- `Phase 2` 保留 header meta 與工程感 toolbar
- `Phase 2` row hover 可以存在，但要非常輕
- `Phase 2` 分隔節奏只作為版面層次，不做章節判斷
- `Phase 2` 前綴標記保留，但改成低頻率、混合型 log/source tag，不再整頁都是 `TXT`
- `Phase 2` 顏色階層走克制路線
- `Phase 2` 只定預設視覺語言，不做開關；但未來應保留設定化空間
- `Phase 2` header 採混合型資訊結構，左側維持 `output :: log-peak.panel`，右側基準為 `utf-8 :: <file-name> :: ready`
- `Phase 2` 前綴標記採每行顯示的混合型 tag，例如 `INFO`、`WARN`、`IO`、`CORE`、`TRACE`
- `Phase 2` toolbar 保留極簡骨架，只保留目前必要元素，作為未來功能承載區
- 後續可考慮讓 toolbar 在非 hover 狀態下更像 log/header 資訊，滑鼠移入後才顯示真實功能控制
- `Phase 2` 已 archive OpenSpec change：`2026-04-24-phase-2-panel-disguise-language`
- `Phase 2` 主 spec 已同步到 `openspec/specs/panel-disguise-language/spec.md`
- `Phase 3` 目標是讓閱讀體驗有延續性，不用每次重新找位置
- `Phase 3` 閱讀進度預設記在 `workspaceState`
- `Phase 3` 第一版記錄欄位為 `fileUri`、`fileName`、`scrollTop`、`topLine`、`fileMtimeMs`
- `Phase 3` 恢復時機採中間型：當 panel 被打開時自動恢復
- `Phase 3` 儲存鏈路已改為綁定實際內容滾動容器，手動驗證可正常回到接近原位置
- `Phase 3` 目前先維持現有保存頻率，後續若有體感或效能問題再另行收斂
- 閱讀模式的固定 header / toolbar 先暫時移除，以保留閱讀空間；後續改以可縮合 chrome 另案處理
- `Phase 3` 已 archive OpenSpec change：`2026-04-24-phase-3-restore-reading-session`
- `Phase 3` 主 spec 已同步到 `openspec/specs/reading-session-restore/spec.md`
- 閱讀模式可縮合 chrome 不算 `Phase 4`，而是 `Phase 3` 後的一個小 change
- 閱讀模式可縮合 chrome 的方向為：初始完整顯示，閱讀後縮成薄 bar，滑鼠移入可展開，點一下可固定展開，再點一次收回
- 閱讀模式可縮合 chrome 已完成第一版實作，並保留 `.shell__rows` 作為實際內容滾動容器，以避免破壞閱讀位置保存
- 可縮合 chrome 若造成滾動卡頓，優先以降低 scroll 時的 DOM 更新頻率處理，而不是回退保存鏈路

## 文件同步紀錄

| 日期 | 變更摘要 | 來源 |
| --- | --- | --- |
| 2026-04-23 | 初始化專案骨架與 agent 協作文件 | Codex |
| 2026-04-23 | 調整 README 定位，新增內部總覽與測試規範 | Codex |
| 2026-04-23 | 補充專案目標、階段方向與討論決議 | Codex |
| 2026-04-23 | 建立 `phase-0-panel-shell` OpenSpec change 與 artifacts | Codex |
| 2026-04-23 | 補充 `Phase 1` 初步決議：UTF-8、panel 內入口、先不限制檔案大小 | Codex |
| 2026-04-23 | 建立 `phase-1-load-local-txt` OpenSpec change 與 artifacts | Codex |
| 2026-04-24 | 完成 `Phase 1` 實作與手動驗證，補記固定 webview shell 的渲染策略 | Codex |
| 2026-04-24 | 將 `phase-1-load-local-txt` sync 到主 spec 並 archive | Codex |
| 2026-04-24 | 將 `phase-0-panel-shell` sync 到主 spec 並 archive | Codex |
| 2026-04-24 | 同步 `Phase 2` 已定視覺方向與待確認問題 | Codex |
| 2026-04-24 | 補記 `Phase 2` 的 header、tag 與 toolbar 基準 | Codex |
| 2026-04-24 | 補記 toolbar 未來可採 hover 前偽裝、hover 後顯示功能的方向 | Codex |
| 2026-04-24 | 建立 `phase-2-panel-disguise-language` OpenSpec change 與 artifacts | Codex |
| 2026-04-24 | 完成 `Phase 2` 實作與手動驗證，sync 到主 spec 並 archive | Codex |
| 2026-04-24 | 同步 `Phase 3` 閱讀狀態保存的初步決議 | Codex |
| 2026-04-24 | 建立 `phase-3-restore-reading-session` OpenSpec change 與 artifacts | Codex |
| 2026-04-24 | 完成 `Phase 3` 實作與手動驗證，sync 到主 spec 並 archive | Codex |
