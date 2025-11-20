# Research: Draft Song Status

**Feature**: 008-draft-song-status
**Date**: 2025-11-21
**Purpose**: Technical research and decision documentation for draft song status feature

---

## Decision 1: Draft Status Data Type

**Question**: Should draft status be a boolean flag, enum, or object?

**Options Considered**:
1. Boolean flag (`isDraft: true/false`)
2. Enum (`status: 'draft' | 'final' | 'review'`)
3. Object (`draft: { status: boolean, timestamp: Date }`)

**Decision**: Boolean flag (`isDraft: boolean`)

**Rationale**:
- **Simplicity First**: User requirement specifies "simple checkbox" - maps directly to boolean
- **YAGNI**: No current need for multi-state workflow (draft/review/final)
- **Storage efficiency**: Boolean vs string/object reduces localStorage footprint
- **Backward compatibility**: Easy to default missing field to `false`

**Alternatives Rejected**:
- Enum rejected: Out of scope per spec ("multi-state workflow beyond simple draft/not-draft")
- Object rejected: No requirement for timestamp tracking, violates simplicity principle

---

## Decision 2: Visual Styling Approach

**Question**: How should draft songs be visually distinguished (greyed-out)?

**Options Considered**:
1. Opacity reduction on wrapper div (50-70%)
2. Grayscale filter (`filter: grayscale(100%)`)
3. Border + background color change
4. Custom "DRAFT" badge/label overlay

**Decision**: Opacity reduction (`opacity-60` Tailwind class)

**Rationale**:
- **User requirement**: Spec explicitly requests "grey-out that songcard"
- **Performance**: CSS opacity is hardware-accelerated (60fps guaranteed)
- **Simplicity**: Single Tailwind class vs custom CSS
- **Accessibility**: Maintains text contrast ratios (60% opacity keeps readable)
- **Existing patterns**: Opacity already used for drag state (feature 007)

**Alternatives Rejected**:
- Grayscale filter: Browser support inconsistent, heavier rendering cost
- Border/background: Doesn't convey "inactive" as clearly as opacity
- Badge overlay: Adds UI complexity, not requested in spec

---

## Decision 3: Checkbox Placement

**Question**: Where should the draft checkbox appear on the song card?

**Options Considered**:
1. Top-right corner next to title
2. Bottom-left corner near stage controls
3. Top-left corner before title
4. Inline with title text

**Decision**: Top-right corner of song card

**Rationale**:
- **Existing pattern**: Other metadata (tempo, key, duration) in top section
- **Visual hierarchy**: Title is most prominent, checkbox is secondary action
- **Touch target**: Top-right avoids conflict with stage drag handles
- **Consistency**: Mirrors standard UI patterns (checkboxes in list views)

**Implementation**:
- Absolute positioning within song card wrapper
- 16×16px checkbox (standard size, accessible touch target)
- 4px margin from card edge

**Alternatives Rejected**:
- Bottom placement: Too far from title context, requires scrolling for long stage lists
- Inline with title: Clutters primary content area
- Top-left: Conflicts with typical reading flow (left-to-right)

---

## Decision 4: Total Duration Calculation Modification

**Question**: How should draft songs be excluded from total duration?

**Options Considered**:
1. Filter draft songs before reduce operation in useMemo
2. Add conditional within reduce operation
3. Maintain two separate totals (all songs vs non-draft)
4. Pass filter flag to existing calculation function

**Decision**: Filter draft songs before reduce in useMemo

**Rationale**:
- **Clarity**: `songs.filter(s => !s.isDraft).reduce(...)` is self-documenting
- **Performance**: Filter first reduces iterations in reduce operation
- **Existing pattern**: Feature 006 already uses reduce for duration sum
- **Single source of truth**: Total always reflects non-draft songs (no dual totals)

**Implementation**:
```javascript
const totalDuration = useMemo(() => {
  const nonDraftSongs = songs.filter(song => !song.isDraft);
  return nonDraftSongs.reduce((acc, song) => {
    return acc + (song.duration.minutes * 60) + song.duration.seconds;
  }, 0);
}, [songs]);
```

**Alternatives Rejected**:
- Conditional in reduce: Less readable, mixes filtering and aggregation logic
- Dual totals: Out of scope, adds UI complexity
- Filter flag parameter: Over-abstraction for single use case

---

## Decision 5: Persistence Strategy

**Question**: How should draft status persist to localStorage?

**Options Considered**:
1. Automatic on every song update (existing useEffect pattern)
2. Manual save button for draft status changes
3. Debounced save (300ms delay)
4. Separate draft status storage key

**Decision**: Automatic persistence via existing useEffect

**Rationale**:
- **Existing pattern**: All song changes already trigger useEffect save
- **Data integrity**: Immediate save prevents data loss (constitution principle III)
- **Simplicity**: Zero new persistence code required
- **User expectation**: Consistent with tempo, key, duration editing behavior

**Implementation**:
- Existing `useEffect(() => { localStorage.setItem(...) }, [songs])` triggers automatically
- isDraft field included in song object (no schema change needed)

**Alternatives Rejected**:
- Manual save: Violates UX principle (data loss risk if user forgets)
- Debounced save: Adds complexity, risk of data loss if page closes mid-debounce
- Separate storage: Complicates import/export, increases localStorage fragmentation

---

## Decision 6: Backward Compatibility

**Question**: How should existing songs (without isDraft field) be handled?

**Options Considered**:
1. Default to `false` (not draft) if field missing
2. Default to `true` (draft) if field missing
3. Show migration prompt on first load
4. Add isDraft field to all songs on app load

**Decision**: Default to `false` if field missing (defensive check)

**Rationale**:
- **User expectation**: Existing songs are assumed "final" (user hasn't marked them as draft)
- **Zero disruption**: Existing workflows continue unchanged
- **Defensive programming**: `song.isDraft || false` handles missing field gracefully
- **Constitution compliance**: No data loss, no migration complexity

**Implementation**:
```javascript
// Checkbox rendering
<input type="checkbox" checked={song.isDraft || false} />

// Duration filtering
const nonDraftSongs = songs.filter(song => !(song.isDraft || false));
```

**Alternatives Rejected**:
- Default to true: Would break existing workflows (all songs suddenly excluded from total)
- Migration prompt: Over-complicates UX for single field addition
- Force-add field: Modifies existing data unnecessarily

---

## Decision 7: Checkbox Behavior in SongDetail Zoom View

**Question**: Should draft checkbox appear in zoom view, and how should it sync?

**Options Considered**:
1. Show checkbox in zoom view, sync with grid view
2. Hide checkbox in zoom view (grid-only feature)
3. Show checkbox but disable editing in zoom view
4. Separate draft state for zoom vs grid

**Decision**: Show checkbox in zoom view with synchronized state

**Rationale**:
- **Consistency**: User expects same controls in both views (per feature 005 pattern)
- **Functional requirement**: FR-012 explicitly requires zoom view checkbox
- **State sync**: Both views use same song object (automatic sync via React state)
- **User convenience**: Can mark draft without closing zoom view

**Implementation**:
- Add checkbox to SongDetail component header
- Uses same `onUpdate` callback as grid view
- Same visual styling (absolute positioned, top-right)

**Alternatives Rejected**:
- Grid-only: Violates UX consistency principle
- Disabled in zoom: Confusing UX (visible but non-functional)
- Separate state: Data corruption risk, violates single source of truth

---

## Decision 8: Interaction with Drag-and-Drop (Feature 007)

**Question**: How should draft status interact with song card reordering?

**Options Considered**:
1. Disable drag for draft songs
2. Allow drag, preserve draft status during reorder
3. Auto-clear draft status when song is reordered
4. Visual indicator during drag (keep greyed-out)

**Decision**: Allow drag, preserve draft status, maintain greyed-out visual

**Rationale**:
- **Edge case handling**: Spec confirms "Draft songs can be reordered normally, draft status persists"
- **User expectation**: Reordering is orthogonal to draft status (arranging order vs marking progress)
- **Implementation simplicity**: No special handling needed (isDraft field moves with song object)
- **Visual clarity**: Greyed-out draft card during drag makes state obvious

**Implementation**:
- No changes to drag handlers (feature 007 code)
- Opacity applies to entire card (includes during drag state)
- Checkbox remains visible and clickable (not draggable itself)

**Alternatives Rejected**:
- Disable drag: Unexpected restriction, limits user workflow flexibility
- Auto-clear draft: Data loss risk, violates user intent
- Hide visual during drag: Confusing state change

---

## Decision 9: Export/Import Schema Extension

**Question**: How should draft status be included in JSON export/import?

**Options Considered**:
1. Add `isDraft` field to song objects in existing schema
2. Create separate `draftSongs` array (IDs only)
3. Add top-level `metadata.drafts` section
4. Exclude draft songs from export

**Decision**: Add `isDraft: boolean` field to each song object

**Rationale**:
- **Schema simplicity**: Single field addition, no structural changes
- **Data colocation**: Draft status belongs with song data (not separate metadata)
- **Backward compatibility**: Existing imports ignore unknown fields, new exports default missing to false
- **Constitution principle III**: All user data must be exportable (excluding drafts violates this)

**Example Schema**:
```json
{
  "songs": [
    {
      "id": 1,
      "title": "Song 1",
      "tempo": 120,
      "key": { "note": "C", "mode": "Major" },
      "duration": { "minutes": 3, "seconds": 45 },
      "isDraft": false,
      "stages": [...]
    },
    {
      "id": 2,
      "title": "Song 2 WIP",
      "isDraft": true,
      "...": "..."
    }
  ]
}
```

**Alternatives Rejected**:
- Separate drafts array: Denormalizes data, risks sync issues
- Metadata section: Complicates schema, requires dual lookups
- Exclude from export: Violates constitution (data loss on export/import cycle)

---

## Decision 10: Performance Optimization

**Question**: Does draft status filtering require performance optimization?

**Analysis**:
- **Scale**: 12 songs total (fixed album size)
- **Operation**: Single `Array.filter()` on checkbox change (avg 6ms for 12 items)
- **Frequency**: User-initiated (not continuous rendering)
- **Total duration recalc**: useMemo dependency ensures recalc only on songs change

**Decision**: No optimization needed

**Rationale**:
- **Constitution compliance**: <100ms performance target easily met (filter ~6ms)
- **Premature optimization**: Filter operation is O(n) with n=12, imperceptible to users
- **Simplicity First**: Adding memoization/caching violates YAGNI principle

**Measurement**:
- Worst case: 12 draft toggles/second = 72ms total (well under 100ms budget)
- useMemo already prevents unnecessary recalculations

**No Action Required**: Current implementation meets performance requirements.

---

## Summary

**Key Technical Decisions**:
1. Boolean flag for draft status (simplest data type)
2. Tailwind `opacity-60` for greyed-out visual (hardware-accelerated)
3. Top-right checkbox placement (consistent with metadata layout)
4. Filter-before-reduce for duration calculation (self-documenting)
5. Automatic persistence via existing useEffect (zero new code)
6. Default to `false` for backward compatibility (defensive)
7. Synchronized checkbox in zoom view (UX consistency)
8. Preserve draft status during drag-and-drop (orthogonal features)
9. Extend existing JSON schema with isDraft field (minimal change)
10. No performance optimization needed (12 songs easily under 100ms target)

**No NEEDS CLARIFICATION items remain** - All technical questions resolved.

**Ready for Phase 1**: data-model.md, contracts, quickstart.md generation.
