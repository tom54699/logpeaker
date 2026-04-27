## 1. Boss-mode state and trigger

- [x] 1.1 Add a command-driven boss-mode toggle path for the Log Peak panel without introducing a visible panel button.
- [x] 1.2 Track the minimal additional panel state needed to distinguish reading mode from runtime-log disguise mode.
- [x] 1.3 Add a default cross-platform keybinding for boss mode and restrict it to when `Log Peak` is visible.

## 2. Runtime-log disguise rendering

- [x] 2.1 Render a single `Service / Runtime Log` disguise template inside the existing panel shell.
- [x] 2.2 Keep the disguise rendering compatible with the current panel structure and large-TXT performance improvements.
- [x] 2.3 Keep disguise metadata generic so boss mode does not reveal the active TXT file name.

## 3. Return-path restoration

- [x] 3.1 Restore the prior TXT, reading position, and reading-chrome state when boss mode is toggled off.
- [x] 3.2 Handle the no-file or pre-reading case safely if boss mode is triggered before any TXT session exists.

## 4. Verification

- [x] 4.1 Add or update repeatable tests for boss-mode state transitions and restoration decisions.
- [x] 4.2 Verify manually in Extension Development Host that toggling boss mode switches to runtime-log disguise mode and returns to the prior reading context.
