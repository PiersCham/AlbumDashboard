# Feature Specification: Per-Side Running Times

**Feature Branch**: `011-side-durations`
**Created**: 2025-11-28
**Status**: Draft
**Input**: User description: "Per-Side running times"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Total Duration Per Side (Priority: P1)

Users need to see the total running time for songs assigned to Side 1 and Side 2, allowing them to understand the overall length of each side of their album and make informed decisions about song placement.

**Why this priority**: This is the core value proposition - without being able to see per-side totals, users cannot effectively plan album sides. This is essential for physical media formats (vinyl, cassette) where side length matters.

**Independent Test**: Can be fully tested by assigning songs with various durations to Side 1 and Side 2, then verifying that the displayed totals accurately sum the durations for each side. Delivers immediate value by showing users if their sides are balanced or if one is significantly longer.

**Acceptance Scenarios**:

1. **Given** songs are assigned to Side 1 with durations (3:30, 4:15, 2:45), **When** user views the dashboard, **Then** Side 1 total shows 10:30
2. **Given** songs are assigned to Side 2 with durations (5:00, 3:20), **When** user views the dashboard, **Then** Side 2 total shows 8:20
3. **Given** no songs are assigned to a side, **When** user views the dashboard, **Then** that side's total shows 0:00
4. **Given** songs with zero duration are assigned to a side, **When** calculating totals, **Then** they contribute 0:00 to the total

---

### User Story 2 - Understand Side Balance (Priority: P2)

Users want to quickly assess whether their album sides are balanced in length, helping them decide if they need to move songs between sides for optimal listening experience.

**Why this priority**: While seeing totals (P1) is essential, understanding balance helps users make better decisions. This is a quality-of-life enhancement that improves the planning workflow.

**Independent Test**: Can be tested by creating albums with balanced sides (both ~20 minutes) and unbalanced sides (one 15 minutes, one 30 minutes), then verifying users can quickly identify the balance status.

**Acceptance Scenarios**:

1. **Given** Side 1 has total 20:00 and Side 2 has total 20:30, **When** viewing the dashboard, **Then** user can easily compare the two totals side-by-side
2. **Given** Side 1 has total 15:00 and Side 2 has total 30:00, **When** viewing the dashboard, **Then** the significant difference is apparent to the user
3. **Given** both sides have 0:00 duration, **When** viewing the dashboard, **Then** both sides show equal (zero) totals

---

### Edge Cases

- What happens when song durations are updated? (Totals should recalculate automatically)
- How does the system handle songs with side assignment but zero duration? (Include in count but contribute 0:00 to total)
- What happens when a song's side assignment changes? (Totals for both old and new sides update immediate)
- How are very long durations displayed (e.g., 75:30)? (Display as MM:SS format regardless of length)
- What happens with draft songs? (Excluded from duration calculations - only finalized songs count toward side totals)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate the total duration of all songs assigned to Side 1
- **FR-002**: System MUST calculate the total duration of all songs assigned to Side 2
- **FR-003**: System MUST display Side 1 total duration in MM:SS format
- **FR-004**: System MUST display Side 2 total duration in MM:SS format
- **FR-005**: System MUST update totals immediately when a song's side assignment changes
- **FR-006**: System MUST update totals immediately when a song's duration changes
- **FR-007**: System MUST handle songs with zero duration (0:00) without errors
- **FR-008**: System MUST correctly sum durations across minutes and seconds (e.g., 3:45 + 2:30 = 6:15)
- **FR-009**: System MUST handle duration totals exceeding 60 minutes (e.g., display 75:30, not 1:15:30)

### Key Entities

- **Song**: Existing entity with `duration` (minutes, seconds) and `side` ("", "1", "2") attributes
  - Duration calculation depends on both fields
  - Relationship: Multiple songs contribute to each side's total

- **Side Duration Totals**: Computed values, not stored data
  - Side 1 Total: Sum of durations for all songs where `side === "1"`
  - Side 2 Total: Sum of durations for all songs where `side === "2"`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view per-side duration totals within 1 second of loading the dashboard
- **SC-002**: Duration totals update within 500ms of changing a song's side assignment or duration
- **SC-003**: 100% of duration calculations are mathematically accurate (no rounding errors visible to user)
- **SC-004**: Users can distinguish between Side 1, Side 2, and unassigned totals at a glance
- **SC-005**: System correctly handles albums with totals exceeding 60 minutes per side

## Clarifications

### Session 2025-11-28

- Q: Should draft songs be included in duration calculations or excluded from the per-side totals? → A: Exclude draft songs - only finalized songs count toward side totals

## Assumptions

1. **Display Location**: Duration totals will be displayed prominently on the main dashboard, likely near the album title or in a summary section
2. **Real-time Updates**: Totals will recalculate immediately when song data changes (no manual refresh needed)
3. **Format**: Durations displayed in MM:SS format (e.g., "23:45" for 23 minutes 45 seconds), consistent with existing duration display
4. **Draft Songs**: Draft songs are excluded from duration calculations (only finalized songs count toward side totals)
5. **Zero Duration Songs**: Songs with 0:00 duration are valid and included in calculations (contribute nothing to total but are counted)
6. **Persistence**: Totals are calculated on-demand, not stored in localStorage (derived from song data)

## Out of Scope

- Target duration per side (e.g., "aim for 20 minutes per side")
- Warnings when a side exceeds physical media limits (e.g., vinyl capacity)
- Historical tracking of side duration changes over time
- Automatic song recommendations to balance sides
- Per-side average song duration
- Breakdown by song stage completion (e.g., "15 minutes complete, 5 minutes in progress")
