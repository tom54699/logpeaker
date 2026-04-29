## MODIFIED Requirements

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
