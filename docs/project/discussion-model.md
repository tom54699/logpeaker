# Discussion Model

## 目的

定義這個專案後續的討論方式，避免一次處理過多資訊，並確保每次對話後都有文件可接續。

## 討論原則

1. 一次只討論一個 phase。
2. 每個 phase 先收斂目標，再討論細節。
3. 尚未定稿的功能先記錄到規劃，不直接視為當前需求。
4. 每次討論結束後，都要把決議與未決問題寫回文件。

## 單次討論輸出

每次討論至少要留下：

- 本次討論的 phase
- 已定事項
- 尚未定事項
- 下一次只討論的範圍

## Phase 推進規則

1. 先確定目前 phase 的目標。
2. 再確認本 phase 的 in scope。
3. 明確列出 out of scope。
4. 只在本 phase 定稿後，才進下一個 phase。

## 與 OpenSpec 的關係

1. 討論先在 `docs/` 內收斂，不急著一開始就開 change。
2. 當某個 phase 已足夠明確、準備進入正式實作，再建立 OpenSpec change。
3. OpenSpec 一律使用 repo 內已安裝的真實結構：`openspec/config.yaml`、`openspec/changes/`、`openspec/specs/`。
4. 不再手寫 `.openspec/` 或其他平行 spec 目錄。

## 當前階段總覽

- `Phase 0`: 驗證底部 Panel 容器與視覺方向
- `Phase 1`: 支援手動開啟 TXT 並顯示
- `Phase 2`: 建立更像 IDE 面板的視覺語言
- `Phase 3`: 保存閱讀狀態
- `Phase 4`: 最小老闆鍵
- `Phase 5`: 進階隱蔽互動
