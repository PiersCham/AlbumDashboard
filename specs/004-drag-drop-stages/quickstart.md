# Quickstart: Testing Drag-and-Drop Stage Reordering

**Feature**: 004-drag-drop-stages
**Date**: 2025-11-20
**Purpose**: Manual testing guide for drag-and-drop functionality, keyboard navigation, and accessibility

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with DevTools enabled (Chrome, Firefox, Safari, Edge)
- Songs with multiple stages (at least 3-5 stages per song)
- For touch testing: Tablet or phone with touch screen
- For keyboard testing: Physical keyboard connected

---

## Test 1: Basic Mouse Drag-and-Drop

**Goal**: Verify core drag-and-drop functionality with mouse

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **Locate a Song Card with Multiple Stages**
   - Find a song card in the grid with at least 3 stages listed
   - Verify stages are displayed as progress bars with names

3. **Hover Over a Stage Bar**
   - Move mouse over any stage bar
   - ✅ **PASS**: Cursor changes to `grab` (open hand icon)
   - ❌ **FAIL**: Cursor remains as default pointer

4. **Click and Hold on a Stage**
   - Press and hold left mouse button on "Drums" stage
   - ✅ **PASS**: Cursor changes to `grabbing` (closed hand), stage becomes semi-transparent (50% opacity)
   - ❌ **FAIL**: No visual feedback, cursor unchanged

5. **Drag Stage to New Position**
   - While holding mouse button, drag "Drums" above "Demo" stage
   - Move slowly to observe intermediate positions
   - ✅ **PASS**: As mouse moves over other stages, a drop indicator (amber line or gap) appears showing where the stage will be inserted
   - ❌ **FAIL**: No drop indicator, or indicator doesn't move

6. **Release Mouse to Drop**
   - Release mouse button while drop indicator is above "Demo"
   - ✅ **PASS**: "Drums" stage moves to first position, other stages shift down, opacity returns to 100%
   - ❌ **FAIL**: Stage snaps back to original position, or UI breaks

7. **Verify Order Persistence**
   - Refresh page (F5 or Ctrl+R)
   - ✅ **PASS**: "Drums" is still in first position after reload
   - ❌ **FAIL**: Stages revert to previous order

---

## Test 2: Drag to Last Position

**Goal**: Verify dragging a stage to the end of the list works correctly

### Steps

1. **Drag First Stage to Last**
   - Click and hold on the first stage in the list
   - Drag all the way down to the bottom of the stage list
   - ✅ **PASS**: Drop indicator appears below the last stage
   - Release mouse
   - ✅ **PASS**: Dragged stage becomes the last stage, all others shift up
   - ❌ **FAIL**: Stage doesn't move to end, or order is incorrect

2. **Verify Array Shift**
   - Original order: `[A, B, C, D]` → drag A to end
   - Expected new order: `[B, C, D, A]`
   - ✅ **PASS**: All stages shift up by one, dragged stage at end
   - ❌ **FAIL**: Stages out of order or duplicated

---

## Test 3: Cancel Drag with Escape Key

**Goal**: Verify user can cancel drag operation mid-action

### Steps

1. **Start Dragging a Stage**
   - Click and hold on "Bass" stage
   - Drag it over "Mix" stage (don't release)
   - Verify drop indicator shows new position

2. **Press Escape Key**
   - While still holding mouse button and dragging, press `Esc` key
   - ✅ **PASS**: Drag operation cancels immediately, stage returns to original position, opacity resets to 100%
   - ❌ **FAIL**: Escape has no effect, or stage drops at current position

3. **Verify No Changes Saved**
   - Check stage order matches before drag started
   - ✅ **PASS**: Order unchanged, no `onUpdate` call made
   - ❌ **FAIL**: Stage moved even though drag was canceled

---

## Test 4: Cancel Drag by Dragging Outside

**Goal**: Verify dragging outside boundaries cancels the operation

### Steps

1. **Start Dragging a Stage**
   - Click and hold on any stage
   - Drag it up/down within the card

2. **Drag Outside Song Card Boundaries**
   - Move mouse outside the song card div (into gray background area)
   - Release mouse button while outside
   - ✅ **PASS**: Drag cancels, stage returns to original position
   - ❌ **FAIL**: Stage stays at last position before leaving bounds

3. **Try Dragging Into Another Song Card**
   - Start dragging in Song 1
   - Drag into Song 2's stage list area
   - ✅ **PASS**: Cursor shows "not allowed" or drag cancels, can't drop in different song
   - ❌ **FAIL**: Stage drops into wrong song

---

## Test 5: Touch Device Drag-and-Drop

**Goal**: Verify drag-and-drop works on touch devices (tablets, phones)

### Steps

1. **Open App on Touch Device**
   - Use tablet or phone browser
   - Navigate to `http://localhost:5173` (or use dev server IP)

2. **Touch and Hold a Stage**
   - Touch a stage bar with finger
   - Hold for 500ms without moving
   - ✅ **PASS**: After 500ms, stage becomes semi-transparent (drag mode activated), subtle vibration (if supported)
   - ❌ **FAIL**: Long-press doesn't activate drag, or activates too quickly/slowly

3. **Drag with Finger**
   - While holding, move finger up/down the screen
   - ✅ **PASS**: Stage follows finger, drop indicator appears as finger moves over other stages
   - ❌ **FAIL**: Stage doesn't follow, or scrolls page instead

4. **Lift Finger to Drop**
   - Lift finger while over a drop zone
   - ✅ **PASS**: Stage reorders to new position, visual feedback clears
   - ❌ **FAIL**: Stage doesn't drop, or drops at wrong position

5. **Test Touch-Scroll vs Drag**
   - Touch a stage and immediately scroll (< 500ms)
   - ✅ **PASS**: Page scrolls normally, drag does NOT activate
   - ❌ **FAIL**: Drag activates even with quick scroll motion

---

## Test 6: Keyboard Accessibility (Ctrl+Arrow Keys)

**Goal**: Verify stages can be reordered using only keyboard

### Steps

1. **Navigate to a Stage with Tab**
   - Press `Tab` key repeatedly until a stage bar is focused
   - ✅ **PASS**: Stage bar gets visible focus outline (ring), stage name announced by screen reader
   - ❌ **FAIL**: Cannot focus stages with Tab, or no visual focus indicator

2. **Move Stage Up with Ctrl+Up Arrow**
   - Focus on "Bass" stage (3rd in list)
   - Press `Ctrl + Up Arrow`
   - ✅ **PASS**: "Bass" moves up one position, becomes 2nd in list
   - ❌ **FAIL**: Nothing happens, or wrong stage moves

3. **Move Stage Down with Ctrl+Down Arrow**
   - Keep "Bass" focused (now 2nd in list)
   - Press `Ctrl + Down Arrow`
   - ✅ **PASS**: "Bass" moves down one position, back to 3rd
   - ❌ **FAIL**: Nothing happens, or stage moves multiple positions

4. **Test Boundary Conditions**
   - Focus on first stage
   - Press `Ctrl + Up Arrow`
   - ✅ **PASS**: Nothing happens (or sound/visual cue that it's at boundary)
   - Focus on last stage
   - Press `Ctrl + Down Arrow`
   - ✅ **PASS**: Nothing happens (boundary feedback)
   - ❌ **FAIL**: Crashes, or stage wraps to other end

5. **Verify Persistence**
   - Reorder stages using keyboard
   - Refresh page
   - ✅ **PASS**: Keyboard-reordered stages persist
   - ❌ **FAIL**: Changes lost on refresh

---

## Test 7: Visual Feedback During Drag

**Goal**: Verify clear visual feedback shows where stage will drop

### Steps

1. **Start Dragging a Stage**
   - Click and hold on "Vocals" stage

2. **Observe Dragged Item Feedback**
   - ✅ **PASS**: Dragged stage has 50% opacity, cursor is `grabbing`
   - ❌ **FAIL**: No visual change to dragged item

3. **Observe Drop Indicator**
   - Drag over "Mix" stage
   - ✅ **PASS**: Amber horizontal line appears above or below "Mix" showing insertion point
   - ❌ **FAIL**: No drop indicator, or indicator is hard to see

4. **Move Slowly Through All Stages**
   - Drag from top to bottom, observing each position
   - ✅ **PASS**: Drop indicator smoothly moves to show each possible insertion point
   - ❌ **FAIL**: Indicator jumps, lags, or appears in wrong positions

5. **Drop and Verify**
   - Release at a specific indicator position
   - ✅ **PASS**: Stage drops exactly where indicator showed
   - ❌ **FAIL**: Stage drops at different position than indicated

---

## Test 8: Drag During Stage Edit Modal

**Goal**: Verify drag doesn't interfere with stage editing functionality

### Steps

1. **Open Stage Edit Modal**
   - Click on a stage bar to open the edit name/progress modal
   - Modal should appear with inputs and slider

2. **Try to Drag While Modal is Open**
   - With modal still open, try to click and drag the same stage bar
   - ✅ **PASS**: Drag is disabled (stage is not draggable while modal open), clicking doesn't close modal
   - ❌ **FAIL**: Drag starts and interferes with modal, or modal closes unexpectedly

3. **Close Modal and Test Drag**
   - Click "Cancel" or "Save" to close modal
   - Try dragging the same stage
   - ✅ **PASS**: Drag works normally after modal closes
   - ❌ **FAIL**: Drag remains disabled, or stage is broken

---

## Test 9: Rapid Drag Operations

**Goal**: Verify system handles rapid successive drags without breaking

### Steps

1. **Perform Quick Successive Drags**
   - Drag "Drums" up → drop → immediately drag "Bass" down → drop
   - Repeat with different stages in quick succession (5-10 drags in 10 seconds)
   - ✅ **PASS**: All drags complete successfully, no lag or freezing, final order is correct
   - ❌ **FAIL**: UI freezes, stages duplicate, or order becomes corrupted

2. **Check Browser Console**
   - Open DevTools Console (F12)
   - ✅ **PASS**: No errors or warnings logged
   - ❌ **FAIL**: Errors about state updates, drag events, or array operations

---

## Test 10: Consistency Between SongCard and SongDetail

**Goal**: Verify drag-and-drop works identically in modal (SongDetail) view

### Steps

1. **Test Drag in SongCard (Grid View)**
   - Drag a stage in the main grid card view
   - Note the behavior (cursor, feedback, drop)

2. **Open SongDetail Modal**
   - Click "Zoom" button on the same song
   - Modal opens with detailed view

3. **Test Drag in SongDetail (Modal View)**
   - Drag a stage in the modal view
   - ✅ **PASS**: Drag behavior is identical to SongCard (same cursor, feedback, drop logic)
   - ❌ **FAIL**: Different behavior, missing features, or broken in modal

4. **Verify Changes Sync**
   - Reorder stages in modal using drag-and-drop
   - Close modal (click "Back to Grid")
   - ✅ **PASS**: SongCard in grid reflects new stage order
   - ❌ **FAIL**: Changes not visible, or different order

---

## Test 11: Single Stage Edge Case

**Goal**: Verify system handles songs with only one stage gracefully

### Steps

1. **Create a Song with One Stage**
   - Add a new song or remove stages until only 1 remains

2. **Try to Drag the Single Stage**
   - Click and hold on the only stage
   - ✅ **PASS**: Drag initiates (cursor changes, opacity changes), but drop has no effect (nowhere to move)
   - ❌ **FAIL**: Crashes, error logged, or stage duplicates

3. **Add a Second Stage**
   - Click "Add Bit" button
   - ✅ **PASS**: Now drag-and-drop works to reorder the 2 stages
   - ❌ **FAIL**: Drag broken after adding stage

---

## Test 12: Performance with Many Stages

**Goal**: Verify drag performance with maximum stage count

### Steps

1. **Create a Song with 15+ Stages**
   - Add stages until list exceeds screen height (scrolling appears)

2. **Drag from Top to Bottom**
   - Drag first stage all the way to last position
   - ✅ **PASS**: Drag is smooth (no janky animation), scrollbar appears/scrolls automatically during drag
   - ❌ **FAIL**: Lag, janky motion, or scroll doesn't work during drag

3. **Check Frame Rate**
   - Open DevTools → Performance tab → Record during drag
   - ✅ **PASS**: Frame rate stays above 50fps during drag
   - ❌ **FAIL**: Drops below 30fps, visible stuttering

---

## Test 13: Screen Reader Accessibility

**Goal**: Verify drag-and-drop is announced to screen readers

### Steps

1. **Enable Screen Reader**
   - Windows: Turn on Narrator (Win+Ctrl+Enter)
   - macOS: Turn on VoiceOver (Cmd+F5)

2. **Navigate to Stage with Keyboard**
   - Press Tab to focus on a stage bar
   - ✅ **PASS**: Screen reader announces: "Drums - 50% complete, listitem, grabbable"
   - ❌ **FAIL**: No announcement, or missing role/state info

3. **Start Dragging with Keyboard**
   - Press Ctrl+Down Arrow to move stage down
   - ✅ **PASS**: Screen reader announces: "Drums moved to position 3"
   - ❌ **FAIL**: No feedback about move operation

4. **Drag with Mouse (if screen reader supports it)**
   - Click and drag a stage
   - ✅ **PASS**: Screen reader announces drag state changes
   - ❌ **FAIL**: Silent during drag operation

---

## Summary Checklist

After completing all tests, verify:

- [ ] Mouse drag-and-drop works in both SongCard and SongDetail
- [ ] Touch drag-and-drop works on mobile/tablet (500ms long-press)
- [ ] Keyboard reordering works (Ctrl+Up/Down arrows)
- [ ] Drag cancellation works (Escape key, drag-out)
- [ ] Visual feedback is clear (opacity, drop indicator, cursor)
- [ ] Changes persist after page refresh
- [ ] Drag doesn't interfere with stage editing modal
- [ ] Performance is smooth (60fps during drag)
- [ ] Screen reader announces drag operations
- [ ] Edge cases handled (single stage, many stages)

All tests passing = ✅ **Feature ready for use**

---

## Common Issues

**Drag doesn't start on click**:
- Check `draggable="true"` attribute on stage div
- Verify onDragStart handler is attached
- Check that edit modal isn't open (`draggable={!promptOpen}`)

**Drop indicator doesn't appear**:
- Verify onDragOver handler calls `e.preventDefault()`
- Check CSS for `.drop-target-indicator` class
- Ensure dropTargetIndex state is updating

**Changes don't persist**:
- Verify `onUpdate` is called in handleDrop
- Check existing localStorage save logic is working
- Inspect localStorage in DevTools (Application tab)

**Touch drag doesn't work**:
- Verify touch handlers (onTouchStart, onTouchMove, onTouchEnd) are attached
- Check 500ms timer in handleTouchStart
- Test on actual device (not just browser DevTools mobile emulation)

**Keyboard shortcuts don't work**:
- Verify `tabIndex="0"` on stage div (makes it focusable)
- Check onKeyDown handler is attached
- Ensure Ctrl key is detected correctly (`e.ctrlKey`)

**Performance is janky**:
- Check draggedIndexRef is used (not state) to avoid re-renders
- Verify CSS-only visual feedback (no inline style updates)
- Profile in DevTools Performance tab to find bottlenecks
