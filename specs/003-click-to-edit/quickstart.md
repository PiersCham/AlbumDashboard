# Quickstart: Testing Click-to-Edit Tempo and Key Fields

**Feature**: 003-click-to-edit
**Date**: 2025-11-19
**Purpose**: Manual testing guide for click-to-edit functionality, keyboard navigation, and accessibility

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with DevTools enabled (Chrome, Firefox, Safari, Edge)
- Songs with tempo and key already set (use Feature 002 data)

---

## Test 1: Display Mode (Default State)

**Goal**: Verify tempo and key display as read-only text by default

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **Locate Tempo and Key Fields**
   - Find any song card in the list
   - Look for "Tempo" and "Key" labels with values below them

3. **Verify Read-Only Display**
   - Tempo should show as plain text: "120 BPM" (no input border)
   - Key should show as plain text: "C Major" or "No key" (no dropdown)
   - ✅ **PASS**: Values display as plain text, not input fields
   - ❌ **FAIL**: Input fields or dropdowns visible by default

4. **Attempt to Type in Display Area**
   - Click directly on the tempo value text ("120 BPM")
   - Try typing on the keyboard
   - ✅ **PASS**: Nothing happens, no cursor appears, text not editable
   - ❌ **FAIL**: Cursor appears or text becomes editable

5. **Verify Visual Cleanliness**
   - Compare to previous feature 002 implementation (always-editable inputs)
   - ✅ **PASS**: Display mode has less visual noise (no borders, cleaner look)
   - ❌ **FAIL**: Still looks cluttered with borders/dropdowns

---

## Test 2: Click Label to Edit Tempo

**Goal**: Verify clicking "Tempo" label enters edit mode

### Steps

1. **Click Tempo Label**
   - Locate the "Tempo" label text
   - Click directly on the label (not the value)
   - ✅ **PASS**: Input field appears with current tempo value, cursor auto-focused
   - ❌ **FAIL**: No change, or wrong field opens

2. **Verify Auto-Focus**
   - Input field should have cursor blinking inside
   - You should be able to type immediately without clicking the input
   - ✅ **PASS**: Cursor auto-focused in input field
   - ❌ **FAIL**: Must click input to type

3. **Edit Tempo Value**
   - Type a new value (e.g., "145")
   - ✅ **PASS**: Value updates as you type
   - ❌ **FAIL**: Typing does nothing

4. **Save by Blurring (Click Outside)**
   - Click anywhere outside the input field
   - ✅ **PASS**: Input disappears, displays "145 BPM" as plain text
   - ❌ **FAIL**: Input remains, or value not saved

5. **Verify Persistence**
   - Refresh the page (F5)
   - ✅ **PASS**: Tempo still shows "145 BPM"
   - ❌ **FAIL**: Reverts to previous value

---

## Test 3: Click Label to Edit Key

**Goal**: Verify clicking "Key" label enters edit mode

### Steps

1. **Click Key Label**
   - Locate the "Key" label text
   - Click directly on the label
   - ✅ **PASS**: Two dropdowns appear (note and mode), note dropdown auto-focused
   - ❌ **FAIL**: No dropdowns appear, or tempo input opens instead

2. **Verify Pre-Selected Values**
   - If key was "F# Major", note dropdown shows "F#/Gb", mode shows "Major"
   - If key was null, note dropdown shows "No Key", mode is disabled
   - ✅ **PASS**: Current key values pre-selected in dropdowns
   - ❌ **FAIL**: Dropdowns empty or wrong values selected

3. **Change Note Selection**
   - Select a different note (e.g., "E")
   - ✅ **PASS**: Note updates in dropdown
   - ❌ **FAIL**: Selection doesn't change

4. **Change Mode Selection**
   - Select "Minor" from mode dropdown
   - ✅ **PASS**: Mode updates
   - ❌ **FAIL**: Mode doesn't change or dropdown disabled

5. **Save by Blurring**
   - Click outside the dropdowns
   - ✅ **PASS**: Dropdowns disappear, displays "E Minor" as plain text
   - ❌ **FAIL**: Dropdowns remain visible

6. **Verify Enharmonic Normalization**
   - Edit key again, select "C#/Db" and "Major"
   - Blur the field
   - ✅ **PASS**: Displays "Db Major" (not "C# Major")
   - ❌ **FAIL**: Shows "C# Major" or incorrect normalization

---

## Test 4: Keyboard Navigation (Enter Key Saves)

**Goal**: Verify Enter key saves edits

### Steps

1. **Enter Tempo Edit Mode**
   - Click "Tempo" label
   - Type a new value (e.g., "132")

2. **Press Enter Key**
   - While focused in tempo input, press Enter
   - ✅ **PASS**: Input disappears, displays "132 BPM", edit mode exits
   - ❌ **FAIL**: Nothing happens, or form submission occurs

3. **Enter Key Edit Mode**
   - Click "Key" label
   - Select "G" and "Major"

4. **Press Enter Key**
   - While focused in mode dropdown, press Enter
   - ✅ **PASS**: Dropdowns disappear, displays "G Major", edit mode exits
   - ❌ **FAIL**: Dropdowns remain or nothing happens

---

## Test 5: Keyboard Navigation (Escape Key Cancels)

**Goal**: Verify Escape key discards changes

### Steps

1. **Enter Tempo Edit Mode**
   - Click "Tempo" label
   - Current value: "132 BPM"
   - Type "999" (invalid value that would clamp to 300)

2. **Press Escape Key**
   - While focused in tempo input, press Escape
   - ✅ **PASS**: Input disappears, displays original "132 BPM" (not 300)
   - ❌ **FAIL**: Shows "300 BPM" (validated) or input remains

3. **Enter Key Edit Mode**
   - Click "Key" label
   - Current value: "G Major"
   - Select "A" and "Minor"

4. **Press Escape Key**
   - While focused in mode dropdown, press Escape
   - ✅ **PASS**: Dropdowns disappear, displays original "G Major" (not A Minor)
   - ❌ **FAIL**: Shows "A Minor" (saved) or dropdowns remain

---

## Test 6: Multi-Field Editing (Auto-Save Behavior)

**Goal**: Verify opening a new field auto-saves the current field

### Steps

1. **Enter Tempo Edit Mode**
   - Click "Tempo" label
   - Type "88"
   - Do NOT blur or press Enter (leave input active)

2. **Click Key Label While Tempo is Still Editing**
   - Click "Key" label without saving tempo first
   - ✅ **PASS**: Tempo input disappears, "88 BPM" displayed, key dropdowns appear
   - ❌ **FAIL**: Tempo input remains, or tempo value lost

3. **Verify Tempo Was Auto-Saved**
   - Check that tempo display shows "88 BPM" (not previous value)
   - ✅ **PASS**: Tempo saved automatically when key edit opened
   - ❌ **FAIL**: Tempo reverted to previous value

4. **Reverse Test: Key to Tempo**
   - Select "D" and "Minor" in key dropdowns
   - Without blurring, click "Tempo" label
   - ✅ **PASS**: Key dropdowns disappear, "D Minor" displayed, tempo input appears
   - ❌ **FAIL**: Key dropdowns remain, or key value lost

---

## Test 7: Validation Preserved (Tempo Clamping)

**Goal**: Verify existing validation logic still works

### Steps

1. **Enter Tempo Edit Mode**
   - Click "Tempo" label

2. **Enter Out-of-Range Value**
   - Type "500"
   - Blur the input (click outside)

3. **Verify Clamping with Visual Feedback**
   - ✅ **PASS**: Displays "300 BPM" (clamped), border flashes amber briefly
   - ❌ **FAIL**: Shows "500 BPM", no visual feedback, or crashes

4. **Test Lower Boundary**
   - Edit tempo again, type "10"
   - Blur the input
   - ✅ **PASS**: Displays "30 BPM" (clamped), border flashes
   - ❌ **FAIL**: Shows "10 BPM" or no feedback

5. **Test Non-Numeric Input**
   - Edit tempo, type "fast"
   - Blur the input
   - ✅ **PASS**: Displays "120 BPM" (default), no crash
   - ❌ **FAIL**: Shows error, crashes, or shows "NaN"

---

## Test 8: Validation Preserved (Key Normalization)

**Goal**: Verify existing key normalization still works

### Steps

1. **Test Major Mode Normalization**
   - Click "Key" label
   - Select "G#/Ab" and "Major"
   - Blur dropdowns
   - ✅ **PASS**: Displays "Ab Major" (normalized)
   - ❌ **FAIL**: Shows "G# Major"

2. **Test Minor Mode Normalization**
   - Edit key, select "C#/Db" and "Minor"
   - Blur dropdowns
   - ✅ **PASS**: Displays "C# Minor" (normalized)
   - ❌ **FAIL**: Shows "Db Minor"

3. **Test Clearing Key**
   - Edit key, select "No Key" from note dropdown
   - ✅ **PASS**: Key displays "No key" or blank, mode dropdown disables
   - ❌ **FAIL**: Shows error or dropdown breaks

---

## Test 9: Accessibility (Keyboard-Only Navigation)

**Goal**: Verify feature is fully usable without mouse

### Steps

1. **Tab to Tempo Label**
   - Use Tab key to navigate to tempo label
   - ✅ **PASS**: Label receives focus (outline visible)
   - ❌ **FAIL**: Cannot focus label with keyboard

2. **Enter Edit Mode with Enter Key**
   - Press Enter while label is focused
   - ✅ **PASS**: Input appears and is auto-focused
   - ❌ **FAIL**: Must click with mouse

3. **Tab to Key Label**
   - Press Tab to move to key label
   - ✅ **PASS**: Key label receives focus
   - ❌ **FAIL**: Cannot focus key label

4. **Complete Full Keyboard Workflow**
   - Tab to tempo label → Enter to edit → Type value → Enter to save
   - Tab to key label → Enter to edit → Arrow keys to select → Enter to save
   - ✅ **PASS**: Entire workflow completable without mouse
   - ❌ **FAIL**: Must use mouse at any step

---

## Test 10: Consistency Between SongCard and SongDetail

**Goal**: Verify click-to-edit works identically in modal view

### Steps

1. **Test in SongCard (List View)**
   - Follow Tests 2-8 for a song in the main list
   - Note the behavior (click label, edit, save, cancel)

2. **Open SongDetail Modal**
   - Click "Zoom" button on the same song
   - Modal opens with detailed view

3. **Test in SongDetail (Modal View)**
   - Repeat Tests 2-8 in the modal
   - ✅ **PASS**: Behavior identical to SongCard
   - ❌ **FAIL**: Different behavior, missing features, or broken functionality

4. **Verify Changes Sync**
   - Edit tempo in modal, close modal
   - ✅ **PASS**: SongCard reflects updated tempo
   - ❌ **FAIL**: Changes not visible in main list

---

## Test 11: Edge Case - Rapid Label Clicking

**Goal**: Verify state doesn't break with rapid clicking

### Steps

1. **Rapid Click Tempo Label**
   - Click "Tempo" label 10 times rapidly
   - ✅ **PASS**: Edit mode enters once, no duplicate inputs, no errors
   - ❌ **FAIL**: Multiple inputs appear, console errors, or crash

2. **Rapid Switch Between Fields**
   - Click "Tempo" label → immediately click "Key" label (repeat 5 times)
   - ✅ **PASS**: Smooth transitions, no errors, auto-save works
   - ❌ **FAIL**: State breaks, values lost, or crash

---

## Test 12: Edge Case - Page Navigation During Edit

**Goal**: Verify edit state doesn't persist unexpectedly

### Steps

1. **Enter Edit Mode**
   - Click "Tempo" label
   - Type "150" but do NOT save (leave input active)

2. **Refresh Page (F5)**
   - Hard refresh the browser
   - ✅ **PASS**: Tempo displays original value (edit discarded), display mode shown
   - ❌ **FAIL**: Shows "150 BPM" (unsaved edit persisted) or broken state

3. **Enter Edit Mode Again**
   - Click "Tempo" label, type "160"

4. **Close Browser Tab**
   - Close tab without saving
   - Reopen application in new tab

5. **Verify Edit Not Persisted**
   - ✅ **PASS**: Tempo shows original value (edit was not saved)
   - ❌ **FAIL**: Shows "160 BPM" (unsaved edit somehow persisted)

---

## Summary Checklist

After completing all tests, verify:

- [ ] Display mode shows plain text by default (no input borders)
- [ ] Clicking tempo label enters tempo edit mode with auto-focus
- [ ] Clicking key label enters key edit mode with auto-focus
- [ ] Enter key saves edits and exits edit mode
- [ ] Escape key cancels edits and exits edit mode
- [ ] Blur (click outside) saves edits and exits edit mode
- [ ] Opening new field auto-saves current field
- [ ] Tempo validation (clamping, rounding) preserved
- [ ] Key normalization (enharmonic spelling) preserved
- [ ] Full keyboard navigation works (no mouse required)
- [ ] SongCard and SongDetail have identical behavior
- [ ] Rapid clicking doesn't break state
- [ ] Unsaved edits don't persist across page refreshes

All tests passing = ✅ **Feature ready for use**

---

## Common Issues

**Input doesn't appear when clicking label**:
- Check label has onClick handler
- Verify edit state is toggled correctly
- Check conditional rendering logic

**Auto-focus not working**:
- Add `autoFocus` prop to input element
- Or use `useEffect` with ref.current.focus()

**Changes not persisting**:
- Verify onUpdate() is called on blur/Enter
- Check existing useEffect for localStorage save

**Keyboard shortcuts not working**:
- Add onKeyDown handler to input
- Check for e.key === 'Enter' and e.key === 'Escape'

**Visual feedback missing on tempo clamp**:
- Verify showTempoFeedback state is set on clamp
- Check Tailwind classes are applied conditionally
