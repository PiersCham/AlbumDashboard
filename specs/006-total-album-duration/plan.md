# Implementation Plan: Total Album Duration Display

**Branch**: `006-total-album-duration` | **Date**: 2025-11-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-total-album-duration/spec.md`

## Summary

Calculate and display the total running time of all songs by summing individual song durations, and present this value in the summary banner (Header component) alongside the countdown timer. Users will see the total album length formatted as "Xh Ym" or "Xm" depending on duration.

**Technical Approach**: Add a derived/calculated value based on existing song duration data (from feature 005). Use React's useMemo to efficiently calculate total duration from songs array. Format and display in Header component alongside existing countdown timer using consistent styling.

## Technical Context

**Language/Version**: JavaScript (ES2022) with React 19.1.1
**Primary Dependencies**: React 19.1.1, Vite 7.1.1 (no additional libraries needed)
**Storage**: localStorage (existing pattern in App.jsx - total is derived, not stored separately)
**Testing**: Manual testing (per constitution - UI-centric feature)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page application (SPA) - all code in src/App.jsx
**Performance Goals**: Immediate calculation (<1ms for 12 songs), 60fps UI updates
**Constraints**: Must not impact existing song duration editing performance
**Scale/Scope**: 12 songs total, derived calculation runs on every songs array change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity First

- [x] **No external libraries**: Total duration uses built-in JavaScript reduce/map, React useMemo
- [x] **Self-documenting code**: Calculation logic is straightforward sum with formatting
- [x] **No abstraction layers**: Direct calculation in Header component using useMemo
- [x] **React built-in features**: useMemo for derived state, no state management library needed

**Assessment**: ✅ PASS - Feature uses only built-in JavaScript and React features for calculation.

### Principle II: User Experience is Non-Negotiable

- [x] **Immediate feedback**: Total updates instantly when song durations change (useMemo dependency)
- [x] **Intuitive**: Display format matches music industry standards (hours/minutes)
- [x] **Data persistence**: Total is derived from saved song data, no separate persistence needed
- [x] **Recoverable**: Read-only display, no user input to validate or recover from
- [x] **Performance**: Simple sum operation <1ms for 12 songs, maintains 60fps

**Assessment**: ✅ PASS - Feature provides immediate, intuitive feedback with zero performance impact.

### Principle III: Data Integrity and Ownership

- [x] **No data loss**: Total is calculated value, doesn't modify existing song data
- [x] **localStorage persistence**: Derived from existing song data (already persisted)
- [x] **Exportable**: Total can be recalculated from exported song data
- [x] **Backward compatible**: Works with existing song data model (feature 005)
- [x] **No server dependencies**: Purely client-side calculation

**Assessment**: ✅ PASS - Feature is purely derived, preserves all existing data integrity guarantees.

**Overall Constitution Grade**: ✅ PASS - No violations. Feature aligns with all three core principles.

**Post-Design Re-evaluation**: ✅ PASS - After completing research and design documents, all constitutional principles remain satisfied:
- Simplicity: No new dependencies, simple sum calculation with useMemo optimization
- User Experience: Immediate feedback, clear formatting, zero user interaction friction
- Data Integrity: Purely derived value, zero risk of data corruption or loss

## Project Structure

### Documentation (this feature)

```text
specs/006-total-album-duration/
├── plan.md              # This file
├── research.md          # Phase 0: Duration formatting, calculation patterns
├── data-model.md        # Phase 1: Derived value structure
├── quickstart.md        # Phase 1: Manual testing guide
├── contracts/
│   └── component-api.md # Phase 1: Header component API contract
└── tasks.md             # (Generated later by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
└── App.jsx              # All changes in single file (existing pattern)
    ├── Header component (~line 327)
    │   ├── Add useMemo for total duration calculation
    │   ├── Add formatTotalDuration() helper function
    │   └── Add total duration display in JSX (~line 342-344)
    └── No new files needed (follows 005-song-duration pattern)

(No new files or directories needed)
```

**Structure Decision**: Single-file implementation in src/App.jsx following existing project pattern. Total duration is a derived value calculated in the Header component using useMemo. Formatting follows the adaptive pattern: "Xh Ym" for ≥60 minutes, "Xm" for <60 minutes. Display location is in the Header component between album title and countdown timer (around line 342-344 where current song count "X/13" is shown).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**N/A** - No constitution violations. All gates passed.
