# Feature Specification: Total Album Duration Display

**Feature Branch**: `006-total-album-duration`
**Created**: 2025-11-21
**Status**: Draft
**Input**: User description: "Calculate a total running time as a sum of all song durations and display this in the summary banner"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Total Album Duration (Priority: P1) - MVP

Users can see the total running time of all songs combined, displayed prominently in the summary banner alongside the album release countdown. This provides immediate visibility into the total length of the album without manual calculation.

**Why this priority**: Core functionality that delivers immediate value. Users need to know total album length for planning recording sessions, estimating production time, and understanding overall album scope. This is the minimum viable product.

**Independent Test**: Can be fully tested by viewing the summary banner and verifying the total duration displays correctly as the sum of all song durations. Delivers immediate value by showing total album length.

**Acceptance Scenarios**:

1. **Given** the album dashboard is displayed, **When** the user views the summary banner, **Then** the total album duration is displayed in hours and minutes format (e.g., "1h 23m")
2. **Given** all songs have zero duration, **When** the user views the summary banner, **Then** the total duration displays as "0m"
3. **Given** songs have various durations set, **When** the user views the summary banner, **Then** the total duration accurately sums all individual song durations

---

### User Story 2 - Real-Time Duration Updates (Priority: P2)

Users see the total album duration update immediately when they edit any individual song's duration, providing instant feedback on how changes affect the overall album length.

**Why this priority**: Enhances user experience by providing immediate feedback, but the feature is functional without it. Users can refresh to see updates if real-time isn't available initially.

**Independent Test**: Can be tested by editing a song duration and verifying the total updates without page refresh. Delivers value by showing immediate impact of duration changes.

**Acceptance Scenarios**:

1. **Given** the total duration is displayed, **When** a user edits a song duration and saves, **Then** the total duration updates immediately without page refresh
2. **Given** a user is editing multiple song durations in quick succession, **When** each duration is saved, **Then** the total duration reflects the cumulative changes accurately
3. **Given** a user cancels a duration edit (Escape key), **When** the edit is canceled, **Then** the total duration remains unchanged

---

### User Story 3 - Duration Format Display Options (Priority: P3)

Users see the total duration formatted appropriately based on album length - showing hours and minutes for longer albums, or just minutes for shorter albums, ensuring the display is always clear and appropriate for the context.

**Why this priority**: Nice-to-have enhancement for better UX, but basic duration display is sufficient for MVP. Can be added after core functionality is stable.

**Independent Test**: Can be tested by setting various total durations and verifying the format adapts appropriately (e.g., "45m" vs "1h 15m"). Delivers value through clearer presentation.

**Acceptance Scenarios**:

1. **Given** the total album duration is under 60 minutes, **When** the user views the summary banner, **Then** the duration displays in minutes only (e.g., "45m")
2. **Given** the total album duration is 60 minutes or more, **When** the user views the summary banner, **Then** the duration displays in hours and minutes (e.g., "1h 15m")
3. **Given** the total album duration is exactly a whole number of hours, **When** the user views the summary banner, **Then** the duration displays cleanly (e.g., "2h" not "2h 0m")

---

### Edge Cases

- What happens when the total duration exceeds 999 hours (e.g., unrealistic data)?
  - System caps display at "999h+" to prevent layout issues
- How does the system handle fractional seconds from song durations?
  - System rounds to nearest minute for total duration display (individual songs already store whole minutes and seconds)
- What happens if individual song durations become invalid (e.g., negative values)?
  - System treats invalid/negative durations as 0:00 when calculating total
- How does the system handle an empty album (0 songs)?
  - System displays "0m" as total duration
- What happens during initial load before song data is available?
  - System shows "0m" as default until data loads, then updates

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate total album duration by summing all individual song durations (minutes and seconds)
- **FR-002**: System MUST display the total duration in the summary banner (the section showing the album release countdown)
- **FR-003**: System MUST format the total duration as "Xh Ym" when total is 60 minutes or more (e.g., "1h 23m")
- **FR-004**: System MUST format the total duration as "Xm" when total is under 60 minutes (e.g., "45m")
- **FR-005**: System MUST omit zero minutes when displaying hours-only durations (e.g., "2h" not "2h 0m")
- **FR-006**: System MUST update the total duration immediately when any song duration changes
- **FR-007**: System MUST handle songs with zero duration (0:00) by including them as 0 in the total calculation
- **FR-008**: System MUST treat invalid or missing song durations as 0:00 when calculating total
- **FR-009**: System MUST display total duration on initial page load based on saved song data
- **FR-010**: System MUST recalculate total duration whenever songs are added or removed (if applicable)

### Key Entities

- **Album Duration**: Aggregate value representing the sum of all song durations
  - Calculated from existing song duration data (minutes and seconds)
  - Displayed in summary banner
  - Updates reactively based on song duration changes
  - Format: Hours and minutes, or minutes only depending on total length

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view total album duration without manually calculating it (reduces cognitive load)
- **SC-002**: Total duration displays correctly for all album lengths from 0 minutes to 999+ hours
- **SC-003**: Total duration updates within 1 second of editing any song duration (real-time feedback)
- **SC-004**: Total duration calculation accuracy is 100% (sum of all song durations matches displayed total)
- **SC-005**: Duration format is readable and appropriate for album length (no unnecessary precision or clutter)
- **SC-006**: Users can plan recording sessions based on accurate total album duration

## Assumptions

- The summary banner refers to the existing countdown timer section at the top of the dashboard
- Total duration should be displayed near or alongside the countdown timer for easy visibility
- Song duration data already exists from the previous feature (005-song-duration)
- Total duration should round up partial minutes (e.g., 59 seconds rounds to 1 minute for total display)
- No need for total duration editing - it's a calculated/derived value only
- Total duration should persist across page refreshes (derived from saved song data)
- Maximum realistic album duration is under 1000 hours (capped display at "999h+")

## Dependencies

- Feature 005-song-duration must be complete (individual song durations must be implemented)
- Summary banner/countdown timer section must exist in the UI
- Song data model includes duration field with minutes and seconds

## Out of Scope

- Editing the total duration directly (it's a calculated value)
- Breaking down total duration by album stages or sections
- Comparing total duration against target album length or industry standards
- Displaying average song duration or duration-based analytics
- Export/reporting features specifically for total duration
- Historical tracking of how total duration changes over time
- Duration-based warnings or recommendations (e.g., "album too long")
- Conversion to different time formats (seconds, decimal hours, etc.)
