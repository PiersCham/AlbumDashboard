# Quickstart: Testing Draft Song Status

**Feature**: 008-draft-song-status
**Date**: 2025-11-21
**Purpose**: Manual testing guide for draft song checkbox functionality

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with localStorage access (Chrome, Firefox, Safari, Edge)
- At least 2 songs in the song list (default: 12 songs)
- Feature 006 (Total Album Duration) implemented and working

---

## Test 1: Basic Draft Toggle

**Goal**: Verify checkbox toggles draft status and greys out song card

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **Locate Draft Checkbox**
   - Find any song card in the grid view
   - Look for checkbox in top-right corner of card
   - ✅ **PASS**: Checkbox visible and accessible
   - ❌ **FAIL**: Checkbox missing or misplaced

3. **Click Checkbox to Mark as Draft**
   - Click checkbox on "Song 1"
   - Observe visual change
   - ✅ **PASS**: Card appears greyed-out (reduced opacity)
   - ❌ **FAIL**: No visual change or checkbox doesn't toggle

4. **Verify Visual Styling**
   - Check that entire card has reduced opacity (~60%)
   - Verify title, tempo, key, duration, stages all greyed-out
   - ✅ **PASS**: All card elements visually dimmed
   - ❌ **FAIL**: Only part of card greyed or no visual change

5. **Uncheck Checkbox to Restore Normal**
   - Click checkbox again to uncheck
   - ✅ **PASS**: Card returns to full opacity (normal appearance)
   - ❌ **FAIL**: Card remains greyed or visual glitch

---

## Test 2: Total Duration Exclusion

**Goal**: Verify draft songs are excluded from total album duration calculation

### Steps

1. **Note Starting Total Duration**
   - Locate total duration in summary banner (Header component)
   - Example: "36m" or "1h 12m"
   - Record this value

2. **Check Song Duration**
   - Note the duration of "Song 1" (e.g., "3:45" = 3 minutes 45 seconds)

3. **Mark Song as Draft**
   - Click checkbox on "Song 1" to mark as draft
   - ✅ **PASS**: Song card greys out immediately

4. **Verify Total Duration Decreased**
   - Check total duration in summary banner
   - Calculate expected decrease (starting total - song 1 duration)
   - ✅ **PASS**: Total duration reduced by song 1's duration
   - ❌ **FAIL**: Total duration unchanged or incorrect

5. **Uncheck to Restore**
   - Uncheck "Song 1" draft checkbox
   - ✅ **PASS**: Total duration increases back to original value
   - ❌ **FAIL**: Total duration doesn't update or wrong value

---

## Test 3: Draft Status Persistence

**Goal**: Verify draft status persists across page refresh

### Steps

1. **Mark Multiple Songs as Draft**
   - Mark "Song 1", "Song 3", and "Song 5" as draft
   - Verify all three cards appear greyed-out
   - ✅ **PASS**: All marked songs greyed-out

2. **Note Visual State**
   - Confirm which songs are draft (checkboxes checked)
   - Confirm total duration reflects exclusion

3. **Refresh Page**
   - Press F5 or Ctrl+R to reload page
   - Wait for page to fully load

4. **Verify Draft Status Persisted**
   - Check that "Song 1", "Song 3", "Song 5" remain greyed-out
   - Check that their checkboxes remain checked
   - ✅ **PASS**: Draft status preserved after refresh
   - ❌ **FAIL**: Draft status lost or incorrect

5. **Verify Total Duration Persisted**
   - Check that total duration still excludes draft songs
   - ✅ **PASS**: Total duration matches pre-refresh value
   - ❌ **FAIL**: Total duration incorrect after refresh

---

## Test 4: Export/Import with Draft Songs

**Goal**: Verify draft status is included in export and restored on import

### Steps

1. **Mark Songs as Draft**
   - Mark "Song 2" and "Song 4" as draft
   - Verify both greyed-out

2. **Export Data**
   - Use existing export feature (ExportImport component)
   - Click export button, save JSON file to disk

3. **Inspect Exported JSON** (Optional)
   - Open exported JSON file in text editor
   - Find "Song 2" and "Song 4" objects
   - Verify `"isDraft": true` field present
   - ✅ **PASS**: isDraft field in JSON
   - ❌ **FAIL**: isDraft field missing

4. **Clear Data**
   - Open browser DevTools → Application → localStorage
   - Delete `albumProgress_v3` key
   - Refresh page to verify data cleared (songs reset to default)

5. **Import Data**
   - Use import feature, select previously saved JSON file
   - Wait for import to complete

6. **Verify Draft Status Restored**
   - Check "Song 2" and "Song 4" are greyed-out
   - Check checkboxes are checked
   - ✅ **PASS**: Draft status restored correctly
   - ❌ **FAIL**: Draft status lost or incorrect after import

---

## Test 5: Inline Editing with Draft Songs

**Goal**: Verify draft songs remain fully editable (title, tempo, key, duration)

### Steps

1. **Mark Song as Draft**
   - Mark "Song 3" as draft
   - Verify card greyed-out

2. **Edit Title**
   - Click on song title to enter edit mode
   - Change title to "Draft WIP"
   - Press Enter or click outside to save
   - ✅ **PASS**: Title updates successfully, card remains greyed
   - ❌ **FAIL**: Editing blocked or visual glitch

3. **Edit Tempo**
   - Click on tempo value to edit
   - Change tempo to 100 BPM
   - Save changes
   - ✅ **PASS**: Tempo updates, card remains greyed
   - ❌ **FAIL**: Tempo edit doesn't work

4. **Edit Duration**
   - Click on duration to edit
   - Change to 4 minutes 30 seconds
   - Save changes
   - ✅ **PASS**: Duration updates, card remains greyed
   - ❌ **FAIL**: Duration edit fails

5. **Verify Total Duration Unchanged**
   - Check total duration in summary banner
   - ✅ **PASS**: Total duration did NOT change (draft song excluded)
   - ❌ **FAIL**: Total duration incorrectly includes draft song

---

## Test 6: Drag-and-Drop with Draft Songs

**Goal**: Verify draft songs can be reordered and status persists

### Steps

1. **Mark Song as Draft**
   - Mark "Song 1" as draft
   - Verify greyed-out

2. **Drag Song Card**
   - Click and hold on "Song 1" card
   - Drag to position 5 (between Song 4 and Song 5)
   - ✅ **PASS**: Card drags normally, remains greyed during drag
   - ❌ **FAIL**: Drag blocked or visual corruption

3. **Drop Song Card**
   - Release mouse to drop at new position
   - ✅ **PASS**: Song reordered to position 5
   - ❌ **FAIL**: Reorder fails or wrong position

4. **Verify Draft Status Persisted**
   - Check that reordered song remains greyed-out
   - Check that checkbox remains checked
   - ✅ **PASS**: Draft status preserved after reorder
   - ❌ **FAIL**: Draft status lost during reorder

5. **Refresh Page**
   - Reload page to verify persistence
   - ✅ **PASS**: Song remains at position 5 with draft status
   - ❌ **FAIL**: Position or draft status lost

---

## Test 7: Zoom View Draft Checkbox

**Goal**: Verify draft checkbox appears in zoom view and syncs with grid view

### Steps

1. **Mark Song as Draft**
   - Mark "Song 2" as draft in grid view
   - Verify greyed-out

2. **Open Zoom View**
   - Click on "Song 2" card to open detail view
   - ✅ **PASS**: Zoom modal opens

3. **Locate Draft Checkbox in Zoom View**
   - Find draft checkbox in modal header
   - ✅ **PASS**: Checkbox visible and checked
   - ❌ **FAIL**: Checkbox missing or unchecked

4. **Uncheck in Zoom View**
   - Click checkbox in zoom view to uncheck
   - ✅ **PASS**: Checkbox unchecks

5. **Close Zoom View**
   - Close modal (click close button or outside modal)

6. **Verify Grid View Synced**
   - Check "Song 2" in grid view
   - ✅ **PASS**: Card no longer greyed-out, checkbox unchecked
   - ❌ **FAIL**: Grid view not updated

7. **Reverse Test: Mark in Zoom**
   - Open "Song 2" zoom view again
   - Check draft checkbox in zoom view
   - Close modal
   - ✅ **PASS**: Grid view updates to greyed-out
   - ❌ **FAIL**: Grid view not synced

---

## Test 8: All Songs Marked as Draft

**Goal**: Verify edge case where all songs are draft (total duration = 0)

### Steps

1. **Mark All Songs as Draft**
   - Click checkbox on all 12 song cards
   - Verify all cards greyed-out

2. **Check Total Duration**
   - View total duration in summary banner
   - ✅ **PASS**: Total duration displays "0m"
   - ❌ **FAIL**: Total duration shows non-zero or error

3. **Unmark One Song**
   - Uncheck checkbox on "Song 1"
   - ✅ **PASS**: Total duration updates to Song 1's duration only
   - ❌ **FAIL**: Total duration incorrect

4. **Restore Normal State**
   - Uncheck all draft checkboxes
   - ✅ **PASS**: Total duration returns to full album total
   - ❌ **FAIL**: Total duration corrupted

---

## Test 9: Rapid Checkbox Clicking

**Goal**: Verify smooth toggle behavior with rapid clicks

### Steps

1. **Rapid Toggle Test**
   - Click "Song 1" draft checkbox 10 times rapidly
   - Observe visual feedback and checkbox state

2. **Verify Final State**
   - After clicking stops, checkbox should be in stable state
   - ✅ **PASS**: Checkbox stable (checked or unchecked), no flickering
   - ❌ **FAIL**: Visual glitches or unstable state

3. **Verify Total Duration Correct**
   - Check total duration matches final checkbox state
   - If checked: duration excluded
   - If unchecked: duration included
   - ✅ **PASS**: Total duration correct
   - ❌ **FAIL**: Total duration out of sync

4. **Refresh Page**
   - Reload to verify final state persisted
   - ✅ **PASS**: Checkbox state and total duration correct after refresh
   - ❌ **FAIL**: Persistence corruption

---

## Test 10: Backward Compatibility

**Goal**: Verify old data without isDraft field defaults to non-draft

### Steps

1. **Export Current Data**
   - Export current album data as backup

2. **Create Old Format Data**
   - Open browser DevTools → Application → localStorage
   - Find `albumProgress_v3` key
   - Copy JSON value to text editor

3. **Remove isDraft Fields**
   - In text editor, search and delete all `"isDraft": true,` and `"isDraft": false,` lines
   - Copy modified JSON

4. **Import Old Format Data**
   - In DevTools localStorage, paste modified JSON (without isDraft fields)
   - Refresh page

5. **Verify Default Behavior**
   - Check all song cards appear normal (NOT greyed-out)
   - Check all checkboxes unchecked (default to non-draft)
   - ✅ **PASS**: All songs default to non-draft status
   - ❌ **FAIL**: Songs incorrectly greyed or checkboxes checked

6. **Verify Total Duration**
   - Check total duration includes all songs
   - ✅ **PASS**: Total duration correct (all songs counted)
   - ❌ **FAIL**: Total duration incorrect

7. **Restore Original Data**
   - Import original backup to restore state

---

## Test 11: Performance - Checkbox Response Time

**Goal**: Verify checkbox toggle feedback appears within 100ms (feels instant)

### Steps

1. **Visual Timing Test**
   - Click draft checkbox on any song
   - Observe time from click to visual feedback (greyed-out)
   - ✅ **PASS**: Greying appears instantly (<100ms, imperceptible delay)
   - ❌ **FAIL**: Noticeable lag (>200ms)

2. **Total Duration Update Timing**
   - Click checkbox, observe total duration update
   - ✅ **PASS**: Total duration updates in same visual frame
   - ❌ **FAIL**: Total duration updates with noticeable delay

3. **Multiple Rapid Toggles**
   - Click checkbox 5 times rapidly
   - ✅ **PASS**: All toggles respond smoothly, 60fps maintained
   - ❌ **FAIL**: Lag or framerate drops

---

## Test 12: Accessibility - Keyboard Navigation

**Goal**: Verify draft checkbox accessible via keyboard

### Steps

1. **Tab to Checkbox**
   - Press Tab key repeatedly to navigate to draft checkbox
   - ✅ **PASS**: Checkbox receives focus (visible focus indicator)
   - ❌ **FAIL**: Cannot reach checkbox via Tab

2. **Toggle with Spacebar**
   - With checkbox focused, press Spacebar
   - ✅ **PASS**: Checkbox toggles, card greys out
   - ❌ **FAIL**: Spacebar doesn't toggle

3. **Toggle Again**
   - Press Spacebar again to uncheck
   - ✅ **PASS**: Checkbox unchecks, card returns to normal
   - ❌ **FAIL**: Second toggle fails

---

## Summary Checklist

After completing all tests, verify:

- [ ] Checkbox toggles draft status (marks/unmarks)
- [ ] Draft songs appear greyed-out (reduced opacity)
- [ ] Draft songs excluded from total duration calculation
- [ ] Draft status persists across page refresh
- [ ] Draft status included in export/import (JSON schema)
- [ ] Draft songs remain fully editable (title, tempo, key, duration)
- [ ] Draft songs can be reordered via drag-and-drop
- [ ] Draft checkbox appears in zoom view and syncs with grid
- [ ] All songs draft = total duration "0m"
- [ ] Rapid checkbox clicking handles smoothly
- [ ] Old data without isDraft defaults to non-draft
- [ ] Checkbox response time <100ms (feels instant)
- [ ] Keyboard accessible (Tab + Spacebar)

All tests passing = ✅ **Feature ready for use**

---

## Common Issues

**Checkbox doesn't toggle**:
- Verify onChange handler wired correctly
- Check React DevTools for state updates
- Check browser console for errors

**Card doesn't grey out**:
- Verify `song.isDraft` state value in React DevTools
- Check className conditional includes `opacity-60`
- Inspect element CSS in browser DevTools

**Total duration doesn't update**:
- Verify useMemo dependency includes `songs` array
- Check filter logic: `songs.filter(song => !song.isDraft)`
- Verify Header component receives updated total

**Draft status doesn't persist**:
- Check localStorage updates in DevTools → Application tab
- Verify useEffect dependency includes `songs` array
- Check localStorage key is correct (`albumProgress_v3`)

**Export/import loses draft status**:
- Inspect exported JSON for `isDraft` field
- Verify import doesn't strip unknown fields
- Check JSON.parse/stringify preserves boolean values

**Zoom view checkbox doesn't sync**:
- Verify both grid and zoom use same `song` object reference
- Check onUpdate callback propagates changes to App state
- Verify React re-renders both views on state change
