# JS restructuring plan

**Date:** 2026-03-05
**Branch:** v.2
**Baseline commit:** 650254b

---

## Problem

Four JS files totalling 20,258 lines with no module boundaries:

| File | Lines | Concerns |
|------|------:|----------|
| `app.js` | 2,474 | State machine, step handlers, sub-item routing, dev tools |
| `ui.js` | 6,916 | Panels, chatbox, inspector, cards, charts, data layers, AI chat, overlays, quick look |
| `map-controller.js` | 7,038 | Camera, markers, 22+ layer systems, animations, heartbeat |
| `data.js` | 3,830 | All mock data for every step |

### Specific issues

1. **ui.js and map-controller.js are monoliths** with 10+ unrelated concerns each.
2. **Duplicated patterns** across files:
   - Toggle logic (splice/push + re-render) appears 3 times.
   - History stacks implemented twice (chatbox, panel).
   - Panel show/hide pattern repeated 10+ times.
   - Modal animation pattern repeated 4 times.
   - Circular array navigation repeated 3 times.
   - Airport detail panel functions nearly identical (4 functions).
   - Evidence card HTML generation duplicated (science park, airport).
3. **No shared utilities** - formatting, icons (70+ lines of inline SVG), timing constants, and helpers inlined wherever needed.
4. **Massive if/else chains** - `toggleLayer()` is 143 lines of conditionals.
5. **17 card renderers** mixed with unrelated UI code.
6. **Dev tools** (step jumper, QA reporter, camera debug) bundled with production code.
7. **Bare `setTimeout` values** instead of semantic timing constants in 12+ places.

---

## Target structure

Migrate to ES modules (`import`/`export`) loaded via `<script type="module">`. Single entry point `js/main.js` bootstraps the app.

```
js/
├── main.js                     # Entry point: imports app, binds DOMContentLoaded
│
├── app.js                      # Core state machine, step navigation (~800 lines)
├── step-handlers.js            # Step-specific sub-item handlers (~1,200 lines)
│
├── ui/
│   ├── index.js                # UI facade: re-exports all UI modules as single object
│   ├── core.js                 # Chatbox, panel, FAB, modal show/hide, draggable (~600 lines)
│   ├── inspector.js            # Inspector panel + stage renderers (~1,400 lines)
│   ├── cards.js                # All card renderers (~1,200 lines)
│   ├── charts.js               # Chart.js rendering + data tables (~400 lines)
│   ├── data-layers.js          # Data layer toggles, dashboard, QA panel (~800 lines)
│   ├── ai-chat.js              # AI chat system (~400 lines)
│   ├── overlays.js             # Entry/exit overlays, portfolio summary, quick look (~600 lines)
│   └── evidence.js             # Disclosure groups, evidence preview (~500 lines)
│
├── map/
│   ├── index.js                # MapController facade: re-exports all map modules
│   ├── core.js                 # Map init, camera system, safe source/layer ops (~800 lines)
│   ├── markers.js              # Marker creation, HTML templates, tooltips (~400 lines)
│   ├── resources.js            # Water, energy layers, resource arcs (~1,200 lines)
│   ├── infrastructure.js       # Roads, rail, airport, grand airport (~1,400 lines)
│   ├── zones.js                # Science park, investment zones, future zones (~600 lines)
│   ├── properties.js           # Property markers, context lines (~400 lines)
│   ├── airlines.js             # Airline routes, destination markers (~400 lines)
│   ├── data-layers.js          # Generic data layer markers, animated routes (~500 lines)
│   └── heartbeat.js            # Idle drift, marker pulse (~200 lines)
│
├── data/
│   ├── index.js                # Re-exports AppData + STEPS + CAMERA_STEPS
│   ├── steps.js                # STEPS array, STAGE_TABS, CAMERA_STEPS (~200 lines)
│   ├── resources.js            # Water, power, sewage, silicon island, kyushu energy (~500 lines)
│   ├── infrastructure.js       # Science park, grand airport, roads, stations (~600 lines)
│   ├── government.js           # Government chain, tiers, prefecture boundary (~300 lines)
│   ├── companies.js            # Corporate investment data (~200 lines)
│   ├── properties.js           # Property cards, zones, GKTK fund (~800 lines)
│   ├── evidence.js             # Evidence groups (~600 lines)
│   └── data-layers.js          # Toggleable data layer definitions (~500 lines)
│
├── shared/
│   ├── utils.js                # formatYen, formatRelativeTime, toggleArrayItem, cycleIndex, delay
│   ├── icons.js                # SVG icon map (getLucideIcon, getDocTypeIcon)
│   ├── timing.js               # TIMING constants + easing definitions
│   └── history-stack.js        # Reusable HistoryStack class
│
└── dev/
    ├── step-jumper.js           # Step jumper tool
    ├── qa-reporter.js           # QA reporter tool
    └── camera-debug.js          # Camera debug overlay
```

### index.html change

Replace all `<script>` tags with a single module entry point:

```html
<!-- Before -->
<script src="js/data.js"></script>
<script src="js/map-controller.js"></script>
<script src="js/ui.js"></script>
<script src="js/app.js"></script>

<!-- After -->
<script type="module" src="js/main.js"></script>
```

### Facade pattern

Each subdirectory has an `index.js` that composes sub-modules into the same public API the rest of the codebase expects. This means `app.js` can still call `MapController.flyToStep()` or `UI.showPanel()` without knowing which sub-module implements them.

Example for `js/map/index.js`:

```javascript
import { mapCore } from './core.js';
import { markerMethods } from './markers.js';
import { resourceMethods } from './resources.js';
// ...

const MapController = Object.assign(
  {},
  mapCore,
  markerMethods,
  resourceMethods,
  // ...
);

export default MapController;
```

Example for a sub-module like `js/map/resources.js`:

```javascript
import { TIMING } from '../shared/timing.js';
import AppData from '../data/index.js';

// Private state stays in module scope
let _waterOverlayVisible = false;

export const resourceMethods = {
  showWaterResourceLayer() { ... },
  hideWaterResourceLayer() { ... },
  showResourceArcs(resourceId) { ... },
  // ...
};
```

### Circular dependency strategy

The main risk is circular imports between `app.js`, `UI`, and `MapController` (they all reference each other). Resolution:

1. **`shared/` and `data/`** have zero upstream dependencies. They never import from `app`, `ui/`, or `map/`.
2. **`map/`** modules import from `shared/` and `data/` only. Any callbacks to `App` or `UI` go through event dispatch or are passed as parameters.
3. **`ui/`** modules import from `shared/`, `data/`, and `map/` (for `flyToStep` etc). Any callbacks to `App` go through a lightweight event bus or are passed as parameters.
4. **`app.js`** imports from everything. It is the top-level orchestrator.
5. **Late binding** for unavoidable cross-references: `map/` and `ui/` modules that need `App` accept it via a `setApp(appRef)` initializer called once from `main.js`.

```
shared/  <--  data/  <--  map/  <--  ui/  <--  app.js  <--  main.js
                                                              |
                                                          dev/ tools
```

---

## What gets deduplicated

| Pattern | Current | After |
|---------|---------|-------|
| Toggle logic (splice/push + re-render) | 3 implementations | `toggleArrayItem(array, item)` in `shared/utils.js` |
| History stacks (chatbox + panel) | 2 manual implementations | `HistoryStack` class in `shared/history-stack.js` |
| Modal show/hide animation | 4 inline implementations | `showModal(el)` / `hideModal(el)` in `ui/core.js` |
| Panel detail pattern | 10+ functions with identical structure | Template helper `showDetailPanel(type, data)` in `ui/core.js` |
| SVG icons | 70+ lines inlined in `getLucideIcon()` | Icon map in `shared/icons.js` |
| Circular array navigation | 3 implementations | `cycleIndex(length, current, direction)` in `shared/utils.js` |
| Chart lifecycle (destroy + canvas check) | 3 inline patterns | `withChart(id, renderFn)` wrapper in `ui/charts.js` |
| Airport detail panels | 4 near-identical functions | Single `showBentoDetailPanel(config)` |
| Evidence card HTML | 2 identical structures | Single `renderEvidenceCard(data)` in `ui/cards.js` |
| `setTimeout` with bare numbers | 12+ occurrences | `TIMING.*` constants from `shared/timing.js` |
| Welcome chatbox HTML | 3 duplicate locations | Single `WELCOME_CONTENT` constant in `data/steps.js` |
| State reset subsets | 4 locations | `resetStepState()` helper in `app.js` |

---

## Migration phases

Each phase is a separate commit. Test the app in-browser after each phase before moving to the next.

### Phase 1: Add module entry point and shared utilities

**Goal:** Establish the module infrastructure without breaking existing code.

1. Create `js/shared/timing.js` - extract `TIMING` constant from `app.js`.
2. Create `js/shared/utils.js` - extract `toggleArrayItem`, `cycleIndex`, `delay`, `formatYen`, `formatRelativeTime`, `formatStatLabel`.
3. Create `js/shared/icons.js` - extract `getLucideIcon`, `getDocTypeIcon`, `getTypeLabel` from `ui.js`.
4. Create `js/shared/history-stack.js` - new `HistoryStack` class.
5. Create `js/main.js` as module entry point.
6. Update `index.html` to use `<script type="module">`.

**Verification:** App loads and runs identically.

### Phase 2: Split data.js

**Goal:** Break data into domain-specific files.

1. Create `js/data/steps.js` - `STEPS`, `STAGE_TABS`, `CAMERA_STEPS`.
2. Create `js/data/resources.js` - `resources`, `kyushuEnergy`, `sewageInfrastructure`, `siliconIsland`.
3. Create `js/data/infrastructure.js` - `sciencePark`, `scienceParkZonePlans`, `grandAirportData`, `infrastructureRoads`, `infrastructureStation`, `haramizuStation`.
4. Create `js/data/government.js` - `governmentChain`, `governmentTiers`, `kumamotoPrefectureBoundary`.
5. Create `js/data/companies.js` - `companies`, `jasmLocation`.
6. Create `js/data/properties.js` - `properties`, `investmentZones`, `futureZones`, `gktk`.
7. Create `js/data/evidence.js` - `evidenceGroups`.
8. Create `js/data/data-layers.js` - `dataLayers`, `demandProjections`.
9. Create `js/data/index.js` - compose `AppData` object from all sub-modules.
10. Delete original `js/data.js`.

**Verification:** All steps render with correct data. Spot-check sub-items, panels, and map markers.

### Phase 3: Extract dev tools

**Goal:** Isolate developer-only code.

1. Create `js/dev/step-jumper.js` - extract `StepJumper` from `app.js`.
2. Create `js/dev/qa-reporter.js` - extract `QAReporter` from `app.js`.
3. Camera debug stays in `map-controller.js` (tight coupling to `this.map` state).
4. Update `main.js` to import dev tools from `js/dev/`.

**Verification:** Step jumper, QA reporter, and camera debug all still work.

### Phase 4: Split map-controller.js

**Goal:** Break the map controller into domain modules. Start with the most self-contained pieces, work inward.

**Order of extraction (each is a sub-commit):**

1. `js/map/core.js` - `init`, `waitReady`, camera system (`flyToStep`, `cinematicSpiralTo`, `elevateToCorridorView`, `forwardReveal`, `reverseReveal`, `resetView`, `flyTo`, `flyToLocation`), private helpers (`_toMapbox`, `_calculateBearing`, `_generateCirclePolygon`, `_safeAddSource`, `_safeRemoveLayer`, `_safeRemoveSource`, `_removeLayerGroup`, `_delay`, `_frame`, `_enableInteraction`, `_waitForMoveEnd`, `setBuildingOpacity`, `_addBuildingLayer`), and all shared state (`map`, `markers`, `_layerGroups`, etc).
2. `js/map/markers.js` - `_createMarker`, `_elevatedMarkerHtml`, `_markerIconHtml`, `_brandedMarkerHtml`, `_addTooltip`, `_evidenceMarkerHtml`, `_dataLayerMarkerHtml`.
3. `js/map/airlines.js` - `showAirlineRoutes`, `hideAirlineRoutes`, `generateBezierPoints`, `_addArcLine`, `_addAnimatedArcLine`, `_createDestinationMarker`, `_createBrandedDestinationMarker`.
4. `js/map/heartbeat.js` - `startHeartbeat`, `stopHeartbeat`, `pauseHeartbeat`, `_resetIdleTimer`, `_startDrift`, `_stopDrift`, `setActiveMarkerPulse`, `clearMarkerPulse`.
5. `js/map/resources.js` - water layers, energy types, resource arcs, kyushu energy.
6. `js/map/zones.js` - science park, zone plan highlights, investment zones, future zones.
7. `js/map/properties.js` - property markers, context lines, evidence markers.
8. `js/map/infrastructure.js` - roads, rail, stations, grand airport, road extensions, line growth animation.
9. `js/map/data-layers.js` - generic data layer markers, animated route layers.
10. `js/map/index.js` - compose all modules into `MapController`.
11. Delete original `js/map-controller.js`.

**Shared state approach:** `core.js` owns the mutable state (`map`, `markers`, `_layerGroups`, etc) and exports getter/setter functions. Sub-modules import these to read and mutate state.

**Verification after each sub-commit:** Navigate through all 11 steps. Confirm markers appear, cameras fly, layers toggle on/off.

### Phase 5: Split ui.js

**Goal:** Break UI into concern-specific modules.

**Order of extraction:**

1. `js/ui/core.js` - `init`, `initDraggableModals`, `makeDraggable`, `bindEvents`, chatbox system (`showChatbox`, `hideChatbox`, `updateChatbox`, `chatboxBack`), panel system (`showPanel`, `hidePanel`, `navigateBack`, `togglePanel`), FAB (`reopenChat`, `showChatFab`, `hideChatFab`), `announceToScreenReader`, `_ensureTransitionOverlay`. Refactor chatbox/panel history to use `HistoryStack`.
2. `js/ui/cards.js` - all 17 `render*Card` functions plus `renderStickySummaryRow`.
3. `js/ui/charts.js` - `destroyChart`, `generateDataTable`, `renderScenarioChart`, `renderTrendChart`, `renderInvestmentChart`. Add `withChart(id, fn)` wrapper.
4. `js/ui/evidence.js` - disclosure groups (`generateDisclosureGroup`, `toggleDisclosureGroup`, `selectDisclosureItem`, `showDisclosureItemDetail`, `backToDisclosureList`, `showEvidenceListPanel`, `findEvidenceGroup`), evidence preview, truth engine, area stats.
5. `js/ui/ai-chat.js` - `initAIChat`, `showAIChat`, `hideAIChat`, `sendAIMessage`, `addChatMessage`, `showTypingIndicator`, `hideTypingIndicator`, `generateAIResponse`, `scheduleCall`, `showQAChatbox`.
6. `js/ui/overlays.js` - entry/exit overlays, portfolio summary, GKTK summary, quick look lightbox, focus trap, gallery navigation.
7. `js/ui/data-layers.js` - `showDataLayers`, `toggleLayer` (refactored from if/else to dispatch table), `syncDataLayersToStep`, `activateDataLayer`, `deactivateDataLayer`, layer dashboard, QA panel.
8. `js/ui/inspector.js` - `renderInspectorPanel`, `switchInspectorTab`, `updateInspectorForStep`, `initPanelResize`, all `_renderStage*` functions, stage data getters, `_attachInspectorHandlers`.
9. `js/ui/index.js` - compose all modules into `UI`.
10. Delete original `js/ui.js`.

**Verification after each sub-commit:** Full walkthrough of all steps. Test chatbox history, panel back button, inspector tabs, data layer toggles, AI chat, quick look.

### Phase 6: Split app.js and extract step handlers

**Goal:** Separate the step-specific routing from core state machine.

1. `js/step-handlers.js` - extract all `_handle*SubItem` functions, `toggleEnergyType`, `toggleGovernmentLevel`, `toggleInvestmentZone`, `toggleDevelopmentChild`, `_showDevelopmentMapElement`, `_removeDevelopmentMapElement`, `_renderDevelopmentDashboard`, airport/road/railway detail functions, `selectProperty`, `activatePropertyDashboard`, `_renderFinalChatbox`, `enterQAMode`.
2. Clean up `js/app.js` - keep `init`, `restart`, `goToStep`, `nextStep`, `prevStep`, `_exitStep`, `_showStepLayers`, `_hideStepLayers`, `_renderStepChatbox`, `_renderStepPanel`, `_applyStepPulse`, `restoreChatbox`. Extract `resetStepState()` helper. Extract `WELCOME_CONTENT` constant.
3. `js/main.js` - import everything, wire up `setApp()` calls, bind `DOMContentLoaded`.

**Verification:** Full end-to-end walkthrough. Test every sub-item in every step.

### Phase 7: Final cleanup

1. Replace all bare `setTimeout` numbers with `TIMING.*` references.
2. Deduplicate remaining patterns identified during extraction.
3. Refactor `toggleLayer()` from if/else chain to dispatch table.
4. Remove dead code discovered during migration.
5. Update `CLAUDE.md` file structure section to reflect new layout.

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Circular imports between app, UI, map | Strict dependency direction (shared < data < map < ui < app). Late binding via `setApp()` for unavoidable back-references. |
| Breaking inline `onclick` handlers in HTML strings | HTML template strings reference global functions. After module migration, expose necessary handlers on `window` from `main.js`. |
| Regression in step choreography | Test each step's full flow (entry camera, markers, sub-items, panel, exit) after each phase. |
| `this` context loss when methods are spread across files | Sub-modules export plain objects with methods. The facade `Object.assign` preserves `this` context since methods are called on the composed object. |
| CORS issues with `type="module"` on `file://` | Must serve via local dev server (`npx serve` or similar). Already likely the case due to Mapbox. |

---

## Estimated line counts after restructuring

| Directory | Files | Lines | Notes |
|-----------|------:|------:|-------|
| `js/shared/` | 4 | ~300 | New: utilities, icons, timing, history stack |
| `js/data/` | 9 | ~3,700 | Split from data.js, minimal new code |
| `js/map/` | 10 | ~6,500 | Split from map-controller.js, minus deduplication |
| `js/ui/` | 9 | ~6,000 | Split from ui.js, minus deduplication |
| `js/` (root) | 3 | ~2,200 | app.js, step-handlers.js, main.js |
| `js/dev/` | 3 | ~650 | Extracted dev tools |
| **Total** | **38** | **~19,350** | ~900 lines saved from deduplication |

No single file exceeds ~1,400 lines. Most are under 800.

---

## Progress log

### Phase 1: ES module conversion - done
**Commit:** `9bdfa0b`

Converted all 4 JS files to ES modules with `import`/`export`. Single entry point `js/main.js` loaded via `<script type="module">`. All globals exposed on `window` for inline onclick compatibility. Created `js/shared/` with timing, utils, icons, and history-stack modules (ready for use in later phases, not yet consumed by legacy code).

### Phase 2: Split data.js - done
**Commit:** `69e43c7`

Replaced `data.js` (3,832 lines) with 9 files in `js/data/`: steps, resources, infrastructure, government, companies, properties, evidence, data-layers, plus index.js. No file exceeds 1,037 lines.

### Phase 3: Extract dev tools - done
**Commit:** `43cb94a`

Moved StepJumper (224 lines) and QAReporter (368 lines) from `app.js` into `js/dev/`. Camera debug left in `map-controller.js` due to tight `this.map` coupling. `app.js` reduced from 2,474 to 1,890 lines.

**Current state after Phase 3:**

| File | Lines | Change |
|------|------:|--------|
| `js/app.js` | 1,890 | Was 2,474 (-584) |
| `js/ui.js` | 6,920 | Unchanged (imports added) |
| `js/map-controller.js` | 7,044 | Unchanged (imports added) |
| `js/data/` (9 files) | 3,888 | Was data.js 3,832 |
| `js/shared/` (4 files) | 296 | New |
| `js/dev/` (2 files) | 592 | Extracted from app.js |
| `js/main.js` | 39 | New |

### Phase 4: Split map-controller.js - next

### Phase 5: Split ui.js - pending

### Phase 6: Split app.js and extract step handlers - pending

### Phase 7: Final cleanup and deduplication - pending
