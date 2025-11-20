# Feature Specification: Song Tempo and Key Attributes

**Feature Branch**: `002-song-tempo-key`
**Created**: 2025-11-19
**Status**: Draft
**Input**: User description: "Add optional attributes for Tempo and Key to each song. The Tempo can be any value between 30 Beats per minute and 300 beats per minute, defaulting to 120 bpm. Key is A-G major or minor. The default key is blank"

## Clarifications

### Session 2025-11-19

- Q: Musical key notation system - Which sharps/flats to include and how to order them? → A: Mix sharps and flats by common usage (F#/Gb Major commonly written as F# Major; Ab Major preferred over G# Major) based on key signature conventions, listed in chromatic order, excluding enharmonic duplicates and impossible accidentals (E#, B#, Fb, Cb)
- Q: Decimal tempo handling - How should the system handle decimal BPM values (e.g., 135.5)? → A: Round to nearest integer (135.5 → 136, 135.4 → 135) - accepts decimal input, stores as integer
- Q: UI input method for tempo - What type of input control for tempo entry? → A: Plain text input field - accepts any text, validated on blur/submit
- Q: UI input method for key selection - What type of input control for choosing from 24 keys? → A: Two-step selection: first choose note (C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B), then choose mode (Major/Minor)
- Q: Out-of-range tempo error handling - How to handle tempo values outside 30-300 BPM (e.g., "500" or "10")? → A: Clamp to nearest boundary (500 → 300, 10 → 30) with visual feedback (brief highlight/border flash)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set and View Song Tempo (Priority: P1)

As a musician tracking album progress, I want to set and view the tempo (BPM) for each song, so that I can maintain consistent tempo references across my project and plan recording sessions accordingly.

**Why this priority**: Tempo is a fundamental musical attribute that musicians need to reference during recording, practice, and production. Having tempo visible in the dashboard eliminates the need to check separate notes or DAW projects.

**Independent Test**: Can be fully tested by setting a tempo value for a song (e.g., "145 BPM"), refreshing the page, and verifying the tempo displays correctly and persists.

**Acceptance Scenarios**:

1. **Given** a song card without a tempo set, **When** I set the tempo to "140", **Then** the song displays "140 BPM"
2. **Given** a song with tempo "140 BPM", **When** I refresh the browser, **Then** the tempo persists and displays "140 BPM"
3. **Given** a new song is created, **When** no tempo is specified, **Then** the song displays "120 BPM" (default)
4. **Given** a song card, **When** I set tempo to a value outside the valid range (e.g., "500"), **Then** the system clamps to the nearest boundary (300 BPM) and provides visual feedback via brief highlight

---

### User Story 2 - Set and View Song Key (Priority: P2)

As a musician tracking album progress, I want to set and view the musical key for each song, so that I can organize songs by key, identify key changes, and plan harmonic relationships between tracks.

**Why this priority**: Musical key is important for album organization and harmonic planning, but less critical than tempo for day-to-day recording work. It's primarily useful for composition and arrangement planning.

**Independent Test**: Can be fully tested by setting a key (e.g., "G Major") for a song, refreshing the page, and verifying the key displays and persists.

**Acceptance Scenarios**:

1. **Given** a song card without a key set, **When** I set the key to "A Major", **Then** the song displays "A Major"
2. **Given** a song with key "C Minor", **When** I refresh the browser, **Then** the key persists and displays "C Minor"
3. **Given** a new song is created, **When** no key is specified, **Then** the song displays no key (blank/empty state)
4. **Given** a song card, **When** I select a key using the two-step interface (note selection, then mode selection), **Then** the combined key is displayed (e.g., "F# Major")

---

### User Story 3 - Export/Import Tempo and Key Data (Priority: P3)

As a musician who backs up my progress data, I want tempo and key information included in exported JSON files, so that I can restore complete song metadata when importing backups or transferring between devices.

**Why this priority**: Data integrity for backups is important, but this is a natural extension of existing export/import functionality. Users expect new fields to be automatically included in exports.

**Independent Test**: Can be fully tested by setting tempo/key for songs, exporting to JSON, clearing data, importing the JSON file, and verifying tempo/key are restored.

**Acceptance Scenarios**:

1. **Given** songs with tempo and key set, **When** I export the data, **Then** the JSON file contains tempo and key fields for each song
2. **Given** an exported JSON with tempo/key data, **When** I import the file, **Then** tempo and key are restored for all songs
3. **Given** an old JSON export without tempo/key fields, **When** I import the file, **Then** songs use default values (120 BPM, blank key) without errors

---

### Edge Cases

- Boundary values (30 BPM or 300 BPM) are valid and accepted without clamping
- Out-of-range values are clamped: values < 30 → 30 BPM, values > 300 → 300 BPM, with visual feedback
- Decimal tempo values (e.g., "135.5 BPM") are automatically rounded to nearest integer (136 BPM)
- What happens if a user manually edits the JSON export file with invalid key values (e.g., "H Major")?
- How does the UI handle very long custom key labels if user somehow bypasses validation?
- What happens when importing JSON with `tempo: null` or `key: undefined`?
- How does the system handle tempo/key for songs created before this feature was implemented?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to set tempo for any song with values between 30 and 300 BPM inclusive
- **FR-002**: System MUST default new songs to 120 BPM tempo
- **FR-003**: System MUST validate tempo input on blur/submit and clamp values outside the 30-300 BPM range to the nearest boundary (values < 30 → 30, values > 300 → 300), providing visual feedback through brief highlight or border flash
- **FR-004**: System MUST allow users to set musical key using a two-step selection interface: first selecting the note (12 chromatic options), then selecting the mode (Major or Minor)
- **FR-005**: System MUST support the following 24 musical keys based on common key signature conventions: **Major keys** (C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B), **Minor keys** (C, C#, D, Eb, E, F, F#, G, G#, A, Bb, B), presented in chromatic order with sharps/flats chosen by standard notation practice
- **FR-006**: System MUST default new songs to blank/empty key (no key selected)
- **FR-007**: System MUST persist tempo and key data to storage (same mechanism as other song data)
- **FR-008**: System MUST include tempo and key in JSON export files
- **FR-009**: System MUST restore tempo and key from imported JSON files
- **FR-010**: System MUST handle legacy data (songs without tempo/key) by applying default values gracefully
- **FR-011**: System MUST display tempo and key information clearly on each song card
- **FR-012**: System MUST allow users to clear/reset key to blank state
- **FR-013**: System MUST reject invalid key values (enharmonic duplicates, impossible accidentals) during import validation

### Assumptions

- **ASM-001**: Tempo is stored as an integer value (30-300) representing beats per minute
- **ASM-002**: Key is stored as a string (e.g., "A Major", "C# Minor") or null/empty for blank
- **ASM-003**: Users understand standard musical notation for keys (UI displays keys in familiar notation)
- **ASM-004**: Tempo and key are per-song attributes (not album-wide settings)
- **ASM-005**: Decimal tempo values are accepted as input and automatically rounded to the nearest integer (e.g., 135.5 → 136 BPM, 135.4 → 135 BPM)
- **ASM-006**: Key selection follows practical music notation conventions, avoiding enharmonic duplicates (e.g., F# not Gb for F# Major, but Db not C# for Db Major) and excluding impossible accidentals (E#, B#, Fb, Cb)

### Key Entities

- **Song Tempo**: Numeric attribute representing beats per minute for a song
  - Valid range: 30-300 BPM
  - Default value: 120 BPM
  - Stored as integer (decimal input automatically rounded to nearest whole number)
  - Displayed with "BPM" suffix on UI
  - Must persist across sessions

- **Song Key**: String attribute representing musical key/tonality
  - Valid values: 24 keys total (12 Major + 12 Minor) using mixed sharp/flat notation by convention:
    - **Major**: C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B
    - **Minor**: C, C#, D, Eb, E, F, F#, G, G#, A, Bb, B
  - Presented in chromatic order (C → C#/Db → D → D#/Eb → ... → B)
  - Default value: blank/empty (no key selected)
  - Displayed as "{Note} {Mode}" format (e.g., "G Major", "F# Minor")
  - Must persist across sessions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set and view tempo for any song within 5 seconds of interaction
- **SC-002**: 100% of tempo values are validated and constrained to 30-300 BPM range
- **SC-003**: Tempo and key persist across all browser sessions without data loss
- **SC-004**: 100% of export/import cycles preserve tempo and key with no data corruption
- **SC-005**: Legacy songs (created before this feature) load successfully with default tempo (120 BPM) and blank key
- **SC-006**: All 24 valid keys are selectable without duplicates or impossible options

### User Experience Goals

- Clear visual display: users can quickly scan tempo/key across all songs at a glance
- Efficient input: setting tempo requires typing; setting key requires two selections (note + mode)
- Intuitive defaults: 120 BPM is industry-standard default, blank key is sensible for unspecified
- No workflow disruption: existing song management workflows remain unchanged
- Familiar notation: keys displayed using conventional sharp/flat notation musicians expect
- Two-step key selection: separating note from mode reduces cognitive load compared to scanning 24 combined options
