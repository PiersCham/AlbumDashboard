# Implementation Plan: Click-to-Edit Tempo and Key Fields

**Branch**: `003-click-to-edit` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/003-click-to-edit/spec.md`

## Summary

This feature transforms the tempo and key input fields from always-editable to a click-to-edit pattern. Users will see clean, read-only displays of tempo and key values by default. Clicking the field label (e.g., "Tempo" or "Key") enters edit mode, showing the input controls. This reduces visual clutter, prevents accidental edits, and improves scanning efficiency while maintaining all existing validation and normalization behavior.

**Technical Approach**: Add per-field edit state to SongCard and SongDetail components using React useState hooks. Conditionally render either display text or input controls based on edit state. Implement label click handlers to toggle edit mode with auto-focus. Add keyboard handlers for Enter (save), Escape (discard), and blur handlers for auto-save. Auto-save current field when opening a different field's edit mode.

## Technical Context

**Language/Version**: JavaScript ES2020+
**Primary Dependencies**: React 19.1.1, React DOM 19.1.1
**Storage**: Browser localStorage (client-side only, no backend)
**Testing**: Manual testing for UI interactions; automated tests recommended for edit state logic
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page application (React SPA)
**Performance Goals**: <100ms response to label clicks, 60fps UI transitions, instant display/edit mode switching
**Constraints**: Offline-capable (no server dependencies), localStorage quota limits (~5-10MB)
**Scale/Scope**: Single-user personal tool, ~20 songs per album, minimal data footprint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First

✅ **PASS** - Feature maintains simplicity:
- Uses existing React patterns (useState, conditional rendering)
- No new dependencies required
- Reuses existing validation/normalization logic
- Edit state is simple boolean per field
- No abstraction layers added
- Implementation confined to existing components (SongCard, SongDetail)

### Principle II: User Experience is Non-Negotiable

✅ **PASS** - Feature directly improves UX:
- Reduces visual clutter (primary user request)
- Prevents accidental edits (common pain point)
- Improves scanning efficiency (faster to find tempo/key values)
- Maintains all existing validation feedback
- Keyboard shortcuts (Enter/Escape) follow standard UX patterns
- Auto-focus on edit mode follows accessibility best practices
- No breaking changes to existing workflows
- <100ms response maintains 60fps target

### Principle III: Data Integrity and Ownership

✅ **PASS** - Feature preserves data integrity:
- No changes to data model or persistence mechanism
- All existing export/import functionality preserved
- Auto-save on blur prevents data loss
- Escape key provides undo for partial edits
- localStorage persistence automatic via existing useEffect
- No server dependencies (offline-capable maintained)
- Zero risk of data loss during mode transitions

**Gate Status**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-click-to-edit/
├── plan.md              # This file
├── research.md          # Phase 0 output (UI patterns, state management decisions)
├── data-model.md        # Phase 1 output (Edit state model)
├── quickstart.md        # Phase 1 output (testing click-to-edit interactions)
├── contracts/           # Phase 1 output (Component API contracts)
└── checklists/
    └── requirements.md  # Spec validation checklist (already created)
```

### Source Code (repository root)

```text
src/
├── App.jsx              # Main component - contains SongCard and SongDetail components
├── main.jsx             # Entry point
├── index.css            # Global styles
└── App.css              # Component styles

# No new files required - all changes in App.jsx
```

**Structure Decision**: Single project structure (Option 1). This is a client-side React app with all logic in `src/App.jsx`. No backend, no separate services layer. Modifications will be made to:

1. **SongCard component** (App.jsx): Add edit state for tempo and key, label click handlers, conditional rendering
2. **SongDetail component** (App.jsx): Mirror SongCard changes for consistency
3. **No new components**: Edit state is local to each song card/detail view
4. **No new utilities**: Existing validation/normalization functions remain unchanged

## Complexity Tracking

> **No violations** - Feature aligns perfectly with all constitutional principles. No complexity justification required.

---

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 0 (Research) and Phase 1 (Design) completion*

### Principle I: Simplicity First

✅ **STILL PASSING** - Design maintains simplicity:
- **No new dependencies**: Zero npm packages added
- **No new files**: All changes contained in existing `src/App.jsx`
- **Minimal new code**: ~80-120 lines estimated (edit state + handlers + conditional rendering)
- **Follows existing patterns**: Similar to existing state management in SongCard
- **Self-documenting code**: Function names are clear (`handleTempoLabelClick`, `handleKeyLabelClick`, `exitEditMode`)
- **Simple data types**: Boolean for edit state (isEditingTempo, isEditingKey)

### Principle II: User Experience is Non-Negotiable

✅ **STILL PASSING** - Design preserves user experience:
- **Transparent state transitions**: Instant switch between display and edit modes
- **Instant feedback**: Auto-focus on edit mode entry, immediate visual change
- **Graceful cancellation**: Escape key discards changes without validation errors
- **Performance maintained**: State updates are sub-millisecond, no layout shifts
- **Zero breaking changes**: All existing functionality preserved
- **Familiar UI patterns**: Click-to-edit is standard web pattern (inline editing)
- **Accessibility**: Auto-focus supports keyboard navigation

### Principle III: Data Integrity and Ownership

✅ **STILL PASSING** - Design enhances data integrity:
- **Auto-save on blur**: No manual "save" button needed, prevents data loss
- **Validation preserved**: All existing tempo/key validation rules maintained
- **Export/import unchanged**: Edit state is ephemeral, not persisted
- **No data loss risk**: Escape key provides rollback, blur saves changes
- **User control**: Explicit edit mode entry (click label), clear exit (blur/Enter/Escape)

### Design Findings

1. **Edit state scope**: Per-field, per-song (isEditingTempo, isEditingKey state in each SongCard/SongDetail)
2. **Auto-save behavior**: Blur and Enter both trigger save, Escape triggers discard
3. **Multi-field handling**: Opening new field auto-saves current field (per user choice)
4. **UI changes**: Labels become clickable, display text replaces input fields by default
5. **Estimated implementation**: <3 hours for experienced React developer
6. **State management**: Local component state (useState), no global state needed
7. **Event handlers needed**: `handleTempoLabelClick`, `handleKeyLabelClick`, `exitEditMode`, `handleKeyDown`

**Final Gate Status**: ✅ ALL CHECKS PASSED - Ready for `/speckit.tasks` to generate implementation tasks
