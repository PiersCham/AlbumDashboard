# Quickstart: Testing Draft-Aware Song Count and Progress

**Feature**: 009-draft-song-count
**Date**: 2025-11-21
**Purpose**: Manual testing guide for draft-aware song count and overall progress metrics

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with DevTools (Chrome, Firefox, Safari, Edge)
- Feature 008 (Draft Song Status) implemented and working
- At least 12 songs in the dashboard (default state)
- Ability to mark songs as draft via SongDetail view (click "Zoom" → toggle "Draft" checkbox)

---

## Test 1: Basic Song Count Display

**Goal**: Verify song count updates when marking songs as draft

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **Note Initial Song Count**
   - Look at header section (top of page)
   - Find the "X/Y" display (e.g., "0/12" if no songs completed)
   - ✅ **PASS**: Denominator shows "12" (total non-draft songs)
   - ❌ **FAIL**: Denominator shows different number

3. **Mark One Song as Draft**
   - Click "Zoom" button on "Song 1" card
   - In detail view, check the "Draft" checkbox next to "Back to Grid"
   - Click "Back to Grid" to return to main view
   - ✅ **PASS**: Song count denominator decreases to "11" (e.g., "0/11")
   - ❌ **FAIL**: Denominator remains "12" or shows incorrect value

4. **Mark Two More Songs as Draft**
   - Repeat step 3 for "Song 2" and "Song 3"
   - ✅ **PASS**: Denominator shows "9" (12 - 3 = 9)
   - ❌ **FAIL**: Denominator incorrect or doesn't update

5. **Unmark One Draft Song**
   - Open "Song 1" detail view
   - Uncheck "Draft" checkbox
   - Return to grid view
   - ✅ **PASS**: Denominator increases to "10" (9 + 1 = 10)
   - ❌ **FAIL**: Denominator doesn't increase

---

## Test 2: Eligible Song Count (Numerator)

**Goal**: Verify eligible count (≥90% complete songs) only counts non-draft songs

### Steps

1. **Complete Two Non-Draft Songs**
   - Open "Song 4" detail view (not marked as draft)
   - Set all stage progress bars to 100%
   - Return to grid and repeat for "Song 5"
   - ✅ **PASS**: Numerator shows "2" (e.g., "2/10" if 10 non-draft songs)
   - ❌ **FAIL**: Numerator doesn't update or shows wrong count

2. **Complete a Draft Song**
   - Open "Song 1" detail view (currently marked as draft)
   - Set all stage progress to 100%
   - Return to grid view
   - ✅ **PASS**: Numerator still shows "2" (draft song excluded from count)
   - ❌ **FAIL**: Numerator increases to "3" (incorrectly counts draft song)

3. **Unmark Completed Draft Song**
   - Open "Song 1" detail view
   - Uncheck "Draft" checkbox (Song 1 is still 100% complete)
   - Return to grid view
   - ✅ **PASS**: Numerator increases to "3" (now counts Song 1)
   - ✅ **PASS**: Denominator increases by 1 (Song 1 now non-draft)
   - ❌ **FAIL**: Numerator doesn't update or incorrect value

---

## Test 3: Overall Progress Calculation

**Goal**: Verify overall progress bar reflects only non-draft songs' average

### Steps

1. **Note Starting Overall Progress**
   - Look at the large progress bar below the header
   - Note the percentage displayed in the center (e.g., "42%")
   - Record this value: ____%

2. **Calculate Expected Change**
   - Identify a non-draft song with 50% progress (e.g., "Song 6")
   - Note current overall progress (from step 1)
   - Mark "Song 6" as draft
   - Expected: Overall progress should recalculate without Song 6

3. **Mark Mid-Progress Song as Draft**
   - Open "Song 6" detail view (should have ~50% progress)
   - Check "Draft" checkbox
   - Return to grid view
   - ✅ **PASS**: Overall progress percentage changes (recalculated)
   - ❌ **FAIL**: Percentage remains identical (draft song still counted)

4. **Verify Calculation Excludes Draft**
   - If starting overall was 50% and you marked a 50% song as draft:
     - New overall depends on remaining songs' average
   - Use browser DevTools console:
     ```javascript
     // Check non-draft songs average manually
     songs.filter(s => !s.isDraft).forEach(s => {
       const avg = s.stages.reduce((a, st) => a + st.value, 0) / s.stages.length;
       console.log(s.title, Math.round(avg));
     });
     ```
   - ✅ **PASS**: Overall progress matches average of non-draft songs
   - ❌ **FAIL**: Overall progress includes draft songs in calculation

---

## Test 4: Edge Case - All Songs Draft

**Goal**: Verify graceful handling when all songs marked as draft

### Steps

1. **Mark All 12 Songs as Draft**
   - Go through each song and check "Draft" checkbox
   - Verify all 12 song cards appear greyed-out in grid view
   - ✅ **PASS**: All cards visually greyed (opacity-60)

2. **Check Song Count Display**
   - Look at header "X/Y" display
   - ✅ **PASS**: Shows "0/0" (zero eligible, zero total non-draft)
   - ❌ **FAIL**: Shows non-zero values or error

3. **Check Overall Progress Display**
   - Look at overall progress bar
   - ✅ **PASS**: Shows "0%" (empty array average = 0)
   - ❌ **FAIL**: Shows non-zero percentage or error

4. **Verify No Console Errors**
   - Open browser DevTools → Console tab
   - ✅ **PASS**: No errors or warnings related to metrics
   - ❌ **FAIL**: Errors like "Cannot read property of undefined" or "Division by zero"

5. **Restore One Non-Draft Song**
   - Open any song detail view
   - Uncheck "Draft" checkbox
   - Return to grid view
   - ✅ **PASS**: Song count shows "0/1", overall progress recalculates
   - ❌ **FAIL**: Metrics don't update or show incorrect values

---

## Test 5: Rapid Draft Toggling

**Goal**: Verify smooth performance when rapidly changing draft status

### Steps

1. **Rapid Toggle Test**
   - Open "Song 1" detail view
   - Rapidly click "Draft" checkbox 10 times (toggle on/off/on/off...)
   - Observe header song count and overall progress bar

2. **Verify Visual Smoothness**
   - ✅ **PASS**: UI updates smoothly, no flickering or lag
   - ❌ **FAIL**: Visible lag (>200ms), UI freezes, or visual glitches

3. **Verify Final State Correct**
   - After rapid toggling, checkbox should be in stable state (checked or unchecked)
   - Return to grid view
   - ✅ **PASS**: Song count and overall progress match final checkbox state
   - ❌ **FAIL**: Metrics out of sync with checkbox state

4. **Rapid Multi-Song Toggle**
   - Quickly mark 5 different songs as draft in sequence (within 10 seconds)
   - ✅ **PASS**: All 5 updates reflected in metrics, no lag
   - ❌ **FAIL**: Metrics freeze or show intermediate incorrect values

---

## Test 6: Overall Progress Calculation Accuracy

**Goal**: Verify overall progress percentage calculates correctly with specific song values

### Steps

1. **Setup Known Progress Values**
   - Reset all songs to non-draft status
   - Set exactly 6 songs to 100% progress (all stages complete)
   - Set exactly 6 songs to 0% progress (all stages empty)
   - Expected overall: (6×100 + 6×0) / 12 = 50%

2. **Verify 50% Overall Progress**
   - Look at overall progress bar
   - ✅ **PASS**: Shows "50%" (or "49%" / "51%" due to rounding)
   - ❌ **FAIL**: Shows significantly different percentage

3. **Mark All Zero-Progress Songs as Draft**
   - Mark the 6 songs at 0% as draft
   - Expected overall: (6×100) / 6 = 100%

4. **Verify 100% Overall Progress**
   - ✅ **PASS**: Overall progress jumps to "100%"
   - ❌ **FAIL**: Percentage doesn't reach 100% or incorrect value

5. **Test Fractional Rounding**
   - Set 3 non-draft songs to these exact values:
     - Song A: 33% (set stages manually to average 33%)
     - Song B: 33%
     - Song C: 34%
   - Expected overall: (33 + 33 + 34) / 3 = 33.333... ≈ 33%
   - ✅ **PASS**: Displays "33%" (Math.round applied)
   - ❌ **FAIL**: Displays "33.3%" or incorrect rounding

---

## Test 7: Performance Timing Validation

**Goal**: Verify metric updates occur within 100ms (SC-001, SC-004)

### Steps

1. **Setup Performance Monitoring**
   - Open browser DevTools → Console
   - Run this code to measure update time:
     ```javascript
     const start = performance.now();
     // (User action: toggle draft checkbox)
     setTimeout(() => {
       const elapsed = performance.now() - start;
       console.log(`Update time: ${elapsed.toFixed(2)}ms`);
     }, 0);
     ```

2. **Toggle Draft Status and Measure**
   - Execute monitoring code
   - Toggle draft checkbox on a song
   - Check console output
   - ✅ **PASS**: Elapsed time < 100ms
   - ❌ **FAIL**: Elapsed time > 100ms (performance regression)

3. **Visual "Instant" Feel**
   - Toggle draft status without DevTools
   - Observe header metrics update
   - ✅ **PASS**: Update feels instant (imperceptible delay)
   - ❌ **FAIL**: Noticeable lag (human-perceptible delay >200ms)

---

## Test 8: Persistence Across Refresh

**Goal**: Verify draft status persists and metrics recalculate correctly after page reload

### Steps

1. **Setup Draft State**
   - Mark 3 songs as draft
   - Note song count (e.g., "2/9") and overall progress (e.g., "54%")

2. **Refresh Page**
   - Press F5 or Ctrl+R to reload
   - Wait for page to fully load

3. **Verify Metrics Persist**
   - ✅ **PASS**: Song count matches pre-refresh value (e.g., "2/9")
   - ✅ **PASS**: Overall progress matches pre-refresh value (e.g., "54%")
   - ❌ **FAIL**: Metrics revert to including draft songs (indicates calculation bug)

---

## Test 9: Export/Import with Draft Songs

**Goal**: Verify draft status exports and metrics recalculate after import

### Steps

1. **Setup and Export**
   - Mark 4 songs as draft
   - Note song count (e.g., "1/8") and overall progress (e.g., "38%")
   - Click "Export" button, save JSON file

2. **Inspect Exported JSON (Optional)**
   - Open exported JSON in text editor
   - Verify 4 songs have `"isDraft": true`
   - ✅ **PASS**: isDraft field present in JSON

3. **Clear Data**
   - Open DevTools → Application → localStorage
   - Delete `albumProgress_v3` key
   - Refresh page (data should reset to defaults)

4. **Import Previous Data**
   - Click "Import" button
   - Select previously exported JSON file
   - Page will reload

5. **Verify Metrics Restored**
   - ✅ **PASS**: Song count shows "1/8" (matches pre-export)
   - ✅ **PASS**: Overall progress shows "38%" (matches pre-export)
   - ✅ **PASS**: 4 songs appear greyed-out (draft status restored)
   - ❌ **FAIL**: Metrics incorrect or draft songs not excluded

---

## Test 10: Draft Song Progress Changes Don't Affect Overall

**Goal**: Verify changing progress on draft songs doesn't update overall progress

### Steps

1. **Mark Song as Draft**
   - Open "Song 7" detail view
   - Check "Draft" checkbox
   - Set all stages to 0% progress (if not already)
   - Note current overall progress (e.g., "52%")

2. **Change Draft Song Progress**
   - With "Song 7" still in detail view (and draft checked)
   - Set all stages to 100% progress
   - Return to grid view
   - ✅ **PASS**: Overall progress remains "52%" (unchanged)
   - ❌ **FAIL**: Overall progress increases (draft song incorrectly counted)

3. **Unmark Draft Song**
   - Open "Song 7" detail view again
   - Uncheck "Draft" checkbox (Song 7 now 100% complete)
   - Return to grid view
   - ✅ **PASS**: Overall progress increases (now includes Song 7's 100%)
   - ❌ **FAIL**: Overall progress doesn't update

---

## Test 11: Boundary Testing - 90% Threshold

**Goal**: Verify eligible count correctly uses 90% threshold for non-draft songs

### Steps

1. **Setup Songs Near Threshold**
   - Reset to 3 non-draft songs (mark others as draft for simplicity)
   - Song A: 89% progress (just below threshold)
   - Song B: 90% progress (exactly at threshold)
   - Song C: 91% progress (just above threshold)

2. **Verify Eligible Count**
   - Look at song count numerator
   - ✅ **PASS**: Shows "2" (Songs B and C counted, Song A excluded)
   - ❌ **FAIL**: Shows "3" (incorrectly counts 89%) or "1" (excludes 90%)

3. **Cross Threshold Upward**
   - Open Song A detail view
   - Increase progress to 90%
   - Return to grid view
   - ✅ **PASS**: Numerator increases to "3"
   - ❌ **FAIL**: Numerator doesn't update

4. **Cross Threshold Downward**
   - Open Song B detail view
   - Decrease progress to 89%
   - Return to grid view
   - ✅ **PASS**: Numerator decreases to "2"
   - ❌ **FAIL**: Numerator remains "3"

---

## Summary Checklist

After completing all tests, verify:

- [ ] Song count denominator reflects only non-draft songs
- [ ] Song count numerator counts only non-draft songs ≥90%
- [ ] Overall progress excludes draft songs from calculation
- [ ] All songs draft edge case displays "0/0" and "0%"
- [ ] Rapid toggling performs smoothly (<100ms updates)
- [ ] Overall progress calculation accurate with known values
- [ ] Rounding works correctly (Math.round, integer display)
- [ ] Metrics persist across page refresh
- [ ] Export/import preserves draft status and metrics
- [ ] Draft songs' progress changes don't affect overall progress
- [ ] Eligible count uses 90% threshold correctly

All tests passing = ✅ **Feature ready for production**

---

## Common Issues

**Song count doesn't update**:
- Verify React DevTools shows songs array changing when draft toggled
- Check browser console for errors
- Verify nonDraftSongs variable calculated in Header component

**Overall progress doesn't exclude drafts**:
- Verify albumAverage receives filtered songs, not full songs array
- Check App.jsx line ~1559 for filter before albumAverage call
- Inspect React component tree to ensure re-render triggered

**"0/0" shows as "NaN/NaN" or error**:
- Check albumAverage function handles empty array (should return 0)
- Verify nonDraftSongs.length used for denominator, not hardcoded 13
- Check console for division by zero errors

**Performance lag (>100ms)**:
- Verify filter operation not duplicated (should happen once per render)
- Check for unnecessary re-renders (React DevTools Profiler)
- Ensure useMemo used if multiple calculations on nonDraftSongs

**Metrics don't persist after refresh**:
- Verify isDraft field saves to localStorage (should already work from feature 008)
- Check localStorage in DevTools → Application tab for albumProgress_v3 key
- Verify songs array includes isDraft field after load

---

## Developer Notes

**Manual Testing Justification** (per constitution):
- Feature is UI-centric (visual metrics display)
- Performance validated via browser DevTools timing
- No complex business logic (simple filter + existing average function)
- Automated tests would test React rendering, not user-visible behavior

**Test Data Setup**:
Use browser console to quickly set up test scenarios:

```javascript
// Mark specific songs as draft
songs[0].isDraft = true;
songs[1].isDraft = true;
songs[2].isDraft = true;
setSongs([...songs]);

// Set specific progress values
songs[3].stages.forEach(s => s.value = 100);
songs[4].stages.forEach(s => s.value = 0);
setSongs([...songs]);

// Reset all to non-draft
songs.forEach(s => s.isDraft = false);
setSongs([...songs]);
```

**Performance Benchmarking**:
```javascript
// Measure filter + calc time
console.time('metrics');
const nds = songs.filter(s => !s.isDraft);
const avg = albumAverage(nds);
const elig = eligibleCount(nds, 90);
console.timeEnd('metrics');
// Expected: <3ms
```
