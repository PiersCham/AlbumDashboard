# Research: Total Album Duration Display

**Feature**: 006-total-album-duration
**Date**: 2025-11-21
**Purpose**: Research duration calculation, formatting patterns, and display strategies

## Research Questions

1. How should total duration be calculated from individual song durations?
2. What format should be used for displaying total album duration?
3. Where should total duration appear in the Header component layout?
4. How should the calculation be optimized for React re-renders?
5. What edge cases need handling (empty songs, invalid durations)?

---

## Decision 1: Duration Calculation Method

**Chosen**: Sum all song durations (minutes and seconds), then convert to total minutes for formatting

**Rationale**:
- Songs store duration as `{minutes: number, seconds: number}`
- Total calculation: convert each song to total seconds, sum, then format output
- Handles seconds overflow automatically (e.g., 90 seconds becomes 1 minute 30 seconds)
- Simple reduce operation on songs array

**Alternatives Considered**:
- Calculate minutes and seconds separately: Rejected - requires manual overflow handling, more error-prone
- Store pre-calculated total in state: Rejected - violates single source of truth, potential sync issues
- Use external library (date-fns, moment): Rejected - overkill for simple sum, violates simplicity principle

**Implementation Notes**:
```javascript
const totalSeconds = songs.reduce((acc, song) => {
  const songSeconds = (song.duration.minutes * 60) + song.duration.seconds;
  return acc + songSeconds;
}, 0);

const totalMinutes = Math.floor(totalSeconds / 60);
const hours = Math.floor(totalMinutes / 60);
const minutes = totalMinutes % 60;
```

---

## Decision 2: Display Format Strategy

**Chosen**: Adaptive format based on total duration length

**Rationale**:
- Industry standard: shorter durations show minutes only, longer show hours + minutes
- Reduces visual clutter for typical album lengths (30-60 minutes)
- Clear distinction: "45m" vs "1h 15m" is immediately scannable
- Omit zero values for cleaner display (e.g., "2h" not "2h 0m")

**Format Rules**:
1. **< 60 minutes**: Display as "Xm" (e.g., "45m", "12m")
2. **≥ 60 minutes with remainder**: Display as "Xh Ym" (e.g., "1h 23m", "2h 45m")
3. **Exact hours**: Display as "Xh" (e.g., "2h", "3h")
4. **Edge case (≥1000 hours)**: Cap at "999h+" to prevent layout issues

**Alternatives Considered**:
- Always show "HH:MM" format: Rejected - less readable than "1h 23m", not industry standard for album length
- Always show hours: Rejected - "0h 45m" is unnecessarily verbose for short albums
- Decimal hours: Rejected - "1.5h" is less intuitive than "1h 30m" for musicians

**Implementation**:
```javascript
function formatTotalDuration(totalMinutes) {
  if (totalMinutes >= 59940) return "999h+"; // Cap at 999 hours

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
```

---

## Decision 3: Display Location in Header

**Chosen**: Replace current song count display ("X/13") with total duration

**Rationale**:
- Current layout (line 342-344): Shows "X/13" between album title and countdown timer
- Total duration is more valuable than song count for planning purposes
- Maintains visual balance in Header component
- Positioned centrally for easy visibility
- Consistent with existing Header styling patterns

**Layout**:
```
[Album Title]  [Total Duration]  [Time to Goal + Countdown]
```

**Alternatives Considered**:
- Add below countdown timer: Rejected - pushes content down, creates visual imbalance
- Add inside countdown timer section: Rejected - clutters countdown display, reduces scanability
- Keep song count and add duration: Rejected - too much information, violates simplicity principle
- Add as separate banner: Rejected - adds complexity, not needed for single derived value

---

## Decision 4: React Performance Optimization

**Chosen**: Use `useMemo` to memoize total duration calculation

**Rationale**:
- Calculation runs on every render if not memoized
- useMemo dependency: `songs` array (only recalculate when songs change)
- Prevents unnecessary recalculation during unrelated re-renders (e.g., countdown timer updates every second)
- Follows React best practices for derived state
- Zero performance impact for 12 songs (sum operation is O(n) with n=12)

**Implementation**:
```javascript
const totalDuration = useMemo(() => {
  const totalSeconds = songs.reduce((acc, song) => {
    const songSeconds = (song.duration.minutes * 60) + song.duration.seconds;
    return acc + songSeconds;
  }, 0);

  return Math.floor(totalSeconds / 60); // Return total minutes
}, [songs]);
```

**Alternatives Considered**:
- Calculate inline without useMemo: Rejected - runs on every render, wasteful
- Store in separate state: Rejected - violates single source of truth, sync complexity
- Use useEffect to update state: Rejected - unnecessary state updates, more complex than useMemo

---

## Decision 5: Edge Case Handling

**Chosen**: Defensive calculation with fallbacks

**Rationale**:
- Handle missing duration gracefully (treat as 0:00)
- Handle invalid negative values (clamp to 0)
- Handle empty songs array (display "0m")
- Maintain calculation accuracy even with edge cases

**Edge Cases**:
1. **Empty songs array**: `totalDuration = 0` → displays "0m"
2. **Missing duration field**: Treat as `{minutes: 0, seconds: 0}`
3. **Invalid duration (negative)**: Clamp to 0 during calculation
4. **Very large totals (>999h)**: Cap display at "999h+"

**Implementation**:
```javascript
const totalSeconds = songs.reduce((acc, song) => {
  if (!song.duration) return acc; // Handle missing duration

  const minutes = Math.max(0, song.duration.minutes || 0);
  const seconds = Math.max(0, song.duration.seconds || 0);
  const songSeconds = (minutes * 60) + seconds;

  return acc + songSeconds;
}, 0);
```

**Alternatives Considered**:
- Throw error on invalid data: Rejected - breaks user experience, violates data integrity principle
- Display error message instead of duration: Rejected - better to show "0m" than error text
- Skip invalid songs in calculation: Rejected - less transparent, user won't know why total is lower

---

## Decision 6: Display Styling

**Chosen**: Match existing Header component text styling (font-black, tracking-wider)

**Rationale**:
- Consistency with album title and countdown timer
- Clear hierarchy: same visual weight as other header elements
- Positioned centrally for balanced layout
- Uses existing Tailwind classes from Header component

**Styling**:
```javascript
<div className="text-2xl font-black tracking-wider">
  {formatTotalDuration(totalDuration)}
</div>
```

**Alternatives Considered**:
- Smaller text size: Rejected - reduces importance, harder to scan
- Different color: Rejected - unnecessary distinction, breaks visual consistency
- Add label "Total:": Rejected - adds clutter, duration format is self-explanatory

---

## Summary

**Core Design Decisions**:
1. Calculation method: Sum total seconds from all songs, convert to total minutes
2. Display format: Adaptive ("Xm" vs "Xh Ym") based on total duration
3. Display location: Replace song count in Header component (center position)
4. Optimization: useMemo with songs dependency
5. Edge cases: Defensive calculation with 0-fallbacks and 999h+ cap
6. Styling: Match existing Header text styles (font-black, tracking-wider)

**No unresolved questions** - all decisions align with existing codebase patterns and constitutional principles.
