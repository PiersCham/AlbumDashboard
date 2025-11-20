# Component API Contract: Draft-Aware Song Count and Progress

**Feature**: 009-draft-song-count
**Date**: 2025-11-21
**Purpose**: Define function signatures, component props, and behavioral contracts for draft-aware metrics

---

## Modified Functions

### albumAverage() - Overall Progress Calculation

**Location**: `src/App.jsx` (line ~330)

**Signature** (unchanged):
```javascript
function albumAverage(songs: Song[]): number
```

**Parameters**:
- `songs`: Array of Song objects to average

**Returns**: Integer percentage (0-100) representing average progress across all provided songs

**Behavior**:
- Calculates average of each song's individual progress average
- Returns 0 if songs array is empty (edge case: all drafts)
- Rounds to nearest whole number using Math.round()

**Pre-Feature 009 Usage**:
```javascript
albumAverage(songs)  // Includes draft songs
```

**Post-Feature 009 Usage**:
```javascript
const nonDraftSongs = songs.filter(song => !song.isDraft);
albumAverage(nonDraftSongs)  // Excludes draft songs
```

**Contract Changes**: None (function signature unchanged, caller responsibility to filter)

---

### eligibleCount() - Completed Songs Count

**Location**: `src/App.jsx` (line ~336)

**Signature** (unchanged):
```javascript
function eligibleCount(songs: Song[], threshold: number = 75): number
```

**Parameters**:
- `songs`: Array of Song objects to evaluate
- `threshold`: Minimum completion percentage to count as eligible (default 75%)

**Returns**: Integer count of songs meeting or exceeding threshold

**Behavior**:
- Filters songs where songAverage(song) >= threshold
- Returns count of filtered array
- Default threshold is 75%, but Header uses 90%

**Pre-Feature 009 Usage**:
```javascript
eligibleCount(songs, 90)  // Includes draft songs
```

**Post-Feature 009 Usage**:
```javascript
const nonDraftSongs = songs.filter(song => !song.isDraft);
eligibleCount(nonDraftSongs, 90)  // Excludes draft songs
```

**Contract Changes**: None (function signature unchanged, caller responsibility to filter)

---

## Modified Components

### Header Component

**Location**: `src/App.jsx` (line ~340)

**Props** (unchanged):
```javascript
interface HeaderProps {
  targetISO: string;
  setTargetISO: (iso: string) => void;
  songs: Song[];
  albumTitle: string;
  setAlbumTitle: (title: string) => void;
}
```

**Display Changes**:

#### Song Count Display (line ~375)

**Pre-Feature 009**:
```jsx
<div className="text-2xl font-black tracking-wider">
  {eligibleCount(songs, 90)}/13
</div>
```

**Post-Feature 009**:
```jsx
<div className="text-2xl font-black tracking-wider">
  {eligibleCount(nonDraftSongs, 90)}/{nonDraftSongs.length}
</div>
```

**Behavior Contract**:
- Numerator: Count of non-draft songs with ≥90% completion
- Denominator: Total count of non-draft songs
- Updates immediately when draft status changes (React re-render)
- Edge case: "0/0" when all songs are draft

**Performance Contract**:
- Calculation time: < 1ms (filter + eligibleCount on 12 songs)
- Visual update: Within same render cycle (<16ms for 60fps)

---

### App Component (Main Render)

**Location**: `src/App.jsx` (line ~1559)

**Overall Progress Bar Changes**:

**Pre-Feature 009**:
```jsx
<ProgressBar value={albumAverage(songs)} height="h-9" />
<span>
  {albumAverage(songs)}%
</span>
```

**Post-Feature 009**:
```jsx
<ProgressBar value={albumAverage(nonDraftSongs)} height="h-9" />
<span>
  {albumAverage(nonDraftSongs)}%
</span>
```

**Behavior Contract**:
- Progress bar fills to percentage representing non-draft songs' average completion
- Percentage text displays same value as progress bar
- Updates immediately when:
  - Any song's draft status changes
  - Any non-draft song's stage progress changes
- Edge case: 0% when all songs are draft

**Performance Contract**:
- Calculation time: < 2ms (filter + albumAverage on 12 songs)
- Visual update: Within same render cycle (<16ms for 60fps)

---

## Variable Introduction

### nonDraftSongs Variable

**Scope**: Local to component render function (Header, App main render)
**Type**: `Song[]` (filtered array)
**Calculation**: `songs.filter(song => !song.isDraft)`

**Placement in Header Component** (~line 344):
```javascript
function Header({ targetISO, setTargetISO, songs, albumTitle, setAlbumTitle }) {
  const { days, hours, minutes, seconds } = useCountdown(targetISO);
  const [editingDate, setEditingDate] = useState(false);

  // Calculate total album duration (memoized) - already exists, filters drafts
  const totalDuration = useMemo(() => {
    const nonDraftSongs = songs.filter(song => !song.isDraft);
    // ... existing duration calculation
  }, [songs]);

  // NEW: Filter non-draft songs for display metrics
  const nonDraftSongs = songs.filter(song => !song.isDraft);

  return (
    // ... JSX using nonDraftSongs
  );
}
```

**Placement in App Main Render** (~line 1540):
```javascript
return (
  <div className="w-screen h-screen bg-black text-white font-sans overflow-hidden">
    {!currentSong ? (
      <div className="flex flex-col h-full">
        <Header
          targetISO={targetISO}
          setTargetISO={setTargetISO}
          songs={songs}
          albumTitle={albumTitle}
          setAlbumTitle={setAlbumTitle}
        />

        {/* Album-wide overall progress */}
        {/* NEW: Calculate nonDraftSongs before progress bar */}
        {(() => {
          const nonDraftSongs = songs.filter(song => !song.isDraft);
          return (
            <div className="px-4 -mt-2 pb-2 relative">
              <ProgressBar value={albumAverage(nonDraftSongs)} height="h-9" />
              <span>
                {albumAverage(nonDraftSongs)}%
              </span>
            </div>
          );
        })()}

        {/* Song grid */}
        // ...
      </div>
    ) : (
      // ... SongDetail view
    )}
  </div>
);
```

**Alternative (cleaner)**: Hoist nonDraftSongs to App component level:
```javascript
export default function App() {
  // ... existing state
  const [songs, setSongs] = useState(/* ... */);

  // NEW: Derive non-draft songs at top level
  const nonDraftSongs = useMemo(
    () => songs.filter(song => !song.isDraft),
    [songs]
  );

  // ... rest of component
}
```

**Recommendation**: Use IIFE (Immediately Invoked Function Expression) for minimal change, or hoist to useMemo for slight performance gain (negligible with 12 songs).

---

## Data Flow Contracts

### Draft Status Change Flow

```
SongDetail: User toggles draft checkbox
       │
       ▼
onUpdate({ ...song, isDraft: !isDraft })
       │
       ▼
App: updateSong(updatedSong)
       │
       ▼
App: setSongs(newSongsArray)
       │
       ▼
React: Trigger re-render of Header + Main
       │
       ├────────────────────────┐
       ▼                        ▼
Header: recalc nonDraftSongs   Main: recalc nonDraftSongs
       │                        │
       ▼                        ▼
Display: X/Y count updated    Display: Z% progress updated
```

**Timing**: Complete flow < 20ms (includes React reconciliation + DOM update)

---

### Stage Progress Change Flow

```
SongCard or SongDetail: User adjusts stage progress
       │
       ▼
onUpdate({ ...song, stages: newStages })
       │
       ▼
App: updateSong(updatedSong)
       │
       ▼
App: setSongs(newSongsArray)
       │
       ▼
React: Trigger re-render of Header + Main
       │
       ├────────────────────────┐
       ▼                        ▼
Header: recalc eligibleCount   Main: recalc albumAverage
 (if song ≥90% threshold)       (if song non-draft)
       │                        │
       ▼                        ▼
Display: X/Y may change       Display: Z% may change
```

**Optimization**: Draft songs' progress changes do NOT affect metrics (filtered out before calculation)

---

## Performance Contracts

### Filter Operation

**Operation**: `songs.filter(song => !song.isDraft)`
**Input Size**: 12 songs
**Time Complexity**: O(n)
**Measured Time**: < 0.5ms

**Contract**: Filter must complete in < 1ms for up to 12 songs

---

### Eligible Count Calculation

**Operation**: `eligibleCount(nonDraftSongs, 90)`
**Input Size**: 0-12 songs (after draft filter)
**Time Complexity**: O(n × m) where m = stages per song
**Measured Time**: < 1ms

**Contract**: Eligible count must complete in < 2ms for up to 12 songs

---

### Overall Progress Calculation

**Operation**: `albumAverage(nonDraftSongs)`
**Input Size**: 0-12 songs (after draft filter)
**Time Complexity**: O(n × m) where m = stages per song
**Measured Time**: < 1.5ms

**Contract**: Overall progress must complete in < 3ms for up to 12 songs

---

### Total Metric Update Time

**Combined Operations**: Filter + eligibleCount + albumAverage
**Measured Time**: < 3ms
**Budget from Success Criteria**: < 100ms (SC-001, SC-004)
**Headroom**: 97ms (32x safety margin)

**Contract**: All metric calculations must complete within 100ms of draft status change

---

## Edge Case Contracts

### All Songs Draft

**Input**: 12 songs, all with `isDraft: true`
**nonDraftSongs**: `[]` (empty array)
**eligibleCount**: 0
**albumAverage**: 0 (returns 0 for empty array)
**Display**: "0/0" song count, "0%" overall progress

**Contract**: No errors, graceful zero display

---

### No Songs Draft

**Input**: 12 songs, all with `isDraft: false`
**nonDraftSongs**: `[...all 12 songs]`
**eligibleCount**: 0-12 (depends on progress)
**albumAverage**: 0-100 (depends on progress)
**Display**: "X/12" song count, "Y%" overall progress

**Contract**: Behavior identical to pre-feature 009

---

### Rapid Toggling

**Input**: User rapidly toggles draft status on 3 songs within 1 second
**Expected**: 3 state updates → 3 re-renders
**React Optimization**: May batch updates if triggered synchronously
**Contract**: No visual glitches, final state correct, performance maintained

---

## Testing Contracts

### Manual Test Scenarios

**Scenario 1: Basic Song Count**
- Mark 3 songs as draft
- Verify display shows "X/(12-3)" format
- Verify numerator X reflects non-draft songs ≥90%

**Scenario 2: Overall Progress Update**
- Mark song with 50% progress as draft
- Verify overall progress recalculates excluding that song
- Example: 12 songs avg 60%, mark 1 at 50% as draft → avg may increase to ~61%

**Scenario 3: Edge Case - All Draft**
- Mark all 12 songs as draft
- Verify "0/0" count
- Verify "0%" progress
- No errors in console

**Scenario 4: Performance**
- Rapidly toggle draft status on 5 songs
- Verify smooth updates (no lag)
- Verify final metrics correct after all toggles

---

## Backward Compatibility Contracts

### Feature 008 Dependency

**Assumption**: All songs have `isDraft` field (boolean)
**Migration**: Feature 008 migrates missing isDraft to `false`
**Contract**: No defensive checks needed (`song.isDraft || false` not required)

**Filter Safety**:
```javascript
// Assumes isDraft exists (feature 008 ensures this)
const nonDraftSongs = songs.filter(song => !song.isDraft);

// NOT NEEDED (feature 008 migration handles this):
const nonDraftSongs = songs.filter(song => !(song.isDraft || false));
```

---

## Summary

**Modified Functions**: 2 (albumAverage, eligibleCount - usage changed, signatures unchanged)
**Modified Components**: 2 (Header, App main render)
**New Variables**: 1 (nonDraftSongs - local to render)
**Performance**: < 3ms metric updates, well under 100ms budget
**Edge Cases**: All handled gracefully (zero values for empty arrays)
**Breaking Changes**: None (external API unchanged, internal filtering added)

**Ready for Testing**: Quickstart manual test scenarios can now be defined.
