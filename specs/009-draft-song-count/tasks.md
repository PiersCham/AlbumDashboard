# Tasks: Draft-Aware Song Count and Progress

**Input**: Design documents from `/specs/009-draft-song-count/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-api.md, quickstart.md

**Tests**: Manual browser testing per constitution (UI-centric features). No automated test tasks generated.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Single-file SPA: `src/App.jsx` at repository root
- All changes in one file, so parallelization limited

---

## Phase 1: Code Review & Context Loading

**Purpose**: Understand existing implementation before making changes

- [X] T001 Review Header component structure in src/App.jsx (lines 340-400)
- [X] T002 [P] Review albumAverage() function in src/App.jsx (lines 330-334)
- [X] T003 [P] Review eligibleCount() function in src/App.jsx (lines 336-338)
- [X] T004 [P] Review album-wide progress bar rendering in src/App.jsx (lines 1557-1569)
- [X] T005 Review feature 008 isDraft field implementation for backward compatibility verification

**Checkpoint**: Understand current metric calculations and display locations ✅

---

## Phase 2: User Story 1 - Accurate Song Count Display (Priority: P1) 🎯 MVP

**Goal**: Display only non-draft songs in header song count (both numerator and denominator)

**Independent Test**: Mark songs as draft and verify song count updates to show "X/Y" where Y = non-draft song count. Test by marking 3 songs as draft and verifying denominator changes from 12 to 9.

### Implementation for User Story 1

- [X] T006 [US1] Add nonDraftSongs filter variable in Header component in src/App.jsx (~line 360)
- [X] T007 [US1] Modify eligibleCount() call to use nonDraftSongs instead of songs in src/App.jsx (~line 375)
- [X] T008 [US1] Replace hardcoded "/13" denominator with "/{nonDraftSongs.length}" in src/App.jsx (~line 375)

**Checkpoint**: Song count display shows "X/Y" format where both X and Y reflect non-draft songs only. Test scenarios 1-5 from quickstart.md Test 1 should pass. ✅

---

## Phase 3: User Story 2 - Draft-Aware Overall Progress (Priority: P2)

**Goal**: Calculate overall progress percentage using only non-draft songs

**Independent Test**: Adjust stage progress on non-draft songs and verify overall progress percentage updates. Mark songs with progress as draft and verify overall progress recalculates excluding them.

### Implementation for User Story 2

- [X] T009 [US2] Add nonDraftSongs filter in App main render before progress bar in src/App.jsx (~line 1558)
- [X] T010 [US2] Modify first albumAverage() call in ProgressBar value to use nonDraftSongs in src/App.jsx (~line 1559)
- [X] T011 [US2] Modify second albumAverage() call in percentage display to use nonDraftSongs in src/App.jsx (~line 1567)

**Checkpoint**: Overall progress bar displays percentage calculated from non-draft songs only. Test scenarios 1-5 from quickstart.md Test 3 should pass.

---

## Phase 4: Manual Testing & Validation

**Purpose**: Verify feature works correctly across all scenarios

- [ ] T012 Manual test - Basic song count display (quickstart.md Test 1)
- [ ] T013 Manual test - Eligible song count numerator (quickstart.md Test 2)
- [ ] T014 Manual test - Overall progress calculation (quickstart.md Test 3)
- [ ] T015 Manual test - Edge case all songs draft (quickstart.md Test 4)
- [ ] T016 Manual test - Rapid draft toggling performance (quickstart.md Test 5)
- [ ] T017 Manual test - Overall progress accuracy with known values (quickstart.md Test 6)
- [ ] T018 Manual test - Performance timing validation <100ms (quickstart.md Test 7)
- [ ] T019 Manual test - Persistence across page refresh (quickstart.md Test 8)
- [ ] T020 Manual test - Export/import with draft songs (quickstart.md Test 9)
- [ ] T021 Manual test - Draft song progress isolation (quickstart.md Test 10)
- [ ] T022 Manual test - 90% threshold boundary testing (quickstart.md Test 11)

**Checkpoint**: All manual test scenarios pass. Feature ready for commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Code Review (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Code Review completion
- **User Story 2 (Phase 3)**: Depends on Code Review completion (independent of US1)
- **Manual Testing (Phase 4)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can be implemented and tested alone (changes Header component only)
- **User Story 2 (P2)**: Independent - can be implemented and tested alone (changes App main render only)
- **Note**: Both stories modify different locations in src/App.jsx, so no file conflicts

### Within Each User Story

**User Story 1 Tasks**:
- T006 → T007 → T008 (sequential, same component)
- All modify Header component (~lines 340-380)

**User Story 2 Tasks**:
- T009 → T010 → T011 (sequential, same section)
- All modify App main render (~lines 1557-1569)

### Parallel Opportunities

**Limited parallelization** due to single-file SPA:
- Code Review tasks (T002, T003, T004) can run in parallel (read-only, different functions)
- User Stories 1 and 2 modify different sections of same file:
  - US1 modifies Header component (~lines 340-380)
  - US2 modifies App main render (~lines 1557-1569)
  - Could theoretically implement in parallel, but merge conflicts likely
- Recommend sequential implementation: US1 → US2 → Manual Testing

**Manual Testing Tasks**:
- All tests (T012-T022) can run in parallel if multiple testers available
- Or sequentially following quickstart.md order

---

## Parallel Example: Code Review Phase

```bash
# Launch all code review tasks together (read-only, no conflicts):
Task: "Review albumAverage() function in src/App.jsx (lines 330-334)"
Task: "Review eligibleCount() function in src/App.jsx (lines 336-338)"
Task: "Review album-wide progress bar rendering in src/App.jsx (lines 1557-1569)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Code Review
2. Complete Phase 2: User Story 1
3. **STOP and VALIDATE**: Test song count display independently
   - Mark 3 songs as draft
   - Verify denominator shows 9 (not 12)
   - Verify numerator only counts non-draft songs ≥90%
4. If US1 works, commit and optionally deploy

### Incremental Delivery

1. Complete Code Review → Understand codebase
2. Add User Story 1 → Test independently (quickstart.md Test 1-2) → Commit
3. Add User Story 2 → Test independently (quickstart.md Test 3) → Commit
4. Run full manual test suite (quickstart.md all tests) → Final validation

### Sequential Recommendation (Single Developer)

Due to single-file SPA architecture:

1. Phase 1: Code Review (T001-T005) - ~15 minutes
2. Phase 2: User Story 1 (T006-T008) - ~10 minutes
   - Test US1 independently
3. Phase 3: User Story 2 (T009-T011) - ~10 minutes
   - Test US2 independently
4. Phase 4: Manual Testing (T012-T022) - ~45 minutes
   - Validate all scenarios from quickstart.md

**Total Estimated Time**: ~90 minutes for complete implementation and testing

---

## Notes

- **Single-file SPA**: All changes in src/App.jsx, limited parallelization
- **No automated tests**: Per constitution, manual browser testing for UI features
- **Independent stories**: Each user story modifies different component sections
  - US1: Header component song count display
  - US2: App main render overall progress bar
- **Performance target**: <100ms metric updates (validate in quickstart.md Test 7)
- **Edge cases**: All songs draft → "0/0" and "0%" (validate in quickstart.md Test 4)
- Commit after each user story completion
- Stop at any checkpoint to validate story independently
- Reference contracts/component-api.md for exact implementation details
- Reference data-model.md for calculation formulas

---

## Implementation Details Quick Reference

### User Story 1: Song Count Display

**File**: `src/App.jsx`
**Location**: Header component (~line 360-380)

**Before**:
```javascript
<div className="text-2xl font-black tracking-wider">
  {eligibleCount(songs, 90)}/13
</div>
```

**After**:
```javascript
const nonDraftSongs = songs.filter(song => !song.isDraft);
// ...
<div className="text-2xl font-black tracking-wider">
  {eligibleCount(nonDraftSongs, 90)}/{nonDraftSongs.length}
</div>
```

---

### User Story 2: Overall Progress

**File**: `src/App.jsx`
**Location**: App main render (~line 1557-1569)

**Before**:
```javascript
<ProgressBar value={albumAverage(songs)} height="h-9" />
<span>{albumAverage(songs)}%</span>
```

**After**:
```javascript
const nonDraftSongs = songs.filter(song => !song.isDraft);
<ProgressBar value={albumAverage(nonDraftSongs)} height="h-9" />
<span>{albumAverage(nonDraftSongs)}%</span>
```

**Alternative** (using IIFE for cleaner JSX):
```javascript
{(() => {
  const nonDraftSongs = songs.filter(song => !song.isDraft);
  return (
    <div className="px-4 -mt-2 pb-2 relative">
      <ProgressBar value={albumAverage(nonDraftSongs)} height="h-9" />
      <span>{albumAverage(nonDraftSongs)}%</span>
    </div>
  );
})()}
```
