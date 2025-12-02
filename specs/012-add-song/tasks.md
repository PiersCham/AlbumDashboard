# Tasks: Add New Song

**Input**: Design documents from `/specs/012-add-song/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Manual browser testing (per constitution - no automated tests for UI-centric features)

**Organization**: Tasks grouped by user story to enable independent testing of each increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different file sections, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All tasks include exact file paths

## Path Conventions

- Single-page React application: `src/App.jsx` (all changes in one file)
- Manual testing via browser DevTools
- No new files or dependencies

---

## Phase 1: Setup (Project Verification)

**Purpose**: Verify development environment is ready

- [ ] T001 Verify React dev server runs successfully with `npm run dev`
- [ ] T002 Verify browser DevTools accessible for testing and localStorage inspection
- [ ] T003 Export current localStorage data as backup before implementation

**Checkpoint**: Environment verified, backup created

---

## Phase 2: Foundational (Storage Infrastructure)

**Purpose**: Add storage quota monitoring needed by all user stories

**⚠️ CRITICAL**: This must complete before ANY user story implementation

- [X] T004 Add `isStorageQuotaOk` useMemo hook in src/App.jsx after existing useMemo hooks (before return statement)

**Implementation Details**:
```javascript
const isStorageQuotaOk = useMemo(() => {
  try {
    const currentData = JSON.stringify({ songs, albumTitle, targetISO, songCount });
    const bytesUsed = currentData.length * 2; // UTF-16
    const quotaLimit = 5000000; // 5MB
    return bytesUsed < (quotaLimit * 0.9);
  } catch {
    return false;
  }
}, [songs, albumTitle, targetISO, songCount]);
```

**Checkpoint**: Foundation ready - storage quota check available for button disable logic

---

## Phase 3: User Story 1 - Add Single Song to Existing Album (Priority: P1) 🎯 MVP

**Goal**: Enable users to add one new song to their album with a single button click

**Independent Test**:
1. Click "Add Song" button in grid view
2. Verify new song appears with default values (title "Song {id}", 8 stages at 0%, 120 BPM)
3. Reload page → song persists
4. Open zoom view → all fields editable

### Implementation for User Story 1

- [X] T005 [US1] Implement `addSong()` function in src/App.jsx after `updateSong` function

**Implementation Details**:
```javascript
const addSong = () => {
  const newId = Math.max(...songs.map(s => s.id), 0) + 1;
  const newSong = {
    id: newId,
    title: `Song ${newId}`,
    stages: DEFAULT_STAGE_NAMES.map(name => ({ name, value: 0 })),
    tempo: DEFAULT_TEMPO,
    key: null,
    duration: { minutes: 0, seconds: 0 },
    isDraft: false,
    side: ""
  };
  setSongs([...songs, newSong]);
  setSongCount(songs.length + 1);
};
```

- [X] T006 [US1] Add "Add Song" button in grid view section of src/App.jsx (inside `{!currentSong && (` block, after album progress bar, before song cards grid)

**Implementation Details**:
```jsx
<div className="px-4 pb-2">
  <button
    disabled={songs.length >= 99 || !isStorageQuotaOk}
    onClick={addSong}
    className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
    title={
      songs.length >= 99
        ? "Maximum 99 songs reached"
        : !isStorageQuotaOk
        ? "Storage quota approaching limit"
        : "Add a new song"
    }
  >
    Add Song
  </button>
</div>
```

### Manual Testing for User Story 1

- [ ] T007 [US1] Test: Verify "Add Song" button appears in grid view only (hidden in zoom view)
- [ ] T008 [US1] Test: Click button → new song appears with title "Song {id}" where id = max(existing IDs) + 1
- [ ] T009 [US1] Test: Verify new song has 8 default stages all at 0% progress
- [ ] T010 [US1] Test: Verify new song has tempo 120 BPM, no key, 0:00 duration, non-draft status, no side
- [ ] T011 [US1] Test: Reload page → new song persists from localStorage
- [ ] T012 [US1] Test: Open zoom view for new song → all fields (title, tempo, key, duration, stages, draft, side) are editable
- [ ] T013 [US1] Test: Button shows correct tooltip on hover ("Add a new song")

**Checkpoint**: User Story 1 complete - users can add a single song and it persists

---

## Phase 4: User Story 2 - Add Multiple Songs Sequentially (Priority: P2)

**Goal**: Enable users to add multiple songs in succession without errors

**Independent Test**:
1. Click "Add Song" button 5 times
2. Verify 5 new songs appear with unique sequential IDs
3. Verify songCount increases by 5
4. Test edge case: Add songs until reaching 99 total → button disables

### Implementation for User Story 2

**Note**: No new implementation needed - `addSong()` from US1 already supports multiple additions

### Manual Testing for User Story 2

- [ ] T014 [US2] Test: Add 5 songs consecutively → all appear with unique IDs (no conflicts)
- [ ] T015 [US2] Test: Verify each new song ID = previous max ID + 1 (no gap reuse)
- [ ] T016 [US2] Test: After adding 5 songs, songCount reflects new total (original + 5)
- [ ] T017 [US2] Test: Reload page → all 5 new songs persist correctly
- [ ] T018 [US2] Test: Add songs until total = 99 → button disables (neutral-700 background, not-allowed cursor)
- [ ] T019 [US2] Test: With 99 songs, hover over disabled button → tooltip shows "Maximum 99 songs reached"
- [ ] T020 [US2] Test: With 99 songs, clicking disabled button does nothing (no error)

### Edge Case Testing for User Story 2

- [ ] T021 [US2] Test: Delete song ID 5, then add new song → new song gets ID = max(remaining IDs) + 1 (not ID 5)
- [ ] T022 [US2] Test: Remove all songs (0 songs), then add new song → new song gets ID = 1
- [ ] T023 [US2] Test: Export data with 20 songs → import data → all 20 songs restored with correct IDs

**Checkpoint**: User Story 2 complete - users can add multiple songs sequentially up to 99 total

---

## Phase 5: User Story 3 - Remove Unwanted Songs (Priority: P3)

**Goal**: Enable users to delete songs they no longer need, with confirmation for songs with progress

**Independent Test**:
1. Add a new song
2. Open its zoom/detail view
3. Click "Remove Song" button
4. Verify song removed and returns to grid
5. Reload page → song stays deleted

### Implementation for User Story 3

- [X] T024 [US3] Implement `removeSong(songId)` function in src/App.jsx after `addSong` function

**Implementation Details**:
```javascript
const removeSong = (songId) => {
  const song = songs.find(s => s.id === songId);

  if (song && songAverage(song) > 0) {
    if (!window.confirm("This song has progress. Are you sure you want to delete it?")) {
      return;
    }
  }

  setSongs(songs.filter(s => s.id !== songId));
  setSongCount(songs.length - 1);
};
```

- [X] T025 [US3] Add "Remove Song" button in SongDetail component header in src/App.jsx (between Draft checkbox and "Back to Grid" button)

**Implementation Details**:
```jsx
<button
  onClick={() => {
    removeSong(song.id);
    onBack();
  }}
  className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 transition-colors"
  title="Remove this song"
>
  Remove Song
</button>
```

### Manual Testing for User Story 3

- [ ] T026 [US3] Test: "Remove Song" button appears in zoom view only (not in grid view)
- [ ] T027 [US3] Test: Open zoom view for song with 0% progress → click Remove → song deleted immediately (no confirmation)
- [ ] T028 [US3] Test: Open zoom view for song with >0% progress → click Remove → confirmation dialog appears
- [ ] T029 [US3] Test: Confirmation dialog shows message "This song has progress. Are you sure you want to delete it?"
- [ ] T030 [US3] Test: Click "Cancel" in confirmation → song NOT removed, stays in zoom view
- [ ] T031 [US3] Test: Click "OK" in confirmation → song removed, returns to grid view
- [ ] T032 [US3] Test: After removal, reload page → song stays deleted (persisted to localStorage)
- [ ] T033 [US3] Test: Remove song → songCount decrements correctly
- [ ] T034 [US3] Test: Remove last remaining song → can still add new songs afterward (0 songs is valid state)

### Integration Testing for User Story 3

- [ ] T035 [US3] Test: Add song → immediately remove it → no errors, returns to original state
- [ ] T036 [US3] Test: Add 3 songs → remove middle one → remaining songs display correctly with no gaps
- [ ] T037 [US3] Test: Remove song → export data → import data → removed song stays gone

**Checkpoint**: User Story 3 complete - users can add and remove songs with confirmation protection

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and visual polish

- [ ] T038 Visual inspection: "Add Song" button styled correctly (emerald-600 bg, emerald-500 hover, neutral-700 disabled)
- [ ] T039 Visual inspection: "Remove Song" button styled correctly (red-600 bg, red-500 hover)
- [ ] T040 Visual inspection: Button positioning correct in both grid and zoom views
- [ ] T041 Accessibility: Verify all buttons have descriptive title attributes for screen readers
- [ ] T042 Performance: Test adding/removing songs with 99 songs total → operations complete in <1 second
- [ ] T043 localStorage inspection: Verify data structure correct in DevTools Application tab
- [ ] T044 Cross-browser: Test in Chrome, Firefox, and Safari (if available)
- [ ] T045 Responsiveness: Test at different screen sizes (1920x1080, 1366x768 minimum)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on US1 (reuses `addSong()` function)
- **User Story 3 (Phase 5)**: Independent of US2, depends only on Foundational
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 implementation (tests the same `addSong()` function with edge cases)
- **User Story 3 (P3)**: Independent - can be implemented in parallel with US2 if desired

### Task Dependencies

- T004 (storage quota check) must complete before T006 (Add Song button - needs `isStorageQuotaOk`)
- T005 (addSong function) must complete before T006 (Add Song button - needs `onClick={addSong}`)
- T024 (removeSong function) must complete before T025 (Remove Song button - needs `onClick={removeSong}`)
- All implementation tasks must complete before their respective testing tasks
- Manual tests can run in any order after their implementation is complete

### Parallel Opportunities

**Limited parallelization** - all changes in single file (src/App.jsx):

- T001, T002, T003 (Setup tasks) can run in parallel
- T007-T013 (US1 manual tests) can run in parallel after T006 completes
- T014-T023 (US2 manual tests) can run in parallel after US1 implementation
- T026-T037 (US3 manual tests) can run in parallel after T025 completes
- T038-T045 (Polish tasks) can run in parallel after all user stories complete

**Note**: Since all implementation tasks modify the same file (src/App.jsx), they must run sequentially to avoid merge conflicts.

---

## Parallel Example: Testing User Story 1

```bash
# After T006 completes, launch all US1 tests in parallel:

# Terminal 1: Browser testing
Task T007: "Verify button appears in grid view only"
Task T008: "Click button → verify new song appears"
Task T009: "Verify song has 8 default stages at 0%"

# Terminal 2: Persistence testing
Task T011: "Reload page → verify persistence"
Task T012: "Open zoom view → verify fields editable"

# Terminal 3: Visual testing
Task T013: "Verify button tooltip correct"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004) - CRITICAL
3. Complete Phase 3: User Story 1 Implementation (T005-T006)
4. **STOP and VALIDATE**: Run all US1 tests (T007-T013)
5. If tests pass → MVP is ready to use!
6. Commit with message: `feat(012-add-song): implement US1 - add single song`

**At this point, users can add songs to their album. This is a complete, valuable feature.**

### Incremental Delivery

1. MVP (US1) → Users can add 1 song ✅
2. Add US2 (T014-T023) → Users can add multiple songs up to 99 ✅
3. Add US3 (T024-T037) → Users can remove unwanted songs ✅
4. Polish (T038-T045) → Final validation and refinement ✅

Each increment adds value without breaking previous functionality.

### Sequential Implementation (Recommended)

Since all changes are in one file:

1. Developer implements T001-T004 (Setup + Foundation)
2. Developer implements T005-T006 (US1 implementation)
3. Developer tests T007-T013 (US1 validation) → Commit
4. Developer tests T014-T023 (US2 validation) → Commit
5. Developer implements T024-T025 (US3 implementation)
6. Developer tests T026-T037 (US3 validation) → Commit
7. Developer completes T038-T045 (Polish) → Final commit

**Total estimated time**: 2-3 hours (per quickstart.md)

---

## Notes

- No [P] markers on implementation tasks (T004-T006, T024-T025) - all modify same file sequentially
- [P] markers used for independent test tasks that can run concurrently
- Each user story checkpoint represents a deployable increment
- Manual testing per constitution (no automated tests for UI-centric features)
- All changes confined to src/App.jsx (simplicity principle)
- Commit after each user story completes and tests pass
- localStorage backup (T003) provides rollback safety
- Verify tests pass before moving to next user story
