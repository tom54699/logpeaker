# epub-toc-navigation Specification

## Purpose
Define the table-of-contents dropdown that allows direct chapter selection in multi-chapter EPUB files.

## Requirements

### Requirement: TOC dropdown for chapter selection
The system SHALL provide a table-of-contents dropdown that lets the user jump to any chapter directly.

#### Scenario: User opens TOC dropdown
- **WHEN** the user clicks the `stream-offset` label in the reading chrome
- **THEN** a scrollable chapter list appears below the label
- **THEN** the current chapter is visually highlighted in the list

#### Scenario: User selects a chapter from TOC
- **WHEN** the user clicks a chapter entry in the TOC dropdown
- **THEN** the panel navigates to that chapter immediately
- **THEN** the dropdown closes
- **THEN** scroll position resets to the top of the selected chapter

#### Scenario: User dismisses TOC without selecting
- **WHEN** the TOC dropdown is open and the user clicks outside it
- **THEN** the dropdown closes without changing the current chapter

#### Scenario: TOC is not shown for single-chapter files
- **WHEN** the loaded file has only one chapter (including all TXT files)
- **THEN** the `stream-offset` label is not interactive and shows no dropdown
