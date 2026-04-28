## ADDED Requirements

### Requirement: Hover-triggered passive disguise
The system SHALL display a boss mode overlay by default when `logPeak.hoverDisguise` is enabled, and SHALL reveal the true TXT content only while the mouse cursor is inside the webview.

#### Scenario: Overlay shown when mouse is outside the panel
- **WHEN** `logPeak.hoverDisguise` is `true` and a TXT file is loaded
- **THEN** the panel displays the boss mode overlay covering the entire content area including reading chrome
- **THEN** no TXT content is visible

#### Scenario: Overlay hidden when mouse enters the panel
- **WHEN** the mouse cursor enters the webview content area
- **THEN** the boss mode overlay is immediately hidden (no transition)
- **THEN** the TXT content and reading chrome become visible

#### Scenario: Overlay restored when mouse leaves the panel
- **WHEN** the mouse cursor leaves the webview content area
- **THEN** the boss mode overlay is immediately shown (no transition)
- **THEN** TXT content is no longer visible

#### Scenario: Hover disguise disabled
- **WHEN** `logPeak.hoverDisguise` is `false`
- **THEN** the panel always shows TXT content regardless of mouse position
- **THEN** no overlay is rendered

### Requirement: VS Code setting controls hover disguise
The system SHALL expose hover disguise as a native VS Code setting `logPeak.hoverDisguise` (boolean, default `true`), visible in the Settings UI.

#### Scenario: Default setting enables hover disguise
- **WHEN** the user has not changed `logPeak.hoverDisguise`
- **THEN** the setting value is `true` and hover disguise is active for loaded sessions

#### Scenario: Setting change applies without restart
- **WHEN** the user changes `logPeak.hoverDisguise` in the Settings UI
- **THEN** the panel reflects the new value immediately without requiring an extension reload or VS Code restart
