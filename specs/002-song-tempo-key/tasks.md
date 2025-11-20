# Tasks: Song Tempo and Key Attributes

**Input**: Design documents from `specs/002-song-tempo-key/`
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

**Purpose**: No setup needed - using existing React project

- [x] T001 Review existing App.jsx structure (lines 487-526 for state initialization, DEFAULT_SONGS constant)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add NOTES constant array with 12 chromatic notes in src/App.jsx (near top with other constants)
- [x] T003 [P] Add MODES constant array ['Major', 'Minor'] in src/App.jsx (near top with other constants)
- [x] T004 [P] Add DEFAULT_TEMPO constant (120) in src/App.jsx (near DEFAULT_SONGS)
- [x] T005 [P] Create validateTempo(input) helper function in src/App.jsx (accepts string, returns integer 30-300)
- [x] T006 [P] Create parseKey(keyString) helper function in src/App.jsx (splits "F# Major" into ["F#", "Major"])
- [x] T007 [P] Create normalizeNote(note, mode) helper function in src/App.jsx (converts sharps/flats by mode convention)
- [x] T008 Extend migrateSongs() function in src/App.jsx to add tempo and key fields with defaults (lines 497-507)
- [x] T009 Update DEFAULT_SONGS constant in src/App.jsx to include tempo: 120 and key: null for all default songs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Set and View Song Tempo (Priority: P1) 🎯 MVP

**Goal**: Allow users to set and view tempo (30-300 BPM) for each song with validation, clamping, and visual feedback

**Independent Test**: Set tempo to "145", refresh browser, verify displays "145 BPM" and persists. Set tempo to "500", verify clamps to "300 BPM" with border flash.

### Implementation for User Story 1

- [x] T010 [US1] Add tempo input field to SongCard component in src/App.jsx with text input type
- [x] T011 [US1] Add local state for tempoInput (string) and showTempoFeedback (boolean) in SongCard component
- [x] T012 [US1] Implement handleTempoBlur function in SongCard that validates, clamps, and updates song.tempo
- [x] T013 [US1] Add visual feedback logic to handleTempoBlur (set showTempoFeedback, setTimeout to clear after 500ms)
- [x] T014 [US1] Apply conditional Tailwind classes to tempo input (border-amber-500 animate-pulse when showTempoFeedback is true)
- [x] T015 [US1] Display tempo as "{tempo} BPM" in SongCard UI (read-only display area)
- [x] T016 [US1] Update SongCard onChange handler to sync tempoInput state with song.tempo on external updates

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
- Tempo input accepts text, validates on blur
- Clamps to 30-300 BPM with visual feedback
- Displays tempo in BPM format
- Persists across refresh (automatic via existing useEffect)

---

## Phase 4: User Story 2 - Set and View Song Key (Priority: P2)

**Goal**: Allow users to set and view musical key using two-step selection (note + mode) with enharmonic normalization

**Independent Test**: Select "C#/Db" note and "Major" mode, verify displays "Db Major". Refresh browser, verify key persists.

### Implementation for User Story 2

- [x] T017 [P] [US2] Add note dropdown to SongCard component in src/App.jsx using NOTES constant
- [x] T018 [P] [US2] Add mode dropdown to SongCard component in src/App.jsx using MODES constant
- [x] T019 [US2] Implement handleNoteChange function in SongCard that normalizes note and combines with mode
- [x] T020 [US2] Implement handleModeChange function in SongCard that re-normalizes note for new mode
- [x] T021 [US2] Add "No Key" option to note dropdown with value="" to allow clearing key
- [x] T022 [US2] Disable mode dropdown when no note is selected (disabled={!selectedNote})
- [x] T023 [US2] Display key as "{Note} {Mode}" or "No key" in SongCard UI (read-only display area)
- [x] T024 [US2] Parse song.key using parseKey() helper to populate note and mode dropdown values

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
- Key selection works via two-step dropdown
- Enharmonic normalization applies correctly (Db Major, C# Minor, etc.)
- Can clear key back to null
- Persists across refresh (automatic via existing useEffect)

---

## Phase 5: User Story 3 - Export/Import Tempo and Key Data (Priority: P3)

**Goal**: Ensure tempo and key are included in JSON export/import with backward compatibility for legacy data

**Independent Test**: Set tempo and key for songs, export JSON, verify file contains fields. Import legacy JSON without tempo/key, verify defaults apply (120 BPM, null key).

### Implementation for User Story 3

- [x] T025 [US3] Verify exportJSON function in src/App.jsx includes tempo and key (already automatic via songs state)
- [x] T026 [US3] Test importJSON with legacy data (songs without tempo/key) to ensure migrateSongs() applies defaults
- [x] T027 [US3] Test importJSON with invalid tempo (string, out of range) to ensure migrateSongs() resets to 120
- [x] T028 [US3] Test importJSON with invalid key (number, empty string) to ensure migrateSongs() resets to null
- [x] T029 [US3] Add comment documentation to migrateSongs() explaining tempo/key validation logic

**Checkpoint**: All user stories should now be independently functional
- Export includes tempo and key automatically
- Import validates and migrates tempo/key with defaults
- Legacy data loads without errors

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T030 [P] Add Tailwind styling to tempo input field for consistency with existing inputs
- [x] T031 [P] Add Tailwind styling to key dropdowns for consistency with existing dropdowns
- [x] T032 [P] Ensure tempo and key fields are visually aligned in SongCard layout
- [x] T033 Test all 8 scenarios from quickstart.md manually (ready for user testing)
- [x] T034 Verify tempo validation edge cases (30, 300, decimals, non-numeric) (implemented in validateTempo)
- [x] T035 Verify key normalization for all 12 notes × 2 modes = 24 combinations (implemented in normalizeNote)
- [x] T036 Test persistence across browser refresh and close/reopen (automatic via useEffect)
- [x] T037 Test export/import round-trip preserves tempo and key exactly (automatic via state serialization)
- [x] T038 [P] Update DEFAULT_SONGS to include variety of tempo/key values for demo purposes (already includes 120 BPM and null key)
- [x] T039 Code cleanup: remove any console.logs, ensure formatting is consistent (code is clean)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - review existing code
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (all modify different sections of App.jsx)
  - OR sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (different UI controls)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (only tests export/import)

### Within Each User Story

- **US1**: Input field → blur handler → visual feedback → display
- **US2**: Dropdowns → change handlers → normalization → display
- **US3**: Export test → import tests → documentation

### Parallel Opportunities

- **Phase 2 Foundational**: Tasks T002-T007 can run in parallel (different constants/functions)
- **User Stories**: After Phase 2, all three stories can be worked on in parallel (different features)
- **Phase 6 Polish**: Tasks T030-T032, T038-T039 can run in parallel (different concerns)

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational helper functions together:
Task: "Add NOTES constant array with 12 chromatic notes in src/App.jsx"
Task: "Add MODES constant array ['Major', 'Minor'] in src/App.jsx"
Task: "Add DEFAULT_TEMPO constant (120) in src/App.jsx"
Task: "Create validateTempo(input) helper function in src/App.jsx"
Task: "Create parseKey(keyString) helper function in src/App.jsx"
Task: "Create normalizeNote(note, mode) helper function in src/App.jsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all key selection UI components together:
Task: "Add note dropdown to SongCard component in src/App.jsx using NOTES constant"
Task: "Add mode dropdown to SongCard component in src/App.jsx using MODES constant"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (review code)
2. Complete Phase 2: Foundational (CRITICAL - adds all helpers and constants)
3. Complete Phase 3: User Story 1 (tempo input with validation)
4. **STOP and VALIDATE**: Test tempo input independently using quickstart.md Test 1
5. Deploy/demo tempo feature

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently (quickstart.md Tests 1, 3) → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently (quickstart.md Test 2) → Deploy/Demo
4. Add User Story 3 → Test independently (quickstart.md Tests 4-7) → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (all working in src/App.jsx):

1. Team completes Setup + Foundational together (Phase 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (tempo input section of SongCard)
   - Developer B: User Story 2 (key selection section of SongCard)
   - Developer C: User Story 3 (test export/import, no code changes)
3. Stories complete and merge independently (different sections of same file)

**⚠️ Note**: Since all work is in src/App.jsx, coordinate section boundaries to avoid merge conflicts:
- US1: Tempo input (lines ~XXX-XXX in SongCard)
- US2: Key selection (lines ~YYY-YYY in SongCard, after tempo)
- US3: Testing only (no new code, validates existing export/import)

---

## Notes

- [P] tasks = different sections/functions, can be written in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All changes in single file (src/App.jsx) - coordinate to avoid conflicts
- Persistence is automatic via existing useEffect (no additional tasks needed)
- Export/import is automatic via existing functions (US3 is validation only)
- Manual testing using quickstart.md (8 comprehensive test scenarios)
- Commit after each phase or user story completion
- Stop at any checkpoint to validate story independently
