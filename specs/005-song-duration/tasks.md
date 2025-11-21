# Tasks: Song Duration Tracking

**Feature**: 005-song-duration
**Branch**: `005-song-duration`
**Date**: 2025-11-21
**Status**: Not Started

---

## Task Overview

**Total Tasks**: 17
**Phases**: 6
**Parallel Opportunities**: 2 (helper functions can be written in parallel with code review)

**Prioritization**: Tasks organized by user story priority (P1 → P2 → P3) to enable MVP-first development.

---

## Phase 1: Setup and Discovery

**Goal**: Understand existing codebase patterns before making changes

### Task 1.1: Review Existing Inline Edit Patterns

**Description**: Study how Tempo and Key editing currently work to ensure duration editing follows identical patterns.

**Location**: `src/App.jsx`

**What to Review**:
- Tempo editing: Lines ~396-450 (SongCard component)
- Key editing: Lines ~450-500 (SongCard component)
- State management patterns (isEditingTempo, isEditingKey)
- Event handler naming conventions
- onUpdate callback usage
- Styling classes for edit mode vs display mode

**Acceptance Criteria**:
- [ ] Identified state variables used for Tempo/Key editing
- [ ] Documented event handler patterns (onClick, onBlur, onKeyDown)
- [ ] Noted Tailwind classes used for inputs in edit mode
- [ ] Confirmed onUpdate callback signature

**Dependencies**: None
**Parallel Safe**: Yes (can run concurrently with Task 1.2)

---

### Task 1.2: Verify DEFAULT_SONGS Structure

**Description**: Examine the DEFAULT_SONGS constant to understand current song data structure before adding duration field.

**Location**: `src/App.jsx` (top of file, ~lines 1-100)

**What to Review**:
- Current song object shape (id, title, tempo, key, stages)
- How default values are set for optional fields (e.g., key can be null)
- Number of default songs (should be 12)

**Acceptance Criteria**:
- [ ] Confirmed song object structure
- [ ] Identified all required vs optional fields
- [ ] Located where DEFAULT_SONGS is used in initialization

**Dependencies**: None
**Parallel Safe**: Yes (can run concurrently with Task 1.1)

---

## Phase 2: Foundational Implementation

**Goal**: Add helper functions and extend data model

### Task 2.1: Add formatDuration Helper Function

**Description**: Create pure function to convert duration object to display string (M:SS format).

**Location**: `src/App.jsx` (near top, before components, ~line 150)

**Implementation**:
```javascript
const formatDuration = (minutes, seconds) => {
  const mins = Math.floor(minutes);
  const secs = Math.floor(seconds);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

**Test Cases** (manual verification in console):
- `formatDuration(3, 45)` → `"3:45"`
- `formatDuration(0, 5)` → `"0:05"` (leading zero on seconds)
- `formatDuration(12, 0)` → `"12:00"`
- `formatDuration(5.7, 8.9)` → `"5:08"` (floored)

**Acceptance Criteria**:
- [ ] Function added before component definitions
- [ ] Returns string in M:SS format
- [ ] Seconds padded with leading zero when < 10
- [ ] Minutes not padded (single digit OK)
- [ ] Manual console tests pass

**Dependencies**: None
**Parallel Safe**: Yes (independent of other tasks)

**Reference**: `specs/005-song-duration/data-model.md:125-129`, `specs/005-song-duration/contracts/component-api.md:68-73`

---

### Task 2.2: Add validateDuration Helper Function

**Description**: Create validation function to clamp minutes and seconds to 0-59 range.

**Location**: `src/App.jsx` (immediately after formatDuration, ~line 157)

**Implementation**:
```javascript
const validateDuration = (minutes, seconds) => {
  const clampedMins = Math.max(0, Math.min(59, Math.floor(parseInt(minutes) || 0)));
  const clampedSecs = Math.max(0, Math.min(59, Math.floor(parseInt(seconds) || 0)));
  return { minutes: clampedMins, seconds: clampedSecs };
};
```

**Test Cases** (manual verification in console):
- `validateDuration(45, 30)` → `{ minutes: 45, seconds: 30 }`
- `validateDuration(75, 90)` → `{ minutes: 59, seconds: 59 }` (clamped)
- `validateDuration(-5, -10)` → `{ minutes: 0, seconds: 0 }` (clamped)
- `validateDuration("3", "45")` → `{ minutes: 3, seconds: 45 }` (parsed)
- `validateDuration("abc", "")` → `{ minutes: 0, seconds: 0 }` (NaN → 0)

**Acceptance Criteria**:
- [ ] Function added after formatDuration
- [ ] Returns DurationObject {minutes, seconds}
- [ ] Clamps values to 0-59 range
- [ ] Handles non-numeric input gracefully (treats as 0)
- [ ] Handles empty strings (treats as 0)
- [ ] Manual console tests pass

**Dependencies**: None
**Parallel Safe**: Yes (independent of other tasks)

**Reference**: `specs/005-song-duration/data-model.md:131-136`, `specs/005-song-duration/contracts/component-api.md:108-113`

---

### Task 2.3: Extend DEFAULT_SONGS with Duration Field

**Description**: Add `duration: { minutes: 0, seconds: 0 }` to all songs in DEFAULT_SONGS constant.

**Location**: `src/App.jsx` (DEFAULT_SONGS constant, ~lines 1-100)

**Implementation**:
Add `duration: { minutes: 0, seconds: 0 },` to each song object after the `key` field and before `stages`.

**Example**:
```javascript
{
  id: 1,
  title: "Echoes of Time",
  tempo: 140,
  key: "D Minor",
  duration: { minutes: 0, seconds: 0 },  // NEW
  stages: [...]
}
```

**Acceptance Criteria**:
- [ ] All 12 songs have duration field added
- [ ] Default value is `{ minutes: 0, seconds: 0 }`
- [ ] Placement is after `key` and before `stages`
- [ ] App still loads without errors
- [ ] All songs display "Duration: 0:00" in UI (once Phase 3 tasks complete)

**Dependencies**: None (but pairs with Task 2.4)
**Parallel Safe**: No (must be done before Phase 3)

**Reference**: `specs/005-song-duration/data-model.md:42-68`, `specs/005-song-duration/research.md:142-160`

---

### Task 2.4: Add Backward Compatibility for Existing Songs

**Description**: Ensure existing songs without duration field get default value on load.

**Location**: `src/App.jsx` (useEffect hook that loads songs from localStorage, ~line 200-220)

**Implementation**:
In the song loading logic, add duration field if missing:

```javascript
const loadedSongs = JSON.parse(localStorage.getItem('albumDashboard_songs')) || DEFAULT_SONGS;
const songsWithDuration = loadedSongs.map(song => ({
  ...song,
  duration: song.duration || { minutes: 0, seconds: 0 }
}));
setSongs(songsWithDuration);
```

**Acceptance Criteria**:
- [ ] Songs loaded from localStorage without duration get default {minutes: 0, seconds: 0}
- [ ] Songs with existing duration field are unchanged
- [ ] No localStorage migration script needed (lazy initialization)
- [ ] Test by loading app with old localStorage data (if available)

**Dependencies**: Task 2.3 (DEFAULT_SONGS must have duration)
**Parallel Safe**: No (sequential after Task 2.3)

**Reference**: `specs/005-song-duration/data-model.md:286-294`, `specs/005-song-duration/research.md:135-139`

---

## Phase 3: User Story 1 - Display Mode (P1 - MVP)

**Goal**: Display duration in read-only mode on song cards

**User Story**: As a user, I want to view the duration (minutes and seconds) of each song directly on the song card, positioned next to the Tempo attribute, so I can quickly see how long each song is without needing to open the detail view.

---

### Task 3.1: Add Duration Display to SongCard Component

**Description**: Add read-only duration display next to Tempo attribute in SongCard component.

**Location**: `src/App.jsx` - SongCard component (~line 450, after Tempo display)

**Implementation**:
Add after the Tempo line (before stages):

```javascript
<div className="flex items-center gap-2">
  <label className="text-neutral-400">Duration:</label>
  <span className="text-neutral-300">
    {formatDuration(song.duration.minutes, song.duration.seconds)}
  </span>
</div>
```

**Acceptance Criteria**:
- [ ] Duration label appears after Tempo on same line
- [ ] Displays default "0:00" for all songs initially
- [ ] Format is M:SS (e.g., "3:45")
- [ ] Text color matches Tempo display (neutral-300)
- [ ] Label color matches other labels (neutral-400)
- [ ] No console errors on render

**Dependencies**: Tasks 2.1, 2.3, 2.4 (formatDuration exists, songs have duration field)
**Parallel Safe**: No (sequential after Phase 2)

**Reference**: `specs/005-song-duration/spec.md:36-50` (User Story 1), `specs/005-song-duration/contracts/component-api.md:181-191`

---

### Task 3.2: Manual Test - Display Mode

**Description**: Verify duration displays correctly for all songs using quickstart.md Test 1.

**Test Guide**: `specs/005-song-duration/quickstart.md:15-36`

**Test Scenarios**:
- All 12 song cards show "Duration: 0:00"
- Format is M:SS with leading zero on seconds
- Duration appears next to Tempo attribute
- No layout issues or misalignment

**Acceptance Criteria**:
- [ ] All songs display default "Duration: 0:00"
- [ ] Format matches M:SS standard
- [ ] Placement is correct (after Tempo)
- [ ] No visual regressions on song card layout

**Dependencies**: Task 3.1
**Parallel Safe**: No (must verify after Task 3.1)

**Reference**: `specs/005-song-duration/quickstart.md:15-36`

---

## Phase 4: User Story 2 - Edit Duration (P2)

**Goal**: Allow users to click and edit duration with inline inputs

**User Story**: As a user, I want to click on the duration value to edit both minutes and seconds using dedicated input fields, with Enter to save and Escape to cancel, so I can accurately record the length of each song.

---

### Task 4.1: Add Duration Edit State to SongCard Component

**Description**: Add state variables for duration edit mode in SongCard component.

**Location**: `src/App.jsx` - SongCard component state declarations (~line 400)

**Implementation**:
Add state variables after existing edit states (isEditingTempo, isEditingKey):

```javascript
const [isEditingDuration, setIsEditingDuration] = useState(false);
const [tempMinutes, setTempMinutes] = useState("");
const [tempSeconds, setTempSeconds] = useState("");
```

**Acceptance Criteria**:
- [ ] Three new state variables added
- [ ] Placement is after existing edit states
- [ ] Initial values are correct (false, "", "")
- [ ] No console errors on component mount

**Dependencies**: Task 3.1 (display mode implemented)
**Parallel Safe**: No (sequential after Phase 3)

**Reference**: `specs/005-song-duration/data-model.md:119-123`, `specs/005-song-duration/contracts/component-api.md:133-139`

---

### Task 4.2: Add Duration Edit Event Handlers to SongCard

**Description**: Implement event handlers for duration editing (save, cancel, keydown, label click).

**Location**: `src/App.jsx` - SongCard component handlers (~line 450)

**Implementation**:
Add handlers after existing Tempo/Key handlers:

```javascript
const handleDurationLabelClick = () => {
  setTempMinutes(song.duration.minutes.toString());
  setTempSeconds(song.duration.seconds.toString());
  setIsEditingDuration(true);
};

const handleDurationSave = () => {
  const validated = validateDuration(
    parseInt(tempMinutes),
    parseInt(tempSeconds)
  );
  onUpdate({ ...song, duration: validated });
  setIsEditingDuration(false);
};

const handleDurationCancel = () => {
  setTempMinutes("");
  setTempSeconds("");
  setIsEditingDuration(false);
};

const handleDurationKeyDown = (e) => {
  if (e.key === 'Enter') handleDurationSave();
  else if (e.key === 'Escape') handleDurationCancel();
};
```

**Acceptance Criteria**:
- [ ] All four handlers implemented
- [ ] handleDurationLabelClick populates temp values from song.duration
- [ ] handleDurationSave validates and calls onUpdate
- [ ] handleDurationCancel reverts without saving
- [ ] handleDurationKeyDown handles Enter and Escape keys
- [ ] No console errors when handlers fire

**Dependencies**: Task 4.1 (state variables exist)
**Parallel Safe**: No (sequential after Task 4.1)

**Reference**: `specs/005-song-duration/data-model.md:138-164`, `specs/005-song-duration/contracts/component-api.md:144-175`

---

### Task 4.3: Add Duration Edit Mode UI to SongCard

**Description**: Replace static duration display with conditional rendering (display mode vs edit mode).

**Location**: `src/App.jsx` - SongCard component JSX (~line 500, where Task 3.1 added display)

**Implementation**:
Replace the duration display from Task 3.1 with:

```javascript
<div className="flex items-center gap-2">
  {!isEditingDuration ? (
    <>
      <label
        className="text-neutral-400 cursor-pointer hover:underline"
        onClick={handleDurationLabelClick}
      >
        Duration:
      </label>
      <span
        className="text-neutral-300 cursor-pointer"
        onClick={handleDurationLabelClick}
      >
        {formatDuration(song.duration.minutes, song.duration.seconds)}
      </span>
    </>
  ) : (
    <>
      <label className="text-neutral-400">Duration:</label>
      <div className="flex gap-1 items-center">
        <input
          type="text"
          value={tempMinutes}
          onChange={(e) => setTempMinutes(e.target.value)}
          onBlur={handleDurationSave}
          onKeyDown={handleDurationKeyDown}
          autoFocus
          className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-12 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="M"
        />
        <span className="text-neutral-400">:</span>
        <input
          type="text"
          value={tempSeconds}
          onChange={(e) => setTempSeconds(e.target.value)}
          onBlur={handleDurationSave}
          onKeyDown={handleDurationKeyDown}
          className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-12 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="SS"
        />
      </div>
    </>
  )}
</div>
```

**Acceptance Criteria**:
- [ ] Display mode shows clickable label and value
- [ ] Edit mode shows two separate input fields (minutes, seconds)
- [ ] Clicking label or value activates edit mode
- [ ] Minutes input has autoFocus
- [ ] Both inputs handle onChange, onBlur, onKeyDown
- [ ] Styling matches existing Tempo/Key inputs
- [ ] Colon separator visible between inputs

**Dependencies**: Task 4.2 (event handlers exist)
**Parallel Safe**: No (sequential after Task 4.2)

**Reference**: `specs/005-song-duration/contracts/component-api.md:179-219`

---

### Task 4.4: Manual Test - Edit Duration (Valid Input)

**Description**: Test duration editing with valid values using quickstart.md Tests 3-5.

**Test Guide**: `specs/005-song-duration/quickstart.md:63-154`

**Test Scenarios**:
- Click "Duration:" to activate edit mode
- Enter valid minutes and seconds (e.g., "3" and "45")
- Save with Enter key
- Save with blur (click outside)
- Cancel with Escape key
- Verify persistence after page refresh

**Acceptance Criteria**:
- [ ] Edit mode activates on click (label or value)
- [ ] Valid inputs save correctly (e.g., "3:45")
- [ ] Enter key saves and exits edit mode
- [ ] Blur auto-saves changes
- [ ] Escape cancels without saving
- [ ] Changes persist after page refresh (localStorage)

**Dependencies**: Task 4.3
**Parallel Safe**: No (must verify after Task 4.3)

**Reference**: `specs/005-song-duration/quickstart.md:63-154`

---

### Task 4.5: Manual Test - Validation (Clamping and Edge Cases)

**Description**: Test validation rules using quickstart.md Tests 6-9, 12, 15, 18.

**Test Guide**: `specs/005-song-duration/quickstart.md:133-435`

**Test Scenarios**:
- Enter out-of-range minutes (e.g., "99" → clamps to "59")
- Enter out-of-range seconds (e.g., "90" → clamps to "59")
- Enter negative values (e.g., "-5" → clamps to "0")
- Enter non-numeric input (e.g., "abc" → treats as "0")
- Enter decimal values (e.g., "3.7" → floors to "3")
- Test empty fields (treated as "0")
- Test maximum duration "59:59"

**Acceptance Criteria**:
- [ ] Minutes > 59 clamp to 59
- [ ] Seconds > 59 clamp to 59
- [ ] Negative values clamp to 0
- [ ] Non-numeric input treated as 0 (no errors)
- [ ] Decimal values floored to integers
- [ ] Empty fields treated as 0
- [ ] Maximum duration 59:59 saves correctly
- [ ] No error messages or crashes

**Dependencies**: Task 4.3
**Parallel Safe**: Yes (can run concurrently with Task 4.4)

**Reference**: `specs/005-song-duration/quickstart.md:133-435`

---

### Task 4.6: Manual Test - Keyboard Navigation and Accessibility

**Description**: Test keyboard shortcuts and tab navigation using quickstart.md Tests 2, 10.

**Test Guide**: `specs/005-song-duration/quickstart.md:39-245`

**Test Scenarios**:
- Click duration to edit, verify minutes field has focus
- Press Tab to move from minutes to seconds
- Press Shift+Tab to move back to minutes
- Press Tab from seconds to exit edit (auto-save)
- Test Enter to save
- Test Escape to cancel

**Acceptance Criteria**:
- [ ] Minutes field auto-focused on edit activation
- [ ] Tab moves forward (minutes → seconds → next element)
- [ ] Shift+Tab moves backward (seconds → minutes)
- [ ] Tab out of seconds field auto-saves
- [ ] Enter key saves from any field
- [ ] Escape key cancels from any field

**Dependencies**: Task 4.3
**Parallel Safe**: Yes (can run concurrently with Task 4.4 and 4.5)

**Reference**: `specs/005-song-duration/quickstart.md:39-245`

---

## Phase 5: User Story 3 - Detail View Consistency (P3)

**Goal**: Ensure duration editing works identically in SongDetail modal

**User Story**: As a user, I want to view and edit song duration in the zoomed detail view (SongDetail modal) with the same functionality as the grid view, so I have a consistent experience regardless of which view I'm using.

---

### Task 5.1: Add Duration Edit State to SongDetail Component

**Description**: Mirror duration edit state from SongCard in SongDetail component.

**Location**: `src/App.jsx` - SongDetail component state declarations (~line 620)

**Implementation**:
Add identical state variables as Task 4.1:

```javascript
const [isEditingDuration, setIsEditingDuration] = useState(false);
const [tempMinutes, setTempMinutes] = useState("");
const [tempSeconds, setTempSeconds] = useState("");
```

**Acceptance Criteria**:
- [ ] Three state variables added (identical to SongCard)
- [ ] Placement is with other SongDetail state variables
- [ ] Initial values match SongCard (false, "", "")

**Dependencies**: Task 4.3 (SongCard implementation complete)
**Parallel Safe**: No (sequential after Phase 4)

**Reference**: `specs/005-song-duration/data-model.md:169-181`, `specs/005-song-duration/contracts/component-api.md:239-246`

---

### Task 5.2: Add Duration Edit Event Handlers to SongDetail

**Description**: Copy duration event handlers from SongCard to SongDetail (identical implementation).

**Location**: `src/App.jsx` - SongDetail component handlers (~line 650)

**Implementation**:
Copy all four handlers from Task 4.2 exactly as implemented in SongCard.

**Acceptance Criteria**:
- [ ] All four handlers copied (handleDurationLabelClick, handleDurationSave, handleDurationCancel, handleDurationKeyDown)
- [ ] Implementation is identical to SongCard
- [ ] No modifications needed (same logic applies)

**Dependencies**: Task 5.1
**Parallel Safe**: No (sequential after Task 5.1)

**Reference**: `specs/005-song-duration/contracts/component-api.md:239-246`

---

### Task 5.3: Add Duration Edit Mode UI to SongDetail

**Description**: Copy duration display/edit UI from SongCard to SongDetail component.

**Location**: `src/App.jsx` - SongDetail component JSX (~line 700, after Tempo display)

**Implementation**:
Copy the exact JSX from Task 4.3 (display mode + edit mode conditional rendering).

**Acceptance Criteria**:
- [ ] Duration display/edit UI added after Tempo
- [ ] Implementation is identical to SongCard
- [ ] Same styling classes used
- [ ] Same event handlers attached

**Dependencies**: Task 5.2
**Parallel Safe**: No (sequential after Task 5.2)

**Reference**: `specs/005-song-duration/contracts/component-api.md:223-246`

---

### Task 5.4: Manual Test - SongDetail Consistency

**Description**: Verify duration editing works identically in detail view using quickstart.md Test 11.

**Test Guide**: `specs/005-song-duration/quickstart.md:248-276`

**Test Scenarios**:
- Open Zoom view (click Zoom button on song card)
- Verify duration displays with same format as grid view
- Edit duration in detail view (e.g., "5:45")
- Close detail view and verify grid shows updated value
- Edit in grid view, open detail view, verify sync

**Acceptance Criteria**:
- [ ] Duration displays correctly in SongDetail modal
- [ ] Edit functionality works identically to SongCard
- [ ] Changes in detail view reflected in grid view
- [ ] Changes in grid view reflected in detail view
- [ ] No visual differences between views

**Dependencies**: Task 5.3
**Parallel Safe**: No (must verify after Task 5.3)

**Reference**: `specs/005-song-duration/quickstart.md:248-276`

---

## Phase 6: Final Testing and Polish

**Goal**: Comprehensive testing and edge case verification

---

### Task 6.1: Manual Test - Complete Test Suite

**Description**: Run all 18 test scenarios from quickstart.md to ensure comprehensive coverage.

**Test Guide**: `specs/005-song-duration/quickstart.md:15-495`

**Test Checklist** (from quickstart.md:438-461):
- [ ] Test 1: Default duration "0:00" shows for all songs
- [ ] Test 2: Click on label or value activates edit mode
- [ ] Test 3: Valid input saves correctly
- [ ] Test 4: Blur auto-saves
- [ ] Test 5: Escape cancels
- [ ] Test 6-7: Out-of-range values clamped (minutes, seconds)
- [ ] Test 8: Non-numeric input handled gracefully
- [ ] Test 9: Leading zero formatting (seconds < 10)
- [ ] Test 10: Tab navigation works
- [ ] Test 11: SongDetail consistency
- [ ] Test 12: Empty fields treated as 0
- [ ] Test 13: Partial edits preserve unchanged field
- [ ] Test 14: Rapid edits (multiple songs)
- [ ] Test 15: Decimal input handling
- [ ] Test 16: Export/import includes duration
- [ ] Test 17: Backward compatibility
- [ ] Test 18: Edge case 59:59

**Acceptance Criteria**:
- [ ] All 18 tests pass
- [ ] No console errors during any test
- [ ] Summary checklist complete (all items checked)

**Dependencies**: All previous tasks (comprehensive final test)
**Parallel Safe**: No (must be done after all implementation complete)

**Reference**: `specs/005-song-duration/quickstart.md:15-495`

---

### Task 6.2: Verify Export/Import with Duration

**Description**: Test JSON export/import functionality includes duration field using quickstart.md Test 16.

**Test Guide**: `specs/005-song-duration/quickstart.md:376-395`

**Test Scenarios**:
- Set durations on multiple songs (e.g., "3:30", "4:15", "2:00")
- Export to JSON using existing export feature
- Open JSON file and verify duration field present
- Import JSON back into app
- Verify all durations restored correctly

**Acceptance Criteria**:
- [ ] Exported JSON includes `duration: {minutes: N, seconds: NN}` for each song
- [ ] Import restores duration values correctly
- [ ] No data loss during export/import cycle

**Dependencies**: Task 5.4 (all implementation complete)
**Parallel Safe**: Yes (can run concurrently with Task 6.1)

**Reference**: `specs/005-song-duration/quickstart.md:376-395`

---

## Summary

**Total Tasks**: 17
**Estimated Effort**: 3-4 hours for experienced React developer

**Task Distribution by Phase**:
- Phase 1 (Setup): 2 tasks
- Phase 2 (Foundation): 4 tasks
- Phase 3 (User Story 1 - P1 MVP): 2 tasks
- Phase 4 (User Story 2 - P2): 6 tasks
- Phase 5 (User Story 3 - P3): 4 tasks
- Phase 6 (Testing): 2 tasks

**Parallel Opportunities**:
1. Phase 1: Tasks 1.1 and 1.2 can run in parallel
2. Phase 2: Tasks 2.1 and 2.2 can run in parallel (helper functions)
3. Phase 4: Tasks 4.4, 4.5, 4.6 (manual tests) can run in parallel
4. Phase 6: Tasks 6.1 and 6.2 can overlap

**Critical Path** (sequential dependencies):
- Phase 2 Task 2.3 → Task 2.4 (data model)
- Phase 3 Task 3.1 → Task 3.2 (display mode)
- Phase 4 Task 4.1 → 4.2 → 4.3 (edit mode)
- Phase 5 Task 5.1 → 5.2 → 5.3 → 5.4 (detail view)
- Phase 6 Task 6.1 (final verification)

**MVP Milestone**: Complete through Phase 3 (Display Mode only)
**Full Feature**: Complete through Phase 6

---

## Next Steps

1. **Start Implementation**: Begin with Phase 1 tasks (review existing code)
2. **Use `/speckit.implement`**: Execute this task list automatically
3. **Manual Testing**: Follow quickstart.md for each test phase
4. **Commit Strategy**: Commit after each phase (6 commits total)

**Ready to implement!** All design decisions documented, no unresolved questions.
