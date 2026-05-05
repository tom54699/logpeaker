## ADDED Requirements

### Requirement: Content width selection in reading chrome
The system SHALL provide a content width dropdown selector in the reading chrome toolbar. Options SHALL be: full width (no limit), 40ch, 50ch, 60ch, 72ch, 80ch.

#### Scenario: User selects a content width
- **WHEN** the user selects a content width option from the dropdown in the toolbar
- **THEN** the text column max-width changes immediately via CSS custom property `--lp-content-width`
- **THEN** the text column is horizontally centred when a max-width is active
- **THEN** scroll position is preserved

#### Scenario: Default content width on first load
- **WHEN** no content width setting has been saved
- **THEN** the content width defaults to full width (no max-width limit)

#### Scenario: Existing session without contentWidth in storage
- **WHEN** a saved display settings record does not contain a contentWidth field
- **THEN** the content width falls back to full width without error

## MODIFIED Requirements

### Requirement: Display settings persistence
The system SHALL persist font size, line height, and content width selections across sessions.

#### Scenario: Settings restored on panel reopen
- **WHEN** the user reopens the Log Peak panel after setting a non-default font size, line height, or content width
- **THEN** the previously selected values are restored
- **THEN** content is rendered with the restored settings immediately (no FOUC)

#### Scenario: Settings apply to both TXT and EPUB
- **WHEN** the user changes font size, line height, or content width
- **THEN** the setting applies regardless of whether a TXT or EPUB file is loaded
