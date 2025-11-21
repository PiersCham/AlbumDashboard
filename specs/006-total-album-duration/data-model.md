# Data Model: Total Album Duration Display

**Feature**: 006-total-album-duration
**Date**: 2025-11-21
**Purpose**: Define data model for total duration calculation and display

---

## Entity: Total Duration (Derived Value)

**Description**: Calculated aggregate representing the sum of all song durations. This is not a stored entity but a derived value computed from existing song data.

### Attributes

| Field | Type | Derived From | Validation | Description |
|-------|------|--------------|------------|-------------|
| `totalMinutes` | Number | songs array | ≥0, integer | Total duration in minutes (computed) |

### Calculation Method

**Input**: Array of songs with duration field `{minutes: number, seconds: number}`

**Output**: Total minutes as integer

**Formula**:
```javascript
totalMinutes = Math.floor(
  songs.reduce((acc, song) => {
    const songSeconds = (song.duration.minutes * 60) + song.duration.seconds;
    return acc + songSeconds;
  }, 0) / 60
);
```

### Derivation Rules

1. **Sum all song seconds**: Convert each song's `{minutes, seconds}` to total seconds
2. **Handle missing/invalid data**: Treat missing duration as `{minutes: 0, seconds: 0}`
3. **Clamp negative values**: Use `Math.max(0, value)` for each duration component
4. **Convert to total minutes**: Divide total seconds by 60, floor to integer

---

## Entity: Formatted Duration (Display String)

**Description**: Formatted string representation of total duration for display in UI

### Attributes

| Field | Type | Derived From | Format Rules | Description |
|-------|------|--------------|--------------|-------------|
| `formattedDuration` | String | totalMinutes | See format table | Display-ready duration string |

### Format Rules

| Total Minutes | Display Format | Example | Rule |
|---------------|----------------|---------|------|
| 0-59 | "Xm" | "45m" | Minutes only |
| 60-119 | "1h Ym" | "1h 23m" | Hours + minutes |
| 120-179 | "2h Ym" | "2h 45m" | Hours + minutes |
| Exact hours (Xh 0m) | "Xh" | "2h", "3h" | Omit zero minutes |
| ≥59940 | "999h+" | "999h+" | Cap at 999 hours |

### Formatting Logic

```javascript
function formatTotalDuration(totalMinutes) {
  if (totalMinutes >= 59940) return "999h+"; // 999 hours * 60 minutes

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
```

---

## Component State Structure

### Header Component State

**No new state variables** - Total duration is purely derived using React useMemo

```javascript
function Header({ targetISO, setTargetISO, songs, albumTitle, setAlbumTitle }) {
  // Existing state (unchanged)
  const { days, hours, minutes, seconds } = useCountdown(targetISO);
  const [editingDate, setEditingDate] = useState(false);

  // NEW: Derived total duration (memoized)
  const totalDuration = useMemo(() => {
    const totalSeconds = songs.reduce((acc, song) => {
      if (!song.duration) return acc;

      const minutes = Math.max(0, song.duration.minutes || 0);
      const seconds = Math.max(0, song.duration.seconds || 0);
      const songSeconds = (minutes * 60) + seconds;

      return acc + songSeconds;
    }, 0);

    return Math.floor(totalSeconds / 60); // Total minutes
  }, [songs]);

  // NEW: Formatted display string
  const formattedDuration = formatTotalDuration(totalDuration);

  // ... rest of component
}
```

---

## Data Flow Diagram

```
┌─────────────────────────┐
│  songs Array            │  (Existing data from localStorage)
│  [                      │
│    {                    │
│      id: 1,             │
│      title: "Song 1",   │
│      duration: {        │
│        minutes: 3,      │
│        seconds: 45      │
│      }                  │
│    },                   │
│    ...                  │
│  ]                      │
└──────────┬──────────────┘
           │ Passed as prop to Header
           ▼
┌─────────────────────────────────┐
│  useMemo Calculation            │  (Runs on songs change)
│  1. Convert each song to        │
│     total seconds               │
│  2. Sum all song seconds        │
│  3. Divide by 60 to get total   │
│     minutes                     │
│  Output: totalMinutes = 225     │
└──────────┬──────────────────────┘
           │ Total minutes (integer)
           ▼
┌─────────────────────────────────┐
│  formatTotalDuration()          │  (Pure function)
│  Input: 225                     │
│  Logic:                         │
│    hours = 225 / 60 = 3         │
│    minutes = 225 % 60 = 45      │
│  Output: "3h 45m"               │
└──────────┬──────────────────────┘
           │ Formatted string
           ▼
┌─────────────────────────────────┐
│  Header Component JSX           │
│  <div className="...">          │
│    {formattedDuration}          │
│  </div>                         │
│  Displays: "3h 45m"             │
└─────────────────────────────────┘
```

---

## Persistence Model

**What gets persisted**: Individual song durations (existing feature 005 data)

**What does NOT get persisted**: Total duration (calculated on demand)

**Recalculation triggers**:
- Component mount (Header renders)
- songs array changes (song added/removed/updated)

**No localStorage writes**: Total duration is purely derived, no persistence needed

**Export/Import**: Total can be recalculated from exported song data

---

## Example Data Transformations

### Example 1: Short Album (<60 minutes)

**Input (songs)**:
```javascript
[
  { duration: { minutes: 3, seconds: 30 } },  // 210 seconds
  { duration: { minutes: 4, seconds: 15 } },  // 255 seconds
  { duration: { minutes: 2, seconds: 45 } }   // 165 seconds
]
```

**Calculation**:
- Total seconds: 210 + 255 + 165 = 630 seconds
- Total minutes: 630 / 60 = 10.5 → Math.floor = 10 minutes

**Output**: "10m"

---

### Example 2: Standard Album (60+ minutes)

**Input (songs)**:
```javascript
[
  { duration: { minutes: 5, seconds: 20 } },  // 320 seconds
  { duration: { minutes: 4, seconds: 10 } },  // 250 seconds
  { duration: { minutes: 3, seconds: 45 } },  // 225 seconds
  ... (9 more songs averaging 4 minutes each)
]
```

**Calculation**:
- Total seconds: ~2700 seconds
- Total minutes: 2700 / 60 = 45 minutes

**Output**: "45m" (if under 60) or "1h 15m" (if 75 total)

---

### Example 3: Long Album (2+ hours)

**Input (songs)**:
```javascript
[
  { duration: { minutes: 12, seconds: 30 } }, // 750 seconds
  ... (11 more songs averaging 10 minutes each)
]
```

**Calculation**:
- Total seconds: ~7950 seconds
- Total minutes: 7950 / 60 = 132.5 → Math.floor = 132 minutes

**Output**: "2h 12m"

---

### Example 4: Exact Hours

**Input (songs)**:
```javascript
[
  { duration: { minutes: 10, seconds: 0 } },  // 600 seconds (x12 songs)
]
```

**Calculation**:
- Total seconds: 600 * 12 = 7200 seconds
- Total minutes: 7200 / 60 = 120 minutes

**Output**: "2h" (omits "0m")

---

### Example 5: Edge Cases

**Input**: Empty songs array `[]`

**Output**: "0m"

---

**Input**: Songs with missing duration
```javascript
[
  { duration: { minutes: 3, seconds: 30 } },
  { /* duration field missing */ },
  { duration: { minutes: 2, seconds: 15 } }
]
```

**Calculation**: Missing duration treated as 0:00
- Total seconds: 210 + 0 + 135 = 345 seconds
- Total minutes: 345 / 60 = 5.75 → Math.floor = 5 minutes

**Output**: "5m"

---

**Input**: Invalid negative duration
```javascript
[
  { duration: { minutes: -5, seconds: 30 } },
  { duration: { minutes: 3, seconds: -10 } }
]
```

**Calculation**: Negative values clamped to 0
- Song 1: Math.max(0, -5) * 60 + Math.max(0, 30) = 30 seconds
- Song 2: Math.max(0, 3) * 60 + Math.max(0, -10) = 180 seconds
- Total: 210 seconds = 3.5 minutes → Math.floor = 3 minutes

**Output**: "3m"

---

## Summary

**New entities**: 0 (purely derived value, no stored data)

**Derived values**: 2 (totalMinutes, formattedDuration)

**State variables**: 0 (useMemo only, no useState)

**Data sources**: 1 (songs array from existing data)

**Calculation complexity**: O(n) where n = number of songs (12 songs, <1ms)

**State persistence**: None (derived from persisted song data)

**Backward compatibility**: 100% (uses existing song.duration field from feature 005)

**Performance impact**: Negligible (memoized calculation, only runs on songs change)
