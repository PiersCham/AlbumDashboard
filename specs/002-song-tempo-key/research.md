# Research: Song Tempo and Key Attributes

**Feature**: 002-song-tempo-key
**Date**: 2025-11-19
**Purpose**: Research validation patterns for musical tempo (BPM), key selection UI design, data storage formats, and migration strategies for adding optional song metadata

## Research Questions

1. How to validate and clamp tempo input (30-300 BPM) with visual feedback?
2. What is the best UI pattern for two-step key selection (note + mode)?
3. How to store tempo (integer with decimal rounding) and key (string with 24 valid values)?
4. What migration strategy works best for adding optional fields to existing songs?

---

## 1. Tempo Validation and Clamping with Visual Feedback

### Decision

Use controlled text input with `onBlur` validation that clamps out-of-range values to nearest boundary (30 or 300 BPM) and provides visual feedback via brief CSS animation (border flash).

### Rationale

- **User-Friendly**: Accepts any text input (including decimals like "135.5")
- **Forgiving**: Clamping is less disruptive than rejecting invalid input with error modal
- **Immediate Feedback**: Visual cue (border flash) confirms clamping occurred
- **Simplicity**: No complex validation UI needed (no error messages, no modal dialogs)

### Implementation Pattern

```javascript
// Validation helper
const validateTempo = (input) => {
  const parsed = parseFloat(input);
  if (isNaN(parsed)) return 120; // Default if non-numeric
  const rounded = Math.round(parsed); // Round to nearest integer
  return Math.max(30, Math.min(300, rounded)); // Clamp to 30-300
};

// In SongCard component
const [tempoInput, setTempoInput] = useState(song.tempo.toString());
const [showTempoFeedback, setShowTempoFeedback] = useState(false);

const handleTempoBlur = () => {
  const validated = validateTempo(tempoInput);
  const wasClamped = validated !== parseFloat(tempoInput);

  onUpdate({ ...song, tempo: validated });
  setTempoInput(validated.toString());

  if (wasClamped) {
    setShowTempoFeedback(true);
    setTimeout(() => setShowTempoFeedback(false), 500); // Flash for 500ms
  }
};

// JSX
<input
  type="text"
  value={tempoInput}
  onChange={(e) => setTempoInput(e.target.value)}
  onBlur={handleTempoBlur}
  className={`... ${showTempoFeedback ? 'border-amber-500 animate-pulse' : ''}`}
  placeholder="120"
/>
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| `<input type="number" min="30" max="300">` | Browser validation UX is poor; can't customize clamping behavior |
| Reject invalid input with error modal | Disruptive to workflow; violates "User Experience is Non-Negotiable" |
| Range slider (`<input type="range">`) | Less precise for specific BPM values; requires typing anyway |
| Validate on every keystroke | Too aggressive; interrupts user while typing |

### Best Practices Applied

- ✅ Validate on blur (non-disruptive timing)
- ✅ Clamp to boundaries instead of rejecting input
- ✅ Provide visual feedback (border color + animation)
- ✅ Round decimals to integers automatically
- ✅ Use sensible default (120 BPM) for non-numeric input

---

## 2. Two-Step Key Selection UI Pattern

### Decision

Implement two dropdown menus:
1. **Note selector**: 12 chromatic notes (C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B)
2. **Mode selector**: 2 modes (Major, Minor)

Display combined key as "{Note} {Mode}" (e.g., "F# Major") with logic to convert enharmonic equivalents based on mode.

### Rationale

- **Reduced Cognitive Load**: 12 notes + 2 modes = 14 total options vs 24 combined options
- **Familiar Pattern**: Matches how musicians think (note first, then mode)
- **Extensible**: Easy to add modes later (Dorian, Phrygian, etc.) if needed
- **Clear State**: Can show "blank" state when no key is selected

### Implementation Pattern

```javascript
// Constants for key selection
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

// Parse key string to [note, mode]
const parseKey = (keyString) => {
  if (!keyString) return [null, null];
  const parts = keyString.split(' ');
  return [parts[0], parts[1]]; // e.g., "F# Major" → ["F#", "Major"]
};

// Convert note based on mode conventions
const normalizeNote = (note, mode) => {
  const conversions = {
    'Major': { 'C#': 'Db', 'D#': 'Eb', 'G#': 'Ab', 'A#': 'Bb' },
    'Minor': { 'Db': 'C#', 'Eb': 'Eb', 'G#': 'G#', 'Ab': 'Ab', 'Bb': 'Bb' }
  };
  return conversions[mode]?.[note] || note;
};

// In SongCard component
const [selectedNote, selectedMode] = parseKey(song.key);

const handleNoteChange = (note) => {
  const mode = selectedMode || 'Major';
  const normalized = normalizeNote(note, mode);
  onUpdate({ ...song, key: note ? `${normalized} ${mode}` : '' });
};

const handleModeChange = (mode) => {
  if (!selectedNote) return; // Can't set mode without note
  const normalized = normalizeNote(selectedNote, mode);
  onUpdate({ ...song, key: `${normalized} ${mode}` });
};

// JSX
<select value={selectedNote || ''} onChange={(e) => handleNoteChange(e.target.value || null)}>
  <option value="">No Key</option>
  {NOTES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
</select>

<select value={selectedMode || ''} onChange={(e) => handleModeChange(e.target.value)} disabled={!selectedNote}>
  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
</select>
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Single dropdown with 24 combined options | High cognitive load; harder to scan long list |
| Autocomplete text input | Requires typing; more error-prone than dropdown |
| Circle of Fifths visual selector | Over-engineering; musicians can navigate list faster |
| Three-step selection (accidental, note, mode) | Unnecessary complexity; enharmonic conversion can be automatic |

### Best Practices Applied

- ✅ Disable mode selector until note is chosen (prevents invalid state)
- ✅ Show "No Key" option for blank state
- ✅ Use conventional sharp/flat notation based on mode
- ✅ Display enharmonic equivalents in dropdown labels (e.g., "C#/Db")
- ✅ Store normalized key string in state (e.g., "F# Major" not "Gb Major")

---

## 3. Data Storage Formats for Tempo and Key

### Decision

**Tempo Storage**:
- Type: `number` (integer)
- Range: 30-300 inclusive
- Default: `120`
- Example: `140`

**Key Storage**:
- Type: `string | null`
- Format: `"{Note} {Mode}"` (e.g., `"A Major"`, `"C# Minor"`)
- Valid notes: C, C#, Db, D, Eb, E, F, F#, G, G#, Ab, A, Bb, B (mixed sharp/flat by convention)
- Valid modes: Major, Minor
- Default: `null` (blank/no key)
- Example: `"F# Major"`

### Rationale

- **Tempo as Integer**: Simpler than string, enables numeric operations, no parsing needed
- **Key as String**: Human-readable in JSON exports, easy to display, no complex object needed
- **Null for Blank Key**: Clear semantic difference between "no key set" vs "C Major"
- **Space-Separated Format**: Easy to parse with `split(' ')`, readable in exports

### Schema Extension

```javascript
// Extended Song entity
{
  id: 1,
  title: "Song Name",
  stages: [
    { name: "Demo", value: 75 },
    { name: "Drums", value: 50 }
  ],
  tempo: 140,           // NEW: integer 30-300, default 120
  key: "F# Major"       // NEW: string "{Note} {Mode}" or null
}
```

### LocalStorage Structure

```json
{
  "songs": [
    {
      "id": 1,
      "title": "Verse Riff",
      "stages": [...],
      "tempo": 145,
      "key": "E Minor"
    }
  ],
  "albumTitle": "Album Dashboard",
  "targetISO": "2026-08-01T00:00:00.000Z"
}
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Store tempo as string ("140 BPM") | Requires parsing for validation; adds "BPM" suffix unnecessarily |
| Store key as object `{note: "F#", mode: "Major"}` | Over-engineering; string is simpler and readable |
| Store key as MIDI note number | Not human-readable in exports; violates Data Integrity principle |
| Use empty string `""` instead of `null` for blank key | `null` is more semantically correct for "no value" |

### Best Practices Applied

- ✅ Use primitive types (number, string, null)
- ✅ Human-readable format (easy to understand in JSON exports)
- ✅ No nested objects unless necessary (Simplicity First)
- ✅ Default values align with industry standards (120 BPM, no key)

---

## 4. Migration Strategy for Adding Optional Fields

### Decision

Extend the existing `migrateSongs()` function to add `tempo` and `key` fields to legacy songs. Use defaults: `120` for tempo, `null` for key.

### Rationale

- **Consistency**: Follows existing migration pattern from feature 001 (`migrateDeadline`)
- **Backward Compatibility**: Old songs load successfully without errors
- **Non-Destructive**: Doesn't modify original data, only adds missing fields
- **Simplicity**: No schema version bump needed, migration is idempotent

### Implementation Pattern

```javascript
// Extend existing migrateSongs function (currently lines 497-507 in App.jsx)
const migrateSongs = (songs) => {
  if (!Array.isArray(songs)) return DEFAULT_SONGS;

  return songs.map(song => ({
    ...song,
    id: song.id ?? Date.now() + Math.random(),
    title: song.title || 'Untitled',
    stages: Array.isArray(song.stages) ? song.stages : [],
    tempo: typeof song.tempo === 'number' ? song.tempo : 120,  // NEW
    key: typeof song.key === 'string' ? song.key : null        // NEW
  }));
};
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Bump schema version to `v4` | Unnecessary; migration is additive, not breaking |
| Create separate `migrateTempoKey()` function | Less maintainable; `migrateSongs` already handles per-song migration |
| Throw error if old schema detected | Violates Data Integrity principle (graceful degradation) |
| Prompt user to set tempo/key for old songs | Poor UX; defaults are sufficient |

### Migration Test Cases

| Scenario | Input | Output |
|----------|-------|--------|
| **New song** | `{ id: 1, title: "Song", stages: [] }` | `{ ..., tempo: 120, key: null }` |
| **Legacy song (no tempo/key)** | `{ id: 2, title: "Old Song", stages: [...] }` | `{ ..., tempo: 120, key: null }` |
| **Song with tempo only** | `{ ..., tempo: 140 }` | `{ ..., tempo: 140, key: null }` |
| **Song with key only** | `{ ..., key: "A Major" }` | `{ ..., tempo: 120, key: "A Major" }` |
| **Song with both** | `{ ..., tempo: 88, key: "C Minor" }` | `{ ..., tempo: 88, key: "C Minor" }` |
| **Invalid tempo (string)** | `{ ..., tempo: "fast" }` | `{ ..., tempo: 120, key: null }` (default) |
| **Invalid key (number)** | `{ ..., key: 440 }` | `{ ..., tempo: 120, key: null }` (default) |

### Best Practices Applied

- ✅ Type-check before accepting stored values
- ✅ Provide sensible defaults (120 BPM, null key)
- ✅ Idempotent migration (safe to run multiple times)
- ✅ No data loss (preserve existing tempo/key if valid)

---

## Summary of Decisions

| Research Question | Decision | Key Takeaway |
|-------------------|----------|--------------|
| **Tempo Validation** | Text input with `onBlur` clamping + visual feedback | Accept any input, clamp to 30-300 BPM, flash border on clamp |
| **Key Selection UI** | Two-step dropdown (note + mode) | Reduces cognitive load from 24 to 14 options |
| **Data Storage** | Tempo as integer, key as string, defaults 120/null | Simple primitive types, human-readable exports |
| **Migration Strategy** | Extend `migrateSongs()` with type checks | Backward-compatible, no schema version bump needed |

## Implementation Checklist

- [ ] Create `validateTempo(input)` helper function
- [ ] Extend `migrateSongs()` to add `tempo` and `key` fields with defaults
- [ ] Update `DEFAULT_SONGS` constant to include `tempo: 120` and `key: null`
- [ ] Add tempo input field to SongCard with validation and visual feedback
- [ ] Add note and mode dropdowns to SongCard with two-step selection logic
- [ ] Create `NOTES` and `MODES` constants for dropdown options
- [ ] Create `parseKey()` and `normalizeNote()` helpers for key handling
- [ ] Update JSON export to include tempo and key (already automatic via state)
- [ ] Update JSON import to validate tempo/key (migration handles this)
- [ ] Add manual test: set tempo to "135.5" (verify rounds to 136)
- [ ] Add manual test: set tempo to "500" (verify clamps to 300 with flash)
- [ ] Add manual test: select "C#" note + "Major" mode (verify displays "Db Major")
- [ ] Add manual test: import old JSON without tempo/key (verify defaults apply)

## References

- Existing codebase: `src/App.jsx` lines 497-507 (`migrateSongs` function)
- Constitution: Principle I (Simplicity First), Principle II (User Experience)
- Feature Spec: `specs/002-song-tempo-key/spec.md` (FR-001 through FR-013)
- Feature 001 Research: `specs/001-persist-due-date/research.md` (migration patterns)
