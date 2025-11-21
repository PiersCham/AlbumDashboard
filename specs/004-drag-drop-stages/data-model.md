# Data Model: Drag-and-Drop Stage Reordering

**Feature**: 004-drag-drop-stages
**Date**: 2025-11-20
**Purpose**: Define state model for drag-and-drop interactions and stage reordering

---

## Entity: DragState (Component-Scoped Ephemeral State)

**Description**: Temporary state tracking which stage is being dragged and where it will be dropped. This state exists only during active drag operations and is NOT persisted to localStorage.

### Attributes

| Field | Type | Default | Description | Lifecycle |
|-------|------|---------|-------------|-----------|
| `draggedIndex` | Number \| null | `null` | Array index of the stage currently being dragged | Set on dragstart, cleared on dragend |
| `dropTargetIndex` | Number \| null | `null` | Array index where the stage will be inserted if dropped now | Updated on dragover, cleared on drop/dragend |
| `isDragging` | Boolean | `false` | Whether a drag operation is currently active | Set on dragstart, cleared on dragend |
| `touchStartTime` | Number \| null | `null` | Timestamp of touch start (for long-press detection) | Touch-only: set on touchstart, cleared on touchend |
| `initialTouchY` | Number \| null | `null` | Y-coordinate of initial touch (for scroll vs drag detection) | Touch-only: set on touchstart, cleared on touchend |

### State Transitions

```
Idle (no drag)
  ↓ (User presses mouse on stage)
dragstart → Dragging Active
  ↓ (User moves mouse over other stages)
dragover (repeatedly) → Update dropTargetIndex
  ↓ (User releases mouse)
drop → Reorder stages array, persist to localStorage → Idle

Dragging Active
  ↓ (User presses Escape)
dragend (canceled) → Revert to original order → Idle

Dragging Active
  ↓ (User drags outside boundaries and releases)
dragleave + drop (canceled) → No changes → Idle
```

### Touch-Specific State Flow

```
Idle
  ↓ (User touches stage)
touchstart → Record initialTouchY, start 500ms timer
  ↓ (500ms elapses without movement)
Long-press detected → Set isDragging=true
  ↓ (User moves finger)
touchmove → Update dropTargetIndex based on touch position
  ↓ (User lifts finger)
touchend → Reorder stages, persist → Idle

touchstart
  ↓ (User moves finger <500ms OR scrolls)
touchmove (early) → Cancel timer → Idle (scroll detected, not drag)
```

---

## Entity: Song (Existing - Modified Behavior)

**Description**: Existing Song entity. No schema changes, but the stages array order becomes semantically significant.

### Attributes (No Changes)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique song identifier (1-12) |
| `title` | String | Song name |
| `stages` | Array<Stage> | **Ordered** array of production stages (order now user-controlled) |
| `tempo` | Number | Tempo in BPM (30-300) |
| `key` | String \| null | Musical key (e.g., "F# Major") or null |

**Semantic Change**: Previously, stages array order was arbitrary (insertion order). Now, stages array order represents user-defined workflow sequence. Reordering is achieved by splicing and reinserting stages within the array.

### Array Reordering Logic

```javascript
// Move stage from index A to index B
const moveStage = (fromIndex, toIndex) => {
  const newStages = [...song.stages];
  const [movedStage] = newStages.splice(fromIndex, 1); // Remove from old position
  newStages.splice(toIndex, 0, movedStage);            // Insert at new position
  onUpdate({ ...song, stages: newStages });            // Persist via existing update pattern
};
```

**No new fields added**. Drag-and-drop feature is purely behavioral - it manipulates existing array order.

---

## Entity: Stage (Existing - No Changes)

**Description**: Existing Stage entity representing a production phase. No changes required.

### Attributes

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Stage name (e.g., "Drums", "Mix") |
| `value` | Number | Progress percentage (0-100) |

**Note**: Stages do NOT have explicit `order` or `position` fields. Order is implicit from array index in `song.stages[]`.

---

## Component State Structure

### SongCard Component State

```javascript
function SongCard({ song, onUpdate, onZoom }) {
  // Existing state (unchanged)
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  // ... other existing state

  // NEW: Drag-and-drop state
  const draggedIndexRef = useRef(null);              // Ref avoids re-renders during drag
  const [dropTargetIndex, setDropTargetIndex] = useState(null); // For visual drop indicator
  const [isDragging, setIsDragging] = useState(false);

  // Touch-specific state (NEW)
  const touchTimerRef = useRef(null);
  const initialTouchYRef = useRef(null);

  // ... rest of component
}
```

### SongDetail Component State

```javascript
function SongDetail({ song, onUpdate, onBack }) {
  // Mirror SongCard drag state structure exactly
  const draggedIndexRef = useRef(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchTimerRef = useRef(null);
  const initialTouchYRef = useRef(null);

  // ... rest of component (mirrors SongCard)
}
```

---

## State Lifecycle

### 1. Component Mount

```javascript
// Initial state (no drag operation)
draggedIndex = null (ref)
dropTargetIndex = null
isDragging = false
touchStartTime = null (ref)
initialTouchY = null (ref)
```

### 2. User Starts Dragging (Mouse)

```javascript
// onDragStart handler
handleDragStart(e, index) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', index);
  draggedIndexRef.current = index;
  setIsDragging(true);
  // CSS class applied via isDragging state
}
```

### 3. User Drags Over Other Stages

```javascript
// onDragOver handler (called repeatedly, 60fps)
handleDragOver(e, targetIndex) {
  e.preventDefault(); // Required to allow drop
  if (draggedIndexRef.current === null) return;

  // Update drop indicator position
  setDropTargetIndex(targetIndex);
}
```

### 4. User Drops Stage

```javascript
// onDrop handler
handleDrop(e, dropIndex) {
  e.preventDefault();
  const fromIndex = draggedIndexRef.current;

  if (fromIndex !== null && fromIndex !== dropIndex) {
    // Reorder stages array
    const newStages = [...song.stages];
    const [movedStage] = newStages.splice(fromIndex, 1);
    newStages.splice(dropIndex, 0, movedStage);

    // Persist via existing onUpdate pattern
    onUpdate({ ...song, stages: newStages });
  }

  // Clean up drag state
  draggedIndexRef.current = null;
  setDropTargetIndex(null);
  setIsDragging(false);
}
```

### 5. User Cancels Drag (Escape Key)

```javascript
// onDragEnd handler OR onKeyDown (Escape)
handleDragCancel() {
  // No stage reordering - just clean up state
  draggedIndexRef.current = null;
  setDropTargetIndex(null);
  setIsDragging(false);
}
```

### 6. Component Unmount

```javascript
// Drag state is lost (not persisted)
// Song stages array persists via existing localStorage mechanism
// If drag was in progress, it's implicitly canceled
```

---

## Data Flow Diagram

```
┌─────────────────┐
│  Song Entity    │  (Persisted to localStorage)
│  stages: [...]  │  (Array order represents user workflow)
└────────┬────────┘
         │ Read on mount
         ▼
┌─────────────────────────────┐
│  SongCard Component State   │  (Ephemeral)
│  draggedIndex: null (ref)   │
│  dropTargetIndex: null      │
│  isDragging: false          │
└────────┬────────────────────┘
         │ User starts drag (mousedown on stage)
         ▼
┌─────────────────────────────┐
│  Drag Active State          │
│  draggedIndex: 2 (ref)      │  ← User dragging "Bass" (index 2)
│  dropTargetIndex: 0         │  ← Mouse over "Demo" (index 0)
│  isDragging: true           │
└────────┬────────────────────┘
         │ User releases mouse (drop)
         ▼
┌─────────────────────────────┐
│  Reorder Logic              │
│  splice(2, 1) → remove Bass │
│  splice(0, 0, Bass) → insert│
│  onUpdate({ stages: [...] })│
└────────┬────────────────────┘
         │ Save successful
         ▼
┌─────────────────┐
│  Song Entity    │  (Updated in localStorage)
│  stages: [Bass, Demo, Drums, ...]
└─────────────────┘
```

---

## Persistence Model

**What gets persisted**: Only the reordered `song.stages` array (via existing `onUpdate` callback)

**What does NOT get persisted**: Drag state (draggedIndex, dropTargetIndex, isDragging, touch state)

**Persistence trigger**: Immediately on successful drop (same pattern as tempo/key editing)

**Export/Import**: JSON export already includes stages array - order is preserved automatically

**Schema version**: No schema changes. Existing v3 schema remains unchanged.

---

## Performance Considerations

**State update frequency**:
- `draggedIndexRef` updates: 1 per drag operation (no re-renders, uses ref)
- `dropTargetIndex` updates: ~60 per second during drag (throttled by browser's dragover event)
- `isDragging` updates: 2 per drag operation (dragstart + dragend)
- `onUpdate` call: 1 per successful drop

**Memory footprint**:
- 5 state variables × 12 songs × 8 bytes ≈ 480 bytes per song
- Total for 12 songs: ~5.7 KB (negligible)

**Re-render optimization**:
- Using `ref` for draggedIndex avoids re-renders during drag motion
- Visual feedback (drop indicator) via CSS class controlled by dropTargetIndex state
- React batches state updates automatically in event handlers

---

## Summary

**New state introduced**: 5 ephemeral state variables per component (2 refs, 3 useState)

**Existing state unchanged**: Song and Stage entities unchanged, stages array order becomes semantic

**State scope**: Local to component (no global state, no context)

**State persistence**: Only song.stages array persists (via existing onUpdate pattern)

**Data integrity**: No data modification, only array reordering (zero risk of data loss)

**Performance impact**: Negligible (<6KB memory, minimal re-renders via refs)
