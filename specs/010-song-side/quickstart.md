# Implementation Quickstart: Song Side Assignment

**Feature**: 010-song-side | **Date**: 2025-11-28

## Overview

This guide provides step-by-step instructions for implementing the song side assignment feature. All changes are contained within `src/App.jsx`.

**Estimated Implementation Time**: 45-60 minutes

**Lines of Code**: ~70-90 LOC

## Prerequisites

- Read [data-model.md](./data-model.md) for schema details
- Read [contracts/side-validation.md](./contracts/side-validation.md) for validation rules
- Ensure branch `010-song-side` is checked out

## Implementation Steps

### Step 1: Update DEFAULT_SONGS Constant

**File**: `src/App.jsx`
**Location**: Line ~46-54

**Action**: Add `side: ""` to the default song template

**Before**:
```javascript
const DEFAULT_SONGS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Song ${i + 1}`,
  stages: DEFAULT_STAGE_NAMES.map((name) => ({ name, value: 0 })),
  tempo: DEFAULT_TEMPO,
  key: null,
  duration: { minutes: 0, seconds: 0 },
  isDraft: false,
}));
```

**After**:
```javascript
const DEFAULT_SONGS = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Song ${i + 1}`,
  stages: DEFAULT_STAGE_NAMES.map((name) => ({ name, value: 0 })),
  tempo: DEFAULT_TEMPO,
  key: null,
  duration: { minutes: 0, seconds: 0 },
  isDraft: false,
  side: "", // NEW: Default to no side assignment
}));
```

**Test**: Verify localStorage reset creates songs with `side: ""`

---

### Step 2: Update Migration Function

**File**: `src/App.jsx`
**Location**: Line ~1412-1459 (`migrateSongs` function)

**Action**: Add side field migration after isDraft migration

**Insert After Line ~1444** (after isDraft migration):
```javascript
      // Migrate side (add default if missing or invalid)
      const side = typeof song.side === 'string' && (song.side === "" || song.side === "1" || song.side === "2")
        ? song.side
        : "";

      return { ...song, stages: migratedStages, tempo, key, duration, isDraft, side };
```

**Before**:
```javascript
      return { ...song, stages: migratedStages, tempo, key, duration, isDraft };
```

**After**:
```javascript
      // Migrate side (add default if missing or invalid)
      const side = typeof song.side === 'string' && (song.side === "" || song.side === "1" || song.side === "2")
        ? song.side
        : "";

      return { ...song, stages: migratedStages, tempo, key, duration, isDraft, side };
```

**Test**: Import old JSON without `side` field → Verify `side: ""` added

---

### Step 3: Add Side Input to SongDetail View

**File**: `src/App.jsx`
**Location**: Line ~1212-1343 (`SongDetail` component)

#### 3a. Add State Variables

**Insert After Line ~926** (after existing state declarations):
```javascript
  // Side input state
  const [sideInput, setSideInput] = useState(song.side || "");
  const [isValidSide, setIsValidSide] = useState(true);
```

#### 3b. Add Validation Handlers

**Insert After Line ~1194** (after duration handlers):
```javascript
  // Side handlers
  const handleSideLabelClick = () => {
    if (isEditingDuration) {
      handleDurationSave();
    }
    // Focus the side input (input will handle focus itself)
  };

  const handleSideChange = (e) => {
    setSideInput(e.target.value);
  };

  const handleSideBlur = () => {
    const valid = sideInput === "" || sideInput === "1" || sideInput === "2";
    setIsValidSide(valid);

    if (valid) {
      onUpdate({ ...song, side: sideInput });
    }
    // If invalid, input stays in error state
  };

  const handleSideKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger validation
    } else if (e.key === 'Escape') {
      setSideInput(song.side || "");
      setIsValidSide(true);
    }
  };
```

#### 3c. Sync Side Input with Song Prop

**Insert After Line ~1204** (after existing useEffect hooks):
```javascript
  // Sync side input with song.side when song changes externally
  useEffect(() => {
    setSideInput(song.side || "");
    setIsValidSide(true);
  }, [song.side]);
```

#### 3d. Add UI Input Field

**Insert After Line ~1342** (after Duration input section, before closing div of metadata row):
```javascript
			{/* Side */}
			<div className="flex items-center gap-3">
			  <label
				className="text-neutral-400 cursor-pointer hover:underline"
				onClick={handleSideLabelClick}
			  >
				Side:
			  </label>
			  <input
				type="text"
				value={sideInput}
				onChange={handleSideChange}
				onBlur={handleSideBlur}
				onKeyDown={handleSideKeyDown}
				className={`bg-neutral-800 border rounded px-3 py-2 w-16 text-center focus:outline-none focus:ring-1 focus:ring-amber-500 ${
				  isValidSide ? 'border-neutral-700' : 'border-red-500'
				}`}
				placeholder="1/2"
			  />
			</div>
```

**Visual Result**: Side input appears after Duration field in the metadata row

**Test**:
- Type "1" → Blur → Verify saved
- Type "3" → Blur → Verify red border, not saved
- Type "" → Blur → Verify saved (cleared)

---

### Step 4: Add Side Badge to SongCard (Grid View)

**File**: `src/App.jsx`
**Location**: Line ~783-799 (`SongCard` component header)

**Action**: Add conditional badge display next to song title

**Find Line ~791-797** (SongCard title row):
```javascript
<div className="flex items-center justify-between gap-2">
  <EditableText
    text={song.title}
    onSubmit={(t) => onUpdate({ ...song, title: t })}
    className="font-bold leading-tight text-xl tracking-wider"
  />
  <button className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700" onClick={() => onZoom(song.id)} title="Zoom">Zoom</button>
</div>
```

**Replace with badge-enabled version**:
```javascript
<div className="flex items-center justify-between gap-2">
  <div className="flex items-center gap-2">
    <EditableText
      text={song.title}
      onSubmit={(t) => onUpdate({ ...song, title: t })}
      className="font-bold leading-tight text-xl tracking-wider"
    />
    {song.side && (
      <span className={`text-xs px-2 py-0.5 rounded ${
        song.side === "1" ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
      }`}>
        Side {song.side}
      </span>
    )}
  </div>
  <button className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700" onClick={() => onZoom(song.id)} title="Zoom">Zoom</button>
</div>
```

**Test**:
- Assign song to Side 1 → Verify blue badge appears next to title
- Assign song to Side 2 → Verify purple badge appears next to title
- Clear side → Verify badge disappears

---

### Step 5: Verify Export/Import Compatibility

**File**: `src/App.jsx`
**Location**: No code changes needed (export/import already handles entire song object)

**Manual Testing**:
1. Assign sides to several songs
2. Export JSON
3. Clear localStorage (or use different browser)
4. Import JSON
5. Verify side assignments restored correctly

**Edge Case Testing**:
1. Manually edit exported JSON to add `"side": "invalid"`
2. Import → Verify migration sanitizes to `""`
3. Manually remove `side` field from some songs
4. Import → Verify migration adds `"side": ""`

---

## Validation Checklist

- [ ] DEFAULT_SONGS includes `side: ""`
- [ ] Migration function handles missing/invalid `side` values
- [ ] SongDetail view has Side input field after Duration
- [ ] Side input validates on blur (only "", "1", "2" allowed)
- [ ] Invalid input shows red border and doesn't save
- [ ] Valid input removes red border and saves
- [ ] Grid cards show blue badge "Side 1" for Side 1
- [ ] Grid cards show purple badge "Side 2" for Side 2
- [ ] Grid cards show no badge for no side
- [ ] Export includes `side` field in JSON
- [ ] Import with missing `side` adds default
- [ ] Import with invalid `side` sanitizes to default
- [ ] Escape key reverts invalid input
- [ ] Enter key triggers blur/validation

## Code Locations Reference

| Component | File | Line Range (approx) | Purpose |
|-----------|------|---------------------|---------|
| DEFAULT_SONGS | App.jsx | ~46-54 | Add `side: ""` default |
| migrateSongs | App.jsx | ~1412-1459 | Add side migration |
| SongDetail (state) | App.jsx | ~922-935 | Add sideInput, isValidSide |
| SongDetail (handlers) | App.jsx | ~1195-1220 | Add validation logic |
| SongDetail (UI) | App.jsx | ~1342+ | Add input field |
| SongCard (badge) | App.jsx | ~783-799 | Add conditional badge display |

## Testing Script

**Quick Manual Test** (run in browser console after implementation):

```javascript
// Test 1: Verify migration adds side field
const stored = JSON.parse(localStorage.getItem('albumProgress_v3'));
console.assert(stored.songs[0].hasOwnProperty('side'), 'Missing side field');

// Test 2: Verify valid values only
const validValues = ["", "1", "2"];
const allValid = stored.songs.every(s => validValues.includes(s.side));
console.assert(allValid, 'Invalid side values detected');

// Test 3: Check export/import
const exported = JSON.stringify(stored, null, 2);
console.log('Export includes side:', exported.includes('"side"'));

console.log('All tests passed!');
```

## Troubleshooting

### Issue: Side input not saving

**Check**:
1. Is validation function returning true for your input?
2. Is `onUpdate` being called in `handleSideBlur`?
3. Check browser console for errors

### Issue: Badges not showing

**Check**:
1. Is `song.side` truthy? (Badge only shows when `song.side` is not empty)
2. Verify `song.side` has correct value ("1" or "2", not 1 or 2)
3. Check browser console for any React rendering errors

### Issue: Migration not working

**Check**:
1. Is migration code returning new object with `side` field?
2. Clear localStorage and test with fresh data
3. Check that migration runs before state initialization

### Issue: Red border stuck after fixing input

**Check**:
1. Is `setIsValidSide(true)` being called on valid input?
2. Is `useEffect` syncing `isValidSide` when song.side changes?

## Performance Notes

- Side input uses controlled component pattern (standard React)
- Validation runs only on blur (not on every keystroke)
- Grid re-renders only affected cards when side changes
- localStorage write triggered by existing `useEffect` in App component
- No performance degradation expected (~70 LOC added)

## Next Steps

After implementation:
1. Run `npm run lint` → Fix any ESLint warnings
2. Run `npm run build` → Verify production build succeeds
3. Manual testing → Follow validation checklist above
4. Git commit with message: `feat(010): add song side assignment`
5. Run `/speckit.tasks` to track remaining work (if any)

## Related Documentation

- [Feature Spec](./spec.md) - User requirements
- [Data Model](./data-model.md) - Song schema
- [Validation Contract](./contracts/side-validation.md) - Validation rules
- [Research](./research.md) - Design decisions
