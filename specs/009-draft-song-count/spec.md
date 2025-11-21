# Feature Specification: Draft-Aware Song Count and Progress

**Feature Branch**: `009-draft-song-count`
**Created**: 2025-11-21
**Status**: Draft
**Input**: User description: "the number of total songs in the header is a count of the song cards in a non-draft state. As a result the Overall Progress bar uses only the non-draft songs to calculate the percentage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate Song Count Display (Priority: P1)

As a user tracking my album progress, I want to see an accurate count of active songs (non-draft) in the header, so that I can understand how many songs are actually part of my album plan versus work-in-progress ideas.

**Why this priority**: This is the most visible metric in the application and directly impacts user understanding of their album scope. Without this, users see misleading totals that include songs they've marked as drafts/ideas.

**Independent Test**: Can be fully tested by marking songs as draft and verifying the total song count in the header decreases to reflect only non-draft songs. Delivers immediate value by showing accurate album scope.

**Acceptance Scenarios**:

1. **Given** I have 12 songs with none marked as draft, **When** I view the header, **Then** the total song count displays "12"
2. **Given** I have 12 songs and mark 3 as draft, **When** I view the header, **Then** the total song count displays "9"
3. **Given** I have all 12 songs marked as draft, **When** I view the header, **Then** the total song count displays "0"
4. **Given** I mark a song as draft, **When** the header updates, **Then** the song count decreases by 1 immediately
5. **Given** I unmark a draft song, **When** the header updates, **Then** the song count increases by 1 immediately

---

### User Story 2 - Draft-Aware Overall Progress (Priority: P2)

As a user monitoring album completion, I want the Overall Progress percentage to reflect only non-draft songs, so that my completion metrics accurately represent the work remaining on my confirmed album tracks.

**Why this priority**: After accurate song count, users need accurate progress calculation. Including draft songs in progress would inflate completion percentage and misrepresent actual album status.

**Independent Test**: Can be fully tested by adjusting stage progress on non-draft songs and verifying overall progress percentage changes, while draft songs have no impact. Delivers value by providing accurate completion tracking.

**Acceptance Scenarios**:

1. **Given** I have 10 non-draft songs at 0% progress each, **When** I complete all stages on 5 songs, **Then** overall progress displays "50%"
2. **Given** I have 10 non-draft songs at varying progress levels, **When** I mark 2 songs as draft, **Then** overall progress recalculates using only the remaining 8 non-draft songs
3. **Given** I have 12 songs with 6 at 100% and 6 at 0%, **When** I mark the 6 incomplete songs as draft, **Then** overall progress displays "100%"
4. **Given** I have all songs marked as draft, **When** I view overall progress, **Then** it displays "0%" or a clear indicator that no active songs exist
5. **Given** I change a draft song's progress, **When** I view overall progress, **Then** the percentage remains unchanged (draft songs excluded from calculation)

---

### Edge Cases

- What happens when all songs are marked as draft (no active songs)?
  - Song count displays "0"
  - Overall progress displays "0%" or clear message like "No active songs"
- What happens when I rapidly toggle draft status on multiple songs?
  - Header updates smoothly with each change
  - No visual glitches or incorrect intermediate values
- What happens when overall progress would result in fractional percentages?
  - Round to nearest whole number (standard rounding rules: 0.5 rounds up)
  - Display as integer percentage (e.g., "67%" not "66.666%")
- What happens when songs have varying stage counts or custom stages?
  - Average progress across all stages per song, then average across all non-draft songs
  - Weighted equally regardless of stage count

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST count only non-draft songs when displaying total song count in header
- **FR-002**: System MUST update total song count immediately when a song's draft status changes
- **FR-003**: System MUST calculate overall progress percentage using only non-draft songs
- **FR-004**: System MUST recalculate overall progress immediately when a song's draft status changes
- **FR-005**: System MUST recalculate overall progress when any non-draft song's stage progress changes
- **FR-006**: System MUST NOT include draft songs in overall progress calculation even if they have progress values greater than 0%
- **FR-007**: System MUST display "0" for song count when all songs are marked as draft
- **FR-008**: System MUST display "0%" for overall progress when all songs are marked as draft
- **FR-009**: System MUST round overall progress percentage to nearest whole number
- **FR-010**: System MUST calculate overall progress as the average of all non-draft songs' average stage progress

### Key Entities *(include if feature involves data)*

- **Song Count Metric**: Represents the total number of songs in non-draft state, displayed in header
  - Derived from filtering songs array where isDraft === false
  - Updates reactively when draft status changes

- **Overall Progress Metric**: Represents the average completion percentage across all non-draft songs
  - Calculated by averaging each non-draft song's average stage progress
  - Updates reactively when draft status or stage progress changes
  - Expressed as integer percentage (0-100)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Song count in header accurately reflects non-draft songs within 100ms of draft status change
- **SC-002**: Overall progress percentage accurately reflects only non-draft songs' completion
- **SC-003**: Users can visually confirm song count changes immediately when toggling draft status (no page refresh required)
- **SC-004**: Overall progress calculation completes within 100ms even with 12 songs and varying stage counts
- **SC-005**: Overall progress displays as whole number percentage (no decimal places)
- **SC-006**: Edge case of all songs marked as draft displays clear, non-confusing values (0 songs, 0% progress)

## Assumptions

- The header already displays a total song count (from earlier features)
- The header already displays an overall progress percentage (from earlier features)
- The isDraft field exists on song objects (implemented in feature 008)
- Each song's progress is calculated as the average of its stage progress values
- Overall progress should weight all non-draft songs equally (not weighted by duration or other factors)
- Standard rounding applies for percentages (0.5 rounds up)

## Dependencies

- **Feature 008 (Draft Song Status)**: Requires isDraft field to exist on song objects
- Existing header component with song count display
- Existing overall progress calculation logic

## Scope Boundaries

### In Scope

- Updating song count display to filter draft songs
- Updating overall progress calculation to filter draft songs
- Immediate reactivity when draft status changes
- Handling edge case of all songs being draft

### Out of Scope

- Adding new UI elements to header (reusing existing display)
- Changing how individual song progress is calculated (only filtering which songs contribute)
- Adding draft indicators to header (draft status visible in grid view from feature 008)
- Weighted progress calculations (e.g., by song duration)
- Historical progress tracking or draft status history
