# Quickstart: Testing Song Duration Tracking

**Feature**: 005-song-duration
**Date**: 2025-11-21
**Purpose**: Manual testing guide for duration display and editing functionality

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with DevTools enabled (Chrome, Firefox, Safari, Edge)
- 12 songs loaded in the application

---

## Test 1: Default Duration Display

**Goal**: Verify default duration shows for all songs

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **View Song Cards**
   - Observe all 12 song cards in the grid
   - ✅ **PASS**: Each card shows "Duration: 0:00" next to Tempo
   - ❌ **FAIL**: Duration missing or formatted incorrectly

3. **Check Formatting**
   - Verify format is "M:SS" (minutes:seconds with leading zero on seconds)
   - ✅ **PASS**: Default displays as "0:00" (not "0:0" or "00:00")
   - ❌ **FAIL**: Incorrect format

---

## Test 2: Edit Duration - Display Mode to Edit Mode

**Goal**: Verify clicking duration activates edit mode

### Steps

1. **Click on Duration Label**
   - Click on the text "Duration:" on any song card
   - ✅ **PASS**: Edit mode activates, showing two input fields: [0] : [00]
   - ❌ **FAIL**: Nothing happens, or different UI appears

2. **Click on Duration Value**
   - Cancel edit (press Escape)
   - Click on the "0:00" value itself
   - ✅ **PASS**: Edit mode activates with same two input fields
   - ❌ **FAIL**: Click doesn't activate edit mode

3. **Observe Input Fields**
   - Check that minutes field has focus (cursor blinking)
   - ✅ **PASS**: Minutes field is auto-focused, ready for input
   - ❌ **FAIL**: No field focused, or wrong field focused

---

## Test 3: Edit Duration - Valid Input

**Goal**: Verify valid duration values save correctly

### Steps

1. **Enter Valid Duration**
   - Click "Duration:" to edit
   - Type "3" in minutes field
   - Press Tab to move to seconds field
   - Type "45" in seconds field
   - ✅ **PASS**: Both values appear in inputs
   - ❌ **FAIL**: Values don't update or Tab doesn't work

2. **Save with Enter Key**
   - Press Enter
   - ✅ **PASS**: Edit mode closes, duration displays as "3:45"
   - ❌ **FAIL**: Edit mode doesn't close, or value incorrect

3. **Verify Persistence**
   - Refresh page (F5)
   - ✅ **PASS**: Duration still shows "3:45" after reload
   - ❌ **FAIL**: Duration reverted to "0:00"

---

## Test 4: Edit Duration - Save on Blur

**Goal**: Verify clicking outside saves changes automatically

### Steps

1. **Edit Duration**
   - Click "Duration:" to edit
   - Type "2" in minutes, "30" in seconds
   - Click anywhere outside the input fields (e.g., song title)
   - ✅ **PASS**: Edit mode closes, duration saves as "2:30"
   - ❌ **FAIL**: Edit mode stays open, or changes not saved

2. **Verify Immediate Save**
   - Check that value persisted without pressing Enter
   - ✅ **PASS**: Duration saved on blur
   - ❌ **FAIL**: Value reverted or not saved

---

## Test 5: Edit Duration - Cancel with Escape

**Goal**: Verify Escape key cancels editing without saving

### Steps

1. **Start Editing**
   - Click "Duration:" on a song with "3:45" duration
   - Change minutes to "5" and seconds to "15"
   - ✅ **PASS**: Inputs show "5" and "15"
   - ❌ **FAIL**: Values don't update

2. **Cancel Edit**
   - Press Escape key
   - ✅ **PASS**: Edit mode closes, duration still shows "3:45" (original value)
   - ❌ **FAIL**: Changes were saved, or edit mode didn't close

3. **Verify No Persistence**
   - Refresh page
   - ✅ **PASS**: Duration still "3:45" (changes weren't saved)
   - ❌ **FAIL**: Canceled changes persisted

---

## Test 6: Validation - Out of Range Minutes

**Goal**: Verify minutes > 59 are clamped to 59

### Steps

1. **Enter Large Minutes Value**
   - Click "Duration:" to edit
   - Type "99" in minutes field
   - Type "30" in seconds field
   - Press Enter
   - ✅ **PASS**: Duration saves as "59:30" (minutes clamped)
   - ❌ **FAIL**: Shows "99:30" or error message

2. **Enter Negative Minutes**
   - Edit duration again
   - Type "-5" in minutes field
   - Press Enter
   - ✅ **PASS**: Duration saves as "0:30" (clamped to 0)
   - ❌ **FAIL**: Shows negative value or error

---

## Test 7: Validation - Out of Range Seconds

**Goal**: Verify seconds > 59 are clamped to 59

### Steps

1. **Enter Large Seconds Value**
   - Click "Duration:" to edit
   - Type "3" in minutes field
   - Type "90" in seconds field
   - Press Enter
   - ✅ **PASS**: Duration saves as "3:59" (seconds clamped)
   - ❌ **FAIL**: Shows "3:90" or error message

2. **Enter Negative Seconds**
   - Edit duration again
   - Type "-10" in seconds field
   - Press Enter
   - ✅ **PASS**: Duration saves as "3:00" (seconds clamped to 0)
   - ❌ **FAIL**: Shows negative value or error

---

## Test 8: Validation - Non-Numeric Input

**Goal**: Verify non-numeric input is handled gracefully

### Steps

1. **Enter Letters in Minutes**
   - Click "Duration:" to edit
   - Type "abc" in minutes field
   - Type "30" in seconds field
   - Press Enter
   - ✅ **PASS**: Duration saves as "0:30" (letters treated as 0)
   - ❌ **FAIL**: Error message or crash

2. **Enter Special Characters**
   - Edit duration again
   - Type "!@#" in seconds field
   - Press Enter
   - ✅ **PASS**: Duration saves with seconds as "0" (special chars ignored)
   - ❌ **FAIL**: Error or unexpected behavior

---

## Test 9: Leading Zero Formatting

**Goal**: Verify seconds < 10 display with leading zero

### Steps

1. **Enter Single-Digit Seconds**
   - Click "Duration:" to edit
   - Type "2" in minutes field
   - Type "5" in seconds field
   - Press Enter
   - ✅ **PASS**: Duration displays as "2:05" (with leading zero)
   - ❌ **FAIL**: Shows "2:5" (missing leading zero)

2. **Verify All Single Digits**
   - Test with 0, 1, 2, ..., 9 seconds
   - ✅ **PASS**: All show leading zero (e.g., "3:00", "3:01", "3:09")
   - ❌ **FAIL**: Inconsistent formatting

---

## Test 10: Tab Navigation Between Fields

**Goal**: Verify Tab key moves between minutes and seconds inputs

### Steps

1. **Tab Forward**
   - Click "Duration:" to edit
   - Type "4" in minutes field
   - Press Tab
   - ✅ **PASS**: Focus moves to seconds field
   - ❌ **FAIL**: Tab doesn't work or wrong behavior

2. **Tab Backward**
   - While in seconds field, hold Shift and press Tab
   - ✅ **PASS**: Focus returns to minutes field
   - ❌ **FAIL**: Shift+Tab doesn't work

3. **Tab Out of Edit**
   - In seconds field, press Tab (without Shift)
   - ✅ **PASS**: Focus moves to next UI element, edit auto-saves
   - ❌ **FAIL**: Can't tab out, or edit doesn't save

---

## Test 11: Consistency in SongDetail (Zoom View)

**Goal**: Verify duration editing works identically in detail modal

### Steps

1. **Open SongDetail**
   - Click "Zoom" button on any song card
   - Modal opens with detailed view
   - ✅ **PASS**: Duration displays with same format as grid view
   - ❌ **FAIL**: Duration missing or formatted differently

2. **Edit in Detail View**
   - Click "Duration:" in modal
   - Edit to "5:45"
   - Press Enter
   - ✅ **PASS**: Edit works identically to grid view
   - ❌ **FAIL**: Different behavior or broken

3. **Verify Sync**
   - Click "Back to Grid" to close modal
   - ✅ **PASS**: Grid view shows updated "5:45" duration
   - ❌ **FAIL**: Changes not reflected in grid

4. **Edit in Grid, Verify in Detail**
   - Edit duration to "4:20" in grid view
   - Open Zoom view again
   - ✅ **PASS**: Detail view shows "4:20"
   - ❌ **FAIL**: Out of sync

---

## Test 12: Empty Field Handling

**Goal**: Verify empty inputs are treated as 0

### Steps

1. **Clear Minutes Field**
   - Click "Duration:" to edit
   - Select all in minutes field and delete
   - Type "30" in seconds field
   - Press Enter
   - ✅ **PASS**: Duration saves as "0:30" (empty minutes = 0)
   - ❌ **FAIL**: Error or NaN displayed

2. **Clear Seconds Field**
   - Edit duration again
   - Type "3" in minutes
   - Clear seconds field completely
   - Press Enter
   - ✅ **PASS**: Duration saves as "3:00" (empty seconds = 0)
   - ❌ **FAIL**: Error or incorrect format

---

## Test 13: Partial Edit (Only One Field Changed)

**Goal**: Verify editing only one field preserves the other

### Steps

1. **Set Initial Duration**
   - Click "Duration:" to edit
   - Set to "4:30"
   - Press Enter

2. **Edit Only Minutes**
   - Click "Duration:" to edit again
   - Change minutes to "7" (leave seconds as "30")
   - Press Enter
   - ✅ **PASS**: Duration saves as "7:30" (seconds preserved)
   - ❌ **FAIL**: Seconds changed or lost

3. **Edit Only Seconds**
   - Click "Duration:" to edit
   - Leave minutes as "7", change seconds to "15"
   - Press Enter
   - ✅ **PASS**: Duration saves as "7:15" (minutes preserved)
   - ❌ **FAIL**: Minutes changed or lost

---

## Test 14: Rapid Edits (Multiple Songs)

**Goal**: Verify editing multiple songs in quick succession works correctly

### Steps

1. **Edit Multiple Songs**
   - Edit Song 1 duration to "3:00"
   - Edit Song 2 duration to "4:15"
   - Edit Song 3 duration to "2:45"
   - (all in quick succession, no page refresh)
   - ✅ **PASS**: All edits save correctly, no conflicts
   - ❌ **FAIL**: Values overwrite each other or get lost

2. **Verify Persistence**
   - Refresh page
   - ✅ **PASS**: All three songs show correct durations
   - ❌ **FAIL**: Some durations lost or incorrect

---

## Test 15: Decimal Input Handling

**Goal**: Verify decimal values are truncated to integers

### Steps

1. **Enter Decimal Minutes**
   - Click "Duration:" to edit
   - Type "3.7" in minutes field
   - Type "45" in seconds field
   - Press Enter
   - ✅ **PASS**: Duration saves as "3:45" (decimal floored to 3)
   - ❌ **FAIL**: Shows "3.7" or rounds up to 4

2. **Enter Decimal Seconds**
   - Edit duration again
   - Type "5" in minutes
   - Type "8.9" in seconds
   - Press Enter
   - ✅ **PASS**: Duration saves as "5:08" (decimal floored to 8)
   - ❌ **FAIL**: Shows decimal or rounds incorrectly

---

## Test 16: Export/Import with Duration

**Goal**: Verify duration is included in JSON export

### Steps

1. **Set Durations**
   - Edit a few songs to have different durations (e.g., "3:30", "4:15", "2:00")

2. **Export JSON**
   - Use existing JSON export feature
   - Open exported JSON file
   - ✅ **PASS**: Each song has `duration: {minutes: N, seconds: NN}` field
   - ❌ **FAIL**: Duration field missing

3. **Import JSON**
   - Import the same JSON file back
   - ✅ **PASS**: All durations restored correctly
   - ❌ **FAIL**: Durations lost or corrupted

---

## Test 17: Backward Compatibility

**Goal**: Verify existing songs without duration get default value

### Steps

1. **Load Existing Data** (if you have old localStorage data)
   - Open app with localStorage from before duration feature
   - ✅ **PASS**: All songs show "Duration: 0:00" (default)
   - ❌ **FAIL**: Duration missing or errors

2. **First Edit Saves Default**
   - Edit any old song's duration
   - Check localStorage in DevTools (Application tab → Local Storage)
   - ✅ **PASS**: Song object now includes duration field
   - ❌ **FAIL**: Duration not persisted

---

## Test 18: Edge Case - 59:59 (Maximum)

**Goal**: Verify maximum valid duration displays and saves correctly

### Steps

1. **Set Maximum Duration**
   - Click "Duration:" to edit
   - Type "59" in minutes
   - Type "59" in seconds
   - Press Enter
   - ✅ **PASS**: Duration displays as "59:59"
   - ❌ **FAIL**: Value clamped or error

2. **Verify Persistence**
   - Refresh page
   - ✅ **PASS**: Duration still shows "59:59"
   - ❌ **FAIL**: Value changed

---

## Summary Checklist

After completing all tests, verify:

- [ ] Default duration "0:00" shows for all songs
- [ ] Click on label or value activates edit mode
- [ ] Two separate input fields for minutes and seconds
- [ ] Enter key saves, Escape key cancels
- [ ] Blur (click outside) auto-saves
- [ ] Minutes and seconds clamped to 0-59 range
- [ ] Non-numeric input handled gracefully (treated as 0)
- [ ] Seconds < 10 display with leading zero (e.g., "3:05")
- [ ] Tab navigates between minutes and seconds fields
- [ ] Duration editing works identically in SongDetail modal
- [ ] Empty fields treated as 0
- [ ] Partial edits preserve unchanged field
- [ ] Multiple rapid edits all save correctly
- [ ] Decimal inputs truncated to integers
- [ ] Duration included in JSON export
- [ ] Backward compatible with old data (default 0:00)
- [ ] Maximum duration 59:59 works correctly

All tests passing = ✅ **Feature ready for use**

---

## Common Issues

**Edit mode doesn't activate**:
- Check that `isEditingDuration` state is updating
- Verify onClick handlers attached to label and value
- Check browser console for errors

**Values don't save**:
- Verify `onUpdate` callback is called
- Check localStorage in DevTools (Application tab)
- Ensure validateDuration is clamping correctly

**Formatting incorrect**:
- Check `formatDuration` implementation
- Verify `padStart(2, '0')` is used for seconds
- Ensure no leading zero on minutes

**Tab navigation broken**:
- Verify input fields are in correct DOM order
- Check that tabIndex is not overridden
- Test in different browsers (tab behavior varies slightly)

**Persistence issues**:
- Check localStorage key `albumDashboard_songs`
- Verify JSON structure includes duration field
- Ensure useEffect is loading songs with default duration

**Inconsistency between views**:
- Compare SongCard and SongDetail implementations
- Ensure both use same helper functions
- Verify both call onUpdate identically
