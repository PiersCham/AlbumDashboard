# API Contracts: Song Tempo and Key Attributes

**Feature**: 002-song-tempo-key
**Date**: 2025-11-19

## Overview

This feature is **client-side only** and does not involve any API endpoints or network communication. All data persistence occurs via browser localStorage and File System Access API (for import/export).

## No API Contracts Required

Since AlbumDashboard is a fully client-side application with no backend, there are no REST, GraphQL, or RPC contracts to define.

## Browser API Usage

### LocalStorage API

**Purpose**: Persist application state including song tempo and key

**Usage**:
```javascript
// Write
localStorage.setItem('albumProgress_v3', JSON.stringify({
  songs: [
    {
      id: 1,
      title: "Song Name",
      stages: [...],
      tempo: 140,         // NEW
      key: "F# Major"     // NEW
    }
  ],
  albumTitle: "...",
  targetISO: "..."
}));

// Read
const data = JSON.parse(localStorage.getItem('albumProgress_v3'));
```

**Contract**:
- **Key**: `albumProgress_v3` (string constant)
- **Value**: JSON string containing `{ songs, albumTitle, targetISO }`
- **New Fields**: Each song includes `tempo` (number) and `key` (string | null)
- **Errors**: May throw `QuotaExceededError` if storage limit exceeded (rare for small data)

### File System Access API

**Purpose**: Export/import JSON files for backup

**Export Usage**:
```javascript
const handle = await window.showSaveFilePicker({
  suggestedName: 'album_dashboard.json',
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
});
const writable = await handle.createWritable();
await writable.write(jsonBlob); // Includes tempo and key
await writable.close();
```

**Import Usage**:
```javascript
const [handle] = await window.showOpenFilePicker({
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
  multiple: false
});
const file = await handle.getFile();
const text = await file.text();
const data = JSON.parse(text);
// migrateSongs() adds defaults for missing tempo/key
```

**Contract**:
- **File Format**: JSON (`.json` extension)
- **Schema**: Same as localStorage structure (see data-model.md)
- **Errors**:
  - `AbortError` if user cancels file picker
  - `SyntaxError` if JSON is malformed
  - `TypeError` if file type is invalid

## Internal Function Contracts

While not API contracts, these internal functions have explicit contracts:

### `validateTempo(input: string): number`

**Purpose**: Validate and normalize tempo input from text field

**Input**:
- `input` (string): User-entered text value

**Output**:
- `number` (integer 30-300): Validated and clamped tempo

**Behavior**:
- Parse input as float
- Round to nearest integer
- Clamp to 30-300 range
- Default to 120 if non-numeric

**Examples**:
```javascript
validateTempo("140")     // → 140
validateTempo("135.5")   // → 136 (rounded)
validateTempo("500")     // → 300 (clamped)
validateTempo("10")      // → 30 (clamped)
validateTempo("abc")     // → 120 (default)
validateTempo("")        // → 120 (default)
```

### `normalizeNote(note: string, mode: string): string`

**Purpose**: Convert note to conventional sharp/flat based on mode

**Input**:
- `note` (string): Musical note (e.g., "C#", "Db")
- `mode` (string): "Major" or "Minor"

**Output**:
- `string`: Normalized note based on convention

**Behavior**:
- For Major: C# → Db, D# → Eb, G# → Ab, A# → Bb
- For Minor: Db → C#, retain G#, Ab, Bb
- Return unchanged if no conversion needed

**Examples**:
```javascript
normalizeNote("C#", "Major")  // → "Db"
normalizeNote("Db", "Minor")  // → "C#"
normalizeNote("F#", "Major")  // → "F#" (unchanged)
normalizeNote("G#", "Minor")  // → "G#" (unchanged)
```

### `parseKey(keyString: string | null): [string | null, string | null]`

**Purpose**: Parse key string into note and mode components

**Input**:
- `keyString` (string | null): Combined key (e.g., "F# Major") or null

**Output**:
- `[note, mode]` tuple (both string or both null)

**Behavior**:
- Split on space character
- Return `[null, null]` if input is null or empty

**Examples**:
```javascript
parseKey("F# Major")   // → ["F#", "Major"]
parseKey("C Minor")    // → ["C", "Minor"]
parseKey(null)         // → [null, null]
parseKey("")           // → [null, null]
```

### `migrateSongs(songs: any[]): Song[]`

**Purpose**: Validate and migrate song array with defaults for tempo/key

**Input**:
- `songs` (any[]): Array of song objects from localStorage or import

**Output**:
- `Song[]`: Valid song array with tempo/key fields guaranteed

**Behavior**:
- Add `tempo: 120` if missing or invalid (not number in range 30-300)
- Add `key: null` if missing or invalid (not string)
- Preserve valid existing tempo/key values

**Examples**:
```javascript
// Legacy song without tempo/key
migrateSongs([
  { id: 1, title: "Song", stages: [] }
])
// → [{ id: 1, title: "Song", stages: [], tempo: 120, key: null }]

// Song with valid tempo/key
migrateSongs([
  { id: 1, title: "Song", stages: [], tempo: 140, key: "A Major" }
])
// → [{ id: 1, title: "Song", stages: [], tempo: 140, key: "A Major" }]

// Song with invalid tempo (out of range)
migrateSongs([
  { id: 1, title: "Song", stages: [], tempo: 500 }
])
// → [{ id: 1, title: "Song", stages: [], tempo: 120, key: null }]
```

## Constants

### `NOTES: Array<{value: string, label: string}>`

**Purpose**: List of valid musical notes for dropdown selection

**Value**:
```javascript
[
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
]
```

**Usage**: Populate note dropdown, 12 chromatic notes

### `MODES: string[]`

**Purpose**: List of valid musical modes for dropdown selection

**Value**:
```javascript
['Major', 'Minor']
```

**Usage**: Populate mode dropdown, 2 modes

### `MIN_TEMPO: number`

**Purpose**: Minimum allowed tempo value

**Value**: `30` (BPM)

### `MAX_TEMPO: number`

**Purpose**: Maximum allowed tempo value

**Value**: `300` (BPM)

### `DEFAULT_TEMPO: number`

**Purpose**: Default tempo for new/legacy songs

**Value**: `120` (BPM)

### `DEFAULT_KEY: null`

**Purpose**: Default key for new/legacy songs

**Value**: `null` (blank/no key)

## Summary

- **No HTTP APIs** - client-side only
- **No GraphQL** - no server component
- **No WebSockets** - no real-time sync
- **Browser APIs only** - localStorage + File System Access API
- **Internal contracts** - validation and migration helpers documented above
- **Constants** - notes, modes, tempo constraints defined

For detailed schema and validation rules, see [data-model.md](../data-model.md).
