# Roadmap

## Now

## Completed

### Phase 0: 容器成立

- 底部 Panel 容器已驗證
- `Log Peak` view 已能自然出現在 panel 區
- 已 archive：`openspec/changes/archive/2026-04-24-phase-0-panel-shell/`
- 已 sync 至主 spec：`openspec/specs/panel-shell/spec.md`

### Phase 1: 能讀 TXT

- 手動選取 `.txt`
- 讀取並顯示內容
- 基本捲動
- 等寬字體
- 只支援 UTF-8 / UTF-8 with BOM
- 開檔入口放在 panel 內容裡
- 維持固定 webview shell，狀態用 message 更新
- 已完成手動驗證

Phase 1 討論決議：

- 暫時不做檔案大小限制
- 開檔入口可以先做成 panel 內顯示
- 指令帶入檔案路徑是可考慮方向，但先觀察 panel 內入口效果
- 輕量列索引與 `TXT` 標記可先保留為視覺語言的一部分

OpenSpec 狀態：

- 已 archive：`openspec/changes/archive/2026-04-24-phase-1-load-local-txt/`
- 已 sync 至主 spec：`openspec/specs/local-txt-loading/spec.md`

### Phase 2: 偽裝感成立

- Loaded state 更像 output / build log viewer
- header 採混合型資訊結構
- tag 改為混合型 log/source 語言
- toolbar 收斂為極簡骨架
- 大 TXT 滾動體感已做一輪性能修正

Phase 2 討論決議：

- 目標是讓已可用的 TXT panel 更像 VS Code 的 output / build log viewer，而不像閱讀器
- 主視覺基準採 `Output / build log`
- 次要參考採少量 `code viewer` 節奏
- 明確不走 `Terminal`、`Problems`、一般閱讀器語言
- 預設保留行號，先維持目前強度
- 保留 header meta 與工程感 toolbar
- row hover 可以存在，但要非常輕
- 分隔節奏只作為版面層次，不做章節判斷
- 顏色階層走克制路線，不追求花色
- 本階段只定預設視覺語言，不做開關；但未來應保留設定化空間
- header 採混合型資訊結構，左側偏 output panel，右側顯示 `utf-8 :: <file-name> :: ready`
- 前綴標記採每行顯示的混合型 tag，例如 `INFO`、`WARN`、`IO`、`CORE`、`TRACE`
- toolbar 保留極簡骨架，只保留目前必要元素，作為未來功能承載區
- 未來可考慮讓 toolbar 在非 hover 狀態下更像 log/header 資訊，hover 後再顯示真實功能控制

OpenSpec 狀態：

- 已 archive：`openspec/changes/archive/2026-04-24-phase-2-panel-disguise-language/`
- 已 sync 至主 spec：`openspec/specs/panel-disguise-language/spec.md`

### Phase 3: 閱讀狀態保存

- 記住上次檔案
- 記住上次閱讀位置
- 在打開 panel 時自動恢復
- 儲存鏈路已修正為綁定實際內容滾動容器

Phase 3 討論決議：

- 目標是讓閱讀體驗有延續性，不用每次重新找位置
- 閱讀進度預設記在 `workspaceState`
- 第一版記錄欄位為 `fileUri`、`fileName`、`scrollTop`、`topLine`、`fileMtimeMs`
- 恢復時機採中間型：不在 extension 啟動時主動搶畫面，但當 panel 被打開時自動恢復
- 目前保存頻率先維持現況：滾動停下後節流保存，隱藏/unload 時再補存
- 為保留閱讀空間，loaded 狀態的固定 header / toolbar 先暫時移除；後續改以可縮合 chrome 另案處理

OpenSpec 狀態：

- 已 archive：`openspec/changes/archive/2026-04-24-phase-3-restore-reading-session/`
- 已 sync 至主 spec：`openspec/specs/reading-session-restore/spec.md`

### Small Change: 閱讀模式可縮合 chrome

- 不算 `Phase 4`
- 作為 `Phase 3` 後的 UI refinement
- 目標是讓閱讀模式在保留必要 chrome 的前提下，不長期吃掉閱讀空間
- 已完成 hover 展開、點擊固定展開/收回、與薄 bar 縮合

討論決議：

- 初始顯示完整 chrome
- 開始閱讀後可縮成薄 bar
- 滑鼠移入可展開
- 點一下可固定展開，再點一次可收回
- 保持 `.shell__rows` 為實際內容滾動容器，避免破壞 Phase 3 的保存與恢復
- 若縮合互動導致滾動卡頓，優先降低 scroll 時的 DOM 更新頻率

OpenSpec 狀態：

- 已 archive：`openspec/changes/archive/2026-04-24-collapsible-reading-chrome/`
- 已 sync 至主 spec：`openspec/specs/collapsible-reading-chrome/spec.md`

### Small Change: 大檔 TXT 性能優化

- 目標是改善大 TXT 的載入與滾動卡頓
- 已完成第一輪低風險優化，不先直接重構成虛擬滾動
- 初始載入與大檔 reopen restore 體感均已改善

完成內容：

- `topLine` 已移出 scroll hot path
- host→webview 的逐行 decoration payload 已移除
- 已加入分批 render，降低大 TXT 初始凍結感
- 已補上資料整形與進度計算測試
- 已手動驗證大 TXT 載入更快且 reopen restore 可用

OpenSpec 狀態：

- 已 archive：`openspec/changes/archive/2026-04-27-large-txt-performance/`
- 已 sync 至主 spec：`openspec/specs/large-txt-performance/spec.md`

### Phase 4: 最小老闆鍵

- 單一假畫面模板
- 同一 view 內切換
- 切回恢復原位置
- 已完成 command / 快捷鍵觸發與閱讀狀態回復

Phase 4 討論決議：

- 第一版假畫面基準採 `Service / Runtime Log`
- 第一版只用 `command / 快捷鍵` 觸發，不在畫面上放明顯切換入口
- 第一版預設快捷鍵採跨平台對應：`Cmd/Ctrl + Alt + \``
- 快捷鍵僅在 `Log Peak` 可見時生效，避免在其他 editor 或 panel 誤觸
- 切回時採中等恢復：恢復原本 TXT、閱讀位置、以及閱讀 chrome 狀態
- boss mode 假畫面不得直接暴露真實 TXT 檔名

OpenSpec 狀態：

- 已 archive：`openspec/changes/archive/2026-04-27-phase-4-minimal-boss-mode/`
- 已 sync 至主 spec：`openspec/specs/minimal-boss-mode/spec.md`

## Later

## Future

- 多種老闆鍵模板
- Stealth / Normal / Focus
- hover 淡化細節
- toolbar 非 hover 偽裝、hover 後顯示真實功能
- 更多編碼支援
- 搜尋、跳行、書籤

## Open Questions

- 後續是否提供 command-based 檔案路徑輸入入口
- `Log Peak` 的 view title 未來是否開放使用者自訂
