# minimal-boss-mode Specification

## Purpose
TBD - created by archiving change phase-4-minimal-boss-mode. Update Purpose after archive.
## Requirements
### Requirement: In-panel runtime-log disguise mode
The system SHALL let the user toggle the current Log Peak panel between reading mode and a runtime-log disguise mode without switching to another editor tab or panel container.

#### Scenario: Boss mode toggles inside the existing panel
- **WHEN** the user triggers the boss-mode command while a TXT reading session is active
- **THEN** the current `Log Peak` panel switches to a runtime-log disguise view
- **THEN** the system does not open a separate editor tab or change the panel container

### Requirement: Command-driven boss-mode trigger
The system SHALL expose the minimal boss mode through a command-oriented trigger path rather than a visible panel control.

#### Scenario: Boss mode is triggered without a visible toolbar entry
- **WHEN** the user wants to enter or leave boss mode
- **THEN** the system provides a command or keybinding trigger path
- **THEN** the loaded reading UI does not require a visible boss-mode toggle button

#### Scenario: Default keybinding only applies when Log Peak is visible
- **WHEN** the default boss-mode keybinding is used
- **THEN** it uses `Cmd + Option + \`` on macOS and `Ctrl + Alt + \`` on Windows/Linux
- **THEN** it only applies while the `Log Peak` view is visible

### Requirement: Generic disguise metadata
The system SHALL avoid exposing the active TXT identity in the runtime-log disguise metadata.

#### Scenario: Boss mode does not reveal the current TXT file name
- **WHEN** boss mode is shown
- **THEN** the disguise header and runtime-log rows do not directly reveal the current TXT file name
- **THEN** the disguise uses generic runtime/service wording instead

### Requirement: Reading session and chrome state restoration after boss mode
The system SHALL restore the prior reading session when boss mode is turned off.

#### Scenario: Returning from boss mode restores the reading context
- **WHEN** the user exits boss mode
- **THEN** the panel restores the prior TXT file
- **THEN** the panel restores a near-equivalent reading position
- **THEN** the panel restores the prior reading-chrome state

