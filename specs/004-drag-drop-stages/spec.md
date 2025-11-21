# Feature Specification: Drag-and-Drop Stage Reordering

**Feature Branch**: `004-drag-drop-stages`
**Created**: 2025-11-20
**Status**: Draft
**Input**: User description: "Stages within a song can be re-ordered through drag and drop"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reorder Stages via Drag-and-Drop (Priority: P1) 🎯 MVP

Users can click and drag any stage in a song's stage list to a new position, allowing them to reorganize their workflow to match their actual production sequence. The visual feedback during dragging makes it clear where the stage will be placed when dropped.

**Why this priority**: This is the core feature value - enabling users to customize their workflow order. Without this, the feature doesn't exist. It's the minimum viable implementation that delivers immediate value.

**Independent Test**: Open a song card or detail view with multiple stages. Click and hold on any stage bar, drag it to a different position (above or below other stages), release to drop. Verify the stage order updates and persists after page refresh.

**Acceptance Scenarios**:

1. **Given** a song with 3 stages (Demo, Drums, Bass) in that order, **When** user drags "Bass" above "Drums", **Then** the order becomes Demo, Bass, Drums
2. **Given** a song with 5 stages, **When** user drags the first stage to the last position, **Then** all other stages shift up and the dragged stage becomes the last one
3. **Given** user is dragging a stage, **When** the mouse moves over other stages, **Then** visual feedback shows where the stage will be inserted (e.g., a gap or line indicator between stages)
4. **Given** user starts dragging a stage, **When** user releases the mouse while still over the stage list, **Then** the stage is placed at the indicated position and the new order is saved
5. **Given** user drags a stage to a new position and drops it, **When** user refreshes the page, **Then** the new stage order persists

---

### User Story 2 - Cancel Drag Operation (Priority: P2)

Users can cancel a drag operation mid-action if they change their mind, returning the stage to its original position without any changes.

**Why this priority**: This is important for user experience and error recovery, but the feature works without it. Users can always manually drag the stage back, though this adds friction.

**Independent Test**: Start dragging a stage, then press Escape key or drag outside the droppable area. Verify the stage returns to its original position and no changes are saved.

**Acceptance Scenarios**:

1. **Given** user is dragging a stage, **When** user presses the Escape key, **Then** the drag is canceled and the stage returns to its original position
2. **Given** user is dragging a stage, **When** user moves the mouse outside the song card boundaries and releases, **Then** the drag is canceled and no reordering occurs
3. **Given** user cancels a drag operation, **When** user checks the stage order, **Then** it matches the order before the drag started

---

### User Story 3 - Keyboard-Only Reordering (Priority: P3)

Users can reorder stages using only keyboard navigation (Tab to focus a stage, then arrow keys + modifier to move it up/down), providing accessibility for users who cannot use a mouse.

**Why this priority**: This is important for accessibility compliance and inclusive design, but it's not critical for initial launch. Most users will use drag-and-drop with a mouse/touch. Can be added post-MVP.

**Independent Test**: Use Tab key to focus a stage bar, press Ctrl+Up or Ctrl+Down arrow keys to move it. Verify the stage order changes and visual feedback is provided.

**Acceptance Scenarios**:

1. **Given** a stage is keyboard-focused, **When** user presses Ctrl+Up Arrow, **Then** the stage moves one position up in the list
2. **Given** a stage is keyboard-focused, **When** user presses Ctrl+Down Arrow, **Then** the stage moves one position down in the list
3. **Given** a stage is the first in the list, **When** user presses Ctrl+Up Arrow, **Then** nothing happens (or a sound/visual cue indicates the boundary)
4. **Given** a stage is the last in the list, **When** user presses Ctrl+Down Arrow, **Then** nothing happens (or boundary feedback is provided)

---

### Edge Cases

- What happens when user drags a stage very quickly and releases before the UI updates? (Should debounce or ensure state consistency)
- How does the system handle dragging when there's only one stage? (Drag should be disabled or no-op)
- What happens if user starts dragging in one song card and tries to drag into another song card? (Should cancel or limit drag to the originating card)
- How does drag-and-drop work on touch devices (tablets, phones)? (Should support touch events with touch-and-hold to initiate drag)
- What happens when a stage is being edited (e.g., name or progress modal open) and user tries to drag it? (Should either prevent drag or close the modal first)
- How does the system handle very long stage lists (more than can fit on screen)? (Should support scroll-while-dragging or show scrollbars)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to click and hold on any stage bar to initiate a drag operation
- **FR-002**: System MUST provide visual feedback during dragging (e.g., the dragged stage follows the cursor, semi-transparent or highlighted)
- **FR-003**: System MUST show a drop indicator (gap, line, or highlight) between stages to show where the dragged stage will be inserted
- **FR-004**: System MUST reorder the stages list when a stage is dropped in a new position
- **FR-005**: System MUST persist the new stage order immediately after dropping (saved to localStorage or backend)
- **FR-006**: System MUST support drag-and-drop in both SongCard (list view) and SongDetail (modal view) components
- **FR-007**: System MUST prevent dragging a stage outside the boundaries of its parent song card/modal
- **FR-008**: System MUST allow users to cancel a drag operation by pressing Escape key
- **FR-009**: System MUST allow users to cancel a drag operation by dragging outside the droppable area and releasing
- **FR-010**: System MUST support touch-based drag-and-drop on mobile/tablet devices
- **FR-011**: System MUST maintain keyboard focus management (if a stage was focused before drag, it should remain focused after)
- **FR-012**: System MUST not interfere with existing stage editing functionality (clicking the bar to edit name/progress should still work)

### Key Entities

- **Song**: Contains an ordered list of stages. The stage order is a core attribute that must be persisted.
  - Attributes: `id`, `title`, `stages[]` (ordered array), `tempo`, `key`
  - The `stages[]` array order is the visual order in the UI

- **Stage**: A phase of song production with a name and progress value. Stages have an implicit order based on their position in the parent song's stages array.
  - Attributes: `name` (string), `value` (number 0-100)
  - No explicit `order` or `position` field needed - position is determined by array index

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can reorder stages in under 3 seconds (grab, drag, drop)
- **SC-002**: Drag-and-drop works smoothly on both desktop (mouse) and mobile (touch) devices
- **SC-003**: Stage order changes are immediately visible and persist after page refresh
- **SC-004**: Users can complete a full workflow reorganization (reordering all stages in a song) in under 30 seconds
- **SC-005**: Drag operation can be canceled without making unintended changes (via Escape key or drag-out)
- **SC-006**: Visual feedback during dragging is clear enough that users understand where the stage will be placed before releasing (measured by task success rate in usability testing)
