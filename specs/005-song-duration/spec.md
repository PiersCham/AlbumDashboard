# Feature Specification: Song Duration Tracking

**Feature Branch**: `005-song-duration`
**Created**: 2025-11-21
**Status**: Draft
**Input**: User description: "Add a Duration attribute next to the Tempo attribute in each song card. Record Minutes and Seconds"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Mode (Priority: P1) - MVP

Users can view the duration (minutes and seconds) of each song directly on the song card, positioned next to the Tempo attribute. This provides immediate visibility into song length without needing to open external tools or detailed views.

**Why this priority**: Core functionality that delivers immediate value. Users can see at a glance how long each song is, which is essential for planning recording sessions, setlists, and album sequencing. This is the minimum viable product.

**Independent Test**: Can be fully tested by viewing any song card in the grid and verifying the duration is displayed next to Tempo. Delivers value immediately by showing song length.

**Acceptance Scenarios**:

1. **Given** a song card is displayed in the grid, **When** the user views the card, **Then** the duration is visible next to the Tempo field showing format "M:SS" (e.g., "3:45")
2. **Given** a song has no duration set, **When** the user views the card, **Then** the duration displays as "0:00" (default value)
3. **Given** a song has a duration of 2 minutes and 5 seconds, **When** the user views the card, **Then** the duration displays as "2:05" (with leading zero for seconds)

---

### User Story 2 - Edit Duration (Priority: P2)

Users can click on the duration value to edit both minutes and seconds using dedicated input fields, similar to how Tempo and Key are edited. This allows users to track song lengths as they work on compositions.

**Why this priority**: Essential for data entry and maintenance, but can be added after display functionality is working. Users need a way to input duration values.

**Independent Test**: Can be tested by clicking on any duration value, entering new minutes/seconds values, and verifying the changes persist after save.

**Acceptance Scenarios**:

1. **Given** a song card is displayed, **When** the user clicks on the duration label or value, **Then** the duration becomes editable with separate input fields for minutes and seconds
2. **Given** duration edit mode is active, **When** the user enters valid values (minutes: 0-59, seconds: 0-59) and presses Enter or clicks outside, **Then** the duration updates and persists to localStorage
3. **Given** duration edit mode is active, **When** the user presses Escape, **Then** the edit is canceled and the original value is restored
4. **Given** duration edit mode is active, **When** the user enters invalid values (e.g., minutes > 59, seconds > 59, negative numbers), **Then** the values are clamped to valid ranges (0-59 for both fields)

---

### User Story 3 - Duration in Detail View (Priority: P3)

Users can view and edit song duration in the zoomed detail view (SongDetail modal) with the same functionality as the grid view, ensuring consistency across both interfaces.

**Why this priority**: Important for UX consistency but not essential for MVP. Users expect the same editing capabilities in both views, but can initially manage durations from the grid view.

**Independent Test**: Can be tested by opening the Zoom view for any song and verifying duration display and editing work identically to the grid view.

**Acceptance Scenarios**:

1. **Given** a song detail modal is open, **When** the user views the modal, **Then** the duration is displayed next to Tempo with the same format as the grid view
2. **Given** the song detail modal is open, **When** the user clicks on the duration value, **Then** edit mode activates with the same behavior as the grid view
3. **Given** duration is edited in the detail view, **When** the user closes the modal, **Then** the updated duration is reflected in the grid view

---

### Edge Cases

- What happens when a user enters extremely large minute values (e.g., 999 minutes)?
  - System clamps minutes to a maximum of 59 (standard time format constraint)
- What happens when a user enters non-numeric values in duration fields?
  - System validates input and rejects non-numeric characters, or reverts to previous valid value
- How does the system handle duration when importing/exporting song data?
  - Duration is included in JSON export/import with format `{minutes: number, seconds: number}`
- What happens if only one field (minutes or seconds) is edited?
  - The unchanged field retains its current value, only the edited field updates

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display duration in format "M:SS" next to the Tempo attribute on each song card
- **FR-002**: System MUST allow users to edit duration by clicking on the duration label or value
- **FR-003**: System MUST provide separate input fields for minutes and seconds when editing
- **FR-004**: System MUST validate that minutes and seconds are within valid ranges (0-59 for both)
- **FR-005**: System MUST clamp out-of-range values to the nearest valid value (e.g., 75 seconds becomes 59)
- **FR-006**: System MUST persist duration changes to localStorage immediately after successful edit
- **FR-007**: System MUST support canceling edits via Escape key
- **FR-008**: System MUST support saving edits via Enter key or blur event
- **FR-009**: System MUST mirror duration display and editing functionality in SongDetail modal view
- **FR-010**: System MUST include duration in JSON export format with structure `{minutes: number, seconds: number}`
- **FR-011**: System MUST initialize new songs with default duration of 0 minutes, 0 seconds
- **FR-012**: System MUST format seconds with leading zero when less than 10 (e.g., "3:05" not "3:5")

### Key Entities

- **Song**: Existing entity extended with duration attribute
  - **duration**: Object containing `{minutes: number, seconds: number}` where both values are 0-59
  - Stored alongside existing attributes (title, tempo, key, stages)
  - Persisted to localStorage in the same song object

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view song duration on every song card without opening additional views or menus
- **SC-002**: Users can edit song duration in under 10 seconds (click to edit, enter values, save)
- **SC-003**: Duration values persist correctly after page refresh in 100% of cases
- **SC-004**: Duration editing behaves identically in both grid view and detail view (consistency)
- **SC-005**: Invalid duration inputs are handled gracefully with value clamping (no errors or crashes)
- **SC-006**: Exported JSON includes duration data in correct format for all 12 songs

## Assumptions

- Duration represents the total length of the song composition/recording, not individual stages
- Standard song duration format M:SS is sufficient (no need for hours, e.g., songs won't exceed 59:59)
- Minutes and seconds are both constrained to 0-59 range (standard time format)
- Duration editing follows the same UX pattern as Tempo and Key editing (click-to-edit inline)
- Duration defaults to 0:00 for existing songs (backward compatible with current data)
- No automatic duration calculation from stages (manual entry only)

## Dependencies

- Existing song data model (localStorage schema)
- Existing EditableText/inline editing patterns (Tempo and Key editing)
- SongCard and SongDetail components (established in prior features)

## Out of Scope

- Automatic duration calculation based on stage completion or other metrics
- Duration validation against actual audio file length (no audio integration)
- Duration-based sorting or filtering of songs
- Display of total album duration across all songs
- Support for hour-length songs (>59:59)
- Conversion between different time formats (e.g., decimal minutes)
