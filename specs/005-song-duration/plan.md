# Implementation Plan: Song Duration Tracking

**Branch**: `005-song-duration` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-song-duration/spec.md`

## Summary

Add duration tracking (minutes and seconds) to each song, displayed next to the Tempo attribute. Users can view and edit duration using inline click-to-edit pattern (matching existing Tempo/Key editing). Duration is stored as `{minutes: number, seconds: number}` in the song object and persisted to localStorage.

**Technical Approach**: Extend existing song data model with duration field, add inline editing UI following established patterns from Tempo and Key features, implement validation/clamping for 0-59 ranges, format display as "M:SS" with leading zeros.

## Technical Context

**Language/Version**: JavaScript (ES2022) with React 19.1.1
**Primary Dependencies**: React 19.1.1, Vite 7.1.1 (no additional libraries needed)
**Storage**: localStorage (existing pattern in App.jsx)
**Testing**: Manual testing (per constitution - UI-centric feature)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page application (SPA) - all code in src/App.jsx
**Performance Goals**: Immediate UI response (<16ms), 60fps interactions
**Constraints**: Must maintain backward compatibility with existing song data (add duration with default 0:00)
**Scale/Scope**: 12 songs total, duration editing follows existing inline edit pattern

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First

- [x] **No external libraries**: Duration editing reuses existing inline edit pattern (Tempo/Key)
- [x] **Self-documenting code**: Duration format logic (formatDuration, parseDuration) is straightforward
- [x] **No abstraction layers**: Direct state updates to song.duration object
- [x] **React built-in features**: useState for edit mode, existing validation patterns

**Assessment**: ✅ PASS - Feature extends existing patterns without new dependencies or complexity.

### Principle II: User Experience is Non-Negotiable

- [x] **Immediate feedback**: Duration display updates instantly on edit
- [x] **Intuitive**: Follows same click-to-edit pattern as Tempo and Key (no training required)
- [x] **Data persistence**: localStorage write on blur/Enter (existing onUpdate pattern)
- [x] **Recoverable**: Escape key cancels edit, value clamping prevents invalid states
- [x] **Performance**: Simple string formatting and number validation, <16ms response

**Assessment**: ✅ PASS - Feature maintains established UX patterns and performance expectations.

### Principle III: Data Integrity and Ownership

- [x] **No data loss**: Duration defaults to {minutes: 0, seconds: 0} for existing songs (backward compatible)
- [x] **localStorage persistence**: Existing `onUpdate` pattern saves after every change
- [x] **Exportable**: JSON export already includes full song object (duration auto-included)
- [x] **Backward compatible**: Existing songs without duration get default value on load
- [x] **No server dependencies**: Purely client-side feature

**Assessment**: ✅ PASS - Feature preserves all existing data integrity guarantees.

**Overall Constitution Grade**: ✅ PASS - No violations. Feature aligns with all three core principles.

**Post-Design Re-evaluation**: ✅ PASS - After completing research and design documents, all constitutional principles remain satisfied:
- Simplicity: No new dependencies, reuses existing inline edit pattern, simple helper functions
- User Experience: Immediate feedback, familiar UX pattern, comprehensive validation
- Data Integrity: Backward compatible default values, immediate localStorage persistence, zero data loss risk

## Project Structure

### Documentation (this feature)

```text
specs/005-song-duration/
├── plan.md              # This file
├── research.md          # Phase 0: Duration formatting, validation patterns
├── data-model.md        # Phase 1: Song entity extension with duration field
├── quickstart.md        # Phase 1: Manual testing guide
├── contracts/
│   └── component-api.md # Phase 1: SongCard/SongDetail duration editing API
└── tasks.md             # (Generated later by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
└── App.jsx              # All changes in single file (existing pattern)
    ├── Song data model (DEFAULT_SONGS)
    │   └── Add duration: {minutes: 0, seconds: 0}
    ├── Helper functions
    │   ├── formatDuration(minutes, seconds) → "M:SS"
    │   └── validateDuration(minutes, seconds) → clamped values
    ├── SongCard component (~line 396)
    │   └── Add duration display and inline editing
    └── SongDetail component (~line 613)
        └── Add duration display and inline editing (mirror SongCard)

(No new files or directories needed)
```

**Structure Decision**: Single-file implementation in src/App.jsx following existing project pattern. Duration editing will follow the same inline edit pattern as Tempo and Key (click label/value to edit, separate inputs for minutes/seconds, Enter to save, Escape to cancel). No new components needed due to simplicity principle.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**N/A** - No constitution violations. All gates passed.
