# Component API Contract: Total Album Duration Display

**Feature**: 006-total-album-duration
**Date**: 2025-11-21
**Purpose**: Define the component interface contracts for total duration calculation and display

---

## Header Component API (Modified)

### Props (Unchanged)

```typescript
interface HeaderProps {
  targetISO: string;           // Existing: ISO datetime for countdown
  setTargetISO: (iso: string) => void;  // Existing: Update target deadline
  songs: Array<Song>;          // Existing: Song data array (now used for duration calc)
  albumTitle: string;          // Existing: Album name
  setAlbumTitle: (title: string) => void;  // Existing: Update album title
}
```

**No prop changes**: Total duration is derived from existing `songs` prop.

### New Internal Derived Values

```typescript
interface DurationDerivedState {
  totalDuration: number;        // Total minutes (memoized calculation)
  formattedDuration: string;    // Display string (e.g., "1h 23m")
}
```

---

## Helper Functions API

### formatTotalDuration()

**Purpose**: Convert total minutes to display string with adaptive format

**Signature**:
```typescript
function formatTotalDuration(totalMinutes: number): string
```

**Parameters**:
- `totalMinutes`: Number (≥0), total album duration in minutes

**Returns**: String in adaptive format based on total duration

**Format Rules**:
- 0-59 minutes: "Xm" (e.g., "45m")
- 60+ minutes with remainder: "Xh Ym" (e.g., "1h 23m")
- Exact hours: "Xh" (e.g., "2h")
- ≥59940 minutes: "999h+"

**Examples**:
```javascript
formatTotalDuration(45)    → "45m"
formatTotalDuration(0)     → "0m"
formatTotalDuration(60)    → "1h"
formatTotalDuration(83)    → "1h 23m"
formatTotalDuration(120)   → "2h"
formatTotalDuration(135)   → "2h 15m"
formatTotalDuration(60000) → "999h+"  (capped)
```

**Implementation**:
```javascript
const formatTotalDuration = (totalMinutes) => {
  if (totalMinutes >= 59940) return "999h+";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};
```

---

## Header Component Internal Logic

### Total Duration Calculation (useMemo)

**Purpose**: Calculate total album duration from all songs

**Dependencies**: `[songs]` (recalculates when songs array changes)

**Calculation Steps**:
1. Reduce songs array to total seconds
2. Handle missing/invalid durations (treat as 0:00)
3. Clamp negative values to 0
4. Convert total seconds to total minutes (floor)

**Implementation**:
```javascript
const totalDuration = useMemo(() => {
  const totalSeconds = songs.reduce((acc, song) => {
    if (!song.duration) return acc; // Handle missing duration field

    const minutes = Math.max(0, song.duration.minutes || 0);
    const seconds = Math.max(0, song.duration.seconds || 0);
    const songSeconds = (minutes * 60) + seconds;

    return acc + songSeconds;
  }, 0);

  return Math.floor(totalSeconds / 60); // Return total minutes
}, [songs]);
```

**Return Value**: Total duration in minutes (integer, ≥0)

---

### Formatted Duration String

**Purpose**: Generate display-ready string from total duration

**Implementation**:
```javascript
const formattedDuration = formatTotalDuration(totalDuration);
```

**Return Value**: String (e.g., "1h 23m", "45m")

---

## Rendering Logic

### Display Location

**Position**: Between album title and countdown timer (replaces song count "X/13")

**Before** (line 342-344):
```javascript
<div className="text-2xl font-black tracking-wider">
  {eligibleCount(songs, 90)}/13
</div>
```

**After**:
```javascript
<div className="text-2xl font-black tracking-wider">
  {formattedDuration}
</div>
```

### Complete Header JSX Structure

```javascript
return (
  <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4">
    <div className="flex items-center gap-4">
      <EditableText
        text={albumTitle}
        onSubmit={setAlbumTitle}
        className="text-2xl font-black tracking-wider"
        placeholder="Album Title"
      />
    </div>

    {/* NEW: Total duration display */}
    <div className="text-2xl font-black tracking-wider">
      {formattedDuration}
    </div>

    <div className="flex items-center gap-3 text-right">
      {/* Existing countdown timer */}
      ...
    </div>
  </div>
);
```

---

## Component Interaction Contract

### Parent Component → Header

**Input (via props)**:
- `songs`: Array of song objects with duration field

**Guarantees**:
- Songs array is not modified by Header component
- Total duration is recalculated when songs array reference changes
- Calculation handles missing/invalid duration fields gracefully

### Header → Display

**Output (via JSX)**:
- Formatted total duration string displayed in center of Header
- No user interaction (read-only display)
- Updates automatically when songs change

### Data Integrity Contract

**Calculation accuracy**:
- Input: Songs with durations [3:30, 4:15, 2:45]
- Processing: Convert to seconds [210, 255, 165], sum = 630 seconds
- Output: 630 / 60 = 10.5 → Math.floor = 10 minutes
- Display: "10m"

**Edge case handling**:
- Input: Empty songs array []
- Output: "0m"

**Edge case handling (missing duration)**:
- Input: Song without duration field
- Processing: Treat as 0:00, continue calculation
- Output: Sum of valid durations only

**Edge case handling (invalid duration)**:
- Input: Song with negative duration {minutes: -5, seconds: 30}
- Processing: Clamp to {minutes: 0, seconds: 30}
- Output: Calculation continues with clamped value

---

## Layout and Styling Contract

### Typography

**Matches existing Header text elements**:
- Font size: `text-2xl` (1.5rem)
- Font weight: `font-black` (900)
- Letter spacing: `tracking-wider` (0.05em)

### Responsive Behavior

**Desktop (≥1024px)**:
- Header uses `flex-row` layout
- Total duration appears between album title and countdown
- All elements aligned on single row

**Mobile (<1024px)**:
- Header uses `flex-col` layout
- Elements stack vertically
- Total duration maintains same text styling

### Visual Hierarchy

**Equal visual weight** with album title and countdown:
- Same font size and weight
- Centered position provides balance
- Black text on light background (inherited)

---

## Performance Contract

### Calculation Performance

**useMemo optimization**:
- Calculation only runs when `songs` array changes
- Memoized value reused on other re-renders (e.g., countdown updates)
- Prevents unnecessary calculation during countdown timer updates (every second)

**Complexity**: O(n) where n = number of songs
- For 12 songs: <1ms calculation time
- Negligible impact on render performance

### Re-render Triggers

**Header re-renders when**:
- songs array changes (duration calculation runs)
- targetISO changes (countdown update, duration NOT recalculated)
- albumTitle changes (duration NOT recalculated)
- editingDate toggles (duration NOT recalculated)

**Optimization guarantee**: Total duration recalculation only on songs change

---

## Testing Contract

### Manual Test Coverage (Required)

See `quickstart.md` for comprehensive manual testing scenarios:
- Display accuracy (sum verification)
- Format adaptation (minutes vs hours+minutes)
- Real-time updates (edit song duration, verify total updates)
- Edge cases (empty album, missing durations, very large totals)
- Layout consistency (responsive behavior, visual balance)

### Unit Test Coverage (Optional)

```javascript
// Optional tests for helper function
test('formatTotalDuration handles minutes only'
test('formatTotalDuration handles hours and minutes')
test('formatTotalDuration handles exact hours')
test('formatTotalDuration caps at 999h+')

// Optional tests for calculation
test('totalDuration sums all song durations')
test('totalDuration handles empty songs array')
test('totalDuration handles missing duration fields')
test('totalDuration clamps negative values')
```

---

## Accessibility Contract

### Screen Reader Support

**ARIA attributes** (optional enhancement):
```javascript
<div
  className="text-2xl font-black tracking-wider"
  aria-label={`Total album duration: ${formattedDuration}`}
>
  {formattedDuration}
</div>
```

**Screen reader announces**: "Total album duration: 1 hour 23 minutes"

### Keyboard Navigation

**Not applicable**: Read-only display, no user interaction required

---

## Summary

**New APIs**: 1 helper function, 1 useMemo hook

**Unchanged APIs**: Props remain identical, fully backward compatible

**State scope**: 0 new state variables (useMemo only)

**Performance**: <1ms calculation time, memoized to prevent unnecessary recalculation

**Layout**: Replaces song count display, center position in Header

**Testing**: Manual testing required (per constitution), unit tests optional
