# Component API Contract: Click-to-Edit Fields

**Feature**: 003-click-to-edit
**Date**: 2025-11-19
**Purpose**: Define the interface contract for SongCard and SongDetail components with click-to-edit functionality

---

## SongCard Component API

### Props (Unchanged)

```typescript
interface SongCardProps {
  song: Song;           // Song entity with tempo and key
  onUpdate: (updatedSong: Song) => void;  // Callback to update song data
  onZoom: (song: Song) => void;           // Callback to open detail modal
}
```

**No prop changes**: Click-to-edit is internal implementation detail, props remain unchanged.

### Internal State (New)

```typescript
interface SongCardState {
  // Edit mode tracking
  isEditingTempo: boolean;      // Whether tempo field is in edit mode
  isEditingKey: boolean;        // Whether key field is in edit mode

  // Temporary values during edit
  tempTempoValue: string;       // Uncommitted tempo value (allows cancellation)
  tempKeyNote: string | null;   // Uncommitted note selection
  tempKeyMode: string | null;   // Uncommitted mode selection

  // Existing state (unchanged)
  showTempoFeedback: boolean;   // Visual feedback for tempo clamping
}
```

### Event Handlers (New)

```typescript
// Tempo edit handlers
function handleTempoLabelClick(): void
  // Enters tempo edit mode
  // If key is being edited, auto-saves key first
  // Auto-focuses tempo input

function handleTempoChange(e: React.ChangeEvent<HTMLInputElement>): void
  // Updates tempTempoValue as user types
  // Does NOT validate or save yet

function handleTempoSave(): void
  // Validates tempTempoValue using validateTempo()
  // Calls onUpdate() with validated tempo
  // Exits tempo edit mode
  // Shows visual feedback if value was clamped

function handleTempoCancel(): void
  // Discards tempTempoValue
  // Reverts to original song.tempo
  // Exits tempo edit mode

// Key edit handlers
function handleKeyLabelClick(): void
  // Enters key edit mode
  // If tempo is being edited, auto-saves tempo first
  // Auto-focuses note dropdown

function handleNoteChange(note: string): void
  // Updates tempKeyNote
  // If note is empty ("No Key"), clears key and exits edit mode
  // Otherwise updates tempKeyNote for later save

function handleModeChange(mode: string): void
  // Updates tempKeyMode

function handleKeySave(): void
  // Normalizes tempKeyNote using normalizeNote()
  // Calls onUpdate() with "{note} {mode}" or null
  // Exits key edit mode

function handleKeyCancel(): void
  // Discards tempKeyNote and tempKeyMode
  // Reverts to original song.key
  // Exits key edit mode

// Shared keyboard handler
function handleKeyDown(e: React.KeyboardEvent): void
  // If Enter key: calls save handler for active field
  // If Escape key: calls cancel handler for active field
```

### Rendering Logic (Modified)

```typescript
// Tempo field rendering
if (isEditingTempo) {
  // Render: <input value={tempTempoValue} onChange={handleTempoChange} onBlur={handleTempoSave} />
} else {
  // Render: <span>{song.tempo} BPM</span>
}

// Key field rendering
if (isEditingKey) {
  // Render: <select note> + <select mode>
} else {
  // Render: <span>{song.key || "No key"}</span>
}

// Labels (always rendered)
<label onClick={handleTempoLabelClick}>Tempo</label>
<label onClick={handleKeyLabelClick}>Key</label>
```

---

## SongDetail Component API

### Props (Unchanged)

```typescript
interface SongDetailProps {
  song: Song;           // Song entity with tempo and key
  onUpdate: (updatedSong: Song) => void;  // Callback to update song data
  onClose: () => void;  // Callback to close detail modal
}
```

**No prop changes**: Same as SongCard, click-to-edit is internal.

### Internal State (New)

```typescript
// Identical to SongCard state
interface SongDetailState {
  isEditingTempo: boolean;
  isEditingKey: boolean;
  tempTempoValue: string;
  tempKeyNote: string | null;
  tempKeyMode: string | null;
  showTempoFeedback: boolean;
}
```

### Event Handlers (New)

```typescript
// Identical to SongCard handlers
// Same function signatures and behavior
```

**Consistency**: SongDetail mirrors SongCard implementation for uniform UX.

---

## Component Interaction Contract

### Parent Component → SongCard/SongDetail

**Input (via props)**:
- `song`: Current song data (read-only from component perspective)
- `onUpdate`: Callback when song data changes (tempo or key saved)

**Guarantees**:
- `onUpdate` is only called on save (blur, Enter, field switch), never during typing
- `onUpdate` receives complete Song object with validated data
- `onUpdate` is called with the same reference identity if no changes (optimization)

### SongCard/SongDetail → Parent Component

**Output (via callbacks)**:
- `onUpdate({ ...song, tempo: validated })`: When tempo is saved
- `onUpdate({ ...song, key: normalized })`: When key is saved
- `onUpdate` NOT called on Escape (cancel)
- `onUpdate` NOT called on keystroke (only on blur/Enter)

### Validation Contract

**Tempo validation**:
- Input: Any string from user
- Processing: `validateTempo(input) → number (30-300)`
- Output: Always valid integer in range, clamped if necessary
- Side effect: Visual feedback if clamped

**Key validation**:
- Input: Note + mode selections from dropdowns
- Processing: `normalizeNote(note, mode) → normalized note`
- Output: Always valid enharmonic spelling or null
- Side effect: None (normalization is silent)

---

## Accessibility Contract

### Keyboard Navigation

**Tab order**:
1. Song title input
2. Tempo label (focusable via `tabIndex="0"` or `<button>` element)
3. Tempo display/input (if in edit mode, input is focused)
4. Key label (focusable)
5. Key display/dropdowns (if in edit mode, note dropdown is focused)
6. Stage sliders...

**Keyboard shortcuts**:
- `Enter` on label: Enter edit mode
- `Tab` to navigate between fields
- `Enter` in input: Save and exit edit mode
- `Escape` in input: Cancel and exit edit mode
- `Space` on label: Enter edit mode (if label is button)

### ARIA Attributes

```typescript
// Label accessibility
<label
  role="button"
  tabIndex={0}
  aria-label="Click to edit tempo"
  onClick={handleTempoLabelClick}
  onKeyDown={(e) => e.key === 'Enter' && handleTempoLabelClick()}
>
  Tempo
</label>

// Input accessibility
<input
  aria-label="Tempo in beats per minute"
  aria-describedby="tempo-help-text"
  value={tempTempoValue}
/>

// Announce edit mode changes (optional enhancement)
<span aria-live="polite" className="sr-only">
  {isEditingTempo ? "Editing tempo" : ""}
</span>
```

---

## Performance Contract

### Rendering Performance

**Re-render triggers**:
- Edit state change (isEditingTempo, isEditingKey): Local to component
- Temp value change (typing): Local to component, no parent re-render
- Save (onUpdate call): Triggers parent re-render (normal React behavior)

**Optimization guarantees**:
- No re-renders outside the edited component during typing
- No layout shifts when entering/exiting edit mode (fixed dimensions)
- No animation delays (instant mode transitions)

### State Update Performance

**State update frequency**:
- Edit mode toggle: 1 update per label click (<1ms)
- Typing: 1 update per keystroke (<1ms, React batched updates)
- Save: 1 validation + 1 parent callback (<5ms total)

**Memory footprint**:
- 5 state variables × 8 bytes ≈ 40 bytes per component
- Negligible for ~20 songs (800 bytes total)

---

## Error Handling Contract

### Invalid Input Handling

**Tempo errors**:
- Non-numeric input: Falls back to default (120 BPM)
- Out-of-range input: Clamps to boundary (30 or 300)
- Decimal input: Rounds to nearest integer
- Empty input: Falls back to default (120 BPM)

**Key errors**:
- Invalid note selection: Should not occur (dropdown constrains choices)
- Missing mode: Defaults to "Major"
- "No Key" selection: Sets key to null (valid state)

**No error states**: All inputs are auto-corrected, no error messages needed.

---

## Testing Contract

### Unit Test Coverage (Recommended)

```typescript
// Edit mode state transitions
test('clicking tempo label enters edit mode')
test('clicking key label while editing tempo auto-saves tempo')
test('pressing Escape cancels edit and reverts value')
test('pressing Enter saves edit and exits edit mode')
test('blurring input saves edit and exits edit mode')

// Validation integration
test('saving invalid tempo clamps to 30-300 range')
test('saving key normalizes enharmonic spelling')

// Edge cases
test('rapidly clicking labels does not break state')
test('switching between tempo and key edits preserves data')
```

### Manual Test Coverage (Required)

See `quickstart.md` for comprehensive manual testing scenarios:
- Click-to-edit interaction flow
- Keyboard navigation (Tab, Enter, Escape)
- Multi-field editing (auto-save behavior)
- Visual feedback on validation
- Accessibility (screen reader, keyboard-only)

---

## Summary

**New APIs**: 8 event handlers per component (tempo + key + keyboard)

**Unchanged APIs**: Props remain identical, backward compatible

**State scope**: 5 local state variables per component

**Performance**: <5ms for save operation, <1ms for state updates

**Accessibility**: Full keyboard navigation, ARIA labels, focus management

**Testing**: Unit tests recommended, manual tests required
