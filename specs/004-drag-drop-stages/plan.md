# Implementation Plan: Drag-and-Drop Stage Reordering

**Branch**: `004-drag-drop-stages` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-drag-drop-stages/spec.md`

## Summary

Add drag-and-drop functionality to reorder stages within a song's production workflow. Users can click and drag any stage bar to a new position with visual feedback showing where it will be inserted. The feature supports both mouse and touch interfaces, includes cancel mechanisms (Escape key, drag-out), and optionally keyboard-only reordering for accessibility. Changes persist to localStorage immediately.

**Technical Approach**: Use native HTML5 Drag and Drop API with React event handlers. For touch support, add touch event listeners with polyfill for drag events. Implement visual feedback via CSS classes during drag state. No external drag-and-drop libraries needed (adheres to constitution's simplicity principle).

## Technical Context

**Language/Version**: JavaScript (ES2022) with React 19.1.1
**Primary Dependencies**: React 19.1.1, Vite 7.1.1 (no additional libraries needed)
**Storage**: localStorage (existing pattern in App.jsx)
**Testing**: Manual testing (per constitution - UI-centric feature)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), touch devices (tablets, phones)
**Project Type**: Single-page application (SPA) - all code in src/App.jsx
**Performance Goals**: 60fps drag interactions, <16ms per frame, immediate visual feedback
**Constraints**: Must not disrupt existing stage editing (click-to-edit modal), must work on touch devices, must preserve data integrity
**Scale/Scope**: 12 songs × ~8 stages each = ~96 draggable items max (low complexity)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First

- [x] **No external libraries**: Use native HTML5 Drag and Drop API (built-in browser feature)
- [x] **Self-documenting code**: Drag event handlers (onDragStart, onDragOver, onDrop) are semantic
- [x] **No abstraction layers**: Direct state updates to `song.stages` array via array splice/reorder
- [x] **React built-in features**: useState for drag state, standard event handlers

**Assessment**: ✅ PASS - Feature uses only browser primitives and React hooks. No new dependencies.

### Principle II: User Experience is Non-Negotiable

- [x] **Immediate feedback**: Visual feedback during drag (opacity change, drop indicator)
- [x] **Intuitive**: Drag-and-drop is a familiar interaction pattern (no training required)
- [x] **Data persistence**: localStorage write on drop (existing onUpdate pattern)
- [x] **Recoverable**: Cancel via Escape key or drag-out
- [x] **Performance**: Native drag API is 60fps capable, minimal React re-renders

**Assessment**: ✅ PASS - Feature enhances UX by allowing workflow customization without adding complexity.

### Principle III: Data Integrity and Ownership

- [x] **No data loss**: Stage order is just array index reordering (no data modification)
- [x] **localStorage persistence**: Existing `onUpdate` pattern saves after every change
- [x] **Backward compatible**: Stage array already exists; reordering doesn't change schema
- [x] **Exportable**: JSON export already includes stages array in order
- [x] **No server dependencies**: Purely client-side feature

**Assessment**: ✅ PASS - Feature preserves all existing data integrity guarantees.

**Overall Constitution Grade**: ✅ PASS - No violations. Feature aligns with all three core principles.

**Post-Design Re-evaluation**: ✅ PASS - After completing research and design documents, all constitutional principles remain satisfied:
- Simplicity: Native HTML5 API, no libraries, straightforward event handlers
- User Experience: Smooth 60fps interactions, clear visual feedback, multiple input methods (mouse/touch/keyboard)
- Data Integrity: Array reordering only, no data modification, immediate persistence

## Project Structure

### Documentation (this feature)

```text
specs/004-drag-drop-stages/
├── plan.md              # This file
├── research.md          # Phase 0: Drag-and-drop patterns and best practices
├── data-model.md        # Phase 1: Stage reordering state model
├── quickstart.md        # Phase 1: Manual testing guide for drag-and-drop
├── contracts/
│   └── component-api.md # Phase 1: SongCard/SongDetail drag API contract
└── tasks.md             # (Generated later by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
└── App.jsx              # All changes in single file (existing pattern)
    ├── SongCard component (~line 396)
    │   └── Add drag handlers to StageRow
    └── SongDetail component (~line 613)
        └── Add drag handlers to StageRow (mirror SongCard)

(No new files or directories needed)
```

**Structure Decision**: Single-file implementation in src/App.jsx following existing project pattern. Drag-and-drop handlers will be added to the StageRow component rendering logic in both SongCard and SongDetail. No separate drag component needed due to simplicity principle.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**N/A** - No constitution violations. All gates passed.
