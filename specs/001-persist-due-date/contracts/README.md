# API Contracts: Persist Due Date Feature

**Feature**: 001-persist-due-date
**Date**: 2025-11-19

## Overview

This feature is **client-side only** and does not involve any API endpoints or network communication. All data persistence occurs via browser localStorage and File System Access API (for import/export).

## No API Contracts Required

Since AlbumDashboard is a fully client-side application with no backend, there are no REST, GraphQL, or RPC contracts to define.

## Browser API Usage

### LocalStorage API

**Purpose**: Persist application state including deadline

**Usage**:
```javascript
// Write
localStorage.setItem('albumProgress_v3', JSON.stringify({
  songs: [...],
  albumTitle: "...",
  targetISO: "2026-08-01T00:00:00.000Z"
}));

// Read
const data = JSON.parse(localStorage.getItem('albumProgress_v3'));
```

**Contract**:
- **Key**: `albumProgress_v3` (string constant)
- **Value**: JSON string containing `{ songs, albumTitle, targetISO }`
- **Errors**: May throw `QuotaExceededError` if storage limit exceeded (rare for small data)

### File System Access API

**Purpose**: Export/import JSON files for backup

**Export Usage**:
```javascript
const handle = await window.showSaveFilePicker({
  suggestedName: 'album_dashboard.json',
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
});
const writable = await handle.createWritable();
await writable.write(jsonBlob);
await writable.close();
```

**Import Usage**:
```javascript
const [handle] = await window.showOpenFilePicker({
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
  multiple: false
});
const file = await handle.getFile();
const text = await file.text();
const data = JSON.parse(text);
```

**Contract**:
- **File Format**: JSON (`.json` extension)
- **Schema**: Same as localStorage structure (see data-model.md)
- **Errors**:
  - `AbortError` if user cancels file picker
  - `SyntaxError` if JSON is malformed
  - `TypeError` if file type is invalid

## Internal Function Contracts

While not API contracts, these internal functions have explicit contracts:

### `isValidISODate(dateString: string): boolean`

**Purpose**: Validate ISO 8601 date string

**Input**:
- `dateString` (any type, but expects string)

**Output**:
- `true` if valid ISO 8601 date
- `false` otherwise

**Examples**:
```javascript
isValidISODate("2026-08-01T00:00:00.000Z") // → true
isValidISODate("not-a-date")               // → false
isValidISODate(null)                       // → false
isValidISODate(12345)                      // → false
```

### `migrateDeadline(storedDeadline: any): string`

**Purpose**: Validate and migrate deadline with fallback

**Input**:
- `storedDeadline` (any type, typically string or undefined)

**Output**:
- Valid ISO 8601 string (always)

**Behavior**:
- If input is valid ISO string → return unchanged
- Otherwise → return default (12 months from current date)

**Examples**:
```javascript
migrateDeadline("2027-01-01T00:00:00.000Z") // → "2027-01-01T00:00:00.000Z"
migrateDeadline(undefined)                  // → "2026-11-19T12:34:56.789Z" (approx)
migrateDeadline("invalid")                  // → "2026-11-19T12:34:56.789Z" (approx)
```

### `toLocalDatetimeInputValue(isoString: string): string`

**Purpose**: Convert ISO 8601 to datetime-local input format

**Input**:
- `isoString` (ISO 8601 timestamp)

**Output**:
- `"YYYY-MM-DDTHH:mm"` (datetime-local format)

**Example**:
```javascript
toLocalDatetimeInputValue("2026-08-01T14:30:00.000Z")
// → "2026-08-01T14:30"
```

### `fromLocalDatetimeInputValue(value: string): string`

**Purpose**: Convert datetime-local input to ISO 8601

**Input**:
- `value` (datetime-local format: `"YYYY-MM-DDTHH:mm"`)

**Output**:
- ISO 8601 string

**Example**:
```javascript
fromLocalDatetimeInputValue("2026-08-01T14:30")
// → "2026-08-01T14:30:00.000Z" (UTC)
```

## Summary

- **No HTTP APIs** - client-side only
- **No GraphQL** - no server component
- **No WebSockets** - no real-time sync
- **Browser APIs only** - localStorage + File System Access API
- **Internal contracts** - validation and migration helpers documented above

For detailed schema and validation rules, see [data-model.md](../data-model.md).
