# Tasks: Drag-and-Drop Stage Reordering

**Input**: Design documents from `specs/004-drag-drop-stages/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual testing only (per constitution - no automated tests required for UI-centric features)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/sections, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/App.jsx` (all changes in one file)
- This is a client-side React SPA with no backend

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review existing codebase structure and prepare for drag-and-drop implementation

- [ ] T001 Review existing App.jsx structure (SongCard and SongDetail components around lines 396-850)
- [ ] T002 Review existing StageRow component rendering in both SongCard and SongDetail
- [ ] T003 Verify existing onUpdate callback pattern for stage modifications
- [ ] T004 Check existing localStorage persistence mechanism for songs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Add CSS custom classes for drag visual feedback in src/App.jsx (styles for .dragging, .drop-target-above, .drop-target-below, cursor-grab)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Mouse Drag-and-Drop (Priority: P1) 🎯 MVP

**Goal**: Enable basic mouse-based drag-and-drop reordering of stages. This is the MVP - core functionality that delivers immediate value.

**Independent Test**: Open a song card with multiple stages. Click and hold on any stage bar, drag it to a different position, release to drop. Verify the stage order updates and persists after page refresh (per quickstart.md Test 1).

### Implementation for User Story 1

- [ ] T006 [P] [US1] Add draggedIndexRef (useRef) state to SongCard component in src/App.jsx
- [ ] T007 [P] [US1] Add dropTargetIndex (useState, default null) state to SongCard component in src/App.jsx
- [ ] T008 [P] [US1] Add isDragging (useState, default false) state to SongCard component in src/App.jsx
- [ ] T009 [US1] Create moveStage utility function in SongCard to reorder stages array via splice in src/App.jsx
- [ ] T010 [US1] Create handleDragStart function in SongCard: set draggedIndexRef, dataTransfer, isDragging=true in src/App.jsx
- [ ] T011 [US1] Create handleDragOver function in SongCard: preventDefault, update dropTargetIndex in src/App.jsx
- [ ] T012 [US1] Create handleDrop function in SongCard: call moveStage, persist via onUpdate, clean up state in src/App.jsx
- [ ] T013 [US1] Create handleDragEnd function in SongCard: clean up all drag state in src/App.jsx
- [ ] T014 [US1] Add draggable={!promptOpen} attribute to StageRow div in SongCard JSX in src/App.jsx
- [ ] T015 [US1] Add onDragStart handler to StageRow div in SongCard JSX calling handleDragStart in src/App.jsx
- [ ] T016 [US1] Add onDragOver handler to StageRow div in SongCard JSX calling handleDragOver in src/App.jsx
- [ ] T017 [US1] Add onDrop handler to StageRow div in SongCard JSX calling handleDrop in src/App.jsx
- [ ] T018 [US1] Add onDragEnd handler to StageRow div in SongCard JSX calling handleDragEnd in src/App.jsx
- [ ] T019 [US1] Add conditional CSS classes to StageRow for drag visual feedback (opacity-50 when dragging, cursor-grab) in src/App.jsx
- [ ] T020 [US1] Add drop indicator CSS class to StageRow based on dropTargetIndex state in src/App.jsx
- [ ] T021 [P] [US1] Add draggedIndexRef (useRef) state to SongDetail component in src/App.jsx
- [ ] T022 [P] [US1] Add dropTargetIndex (useState) and isDragging (useState) states to SongDetail component in src/App.jsx
- [ ] T023 [US1] Mirror moveStage utility function in SongDetail component in src/App.jsx
- [ ] T024 [US1] Mirror all drag event handlers in SongDetail (handleDragStart, handleDragOver, handleDrop, handleDragEnd) in src/App.jsx
- [ ] T025 [US1] Add all drag attributes and handlers to StageRow div in SongDetail JSX in src/App.jsx
- [ ] T026 [US1] Add conditional CSS classes and drop indicator to StageRow in SongDetail in src/App.jsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- Mouse drag-and-drop works in both SongCard and SongDetail
- Visual feedback shows dragged item and drop position
- Changes persist to localStorage after drop
- Stage order updates immediately and correctly

---

## Phase 4: User Story 2 - Cancel Drag Operation (Priority: P2)

**Goal**: Allow users to cancel a drag operation via Escape key or by dragging outside the droppable area. Improves UX by preventing accidental reordering.

**Independent Test**: Start dragging a stage, press Escape or drag outside the song card boundaries. Verify the stage returns to its original position and no changes are saved (per quickstart.md Test 3 & 4).

### Implementation for User Story 2

- [ ] T027 [P] [US2] Modify handleDragEnd in SongCard to check if drop occurred outside boundaries (cleanup without save) in src/App.jsx
- [ ] T028 [P] [US2] Add onKeyDown handler to StageRow in SongCard to detect Escape key during drag in src/App.jsx
- [ ] T029 [US2] Create handleDragCancel function in SongCard to reset drag state without calling onUpdate in src/App.jsx
- [ ] T030 [US2] Update handleDragEnd to call handleDragCancel when appropriate in SongCard in src/App.jsx
- [ ] T031 [US2] Add Escape key detection in onKeyDown to call handleDragCancel in SongCard in src/App.jsx
- [ ] T032 [P] [US2] Mirror handleDragCancel function in SongDetail component in src/App.jsx
- [ ] T033 [US2] Add onKeyDown handler to StageRow in SongDetail with Escape key detection in src/App.jsx
- [ ] T034 [US2] Update handleDragEnd in SongDetail to handle cancel scenarios in src/App.jsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- Mouse drag-and-drop works with full visual feedback (US1)
- Escape key cancels drag and reverts stage position (US2)
- Dragging outside boundaries cancels operation (US2)
- All existing functionality preserved

---

## Phase 5: User Story 3 - Keyboard-Only Reordering (Priority: P3)

**Goal**: Enable keyboard-only reordering using Ctrl+Arrow keys for accessibility. Users who cannot use a mouse can still reorder stages.

**Independent Test**: Tab to focus a stage bar, press Ctrl+Up or Ctrl+Down arrow keys. Verify the stage order changes and visual feedback is provided (per quickstart.md Test 6).

### Implementation for User Story 3

- [ ] T035 [P] [US3] Add tabIndex={0} attribute to StageRow div in SongCard to make it keyboard-focusable in src/App.jsx
- [ ] T036 [US3] Create handleKeyboardReorder function in SongCard to handle Ctrl+Arrow key presses in src/App.jsx
- [ ] T037 [US3] Update onKeyDown handler in SongCard to detect Ctrl+Up/Down arrows and call handleKeyboardReorder in src/App.jsx
- [ ] T038 [US3] Add boundary checks in handleKeyboardReorder (prevent move beyond first/last position) in src/App.jsx
- [ ] T039 [US3] Call moveStage from handleKeyboardReorder to reorder stages in SongCard in src/App.jsx
- [ ] T040 [US3] Add visual feedback or ARIA live announcement when stage is moved via keyboard in SongCard in src/App.jsx
- [ ] T041 [P] [US3] Add tabIndex={0} attribute to StageRow div in SongDetail in src/App.jsx
- [ ] T042 [US3] Mirror handleKeyboardReorder function in SongDetail component in src/App.jsx
- [ ] T043 [US3] Update onKeyDown handler in SongDetail with Ctrl+Arrow key detection in src/App.jsx
- [ ] T044 [US3] Add boundary checks and visual feedback in SongDetail keyboard handler in src/App.jsx

**Checkpoint**: All user stories should now be independently functional
- Mouse drag-and-drop works (US1)
- Drag cancellation works via Escape or drag-out (US2)
- Keyboard-only reordering works with Ctrl+Arrow keys (US3)
- All three interaction methods coexist without conflicts

---

## Phase 6: Touch Device Support & Polish

**Purpose**: Add touch support for mobile/tablet devices and polish edge cases

- [ ] T045 [P] Add touchTimerRef (useRef) and initialTouchYRef (useRef) to SongCard for touch state tracking in src/App.jsx
- [ ] T046 [P] Add touchTimerRef and initialTouchYRef to SongDetail for touch state in src/App.jsx
- [ ] T047 Create handleTouchStart function in SongCard: start 500ms long-press timer, record touch position in src/App.jsx
- [ ] T048 Create handleTouchMove function in SongCard: cancel timer if early scroll, or update dropTargetIndex if dragging in src/App.jsx
- [ ] T049 Create handleTouchEnd function in SongCard: perform drop if dragging, cleanup timers in src/App.jsx
- [ ] T050 Add onTouchStart, onTouchMove, onTouchEnd handlers to StageRow div in SongCard JSX in src/App.jsx
- [ ] T051 Mirror all touch handlers in SongDetail component (handleTouchStart, handleTouchMove, handleTouchEnd) in src/App.jsx
- [ ] T052 Add touch event handlers to StageRow div in SongDetail JSX in src/App.jsx
- [ ] T053 Test all 13 scenarios from quickstart.md manually (ready for user testing)
- [ ] T054 Verify drag-and-drop works in both SongCard and SongDetail views with identical behavior
- [ ] T055 Test touch support on actual mobile/tablet device (not just browser emulation)
- [ ] T056 Verify keyboard navigation works (Tab to stages, Ctrl+Arrow to reorder)
- [ ] T057 Test rapid successive drags don't break state or cause performance issues
- [ ] T058 Verify stage edit modal doesn't conflict with drag functionality
- [ ] T059 Test edge case: single stage in list (drag should be no-op)
- [ ] T060 Test edge case: very long stage list with scrolling (15+ stages)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - review existing code
- **Foundational (Phase 2)**: Depends on Setup - Must complete before user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Implements core mouse drag-drop
- **User Story 2 (Phase 4)**: Depends on User Story 1 - Adds cancellation to drag-drop
- **User Story 3 (Phase 5)**: Depends on User Story 1 - Adds keyboard alternative (independent of US2)
- **Touch Support (Phase 6)**: Depends on User Story 1 - Adds touch interface and polish

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (extends drag-drop with cancel)
- **User Story 3 (P3)**: Depends on User Story 1 (independent alternative input method)
- **User Story 2 and 3**: Can be implemented in parallel after US1 is complete

### Within Each User Story

- **US1**: Add state → Create handlers → Wire up JSX → Add CSS → Mirror to SongDetail
- **US2**: Add cancel logic → Escape key handler → Drag-out detection → Mirror to SongDetail
- **US3**: Add tabIndex → Keyboard handler → Boundary checks → Mirror to SongDetail

### Parallel Opportunities

- **Phase 1**: All tasks can run sequentially (they're review tasks)
- **Phase 2**: T005 is a single task (CSS setup)
- **Phase 3 (US1)**: Tasks T006-T008 can run in parallel (different state variables), T021-T022 can run in parallel (SongDetail state)
- **Phase 4 (US2)**: Tasks T027-T028 can run in parallel (different areas), T032-T033 can run in parallel (SongDetail)
- **Phase 5 (US3)**: Tasks T035-T036 can run in parallel (different concerns), T041-T042 can run in parallel (SongDetail)
- **Phase 6**: Tasks T045-T046 can run in parallel (refs setup), manual testing tasks can be distributed

**After US1**: User Stories 2 and 3 can be implemented in parallel (independent features)

---

## Parallel Example: User Story 1

```bash
# Launch state setup tasks together:
Task: "Add draggedIndexRef state to SongCard in src/App.jsx"
Task: "Add dropTargetIndex state to SongCard in src/App.jsx"
Task: "Add isDragging state to SongCard in src/App.jsx"
```

---

## Parallel Example: User Story 2 and 3 (After US1 Complete)

```bash
# Developer A implements drag cancellation (US2)
Task: "Modify handleDragEnd in SongCard for cancel detection"
Task: "Add onKeyDown handler for Escape key in SongCard"
# ... all US2 tasks

# Developer B implements keyboard reordering (US3) in parallel
Task: "Add tabIndex to StageRow in SongCard"
Task: "Create handleKeyboardReorder in SongCard"
# ... all US3 tasks

# Both developers working in same file but different functions (minimal conflicts)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (review code structure)
2. Complete Phase 2: Foundational (CSS setup)
3. Complete Phase 3: User Story 1 (mouse drag-drop)
4. **STOP and VALIDATE**: Test mouse drag-drop independently using quickstart.md Tests 1-2
5. Deploy/demo drag-drop feature

**Result**: Users can reorder stages with mouse. Immediate value delivered.

### Incremental Delivery

1. Complete Setup + Foundational phases
2. Add User Story 1 → Test independently (quickstart Tests 1-2) → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently (quickstart Tests 3-4) → Deploy/Demo
4. Add User Story 3 → Test independently (quickstart Test 6) → Deploy/Demo
5. Add Touch Support (Phase 6) → Test independently (quickstart Test 5) → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (all working in src/App.jsx):

1. Team completes Setup and Foundational together (Phases 1-2)
2. Once Foundation is done:
   - Developer A: User Story 1 (mouse drag-drop in SongCard, then SongDetail)
   - Wait for US1 to complete (foundational for US2/US3)
3. After US1 complete:
   - Developer B: User Story 2 (cancellation in SongCard, then SongDetail)
   - Developer C: User Story 3 (keyboard in SongCard, then SongDetail)
4. After US2 and US3 complete:
   - Developer A: Touch support (Phase 6)

**⚠️ Note**: Since all work is in src/App.jsx, coordinate function boundaries to avoid merge conflicts:
- US1: Core drag handlers (lines ~400-500 in SongCard)
- US2: Cancel handlers (extend existing drag functions)
- US3: Keyboard handlers (new functions after drag handlers)
- Touch: Touch handlers (new functions after keyboard handlers)

---

## Notes

- [P] tasks = different state variables or components, can be written in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All changes in single file (src/App.jsx) - coordinate to avoid conflicts
- No new components or files needed
- No external dependencies added
- Manual testing using quickstart.md (13 comprehensive test scenarios)
- Commit after each phase or user story completion
- Stop at any checkpoint to validate story independently
- No automated tests required (per constitution) but recommended for drag state logic
