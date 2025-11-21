# Tasks: Click-to-Edit Tempo and Key Fields

**Input**: Design documents from `specs/003-click-to-edit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual testing only (per constitution - automated tests recommended but not required)

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

**Purpose**: Review existing codebase structure for click-to-edit implementation

- [x] T001 Review existing App.jsx structure (SongCard and SongDetail components around lines 360-650)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

_No foundational tasks needed - all existing validation and state management functions are already in place from Feature 002_

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Tempo and Key Without Clutter (Priority: P1) 🎯 MVP

**Goal**: Transform tempo and key fields from always-editable inputs to read-only display text by default. Reduces visual clutter and prevents accidental edits.

**Independent Test**: Open dashboard with songs that have tempo and key set. Verify all tempo/key values display as plain text (not input fields). Attempt to type in display area and verify nothing happens.

### Implementation for User Story 1

- [x] T002 [P] [US1] Add isEditingTempo state (useState, default false) to SongCard component in src/App.jsx
- [x] T003 [P] [US1] Add isEditingKey state (useState, default false) to SongCard component in src/App.jsx
- [x] T004 [US1] Replace tempo input with conditional rendering in SongCard: if isEditingTempo then show input, else show plain text span with "{tempo} BPM"
- [x] T005 [US1] Replace key dropdowns with conditional rendering in SongCard: if isEditingKey then show dropdowns, else show plain text span with "{key}" or "No key"
- [x] T006 [US1] Ensure clicking on tempo display text does NOT trigger edit mode (no onClick handler on display text)
- [x] T007 [US1] Ensure clicking on key display text does NOT trigger edit mode (no onClick handler on display text)
- [x] T008 [P] [US1] Add isEditingTempo state to SongDetail component in src/App.jsx
- [x] T009 [P] [US1] Add isEditingKey state to SongDetail component in src/App.jsx
- [x] T010 [US1] Replace tempo input with conditional rendering in SongDetail (mirror SongCard implementation)
- [x] T011 [US1] Replace key dropdowns with conditional rendering in SongDetail (mirror SongCard implementation)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- Tempo and key display as plain text by default
- No input borders or dropdowns visible
- Clicking values does nothing (no accidental edits possible)
- Visual clutter reduced compared to always-editable inputs

---

## Phase 4: User Story 2 - Click Label to Edit Tempo (Priority: P2)

**Goal**: Allow users to click the "Tempo" label to enter edit mode, showing the input field with auto-focus. Save on blur/Enter, cancel on Escape.

**Independent Test**: Click "Tempo" label on a song card. Verify input field appears with current tempo value and is auto-focused. Change tempo and blur. Verify display returns to read-only mode with updated value.

### Implementation for User Story 2

- [x] T012 [P] [US2] Add tempTempoValue state (useState, initialized from song.tempo) to SongCard component in src/App.jsx
- [x] T013 [US2] Create handleTempoLabelClick function in SongCard that sets isEditingTempo to true
- [x] T014 [US2] Add onClick handler to "Tempo" label in SongCard JSX calling handleTempoLabelClick
- [x] T015 [US2] Add cursor-pointer and hover:underline Tailwind classes to "Tempo" label for visual affordance
- [x] T016 [US2] Add autoFocus prop to tempo input when isEditingTempo is true in SongCard
- [x] T017 [US2] Create handleTempoChange function in SongCard to update tempTempoValue state on input change
- [x] T018 [US2] Create handleTempoSave function in SongCard that validates tempTempoValue, calls onUpdate, sets isEditingTempo to false
- [x] T019 [US2] Create handleTempoCancel function in SongCard that reverts tempTempoValue, sets isEditingTempo to false
- [x] T020 [US2] Add onBlur handler to tempo input calling handleTempoSave in SongCard
- [x] T021 [US2] Add onKeyDown handler to tempo input: Enter calls handleTempoSave, Escape calls handleTempoCancel
- [x] T022 [US2] Add useEffect to sync tempTempoValue when song.tempo changes externally in SongCard
- [x] T023 [P] [US2] Add tempTempoValue state to SongDetail component
- [x] T024 [US2] Mirror all tempo edit handlers in SongDetail (handleTempoLabelClick, handleTempoChange, handleTempoSave, handleTempoCancel)
- [x] T025 [US2] Add all tempo event handlers to SongDetail JSX (label onClick, input onBlur, onKeyDown, autoFocus)
- [x] T026 [US2] Add useEffect to sync tempTempoValue in SongDetail

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- Tempo displays as plain text by default (US1)
- Clicking "Tempo" label enters edit mode with auto-focus (US2)
- Typing updates temporary value, blur/Enter saves, Escape cancels (US2)
- All existing tempo validation preserved (30-300 BPM, clamping, visual feedback) (US2)

---

## Phase 5: User Story 3 - Click Label to Edit Key (Priority: P3)

**Goal**: Allow users to click the "Key" label to enter edit mode, showing the two-step dropdowns (note + mode) with auto-focus. Save on blur/Enter, cancel on Escape.

**Independent Test**: Click "Key" label on a song card. Verify two dropdowns appear (note and mode). Select "E" and "Minor". Blur or click outside. Verify display returns to read-only showing "E Minor".

### Implementation for User Story 3

- [x] T027 [P] [US3] Add tempKeyNote state (useState, initialized from parseKey(song.key)[0]) to SongCard component in src/App.jsx
- [x] T028 [P] [US3] Add tempKeyMode state (useState, initialized from parseKey(song.key)[1]) to SongCard component in src/App.jsx
- [x] T029 [US3] Create handleKeyLabelClick function in SongCard that sets isEditingKey to true
- [x] T030 [US3] Add onClick handler to "Key" label in SongCard JSX calling handleKeyLabelClick
- [x] T031 [US3] Add cursor-pointer and hover:underline Tailwind classes to "Key" label for visual affordance
- [x] T032 [US3] Add autoFocus prop to note dropdown when isEditingKey is true in SongCard
- [x] T033 [US3] Create handleNoteChange function in SongCard to update tempKeyNote (if "No Key", clear and exit edit mode)
- [x] T034 [US3] Create handleModeChange function in SongCard to update tempKeyMode
- [x] T035 [US3] Create handleKeySave function in SongCard that normalizes tempKeyNote, calls onUpdate with "{note} {mode}", sets isEditingKey to false
- [x] T036 [US3] Create handleKeyCancel function in SongCard that reverts tempKeyNote/tempKeyMode, sets isEditingKey to false
- [x] T037 [US3] Add onBlur handler to mode dropdown calling handleKeySave in SongCard
- [x] T038 [US3] Add onKeyDown handler to both dropdowns: Enter calls handleKeySave, Escape calls handleKeyCancel
- [x] T039 [US3] Add useEffect to sync tempKeyNote and tempKeyMode when song.key changes externally in SongCard
- [x] T040 [P] [US3] Add tempKeyNote and tempKeyMode states to SongDetail component
- [x] T041 [US3] Mirror all key edit handlers in SongDetail (handleKeyLabelClick, handleNoteChange, handleModeChange, handleKeySave, handleKeyCancel)
- [x] T042 [US3] Add all key event handlers to SongDetail JSX (label onClick, dropdowns onBlur, onKeyDown, autoFocus)
- [x] T043 [US3] Add useEffect to sync tempKeyNote and tempKeyMode in SongDetail

**Checkpoint**: All user stories should now be independently functional
- Tempo and key display as plain text by default (US1)
- Clicking "Tempo" label enters tempo edit mode (US2)
- Clicking "Key" label enters key edit mode (US3)
- All existing validation and normalization preserved (US2, US3)

---

## Phase 6: Cross-Cutting Concerns & Multi-Field Editing

**Purpose**: Implement auto-save behavior when switching between fields and polish the UX

- [x] T044 [P] Modify handleTempoLabelClick in SongCard to check if isEditingKey is true, and if so, call handleKeySave before entering tempo edit mode
- [x] T045 [P] Modify handleKeyLabelClick in SongCard to check if isEditingTempo is true, and if so, call handleTempoSave before entering key edit mode
- [x] T046 [P] Modify handleTempoLabelClick in SongDetail to auto-save key if editing (mirror SongCard)
- [x] T047 [P] Modify handleKeyLabelClick in SongDetail to auto-save tempo if editing (mirror SongCard)
- [ ] T048 Test all 12 scenarios from quickstart.md manually (ready for user testing)
- [ ] T049 Verify display mode reduces visual clutter compared to always-editable inputs (visual inspection)
- [ ] T050 Verify keyboard navigation works (Tab to labels, Enter to edit, Escape to cancel) per quickstart.md Test 9
- [ ] T051 Test auto-save behavior when switching fields per quickstart.md Test 6
- [ ] T052 Test rapid label clicking doesn't break state per quickstart.md Test 11
- [ ] T053 Test unsaved edits don't persist across page refresh per quickstart.md Test 12
- [ ] T054 [P] Verify SongCard and SongDetail have identical behavior per quickstart.md Test 10

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - review existing code
- **Foundational (Phase 2)**: Depends on Setup - NO TASKS (existing functions reused)
- **User Story 1 (Phase 3)**: Depends on Setup - Implements display mode
- **User Story 2 (Phase 4)**: Depends on User Story 1 - Adds tempo edit capability
- **User Story 3 (Phase 5)**: Depends on User Story 1 - Adds key edit capability
- **Cross-Cutting (Phase 6)**: Depends on User Stories 2 AND 3 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (needs display mode to toggle from)
- **User Story 3 (P3)**: Depends on User Story 1 (needs display mode to toggle from)
- **User Story 2 and 3**: Can be implemented in parallel after US1 is complete

### Within Each User Story

- **US1**: Add states → Conditional rendering → Verify no accidental edits
- **US2**: Temp state → Label click handler → Input handlers → Save/Cancel → Keyboard shortcuts → Mirror to SongDetail
- **US3**: Temp states → Label click handler → Dropdown handlers → Save/Cancel → Keyboard shortcuts → Mirror to SongDetail

### Parallel Opportunities

- **Phase 3 (US1)**: Tasks T002-T003 can run in parallel (different state variables)
- **Phase 3 (US1)**: Tasks T004-T005 can run in parallel (tempo and key are independent)
- **Phase 3 (US1)**: Tasks T008-T009 can run in parallel (SongDetail states)
- **Phase 4 (US2)**: Task T012 and T023 can run in parallel (SongCard vs SongDetail)
- **Phase 5 (US3)**: Tasks T027-T028 can run in parallel (different state variables)
- **Phase 5 (US3)**: Tasks T040 can run in parallel with T027-T028 (SongDetail vs SongCard)
- **Phase 6**: Tasks T044-T047 can run in parallel (independent auto-save logic)
- **After US1**: User Stories 2 and 3 can be implemented in parallel (different edit modes)

---

## Parallel Example: User Story 1

```bash
# Launch all display mode rendering tasks together:
Task: "Add isEditingTempo state to SongCard in src/App.jsx"
Task: "Add isEditingKey state to SongCard in src/App.jsx"
Task: "Add isEditingTempo state to SongDetail in src/App.jsx"
Task: "Add isEditingKey state to SongDetail in src/App.jsx"
```

---

## Parallel Example: User Story 2 and 3 (After US1 Complete)

```bash
# Developer A implements tempo edit (US2)
Task: "Add tempTempoValue state to SongCard"
Task: "Create handleTempoLabelClick function in SongCard"
# ... all US2 tasks

# Developer B implements key edit (US3) in parallel
Task: "Add tempKeyNote state to SongCard"
Task: "Create handleKeyLabelClick function in SongCard"
# ... all US3 tasks

# Both developers working in same file but different sections (no conflicts)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (review code)
2. Skip Phase 2: Foundational (no tasks needed)
3. Complete Phase 3: User Story 1 (display mode)
4. **STOP and VALIDATE**: Test display mode independently using quickstart.md Test 1
5. Deploy/demo display mode feature

**Result**: Users see clean, read-only tempo/key displays. No editing capability yet, but immediate value from reduced clutter.

### Incremental Delivery

1. Complete Setup → Foundation ready (no new code)
2. Add User Story 1 → Test independently (quickstart.md Test 1) → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently (quickstart.md Tests 2, 4, 5, 7) → Deploy/Demo
4. Add User Story 3 → Test independently (quickstart.md Tests 3, 8) → Deploy/Demo
5. Add Cross-Cutting (auto-save) → Test independently (quickstart.md Test 6) → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (all working in src/App.jsx):

1. Team completes Setup together (Phase 1)
2. Once Setup is done:
   - Developer A: User Story 1 (display mode for both tempo and key)
   - Wait for US1 to complete (foundational for US2/US3)
3. After US1 complete:
   - Developer B: User Story 2 (tempo edit mode in SongCard, then SongDetail)
   - Developer C: User Story 3 (key edit mode in SongCard, then SongDetail)
4. After US2 and US3 complete:
   - Developer A: Cross-cutting concerns (auto-save between fields)

**⚠️ Note**: Since all work is in src/App.jsx, coordinate section boundaries to avoid merge conflicts:
- US1: Conditional rendering sections (lines ~XXX-XXX in SongCard, ~YYY-YYY in SongDetail)
- US2: Tempo edit handlers (new functions before SongCard JSX)
- US3: Key edit handlers (new functions before SongCard JSX)
- Cross-cutting: Modify existing label click handlers

---

## Notes

- [P] tasks = different state variables or components, can be written in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All changes in single file (src/App.jsx) - coordinate to avoid conflicts
- No new components or files needed
- All existing validation/normalization functions reused (no changes)
- Manual testing using quickstart.md (12 comprehensive test scenarios)
- Commit after each phase or user story completion
- Stop at any checkpoint to validate story independently
- No automated tests required (per constitution) but recommended for edit state logic
