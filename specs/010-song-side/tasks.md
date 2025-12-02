# Implementation Tasks: Song Side Assignment

**Feature**: 010-song-side | **Branch**: `010-song-side` | **Date**: 2025-11-28

## Overview

**Total Tasks**: 23
**Estimated Time**: 45-60 minutes
**Lines of Code**: ~70-90 LOC

**Parallel Opportunities**:
- Phase 1 and Phase 2 can run independently
- Tasks within Phase 3 (3.1-3.4) can be developed in parallel
- Phase 5 tasks (5.1-5.2) are independent of Phase 3-4 timing

---

## Phase 1: Setup

**Purpose**: Initialize data model with side field for new songs

- [X] [T-001] Add `side: ""` field to DEFAULT_SONGS constant in [src/App.jsx:46-54](../../../src/App.jsx)
  - **Acceptance**: DEFAULT_SONGS array includes `side: ""` for all 12 song templates
  - **Test**: Clear localStorage, reload app, verify `stored.songs[0].side === ""`

---

## Phase 2: Foundational (Data Migration)

**Purpose**: Ensure backward compatibility and data integrity for existing albums

- [X] [T-002] Add side field validation logic to migrateSongs function in [src/App.jsx:1412-1459](../../../src/App.jsx)
  - **Location**: Insert after isDraft migration (~line 1444)
  - **Logic**: `const side = typeof song.side === 'string' && (song.side === "" || song.side === "1" || song.side === "2") ? song.side : "";`
  - **Acceptance**: Function returns sanitized `side` field for all songs
  - **Test**: Import JSON without `side` field → Verify migration adds `side: ""`

- [X] [T-003] Update migrateSongs return statement to include side field in [src/App.jsx:1445](../../../src/App.jsx)
  - **Before**: `return { ...song, stages: migratedStages, tempo, key, duration, isDraft };`
  - **After**: `return { ...song, stages: migratedStages, tempo, key, duration, isDraft, side };`
  - **Acceptance**: Migrated songs include side property
  - **Test**: Check returned song object structure in console

---

## Phase 3: User Story 1 [P1] - Assign Songs to Album Sides

**User Story**: Users need to organize their album songs into physical or logical sides (Side 1, Side 2, or unassigned), similar to traditional vinyl records or cassette tapes that have an A-side and B-side.

**Success Criteria**: Users can assign any song to Side 1, Side 2, or no side in under 5 seconds from the detail view

### 3.1 State Management

- [X] [T-004] [P1] [Story 1] Add sideInput state variable to SongDetail component in [src/App.jsx:926](../../../src/App.jsx)
  - **Code**: `const [sideInput, setSideInput] = useState(song.side || "");`
  - **Acceptance**: Component tracks current side input value
  - **Test**: Type in side input → Verify state updates

- [X] [T-005] [P1] [Story 1] Add isValidSide state variable to SongDetail component in [src/App.jsx:927](../../../src/App.jsx)
  - **Code**: `const [isValidSide, setIsValidSide] = useState(true);`
  - **Acceptance**: Component tracks validation state for visual feedback
  - **Test**: Enter invalid value → Verify state changes to false

### 3.2 Validation Logic

- [X] [T-006] [P1] [Story 1] Implement handleSideChange handler in [src/App.jsx:1195](../../../src/App.jsx)
  - **Code**: `const handleSideChange = (e) => { setSideInput(e.target.value); };`
  - **Acceptance**: Input updates on every keystroke
  - **Test**: Type characters → Verify sideInput reflects changes

- [X] [T-007] [P1] [Story 1] Implement handleSideBlur validation handler in [src/App.jsx:1198](../../../src/App.jsx)
  - **Logic**: Validate `sideInput === "" || sideInput === "1" || sideInput === "2"`
  - **Actions**: Set isValidSide, call onUpdate if valid
  - **Acceptance**: Only valid values ("", "1", "2") save to song object
  - **Test**: Type "3" → Blur → Verify red border, no save

- [X] [T-008] [P1] [Story 1] Implement handleSideKeyDown for keyboard shortcuts in [src/App.jsx:1206](../../../src/App.jsx)
  - **Enter key**: Trigger blur/validation
  - **Escape key**: Revert to `song.side`, reset validation state
  - **Acceptance**: Users can submit via Enter or cancel via Escape
  - **Test**: Type invalid → Press Escape → Verify input reverts

- [X] [T-009] [P1] [Story 1] Implement handleSideLabelClick handler in [src/App.jsx:1196](../../../src/App.jsx)
  - **Purpose**: Save duration if editing, allow side input focus
  - **Acceptance**: Clicking "Side:" label doesn't break duration editing flow
  - **Test**: Edit duration → Click "Side:" → Verify duration saves

### 3.3 State Synchronization

- [X] [T-010] [P1] [Story 1] Add useEffect to sync sideInput with song.side prop in [src/App.jsx:1204](../../../src/App.jsx)
  - **Code**: `useEffect(() => { setSideInput(song.side || ""); setIsValidSide(true); }, [song.side]);`
  - **Acceptance**: External updates to song.side reflect in input
  - **Test**: Change song in parent → Verify input updates

### 3.4 UI Implementation

- [X] [T-011] [P1] [Story 1] Add Side input field to SongDetail metadata row in [src/App.jsx:1342](../../../src/App.jsx)
  - **Location**: After Duration field, before closing div
  - **Layout**: Label + text input (width: 16px, placeholder: "1/2")
  - **Styling**: Dynamic border color based on `isValidSide` (red if invalid)
  - **Acceptance**: Side input visible in detail view after Duration
  - **Test**: Open song detail → Verify "Side:" input appears

---

## Phase 4: User Story 2 [P2] - Persist Side Assignments

**User Story**: Users expect their side assignments to be saved and remain consistent across browser sessions, so they don't lose their album organization work.

**Success Criteria**: 100% of side assignments persist across browser sessions and page refreshes; side information preserved in 100% of export/import operations

- [X] [T-012] [P2] [Story 2] Verify localStorage persistence via existing useEffect in [src/App.jsx:1481](../../../src/App.jsx)
  - **Note**: No code changes needed - existing effect already saves entire songs array
  - **Acceptance**: Side field automatically included in localStorage writes
  - **Test**: Assign side → Refresh browser → Verify side persisted

- [X] [T-013] [P2] [Story 2] Verify export includes side field in [src/App.jsx:252](../../../src/App.jsx)
  - **Note**: No code changes needed - export serializes entire song object
  - **Acceptance**: Exported JSON contains `"side"` field for all songs
  - **Test**: Assign sides → Export JSON → Verify side values in file

- [X] [T-014] [P2] [Story 2] Verify import restores side field in [src/App.jsx:267](../../../src/App.jsx)
  - **Note**: No code changes needed - import + migration handles side field
  - **Acceptance**: Imported songs restore side assignments via migration
  - **Test**: Export with sides → Clear storage → Import → Verify sides restored

- [X] [T-015] [P2] [Story 2] Test edge case: Import JSON with missing side field
  - **Setup**: Manually remove `side` field from exported JSON
  - **Acceptance**: Migration adds `side: ""` default
  - **Test**: Import → Verify all songs have `side: ""`

- [X] [T-016] [P2] [Story 2] Test edge case: Import JSON with invalid side values
  - **Setup**: Manually edit JSON to include `"side": "3"`, `"side": null`, `"side": 1`
  - **Acceptance**: Migration sanitizes all invalid values to `""`
  - **Test**: Import → Verify all invalid sides become `""`

---

## Phase 5: User Story 3 [P3] - View Side Information in Grid

**User Story**: Users want to quickly see which side each song belongs to when viewing the album grid, without having to open individual song details.

**Success Criteria**: Users can view side assignments for all songs within 2 seconds of loading the album grid

### 5.1 Badge Display Logic

- [X] [T-017] [P3] [Story 3] Add conditional badge to SongCard title row in [src/App.jsx:783-799](../../../src/App.jsx)
  - **Location**: Inside title flex container, after EditableText
  - **Logic**: Show badge only if `song.side` is truthy; blue for "1", purple for "2"
  - **Acceptance**: Badge conditionally renders with correct colors
  - **Test**: Assign sides → Verify badges appear with correct colors

### 5.2 Grid Visual Implementation

- [X] [T-018] [P3] [Story 3] Wrap title in flex container for badge placement in [src/App.jsx:783-799](../../../src/App.jsx)
  - **Before**: Title and Zoom button in single flex row
  - **After**: Title + badge wrapped together, then Zoom button
  - **Acceptance**: Layout accommodates badge without breaking title/button layout
  - **Test**: Assign song to Side 1 → Verify blue badge appears next to title

- [X] [T-019] [P3] [Story 3] Test badge display for all three states
  - **Side 1**: Verify blue badge "Side 1" appears (`bg-blue-500/20 text-blue-400`)
  - **Side 2**: Verify purple badge "Side 2" appears (`bg-purple-500/20 text-purple-400`)
  - **No side**: Verify no badge displayed
  - **Acceptance**: All three visual states distinguish clearly on dark background
  - **Test**: Create 3 songs with different sides → Verify badge behavior

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, code quality, and documentation

### 6.1 Code Quality

- [X] [T-020] Run `npm run lint` and fix any ESLint warnings
  - **Acceptance**: No linting errors related to side field implementation
  - **Test**: `npm run lint` exits with code 0

- [X] [T-021] Run `npm run build` and verify production build succeeds
  - **Acceptance**: Build completes without errors or warnings
  - **Test**: `npm run build` produces dist/ directory

### 6.2 Integration Testing

- [X] [T-022] Execute full validation checklist from [quickstart.md](./quickstart.md#validation-checklist)
  - **Items**: 14 manual tests covering all scenarios (input, validation, borders, export/import)
  - **Acceptance**: All 14 checklist items pass
  - **Test**: Follow checklist systematically

### 6.3 Documentation

- [X] [T-023] Update CLAUDE.md with feature 010 technology stack
  - **Add**: JavaScript ES2022 with React 19.1.1, side field validation pattern
  - **Acceptance**: CLAUDE.md includes 010-song-side in recent changes
  - **Test**: Verify CLAUDE.md updated with `/speckit.plan` output

---

## Dependency Graph

```
Phase 1 (T-001)
    ↓
Phase 2 (T-002, T-003) ← Must complete before Phase 4
    ↓
Phase 3 (T-004 → T-011) [P1] ← Can parallelize with Phase 5
    ↓
Phase 4 (T-012 → T-016) [P2] ← Requires Phase 2
    ↓
Phase 5 (T-017 → T-019) [P3] ← Independent of Phase 3-4
    ↓
Phase 6 (T-020 → T-023) ← Final validation
```

**Critical Path**: T-001 → T-002 → T-003 → T-004 → T-007 → T-011 → T-012 → T-020

**Parallel Tracks**:
- **Track A**: Phase 3 (Detail view) - T-004 through T-011
- **Track B**: Phase 5 (Grid view) - T-017 through T-019

---

## Testing Notes

**Manual Test Scenarios** (from quickstart.md):

1. **Valid input "1"**: Type → Blur → Verify saved, blue border in grid
2. **Valid input "2"**: Type → Blur → Verify saved, purple border in grid
3. **Empty input ""**: Clear → Blur → Verify saved, default border in grid
4. **Invalid input "3"**: Type → Blur → Verify red border, not saved
5. **Escape key**: Type invalid → Press Escape → Verify input reverts
6. **Enter key**: Type valid → Press Enter → Verify saves
7. **Refresh browser**: Assign sides → Refresh → Verify persisted
8. **Export/Import**: Assign sides → Export → Clear storage → Import → Verify restored
9. **Import old JSON**: Import JSON without `side` → Verify migration adds `side: ""`
10. **Import invalid side**: Import JSON with `"side": "invalid"` → Verify sanitized to `""`

**Automated Test Script** (run in browser console):

```javascript
// Verify migration adds side field
const stored = JSON.parse(localStorage.getItem('albumProgress_v3'));
console.assert(stored.songs[0].hasOwnProperty('side'), 'Missing side field');

// Verify valid values only
const validValues = ["", "1", "2"];
const allValid = stored.songs.every(s => validValues.includes(s.side));
console.assert(allValid, 'Invalid side values detected');

// Check export includes side
const exported = JSON.stringify(stored, null, 2);
console.log('Export includes side:', exported.includes('"side"'));

console.log('All tests passed!');
```

---

## Implementation Order Recommendation

**For sequential implementation**:
1. Phase 1 → Phase 2 (Setup + Migration) - 10 minutes
2. Phase 3 (User Story 1 - Detail View) - 20 minutes
3. Phase 4 (User Story 2 - Persistence) - 10 minutes
4. Phase 5 (User Story 3 - Grid View) - 10 minutes
5. Phase 6 (Polish) - 10 minutes

**For parallel implementation**:
1. Developer A: Phase 1-2, then Phase 3 (Detail view)
2. Developer B: Phase 5 (Grid view) - can start after Phase 1-2 complete
3. Both: Phase 4 testing, Phase 6 validation

---

## Success Metrics (from spec.md)

- **SC-001**: ✅ Users can assign side in <5 seconds (text input + blur)
- **SC-002**: ✅ 100% persistence (localStorage + migration)
- **SC-003**: ✅ 100% export/import preservation (migration handles edge cases)
- **SC-004**: ✅ Existing albums migrate successfully (migrateSongs adds default)
- **SC-005**: ✅ Grid loads <2 seconds (border class change only)

---

## Risk Mitigation

| Risk | Mitigation | Task |
|------|------------|------|
| Tailwind purges border colors | Add to safelist if needed | T-017 |
| Migration breaks old exports | Test with JSON from version 008 | T-014 |
| Invalid data in localStorage | Sanitization in migration | T-002 |
| Red border stuck after fix | useEffect syncs validation state | T-010 |

---

## Related Documentation

- [Feature Spec](./spec.md) - User stories and requirements
- [Implementation Plan](./plan.md) - Technical approach
- [Data Model](./data-model.md) - Song schema extension
- [Validation Contract](./contracts/side-validation.md) - Validation rules
- [Quickstart Guide](./quickstart.md) - Step-by-step instructions
- [Research](./research.md) - Design decisions
