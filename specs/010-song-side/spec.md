# Feature Specification: Song Side Assignment

**Feature Branch**: `010-song-side`
**Created**: 2025-11-28
**Status**: Draft
**Input**: User description: "Add a Side: attribute to each song. Options are: "" (default), 1, or 2"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assign Songs to Album Sides (Priority: P1)

Users need to organize their album songs into physical or logical sides (Side 1, Side 2, or unassigned), similar to traditional vinyl records or cassette tapes that have an A-side and B-side.

**Why this priority**: This is the core functionality - allowing users to categorize songs by side. Without this, the feature has no value. It enables users to organize their album in a traditional two-sided format.

**Independent Test**: Can be fully tested by assigning a song to Side 1, verifying it displays "Side 1", changing it to Side 2, verifying the update, and clearing it back to no side. Delivers immediate value by allowing users to organize their album structure.

**Acceptance Scenarios**:

1. **Given** a song with no side assigned (default), **When** user views the song details, **Then** the Side field shows as empty or indicates "No side assigned"
2. **Given** a song with no side assigned, **When** user selects "Side 1", **Then** the song is assigned to Side 1 and displays "Side 1"
3. **Given** a song assigned to Side 1, **When** user changes it to Side 2, **Then** the song is reassigned to Side 2 and displays "Side 2"
4. **Given** a song assigned to either Side 1 or Side 2, **When** user clears the side assignment, **Then** the song returns to the default unassigned state

---

### User Story 2 - Persist Side Assignments (Priority: P2)

Users expect their side assignments to be saved and remain consistent across browser sessions, so they don't lose their album organization work.

**Why this priority**: Without persistence, the feature is unusable in practice. However, it's P2 because the basic assignment interaction (P1) can be developed and tested first, then persistence can be added.

**Independent Test**: Can be tested by assigning songs to different sides, refreshing the browser, and verifying all side assignments are retained. Also test export/import functionality to ensure side data travels with the song data.

**Acceptance Scenarios**:

1. **Given** songs with various side assignments, **When** user refreshes the browser, **Then** all side assignments are preserved
2. **Given** songs with side assignments, **When** user exports the album data, **Then** the exported file includes side information for each song
3. **Given** an exported file with side assignments, **When** user imports the data, **Then** all side assignments are restored correctly

---

### User Story 3 - View Side Information in Grid (Priority: P3)

Users want to quickly see which side each song belongs to when viewing the album grid, without having to open individual song details.

**Why this priority**: This is a quality-of-life improvement that enhances usability but isn't essential for the feature to function. Users can still assign and manage sides through the detail view.

**Independent Test**: Can be tested by assigning songs to different sides, viewing the grid, and verifying side indicators are visible and accurate for each song card.

**Acceptance Scenarios**:

1. **Given** songs assigned to different sides, **When** user views the album grid, **Then** each song card displays its side assignment (Side 1, Side 2, or blank/no indicator)
2. **Given** a song with no side assigned, **When** viewing the grid, **Then** the song card shows no side indicator or shows "No side"

---

### Edge Cases

- What happens when a user rapidly changes side assignments multiple times? (System updates state on each valid change)
- How does the system handle side data when importing old JSON files that don't have the side field? (Default to empty string via migration - FR-011)
- What happens if side data is corrupted or has an invalid value in localStorage (e.g., "3", null, undefined, or non-string values)? (Default to empty string - FR-008)
- What happens when exporting songs with side assignments and then importing into an older version that doesn't support sides? (Side field ignored by older version, no data loss)
- What happens if a song object in imported JSON has the side field but with an invalid value? (Default to empty string - FR-008)
- What happens if user navigates away with invalid input still showing? (Invalid value not saved, previous valid value retained)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a text input field for users to assign each song to one of three states: no side (empty/blank), Side 1 (value "1"), or Side 2 (value "2")
- **FR-002**: System MUST validate text input and only accept empty string, "1", or "2" as valid values
- **FR-003**: System MUST provide visual feedback (red border on input field) when user enters invalid value
- **FR-004**: System MUST prevent saving invalid side values until user corrects input to valid value
- **FR-005**: System MUST persist side assignments in localStorage alongside existing song data
- **FR-006**: System MUST include side information when exporting album data to JSON
- **FR-007**: System MUST restore side assignments when importing JSON data
- **FR-008**: System MUST handle missing or invalid side values from imported data gracefully, defaulting to no side assignment (empty string)
- **FR-009**: System MUST display the current side assignment in the song detail view (zoom view)
- **FR-010**: System MUST display side assignments in the grid view using colored badges next to song title (blue badge "Side 1" for Side 1, purple badge "Side 2" for Side 2, no badge for no side)
- **FR-011**: System MUST allow users to change or clear side assignments at any time
- **FR-012**: System MUST migrate existing songs without side data to the default unassigned state

### Key Entities

- **Song**: Existing entity with new attribute for side assignment
  - `side`: String value representing the side assignment - empty string "" (default/no side), "1" (Side 1), or "2" (Side 2)
  - Relationship: Each song has exactly zero or one side assignment

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can assign any song to Side 1, Side 2, or no side in under 5 seconds from the detail view
- **SC-002**: 100% of side assignments persist across browser sessions and page refreshes
- **SC-003**: Side information is preserved in 100% of export/import operations
- **SC-004**: Existing albums with no side data migrate successfully without data loss or errors
- **SC-005**: Users can view side assignments for all songs within 2 seconds of loading the album grid

## Clarifications

### Session 2025-11-28

- Q: What UI control type should be used for side assignment? → A: Inline text input where user types "1" or "2" or leaves blank
- Q: How should invalid input be handled in the side text field? → A: Show visual feedback (red border) and prevent saving until valid
- Q: How should side assignment be displayed in the grid view? → A: Colored badge next to title (blue for Side 1, purple for Side 2, no badge for unassigned)

## Assumptions

1. **Side values**: We'll use string values ("", "1", "2") rather than numeric to maintain consistency with the user's specification and allow for easy display
2. **UI placement**: Side assignment control will be added to the existing song detail view (zoom view) alongside other song metadata like Key, Tempo, and Duration
3. **UI control**: An inline text input field will be used for side assignment, matching the pattern of Tempo input, where users type "1", "2", or leave blank for no side
4. **Grid display**: Side information will be shown via colored badge next to song title - blue badge for Side 1, purple badge for Side 2, and no badge for unassigned songs
5. **Badge colors**: Blue (`bg-blue-500/20 text-blue-400`) for Side 1, purple (`bg-purple-500/20 text-purple-400`) for Side 2
6. **Migration strategy**: Existing songs will automatically receive the default empty string value for the side field
7. **Default state**: New songs will default to no side assignment (empty string)
8. **Draft interaction**: Draft songs can be assigned to sides - draft status and side assignment are independent attributes

## Out of Scope

- Automatic side assignment based on song order
- Restrictions on number of songs per side
- Side-based filtering or grouping in the grid view
- Side-based progress tracking or statistics
- Visual reordering by dragging songs between sides
