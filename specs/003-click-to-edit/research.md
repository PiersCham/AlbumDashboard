# Research: Click-to-Edit Tempo and Key Fields

**Feature**: 003-click-to-edit
**Date**: 2025-11-19
**Purpose**: Research UI patterns, state management approaches, and accessibility considerations for implementing click-to-edit functionality

---

## Research Questions

### RQ-001: What is the standard UI pattern for click-to-edit interactions?

**Decision**: Use label-triggered edit mode with auto-focus on input

**Rationale**:
- Industry standard: GitHub issue titles, Trello cards, Notion pages use click-to-edit
- Clear affordance: Clicking the label (not the value) provides intentional action
- Prevents accidental edits: Value text is non-interactive, only label triggers edit mode
- Accessibility: Label click is keyboard-navigable via Tab + Enter

**Alternatives considered**:
1. **Double-click value text**: Common pattern but higher accidental trigger risk, less discoverable
2. **Hover + edit icon**: Requires extra UI element, adds visual clutter (contradicts feature goal)
3. **Always-editable with toggle button**: Requires additional button, more complex UI
4. **Focus value on click**: Ambiguous whether clicking is for reading or editing

**Best practices applied**:
- Auto-focus input on edit mode entry (standard for inline editing)
- Display cursor pointer on label hover (visual affordance)
- Enter key saves, Escape key cancels (standard keyboard shortcuts)
- Blur event auto-saves (prevents data loss if user clicks away)

---

### RQ-002: How should edit state be managed in React for per-field, per-song editing?

**Decision**: Local component state using `useState` hooks for each field

**Rationale**:
- Edit state is ephemeral (not persisted to localStorage)
- Edit mode is scoped to individual song cards (no global edit mode)
- React's local state is simplest solution for component-scoped state
- No need for context/Redux since edit state doesn't cross component boundaries

**Implementation**:
```javascript
// In SongCard component
const [isEditingTempo, setIsEditingTempo] = useState(false);
const [isEditingKey, setIsEditingKey] = useState(false);
const [tempTempoValue, setTempTempoValue] = useState(song.tempo.toString());
const [tempKeyNote, tempKeyMode] = useState(parseKey(song.key));
```

**Alternatives considered**:
1. **Global edit state in parent component**: Overkill, adds complexity, violates "edit state is local"
2. **Single boolean for "isEditing"**: Cannot track which field is being edited
3. **Ref-based state**: Less React-idiomatic, harder to trigger re-renders
4. **Class component with this.state**: Functional components with hooks are modern standard

**Best practices applied**:
- Use controlled components for inputs (value tied to state)
- Store temporary values during edit mode (allow cancellation via Escape)
- Only update song data on save (blur/Enter), not on every keystroke

---

### RQ-003: How should multi-field editing be handled (tempo vs key)?

**Decision**: Auto-save current field when opening a new field's edit mode

**Rationale**:
- User explicitly selected "auto-save" option during specification phase
- Prevents data loss from forgetting to save before switching fields
- Simpler user mental model: "what I typed is saved unless I press Escape"
- Consistent with modern web apps (Google Docs, Notion auto-save behavior)

**Implementation**:
```javascript
const handleTempoLabelClick = () => {
  if (isEditingKey) {
    // Auto-save key field before opening tempo edit
    handleKeySave();
  }
  setIsEditingTempo(true);
  // Auto-focus tempo input (done via ref or autoFocus prop)
};
```

**Alternatives considered**:
1. **Discard unsaved changes**: User rejected this option (potential data loss)
2. **Prevent opening new field**: User rejected this option (too restrictive)
3. **Allow simultaneous editing**: Out of scope per spec, adds UI complexity

---

### RQ-004: What accessibility considerations apply to click-to-edit?

**Decision**: Implement full keyboard navigation with ARIA labels

**Rationale**:
- Labels must be keyboard-accessible (clickable via Enter/Space)
- Edit mode must announce state changes to screen readers
- Focus management must follow logical tab order

**Implementation**:
- Add `role="button"` and `tabIndex="0"` to clickable labels
- Add `aria-label="Click to edit tempo"` for screen reader context
- Auto-focus input when entering edit mode (moves focus automatically)
- Ensure Escape key returns focus to label (or next logical element)

**Best practices applied**:
- WCAG 2.1 AA compliance (keyboard navigation, focus indicators)
- Semantic HTML where possible (use `<button>` if label semantics conflict)
- Clear focus indicators on labels (outline on focus)

**Alternatives considered**:
1. **No keyboard support**: Fails accessibility standards, excludes keyboard users
2. **Custom focus management library**: Overkill for simple focus transitions
3. **Skip ARIA labels**: Reduces screen reader usability

---

### RQ-005: How should visual feedback differentiate display vs edit modes?

**Decision**: Use subtle visual cues without major layout shifts

**Rationale**:
- Display mode: Plain text with no borders (reduces visual clutter)
- Edit mode: Standard input styling with border and focus ring
- Label styling: Underline on hover, cursor pointer (affordance)
- No layout shifts: Display text and input have same dimensions

**Implementation**:
- Display mode: `<span className="text-base">{tempo} BPM</span>`
- Edit mode: `<input className="border rounded px-2 py-1" />`
- Label: `<label className="cursor-pointer hover:underline" />`
- Prevent layout shift: Set min-width on display text to match input width

**Best practices applied**:
- Tailwind utility classes (consistent with existing codebase)
- No animation on mode transitions (instant is faster than 200ms fade)
- Focus ring on inputs (standard browser behavior, accessibility)

**Alternatives considered**:
1. **Fade animation between modes**: Adds 200ms delay, feels sluggish
2. **Border on display mode**: Adds visual noise (contradicts feature goal)
3. **Inline pencil icon on hover**: Extra element, visual clutter

---

### RQ-006: How should validation errors be handled in edit mode?

**Decision**: Preserve existing validation logic, trigger on blur/Enter

**Rationale**:
- Existing tempo validation (30-300 BPM, clamping, visual feedback) already works
- Existing key normalization (enharmonic equivalents) already works
- No changes needed to validation logic, only when it triggers
- Validation on blur ensures user sees feedback before leaving edit mode

**Implementation**:
- Blur handler: `handleTempoBlur()` calls existing `validateTempo()`, updates song, exits edit mode
- Enter handler: Same as blur (validate, save, exit)
- Escape handler: Discard temp value, revert to original, exit edit mode (no validation)

**Edge cases handled**:
- Invalid input + Escape: Discard invalid value, revert to original (no validation error shown)
- Invalid input + Blur: Validate, clamp to boundary, show visual feedback, save clamped value
- Switching fields with invalid value: Auto-save triggers validation, clamps, then opens new field

---

## Summary of Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| RQ-001 | Label-triggered edit mode | Industry standard, prevents accidental edits, keyboard accessible |
| RQ-002 | Local useState for edit state | Simplest solution, edit state is component-scoped |
| RQ-003 | Auto-save on field switch | User preference, prevents data loss |
| RQ-004 | Full keyboard navigation + ARIA | Accessibility compliance, inclusive design |
| RQ-005 | Subtle visual cues, no layout shift | Maintains performance, reduces visual noise |
| RQ-006 | Preserve existing validation | No changes needed, trigger on blur/Enter |

**Total estimated code additions**:
- SongCard: ~60 lines (state, handlers, conditional JSX)
- SongDetail: ~60 lines (mirror SongCard)
- No new utilities or helpers needed
- No new CSS beyond Tailwind classes

**Risk assessment**: Low risk. No breaking changes, all existing functionality preserved. Edit state is ephemeral and scoped to components.

**Performance impact**: Negligible. Local state updates are <1ms, no re-renders outside edited component.

**Testing strategy**: Manual testing using quickstart.md scenarios. Automated tests optional for edit state logic.
