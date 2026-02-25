# QA Session: Dashboard Panel Polish Fixes

**Date:** 2026-02-17
**Status:** Complete. All 6 issues verified.
**Scope:** Inspector-style dashboard panel visual polish and data layer integration.
**Plan:** `~/.claude/plans/dashboard-panel-qa-fixes.md`

---

## Issue 1: Inspector title too large, layout should be vertical

### Problem

`.inspector-title-bar` used `flex-direction: row` with `space-between`, placing subtitle and title side by side. The `#panel-content h2` rule forced `font-size: var(--text-3xl)` (28px) onto the inspector title, making it oversized.

### Fix

- Changed `.inspector-title-bar` to `flex-direction: column`, `align-items: flex-start` (css/styles.css:4732).
- Added `#panel-content .inspector-title` override with `font-size: var(--text-xl)` (20px) (css/styles.css:4742).
- Removed `margin-bottom: var(--space-6)` since the title bar handles spacing via its own padding.

### Files changed

- `css/styles.css` (lines 4732-4753)

---

## Issue 2: Too much dashboard panel padding

### Problem

`#panel-content` had `padding: var(--space-8) var(--space-6) var(--space-6)` (32px top, 24px sides). Combined with `.inspector-body` padding of `var(--space-4)` (16px), the content was pushed too far inward.

### Fix

- Added `#panel-content:has(.inspector-title-bar) { padding: 0; }` (css/styles.css:1455).
- The inspector's own title bar and body padding handle spacing internally.

### Files changed

- `css/styles.css` (lines 1454-1457)

---

## Issue 3: Area Statistics card looks different from Yield Summary card

### Problem

"Yield summary" used `.icard-yield-row` (flexbox with centered items), while "Area statistics" used inline `.icard-stats-grid` (a different grid structure). The two stat cards had inconsistent font sizes, weights, and layout.

### Fix

- Changed Area statistics card in `_renderStage8()` to use `.icard-yield-row` with `.icard-yield-item`, `.icard-yield-value`, and `.icard-yield-label` classes, matching the Yield summary card exactly.

### Files changed

- `js/ui.js` (lines 4084-4097)

---

## Issue 4: Data layer toggles do not update dashboard panel

### Problem

`toggleLayer()` only called `MapController.showLayer()`/`hideLayer()` and never updated the right panel. In dashboard mode, toggling Properties, Corporate Sites, or Science Park layers had no panel effect.

### Fix

- Added dashboard mode check in `toggleLayer()`: when `this.dashboardMode` is true and a layer is activated, calls `showDataLayerPanel()` with data from `AppData.dataLayers[layerName]` (js/ui.js:2646-2651).
- Data entries for `sciencePark`, `companies`, and `properties` already existed in `AppData.dataLayers` (js/data.js:1331-1357).

### Files changed

- `js/ui.js` (lines 2646-2651)

---

## Issue 5: Uppercase text violates design system

### Problem

Two CSS rules applied `text-transform: uppercase`:
- `#panel-content .subtitle` (subtitle above panel titles)
- `.panel-bento-label` (bento card labels)

Both violated CLAUDE.md: "Never use all caps or uppercase for any UI text."

### Fix

- Removed `text-transform: uppercase` from both `#panel-content .subtitle` and `.panel-bento-label`.
- Removed associated `letter-spacing: 0.08em` tracking (designed for uppercase, looks wrong at sentence case).

### Files changed

- `css/styles.css` (lines 1480-1486, 1815-1820)

---

## Issue 6: Back button and close button not aligned horizontally

### Problem

Close button (`#panel-close`) used `position: absolute` floating over content. Back button (`.panel-back-btn`) was injected into `#panel-content` flow. They were in different containers and could not align.

### Fix

- Created `.panel-toolbar` flexbox row at the top of `#right-panel`, above `#panel-content` (css/styles.css:1364-1371).
- Moved close button into toolbar in HTML (index.html:133-137).
- Close button uses `margin-left: auto` to sit right when no back button is present.
- Back button, when injected, goes into the same toolbar row.

### Files changed

- `css/styles.css` (lines 1363-1401)
- `index.html` (lines 132-139)
- `js/ui.js` (panel back button injection logic)

---

## Verification

All 6 issues verified via code review against the implementation plan:

| Issue | Status | Verification |
|-------|--------|-------------|
| 1. Inspector title size/layout | Pass | `flex-direction: column`, `font-size: var(--text-xl)` confirmed |
| 2. Panel padding with inspector | Pass | `:has(.inspector-title-bar) { padding: 0 }` confirmed |
| 3. Card visual consistency | Pass | Both cards use `.icard-yield-row` class |
| 4. Layer toggle updates panel | Pass | Dashboard mode check with `showDataLayerPanel()` call confirmed |
| 5. No uppercase text | Pass | Zero `text-transform: uppercase` matches in styles.css |
| 6. Toolbar button alignment | Pass | `.panel-toolbar` in CSS, HTML, and JS confirmed |
