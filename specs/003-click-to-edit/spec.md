# Feature Specification: Click-to-Edit Tempo and Key Fields

**Feature Branch**: `003-click-to-edit`
**Created**: 2025-11-19
**Status**: Draft
**Input**: User description: "To edit Tempo or key click on the field label, otherwise only display the value"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Tempo and Key Without Clutter (Priority: P1) 🎯 MVP

When users are browsing their song list to review tempo and key information, they should see clean, read-only displays instead of editable input fields. This reduces visual clutter and prevents accidental edits while scanning the dashboard.

**Why this priority**: Core value proposition - reduces cognitive load and improves scanning efficiency. This is the primary user need and delivers immediate value even without the editing capability.

**Independent Test**: Open the dashboard with songs that have tempo and key set. Verify all tempo and key values display as plain text (not input fields). Attempt to type in the display area and verify nothing happens. The feature delivers value by making the dashboard cleaner and easier to scan.

**Acceptance Scenarios**:

1. **Given** a song has tempo set to 145 BPM, **When** user views the song card, **Then** "145 BPM" displays as plain text (not an input field)
2. **Given** a song has key set to "F# Major", **When** user views the song card, **Then** "F# Major" displays as plain text (not a dropdown)
3. **Given** a song has no key set (null), **When** user views the song card, **Then** "No key" or blank state displays as plain text
4. **Given** user is viewing tempo/key display text, **When** user clicks directly on the value text, **Then** nothing happens (no edit mode triggered)
5. **Given** multiple songs are visible, **When** user scans the list, **Then** tempo and key values are easily readable without visual noise from input borders

---

### User Story 2 - Click Label to Edit Tempo (Priority: P2)

When users want to change a song's tempo, they should click on the "Tempo" label to enter edit mode. This provides intentional editing without accidental changes.

**Why this priority**: Enables the editing workflow for tempo. Depends on US1 for the display state, but is independently testable for the edit interaction.

**Independent Test**: Click the "Tempo" label on a song card. Verify an input field appears with the current tempo value. Change the tempo and blur the field. Verify the display returns to read-only mode with the updated value.

**Acceptance Scenarios**:

1. **Given** tempo is in display mode showing "120 BPM", **When** user clicks the "Tempo" label, **Then** an input field appears with "120" pre-filled and focused
2. **Given** tempo input field is focused, **When** user types "145" and clicks outside the field, **Then** input validates to 145 BPM, display mode returns showing "145 BPM"
3. **Given** tempo input field is focused, **When** user types "500" and clicks outside the field, **Then** value clamps to 300 BPM with visual feedback, display mode returns showing "300 BPM"
4. **Given** tempo input field is focused, **When** user presses Enter key, **Then** input validates and display mode returns (same as blur behavior)
5. **Given** tempo input field is focused, **When** user presses Escape key, **Then** changes are discarded and display mode returns with original value
6. **Given** tempo input is in edit mode, **When** user clicks the "Tempo" label again, **Then** edit mode remains active (no toggle behavior)

---

### User Story 3 - Click Label to Edit Key (Priority: P3)

When users want to change a song's key, they should click on the "Key" label to enter edit mode. The two-step dropdown selection (note + mode) appears only when editing.

**Why this priority**: Enables the editing workflow for key. Lower priority than tempo because key is less frequently changed. Independently testable with the two-dropdown interaction.

**Independent Test**: Click the "Key" label on a song card. Verify two dropdowns appear (note and mode). Select "E" and "Minor". Blur the field or click outside. Verify display returns to read-only showing "E Minor".

**Acceptance Scenarios**:

1. **Given** key is in display mode showing "C Major", **When** user clicks the "Key" label, **Then** two dropdowns appear (note pre-selected to "C", mode pre-selected to "Major") and note dropdown is focused
2. **Given** key is in display mode showing "No key", **When** user clicks the "Key" label, **Then** two dropdowns appear (note showing "No Key", mode disabled) and note dropdown is focused
3. **Given** key dropdowns are visible, **When** user selects "E" from note dropdown and "Minor" from mode dropdown, then clicks outside, **Then** display mode returns showing "E Minor"
4. **Given** key dropdowns are visible with "F#" and "Major" selected, **When** user clicks outside the dropdowns, **Then** enharmonic normalization applies (displays "F# Major" not "Gb Major") and returns to display mode
5. **Given** key dropdowns are visible, **When** user presses Escape key, **Then** changes are discarded and display mode returns with original value
6. **Given** key dropdowns show "A" and "Minor", **When** user selects "No Key" from note dropdown, **Then** mode dropdown becomes disabled and key value clears to null
7. **Given** key is in edit mode, **When** user clicks the "Key" label again, **Then** edit mode remains active (no toggle behavior)

---

### Edge Cases

- What happens when user sets tempo to invalid value (non-numeric) and presses Escape? Should it revert to previous valid value or default to 120?
- What happens if tempo/key field is in edit mode when user clicks "Export" or "Import"? Should it auto-save the field first?
- What happens if user rapidly clicks the label multiple times? Should it debounce or ignore subsequent clicks?
- What happens when user navigates away from the page (or closes browser) while a field is in edit mode? Should it auto-save via existing useEffect persistence?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display tempo as read-only text ("{tempo} BPM") by default when not in edit mode
- **FR-002**: System MUST display key as read-only text ("{note} {mode}" or "No key") by default when not in edit mode
- **FR-003**: Users MUST be able to enter tempo edit mode by clicking on the "Tempo" field label
- **FR-004**: Users MUST be able to enter key edit mode by clicking on the "Key" field label
- **FR-005**: System MUST show tempo input field (text input) when tempo is in edit mode
- **FR-006**: System MUST show key selection dropdowns (note + mode) when key is in edit mode
- **FR-007**: System MUST auto-focus the input field when entering edit mode (tempo input or note dropdown)
- **FR-008**: System MUST exit edit mode and return to display mode when user blurs the field (clicks outside)
- **FR-009**: System MUST exit edit mode and save changes when user presses Enter key
- **FR-010**: System MUST exit edit mode and discard changes when user presses Escape key
- **FR-011**: System MUST maintain all existing validation rules for tempo (30-300 BPM, rounding, clamping with visual feedback)
- **FR-012**: System MUST maintain all existing enharmonic normalization rules for key (Db Major, C# Minor, etc.)
- **FR-013**: System MUST persist changes to browser storage automatically when field exits edit mode
- **FR-014**: Clicking directly on the display value text MUST NOT trigger edit mode (only clicking the label should)
- **FR-015**: When opening a new field for editing while another field is already in edit mode, system MUST auto-save the current field's changes before switching to the new field

### Key Entities

- **Song Card Display**: UI element showing a song's tempo and key with togglable edit/display modes
- **Song Detail Display**: UI element showing a song's tempo and key in detailed view with same edit/display behavior
- **Edit Mode State**: Indicator tracking whether tempo or key is currently being edited (per field, per song)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can scan the song list and identify tempo/key values in under 5 seconds (reduced from current time due to visual simplification)
- **SC-002**: Users can enter edit mode for tempo or key with a single click on the field label
- **SC-003**: Users can complete a tempo edit (click label → change value → save) in under 3 seconds
- **SC-004**: Users can complete a key edit (click label → select note → select mode → save) in under 5 seconds
- **SC-005**: Accidental edits (typing while not in edit mode) are prevented 100% of the time
- **SC-006**: All existing tempo validation and key normalization behavior is preserved (0 regressions)
- **SC-007**: Changes persist to browser storage immediately upon exiting edit mode (within 100ms)

## Assumptions

- **A-001**: The "label" refers to the text label above or next to the field (e.g., "Tempo:" or "Key:"), not the value itself
- **A-002**: Edit mode is per-field, per-song (opening tempo edit on Song 1 doesn't affect Song 2's tempo or Song 1's key)
- **A-003**: Visual styling will use existing design patterns to differentiate display mode (plain text) from edit mode (input fields)
- **A-004**: Auto-focus behavior follows standard web UX patterns (focus input when entering edit mode)
- **A-005**: Escape key behavior discards changes (standard UX pattern for canceling edits)
- **A-006**: Enter key behavior saves changes (standard UX pattern for confirming edits)
- **A-007**: Blur behavior saves changes (consistent with current implementation where validation happens on blur)
- **A-008**: The SongDetail modal view should have the same click-to-edit behavior as SongCard for consistency

## Out of Scope

- Inline editing for song title (remains always editable as current behavior)
- Click-to-edit for stage progress sliders (sliders are inherently interactive)
- Keyboard shortcuts for entering edit mode (only mouse click on label supported)
- Multi-field editing (opening both tempo and key in edit mode simultaneously)
- Undo/redo functionality for edits (Escape key provides single-level undo)
- Visual indicators on labels showing they are clickable (users will discover this organically)

## Dependencies

- Existing tempo validation feature (30-300 BPM range, decimal rounding, boundary clamping)
- Existing key normalization feature (enharmonic equivalents like Db Major, C# Minor)
- Existing data persistence mechanism (automatically saves song changes to browser storage)
- Existing UI styling system (consistent visual design patterns)
