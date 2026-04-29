## ADDED Requirements

### Requirement: Auto-advance to next chapter at end of content
The system SHALL automatically advance to the next chapter when the user scrolls to the bottom of the current chapter's content.

#### Scenario: User scrolls to end of a non-final chapter
- **WHEN** the user scrolls such that `scrollTop + clientHeight >= scrollHeight - 8`
- **AND** there is a next chapter available
- **THEN** the panel advances to the next chapter
- **THEN** the scroll position resets to the top of the new chapter

#### Scenario: No advance at the final chapter
- **WHEN** the user scrolls to the bottom of the last chapter
- **THEN** the panel does not attempt to advance further
- **THEN** no error or unexpected state occurs

#### Scenario: TXT files are not affected
- **WHEN** the loaded file is a `.txt` file (single chapter)
- **THEN** scrolling to the bottom has no chapter-advance effect
