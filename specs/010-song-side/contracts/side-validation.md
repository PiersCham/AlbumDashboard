# Side Validation Contract

**Feature**: 010-song-side | **Date**: 2025-11-28

## Overview

This contract defines the validation rules for the Song `side` field across all contexts (user input, data migration, import/export).

## Valid Values

| Value | Type | Description | Display |
|-------|------|-------------|---------|
| `""` | String (empty) | No side assigned | No border accent |
| `"1"` | String | Side 1 | Blue border |
| `"2"` | String | Side 2 | Purple border |

**Total Valid States**: 3

## Validation Function

```javascript
/**
 * Validates a side value
 * @param {*} value - Value to validate (any type)
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidSide(value) {
  return typeof value === 'string' &&
         (value === "" || value === "1" || value === "2");
}
```

## Sanitization Function

```javascript
/**
 * Sanitizes a side value to a valid default
 * @param {*} value - Value to sanitize (any type)
 * @returns {string} - Valid side value (guaranteed)
 */
function sanitizeSide(value) {
  if (typeof value === 'string' &&
      (value === "" || value === "1" || value === "2")) {
    return value;
  }
  return ""; // Default to no side
}
```

## Context-Specific Rules

### 1. User Input (Detail View Text Field)

**Context**: User typing in Side input field in SongDetail component

**Rules**:
- Input accepts any text (controlled component)
- Validation runs on `onBlur` event
- Valid values (`""`, `"1"`, `"2"`) → Save to state + localStorage
- Invalid values → Visual feedback (red border), no save, input remains in error state

**Validation Trigger**: `onBlur`

**Feedback**:
- Valid: Green/neutral border, value saved
- Invalid: Red border (`border-red-500`), previous valid value retained

**Implementation**:
```javascript
const handleSideBlur = () => {
  const valid = isValidSide(sideInput);
  setIsValidSide(valid);

  if (valid) {
    onUpdate({ ...song, side: sideInput });
  }
  // If invalid, sideInput stays in error state until user corrects
};
```

### 2. Data Migration (localStorage Load)

**Context**: Loading songs from localStorage or DEFAULT_SONGS

**Rules**:
- Missing `side` field → Add `side: ""`
- Invalid `side` value → Replace with `""`
- Valid `side` value → Preserve as-is

**Sanitization**: Applied in `migrateSongs` function

**Implementation**:
```javascript
const side = sanitizeSide(song.side);
return { ...song, side };
```

### 3. JSON Import

**Context**: User imports album data from JSON file

**Rules**:
- Same as data migration (uses `migrateSongs` function)
- Invalid values logged to console (optional) but silently corrected
- No user-facing errors or prompts

**Implementation**:
```javascript
const data = JSON.parse(txt);
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
window.location.reload(); // Triggers migrateSongs on next load
```

### 4. JSON Export

**Context**: User exports album data to JSON file

**Rules**:
- Export `side` field as-is (already validated on save)
- No additional validation needed (data integrity guaranteed by input validation)

**Implementation**:
```javascript
const data = JSON.stringify({ songs, albumTitle, targetISO }, null, 2);
// Side field automatically included
```

### 5. Grid Display

**Context**: Rendering SongCard components in grid view

**Rules**:
- `side === "1"` → Display blue badge "Side 1" next to title
- `side === "2"` → Display purple badge "Side 2" next to title
- `side === ""` or falsy → No badge displayed

**Fallback**: If `side` is somehow invalid at render time (should never happen), no badge shown

**Implementation**:
```javascript
{song.side && (
  <span className={`text-xs px-2 py-0.5 rounded ${
    song.side === "1" ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
  }`}>
    Side {song.side}
  </span>
)}
```

## Invalid Value Examples

All of these will be sanitized to `""`:

| Input Value | Type | Reason Invalid |
|-------------|------|----------------|
| `null` | Null | Not a string |
| `undefined` | Undefined | Not a string |
| `1` | Number | Not a string |
| `2` | Number | Not a string |
| `"3"` | String | Not in allowed set |
| `"A"` | String | Not in allowed set |
| `"Side 1"` | String | Wrong format |
| `"  1  "` | String | Whitespace not allowed |
| `" "` | String | Whitespace-only not allowed |
| `true` | Boolean | Not a string |
| `{}` | Object | Not a string |
| `[]` | Array | Not a string |

## Edge Cases

### Case 1: Rapid Input Changes

**Scenario**: User types "1", then "2", then "3" rapidly

**Behavior**:
- Each change updates `sideInput` state
- OnBlur fires after final change
- Validation runs once: "3" is invalid → Red border, no save

**Result**: Previous valid value (or `""` if none) retained

### Case 2: Navigate Away During Invalid Input

**Scenario**: User types "invalid", then clicks Zoom button without blurring input

**Behavior**:
- `onBlur` not triggered
- Invalid value stays in `sideInput` state but not saved
- On return to detail view, `sideInput` resets to `song.side` (last valid value)

**Result**: Invalid input discarded, data integrity preserved

### Case 3: Import JSON with Mixed Valid/Invalid Sides

**Scenario**: JSON file contains `{"side": "1"}`, `{"side": "invalid"}`, `{}`

**Behavior**:
- `migrateSongs` processes each song
- `"1"` → Preserved
- `"invalid"` → Sanitized to `""`
- Missing field → Defaults to `""`

**Result**: All songs have valid `side` values after import

### Case 4: Older Version Imports New Format

**Scenario**: User exports from version with `side` field, imports to older version without it

**Behavior**:
- Older version's `migrateSongs` doesn't know about `side`
- Field remains in JSON but is ignored
- No errors thrown (extra fields harmless)

**Result**: Backward compatibility maintained, no data loss

## Testing Checklist

- [ ] Valid input "1" saves and applies blue border
- [ ] Valid input "2" saves and applies purple border
- [ ] Empty input "" saves and removes border accent
- [ ] Invalid input "3" shows red border and doesn't save
- [ ] Blur with invalid input retains previous valid value
- [ ] Import JSON without `side` field adds `side: ""`
- [ ] Import JSON with `side: null` sanitizes to `""`
- [ ] Import JSON with `side: "invalid"` sanitizes to `""`
- [ ] Export includes `side` field for all songs
- [ ] Grid badges match side assignments (Side 1: blue, Side 2: purple)
- [ ] Rapid changes only validate final blurred value
- [ ] Navigate away with invalid input doesn't corrupt data

## Performance Notes

- Validation function (`isValidSide`) runs in O(1) time (3 equality checks)
- Sanitization function (`sanitizeSide`) runs in O(1) time (same checks + default assignment)
- No regex, no loops, no external dependencies
- Minimal impact on render performance

## Related Documentation

- [Data Model](../data-model.md) - Full Song schema
- [Quickstart Guide](../quickstart.md) - Implementation steps
- [Feature Spec](../spec.md) - User requirements
