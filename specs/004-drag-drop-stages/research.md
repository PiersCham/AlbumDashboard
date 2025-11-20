# Research: Drag-and-Drop Implementation for Stage Reordering

**Feature**: 004-drag-drop-stages
**Date**: 2025-11-20
**Purpose**: Research HTML5 drag-and-drop patterns for React to inform implementation decisions

---

## Decision 1: Use HTML5 Drag and Drop API (Native)

**Decision**: Implement drag-and-drop using the native HTML5 Drag and Drop API with React synthetic events.

**Rationale**:
- No external dependencies required (aligns with constitution's Simplicity First principle)
- Excellent browser support (all modern browsers including mobile Safari)
- Native API provides all needed features: visual feedback, drop zones, keyboard events
- React 19 has optimized synthetic event handling for drag events
- Performance is native-level (60fps capable without optimization)

**Alternatives Considered**:
- **react-beautiful-dnd**: Rejected - adds 50KB dependency, overcomplicated for simple list reordering
- **dnd-kit**: Rejected - adds dependencies, abstracts away native API benefits
- **Pointer Events API**: Considered but rejected - requires more boilerplate for same result

**Implementation Notes**:
```javascript
// Core drag events to implement:
// - onDragStart: Set dataTransfer, add drag state
// - onDragOver: Prevent default, show drop indicator
// - onDrop: Reorder array, persist to localStorage
// - onDragEnd: Clean up drag state
```

---

## Decision 2: Component-Level State Management with Refs

**Decision**: Use local component state (useState) for visual feedback combined with refs for drag UI state.

**Rationale**:
- Drag UI state (which item is being dragged, current drop target) doesn't need to trigger re-renders
- Using refs avoids unnecessary React updates during 60fps drag motion
- Visual feedback (CSS classes) applied via state only when needed (dragstart/dragend)
- Follows React best practices for performance-critical interactions

**Alternatives Considered**:
- **Full state management**: Rejected - causes re-renders on every dragover event (janky UI)
- **Context API**: Rejected - overkill for component-local drag state
- **No state (pure CSS)**: Rejected - can't track drop position for insertion logic

**Implementation Notes**:
```javascript
// In SongCard/SongDetail:
const draggedIndexRef = useRef(null); // No re-renders
const [dropTargetIndex, setDropTargetIndex] = useState(null); // Visual feedback only
```

---

## Decision 3: CSS-Based Visual Feedback

**Decision**: Use Tailwind utility classes + custom CSS for drag visual feedback.

**Rationale**:
- Tailwind already in project (no new dependencies)
- Opacity changes, cursors, and drop indicators can be pure CSS
- CSS transitions provide smooth 60fps animations
- No JavaScript needed for visual polish (separation of concerns)

**Alternatives Considered**:
- **Inline styles**: Rejected - harder to maintain, no transition support
- **CSS-in-JS library**: Rejected - violates simplicity principle
- **Custom CSS file**: Considered but Tailwind + a few custom classes is simpler

**Implementation Notes**:
```css
/* Custom classes for drag states */
.dragging { opacity: 0.5; cursor: grabbing; }
.drop-target-above::before {
  content: '';
  position: absolute;
  top: -2px;
  height: 4px;
  background: #fbbf24; /* amber-500 */
}
```

---

## Decision 4: Touch Support via Parallel Touch Handlers

**Decision**: Implement touch support using parallel touch event handlers (touchstart, touchmove, touchend) with long-press activation.

**Rationale**:
- Mobile Safari and Chrome support touch but not all drag events
- Long-press (500ms) is familiar pattern for initiating drag on mobile
- Parallel implementation (separate handlers) keeps mouse and touch logic decoupled
- No polyfill needed - native touch events work everywhere

**Alternatives Considered**:
- **Touch-action CSS only**: Rejected - not sufficient for full drag-and-drop control
- **Pointer Events API**: Considered - would unify mouse/touch but requires more work
- **Polyfill library**: Rejected - adds dependency, conflicts with constitution

**Implementation Notes**:
```javascript
// Touch handler pattern:
const handleTouchStart = (e, index) => {
  longPressTimer = setTimeout(() => {
    setIsDragging(true);
    draggedIndexRef.current = index;
  }, 500);
};

const handleTouchMove = (e) => {
  if (!isDragging) return;
  // Calculate drop position from touch coordinates
};
```

---

## Decision 5: Keyboard Accessibility with Ctrl+Arrow

**Decision**: Implement keyboard reordering using Ctrl+Up/Down arrow keys when a stage is focused.

**Rationale**:
- WCAG 2.1 Level AA compliance requires keyboard-only operation
- Arrow keys are intuitive for "move up/down" operations
- Ctrl modifier prevents conflicts with normal arrow key scrolling
- Simple to implement (onKeyDown handler on StageRow)

**Alternatives Considered**:
- **Tab+Space pattern**: Rejected - less intuitive, requires multi-step activation
- **Dedicated "Reorder" button**: Rejected - adds UI clutter
- **Screen reader only**: Rejected - excludes keyboard-only sighted users

**Implementation Notes**:
```javascript
const handleKeyDown = (e, index) => {
  if (e.ctrlKey && e.key === 'ArrowUp' && index > 0) {
    moveStage(index, index - 1);
  } else if (e.ctrlKey && e.key === 'ArrowDown' && index < stages.length - 1) {
    moveStage(index, index + 1);
  }
};
```

---

## Decision 6: Event Delegation for Performance

**Decision**: Use event delegation by attaching drag handlers to each StageRow (not the parent container).

**Rationale**:
- Current scale (max 96 stages total) doesn't justify container-level delegation
- Per-row handlers are simpler and more React-idiomatic
- No performance issues with <100 event listeners in modern browsers
- Easier to debug and maintain

**Alternatives Considered**:
- **Container-level delegation**: Rejected - premature optimization, adds complexity
- **Virtual scrolling**: Rejected - YAGNI for current scale

**Implementation Notes**:
- Attach onDragStart, onDragOver, onDrop to each StageRow div
- React batches updates automatically, so no manual batching needed

---

## Decision 7: No Drag Preview Customization

**Decision**: Use browser's default drag ghost image (no custom setDragImage).

**Rationale**:
- Default ghost image (semi-transparent copy of element) is familiar to users
- Custom drag images add complexity without clear UX benefit
- Browser default is accessible and works across all platforms

**Alternatives Considered**:
- **Custom ghost image**: Rejected - requires creating hidden canvas element, not worth complexity
- **No ghost image**: Rejected - poor UX, user loses visual connection to dragged item

**Implementation Notes**:
- Rely on browser default `dataTransfer.effectAllowed = 'move'`
- Apply opacity CSS to original element during drag for visual feedback

---

## Summary Table

| Aspect | Decision | Key Benefit |
|--------|----------|-------------|
| Core API | HTML5 Drag and Drop | Native, zero dependencies |
| State Management | useState + useRef | Avoids unnecessary re-renders |
| Visual Feedback | Tailwind + custom CSS | 60fps transitions, no JS |
| Touch Support | Parallel touch handlers | Mobile-friendly, no polyfill |
| Keyboard | Ctrl+Arrow keys | WCAG AA accessible |
| Performance | Per-row handlers | Simple, sufficient for scale |
| Drag Preview | Browser default | Familiar, accessible |

---

## Integration Notes for TheAlbumn Project

1. **No package.json changes**: All decisions use existing dependencies (React, Tailwind)
2. **Single file changes**: All code goes in `src/App.jsx` (StageRow component)
3. **Constitution compliance**:
   - ✅ Simplicity First: No abstractions, no libraries
   - ✅ User Experience: Immediate feedback, intuitive interactions
   - ✅ Data Integrity: Array reordering preserves all stage data
4. **Testing strategy**: Manual testing per constitution (UI-centric feature)
5. **Backward compatibility**: Existing stage data (name, value) unchanged, only array order shifts

---

## References

- [MDN: HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [React Docs: Drag and Drop](https://react.dev/reference/react-dom/components/common#react-event-object)
- [WCAG 2.1: Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)
- [Touch Events Specification](https://w3c.github.io/touch-events/)
