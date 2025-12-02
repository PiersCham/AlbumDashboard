# Feature Specification: Add New Song

**Feature Branch**: `012-add-song`
**Created**: 2025-12-02
**Status**: Draft
**Input**: User description: "add a new song"

## Clarifications

### Session 2025-12-02

- Q: When a user has reached the 99-song maximum and attempts to add another song, what should happen? → A: Disable the "Add Song" button (greyed out, not clickable)
- Q: When there are gaps in the song ID sequence (e.g., songs with IDs 1, 2, 4, 5 exist but ID 3 was deleted), how should new song IDs be assigned? → A: Always use the next highest ID (max ID + 1), never reuse gaps
- Q: When adding a song causes localStorage quota to be exceeded, what should happen? → A: Disable "Add Song" proactively based on storage estimation
- Q: When a user is viewing the zoom/detail view of a song and clicks "Add Song", what should happen? → A: Hide the "Add Song" button when in zoom view (only show in grid view)
- Q: Where should the remove/delete button for individual songs be located? → A: Only in the zoom/detail view of each song

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Single Song to Existing Album (Priority: P1)

A user managing their album progress needs to add one more song beyond the current visible songs to accommodate creative changes or new material added to the album during production.

**Why this priority**: This is the core functionality - the ability to add even a single new song is the minimum viable feature that delivers immediate value to users who need to expand their album.

**Independent Test**: Can be fully tested by clicking an "Add Song" button and verifying a new song appears in the grid with default values, and persists after page reload.

**Acceptance Scenarios**:

1. **Given** a user has 12 visible songs in their dashboard, **When** they click an "Add Song" button, **Then** a 13th song appears in the grid with a default title, default stages, and default metadata
2. **Given** a user adds a new song, **When** they reload the page, **Then** the newly added song persists with all its data intact
3. **Given** a user adds a new song, **When** they view the song details, **Then** all fields (title, tempo, key, duration, stages) are editable

---

### User Story 2 - Add Multiple Songs Sequentially (Priority: P2)

A user planning a double album or extended edition wants to add multiple new songs in succession to expand their tracklist.

**Why this priority**: This extends the basic add functionality to support common workflows where users need to add several songs at once, improving efficiency over single additions.

**Independent Test**: Can be tested by clicking the "Add Song" button multiple times and verifying each new song appears with unique identifiers and default values.

**Acceptance Scenarios**:

1. **Given** a user has added one new song, **When** they click "Add Song" again, **Then** another new song appears with a unique ID and default title
2. **Given** a user adds 5 new songs, **When** they check the album track count, **Then** the count automatically reflects the new total (original count + 5)

---

### User Story 3 - Remove Unwanted Songs (Priority: P3)

A user who added too many songs or made a mistake wants to remove specific songs from their album without resetting all their progress.

**Why this priority**: This complements the add functionality by giving users control to correct mistakes, though it's less critical than the ability to add songs initially.

**Independent Test**: Can be tested by adding a song, navigating to its zoom/detail view, clicking the "Remove" button, and verifying it disappears from the grid and doesn't reappear after page reload.

**Acceptance Scenarios**:

1. **Given** a user has added a new song, **When** they open the zoom/detail view and click the remove button, **Then** the song is removed and the user returns to the grid view
2. **Given** a user removes a song, **When** they reload the page, **Then** the removed song does not reappear
3. **Given** a user attempts to remove a song with progress data in zoom view, **When** they click remove, **Then** they receive a confirmation prompt before deletion proceeds

---

### Edge Cases

- When a user has 99 songs, the "Add Song" button becomes disabled (greyed out) to prevent exceeding the maximum
- When there are gaps in song IDs due to deletions, new songs always receive the next highest ID (never reuse gaps)
- When localStorage quota is approaching capacity, the "Add Song" button becomes disabled based on storage estimation to prevent quota errors
- When viewing the zoom/detail view of a song, the "Add Song" button is hidden (only visible in grid view)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a visible control (button) to add a new song to the current album, displayed only in the grid view (hidden in zoom/detail view)
- **FR-002**: System MUST generate a unique song ID for each newly added song by using the maximum existing ID + 1 (never reusing gaps from deleted songs)
- **FR-003**: System MUST initialize new songs with default values: title (e.g., "Song N"), default stages from DEFAULT_STAGE_NAMES, default tempo (120 BPM), no key, zero duration, non-draft status, and no side assignment
- **FR-004**: System MUST automatically increment the visible song count when a new song is added
- **FR-005**: System MUST persist newly added songs to localStorage along with all existing song data
- **FR-005a**: System MUST proactively disable the "Add Song" button when localStorage quota is estimated to be insufficient for adding another song
- **FR-006**: System MUST provide a control to remove individual songs from the album, accessible only in the zoom/detail view of each song (not in grid view)
- **FR-007**: System MUST display a confirmation dialog before deleting a song that has any stage progress greater than 0%
- **FR-008**: System MUST update the album track count display after adding or removing songs
- **FR-009**: System MUST prevent adding songs beyond the maximum limit of 99 songs by disabling the "Add Song" button when the limit is reached
- **FR-010**: Users MUST be able to edit all fields of newly added songs (title, tempo, key, duration, stages, draft status, side) using existing editing interfaces

### Key Entities *(include if feature involves data)*

- **Song**: Represents a track in the album with properties: id (unique number), title (string), stages (array of {name, value} objects), tempo (number 30-300), key (string or null), duration ({minutes, seconds}), isDraft (boolean), side (string: "", "1", or "2")
- **Songs Collection**: The array of all songs in the album, persisted to localStorage under key "albumProgress_v3"

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a new song to their album in under 3 seconds with a single button click
- **SC-002**: Newly added songs persist across browser sessions with 100% data integrity
- **SC-003**: Users can add up to 99 total songs without encountering errors or data loss
- **SC-004**: Song removal reduces the total song count and removes the song from persistence within 1 second
- **SC-005**: Users can successfully add and remove songs while in the grid view without navigating away

## Assumptions

- The existing song editing interface (EditableText, inline editors for tempo/key/duration) will work with newly added songs without modification
- The songCount field will continue to control the visible song limit, and adding songs will automatically adjust this count
- The existing DEFAULT_STAGE_NAMES array provides appropriate default stages for new songs
- Users understand that removing a song is permanent and cannot be undone (except via Import from backup)
- The localStorage implementation has sufficient quota for typical album sizes (up to 99 songs with reasonable data)
- Song IDs are assigned sequentially based on the highest existing ID + 1

## Dependencies

- localStorage API must remain available and functional
- Existing song data structure must remain compatible (id, title, stages, tempo, key, duration, isDraft, side)
- Export/Import functionality should include newly added songs in the JSON export

## Scope

**In Scope:**
- UI control to add new songs
- UI control to remove individual songs
- Song ID generation and conflict prevention
- Default value initialization for new songs
- Persistence of added/removed songs to localStorage
- Confirmation dialog for deleting songs with progress

**Out of Scope:**
- Bulk add/remove operations (e.g., "Add 5 songs at once")
- Undo/redo functionality for song additions or deletions
- Song duplication (copying an existing song's data to create a new one)
- Custom default templates for new songs (e.g., "Add song with these specific stages")
- Song reordering (already exists in the application)
- Maximum song limit configuration (fixed at 99)
