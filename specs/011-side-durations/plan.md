# Implementation Plan: Per-Side Running Times

**Branch**: `011-side-durations` | **Date**: 2025-11-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/011-side-durations/spec.md`

## Summary

This feature calculates and displays the total running time for songs assigned to Side 1 and Side 2. Duration totals are computed on-demand from song data (not persisted), displayed in MM:SS format, and update automatically when song durations or side assignments change. Draft songs are excluded from all calculations.

**Technical Approach**: Use React `useMemo` to derive side duration totals from the songs array, filtering by side assignment and draft status. Display totals prominently on the dashboard using the existing `formatDuration` helper.

## Technical Context

**Language/Version**: JavaScript (ES6+) with React 19.1.1
**Primary Dependencies**: React 19.1.1, React-DOM 19.1.1, Tailwind CSS 4.1.11
**Storage**: Browser localStorage (key: `albumProgress_v3`) — durations are derived, not stored
**Testing**: Manual testing via browser console + npm test (if applicable)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single-page React application
**Performance Goals**: <500ms recalculation on data changes, <1s initial render
**Constraints**: Client-side only (no backend), 60fps UI interactions
**Scale/Scope**: 12 songs (configurable up to 999), 2 side totals (Side 1, Side 2)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Simplicity First

- **No new abstractions**: Uses existing React patterns (`useMemo`, `filter`, `reduce`)
- **No external libraries**: Relies only on React built-ins
- **Derived data**: Totals computed from existing song data, not stored separately
- **Self-documenting code**: Variable names like `nonDraftSide1Songs` clarify intent

**Status**: ✅ PASS — Minimal complexity, leverages existing patterns

### ✅ II. User Experience is Non-Negotiable

- **Immediate feedback**: `useMemo` ensures totals recalculate within 500ms of changes
- **Clear visual display**: MM:SS format consistent with existing duration display
- **Zero data loss**: No new persisted data, no migration risk
- **Performance**: Calculation complexity O(n) where n = song count (~12 songs)

**Status**: ✅ PASS — Meets <500ms update target, clear visual feedback

### ✅ III. Data Integrity and Ownership

- **No schema changes**: No new fields added to song objects
- **No migration needed**: Computation only, no stored state
- **Export/import unchanged**: No impact on existing JSON format
- **Backward compatible**: Feature works with existing song data

**Status**: ✅ PASS — Zero risk to data integrity

## Project Structure

### Documentation (this feature)

```text
specs/011-side-durations/
├── plan.md              # This file
├── research.md          # Phase 0: Technical decisions
├── data-model.md        # Phase 1: Computed values structure
├── quickstart.md        # Phase 1: Implementation steps
└── contracts/           # Phase 1: (N/A - no API contracts for client-side feature)
```

### Source Code (repository root)

```text
src/
└── App.jsx              # Single-file React app with all components

tests/                   # (N/A - manual testing via browser)
```

**Structure Decision**: Single-file architecture maintained. All logic resides in `App.jsx` following existing codebase pattern (Features 001-010). No new files or components needed.

## Complexity Tracking

> **No violations to justify** — Feature aligns with all constitutional principles

## Phase 0: Research & Technical Decisions

### Research Questions

1. **Where should side duration totals be displayed?**
   - Decision: Next to the total duration in the dashboard header
   - Rationale: Prominent location, visible without scrolling
   - Alternatives: Above song grid, in footer (rejected: less visible)

2. **How to calculate total duration from `{minutes, seconds}` format?**
   - Decision: Convert to total seconds, sum, convert back to MM:SS
   - Rationale: Avoids edge cases with seconds overflow (e.g., 45s + 30s = 1:15)
   - Alternatives: Direct minute/second addition with carry logic (rejected: more error-prone)

3. **Should totals exceeding 60 minutes display as hours?**
   - Decision: No, display as MM:SS (e.g., "75:30" for 75 minutes 30 seconds)
   - Rationale: Consistent with FR-011 spec requirement
   - Alternatives: Use formatTotalDuration (Xh Ym format) — rejected per spec

4. **How to handle draft song filtering?**
   - Decision: Reuse existing pattern: `songs.filter(song => !song.isDraft)`
   - Rationale: Proven pattern from Feature 009 (draft song count)
   - Alternatives: New filter function (rejected: unnecessary abstraction)

5. **Performance optimization: when to recalculate?**
   - Decision: Use `useMemo` with dependencies `[songs]`
   - Rationale: Recalculates only when songs array changes
   - Alternatives: `useState` with manual updates (rejected: error-prone)

6. **What display aspects should we consider?**
   - Decision: Re-Use the same Side 1 and Side 2 colour choices. Use non-bolded font as it's less important than the Total Duration
   - Rationale: Consistency and Relative importance


### Best Practices Applied

- **React hooks**: `useMemo` for derived state (standard React pattern)
- **Pure functions**: Duration calculation has no side effects
- **DRY principle**: Reuse existing `formatDuration` helper
- **Performance**: O(n) complexity acceptable for ~12 songs

**Output**: [research.md](./research.md) — See Phase 0 section below

## Phase 1: Design Artifacts

### 1.1 Data Model

**Computed Values** (not stored in localStorage):

```javascript
// Derived from songs array via useMemo
const sideDurationTotals = {
  side1: { minutes: number, seconds: number },  // Total for side === "1", isDraft === false
  side2: { minutes: number, seconds: number }   // Total for side === "2", isDraft === false
};
```

**Calculation Logic**:

```javascript
const calculateSideDuration = (songs, sideValue) => {
  const filtered = songs.filter(song =>
    song.side === sideValue && !song.isDraft
  );

  const totalSeconds = filtered.reduce((sum, song) =>
    sum + (song.duration.minutes * 60) + song.duration.seconds,
    0
  );

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60
  };
};
```

**Output**: [data-model.md](./data-model.md)

### 1.2 API Contracts

**N/A** — Client-side feature, no backend APIs

### 1.3 Quickstart Implementation

**Step 1**: Add `useMemo` hook in `App` component to calculate side totals
**Step 2**: Display totals in dashboard header using existing Tailwind styles
**Step 3**: Test with various song configurations (draft/non-draft, different sides)

**Output**: [quickstart.md](./quickstart.md)

### 1.4 Constitution Re-Check (Post-Design)

- ✅ **Simplicity**: Single `useMemo` hook, reuses existing helpers
- ✅ **User Experience**: Real-time updates, clear visual display
- ✅ **Data Integrity**: No schema changes, zero migration risk

**Status**: All gates pass — Ready for `/speckit.tasks`

## Implementation Phases

### Phase 0: Research ✅

**Status**: Complete (see Research Questions above)

### Phase 1: Design ✅

**Status**: Complete (see artifacts below)

### Phase 2: Task Breakdown

**Status**: Not started — Run `/speckit.tasks` to generate `tasks.md`

## Artifacts Generated

1. ✅ `plan.md` — This file
2. ⏳ `research.md` — Technical decisions documentation
3. ⏳ `data-model.md` — Computed values structure
4. ⏳ `quickstart.md` — Step-by-step implementation guide
5. ⏳ `CLAUDE.md` — Updated with Feature 011 tech stack

## Next Steps

1. Review this plan for accuracy and completeness
2. Run `/speckit.tasks` to generate actionable task list
3. Implement feature following quickstart guide
4. Manual testing checklist:
   - Assign songs to different sides, verify totals update
   - Mark songs as draft, verify exclusion from totals
   - Test edge cases: zero duration, >60 minute totals
   - Export/import to verify no data corruption

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Incorrect duration math (seconds overflow) | Medium | Unit tests for calculation logic, manual verification |
| Performance degradation with many songs | Low | useMemo optimization, O(n) complexity acceptable |
| Draft filter inconsistency | Low | Reuse proven pattern from Feature 009 |
| UI layout disruption | Low | Add totals to existing header, minimal DOM changes |

## Dependencies on Prior Features

- **Feature 002** (Song Tempo & Key): Duration field structure `{minutes, seconds}`
- **Feature 008** (Draft Song Status): `isDraft` boolean field
- **Feature 010** (Song Side Assignment): `side` field ("", "1", "2")

All dependencies are stable and implemented.

---

**Plan Status**: ✅ Complete — Ready for artifact generation (Phase 1)
**Next Command**: Continue with research.md, data-model.md, quickstart.md generation
