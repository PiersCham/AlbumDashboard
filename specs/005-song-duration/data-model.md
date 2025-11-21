# Data Model: Song Duration Tracking

**Feature**: 005-song-duration
**Date**: 2025-11-21
**Purpose**: Define data model for duration attribute and edit state

---

## Entity: Song (Modified)

**Description**: Existing Song entity extended with duration field. No schema changes to other fields.

### Attributes

| Field | Type | Default | Validation | Description |
|-------|------|---------|------------|-------------|
| `id` | Number | Auto (1-12) | Required, unique | Existing: Song identifier |
| `title` | String | "Song N" | Required, non-empty | Existing: Song name |
| `tempo` | Number | 120 | 30-300 | Existing: Tempo in BPM |
| `key` | String \| null | null | Valid key or null | Existing: Musical key |
| `stages` | Array<Stage> | [...] | Non-empty array | Existing: Production stages |
| **`duration`** | **DurationObject** | **{minutes: 0, seconds: 0}** | **0-59 for both** | **NEW: Song length** |

### DurationObject Structure

```javascript
{
  minutes: Number,  // 0-59, integer
  seconds: Number   // 0-59, integer
}
```

### Validation Rules

- `duration.minutes`: Integer range 0-59 (clamped)
- `duration.seconds`: Integer range 0-59 (clamped)
- Values > 59 are clamped to 59
- Values < 0 are clamped to 0
- Non-numeric values are rejected/reverted

### Example Data

```javascript
// Before (existing song)
{
  id: 1,
  title: "Echoes of Time",
  tempo: 140,
  key: "D Minor",
  stages: [
    { name: "Demo", value: 100 },
    { name: "Drums", value: 75 }
  ]
}

// After (with duration added)
{
  id: 1,
  title: "Echoes of Time",
  tempo: 140,
  key: "D Minor",
  duration: { minutes: 4, seconds: 32 },  // NEW field
  stages: [
    { name: "Demo", value: 100 },
    { name: "Drums", value: 75 }
  ]
}
```

---

## Entity: DurationEditState (Component-Scoped Ephemeral State)

**Description**: Temporary state for duration editing mode. Exists only in SongCard/SongDetail components during active edit. Not persisted.

### Attributes

| Field | Type | Default | Description | Lifecycle |
|-------|------|---------|-------------|-----------|
| `isEditingDuration` | Boolean | false | Whether duration edit mode is active | Set on click, cleared on save/cancel |
| `tempMinutes` | String | "" | Temporary minutes input value | Set on edit start, cleared on save/cancel |
| `tempSeconds` | String | "" | Temporary seconds input value | Set on edit start, cleared on save/cancel |

### State Transitions

```
Idle (display mode)
  ↓ (User clicks on "Duration:" label or value)
isEditingDuration = true, tempMinutes/tempSeconds = current values
  ↓ (User edits inputs)
tempMinutes/tempSeconds updated on keystroke
  ↓ (User presses Enter or clicks outside)
Validate → Clamp → Save to song.duration → isEditingDuration = false → Idle

Editing Active
  ↓ (User presses Escape)
Revert temp values → isEditingDuration = false → Idle (no save)
```

### Validation Flow

```
User Input → Parse to Integer → Clamp to 0-59 → Update song.duration → Persist to localStorage
```

---

## Component State Structure

### SongCard Component State

```javascript
function SongCard({ song, onUpdate, onZoom }) {
  // Existing state (unchanged)
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  // ... other existing state

  // NEW: Duration edit state
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [tempMinutes, setTempMinutes] = useState("");
  const [tempSeconds, setTempSeconds] = useState("");

  // Helper: Format duration for display
  const formatDuration = (minutes, seconds) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor(seconds);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper: Validate and clamp duration values
  const validateDuration = (minutes, seconds) => {
    const clampedMins = Math.max(0, Math.min(59, Math.floor(minutes || 0)));
    const clampedSecs = Math.max(0, Math.min(59, Math.floor(seconds || 0)));
    return { minutes: clampedMins, seconds: clampedSecs };
  };

  // Event handlers (added)
  const handleDurationLabelClick = () => {
    setTempMinutes(song.duration.minutes.toString());
    setTempSeconds(song.duration.seconds.toString());
    setIsEditingDuration(true);
  };

  const handleDurationSave = () => {
    const validated = validateDuration(
      parseInt(tempMinutes),
      parseInt(tempSeconds)
    );
    onUpdate({ ...song, duration: validated });
    setIsEditingDuration(false);
  };

  const handleDurationCancel = () => {
    setTempMinutes("");
    setTempSeconds("");
    setIsEditingDuration(false);
  };

  const handleDurationKeyDown = (e) => {
    if (e.key === 'Enter') handleDurationSave();
    else if (e.key === 'Escape') handleDurationCancel();
  };

  // ... rest of component
}
```

### SongDetail Component State

```javascript
function SongDetail({ song, onUpdate, onBack }) {
  // Mirror SongCard duration state exactly
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [tempMinutes, setTempMinutes] = useState("");
  const [tempSeconds, setTempSeconds] = useState("");

  // Same helpers and handlers as SongCard
  // (ensures identical behavior in both views)
}
```

---

## Data Flow Diagram

```
┌─────────────────┐
│  Song Entity    │  (Persisted to localStorage)
│  duration: {    │
│    minutes: 4,  │
│    seconds: 32  │
│  }              │
└────────┬────────┘
         │ Read on mount
         ▼
┌─────────────────────────────┐
│  SongCard Component State   │  (Ephemeral)
│  isEditingDuration: false   │
│  tempMinutes: ""            │
│  tempSeconds: ""            │
│  Displays: "4:32"           │
└────────┬────────────────────┘
         │ User clicks "Duration:" label
         ▼
┌─────────────────────────────┐
│  Edit Active State          │
│  isEditingDuration: true    │
│  tempMinutes: "4"           │  ← Populated from song.duration
│  tempSeconds: "32"          │
│  Shows: [4] : [32] inputs   │
└────────┬────────────────────┘
         │ User edits to "5" : "15"
         ▼
┌─────────────────────────────┐
│  Modified Temp State        │
│  tempMinutes: "5"           │
│  tempSeconds: "15"          │
└────────┬────────────────────┘
         │ User presses Enter (or blur)
         ▼
┌─────────────────────────────┐
│  Validation                 │
│  parseInt("5") → 5          │
│  parseInt("15") → 15        │
│  Clamp to 0-59 → no change  │
└────────┬────────────────────┘
         │ Valid values
         ▼
┌─────────────────────────────┐
│  Update Song Entity         │
│  onUpdate({ ...song,        │
│    duration: {              │
│      minutes: 5,            │
│      seconds: 15            │
│    }                        │
│  })                         │
└────────┬────────────────────┘
         │ Save successful
         ▼
┌─────────────────┐
│  Song Entity    │  (Updated in localStorage)
│  duration: {    │
│    minutes: 5,  │
│    seconds: 15  │
│  }              │
└─────────────────┘
```

---

## Persistence Model

**What gets persisted**: Song entity with duration object

**What does NOT get persisted**: Edit state (isEditingDuration, tempMinutes, tempSeconds)

**Persistence trigger**: Immediately on Enter key or blur event (same pattern as Tempo editing)

**localStorage key**: `albumDashboard_songs` (existing key)

**Example localStorage value**:
```json
[
  {
    "id": 1,
    "title": "Echoes of Time",
    "tempo": 140,
    "key": "D Minor",
    "duration": { "minutes": 5, "seconds": 15 },
    "stages": [...]
  }
]
```

**Export/Import**: Duration is automatically included in JSON export (part of song object)

**Schema version**: No schema version change needed - additive field with default value

---

## Backward Compatibility

**Migration Strategy**: Lazy initialization on load

```javascript
// In song loading logic (e.g., useEffect or initial state)
const loadSongs = () => {
  const storedSongs = JSON.parse(localStorage.getItem('albumDashboard_songs'));
  return storedSongs.map(song => ({
    ...song,
    duration: song.duration || { minutes: 0, seconds: 0 }  // Add default if missing
  }));
};
```

**Impact**:
- Existing songs without duration get `{minutes: 0, seconds: 0}` on first load
- No data transformation script needed
- First save after loading will persist the default duration
- JSON exports from older versions remain compatible (missing duration treated as 0:00)

---

## Summary

**New entities**: 0 (extends existing Song entity)

**New fields**: 1 (Song.duration)

**Ephemeral state**: 3 variables per component (isEditingDuration, tempMinutes, tempSeconds)

**State persistence**: Song.duration persists immediately on save

**Data integrity**: No data modification to existing fields, additive only

**Backward compatibility**: Lazy default initialization (zero risk)

**Performance impact**: Negligible (simple object field addition, no complex calculations)
