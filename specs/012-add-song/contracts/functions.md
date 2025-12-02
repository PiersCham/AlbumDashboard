# Function Contracts: Add New Song

**Feature**: 012-add-song | **Date**: 2025-12-02
**Phase**: 1 (Design & Contracts)

## Core Functions

### `addSong()`

**Purpose**: Create and add a new song to the album with default values.

**Signature**:
```javascript
const addSong = () => void
```

**Preconditions**:
- songs.length < 99 (enforced by button disabled state)
- isStorageQuotaOk === true (enforced by button disabled state)
- User is in grid view (button only visible in grid view)

**Postconditions**:
- New song appended to songs array
- New song has unique ID = max(existing IDs) + 1
- songCount incremented by 1
- localStorage updated with new songs array
- UI re-renders showing new song card in grid

**Side Effects**:
- Mutates React state (setSongs, setSongCount)
- Writes to localStorage
- Triggers React re-render

**Implementation**:
```javascript
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
```

**Error Handling**:
- No explicit error handling needed (preconditions prevent errors)
- localStorage write failure handled by existing useEffect pattern

---

### `removeSong(songId)`

**Purpose**: Remove a song from the album after user confirmation (if it has progress).

**Signature**:
```javascript
const removeSong = (songId: number) => void
```

**Parameters**:
- `songId`: number - The unique ID of the song to remove

**Preconditions**:
- Song with songId exists in songs array
- User is in zoom/detail view for the song
- User has access to "Remove Song" button (only in zoom view)

**Postconditions**:
- If song has progress (average > 0): User confirmed deletion
- Song removed from songs array
- songCount decremented by 1
- localStorage updated with modified songs array
- User navigated back to grid view
- UI re-renders without removed song

**Side Effects**:
- May show confirmation dialog (window.confirm)
- Mutates React state (setSongs, setSongCount)
- Writes to localStorage
- Triggers navigation (onBack())
- Triggers React re-render

**Implementation**:
```javascript
const removeSong = (songId) => {
  const song = songs.find(s => s.id === songId);

  // FR-007: Confirmation dialog for songs with progress
  if (song && songAverage(song) > 0) {
    if (!window.confirm("This song has progress. Are you sure you want to delete it?")) {
      return; // User cancelled
    }
  }

  setSongs(songs.filter(s => s.id !== songId));
  setSongCount(songs.length - 1);
  // Caller (SongDetail component) handles navigation via onBack()
};
```

**Error Handling**:
- Handles non-existent song gracefully (filter returns same array if ID not found)
- Confirmation cancellation handled by early return

---

## Derived Values

### `isStorageQuotaOk`

**Purpose**: Determine if adding another song would exceed localStorage quota.

**Signature**:
```javascript
const isStorageQuotaOk: boolean
```

**Computation**:
```javascript
const isStorageQuotaOk = useMemo(() => {
  try {
    const currentData = JSON.stringify({ songs, albumTitle, targetISO, songCount });
    const bytesUsed = currentData.length * 2; // UTF-16 approximation
    const quotaLimit = 5000000; // 5MB conservative
    return bytesUsed < (quotaLimit * 0.9); // 90% threshold
  } catch {
    return false; // Fail safe
  }
}, [songs, albumTitle, targetISO, songCount]);
```

**Returns**:
- `true`: Safe to add more songs (< 90% of quota)
- `false`: Approaching quota limit, disable "Add Song" button

**Memoization**: Recomputes only when songs, albumTitle, targetISO, or songCount changes

---

### `isAddButtonDisabled`

**Purpose**: Determine if "Add Song" button should be disabled.

**Signature**:
```javascript
const isAddButtonDisabled: boolean
```

**Computation**:
```javascript
const isAddButtonDisabled = songs.length >= 99 || !isStorageQuotaOk;
```

**Returns**:
- `true`: Button disabled (99-song limit or quota exceeded)
- `false`: Button enabled

**Conditions**:
- `songs.length >= 99`: Hard limit reached (FR-009)
- `!isStorageQuotaOk`: Storage quota approaching capacity (FR-005a)

---

## Helper Functions

### `getNextSongId()`

**Purpose**: Calculate the next available song ID without reusing gaps.

**Signature**:
```javascript
const getNextSongId = () => number
```

**Returns**: Next available ID (max existing ID + 1, or 1 if no songs)

**Implementation**:
```javascript
const getNextSongId = () => {
  if (songs.length === 0) return 1;
  return Math.max(...songs.map(s => s.id)) + 1;
};
```

**Note**: Inlined in addSong() implementation (no separate function needed per simplicity principle)

---

### `songAverage(song)` (existing)

**Purpose**: Calculate average progress across all stages of a song.

**Used by**: removeSong() for determining if confirmation needed

**Signature**:
```javascript
const songAverage = (song: Song) => number
```

**Returns**: 0-100 integer representing average stage completion

**Note**: Already exists in codebase, no changes needed

---

## Component Integration Points

### Grid View (App.jsx main render)

**Location**: Between album-wide progress bar and song cards grid

**Addition**:
```jsx
{!currentSong && (
  <div className="px-4 py-2">
    <button
      disabled={isAddButtonDisabled}
      onClick={addSong}
      className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 disabled:cursor-not-allowed"
    >
      Add Song
    </button>
  </div>
)}
```

**Visibility**: Only when `currentSong === null` (grid view)

---

### Zoom View (SongDetail component)

**Location**: In header section next to "Back to Grid" button

**Addition**:
```jsx
<button
  onClick={() => {
    removeSong(song.id);
    onBack();
  }}
  className="px-3 py-2 rounded bg-red-600 hover:bg-red-500"
>
  Remove Song
</button>
```

**Visibility**: Always visible in SongDetail component

**Note**: removeSong() handles confirmation internally, onBack() called after successful removal

---

## Type Definitions (TypeScript reference - not used in project)

```typescript
// For documentation purposes only - project uses JavaScript

interface Song {
  id: number;
  title: string;
  stages: Array<{ name: string; value: number }>;
  tempo: number;
  key: string | null;
  duration: { minutes: number; seconds: number };
  isDraft: boolean;
  side: "" | "1" | "2";
}

type AddSongFn = () => void;
type RemoveSongFn = (songId: number) => void;
type GetNextSongIdFn = () => number;
```
