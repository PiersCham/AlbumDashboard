# Quickstart: Testing Persist Due Date Feature

**Feature**: 001-persist-due-date
**Date**: 2025-11-19
**Purpose**: Manual testing guide for deadline persistence across sessions and import/export

## Prerequisites

- AlbumDashboard application running locally (`npm run dev`)
- Browser with localStorage enabled (Chrome, Firefox, Safari, Edge)
- Ability to open browser DevTools (F12)

---

## Test 1: Deadline Persists Across Browser Sessions

**Goal**: Verify deadline survives page refresh and browser restart

### Steps

1. **Open Application**
   ```
   npm run dev
   ```
   Open browser to `http://localhost:5173`

2. **Check Current Deadline**
   - Look at header section "Time to Goal"
   - Note the current countdown timer value
   - Note the "Target:" date displayed below countdown

3. **Change Deadline**
   - Click on the countdown timer or target date
   - Datetime picker should appear
   - Set new deadline (e.g., "2026-12-31 23:59")
   - Click outside to save (or press Enter if input supports it)

4. **Verify State Change**
   - Countdown timer should update immediately
   - "Target:" line should show new date

5. **Refresh Page** (Ctrl+R or F5)
   - Countdown timer should display same deadline
   - No re-entry required

6. **Close Browser Completely**
   - Close all browser windows/tabs
   - Reopen browser
   - Navigate to `http://localhost:5173`

7. **Verify Persistence**
   - ✅ **PASS**: Countdown shows deadline from step 3
   - ❌ **FAIL**: Countdown reverts to default or different value

### Debug (if fails)

Open browser DevTools (F12) → Console:
```javascript
// Check localStorage
const data = JSON.parse(localStorage.getItem('albumProgress_v3'));
console.log('Stored deadline:', data.targetISO);

// Expected: ISO 8601 string like "2026-12-31T23:59:00.000Z"
```

---

## Test 2: Deadline Included in Export

**Goal**: Verify JSON export contains targetISO field

### Steps

1. **Set Known Deadline**
   - Set deadline to specific date: "2027-06-15 14:30"
   - Note the exact date/time

2. **Export Data**
   - Click "Export" button in header
   - Save file (e.g., `album_dashboard.json`)

3. **Open Exported File**
   - Open JSON file in text editor (Notepad, VS Code, etc.)

4. **Verify Contents**
   ```json
   {
     "songs": [...],
     "albumTitle": "...",
     "targetISO": "2027-06-15T14:30:00.000Z"  // ← CHECK THIS
   }
   ```
   - ✅ **PASS**: `targetISO` field exists with correct ISO 8601 date
   - ❌ **FAIL**: `targetISO` missing or incorrect

### Debug (if fails)

Check `src/App.jsx` line ~153:
```javascript
const exportJSON = async () => {
  // Should include targetISO:
  const data = JSON.stringify({ songs, albumTitle, targetISO }, null, 2);
  // ...
};
```

---

## Test 3: Deadline Restored on Import (Valid Deadline)

**Goal**: Verify importing JSON restores deadline

### Steps

1. **Prepare Test File**
   - Use exported JSON from Test 2
   - OR manually create file:
   ```json
   {
     "songs": [
       {
         "id": 1,
         "title": "Test Song",
         "stages": [
           { "name": "Demo", "value": 50 }
         ]
       }
     ],
     "albumTitle": "Test Album",
     "targetISO": "2028-01-01T00:00:00.000Z"
   }
   ```

2. **Clear Current State** (optional but recommended)
   - Open DevTools (F12) → Console
   - Run: `localStorage.removeItem('albumProgress_v3')`
   - Refresh page

3. **Import Test File**
   - Click "Import" button
   - Select prepared JSON file
   - Page should reload automatically

4. **Verify Deadline Restored**
   - Check countdown timer
   - Check "Target:" date
   - ✅ **PASS**: Shows "2028-01-01" (or date from your test file)
   - ❌ **FAIL**: Shows different date or default

### Debug (if fails)

Check DevTools Console for import errors:
```javascript
// After import, check:
const data = JSON.parse(localStorage.getItem('albumProgress_v3'));
console.log('Imported deadline:', data.targetISO);
```

---

## Test 4: Graceful Fallback for Missing Deadline

**Goal**: Verify app doesn't crash when importing old JSON without targetISO

### Steps

1. **Create Legacy JSON File**
   ```json
   {
     "songs": [
       {
         "id": 1,
         "title": "Legacy Song",
         "stages": [
           { "name": "Demo", "value": 75 }
         ]
       }
     ],
     "albumTitle": "Legacy Album"
   }
   ```
   Note: **No `targetISO` field**

2. **Import Legacy File**
   - Click "Import"
   - Select legacy JSON file
   - Page should reload

3. **Verify Fallback Behavior**
   - App should NOT crash
   - Countdown timer should display
   - Default deadline should be ~12 months from current date
   - ✅ **PASS**: Countdown shows reasonable future date (not "0d 00:00:00")
   - ❌ **FAIL**: App crashes, blank screen, or error message

### Debug (if fails)

Check console for errors. Expected behavior:
```javascript
// Migration function should create default
const defaultDate = new Date();
defaultDate.setFullYear(defaultDate.getFullYear() + 12);
console.log('Default deadline:', defaultDate.toISOString());
```

---

## Test 5: Graceful Fallback for Invalid Deadline

**Goal**: Verify app handles corrupted deadline data

### Steps

1. **Create Corrupted JSON File**
   ```json
   {
     "songs": [
       {
         "id": 1,
         "title": "Corrupted Song",
         "stages": [
           { "name": "Demo", "value": 50 }
         ]
       }
     ],
     "albumTitle": "Corrupted Album",
     "targetISO": "not-a-valid-date"
   }
   ```

2. **Import Corrupted File**
   - Click "Import"
   - Select corrupted JSON

3. **Verify Graceful Handling**
   - App should NOT crash
   - Countdown should show default deadline (12 months from now)
   - ✅ **PASS**: App recovers with default deadline
   - ❌ **FAIL**: Crash, error, or NaN in countdown

### Additional Corruption Tests

Try these malformed values in `targetISO`:
```json
"targetISO": null          // Should fallback
"targetISO": 12345         // Should fallback
"targetISO": {}            // Should fallback
"targetISO": ""            // Should fallback
```

---

## Test 6: Edge Case - Past Deadline

**Goal**: Verify countdown works with deadline in the past

### Steps

1. **Set Past Deadline**
   - Click countdown timer
   - Set date to yesterday (e.g., if today is 2025-11-19, set "2025-11-18")

2. **Verify Behavior**
   - Countdown should show negative time OR zeros
   - App should not crash
   - Per spec (User Story 3, Scenario 1): Either negative countdown or warning accepted

3. **Export/Import Test**
   - Export with past deadline
   - Import exported file
   - ✅ **PASS**: Past deadline persists correctly
   - ❌ **FAIL**: Deadline changes or errors occur

---

## Test 7: Edge Case - Far Future Deadline

**Goal**: Verify countdown works with very distant deadline

### Steps

1. **Set Far Future Deadline**
   - Set deadline to 2099-12-31 (or max date browser allows)

2. **Verify Behavior**
   - Countdown should display large day count
   - No overflow errors in UI

3. **Export/Import Test**
   - Export with far future deadline
   - Import exported file
   - ✅ **PASS**: Far future deadline persists correctly

---

## Test 8: LocalStorage Inspection

**Goal**: Verify deadline is actually stored in localStorage

### Steps

1. **Set Deadline**
   - Set any deadline (e.g., "2026-05-20 10:00")

2. **Inspect LocalStorage**
   - Open DevTools (F12) → Application/Storage tab
   - Navigate to Local Storage → `http://localhost:5173`
   - Find key: `albumProgress_v3`

3. **Verify Structure**
   ```json
   {
     "songs": [...],
     "targetISO": "2026-05-20T10:00:00.000Z",
     "albumTitle": "..."
   }
   ```
   - ✅ **PASS**: `targetISO` exists with ISO 8601 format
   - ❌ **FAIL**: Missing, wrong format, or not updating on change

4. **Test Real-Time Updates**
   - Change deadline in UI
   - Refresh localStorage view in DevTools
   - Verify `targetISO` value updated

---

## Automated Test Suggestions

If adding a test framework (e.g., Vitest), test these functions:

### `isValidISODate(dateString)`

```javascript
describe('isValidISODate', () => {
  it('returns true for valid ISO strings', () => {
    expect(isValidISODate("2026-08-01T00:00:00.000Z")).toBe(true);
  });

  it('returns false for invalid strings', () => {
    expect(isValidISODate("not-a-date")).toBe(false);
  });

  it('returns false for non-string types', () => {
    expect(isValidISODate(null)).toBe(false);
    expect(isValidISODate(12345)).toBe(false);
    expect(isValidISODate(undefined)).toBe(false);
  });
});
```

### `migrateDeadline(storedDeadline)`

```javascript
describe('migrateDeadline', () => {
  it('returns valid deadline unchanged', () => {
    const valid = "2027-01-01T00:00:00.000Z";
    expect(migrateDeadline(valid)).toBe(valid);
  });

  it('returns default for undefined', () => {
    const result = migrateDeadline(undefined);
    const date = new Date(result);
    expect(date.getFullYear()).toBeGreaterThanOrEqual(new Date().getFullYear() + 1);
  });

  it('returns default for invalid data', () => {
    expect(isValidISODate(migrateDeadline("invalid"))).toBe(true);
    expect(isValidISODate(migrateDeadline(null))).toBe(true);
  });
});
```

---

## Troubleshooting

### Issue: Deadline Not Persisting

**Symptoms**: Deadline resets on page refresh

**Check**:
1. Browser localStorage enabled? (Try in incognito to rule out extensions)
2. `useEffect` dependency array includes `targetISO`? (Check App.jsx line 524-526)
3. Console errors related to localStorage quota?

**Fix**: Verify `useEffect` runs on `targetISO` change:
```javascript
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, targetISO, albumTitle }));
}, [songs, targetISO, albumTitle]); // ← targetISO must be here
```

### Issue: Export Missing Deadline

**Symptoms**: Exported JSON doesn't have `targetISO` field

**Check**: `exportJSON` function (App.jsx line ~153)

**Fix**: Include `targetISO` in JSON.stringify:
```javascript
const data = JSON.stringify({ songs, albumTitle, targetISO }, null, 2);
```

### Issue: Import Crashes on Invalid Data

**Symptoms**: App shows blank screen after importing JSON

**Check**: Browser console for errors

**Fix**: Add validation in `importJSON`:
```javascript
const validatedData = {
  songs: migrateSongs(data.songs),
  albumTitle: data.albumTitle || 'Album Dashboard',
  targetISO: migrateDeadline(data.targetISO)
};
```

---

## Success Criteria Checklist

- [ ] Deadline persists across page refresh (Test 1)
- [ ] Deadline persists across browser close/reopen (Test 1)
- [ ] Exported JSON contains `targetISO` field (Test 2)
- [ ] Imported JSON restores deadline correctly (Test 3)
- [ ] Missing deadline fallback works (Test 4)
- [ ] Invalid deadline fallback works (Test 5)
- [ ] Past deadlines handled gracefully (Test 6)
- [ ] Far future deadlines handled gracefully (Test 7)
- [ ] localStorage updates on deadline change (Test 8)

**All tests passing** = Feature ready for merge ✅
