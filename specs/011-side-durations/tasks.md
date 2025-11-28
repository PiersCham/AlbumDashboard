# Implementation Tasks: Per-Side Running Times

**Feature**: 011-side-durations | **Branch**: `011-side-durations` | **Date**: 2025-11-28

## Overview

**Total Tasks**: 12
**Estimated Time**: 15-20 minutes
**Lines of Code**: ~35-40 LOC

**Parallel Opportunities**:
- None - all tasks are sequential in a single file (src/App.jsx)

---

## Phase 1: Setup

**Purpose**: No setup needed - feature builds on existing code from Features 002, 008, and 010

**Status**: ✅ COMPLETE (prerequisites already implemented)

---

## Phase 2: Foundational

**Purpose**: No foundational tasks needed - all dependencies are already in place

**Required Dependencies** (already complete):
- Feature 002: `duration` field (`{minutes, seconds}`)
- Feature 008: `isDraft` boolean field
- Feature 010: `side` field ("", "1", "2")
- Helper functions: `formatDuration(minutes, seconds)` exists at App.jsx:101

**Status**: ✅ COMPLETE (no blocking prerequisites)

---

## Phase 3: User Story 1 - View Total Duration Per Side (Priority: P1) 🎯 MVP

**Goal**: Users can see the total running time for songs assigned to Side 1 and Side 2, allowing them to understand the overall length of each side of their album.

**Independent Test**: Assign songs with various durations to Side 1 and Side 2, then verify that the displayed totals accurately sum the durations for each side. Test that draft songs are excluded from calculations.

**Success Criteria**:
- Side 1 and Side 2 totals display below album title
- Totals show "0:00" when no non-draft songs are assigned to a side
- Draft songs are excluded from duration calculations
- Duration math is accurate (e.g., 3:30 + 4:15 = 7:45)
- Totals update within 500ms when song data changes

### Implementation for User Story 1

- [X] T001 [US1] Add `calculateSideDuration` helper function in src/App.jsx after line 123
  - **Location**: After `formatTotalDuration` function
  - **Code**: Filter songs by `side === sideValue && !song.isDraft`, convert to seconds, sum, convert back to `{minutes, seconds}`
  - **Acceptance**: Function returns correct duration object for any side value
  - **Test**: Browser console test with sample songs array

- [X] T002 [US1] Add `sideTotals` useMemo hook in src/App.jsx after line 1571
  - **Location**: Inside App component, after `currentSong` definition
  - **Code**: `useMemo(() => ({ side1: calculateSideDuration(songs, "1"), side2: calculateSideDuration(songs, "2") }), [songs])`
  - **Acceptance**: Hook recalculates when songs array changes
  - **Test**: Add console.log, verify output in browser

- [X] T003 [US1] Add side duration display to dashboard header in src/App.jsx around line 1667
  - **Location**: Inside album title container, after EditableText component
  - **Code**: Add flex container with two spans showing Side 1 and Side 2 durations using `formatDuration`
  - **Acceptance**: Two duration totals visible below album title
  - **Test**: Reload app, verify totals appear

- [ ] T004 [US1] Test draft song exclusion
  - **Setup**: Assign song to Side 1 (duration 3:00), mark as draft
  - **Acceptance**: Side 1 total shows 0:00 (excludes draft)
  - **Test**: Mark as non-draft → total updates to 3:00

- [ ] T005 [US1] Test duration calculation accuracy
  - **Setup**: Side 1: Assign 2 songs (3:30, 4:15)
  - **Acceptance**: Side 1 displays 7:45
  - **Test**: Side 2: Assign 2 songs (2:45, 1:30) → displays 4:15

- [ ] T006 [US1] Test real-time updates
  - **Setup**: Change song duration from 3:00 to 5:00
  - **Acceptance**: Total updates within 500ms
  - **Test**: Change song side (1 → 2) → both totals update

- [ ] T007 [US1] Test edge cases
  - **Test 1**: Total exceeds 60 minutes → displays as "75:30" (not "1:15:30")
  - **Test 2**: Song with 0:00 duration → contributes nothing, no errors
  - **Test 3**: No songs on side → displays "0:00"

**Checkpoint**: User Story 1 complete - users can view accurate side duration totals

---

## Phase 4: User Story 2 - Understand Side Balance (Priority: P2)

**Goal**: Users can quickly assess whether their album sides are balanced in length by comparing the totals side-by-side with clear visual distinction.

**Independent Test**: Create albums with balanced sides (both ~20 minutes) and unbalanced sides (one 15 minutes, one 30 minutes), then verify users can quickly identify the balance status through the visual presentation.

**Success Criteria**:
- Side 1 and Side 2 totals are positioned next to the total album duration
- Side 1 uses blue color (matching side badge from Feature 010)
- Side 2 uses purple color (matching side badge from Feature 010)
- Font is non-bold to show relative importance compared to total duration
- Totals are horizontally aligned with proper spacing for easy comparison

### Implementation for User Story 2

- [X] T008 [US2] Apply blue color styling to Side 1 total in src/App.jsx
  - **Location**: Side 1 span element in dashboard header
  - **Code**: Add className with `text-blue-400` (matches Side 1 badge color)
  - **Acceptance**: Side 1 text displays in blue
  - **Test**: Visual verification in browser

- [X] T009 [US2] Apply purple color styling to Side 2 total in src/App.jsx
  - **Location**: Side 2 span element in dashboard header
  - **Code**: Add className with `text-purple-400` (matches Side 2 badge color)
  - **Acceptance**: Side 2 text displays in purple
  - **Test**: Visual verification in browser

- [X] T010 [US2] Position side totals next to total album duration in src/App.jsx
  - **Location**: Refine placement in dashboard header layout
  - **Code**: Adjust flex container to position side totals adjacent to existing total duration display
  - **Acceptance**: Side totals appear next to (not below) the total album duration
  - **Test**: Visual verification of layout

- [ ] T011 [US2] Test visual balance comparison
  - **Setup**: Create Side 1: 20:00, Side 2: 20:30
  - **Acceptance**: User can easily compare totals side-by-side
  - **Test**: Create Side 1: 15:00, Side 2: 30:00 → significant difference is apparent

**Checkpoint**: User Story 2 complete - users can quickly assess side balance

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, code quality, and documentation

- [ ] T012 Run validation checklist from quickstart.md
  - **Items**: 15 manual tests covering all scenarios (calculation, draft exclusion, visual styling)
  - **Acceptance**: All 15 checklist items pass
  - **Test**: Follow quickstart.md validation checklist systematically

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup → ✅ COMPLETE (no tasks needed)
    ↓
Phase 2: Foundational → ✅ COMPLETE (dependencies already in place)
    ↓
Phase 3: User Story 1 (P1) → T001 → T002 → T003 → T004 → T005 → T006 → T007
    ↓
Phase 4: User Story 2 (P2) → T008 → T009 → T010 → T011
    ↓
Phase 5: Polish → T012
```

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - can start immediately
  - Delivers core functionality: calculation and display of side totals
  - MVP-ready after this phase

- **User Story 2 (P2)**: Depends on User Story 1 completion
  - Enhances visual presentation from US1
  - Adds color coding and improved layout
  - Can be skipped initially, US1 delivers value alone

### Critical Path

**T001 → T002 → T003 → T008 → T009 → T010 → T012**

All tasks are sequential (single file, same components).

### Parallel Opportunities

**None** - All tasks modify the same file (src/App.jsx) and build on each other sequentially. This is a small feature with minimal code changes (~35 LOC).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Add calculation function
2. Complete T002: Add useMemo hook
3. Complete T003: Add display to header
4. **STOP and VALIDATE**: Run T004-T007 tests
5. **Deploy/demo if ready** - Core value delivered!

**Time to MVP**: ~10 minutes

### Full Feature (User Stories 1 + 2)

1. Complete MVP (User Story 1)
2. Add T008-T011: Visual enhancements (colors, layout)
3. Run T012: Full validation checklist

**Time to completion**: ~15-20 minutes

### Sequential Implementation (Recommended)

Since all tasks are in one file:

1. T001-T003: Core implementation (5-7 minutes)
2. T004-T007: Functional testing (3-5 minutes)
3. T008-T011: Visual enhancements (3-5 minutes)
4. T012: Final validation (3-5 minutes)

---

## Testing Notes

**Manual Test Scenarios** (from quickstart.md):

### Basic Functionality (T004-T007)

1. **Valid calculation**: Side 1 with (3:30, 4:15) → Displays 7:45
2. **Draft exclusion**: Draft song on Side 1 (3:00) → Side 1 shows 0:00
3. **Real-time updates**: Change duration → Total updates within 500ms
4. **Seconds overflow**: Songs (2:45, 1:30) → Shows 4:15 (not 3:75)
5. **Zero duration**: Song with 0:00 → Contributes nothing, no errors
6. **Empty side**: No songs on Side 2 → Displays 0:00
7. **Exceeds 60 min**: Total 75 min 30 sec → Displays "75:30"

### Visual Balance (T011)

8. **Balanced sides**: Side 1: 20:00, Side 2: 20:30 → Easy to compare
9. **Unbalanced sides**: Side 1: 15:00, Side 2: 30:00 → Difference is apparent
10. **Color coding**: Side 1 blue, Side 2 purple → Matches badge colors
11. **Layout**: Totals positioned next to total album duration → Clear hierarchy

**Browser Console Test Script** (from quickstart.md):

```javascript
// Test calculation function
const testSongs = [
  { side: "1", isDraft: false, duration: { minutes: 3, seconds: 30 } },
  { side: "1", isDraft: false, duration: { minutes: 4, seconds: 15 } },
  { side: "1", isDraft: true, duration: { minutes: 10, seconds: 0 } }  // Should be excluded
];

const result = calculateSideDuration(testSongs, "1");
console.assert(result.minutes === 7 && result.seconds === 45, 'Expected 7:45');
console.log('✅ All tests passed!');
```

---

## Risk Mitigation

| Risk | Impact | Likelihood | Mitigation | Task |
|------|--------|-----------|------------|------|
| Incorrect duration math (seconds overflow) | Medium | Low | Manual testing + console verification | T005 |
| Draft filter inconsistency | Medium | Low | Reuse proven pattern from Feature 009 | T004 |
| Performance degradation | Low | Very Low | useMemo optimization, O(n) complexity | T002 |
| UI layout disruption | Low | Low | Test in browser before commit | T010 |

---

## Success Metrics (from spec.md)

**Verification Checklist**:

- [ ] **SC-001**: Users can view per-side duration totals within 1 second of loading the dashboard
  - **Test**: Reload app, measure time to display → Should be <1s

- [ ] **SC-002**: Duration totals update within 500ms of changing a song's side assignment or duration
  - **Test**: DevTools Performance tab → Re-render <500ms

- [ ] **SC-003**: 100% of duration calculations are mathematically accurate (no rounding errors visible to user)
  - **Test**: Run browser console tests (T005)

- [ ] **SC-004**: Users can distinguish between Side 1, Side 2, and unassigned totals at a glance
  - **Test**: Visual inspection (T011) - color coding, clear labels

- [ ] **SC-005**: System correctly handles albums with totals exceeding 60 minutes per side
  - **Test**: Create side with 75+ minutes → Displays "75:30" format (T007)

---

## Related Documentation

- [Feature Spec](./spec.md) - User stories and requirements
- [Implementation Plan](./plan.md) - Technical approach
- [Data Model](./data-model.md) - Calculation logic
- [Research](./research.md) - Design decisions
- [Quickstart Guide](./quickstart.md) - Step-by-step instructions with detailed tests

---

## Code Locations Reference

| Component | File | Line Range (approx) | Purpose |
|-----------|------|---------------------|---------|
| calculateSideDuration | App.jsx | ~125-137 | Calculate side total helper (T001) |
| sideTotals useMemo | App.jsx | ~1573-1576 | Memoized side totals (T002) |
| Dashboard header | App.jsx | ~1667-1680 | Display location for totals (T003, T008-T010) |

---

## Implementation Summary

**Files Modified**: 1
- `src/App.jsx` (~35 LOC added)

**New Functions**: 1
- `calculateSideDuration(songs, sideValue)` - Pure function for duration calculation

**New Hooks**: 1
- `sideTotals` useMemo - Derived state for real-time totals

**UI Changes**: 1
- Dashboard header: Side duration display with color coding

**Dependencies**: 3 existing features
- Feature 002: `duration` field
- Feature 008: `isDraft` field
- Feature 010: `side` field

**No Schema Changes**: Zero persistence impact, all computed values

---

**Tasks Status**: Ready for implementation
**Next Command**: Begin implementation following task order T001 → T012
