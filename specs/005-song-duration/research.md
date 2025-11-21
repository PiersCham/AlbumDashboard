# Research: Song Duration Tracking

**Feature**: 005-song-duration
**Date**: 2025-11-21
**Purpose**: Research duration formatting, validation patterns, and inline editing best practices

## Research Questions

1. How should duration be formatted for display (M:SS vs MM:SS)?
2. What validation rules should apply to minutes and seconds inputs?
3. How should the inline editing UI be structured (single input vs separate fields)?
4. What keyboard shortcuts should be supported?
5. How should backward compatibility be handled for existing songs?

---

## Decision 1: Duration Display Format

**Chosen**: `M:SS` format (e.g., "3:45", "12:03")

**Rationale**:
- Standard for song durations in music applications (Spotify, Apple Music, YouTube)
- Compact display suitable for song card UI constraints
- Clear distinction between minutes and seconds with colon separator
- Leading zero only on seconds (not minutes) matches music industry standard
- Supports songs from 0:00 to 59:59 (sufficient for vast majority of songs)

**Alternatives Considered**:
- `MM:SS` format: Rejected - unnecessary leading zero on minutes wastes space and looks odd for single-digit minutes
- Decimal minutes (e.g., "3.75 min"): Rejected - less intuitive for musicians, harder to input
- Hours support (H:MM:SS): Rejected - out of scope per spec, songs >59:59 are rare

**Implementation Notes**:
- Seconds < 10 must display with leading zero (e.g., "2:05" not "2:5")
- Minutes do not need leading zero (e.g., "3:45" not "03:45")
- Default display for unset duration: "0:00"

---

## Decision 2: Input Validation Rules

**Chosen**: Clamp-based validation with 0-59 range for both fields

**Rationale**:
- Matches standard time constraints (60 seconds = 1 minute, 60 minutes = 1 hour)
- Clamping (vs rejection) provides better UX - no error messages needed
- Prevents invalid states while being forgiving to typos
- Consistent with Tempo validation pattern already in codebase

**Validation Rules**:
1. **Minutes**: Integer 0-59, clamped to nearest valid value
   - Input 75 → clamped to 59
   - Input -5 → clamped to 0
   - Non-numeric input → reverted to previous value or 0
2. **Seconds**: Integer 0-59, clamped to nearest valid value
   - Same clamping logic as minutes
3. **Empty fields**: Treated as 0
4. **Decimal inputs**: Truncated to integer (e.g., 3.7 → 3)

**Alternatives Considered**:
- Error messages on invalid input: Rejected - adds UI complexity, interrupts flow
- Auto-rollover (60 seconds → 1 minute): Rejected - confusing for manual entry, scope creep
- Allowing any positive integer: Rejected - violates M:SS format constraint

---

## Decision 3: Inline Editing UI Structure

**Chosen**: Separate input fields for minutes and seconds

**Rationale**:
- Clear separation reduces input errors (no need to type colon)
- Matches existing Tempo editing pattern (single focused input)
- Allows Tab key navigation between minutes and seconds
- Each field can have its own validation (0-59)
- More accessible for keyboard-only users

**UI Layout**:
```
Display Mode:    Duration: 3:45
Edit Mode:       Duration: [3] : [45]  (two separate <input> elements)
```

**Keyboard Shortcuts**:
- Enter: Save changes
- Escape: Cancel and revert to previous value
- Tab: Move from minutes to seconds field
- Shift+Tab: Move from seconds to minutes field

**Alternatives Considered**:
- Single input with M:SS format parsing: Rejected - requires parsing logic, error-prone with colons
- Dropdown selectors: Rejected - slower for data entry, overkill for simple numbers
- Slider/stepper controls: Rejected - less precise, takes more UI space

---

## Decision 4: Keyboard Shortcuts and Accessibility

**Chosen**: Standard form editing shortcuts (Enter, Escape, Tab)

**Rationale**:
- Matches Tempo and Key editing patterns in existing codebase
- Familiar to users (standard HTML form behavior)
- No custom shortcuts needed - reduces cognitive load

**Shortcuts**:
- **Enter**: Save duration and exit edit mode
- **Escape**: Cancel edit and restore previous value
- **Tab**: Navigate between minutes and seconds inputs
- **Click outside (blur)**: Auto-save (matches Tempo behavior)

**Accessibility**:
- Input fields have descriptive labels ("Minutes", "Seconds")
- Tab order: minutes → seconds → next UI element
- Screen reader announces: "Duration: 3 minutes 45 seconds"

**Alternatives Considered**:
- Ctrl+S to save: Rejected - unnecessary complexity, Enter is standard
- Auto-save on every keystroke: Rejected - too many localStorage writes, performance concern
- Custom shortcuts (e.g., Ctrl+Up/Down to increment): Rejected - scope creep, not in spec

---

## Decision 5: Backward Compatibility Strategy

**Chosen**: Default duration to `{minutes: 0, seconds: 0}` for existing songs

**Rationale**:
- Zero-impact migration - existing songs load normally
- Obvious default value ("0:00") signals "not yet set" to users
- No data transformation needed - just add field with default
- Existing JSON exports continue to work (new field is additive)

**Migration Strategy**:
1. Update DEFAULT_SONGS to include `duration: {minutes: 0, seconds: 0}`
2. In song loading logic, check if `song.duration` exists
3. If missing, add default: `song.duration = {minutes: 0, seconds: 0}`
4. No localStorage migration needed - happens lazily on first load

**Data Model**:
```javascript
// Before (existing songs)
{
  id: 1,
  title: "Song 1",
  tempo: 120,
  key: "C Major",
  stages: [...]
}

// After (with duration added)
{
  id: 1,
  title: "Song 1",
  tempo: 120,
  key: "C Major",
  duration: {minutes: 0, seconds: 0},  // New field
  stages: [...]
}
```

**Alternatives Considered**:
- Explicit migration script: Rejected - overkill for adding one field with default
- Leave duration undefined until user sets it: Rejected - complicates display logic (need null checks)
- Store as total seconds instead of {minutes, seconds}: Rejected - less intuitive for editing, requires conversion

---

## Decision 6: Edit Mode Trigger

**Chosen**: Click on "Duration:" label or the duration value to enter edit mode

**Rationale**:
- Matches existing Tempo/Key editing patterns exactly
- Large clickable area (label + value) reduces precision required
- Discoverable - users learn from Tempo/Key interaction
- No additional UI elements needed (no "Edit" button)

**Clickable Areas**:
- "Duration:" label text
- The duration value (e.g., "3:45")
- Clicking on either activates edit mode

**Alternatives Considered**:
- Click only on value (not label): Rejected - smaller target, harder to discover
- Dedicated "Edit" button: Rejected - adds UI clutter, deviates from established pattern
- Double-click to edit: Rejected - less discoverable, conflicts with text selection

---

## Decision 7: Visual Feedback During Edit

**Chosen**: Minimal feedback - swap display text with input fields, no border color changes

**Rationale**:
- Matches existing Tempo/Key editing visual style
- Input fields themselves provide sufficient "edit mode" indication
- Focus ring (browser default) shows which field is active
- Keeps UI clean and unobtrusive

**Visual Changes**:
- Display mode: Plain text "3:45"
- Edit mode: Two `<input>` elements with borders
- No additional background color or border highlights
- Standard focus ring on active input

**Alternatives Considered**:
- Highlight entire row with background color: Rejected - too prominent, distracting
- Animate transition to edit mode: Rejected - unnecessary complexity for simple edit
- Show checkmark/cancel buttons: Rejected - Enter/Escape are sufficient, adds UI clutter

---

## Summary

**Core Design Decisions**:
1. Display format: `M:SS` (standard music format)
2. Validation: 0-59 clamping for both fields (no error messages)
3. Editing UI: Separate inputs for minutes and seconds
4. Keyboard: Enter/Escape/Tab (matches existing patterns)
5. Backward compatibility: Default `{minutes: 0, seconds: 0}` for existing songs
6. Edit trigger: Click on label or value (matches Tempo/Key)
7. Visual feedback: Minimal - input swap only (matches existing style)

**No unresolved questions** - all decisions align with existing codebase patterns and constitutional principles.
