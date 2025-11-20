# Data Model: Song Card Reordering

**Feature**: 007-song-reorder
**Date**: 2025-11-21
**Purpose**: Define data structures and state management for drag-and-drop song reordering

---

## Entity: Song (Extended)

**Description**: Existing song entity with implicit position based on array index. No schema changes required - song order is determined by position in the songs array.

### Attributes

| Field | Type | Existing/New | Validation | Description |
|-------|------|--------------|------------|-------------|
| `id` | Number | Existing | Unique, 1-12 | Song identifier (unchanged) |
| `title` | String | Existing | Non-empty | Song name (unchanged) |
| `stages` | Array<Stage> | Existing | 1+ stages | Progress tracking (unchanged) |
| `tempo` | Number | Existing | >0 | BPM (unchanged) |
| `key` | String\|null | Existing | Valid note+mode | Musical key (unchanged) |
| `duration` | Object | Existing | {minutes: 0-59, seconds: 0-59} | Song length (unchanged) |
| **Implicit: position** | Number | Derived | 0-11 | Array index determines display order |

### Position Semantics

**Important**: Song position is NOT stored as a field. Instead:
- Position is determined by song's index in the `songs` array
- Reordering changes array order, not song properties
- Example: `songs[0]` displays first, `songs[11]` displays last
- No migration required - existing songs array already has implicit ordering

---

## State: Drag Operation State

**Description**: Ephemeral state tracking active drag-and-drop operations. Lives in App component, resets after each drop.

### Attributes

| Field | Type | Initial Value | Validation | Description |
|-------|------|---------------|------------|-------------|
| `draggedIndex` | Number\|null | null | 0-11 or null | Index of song currently being dragged |
| `dropTargetIndex` | Number\|null | null | 0-11 or null | Index where dragged song will be inserted |

### State Lifecycle

```
[No drag] → draggedIndex: null, dropTargetIndex: null

[Drag start] → draggedIndex: N, dropTargetIndex: null
  ↓
[Drag over] → draggedIndex: N, dropTargetIndex: M (M = hover position)
  ↓
[Drop] → Array reordered, both reset to null
  ↓
[Drag end] → draggedIndex: null, dropTargetIndex: null

[Cancel (Escape)] → Both reset to null (no array change)
```

---

## Array Reordering Operation

**Description**: Algorithm for updating songs array order when a drag-and-drop completes.

### Input Parameters

| Parameter | Type | Validation | Description |
|-----------|------|------------|-------------|
| `songs` | Array<Song> | Length 12 | Current songs array |
| `draggedIndex` | Number | 0-11 | Source position |
| `targetIndex` | Number | 0-11 | Destination position |

### Output

| Output | Type | Description |
|--------|------|-------------|
| `newSongs` | Array<Song> | Reordered songs array (immutable copy) |

### Algorithm Steps

1. **Validation**:
   - If `draggedIndex === targetIndex` → return original array (no-op)
   - If `draggedIndex === null` → return original array (invalid state)

2. **Copy Array**:
   - Create shallow copy: `const newSongs = [...songs]`
   - Reason: React state immutability requirement

3. **Remove Dragged Item**:
   - Extract song: `const [draggedSong] = newSongs.splice(draggedIndex, 1)`
   - Array now has 11 items, indices shifted

4. **Insert at Target**:
   - Insert song: `newSongs.splice(targetIndex, 0, draggedSong)`
   - Array back to 12 items, new order established

5. **Return**:
   - Return `newSongs` for state update

### Example

**Before** (songs array):
```javascript
[
  {id: 1, title: "Song 1", ...}, // index 0
  {id: 2, title: "Song 2", ...}, // index 1
  {id: 3, title: "Song 3", ...}, // index 2
  {id: 4, title: "Song 4", ...}, // index 3
]
```

**Drag**: draggedIndex=0 (Song 1), targetIndex=2

**After reorder** (new array):
```javascript
[
  {id: 2, title: "Song 2", ...}, // index 0 (was 1)
  {id: 3, title: "Song 3", ...}, // index 1 (was 2)
  {id: 1, title: "Song 1", ...}, // index 2 (was 0 - MOVED HERE)
  {id: 4, title: "Song 4", ...}, // index 3 (unchanged)
]
```

---

## Persistence Model

**Description**: How reordered song list persists to localStorage.

### Storage Key

`STORAGE_KEY = "albumProgress_v3"` (existing constant)

### Storage Format

```javascript
{
  songs: [
    {id: 1, title: "...", stages: [...], tempo: 120, key: "C Major", duration: {...}},
    {id: 2, title: "...", ...},
    // ... songs in display order (array index = position)
  ],
  albumTitle: "My Album",
  targetISO: "2025-12-31T23:59:00Z"
}
```

**Key Point**: Song order in the JSON array IS the display order. No separate `position` field needed.

### Persistence Trigger

**Existing pattern** (no changes required):
```javascript
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    songs,
    albumTitle,
    targetISO
  }));
}, [songs, albumTitle, targetISO]);
```

- When `songs` array is reordered → useEffect fires → localStorage updates
- Automatic via React's dependency tracking
- No manual persistence calls needed in drag handlers

### Load on Mount

**Existing pattern** (no changes required):
```javascript
const storedData = localStorage.getItem(STORAGE_KEY);
if (storedData) {
  const { songs, albumTitle, targetISO } = JSON.parse(storedData);
  setSongs(songs); // Array order is preserved
}
```

- Songs load in the order they were saved
- Array order defines display order
- No migration logic needed

---

## Data Flow Diagram

```
┌─────────────────────────┐
│  User drags Song Card   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  onDragStart(index)             │
│  → setDraggedIndex(index)       │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  User hovers over target        │
│  onDragOver(targetIndex)        │
│  → setDropTargetIndex(target)   │
│  → preventDefault() (enable drop)│
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  User releases mouse (drop)     │
│  onDrop(targetIndex)            │
│  1. Validation checks           │
│  2. newSongs = [...songs]       │
│  3. Remove: splice(dragged, 1)  │
│  4. Insert: splice(target, 0)   │
│  5. setSongs(newSongs)          │
│  6. Reset drag state            │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  useEffect detects songs change │
│  → localStorage.setItem(...)    │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Song list re-renders in new    │
│  order (array indices updated)  │
└─────────────────────────────────┘
```

---

## Visual State Indicators

**Description**: CSS classes applied based on drag state to provide visual feedback.

| Condition | CSS Class | Visual Effect | Purpose |
|-----------|-----------|---------------|---------|
| Card is being dragged | `opacity-50` | 50% transparency | Shows card is in "drag" state |
| Card is drop target | `border-t-2 border-amber-500` | 2px amber line above | Shows insertion point |
| Card is not involved | (default classes) | Normal appearance | No visual change |

**Implementation**:
```javascript
<div className={`
  ... existing SongCard classes ...
  ${draggedIndex === index ? 'opacity-50' : ''}
  ${dropTargetIndex === index ? 'border-t-2 border-amber-500' : ''}
`}>
```

---

## Edge Cases and Data Integrity

### Same-Position Drop
**Scenario**: User drags card and drops it at its original position
**Handling**: No-op (return early, no state update)
```javascript
if (draggedIndex === targetIndex) return;
```
**Data Integrity**: Original order preserved, no unnecessary re-renders

### Cancelled Drag
**Scenario**: User presses Escape during drag
**Handling**: Reset drag state, no array reordering
```javascript
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && draggedIndex !== null) {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }
};
```
**Data Integrity**: Original order preserved

### Interrupted Drag
**Scenario**: User switches tabs or loses focus mid-drag
**Handling**: onDragEnd fires automatically, cleanup state
```javascript
const handleDragEnd = () => {
  setDraggedIndex(null);
  setDropTargetIndex(null);
};
```
**Data Integrity**: Drag state cleaned up, no corrupted state

### Invalid Drag State
**Scenario**: draggedIndex is null when drop event fires (edge case)
**Handling**: Defensive check, early return
```javascript
if (draggedIndex === null) return;
```
**Data Integrity**: Prevents undefined behavior

---

## Export/Import Compatibility

**No changes required** - song order is already part of exported JSON:

### Export Format
```json
{
  "songs": [
    {"id": 2, "title": "Song 2", ...},
    {"id": 1, "title": "Song 1", ...},
    {"id": 3, "title": "Song 3", ...}
  ],
  "albumTitle": "My Album",
  "targetISO": "2025-12-31T23:59:00Z"
}
```

- Array order in JSON = display order
- Import preserves array order
- No migration or schema version changes needed

---

## Summary

**Data Changes**: None (zero schema changes)
- Songs array already has implicit ordering via indices
- No new fields added to Song entity
- No localStorage format changes

**State Additions**: 2 ephemeral state variables
- `draggedIndex`: Tracks active drag operation
- `dropTargetIndex`: Tracks hover position for visual feedback

**Persistence**: Automatic via existing useEffect
- Reordering triggers songs state update
- useEffect detects change and persists to localStorage
- No manual persistence calls needed

**Data Integrity**: Preserved via immutable updates
- Defensive validation checks
- Cancelled drags restore original order
- Edge cases handled gracefully

**Export/Import**: Fully compatible
- Array order already exported/imported
- No breaking changes to JSON schema
