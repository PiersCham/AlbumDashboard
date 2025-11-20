# Quickstart: Testing Song Card Reordering

**Feature**: 007-song-reorder
**Date**: 2025-11-21
**Purpose**: Manual testing guide for drag-and-drop song card reordering

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with HTML5 drag-and-drop support (Chrome, Firefox, Safari, Edge)
- Mouse or trackpad (keyboard/touch testing deferred to P3)
- At least 2 songs in the song list (default: 12 songs)

---

## Test 1: Basic Drag and Drop

**Goal**: Verify song cards can be dragged and reordered

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **Identify Starting Order**
   - Note the initial song order (e.g., Song 1, Song 2, Song 3, ...)
   - Songs should be in their default or previously saved order

3. **Drag Song Card**
   - Click and hold on "Song 1" card
   - Drag cursor downward over "Song 2" and "Song 3"
   - ✅ **PASS**: Dragged card follows cursor
   - ❌ **FAIL**: Card doesn't move or cursor doesn't change

4. **Release at Target Position**
   - Drop "Song 1" between "Song 3" and "Song 4"
   - ✅ **PASS**: Card inserts at new position, order updates to: Song 2, Song 3, Song 1, Song 4, ...
   - ❌ **FAIL**: Card returns to original position or wrong order

---

## Test 2: Visual Feedback During Drag

**Goal**: Verify visual indicators appear during drag operation

### Steps

1. **Start Drag Operation**
   - Click and hold on "Song 2" card
   - ✅ **PASS**: Card becomes semi-transparent (50% opacity)
   - ❌ **FAIL**: No visual change

2. **Hover Over Drop Targets**
   - Drag over "Song 5" card
   - ✅ **PASS**: Amber border line appears above "Song 5"
   - ❌ **FAIL**: No drop zone indicator

3. **Move to Different Target**
   - Drag over "Song 7" card
   - ✅ **PASS**: Amber border moves from Song 5 to Song 7
   - ❌ **FAIL**: Multiple borders or no border movement

4. **Complete Drag**
   - Release mouse at "Song 7"
   - ✅ **PASS**: Visual feedback disappears, card appears in new position
   - ❌ **FAIL**: Visual indicators remain after drop

---

## Test 3: Persistence Across Refresh

**Goal**: Verify reordered song list persists in localStorage

### Steps

1. **Reorder Songs**
   - Drag "Song 3" to first position
   - Drag "Song 8" to second position
   - Final order: Song 3, Song 8, Song 1, Song 2, Song 4, ...

2. **Verify Immediate Update**
   - ✅ **PASS**: Song cards appear in new order immediately after drop
   - ❌ **FAIL**: Order doesn't update or updates with delay

3. **Refresh Page**
   - Press F5 or Ctrl+R to reload
   - ✅ **PASS**: Songs remain in reordered sequence (Song 3, Song 8, ...)
   - ❌ **FAIL**: Order reverts to original or default

4. **Check localStorage (Optional)**
   - Open DevTools → Application → localStorage
   - Find `albumProgress_v3` key
   - Verify `songs` array order matches displayed order
   - ✅ **PASS**: JSON array order matches visual order
   - ❌ **FAIL**: localStorage order doesn't match UI

---

## Test 4: Cancel with Escape Key

**Goal**: Verify Escape key cancels drag without reordering

### Steps

1. **Start Drag**
   - Note starting order: Song 1, Song 2, Song 3, ...
   - Click and hold on "Song 1"
   - Drag over "Song 5"
   - ✅ **PASS**: Visual feedback appears (opacity, border)

2. **Press Escape**
   - While still holding mouse button, press Escape key
   - ✅ **PASS**: Visual feedback disappears immediately
   - ❌ **FAIL**: Escape has no effect

3. **Release Mouse**
   - Release mouse button
   - ✅ **PASS**: Song order unchanged (still Song 1, Song 2, Song 3, ...)
   - ❌ **FAIL**: Songs reordered despite cancel

---

## Test 5: Same-Position Drop (No-Op)

**Goal**: Verify dropping card at original position has no effect

### Steps

1. **Identify Starting Order**
   - Note order: Song 1, Song 2, Song 3, ...

2. **Drag and Drop at Same Position**
   - Click and hold on "Song 2"
   - Drag slightly (to trigger drag start)
   - Drop back at "Song 2" position
   - ✅ **PASS**: Order remains unchanged, no unnecessary re-render
   - ❌ **FAIL**: Weird visual glitch or state corruption

3. **Verify Persistence**
   - Refresh page
   - ✅ **PASS**: Order still matches original
   - ❌ **FAIL**: localStorage updated despite no-op

---

## Test 6: Edge Case - First to Last Position

**Goal**: Verify dragging first card to last position works correctly

### Steps

1. **Starting Order**
   - Default: Song 1, Song 2, Song 3, ..., Song 12

2. **Drag First to Last**
   - Click and hold on "Song 1"
   - Drag all the way down to last position (after Song 12)
   - Drop after "Song 12"
   - ✅ **PASS**: Order becomes Song 2, Song 3, ..., Song 12, Song 1
   - ❌ **FAIL**: Wrong order or card disappears

3. **Verify Persistence**
   - Refresh page
   - ✅ **PASS**: Song 1 remains at end
   - ❌ **FAIL**: Order corrupted

---

## Test 7: Edge Case - Last to First Position

**Goal**: Verify dragging last card to first position works correctly

### Steps

1. **Starting Order**
   - Default: Song 1, Song 2, Song 3, ..., Song 12

2. **Drag Last to First**
   - Scroll to bottom (if needed)
   - Click and hold on "Song 12"
   - Drag to top, drop before "Song 1"
   - ✅ **PASS**: Order becomes Song 12, Song 1, Song 2, ..., Song 11
   - ❌ **FAIL**: Wrong order or visual glitch

---

## Test 8: Adjacent Card Swap

**Goal**: Verify swapping adjacent cards works correctly

### Steps

1. **Starting Order**
   - Song 1, Song 2, Song 3, ...

2. **Swap Adjacent Cards**
   - Drag "Song 2" to position before "Song 1"
   - ✅ **PASS**: Order becomes Song 2, Song 1, Song 3, ...
   - ❌ **FAIL**: Cards don't swap or wrong order

3. **Reverse Swap**
   - Drag "Song 1" back to first position
   - ✅ **PASS**: Order returns to Song 1, Song 2, Song 3, ...
   - ❌ **FAIL**: Order incorrect

---

## Test 9: Rapid Consecutive Drags

**Goal**: Verify multiple quick drag operations handle correctly

### Steps

1. **Perform Multiple Drags Quickly**
   - Drag "Song 1" to position 3
   - Immediately drag "Song 4" to position 1
   - Immediately drag "Song 6" to position 2
   - ✅ **PASS**: Each operation completes successfully, order updates correctly
   - ❌ **FAIL**: UI lag, state corruption, or skipped operations

2. **Verify Final Order**
   - Check that final order matches expected sequence
   - Refresh page to verify persistence
   - ✅ **PASS**: Order is stable and persisted
   - ❌ **FAIL**: Order is incorrect or inconsistent

---

## Test 10: Drag Outside Bounds (Cancel)

**Goal**: Verify dragging outside song list cancels operation

### Steps

1. **Start Drag**
   - Click and hold on "Song 3"
   - Drag cursor outside the song list area (e.g., over Header)

2. **Observe Behavior**
   - ✅ **PASS**: Drag cancels, card returns to original position
   - ❌ **FAIL**: Card gets stuck or state corrupts

3. **Verify Order Unchanged**
   - Check song order matches pre-drag state
   - ✅ **PASS**: Original order preserved
   - ❌ **FAIL**: Songs reordered unexpectedly

---

## Test 11: Compatibility with Inline Editing

**Goal**: Verify drag doesn't interfere with existing inline editing features

### Steps

1. **Click to Edit Title** (Not Drag)
   - Single-click on song title field
   - ✅ **PASS**: Title enters edit mode (cursor appears, editable)
   - ❌ **FAIL**: Drag starts instead of edit

2. **Click to Edit Tempo**
   - Single-click on tempo value
   - ✅ **PASS**: Tempo enters edit mode
   - ❌ **FAIL**: Drag starts

3. **Drag Song Card** (Not Click)
   - Click and hold on song card (not specific field)
   - Drag to new position
   - ✅ **PASS**: Drag works, no edit mode triggered
   - ❌ **FAIL**: Edit mode opens during drag

4. **Edit Then Drag**
   - Edit song title, save changes
   - Immediately drag that song card
   - ✅ **PASS**: Both operations work independently
   - ❌ **FAIL**: Conflicts or state corruption

---

## Test 12: Performance - Smooth 60fps Drag

**Goal**: Verify drag operation feels smooth and responsive

### Steps

1. **Visual Inspection**
   - Drag a song card slowly across the list
   - Observe cursor movement and visual feedback
   - ✅ **PASS**: Cursor moves smoothly, no stutter or lag
   - ❌ **FAIL**: Jerky movement, freezing, or lag

2. **Fast Drag**
   - Drag a song card rapidly from top to bottom
   - ✅ **PASS**: Visual feedback keeps up, smooth animation
   - ❌ **FAIL**: Lag or visual artifacts

3. **Feedback Latency**
   - Start drag, measure time until visual feedback appears
   - ✅ **PASS**: Opacity change appears within 100ms (feels instant)
   - ❌ **FAIL**: Noticeable delay (>200ms)

---

## Test 13: Export/Import with Reordered Songs

**Goal**: Verify export/import preserves reordered song list

### Steps

1. **Reorder Songs**
   - Drag songs to custom order (e.g., Song 3, Song 1, Song 5, Song 2, ...)

2. **Export Data**
   - Use existing export feature (ExportImport component)
   - Save JSON file to disk

3. **Clear Data**
   - Clear localStorage or open in incognito window
   - Verify songs reset to default order

4. **Import Data**
   - Import the previously saved JSON file
   - ✅ **PASS**: Songs load in reordered sequence (Song 3, Song 1, Song 5, ...)
   - ❌ **FAIL**: Songs revert to default order or import fails

5. **Verify Integrity**
   - Check all song properties (title, tempo, key, duration, stages) preserved
   - ✅ **PASS**: All data intact, only order changed
   - ❌ **FAIL**: Data corruption or loss

---

## Test 14: Browser Tab Loss of Focus

**Goal**: Verify drag cancels gracefully when browser tab loses focus

### Steps

1. **Start Drag**
   - Click and hold on "Song 2"
   - Begin dragging (visual feedback appears)

2. **Switch Tabs**
   - While dragging, press Ctrl+Tab (switch to another browser tab)
   - Return to original tab

3. **Verify Cleanup**
   - ✅ **PASS**: Drag state cleared, no visual artifacts, original order preserved
   - ❌ **FAIL**: Visual feedback stuck, state corrupted

---

## Test 15: Multiple Songs (Stress Test)

**Goal**: Verify drag works across full song list (12 cards)

### Steps

1. **Drag from Position 1 to 12**
   - Drag "Song 1" all the way to last position
   - ✅ **PASS**: Drag completes successfully, order correct

2. **Drag from Position 12 to 1**
   - Drag "Song 1" (now at end) back to first position
   - ✅ **PASS**: Drag completes, order correct

3. **Drag to Middle Position**
   - Drag "Song 1" to position 6 (middle of list)
   - ✅ **PASS**: Card inserts correctly in middle

---

## Test 16: Responsive Layout (If Applicable)

**Goal**: Verify drag works on different screen sizes

### Steps

1. **Desktop View (1920×1080)**
   - Drag song cards vertically
   - ✅ **PASS**: Drag works smoothly

2. **Tablet View (768px width)**
   - Resize browser window to tablet size
   - Drag song cards
   - ✅ **PASS**: Drag still functional, layout adapts

3. **Mobile View (375px width)** (Optional - touch not implemented in P1)
   - Resize to mobile width
   - Attempt drag with mouse (simulating touch)
   - ✅ **PASS**: Drag works or gracefully degrades
   - ❌ **FAIL**: Drag broken or layout breaks

---

## Summary Checklist

After completing all tests, verify:

- [ ] Songs can be dragged and dropped to reorder
- [ ] Visual feedback appears during drag (opacity, border)
- [ ] Reordered list persists across page refresh
- [ ] Escape key cancels drag without reordering
- [ ] Same-position drop is a no-op (no state corruption)
- [ ] Edge cases work (first-to-last, last-to-first, adjacent swap)
- [ ] Rapid consecutive drags handle correctly
- [ ] Drag outside bounds cancels operation
- [ ] Inline editing (title, tempo, key, duration) still works
- [ ] Drag feels smooth (60fps, <100ms feedback)
- [ ] Export/import preserves song order
- [ ] Tab loss of focus cancels drag gracefully
- [ ] Full song list (12 cards) reorders correctly
- [ ] Responsive layout maintains drag functionality

All tests passing = ✅ **Feature ready for use**

---

## Common Issues

**Drag doesn't start**:
- Check `draggable={true}` on SongCard wrapper div
- Verify onDragStart handler attached and firing
- Check browser console for errors

**Visual feedback not appearing**:
- Verify draggedIndex and dropTargetIndex state updating
- Check className conditionals (isDragging, isDropTarget)
- Inspect CSS classes applied (use browser DevTools)

**Order doesn't persist**:
- Check localStorage updates in DevTools → Application tab
- Verify useEffect dependency includes `songs` array
- Check localStorage key is correct (`albumProgress_v3`)

**Drag feels laggy**:
- Check for expensive operations in onDragOver handler
- Verify React is batching state updates (should be automatic in React 18+)
- Use React DevTools Profiler to identify bottlenecks

**Escape key doesn't cancel**:
- Verify handleKeyDown event listener attached to window
- Check event.key === 'Escape' conditional
- Ensure draggedIndex is checked before resetting

**Inline editing conflicts**:
- Verify onClick handlers only on specific elements (title, tempo, etc.)
- Check drag requires click-and-hold (not instant click)
- Test: single click should edit, click-and-drag should reorder
