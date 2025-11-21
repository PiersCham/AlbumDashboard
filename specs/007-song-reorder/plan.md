# Implementation Plan: Song Card Reordering

**Branch**: `007-song-reorder` | **Date**: 2025-11-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-song-reorder/spec.md`

## Summary

This feature enables drag-and-drop reordering of song cards in the main view, allowing users to organize their album track list visually. The implementation uses React's built-in event handlers for drag operations (onDragStart, onDragOver, onDrop) without external libraries, maintaining alignment with the Simplicity First principle. Song order persists to localStorage immediately after each successful drop operation.

**Technical Approach**: Leverage HTML5 Drag and Drop API via React synthetic events, store drag state in component state, update songs array order on drop, and persist to localStorage using existing persistence mechanism.

## Technical Context

**Language/Version**: JavaScript (ES6+), React 19.1.1
**Primary Dependencies**: React 19.1.1, React-DOM 19.1.1, Tailwind CSS 4.1.11
**Storage**: localStorage (existing implementation pattern)
**Testing**: Manual testing (per constitution - UI-centric features)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - all support HTML5 Drag and Drop)
**Project Type**: Single-file SPA (src/App.jsx contains all components)
**Performance Goals**: <100ms drag feedback latency, 60fps during drag animations
**Constraints**: Offline-capable (no server dependencies), immediate localStorage persistence
**Scale/Scope**: 12 song cards (fixed album size), single-user application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity First

- ✅ **PASS**: Uses React built-in event handlers (no drag-and-drop library like react-dnd)
- ✅ **PASS**: Follows existing pattern of inline component definition in App.jsx (no new abstractions)
- ✅ **PASS**: Reuses existing songs state array structure (no new data models beyond position tracking)
- ✅ **PASS**: Drag implementation follows similar pattern to existing inline editing features (Tempo, Key, Duration)

**Justification**: HTML5 Drag and Drop API is sufficient for this use case. Adding a library would violate YAGNI.

### II. User Experience is Non-Negotiable

- ✅ **PASS**: Visual feedback during drag (cursor follows dragged card, drop zones highlighted)
- ✅ **PASS**: Immediate persistence to localStorage after drop (zero data loss)
- ✅ **PASS**: Cancel operation via Escape key (user control)
- ✅ **PASS**: Performance target <100ms feedback aligns with constitution's <100ms response requirement

**Justification**: Drag-and-drop provides intuitive UX for reordering. Visual feedback and persistence ensure user trust.

### III. Data Integrity and Ownership

- ✅ **PASS**: Reordering preserves all song properties (title, tempo, key, duration, stages)
- ✅ **PASS**: localStorage write occurs immediately after successful drop
- ✅ **PASS**: Existing export/import mechanism will reflect new order (no schema change required)
- ✅ **PASS**: Cancelled drags restore original order (no partial state corruption)

**Justification**: Song order is part of user's creative workflow. Data integrity is maintained via defensive state updates.

### Re-check After Phase 1 Design

**Status**: ✅ ALL GATES PASS - Design maintains constitutional compliance

#### I. Simplicity First (Re-validated)

- ✅ **PASS**: HTML5 Drag and Drop API confirmed as simplest approach (research.md Decision 1)
- ✅ **PASS**: Component state management pattern matches existing inline editing (research.md Decision 2)
- ✅ **PASS**: No new data fields on Song entity - position derived from array index (data-model.md)
- ✅ **PASS**: Immutable array reordering uses standard JavaScript splice (data-model.md)

**Post-Design Validation**: Implementation design adds only 4 event handlers and 2 ephemeral state variables. No new abstractions, no external libraries, follows existing codebase patterns exactly.

#### II. User Experience (Re-validated)

- ✅ **PASS**: Visual feedback contract defined (component-api.md) - opacity + border indicators
- ✅ **PASS**: Performance contract specifies 60fps, <100ms feedback (component-api.md)
- ✅ **PASS**: Escape key cancel and edge case handling documented (quickstart.md tests 4, 10, 14)
- ✅ **PASS**: Manual test suite covers all user scenarios (quickstart.md - 16 test cases)

**Post-Design Validation**: Design ensures immediate visual feedback, smooth 60fps drag, and defensive error handling. All edge cases (same-position, cancel, interruption) have defined behaviors.

#### III. Data Integrity (Re-validated)

- ✅ **PASS**: Immutable state updates prevent corruption (data-model.md: Array Reordering Operation)
- ✅ **PASS**: Existing useEffect persistence mechanism triggers on songs change (data-model.md: Persistence Model)
- ✅ **PASS**: Export/import compatibility maintained (data-model.md: Export/Import section)
- ✅ **PASS**: Edge case handling prevents partial state corruption (component-api.md: Error Handling Contract)

**Post-Design Validation**: Design preserves all existing song properties during reorder. Defensive validation checks (null draggedIndex, same-position drop) prevent invalid state updates. Cancel operations restore original order without side effects.

**Final Verdict**: Design phase complete, all constitutional principles satisfied. Ready for implementation via `/speckit.tasks`.

## Project Structure

### Documentation (this feature)

```text
specs/007-song-reorder/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── component-api.md # Drag handler contracts and event flow
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
└── App.jsx              # All components including SongCard with drag handlers

index.html
package.json
vite.config.js
tailwind.config.js
```

**Structure Decision**: Single-file SPA architecture. All components (App, Header, SongCard, SongDetail, StageRow, ExportImport, EditableText) exist in App.jsx. This matches the existing codebase pattern and satisfies Simplicity First principle. No new files or directories required for this feature.

## Complexity Tracking

**No violations** - All constitution gates passed. Implementation uses React built-in features and follows existing codebase patterns.
