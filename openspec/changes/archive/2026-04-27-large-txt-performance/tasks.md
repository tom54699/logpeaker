## 1. Scroll-path optimization

- [x] 1.1 Remove O(n) visible-row scanning from the hot scroll path and defer `topLine` calculation to lower-frequency save points.
- [x] 1.2 Keep the current reading-session save/restore behavior compatible with the optimized scroll path.

## 2. Render and payload optimization

- [x] 2.1 Reduce duplicated row splitting or equivalent redundant work between host and webview.
- [x] 2.2 Reduce oversized loaded-state payload costs where possible without changing product behavior.
- [x] 2.3 Introduce chunked rendering so large TXT files do not block on a single full loaded-state HTML parse.

## 3. Verification

- [x] 3.1 Add or update repeatable tests for any changed progress-calculation or data-shaping logic.
- [x] 3.2 Verify manually in Extension Development Host that a large TXT scrolls more smoothly while reopen restore still works.
