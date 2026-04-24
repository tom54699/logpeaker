# collapsible-reading-chrome Specification

## Purpose
Preserve reading space in loaded TXT mode by allowing the reading chrome to collapse and reappear on demand without breaking reading-session continuity.
## Requirements
### Requirement: Collapsible reading chrome
The system SHALL provide a collapsible chrome for loaded reading mode instead of keeping the full header and toolbar permanently visible.

#### Scenario: Reading mode does not permanently reserve chrome height
- **WHEN** a TXT file is loaded for reading
- **THEN** the panel does not keep the full reading chrome permanently fixed at the top
- **THEN** the loaded reading view preserves more vertical space for text content

### Requirement: Mid-read chrome recall
The system SHALL let the user reveal the reading chrome while already reading, without requiring a scroll back to the top.

#### Scenario: User reveals chrome from the middle of a reading session
- **WHEN** the user is reading away from the top of the content
- **THEN** the chrome can still be revealed from the current position
- **THEN** the user does not need to scroll back to the beginning to access reading controls

### Requirement: Mixed collapse interaction
The system SHALL support a mixed interaction model for the reading chrome in loaded state.

#### Scenario: Hover and click both participate in chrome control
- **WHEN** the chrome is collapsed
- **THEN** hover MAY reveal it transiently
- **THEN** click MAY pin it open
- **THEN** another click MAY collapse it again

### Requirement: Reading-session behavior remains intact
The system SHALL preserve current reading-session save and restore behavior while introducing collapsible chrome.

#### Scenario: Collapse behavior does not break session continuity
- **WHEN** collapsible chrome is enabled in loaded reading mode
- **THEN** the content scroll container still supports reading progress persistence
- **THEN** reopening the panel still restores the last file and a near-equivalent reading position
