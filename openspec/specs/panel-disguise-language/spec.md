# panel-disguise-language Specification

## Purpose
Define the baseline loaded-state visual language that makes Log Peak resemble a VS Code output/build-log panel rather than a general-purpose reader.
## Requirements
### Requirement: Output/build-log visual baseline
The system SHALL present loaded TXT content with a visual baseline that resembles a VS Code output or build-log panel rather than a general-purpose reader.

#### Scenario: Loaded content follows the intended panel tone
- **WHEN** a TXT file is loaded in the `Log Peak` panel
- **THEN** the panel presents the content with an output/build-log style baseline
- **THEN** the panel MAY include a small amount of code-viewer rhythm
- **THEN** the panel MUST NOT primarily resemble a terminal, problems list, or novel-reading layout

### Requirement: Mixed header metadata structure
The system SHALL use a split header structure for loaded content, with a fixed panel identity on the left and dynamic file state metadata on the right.

#### Scenario: Loaded content header shows fixed and dynamic metadata
- **WHEN** loaded content is shown in the panel
- **THEN** the left side of the header shows a fixed output-style identifier for the panel
- **THEN** the right side shows metadata in the pattern `utf-8 :: <file-name> :: ready`

### Requirement: Partial mixed log/source tags
The system SHALL use low-frequency mixed log/source tags for only part of the loaded rows instead of showing the same label on every row.

#### Scenario: Tags appear on only part of the loaded rows
- **WHEN** loaded text rows are rendered
- **THEN** only part of the rows show a prefix tag
- **THEN** the tag set follows a mixed log/source style such as `INFO`, `WARN`, `IO`, `CORE`, or `TRACE`
- **THEN** the panel does not render the same `TXT` label on every row

### Requirement: Minimal toolbar and restrained row emphasis
The system SHALL keep the loaded-state toolbar minimal and SHALL use only restrained emphasis cues for rows and separators.

#### Scenario: Toolbar and row cues stay subordinate to content
- **WHEN** loaded content is visible
- **THEN** the toolbar appears as a low-key control area rather than the primary focus of the panel
- **THEN** row hover, separators, and color hierarchy remain visually restrained
- **THEN** the toolbar structure remains suitable for future controls without exposing later-phase interactions in this phase
