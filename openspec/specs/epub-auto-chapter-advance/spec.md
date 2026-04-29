# epub-auto-chapter-advance Specification

## Purpose
Define the scroll-driven auto-advance and prepend behavior that enables continuous reading across chapters without manual prev/next interaction.

## Requirements

### Requirement: Auto-advance to next chapter at end of content
The system SHALL automatically append the next chapter when the user scrolls (or wheels) to the bottom of the current content.

#### Scenario: User scrolls to end of a non-final chapter
- **WHEN** the user scrolls such that `scrollTop + clientHeight >= scrollHeight - 8`, or wheels down while already at the bottom
- **AND** there is a next chapter available
- **THEN** the panel appends the next chapter's content below the current content
- **THEN** the scroll position is not reset; the user continues reading from where they are

#### Scenario: No advance at the final chapter
- **WHEN** the user scrolls to the bottom of the last chapter
- **THEN** the panel does not attempt to advance further
- **THEN** no error or unexpected state occurs

#### Scenario: TXT files are not affected
- **WHEN** the loaded file is a `.txt` file (single chapter)
- **THEN** scrolling to the bottom has no chapter-advance effect

### Requirement: Prepend previous chapter at top of content
The system SHALL prepend the previous chapter when the user wheels up while already at the top of the current content.

#### Scenario: User wheels up at the top of a non-first chapter
- **WHEN** the user scrolls up (wheel deltaY < 0) while `scrollTop === 0`
- **AND** there is a previous chapter available
- **THEN** the panel prepends the previous chapter's content above the current content
- **THEN** the scroll position is adjusted so the visible content does not jump

#### Scenario: No prepend at the first chapter
- **WHEN** the user is already at the first chapter and wheels up at the top
- **THEN** no prepend occurs
