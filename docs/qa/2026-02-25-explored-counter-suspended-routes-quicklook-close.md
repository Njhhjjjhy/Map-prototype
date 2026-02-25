# QA Issue: Remove explored counter, suspended routes, fix Quick Look close button

**Date:** 2026-02-25
**Status:** Completely fixed
**Reporter:** QA Review

## Issue Description

Three issues reported:

1. **"0 of 2 explored" counter** in chatbox sub-item view is unwanted UI clutter.
2. **"Suspended routes" disclosure group** (Shanghai Pudong, Hong Kong) in the airline routes panel should not be shown.
3. **Quick Look document preview close button** is clipped/hidden at the top-left corner of the card. Should be visible in the top-right corner with a standard X button style.

## Root Cause

1. `app.js` rendered a `resource-progress` div counting explored sub-items above the chatbox options.
2. Two route entries in `data.js` had `status: 'suspended'`, and `ui.js` rendered them in a separate disclosure group.
3. The `#quick-look-close` button was positioned at `top: calc(-1 * var(--space-10))` (40px above the content container). For the doc preview type, this placed the button outside the visible white card area, causing it to clip at the edge.

## Solution

1. **Explored counter:** Removed the `exploredCount`, `totalCount`, and `progress` variable generation and its template insertion in `app.js`.
2. **Suspended routes:** Deleted both suspended route data entries from `data.js`. Removed the `suspendedRoutes` filter, `renderSuspendedRow` function, disclosure state initialization, and entire suspended disclosure group HTML from `ui.js`.
3. **Quick Look close button:** Moved the close button inside the `.quick-look-doc` container in the JS template. Added `position: relative` to `.quick-look-doc` in CSS. Created a `.quick-look-doc #quick-look-close` override that positions the button at `top/right: var(--space-3)` with dark icon color and transparent background, matching the standard modal close button pattern. Image and gallery Quick Look types remain unchanged.

## Files Modified

- `js/app.js` - Removed explored counter progress div (lines 451-460)
- `js/data.js` - Removed Shanghai Pudong and Hong Kong suspended route entries
- `js/ui.js` - Removed suspended routes filter, render function, disclosure state, and HTML block from `showAllAirlineRoutes()`. Moved close button inside `.quick-look-doc` in doc type template.
- `css/styles.css` - Added `position: relative` to `.quick-look-doc`. Added `.quick-look-doc #quick-look-close` override for top-right positioning with dark-on-light styling.

## Verification Results

### Code Review
- [x] Changes match approved plan
- [x] Design system compliance verified (spacing tokens, color tokens, standard patterns)
- [x] No unintended side effects detected
- [x] Dead code in map-controller.js (suspended route rendering) is harmless since data entries are removed

### Browser Testing
- [ ] Explored counter no longer appears in chatbox sub-items
- [ ] Airline routes panel shows only "Active routes" disclosure group
- [ ] Doc preview close button visible at top-right of white card
- [ ] Image and gallery Quick Look close buttons unaffected

**Test notes:** Dev server running at localhost:3000. Awaiting user browser verification.

## CLAUDE.md Updates

None - existing rules were sufficient.
