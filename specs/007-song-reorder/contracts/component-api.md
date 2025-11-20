# Component API Contract: Song Card Reordering

**Feature**: 007-song-reorder
**Date**: 2025-11-21
**Purpose**: Define component interfaces, event handlers, and prop contracts for drag-and-drop reordering

---

## App Component API (Modified)

### New State Variables

```typescript
interface DragState {
  draggedIndex: number | null;    // Index of song being dragged
  dropTargetIndex: number | null; // Index of drop target (for visual feedback)
}
```

**Declaration**:
```javascript
const [draggedIndex, setDraggedIndex] = useState(null);
const [dropTargetIndex, setDropTargetIndex] = useState(null);
```

### New Event Handlers

#### handleDragStart()

**Purpose**: Initialize drag operation when user starts dragging a song card

**Signature**:
```javascript
function handleDragStart(event: DragEvent, index: number): void
```

**Parameters**:
- `event`: React synthetic drag event
- `index`: Index of the song being dragged (0-11)

**Implementation**:
```javascript
const handleDragStart = (event, index) => {
  setDraggedIndex(index);
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index.toString());
};
```

**Side Effects**:
- Sets `draggedIndex` state to track active drag
- Configures dataTransfer for move operation
- Stores dragged index in dataTransfer (for accessibility/debugging)

---

#### handleDragOver()

**Purpose**: Update drop target indicator as user drags over different song cards

**Signature**:
```javascript
function handleDragOver(event: DragEvent, index: number): void
```

**Parameters**:
- `event`: React synthetic drag event
- `index`: Index of the song being hovered over (0-11)

**Implementation**:
```javascript
const handleDragOver = (event, index) => {
  event.preventDefault(); // Required to enable drop
  setDropTargetIndex(index);
};
```

**Side Effects**:
- Prevents default (enables drop operation)
- Updates `dropTargetIndex` for visual feedback (amber border line)

**Important**: `event.preventDefault()` is REQUIRED for drop to work. Without it, onDrop will not fire.

---

#### handleDrop()

**Purpose**: Reorder songs array when user completes drag-and-drop operation

**Signature**:
```javascript
function handleDrop(event: DragEvent, targetIndex: number): void
```

**Parameters**:
- `event`: React synthetic drag event
- `targetIndex`: Index where song should be inserted (0-11)

**Implementation**:
```javascript
const handleDrop = (event, targetIndex) => {
  event.preventDefault();

  // Validation checks
  if (draggedIndex === null) return; // Invalid state
  if (draggedIndex === targetIndex) return; // No-op (same position)

  // Immutable array reordering
  const newSongs = [...songs];
  const [draggedSong] = newSongs.splice(draggedIndex, 1);
  newSongs.splice(targetIndex, 0, draggedSong);

  // Update state (triggers localStorage persistence via useEffect)
  setSongs(newSongs);

  // Reset drag state
  setDraggedIndex(null);
  setDropTargetIndex(null);
};
```

**Side Effects**:
- Reorders songs array (immutable update)
- Triggers localStorage persistence (via existing useEffect)
- Resets drag state for next operation

**Validation**:
- Returns early if draggedIndex is null (prevents undefined behavior)
- Returns early if draggedIndex === targetIndex (no-op, avoids unnecessary re-render)

---

#### handleDragEnd()

**Purpose**: Clean up drag state when drag operation ends (success or cancel)

**Signature**:
```javascript
function handleDragEnd(): void
```

**Implementation**:
```javascript
const handleDragEnd = () => {
  setDraggedIndex(null);
  setDropTargetIndex(null);
};
```

**Side Effects**:
- Resets drag state to null
- Fires when:
  - Drop completes successfully
  - Drag is cancelled (Escape key, drag outside bounds)
  - Browser tab loses focus mid-drag

**Important**: Always fires after drag operation, regardless of success/failure. Ensures clean state.

---

#### handleKeyDown() (Global)

**Purpose**: Cancel drag operation when user presses Escape key

**Signature**:
```javascript
function handleKeyDown(event: KeyboardEvent): void
```

**Implementation**:
```javascript
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && draggedIndex !== null) {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }
};
```

**Attachment**: Attach to window or App wrapper div
```javascript
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [draggedIndex]);
```

**Side Effects**:
- Cancels active drag (resets state to null)
- Does NOT reorder array (original order preserved)

---

## SongCard Component API (Modified)

### Props (Extended)

```typescript
interface SongCardProps {
  // Existing props
  song: Song;
  onUpdate: (updatedSong: Song) => void;
  onRemove: (songId: number) => void;
  index: number; // EXISTING - already passed for other features

  // NEW props for drag-and-drop
  onDragStart: (event: DragEvent, index: number) => void;
  onDragOver: (event: DragEvent, index: number) => void;
  onDrop: (event: DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;     // draggedIndex === index
  isDropTarget: boolean;   // dropTargetIndex === index
}
```

### Rendering Logic

**Wrapper Div Attributes**:
```javascript
<div
  className={`
    ... existing classes (bg-neutral-900, rounded-lg, etc.) ...
    ${isDragging ? 'opacity-50' : ''}
    ${isDropTarget ? 'border-t-2 border-amber-500' : ''}
  `}
  draggable={true}
  onDragStart={(e) => onDragStart(e, index)}
  onDragOver={(e) => onDragOver(e, index)}
  onDrop={(e) => onDrop(e, index)}
  onDragEnd={onDragEnd}
>
  {/* Existing SongCard content (title, tempo, key, duration, stages) */}
</div>
```

**Key Attributes**:
- `draggable={true}`: Enables drag on entire card
- Event handlers: Wired to App component handlers (passed via props)
- Visual feedback: CSS classes applied conditionally via isDragging/isDropTarget props

---

## Event Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  User clicks and holds on SongCard (index 2)                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │  onDragStart(event, 2)    │
         │  → setDraggedIndex(2)     │
         │  → event.dataTransfer...  │
         └────────────┬──────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │  SongCard re-renders                   │
         │  → isDragging={true} (index 2)         │
         │  → className includes 'opacity-50'     │
         └────────────┬───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │  User drags over SongCard (index 5)    │
         │  onDragOver(event, 5)                  │
         │  → setDropTargetIndex(5)               │
         │  → event.preventDefault()              │
         └────────────┬───────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────────┐
         │  SongCard (index 5) re-renders             │
         │  → isDropTarget={true}                     │
         │  → className includes 'border-t-2...'      │
         └────────────┬─────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────────┐
         │  User releases mouse at SongCard (index 5) │
         │  onDrop(event, 5)                          │
         │  → Validation checks                       │
         │  → Reorder songs array                     │
         │  → setSongs(newSongs)                      │
         │  → setDraggedIndex(null)                   │
         │  → setDropTargetIndex(null)                │
         └────────────┬─────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────────┐
         │  onDragEnd()                               │
         │  → Cleanup (redundant here, but ensures    │
         │    state is reset if drop didn't fire)     │
         └────────────┬─────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────────┐
         │  useEffect detects songs change            │
         │  → localStorage.setItem(...)               │
         └────────────┬─────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────────┐
         │  All SongCards re-render in new order      │
         │  → Array indices updated                   │
         │  → isDragging={false} (all cards)          │
         │  → isDropTarget={false} (all cards)        │
         └────────────────────────────────────────────┘
```

---

## Alternative Flow: Cancelled Drag

```
         ┌────────────────────────────────────────────┐
         │  User presses Escape during drag          │
         │  handleKeyDown(event)                      │
         │  → if (key === 'Escape')                   │
         │  → setDraggedIndex(null)                   │
         │  → setDropTargetIndex(null)                │
         └────────────┬─────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────────┐
         │  Browser fires onDragEnd()                 │
         │  → Cleanup state (already null)            │
         └────────────┬─────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────────┐
         │  SongCards re-render with original order   │
         │  → NO songs array change                   │
         │  → Visual feedback removed                 │
         └────────────────────────────────────────────┘
```

---

## Visual Feedback Contract

### Dragged Card Visual State

**Condition**: `draggedIndex === index`
**CSS Class**: `opacity-50`
**Visual Effect**: Card becomes semi-transparent (50% opacity)
**Purpose**: Indicates which card is being dragged (ghost image also appears)

### Drop Target Visual State

**Condition**: `dropTargetIndex === index`
**CSS Class**: `border-t-2 border-amber-500`
**Visual Effect**: 2px amber border line appears above card
**Purpose**: Shows where dragged card will be inserted

### Normal State

**Condition**: Not dragging, not drop target
**CSS Classes**: Existing SongCard classes (no drag-specific styles)
**Visual Effect**: Standard card appearance

---

## Performance Contract

### Re-render Optimization

**Problem**: Drag operations update state on every mousemove (onDragOver)
**Solution**: Conditional class application (not full re-mount)

**React Optimization**:
- SongCard components don't unmount during drag
- Only className prop changes (efficient DOM update)
- Existing React.memo or key-based optimization applies

**Expected Performance**:
- 60fps during drag (no janky movement)
- <100ms feedback latency (visual state updates immediately)

### State Update Batching

**React 18+ Automatic Batching**:
- `setDraggedIndex` and `setDropTargetIndex` calls batch automatically
- Single re-render per drag event (not multiple)

**Drop Operation**:
- `setSongs`, `setDraggedIndex`, `setDropTargetIndex` batch into single re-render
- localStorage write happens after React flushes state updates

---

## Error Handling Contract

### Invalid Drag State

**Scenario**: `draggedIndex === null` when onDrop fires
**Handling**: Early return, no state update
**User Impact**: No visual change, drag has no effect

### Same-Position Drop

**Scenario**: User drags card and drops at original position
**Handling**: Early return, no array reordering
**User Impact**: Card returns to original position (appears as cancelled drag)

### Interrupted Drag

**Scenario**: Browser tab loses focus, user drags outside window
**Handling**: `onDragEnd` fires automatically, cleanup state
**User Impact**: Drag cancelled, original order preserved

### Escape Key Cancel

**Scenario**: User presses Escape during drag
**Handling**: Reset drag state, no array update
**User Impact**: Drag cancelled immediately, original order preserved

---

## Accessibility Contract

### Keyboard Navigation (Future - P3)

**Current State**: Not implemented in P1 MVP
**Future Contract**:
- Arrow keys to navigate between song cards
- Ctrl+Up/Down to move focused card
- Enter to grab/drop card (alternative to drag)

### Screen Reader Support (Future - P3)

**Current State**: Not implemented in P1 MVP
**Future Contract**:
- `aria-grabbed="true"` on dragged card
- `aria-dropeffect="move"` on drop targets
- Live region announcements for reorder completion

### Touch Device Support (Future - P3)

**Current State**: HTML5 drag-and-drop has limited touch support
**Future Contract**:
- Polyfill or alternative implementation (PointerEvents)
- Long-press to activate drag on mobile
- Touch-specific visual feedback

---

## Testing Contract

### Manual Test Scenarios

**Required Tests** (per constitution - manual testing acceptable for UI features):

1. **Basic Drag**: Drag song from position A to position B, verify order changes
2. **Persistence**: Drag and refresh page, verify order persists
3. **Cancel (Escape)**: Start drag, press Escape, verify original order
4. **Same-Position**: Drag card and drop at original position, verify no-op
5. **Visual Feedback**: Verify dragged card has opacity, drop target has border
6. **Edge Cases**:
   - First card to last position
   - Last card to first position
   - Adjacent card swap (index N to N+1)

### Performance Tests

1. **Drag Latency**: Visual feedback appears within 100ms of drag start
2. **Smooth Movement**: Cursor tracks smoothly at 60fps during drag
3. **No Lag**: Drop operation completes within 100ms

---

## Summary

**New API Surface**:
- 4 event handlers (handleDragStart, handleDragOver, handleDrop, handleDragEnd)
- 1 global handler (handleKeyDown for Escape)
- 2 state variables (draggedIndex, dropTargetIndex)
- 2 computed props (isDragging, isDropTarget)

**Modified Components**:
- App: Adds drag handlers and state
- SongCard: Adds draggable attribute and drag event props

**No Breaking Changes**:
- Existing SongCard props unchanged
- Existing event handlers (onUpdate, onRemove) unaffected
- Inline editing (title, tempo, key, duration) continues to work

**Performance**: 60fps drag, <100ms feedback, automatic React batching

**Data Integrity**: Immutable updates, defensive validation, Escape key cancel

**Accessibility**: Basic mouse drag (P1), keyboard/touch deferred to P3
