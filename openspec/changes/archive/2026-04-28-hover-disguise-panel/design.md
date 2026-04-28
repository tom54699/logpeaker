## Context

LogPeak 目前已有 `hover-disguise-overlay` HTML 結構與 `hoverDisguise.enabled` state，但 CSS 尚未定義（overlay 實際上不可見），且 enabled 狀態儲存在 `globalState` 而非 VS Code configuration。本次設計目標是讓這個已存在的基礎設施真正運作，並把開關整合進 VS Code settings UI。

## Goals / Non-Goals

**Goals:**
- CSS `:hover` 驅動的即時切換（進入顯示 TXT，離開顯示 boss mode overlay）
- `logPeak.hoverDisguise` 成為正式 VS Code setting，可在 Settings UI 操作
- configuration 變更後即時更新 panel，不需重啟
- 移除 `globalState` 對 hoverDisguise 的依賴

**Non-Goals:**
- 任何 fade / transition 動畫
- hover 時保留 reading chrome 互動能力（overlay 蓋住即蓋住）
- 修改既有 boss mode 快捷鍵行為
- touch / keyboard 替代互動

## Decisions

### 1. 純 CSS `:hover` 切換，不用 JS mouseover 事件

`:hover` 由瀏覽器引擎直接處理，切換延遲最低，不需要 JS event binding，也不存在事件 debounce 問題。唯一限制是 hover 偵測邊界是 webview document，非整個 VS Code panel frame——這個限制可接受且有利（更靈敏）。

替代方案：JS `mouseenter / mouseleave` 事件——帶有額外複雜度且延遲更高，否決。

### 2. Overlay 以 `position: absolute; inset: 0` 全覆蓋

`loaded-state` section 加 `position: relative`，overlay 用 `absolute` 撐滿，`z-index` 高於 chrome 與 rows。CSS hover 規則：

```css
.loaded-state--hover-disguise {
  position: relative;
}

.loaded-state--hover-disguise .hover-disguise-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: var(--vscode-editor-background);
  display: flex;
  flex-direction: column;
}

.loaded-state--hover-disguise:hover .hover-disguise-overlay {
  display: none;
}
```

### 3. Setting 改走 `vscode.workspace.getConfiguration`

讀取統一由 `getConfiguration('logPeak').get<boolean>('hoverDisguise', true)` 取得。`package.json` 宣告 setting 後，VS Code 自動在 Settings UI 顯示開關。`extension.ts` 監聽 `onDidChangeConfiguration`，於 scope 符合時呼叫 provider 的 `updateHoverDisguiseSetting()` 方法重新 render。

`globalState` 的 `logPeak.hoverDisguise` key 廢棄，不做 migration（舊值丟棄即可，新 setting 有自己的 default）。

### 4. `toggleHoverDisguise()` command 廢棄

原 command 是 globalState 時代的產物。改由 setting 控制後，command 失去意義。移除 command 宣告與實作，避免兩個控制路徑並存造成混亂。

## Risks / Trade-offs

- **webview `:hover` 偵測邊界**：滑鼠移到 VS Code panel title bar 或面板邊框就會觸發 mouseleave，overlay 立即出現。這是預期行為，但若使用者滑鼠在邊框徘徊會造成快速閃切。→ 目前不處理，若有使用者回饋再加 delay。

- **globalState 舊值丟棄**：若使用者先前已將 hoverDisguise 設為 false 並存在 globalState，升級後 setting 預設為 true 會「意外」開啟。→ 接受，因為這是 feature 的預設意圖，且 setting 改回去很容易。

- **overlay background 顏色**：使用 `var(--vscode-editor-background)` 確保在任何 theme 下都正確覆蓋，不露出底層 TXT。
