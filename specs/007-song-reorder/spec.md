# Feature Specification: Song Card Reordering

**Feature Branch**: `007-song-reorder`
**Created**: 2025-11-21
**Status**: Draft
**Input**: User description: "The user can drag the song cards in the main view to re-order them."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drag and Drop Song Cards (Priority: P1)

As a user, I want to drag song cards in the main view to reorder them, so I can organize my album tracks in my preferred sequence without using external tools or manual data entry.

**Why this priority**: This is the core functionality of the feature and delivers immediate value by allowing users to visually organize their album track list. It's the most intuitive way to reorder songs and provides instant visual feedback.

**Independent Test**: Can be fully tested by dragging a song card from one position to another and verifying the song list updates to reflect the new order. The reordered list should persist across page refreshes.

**Acceptance Scenarios**:

1. **Given** I am viewing the main song list, **When** I click and hold on a song card and drag it to a new position, **Then** the song card follows my cursor and other cards shift to make space
2. **Given** I am dragging a song card, **When** I release the mouse button at the new position, **Then** the song is inserted at that position and the order is updated
3. **Given** I have reordered songs, **When** I refresh the page, **Then** the songs remain in the new order I set
4. **Given** I start dragging a song card, **When** I move the cursor outside the drop area or press Escape, **Then** the drag operation is cancelled and the song returns to its original position

---

### User Story 2 - Visual Feedback During Drag (Priority: P2)

As a user, I want clear visual indicators while dragging a song card, so I can see exactly where the card will be placed and understand which area is the valid drop zone.

**Why this priority**: Enhances user experience by providing confidence during the drag operation, but the basic drag functionality (P1) can work without sophisticated visual effects.

**Independent Test**: Can be tested by initiating a drag operation and verifying visual indicators appear (e.g., placeholder, highlighted drop zone, cursor changes).

**Acceptance Scenarios**:

1. **Given** I am dragging a song card, **When** I hover over a valid drop position, **Then** a visual placeholder or insertion indicator appears at that position
2. **Given** I am dragging a song card, **When** I move it over the song list area, **Then** the dragged card has a distinct visual style (e.g., opacity change, elevation)
3. **Given** I am dragging a song card, **When** I move the cursor over different positions, **Then** other song cards smoothly shift to show where the dragged card will be inserted

---

### User Story 3 - Keyboard and Touch Accessibility (Priority: P3)

As a user using keyboard navigation or a touch device, I want alternative methods to reorder song cards, so I can organize my album regardless of my input method.

**Why this priority**: Improves accessibility and mobile usability, but is secondary to the core mouse-based drag-and-drop functionality.

**Independent Test**: Can be tested by attempting to reorder songs using only keyboard (arrow keys + Enter/Space) or on a touch device with drag gestures.

**Acceptance Scenarios**:

1. **Given** I am using keyboard navigation, **When** I focus on a song card and press designated keys (e.g., Ctrl+Up/Down), **Then** the song moves up or down in the list
2. **Given** I am on a touch device, **When** I long-press and drag a song card, **Then** the card follows my finger and can be reordered
3. **Given** I am using keyboard navigation, **When** I select a song and press a move command, **Then** visual feedback indicates the song's new position before confirming the change

---

### Edge Cases

- What happens when dragging a song card to the exact same position it started from? (Should be a no-op, no persistence update)
- How does the system handle rapid consecutive drag operations? (Should queue or debounce updates)
- What happens if the user starts dragging multiple cards simultaneously? (Prevent multi-drag, only allow one active drag at a time)
- How does the system behave when drag operations are interrupted (e.g., user switches browser tabs mid-drag)? (Should cancel drag and restore original order)
- What happens when there is only one song in the list? (Drag should be disabled or have no effect)
- How does reordering interact with other features like filtering or sorting? (Reordering should be disabled or clarified when songs are filtered/sorted)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to drag song cards within the main view song list
- **FR-002**: System MUST update the song order when a card is dropped at a new position
- **FR-003**: System MUST persist the reordered song list to storage immediately after a successful drop
- **FR-004**: System MUST prevent dragging operations that would move a song outside the valid song list bounds
- **FR-005**: System MUST provide visual feedback during drag operations (dragged card styling, drop zone indicators)
- **FR-006**: System MUST cancel drag operations if the user presses Escape key or drags outside valid bounds
- **FR-007**: System MUST maintain song card data integrity during reorder (all song properties remain unchanged except position)
- **FR-008**: System MUST allow only one song card to be dragged at a time
- **FR-009**: System MUST restore the original song order if a drag operation is cancelled
- **FR-010**: System MUST load and display songs in their previously saved order on page load

### Key Entities

- **Song Card**: Represents an individual song in the album with position/order information. Key attributes include unique identifier, current position/index in list, and all existing song properties (title, duration, tempo, key, stages).
- **Song List**: The ordered collection of all song cards. Maintains the sequence and ensures unique positions for each song.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully reorder any song to any position in the list using drag and drop
- **SC-002**: Drag operations complete with visual feedback (dragged card follows cursor, other cards shift to indicate insertion point)
- **SC-003**: Reordered song lists persist across browser sessions (after page refresh, songs remain in new order)
- **SC-004**: Cancelled drag operations (Escape key or drag outside bounds) restore the original song order without side effects
- **SC-005**: Drag operations do not lose or corrupt song data (all song properties remain intact after reorder)
- **SC-006**: The system handles edge cases gracefully (single song list, same-position drops, rapid consecutive drags)

## Assumptions

- The feature applies only to the main view song list (not the detail view or other views)
- Drag-and-drop will primarily use mouse/pointer events (keyboard and touch support is lower priority)
- The reorder operation does not affect song IDs, only the display order/sequence
- Reordering is always enabled (no filtering or sorting that would conflict with manual ordering)
- The song list is displayed vertically (cards stack top-to-bottom), and dragging moves cards up or down
- Performance target: Drag operations should feel responsive (<100ms visual feedback delay)
- The implementation will follow existing codebase patterns for inline editing and localStorage persistence

## Dependencies

- Existing song card component structure in App.jsx
- localStorage persistence mechanism (already implemented for song data)
- Current song array data structure supports reordering (index-based or explicit order property)

## Out of Scope

- Reordering songs in detail view or other non-main views
- Bulk selection and reordering of multiple songs simultaneously
- Animated transitions between positions (basic immediate repositioning is sufficient for MVP)
- Undo/redo functionality for reorder operations (can be added in future iteration)
- Reordering songs across different albums (feature assumes single album context)
