# Implementation Plan: Add New Song

**Branch**: `012-add-song` | **Date**: 2025-12-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-add-song/spec.md`

## Summary

Enable users to dynamically add new songs to their album beyond the initial 12-song default, and remove unwanted songs. The "Add Song" button appears in the grid view and creates songs with default values (default stages, 120 BPM tempo, no key, zero duration, non-draft status). Song removal is available only in the zoom/detail view with confirmation prompts for songs with progress. Song IDs increment from the maximum existing ID (never reusing gaps), and the button disables proactively when approaching the 99-song limit or localStorage quota.

## Technical Context

**Language/Version**: JavaScript ES2022
**Primary Dependencies**: React 19.1.1, Vite 7.1.1, Tailwind CSS 4.1.11
**Storage**: Browser localStorage (key: `albumProgress_v3`)
**Testing**: Manual browser testing (per constitution: UI-centric features)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page web application
**Performance Goals**: <100ms UI response, 60fps interactions, <3s song addition, <1s song removal
**Constraints**: localStorage quota (~5-10MB depending on browser), 99-song hard limit, no backend dependencies
**Scale/Scope**: Single user, up to 99 songs with ~8 stages each, client-side only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity First ✅

- **Maintains simplicity**: Feature uses existing React state management (useState, useEffect) with no new abstraction layers
- **YAGNI compliance**: No premature optimization; direct state manipulation with localStorage persistence
- **No external libraries**: Uses only existing dependencies (React hooks, localStorage API)
- **Self-documenting code**: Song addition/removal are straightforward array operations

**Status**: PASS - Feature aligns with simplicity principle

### II. User Experience is Non-Negotiable ✅

- **Immediate UI feedback**: Button disables proactively (no error dialogs after failed attempts)
- **Clear visual feedback**: Disabled button states when limits reached (99 songs, storage quota)
- **Data persistence**: All song additions/removals persist via existing localStorage pattern
- **Recoverable actions**: Confirmation dialog before deleting songs with progress; export/import preserves all songs
- **Performance targets**: <3s addition, <1s removal (well within <100ms input response goal)

**Status**: PASS - Feature preserves smooth, responsive UX

### III. Data Integrity and Ownership ✅

- **Exportable data**: New/removed songs included in existing JSON export/import
- **Complete state preservation**: Song ID, title, stages, progress all persisted
- **localStorage after state change**: Follows existing pattern (useEffect triggers on songs array change)
- **No server dependencies**: Pure client-side operation
- **Backward compatibility**: New songs use existing data schema (no migration needed)

**Status**: PASS - Feature maintains data integrity guarantees

### Pre-Implementation Gates

- [x] Does it maintain or improve simplicity? YES - No new patterns, uses existing state management
- [x] Does it preserve all existing user data? YES - Only adds/removes songs, never modifies existing data unexpectedly
- [x] Does it perform smoothly (no janky UI)? YES - Simple array operations, <100ms response time
- [x] Can a user accomplish their goal without friction? YES - Single button click for add, zoom view access for remove

**Overall Status**: ✅ PASS - Ready for Phase 0 research

---

### Post-Phase 1 Re-Check

*Performed after completing research.md, data-model.md, contracts/, and quickstart.md*

#### I. Simplicity First ✅

**Design Review**:
- ✅ No new state variables introduced (reuses songs, songCount, currentSong)
- ✅ No new dependencies or libraries
- ✅ Two straightforward functions (addSong, removeSong) using array spread/filter
- ✅ Storage quota check is simple memoized calculation
- ✅ All logic fits in existing App.jsx structure (no new files)

**Complexity Score**: 0 - Feature adds minimal code with zero architectural overhead

#### II. User Experience is Non-Negotiable ✅

**Design Review**:
- ✅ Proactive button disabling (99-song limit, storage quota) prevents error states
- ✅ Visual feedback via disabled states with tooltips
- ✅ Confirmation dialog for destructive actions (songs with progress)
- ✅ <1ms operations (array manipulation on ≤99 items)
- ✅ localStorage write triggered by existing useEffect pattern

**UX Score**: Excellent - No user friction points, all actions recoverable

#### III. Data Integrity and Ownership ✅

**Design Review**:
- ✅ No schema changes (uses existing Song structure)
- ✅ ID generation prevents conflicts (Math.max + 1, no gap reuse)
- ✅ Export/import automatically includes added/removed songs (existing implementation)
- ✅ localStorage persistence follows existing pattern (useEffect on songs change)
- ✅ Confirmation prevents accidental data loss

**Data Safety Score**: Excellent - Zero risk of data corruption or loss

**Final Status**: ✅ PASS - Design maintains all constitutional principles

## Project Structure

### Documentation (this feature)

```text
specs/012-add-song/
├── plan.md              # This file
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for client-only)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── App.jsx              # Main component - contains song state management
├── main.jsx             # Application entry point
├── App.css              # Global styles
└── index.css            # Tailwind CSS imports

public/                  # Static assets

specs/                   # Feature specifications
└── 012-add-song/        # This feature
```

**Structure Decision**: Single-page React application. All logic resides in `App.jsx` with inline component definitions (Header, SongCard, SongDetail, etc.). No separate component files needed per constitution's simplicity principle - current structure is already flat and maintainable.

## Complexity Tracking

**No violations to justify** - Feature requires zero new complexity:

- No new dependencies
- No new abstraction layers
- No new storage mechanisms
- No new architectural patterns
- No performance optimizations beyond standard React

All implementation fits within existing patterns established in `App.jsx`.
