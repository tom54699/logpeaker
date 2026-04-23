# Project Overview

## 目的

這份文件是專案內部總覽，給人類與 AI agent 快速理解目前協作方式、文件定位與工程規則。

## 文件分工

- `README.md`: 給 GitHub 或外部讀者看的專案介紹
- `docs/project/overview.md`: 給專案內部協作者看的總覽與工作約定
- `docs/project/discussion-model.md`: 討論與決策的進行方式
- `docs/project/roadmap.md`: 階段規劃與未來功能方向
- `docs/business/project-context.md`: 業務邏輯、目標、範圍與名詞定義
- `openspec/config.yaml`: OpenSpec 的全域背景與 artifact 規則
- `openspec/changes/`: 進行中的 change artifacts
- `openspec/specs/`: 穩定後沉澱的正式規格
- `.claude/commands/opsx/`: Claude 的 OpenSpec commands
- `.codex/skills/openspec-*`: Codex 的 OpenSpec skills
- `.gemini/commands/opsx/`: Gemini 的 OpenSpec commands

## 工作原則

1. 先理解業務，再收斂階段範圍，再實作。
2. 實作完成後要同步文件，避免脈絡只留在對話紀錄。
3. 功能需要相對硬的測試，避免只有手測。
4. `git push` 前必須先通過相關測試。
5. 正式變更流程走安裝好的 OpenSpec，不自建平行 spec 結構。

## 目前狀態

- 已建立多 agent 共用的協作骨架
- 已記錄專案目標、階段規劃與討論模式
- 已安裝 OpenSpec，後續正式 change 應寫入 `openspec/`
- 尚待將本地目錄綁定到 GitHub repository
