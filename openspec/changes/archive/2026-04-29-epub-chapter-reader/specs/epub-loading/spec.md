## ADDED Requirements

### Requirement: Open EPUB file
The system SHALL allow the user to open a local `.epub` file from the panel, parse it into an ordered list of chapters, and display the first chapter's content.

#### Scenario: User opens an EPUB file
- **WHEN** the user selects a `.epub` file via the open file dialog
- **THEN** the system parses the EPUB and extracts chapters in spine order
- **THEN** the panel displays the first chapter's content in the existing log-viewer style
- **THEN** the file name is shown in the header meta

#### Scenario: EPUB with multiple chapters
- **WHEN** an EPUB with N chapters is loaded
- **THEN** all N chapters are available for navigation
- **THEN** chapter content is plain text (HTML tags stripped)

#### Scenario: EPUB parse failure
- **WHEN** the selected file is not a valid EPUB or cannot be parsed
- **THEN** the panel shows an error state with a descriptive message
- **THEN** no partial content is shown

### Requirement: EPUB chapter extraction
The system SHALL extract chapter content from EPUB XHTML files by stripping HTML markup, preserving paragraph breaks as newlines.

#### Scenario: HTML tags stripped from chapter content
- **WHEN** an EPUB chapter XHTML is processed
- **THEN** all HTML tags are removed from the output
- **THEN** `<p>` and `<br>` boundaries are converted to newlines
- **THEN** HTML entities (`&amp;`, `&lt;`, `&gt;`, `&nbsp;`, numeric refs) are decoded

#### Scenario: Chapter title fallback
- **WHEN** a chapter has no title in the OPF or NCX
- **THEN** the system assigns a fallback title of "第 N 章" (1-based index)
