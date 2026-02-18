# QA fix: Evidence doc cards not clickable and A3 sub-phase panel sync

**Date:** 2026-02-17
**Status:** Fixed
**Reporter:** QA review

## Issues

### 1. Evidence doc cards not clickable

**Symptom:** Evidence document cards rendered by `renderEvidenceDocCard()` in the inspector panel had no click handler. Cards appeared interactive (styled as cards with data attributes) but clicking them did nothing.

**Root cause:** `_attachInspectorHandlers()` in ui.js attached click handlers for `[data-property-id]` cards and gallery thumbs, but had no handler for `[data-evidence-id]` cards. The `renderEvidenceDocCard()` method set `data-evidence-id` on each card but no code ever listened for clicks on those elements.

**Affected locations:** All inspector stages rendering evidence doc cards (stage 1 supporting docs, stage 5 corporate evidence, stage 9 property rental reports, evidence group items).

**Fix:** Added a click handler in `_attachInspectorHandlers()` (ui.js:4588-4602) that:
- Queries all `[data-evidence-id]` elements in the panel
- Sets `cursor: pointer` for visual affordance
- On click, extracts the title and source from the card's DOM
- Opens a Quick Look document preview via `showQuickLook({ type: 'doc' })`

Also added a new `doc` type to `showQuickLook()` (ui.js:4707-4722) that renders a centered document preview card with a file icon, title, and source. Added corresponding CSS for `.quick-look-doc` in styles.css.

### 2. Panel doesn't sync for A3 sub-phases

**Symptom:** When the chatbox CTA advanced from "Semiconductor ecosystem" to "Strategic location" (`stepA3_location`) or "Talent pipeline" (`stepA3_talent`), the right panel did not update. It remained showing whatever was rendered when `stepA3()` first fired.

**Root cause:** `stepA3_location()` and `stepA3_talent()` in app.js (lines 280-316) only set `this.state.a3Phase` and updated the chatbox/map. Neither method called `UI.updateInspectorForStep()` or any panel update function. Additionally, `updateInspectorForStep()` in ui.js only checked `STAGE_MAP` which mapped `'A3'` to stage 3 -- the sub-phase identifiers (`location`, `talent`) were not represented.

**Fix:** Added direct panel sync calls in app.js:
- `stepA3_location()` now calls `UI.showAllAirlineRoutes()` to display the airline routes overview panel, matching the map content showing international routes
- `stepA3_talent()` now calls `UI.renderInspectorPanel(3, { title: 'Talent pipeline' })` to display the talent pipeline overview with institution cards

## Files changed

| File | Change |
|------|--------|
| js/ui.js | Added `[data-evidence-id]` click handler in `_attachInspectorHandlers()`, added `doc` type to `showQuickLook()` |
| js/app.js | Added `UI.showAllAirlineRoutes()` call in `stepA3_location()`, added `UI.renderInspectorPanel(3, ...)` call in `stepA3_talent()` |
| css/styles.css | Added `.quick-look-doc` styles for document preview in Quick Look |

## Verification

- Evidence doc cards in stage 1 (opening question supporting docs) are clickable and open Quick Look document preview
- Evidence doc cards in stage 5 (corporate evidence) are clickable
- Evidence doc cards in stage 9 (property rental reports) are clickable
- Advancing from A3 infrastructure to A3 location syncs panel to airline routes overview
- Advancing from A3 location to A3 talent syncs panel to talent pipeline overview
- Clicking individual airline destinations still opens route detail panel
- Clicking individual institutions still opens institution detail panel
