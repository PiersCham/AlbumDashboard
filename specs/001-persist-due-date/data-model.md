# Data Model: Persist Due Date in Imports/Exports

**Feature**: 001-persist-due-date
**Date**: 2025-11-19
**Purpose**: Define the Target Deadline entity and its integration with existing data structures

## Overview

This feature extends the existing localStorage data model to ensure the `targetISO` field (Target Deadline) is properly validated, migrated, and persisted. No new entities are introduced; this document formalizes the existing deadline field.

## Entity: Target Deadline

### Description

Represents the user's desired album completion date and time. Used by the countdown timer in the application header to display remaining time until deadline.

### Schema

```typescript
// Type definition (for reference - not TypeScript in actual codebase)
type TargetDeadline = string; // ISO 8601 timestamp

// Example values
"2026-08-01T00:00:00.000Z"  // Valid: August 1, 2026 at midnight UTC
"2025-12-31T23:59:59.999Z"  // Valid: December 31, 2025 at 11:59:59 PM UTC
"2024-01-15T14:30:00.000Z"  // Valid: Past date (allowed - shows negative countdown)
```

### Attributes

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| targetISO | string | Yes | ISO 8601 timestamp of deadline | Must be valid ISO 8601 format; validated with `new Date(targetISO)` |

### Constraints

- **Format**: Must be ISO 8601 string (e.g., `"YYYY-MM-DDTHH:mm:ss.sssZ"`)
- **Timezone**: Stored in UTC (trailing `Z`)
- **Precision**: Millisecond precision (`.sss` component)
- **Range**: No enforced min/max (allows past dates, far future dates)

### Default Value

When missing or invalid:
```javascript
const defaultDate = new Date();
defaultDate.setFullYear(defaultDate.getFullYear() + 12);
return defaultDate.toISOString(); // 12 months from current date
```

### State Transitions

```mermaid
stateDiagram-v2
    [*] --> Loading: App initializes
    Loading --> Valid: targetISO exists in localStorage and is valid
    Loading --> Default: targetISO missing/invalid
    Valid --> Updated: User edits deadline
    Default --> Updated: User sets first deadline
    Updated --> Persisted: Auto-save to localStorage
    Persisted --> Valid: Page refresh/reload
```

**Explanation**:
1. **Loading**: App reads from localStorage (`STORAGE_KEY: "albumProgress_v3"`)
2. **Valid**: Existing deadline is valid ISO 8601 string
3. **Default**: Missing/invalid deadline triggers fallback (12 months from now)
4. **Updated**: User changes deadline via datetime picker in header
5. **Persisted**: `useEffect` triggers, saves to localStorage
6. **Valid**: On next page load, persisted deadline is loaded

---

## Integration with Existing Data Model

### LocalStorage Structure

```json
{
  "songs": [
    {
      "id": 1,
      "title": "Song Name",
      "stages": [
        { "name": "Demo", "value": 75 },
        { "name": "Drums", "value": 50 }
      ]
    }
  ],
  "albumTitle": "Album Dashboard",
  "targetISO": "2026-08-01T00:00:00.000Z"  // ← THIS FIELD
}
```

**Storage Key**: `albumProgress_v3`

**Existing Fields**:
- `songs` (array): Album track progress
- `albumTitle` (string): User-defined album name
- `targetISO` (string): **This feature's focus**

### Relationship to Other Entities

```
┌─────────────────┐
│  AlbumProgress  │  (localStorage root object)
│  (v3 schema)    │
└────────┬────────┘
         │
         ├─── songs[]           (array of Song entities)
         ├─── albumTitle        (string)
         └─── targetISO         (Target Deadline - THIS FEATURE)
                    │
                    ├─── Used by: useCountdown() hook
                    ├─── Displayed in: Header component
                    └─── Editable via: datetime-local input
```

**Dependencies**:
- **useCountdown(targetISO)**: Custom hook that calculates days/hours/minutes/seconds remaining
- **Header component**: Displays countdown and allows deadline editing
- **ExportImport component**: Includes targetISO in JSON export/import

---

## Validation Rules

### On Load (from localStorage)

```javascript
const isValidISODate = (dateString) => {
  if (typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const migrateDeadline = (storedDeadline) => {
  if (storedDeadline && isValidISODate(storedDeadline)) {
    return storedDeadline; // Valid
  }
  // Invalid/missing: fallback to 12 months from now
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 12);
  return defaultDate.toISOString();
};
```

**Validation Flow**:
1. Check if `storedDeadline` is string type
2. Parse with `new Date(dateString)`
3. Validate result is valid Date object (not NaN)
4. If invalid, fallback to default (12 months from now)

### On Import (from JSON file)

Same validation as localStorage load:
```javascript
const validatedData = {
  songs: migrateSongs(data.songs),
  albumTitle: data.albumTitle || 'Album Dashboard',
  targetISO: migrateDeadline(data.targetISO) // ← Reuse validation
};
```

### On User Input (datetime picker)

```javascript
// User interacts with datetime-local input
<input
  type="datetime-local"
  value={toLocalDatetimeInputValue(targetISO)}  // Convert ISO → local datetime
  onChange={(e) => setTargetISO(fromLocalDatetimeInputValue(e.target.value))}  // Convert local → ISO
/>

// Conversion functions (already exist in App.jsx)
function fromLocalDatetimeInputValue(value) {
  const d = new Date(value);
  return d.toISOString(); // Browser ensures valid input
}
```

**Browser validation**: `<input type="datetime-local">` only allows valid datetime values (browser enforces)

---

## Migration Strategy

### Backward Compatibility

| Source | Scenario | Handling |
|--------|----------|----------|
| **Old localStorage** | User has `albumProgress_v3` without `targetISO` | `migrateDeadline(undefined)` → 12 months from now |
| **Old JSON export** | User imports JSON without `targetISO` field | `migrateDeadline(undefined)` → 12 months from now |
| **Corrupt localStorage** | `targetISO: null` or `targetISO: 12345` | `migrateDeadline(null)` → 12 months from now |
| **Malformed ISO string** | `targetISO: "invalid-date"` | `new Date("invalid-date")` → NaN → fallback |

### Forward Compatibility

Future versions of the app can safely assume `targetISO` exists and is a valid ISO 8601 string, because the migration function ensures it.

---

## Usage Examples

### Reading Target Deadline

```javascript
// In App.jsx state initialization
const [targetISO, setTargetISO] = useState(
  () => migrateDeadline(stored.targetISO)
);

// In useCountdown hook
const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
const remaining = Math.max(0, target - now);
```

### Updating Target Deadline

```javascript
// User changes deadline via datetime picker
const handleDeadlineChange = (e) => {
  const newISO = fromLocalDatetimeInputValue(e.target.value);
  setTargetISO(newISO); // Triggers useEffect persistence
};
```

### Persisting Target Deadline

```javascript
// Auto-save via useEffect (already exists)
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, targetISO, albumTitle }));
}, [songs, targetISO, albumTitle]);
```

### Exporting Target Deadline

```javascript
// Already included in export (no changes needed)
const exportJSON = async () => {
  const data = JSON.stringify({ songs, albumTitle }, null, 2); // ← BUG: missing targetISO
  // Should be:
  const data = JSON.stringify({ songs, albumTitle, targetISO }, null, 2);
  // ... file save logic ...
};
```

**Note**: Current `exportJSON` function (line 153) **does NOT include targetISO**. This is a bug that must be fixed as part of this feature.

### Importing Target Deadline

```javascript
// Validate and migrate imported deadline
const importJSON = async () => {
  const data = JSON.parse(txt);
  const validatedData = {
    songs: migrateSongs(data.songs),
    albumTitle: data.albumTitle || 'Album Dashboard',
    targetISO: migrateDeadline(data.targetISO) // ← Add validation
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedData));
  window.location.reload();
};
```

---

## Testing Scenarios

### Unit Tests (Recommended - if test framework added)

```javascript
describe('migrateDeadline', () => {
  it('returns valid ISO string unchanged', () => {
    const valid = "2026-08-01T00:00:00.000Z";
    expect(migrateDeadline(valid)).toBe(valid);
  });

  it('returns default for undefined', () => {
    const result = migrateDeadline(undefined);
    const parsed = new Date(result);
    expect(parsed.getFullYear()).toBeGreaterThan(new Date().getFullYear());
  });

  it('returns default for invalid string', () => {
    const result = migrateDeadline("not-a-date");
    expect(isValidISODate(result)).toBe(true);
  });

  it('returns default for non-string types', () => {
    expect(isValidISODate(migrateDeadline(null))).toBe(true);
    expect(isValidISODate(migrateDeadline(12345))).toBe(true);
    expect(isValidISODate(migrateDeadline({}))).toBe(true);
  });
});
```

### Manual Tests

1. **Test Persistence**: Set deadline → refresh browser → verify countdown shows same deadline
2. **Test Export**: Set deadline → export JSON → verify file contains `targetISO` field
3. **Test Import (valid)**: Import JSON with `targetISO` → verify countdown displays imported deadline
4. **Test Import (missing)**: Import JSON without `targetISO` → verify default deadline (12 months from now)
5. **Test Import (invalid)**: Manually corrupt JSON (`targetISO: null`) → verify fallback works

---

## Summary

- **Entity**: Target Deadline (ISO 8601 string)
- **Storage**: localStorage key `albumProgress_v3.targetISO`
- **Validation**: `isValidISODate()` helper checks format
- **Migration**: `migrateDeadline()` provides 12-month default fallback
- **Bug Fix**: Export function must include `targetISO` in JSON output
- **No Schema Changes**: Extends existing localStorage structure, no breaking changes
