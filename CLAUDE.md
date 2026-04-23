# CLAUDE.md

此檔提供 Claude 類型 agent 進入專案時的最小作業規則。

## 進入專案後先做的事

1. 先閱讀 `docs/project/overview.md`。
2. 先閱讀 `docs/project/discussion-model.md`，理解這個專案的討論方式與推進節奏。
3. 先閱讀 `docs/project/roadmap.md`，確認目前 phase 與未來規劃。
4. 先閱讀 `docs/business/project-context.md`，理解專案目標、業務邏輯、名詞定義與目前狀態。
5. 若要正式建立或執行變更流程，再閱讀 `openspec/config.yaml` 與 `openspec/changes/`、`openspec/specs/`。

## 文件結構與用途

- `README.md`: GitHub 對外介紹
- `docs/project/overview.md`: 專案內部總覽與文件分工
- `docs/project/discussion-model.md`: 討論規則、每次討論要留下的輸出
- `docs/project/roadmap.md`: `Now / Later / Future / Open Questions`
- `docs/business/project-context.md`: 專案目標、產品脈絡、決議與待確認問題
- `openspec/config.yaml`: OpenSpec 專案背景與 artifact 規則
- `openspec/changes/`: OpenSpec 變更提案與實作 artifact
- `openspec/specs/`: 已落地功能的正式 spec
- `.claude/commands/opsx/`: Claude 可直接用的 OpenSpec workflow commands

## 工作規則

1. 在提出實作前，先確認目前 phase 的範圍與已定事項。
2. 若需求已準備進入正式變更流程，應使用已安裝的 OpenSpec workflow，而不是手寫自定 spec 結構。
3. 若需求改變，優先更新文件中的階段規劃與決議，再更新程式。
4. 進入實作前，優先把需求整理成 OpenSpec change。
5. Claude 端若要走 OpenSpec，優先使用 `/opsx:propose`、`/opsx:apply`、`/opsx:archive`、`/opsx:explore`。
6. 每次完成一段工作時，同步檢查 `docs/business/project-context.md` 是否需要更新。
7. 功能實作應附帶相對應且偏硬的測試，不接受只有手動驗證。
8. 在執行 `git push` 前，必須先通過該變更所需的測試。
9. 每次討論若有新決議，應同步更新 `docs/project/roadmap.md` 或 `docs/business/project-context.md`。
10. 這個專案採小步前進，一次只收斂一個 phase，不應跨多個 phase 同時定稿。
11. 若發現文件不足以支撐決策，先提出缺口，再補文件。

## 文件優先順序

1. `docs/project/overview.md`
2. `docs/project/discussion-model.md`
3. `docs/project/roadmap.md`
4. `docs/business/project-context.md`
5. `openspec/config.yaml`
6. `openspec/changes/` 中目前活躍 change 的 artifacts

## 回寫要求

當以下情況發生時，應同步更新業務文件：

- 新增或變更核心功能
- 調整使用者流程
- 更改重要名詞、資料模型或商業規則
- 更新專案範圍、限制或非功能需求
- 更新 phase 決議、優先順序或討論方式
- OpenSpec change 的方向、狀態或驗收條件有明顯改動

## 若資訊不足

優先詢問以下內容：

1. 專案目標是什麼
2. 主要使用者是誰
3. 第一階段要解決的問題是什麼
4. 目前是否已有既定技術棧
