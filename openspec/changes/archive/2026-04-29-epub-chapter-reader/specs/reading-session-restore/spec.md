## MODIFIED Requirements

### Requirement: Workspace-scoped reading session persistence
The system SHALL persist the latest reading session for the current workspace, including the current chapter index for multi-chapter files.

#### Scenario: Reading session is stored in the current workspace scope
- **WHEN** the user reads a file in `Log Peak`
- **THEN** the system stores the latest reading session in workspace-scoped extension state
- **THEN** the stored session includes `fileUri`, `fileName`, `scrollTop`, `topLine`, `fileMtimeMs`, and `chapterIndex` (0-based; omitted or 0 for TXT)

### Requirement: Position restoration for reopened sessions
The system SHALL restore the reading position for a valid stored session, including returning to the correct chapter for multi-chapter files.

#### Scenario: Valid stored session restores near the prior reading position
- **WHEN** the stored file is still valid for restoration
- **THEN** the system restores the correct chapter (using `chapterIndex` if present)
- **THEN** the system restores the content view near the prior reading position within that chapter
- **THEN** the restoration uses the stored position fields consistently enough that the user does not need to manually relocate the previous reading point

#### Scenario: Session without chapterIndex restores to first chapter
- **WHEN** the stored session has no `chapterIndex` field (legacy TXT session)
- **THEN** the system treats it as chapter index 0
- **THEN** restoration proceeds normally
