# Data Model: Song Side Assignment

**Feature**: 010-song-side | **Date**: 2025-11-28

## Entity: Song (Extended)

**Location**: `src/App.jsx` (DEFAULT_SONGS constant, Song object structure)

### Schema

```javascript
{
  id: Number,              // Unique identifier (1-based index)
  title: String,           // Song name (user-editable)
  stages: Array<Stage>,    // Progress tracking for song creation phases
  tempo: Number,           // BPM (30-300, default 120)
  key: String | null,      // Musical key (e.g., "Db Major", null if unset)
  duration: {              // Song length
    minutes: Number,       // 0-59
    seconds: Number        // 0-59
  },
  isDraft: Boolean,        // Draft status (default false)
  side: String             // ← NEW FIELD: Album side assignment
}
```

### New Field: `side`

**Type**: String

**Allowed Values**:
- `""` (empty string) - No side assigned (default)
- `"1"` - Side 1
- `"2"` - Side 2

**Default**: `""` (empty string)

**Validation**: See [contracts/side-validation.md](./contracts/side-validation.md)

**Persistence**: Stored in localStorage (`albumProgress_v3` key) alongside all other song data

**Migration**: Handled by `migrateSongs` function - any missing or invalid `side` value defaults to `""`

### Stage Schema (Unchanged)

```javascript
{
  name: String,    // Stage label (e.g., "Drums", "Mix")
  value: Number    // Progress percentage (0-100)
}
```

## State Management

### Location in Component Tree

**Main State**: `App` component
```javascript
const [songs, setSongs] = useState(() => migrateSongs(stored.songs) || DEFAULT_SONGS);
```

**Detail View State** (`SongDetail` component):
```javascript
const [sideInput, setSideInput] = useState(song.side || "");
const [isValidSide, setIsValidSide] = useState(true);
```

### Update Flow

1. **User types in Side input** → `setSideInput(value)`
2. **User blurs input** → Validation runs
3. **If valid** → `onUpdate({ ...song, side: value })` → `setSongs(...)` → localStorage write
4. **If invalid** → `setIsValidSide(false)` → Red border displayed, no save

### Persistence Flow

```
User Input → Validation → Song State → localStorage
                ↓
              (invalid)
                ↓
          Visual Feedback (red border)
```

## LocalStorage Schema (Extended)

**Key**: `albumProgress_v3`

**Value** (JSON):
```json
{
  "songs": [
    {
      "id": 1,
      "title": "Song 1",
      "stages": [ /* ... */ ],
      "tempo": 120,
      "key": null,
      "duration": { "minutes": 0, "seconds": 0 },
      "isDraft": false,
      "side": ""
    }
    // ... more songs
  ],
  "albumTitle": "Album Dashboard",
  "targetISO": "2026-08-01T00:00:00.000Z",
  "songCount": 12
}
```

**Backward Compatibility**: Importing JSON without `side` field triggers migration (adds `side: ""`)

## Validation Rules

See [contracts/side-validation.md](./contracts/side-validation.md) for detailed validation logic.

**Summary**:
- Input must be empty string, "1", or "2"
- Any other value (including null, undefined, numbers, "3", etc.) defaults to ""
- Validation occurs on blur in detail view
- Migration sanitizes invalid values from imported data

## Migration Logic

**Function**: `migrateSongs(s)` in `src/App.jsx`

**Pseudo-code**:
```javascript
const migrateSongs = (s) => {
  if (!s) return DEFAULT_SONGS;

  const migratedSongs = s.map((song) => {
    // ... existing migrations for stages, tempo, key, duration, isDraft

    // Migrate side field
    const side = typeof song.side === 'string' &&
                 (song.side === "" || song.side === "1" || song.side === "2")
      ? song.side
      : "";

    return { ...song, /* ... existing fields */, side };
  });

  // ... existing duplicate ID handling

  return migratedSongs;
};
```

**Edge Cases Handled**:
- Missing `side` field → `""`
- `side: null` → `""`
- `side: undefined` → `""`
- `side: 3` (number) → `""`
- `side: "3"` (invalid string) → `""`
- `side: "Side 1"` (wrong format) → `""`

## UI Display Logic

### Detail View (SongDetail Component)

**Input Element**:
```javascript
<input
  type="text"
  value={sideInput}
  onChange={(e) => setSideInput(e.target.value)}
  onBlur={handleSideBlur}
  className={`bg-neutral-800 border rounded px-2 py-1 w-12 text-center
              focus:outline-none focus:ring-1 focus:ring-amber-500
              ${isValidSide ? 'border-neutral-700' : 'border-red-500'}`}
  placeholder="1/2"
/>
```

**Label**: "Side:"

**Placement**: After Duration field, in the metadata row (Key, Tempo, Duration, **Side**)

### Grid View (SongCard Component)

**Badge Display**:
```javascript
{song.side && (
  <span className={`text-xs px-2 py-0.5 rounded ${
    song.side === "1" ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
  }`}>
    Side {song.side}
  </span>
)}
```

**Visual Indicator**: Colored badge next to title (Side 1: blue, Side 2: purple, no side: no badge)

## Export/Import Compatibility

**Export**: Side field included in JSON automatically (existing export logic serializes entire song object)

**Import**: Migration handles missing/invalid side values transparently

**Older Version Import**: If user imports JSON with `side` field into older version without this feature, field is silently ignored (no breaking changes)

## Performance Considerations

**Storage Impact**:
- Per song: ~2-3 bytes for side field
- 12 songs: ~24-36 bytes total
- Negligible compared to stages array (~500-800 bytes/song)

**Render Impact**:
- Grid border class changes trigger re-render of affected SongCard only
- Detail view input uses controlled component (standard React pattern)
- No performance degradation expected

**localStorage Impact**:
- Side field adds minimal data to existing JSON structure
- Write occurs on blur (not on every keystroke) - same pattern as Tempo

## Testing Scenarios

1. **New song creation**: Verify `side: ""` default
2. **Side assignment**: Type "1" → Verify saved, border changes
3. **Invalid input**: Type "3" → Verify red border, no save
4. **Clear side**: Empty input → Verify `side: ""`, default border
5. **Import old JSON**: JSON without `side` field → Verify migration adds `side: ""`
6. **Import with invalid side**: JSON with `side: "invalid"` → Verify migration sets `side: ""`
7. **Export/import roundtrip**: Assign sides → Export → Import → Verify sides preserved
8. **Grid display**: Assign different sides → Verify distinct badge colors
9. **Rapid changes**: Type "1", then "2", then "" quickly → Verify final state correct

## Related Documentation

- [Validation Rules](./contracts/side-validation.md) - Detailed validation logic
- [Implementation Quickstart](./quickstart.md) - Step-by-step coding guide
- [Feature Spec](./spec.md) - User stories and requirements
