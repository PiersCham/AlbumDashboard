# Research: Song Side Assignment

**Feature**: 010-song-side | **Date**: 2025-11-28

## Overview

This document records technical decisions and research findings for implementing the song side assignment feature.

## Research Questions

### Q1: Data Type for Side Field

**Question**: Should the `side` field use string ("", "1", "2") or number (null, 1, 2)?

**Decision**: String type

**Rationale**:
1. **User input alignment**: Text input naturally produces string values; avoids unnecessary parsing
2. **JSON compatibility**: Empty string (`""`) is more explicit than null in exported JSON
3. **Display simplicity**: Can display `song.side || "No side"` without type conversion
4. **Validation clarity**: String validation (`value === "" || value === "1" || value === "2"`) is straightforward
5. **Consistency**: Matches existing pattern where Tempo uses numbers but is validated as strings during input

**Alternatives Considered**:
- **Number (null, 1, 2)**: Rejected - Requires parseInt/parseFloat, null handling in display, more complex validation
- **Enum/Symbol**: Rejected - Over-engineered for 3 simple values, violates Simplicity First principle

---

### Q2: Validation Pattern

**Question**: How should invalid input be handled (silent revert, error message, visual feedback)?

**Decision**: Visual feedback (red border) + prevent save

**Rationale**:
1. **User clarity**: Red border immediately signals invalid state without disruptive modals/alerts
2. **Existing pattern**: Mirrors Tempo input behavior users already understand
3. **Data integrity**: Invalid values never reach localStorage
4. **Constitution**: Supports Principle II (User Experience) - non-intrusive, clear feedback

**Implementation**:
```javascript
const [sideInput, setSideInput] = useState(song.side || "");
const [isValidSide, setIsValidSide] = useState(true);

const validateSide = (value) => {
  return value === "" || value === "1" || value === "2";
};

const handleSideBlur = () => {
  const valid = validateSide(sideInput);
  setIsValidSide(valid);
  if (valid) {
    onUpdate({ ...song, side: sideInput });
  }
  // Invalid values don't save; input stays in error state
};
```

**Alternatives Considered**:
- **Silent revert**: Rejected - Confusing for users; no feedback on why change didn't persist
- **Auto-correct (e.g., "a" → "1")**: Rejected - Unpredictable behavior, violates user intent
- **Alert/modal**: Rejected - Disruptive, slows workflow

---

### Q3: Grid Visual Indicator

**Question**: How should side assignments be displayed in the grid view?

**Decision**: Use colored badges next to song title (revised from borders during implementation)

**Initial Decision**: Colored borders (`border-blue-500` for Side 1, `border-purple-500` for Side 2)

**Revision Rationale** (changed during implementation):
1. **Layout Issue**: Colored borders caused scrollbars in song detail cards within the grid
2. **User Feedback**: User requested badge alternative to avoid scrollbar issues
3. **Better UX**: Badges are more explicit and easier to identify at a glance
4. **Space Efficiency**: Badges only appear when side is assigned, saving space for unassigned songs

**Final Implementation**:
```javascript
{song.side && (
  <span className={`text-xs px-2 py-0.5 rounded ${
    song.side === "1" ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
  }`}>
    Side {song.side}
  </span>
)}
```

**Color Choices**:
- Side 1: Blue (`bg-blue-500/20 text-blue-400`) - Cool tone, high contrast
- Side 2: Purple (`bg-purple-500/20 text-purple-400`) - Warm tone, distinct from blue
- No side: No badge displayed

**Alternatives Considered**:
- **Colored borders**: Initially implemented, rejected due to scrollbar issues
- **Hardcoded hex colors**: Rejected - Breaks Tailwind theme consistency
- **Icons only**: Rejected - Less explicit than text badges
- **Text labels without color**: Rejected - Less visually distinct

---

### Q4: Migration Strategy

**Question**: How should existing songs without `side` field be handled?

**Decision**: Extend existing `migrateSongs` function to add `side: ""` default

**Rationale**:
1. **Existing pattern**: App already uses `migrateSongs` for Tempo, Key, Duration, isDraft migrations
2. **Backward compatibility**: Old JSON exports remain importable; new field added silently
3. **Data integrity**: Default `""` (no side) is safe, non-destructive fallback
4. **Constitution**: Aligns with Principle III (Data Integrity) - no data loss, explicit defaults

**Implementation**:
```javascript
const migrateSongs = (s) => {
  if (!s) return DEFAULT_SONGS;

  const migratedSongs = s.map((song) => {
    // ... existing migrations for stages, tempo, key, duration, isDraft

    // Migrate side (add default if missing)
    const side = typeof song.side === 'string' && (song.side === "" || song.side === "1" || song.side === "2")
      ? song.side
      : "";

    return { ...song, stages: migratedStages, tempo, key, duration, isDraft, side };
  });

  return migratedSongs;
};
```

**Alternatives Considered**:
- **Separate migration script**: Rejected - Over-engineered for single field addition
- **Prompt user for defaults**: Rejected - Disruptive, unnecessary for safe default value
- **Version flag in localStorage**: Rejected - Adds complexity, unnecessary when migrations are idempotent

---

### Q5: Input Placement in Detail View

**Question**: Where should the Side input appear in the SongDetail view?

**Decision**: Place after Duration field, before Draft checkbox

**Rationale**:
1. **Logical grouping**: Follows song metadata sequence (Title → Key → Tempo → Duration → Side)
2. **Visual flow**: Side is a categorical attribute like Key, fits naturally in metadata row
3. **Existing pattern**: Similar to how Key and Tempo are placed side-by-side
4. **Compact layout**: Keeps all metadata in one horizontal row before stage list

**Visual Layout** (text-xs row):
```
[Key: Db Major] [Tempo: 120 BPM] [Duration: 3:45] [Side: 1]
```

**Alternatives Considered**:
- **Above title**: Rejected - Side is secondary metadata, not primary identifier
- **Below stage list**: Rejected - Breaks metadata grouping, forces scrolling to edit
- **Separate row**: Rejected - Wastes vertical space in compact card layout

---

## Summary of Key Decisions

| Decision Point | Chosen Approach | Primary Rationale |
|----------------|-----------------|-------------------|
| Data type | String ("", "1", "2") | Input alignment, JSON clarity |
| Validation | Red border + no save | Visual feedback, existing pattern |
| Grid indicator | Colored badges (revised from borders) | Avoids scrollbar issues, more explicit |
| Badge colors | Blue/purple with transparency | Theme consistency, high contrast |
| Migration | Extend `migrateSongs` | Existing pattern, backward compat |
| Input placement | After Duration, before Draft | Logical grouping, compact layout |

## Implementation Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Badge text too long | Low | Low | Short text "Side 1"/"Side 2" fits well in compact space |
| localStorage bloat | Low | Low | Side field adds ~2-3 bytes/song (negligible for 12 songs) |
| Migration breaks old exports | Low | High | Test import with JSON files from previous versions |
| Invalid data in localStorage | Low | Medium | Validation in `migrateSongs` provides safe fallback |

## Next Steps

Proceed to Phase 1: Generate data-model.md and contracts/side-validation.md with these decisions codified.
