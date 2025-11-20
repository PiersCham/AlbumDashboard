# Quickstart: Testing Total Album Duration Display

**Feature**: 006-total-album-duration
**Date**: 2025-11-21
**Purpose**: Manual testing guide for total album duration calculation and display

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with DevTools enabled (Chrome, Firefox, Safari, Edge)
- Feature 005-song-duration must be complete (individual song durations implemented)
- 12 songs loaded in the application

---

## Test 1: Default Total Duration Display

**Goal**: Verify total duration appears in Header component

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **Locate Total Duration**
   - Look at the Header component (top banner)
   - Find total duration display between album title and countdown timer
   - ✅ **PASS**: Total duration is visible in center of Header
   - ❌ **FAIL**: Total duration missing or in wrong location

3. **Verify Initial Display**
   - With all songs at default 0:00 duration
   - ✅ **PASS**: Displays "0m"
   - ❌ **FAIL**: Shows different value or format

---

## Test 2: Calculation Accuracy (Minutes Only)

**Goal**: Verify total duration calculates correctly for albums <60 minutes

### Steps

1. **Set Song Durations**
   - Song 1: 3:30
   - Song 2: 4:15
   - Song 3: 2:45
   - (Leave remaining songs at 0:00)

2. **Calculate Expected Total**
   - 3:30 = 210 seconds
   - 4:15 = 255 seconds
   - 2:45 = 165 seconds
   - Total: 630 seconds = 10.5 minutes → 10 minutes (floored)

3. **Verify Display**
   - ✅ **PASS**: Header shows "10m"
   - ❌ **FAIL**: Shows incorrect value

---

## Test 3: Calculation Accuracy (Hours + Minutes)

**Goal**: Verify format switches to "Xh Ym" for albums ≥60 minutes

### Steps

1. **Set Song Durations**
   - Song 1: 5:20 (320 seconds)
   - Song 2: 4:10 (250 seconds)
   - Song 3: 3:45 (225 seconds)
   - Song 4: 6:30 (390 seconds)
   - Song 5: 5:15 (315 seconds)
   - (Remaining 7 songs at 0:00)

2. **Calculate Expected Total**
   - 320 + 250 + 225 + 390 + 315 = 1500 seconds
   - 1500 / 60 = 25 minutes
   - Format: <60 minutes, should show "25m"

3. **Add More Duration**
   - Song 6: 10:00 (600 seconds)
   - Song 7: 10:00 (600 seconds)
   - Song 8: 10:00 (600 seconds)
   - Song 9: 10:00 (600 seconds)

4. **Recalculate Expected Total**
   - Previous: 1500 seconds
   - Additional: 4 × 600 = 2400 seconds
   - Total: 3900 seconds = 65 minutes
   - Format: ≥60 minutes, should show "1h 5m"

5. **Verify Display**
   - ✅ **PASS**: Header shows "1h 5m"
   - ❌ **FAIL**: Shows incorrect format or value

---

## Test 4: Exact Hours Display

**Goal**: Verify zero minutes are omitted for exact hours

### Steps

1. **Set Song Durations**
   - 12 songs × 5:00 each = 3600 seconds = 60 minutes

2. **Verify Display**
   - ✅ **PASS**: Header shows "1h" (not "1h 0m")
   - ❌ **FAIL**: Shows "1h 0m" or incorrect format

3. **Test Multiple Exact Hours**
   - Set 12 songs × 10:00 each = 7200 seconds = 120 minutes
   - ✅ **PASS**: Header shows "2h"
   - ❌ **FAIL**: Shows "2h 0m"

---

## Test 5: Real-Time Updates

**Goal**: Verify total duration updates immediately when song durations change

### Steps

1. **Set Initial Total**
   - Song 1: 5:00
   - Verify Header shows "5m"

2. **Edit Song Duration**
   - Click on Song 1 duration to edit
   - Change to 10:00
   - Press Enter to save
   - ✅ **PASS**: Header immediately updates to "10m" without page refresh
   - ❌ **FAIL**: Total doesn't update or requires refresh

3. **Edit Multiple Songs**
   - Song 2: 8:30
   - Song 3: 6:15
   - After each save, verify Header updates
   - ✅ **PASS**: Total shows "24m" (10 + 8.5 + 6.25 = 24.75 → 24 minutes)
   - ❌ **FAIL**: Total doesn't update or shows wrong value

---

## Test 6: Canceled Edits Don't Affect Total

**Goal**: Verify Escape key cancels don't change total duration

### Steps

1. **Set Initial Duration**
   - Song 1: 5:00
   - Verify Header shows "5m"

2. **Start Edit and Cancel**
   - Click on Song 1 duration to edit
   - Change to 10:00
   - Press Escape to cancel
   - ✅ **PASS**: Header still shows "5m" (unchanged)
   - ❌ **FAIL**: Total changed despite cancel

---

## Test 7: Edge Case - Empty Album

**Goal**: Verify display handles empty songs array or all zero durations

### Steps

1. **All Songs Zero Duration**
   - Ensure all 12 songs have 0:00 duration
   - ✅ **PASS**: Header shows "0m"
   - ❌ **FAIL**: Shows different value or errors

---

## Test 8: Edge Case - Missing Duration Field

**Goal**: Verify calculation handles songs without duration field gracefully

### Steps

1. **Test with Browser DevTools**
   - Open DevTools Console
   - Temporarily modify songs array to remove duration from one song:
     ```javascript
     // Note: This is just for testing edge case handling
     // Actual users won't encounter this with proper feature 005 implementation
     ```

2. **Expected Behavior**
   - ✅ **PASS**: Total duration calculates using remaining valid songs
   - ❌ **FAIL**: Application crashes or shows NaN

**Note**: This edge case is unlikely in production since feature 005 ensures all songs have duration field

---

## Test 9: Edge Case - Very Large Total (999h+ Cap)

**Goal**: Verify display caps at "999h+" for unrealistically large totals

### Steps

1. **Set Unrealistic Durations**
   - Manually edit song durations to create total >999 hours
   - Example: 12 songs × 59:59 each = ~720 minutes = 12 hours (not enough)
   - Would need to artificially create data exceeding 999 hours

2. **Alternative Test**
   - Test the formatTotalDuration() function directly in console:
     ```javascript
     formatTotalDuration(60000) // 1000 hours
     ```
   - ✅ **PASS**: Returns "999h+"
   - ❌ **FAIL**: Shows full number causing layout issues

---

## Test 10: Format Consistency Across Durations

**Goal**: Verify format adapts correctly at different total durations

### Test Matrix

| Total Minutes | Expected Display | Test Songs Setup | Pass/Fail |
|---------------|------------------|------------------|-----------|
| 0 | "0m" | All songs 0:00 | |
| 10 | "10m" | 10:00 total | |
| 59 | "59m" | Just under 1 hour | |
| 60 | "1h" | Exactly 1 hour | |
| 61 | "1h 1m" | 1 hour 1 minute | |
| 90 | "1h 30m" | 1.5 hours | |
| 120 | "2h" | Exactly 2 hours | |
| 135 | "2h 15m" | 2 hours 15 minutes | |

### Steps

1. **Test Each Row**
   - Set song durations to achieve each total
   - Verify display matches expected format
   - ✅ **PASS**: All rows display correctly
   - ❌ **FAIL**: Any row shows incorrect format

---

## Test 11: Responsive Layout

**Goal**: Verify total duration displays correctly on different screen sizes

### Steps

1. **Desktop View (≥1024px)**
   - Resize browser to full screen
   - ✅ **PASS**: Total duration appears between album title and countdown on same row
   - ❌ **FAIL**: Layout breaks or elements overlap

2. **Mobile View (<1024px)**
   - Resize browser to mobile width (e.g., 375px)
   - ✅ **PASS**: Total duration appears in vertical stack with other header elements
   - ❌ **FAIL**: Text truncated or invisible

3. **Tablet View (768-1024px)**
   - Resize browser to tablet width
   - ✅ **PASS**: Total duration remains visible and readable
   - ❌ **FAIL**: Layout issues

---

## Test 12: Visual Consistency

**Goal**: Verify total duration styling matches other Header elements

### Steps

1. **Compare with Album Title**
   - Both should use `text-2xl font-black tracking-wider`
   - ✅ **PASS**: Total duration has same font size, weight, and spacing
   - ❌ **FAIL**: Styling differs

2. **Compare with Countdown Timer**
   - Total duration should have equal visual weight
   - ✅ **PASS**: Total duration doesn't look out of place
   - ❌ **FAIL**: Looks smaller, larger, or inconsistent

---

## Test 13: Performance - No Lag on Song Edits

**Goal**: Verify total duration calculation doesn't cause UI lag

### Steps

1. **Rapid Song Edits**
   - Edit 5-10 song durations in quick succession
   - Observe UI responsiveness during edits
   - ✅ **PASS**: UI remains smooth, no visible lag or freezing
   - ❌ **FAIL**: UI stutters or becomes unresponsive

2. **Countdown Timer Continues**
   - Verify countdown timer continues updating every second while total duration is displayed
   - ✅ **PASS**: Countdown updates smoothly without interruption
   - ❌ **FAIL**: Countdown freezes or skips updates

---

## Test 14: Persistence Across Page Refresh

**Goal**: Verify total duration persists correctly after page refresh

### Steps

1. **Set Song Durations**
   - Song 1: 4:30
   - Song 2: 5:15
   - Song 3: 3:45
   - Verify Header shows "13m"

2. **Refresh Page**
   - Press F5 or Ctrl+R to reload
   - ✅ **PASS**: Header still shows "13m" after reload
   - ❌ **FAIL**: Total duration resets to "0m" or incorrect value

---

## Test 15: Export/Import Compatibility

**Goal**: Verify total duration recalculates correctly from imported data

### Steps

1. **Set Song Durations**
   - Create album with various song durations
   - Note the total duration display (e.g., "1h 23m")

2. **Export Album Data**
   - Use existing export feature
   - Save JSON file

3. **Clear and Reimport**
   - Clear localStorage (or refresh with empty data)
   - Import the saved JSON file
   - ✅ **PASS**: Total duration recalculates and shows same value as before export
   - ❌ **FAIL**: Total duration incorrect or missing after import

---

## Summary Checklist

After completing all tests, verify:

- [ ] Total duration appears in Header component (center position)
- [ ] Display format is "Xm" for <60 minutes
- [ ] Display format is "Xh Ym" for ≥60 minutes with remainder
- [ ] Display format is "Xh" for exact hours (no "0m")
- [ ] Calculation accuracy: sum of all song durations matches displayed total
- [ ] Real-time updates: total changes immediately when song duration edited
- [ ] Canceled edits don't affect total
- [ ] Empty album or all zero durations shows "0m"
- [ ] Missing duration fields handled gracefully (treated as 0:00)
- [ ] Very large totals cap at "999h+" (if testable)
- [ ] Format consistency across all duration ranges
- [ ] Responsive layout works on desktop, tablet, mobile
- [ ] Visual styling matches other Header elements
- [ ] No performance lag during song edits
- [ ] Total duration persists across page refresh
- [ ] Total duration recalculates correctly after import

All tests passing = ✅ **Feature ready for use**

---

## Common Issues

**Total duration shows "0m" when songs have durations**:
- Check that songs array is passed to Header component
- Verify useMemo dependency includes songs array
- Check browser console for calculation errors

**Total duration doesn't update when song durations change**:
- Verify useMemo dependency is `[songs]`
- Check that songs array reference changes when durations update (not mutating in place)
- Ensure onUpdate creates new song object (not mutating existing)

**Format incorrect** (e.g., "0h 45m" instead of "45m"):
- Check formatTotalDuration logic for hours === 0 condition
- Verify Math.floor is applied to totalMinutes calculation

**Layout breaks on mobile**:
- Check Header component uses flex-col for mobile breakpoint
- Verify total duration div doesn't have fixed width

**Performance lag**:
- Verify useMemo is used (not calculating inline)
- Check that calculation only runs on songs change, not every render
- Use React DevTools Profiler to identify unnecessary re-renders
