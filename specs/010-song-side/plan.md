# Implementation Plan: Song Side Assignment

**Branch**: `010-song-side` | **Date**: 2025-11-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-song-side/spec.md`

## Summary

Add a "Side" attribute to songs allowing users to organize tracks into Side 1, Side 2, or no side (vinyl/cassette format). Implementation uses inline text input validation in the detail view, persists to localStorage, and displays via colored borders in the grid view.

**Technical Approach**: Extend existing Song data model with string field, add validation logic similar to Tempo input, integrate into migration path, and apply conditional Tailwind classes for border styling.

## Technical Context

**Language/Version**: JavaScript ES2022 with React 19.1.1
**Primary Dependencies**: React 19.1.1, React-DOM 19.1.1, Vite 7.1.0, Tailwind CSS 4.1.11
**Storage**: Browser localStorage (key: `albumProgress_v3`) with JSON export/import
**Testing**: Manual UI testing (visual validation), npm test for linting
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - ES2022 support)
**Project Type**: Single-page web application (SPA)
**Performance Goals**: <100ms input response, 60fps UI interactions, <2s grid load
**Constraints**: Client-side only (no backend), localStorage size limits (~5-10MB), backward compatibility with existing JSON exports
**Scale/Scope**: Single monolithic App.jsx (~1600 LOC), 12-song default album, 3 side values ("", "1", "2")

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Review

- [x] **Simplicity First**: Adding single string field to existing Song entity; no new abstractions or external libraries
- [x] **User Experience**: Text input follows existing Tempo pattern; colored borders provide immediate visual feedback; validation prevents data corruption
- [x] **Data Integrity**: Migration adds default value (""); export/import preserves side field; invalid values default to "" without data loss

**Status**: ✅ PASS - Feature aligns with all three constitutional principles.

### Justifications (if any violations)

N/A - No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/010-song-side/
├── plan.md              # This file
├── research.md          # Phase 0 output (design decisions)
├── data-model.md        # Phase 1 output (Song entity extension)
├── quickstart.md        # Phase 1 output (implementation guide)
├── contracts/           # Phase 1 output (validation rules)
│   └── side-validation.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── App.jsx              # Main application file (extend Song schema, add UI controls)
├── App.css              # Root styles (already uses full viewport)
└── index.css            # Global styles (Tailwind, dark theme)

# NO new files needed - feature extends existing App.jsx only
```

**Structure Decision**: Single-file architecture maintained per constitution Principle I (Simplicity First). All changes contained within existing `App.jsx` component following established patterns (Tempo input, Draft checkbox, Key/Duration fields).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitutional violations requiring justification.

---

## Phase 0: Research & Decisions

See [research.md](./research.md) for detailed analysis.

**Key Decisions**:
1. Use string type ("", "1", "2") for side values to match user input and simplify validation
2. Apply validation pattern from existing Tempo field (onBlur save, red border on invalid)
3. Use Tailwind conditional classes for border colors (e.g., `border-blue-500` for Side 1, `border-green-500` for Side 2)
4. Extend `migrateSongs` function to handle missing `side` field

---

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md)

**Summary**: Song entity extends with single string field `side`. Default value `""`. Validation rules in [contracts/side-validation.md](./contracts/side-validation.md).

### Implementation Quickstart

See [quickstart.md](./quickstart.md)

**Summary**: 5-step implementation covering migration, detail view input, grid view styling, validation logic, and export/import compatibility.

---

## Post-Design Constitution Re-Check

- [x] **Simplicity First**: Implementation requires ~50-80 LOC changes distributed across 4 existing functions. No new components.
- [x] **User Experience**: Input validation provides immediate feedback. Border colors distinguish sides at a glance. Migration transparent to user.
- [x] **Data Integrity**: Migration adds field safely. Export/import tested with edge cases (missing field, invalid values). localStorage writes atomic per existing pattern.

**Status**: ✅ PASS - Design maintains constitutional compliance.

---

## Next Steps

Run `/speckit.tasks` to generate actionable task breakdown from this plan and data model.
