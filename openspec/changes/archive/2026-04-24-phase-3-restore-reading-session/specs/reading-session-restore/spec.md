## ADDED Requirements

### Requirement: Workspace-scoped reading session persistence
The system SHALL persist the latest reading session for the current workspace instead of storing it as a global user preference.

#### Scenario: Reading session is stored in the current workspace scope
- **WHEN** the user reads a TXT file in `Log Peak`
- **THEN** the system stores the latest reading session in workspace-scoped extension state
- **THEN** the stored session includes `fileUri`, `fileName`, `scrollTop`, `topLine`, and `fileMtimeMs`

### Requirement: Restore on panel open
The system SHALL attempt to restore the last reading session when the `Log Peak` panel is opened.

#### Scenario: Panel open triggers a restore attempt
- **WHEN** the user opens the `Log Peak` panel after a prior reading session was stored
- **THEN** the system attempts to restore the last file and reading position
- **THEN** the system does not proactively reopen the file before the panel is shown

### Requirement: Safe recovery from changed or invalid files
The system SHALL fail safely when the stored reading session can no longer be restored exactly.

#### Scenario: Stored file metadata no longer matches
- **WHEN** the stored file no longer exists, cannot be read, or has changed in a way that invalidates exact restoration
- **THEN** the system avoids restoring an invalid exact position
- **THEN** the panel falls back to a safe state or a degraded restoration path instead of crashing

### Requirement: Position restoration for reopened sessions
The system SHALL restore the reading position for a valid stored session closely enough to preserve continuity.

#### Scenario: Valid stored session restores near the prior reading position
- **WHEN** the stored file is still valid for restoration
- **THEN** the system restores the content view near the prior reading position
- **THEN** the restoration uses the stored position fields consistently enough that the user does not need to manually relocate the previous reading point
