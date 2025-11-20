# Quickstart: Testing Song Tempo and Key Attributes

**Feature**: 002-song-tempo-key
**Date**: 2025-11-19
**Purpose**: Manual testing guide for tempo validation, key selection, persistence, and export/import

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with localStorage enabled (Chrome, Firefox, Safari, Edge)
- Ability to open browser DevTools (F12)

---

## Test 1: Tempo Validation and Clamping

**Goal**: Verify tempo input accepts text, rounds decimals, clamps to 30-300 BPM range

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **Locate Tempo Input**
   - Find a song card
   - Look for tempo input field (should show "120 BPM" by default for new songs)

3. **Test Valid Integer Input**
   - Click tempo input field
   - Type "140"
   - Click outside field (blur)
   - ✅ **PASS**: Displays "140 BPM" (no change, valid)

4. **Test Decimal Input (Rounding)**
   - Click tempo input field
   - Type "135.5"
   - Click outside field
   - ✅ **PASS**: Displays "136 BPM" (rounded up)
   - ❌ **FAIL**: Shows "135.5" or "135"

5. **Test Decimal Input (Rounding Down)**
   - Type "135.4"
   - Click outside field
   - ✅ **PASS**: Displays "135 BPM" (rounded down)

6. **Test Clamping (Maximum)**
   - Type "500"
   - Click outside field
   - ✅ **PASS**: Displays "300 BPM" with brief border flash (visual feedback)
   - ❌ **FAIL**: Shows "500 BPM" or no visual feedback

7. **Test Clamping (Minimum)**
   - Type "10"
   - Click outside field
   - ✅ **PASS**: Displays "30 BPM" with brief border flash
   - ❌ **FAIL**: Shows "10 BPM" or no visual feedback

8. **Test Non-Numeric Input**
   - Type "abc" or "fast"
   - Click outside field
   - ✅ **PASS**: Displays "120 BPM" (default)
   - ❌ **FAIL**: Shows error or crashes

9. **Test Empty Input**
   - Clear the field (delete all text)
   - Click outside field
   - ✅ **PASS**: Displays "120 BPM" (default)

### Debug (if fails)

Open browser DevTools (F12) → Console:
```javascript
// Check song data in localStorage
const data = JSON.parse(localStorage.getItem('albumProgress_v3'));
console.log('Song tempos:', data.songs.map(s => s.tempo));

// Expected: All values should be integers between 30 and 300
```

---

## Test 2: Key Selection (Two-Step UI)

**Goal**: Verify two-step key selection (note + mode) works correctly

### Steps

1. **Locate Key Selection Dropdowns**
   - Find a song card
   - Look for two dropdowns: "Note" and "Mode"
   - Default should be "No Key" or blank state

2. **Test Selecting Note Only**
   - Select "A" from note dropdown
   - Mode dropdown should auto-select "Major" or remain enabled
   - ✅ **PASS**: Displays "A Major" (combined key)
   - ❌ **FAIL**: Only shows "A" or crashes

3. **Test Changing Mode**
   - With "A Major" selected, change mode to "Minor"
   - ✅ **PASS**: Displays "A Minor"
   - ❌ **FAIL**: Doesn't update or shows incorrect combination

4. **Test Enharmonic Normalization (Major)**
   - Select "C#/Db" from note dropdown
   - Select "Major" mode
   - ✅ **PASS**: Displays "Db Major" (not "C# Major")
   - ❌ **FAIL**: Shows "C# Major"

5. **Test Enharmonic Normalization (Minor)**
   - Select "C#/Db" from note dropdown
   - Select "Minor" mode
   - ✅ **PASS**: Displays "C# Minor" (not "Db Minor")
   - ❌ **FAIL**: Shows "Db Minor"

6. **Test Other Enharmonic Conversions**
   - Try "G#/Ab" + "Major" → should show "Ab Major"
   - Try "G#/Ab" + "Minor" → should show "G# Minor"
   - Try "F#/Gb" + "Major" → should show "F# Major"
   - ✅ **PASS**: All display conventional notation

7. **Test Clearing Key**
   - Select "No Key" from note dropdown
   - ✅ **PASS**: Key field is blank/empty
   - Mode dropdown should be disabled
   - ❌ **FAIL**: Shows "undefined" or crashes

### Debug (if fails)

Open browser DevTools (F12) → Console:
```javascript
// Check song keys in localStorage
const data = JSON.parse(localStorage.getItem('albumProgress_v3'));
console.log('Song keys:', data.songs.map(s => s.key));

// Expected: Strings like "F# Major", "C Minor", or null for blank
```

---

## Test 3: Tempo and Key Persist Across Sessions

**Goal**: Verify tempo and key survive page refresh and browser restart

### Steps

1. **Set Tempo and Key**
   - Select a song
   - Set tempo to "145"
   - Set key to "E Minor"
   - Verify both display correctly

2. **Refresh Page** (Ctrl+R or F5)
   - ✅ **PASS**: Song still shows "145 BPM" and "E Minor"
   - ❌ **FAIL**: Reverts to defaults (120 BPM, blank key)

3. **Close Browser Completely**
   - Close all browser windows/tabs
   - Reopen browser
   - Navigate to `http://localhost:5173`

4. **Verify Persistence**
   - ✅ **PASS**: Song still shows "145 BPM" and "E Minor"
   - ❌ **FAIL**: Data lost

### Debug (if fails)

Check `useEffect` persistence:
```javascript
// In src/App.jsx, should include songs in dependency array
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, targetISO, albumTitle }));
}, [songs, targetISO, albumTitle]); // ← songs array triggers save
```

---

## Test 4: Tempo and Key Included in Export

**Goal**: Verify JSON export contains tempo and key fields

### Steps

1. **Set Known Values**
   - Set first song: tempo "88", key "C Minor"
   - Set second song: tempo "140", key "A Major"

2. **Export Data**
   - Click "Export" button in header
   - Save file (e.g., `album_dashboard.json`)

3. **Open Exported File**
   - Open JSON file in text editor

4. **Verify Contents**
   ```json
   {
     "songs": [
       {
         "id": 1,
         "title": "Song 1",
         "stages": [...],
         "tempo": 88,           // ← CHECK THIS
         "key": "C Minor"       // ← CHECK THIS
       },
       {
         "id": 2,
         "title": "Song 2",
         "stages": [...],
         "tempo": 140,          // ← CHECK THIS
         "key": "A Major"       // ← CHECK THIS
       }
     ],
     "albumTitle": "...",
     "targetISO": "..."
   }
   ```
   - ✅ **PASS**: Both `tempo` and `key` fields exist with correct values
   - ❌ **FAIL**: Fields missing or incorrect

---

## Test 5: Import with Tempo and Key (Valid Data)

**Goal**: Verify importing JSON restores tempo and key

### Steps

1. **Prepare Test File**
   Create file `test_tempo_key.json`:
   ```json
   {
     "songs": [
       {
         "id": 1,
         "title": "Fast Song",
         "stages": [{ "name": "Demo", "value": 50 }],
         "tempo": 180,
         "key": "F# Major"
       },
       {
         "id": 2,
         "title": "Slow Song",
         "stages": [{ "name": "Demo", "value": 25 }],
         "tempo": 60,
         "key": "Bb Minor"
       }
     ],
     "albumTitle": "Test Album",
     "targetISO": "2026-08-01T00:00:00.000Z"
   }
   ```

2. **Clear Current State** (optional but recommended)
   - Open DevTools (F12) → Console
   - Run: `localStorage.removeItem('albumProgress_v3')`
   - Refresh page

3. **Import Test File**
   - Click "Import" button
   - Select `test_tempo_key.json`
   - Page should reload automatically

4. **Verify Restoration**
   - First song: ✅ "180 BPM", "F# Major"
   - Second song: ✅ "60 BPM", "Bb Minor"
   - ❌ **FAIL**: Shows defaults or different values

---

## Test 6: Import Legacy Data (Missing Tempo/Key)

**Goal**: Verify importing old JSON without tempo/key applies defaults

### Steps

1. **Prepare Legacy File**
   Create file `legacy_import.json`:
   ```json
   {
     "songs": [
       {
         "id": 1,
         "title": "Old Song",
         "stages": [{ "name": "Demo", "value": 75 }]
       }
     ],
     "albumTitle": "Legacy Album",
     "targetISO": "2026-08-01T00:00:00.000Z"
   }
   ```
   (Note: No `tempo` or `key` fields)

2. **Import Legacy File**
   - Click "Import"
   - Select `legacy_import.json`
   - Page reloads

3. **Verify Defaults Applied**
   - Song should show: ✅ "120 BPM" (default tempo)
   - Song should show: ✅ Blank key or "No key" (default key)
   - ❌ **FAIL**: Shows error or crashes

### Debug (if fails)

Check `migrateSongs` function:
```javascript
// In src/App.jsx, should add defaults for missing fields
const migrateSongs = (songs) => {
  return songs.map(song => ({
    ...song,
    tempo: typeof song.tempo === 'number' ? song.tempo : 120,  // ← Default
    key: typeof song.key === 'string' ? song.key : null        // ← Default
  }));
};
```

---

## Test 7: Import Invalid Tempo/Key Data

**Goal**: Verify importing corrupt data uses defaults instead of crashing

### Steps

1. **Prepare Corrupt File**
   Create file `corrupt_import.json`:
   ```json
   {
     "songs": [
       {
         "id": 1,
         "title": "Corrupt Song",
         "stages": [{ "name": "Demo", "value": 50 }],
         "tempo": "very fast",
         "key": 440
       },
       {
         "id": 2,
         "title": "Out of Range",
         "stages": [],
         "tempo": 500,
         "key": ""
       }
     ],
     "albumTitle": "Corrupt Album",
     "targetISO": "2026-08-01T00:00:00.000Z"
   }
   ```

2. **Import Corrupt File**
   - Click "Import"
   - Select `corrupt_import.json`
   - Page reloads (should not crash)

3. **Verify Graceful Degradation**
   - First song: ✅ "120 BPM" (invalid "very fast" → default), blank key (invalid 440 → null)
   - Second song: ✅ "120 BPM" (out of range 500 → default), blank key (empty string → null)
   - ❌ **FAIL**: Application crashes or shows error modal

---

## Test 8: Visual Feedback on Clamping

**Goal**: Verify border flash animation occurs when tempo is clamped

### Steps

1. **Test Clamp with Visual Feedback**
   - Set tempo to "500"
   - Click outside field
   - 👁️ **Watch for**: Brief border color change (amber/yellow) and animation
   - ✅ **PASS**: Border flashes for ~500ms
   - ❌ **FAIL**: No visual change

2. **Test No Feedback on Valid Input**
   - Set tempo to "140" (valid, no clamp)
   - Click outside field
   - 👁️ **Watch for**: No border animation
   - ✅ **PASS**: No visual feedback (silent success)
   - ❌ **FAIL**: Border flashes even though input was valid

### Debug (if fails)

Check visual feedback implementation:
```javascript
// Should use state to trigger animation
const [showTempoFeedback, setShowTempoFeedback] = useState(false);

const handleTempoBlur = () => {
  const validated = validateTempo(tempoInput);
  const wasClamped = validated !== parseFloat(tempoInput);

  if (wasClamped) {
    setShowTempoFeedback(true);
    setTimeout(() => setShowTempoFeedback(false), 500);
  }
};

// In JSX
<input
  className={`... ${showTempoFeedback ? 'border-amber-500 animate-pulse' : ''}`}
  // ...
/>
```

---

## Summary Checklist

After completing all tests, verify:

- [ ] Tempo validation: accepts text, rounds decimals, clamps to 30-300
- [ ] Visual feedback: border flashes on clamp, silent on valid input
- [ ] Key selection: two-step UI (note + mode)
- [ ] Enharmonic normalization: Db Major, C# Minor, Ab Major, G# Minor, etc.
- [ ] Persistence: tempo and key survive page refresh and browser restart
- [ ] Export: JSON includes tempo and key fields
- [ ] Import (valid): restores tempo and key from JSON
- [ ] Import (legacy): applies defaults (120 BPM, null key) for missing fields
- [ ] Import (corrupt): gracefully handles invalid data without crashing

All tests passing = ✅ **Feature ready for use**

---

## Common Issues

**Tempo doesn't persist**:
- Check `useEffect` includes `songs` in dependency array
- Verify localStorage has `albumProgress_v3` key with songs array

**Key normalization wrong**:
- Check `normalizeNote()` function logic
- Verify `NOTES` constant uses correct sharp/flat values

**Import crashes**:
- Check `migrateSongs()` handles missing/invalid tempo and key
- Verify type checks use `typeof` operator correctly

**Visual feedback not working**:
- Check `showTempoFeedback` state is toggled correctly
- Verify Tailwind classes (`border-amber-500`, `animate-pulse`) are applied
- Confirm 500ms timeout clears the feedback state
