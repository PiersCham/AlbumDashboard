# Research: Draft-Aware Song Count and Progress

**Feature**: 009-draft-song-count
**Date**: 2025-11-21
**Purpose**: Document key technical decisions for filtering draft songs from metrics

---

## Decision 1: Filter Location (Before vs After Calculation)

**Decision**: Filter songs array **before** passing to calculation functions

**Rationale**:
- Cleaner separation of concerns: filter once, calculate on clean subset
- Performance: Single filter pass instead of conditional checks in loops
- Readability: `albumAverage(nonDraftSongs)` vs `albumAverage(songs, {ignoreDrafts: true})`
- Consistency: Matches existing pattern in `totalDuration` calculation (feature 008)

**Alternatives Considered**:
1. **Filter inside calculation functions** - Rejected because it couples draft logic to averaging logic, violates single responsibility
2. **Conditional in reduce/map** - Rejected for performance (checks isDraft on every iteration vs once upfront)
3. **Separate draft-aware function** - Rejected for complexity (creates `albumAverage()` and `albumAverageNonDraft()` duplication)

**Implementation Impact**:
```javascript
// BEFORE (includes drafts)
albumAverage(songs)

// AFTER (excludes drafts)
const nonDraftSongs = songs.filter(song => !song.isDraft);
albumAverage(nonDraftSongs)
```

---

## Decision 2: Song Count Display Format

**Decision**: Modify existing "X/13" display to show "X/Y" where X = completed non-draft songs, Y = total non-draft songs

**Rationale**:
- Provides accurate scope visibility: users see how many active songs exist
- Maintains existing display format (no UI redesign)
- Denominator (Y) now dynamic based on draft count
- Numerator (X) already filters by eligibleCount() threshold (90%)

**Alternatives Considered**:
1. **Keep denominator as 13** - Rejected because misleading (implies 13 songs when some are draft)
2. **Add separate draft indicator** - Rejected for simplicity (violates constitution - minimal UI changes)
3. **Show "X non-draft / Y total"** - Rejected for verbosity (doesn't fit existing compact layout)

**Implementation Impact**:
```javascript
// BEFORE (hardcoded denominator)
{eligibleCount(songs, 90)}/13

// AFTER (dynamic non-draft count)
{eligibleCount(nonDraftSongs, 90)}/{nonDraftSongs.length}
```

---

## Decision 3: Overall Progress Calculation Method

**Decision**: Calculate average of non-draft songs' individual averages (equal weighting)

**Rationale**:
- Matches existing `albumAverage()` logic (no behavior change, just filtered input)
- Equal weighting per song aligns with user mental model (each song is one step)
- Simple to understand and verify manually
- Performance: O(n) where n = number of non-draft songs (< 1ms for 12 songs)

**Alternatives Considered**:
1. **Weighted by song duration** - Rejected for complexity (requires additional calculation, unclear user benefit)
2. **Weighted by stage count** - Rejected because users don't think in terms of stage count
3. **Total progress across all stages** - Rejected for inconsistency with existing album average logic

**Implementation Impact**:
```javascript
// BEFORE (includes draft songs in average)
function albumAverage(songs) {
  if (!songs.length) return 0;
  const sum = songs.reduce((a, s) => a + songAverage(s), 0);
  return Math.round(sum / songs.length);
}

// AFTER (receives pre-filtered non-draft songs)
// Function signature unchanged, caller filters before passing
const nonDraftSongs = songs.filter(song => !song.isDraft);
albumAverage(nonDraftSongs); // Same function, different input
```

---

## Decision 4: Edge Case - All Songs Draft

**Decision**: Display "0/0" for song count and "0%" for overall progress

**Rationale**:
- Mathematically correct: zero non-draft songs = zero count
- Avoids division by zero (albumAverage returns 0 when songs.length === 0)
- Clear signal to user that no active songs exist
- No special error state needed (existing code handles empty array gracefully)

**Alternatives Considered**:
1. **Display message "No active songs"** - Rejected for simplicity (requires conditional rendering logic)
2. **Display "--" or "N/A"** - Rejected because inconsistent with numeric display pattern
3. **Hide metrics entirely** - Rejected because removes useful visual feedback

**Implementation Impact**:
```javascript
// Existing code already handles this:
function albumAverage(songs) {
  if (!songs.length) return 0; // Already returns 0 for empty array
  // ...
}

// Display: "0/0" when nonDraftSongs.length === 0
// Display: "0%" when albumAverage([]) === 0
```

---

## Decision 5: Performance Optimization Strategy

**Decision**: No additional memoization beyond existing useMemo in Header component

**Rationale**:
- Filter operation on 12 songs: ~0.5ms (negligible)
- albumAverage() already fast: O(n) with n ≤ 12
- React's existing useMemo on totalDuration triggers on songs array change (includes draft status)
- Adding more memoization violates simplicity principle without measurable benefit

**Alternatives Considered**:
1. **Memoize nonDraftSongs separately** - Rejected for premature optimization (no performance issue)
2. **useMemo for albumAverage result** - Rejected because already recalculates efficiently on render
3. **Cache filter results** - Rejected for added complexity (cache invalidation logic needed)

**Performance Validation**:
- Filter 12 songs: < 1ms
- Calculate average of 12 songs: < 1ms
- Total: < 2ms (well under 100ms budget from SC-001, SC-004)

**Implementation Impact**:
No additional memoization code needed. Rely on React's existing render cycle optimization.

---

## Decision 6: Rounding Strategy for Progress Percentage

**Decision**: Use `Math.round()` for standard rounding (0.5 rounds up)

**Rationale**:
- Matches existing `albumAverage()` implementation
- Standard JavaScript rounding (no custom logic)
- Aligns with user expectation (50.5% → 51%)
- Consistent with spec requirement (FR-009: round to nearest whole number)

**Alternatives Considered**:
1. **Math.floor() (always round down)** - Rejected because pessimistic (underestimates progress)
2. **Math.ceil() (always round up)** - Rejected because optimistic (overestimates progress)
3. **Custom rounding (banker's rounding)** - Rejected for unnecessary complexity

**Implementation Impact**:
No code change needed - `albumAverage()` already uses `Math.round()`.

---

## Decision 7: Display Update Timing

**Decision**: Leverage React's automatic re-rendering when songs array changes

**Rationale**:
- No manual update triggers needed
- Draft status toggle → updateSong → setSongs → React re-render → recalculated metrics
- Existing pattern from feature 008 (draft toggle already triggers re-render)
- Meets SC-001, SC-003 (immediate visual feedback, no page refresh)

**Alternatives Considered**:
1. **useEffect to manually update** - Rejected for unnecessary complexity (React already handles this)
2. **Debounce updates** - Rejected because creates lag (violates <100ms budget)
3. **Force re-render with forceUpdate** - Rejected for anti-pattern (React handles declaratively)

**Implementation Impact**:
No additional update logic needed. Existing React state management sufficient.

---

## Decision 8: Backward Compatibility with Feature 008

**Decision**: Assume isDraft field exists on all song objects (via feature 008 migration)

**Rationale**:
- Feature 008 already migrates missing isDraft to false
- No need for additional defensive checks (`song.isDraft || false`)
- Simpler code: `songs.filter(song => !song.isDraft)` vs `songs.filter(song => !(song.isDraft || false))`
- Feature 009 depends on feature 008 being merged (documented in dependencies)

**Alternatives Considered**:
1. **Add defensive check** - Rejected for redundancy (feature 008 already handles this)
2. **Validate isDraft field** - Rejected for unnecessary validation (migration ensures field exists)

**Implementation Impact**:
Clean filter logic without defensive checks:
```javascript
const nonDraftSongs = songs.filter(song => !song.isDraft);
```

---

## Decision 9: Song Count Metric Location

**Decision**: Modify eligibleCount() display in Header component (line 375)

**Rationale**:
- Existing hardcoded "/13" denominator needs to become dynamic
- Numerator already uses eligibleCount() function (counts songs ≥90% complete)
- Only display change needed, no new components or layout shifts

**Alternatives Considered**:
1. **Add new metric display** - Rejected for simplicity (reuse existing layout)
2. **Move to separate component** - Rejected for violating single-file SPA pattern
3. **Add tooltip explanation** - Rejected for over-engineering (display is self-explanatory)

**Implementation Impact**:
```javascript
// BEFORE
<div className="text-2xl font-black tracking-wider">
  {eligibleCount(songs, 90)}/13
</div>

// AFTER
<div className="text-2xl font-black tracking-wider">
  {eligibleCount(nonDraftSongs, 90)}/{nonDraftSongs.length}
</div>
```

---

## Decision 10: Overall Progress Metric Location

**Decision**: Modify albumAverage() call in album-wide progress bar (line 1559)

**Rationale**:
- Existing progress bar already displays albumAverage(songs)
- Only need to filter songs before passing to function
- No UI changes, no new components

**Alternatives Considered**:
1. **Create new albumAverageNonDraft() function** - Rejected for code duplication
2. **Add parameter to albumAverage()** - Rejected for unnecessary API change
3. **Create separate progress display** - Rejected for simplicity (reuse existing)

**Implementation Impact**:
```javascript
// BEFORE
<ProgressBar value={albumAverage(songs)} height="h-9" />
<span>{albumAverage(songs)}%</span>

// AFTER
const nonDraftSongs = songs.filter(song => !song.isDraft);
<ProgressBar value={albumAverage(nonDraftSongs)} height="h-9" />
<span>{albumAverage(nonDraftSongs)}%</span>
```

---

## Summary

**Key Decisions**:
1. Filter before calculation (not inside functions)
2. Dynamic "X/Y" song count (both values based on non-draft songs)
3. Equal weighting per song (no duration/stage weighting)
4. "0/0" and "0%" for all-draft edge case
5. No additional memoization needed
6. Standard Math.round() for percentages
7. React's automatic re-render for updates
8. Trust feature 008 migration (no defensive isDraft checks)
9. Modify existing eligibleCount display
10. Pass filtered songs to existing albumAverage()

**No Unresolved Questions**: All technical decisions documented with clear rationale.

**Ready for Phase 1**: Data model and API contracts can now be defined.
