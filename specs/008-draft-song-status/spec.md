# Feature Specification: Draft Song Status

**Feature Branch**: `008-draft-song-status`
**Created**: 2025-11-21
**Status**: Draft
**Input**: User description: "Mark a song as Draft. Use a simple checkbox to grey-out that songcard. This also means that the total duration calculation ignores that song's length contribution."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Song as Draft (Priority: P1) - MVP

Users can mark a song as "Draft" using a simple checkbox on the song card. Draft songs are visually greyed-out to distinguish them from finalized songs, and they are excluded from the total album duration calculation.

**Why this priority**: Core functionality that allows users to track work-in-progress songs while maintaining accurate album metrics. Essential for planning and workflow management.

**Independent Test**: Can be fully tested by clicking a checkbox on any song card, verifying the card appears greyed-out, and confirming the total album duration excludes that song's length.

**Acceptance Scenarios**:

1. **Given** a song card is displayed in the grid, **When** the user clicks the draft checkbox, **Then** the song is marked as draft and the card visual style changes to greyed-out appearance
2. **Given** a song is marked as draft, **When** the user views the summary banner, **Then** the total album duration excludes that song's duration
3. **Given** a song is marked as draft, **When** the user unchecks the draft checkbox, **Then** the song returns to normal appearance and is included in total duration calculation
4. **Given** multiple songs are marked as draft, **When** the user views the album, **Then** all draft songs appear greyed-out and none contribute to total duration
5. **Given** a song is marked as draft, **When** the user refreshes the page, **Then** the draft status persists and the song remains greyed-out

---

### User Story 2 - Draft Status Persistence (Priority: P1) - MVP

Draft status persists across page refreshes and is included in export/import operations, ensuring users never lose track of which songs are in-progress versus finalized.

**Why this priority**: Data integrity is non-negotiable per project constitution. Draft status is critical workflow data that must persist reliably.

**Independent Test**: Can be tested by marking songs as draft, refreshing the page, and verifying draft status is preserved. Can also test by exporting data, clearing localStorage, and importing to verify draft status restores correctly.

**Acceptance Scenarios**:

1. **Given** songs are marked as draft, **When** the user refreshes the page, **Then** the draft status persists for all marked songs
2. **Given** the user exports album data, **When** the exported JSON is opened, **Then** draft status is included in the song objects
3. **Given** the user imports album data with draft songs, **When** the import completes, **Then** draft songs are correctly marked and greyed-out

---

### User Story 3 - Visual Feedback (Priority: P2)

The greyed-out visual style for draft songs is clear and consistent, making it immediately obvious which songs are drafts versus finalized tracks.

**Why this priority**: Important for user experience but can be refined after core functionality works. Initial implementation can use simple opacity reduction.

**Independent Test**: Can be tested by marking a song as draft and verifying the visual distinction is immediately clear.

**Acceptance Scenarios**:

1. **Given** a song is marked as draft, **When** the user views the song card, **Then** the entire card has reduced opacity (50-70%) to appear greyed-out
2. **Given** a draft song card is displayed, **When** the user views the card, **Then** all text, values, and stage progress bars appear with reduced opacity
3. **Given** a draft song is next to a normal song, **When** the user views the grid, **Then** the visual distinction between draft and normal is immediately obvious

---

### Edge Cases

- What happens when all songs are marked as draft?
  - Total album duration shows "0m" (all songs excluded from calculation)
- What happens when a draft song has no duration set?
  - Song still marked as draft, contributes 0m to total (whether draft or not)
- What happens if the user clicks the checkbox repeatedly/rapidly?
  - React state batching ensures smooth toggle behavior, no race conditions
- How does draft status affect inline editing (title, tempo, key, duration)?
  - Draft songs remain fully editable, only visual appearance and duration calculation change
- What happens when a draft song is dragged/reordered?
  - Draft songs can be reordered normally, draft status persists during and after reordering
- What happens to draft status in the SongDetail zoom view?
  - Draft checkbox appears in zoom view with same functionality, status syncs with grid view

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a draft checkbox on each song card in the grid view
- **FR-002**: System MUST toggle draft status when the user clicks the checkbox
- **FR-003**: System MUST apply greyed-out visual styling (reduced opacity) to draft song cards
- **FR-004**: System MUST exclude draft songs from total album duration calculation
- **FR-005**: System MUST persist draft status to localStorage when toggled
- **FR-006**: System MUST load draft status from localStorage on page load
- **FR-007**: System MUST include draft status in JSON export format
- **FR-008**: System MUST restore draft status from JSON import
- **FR-009**: System MUST initialize new songs with draft status set to `false` (default: not draft)
- **FR-010**: System MUST maintain draft status when songs are reordered via drag-and-drop
- **FR-011**: System MUST apply greyed-out styling to all song card elements (title, attributes, stages)
- **FR-012**: System MUST display draft checkbox in SongDetail zoom view with synchronized status

### Key Entities

- **Song**: Existing entity extended with draft status attribute
  - **isDraft**: Boolean flag indicating whether song is in draft status (default: `false`)
  - Stored alongside existing attributes (title, tempo, key, duration, stages)
  - Persisted to localStorage in the same song object
  - Affects visual rendering and duration calculation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can mark/unmark songs as draft with a single click (checkbox toggle)
- **SC-002**: Draft status is visually obvious with greyed-out styling (opacity 50-70%)
- **SC-003**: Total album duration calculation correctly excludes all draft songs in 100% of cases
- **SC-004**: Draft status persists correctly after page refresh in 100% of cases
- **SC-005**: Draft status is included in export/import operations with 100% fidelity
- **SC-006**: Draft songs remain fully functional for editing, reordering, and zoom operations

## Assumptions

- Draft status is a simple boolean flag (not a multi-state workflow like "draft/review/final")
- Greyed-out visual styling uses CSS opacity reduction (simple implementation)
- Draft checkbox appears in a consistent location on all song cards (top-right corner near title)
- Total album duration calculation already exists from feature 006 and can be modified
- Draft status does not affect any other song properties (all other features continue to work)
- Users understand "draft" to mean "work-in-progress" and expect exclusion from final metrics

## Dependencies

- Existing song data model (localStorage schema)
- Existing total album duration calculation (feature 006)
- SongCard component visual structure
- Existing inline editing and drag-and-drop features (must not conflict)

## Out of Scope

- Multi-state workflow beyond simple draft/not-draft (e.g., "review", "final", "archived")
- Automatic draft status based on completion criteria (e.g., missing tempo or key)
- Filtering or sorting songs by draft status
- Bulk operations to mark multiple songs as draft simultaneously
- Draft status history or tracking when songs were marked as draft
- Different visual treatments beyond greyed-out (e.g., strikethrough, borders, icons)
- Draft status affecting export format (all songs exported regardless of draft status)
