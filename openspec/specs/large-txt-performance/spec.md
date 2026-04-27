# large-txt-performance Specification

## Purpose
TBD - created by archiving change large-txt-performance. Update Purpose after archive.
## Requirements
### Requirement: Reduced hot-path scroll cost
The system SHALL avoid performing full visible-row scans on every scroll event while reading a loaded TXT file.

#### Scenario: Scroll path avoids per-event full row scans
- **WHEN** the user scrolls through a loaded TXT file
- **THEN** the panel does not perform a full visible-row scan on every scroll event
- **THEN** reading-progress calculations are deferred or reduced to lower-frequency checkpoints

### Requirement: Improved large-TXT rendering efficiency
The system SHALL reduce unnecessary work in the loaded-state render path for large TXT files.

#### Scenario: Large TXT avoids redundant loaded-state processing
- **WHEN** a large TXT file is loaded
- **THEN** the render path reduces duplicated line-splitting or equivalent redundant work
- **THEN** the host-to-webview payload does not include avoidable large per-line overhead

### Requirement: Reading-session continuity remains intact after optimization
The system SHALL preserve current reading-session save and restore behavior while optimizing large-TXT performance.

#### Scenario: Performance changes do not break reopen restore
- **WHEN** performance optimizations are applied to large TXT handling
- **THEN** reopening the panel still restores the last file and a near-equivalent reading position
- **THEN** the optimization does not regress the current workspace-scoped reading-session behavior

