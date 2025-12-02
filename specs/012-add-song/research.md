# Research: Add New Song

**Feature**: 012-add-song | **Date**: 2025-12-02
**Phase**: 0 (Outline & Research)

## Overview

This document consolidates research findings for implementing song addition and removal functionality. Since all technical context is known (existing React/localStorage codebase), research focuses on best practices for the specific implementation patterns needed.

## Research Tasks

### 1. Dynamic Array Management in React

**Question**: What's the best practice for adding/removing items from React state arrays while maintaining immutability?

**Decision**: Use spread operator for additions, filter() for removals

**Rationale**:
- Existing codebase already uses this pattern extensively in App.jsx
- `setSongs([...songs, newSong])` for additions maintains immutability
- `setSongs(songs.filter(s => s.id !== removedId))` for removals
- Both patterns trigger React re-renders correctly
- No need for reducers or complex state management (follows constitution's simplicity principle)

**Alternatives Considered**:
- useReducer: Overkill for simple array operations, adds unnecessary abstraction
- Immer library: External dependency not justified for straightforward operations
- Array.push/splice with state clone: More verbose, no benefits over spread/filter

**Implementation Notes**:
```javascript
// Add song
const addSong = () => {
  const newId = Math.max(...songs.map(s => s.id), 0) + 1;
  const newSong = {
    id: newId,
    title: `Song ${newId}`,
    stages: DEFAULT_STAGE_NAMES.map(name => ({ name, value: 0 })),
    tempo: DEFAULT_TEMPO,
    key: null,
    duration: { minutes: 0, seconds: 0 },
    isDraft: false,
    side: ""
  };
  setSongs([...songs, newSong]);
  setSongCount(songCount + 1);
};

// Remove song
const removeSong = (songId) => {
  setSongs(songs.filter(s => s.id !== songId));
  setSongCount(songCount - 1);
};
```

---

### 2. localStorage Quota Detection

**Question**: How to proactively detect when localStorage is approaching quota limits?

**Decision**: Estimate storage usage by JSON string length, disable button at 90% threshold

**Rationale**:
- Most browsers provide 5-10MB localStorage quota
- JSON.stringify(data).length gives byte approximation (UTF-16, so multiply by 2)
- Check against estimated quota (conservative 5MB = 5,000,000 bytes)
- Disable at 90% threshold (4.5MB) provides safety margin
- No try/catch on every write (existing code doesn't do this, follows existing pattern)

**Alternatives Considered**:
- Try/catch on localStorage.setItem(): Reactive not proactive, breaks UX principle
- navigator.storage.estimate(): Not universally supported, requires async handling
- Fixed song count limit: Already have 99-song limit, storage check is additional safety

**Implementation Notes**:
```javascript
const isStorageQuotaOk = useMemo(() => {
  try {
    const currentData = JSON.stringify({ songs, albumTitle, targetISO, songCount });
    const bytesUsed = currentData.length * 2; // UTF-16 approximation
    const quotaLimit = 5000000; // Conservative 5MB
    return bytesUsed < (quotaLimit * 0.9); // 90% threshold
  } catch {
    return false; // If estimation fails, disable to be safe
  }
}, [songs, albumTitle, targetISO, songCount]);
```

---

### 3. ID Generation with Gap Avoidance

**Question**: How to ensure song IDs never reuse gaps from deleted songs?

**Decision**: Use `Math.max(...songs.map(s => s.id), 0) + 1`

**Rationale**:
- Always increments from highest existing ID
- Handles empty array case (Math.max returns -Infinity, fallback to 0)
- Simple, predictable, no state tracking needed
- IDs remain stable across export/import cycles
- Matches existing pattern in codebase for ID assignment

**Alternatives Considered**:
- Track "nextId" in localStorage: Extra state to manage, violates simplicity
- UUID/crypto.randomUUID(): Overkill for sequential IDs, breaks user expectations (Song 13, Song 14)
- Fill gaps first: Explicitly rejected per clarification session (confusing UX)

**Implementation Notes**:
```javascript
const getNextSongId = () => {
  if (songs.length === 0) return 1;
  return Math.max(...songs.map(s => s.id)) + 1;
};
```

---

### 4. Conditional Button Rendering (Grid vs Zoom View)

**Question**: How to show "Add Song" in grid view but hide in zoom view?

**Decision**: Use conditional rendering based on currentSong state (already exists)

**Rationale**:
- App already has `currentSong` state from hash routing (`#song/:id`)
- Grid view renders when `currentSong === null`
- Zoom view (SongDetail) renders when `currentSong` is truthy
- Simple ternary: `{!currentSong && <button>Add Song</button>}`
- Remove button only in SongDetail component (already has song context)

**Alternatives Considered**:
- Separate view state: Redundant with existing currentSong state
- CSS display:none: Less semantic, still renders DOM element unnecessarily
- Route-based logic: Over-engineering for simple conditional render

**Implementation Notes**:
```javascript
// In App.jsx grid view section
{!currentSong && (
  <div className="px-4 py-2">
    <button
      disabled={songs.length >= 99 || !isStorageQuotaOk}
      onClick={addSong}
      className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 disabled:cursor-not-allowed"
    >
      Add Song
    </button>
  </div>
)}

// In SongDetail component
<button
  onClick={() => {
    if (songAverage(song) > 0 && !confirm("Delete this song with progress?")) return;
    removeSong(song.id);
    onBack();
  }}
  className="px-3 py-2 rounded bg-red-600 hover:bg-red-500"
>
  Remove Song
</button>
```

---

## Summary of Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Array mutation | Spread operator & filter() | Immutable, idiomatic React, existing pattern |
| Storage quota | JSON.stringify length @ 90% | Proactive, no async APIs, conservative |
| ID generation | Math.max(ids) + 1 | Simple, predictable, no gap reuse |
| Button visibility | Conditional render on currentSong | Uses existing state, semantic HTML |
| Confirmation | window.confirm() for progress>0 | Built-in, blocks UI (intentional for destructive action) |

**No external research needed** - All decisions based on:
- Existing codebase patterns in App.jsx
- React best practices already in use
- Constitution principles (simplicity, no new dependencies)

**Ready for Phase 1**: Data model and implementation details
