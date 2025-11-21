# Implementation Plan: Draft Song Status

**Branch**: `008-draft-song-status` | **Date**: 2025-11-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-draft-song-status/spec.md`

## Summary

This feature adds a draft status flag to songs, allowing users to mark work-in-progress tracks with a simple checkbox. Draft songs are visually distinguished with greyed-out styling (reduced opacity) and are automatically excluded from the total album duration calculation. Draft status persists to localStorage and is included in export/import operations.

**Technical Approach**: Extend Song entity with boolean `isDraft` field (default: false). Add checkbox UI to SongCard component. Apply conditional CSS opacity styling to draft cards. Modify total duration calculation (useMemo) to filter out draft songs. Persist isDraft in existing localStorage pattern.

## Technical Context

**Language/Version**: JavaScript (ES6+) with React 19.1.1
**Primary Dependencies**: React 19.1.1, React-DOM 19.1.1, Tailwind CSS 4.1.11
**Storage**: localStorage (existing pattern in App.jsx)
**Testing**: Manual testing (per constitution - UI-centric feature)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-file SPA (src/App.jsx contains all components)
**Performance Goals**: <100ms checkbox response, 60fps during visual state transitions
**Constraints**: Must not break existing features (inline editing, drag-and-drop, zoom view)
**Scale/Scope**: 12 song cards (fixed album size), single boolean field per song

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity First

- ✅ **PASS**: Simple boolean flag (isDraft: true/false), no complex state machine
- ✅ **PASS**: CSS opacity for visual styling (no additional UI library)
- ✅ **PASS**: Checkbox uses standard React onChange handler (no form library)
- ✅ **PASS**: Extends existing Song schema minimally (one field addition)
- ✅ **PASS**: Leverages existing localStorage persistence mechanism (no new storage layer)

**Justification**: Draft status is a simple toggle with clear on/off states. Opacity-based greyed-out effect requires only CSS. Feature follows existing patterns from tempo, key, duration fields.

### II. User Experience is Non-Negotiable

- ✅ **PASS**: Single-click checkbox toggle (immediate feedback)
- ✅ **PASS**: Visual distinction is obvious (50-70% opacity greyed-out)
- ✅ **PASS**: Total duration updates immediately when draft status changes (useMemo dependency)
- ✅ **PASS**: Draft status persists across page refresh (localStorage write on toggle)
- ✅ **PASS**: Export/import preserves draft status (included in JSON schema)

**Justification**: Checkbox provides instant visual and functional feedback. Draft songs are immediately excluded from duration calculation, providing clear workflow separation between in-progress and finalized tracks.

### III. Data Integrity and Ownership

- ✅ **PASS**: Draft status persists to localStorage on every toggle
- ✅ **PASS**: Export includes isDraft field (preserves complete user data)
- ✅ **PASS**: Import restores draft status (backward compatible with existing data - defaults to false)
- ✅ **PASS**: Draft toggle is reversible (checkbox can be unchecked)
- ✅ **PASS**: Draft status does not delete or modify other song properties

**Justification**: Draft flag is stored alongside existing song data with no risk of data loss. Backward compatibility maintained by defaulting to false for existing songs without isDraft field.

### Re-check After Phase 1 Design

**Status**: ✅ ALL GATES PASS - Design maintains constitutional compliance

#### I. Simplicity First (Re-validated)

- ✅ **PASS**: Checkbox implementation confirmed simple (standard <input type="checkbox">)
- ✅ **PASS**: Opacity styling uses Tailwind utility classes (opacity-50 or opacity-60)
- ✅ **PASS**: Duration calculation filter uses Array.filter() (no external library)
- ✅ **PASS**: No new state management patterns (existing useState for songs array)

**Post-Design Validation**: Implementation adds one boolean field, one checkbox UI element, one CSS class conditional, and one filter in total duration calculation. Zero new abstractions.

#### II. User Experience (Re-validated)

- ✅ **PASS**: Checkbox onChange triggers immediate song update (existing onUpdate pattern)
- ✅ **PASS**: Visual feedback applies to entire card (wrapper div opacity)
- ✅ **PASS**: Duration recalculation is automatic (useMemo dependency on songs array)
- ✅ **PASS**: Manual test scenarios cover all user flows (quickstart.md - 10 test cases)

**Post-Design Validation**: Design ensures checkbox toggle → state update → visual feedback → duration recalculation happens synchronously in single React render cycle.

#### III. Data Integrity (Re-validated)

- ✅ **PASS**: Existing useEffect persistence triggers on songs change (automatic localStorage save)
- ✅ **PASS**: Export/import schema extended with isDraft field (data-model.md)
- ✅ **PASS**: Backward compatibility maintained (songs without isDraft default to false)
- ✅ **PASS**: Draft status does not affect other features (edit, drag, zoom remain functional)

**Post-Design Validation**: Design preserves all existing song properties during draft toggle. Defensive checks ensure missing isDraft fields default to false. No breaking changes to export format.

**Final Verdict**: Design phase complete, all constitutional principles satisfied. Ready for implementation via `/speckit.tasks`.

## Project Structure

### Documentation (this feature)

```text
specs/008-draft-song-status/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── component-api.md # Checkbox handler contracts and state flow
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
└── App.jsx              # All components including SongCard with draft checkbox

index.html
package.json
vite.config.js
tailwind.config.js
```

**Structure Decision**: Single-file SPA architecture. All components (App, Header, SongCard, SongDetail, StageRow, ExportImport, EditableText) exist in App.jsx. This matches the existing codebase pattern and satisfies Simplicity First principle. No new files or directories required for this feature.

## Complexity Tracking

**No violations** - All constitution gates passed. Implementation uses React built-in features and follows existing codebase patterns.
