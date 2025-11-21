# Research: Song Card Reordering

**Feature**: 007-song-reorder
**Date**: 2025-11-21
**Purpose**: Research drag-and-drop implementation approaches, state management patterns, and visual feedback strategies for reordering song cards

## Research Questions

1. Should we use HTML5 Drag and Drop API or implement a custom pointer-based solution?
2. How should drag state be managed (component state vs context vs refs)?
3. What visual feedback patterns provide the best UX during drag operations?
4. How should we handle array reordering (splice vs filter+concat vs immutable copy)?
5. Should drag handlers be on the entire card or a dedicated drag handle?
6. How do we prevent conflicts with existing inline editing features (title, tempo, key, duration)?

---

## Decision 1: Drag API Selection

**Chosen**: HTML5 Drag and Drop API via React synthetic events

**Rationale**:
- Native browser API, no external dependencies (aligns with Simplicity First)
- React provides synthetic event wrappers (onDragStart, onDragOver, onDrop, onDragEnd)
- All modern browsers support it (Chrome, Firefox, Safari, Edge)
- Automatic cursor feedback (dragged element follows cursor by default)
- Built-in drag-and-drop semantics (dataTransfer, drop effects)

**Alternatives Considered**:
- **Custom pointer-based solution** (onPointerDown/Move/Up): Rejected - more complex to implement, requires manual cursor tracking and ghost element rendering, violates YAGNI
- **react-dnd library**: Rejected - adds 50KB+ dependency, violates Simplicity First, overkill for simple vertical reordering
- **react-beautiful-dnd**: Rejected - designed for complex layouts (Kanban, multi-column), unnecessary abstraction for single-list reordering

**Implementation Notes**:
- Use `draggable={true}` attribute on SongCard wrapper div
- Store dragged item index in `event.dataTransfer.setData('text/plain', index)`
- Prevent default on dragOver to enable drop: `event.preventDefault()`
- Update songs array on drop event

---

## Decision 2: Drag State Management

**Chosen**: Component state (App component) with useState for drag tracking

**Rationale**:
- Drag state is ephemeral (only exists during active drag operation)
- No need for global context or complex state managers
- Existing pattern: App component already holds `songs` state and handlers (`onUpdate`, `onRemove`)
- Three pieces of state needed:
  - `draggedIndex`: Index of song being dragged (null when not dragging)
  - `dropTargetIndex`: Index where drag is hovering (for visual placeholder)
  - Songs array reordering happens on drop (existing setSongs)

**Alternatives Considered**:
- **useRef for drag state**: Rejected - requires manual re-renders for visual feedback, less React-idiomatic
- **Context API**: Rejected - unnecessary abstraction for component-local state, violates Simplicity First
- **External state manager (Redux, Zustand)**: Rejected - massive overkill, violates Simplicity First

**Implementation Notes**:
```javascript
const [draggedIndex, setDraggedIndex] = useState(null);
const [dropTargetIndex, setDropTargetIndex] = useState(null);

const handleDragStart = (index) => setDraggedIndex(index);
const handleDragOver = (index) => setDropTargetIndex(index);
const handleDrop = (targetIndex) => {
  // Reorder songs array
  // Reset drag state
};
```

---

## Decision 3: Visual Feedback Patterns

**Chosen**: Combination of opacity change on dragged card + insertion line indicator

**Rationale**:
- **Dragged card**: Reduce opacity to 0.5 when dragging (user sees ghost + original card fades)
- **Drop target**: Show 2px amber border line above/below target position
- **Other cards**: Smooth CSS transitions (already exist in codebase for stage reordering)
- Minimal visual changes align with existing design language (amber accent color, clean borders)

**Alternatives Considered**:
- **Placeholder blank space**: Rejected - causes jarring layout shifts, feels less polished
- **Card elevation (box-shadow)**: Rejected - too subtle, doesn't clearly indicate drop position
- **Background color change**: Rejected - conflicts with existing amber hover states on inline editing

**Implementation Notes**:
```javascript
// On SongCard wrapper div
className={`
  ... existing classes ...
  ${draggedIndex === index ? 'opacity-50' : ''}
  ${dropTargetIndex === index ? 'border-t-2 border-amber-500' : ''}
`}
```

---

## Decision 4: Array Reordering Strategy

**Chosen**: Immutable copy with splice-based reordering

**Rationale**:
- React state updates require immutability (don't mutate existing array)
- Steps:
  1. Create shallow copy: `const newSongs = [...songs]`
  2. Remove dragged item: `const [draggedItem] = newSongs.splice(draggedIndex, 1)`
  3. Insert at target position: `newSongs.splice(targetIndex, 0, draggedItem)`
  4. Update state: `setSongs(newSongs)`
- Performance: O(n) complexity acceptable for 12 items
- Existing codebase pattern: Similar immutable updates in `handleRemove` and `handleUpdate`

**Alternatives Considered**:
- **Filter + concat approach**: Rejected - less readable, same performance complexity
- **Swap elements (temp variable)**: Rejected - only works for adjacent swaps, not arbitrary reordering
- **Immutable library (Immer)**: Rejected - unnecessary dependency for simple array operation

**Implementation Notes**:
```javascript
const handleDrop = (event, targetIndex) => {
  event.preventDefault();
  if (draggedIndex === null || draggedIndex === targetIndex) return;

  const newSongs = [...songs];
  const [draggedSong] = newSongs.splice(draggedIndex, 1);
  newSongs.splice(targetIndex, 0, draggedSong);

  setSongs(newSongs); // Triggers localStorage persistence via useEffect
  setDraggedIndex(null);
  setDropTargetIndex(null);
};
```

---

## Decision 5: Drag Handle vs Full Card Draggable

**Chosen**: Full card draggable (not drag handle)

**Rationale**:
- **Simpler UX**: Users can drag from anywhere on the card (less precise targeting required)
- **No visual clutter**: No need for drag handle icon (⋮⋮ or ≡)
- **Conflict resolution**: Inline editing already uses click events on specific areas (title, tempo, key, duration)
  - Drag requires click-and-hold (300ms+ before drag starts)
  - Click for editing is instantaneous
  - No practical conflict in user interaction
- **Existing precedent**: Stage reordering (feature 004) uses full StageRow draggable, same pattern here

**Alternatives Considered**:
- **Dedicated drag handle (icon)**: Rejected - adds visual complexity, requires user to target small area, violates Simplicity First
- **Long-press to activate drag**: Rejected - not standard HTML5 drag behavior, requires custom implementation

**Implementation Notes**:
- Add `draggable={true}` to outermost div of SongCard
- Existing click handlers for inline editing remain unchanged (they fire on click, not drag)

---

## Decision 6: Conflict Prevention with Inline Editing

**Chosen**: No changes needed - drag and click are separate interaction patterns

**Rationale**:
- **Drag**: Requires click-and-hold (user holds mouse button down and moves cursor)
- **Click**: Fires on mouse up after short duration (no movement required)
- **Browser behavior**: Click event fires ONLY if drag did not start
  - If user drags, click event is suppressed
  - If user clicks without dragging, drag event never fires
- **Existing features safe**: Title, tempo, key, duration editing use onClick handlers
  - These will NOT fire if user is dragging
  - User intent is clear: click to edit, drag to reorder

**Alternatives Considered**:
- **Disable dragging during edit mode**: Rejected - unnecessary, no actual conflict exists
- **Add delay before drag starts**: Rejected - degrades UX, not needed
- **Use stopPropagation on edit elements**: Rejected - unnecessary complexity

**Implementation Notes**:
- No special handling required
- Existing inline editing onClick handlers will not fire during drag operations
- Tested pattern: Similar to stage reordering (feature 004) which coexists with stage name editing

---

## Decision 7: Touch Device Support

**Chosen**: Defer to future iteration (Priority P3 in spec)

**Rationale**:
- HTML5 Drag and Drop API has limited touch support across browsers
- Implementing proper touch support requires polyfills or custom pointer-based solution
- Desktop mouse-based drag is Priority P1 (MVP)
- Touch support is Priority P3 (accessibility enhancement)
- Aligns with Simplicity First: implement core functionality first, add complexity only when needed

**Future Consideration**:
- If touch support is needed, consider:
  - react-dnd with touch backend plugin
  - Custom PointerEvent-based implementation (onPointerDown/Move/Up)
  - Mobile-first drag library (Sortable.js, react-beautiful-dnd with touch support)

---

## Decision 8: Keyboard Accessibility

**Chosen**: Defer to future iteration (Priority P3 in spec)

**Rationale**:
- Keyboard reordering requires custom implementation (Ctrl+Up/Down, focus management)
- HTML5 Drag and Drop API is mouse-focused, no built-in keyboard support
- Priority P1 (MVP) focuses on mouse-based drag
- Keyboard support is Priority P3 (accessibility enhancement)
- Follows constitutional precedent: manual testing acceptable for UI features, accessibility can be enhanced iteratively

**Future Consideration**:
- Implement keyboard shortcuts for song card focus and movement
- Use roving tabindex pattern for keyboard navigation
- Add aria-grabbed and aria-dropeffect attributes for screen reader support

---

## Decision 9: Persistence Timing

**Chosen**: Immediate localStorage write on drop (existing useEffect pattern)

**Rationale**:
- Existing pattern: `useEffect(() => { localStorage.setItem(...) }, [songs, ...])`
- Reordering updates songs array → triggers useEffect → persists to localStorage
- No debouncing needed (drag operations are discrete, not continuous)
- Aligns with Data Integrity principle: zero data loss, immediate persistence

**Alternatives Considered**:
- **Debounce writes**: Rejected - unnecessary for discrete operations, adds complexity
- **Manual persistence call in handleDrop**: Rejected - breaks existing pattern, duplicates logic
- **Batch updates**: Rejected - drag operations are already batched (one drop = one state update)

---

## Decision 10: Edge Case Handling

**Chosen**: Defensive checks in handleDrop

**Rationale**:
- **Same-position drop**: `if (draggedIndex === targetIndex) return` (no-op)
- **Invalid drag state**: `if (draggedIndex === null) return` (safety check)
- **Cancelled drag** (Escape key): Add onDragEnd handler to reset state
- **Interrupted drag** (tab switch): onDragEnd fires automatically, cleanup in handler

**Implementation Notes**:
```javascript
const handleDragEnd = () => {
  setDraggedIndex(null);
  setDropTargetIndex(null);
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape' && draggedIndex !== null) {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  }
};
```

---

## Summary

**Core Design Decisions**:
1. HTML5 Drag and Drop API (no external libraries)
2. Component state for drag tracking (draggedIndex, dropTargetIndex)
3. Opacity + insertion line visual feedback
4. Immutable array reordering with splice
5. Full card draggable (no drag handle)
6. No conflict with inline editing (separate interaction patterns)
7. Touch support deferred to P3
8. Keyboard support deferred to P3
9. Immediate localStorage persistence via existing useEffect
10. Defensive edge case handling in drop handler

**No unresolved questions** - all technical decisions align with existing codebase patterns and constitutional principles.
