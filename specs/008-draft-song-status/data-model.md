# Data Model: Draft Song Status

**Feature**: 008-draft-song-status
**Date**: 2025-11-21
**Purpose**: Define data structures, state management, and persistence for draft song status

---

## Song Entity (Extended)

### Schema

**Existing Song Object** (from features 001-007):
```javascript
{
  id: number,              // Unique identifier (1-12)
  title: string,           // Song name
  tempo: number,           // BPM (40-300)
  key: {                   // Musical key
    note: string,          // 'C', 'Db', 'D', etc.
    mode: string           // 'Major' or 'Minor'
  } | null,
  duration: {              // Song length
    minutes: number,       // 0-59
    seconds: number        // 0-59
  },
  stages: [                // Progress tracking
    {
      name: string,
      value: number        // 0-100 percentage
    }
  ]
}
```

**NEW Field**:
```javascript
{
  isDraft: boolean,        // Draft status flag (default: false)
  // ... all existing fields above
}
```

### Field Specifications

#### `isDraft: boolean`

**Type**: Boolean
**Default**: `false` (new songs start as non-draft)
**Required**: No (backward compatible - missing field treated as false)
**Validation**: None (boolean type safety sufficient)
**Constraints**: None
**Mutability**: User-editable via checkbox

**Semantics**:
- `true`: Song is marked as work-in-progress (WIP)
- `false`: Song is considered finalized for album metrics

**Affects**:
- **Visual rendering**: Draft songs display with reduced opacity (60%)
- **Total duration calculation**: Draft songs excluded from album total
- **Export/import**: Included in JSON schema
- **Does NOT affect**: Inline editing, drag-and-drop, zoom view, stage progress

**Persistence**:
- Stored in localStorage alongside other song fields
- Included in JSON export format
- Restored from JSON import (defaults to false if missing)

---

## Component State

### App Component State

**Existing State** (no changes):
```javascript
const [songs, setSongs] = useState(DEFAULT_SONGS); // Array of Song objects
```

**Draft Status Management**:
- No separate state variable needed
- Draft status stored directly in song objects (songs array)
- Updates via existing `updateSong()` handler

### Derived State

**Total Duration Calculation** (modified from feature 006):
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
}, [songs]); // Dependency ensures recalc on draft toggle
```

**Key Change**: Filter operation before reduce to exclude draft songs.

---

## Data Validation

### Draft Status Toggle

**No validation required** - boolean toggle has only two valid states.

**Error Handling**:
```javascript
// Defensive check for missing isDraft field
const isDraftValue = song.isDraft || false;
```

### Backward Compatibility

**Scenario**: Existing localStorage data without `isDraft` field.

**Solution**:
```javascript
// On load from localStorage
const loadedSongs = JSON.parse(localStorage.getItem('albumProgress_v3'));
// No migration needed - JavaScript coerces undefined to false in boolean contexts

// Defensive rendering
<input type="checkbox" checked={song.isDraft || false} />

// Defensive filtering
const nonDraftSongs = songs.filter(song => !(song.isDraft || false));
```

**Guarantees**:
- Songs without `isDraft` default to non-draft (false)
- No breaking changes to existing data
- No schema migration required

---

## Persistence Model

### localStorage Storage

**Key**: `albumProgress_v3` (existing key, no change)

**Value**: JSON string containing songs array

**Write Trigger**: Existing useEffect dependency on songs array
```javascript
useEffect(() => {
  localStorage.setItem('albumProgress_v3', JSON.stringify({ songs, dueDate }));
}, [songs, dueDate]);
```

**Automatic Persistence**: Draft toggle → updateSong → songs state change → useEffect save

### Export Format

**Extended JSON Schema**:
```json
{
  "dueDate": "2025-12-31T00:00:00.000Z",
  "songs": [
    {
      "id": 1,
      "title": "Opening Track",
      "tempo": 120,
      "key": { "note": "C", "mode": "Major" },
      "duration": { "minutes": 3, "seconds": 45 },
      "isDraft": false,
      "stages": [
        { "name": "Demo", "value": 100 },
        { "name": "Lyrics", "value": 80 }
      ]
    },
    {
      "id": 2,
      "title": "WIP Ballad",
      "tempo": 80,
      "key": null,
      "duration": { "minutes": 0, "seconds": 0 },
      "isDraft": true,
      "stages": [
        { "name": "Demo", "value": 30 }
      ]
    }
  ]
}
```

**Schema Change**: Single field addition (`isDraft: boolean`)

**Backward Compatibility**:
- Old exports without `isDraft` import successfully (default to false)
- New exports with `isDraft` import into old app versions (field ignored)

### Import Behavior

**Case 1: Import from old export (no isDraft field)**
```javascript
// Imported song object:
{ id: 1, title: "Song 1", ... /* no isDraft */ }

// Rendering behavior:
song.isDraft || false // → false (defaults to non-draft)
```

**Case 2: Import from new export (has isDraft field)**
```javascript
// Imported song object:
{ id: 1, title: "Song 1", isDraft: true, ... }

// Rendering behavior:
song.isDraft || false // → true (preserves draft status)
```

**No Migration Logic Needed**: JavaScript's truthiness handles both cases.

---

## State Transitions

### Draft Status Lifecycle

```
┌─────────────┐
│  New Song   │
│ isDraft=    │ (default: false)
│   false     │
└──────┬──────┘
       │
       │ User clicks checkbox (mark as draft)
       ▼
┌─────────────┐
│ Draft Song  │
│ isDraft=    │
│   true      │
└──────┬──────┘
       │
       │ User unchecks checkbox (finalize)
       ▼
┌─────────────┐
│Final Song   │
│ isDraft=    │
│   false     │
└─────────────┘
```

**State Transitions**:
1. **New → Draft**: User clicks checkbox (onChange handler)
2. **Draft → Final**: User unchecks checkbox (onChange handler)
3. **Final → Draft**: User re-checks checkbox (reversible)

**No Invalid States**: Boolean toggle prevents intermediate states.

---

## Data Flow Diagram

### Draft Checkbox Toggle Flow

```
User clicks checkbox
       │
       ▼
┌──────────────────────────────────────┐
│ SongCard: onChange handler fires     │
│ event.target.checked → boolean       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ onUpdate({ ...song, isDraft: bool }) │
│ (existing updateSong handler)        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ App: setSongs(newSongs)              │
│ (React state update)                 │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ React re-renders:                    │
│ - SongCard (opacity class applied)   │
│ - Header (total duration recalc)     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ useEffect detects songs change       │
│ → localStorage.setItem(...)          │
└──────────────────────────────────────┘
```

**Single Render Cycle**: Checkbox change → state update → visual feedback + duration update → persistence.

---

## Impact on Existing Features

### Feature 006: Total Album Duration

**Change**: Filter draft songs before reduce operation

**Before**:
```javascript
const totalSeconds = songs.reduce((acc, song) => {
  return acc + (song.duration.minutes * 60) + song.duration.seconds;
}, 0);
```

**After**:
```javascript
const nonDraftSongs = songs.filter(song => !song.isDraft);
const totalSeconds = nonDraftSongs.reduce((acc, song) => {
  return acc + (song.duration.minutes * 60) + song.duration.seconds;
}, 0);
```

**Impact**: Draft songs no longer contribute to total (intentional behavior).

### Feature 007: Song Card Reordering

**Change**: None (draft status moves with song object during drag-and-drop)

**Behavior**: Draft cards remain greyed-out during drag, opacity persists after reorder.

### Feature 005: Song Duration Editing

**Change**: None (draft songs remain fully editable)

**Behavior**: Draft songs can have duration edited, but duration doesn't contribute to total.

### Export/Import

**Change**: isDraft field added to JSON schema

**Impact**: No breaking changes (field optional, defaults to false).

---

## Summary

**Data Model Changes**:
- ✅ Single field addition: `isDraft: boolean`
- ✅ Default value: `false` (non-draft)
- ✅ Backward compatible: Missing field defaults to false
- ✅ Persistence: Automatic via existing useEffect
- ✅ Export/import: Included in JSON schema

**State Management**:
- ✅ No new state variables (stored in songs array)
- ✅ Updates via existing updateSong handler
- ✅ Derived state (total duration) filters draft songs

**Performance**:
- ✅ Filter operation: O(n) with n=12 songs (~6ms)
- ✅ useMemo prevents unnecessary recalculations
- ✅ Well under 100ms performance budget

**Validation**:
- ✅ No validation needed (boolean type)
- ✅ Defensive checks for backward compatibility

**Ready for**: Component API contracts (contracts/component-api.md) and manual testing guide (quickstart.md).
