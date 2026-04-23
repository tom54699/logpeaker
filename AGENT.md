# AGENT.md

此檔提供通用 AI agent 進入專案時的共同協作規則。

## 主要資訊來源

- 專案總覽：`docs/project/overview.md`
- 討論方式：`docs/project/discussion-model.md`
- 階段規劃：`docs/project/roadmap.md`
- 業務邏輯：`docs/business/project-context.md`
- OpenSpec 設定：`openspec/config.yaml`
- OpenSpec 變更：`openspec/changes/`
- OpenSpec 正式規格：`openspec/specs/`

## 文件結構與用途

- `README.md`: 對外專案介紹
- `docs/project/overview.md`: 內部總覽與文件分工
- `docs/project/discussion-model.md`: 討論規則與決策紀錄方式
- `docs/project/roadmap.md`: 分階段規劃與未來方向
- `docs/business/project-context.md`: 專案背景、目標、範圍、決議
- `openspec/config.yaml`: OpenSpec 的專案背景與 artifact 規則
- `openspec/changes/`: change proposal、design、tasks 等進行中內容
- `openspec/specs/`: 已穩定落地的 spec
- `.codex/skills/openspec-*`: Codex 可用的 OpenSpec workflow skills

## 標準工作流程

1. 先讀業務文件，再進行分析或實作。
2. 若需求尚未明確，先在文件中整理 phase、範圍與未決問題。
3. 若需求已準備正式化，使用真正的 OpenSpec 結構，不自創規格目錄。
4. Codex 端若要走 OpenSpec，優先依 `.codex/skills/openspec-propose`、`openspec-apply-change`、`openspec-explore`、`openspec-archive-change` 的流程做。
5. 實作時以目前已定的文件內容與活躍 OpenSpec change 為主，避免只根據對話記憶直接寫程式。
6. 完成後同步更新 `docs/business/project-context.md`，確保後續 agent 可接手。
7. 所有新功能或行為修正都應搭配可重複執行的測試。
8. 在 `git push` 前必須先執行並通過相關測試。
9. 每次討論結束後，應把已定與未定事項寫回文件。
10. 一次只處理一個 phase，不把未來功能混入當前 scope。

## 文件同步清單

完成任務後，至少檢查以下項目是否需要更新：

- roadmap 的 phase 狀態
- discussion model 中的決議方式是否需調整
- 專案目標或範圍
- 角色與使用情境
- 功能流程
- 限制條件
- 待確認事項
- 活躍 OpenSpec change 的 artifact 狀態或內容

## 協作原則

1. 優先維護單一真實來源，避免把業務邏輯散落在多個 agent 設定檔。
2. `CLAUDE.md` 與 `AGENT.md` 只保存工作方式，不保存大量業務細節。
3. 若 roadmap、決議與業務文件不一致，先標記衝突，再要求同步。
4. 若尚未建立自動化測試，應先補測試策略，再擴充功能。
5. OpenSpec 一律使用 repo 內已安裝的真實結構與 CLI 流程。
