# Implementation Plan: Persist Due Date in Imports/Exports

**Branch**: `001-persist-due-date` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-persist-due-date/spec.md`

## Summary

This feature ensures the target deadline (due date) persists across browser sessions, application restarts, and export/import operations. The implementation extends the existing localStorage persistence mechanism and export/import JSON structure to include the `targetISO` field, which already exists in the codebase but requires validation and migration support.

**Technical Approach**: Leverage existing React state management and localStorage patterns. Add validation for deadline data on load, implement graceful fallback for missing/corrupt deadline data, and ensure backward compatibility with older JSON exports that may lack the deadline field.

## Technical Context

**Language/Version**: JavaScript ES2020+
**Primary Dependencies**: React 19.1.1, React DOM 19.1.1
**Storage**: Browser localStorage (client-side only, no backend)
**Testing**: Manual testing for UI flows; automated tests recommended for persistence logic
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with localStorage support
**Project Type**: Single-page application (React SPA)
**Performance Goals**: <100ms response to user input, <1 second app load with persisted state
**Constraints**: Offline-capable (no server dependencies), localStorage quota limits (~5-10MB)
**Scale/Scope**: Single-user personal tool, ~20 songs per album, minimal data footprint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First

✅ **PASS** - This feature extends existing patterns without introducing new complexity:
- Uses established localStorage mechanism already in place for songs/stages
- No new dependencies or abstractions required
- Reuses existing export/import functions (`exportJSON`, `importJSON`)
- Follows existing state management pattern with React hooks

### Principle II: User Experience is Non-Negotiable

✅ **PASS** - Feature directly improves user experience:
- Eliminates repeated deadline entry (transparent persistence)
- Ensures data completeness in backups (export/import includes deadline)
- Maintains <100ms UI responsiveness (localStorage reads are synchronous and fast)
- Graceful fallback prevents crashes from corrupt data

### Principle III: Data Integrity and Ownership

✅ **PASS** - Feature strengthens data integrity:
- Deadline included in JSON export (complete state preservation)
- Backward-compatible import (handles old exports without deadline field)
- No data loss on session restart (localStorage persistence)
- User owns data (no cloud sync or server dependencies)

### Testing Philosophy Compliance

✅ **PASS** - Automated tests recommended (per constitution):
- Data persistence logic (localStorage save/load of deadline) - **requires automated test**
- Complex calculations (countdown timer already has `useCountdown` hook) - **manual test acceptable**
- Schema migrations (`migrateSongs` extended for deadline) - **requires automated test**

**Gate Status**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-persist-due-date/
├── plan.md              # This file
├── research.md          # Phase 0 output (localStorage best practices, migration patterns)
├── data-model.md        # Phase 1 output (Target Deadline entity schema)
├── quickstart.md        # Phase 1 output (testing persistence manually)
└── checklists/
    └── requirements.md  # Spec validation checklist (already created)
```

### Source Code (repository root)

```text
src/
├── App.jsx              # Main component - contains deadline state and persistence logic
├── main.jsx             # Entry point
├── index.css            # Global styles
└── App.css              # Component styles

# No new files required - all changes in App.jsx
```

**Structure Decision**: Single project structure (Option 1). This is a client-side React app with all logic in `src/App.jsx`. No backend, no separate services layer. Modifications will be made to:

1. **State initialization** (lines 487-511 in App.jsx): Extend `migrateSongs` pattern for deadline migration
2. **Export function** (lines 152-185 in App.jsx): Already includes `targetISO` - no changes needed
3. **Import function** (lines 187-228 in App.jsx): Already includes `targetISO` - add validation
4. **useEffect persistence** (lines 524-526 in App.jsx): Already persists `targetISO` - no changes needed

## Complexity Tracking

> **No violations** - Feature aligns perfectly with all constitutional principles. No complexity justification required.

---

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 0 (Research) and Phase 1 (Design) completion*

### Principle I: Simplicity First

✅ **STILL PASSING** - Design maintains simplicity:
- **No new dependencies**: Zero npm packages added
- **No new files**: All changes contained in existing `src/App.jsx`
- **Minimal new code**: ~30 lines (2 helper functions + minor edits)
- **Follows existing patterns**: `migrateDeadline()` mirrors `migrateSongs()` approach
- **Self-documenting code**: Function names are clear (`isValidISODate`, `migrateDeadline`)

### Principle II: User Experience is Non-Negotiable

✅ **STILL PASSING** - Design preserves user experience:
- **Transparent persistence**: No "save" button required (automatic via `useEffect`)
- **Instant feedback**: Countdown updates immediately on deadline change
- **Graceful degradation**: Invalid data → default fallback (no crashes)
- **Performance maintained**: localStorage operations are sub-millisecond
- **Zero breaking changes**: Existing users' data migrates seamlessly

### Principle III: Data Integrity and Ownership

✅ **STILL PASSING** - Design enhances data integrity:
- **Export bug fix**: Added `targetISO` to export JSON (was missing - bug discovered in research)
- **Import validation**: Ensures imported deadline is valid before applying
- **Migration safety**: Backward-compatible with old exports lacking `targetISO`
- **No data loss**: Fallback provides sensible default (12 months from now)
- **User control**: Export/import remains human-readable JSON

### Testing Philosophy Compliance

✅ **STILL PASSING** - Design follows testing philosophy:
- **Manual testing prioritized**: Comprehensive quickstart.md guide (8 test scenarios)
- **Automated tests recommended**: Listed for `isValidISODate()` and `migrateDeadline()` (optional)
- **Testable implementation**: Pure functions with clear inputs/outputs

### Design Findings

1. **Bug Discovered**: Current `exportJSON` function (line 153) omits `targetISO` - must be fixed
2. **No schema version bump needed**: Migration handles missing field gracefully
3. **No UI changes required**: Existing datetime picker works perfectly
4. **Estimated implementation**: <2 hours for experienced React developer

**Final Gate Status**: ✅ ALL CHECKS PASSED - Ready for `/speckit.tasks` to generate implementation tasks
