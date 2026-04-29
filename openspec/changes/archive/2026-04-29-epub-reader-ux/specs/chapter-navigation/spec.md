## MODIFIED Requirements

### Requirement: Chapter navigation integrated into reading chrome
The system SHALL render prev/next chapter controls and the TOC label inside the reading chrome panel, not as a separate bar below it.

#### Scenario: Multi-chapter EPUB shows navigation in reading chrome
- **WHEN** a multi-chapter EPUB is loaded
- **THEN** the reading chrome panel contains prev button, stream-offset label, and next button
- **THEN** no separate chapter-nav bar appears between the chrome and content

#### Scenario: Single-chapter file shows no chapter navigation
- **WHEN** a TXT file or single-chapter EPUB is loaded
- **THEN** no prev/next controls or stream-offset label appear anywhere in the UI

#### Scenario: Prev button disabled at first chapter
- **WHEN** the current chapter is the first chapter
- **THEN** the prev button has the `disabled` attribute

#### Scenario: Next button disabled at last chapter
- **WHEN** the current chapter is the last chapter
- **THEN** the next button has the `disabled` attribute
