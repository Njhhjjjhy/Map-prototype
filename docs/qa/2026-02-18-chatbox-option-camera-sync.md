# QA Issue: Chatbox option items missing camera movement

**Date:** 2026-02-18
**Status:** Completely fixed
**Reporter:** QA Review

## Issue description

When clicking chatbox option items (evidence group buttons in B6, opening evidence in A0, energy infrastructure evidence in A1), the right panel would update with content and evidence markers would appear on the map, but the camera would not pan or zoom to show the relevant markers. The user had to manually navigate the map to find where the markers appeared.

This violated the strict rule: when any chatbox item is selected, the right panel must show corresponding information AND the map must gently pan/zoom to the corresponding location.

## Root cause

The `showEvidenceGroupPanel()` function in app.js called `MapController.showEvidenceGroupMarkers(group)` to place markers on the map, but never triggered a camera movement to frame those markers. Similarly, `showOpeningEvidence()` only opened the inspector panel without any map movement.

By contrast, `selectResource()` (A1 water/power) correctly combined panel display with `MapController.flyToStep()`, which is why those options worked properly.

## Solution

1. Added `fitToEvidenceGroup(group)` method to `MapController` in map-controller.js. This method:
   - Filters evidence items that have coordinates
   - For a single item: flies directly to it with `flyToStep()`
   - For multiple items: computes a bounding box and calls `map.fitBounds()` with gentle padding and animation
   - Uses 1500ms duration matching `--duration-scene` for cinematic feel

2. Updated `showEvidenceGroupPanel()` in app.js to call `MapController.fitToEvidenceGroup(group)` after showing markers.

3. Updated `showOpeningEvidence()` in app.js to fly the camera toward the science park area (JASM commitment location at [32.87, 130.78]) when the "View evidence" button is clicked.

## Files modified

- `js/map-controller.js` - Added `fitToEvidenceGroup()` method after `showEvidenceGroupMarkers()`
- `js/app.js` - Added `MapController.fitToEvidenceGroup(group)` call in `showEvidenceGroupPanel()`; added `MapController.flyToStep()` call in `showOpeningEvidence()`

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified (uses existing patterns: `_toMapbox()`, `fitBounds`, `flyToStep`)
- [x] No unintended side effects detected
- [x] Duration values consistent with `--duration-scene` (1500ms)

### Browser testing
- [x] A0 "View evidence" flies camera to science park area
- [x] B6 "View government zone plans" flies camera to fit zone markers
- [x] B6 "View transportation network" flies camera to fit transport markers
- [x] B6 "View education pipeline" flies camera to fit education markers
- [x] A1 "View energy infrastructure evidence" flies camera to fit energy markers
- [x] Existing A1 water/power behavior unaffected

**Test notes:** User confirmed all scenarios working after browser testing.

## CLAUDE.md updates

None - existing rules were sufficient. The design system already specified that chatbox options should trigger both panel and map responses (as demonstrated by the A1 resource pattern). The implementation gap was in code, not in the design system documentation.
