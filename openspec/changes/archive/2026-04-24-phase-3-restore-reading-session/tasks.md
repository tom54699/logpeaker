## 1. Session persistence

- [x] 1.1 Add a workspace-scoped reading session store for `fileUri`, `fileName`, `scrollTop`, `topLine`, and `fileMtimeMs`.
- [x] 1.2 Update the panel flow so reading progress is saved in a throttled way without regressing current scroll performance.

## 2. Session restoration

- [x] 2.1 Restore the last reading session when the Log Peak panel is opened, without forcing restoration at extension startup.
- [x] 2.2 Handle missing files, changed files, or invalid saved positions with a safe fallback path.

## 3. Verification

- [x] 3.1 Add or update repeatable tests for session serialization, validation, and restoration decisions.
- [x] 3.2 Verify manually in Extension Development Host that closing and reopening the panel restores the last file and a near-equivalent reading position.
