# Tasks: Total Album Duration Display

**Feature**: 006-total-album-duration
**Branch**: `006-total-album-duration`
**Date**: 2025-11-21
**Status**: Not Started

---

## Task Overview

**Total Tasks**: 10
**Phases**: 5
**Parallel Opportunities**: 1 (helper function can be written in parallel with code review)

**Prioritization**: Tasks organized by user story priority (P1 → P2 → P3) to enable MVP-first development.

---

## Phase 1: Setup and Discovery

**Goal**: Understand existing codebase patterns before making changes

### Task 1.1: Review Existing Header Component Structure

**Description**: Study the Header component to understand current layout and styling patterns.

**Location**: `src/App.jsx` (line 327-369)

**What to Review**:
- Header component props (targetISO, setTargetISO, songs, albumTitle, setAlbumTitle)
- Current layout: album title (left), song count (center), countdown timer (right)
- Styling classes for header elements (text-2xl, font-black, tracking-wider)
- Responsive layout patterns (flex-col on mobile, flex-row on desktop)
- Existing useMemo/useEffect patterns in Header

**Acceptance Criteria**:
- [ ] Identified current song count display location (line ~342-344)
- [ ] Documented Header component styling patterns
- [ ] Confirmed songs array is available as prop
- [ ] Located countdown timer implementation for reference

**Dependencies**: None
**Parallel Safe**: Yes (can run concurrently with Task 1.2)

---

### Task 1.2: Verify Song Duration Data Structure

**Description**: Confirm song data model includes duration field from feature 005.

**Location**: Examine songs array structure in browser DevTools or code

**What to Review**:
- Song object shape: `{id, title, tempo, key, duration: {minutes, seconds}, stages}`
- Verify all 12 songs have duration field
- Check default duration values (should be {minutes: 0, seconds: 0})

**Acceptance Criteria**:
- [ ] Confirmed song.duration exists with {minutes, seconds} structure
- [ ] Verified duration field is present on all songs
- [ ] Identified data flow: songs array → Header component prop

**Dependencies**: None
**Parallel Safe**: Yes (can run concurrently with Task 1.1)

---

## Phase 2: Foundational Implementation

**Goal**: Add helper function and calculation logic

### Task 2.1: Add formatTotalDuration Helper Function

**Description**: Create pure function to format total minutes as display string with adaptive format.

**Location**: `src/App.jsx` (near top, before components, ~line 110 after existing helper functions)

**Implementation**:
```javascript
// Helper function to format total album duration
const formatTotalDuration = (totalMinutes) => {
  if (totalMinutes >= 59940) return "999h+"; // Cap at 999 hours

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};
```

**Test Cases** (manual verification in console):
- `formatTotalDuration(0)` → `"0m"`
- `formatTotalDuration(45)` → `"45m"`
- `formatTotalDuration(60)` → `"1h"`
- `formatTotalDuration(83)` → `"1h 23m"`
- `formatTotalDuration(120)` → `"2h"`
- `formatTotalDuration(60000)` → `"999h+"`

**Acceptance Criteria**:
- [ ] Function added before Header component definition
- [ ] Returns string in adaptive format (Xm vs Xh Ym)
- [ ] Omits zero minutes for exact hours
- [ ] Caps at "999h+" for unrealistic values
- [ ] Manual console tests pass

**Dependencies**: None
**Parallel Safe**: Yes (independent helper function)

**Reference**: `specs/006-total-album-duration/contracts/component-api.md:17-76`

---

## Phase 3: User Story 1 - View Total Album Duration (P1 - MVP)

**Goal**: Display calculated total duration in Header component

**User Story**: As a user, I want to see the total running time of all songs combined, displayed prominently in the summary banner alongside the album release countdown, so I can quickly see how long the album is without needing to manually calculate it.

**Independent Test**: Can be fully tested by viewing the summary banner and verifying the total duration displays correctly as the sum of all song durations. Delivers immediate value by showing total album length.

---

### Task 3.1: Add Total Duration Calculation with useMemo

**Description**: Add memoized calculation in Header component to sum all song durations.

**Location**: `src/App.jsx` - Header component (after existing state/hooks, ~line 330)

**Implementation**:
```javascript
// Calculate total album duration (memoized)
const totalDuration = useMemo(() => {
  const totalSeconds = songs.reduce((acc, song) => {
    if (!song.duration) return acc; // Handle missing duration field

    const minutes = Math.max(0, song.duration.minutes || 0);
    const seconds = Math.max(0, song.duration.seconds || 0);
    const songSeconds = (minutes * 60) + seconds;

    return acc + songSeconds;
  }, 0);

  return Math.floor(totalSeconds / 60); // Return total minutes
}, [songs]);
```

**Acceptance Criteria**:
- [ ] useMemo hook added in Header component
- [ ] Dependency array includes `[songs]` only
- [ ] Calculation sums all song durations correctly
- [ ] Handles missing/invalid duration fields (treats as 0:00)
- [ ] Returns total minutes as integer

**Dependencies**: Task 2.1 (formatTotalDuration exists)
**Parallel Safe**: No (sequential after Task 2.1)

**Reference**: `specs/006-total-album-duration/data-model.md:44-66`

---

### Task 3.2: [US1] Display Total Duration in Header Component

**Description**: Replace song count display with formatted total duration.

**Location**: `src/App.jsx` - Header component JSX (~line 342-344)

**Implementation**:
Replace the current song count display:
```javascript
// OLD (line 342-344):
<div className="text-2xl font-black tracking-wider">
  {eligibleCount(songs, 90)}/13
</div>

// NEW:
<div className="text-2xl font-black tracking-wider">
  {formatTotalDuration(totalDuration)}
</div>
```

**Acceptance Criteria**:
- [ ] Song count display removed
- [ ] Total duration display added in same location
- [ ] Formatting uses formatTotalDuration() helper
- [ ] Styling matches existing Header elements (text-2xl, font-black, tracking-wider)
- [ ] Display appears between album title and countdown timer

**Dependencies**: Task 3.1
**Parallel Safe**: No (sequential after Task 3.1)

**Reference**: `specs/006-total-album-duration/contracts/component-api.md:117-145`

---

### Task 3.3: [US1] Manual Test - Display Mode

**Description**: Verify total duration displays correctly with default and varied song durations.

**Test Guide**: `specs/006-total-album-duration/quickstart.md:17-48`

**Test Scenarios**:
- All songs at 0:00: verify displays "0m"
- Set songs to various durations totaling <60 minutes: verify "Xm" format
- Verify total accuracy matches sum of individual song durations
- Check responsive layout (desktop and mobile)
- Verify styling matches other Header elements

**Acceptance Criteria**:
- [ ] Default "0m" displays for all zero durations
- [ ] Calculation accuracy: total matches sum of all song durations
- [ ] Format is correct for <60 minutes ("Xm")
- [ ] Display location is correct (center of Header)
- [ ] Styling is consistent with Header elements

**Dependencies**: Task 3.2
**Parallel Safe**: No (must verify after Task 3.2)

**Reference**: `specs/006-total-album-duration/quickstart.md:17-48`

---

## Phase 4: User Story 2 - Real-Time Duration Updates (P2)

**Goal**: Ensure total updates immediately when song durations change

**User Story**: As a user, I want to see the total album duration update immediately when I edit any individual song's duration, providing instant feedback on how changes affect the overall album length.

**Independent Test**: Can be tested by editing a song duration and verifying the total updates without page refresh. Delivers value by showing immediate impact of duration changes.

---

### Task 4.1: [US2] Manual Test - Real-Time Updates

**Description**: Verify total duration updates immediately when individual song durations are edited.

**Test Guide**: `specs/006-total-album-duration/quickstart.md:129-158`

**Test Scenarios**:
- Edit song duration and save: verify total updates without page refresh
- Edit multiple songs in quick succession: verify cumulative updates
- Cancel edit with Escape: verify total remains unchanged
- Verify countdown timer continues updating smoothly during edits

**Acceptance Criteria**:
- [ ] Total updates immediately when song duration saved
- [ ] Multiple rapid edits all reflect correctly in total
- [ ] Canceled edits don't affect total
- [ ] No performance lag or UI stutter during updates
- [ ] useMemo prevents unnecessary recalculation (only on songs change)

**Dependencies**: Task 3.2 (display implemented)
**Parallel Safe**: No (requires completed display)

**Reference**: `specs/006-total-album-duration/quickstart.md:129-158`

**Note**: This user story is automatically satisfied by the useMemo implementation in Task 3.1. The useMemo dependency on `songs` ensures automatic real-time updates. This test verifies the behavior works as designed.

---

## Phase 5: User Story 3 - Duration Format Display Options (P3)

**Goal**: Verify adaptive format works for different album lengths

**User Story**: As a user, I want to see the total duration formatted appropriately based on album length - showing hours and minutes for longer albums, or just minutes for shorter albums, ensuring the display is always clear and appropriate for the context.

**Independent Test**: Can be tested by setting various total durations and verifying the format adapts appropriately (e.g., "45m" vs "1h 15m"). Delivers value through clearer presentation.

---

### Task 5.1: [US3] Manual Test - Format Adaptation

**Description**: Verify format switches correctly between minutes-only and hours+minutes based on total duration.

**Test Guide**: `specs/006-total-album-duration/quickstart.md:217-256`

**Test Scenarios**:
- <60 minutes total: verify "Xm" format (e.g., "45m")
- ≥60 minutes with remainder: verify "Xh Ym" format (e.g., "1h 23m")
- Exact hours (e.g., 60, 120 minutes): verify "Xh" format without "0m"
- Test format matrix covering 0m, 10m, 59m, 60m (1h), 61m (1h 1m), 90m (1h 30m), 120m (2h), 135m (2h 15m)

**Acceptance Criteria**:
- [ ] Format is "Xm" for totals under 60 minutes
- [ ] Format is "Xh Ym" for totals ≥60 minutes with remainder
- [ ] Format is "Xh" for exact hours (omits "0m")
- [ ] All test matrix rows display correctly
- [ ] Format is readable and appropriate for each duration length

**Dependencies**: Task 3.2 (display implemented)
**Parallel Safe**: No (requires completed display)

**Reference**: `specs/006-total-album-duration/quickstart.md:217-256`

**Note**: This user story is automatically satisfied by the formatTotalDuration() implementation in Task 2.1. The adaptive formatting logic is built into the helper function. This test verifies the behavior works across all duration ranges.

---

## Phase 6: Final Testing and Validation

**Goal**: Comprehensive testing and edge case verification

---

### Task 6.1: Manual Test - Edge Cases and Persistence

**Description**: Verify edge cases and data persistence across page refresh.

**Test Guide**: `specs/006-total-album-duration/quickstart.md:159-335`

**Test Scenarios**:
- Empty album (all zero durations): verify "0m"
- Missing duration fields: verify graceful handling (treated as 0:00)
- Negative durations (if somehow present): verify clamped to 0
- Very large totals: verify cap at "999h+" (if testable)
- Page refresh: verify total persists correctly (derived from saved songs)
- Export/import: verify total recalculates from imported data

**Acceptance Criteria**:
- [ ] Empty album displays "0m"
- [ ] Missing duration fields handled gracefully
- [ ] Invalid durations don't crash application
- [ ] Total persists across page refresh
- [ ] Total recalculates correctly after import

**Dependencies**: Task 5.1
**Parallel Safe**: No (final comprehensive test)

**Reference**: `specs/006-total-album-duration/quickstart.md:159-335`

---

## Task Dependencies

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1 - MVP) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Final Tests)
     ↓                  ↓                        ↓                   ↓               ↓
  T001-T002          T003                   T004-T006           T007            T008          T009
  (Parallel)       (Helper)               (MVP Display)    (Real-time)      (Format)      (Edge Cases)
```

### Task Execution Flow

**Sequential Dependencies**:
- Phase 2 must complete before Phase 3 (helper function needed)
- Phase 3 must complete before Phase 4 and Phase 5 (display must exist)
- Phase 6 runs after all user stories complete (final validation)

**Parallel Opportunities**:
- T001 and T002 can run in parallel (independent code reviews)
- T003 can be written in parallel with T001-T002 (pure function, no dependencies)

---

## Parallel Execution Examples

### Per User Story

**User Story 1 (P1 - MVP)**:
- T001, T002, T003 can run in parallel initially
- T004 → T005 → T006 must run sequentially

**User Story 2 (P2)**:
- T007 is test-only, runs after US1 complete
- No implementation tasks (real-time updates automatic via useMemo)

**User Story 3 (P3)**:
- T008 is test-only, runs after US1 complete
- No implementation tasks (adaptive formatting automatic via helper function)

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

**Phase 1-3 Only** (Tasks T001-T006):
- Setup and foundational work
- User Story 1: Basic total duration display
- Delivers core value: users can see total album length

**MVP Deliverables**:
- formatTotalDuration() helper function
- useMemo calculation in Header component
- Total duration display in Header (replaces song count)
- Basic manual testing

**MVP Test Criteria**:
- Total duration displays correctly
- Calculation is accurate (sum of all song durations)
- Format is appropriate (<60m vs ≥60m)

### Full Feature Scope

**Phases 1-6** (All tasks):
- All user stories (P1, P2, P3)
- Comprehensive edge case testing
- Full format adaptation verification
- Performance and persistence validation

---

## Summary

**Total Tasks**: 10
**Implementation Tasks**: 3 (T003, T004, T005)
**Test Tasks**: 5 (T006, T007, T008, T009, plus T001-T002 review)
**Estimated Effort**: 1-2 hours for experienced React developer

**Task Distribution by Phase**:
- Phase 1 (Setup): 2 tasks
- Phase 2 (Foundation): 1 task
- Phase 3 (User Story 1 - P1 MVP): 3 tasks
- Phase 4 (User Story 2 - P2): 1 task (test only)
- Phase 5 (User Story 3 - P3): 1 task (test only)
- Phase 6 (Final Testing): 1 task

**Parallel Opportunities**: 2
1. Phase 1: Tasks T001 and T002 (code review)
2. Phase 2: Task T003 can overlap with Phase 1 (pure helper function)

**Critical Path** (sequential dependencies):
- Phase 2 Task T003 (helper function)
- Phase 3 Task T004 → T005 → T006 (calculation → display → test)

**MVP Milestone**: Complete through Phase 3 (User Story 1)
**Full Feature**: Complete through Phase 6

---

## Next Steps

1. **Start Implementation**: Begin with Phase 1 tasks (review existing code)
2. **MVP First**: Focus on completing Phases 1-3 for first delivery
3. **Manual Testing**: Follow quickstart.md for each test phase
4. **Incremental Delivery**: User Story 1 (display) → User Story 2 (verify real-time) → User Story 3 (verify format)

**Ready to implement!** All design decisions documented, tasks are concrete and executable.
