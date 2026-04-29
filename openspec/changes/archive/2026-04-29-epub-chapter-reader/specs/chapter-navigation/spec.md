## ADDED Requirements

### Requirement: Chapter navigation controls
The system SHALL display prev/next chapter navigation in the reading chrome toolbar when the loaded file has more than one chapter.

#### Scenario: Multi-chapter file shows navigation
- **WHEN** a file with more than one chapter is loaded
- **THEN** the toolbar shows a prev button, a chapter position indicator, and a next button
- **THEN** the indicator shows the current position in disguised form (e.g. `stream-offset: 003/024`)

#### Scenario: Single-chapter file hides navigation
- **WHEN** a TXT file or single-chapter EPUB is loaded
- **THEN** no chapter navigation controls are shown
- **THEN** the toolbar appearance is identical to the current TXT experience

#### Scenario: Navigate to next chapter
- **WHEN** the user clicks the next button
- **THEN** the panel loads the next chapter's content
- **THEN** the scroll position resets to the top
- **THEN** the chapter indicator updates

#### Scenario: Navigate to previous chapter
- **WHEN** the user clicks the prev button
- **THEN** the panel loads the previous chapter's content
- **THEN** the scroll position resets to the top

#### Scenario: Prev disabled on first chapter
- **WHEN** the current chapter is the first chapter
- **THEN** the prev button is visually disabled and non-interactive

#### Scenario: Next disabled on last chapter
- **WHEN** the current chapter is the last chapter
- **THEN** the next button is visually disabled and non-interactive

### Requirement: Chapter state in loaded panel
The system SHALL track the current chapter index as part of the loaded panel state.

#### Scenario: State includes chapter index
- **WHEN** a file is loaded
- **THEN** the loaded state includes `currentChapterIndex` (0-based) and total chapter count
- **THEN** TXT files always have `currentChapterIndex: 0` and total chapter count of 1
