# Implementation Plan: Song Tempo and Key Attributes

**Branch**: `002-song-tempo-key` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-song-tempo-key/spec.md`

## Summary

This feature adds optional tempo (30-300 BPM, default 120) and key (24 major/minor options, default blank) attributes to each song in the album dashboard. The implementation extends the existing song data model, adds UI controls for setting these values (text input for tempo with validation/clamping, two-step dropdown for key selection), and ensures persistence via localStorage and export/import JSON structure.

**Technical Approach**: Leverage existing React state management and localStorage patterns from feature 001. Add validation for tempo input (clamp to 30-300 BPM with visual feedback), implement two-step key selection UI (note selection then mode selection), and ensure backward compatibility with songs created before this feature.

## Technical Context

**Language/Version**: JavaScript ES2020+
**Primary Dependencies**: React 19.1.1, React DOM 19.1.1
**Storage**: Browser localStorage (client-side only, no backend)
**Testing**: Manual testing for UI flows; automated tests recommended for validation logic
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with localStorage support
**Project Type**: Single-page application (React SPA)
**Performance Goals**: <100ms response to user input, 60fps UI interactions
**Constraints**: Offline-capable (no server dependencies), localStorage quota limits (~5-10MB)
**Scale/Scope**: Single-user personal tool, ~20 songs per album, minimal data footprint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First

✅ **PASS** - This feature extends existing patterns without introducing new complexity:
- Uses established localStorage mechanism already in place for songs/stages
- No new dependencies or abstractions required
- Reuses existing state management pattern with React hooks
- Follows existing `migrateSongs` pattern for data migration
- Two new fields in song schema (tempo: integer, key: string)
- No external libraries needed for tempo validation or key selection

### Principle II: User Experience is Non-Negotiable

✅ **PASS** - Feature directly improves user experience:
- Musicians gain quick reference for tempo and key (common workflow need)
- Text input for tempo is familiar and fast (<2 seconds to set)
- Two-step key selection reduces cognitive load (12 notes vs 24 combined options)
- Visual feedback on tempo clamping prevents confusion
- Defaults are sensible (120 BPM industry standard, blank key for unspecified)
- Maintains <100ms UI responsiveness (localStorage reads are synchronous and fast)
- No breaking changes to existing workflows

### Principle III: Data Integrity and Ownership

✅ **PASS** - Feature strengthens data integrity:
- Tempo and key included in JSON export (complete state preservation)
- Backward-compatible import (handles old exports without tempo/key fields)
- No data loss on session restart (localStorage persistence)
- User owns data (no cloud sync or server dependencies)
- Validation prevents invalid states (clamping ensures 30-300 BPM range)
- Migration handles legacy songs gracefully (default 120 BPM, blank key)

### Testing Philosophy Compliance

✅ **PASS** - Automated tests recommended (per constitution):
- Tempo validation logic (clamping, rounding decimals) - **requires automated test**
- Key selection UI - **manual test acceptable**
- Schema migrations (`migrateSongs` extended for tempo/key) - **requires automated test**
- Export/import including new fields - **requires automated test**

**Gate Status**: ✅ ALL CHECKS PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-song-tempo-key/
├── plan.md              # This file
├── research.md          # Phase 0 output (validation patterns, UI design decisions)
├── data-model.md        # Phase 1 output (Song entity with tempo/key fields)
├── quickstart.md        # Phase 1 output (testing tempo/key manually)
├── contracts/           # Phase 1 output (browser API contracts)
└── checklists/
    └── requirements.md  # Spec validation checklist (already created)
```

### Source Code (repository root)

```text
src/
├── App.jsx              # Main component - contains song state and persistence logic
├── main.jsx             # Entry point
├── index.css            # Global styles
└── App.css              # Component styles

# No new files required - all changes in App.jsx
```

**Structure Decision**: Single project structure (Option 1). This is a client-side React app with all logic in `src/App.jsx`. No backend, no separate services layer. Modifications will be made to:

1. **State initialization** (App.jsx): Extend `migrateSongs` pattern for tempo/key migration
2. **SongCard component** (App.jsx): Add UI controls for tempo input and key selection
3. **Export function** (App.jsx): Include tempo and key in JSON export
4. **Import function** (App.jsx): Validate and migrate imported tempo/key data
5. **useEffect persistence** (App.jsx): Persist tempo and key to localStorage (automatic)

## Complexity Tracking

> **No violations** - Feature aligns perfectly with all constitutional principles. No complexity justification required.

---

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 0 (Research) and Phase 1 (Design) completion*

### Principle I: Simplicity First

✅ **STILL PASSING** - Design maintains simplicity:
- **No new dependencies**: Zero npm packages added
- **No new files**: All changes contained in existing `src/App.jsx`
- **Minimal new code**: ~100-150 lines estimated (validation helpers + UI controls + migration)
- **Follows existing patterns**: `validateTempo()` mirrors `migrateDeadline()` approach, extends `migrateSongs()`
- **Self-documenting code**: Function names are clear (`validateTempo`, `normalizeNote`, `parseKey`)
- **Simple data types**: Integer for tempo, string/null for key (no complex objects)

### Principle II: User Experience is Non-Negotiable

✅ **STILL PASSING** - Design preserves user experience:
- **Transparent persistence**: No "save" button required (automatic via `useEffect`)
- **Instant feedback**: Tempo validation on blur, key updates immediately on selection
- **Graceful degradation**: Invalid data → defaults (120 BPM, null key) with visual feedback
- **Performance maintained**: localStorage operations are sub-millisecond
- **Zero breaking changes**: Existing users' data migrates seamlessly with defaults
- **Familiar UI patterns**: Text input for tempo (musicians type BPM values), dropdown for key (familiar selection)
- **Visual feedback**: Border flash on tempo clamping (500ms animation, non-blocking)

### Principle III: Data Integrity and Ownership

✅ **STILL PASSING** - Design enhances data integrity:
- **Export includes tempo/key**: Automatically included via existing state serialization
- **Import validation**: `migrateSongs()` ensures valid tempo/key before applying
- **Migration safety**: Backward-compatible with old exports lacking tempo/key
- **No data loss**: Fallback provides sensible defaults (120 BPM, null key)
- **User control**: Export/import remains human-readable JSON
- **Type safety**: Validation checks prevent invalid types (string tempo, number key)

### Testing Philosophy Compliance

✅ **STILL PASSING** - Design follows testing philosophy:
- **Manual testing prioritized**: Comprehensive quickstart.md guide (8 test scenarios)
- **Automated tests recommended**: Listed for `validateTempo()`, `migrateSongs()` (optional)
- **Testable implementation**: Pure functions with clear inputs/outputs

### Design Findings

1. **No export bug**: Current `exportJSON` already includes all song fields (tempo/key auto-included)
2. **No schema version bump needed**: Migration handles missing fields gracefully
3. **UI changes**: Two new input controls per song card (tempo text input + key dual-dropdown)
4. **Estimated implementation**: <4 hours for experienced React developer
5. **Constants needed**: `NOTES` array (12 chromatic notes), `MODES` array (Major/Minor)
6. **Helper functions needed**: `validateTempo`, `normalizeNote`, `parseKey` (3 pure functions)

**Final Gate Status**: ✅ ALL CHECKS PASSED - Ready for `/speckit.tasks` to generate implementation tasks
