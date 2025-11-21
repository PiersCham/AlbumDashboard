# HTML5 Drag-and-Drop Implementation Research

**Context**: Implementing stage reordering for music production tracker with React 19.1.1 SPA using only native browser APIs.

**Date**: 2025-11-20

---

## 1. HTML5 Drag and Drop API Basics

### Decision

Use the **HTML5 Drag and Drop API** with React synthetic event handlers for reordering stages within songs.

### Rationale

The HTML5 Drag and Drop API is a standardized web platform feature natively supported in all modern browsers. For a React application using only native browser APIs (per project constitution), this is the appropriate choice:

- **Native**: No external libraries required
- **Standardized**: Part of HTML5 specification with consistent behavior
- **Well-supported**: Available in all modern browsers (Chrome, Firefox, Safari, Edge)
- **Performant**: Minimal overhead; leverages browser optimizations
- **Familiar**: Developers already understand drag-and-drop UX patterns

### Alternatives Considered

1. **Touch Events + Mouse Events**: Manually implementing drag-and-drop using `touchstart`, `touchmove`, `touchend`, `mousedown`, `mousemove`, `mouseup`
   - Requires significant boilerplate code
   - More prone to edge cases (device differences, performance)
   - Recommended only if HTML5 API proves insufficient

2. **External libraries** (react-beautiful-dnd, dnd-kit, react-sortable-hoc)
   - Violates project constitution (native APIs only)
   - Adds bundle size and dependencies
   - Unnecessary for single-component reordering

3. **Pointer Events API**: Use `pointerdown`, `pointermove`, `pointerup` for unified interface
   - Valid alternative but requires more manual state management
   - HTML5 Drag-and-Drop is more semantic and handles drop zones automatically

### Implementation Notes

**Core HTML5 Events** (in execution order):

```javascript
// Initiating element
dragstart   // User starts dragging (required to enable drag)
dragend     // Drag operation ends (user releases mouse)

// Drop target element
dragenter   // Dragged item enters drop zone
dragover    // Dragged item moves over drop zone (fires repeatedly)
dragleave   // Dragged item leaves drop zone
drop        // User drops item on drop zone
```

**Browser Defaults**:
- By default, most elements are NOT draggable (`draggable=false`)
- Drag operations are rejected unless you call `preventDefault()` on `dragover`
- Drop is only accepted at elements where `drop` handler calls `preventDefault()`

**DataTransfer Object**:
- Only available during drag operation
- Methods: `setData(type, value)`, `getData(type)`, `setDragImage(image, x, y)`
- Properties: `dropEffect`, `effectAllowed`
- Read-only during `drop`: `types`, `files`

---

## 2. React Integration Patterns

### Decision

Manage drag state in React component state, update data model through immutable operations, and use React's synthetic event system with `preventDefault()` calls.

### Rationale

React's synthetic event system wraps native events but preserves access to the underlying native `DataTransfer` object:

- **Synthetic events**: React's cross-browser event system ensures consistent behavior
- **State management**: Keep drag state (dragging index, over index) in React state
- **Immutability**: Update stage order through immutable array operations
- **Simplicity**: Minimal overhead; native drag-drop integrates cleanly with React

### Patterns

#### Pattern 1: Managing Drag State

```javascript
// In component state
const [draggedIndex, setDraggedIndex] = useState(null);  // Index of item being dragged
const [overIndex, setOverIndex] = useState(null);         // Index of current drop zone

// On drag start
const handleDragStart = (e, index) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', index.toString());
  setDraggedIndex(index);
};

// On drag over (must preventDefault to accept drop)
const handleDragOver = (e, index) => {
  e.preventDefault();  // Critical: enables drop
  e.dataTransfer.dropEffect = 'move';
  setOverIndex(index);
};

// On drop
const handleDrop = (e, dropIndex) => {
  e.preventDefault();
  if (draggedIndex === null || draggedIndex === dropIndex) return;

  // Reorder immutably
  const reordered = [...stages];
  const [removed] = reordered.splice(draggedIndex, 1);
  reordered.splice(dropIndex, 0, removed);

  onUpdate({ ...song, stages: reordered });
  setDraggedIndex(null);
  setOverIndex(null);
};

// On drag end
const handleDragEnd = () => {
  setDraggedIndex(null);
  setOverIndex(null);
};
```

#### Pattern 2: Preventing Event Bubbling

```javascript
// CRITICAL: Drag-and-drop events bubble up
// Always stop propagation to prevent interference with parent elements

const handleDragStart = (e, index) => {
  e.stopPropagation();  // Prevent bubbling to parent
  e.dataTransfer.effectAllowed = 'move';
  setDraggedIndex(index);
};

// For drop zone, prevent default on dragenter too
const handleDragEnter = (e) => {
  e.preventDefault();  // Enables drop
  e.stopPropagation();
};
```

#### Pattern 3: Handling Multiple Drop Zones

```javascript
// If stages exist in multiple locations (card view + zoom view)
// Use data attributes to identify the scope

<div
  draggable
  data-stage-id={stage.id}
  data-container={containerType}  // 'card' or 'detail'
  onDragStart={(e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      stageId: stage.id,
      sourceContainer: containerType,
      sourceIndex: index,
    }));
  }}
>
  {stage.name}
</div>
```

#### Pattern 4: Avoiding Common Pitfalls

```javascript
// PITFALL 1: Forgetting preventDefault() on dragover
// Result: Drop is silently rejected
const handleDragOver = (e) => {
  e.preventDefault();  // REQUIRED
};

// PITFALL 2: Modifying state directly in drop handler
// Result: Concurrent state updates, inconsistent UI
// WRONG:
stages[draggedIndex] = stages[dropIndex];  // Don't do this

// CORRECT:
const reordered = stages.map((s, i) => {
  if (i === draggedIndex) return stages[dropIndex];
  if (i === dropIndex) return stages[draggedIndex];
  return s;
});

// PITFALL 3: Using array indices as drag data
// Result: Incorrect reordering if array changes during drag
// Instead: Store item ID or unique identifier
e.dataTransfer.setData('text/plain', stage.id);

// PITFALL 4: Accessing DataTransfer outside drag operation
// Result: SecurityError in strict browsers
// WRONG: Store dataTransfer reference
const dt = e.dataTransfer;
setTimeout(() => dt.getData(), 0);  // Throws error

// CORRECT: Use data immediately in handler
const handleDrop = (e) => {
  const data = e.dataTransfer.getData('text/plain');  // Use synchronously
};

// PITFALL 5: Not clearing drag state on dragend
// Result: UI remains in dragging state if drop fails
const handleDragEnd = () => {
  setDraggedIndex(null);
  setOverIndex(null);  // Always clear, even on errors
};
```

### Implementation Notes

**Synthetic Events in React 19**:
- React 19 preserves access to native event via `e.nativeEvent`
- `e.dataTransfer` works directly on synthetic events
- All browser-standard properties and methods are available
- Event handlers receive React SyntheticEvent wrapper

**State Update Order**:
1. Read from `e.dataTransfer` immediately (synchronous)
2. Call `preventDefault()` to signal acceptance
3. Update React state (asynchronous)
4. Avoid reading `e.dataTransfer` after state updates

---

## 3. Visual Feedback Best Practices

### Decision

Use CSS classes for visual states, apply to dragged items and drop zones, and optionally customize ghost image.

### Rationale

Providing visual feedback during drag-and-drop is critical for UX:
- Users need to know an item is being dragged
- Users need to see valid drop zones
- Reordering direction must be clear

CSS approach is minimal and performant; no need for custom JavaScript rendering.

### Visual Feedback Patterns

#### Pattern 1: CSS Classes for Dragged Item

```jsx
function StageRow({ stage, index, isDragging, isOver, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      className={`
        transition-all duration-150
        ${isDragging ? 'opacity-50 scale-95 bg-neutral-700' : ''}
        ${isOver ? 'border-l-4 border-amber-500' : ''}
      `}
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
    >
      {stage.name}
    </div>
  );
}
```

**Visual States**:
- **Dragging**: Reduce opacity (0.5), scale down (0.95), darker background
- **Drop Target**: Left border highlight (amber-500), background shift
- **Default**: Smooth transitions between states

#### Pattern 2: Drop Zone Indicators

```jsx
// Strategy: Show target insertion position

const DropTarget = ({ isOver, position }) => (
  <div
    className={`
      h-0.5 my-1 transition-all duration-100
      ${isOver ? 'bg-amber-500 my-2' : 'bg-transparent'}
    `}
  />
);

// In list:
{stages.map((stage, idx) => (
  <React.Fragment key={stage.id}>
    <DropTarget
      isOver={overIndex === idx}
      position="before"
    />
    <StageRow stage={stage} index={idx} />
  </React.Fragment>
))}
<DropTarget isOver={overIndex === stages.length} position="after" />
```

This shows a thick amber line where the item will be inserted.

#### Pattern 3: Ghost Image Customization

```javascript
const handleDragStart = (e, index) => {
  // Create custom ghost image
  const img = new Image();
  img.src = 'data:image/svg+xml,...';  // Custom visual
  e.dataTransfer.setDragImage(img, 0, 0);

  // Alternative: Use div and convert to image
  const ghost = document.createElement('div');
  ghost.style.position = 'absolute';
  ghost.style.left = '-9999px';
  ghost.textContent = stages[index].name;
  ghost.className = 'bg-amber-600 text-white px-3 py-1 rounded';
  document.body.appendChild(ghost);

  e.dataTransfer.setDragImage(ghost, 0, 0);

  // Cleanup
  setTimeout(() => document.body.removeChild(ghost), 0);
};
```

**Note**: Ghost image appears automatically with browser default if not customized. Custom images are optional; default often sufficient.

#### Pattern 4: Cursor and Feedback during Drag

```javascript
const handleDragStart = (e) => {
  e.dataTransfer.effectAllowed = 'move';  // Affects cursor
};

const handleDragOver = (e) => {
  // Cursor indicates action
  e.dataTransfer.dropEffect = 'move';    // Cursor: move (not forbidden)
};

// CSS for cursor feedback
.drag-handle {
  cursor: grab;
}

.stage-row:active {
  cursor: grabbing;
}

.drop-zone.can-drop {
  cursor: not-allowed;  /* If invalid drop zone */
}
```

**Cursor Values**:
- `grab`: Item can be dragged
- `grabbing`: Item is being dragged
- `move`: Indicates move operation
- `not-allowed`: Drop not permitted (set via `dropEffect = 'none'`)

### Implementation Notes

**Transition Timing**:
- Use `transition-all duration-150` for smooth visual feedback
- 150ms is perceptible without feeling sluggish
- Avoid `transition-all duration-1000` (feels unresponsive)

**Performance**:
- CSS transitions don't block interactions
- Applying/removing classes is very fast
- Avoid adding/removing DOM nodes during drag (slow)

**Browser Rendering**:
- Ghost image renders in browser, not under developer control
- Some browsers show opacity 0.7, others 1.0
- Safe to assume basic drag visualization

---

## 4. Touch Device Support

### Decision

**Primary**: Implement touch support using touch event listeners alongside native drag-and-drop, with long-press activation.

**Fallback**: If touch support proves insufficient, implement custom drag handler or polyfill.

### Rationale

HTML5 Drag-and-Drop API has **limited touch support**:
- Safari on iOS has no native drag-and-drop support
- Android browsers vary in support
- Touch requires different interaction model (long-press instead of click-drag)

For a music production tracker (likely desktop-first, but should support touch):
- Implement touch events as parallel to mouse drag-and-drop
- Desktop users get native HTML5 API
- Touch users get custom touch handler
- Single component works for both

### Implementation Approach

#### Approach 1: Parallel Touch Handler (Recommended)

```javascript
function StageList({ stages, onReorder }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [touchActive, setTouchActive] = useState(false);

  // Touch events (long-press activation)
  const handleTouchStart = (e, index) => {
    const touchTimer = setTimeout(() => {
      setTouchActive(true);
      setDraggedIndex(index);

      // Visual feedback
      e.target.style.opacity = '0.5';
      e.target.style.backgroundColor = 'rgb(55 65 81)';  // neutral-700
    }, 500);  // Long-press: 500ms

    e.target.dataset.touchTimer = touchTimer;
  };

  const handleTouchMove = (e, index) => {
    if (!touchActive) return;

    // Find element under touch point
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.dataset.stageIndex) {
      const targetIndex = parseInt(element.dataset.stageIndex);
      setOverIndex(targetIndex);
    }

    e.preventDefault();  // Prevent scrolling during drag
  };

  const handleTouchEnd = (e, index) => {
    clearTimeout(e.target.dataset.touchTimer);

    if (touchActive && draggedIndex !== null && overIndex !== null) {
      // Perform reorder
      const reordered = [...stages];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(overIndex, 0, removed);
      onReorder(reordered);
    }

    // Cleanup
    e.target.style.opacity = '1';
    e.target.style.backgroundColor = '';
    setTouchActive(false);
    setDraggedIndex(null);
    setOverIndex(null);
  };

  return (
    <div>
      {stages.map((stage, idx) => (
        <div
          key={stage.id}
          data-stage-index={idx}
          onTouchStart={(e) => handleTouchStart(e, idx)}
          onTouchMove={(e) => handleTouchMove(e, idx)}
          onTouchEnd={(e) => handleTouchEnd(e, idx)}
        >
          {stage.name}
        </div>
      ))}
    </div>
  );
}
```

**Touch Activation Model**:
- **500ms long-press**: Initiates drag (not immediate on touch)
- **Touch move**: Updates drop target while dragging
- **Touch end**: Completes reorder

**Why 500ms?**: Balances responsiveness with accidental touches. Standard UI convention.

#### Approach 2: Touch-Action CSS (Modern Alternative)

```css
/* Tell browser not to handle touch for scrolling during drag */
[draggable] {
  touch-action: none;
}

/* Ensure scrolling works outside drag area */
.scrollable-container {
  touch-action: auto;
}
```

React implementation:
```javascript
<div
  draggable
  style={{ touchAction: 'none' }}
  onDragStart={...}
>
  {stage.name}
</div>
```

**Benefit**: Works on browsers with native drag-drop + touch support (newer Android)

### Touch Support Matrix

| Browser | Drag-Drop Support | Recommended Approach |
|---------|------|---|
| Chrome Desktop | Yes | HTML5 API |
| Firefox Desktop | Yes | HTML5 API |
| Safari Desktop | Yes | HTML5 API |
| Edge Desktop | Yes | HTML5 API |
| Chrome Android | Limited | Parallel touch handler |
| Firefox Android | Limited | Parallel touch handler |
| Safari iOS | No | Custom touch handler |
| Samsung Internet | Limited | Parallel touch handler |

### Polyfill Consideration

If touch support becomes critical, consider:

1. **Pointer Events API** (W3C standard):
   ```javascript
   // Unified API for mouse + touch
   const handlePointerDown = (e, index) => {
     setDraggedIndex(index);
   };

   const handlePointerMove = (e) => {
     if (draggedIndex !== null) {
       // Find target under pointer
     }
   };
   ```

   **Benefit**: Single event handler for mouse + touch
   **Drawback**: Requires more boilerplate than drag-drop

2. **External Touch Polyfill**: `pointer-events-polyfill`
   - Only if targeting legacy browsers
   - Violates native-API-only constraint

### Implementation Notes

**Touch-Specific Considerations**:
- `e.preventDefault()` in `touchmove` prevents unwanted scrolling
- Use `document.elementFromPoint()` to find drop target (not `e.target` after move)
- Clear drag state in `touchend` regardless of completion
- Provide visual feedback for long-press activation (highlight + opacity change)

**Hybrid Solution** (Desktop + Touch):
```javascript
function StageRow({ stage, index, onReorder }) {
  // HTML5 Drag-and-Drop handlers
  const handleDragStart = ...;
  const handleDragEnd = ...;

  // Touch handlers (parallel)
  const handleTouchStart = ...;
  const handleTouchEnd = ...;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {stage.name}
    </div>
  );
}
```

Both systems operate independently; whichever is triggered handles the interaction.

---

## 5. Keyboard Accessibility

### Decision

Implement keyboard shortcuts for reordering stages (Arrow Up/Down) alongside mouse/touch drag-and-drop. Use ARIA attributes to expose drag-and-drop semantics.

### Rationale

Drag-and-drop is inherently mouse/touch-centric and excludes keyboard-only users:
- Blind users with screen readers cannot use drag-and-drop
- Power users may prefer keyboard shortcuts
- WCAG 2.1 Level AA requires keyboard alternative to all interactions

Implementing keyboard support is straightforward and increases usability significantly.

### Keyboard Shortcuts

```javascript
function StageRow({ stage, index, stages, onReorder }) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (!isFocused) return;

    let newIndex = index;

    if (e.key === 'ArrowUp' && index > 0) {
      newIndex = index - 1;
      e.preventDefault();
    } else if (e.key === 'ArrowDown' && index < stages.length - 1) {
      newIndex = index + 1;
      e.preventDefault();
    } else {
      return;  // Unhandled key
    }

    // Swap with adjacent stage
    const reordered = [...stages];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    onReorder(reordered);

    // Move focus to new position
    setTimeout(() => {
      const element = document.querySelector(`[data-stage-index="${newIndex}"]`);
      element?.focus();
    }, 0);
  };

  return (
    <div
      ref={(el) => el?.dataset.stageIndex = index}
      tabIndex={0}
      role="button"
      aria-label={`Stage: ${stage.name}. Use arrow keys to reorder.`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      draggable
      onDragStart={...}
    >
      {stage.name}
    </div>
  );
}
```

**Keyboard Behavior**:
- **Arrow Up**: Move stage up (if not first)
- **Arrow Down**: Move stage down (if not last)
- **Enter/Space**: Could open edit modal (secondary interaction)
- **Escape**: Cancel any in-progress operation

### ARIA Attributes for Drag-and-Drop

```jsx
<div
  draggable
  role="button"
  tabIndex={0}
  aria-label={`Stage: ${stage.name}. Draggable. Use arrow keys or drag to reorder.`}
  aria-pressed={isDragging}  // Indicate dragged state
  aria-dropeffect="move"     // Indicates drop effect
  data-drag-handle="true"    // Semantic marker
  onDragStart={handleDragStart}
  onKeyDown={handleKeyDown}
>
  {stage.name}
</div>
```

**ARIA Attributes Explained**:
- `role="button"`: Treat as interactive element
- `tabIndex={0}`: Include in tab order
- `aria-label`: Provide context and instructions
- `aria-pressed={isDragging}`: Announce drag state to screen readers
- `aria-dropeffect="move"`: Indicate operation type

### Focus Management

```javascript
// When reordering via keyboard, move focus to new position
const handleKeyDown = (e) => {
  if (e.key === 'ArrowUp' && index > 0) {
    // Perform reorder
    onReorder(reordered);

    // Focus next render
    setTimeout(() => {
      const nextElement = stageElements[index - 1];
      nextElement?.focus();
      nextElement?.setAttribute('aria-label',
        `Stage: ${stages[index - 1].name}. Moved up. Arrow keys to reorder.`
      );
    }, 0);
  }
};
```

**Focus Behavior**:
- Focus stays on reordered item after move
- OR focus moves to new position (based on UX preference)
- Focus must not jump unexpectedly
- Announce operation result to screen readers

### Screen Reader Announcements

Use `aria-live` regions to announce operations:

```jsx
function StageContainer({ stages, onReorder }) {
  const [announcement, setAnnouncement] = useState('');

  const handleReorder = (oldIndex, newIndex, stage) => {
    const direction = newIndex > oldIndex ? 'down' : 'up';
    setAnnouncement(
      `${stage.name} moved ${direction}. Now at position ${newIndex + 1} of ${stages.length}.`
    );

    onReorder(...);

    // Clear announcement after screen reader reads it
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return (
    <>
      <div aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      {stages.map((stage, idx) => (
        <StageRow
          key={stage.id}
          stage={stage}
          index={idx}
          onReorder={(newIndex) => handleReorder(idx, newIndex, stage)}
        />
      ))}
    </>
  );
}
```

**ARIA Live Region**:
- `aria-live="polite"`: Announce without interrupting screen reader
- `aria-atomic="true"`: Read entire region, not just changes
- `aria-busy="true"`: Optional, indicate operation in progress

### Implementation Notes

**Accessibility Checklist**:
- [ ] All drag-able items are keyboard accessible (`tabIndex={0}`)
- [ ] Arrow keys move items up/down
- [ ] Focus is visible (outline or highlight)
- [ ] Screen reader announces operations
- [ ] ARIA labels explain drag-and-drop functionality
- [ ] Keyboard shortcut help is documented in UI

**Testing with Screen Readers**:
```bash
# macOS
# Press Cmd+F5 to enable VoiceOver
# Use VO (control+option) + Arrow keys to navigate

# Windows
# Download NVDA (free) or JAWS
# Tab to navigate, arrow keys within lists
```

**Keyboard Escape Hatch**:
Always provide a context menu or modal alternative:
```javascript
<button
  onClick={() => setEditingMode(true)}
  aria-label={`Edit stage order for ${song.title}`}
>
  Edit Order
</button>

{editingMode && (
  <Modal>
    {/* List with up/down buttons */}
    {stages.map((stage, idx) => (
      <div key={stage.id}>
        <span>{stage.name}</span>
        <button
          onClick={() => moveUp(idx)}
          disabled={idx === 0}
        >
          Move Up
        </button>
        <button
          onClick={() => moveDown(idx)}
          disabled={idx === stages.length - 1}
        >
          Move Down
        </button>
      </div>
    ))}
  </Modal>
)}
```

This provides an alternative interaction for users who cannot use drag-and-drop.

---

## 6. Performance Considerations

### Decision

Minimize re-renders by separating drag state from data state, use `useMemo` for expensive calculations, and implement event delegation to reduce event listener overhead.

### Rationale

Drag-and-drop operations fire many events during a single interaction:
- `dragstart`: 1 event
- `dragover`: Fires continuously (100+ events during single drag)
- `dragenter`/`dragleave`: Multiple events per zone
- `drop`: 1 event
- `dragend`: 1 event

If every event triggers a component re-render, performance degrades quickly, especially with many stages (50+). Strategic state management keeps interactions smooth.

### Performance Patterns

#### Pattern 1: Separate Drag UI State from Data State

```javascript
// WRONG: State updates on every dragover
function StageList({ song, onUpdate }) {
  const [stages, setStages] = useState(song.stages);  // Data

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setOverIndex(idx);  // Causes re-render of entire list
  };
}

// CORRECT: Use ref for drag UI state (no re-render)
function StageList({ song, onUpdate }) {
  const [stages, setStages] = useState(song.stages);  // Data
  const dragStateRef = useRef({ draggedIndex: null, overIndex: null });

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    dragStateRef.current.overIndex = idx;  // No re-render!
  };
}
```

**Why This Works**: Drag UI state (visual feedback) doesn't need React re-renders. Using refs keeps the DOM up-to-date via CSS, while React manages actual data.

#### Pattern 2: Use CSS for Visual Feedback (Not State)

```javascript
const handleDragOver = (e, idx) => {
  e.preventDefault();

  // Update CSS directly, not state
  document.querySelectorAll('[data-stage]').forEach((el) => {
    el.classList.remove('over');
  });
  e.currentTarget.classList.add('over');
};

const handleDragLeave = (e) => {
  e.currentTarget.classList.remove('over');
};

// CSS
.stage-row.over {
  background-color: rgb(55 65 81);  /* neutral-700 */
}
```

**Alternative**: Store visual state in a separate, optimized component:

```javascript
function StageDragVisual({ dragState }) {
  // Tiny component, only re-renders when drag state changes
  return (
    <div className={dragState.isDragging ? 'opacity-50' : ''}>
      {dragState.overIndex !== null && (
        <DropIndicator position={dragState.overIndex} />
      )}
    </div>
  );
}

// Main component
const dragStateRef = useRef({ isDragging: false, overIndex: null });
const [dragState, setDragState] = useState(dragStateRef.current);

const handleDragStart = (e, idx) => {
  dragStateRef.current.isDragging = true;
  setDragState({ ...dragStateRef.current });  // Update React state once
};

const handleDragOver = (e, idx) => {
  e.preventDefault();
  dragStateRef.current.overIndex = idx;  // No React update
  // Update DOM directly via CSS class instead
};
```

#### Pattern 3: Event Delegation

```javascript
// WRONG: Attach dragstart handler to every stage
{stages.map((stage, idx) => (
  <div key={stage.id} onDragStart={(e) => handleDragStart(e, idx)}>
    {stage.name}
  </div>
))}

// CORRECT: Single handler on parent with event delegation
<div onDragStart={(e) => {
  const stageIndex = e.target.closest('[data-stage-index]')?.dataset.stageIndex;
  if (stageIndex !== undefined) handleDragStart(e, parseInt(stageIndex));
}}>
  {stages.map((stage, idx) => (
    <div key={stage.id} data-stage-index={idx}>
      {stage.name}
    </div>
  ))}
</div>
```

**Benefit**: One event listener instead of N, especially for 50+ stages.

#### Pattern 4: Throttle dragover Handler (if Complex Logic)

```javascript
let lastDragOverTime = 0;

const handleDragOver = (e, idx) => {
  e.preventDefault();

  const now = Date.now();
  if (now - lastDragOverTime < 50) return;  // Skip if <50ms since last
  lastDragOverTime = now;

  // Expensive logic here (e.g., calculating insertion preview)
  updateInsertionPreview(idx);
};
```

**When to Use**: Only if `dragover` handler performs expensive calculations (rare). Standard drag-drop doesn't need this.

### Performance Metrics

**Target**: 60 FPS during drag operation

- Budget: ~16ms per frame
- Drag event fires every ~4-8ms (at 60 FPS)
- Handler should complete in <5ms

**Measuring Performance**:
```javascript
const handleDragStart = (e, idx) => {
  performance.mark('drag-start');
  // ... handler code
  performance.mark('drag-end');
  performance.measure('dragHandler', 'drag-start', 'drag-end');

  const measure = performance.getEntriesByName('dragHandler')[0];
  console.log(`Drag handler took ${measure.duration}ms`);
};
```

**Optimization Checklist**:
- [ ] Drag visual feedback uses CSS, not state
- [ ] No `console.log()` in drag handlers (slow)
- [ ] Data reordering deferred to `drop` event (not `dragover`)
- [ ] Event delegation used for 10+ stages
- [ ] State updates batch via single `drop` handler
- [ ] No DOM mutations in `dragover` (only class toggling)

### React 19 Specific Optimizations

```javascript
// useMemo: Avoid recalculating stage order
const reorderedStages = useMemo(() => {
  if (draggedIndex === null) return stages;
  // Calculate preview order (don't actually update)
  return calculatePreview(stages, draggedIndex, overIndex);
}, [stages, draggedIndex, overIndex]);

// useCallback: Memoize handler references
const handleDragStart = useCallback((e, idx) => {
  e.dataTransfer.effectAllowed = 'move';
  dragStateRef.current.draggedIndex = idx;
}, []);

// React.memo: Prevent child re-renders if props unchanged
const MemoizedStageRow = React.memo(function StageRow({ stage, index, onDragStart }) {
  return <div onDragStart={(e) => onDragStart(e, index)}>{stage.name}</div>;
}, (prev, next) => {
  // Custom comparison: only re-render if stage or index changes
  return prev.stage.id === next.stage.id && prev.index === next.index;
});
```

### Animation Optimization

```css
/* Use will-change for dragged element */
.stage-row.dragging {
  will-change: transform, opacity;
  transform: translateY(0);
  opacity: 0.5;
}

.stage-row.not-dragging {
  will-change: auto;
}

/* Use GPU-accelerated properties only */
/* Good: transform, opacity */
.animate {
  transform: translateY(10px);  /* GPU accelerated */
  opacity: 0.8;                  /* GPU accelerated */
}

/* Bad: top, left, width */
.do-not-animate {
  top: 10px;    /* Not accelerated, causes layout recalc */
  left: 10px;   /* Not accelerated */
}
```

### Implementation Notes

**Drag Operation Performance Profile**:
1. `dragstart`: 1ms (setup)
2. `dragover x100`: 400ms total (4ms each) - CRITICAL
3. `drop`: 1ms (reorder)
4. `dragend`: 0.5ms (cleanup)

If interactions feel sluggish, profile `dragover` handler.

**Common Performance Issues**:
1. **DOM queries in dragover**: `document.querySelectorAll()` is O(n)
2. **State updates in dragover**: Causes re-render of entire list
3. **Complex CSS selectors**: Use `data-*` attributes instead
4. **Event handler recreation**: Use `useCallback()` or store ref

---

## 7. Complete Implementation Example

### For StageRow (in SongCard)

Below is a complete, production-ready implementation for reordering stages:

```jsx
import React, { useState, useRef } from 'react';

function SongCard({ song, onUpdate, onZoom }) {
  const [dragState, setDragState] = useState({
    draggedIndex: null,
    overIndex: null,
  });

  // Ref for tracking drag state during dragover (no re-renders)
  const dragStateRef = useRef(dragState);

  // Update ref when state changes
  React.useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const stages = song.stages;

  const handleDragStart = (e, index) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());

    setDragState({ draggedIndex: index, overIndex: null });
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Update visual state via CSS (no React re-render needed)
    const stageElements = document.querySelectorAll('[data-stage-index]');
    stageElements.forEach((el) => {
      el.classList.toggle('drag-over',
        parseInt(el.dataset.stageIndex) === index
      );
    });

    // Store in ref (React state update deferred to drop)
    dragStateRef.current.overIndex = index;
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedIndex = dragStateRef.current.draggedIndex;

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragState({ draggedIndex: null, overIndex: null });
      return;
    }

    // Reorder stages immutably
    const reordered = [...stages];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, removed);

    // Update song with new stage order
    onUpdate({ ...song, stages: reordered });

    // Clear drag state
    setDragState({ draggedIndex: null, overIndex: null });

    // Remove CSS classes
    document.querySelectorAll('.drag-over').forEach((el) => {
      el.classList.remove('drag-over');
    });
  };

  const handleDragEnd = () => {
    setDragState({ draggedIndex: null, overIndex: null });
    document.querySelectorAll('.drag-over').forEach((el) => {
      el.classList.remove('drag-over');
    });
  };

  const removeStageAt = (idx) =>
    onUpdate({ ...song, stages: stages.filter((_, i) => i !== idx) });

  const addStage = () =>
    onUpdate({ ...song, stages: [...stages, { name: `Stage ${stages.length + 1}`, value: 0 }] });

  const updateStageAt = (idx, patch) => {
    const updatedStages = stages.map((s, i) =>
      i === idx ? { ...s, ...patch } : s
    );
    onUpdate({ ...song, stages: updatedStages });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm p-2 flex flex-col gap-2 h-[295px] w-[376px]">
      {/* Header and metadata... */}

      {/* Stages list with drag-and-drop */}
      <div className="flex-1 overflow-auto pr-1">
        <div className="flex flex-col gap-1">
          {stages.map((stage, idx) => (
            <div
              key={`${stage.name}-${idx}`}
              data-stage-index={idx}
              draggable
              className={`
                transition-all duration-150
                p-1 rounded
                ${dragState.draggedIndex === idx
                  ? 'opacity-50 scale-95 bg-neutral-700'
                  : ''
                }
                hover:bg-neutral-800
              `}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              style={{ cursor: 'grab' }}
              onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
              onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
            >
              <StageRow
                stage={stage}
                onApply={(name, value) => updateStageAt(idx, { name, value })}
                onRemove={() => removeStageAt(idx)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end pt-1">
        <button
          className="w-3 h-3 flex items-center justify-center text-sm rounded bg-neutral-800 hover:bg-neutral-700"
          onClick={addStage}
          title="Add Stage"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default SongCard;
```

### CSS Styles (in index.css or App.css)

```css
/* Drag and Drop Styles */
[draggable] {
  user-select: none;
  -webkit-user-drag: element;
}

.drag-over {
  background-color: rgb(55 65 81) !important;  /* neutral-700 */
  border-left: 4px solid rgb(217 119 6);       /* amber-600 */
  border-radius: 0.375rem;
}

/* Drop indicator line (alternative visual) */
.drop-indicator {
  height: 2px;
  background-color: rgb(217 119 6);  /* amber-600 */
  margin: 0.25rem 0;
  animation: pulse 0.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Cursor feedback */
[draggable] {
  cursor: grab;
}

[draggable]:active {
  cursor: grabbing;
}
```

---

## Summary Table

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Drag API** | HTML5 Drag and Drop | Native, standard, no dependencies |
| **React Integration** | Synthetic events + refs for UI state | Minimal re-renders, good performance |
| **Visual Feedback** | CSS classes for dragged/over states | Fast, no DOM mutation |
| **Touch Support** | Parallel touch handler with long-press | Covers desktop + mobile |
| **Accessibility** | Keyboard shortcuts (Arrow Up/Down) + ARIA | WCAG 2.1 compliant |
| **Performance** | Event delegation, CSS visual state | 60 FPS, minimal re-renders |
| **Fallback** | Custom touch handler if HTML5 API insufficient | Safety net for edge cases |

---

## References

### Browser APIs
- [MDN: HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [MDN: DataTransfer Object](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer)
- [W3C: HTML Drag and Drop Specification](https://html.spec.whatwg.org/multipage/dnd.html)

### React Integration
- [React 19: Event System](https://react.dev/reference/react-dom/components/common)
- [React Hooks: useState, useRef, useEffect](https://react.dev/reference/react)
- [React Performance Optimization](https://react.dev/reference/react/useMemo)

### Accessibility
- [WCAG 2.1: Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [MDN: ARIA: button role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role)
- [ARIA Authoring Practices: Drag and Drop](https://www.w3.org/WAI/ARIA/apg/patterns/dragdrop/)

### Performance
- [Web.dev: Rendering Performance](https://web.dev/rendering-performance/)
- [MDN: CSS will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [Chrome DevTools: Performance](https://developer.chrome.com/docs/devtools/performance/)

### Touch Events
- [MDN: Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Web.dev: Touch Events and Pointer Events](https://web.dev/touch-and-pointer-events/)
- [Pointer Events W3C Spec](https://www.w3.org/TR/pointerevents3/)

---

## Project Integration Notes

For **TheAlbumn** project:

1. **Stage Reordering**: Implement in `SongCard` and `SongDetail` components using the patterns in Section 7.

2. **State Management**: Add `dragState` to component state (not global App state), since dragging is ephemeral UI state.

3. **Styling**: Use existing Tailwind dark theme colors:
   - Dragged item: `opacity-50 scale-95 bg-neutral-700`
   - Drop target: `border-l-4 border-amber-500`

4. **Accessibility**: Add keyboard shortcuts to match:
   - Arrow Up/Down: Move stage
   - Escape: Cancel drag (if in progress)

5. **Touch Support**: Implement parallel touch handler for mobile users accessing the app on tablets.

6. **Performance**: Use event delegation if stage count grows beyond 20; currently not necessary for typical 8-10 stages per song.

7. **Testing**: Manual testing priority (per constitution):
   - Drag stages within card
   - Drag stages in zoom view
   - Verify data persists (localStorage)
   - Test keyboard navigation
   - Test on touch device (if available)

8. **No External Dependencies**: All solutions use native browser APIs and React 19.1.1; no libraries required.

---

**End of Research Document**
