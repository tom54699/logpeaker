## MODIFIED Requirements

### Requirement: Command-driven boss-mode trigger
The system SHALL expose the minimal boss mode through a command-oriented trigger path rather than a visible panel control. The hover disguise setting is controlled separately via `logPeak.hoverDisguise` VS Code setting and does not share a command trigger with boss mode.

#### Scenario: Boss mode is triggered without a visible toolbar entry
- **WHEN** the user wants to enter or leave boss mode
- **THEN** the system provides a command or keybinding trigger path
- **THEN** the loaded reading UI does not require a visible boss-mode toggle button

#### Scenario: Default keybinding only applies when Log Peak is visible
- **WHEN** the default boss-mode keybinding is used
- **THEN** it uses `Cmd + Option + \`` on macOS and `Ctrl + Alt + \`` on Windows/Linux
- **THEN** it only applies while the `Log Peak` view is visible

#### Scenario: Boss mode and hover disguise are independent
- **WHEN** hover disguise is enabled and boss mode is toggled via keybinding
- **THEN** boss mode activates as normal (full boss mode state, not hover-disguise overlay)
- **THEN** disabling boss mode returns to the loaded state with hover disguise still active

## REMOVED Requirements

### Requirement: toggleHoverDisguise command
**Reason**: Replaced by VS Code setting `logPeak.hoverDisguise`; a dedicated command for toggling globalState is no longer necessary and creates a redundant control path.
**Migration**: Use VS Code Settings UI or `settings.json` to set `logPeak.hoverDisguise`.
