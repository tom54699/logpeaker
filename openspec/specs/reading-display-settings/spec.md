## ADDED Requirements

### Requirement: Font size selection in reading chrome
The system SHALL provide a font size dropdown selector in the reading chrome toolbar with multiple preset options (10–24px).

#### Scenario: User selects a font size
- **WHEN** the user selects a font size from the dropdown in the toolbar
- **THEN** the content font size changes immediately via CSS custom property
- **THEN** scroll position is preserved

#### Scenario: Default font size on first load
- **WHEN** no display setting has been saved
- **THEN** the font size defaults to 13px

### Requirement: Line height selection in reading chrome
The system SHALL provide a line height dropdown selector in the reading chrome toolbar with multiple preset options (1.2–2.2).

#### Scenario: User selects a line height
- **WHEN** the user selects a line height from the dropdown in the toolbar
- **THEN** the content line height changes immediately via CSS custom property
- **THEN** scroll position is preserved

#### Scenario: Default line height on first load
- **WHEN** no display setting has been saved
- **THEN** the line height defaults to 1.6

### Requirement: Display settings persistence
The system SHALL persist font size and line height selections across sessions.

#### Scenario: Settings restored on panel reopen
- **WHEN** the user reopens the Log Peak panel after setting a non-default font size or line height
- **THEN** the previously selected font size and line height are restored
- **THEN** content is rendered with the restored settings immediately (no FOUC)

#### Scenario: Settings apply to both TXT and EPUB
- **WHEN** the user changes font size or line height
- **THEN** the setting applies regardless of whether a TXT or EPUB file is loaded
