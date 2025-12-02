# Data Model: Add New Song

**Feature**: 012-add-song | **Date**: 2025-12-02
**Phase**: 1 (Design & Contracts)

## Entities

### Song (existing, no changes)

**Purpose**: Represents a single track in the album with progress tracking across multiple stages.

**Fields**:

| Field | Type | Constraints | Default | Notes |
|-------|------|-------------|---------|-------|
| id | number | unique, positive integer | next available ID | Generated via Math.max(ids) + 1 |
| title | string | non-empty | "Song {id}" | User-editable via EditableText |
| stages | Array<{name: string, value: number}> | min length 0 | DEFAULT_STAGE_NAMES mapped | Each stage has 0-100 progress value |
| tempo | number | 30-300 integer | 120 | BPM, validated on input |
| key | string \| null | valid music key or null | null | Format: "{Note} {Mode}" (e.g., "C Major") |
| duration | {minutes: number, seconds: number} | 0-59 for each | {0, 0} | User-editable via inline inputs |
| isDraft | boolean | - | false | Excludes from totals/counts when true |
| side | string | "", "1", or "2" | "" | Vinyl side assignment |

**Relationships**:
- Contained in `songs` array (App.jsx state)
- Referenced by `currentSong` state (for zoom view)
- Persisted in localStorage under key `albumProgress_v3`

**Validation Rules** (from spec requirements):
- ID must be unique within songs array
- ID generation must never reuse gaps from deleted songs
- All fields required (no partial songs)
- Stages array can be empty but defaults to 8 stages
- Duration minutes/seconds clamped to 0-59 range
- Side must be empty string, "1", or "2" only

**State Transitions**:
```
[Non-existent] --[Add Song]--> [New Song (all defaults)]
[New Song] --[Edit Fields]--> [Modified Song]
[Modified Song] --[Remove (no progress)]--> [Deleted]
[Modified Song with progress] --[Remove + Confirm]--> [Deleted]
```

### Songs Collection (App.jsx state)

**Purpose**: Array of all songs in the album, persisted to localStorage.

**Type**: `Array<Song>`

**Constraints**:
- Maximum 99 songs (FR-009)
- Minimum 0 songs (can delete all)
- IDs must be unique (enforced by generation logic)
- Order matters (display order in grid)

**Operations**:

| Operation | Trigger | State Change | Persistence |
|-----------|---------|--------------|-------------|
| Add Song | User clicks "Add Song" button | Append new Song with next ID | Immediate (useEffect) |
| Remove Song | User confirms deletion in zoom view | Filter out song by ID | Immediate (useEffect) |
| Edit Song | User modifies fields (existing) | Update song in array by ID | Immediate (useEffect) |
| Reorder Songs | Drag-drop (existing) | Rearrange array elements | Immediate (useEffect) |

**Derived Values**:
- `songCount`: Length of songs array (also stored separately for visibility control)
- `visibleSongs`: songs.slice(0, songCount)
- `nonDraftSongs`: songs.filter(s => !s.isDraft)
- `albumAverage`: Average progress across non-draft songs

## State Management

### New State (none required)

No new React state needed - feature uses existing state:
- `songs` (useState) - already exists
- `songCount` (useState) - already exists
- `currentSong` (derived from hash) - already exists

### New Handlers

```javascript
// Add song handler
const addSong = () => {
  const newId = Math.max(...songs.map(s => s.id), 0) + 1;
  const newSong = {
    id: newId,
    title: `Song ${newId}`,
    stages: DEFAULT_STAGE_NAMES.map(name => ({ name, value: 0 })),
    tempo: DEFAULT_TEMPO,
    key: null,
    duration: { minutes: 0, seconds: 0 },
    isDraft: false,
    side: ""
  };
  setSongs([...songs, newSong]);
  setSongCount(songs.length + 1);
};

// Remove song handler
const removeSong = (songId) => {
  const song = songs.find(s => s.id === songId);

  // Confirmation if song has progress (FR-007)
  if (song && songAverage(song) > 0) {
    if (!window.confirm("This song has progress. Are you sure you want to delete it?")) {
      return;
    }
  }

  setSongs(songs.filter(s => s.id !== songId));
  setSongCount(songs.length - 1);
};
```

### Storage Quota Check

```javascript
// Memoized storage quota check (FR-005a)
const isStorageQuotaOk = useMemo(() => {
  try {
    const currentData = JSON.stringify({ songs, albumTitle, targetISO, songCount });
    const bytesUsed = currentData.length * 2; // UTF-16
    const quotaLimit = 5000000; // 5MB conservative estimate
    return bytesUsed < (quotaLimit * 0.9); // 90% threshold
  } catch {
    return false; // Fail safe
  }
}, [songs, albumTitle, targetISO, songCount]);
```

### Button Disabled Logic

```javascript
// "Add Song" button disabled when:
const isAddButtonDisabled = songs.length >= 99 || !isStorageQuotaOk;
```

## Data Flow

### Add Song Flow

```
User clicks "Add Song"
  ↓
Generate next ID (max + 1)
  ↓
Create new Song object with defaults
  ↓
setSongs([...songs, newSong])
  ↓
setSongCount(songs.length + 1)
  ↓
useEffect detects songs change
  ↓
localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, ... }))
  ↓
React re-renders grid with new song card
```

### Remove Song Flow

```
User opens zoom view for song
  ↓
User clicks "Remove Song" button
  ↓
If songAverage(song) > 0: show confirmation
  ↓
If not confirmed: abort
  ↓
setSongs(songs.filter(s => s.id !== songId))
  ↓
setSongCount(songs.length - 1)
  ↓
Navigate back to grid (onBack())
  ↓
useEffect detects songs change
  ↓
localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, ... }))
  ↓
React re-renders grid without removed song
```

## Migration Impact

**No migration required** - New songs use existing schema:
- All fields already defined in Song type
- Default values compatible with existing songs
- Removal doesn't affect data structure
- Export/import already handles variable-length songs array

## Validation

### On Add
- ✅ ID uniqueness (Math.max ensures no conflicts)
- ✅ All required fields present (defaults provided)
- ✅ 99-song limit (button disabled)
- ✅ Storage quota (button disabled)

### On Remove
- ✅ Song exists before removal (find() check)
- ✅ Progress confirmation (songAverage() > 0)
- ✅ State consistency (filter by ID, can't fail)

## Performance Considerations

- **ID generation**: O(n) where n = number of songs (max 99, negligible)
- **Storage estimation**: O(n) JSON.stringify (memoized, recalcs only when songs change)
- **Add operation**: O(n) spread operator (max 99 elements, <1ms)
- **Remove operation**: O(n) filter (max 99 elements, <1ms)

All operations well within <100ms performance goal.
