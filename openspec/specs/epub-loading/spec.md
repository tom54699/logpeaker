# epub-loading Specification

## Purpose
Define the behavior for loading a local `.epub` file, parsing chapters from spine order, extracting plain text from XHTML, and resolving real chapter titles from NCX or EPUB3 nav.

## Requirements

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

#### Scenario: Nav document excluded from spine
- **WHEN** an EPUB3 nav document is listed in the spine
- **THEN** the system excludes it from the chapter list
- **THEN** only content chapters are shown to the user

### Requirement: Parse EPUB chapters with real titles
The system SHALL parse EPUB chapter titles from the NCX or EPUB3 nav document, falling back to `第 N 章` only when neither is present.

#### Scenario: EPUB with NCX file
- **WHEN** the OPF manifest contains an item with `media-type="application/x-dtbncx+xml"`
- **THEN** the system reads `navPoint` labels from that NCX file
- **THEN** each chapter's `title` field is set to the corresponding NCX label

#### Scenario: EPUB with EPUB3 nav document
- **WHEN** the OPF manifest contains an item with `properties="nav"` and no NCX is present
- **THEN** the system reads `<a>` text content from the nav `<ol>` list
- **THEN** each chapter's `title` field is set to the corresponding nav label

#### Scenario: EPUB without NCX or nav
- **WHEN** neither NCX nor nav document is found in the manifest
- **THEN** each chapter's `title` falls back to `第 N 章`
- **THEN** no error is thrown
