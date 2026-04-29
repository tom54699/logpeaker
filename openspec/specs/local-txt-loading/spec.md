# local-txt-loading Specification

## Purpose
Define the baseline behavior for loading a local UTF-8 `.txt` file into the `Log Peak` bottom-panel view with explicit empty, loading, loaded, and error states.
## Requirements
### Requirement: Engineer-style empty state
The system SHALL show an engineer-style empty state in the `Log Peak` panel when no text file is loaded.

#### Scenario: Empty state is shown before a file is opened
- **WHEN** the user opens the `Log Peak` panel without having loaded a file
- **THEN** the panel shows a `No file loaded` state
- **THEN** the panel shows console-like guidance indicating that a local UTF-8 `.txt` source can be loaded

### Requirement: Panel-based local file selection
The system SHALL provide an `Open TXT` entry point inside the panel content so the user can choose a local `.txt` or `.epub` file.

#### Scenario: User opens the file picker from the panel
- **WHEN** the user activates `Open TXT` from the panel
- **THEN** the system opens a local file picker that accepts both `.txt` and `.epub` files

### Requirement: UTF-8 TXT loading
The system SHALL load and render UTF-8 or UTF-8 with BOM `.txt` files in the panel content area.

#### Scenario: UTF-8 text file is loaded successfully
- **WHEN** the user selects a valid UTF-8 `.txt` file
- **THEN** the panel enters a loading state while the file is being prepared
- **THEN** the system reads the file content
- **THEN** the panel replaces the empty state with the loaded text content

### Requirement: Error state for unsupported or failed reads
The system SHALL display an error state when the selected file cannot be decoded as supported text or cannot be read successfully.

#### Scenario: File read fails
- **WHEN** the user selects a file that cannot be read or decoded as UTF-8 / UTF-8 with BOM
- **THEN** the panel shows a readable error state instead of loaded text content
