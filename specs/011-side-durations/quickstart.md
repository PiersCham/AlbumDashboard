# Implementation Quickstart: Per-Side Running Times

**Feature**: 011-side-durations | **Date**: 2025-11-28

## Overview

This guide provides step-by-step instructions for implementing per-side duration totals. All changes are contained within `src/App.jsx`.

**Estimated Implementation Time**: 15-20 minutes

**Lines of Code**: ~30-40 LOC

## Prerequisites

- Read [data-model.md](./data-model.md) for calculation logic
- Read [research.md](./research.md) for technical decisions
- Ensure branch `011-side-durations` is checked out
- Feature 010 (song side assignment) must be implemented

## Implementation Steps

### Step 1: Add Side Duration Calculation Function

**File**: `src/App.jsx`
**Location**: After `formatTotalDuration` function (after line ~123)

**Action**: Add helper function to calculate duration for a specific side

**Insert**:
```javascript
// Calculate total duration for songs on a specific side (excluding drafts)
const calculateSideDuration = (songs, sideValue) => {
  const filtered = songs.filter(song =>
    song.side === sideValue && !song.isDraft
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

**Test**: Copy function to browser console, test with sample data:
```javascript
const testSongs = [
  { side: "1", isDraft: false, duration: { minutes: 3, seconds: 30 } },
  { side: "1", isDraft: false, duration: { minutes: 4, seconds: 15 } }
];
const result = calculateSideDuration(testSongs, "1");
console.log(result); // Should output: { minutes: 7, seconds: 45 }
```

---

### Step 2: Add useMemo Hook to Calculate Side Totals

**File**: `src/App.jsx`
**Location**: Inside `App` component, after `currentSong` definition (after line ~1571)

**Action**: Add memoized calculation for both side totals

**Insert After Line ~1571**:
```javascript
  // Calculate side duration totals (excludes draft songs)
  const sideTotals = useMemo(() => ({
    side1: calculateSideDuration(songs, "1"),
    side2: calculateSideDuration(songs, "2")
  }), [songs]);
```

**Test**: Add `console.log(sideTotals);` after the useMemo, check browser console for output

---

### Step 3: Display Totals in Dashboard Header

**File**: `src/App.jsx`
**Location**: Find the dashboard header with album title (around line ~1667-1680)

**Action**: Add side duration display below album title

**Find** (around line ~1667):
```javascript
<div className="text-center mb-2">
  <EditableText
    text={albumTitle}
    onSubmit={(t) => setAlbumTitle(t)}
    className="text-4xl font-bold leading-tight tracking-wider"
  />
</div>
```

**Replace with**:
```javascript
<div className="text-center mb-2">
  <EditableText
    text={albumTitle}
    onSubmit={(t) => setAlbumTitle(t)}
    className="text-4xl font-bold leading-tight tracking-wider"
  />
  {/* Side duration totals */}
  <div className="flex justify-center gap-6 mt-2 text-sm text-neutral-400">
    <span>
      Side 1: {formatDuration(sideTotals.side1.minutes, sideTotals.side1.seconds)}
    </span>
    <span>
      Side 2: {formatDuration(sideTotals.side2.minutes, sideTotals.side2.seconds)}
    </span>
  </div>
</div>
```

**Test**: Reload app, verify two duration totals appear below album title

---

## Validation Checklist

After implementation, verify all functionality:

### Basic Functionality

- [ ] Side 1 and Side 2 totals display below album title
- [ ] Totals show "0:00" when no songs are assigned to sides
- [ ] Totals show "0:00" when all songs on a side are drafts

### Draft Song Exclusion

- [ ] Assign song to Side 1, duration 3:00, mark as draft → Side 1 shows 0:00
- [ ] Assign song to Side 1, duration 3:00, leave non-draft → Side 1 shows 3:00
- [ ] Mark non-draft song as draft → Total decreases immediately
- [ ] Unmark draft song → Total increases immediately

### Duration Calculation Accuracy

- [ ] Side 1: Assign 2 songs (3:30, 4:15) → Displays 7:45
- [ ] Side 2: Assign 2 songs (2:45, 1:30) → Displays 4:15
- [ ] Test seconds overflow: Assign (2:45, 1:30) → Shows 4:15 (not 3:75)

### Real-Time Updates

- [ ] Change song duration → Total updates within 500ms
- [ ] Change song side (1 → 2) → Both old and new side totals update
- [ ] Change song side (blank → 1) → Side 1 total increases

### Edge Cases

- [ ] Total exceeds 60 minutes → Displays as "75:30" (not "1:15:30")
- [ ] Song with 0:00 duration → Contributes nothing, no errors
- [ ] All 12 songs on Side 1 (max test) → Displays correctly
- [ ] Delete song → Totals recalculate

### Visual/UX

- [ ] Totals are clearly visible below album title
- [ ] Text color is readable (neutral-400)
- [ ] Layout doesn't overlap with other elements
- [ ] Totals align horizontally with proper spacing

---

## Testing Script

**Quick Manual Test** (run in browser console after implementation):

```javascript
// Test 1: Verify calculation function exists
console.assert(
  typeof calculateSideDuration === 'function',
  'calculateSideDuration function not found'
);

// Test 2: Basic calculation
const testSongs = [
  { side: "1", isDraft: false, duration: { minutes: 3, seconds: 30 } },
  { side: "1", isDraft: false, duration: { minutes: 4, seconds: 15 } }
];
const result = calculateSideDuration(testSongs, "1");
console.assert(
  result.minutes === 7 && result.seconds === 45,
  'Expected 7:45, got ' + result.minutes + ':' + result.seconds
);

// Test 3: Draft exclusion
const testWithDraft = [
  { side: "1", isDraft: false, duration: { minutes: 3, seconds: 0 } },
  { side: "1", isDraft: true, duration: { minutes: 5, seconds: 0 } }  // Should be excluded
];
const result2 = calculateSideDuration(testWithDraft, "1");
console.assert(
  result2.minutes === 3 && result2.seconds === 0,
  'Draft song not excluded'
);

// Test 4: Seconds overflow
const testOverflow = [
  { side: "2", isDraft: false, duration: { minutes: 2, seconds: 45 } },
  { side: "2", isDraft: false, duration: { minutes: 1, seconds: 30 } }
];
const result3 = calculateSideDuration(testOverflow, "2");
console.assert(
  result3.minutes === 4 && result3.seconds === 15,
  'Seconds overflow not handled correctly'
);

console.log('✅ All tests passed!');
```

---

## Troubleshooting

### Issue: Totals not displaying

**Check**:
1. Verify `useMemo` hook is inside `App` component
2. Check browser console for errors
3. Verify `formatDuration` helper exists (should be around line ~101)
4. Inspect element: ensure JSX was added inside correct container

### Issue: Totals not updating when song changes

**Check**:
1. Verify `useMemo` dependency is `[songs]` (not missing)
2. Ensure `updateSong` handler modifies songs array correctly
3. Check browser console for React warnings about stale closures

### Issue: Incorrect duration math

**Check**:
1. Run testing script (above) to verify calculation logic
2. Check that `filtered.reduce` is returning total seconds, not minutes
3. Verify `Math.floor(totalSeconds / 60)` and `totalSeconds % 60` logic

### Issue: Draft songs still counted

**Check**:
1. Verify filter condition includes `&& !song.isDraft`
2. Check that song objects have `isDraft` field (migration from Feature 008)
3. Test with `console.log(filtered)` inside `calculateSideDuration`

---

## Code Locations Reference

| Component | File | Line Range (approx) | Purpose |
|-----------|------|---------------------|---------|
| calculateSideDuration | App.jsx | ~125-137 | Calculate side total helper |
| sideTotals useMemo | App.jsx | ~1573-1576 | Memoized side totals |
| Dashboard header | App.jsx | ~1667-1680 | Display location for totals |

---

## Performance Verification

After implementation, verify performance targets:

**Success Criteria**:
- **SC-001**: Users can view totals within 1 second of loading dashboard
- **SC-002**: Totals update within 500ms of changing song data

**Test**:
1. Open browser DevTools → Performance tab
2. Start recording
3. Change a song duration
4. Stop recording
5. Verify re-render time <500ms

**Expected Results**:
- `calculateSideDuration` execution: <1ms per side
- Total recalculation: <2ms for both sides
- Re-render: <100ms

---

## Next Steps

After completing implementation:

1. **Commit changes**:
   ```bash
   git add src/App.jsx
   git commit -m "feat(011): add per-side duration totals

   - Add calculateSideDuration helper function
   - Add useMemo hook for real-time calculation
   - Display Side 1 and Side 2 totals below album title
   - Exclude draft songs from calculations

   Closes #011"
   ```

2. **Run build** (optional):
   ```bash
   npm run build
   ```

3. **Create PR** (if working in team):
   - Base branch: `main`
   - Compare branch: `011-side-durations`
   - Include screenshots showing side totals

4. **Generate tasks** (if using /speckit workflow):
   ```bash
   /speckit.tasks
   ```

---

## Related Documentation

- [Feature Spec](./spec.md) - User requirements and success criteria
- [Implementation Plan](./plan.md) - Technical approach and architecture
- [Data Model](./data-model.md) - Calculation logic and data structures
- [Research](./research.md) - Technical decisions and alternatives considered

---

## Implementation Summary

**Total Changes**:
- 1 new function: `calculateSideDuration`
- 1 new hook: `useMemo` for `sideTotals`
- 1 UI update: Dashboard header with side duration display

**Files Modified**:
- `src/App.jsx` (~35 LOC added)

**Dependencies**:
- Feature 002 (duration field): `{ minutes, seconds }`
- Feature 008 (draft status): `isDraft` boolean
- Feature 010 (side assignment): `side` field ("", "1", "2")

**No Schema Changes**: Feature uses computed values only, no localStorage impact

---

**Quickstart Status**: ✅ Ready for implementation
**Next Command**: Begin implementation following steps above, or run `/speckit.tasks` for detailed task breakdown
