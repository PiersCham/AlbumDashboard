# Implementation Plan: Draft-Aware Song Count and Progress

**Branch**: `009-draft-song-count` | **Date**: 2025-11-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-draft-song-count/spec.md`

## Summary

Modify the Header component to display only non-draft songs in the total song count (currently showing "X/13") and update the album-wide overall progress calculation (`albumAverage()`) to exclude draft songs. This ensures users see accurate metrics that reflect only their active album tracks, excluding work-in-progress ideas marked as drafts.

**Technical Approach**: Filter songs array by `!isDraft` before counting and before calculating average progress. Leverage existing React memoization patterns (`useMemo`) for performance.

## Technical Context

**Language/Version**: JavaScript (React 19.1.1)
**Primary Dependencies**: React (hooks: useState, useMemo, useEffect, useRef), Tailwind CSS 4.1.11
**Storage**: localStorage (key: `albumProgress_v3`) with JSON export/import
**Testing**: Manual browser testing (per constitution - UI-centric features)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-file SPA (src/App.jsx)
**Performance Goals**: <100ms reactivity for draft toggle, 60fps UI interactions
**Constraints**: <100ms song count and progress updates when draft status changes
**Scale/Scope**: 12 songs, 2 metrics (song count, overall progress), single component modification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Simplicity First ✅ PASS

- **No new dependencies**: Reuses existing filtering patterns (`songs.filter()`)
- **No new abstractions**: Modifies existing `albumAverage()` function and Header display logic
- **Minimal code changes**: ~5 lines modified (filter before count, filter before average)
- **Self-documenting**: `songs.filter(song => !song.isDraft)` is clear intent

**Justification**: Feature builds on existing isDraft field (feature 008) and leverages React's built-in reactivity. No external libraries or new patterns needed.

### II. User Experience is Non-Negotiable ✅ PASS

- **Immediate feedback**: useMemo ensures song count and progress recalculate on draft toggle
- **Visual clarity**: Existing display shows updated counts and percentages
- **Zero data loss**: Only changes derived calculations, not persisted data
- **Performance**: Filter operations on 12 songs < 1ms, well under 100ms budget

**Justification**: Feature directly improves UX by removing confusing metrics that include draft songs. Users get accurate album scope visibility without additional UI complexity.

### III. Data Integrity and Ownership ✅ PASS

- **No schema changes**: isDraft field already exists (feature 008)
- **Export/import preserved**: No changes to persistence logic
- **localStorage unchanged**: Only affects derived display values
- **Backward compatible**: Gracefully handles songs without isDraft (defaults to false)

**Justification**: Feature modifies only derived calculations (song count, overall progress), not stored data. No migration needed.

### Overall Assessment: ✅ ALL GATES PASS

No violations. Feature aligns with all constitutional principles:
- Simple filter operations, no new complexity
- Improves user clarity and accuracy
- Zero risk to data integrity

## Project Structure

### Documentation (this feature)

```text
specs/009-draft-song-count/
├── plan.md              # This file
├── research.md          # Phase 0: Decision rationale
├── data-model.md        # Phase 1: Metric calculations
├── quickstart.md        # Phase 1: Manual test scenarios
├── contracts/
│   └── component-api.md # Phase 1: Component contracts
└── tasks.md             # Phase 2: (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
└── App.jsx              # Single-file SPA (all components inline)
    ├── albumAverage()   # Function to modify: filter draft songs
    ├── eligibleCount()  # Function to modify: filter draft songs
    └── Header           # Component to modify: display non-draft count
```

**Structure Decision**: Single-file SPA architecture maintained (per constitution). All changes occur in `src/App.jsx`. No new files or components needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitutional violations. All gates passed.
