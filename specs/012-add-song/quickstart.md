# Quickstart: Add New Song Implementation

**Feature**: 012-add-song | **Date**: 2025-12-02
**Estimated Time**: 2-3 hours

## Overview

Add ability to dynamically add/remove songs in the AlbumDashboard React app. Changes are confined to `src/App.jsx` with no new files or dependencies.

## Prerequisites

- [x] Feature spec reviewed ([spec.md](spec.md))
- [x] Constitution check passed ([plan.md](plan.md#constitution-check))
- [x] Data model understood ([data-model.md](data-model.md))
- [x] Function contracts reviewed ([contracts/functions.md](contracts/functions.md))

## Implementation Steps

### Step 1: Add Storage Quota Check (10 min)

**File**: `src/App.jsx`
**Location**: After existing useMemo hooks, before return statement

```javascript
// Add after albumAverage and eligibleCount calculations
const isStorageQuotaOk = useMemo(() => {
  try {
    const currentData = JSON.stringify({ songs, albumTitle, targetISO, songCount });
    const bytesUsed = currentData.length * 2; // UTF-16
    const quotaLimit = 5000000; // 5MB
    return bytesUsed < (quotaLimit * 0.9);
  } catch {
    return false;
  }
}, [songs, albumTitle, targetISO, songCount]);
```

**Test**: Console log `isStorageQuotaOk` to verify it returns `true` with current data

---

### Step 2: Add Song Handler (15 min)

**File**: `src/App.jsx`
**Location**: After `updateSong` function, before return statement

```javascript
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
  setSongCount(songs.length + 1);
};
```

**Test**:
1. Add console.log at start of function
2. Call `addSong()` from browser console
3. Verify new song appears in grid
4. Verify localStorage updated (Application tab in DevTools)

---

### Step 3: Remove Song Handler (15 min)

**File**: `src/App.jsx`
**Location**: After `addSong` function

```javascript
const removeSong = (songId) => {
  const song = songs.find(s => s.id === songId);

  if (song && songAverage(song) > 0) {
    if (!window.confirm("This song has progress. Are you sure you want to delete it?")) {
      return;
    }
  }

  setSongs(songs.filter(s => s.id !== songId));
  setSongCount(songs.length - 1);
};
```

**Test**:
1. Create a song with some progress
2. Call `removeSong(songId)` from console
3. Verify confirmation dialog appears
4. Verify song removed after confirmation

---

### Step 4: Add "Add Song" Button in Grid View (20 min)

**File**: `src/App.jsx`
**Location**: In grid view section (when `!currentSong`), before song cards grid

```jsx
{!currentSong && (
  <>
    {/* Existing Header component */}
    <Header ... />

    {/* Existing album-wide progress bar */}
    {(() => {
      const nonDraftSongs = visibleSongs.filter(song => !song.isDraft);
      return (
        <div className="px-4 -mt-2 pb-2 relative">
          {/* ... existing progress bar ... */}
        </div>
      );
    })()}

    {/* NEW: Add Song button */}
    <div className="px-4 pb-2">
      <button
        disabled={songs.length >= 99 || !isStorageQuotaOk}
        onClick={addSong}
        className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
        title={
          songs.length >= 99
            ? "Maximum 99 songs reached"
            : !isStorageQuotaOk
            ? "Storage quota approaching limit"
            : "Add a new song"
        }
      >
        Add Song
      </button>
    </div>

    {/* Existing song cards grid */}
    <div className="px-4 pb-4 h-[calc(100vh-140px)] overflow-hidden">
      {/* ... existing grid ... */}
    </div>
  </>
)}
```

**Styling Notes**:
- Use emerald color to match existing theme (success actions)
- Disabled state: neutral-700 background, not-allowed cursor
- Add tooltip (title attribute) explaining why disabled

**Test**:
1. Verify button appears in grid view
2. Verify button hidden in zoom view
3. Click button → new song appears
4. Add songs until 99 → button disables
5. Verify tooltip text on hover

---

### Step 5: Add "Remove Song" Button in Zoom View (20 min)

**File**: `src/App.jsx`
**Location**: In `SongDetail` component, in header section after "Back to Grid" button

```jsx
function SongDetail({ song, onUpdate, onBack }) {
  // ... existing code ...

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="bg-neutral-900 ... p-6 ...">
        <div className="flex items-center justify-between mb-4">
          <EditableText
            text={song.title}
            onSubmit={(t) => onUpdate({ ...song, title: t })}
            className="text-3xl font-bold"
          />
          <div className="flex items-center gap-2">
            {/* Existing Draft checkbox */}
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={song.isDraft || false}
                onChange={handleDraftToggle}
                className="w-4 h-4 cursor-pointer"
              />
              <span>Draft</span>
            </label>

            {/* NEW: Remove Song button */}
            <button
              onClick={() => {
                removeSong(song.id);
                onBack();
              }}
              className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 transition-colors"
              title="Remove this song"
            >
              Remove Song
            </button>

            {/* Existing Back to Grid button */}
            <button
              className="px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
              onClick={onBack}
            >
              Back to Grid
            </button>
          </div>
        </div>
        {/* ... rest of component ... */}
      </div>
    </div>
  );
}
```

**Styling Notes**:
- Use red-600 for destructive action (standard UI pattern)
- Place before "Back to Grid" button (logical order: edit → remove → navigate)

**Test**:
1. Open zoom view for any song
2. Verify "Remove Song" button visible
3. Click on song with no progress → removes immediately, returns to grid
4. Click on song with progress → shows confirmation → removes after confirm
5. Cancel confirmation → song not removed

---

### Step 6: Manual Testing Checklist (30 min)

**Add Song Tests**:
- [ ] Button visible in grid view only
- [ ] Button hidden in zoom view
- [ ] Click adds song with default title "Song {id}"
- [ ] New song has 8 default stages at 0%
- [ ] New song has tempo 120 BPM
- [ ] New song has no key, 0:00 duration, non-draft, no side
- [ ] Song persists after page reload
- [ ] Button disables at 99 songs
- [ ] Button disables when storage quota approaches limit (hard to test - verify logic)
- [ ] Song IDs increment from max (test with gaps: delete song 5, add new → gets ID 13 if max was 12)

**Remove Song Tests**:
- [ ] Button visible in zoom view only
- [ ] Button not visible in grid view
- [ ] Remove song with 0% progress → immediate removal, no confirmation
- [ ] Remove song with >0% progress → shows confirmation dialog
- [ ] Confirmation "Cancel" → song not removed
- [ ] Confirmation "OK" → song removed, returns to grid
- [ ] Song removal persists after page reload
- [ ] Can remove last song (0 songs state)
- [ ] songCount updates correctly after removal

**Edge Cases**:
- [ ] Add then immediately remove → works correctly
- [ ] Remove all songs, then add new → ID starts at 1
- [ ] Export data with added songs → includes all new songs
- [ ] Import data → new songs restored correctly
- [ ] Add song while at 98 songs → button disables after add

---

## Verification

### Visual Inspection

1. **Grid View**:
   - "Add Song" button styled with emerald-600 background
   - Button positioned above song cards grid
   - Hover state shows emerald-500
   - Disabled state shows neutral-700 with not-allowed cursor

2. **Zoom View**:
   - "Remove Song" button styled with red-600 background
   - Button positioned between Draft checkbox and Back button
   - Hover state shows red-500

### Functional Verification

```javascript
// In browser console:

// Test 1: Add song
addSong();
// Expected: New song appears in grid

// Test 2: Check ID generation
const ids = songs.map(s => s.id);
console.log(Math.max(...ids)); // Should be highest ID
addSong();
console.log(songs[songs.length - 1].id); // Should be max + 1

// Test 3: Storage quota check
console.log(isStorageQuotaOk); // Should be true for <100 songs

// Test 4: Remove song
removeSong(13); // Replace 13 with actual song ID
// Expected: Song removed (with confirmation if progress > 0)
```

### localStorage Verification

```javascript
// Check persisted data structure
const stored = JSON.parse(localStorage.getItem('albumProgress_v3'));
console.log(stored.songs.length); // Should match UI
console.log(stored.songCount); // Should match UI
```

---

## Rollback Plan

If issues discovered:

1. **Remove changes from App.jsx**:
   - Delete `isStorageQuotaOk` useMemo
   - Delete `addSong` function
   - Delete `removeSong` function
   - Remove "Add Song" button JSX
   - Remove "Remove Song" button from SongDetail

2. **Clear affected localStorage** (if corrupted):
   ```javascript
   localStorage.removeItem('albumProgress_v3');
   ```

3. **Restore from export** (if user data affected):
   - Use Import button with previous export file

---

## Next Steps

After implementation complete:

1. **Run `/speckit.tasks`** to generate task breakdown for tracking
2. **Create test cases** for data persistence logic (constitution requirement)
3. **Visual review** in browser at different screen sizes
4. **Git commit** with message referencing spec: `feat: add song addition/removal (012-add-song)`

---

## Common Pitfalls

❌ **Don't** mutate songs array directly (`songs.push()`)
✅ **Do** use spread operator (`setSongs([...songs, newSong])`)

❌ **Don't** reuse song IDs (gap filling)
✅ **Do** increment from max ID (`Math.max(...ids) + 1`)

❌ **Don't** skip confirmation for songs with progress
✅ **Do** check `songAverage(song) > 0` before deletion

❌ **Don't** forget to update songCount
✅ **Do** increment/decrement songCount with songs array

❌ **Don't** show "Add Song" in zoom view
✅ **Do** conditional render on `!currentSong`

---

## Estimated Time Breakdown

| Step | Time | Cumulative |
|------|------|------------|
| 1. Storage quota check | 10 min | 10 min |
| 2. Add song handler | 15 min | 25 min |
| 3. Remove song handler | 15 min | 40 min |
| 4. Add button (grid) | 20 min | 60 min |
| 5. Remove button (zoom) | 20 min | 80 min |
| 6. Manual testing | 30 min | 110 min |
| Buffer for debugging | 20 min | 130 min |

**Total**: ~2 hours 10 minutes

**With comprehensive testing**: ~3 hours
