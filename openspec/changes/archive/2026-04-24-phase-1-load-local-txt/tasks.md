## 1. File loading flow

- [x] 1.1 Add a panel-empty-state flow with engineer-style copy and an `Open TXT` action.
- [x] 1.2 Implement local `.txt` file picking from the extension host and pass the selected file into the panel flow.

## 2. Content rendering

- [x] 2.1 Decode UTF-8 / UTF-8 with BOM text content and replace the seeded shell view with loaded text content.
- [x] 2.2 Add an error state for failed or unsupported reads without introducing later-phase features.

## 3. Verification

- [x] 3.1 Add or update repeatable tests for file-loading state transitions and supported-format handling where practical for this phase.
- [x] 3.2 Verify manually in Extension Development Host that a local UTF-8 `.txt` file can be opened from the panel and rendered in place of the empty state.
