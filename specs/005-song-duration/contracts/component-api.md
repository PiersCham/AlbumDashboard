# Component API Contract: Song Duration Tracking

**Feature**: 005-song-duration
**Date**: 2025-11-21
**Purpose**: Define the component interface contracts for duration display and editing

---

## Song Entity API (Modified)

### Data Structure

```typescript
interface Song {
  id: number;                           // Existing: 1-12
  title: string;                        // Existing: Song name
  tempo: number;                        // Existing: 30-300 BPM
  key: string | null;                   // Existing: Musical key or null
  stages: Array<Stage>;                 // Existing: Production stages
  duration: DurationObject;             // NEW: Song length
}

interface DurationObject {
  minutes: number;  // 0-59, integer
  seconds: number;  // 0-59, integer
}
```

### Default Values

```javascript
// New songs (DEFAULT_SONGS initialization)
const DEFAULT_DURATION = { minutes: 0, seconds: 0 };

// Existing songs (lazy initialization on load)
song.duration = song.duration || { minutes: 0, seconds: 0 };
```

---

## Helper Functions API

### formatDuration()

**Purpose**: Convert duration object to display string

**Signature**:
```typescript
function formatDuration(minutes: number, seconds: number): string
```

**Parameters**:
- `minutes`: Number (0-59), will be floored to integer
- `seconds`: Number (0-59), will be floored to integer

**Returns**: String in "M:SS" format

**Examples**:
```javascript
formatDuration(3, 45)  → "3:45"
formatDuration(0, 5)   → "0:05"  (leading zero on seconds)
formatDuration(12, 0)  → "12:00"
formatDuration(5.7, 8.9) → "5:08"  (floored)
```

**Implementation**:
```javascript
const formatDuration = (minutes, seconds) => {
  const mins = Math.floor(minutes);
  const secs = Math.floor(seconds);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

---

### validateDuration()

**Purpose**: Validate and clamp duration values to valid ranges

**Signature**:
```typescript
function validateDuration(minutes: number | string, seconds: number | string): DurationObject
```

**Parameters**:
- `minutes`: Number or string, will be parsed and clamped to 0-59
- `seconds`: Number or string, will be parsed and clamped to 0-59

**Returns**: DurationObject with validated values

**Validation Rules**:
1. Parse input to integer (NaN treated as 0)
2. Clamp to range 0-59
3. Floor to integer

**Examples**:
```javascript
validateDuration(45, 30)    → { minutes: 45, seconds: 30 }
validateDuration(75, 90)    → { minutes: 59, seconds: 59 }  (clamped)
validateDuration(-5, -10)   → { minutes: 0, seconds: 0 }    (clamped)
validateDuration("3", "45") → { minutes: 3, seconds: 45 }   (parsed)
validateDuration("abc", "")  → { minutes: 0, seconds: 0 }   (NaN → 0)
```

**Implementation**:
```javascript
const validateDuration = (minutes, seconds) => {
  const clampedMins = Math.max(0, Math.min(59, Math.floor(parseInt(minutes) || 0)));
  const clampedSecs = Math.max(0, Math.min(59, Math.floor(parseInt(seconds) || 0)));
  return { minutes: clampedMins, seconds: clampedSecs };
};
```

---

## SongCard Component API

### Props (Unchanged)

```typescript
interface SongCardProps {
  song: Song;                        // Song entity with duration field
  onUpdate: (updatedSong: Song) => void;  // Callback to update song data
  onZoom: (songId: number) => void;  // Callback to open detail modal
}
```

**No prop changes**: Duration is part of the song object.

### New Internal State

```typescript
interface DurationEditState {
  isEditingDuration: boolean;  // Whether duration edit mode is active
  tempMinutes: string;         // Temporary minutes input value
  tempSeconds: string;         // Temporary seconds input value
}
```

### New Event Handlers

```typescript
function handleDurationLabelClick(): void
  // Activates duration edit mode
  // Sets tempMinutes/tempSeconds from song.duration
  // Sets isEditingDuration = true

function handleDurationSave(): void
  // Validates tempMinutes and tempSeconds
  // Clamps to 0-59 range
  // Calls onUpdate with new duration
  // Clears edit state

function handleDurationCancel(): void
  // Reverts to display mode without saving
  // Clears tempMinutes/tempSeconds
  // Sets isEditingDuration = false

function handleDurationKeyDown(e: React.KeyboardEvent): void
  // If Enter: calls handleDurationSave
  // If Escape: calls handleDurationCancel

function handleDurationBlur(): void
  // Auto-save on focus loss
  // Calls handleDurationSave

function handleMinutesChange(e: React.ChangeEvent<HTMLInputElement>): void
  // Updates tempMinutes state
  // No validation until save

function handleSecondsChange(e: React.ChangeEvent<HTMLInputElement>): void
  // Updates tempSeconds state
  // No validation until save
```

### Rendering Logic

```typescript
// Display mode (isEditingDuration = false)
<div className="flex items-center gap-2">
  <label
    className="text-neutral-400 cursor-pointer hover:underline"
    onClick={handleDurationLabelClick}
  >
    Duration:
  </label>
  <span className="text-neutral-300" onClick={handleDurationLabelClick}>
    {formatDuration(song.duration.minutes, song.duration.seconds)}
  </span>
</div>

// Edit mode (isEditingDuration = true)
<div className="flex items-center gap-2">
  <label className="text-neutral-400">Duration:</label>
  <div className="flex gap-1 items-center">
    <input
      type="text"
      value={tempMinutes}
      onChange={handleMinutesChange}
      onBlur={handleDurationBlur}
      onKeyDown={handleDurationKeyDown}
      autoFocus
      className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-12 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
      placeholder="M"
    />
    <span className="text-neutral-400">:</span>
    <input
      type="text"
      value={tempSeconds}
      onChange={handleSecondsChange}
      onBlur={handleDurationBlur}
      onKeyDown={handleDurationKeyDown}
      className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-12 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
      placeholder="SS"
    />
  </div>
</div>
```

---

## SongDetail Component API

### Props (Unchanged)

```typescript
interface SongDetailProps {
  song: Song;                        // Song entity with duration field
  onUpdate: (updatedSong: Song) => void;  // Callback to update song data
  onBack: () => void;                // Callback to close detail modal
}
```

**No prop changes**: Same as SongCard.

### Internal State and Handlers

**Identical to SongCard** - SongDetail mirrors all duration editing functionality:

- Same state variables (isEditingDuration, tempMinutes, tempSeconds)
- Same helper functions (formatDuration, validateDuration)
- Same event handlers (handleDurationLabelClick, handleDurationSave, etc.)
- Same rendering logic (display mode vs edit mode)

**Consistency**: SongDetail and SongCard must have identical duration editing behavior to ensure uniform UX.

---

## Component Interaction Contract

### Parent Component → SongCard/SongDetail

**Input (via props)**:
- `song`: Current song data with duration field (read-only from component perspective)
- `onUpdate`: Callback when duration changes (called on save)

**Guarantees**:
- `onUpdate` is only called on successful save (Enter key or blur)
- `onUpdate` is NOT called on cancel (Escape key)
- `onUpdate` receives complete Song object with validated duration
- Duration values are always in valid range (0-59 for both fields)

### SongCard/SongDetail → Parent Component

**Output (via callbacks)**:
- `onUpdate({ ...song, duration: { minutes, seconds } })`: When duration changes
- `onUpdate` NOT called during editing (only on commit)
- `onUpdate` NOT called if values are unchanged from original

### Data Integrity Contract

**Duration validation**:
- Input: User types "75" in minutes field, "90" in seconds field
- Processing: validateDuration(75, 90) → clamps to {minutes: 59, seconds: 59}
- Output: onUpdate called with validated values
- Side effect: Immediate localStorage write via onUpdate

**Edit cancellation**:
- Input: User edits duration, presses Escape
- Processing: handleDurationCancel() → reverts temp values
- Output: No onUpdate call, display returns to original values
- Side effect: None (no localStorage write)

---

## Placement and Layout Contract

### SongCard Layout

**Placement**: Duration appears immediately after Tempo, on the same line

**Before**:
```
Key: C Major    Tempo: 120 BPM
```

**After**:
```
Key: C Major    Tempo: 120 BPM    Duration: 3:45
```

**CSS Classes**: Uses existing Tailwind utility classes (matches Tempo/Key styling)

### SongDetail Layout

**Placement**: Identical to SongCard - Duration after Tempo, same line

**Consistency**: Same text size, spacing, and color as SongCard

---

## Accessibility Contract

### Keyboard Navigation

**Tab order**:
1. Song title input
2. Overall progress bar (read-only)
3. Key label/inputs (if editing)
4. Tempo label/input (if editing)
5. **Duration label/inputs** (if editing)  ← NEW
6. First stage bar
7. ... (rest of stages)
8. "Add Bit" button

**Keyboard shortcuts**:
- Click "Duration:" label or value: Activate edit mode
- Tab: Navigate from minutes to seconds input
- Shift+Tab: Navigate from seconds to minutes input
- Enter: Save duration
- Escape: Cancel edit
- Blur (click outside): Auto-save

### ARIA Attributes

```typescript
// Display mode
<label htmlFor="duration-display" className="...">Duration:</label>
<span id="duration-display" aria-label={`Duration: ${formatDuration(...)} (${song.duration.minutes} minutes ${song.duration.seconds} seconds)`}>
  {formatDuration(song.duration.minutes, song.duration.seconds)}
</span>

// Edit mode
<label htmlFor="duration-minutes" className="...">Duration:</label>
<input
  id="duration-minutes"
  type="text"
  aria-label="Minutes"
  value={tempMinutes}
  {...}
/>
<input
  id="duration-seconds"
  type="text"
  aria-label="Seconds"
  value={tempSeconds}
  {...}
/>
```

---

## Error Handling Contract

### Invalid Input Handling

**Non-numeric input**:
- Input: User types "abc" in minutes field
- Handling: parseInt("abc") → NaN → treated as 0
- Result: Saved as {minutes: 0, seconds: (existing value)}

**Out-of-range input**:
- Input: User types "99" in seconds field
- Handling: Clamped to 59 (maximum valid value)
- Result: Saved as {minutes: (existing value), seconds: 59}

**Negative input**:
- Input: User types "-5" in any field
- Handling: Clamped to 0 (minimum valid value)
- Result: Saved as 0 for that field

**Empty input**:
- Input: User clears a field
- Handling: Treated as 0
- Result: Saved as 0 for that field

**No error states**: All invalid inputs are silently corrected via clamping. No error messages or validation failures.

---

## Performance Contract

### Rendering Performance

**Re-render triggers**:
- Edit state change (isEditingDuration): 1 re-render on enter edit, 1 on exit
- Temp value changes (tempMinutes/tempSeconds): 1 re-render per keystroke (local state only)
- Save operation: 1 re-render (parent updates song object)

**Optimization guarantees**:
- No re-renders during display mode
- Input changes don't trigger validation until save (defer expensive operations)
- formatDuration is a pure function (memoizable if needed)
- validateDuration only runs on save, not on every keystroke

**Performance target**: <16ms per operation (maintain 60fps)

---

## Testing Contract

### Manual Test Coverage (Required)

See `quickstart.md` for comprehensive manual testing scenarios:
- Display mode validation (format, default values, leading zeros)
- Edit mode activation (click label, click value)
- Input validation (valid values, clamping, non-numeric)
- Keyboard shortcuts (Enter, Escape, Tab)
- Save/cancel behavior
- Cross-component consistency (SongCard vs SongDetail)
- Persistence (localStorage, page refresh)
- Backward compatibility (existing songs without duration)

### Unit Test Coverage (Optional)

```typescript
// Optional tests for helper functions
test('formatDuration pads seconds with leading zero')
test('formatDuration handles edge cases (0:00, 59:59)')
test('validateDuration clamps values to 0-59 range')
test('validateDuration handles non-numeric inputs')
test('validateDuration handles negative inputs')
```

---

## Summary

**New APIs**: 2 helper functions, 7 event handlers per component

**Unchanged APIs**: Props remain identical, fully backward compatible

**State scope**: 3 local state variables per component (isEditingDuration, tempMinutes, tempSeconds)

**Performance**: <16ms per event, minimal re-renders (only on edit/save)

**Accessibility**: Full keyboard navigation, ARIA labels, screen reader support

**Testing**: Manual testing required (per constitution), unit tests optional
