# Component API Contract: Drag-and-Drop Stage Reordering

**Feature**: 004-drag-drop-stages
**Date**: 2025-11-20
**Purpose**: Define the interface contract for drag-and-drop functionality in SongCard and SongDetail components

---

## StageRow Component API (Modified)

### Props (Unchanged)

```typescript
interface StageRowProps {
  stage: { name: string; value: number };  // Stage entity
  onApply: (name: string, value: number) => void;  // Callback for name/progress edits
  onRemove: () => void;                     // Callback to remove stage
  stageRowHeight?: string;                  // Optional Tailwind height class
}
```

**No prop changes**: Drag-and-drop is internal implementation, props remain unchanged for backward compatibility.

### New Internal State (Component-Level)

```typescript
interface DragState {
  // Drag tracking (refs - no re-renders)
  draggedIndexRef: React.MutableRefObject<number | null>;
  touchTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  initialTouchYRef: React.MutableRefObject<number | null>;

  // Visual feedback (state - triggers re-renders)
  dropTargetIndex: number | null;    // Where stage will be inserted if dropped
  isDragging: boolean;               // Whether any stage is currently being dragged
}
```

### New Event Handlers

```typescript
// Mouse drag handlers
function handleDragStart(e: React.DragEvent, index: number): void
  // Sets draggedIndexRef, dataTransfer, isDragging state
  // Initiates drag operation

function handleDragOver(e: React.DragEvent, index: number): void
  // Prevents default to allow drop
  // Updates dropTargetIndex for visual feedback
  // Called repeatedly (~60fps) during drag

function handleDrop(e: React.DragEvent, dropIndex: number): void
  // Prevents default
  // Reorders stages array via splice
  // Calls onUpdate with new array
  // Cleans up drag state

function handleDragEnd(): void
  // Cleans up drag state (called on cancel or success)
  // Resets draggedIndexRef, dropTargetIndex, isDragging

// Touch drag handlers (parallel implementation)
function handleTouchStart(e: React.TouchEvent, index: number): void
  // Records touch position and timestamp
  // Starts 500ms long-press timer
  // If timer completes without movement: initiate drag

function handleTouchMove(e: React.TouchEvent): void
  // If not dragging: cancels long-press timer (scroll detected)
  // If dragging: calculates drop position from touch coordinates
  // Updates dropTargetIndex

function handleTouchEnd(e: React.TouchEvent): void
  // If dragging: performs drop operation
  // Cleans up touch state and timers

// Keyboard accessibility handlers
function handleKeyDown(e: React.KeyboardEvent, index: number): void
  // If Ctrl+ArrowUp: move stage up one position
  // If Ctrl+ArrowDown: move stage down one position
  // If Escape (during drag): cancel drag operation
```

### Rendering Logic (Modified)

```typescript
// StageRow rendering in SongCard/SongDetail
<div
  draggable={!promptOpen}  // Disable drag during edit modal
  onDragStart={(e) => handleDragStart(e, idx)}
  onDragOver={(e) => handleDragOver(e, idx)}
  onDrop={(e) => handleDrop(e, idx)}
  onDragEnd={handleDragEnd}
  onTouchStart={(e) => handleTouchStart(e, idx)}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  onKeyDown={(e) => handleKeyDown(e, idx)}
  tabIndex={0}  // Make keyboard-focusable
  className={`
    ${isDragging && draggedIndexRef.current === idx ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
    ${dropTargetIndex === idx ? 'drop-target-indicator' : ''}
  `}
>
  {/* Existing ProgressBar content */}
</div>
```

---

## SongCard Component API

### Props (Unchanged)

```typescript
interface SongCardProps {
  song: Song;                        // Song entity with stages array
  onUpdate: (updatedSong: Song) => void;  // Callback to update song data
  onZoom: (songId: number) => void;  // Callback to open detail modal
}
```

**No prop changes**: Drag-and-drop is internal to the component.

### New Internal Functions

```typescript
function moveStage(fromIndex: number, toIndex: number): void
  // Reorders song.stages array
  // Calls onUpdate({ ...song, stages: newStages })
  // Used by both drag-drop and keyboard handlers

function getDropIndex(clientY: number): number
  // Calculates drop position from mouse/touch Y coordinate
  // Returns array index where stage should be inserted
  // Used by dragover and touchmove handlers

function cancelDrag(): void
  // Resets all drag state without saving changes
  // Called on Escape key or invalid drop
```

---

## SongDetail Component API

### Props (Unchanged)

```typescript
interface SongDetailProps {
  song: Song;                        // Song entity with stages array
  onUpdate: (updatedSong: Song) => void;  // Callback to update song data
  onBack: () => void;                // Callback to close detail modal
}
```

**No prop changes**: Same as SongCard, drag-and-drop is internal.

### New Internal Functions

```typescript
// Identical to SongCard handlers
function moveStage(fromIndex: number, toIndex: number): void
function getDropIndex(clientY: number): number
function cancelDrag(): void
```

**Consistency**: SongDetail mirrors SongCard implementation exactly to ensure uniform UX.

---

## Component Interaction Contract

### Parent Component → SongCard/SongDetail

**Input (via props)**:
- `song`: Current song data with stages array (read-only from component perspective)
- `onUpdate`: Callback when stage order changes (called on successful drop)

**Guarantees**:
- `onUpdate` is only called on successful drop (not during drag motion)
- `onUpdate` receives complete Song object with reordered stages array
- `onUpdate` is NOT called on canceled drags (Escape, drag-out)
- Stage data (name, value) is never modified, only array order changes

### SongCard/SongDetail → Parent Component

**Output (via callbacks)**:
- `onUpdate({ ...song, stages: reorderedArray })`: When stage order changes
- `onUpdate` NOT called during drag preview or hover
- `onUpdate` NOT called if drop position equals drag origin (no-op)

### Data Integrity Contract

**Stage reordering**:
- Input: Original stages array `[A, B, C, D]`, drag B to position 0
- Processing: `splice(1, 1)` removes B → `[A, C, D]`, then `splice(0, 0, B)` → `[B, A, C, D]`
- Output: Always valid array with same length, no data loss
- Side effect: Immediate localStorage write via `onUpdate`

---

## Accessibility Contract

### Keyboard Navigation

**Tab order**:
1. Song title input
2. Overall progress bar (read-only)
3. Tempo/Key labels and inputs
4. **First stage bar** (focusable via `tabIndex="0"`)
5. **Second stage bar** (focusable)
6. ... (all stage bars are in tab order)
7. "Add Bit" button

**Keyboard shortcuts**:
- `Tab` / `Shift+Tab`: Navigate between stages
- `Ctrl+Up Arrow`: Move focused stage up one position
- `Ctrl+Down Arrow`: Move focused stage down one position
- `Escape` (during drag): Cancel drag operation
- `Space` / `Enter`: Open stage edit modal (existing behavior, unaffected)

### ARIA Attributes

```typescript
// Stage bar accessibility
<div
  role="listitem"
  aria-label={`${stage.name} - ${stage.value}% complete`}
  aria-grabbed={isDragging && draggedIndexRef.current === idx ? 'true' : 'false'}
  aria-dropeffect="move"
  tabIndex={0}
  draggable
>
  {/* ProgressBar content */}
</div>

// Drop indicator (hidden from screen readers)
<div
  className="drop-indicator"
  aria-hidden="true"
  style={{ position: 'absolute', top: '-2px', height: '4px', background: '#fbbf24' }}
/>

// Live region for screen reader announcements
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isDragging && `Dragging ${song.stages[draggedIndexRef.current]?.name}. Use arrow keys to reorder.`}
  {!isDragging && recentlyDropped && `${song.stages[dropIndex]?.name} moved to position ${dropIndex + 1}`}
</div>
```

---

## Performance Contract

### Rendering Performance

**Re-render triggers**:
- Drag state change (isDragging, dropTargetIndex): Local to component
- Dragged index change: Uses ref, NO re-render
- Drop operation: Triggers parent re-render (normal React behavior via `onUpdate`)

**Optimization guarantees**:
- No re-renders during drag motion (dragover events use ref)
- Visual feedback via CSS classes (no inline style recalculation)
- React batches state updates automatically in event handlers
- Maximum 2 re-renders per drag operation: dragstart (isDragging=true) + dragend (isDragging=false)

### Event Handler Performance

**Event frequency**:
- `dragover`: ~60 events/second during drag (browser-throttled)
- `touchmove`: ~60 events/second during drag (browser-throttled)
- `dragstart` / `dragend`: 1 each per drag operation
- `drop`: 1 per drag operation

**Performance target**: <16ms per event handler (60fps)

**Optimization strategy**:
- Ref-based drag tracking (no state updates in hot path)
- CSS-only visual feedback (no DOM manipulation)
- Early returns in dragover for no-op cases

---

## Error Handling Contract

### Invalid Drag Operations

**Out-of-bounds drag**:
- Dragging outside song card boundaries → Cancel drag (dragend fires, no changes)
- Dragging into another song card → Ignored (dropEffect='none')

**Concurrent edit modal**:
- If stage edit modal is open → Draggable disabled (`draggable={!promptOpen}`)
- Prevents conflicting interactions

**Single-stage edge case**:
- If `stages.length === 1` → Drag handlers still attached but drop is no-op
- No visual feedback needed (nowhere to move)

**Rapid drop edge case**:
- Drop before state updates → Drop handler checks `draggedIndexRef` validity
- If ref is null → No-op (prevents double-drop bugs)

**Touch scroll vs drag**:
- If touchmove occurs <500ms after touchstart → Long-press timer canceled
- Allows normal scrolling, doesn't initiate drag

**No error states**: All invalid operations are handled gracefully with no-op or cancel.

---

## Testing Contract

### Manual Test Coverage (Required)

See `quickstart.md` for comprehensive manual testing scenarios:
- Mouse drag-and-drop on desktop
- Touch drag-and-drop on mobile/tablet
- Keyboard reordering (Ctrl+Arrow keys)
- Drag cancellation (Escape, drag-out)
- Multi-stage reordering
- Visual feedback verification
- Accessibility (screen reader, keyboard-only)
- Cross-component consistency (SongCard vs SongDetail)

### Unit Test Coverage (Optional)

```typescript
// Optional tests for drag state logic
test('moveStage reorders array correctly')
test('getDropIndex calculates position from Y coordinate')
test('cancelDrag resets state without calling onUpdate')
test('handleDrop only calls onUpdate if position changed')
```

---

## Summary

**New APIs**: 11 event handlers per component (3 mouse, 3 touch, 3 keyboard, 2 utility)

**Unchanged APIs**: Props remain identical, fully backward compatible

**State scope**: 5 local state variables per component (2 refs, 3 state)

**Performance**: <16ms per event, <2 re-renders per drag operation

**Accessibility**: Full keyboard navigation, ARIA labels, screen reader support

**Testing**: Manual testing required (per constitution), unit tests optional
