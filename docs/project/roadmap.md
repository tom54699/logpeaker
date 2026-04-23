# Roadmap

## Now

### Phase 0: 容器成立

目標：

- 驗證 extension 是否能自然存在於 VS Code 底部 Panel

範圍：

- 建立 TypeScript VS Code Extension
- 在底部 Panel 註冊 `Log Peak` view
- 用 `WebviewViewProvider` 顯示靜態內容
- 內容風格偏 output/log，夾少量 code
- 跟隨目前 VS Code theme

不包含：

- 開檔
- 記住閱讀位置
- 老闆鍵
- 模式切換

OpenSpec 狀態：

- 已建立 change：`openspec/changes/phase-0-panel-shell/`
- proposal、design、specs、tasks 已建立，可進入 `/opsx:apply`

## Later

### Phase 1: 能讀 TXT

- 手動選取 `.txt`
- 讀取並顯示內容
- 基本捲動
- 等寬字體
- 先只支援 UTF-8 / UTF-8 with BOM
- 開檔入口先放在 panel 內容裡

Phase 1 討論決議：

- 暫時不做檔案大小限制
- 開檔入口可以先做成 panel 內顯示
- 指令帶入檔案路徑是可考慮方向，但先觀察 panel 內入口效果

### Phase 2: 偽裝感成立

- 行號
- 更像 code / log / output 的版面
- 視覺細節微調

### Phase 3: 閱讀狀態保存

- 記住上次檔案
- 記住上次閱讀位置
- 重新開啟後恢復

### Phase 4: 最小老闆鍵

- 單一假畫面模板
- 同一 view 內切換
- 切回恢復原位置

## Future

- 多種老闆鍵模板
- Stealth / Normal / Focus
- hover 淡化細節
- 較大檔案的效能優化
- 更多編碼支援
- 搜尋、跳行、書籤

## Open Questions

- `Phase 0` 的 view title 未來是否開放使用者自訂
- `Phase 1` 是否直接加入行號
- `Phase 1` 是否直接加入閱讀位置保存
- 老闆鍵預設模板是否固定從 log 開始
- `Phase 1` 是否同時提供 command-based 路徑輸入入口
