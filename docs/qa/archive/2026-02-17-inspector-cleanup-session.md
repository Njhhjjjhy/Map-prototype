# Session: Inspector panel cleanup and dead code removal

**Date:** 2026-02-17
**Branch:** feat/hybrid-presentation
**Status:** Batches 1-4 complete. Code audit, bug fixes, and all 4 polish improvements done. Browser testing pending.

---

## What was done this session

### Dead code removal from ui.js

Removed ~700 lines of legacy dashboard code that was wrapped in an `if (false)` dead code gate (lines 5262-5961). This code was the round 3 Finder sidebar implementation that was superseded by the round 4 inspector-style bento panel.

**Deleted functions (all were unreachable):**

| Function | Purpose (legacy) |
|----------|-----------------|
| `generateDashboardContent()` | Finder sidebar HTML generation |
| `generateDashboardSection()` | Collapsible dashboard sections |
| `getDashboardIcon()` | SVG icon lookup for sidebar rows |
| `expandBentoCard()` | Drill-down list views (properties, companies, infrastructure, evidence) |
| `generatePropertiesList()` | Property list for sidebar drill-down |
| `generateCorporatesList()` | Company list for sidebar drill-down |
| `generateInfrastructureList()` | Infrastructure list for sidebar drill-down |
| `generateEvidenceList()` | Evidence group list for sidebar drill-down |
| `showDashboardPropertyDetail()` | Property detail with map focus |
| `showDashboardCompanyDetail()` | Company detail with map focus |
| `showDashboardScienceParkDetail()` | Science park detail with map focus |
| `showDashboardRoadDetail()` | Road detail with map focus |
| `showDashboardResourceDetail()` | Resource detail with map focus |
| `showDashboardEvidenceGroup()` | Evidence group panel |
| `showDashboardEvidenceItem()` | Individual evidence item |
| `generateBreadcrumb()` | Breadcrumb nav for drill-downs |
| `showPropertyPanelWithBreadcrumb()` | Property panel with breadcrumb |
| `generatePropertyContent()` | Reusable property content HTML |
| `showCompanyPanelWithBreadcrumb()` | Company panel with breadcrumb |
| `showScienceParkPanelWithBreadcrumb()` | Science park panel with breadcrumb |
| `showRoadPanelWithBreadcrumb()` | Road panel with breadcrumb |
| `showResourcePanelWithBreadcrumb()` | Resource panel with breadcrumb |
| `showEvidenceGroupPanelWithBreadcrumb()` | Evidence group with breadcrumb |
| Duplicate `formatStatLabel()` | Was in dead code block |
| Duplicate `generateFinancialsSection()` | Legacy Chart.js version |
| Duplicate `renderPropertyCharts()` | Legacy Chart.js line chart |
| Duplicate `setScenario()` | Legacy scenario toggle |

**File stats after cleanup:**
- ui.js: 5260 lines (down from ~5962)
- Syntax check passes (`node -c js/ui.js`)

### What already exists (not changed this session)

**Inspector panel system in ui.js (lines 4314-5260):**
- `STAGE_MAP` and `STAGE_TABS` constants (defined in data.js)
- `renderInspectorPanel()` - renders panel chrome (title bar, tabs, body)
- `switchInspectorTab()` - tab switching
- `updateInspectorForStep()` - step-to-stage lookup and auto-update
- `initPanelResize()` - left-edge drag resize
- `renderStageTab()` - stage/tab router (stages 3-9)
- `_renderStage3` through `_renderStage9` - card manifests per stage
- 14 card renderers (decision badge, financial table, calculator, yield summary, evidence doc, evidence gallery, corporate, timeline, commute, risk, zone profile, workforce, institution, demand projection, property summary, sticky summary)
- `_attachInspectorHandlers()` - scenario toggle, view toggle, disclosure rows, gallery thumbs, property card click
- `_refreshCalculator()` - in-place calculator update
- Quick Look system (`showQuickLook`, `_quickLookNav`, `hideQuickLook`)
- Utility functions (`formatYen`, `formatStatLabel`, `setScenario`)

**Inspector CSS in styles.css (lines ~4941-5400+):**
- `.inspector-resize-handle`, `.inspector-title-bar`, `.inspector-title`, `.inspector-subtitle`
- `.inspector-tabs`, `.inspector-tab`
- `.inspector-body`
- `.icard-grid` with container query breakpoint
- `.icard`, `.icard-hero`, `.icard-standard`, `.icard-compact`
- All card-specific styles (~117 icard references)

**Dashboard mode in ui.js (lines 4100-4312):**
- `startDashboardMode()` - already wired to open inspector at stage 8
- `showDashboardToggle()`, `hideDashboardToggle()`
- `toggleDashboardPanel()` - reopens inspector at last stage
- `hideDashboardPanel()`
- `createDashboardMarkers()` - creates property, company, science park markers for data layers

**Data layer in data.js:**
- `STAGE_MAP` - step ID to stage number lookup
- `STAGE_TABS` - stage number to tab definitions

---

## Code audit and bug fixes (batch 5)

### Audit scope

Systematic code path tracing of the inspector panel integration:
- `updateInspectorForStep()` call sites in app.js (all 10 step functions)
- `renderInspectorPanel()` call sites in map-controller.js (all 9 marker handlers)
- Stage router paths (`_renderStage3` through `_renderStage9`)
- All 14 card renderers and their data property references
- CSS class coverage for all inspector and icard selectors
- Data.js property existence for all referenced fields

### Bugs found and fixed

**Bug 1: Science park layer ID mismatch in dashboard mode**
- **File:** `js/map-controller.js:2377`
- **Symptom:** Toggling "Science park" layer in dashboard data layers panel would not show/hide the boundary circle on the map.
- **Root cause:** `_getMapboxLayerIds('sciencePark')` mapped to `['science-park-circle-fill', 'science-park-circle-stroke']` (Journey B layer IDs), but dashboard mode creates the layer as `'science-park-circle'` (a circle type layer, different ID).
- **Fix:** Added `'science-park-circle'` to the mapping array so both journey and dashboard layer IDs are covered.

**Bug 2: Financial table disclosure sub-rows never become visible**
- **File:** `js/ui.js:4588`
- **Symptom:** Clicking a disclosure row in the acquisition costs table (stage 9 Financials tab) would not reveal the sub-rows (agent commission, legal and admin).
- **Root cause:** The expand handler set `sibling.style.display = ''` (empty string), which clears the inline style. But the CSS rule `.icard-sub-row { display: none; }` then takes over, keeping the row hidden.
- **Fix:** Changed to `sibling.style.display = 'table-row'` so the inline style overrides the CSS default.

### Audit results (no issues)

| Check | Result |
|-------|--------|
| `updateInspectorForStep()` called at all 10 step transitions (A0-complete) | Pass |
| Stages 1-2 (A0, A1, A2) return early with no panel | Pass |
| Stage 3+ opens inspector at correct stage | Pass |
| All 9 marker click handlers route to correct stage (4-7, 9) | Pass |
| All 13 AppData properties referenced by card renderers exist in data.js | Pass |
| All inspector and icard CSS classes present in styles.css | Pass |
| CSS brace balance (779 open / 779 close) | Pass |
| All 4 JS files pass `node -c` syntax check | Pass |
| Dashboard mode opens stage 8 with Demand/Yields/Properties tabs | Pass |
| `showPropertyReveal()` calls `renderInspectorPanel(9, ...)` | Pass |
| `_attachInspectorHandlers` wires scenario toggle, view toggle, gallery, disclosure | Pass |
| Evidence groups ('education-pipeline', 'government-zones', 'transportation-network') exist in data.js | Pass |

### Known limitations (not bugs)

**Old-style panel calls during stage 3+:**
- `showTalentPanel()` (called from university markers in A3 talent phase) uses old `showPanel()` instead of `renderInspectorPanel()`. This overwrites the inspector with narrative-style content. When navigating back, the inspector HTML is restored but tab click handlers are dead (event listeners not reattached).
- This is a UX inconsistency, not a crash. The old talent panel provides entity-specific fly-to behavior that the inspector system doesn't replicate. A future pass could add a talent-focused card renderer to stage 3.

**Inspector opens then immediately hides at 'complete' step:**
- `updateInspectorForStep('complete')` renders stage 9, then `UI.hidePanel()` is called two lines later. This is a wasted render. Could be optimized by skipping the inspector update at 'complete' since the recap flow takes over. Not a user-visible issue.

---

## Code audit round 2 (post-batch 5)

Systematic code-trace of all inspector integration points. Verified:

| Check | Result |
|-------|--------|
| All 10 `updateInspectorForStep()` calls in app.js match step IDs | Pass |
| All 9 marker click handlers in map-controller.js route to correct stages | Pass |
| All 7 stage renderers (_renderStage3 through _renderStage9) produce valid HTML | Pass |
| All 13 AppData properties referenced by card renderers exist in data.js | Pass |
| All 3 evidence group IDs match keys in data.js evidenceGroups | Pass |
| Tab click handlers capture `options` in closure for stage 9 property access | Pass |
| `_renderStage9` fallback chain (options.property -> currentProperty -> properties[0]) | Pass |
| `showPanel` with `clearHistory: true` prevents stale back buttons | Pass |
| `injectBackButton` targets `.subtitle` (not `.inspector-subtitle`), no false match | Pass |

### Bugs found and fixed

**Bug 3: Panel toggle re-appears in dashboard mode**
- **File:** `js/ui.js:865`
- **Symptom:** In dashboard mode, the panel toggle button (sidebar-right icon) appears alongside the dashboard toggle, even though `hidePanelToggle()` was called.
- **Root cause:** `showPanel()` always calls `showPanelToggle()` at line 865. Dashboard mode calls `hidePanelToggle()` before `renderInspectorPanel()`, but `renderInspectorPanel` -> `showPanel` immediately re-shows it.
- **Fix:** Guarded `showPanelToggle()` with `!this.dashboardMode` check. Dashboard uses its own toggle button.

**Bug 4: Duplicate event listeners from _refreshCalculator**
- **File:** `js/ui.js:4630`
- **Symptom:** Each scenario toggle (bear/avg/bull) or view toggle (fund/broker) click accumulates duplicate click handlers on disclosure rows, gallery thumbs, and property summary cards.
- **Root cause:** `_refreshCalculator` called `_attachInspectorHandlers()` which attaches handlers to ALL panel elements, not just the replaced calculator. Comment said "Reattach only calculator handlers" but code reattached everything.
- **Fix:** Replaced the `_attachInspectorHandlers()` call with targeted handler attachment to only the new calculator element's scenario and view toggle buttons.

---

## File inventory

| File | Status | Notes |
|------|--------|-------|
| `js/ui.js` | 4 bugs fixed total | Bug 2: disclosure sub-row display. Bug 3: panel toggle in dashboard. Bug 4: duplicate event listeners. |
| `js/data.js` | Unchanged | STAGE_MAP and STAGE_TABS verified complete for all step IDs. |
| `js/app.js` | Unchanged | All 10 step functions call `updateInspectorForStep()`. |
| `css/styles.css` | Unchanged | 5740 lines. All inspector/icard classes present. |
| `js/map-controller.js` | 1 bug fixed | Bug 1: science park layer ID mapping (line 2377). |

---

## Browser testing status

Dev server running at http://localhost:3000/. Manual walkthrough pending for:

1. Inspector panel first opens at step A3 (stage 3) with Workforce/Universities/Sources tabs.
2. Tab switching works at each stage without console errors.
3. Marker clicks render entity-focused views (gov chain stage 4, companies stage 5, zones stage 6, roads/stations stage 7).
4. Property reveal drill-down in Journey C opens stage 9 with Overview/Financials/Evidence tabs.
5. Scenario toggle (bear/avg/bull) and view toggle (fund/broker) update calculator card without accumulating handlers.
6. Financial table disclosure rows expand/collapse correctly (bug 2 fix).
7. Dashboard mode opens stage 8 inspector without panel toggle appearing (bug 3 fix).
8. Science park layer toggle works in dashboard data layers (bug 1 fix).
9. No console errors or visual regressions throughout.

### Future improvements - completed

All four improvements implemented in a follow-up session:

**1. Replaced `showTalentPanel()` with inspector stage 3 entity card**
- Deleted `showTalentPanel()` from ui.js (was using old `showPanel()`, leaving dead tab handlers on back-nav)
- Added `showTalentInspector(instOrId)` - opens inspector at stage 3, tab 1 (Universities), with single institution card
- Updated `renderInspectorPanel()` to support `options.startTab` (auto-select tab) and `options.flyTo` (camera flight after render)
- Updated `_renderStage3()` to accept `options.institution` for entity-focused single-card view
- Updated `renderStageTab()` to pass options through to `_renderStage3`
- Updated call sites: app.js chatbox onclick (`UI.showTalentInspector('${inst.id}')`), map-controller.js marker click
- Fly-to behavior preserved via `options.flyTo` on `renderInspectorPanel`

**2. Skipped wasted render at 'complete' step**
- Removed `UI.updateInspectorForStep(this.state.step)` from `complete()` in app.js
- The call was rendering stage 9 then `hidePanel()` immediately hid it; recap flow takes over instead

**3. Data enrichment audit - no gaps found**
- Audited all 14 card renderers for fallback defaults, "n/a", and empty fields
- Cross-referenced all data properties in data.js against renderer field access
- Both properties (prop-1, prop-2) have all required fields: financials, scenarios, costBreakdown, rentalProjections, brokerMetrics, decisionMetrics, commuteShifts, recommendation, thumbnail
- All entity data (companies, zones, roads, talentPipeline, sciencePark, riskData, areaStats) fully populated
- Fallback patterns (`|| 0`, `|| 'n/a'`) are defensive code, not masking missing data

**4. Container query and resize polish**
- Added `.active` class toggle on resize handle during drag (CSS already styled it)
- Added `document.body` cursor override (`col-resize`) during resize to prevent cursor flicker
- Added `user-select: none` on body during resize to prevent text selection
- Fixed `.icard-sticky-summary` width: added `width: calc(100% + 2 * var(--space-4))` for proper span in flex container
- Fixed double-spacing: changed `margin-bottom: var(--space-4)` to `margin-bottom: 0` (flex gap already provides spacing)
