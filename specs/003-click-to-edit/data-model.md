# Data Model: Click-to-Edit Tempo and Key Fields

**Feature**: 003-click-to-edit
**Date**: 2025-11-19
**Purpose**: Define state model for edit mode tracking in SongCard and SongDetail components

---

## Entity: EditModeState (Component-Scoped State)

**Description**: Ephemeral state tracking which field (tempo or key) is currently being edited for a specific song. This state is local to each SongCard or SongDetail component instance and is NOT persisted to localStorage.

### Attributes

| Field | Type | Default | Description | Validation |
|-------|------|---------|-------------|------------|
| `isEditingTempo` | Boolean | `false` | Whether the tempo field is currently in edit mode | N/A (boolean) |
| `isEditingKey` | Boolean | `false` | Whether the key field is currently in edit mode | N/A (boolean) |
| `tempTempoValue` | String | `song.tempo.toString()` | Temporary tempo value during edit (before validation/save) | Validated on save via `validateTempo()` |
| `tempKeyNote` | String \| null | `parseKey(song.key)[0]` | Temporary note selection during key edit | Must match NOTES constant values |
| `tempKeyMode` | String \| null | `parseKey(song.key)[1]` | Temporary mode selection during key edit | Must be 'Major' or 'Minor' |

### State Transitions

```
Display Mode (default)
  ↓ (User clicks tempo label)
Edit Tempo Mode
  ↓ (User blurs, presses Enter, or clicks key label)
Display Mode (tempo saved)

Display Mode (default)
  ↓ (User clicks key label)
Edit Key Mode
  ↓ (User blurs, presses Enter, or clicks tempo label)
Display Mode (key saved)

Edit Tempo Mode
  ↓ (User clicks key label)
Edit Tempo Mode → Auto-save → Edit Key Mode

Edit Key Mode
  ↓ (User clicks tempo label)
Edit Key Mode → Auto-save → Edit Tempo Mode

Edit Mode (any field)
  ↓ (User presses Escape)
Display Mode (changes discarded)
```

### Relationships

**EditModeState → Song**:
- One-to-one: Each SongCard/SongDetail has its own EditModeState
- EditModeState modifies Song data only on save (blur, Enter, or field switch)
- Song data remains unchanged during editing (until save)

**No persistence**: EditModeState is ephemeral and resets to default on component unmount or page refresh

---

## Entity: Song (Existing - No Changes)

**Description**: Existing song data model. No modifications required for click-to-edit feature.

### Attributes (relevant to this feature)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique song identifier |
| `title` | String | Song name |
| `tempo` | Number | Tempo in BPM (30-300) |
| `key` | String \| null | Musical key (e.g., "F# Major", "C Minor") or null |

**No schema changes**: Click-to-edit feature does not modify Song entity structure.

---

## Component State Structure

### SongCard Component State

```javascript
function SongCard({ song, onUpdate, onZoom }) {
  // Edit mode state (ephemeral)
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);

  // Temporary values during edit (allow cancellation)
  const [tempTempoValue, setTempTempoValue] = useState(song.tempo.toString());
  const [tempKeyNote, setTempKeyNote] = useState(parseKey(song.key)[0]);
  const [tempKeyMode, setTempKeyMode] = useState(parseKey(song.key)[1]);

  // Existing state (unchanged)
  const [showTempoFeedback, setShowTempoFeedback] = useState(false);

  // ... rest of component
}
```

### SongDetail Component State

```javascript
function SongDetail({ song, onUpdate, onClose }) {
  // Mirror SongCard state structure
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempTempoValue, setTempTempoValue] = useState(song.tempo.toString());
  const [tempKeyNote, setTempKeyNote] = useState(parseKey(song.key)[0]);
  const [tempKeyMode, setTempKeyMode] = useState(parseKey(song.key)[1]);
  const [showTempoFeedback, setShowTempoFeedback] = useState(false);

  // ... rest of component
}
```

---

## State Lifecycle

### 1. Component Mount

```javascript
// Initial state when component renders
isEditingTempo = false
isEditingKey = false
tempTempoValue = song.tempo.toString()  // e.g., "120"
tempKeyNote = parseKey(song.key)[0]     // e.g., "C" or null
tempKeyMode = parseKey(song.key)[1]     // e.g., "Major" or null
```

### 2. Enter Edit Mode (Tempo)

```javascript
// User clicks tempo label
handleTempoLabelClick() {
  if (isEditingKey) {
    // Auto-save key field first
    handleKeySave();
  }
  setIsEditingTempo(true);
  // Auto-focus tempo input (via ref or autoFocus prop)
}
```

### 3. User Edits Tempo

```javascript
// User types in tempo input
handleTempoChange(e) {
  setTempTempoValue(e.target.value);  // Update temp value, don't save yet
}
```

### 4. Save Tempo (Blur or Enter)

```javascript
// User blurs input or presses Enter
handleTempoSave() {
  const validated = validateTempo(tempTempoValue);  // Returns 30-300
  onUpdate({ ...song, tempo: validated });          // Update Song entity
  setTempTempoValue(validated.toString());          // Sync temp value
  setIsEditingTempo(false);                         // Exit edit mode

  // Visual feedback if clamped
  if (validated !== parseFloat(tempTempoValue)) {
    setShowTempoFeedback(true);
    setTimeout(() => setShowTempoFeedback(false), 500);
  }
}
```

### 5. Cancel Edit (Escape)

```javascript
// User presses Escape key
handleTempoCancel() {
  setTempTempoValue(song.tempo.toString());  // Revert to original
  setIsEditingTempo(false);                  // Exit edit mode
  // No validation, no save, no feedback
}
```

### 6. Component Unmount

```javascript
// Component unmounts (user navigates away, closes modal, etc.)
// Edit state is lost (not persisted)
// Song data persists via existing localStorage mechanism
```

---

## Data Flow Diagram

```
┌─────────────────┐
│  Song Entity    │  (Persisted to localStorage)
│  tempo: 120     │
│  key: "C Major" │
└────────┬────────┘
         │ Read on mount
         ▼
┌─────────────────────────────┐
│  SongCard Component State   │  (Ephemeral)
│  isEditingTempo: false      │
│  tempTempoValue: "120"      │
└────────┬────────────────────┘
         │ User clicks label
         ▼
┌─────────────────────────────┐
│  Edit Mode State            │
│  isEditingTempo: true       │
│  tempTempoValue: "120"      │  ← User types "145"
└────────┬────────────────────┘
         │ User blurs/presses Enter
         ▼
┌─────────────────────────────┐
│  Validation & Save          │
│  validateTempo("145") → 145 │
│  onUpdate({ tempo: 145 })   │
└────────┬────────────────────┘
         │ Save successful
         ▼
┌─────────────────┐
│  Song Entity    │  (Updated in localStorage)
│  tempo: 145     │
└─────────────────┘
```

---

## Validation Rules (Existing - No Changes)

### Tempo Validation

- **Function**: `validateTempo(input: string) → number`
- **Rules**:
  - Parse input as float
  - If NaN, return 120 (default)
  - Round to nearest integer
  - Clamp to range [30, 300]
- **No changes**: Existing validation logic reused as-is

### Key Validation

- **Function**: `normalizeNote(note: string, mode: string) → string`
- **Rules**:
  - Apply enharmonic conversions (Db Major, C# Minor, etc.)
  - Return normalized note
- **No changes**: Existing normalization logic reused as-is

---

## Summary

**New state introduced**: 5 state variables per component (2 booleans, 3 temp values)

**Existing state unchanged**: Song entity schema unchanged, validation functions unchanged

**State scope**: Local to component (no global state, no context)

**State persistence**: Edit mode state is NOT persisted (resets on unmount/refresh)

**Data integrity**: Song data only modified on save (blur/Enter), never during typing

**Performance impact**: Negligible (local state updates, no prop drilling, no global re-renders)
