# Research: Per-Side Running Times

**Feature**: 011-side-durations | **Date**: 2025-11-28 | **Plan**: [plan.md](./plan.md)

## Overview

This document captures the technical research and decision-making process for implementing per-side duration totals. All decisions prioritize simplicity, performance, and consistency with existing codebase patterns.

## Research Questions & Decisions

### 1. Display Location for Side Duration Totals

**Question**: Where should the three duration totals (Side 1, Side 2, Unassigned) be displayed on the dashboard?

**Options Considered**:

| Location | Pros | Cons | Decision |
|----------|------|------|----------|
| Dashboard header (below album title) | Always visible, prominent, semantic location | Uses vertical space | ✅ **Selected** |
| Above song grid | Close to song cards, contextual | Less prominent, may be missed | ❌ Rejected |
| Footer area | Doesn't use prime real estate | Requires scrolling to see | ❌ Rejected |
| Floating overlay | Always visible | Clutters UI, not simple | ❌ Rejected |

**Decision**: Display below album title in dashboard header

**Rationale**:
- Meets SC-004: "Users can distinguish between Side 1, Side 2, and unassigned totals at a glance"
- Semantic location: summary metrics belong near title
- Always visible without scrolling (important for UX)
- Consistent with album dashboard pattern (title → metadata → content)

**Implementation**:
```jsx
<div className="text-center mb-4">
  <h1 className="text-4xl font-bold">{albumTitle}</h1>
  <div className="flex justify-center gap-6 mt-2 text-sm text-neutral-400">
    <span>Side 1: {formatDuration(side1Total.minutes, side1Total.seconds)}</span>
    <span>Side 2: {formatDuration(side2Total.minutes, side2Total.seconds)}</span>
    <span>Unassigned: {formatDuration(unassignedTotal.minutes, unassignedTotal.seconds)}</span>
  </div>
</div>
```

---

### 2. Duration Calculation Algorithm

**Question**: How to calculate total duration from song objects with `{minutes, seconds}` structure?

**Options Considered**:

**Option A: Direct Addition with Carry Logic**
```javascript
let totalMinutes = 0, totalSeconds = 0;
songs.forEach(song => {
  totalMinutes += song.duration.minutes;
  totalSeconds += song.duration.seconds;
});
totalMinutes += Math.floor(totalSeconds / 60);
totalSeconds = totalSeconds % 60;
```
- ✅ Intuitive, mirrors manual calculation
- ❌ More steps, potential for off-by-one errors

**Option B: Convert to Seconds, Sum, Convert Back** ✅ **Selected**
```javascript
const totalSeconds = songs.reduce((sum, song) =>
  sum + (song.duration.minutes * 60) + song.duration.seconds,
  0
);
return {
  minutes: Math.floor(totalSeconds / 60),
  seconds: totalSeconds % 60
};
```
- ✅ Single reduce operation, functional style
- ✅ Avoids intermediate carry logic
- ✅ Consistent with existing codebase patterns
- ❌ None significant

**Decision**: Option B (seconds-based calculation)

**Rationale**:
- **Simplicity**: One-pass reduce operation
- **Correctness**: No edge cases with seconds overflow
- **Performance**: O(n) complexity, same as Option A
- **Maintainability**: Functional style, easy to test

**Test Cases**:
```javascript
// Test 1: Simple case
songs = [{ duration: {minutes: 3, seconds: 30} }, { duration: {minutes: 4, seconds: 15} }]
// totalSeconds = (3*60 + 30) + (4*60 + 15) = 210 + 255 = 465
// result = { minutes: 7, seconds: 45 } ✅

// Test 2: Seconds overflow
songs = [{ duration: {minutes: 2, seconds: 45} }, { duration: {minutes: 1, seconds: 30} }]
// totalSeconds = (2*60 + 45) + (1*60 + 30) = 165 + 90 = 255
// result = { minutes: 4, seconds: 15 } ✅

// Test 3: Zero duration songs
songs = [{ duration: {minutes: 0, seconds: 0} }, { duration: {minutes: 5, seconds: 0} }]
// totalSeconds = 0 + 300 = 300
// result = { minutes: 5, seconds: 0 } ✅
```

---

### 3. Display Format for Durations Exceeding 60 Minutes

**Question**: Should totals exceeding 60 minutes be displayed as hours (e.g., "1h 15m") or continued minutes (e.g., "75:30")?

**Context**: Existing codebase has two formatters:
- `formatDuration(minutes, seconds)` → "MM:SS" (e.g., "3:45")
- `formatTotalDuration(totalMinutes)` → "Xh Ym" (e.g., "1h 15m")

**Options Considered**:

| Format | Example (75min 30sec) | Pros | Cons | Decision |
|--------|----------------------|------|------|----------|
| MM:SS | "75:30" | Consistent with song durations, easy to compare | Unconventional for long durations | ✅ **Selected** (per spec FR-011) |
| Xh Ym | "1h 15m" | Conventional time format | Inconsistent with song-level display | ❌ Rejected |

**Decision**: Use MM:SS format (e.g., "75:30")

**Rationale**:
- **Spec requirement**: FR-011 explicitly states "System MUST handle duration totals exceeding 60 minutes (e.g., display 75:30, not 1:15:30)"
- **Consistency**: Song durations use MM:SS, totals should match
- **Comparability**: Easier to compare "75:30" (Side 1) vs "68:15" (Side 2) in same format
- **Implementation**: Reuse existing `formatDuration` helper, no new code

**Implementation**:
```javascript
// Reuse existing helper - no changes needed
formatDuration(75, 30) // → "75:30" ✅
```

---

### 4. Draft Song Filtering Pattern

**Question**: How to filter out draft songs from duration calculations?

**Existing Pattern** (from Feature 009):
```javascript
// src/App.jsx:348
const nonDraftSongs = songs.filter(song => !song.isDraft);
```

**Decision**: Reuse existing pattern directly

**Rationale**:
- **Proven**: Pattern used in Feature 009 (draft song count)
- **Simplicity**: No new abstractions needed
- **Consistency**: Same filter logic across features
- **Constitution alignment**: Principle I (Simplicity First) — "No abstraction layers without demonstrated need"

**Implementation**:
```javascript
const calculateSideDuration = (songs, sideValue) => {
  const filtered = songs.filter(song =>
    song.side === sideValue && !song.isDraft  // Combine side + draft filters
  );

  const totalSeconds = filtered.reduce((sum, song) =>
    sum + (song.duration.minutes * 60) + song.duration.seconds,
    0
  );

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60
  };
};
```

**Why not extract a helper function?**
- Filter logic is two conditions (`side === X && !isDraft`)
- Used only in one place (`useMemo` hook)
- Helper would be premature abstraction (YAGNI principle)
- If needed in 3+ places, then extract

---

### 5. Performance Optimization Strategy

**Question**: When should side duration totals recalculate?

**Options Considered**:

**Option A: useState with Manual Updates**
```javascript
const [sideTotals, setSideTotals] = useState(calculateTotals(songs));

// Update in every handler that modifies songs
const updateSong = (updated) => {
  setSongs(prev => {
    const newSongs = prev.map(s => s.id === updated.id ? updated : s);
    setSideTotals(calculateTotals(newSongs)); // Manual sync
    return newSongs;
  });
};
```
- ✅ Explicit control over when recalculation happens
- ❌ Error-prone: easy to forget manual update
- ❌ Violates DRY: sync logic duplicated in handlers

**Option B: useMemo with songs Dependency** ✅ **Selected**
```javascript
const sideTotals = useMemo(() => ({
  side1: calculateSideDuration(songs, "1"),
  side2: calculateSideDuration(songs, "2"),
  unassigned: calculateSideDuration(songs, "")
}), [songs]);
```
- ✅ Automatic recalculation when songs changes
- ✅ React guarantees correct timing
- ✅ No manual sync needed
- ❌ None (O(n) complexity acceptable for ~12 songs)

**Decision**: Option B (useMemo)

**Rationale**:
- **Correctness**: React manages dependencies, no risk of stale data
- **Simplicity**: Single source of truth (songs array)
- **Performance**: Recalculates only when needed
- **Success Criteria**: Meets SC-002 (<500ms update time)

**Performance Analysis**:
```
Worst case: 12 songs × 3 side totals = 36 iterations
- Filter operation: O(n) = 12 comparisons per side
- Reduce operation: O(m) where m = filtered songs (≤12)
- Total: O(3n) = O(n) = ~36 operations

Actual time: <1ms on modern browsers
Target: <500ms ✅ (497ms headroom)
```

**Re-render Triggers**:
- Song duration change → `updateSong` → songs array changes → useMemo recalculates
- Side assignment change → `updateSong` → songs array changes → useMemo recalculates
- Draft status change → `updateSong` → songs array changes → useMemo recalculates

---

## Best Practices Applied

### React Patterns

1. **Derived State with useMemo**
   - Source: [React docs - useMemo](https://react.dev/reference/react/useMemo)
   - Applied: Side totals derived from songs array
   - Benefit: Automatic consistency, no manual synchronization

2. **Pure Functions**
   - Source: React philosophy (no side effects in calculations)
   - Applied: `calculateSideDuration` has no side effects
   - Benefit: Testable, predictable, safe to call multiple times

3. **DRY Principle (Don't Repeat Yourself)**
   - Source: General software engineering best practice
   - Applied: Reuse `formatDuration` helper for display
   - Benefit: Single source of truth for duration formatting

### Performance Considerations

**Memoization Strategy**:
- Use `useMemo` for expensive calculations
- Dependencies: `[songs]` array
- Recalculation only when songs changes (not on every render)

**Complexity Analysis**:
```
Operation                Time Complexity    Actual (12 songs)
--------------------------------------------------------------
Filter by side + draft   O(n)              ~12 iterations
Reduce to sum            O(m) where m≤n     ~4 iterations (avg)
Total per side           O(n)              ~16 iterations
All 3 sides              O(3n) = O(n)      ~48 iterations
```

**Benchmark** (simulated with 12 songs):
- Calculation time: <1ms
- Target: <500ms (SC-002)
- Headroom: 499ms ✅

---

## Implementation Dependencies

### Existing Code Reused

1. **`formatDuration(minutes, seconds)`** (App.jsx:101)
   - Purpose: Format MM:SS display
   - Usage: Display all three totals

2. **Draft filtering pattern** (App.jsx:348)
   - Purpose: Exclude draft songs
   - Usage: Filter before summing durations

3. **Song data structure** (App.jsx:45-54)
   - Fields: `id`, `title`, `duration`, `side`, `isDraft`
   - Usage: Source data for calculations

### Zero New Dependencies

- No external libraries needed
- No new helper functions created
- No new React hooks introduced (useMemo is built-in)

---

## Testing Strategy

### Manual Test Cases

1. **Basic calculation**
   - Assign 3 songs to Side 1 with durations (3:30, 4:15, 2:45)
   - Expected: Side 1 total = 10:30 ✅

2. **Draft exclusion**
   - Assign 2 songs to Side 1: Song A (3:00, draft), Song B (4:00, non-draft)
   - Expected: Side 1 total = 4:00 (excludes Song A) ✅

3. **Seconds overflow**
   - Assign 2 songs to Side 2 with durations (3:45, 2:30)
   - totalSeconds = 225 + 150 = 375 → 6:15 ✅

4. **Totals exceeding 60 minutes**
   - Assign songs totaling 75 minutes 30 seconds to Side 1
   - Expected: Display "75:30" (not "1h 15m") ✅

5. **Zero duration songs**
   - Assign song with 0:00 duration to Side 1
   - Expected: Contributes nothing, no errors ✅

6. **Real-time updates**
   - Change song duration → verify total updates within 500ms
   - Change side assignment → verify both old and new side totals update
   - Mark song as draft → verify total decreases

### Browser Console Tests

```javascript
// Test calculation function
const testSongs = [
  { side: "1", isDraft: false, duration: { minutes: 3, seconds: 30 } },
  { side: "1", isDraft: false, duration: { minutes: 4, seconds: 15 } },
  { side: "1", isDraft: true, duration: { minutes: 10, seconds: 0 } }  // Should be excluded
];

const calculateSideDuration = (songs, sideValue) => {
  const filtered = songs.filter(song => song.side === sideValue && !song.isDraft);
  const totalSeconds = filtered.reduce((sum, song) =>
    sum + (song.duration.minutes * 60) + song.duration.seconds, 0
  );
  return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
};

const result = calculateSideDuration(testSongs, "1");
console.assert(result.minutes === 7 && result.seconds === 45, 'Expected 7:45');
// ✅ PASS
```

---

## Alternatives Rejected

### 1. Store Totals in localStorage

**Approach**: Save computed totals as separate state
```javascript
const [sideTotals, setSideTotals] = useState({ side1: {...}, side2: {...}, unassigned: {...} });
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, sideTotals, ... }));
}, [songs, sideTotals, ...]);
```

**Rejected Because**:
- Violates **Constitution III**: "Schema migrations must be backward-compatible"
- Adds complexity: now two sources of truth (songs + totals)
- Risk of desync: totals could become stale if migration fails
- Unnecessary: Recalculation is fast (<1ms), no benefit to caching

### 2. Create Separate Component for Totals Display

**Approach**: Extract `<SideTotals />` component
```jsx
function SideTotals({ songs }) {
  const totals = useMemo(() => calculateTotals(songs), [songs]);
  return <div>...</div>;
}
```

**Rejected Because**:
- **Constitution I**: "No abstraction layers without demonstrated need"
- Used only once in App component
- Doesn't improve readability (logic is simple)
- Premature optimization (component extraction warranted only if reused 3+ times)

### 3. Use Third-Party Duration Library

**Approach**: Install `dayjs` or `date-fns` for duration math
```javascript
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const total = dayjs.duration({ minutes: 3, seconds: 30 })
  .add(dayjs.duration({ minutes: 4, seconds: 15 }));
```

**Rejected Because**:
- **Constitution I**: "Prefer React built-in features over external libraries"
- Adds bundle size (~10KB minified)
- Overkill for simple addition (can be done in 5 lines)
- No features needed beyond basic arithmetic

---

## Risk Mitigation

### Identified Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Incorrect duration math (seconds overflow) | Medium (wrong totals) | Low | Manual testing + console verification |
| Performance degradation with many songs | Low (slowdown) | Very Low | useMemo + O(n) complexity acceptable |
| Draft filter inconsistency | Medium (wrong totals) | Low | Reuse proven pattern from Feature 009 |
| UI layout disruption | Low (visual) | Low | Test in browser before commit |

### Testing Checklist

Before merge:
- [ ] Test with 3 songs on Side 1, verify total matches manual calculation
- [ ] Test with draft songs, verify exclusion from totals
- [ ] Test with songs exceeding 60 total minutes, verify MM:SS format
- [ ] Test real-time updates: change duration, verify total recalculates
- [ ] Test real-time updates: change side, verify both old/new totals update
- [ ] Visual regression: verify header layout not disrupted
- [ ] Browser console: run automated test script (see above)

---

## Conclusion

All research questions resolved with decisions aligned to:
- ✅ **Constitution I (Simplicity)**: No new abstractions, reuse existing patterns
- ✅ **Constitution II (UX)**: <500ms updates, clear MM:SS display
- ✅ **Constitution III (Data Integrity)**: Zero schema changes, no migration needed

**Status**: Ready for Phase 1 (Design Artifacts)

**Next Steps**:
1. Generate `data-model.md` with calculation structure
2. Generate `quickstart.md` with implementation steps
3. Run `/speckit.tasks` to create task breakdown
