# Tasks: Draft Song Status

**Feature**: 008-draft-song-status
**Branch**: `008-draft-song-status`
**Date**: 2025-11-21
**Status**: Not Started

---

## Task Overview

**Total Tasks**: 6
**Phases**: 4
**Parallel Opportunities**: 1 (zoom view checkbox can be added in parallel with manual testing)

**Prioritization**: Tasks organized by user story priority (P1 → P2) to enable MVP-first development.

---

## Phase 1: Setup and Review

**Goal**: Understand existing codebase patterns before making changes

### Task 1.1: Review Existing Song Data Structure

**Description**: Examine the current Song entity structure to understand where isDraft field will be added.

**Location**: `src/App.jsx` (DEFAULT_SONGS constant and Song type)

**What to Review**:
- DEFAULT_SONGS array structure
- Song object properties (id, title, tempo, key, duration, stages)
- How songs array is initialized and updated
- Existing useEffect for localStorage persistence

**Acceptance Criteria**:
- [X] Identified Song object structure in DEFAULT_SONGS
- [X] Located songs state variable (useState)
- [X] Located existing useEffect for localStorage persistence
- [X] Confirmed backward compatibility approach (isDraft defaults to false if missing)

**Dependencies**: None
**Parallel Safe**: Yes (can run concurrently with Task 1.2)

**Checklist**:
- [X] T001 Review Song entity structure in src/App.jsx

---

### Task 1.2: Review Total Album Duration Calculation

**Description**: Examine feature 006's total duration calculation to understand where draft filter will be added.

**Location**: `src/App.jsx` (Header component, useMemo for totalDuration)

**What to Review**:
- useMemo dependency array (songs)
- Reduce operation summing song durations
- Formatting logic (hours/minutes)
- Where to insert filter for draft songs

**Acceptance Criteria**:
- [X] Located totalDuration useMemo calculation
- [X] Understood reduce operation for summing durations
- [X] Identified insertion point for draft filter (before reduce)
- [X] Confirmed useMemo will recalculate on draft toggle (songs dependency)

**Dependencies**: None
**Parallel Safe**: Yes (can run concurrently with Task 1.1)

**Checklist**:
- [X] T002 [P] Review total duration calculation in src/App.jsx

---

## Phase 2: User Story 1 & 2 - Mark Song as Draft with Persistence (P1 - MVP)

**Goal**: Implement core draft checkbox functionality with visual feedback and persistence

**User Stories**:
- US1: Mark Song as Draft
- US2: Draft Status Persistence

**Why Combined**: US1 and US2 are tightly coupled - draft toggle and persistence happen in same update cycle. Separating would create incomplete functionality.

**Independent Test**: Can be fully tested by clicking checkbox, verifying greyed-out appearance, checking total duration exclusion, and confirming persistence across page refresh and export/import.

---

### Task 2.1: Extend Song Entity with isDraft Field

**Description**: Add isDraft boolean field to DEFAULT_SONGS and ensure backward compatibility.

**Location**: `src/App.jsx` (DEFAULT_SONGS constant)

**Implementation**:
```javascript
const DEFAULT_SONGS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Song ${i + 1}`,
  stages: DEFAULT_STAGE_NAMES.map((name) => ({ name, value: 0 })),
  tempo: DEFAULT_TEMPO,
  key: null,
  duration: { minutes: 0, seconds: 0 },
  isDraft: false, // NEW FIELD - default to non-draft
}));
```

**Acceptance Criteria**:
- [X] isDraft field added to DEFAULT_SONGS
- [X] Default value set to false (new songs start as non-draft)
- [X] Field added to all 12 song objects

**Dependencies**: Task 1.1 (understand song structure)
**Parallel Safe**: No (sequential after Task 1.1)

**Reference**: `specs/008-draft-song-status/data-model.md:14-46`

**Checklist**:
- [X] T003 [US1] Add isDraft field to DEFAULT_SONGS in src/App.jsx

---

### Task 2.2: Modify Total Duration Calculation to Filter Draft Songs

**Description**: Add filter operation to exclude draft songs before summing durations.

**Location**: `src/App.jsx` (Header component or App component where totalDuration is calculated)

**Implementation**:
```javascript
const totalDuration = useMemo(() => {
  // NEW: Filter out draft songs
  const nonDraftSongs = songs.filter(song => !song.isDraft);

  // Existing duration sum logic
  const totalSeconds = nonDraftSongs.reduce((acc, song) => {
    return acc + (song.duration.minutes * 60) + song.duration.seconds;
  }, 0);

  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${minutes}m`;
}, [songs]);
```

**Acceptance Criteria**:
- [X] Filter operation added before reduce
- [X] Defensive check handles missing isDraft field (!song.isDraft treats undefined as false)
- [X] useMemo dependency remains [songs] (triggers recalc on draft toggle)
- [X] Duration calculation logic unchanged (only filtered input)

**Dependencies**: Task 1.2 (understand total duration calc)
**Parallel Safe**: Yes (can be done in parallel with Task 2.1 if using branches)

**Reference**: `specs/008-draft-song-status/contracts/component-api.md:110-134`

**Checklist**:
- [X] T004 [P] [US1] Add draft filter to total duration calculation in src/App.jsx

---

### Task 2.3: Add Draft Checkbox to SongCard Component

**Description**: Add checkbox UI element to SongCard component with onChange handler.

**Location**: `src/App.jsx` (SongCard component definition)

**Implementation**:

**1. Add handleDraftToggle handler inside SongCard component**:
```javascript
function SongCard({ song, onUpdate, onZoom, index, ... }) {
  // ... existing state variables ...

  const handleDraftToggle = (event) => {
    const newIsDraft = event.target.checked;
    onUpdate({ ...song, isDraft: newIsDraft });
  };

  // ... existing handlers ...

  return (
    <div
      className={`
        ... existing classes ...
        ${song.isDraft ? 'opacity-60' : ''}
      `}
      // ... existing drag attributes ...
    >
      {/* NEW: Draft checkbox in top-right corner */}
      <div className="absolute top-2 right-2 z-10">
        <input
          type="checkbox"
          checked={song.isDraft || false}
          onChange={handleDraftToggle}
          className="w-4 h-4 cursor-pointer"
          title="Mark as draft"
        />
      </div>

      {/* Existing SongCard content */}
    </div>
  );
}
```

**Acceptance Criteria**:
- [X] Checkbox added to SongCard wrapper (absolute positioned top-right)
- [X] handleDraftToggle handler wired to onChange
- [X] checked attribute uses defensive check (song.isDraft || false)
- [X] Checkbox has title tooltip ("Mark as draft")
- [X] Checkbox accessible via keyboard (Tab + Space)

**Dependencies**: Task 2.1 (isDraft field exists)
**Parallel Safe**: No (requires Task 2.1 complete)

**Reference**: `specs/008-draft-song-status/contracts/component-api.md:131-161`

**Checklist**:
- [X] T005 [US1] Add draft checkbox UI to SongCard component in src/App.jsx

---

### Task 2.4: Apply Opacity Styling to Draft Song Cards

**Description**: Add conditional className to SongCard wrapper to apply opacity-60 when isDraft is true.

**Location**: `src/App.jsx` (SongCard component wrapper div)

**Implementation**:
```javascript
<div
  className={`
    bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm p-2 flex flex-col gap-2 h-[295px] w-[376px]
    ${song.isDraft ? 'opacity-60' : ''}
    ${isDraggingSong ? 'opacity-50' : ''}
    ${isDropTargetSong ? 'border-t-2 border-amber-500' : ''}
  `}
  draggable={true}
  onDragStart={(e) => onDragStart(e, index)}
  onDragOver={(e) => onDragOver(e, index)}
  onDrop={(e) => onDrop(e, index)}
  onDragEnd={onDragEnd}
>
```

**Note**: This may be combined with Task 2.3 since both modify the SongCard wrapper div.

**Acceptance Criteria**:
- [X] opacity-60 class applied when song.isDraft === true
- [X] Full opacity (100%) when song.isDraft === false or undefined
- [X] Opacity applies to entire card (title, tempo, key, duration, stages)
- [X] Drag opacity (opacity-50) takes precedence during drag operation

**Dependencies**: Task 2.3 (checkbox exists to toggle isDraft)
**Parallel Safe**: No (should be done together with Task 2.3)

**Reference**: `specs/008-draft-song-status/contracts/component-api.md:44-72`

**Checklist**:
- [X] T006 [US1] Apply opacity-60 conditional styling to SongCard wrapper in src/App.jsx

---

### Task 2.5: Manual Test - Draft Toggle and Persistence

**Description**: Verify draft checkbox toggles status, applies greyed-out styling, excludes from total duration, and persists across refresh and export/import.

**Test Guide**: `specs/008-draft-song-status/quickstart.md:17-163`

**Test Scenarios**:
1. Click checkbox, verify card greyed-out (opacity-60)
2. Verify total duration decreases by song's duration
3. Uncheck checkbox, verify card returns to normal
4. Mark multiple songs, verify all greyed and excluded from total
5. Refresh page, verify draft status persists
6. Export data, verify isDraft field in JSON
7. Clear localStorage, import data, verify draft status restored

**Acceptance Criteria**:
- [ ] Checkbox toggles draft status (checked/unchecked)
- [ ] Draft cards appear greyed-out (60% opacity)
- [ ] Total duration excludes draft songs correctly
- [ ] Draft status persists across page refresh
- [ ] isDraft field appears in exported JSON
- [ ] Draft status restores correctly on import

**Dependencies**: Tasks 2.3, 2.4, 2.6 (all US1 implementation complete)
**Parallel Safe**: No (must verify after all implementation tasks)

**Reference**: `specs/008-draft-song-status/quickstart.md:17-163`

**Checklist**:
- [ ] T007 [US1] [US2] Manual test - draft toggle, visual feedback, duration exclusion, and persistence

---

### Task 2.6: Add Draft Checkbox to SongDetail Zoom View

**Description**: Add synchronized draft checkbox to SongDetail modal component.

**Location**: `src/App.jsx` (SongDetail component)

**Implementation**:
```javascript
function SongDetail({ song, onUpdate, onClose }) {
  const handleDraftToggle = (event) => {
    onUpdate({ ...song, isDraft: event.target.checked });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{song.title}</h2>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={song.isDraft || false}
                onChange={handleDraftToggle}
                className="w-4 h-4 cursor-pointer"
              />
              <span>Draft</span>
            </label>
            <button onClick={onClose} className="text-xl">✕</button>
          </div>
        </div>
        {/* Song details */}
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- [X] Checkbox added to SongDetail modal header
- [X] Checkbox state synced with song.isDraft
- [X] onChange calls onUpdate (same pattern as grid view)
- [X] Changes in zoom view reflect in grid view immediately

**Dependencies**: Task 2.3 (understand checkbox pattern)
**Parallel Safe**: Yes (different component, can be added in parallel with Task 2.5 testing)

**Reference**: `specs/008-draft-song-status/contracts/component-api.md:238-274`

**Checklist**:
- [X] T008 [P] [US1] [US2] Add draft checkbox to SongDetail zoom view in src/App.jsx

---

## Phase 3: User Story 3 - Visual Feedback Refinement (P2)

**Goal**: Verify and refine visual distinction between draft and finalized songs

**User Story**: US3 - Visual Feedback

**Independent Test**: Can be tested by marking songs as draft and verifying the visual distinction is immediately clear and consistent.

**Note**: Visual feedback (opacity-60) is already implemented in Task 2.4. This phase focuses on manual testing and refinement if needed.

---

### Task 3.1: Manual Test - Visual Feedback Clarity

**Description**: Verify greyed-out styling is clear, consistent, and immediately obvious.

**Test Guide**: `specs/008-draft-song-status/quickstart.md:165-230`

**Test Scenarios**:
1. Mark song as draft, verify entire card greyed (opacity-60)
2. Verify all card elements greyed (title, tempo, key, duration, stages)
3. Compare draft song next to normal song, verify distinction obvious
4. Verify text remains readable (60% opacity maintains contrast)
5. Test rapid toggle, verify smooth visual transitions (no flickering)

**Acceptance Criteria**:
- [ ] Draft card opacity is 60% (clearly greyed but readable)
- [ ] All card elements (text, progress bars) have uniform opacity
- [ ] Visual distinction between draft and normal is immediately obvious
- [ ] No visual glitches during toggle (smooth transition)
- [ ] Performance: visual feedback appears within 100ms (<16ms actual)

**Dependencies**: Task 2.4 (opacity styling implemented)
**Parallel Safe**: No (requires completed visual implementation)

**Reference**: `specs/008-draft-song-status/quickstart.md:287-313`

**Checklist**:
- [ ] T009 [US3] Manual test - visual feedback clarity and consistency

---

## Phase 4: Edge Cases and Final Testing

**Goal**: Comprehensive edge case testing and backward compatibility validation

---

### Task 4.1: Manual Test - Edge Cases and Backward Compatibility

**Description**: Verify edge cases handle gracefully and backward compatibility works correctly.

**Test Guide**: `specs/008-draft-song-status/quickstart.md:232-313`

**Test Scenarios**:

**Edge Cases**:
1. Mark all 12 songs as draft, verify total duration = "0m"
2. Rapid checkbox clicking (10 times), verify smooth toggle
3. Inline editing (title, tempo, key, duration) on draft song, verify editable
4. Drag-and-drop draft song, verify status persists after reorder
5. Draft song in zoom view, toggle checkbox, verify grid view syncs

**Backward Compatibility**:
6. Import old data without isDraft field, verify defaults to false (non-draft)
7. Verify all songs appear normal (not greyed-out) after old import
8. Verify total duration includes all songs after old import

**Performance**:
9. Checkbox response time (<100ms from click to visual feedback)
10. Total duration update (<100ms from toggle to duration change)

**Acceptance Criteria**:
- [ ] All songs draft = total duration "0m" (no error)
- [ ] Rapid clicking handles smoothly (no state corruption)
- [ ] Draft songs remain fully editable (all inline editing works)
- [ ] Draft status persists during and after drag-and-drop
- [ ] Zoom view checkbox syncs with grid view bidirectionally
- [ ] Old data without isDraft defaults to non-draft correctly
- [ ] Total duration correct after old data import
- [ ] Checkbox response <100ms (feels instant)
- [ ] Total duration recalc <100ms (imperceptible)

**Dependencies**: All previous tasks complete
**Parallel Safe**: No (final comprehensive test)

**Reference**: `specs/008-draft-song-status/quickstart.md:232-313`

**Checklist**:
- [ ] T010 Manual test - edge cases, backward compatibility, and performance

---

## Task Dependencies

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (US1 + US2 - MVP) → Phase 3 (US3 - Visual) → Phase 4 (Edge Cases)
     ↓                        ↓                           ↓                      ↓
  T001-T002              T003-T008                     T009                   T010
  (Parallel)         (MVP Implementation)        (Visual Test)          (Final Validation)
```

### Task Execution Flow

**Sequential Dependencies**:
- Phase 2 must complete after Phase 1 (understand codebase first)
- Phase 2 tasks are mostly sequential: T003 → T004 (parallel) → T005/T006 → T007
- Phase 3 must complete after Phase 2 (visual feedback requires implementation)
- Phase 4 runs after Phase 3 (final validation)

**Parallel Opportunities**:
1. T001 and T002 can run in parallel (independent code reviews)
2. T004 can run in parallel with T003 (if using feature branches, otherwise sequential)
3. T008 (zoom view) can run in parallel with T007 (manual testing of grid view)

---

## Parallel Execution Examples

### Per User Story

**User Story 1 & 2 (P1 - MVP)**:
- T001, T002 can run in parallel initially (code review)
- T003 must complete first (add isDraft field)
- T004 can run in parallel with T003 (different code sections)
- T005, T006 must complete after T003 (require isDraft field)
- T007 waits for T005, T006 complete
- T008 can run in parallel with T007 (zoom view independent of grid testing)

**User Story 3 (P2)**:
- T009 is test-only, runs after US1/US2 complete
- No implementation tasks (visual feedback already in T006)

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

**Phase 1-2 Only** (Tasks T001-T008):
- Setup and review existing code
- User Stories 1 & 2: Draft checkbox with persistence
- Delivers core value: users can mark songs as draft, see visual feedback, and have status persist

**MVP Deliverables**:
- isDraft field added to Song entity
- Draft checkbox on SongCard (grid view)
- Opacity-60 greyed-out styling
- Total duration excludes draft songs
- Automatic localStorage persistence
- Draft checkbox in SongDetail (zoom view)
- Export/import compatibility

**MVP Test Criteria**:
- Songs can be marked/unmarked as draft via checkbox
- Draft songs appear greyed-out (opacity-60)
- Total duration excludes draft songs
- Draft status persists across page refresh
- Draft status included in export/import

### Full Feature Scope

**Phases 1-4** (All tasks):
- All user stories (US1, US2, US3)
- Comprehensive edge case testing
- Backward compatibility validation
- Performance verification

---

## Summary

**Total Tasks**: 10
**Implementation Tasks**: 5 (T003, T004, T005, T006, T008)
**Test Tasks**: 3 (T007, T009, T010)
**Review Tasks**: 2 (T001, T002)
**Estimated Effort**: 1-2 hours for experienced React developer

**Task Distribution by Phase**:
- Phase 1 (Setup): 2 tasks (code review)
- Phase 2 (User Stories 1 & 2 - P1 MVP): 6 tasks (data model, checkbox UI, styling, testing, zoom view)
- Phase 3 (User Story 3 - P2): 1 task (visual feedback validation)
- Phase 4 (Final Testing): 1 task (edge cases and backward compatibility)

**Parallel Opportunities**: 3
1. Phase 1: Tasks T001 and T002 (code review)
2. Phase 2: Task T004 can be parallel with T003 (different sections)
3. Phase 2: Task T008 can be parallel with T007 (zoom view vs grid testing)

**Critical Path** (sequential dependencies):
- Phase 1 Tasks T001/T002 (code review)
- Phase 2 Task T003 → T005/T006 → T007 (data model → UI → testing)

**MVP Milestone**: Complete through Phase 2 (User Stories 1 & 2)
**Full Feature**: Complete through Phase 4 (all user stories + edge case testing)

---

## Next Steps

1. **Start Implementation**: Begin with Phase 1 tasks (review existing code patterns)
2. **MVP First**: Focus on completing Phases 1-2 for first delivery
3. **Manual Testing**: Follow quickstart.md for each test phase
4. **Incremental Delivery**: US1/US2 (core draft functionality) → US3 (visual refinement) → Final edge case testing

**Ready to implement!** All design decisions documented, tasks are concrete and executable.
