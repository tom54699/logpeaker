## 1. Reading chrome structure

- [x] 1.1 Reintroduce loaded-state chrome in a form that can collapse instead of staying permanently fixed or permanently removed.
- [x] 1.2 Keep the content scroll container compatible with the current reading-session save/restore behavior.

## 2. Collapse / expand interaction

- [x] 2.1 Implement a minimal collapsed chrome bar/handle for loaded reading mode.
- [x] 2.2 Support the agreed mixed interaction: hover to reveal, click to pin open, click again to collapse.

## 3. Verification

- [x] 3.1 Add or update repeatable tests for any new client-side collapse state logic that becomes non-trivial.
- [x] 3.2 Verify manually in Extension Development Host that the chrome no longer permanently eats reading space and can still be revealed mid-read without breaking position restore.
