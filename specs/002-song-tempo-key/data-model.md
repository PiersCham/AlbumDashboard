# Data Model: Song Tempo and Key Attributes

**Feature**: 002-song-tempo-key
**Date**: 2025-11-19
**Purpose**: Define the Song entity extensions (tempo and key fields) and their integration with existing data structures

## Overview

This feature extends the existing Song entity in the localStorage data model to include two optional musical metadata fields: **tempo** (beats per minute) and **key** (musical tonality). These fields are backward-compatible and use simple primitive types for storage.

## Entity: Song (Extended)

### Description

Represents a track in the album with progress stages, title, and musical metadata. This feature adds `tempo` and `key` attributes to the existing Song entity.

### Schema

```typescript
// Type definition (for reference - not TypeScript in actual codebase)
type Song = {
  id: number;           // Existing: Unique identifier
  title: string;        // Existing: Song name
  stages: Stage[];      // Existing: Progress tracking stages
  tempo: number;        // NEW: Beats per minute (30-300)
  key: string | null;   // NEW: Musical key or null for blank
};

type Stage = {
  name: string;   // Stage name (e.g., "Demo", "Drums")
  value: number;  // Progress percentage (0-100)
};

// Example with new fields
{
  id: 1,
  title: "Verse Riff",
  stages: [
    { name: "Demo", value: 100 },
    { name: "Drums", value: 75 },
    { name: "Bass", value: 50 }
  ],
  tempo: 145,           // NEW: 145 beats per minute
  key: "E Minor"        // NEW: E Minor key
}
```

### Attributes

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| id | number | Yes | Unique song identifier | Auto-generated if missing (existing) |
| title | string | Yes | Song name | Defaults to "Untitled" (existing) |
| stages | Stage[] | Yes | Progress tracking stages | Defaults to `[]` (existing) |
| **tempo** | **number** | **Yes** | **Beats per minute (BPM)** | **Integer 30-300, default 120** |
| **key** | **string \| null** | **Yes** | **Musical key** | **"{Note} {Mode}" or null, default null** |

### Constraints

**Tempo**:
- **Type**: `number` (JavaScript integer)
- **Range**: 30-300 inclusive
- **Default**: `120` (industry standard tempo)
- **Validation**: Clamp to nearest boundary if outside range, round decimals to nearest integer
- **Display Format**: `"{tempo} BPM"` (e.g., "140 BPM")

**Key**:
- **Type**: `string | null`
- **Format**: `"{Note} {Mode}"` (e.g., "F# Major", "C Minor")
- **Valid Notes**: C, C#, Db, D, Eb, E, F, F#, G, G#, Ab, A, Bb, B (mixed sharp/flat by convention)
- **Valid Modes**: Major, Minor
- **Default**: `null` (blank/no key selected)
- **Display Format**: Displayed as-is (e.g., "F# Major")

### Default Values

When missing or invalid:
```javascript
// Tempo
tempo: typeof song.tempo === 'number' ? song.tempo : 120

// Key
key: typeof song.key === 'string' ? song.key : null
```

### State Transitions

**Tempo**:
```
[User types in input] → [onBlur validation] → [Parse float] → [Round to integer]
→ [Clamp to 30-300] → [Update state] → [Visual feedback if clamped] → [Persist to localStorage]
```

**Key**:
```
[User selects note] → [User selects mode] → [Combine to "{Note} {Mode}"]
→ [Normalize based on mode] → [Update state] → [Persist to localStorage]
```

**Example Tempo Flow**:
1. User types "135.5" in tempo input
2. `onBlur` triggers validation
3. `parseFloat("135.5")` → `135.5`
4. `Math.round(135.5)` → `136`
5. `Math.max(30, Math.min(300, 136))` → `136` (within range, no clamp)
6. State updated: `{ ...song, tempo: 136 }`
7. `useEffect` triggers localStorage save
8. No visual feedback (value not clamped)

**Example Key Flow**:
1. User selects note "C#" from dropdown
2. User selects mode "Major" from dropdown
3. `normalizeNote("C#", "Major")` → `"Db"` (convention: Db Major not C# Major)
4. Combine: `"Db Major"`
5. State updated: `{ ...song, key: "Db Major" }`
6. `useEffect` triggers localStorage save

---

## Integration with Existing Data Model

### LocalStorage Structure

```json
{
  "songs": [
    {
      "id": 1,
      "title": "Verse Riff",
      "stages": [
        { "name": "Demo", "value": 100 },
        { "name": "Drums", "value": 75 }
      ],
      "tempo": 145,           // ← NEW FIELD
      "key": "E Minor"        // ← NEW FIELD
    },
    {
      "id": 2,
      "title": "Chorus Hook",
      "stages": [
        { "name": "Demo", "value": 50 }
      ],
      "tempo": 120,           // ← NEW FIELD (default)
      "key": null             // ← NEW FIELD (blank)
    }
  ],
  "albumTitle": "My Album",
  "targetISO": "2026-08-01T00:00:00.000Z"
}
```

**Storage Key**: `albumProgress_v3` (no version bump needed)

**Schema Changes**:
- **songs[].tempo** (new): integer 30-300
- **songs[].key** (new): string or null

### Relationship to Other Entities

```
┌─────────────────┐
│  AlbumProgress  │  (localStorage root object)
│  (v3 schema)    │
└────────┬────────┘
         │
         ├─── songs[]                (array of Song entities)
         │       │
         │       ├─── id             (number)
         │       ├─── title          (string)
         │       ├─── stages[]       (Stage[])
         │       ├─── tempo          (number) ← NEW
         │       └─── key            (string | null) ← NEW
         │
         ├─── albumTitle             (string)
         └─── targetISO              (string)
```

**Dependencies**:
- **SongCard component**: Displays and edits tempo/key for each song
- **migrateSongs()**: Validates and provides defaults for tempo/key
- **ExportImport component**: Includes tempo/key in JSON export/import (automatic)
- **localStorage persistence**: `useEffect` saves on every state change (automatic)

---

## Validation Rules

### On Load (from localStorage)

```javascript
const migrateSongs = (songs) => {
  if (!Array.isArray(songs)) return DEFAULT_SONGS;

  return songs.map(song => ({
    ...song,
    id: song.id ?? Date.now() + Math.random(),
    title: song.title || 'Untitled',
    stages: Array.isArray(song.stages) ? song.stages : [],

    // NEW: Tempo validation
    tempo: (typeof song.tempo === 'number' && song.tempo >= 30 && song.tempo <= 300)
      ? song.tempo
      : 120,

    // NEW: Key validation
    key: (typeof song.key === 'string' && song.key.trim() !== '')
      ? song.key
      : null
  }));
};
```

**Validation Flow**:
1. **Tempo**: Check type is number AND within range (30-300) → default to 120 if invalid
2. **Key**: Check type is string AND not empty → default to null if invalid

### On User Input (Tempo)

```javascript
const validateTempo = (input) => {
  const parsed = parseFloat(input);
  if (isNaN(parsed)) return 120; // Non-numeric → default
  const rounded = Math.round(parsed); // Round to integer
  return Math.max(30, Math.min(300, rounded)); // Clamp to 30-300
};

const handleTempoBlur = () => {
  const validated = validateTempo(tempoInput);
  const wasClamped = validated !== parseFloat(tempoInput);

  onUpdate({ ...song, tempo: validated });
  setTempoInput(validated.toString());

  if (wasClamped) {
    // Visual feedback (border flash)
    setShowTempoFeedback(true);
    setTimeout(() => setShowTempoFeedback(false), 500);
  }
};
```

**Edge Cases**:
| Input | Parsed | Rounded | Clamped | Final | Feedback |
|-------|--------|---------|---------|-------|----------|
| `"140"` | 140 | 140 | 140 | 140 | No (valid) |
| `"135.5"` | 135.5 | 136 | 136 | 136 | No (rounded, not clamped) |
| `"500"` | 500 | 500 | 300 | 300 | Yes (clamped to max) |
| `"10"` | 10 | 10 | 30 | 30 | Yes (clamped to min) |
| `"abc"` | NaN | - | - | 120 | Yes (default) |
| `""` | NaN | - | - | 120 | Yes (default) |

### On User Input (Key)

```javascript
const NOTES = [
  { value: 'C', label: 'C' },
  { value: 'Db', label: 'C#/Db' },
  { value: 'D', label: 'D' },
  { value: 'Eb', label: 'D#/Eb' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'F#', label: 'F#/Gb' },
  { value: 'G', label: 'G' },
  { value: 'Ab', label: 'G#/Ab' },
  { value: 'A', label: 'A' },
  { value: 'Bb', label: 'A#/Bb' },
  { value: 'B', label: 'B' }
];

const MODES = ['Major', 'Minor'];

const normalizeNote = (note, mode) => {
  // Convert sharps/flats based on mode conventions
  const majorConversions = { 'C#': 'Db', 'D#': 'Eb', 'G#': 'Ab', 'A#': 'Bb' };
  const minorConversions = { 'Db': 'C#', 'G#': 'G#', 'Ab': 'Ab', 'Bb': 'Bb' };

  if (mode === 'Major' && majorConversions[note]) return majorConversions[note];
  if (mode === 'Minor' && minorConversions[note]) return minorConversions[note];
  return note;
};

const handleNoteChange = (note) => {
  const mode = selectedMode || 'Major';
  const normalized = normalizeNote(note, mode);
  onUpdate({ ...song, key: note ? `${normalized} ${mode}` : null });
};

const handleModeChange = (mode) => {
  if (!selectedNote) return; // Can't set mode without note
  const normalized = normalizeNote(selectedNote, mode);
  onUpdate({ ...song, key: `${normalized} ${mode}` });
};
```

**Key Normalization Examples**:
| Input Note | Input Mode | Normalized Note | Final Key |
|------------|------------|-----------------|-----------|
| C# | Major | Db | "Db Major" |
| Db | Minor | C# | "C# Minor" |
| F# | Major | F# | "F# Major" |
| F# | Minor | F# | "F# Minor" |
| G# | Major | Ab | "Ab Major" |
| G# | Minor | G# | "G# Minor" |
| null | - | - | null |

---

## Migration Strategy

### Backward Compatibility

| Source | Scenario | Handling |
|--------|----------|----------|
| **Old localStorage** | Songs without `tempo`/`key` | `migrateSongs` adds defaults (120, null) |
| **Old JSON export** | Imported songs missing `tempo`/`key` | `migrateSongs` adds defaults (120, null) |
| **Invalid tempo (string)** | `tempo: "fast"` | Type check fails → default to 120 |
| **Invalid tempo (out of range)** | `tempo: 500` | Range check fails → default to 120 |
| **Invalid key (number)** | `key: 440` | Type check fails → default to null |
| **Empty key string** | `key: ""` | Trim check fails → default to null |

### Forward Compatibility

Future versions can safely assume all songs have `tempo` (number 30-300) and `key` (string or null) because migration ensures these fields always exist with valid values.

### No Schema Version Bump

Since migration is additive (not breaking), `STORAGE_KEY` remains `"albumProgress_v3"`. Old data is automatically upgraded on load.

---

## Usage Examples

### Reading Tempo and Key

```javascript
// In SongCard component
const SongCard = ({ song, onUpdate }) => {
  const { tempo, key } = song; // Guaranteed to exist after migration

  return (
    <div>
      <div>{tempo} BPM</div>
      <div>{key || 'No key set'}</div>
    </div>
  );
};
```

### Updating Tempo

```javascript
// User types in text input, validation on blur
const [tempoInput, setTempoInput] = useState(song.tempo.toString());

const handleTempoBlur = () => {
  const validated = validateTempo(tempoInput);
  onUpdate({ ...song, tempo: validated });
  setTempoInput(validated.toString());
};

<input
  type="text"
  value={tempoInput}
  onChange={(e) => setTempoInput(e.target.value)}
  onBlur={handleTempoBlur}
/>
```

### Updating Key

```javascript
// Two-step selection: note then mode
const [note, mode] = song.key ? song.key.split(' ') : [null, null];

const handleNoteChange = (newNote) => {
  const currentMode = mode || 'Major';
  const normalized = normalizeNote(newNote, currentMode);
  onUpdate({ ...song, key: newNote ? `${normalized} ${currentMode}` : null });
};

<select value={note || ''} onChange={(e) => handleNoteChange(e.target.value || null)}>
  <option value="">No Key</option>
  {NOTES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
</select>
```

### Persisting Tempo and Key

```javascript
// Auto-save via existing useEffect (no changes needed)
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, targetISO, albumTitle }));
}, [songs, targetISO, albumTitle]);
// ↑ songs array includes tempo and key automatically
```

### Exporting Tempo and Key

```javascript
// Already included in export (no changes needed)
const exportJSON = async () => {
  const data = JSON.stringify({ songs, albumTitle, targetISO }, null, 2);
  // ↑ songs array already contains tempo and key fields
  // ... file save logic ...
};
```

### Importing Tempo and Key

```javascript
// Migration handles validation automatically
const importJSON = async () => {
  const data = JSON.parse(txt);
  const validatedData = {
    songs: migrateSongs(data.songs), // ← Adds defaults for missing tempo/key
    albumTitle: data.albumTitle || 'Album Dashboard',
    targetISO: migrateDeadline(data.targetISO)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedData));
  window.location.reload();
};
```

---

## Testing Scenarios

### Unit Tests (Recommended - if test framework added)

```javascript
describe('migrateSongs - tempo and key', () => {
  it('adds default tempo (120) when missing', () => {
    const song = { id: 1, title: "Song", stages: [] };
    const migrated = migrateSongs([song])[0];
    expect(migrated.tempo).toBe(120);
  });

  it('adds default key (null) when missing', () => {
    const song = { id: 1, title: "Song", stages: [] };
    const migrated = migrateSongs([song])[0];
    expect(migrated.key).toBeNull();
  });

  it('preserves valid tempo', () => {
    const song = { id: 1, title: "Song", stages: [], tempo: 140 };
    const migrated = migrateSongs([song])[0];
    expect(migrated.tempo).toBe(140);
  });

  it('resets invalid tempo (string) to default', () => {
    const song = { id: 1, title: "Song", stages: [], tempo: "fast" };
    const migrated = migrateSongs([song])[0];
    expect(migrated.tempo).toBe(120);
  });

  it('resets out-of-range tempo to default', () => {
    const song = { id: 1, title: "Song", stages: [], tempo: 500 };
    const migrated = migrateSongs([song])[0];
    expect(migrated.tempo).toBe(120);
  });

  it('preserves valid key', () => {
    const song = { id: 1, title: "Song", stages: [], key: "A Major" };
    const migrated = migrateSongs([song])[0];
    expect(migrated.key).toBe("A Major");
  });

  it('resets invalid key (number) to null', () => {
    const song = { id: 1, title: "Song", stages: [], key: 440 };
    const migrated = migrateSongs([song])[0];
    expect(migrated.key).toBeNull();
  });
});

describe('validateTempo', () => {
  it('returns integer unchanged if within range', () => {
    expect(validateTempo("140")).toBe(140);
  });

  it('rounds decimal to nearest integer', () => {
    expect(validateTempo("135.5")).toBe(136);
    expect(validateTempo("135.4")).toBe(135);
  });

  it('clamps values below 30 to 30', () => {
    expect(validateTempo("10")).toBe(30);
  });

  it('clamps values above 300 to 300', () => {
    expect(validateTempo("500")).toBe(300);
  });

  it('returns default (120) for non-numeric input', () => {
    expect(validateTempo("abc")).toBe(120);
    expect(validateTempo("")).toBe(120);
  });
});
```

### Manual Tests

1. **Test Tempo Validation**: Set tempo to "135.5" → verify rounds to 136
2. **Test Tempo Clamping (max)**: Set tempo to "500" → verify clamps to 300 with border flash
3. **Test Tempo Clamping (min)**: Set tempo to "10" → verify clamps to 30 with border flash
4. **Test Tempo Default**: Set tempo to "abc" → verify resets to 120
5. **Test Key Selection**: Select "C#" + "Major" → verify displays "Db Major"
6. **Test Key Blank**: Select "No Key" → verify displays blank state
7. **Test Persistence**: Set tempo/key → refresh browser → verify values persist
8. **Test Export**: Set tempo/key → export JSON → verify file contains fields
9. **Test Import (old)**: Import JSON without tempo/key → verify defaults (120, null)
10. **Test Import (new)**: Import JSON with tempo/key → verify values restored

---

## Summary

- **New Fields**: `tempo` (number 30-300, default 120), `key` (string or null, default null)
- **Storage**: localStorage key `albumProgress_v3.songs[].tempo` and `albumProgress_v3.songs[].key`
- **Validation**: Tempo clamped to 30-300 with rounding; key validated as string or null
- **Migration**: `migrateSongs()` adds defaults for missing/invalid tempo/key
- **UI**: Text input for tempo (onBlur validation), two-step dropdown for key (note + mode)
- **No Schema Version Bump**: Additive change, backward-compatible
