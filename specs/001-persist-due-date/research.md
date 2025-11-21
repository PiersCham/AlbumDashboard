# Research: Persist Due Date in Imports/Exports

**Feature**: 001-persist-due-date
**Date**: 2025-11-19
**Purpose**: Research best practices for localStorage persistence, data migration patterns, and deadline validation in React applications

## Research Questions

1. How to reliably persist ISO 8601 timestamps in localStorage?
2. What are best practices for schema migration in client-side applications?
3. How to validate and sanitize imported JSON data?
4. What fallback strategies work best for corrupt/missing deadline data?

---

## 1. LocalStorage Persistence for ISO 8601 Timestamps

### Decision

Store deadline as ISO 8601 string (e.g., `"2026-08-01T00:00:00.000Z"`) in localStorage within the existing `albumProgress_v3` key structure.

### Rationale

- **Already Implemented**: The codebase already persists `targetISO` in localStorage (line 525 in App.jsx)
- **ISO 8601 is standard**: JavaScript `Date.toISOString()` produces this format natively
- **Timezone-safe**: UTC timestamps avoid local timezone ambiguity
- **JSON-serializable**: String format works in both localStorage and JSON export

### Implementation Pattern (Existing)

```javascript
// State initialization (already in App.jsx line 511)
const [targetISO, setTargetISO] = useState(
  () => stored.targetISO || new Date("2026-08-01T00:00:00").toISOString()
);

// Persistence (already in App.jsx line 524-526)
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, targetISO, albumTitle }));
}, [songs, targetISO, albumTitle]);
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Store as Unix timestamp (number) | Less human-readable in JSON exports; requires conversion to/from Date |
| Store as local datetime string | Timezone issues when user travels or changes system clock |
| Store separate date/time fields | More complex schema; violates Simplicity First principle |

### Best Practices Applied

- ✅ Use native `Date` object methods (`toISOString()`, `new Date(isoString)`)
- ✅ Store in same localStorage key as other state (atomic update)
- ✅ Include in dependency array for `useEffect` to trigger saves

---

## 2. Schema Migration Patterns for Client-Side Apps

### Decision

Extend the existing `migrateSongs()` function pattern to handle deadline migration. Create a new `migrateDeadline()` helper that validates and provides fallback for missing/invalid deadline data.

### Rationale

- **Existing Pattern**: The codebase already has `migrateSongs()` (lines 497-507) for backward compatibility
- **Consistency**: Following the same pattern maintains code readability
- **Simplicity**: Single-purpose migration functions are easier to test and reason about

### Implementation Pattern

```javascript
// New function to add alongside migrateSongs
const migrateDeadline = (storedDeadline) => {
  // If valid ISO string exists, use it
  if (storedDeadline && isValidISODate(storedDeadline)) {
    return storedDeadline;
  }

  // Fallback: 12 months from now
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  return defaultDate.toISOString();
};

// Helper for validation
const isValidISODate = (dateString) => {
  if (typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Usage in state initialization
const [targetISO, setTargetISO] = useState(() => migrateDeadline(stored.targetISO));
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Version-based migration system | Over-engineering for single field; violates Simplicity First |
| Throw error on invalid data | Violates Data Integrity principle (graceful degradation required) |
| Prompt user for deadline on invalid data | Poor UX; prefer silent fallback with default |

### Best Practices Applied

- ✅ Validate data type before parsing (check `typeof dateString === 'string'`)
- ✅ Use `Date.parse()` or `new Date()` constructor for validation
- ✅ Provide sensible default (12 months from current date)
- ✅ Never crash on invalid data (return fallback instead)

---

## 3. JSON Import Validation and Sanitization

### Decision

Add validation to the `importJSON` function to check for deadline field presence and validity before applying imported data. Use the same `migrateDeadline()` helper for consistency.

### Rationale

- **Security**: Prevent malicious/corrupt JSON from crashing the app
- **Data Integrity**: Ensure imported data meets schema expectations
- **User Trust**: Failed imports should show clear error messages, not silent corruption

### Implementation Pattern

```javascript
// Enhance existing importJSON function (lines 187-228)
const importJSON = async () => {
  // ... existing file picker logic ...

  try {
    const data = JSON.parse(txt);

    // Validate required fields
    if (!data.songs || !Array.isArray(data.songs)) {
      alert('Invalid JSON: missing or malformed songs data');
      return;
    }

    // Migrate/validate deadline (use helper)
    const validatedData = {
      songs: migrateSongs(data.songs),
      albumTitle: data.albumTitle || 'Album Dashboard',
      targetISO: migrateDeadline(data.targetISO)
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedData));
    window.location.reload();
  } catch (e) {
    alert('Invalid JSON file: ' + e.message);
  }
};
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| JSON Schema validation library | Adds dependency; violates Simplicity First |
| Detailed validation for every field | Over-engineering; trust user's exported data |
| Reject import on any missing field | Too strict; prevents backward compatibility |

### Best Practices Applied

- ✅ Wrap JSON.parse in try/catch
- ✅ Validate required fields (`songs` array must exist)
- ✅ Provide user-friendly error messages (`alert()` for import failures)
- ✅ Reuse migration helpers for consistency

---

## 4. Fallback Strategies for Corrupt/Missing Deadline Data

### Decision

Use tiered fallback strategy:
1. **Primary**: Use stored `targetISO` if valid ISO 8601 string
2. **Fallback**: If missing/invalid, default to 12 months from current date
3. **Never error**: Always provide a functional deadline

### Rationale

- **Data Integrity Principle**: "Graceful degradation: corrupt or missing data doesn't break the application"
- **User Experience Principle**: "Zero data loss: all user actions must be recoverable"
- **Simplicity Principle**: "No abstraction layers without demonstrated need"

### Fallback Logic

```javascript
const DEFAULT_DEADLINE_OFFSET_MONTHS = 12;

const migrateDeadline = (storedDeadline) => {
  // Tier 1: Valid stored deadline
  if (storedDeadline && isValidISODate(storedDeadline)) {
    return storedDeadline;
  }

  // Tier 2: Default fallback (12 months from now)
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + DEFAULT_DEADLINE_OFFSET_MONTHS);
  return defaultDate.toISOString();
};
```

### Edge Cases Handled

| Edge Case | Handling Strategy |
|-----------|-------------------|
| `targetISO` is `undefined` | Fallback to 12 months from now |
| `targetISO` is `null` | Fallback to 12 months from now |
| `targetISO` is non-string type | Fallback to 12 months from now |
| `targetISO` is malformed ISO string | Fallback to 12 months from now (Date parse fails) |
| `targetISO` is far in the past | Accept it (allow negative countdown per spec US3) |
| `targetISO` is far in the future | Accept it (validation in US3 is optional P3 feature) |
| localStorage quota exceeded | Not handled here (browser handles with error; rare for small data) |
| localStorage disabled | App won't persist (acceptable degradation; no workaround possible) |

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Show error modal on invalid deadline | Poor UX; prefer silent recovery |
| Use current date as fallback | Unhelpful (immediate deadline); 12 months is more realistic |
| Use max safe date (9999-12-31) | Meaningless deadline; violates User Experience principle |

---

## Summary of Decisions

| Research Question | Decision | Key Takeaway |
|-------------------|----------|--------------|
| **Timestamp Format** | ISO 8601 string in localStorage | Already implemented; no changes needed |
| **Migration Pattern** | Create `migrateDeadline()` helper function | Follows existing `migrateSongs()` pattern |
| **Import Validation** | Validate in `importJSON`, use migration helper | Reuse existing patterns for consistency |
| **Fallback Strategy** | Default to 12 months from current date | Graceful degradation, no crashes |

## Implementation Checklist

- [ ] Create `isValidISODate(dateString)` helper function
- [ ] Create `migrateDeadline(storedDeadline)` helper function
- [ ] Update state initialization to use `migrateDeadline(stored.targetISO)`
- [ ] Enhance `importJSON` to validate and migrate deadline field
- [ ] Add manual test: import JSON without `targetISO` field (verify fallback works)
- [ ] Add manual test: import JSON with malformed `targetISO` (verify fallback works)
- [ ] Add automated test: `isValidISODate()` with valid/invalid inputs (if adding test framework)
- [ ] Add automated test: `migrateDeadline()` with various inputs (if adding test framework)

## References

- Existing codebase: `src/App.jsx` lines 487-526 (state initialization and persistence)
- MDN Web Docs: [Date.toISOString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)
- Constitution: Principle III (Data Integrity and Ownership)
- Feature Spec: `specs/001-persist-due-date/spec.md` (FR-005, FR-008, edge cases)
