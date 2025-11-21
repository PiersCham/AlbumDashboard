# Data Model: Draft-Aware Song Count and Progress

**Feature**: 009-draft-song-count
**Date**: 2025-11-21
**Purpose**: Define derived metrics calculations and data flow for draft-aware song count and overall progress

---

## Derived Metrics (No Schema Changes)

This feature does **NOT** modify the Song entity or add new fields. It only changes how existing data is filtered and aggregated for display.

### Song Count Metric

**Type**: Derived number (integer)
**Source**: Filtered songs array
**Calculation**: `songs.filter(song => !song.isDraft).length`
**Display Location**: Header component (currently "X/13" format)
**Updates When**: Draft status changes on any song

**Formula**:
```javascript
const nonDraftSongs = songs.filter(song => !song.isDraft);
const totalSongCount = nonDraftSongs.length;
```

**Examples**:
- 12 songs, 0 drafts → totalSongCount = 12
- 12 songs, 3 drafts → totalSongCount = 9
- 12 songs, 12 drafts → totalSongCount = 0

**Edge Cases**:
- Empty songs array → 0
- All songs draft → 0
- Songs without isDraft field → treated as non-draft (false) per feature 008 migration

---

### Eligible Song Count Metric

**Type**: Derived number (integer)
**Source**: Filtered songs array where songAverage ≥ threshold
**Calculation**: `nonDraftSongs.filter(song => songAverage(song) >= threshold).length`
**Display Location**: Header component (numerator of "X/Y" format)
**Updates When**: Draft status changes OR stage progress changes on any non-draft song

**Formula**:
```javascript
const nonDraftSongs = songs.filter(song => !song.isDraft);
const eligibleCount = nonDraftSongs.filter(song => songAverage(song) >= 90).length;
```

**Threshold**: 90% (songs at or above 90% completion count as "eligible")

**Examples**:
- 9 non-draft songs, 5 at ≥90% → eligibleCount = 5 (display: "5/9")
- 9 non-draft songs, 0 at ≥90% → eligibleCount = 0 (display: "0/9")
- 0 non-draft songs → eligibleCount = 0 (display: "0/0")

---

### Overall Progress Metric

**Type**: Derived number (integer percentage 0-100)
**Source**: Average of all non-draft songs' individual progress averages
**Calculation**: `Math.round(sum(songAverage(nonDraftSongs)) / nonDraftSongs.length)`
**Display Location**: Album-wide progress bar below header
**Updates When**: Draft status changes OR stage progress changes on any non-draft song

**Formula**:
```javascript
function albumAverage(songs) {
  if (!songs.length) return 0;
  const sum = songs.reduce((acc, song) => acc + songAverage(song), 0);
  return Math.round(sum / songs.length);
}

// Called with filtered songs:
const nonDraftSongs = songs.filter(song => !song.isDraft);
const overallProgress = albumAverage(nonDraftSongs);
```

**Examples**:
- 10 non-draft songs, all at 50% → overallProgress = 50%
- 10 non-draft songs, 5 at 100%, 5 at 0% → overallProgress = 50%
- 10 non-draft songs, average 66.6% → overallProgress = 67% (rounded)
- 0 non-draft songs → overallProgress = 0%

**Rounding**: Standard JavaScript `Math.round()` (0.5 rounds up)

---

## Data Flow Diagram

### Draft Status Change Triggers Metric Updates

```
User toggles draft checkbox in SongDetail
       │
       ▼
onUpdate({ ...song, isDraft: !song.isDraft })
       │
       ▼
updateSong(updatedSong)
       │
       ▼
setSongs(newSongsArray)  [React state update]
       │
       ▼
React re-renders components with new songs array
       │
       ├──────────────────────┬──────────────────────┐
       ▼                      ▼                      ▼
   Header component    Progress Bar (main)    SongCard (grid)
       │                      │                      │
       ▼                      ▼                      ▼
Filter: nonDraftSongs   Filter: nonDraftSongs   Visual: opacity-60
       │                      │                   (if isDraft)
       ▼                      ▼
Display: X/Y count      Display: Z% progress
```

**Timing**: Entire flow completes in single React render cycle (~16ms for 60fps)

---

### Stage Progress Change Triggers Metric Updates

```
User adjusts stage progress on non-draft song
       │
       ▼
onUpdate({ ...song, stages: newStages })
       │
       ▼
updateSong(updatedSong)
       │
       ▼
setSongs(newSongsArray)  [React state update]
       │
       ▼
React re-renders components
       │
       ├──────────────────────┬──────────────────────┐
       ▼                      ▼                      ▼
   Header component    Progress Bar (main)    SongCard (affected)
       │                      │                      │
       ▼                      ▼                      ▼
Recalc eligibleCount   Recalc albumAverage   Update visual progress
  (if song crosses      (song avg changed)
   90% threshold)
       │                      │
       ▼                      ▼
Display: X/Y count      Display: Z% progress
 (X may change)         (Z may change)
```

**Note**: Draft songs' progress changes do NOT trigger metric updates (they're filtered out)

---

## Metric Dependencies

### Song Count Metric

**Depends On**:
- `songs` array (React state)
- `song.isDraft` field (boolean per song)

**Independent Of**:
- Stage progress values
- Song duration
- Song tempo/key

**Reactivity**: Updates when any song's isDraft changes

---

### Eligible Song Count Metric

**Depends On**:
- `songs` array (React state)
- `song.isDraft` field (boolean per song)
- `song.stages` array (progress values per song)
- Threshold constant (90%)

**Independent Of**:
- Song duration
- Song tempo/key
- Album title or due date

**Reactivity**: Updates when:
1. Any song's isDraft changes
2. Any non-draft song's stage progress crosses 90% threshold

---

### Overall Progress Metric

**Depends On**:
- `songs` array (React state)
- `song.isDraft` field (boolean per song)
- `song.stages` array (progress values per song)

**Independent Of**:
- Song duration (not weighted)
- Song count (calculated as average, not sum)
- Eligible count threshold

**Reactivity**: Updates when:
1. Any song's isDraft changes
2. Any non-draft song's stage progress changes

---

## Performance Characteristics

### Computational Complexity

| Operation | Time Complexity | Worst Case (12 songs) |
|-----------|----------------|---------------------|
| Filter non-draft songs | O(n) | ~0.5ms |
| Calculate songAverage | O(m) per song, m = stages | ~0.1ms per song |
| Calculate albumAverage | O(n × m) | ~1.2ms (12 songs × ~0.1ms) |
| Total metric update | O(n × m) | ~2ms |

**Validation**: All operations < 100ms budget (SC-001, SC-004)

### Memory Usage

- **No additional storage**: Metrics are derived on-the-fly during render
- **No memoization overhead**: React's existing render optimization sufficient
- **Zero data duplication**: Filter creates temporary array, garbage collected after render

---

## Validation Rules

### Song Count Metric

- **Range**: [0, 12] (cannot exceed total songs in array)
- **Type**: Non-negative integer
- **Validation**: None needed (JavaScript array.length is always valid)

### Eligible Song Count Metric

- **Range**: [0, totalSongCount] (cannot exceed non-draft songs)
- **Type**: Non-negative integer
- **Validation**: None needed (filter always returns valid subset)

### Overall Progress Metric

- **Range**: [0, 100] (percentage)
- **Type**: Non-negative integer (rounded)
- **Validation**: Math.round() ensures integer, songAverage() clamps to [0, 100]

---

## Edge Case Handling

### All Songs Marked as Draft

**Scenario**: User marks all 12 songs as draft

**Metric Values**:
- Song count: 0
- Eligible count: 0 (display "0/0")
- Overall progress: 0% (albumAverage returns 0 for empty array)

**Implementation**:
```javascript
function albumAverage(songs) {
  if (!songs.length) return 0; // Edge case: no non-draft songs
  const sum = songs.reduce((acc, song) => acc + songAverage(song), 0);
  return Math.round(sum / songs.length);
}
```

**User Impact**: Clear visual indication that no active songs exist

---

### Rapid Draft Status Toggling

**Scenario**: User rapidly toggles draft status on multiple songs

**Behavior**:
- Each toggle triggers updateSong → setSongs → React re-render
- React batches state updates automatically (no manual debouncing needed)
- Metrics recalculate on each render with latest songs array

**Performance**: Filter + calculate < 2ms per toggle, 60fps maintained

---

### Fractional Percentages

**Scenario**: Overall progress calculates to 66.666...%

**Handling**: Math.round(66.666) = 67%

**Display**: "67%" (integer only, no decimal places)

**Validation**: Meets FR-009 (round to nearest whole number)

---

## Summary

**New Entities**: None
**Modified Entities**: None
**Derived Metrics**: 3 (song count, eligible count, overall progress)
**Storage Impact**: Zero (metrics calculated on render)
**Performance**: <2ms metric calculation, well under 100ms budget
**Edge Cases**: All handled gracefully (0 values for empty arrays)

**Ready for Phase 1**: API contracts and test scenarios can now be defined.
