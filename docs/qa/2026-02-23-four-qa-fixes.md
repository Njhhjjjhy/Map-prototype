# QA fixes: Previous button cleanup, evidence images, Tokyo arc, property tabs

**Date:** 2026-02-23
**Status:** Fixed
**Reporter:** QA review (v7 feedback)

## Issues and fixes

### 1. Remove Previous button (CSS cleanup)

**Problem:** The Previous button was removed from `app.js` in a prior pass, but its CSS remained: `.chatbox-continue.secondary` styles and the two-button flex split rules in `.chatbox-nav-row`.

**Fix:** Removed `.chatbox-continue.secondary` and all its state selectors (hover, active, focus-visible, disabled, svg). Simplified `.chatbox-nav-row` to a basic flex wrapper since it only contains the Continue button now.

**Files changed:** `css/styles.css`

### 2. Evidence doc cards open placeholder instead of actual images

**Problem:** Clicking evidence document cards in the inspector panel called `showQuickLook({ type: 'doc' })`, which showed a generic document icon. Most evidence items have an `image` field in `AppData.evidenceGroups` that should display instead.

**Fix:** The click handler now looks up the evidence item by ID from `AppData.evidenceGroups`, extracts its `image` field, and calls `showQuickLook({ type: 'image', src, title })`. Falls back to `type: 'doc'` when no image exists.

**Files changed:** `js/ui.js`

### 3. Remove Tokyo arc line

**Problem:** `showGovernmentChain()` drew a green bezier arc from Tokyo to JASM (`govt-tokyo-arc` source and layer). This arc was not wanted.

**Fix:** Removed the entire Tokyo arc block (source creation, bezier calculation, layer addition). Preserved the screen reader announcement with the same delay timing.

**Files changed:** `js/map-controller.js`

### 4. Property panel shows wrong tabs

**Problem:** Property click handlers called `renderInspectorPanel(5, ...)`. `STAGE_TABS[5]` maps to the science park step with tabs ['Plans', 'Zones']. The correct property tabs are at `STAGE_TABS[10]` with ['Images', 'Truth Engine', 'Future Outlook', 'Financial'].

**Fix:** Changed both `renderInspectorPanel(5, ...)` calls to `renderInspectorPanel(10, ...)` (property click handler and drill-down sequence). Added `case 10` to `renderStageTab()` routing to `_renderStage5()`, which already handles property rendering.

**Files changed:** `js/ui.js`
