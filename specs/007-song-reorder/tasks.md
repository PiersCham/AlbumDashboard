# Tasks: Song Card Reordering

**Feature**: 007-song-reorder
**Branch**: `007-song-reorder`
**Date**: 2025-11-21
**Status**: Not Started

---

## Task Overview

**Total Tasks**: 8
**Phases**: 5
**Parallel Opportunities**: 2 (foundational state can be added in parallel with code review)

**Prioritization**: Tasks organized by user story priority (P1 → P2 → P3) to enable MVP-first development.

---

## Phase 1: Setup and Discovery

**Goal**: Understand existing codebase patterns before making changes

### Task 1.1: Review Existing SongCard Component Structure

**Description**: Study the SongCard component to understand current event handlers and prop patterns.

**Location**: `src/App.jsx` (SongCard component definition)

**What to Review**:
- SongCard component props (song, onUpdate, onRemove, index)
- Existing event handlers (onClick for inline editing: title, tempo, key, duration)
- Current card wrapper div structure and className patterns
- Existing state patterns (isEditingTitle, isEditingTempo, etc.)
- How index prop is currently passed and used

**Acceptance Criteria**:
- [X] Identified SongCard wrapper div location and current className
- [X] Documented existing onClick handlers and their interaction patterns
- [X] Confirmed index prop is already passed to SongCard
- [X] Located where SongCard components are rendered in main view

**Dependencies**: None
**Parallel Safe**: Yes (can run concurrently with Task 1.2)

---

### Task 1.2: Review Existing Stage Reordering Implementation

**Description**: Examine feature 004 (stage drag-and-drop) to understand existing drag patterns in the codebase.

**Location**: `src/App.jsx` (StageRow component)

**What to Review**:
- StageRow drag handlers (onDragStart, onDragOver, onDrop, onDragEnd)
- Drag state management (draggedStageIndex, dropTargetStageIndex)
- Visual feedback CSS classes during drag
- Array reordering logic in handleStageDrop

**Acceptance Criteria**:
- [X] Identified existing drag state pattern (useState for draggedIndex)
- [X] Documented visual feedback classes (opacity, border styles)
- [X] Understood array reordering algorithm (splice-based)
- [X] Confirmed this pattern can be adapted for SongCard reordering

**Dependencies**: None
**Parallel Safe**: Yes (can run concurrently with Task 1.1)

---

## Phase 2: Foundational Implementation

**Goal**: Add drag state and helper functions before user story implementation

### Task 2.1: Add Drag State Variables to App Component

**Description**: Add state variables to track active drag operations for song cards.

**Location**: `src/App.jsx` (App component, after existing useState declarations)

**Implementation**:
```javascript
// Drag state for song reordering
const [draggedIndex, setDraggedIndex] = useState(null);
const [dropTargetIndex, setDropTargetIndex] = useState(null);
```

**Acceptance Criteria**:
- [X] draggedIndex state added (tracks which song is being dragged)
- [X] dropTargetIndex state added (tracks hover position for visual feedback)
- [X] States initialized to null
- [X] States declared near other App component state variables

**Dependencies**: Task 1.1 (understand existing state patterns)
**Parallel Safe**: No (sequential after Task 1.1)

**Reference**: `specs/007-song-reorder/contracts/component-api.md:20-24`

---

## Phase 3: User Story 1 - Drag and Drop Song Cards (P1 - MVP)

**Goal**: Implement core drag-and-drop functionality with persistence

**User Story**: As a user, I want to drag song cards in the main view to reorder them, so I can organize my album tracks in my preferred sequence without using external tools or manual data entry.

**Independent Test**: Can be fully tested by dragging a song card from one position to another and verifying the song list updates to reflect the new order. The reordered list should persist across page refreshes.

---

### Task 3.1: [US1] Implement Drag Event Handlers in App Component

**Description**: Add event handler functions for drag operations (start, over, drop, end).

**Location**: `src/App.jsx` (App component, after existing handlers like handleUpdate, handleRemove)

**Implementation**:
```javascript
// Drag handlers for song reordering
const handleDragStart = (event, index) => {
  setDraggedIndex(index);
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());
};

const handleDragOver = (event, index) => {
  event.preventDefault(); // Required to enable drop
  setDropTargetIndex(index);
};

const handleDrop = (event, targetIndex) => {
  event.preventDefault();

  // Validation checks
  if (draggedIndex === null) return; // Invalid state
  if (draggedIndex === targetIndex) return; // No-op (same position)

  // Immutable array reordering
  const newSongs = [...songs];
  const [draggedSong] = newSongs.splice(draggedIndex, 1);
  newSongs.splice(targetIndex, 0, draggedSong);

  // Update state (triggers localStorage persistence via useEffect)
  setSongs(newSongs);

  // Reset drag state
  setDraggedIndex(null);
  setDropTargetIndex(null);
};

const handleDragEnd = () => {
  setDraggedIndex(null);
  setDropTargetIndex(null);
};
```

**Acceptance Criteria**:
- [X] handleDragStart sets draggedIndex and configures dataTransfer
- [X] handleDragOver prevents default and updates dropTargetIndex
- [X] handleDrop validates, reorders songs array, and resets state
- [X] handleDragEnd cleanup resets drag state to null
- [X] All handlers follow existing codebase naming conventions

**Dependencies**: Task 2.1 (drag state variables exist)
**Parallel Safe**: No (sequential after Task 2.1)

**Reference**: `specs/007-song-reorder/contracts/component-api.md:28-154`

---

### Task 3.2: [US1] Add Escape Key Handler for Drag Cancellation

**Description**: Implement global keyboard handler to cancel drag operations with Escape key.

**Location**: `src/App.jsx` (App component, as useEffect)

**Implementation**:
```javascript
// Escape key handler to cancel drag
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && draggedIndex !== null) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [draggedIndex]);
```

**Acceptance Criteria**:
- [X] useEffect adds keydown listener to window
- [X] Escape key check only triggers if drag is active (draggedIndex !== null)
- [X] Cleanup function removes event listener on unmount
- [X] Dependency array includes draggedIndex

**Dependencies**: Task 3.1 (drag handlers exist)
**Parallel Safe**: Yes (different section of code, can be added in parallel with Task 3.3)

**Reference**: `specs/007-song-reorder/contracts/component-api.md:155-178`

---

### Task 3.3: [P] [US1] Wire Drag Handlers to SongCard Component

**Description**: Pass drag handlers as props to SongCard and add drag event attributes to card wrapper.

**Location**: `src/App.jsx` (SongCard component definition and render)

**Implementation**:

**1. Update SongCard props** (where SongCard is rendered in main view):
```javascript
<SongCard
  // ... existing props (song, onUpdate, onRemove, index)
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  onDragEnd={handleDragEnd}
  isDragging={draggedIndex === index}
  isDropTarget={dropTargetIndex === index}
/>
```

**2. Update SongCard component signature**:
```javascript
function SongCard({ song, onUpdate, onRemove, index, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDropTarget }) {
  // ... existing component code
}
```

**3. Update SongCard wrapper div**:
```javascript
<div
  className={`
    ... existing classes ...
    ${isDragging ? 'opacity-50' : ''}
    ${isDropTarget ? 'border-t-2 border-amber-500' : ''}
  `}
  draggable={true}
  onDragStart={(e) => onDragStart(e, index)}
  onDragOver={(e) => onDragOver(e, index)}
  onDrop={(e) => onDrop(e, index)}
  onDragEnd={onDragEnd}
>
  {/* Existing SongCard content */}
</div>
```

**Acceptance Criteria**:
- [X] Drag handler props passed to SongCard when rendering
- [X] isDragging and isDropTarget computed props passed
- [X] SongCard function signature updated to accept new props
- [X] draggable={true} attribute added to wrapper div
- [X] All four drag event handlers wired (onDragStart, onDragOver, onDrop, onDragEnd)
- [X] Visual feedback CSS classes applied conditionally (opacity-50, border-t-2 border-amber-500)

**Dependencies**: Task 3.1 (handlers exist), Task 3.2 (Escape handler optional)
**Parallel Safe**: Yes (independent of Task 3.2, both modify different parts of component)

**Reference**: `specs/007-song-reorder/contracts/component-api.md:180-220`

---

### Task 3.4: [US1] Manual Test - Basic Drag and Drop

**Description**: Verify basic drag-and-drop functionality works end-to-end.

**Test Guide**: `specs/007-song-reorder/quickstart.md:17-46`

**Test Scenarios**:
1. Drag Song 1 to position 3, verify order updates
2. Refresh page, verify order persists
3. Drag song to same position, verify no-op
4. Press Escape during drag, verify cancellation

**Acceptance Criteria**:
- [ ] Song cards can be dragged with mouse
- [ ] Visual feedback appears (dragged card opacity, drop target border)
- [ ] Song order updates correctly after drop
- [ ] Reordered list persists across page refresh
- [ ] Escape key cancels drag and restores original order

**Dependencies**: Task 3.3 (drag wired to UI)
**Parallel Safe**: No (must verify after Task 3.3)

**Reference**: `specs/007-song-reorder/quickstart.md:17-127`

---

## Phase 4: User Story 2 - Visual Feedback During Drag (P2)

**Goal**: Enhance drag experience with polished visual indicators

**User Story**: As a user, I want clear visual indicators while dragging a song card, so I can see exactly where the card will be placed and understand which area is the valid drop zone.

**Independent Test**: Can be tested by initiating a drag operation and verifying visual indicators appear (e.g., placeholder, highlighted drop zone, cursor changes).

**Note**: Visual feedback is already implemented in Task 3.3 (opacity and border classes). This phase verifies and refines the implementation.

---

### Task 4.1: [US2] Manual Test - Visual Feedback Refinement

**Description**: Verify visual feedback is clear and consistent during all drag operations.

**Test Guide**: `specs/007-song-reorder/quickstart.md:48-100`

**Test Scenarios**:
1. Start drag, verify dragged card becomes semi-transparent (50% opacity)
2. Hover over different cards, verify amber border moves smoothly
3. Complete drag, verify visual feedback disappears immediately
4. Test rapid drags, verify no visual artifacts remain

**Acceptance Criteria**:
- [ ] Dragged card shows 50% opacity consistently
- [ ] Amber border (2px, border-t-2 border-amber-500) appears above hover target
- [ ] Only one border visible at a time (previous border clears when moving to new target)
- [ ] Visual feedback clears completely after drop or cancel
- [ ] No visual glitches during rapid consecutive drags

**Dependencies**: Task 3.4 (basic drag works)
**Parallel Safe**: No (requires completed Task 3.4)

**Reference**: `specs/007-song-reorder/quickstart.md:48-100`

---

## Phase 5: User Story 3 - Keyboard and Touch Accessibility (P3)

**Goal**: Add alternative input methods for reordering (keyboard, touch)

**User Story**: As a user using keyboard navigation or a touch device, I want alternative methods to reorder song cards, so I can organize my album regardless of my input method.

**Independent Test**: Can be tested by attempting to reorder songs using only keyboard (arrow keys + Enter/Space) or on a touch device with drag gestures.

**Status**: DEFERRED - Per research.md Decisions 7 and 8, keyboard and touch support are deprioritized to maintain Simplicity First principle. HTML5 Drag and Drop has limited touch support, and keyboard reordering requires custom implementation. These can be added in future iterations if user feedback indicates strong need.

---

## Phase 6: Edge Cases and Final Testing

**Goal**: Comprehensive edge case testing and performance validation

---

### Task 6.1: Manual Test - Edge Cases and Performance

**Description**: Verify edge cases handle gracefully and performance targets are met.

**Test Guide**: `specs/007-song-reorder/quickstart.md:102-336`

**Test Scenarios**:

**Edge Cases**:
1. First card to last position (verify Song 1 → end works)
2. Last card to first position (verify Song 12 → start works)
3. Adjacent card swap (verify Song 1 ↔ Song 2)
4. Drag outside song list bounds (verify cancellation)
5. Browser tab loss of focus mid-drag (verify cleanup)
6. Rapid consecutive drags (verify no state corruption)

**Performance**:
7. Visual feedback latency (<100ms from drag start to opacity change)
8. Smooth 60fps drag movement (no stuttering or lag)
9. Drop operation completes quickly (<100ms from drop to order update)

**Persistence**:
10. Export/import preserves song order (verify JSON array order matches)

**Acceptance Criteria**:
- [ ] All edge cases handle gracefully (no crashes, state corruption, or visual glitches)
- [ ] First-to-last and last-to-first drags work correctly
- [ ] Adjacent swaps work (Song N ↔ Song N+1)
- [ ] Drag outside bounds cancels operation
- [ ] Tab loss of focus cleans up drag state
- [ ] Rapid drags don't cause state corruption
- [ ] Visual feedback appears within 100ms (feels instant)
- [ ] Drag movement is smooth at 60fps (no visible lag)
- [ ] Drop completes within 100ms
- [ ] Export/import preserves reordered song list

**Dependencies**: Task 4.1 (visual feedback verified)
**Parallel Safe**: No (final comprehensive test)

**Reference**: `specs/007-song-reorder/quickstart.md:102-336`

---

## Task Dependencies

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1 - MVP) → Phase 4 (US2) → [US3 DEFERRED] → Phase 6 (Final Tests)
     ↓                  ↓                        ↓                   ↓                              ↓
  T1.1-T1.2          T2.1                   T3.1-T3.4            T4.1                           T6.1
  (Parallel)      (State Vars)        (MVP Drag & Drop)  (Visual Polish)                  (Edge Cases)
```

### Task Execution Flow

**Sequential Dependencies**:
- Phase 2 must complete before Phase 3 (state variables needed for handlers)
- Phase 3 tasks are sequential: T3.1 → T3.2/T3.3 (parallel) → T3.4
- Phase 4 must complete after Phase 3 (builds on basic drag)
- Phase 6 runs after Phase 4 (final validation)

**Parallel Opportunities**:
1. T1.1 and T1.2 can run in parallel (independent code reviews)
2. T3.2 and T3.3 can run in parallel (Escape handler and SongCard wiring are independent)

---

## Parallel Execution Examples

### Per User Story

**User Story 1 (P1 - MVP)**:
- T1.1, T1.2 can run in parallel initially
- T2.1 must complete first
- T3.1 must complete next
- T3.2 and T3.3 can run in parallel (different code sections)
- T3.4 waits for both T3.2 and T3.3

**User Story 2 (P2)**:
- T4.1 is test-only, runs after US1 complete
- No implementation tasks (visual feedback already in T3.3)

**User Story 3 (P3)**:
- DEFERRED - No tasks in this release
- Future implementation would add keyboard/touch handlers

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

**Phase 1-3 Only** (Tasks T1.1-T3.4):
- Setup and foundational work
- User Story 1: Basic drag-and-drop with persistence
- Delivers core value: users can reorder songs visually

**MVP Deliverables**:
- Drag state variables (draggedIndex, dropTargetIndex)
- Four drag event handlers (handleDragStart, handleDragOver, handleDrop, handleDragEnd)
- Escape key cancellation handler
- SongCard component wired with drag attributes and visual feedback
- Basic manual testing

**MVP Test Criteria**:
- Songs can be dragged and dropped to reorder
- Visual feedback appears during drag
- Reordered list persists across page refresh
- Escape key cancels drag operation

### Full Feature Scope

**Phases 1-6** (All tasks):
- All user stories except US3 (keyboard/touch deferred)
- Comprehensive edge case testing
- Performance validation
- Export/import compatibility verification

---

## Summary

**Total Tasks**: 8
**Implementation Tasks**: 4 (T2.1, T3.1, T3.2, T3.3)
**Test Tasks**: 3 (T3.4, T4.1, T6.1)
**Review Tasks**: 2 (T1.1, T1.2)
**Estimated Effort**: 2-3 hours for experienced React developer

**Task Distribution by Phase**:
- Phase 1 (Setup): 2 tasks (code review)
- Phase 2 (Foundation): 1 task (state variables)
- Phase 3 (User Story 1 - P1 MVP): 4 tasks (handlers, Escape, wiring, test)
- Phase 4 (User Story 2 - P2): 1 task (visual feedback test)
- Phase 5 (User Story 3 - P3): 0 tasks (DEFERRED)
- Phase 6 (Final Testing): 1 task (edge cases)

**Parallel Opportunities**: 2
1. Phase 1: Tasks T1.1 and T1.2 (code review)
2. Phase 3: Tasks T3.2 and T3.3 (Escape handler and SongCard wiring)

**Critical Path** (sequential dependencies):
- Phase 2 Task T2.1 (state variables)
- Phase 3 Task T3.1 → T3.2/T3.3 → T3.4 (handlers → wiring/cancel → test)

**MVP Milestone**: Complete through Phase 3 (User Story 1)
**Full Feature**: Complete through Phase 6 (skip Phase 5 - US3 deferred)

---

## Next Steps

1. **Start Implementation**: Begin with Phase 1 tasks (review existing code patterns)
2. **MVP First**: Focus on completing Phases 1-3 for first delivery
3. **Manual Testing**: Follow quickstart.md for each test phase
4. **Incremental Delivery**: User Story 1 (drag) → User Story 2 (verify visuals) → Final edge case testing

**Ready to implement!** All design decisions documented, tasks are concrete and executable.
