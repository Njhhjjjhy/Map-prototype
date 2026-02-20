# 12-Step Linear Journey Rewrite - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current 3-journey (A/B/C) state machine with a linear 12-step flow that matches the real presentation structure, where a presenter clicks through steps sequentially.

**Architecture:** The current app uses a `question` + `step` state pair inside `App.state` that drives chatbox content, panel content, camera positions, and marker visibility. We replace this with a single `App.state.currentStep` (1-12) and a flat `STEPS` array in `data.js` that defines everything each step needs: camera position, markers to show/hide, chatbox content, panel content, and layer configuration. The chatbox becomes a step navigator with clickable sub-items within each step, and a "Continue" button advances to the next step. Transitions between steps use the existing `MapController.flyToStep()` and marker show/hide choreography.

**Tech Stack:** Vanilla JS (no frameworks), Mapbox GL JS, Chart.js. No build step. Files: `js/app.js`, `js/data.js`, `js/map-controller.js`, `js/ui.js`.

---

## Current Architecture Summary

Before implementing, understand what exists:

### State Machine (app.js)
- `App.state.question` (1-5) + `App.state.step` (string like `Q1_water`, `Q2_gov`, etc.)
- Journey A (`startJourneyA` through `transitionToJourneyB`): 7 steps covering resources, ecosystem, location, talent
- Journey B (`startJourneyB` through `transitionToJourneyC`): 4 steps covering government, corporate, timeline, infrastructure
- Journey C (`startJourneyC` through `complete`): property corridor + recap
- `STAGE_MAP` in data.js maps step strings to stage numbers (1-8) for inspector panel tabs

### Data Layer (data.js)
- `STAGE_MAP` and `STAGE_TABS`: step-to-panel mapping
- `AppData.resources`: water and power with evidence markers
- `AppData.kyushuEnergy`: solar, wind, nuclear locations
- `AppData.talentPipeline`: 5 university institutions
- `AppData.governmentChain` / `AppData.governmentTiers`: government commitment markers
- `AppData.companies`: 7 corporate markers (JASM, Sony, TEL, Mitsubishi, SUMCO, Kyocera, Rohm Apollo)
- `AppData.sciencePark`, `AppData.futureZones`, `AppData.investmentZones`: zone overlays
- `AppData.infrastructureRoads`: 3 road polylines + `infrastructureStation` + `haramizuStation`
- `AppData.airlineRoutes`: origin (KMJ) + 7 destinations
- `AppData.properties`: 3 properties (Ozu Sugimizu, Kikuyo Kubota, Haramizu Land) each with 4 cards
- `AppData.evidenceGroups`: 4 groups (energy-infrastructure, transportation-network, government-zones, education-pipeline)
- `AppData.gktk`: fund vehicle data
- `AppData.siliconIsland`, `AppData.sewageInfrastructure`: standalone data objects

### Map Controller (map-controller.js)
- `CAMERA_STEPS`: 16 named positions (A0, A1, A2_overview, ..., corridor, complete)
- Marker groups tracked in `_layerGroups`: resources, sciencePark, companies, futureZones, properties, route, evidenceMarkers, infrastructureRoads, airlineRoutes, kyushuEnergy, governmentChain, investmentZones, semiconductorNetwork, talentPipeline
- Key methods: `showResourceMarker()`, `showKyushuEnergy()`, `showAirlineRoutes()`, `showTalentPipeline()`, `showGovernmentChain()`, `showCompanyMarkers()`, `showSciencePark()`, `showInvestmentZones()`, `showInfrastructureRoads()`, `showSemiconductorNetwork()`, `addPropertyMarkers()`, `addRouteLines()`, `elevateToCorridorView()`
- Hide counterparts for each show method
- `cinematicEntry()`, `flyToStep()`, `forwardReveal()`, `reverseReveal()`
- Heartbeat system for ambient motion

### UI (ui.js)
- `showChatbox()` / `updateChatbox()` / `hideChatbox()` with history stack
- `showPanel()` / `hidePanel()` with history stack and back navigation
- `showTimeToggle()` / `setTimeView()` for present/future toggle
- `showDataLayers()` / `toggleLayersPanel()` for data layer panel
- `showAIChat()` / `hideAIChat()` for post-journey chat
- `showMoreHarvestEntry()` for cinematic brand transition
- `updateJourneyProgress()` / `hideJourneyProgress()` for progress bar
- Evidence library rendering: `showEvidenceListPanel()`, `generateDisclosureGroup()`, etc.
- Property panels: `showPropertyPanel()`, `showPropertyCard()`, `renderScenarioChart()`, etc.
- Dashboard mode: `startDashboardMode()`, `toggleDashboardPanel()`

### Available Evidence Images (assets/use-case-images/)
All `.webp` files available for use in panel content:
- `evidence-renewable-energy.webp` - Solar/wind energy
- `evidence-strategic-location.webp` - Kyushu position map
- `evidence-silicon-island.webp` - Silicon Island heritage
- `evidence-existing-semiconductors.webp` - Existing ecosystem
- `evidence-semiconductor-clusters.webp` - Government zone clusters
- `evidence-science-park.webp` - Science park plan
- `evidence-industrial-park-locations.webp` - Industrial zones
- `evidence-new-railway-system.webp` - New railway
- `evidence-kumamoto-future-road-network.webp` - Future roads
- `evidence-airport-to-city-railway.webp` - Airport access rail
- `evidence-new-grand-airport.webp` - Grand airport
- `evidence-airport-master-plan.webp` - Airport master plan
- `evidence-10-minute-ring-road-2.webp` / `...-3.webp` - Ring road concept
- `evidence-kumamoto-transport-overview.webp` - Transport overview
- `evidence-kumamoto-regional-traffic-flow.webp` - Traffic flow
- `evidence-sewers-utility-systems.webp` - Sewage infrastructure
- `evidence-tsmc-infrastructure-overview.webp` - TSMC overview
- `evidence-tsmc-area-demographic-trends.webp` - Demographics
- `evidence-commuting-hell.webp` - Commute problems
- `vidence-wage-gap-college-graduates.webp` - Wage gap (note: typo in filename, missing 'e')
- `evidence-property-rent-evaluation.webp` - Rent evaluation
- `evidence-rental-assessment-report.webp` - Rental assessment
- `evidence-acquisition-loan-analysis.webp` - Acquisition analysis
- `evidence-real-estate-investment-analysis.webp` - RE investment analysis

---

## The 12 Steps (New Linear Flow)

Each step is a self-contained map scene the presenter advances through sequentially. Steps do not map 1:1 to the old Q1-Q5 structure. The user's 12 steps supersede the Q1-Q5 grouping.

| Step | Title | Content Summary | Camera Focus | Key Map Elements |
|------|-------|----------------|-------------|-----------------|
| 1 | Resources | Water (Coca-Cola/Suntory logos) + Power (solar/wind/nuclear with airline-style lines to TSMC) | Kumamoto regional, then Kyushu-wide for power | Water markers, energy markers, connection lines |
| 2 | Strategic location | Airline-route map (Kyushu to Taiwan, Korea, Shanghai) | Zoomed out East Asia | Airline route lines, destination markers |
| 3 | Government support | Government tiers with dashboard showing tier levels | Kumamoto regional | Government chain markers, tier badges |
| 4 | Corporate investment | Overview of all corporate investment | Kumamoto regional, company cluster | Company markers, semiconductor network lines |
| 5 | Science park + zones | Science park, government zone clusters, Kikuyo/Ozu long-term plans | Science park area | Science park boundary, zone overlays, clickable sub-items |
| 6 | Airport + railway + roads | Airport access, new railway, future road extensions | Transport corridor | Infrastructure road polylines, station markers, airport marker |
| 7 | Education pipeline | University lines to TSMC, training centers, employment | Kyushu-wide then Kumamoto | Talent pipeline markers, connection lines |
| 8 | Future outlook | Composite: science park, grand airport, roads, stations (present/future toggle) | Kumamoto regional | Future toggle, all infrastructure shown in completed state |
| 9 | Investment zones | 3 zones (Kikuyo, Koshi, Ozu) with color-coded overlays | Kumamoto corridor | Investment zone circles, zone detail on click |
| 10 | Properties | Ozu, Kikuyo, Haramizu (each with images + Truth Engine + Future Outlook + Financial) | Per-property drill-down | Property markers, route lines, 4-card panel |
| 11 | Area changes | Clickable icons + present/future toggle | Kumamoto regional | Infrastructure roads, time toggle, evidence library |
| 12 | Final | Chatbox ending (same as current recap + AI chat) | Complete overview | All layers visible, AI chat |

---

## Implementation Tasks

### Task 1: Create New Step Definitions in data.js

**Files:**
- Modify: `js/data.js:11-48` (replace `STAGE_MAP` and `STAGE_TABS`)

**Context:** The current `STAGE_MAP` maps step-string IDs to stage numbers. The new system uses a flat `STEPS` array where each entry defines everything the step needs. `STAGE_TABS` is replaced by per-step tab definitions embedded in the step object.

**Step 1: Replace STAGE_MAP and STAGE_TABS with new STEPS array**

Replace lines 11-48 of `js/data.js` with:

```javascript
/**
 * Linear 12-step journey definition.
 * Each step is a self-contained map scene.
 * `id` is the canonical identifier used by App.state.currentStep.
 * `cameraKey` references a CAMERA_STEPS entry in map-controller.js.
 * `layers` lists which marker/layer groups to show (all others hidden on step entry).
 * `subItems` defines clickable items within the step (shown in chatbox).
 * `panelTabs` defines the right panel tab set for the step.
 */
const STEPS = [
    {
        id: 'resources',
        index: 1,
        title: 'Resources',
        subtitle: 'Water and power infrastructure',
        cameraKey: 'A0',
        layers: ['resources', 'kyushuEnergy'],
        panelTabs: ['Evidence'],
        subItems: [
            { id: 'water', label: 'Water resources', icon: 'droplet' },
            { id: 'power-solar', label: 'Solar power', icon: 'sun' },
            { id: 'power-wind', label: 'Wind power', icon: 'wind' },
            { id: 'power-nuclear', label: 'Nuclear power', icon: 'atom' }
        ]
    },
    {
        id: 'strategic-location',
        index: 2,
        title: 'Strategic location',
        subtitle: 'Kyushu position in Asia',
        cameraKey: 'A3_location',
        layers: ['airlineRoutes'],
        panelTabs: ['Evidence'],
        subItems: []
    },
    {
        id: 'government-support',
        index: 3,
        title: 'Government support',
        subtitle: 'National to local commitment',
        cameraKey: 'B1',
        layers: ['governmentChain', 'sciencePark', 'investmentZones'],
        panelTabs: ['Support', 'Dashboard'],
        subItems: [
            { id: 'central', label: 'Central government', icon: 'landmark' },
            { id: 'prefectural', label: 'Prefectural government', icon: 'building' },
            { id: 'local', label: 'Local municipalities', icon: 'home' }
        ]
    },
    {
        id: 'corporate-investment',
        index: 4,
        title: 'Corporate investment',
        subtitle: 'Seven major players',
        cameraKey: 'B4',
        layers: ['companies', 'semiconductorNetwork'],
        panelTabs: ['Investment', 'Companies'],
        subItems: []
    },
    {
        id: 'science-park-zones',
        index: 5,
        title: 'Science park and zones',
        subtitle: 'Development clusters and long-term plans',
        cameraKey: 'B1_sciencePark',
        layers: ['sciencePark', 'futureZones', 'governmentChain'],
        panelTabs: ['Plans', 'Zones'],
        subItems: [
            { id: 'science-park', label: 'Kumamoto Science Park', icon: 'flask-conical' },
            { id: 'gov-zones', label: 'Government zone clusters', icon: 'target' },
            { id: 'kikuyo-plan', label: 'Kikuyo long-term plan', icon: 'map-pin' },
            { id: 'ozu-plan', label: 'Ozu long-term plan', icon: 'map-pin' }
        ]
    },
    {
        id: 'transport-access',
        index: 6,
        title: 'Airport, railway, and roads',
        subtitle: 'Transport infrastructure',
        cameraKey: 'B7',
        layers: ['infrastructureRoads'],
        panelTabs: ['Overview', 'Timeline'],
        subItems: [
            { id: 'airport', label: 'Airport access', icon: 'plane' },
            { id: 'railway', label: 'New railway', icon: 'train-front' },
            { id: 'roads', label: 'Future road extensions', icon: 'route' }
        ]
    },
    {
        id: 'education-pipeline',
        index: 7,
        title: 'Education pipeline',
        subtitle: 'Universities, training, and employment',
        cameraKey: 'A3_talent',
        layers: ['talentPipeline'],
        panelTabs: ['Education', 'Employment'],
        subItems: [
            { id: 'universities', label: 'Universities', icon: 'graduation-cap' },
            { id: 'training', label: 'Training centers', icon: 'school' },
            { id: 'employment', label: 'Employment data', icon: 'briefcase' }
        ]
    },
    {
        id: 'future-outlook',
        index: 8,
        title: 'Future outlook',
        subtitle: 'Composite 2030+ vision',
        cameraKey: 'B6',
        layers: ['sciencePark', 'futureZones', 'infrastructureRoads', 'investmentZones'],
        panelTabs: ['Plans', 'Timeline'],
        showTimeToggle: true,
        subItems: []
    },
    {
        id: 'investment-zones',
        index: 9,
        title: 'Investment opportunity zones',
        subtitle: 'Three zones in the silicon triangle',
        cameraKey: 'corridor',
        layers: ['investmentZones'],
        panelTabs: ['Zones', 'Metrics'],
        subItems: [
            { id: 'kikuyo-zone', label: 'Kikuyo zone', icon: 'target' },
            { id: 'koshi-zone', label: 'Koshi zone', icon: 'target' },
            { id: 'ozu-zone', label: 'Ozu zone', icon: 'target' }
        ]
    },
    {
        id: 'properties',
        index: 10,
        title: 'Properties',
        subtitle: 'Investment opportunities',
        cameraKey: 'corridor',
        layers: ['properties', 'route'],
        panelTabs: ['Images', 'Truth Engine', 'Future Outlook', 'Financial'],
        subItems: [
            { id: 'ozu-sugimizu', label: 'Ozu Sugimizu', icon: 'house' },
            { id: 'kikuyo-kubota', label: 'Kikuyo Kubota', icon: 'house' },
            { id: 'haramizu-land', label: 'Haramizu Land', icon: 'house' }
        ]
    },
    {
        id: 'area-changes',
        index: 11,
        title: 'Area changes',
        subtitle: 'Present vs future comparison',
        cameraKey: 'B6',
        layers: ['infrastructureRoads', 'futureZones'],
        panelTabs: ['Overview', 'Evidence'],
        showTimeToggle: true,
        subItems: []
    },
    {
        id: 'final',
        index: 12,
        title: 'Journey complete',
        subtitle: 'Summary and Q&A',
        cameraKey: 'complete',
        layers: ['companies', 'properties', 'investmentZones', 'infrastructureRoads', 'sciencePark'],
        panelTabs: [],
        subItems: []
    }
];

/**
 * Step-to-index lookup for quick access.
 */
const STEP_MAP = {};
STEPS.forEach(s => { STEP_MAP[s.id] = s.index; });

/**
 * Legacy STAGE_MAP compatibility shim.
 * Maps old step string IDs to new step indices for any code still referencing them.
 * Remove once all references are migrated.
 */
const STAGE_MAP = {
    'Q1_intro': 1, 'Q1_water': 1, 'Q1_power': 1, 'Q1_sewage': 1,
    'Q1_silicon': 1, 'Q1_strategic': 2,
    'Q2_gov': 3, 'Q2_corporate': 4,
    'Q3_timeline': 5, 'Q3_education': 7, 'Q3_future': 8,
    'Q4_zones': 9,
    'Q5_prop1': 10, 'Q5_prop2': 10, 'Q5_prop3': 10, 'Q5_final': 12
};

/**
 * Tab sets per step index (replaces old STAGE_TABS).
 */
const STAGE_TABS = {};
STEPS.forEach(s => {
    STAGE_TABS[s.index] = { label: s.subtitle, tabs: s.panelTabs };
});
```

**Step 2: Verify data.js loads without errors**

Open the app in a browser and check the console for syntax errors. The app will still run the old flow because `app.js` has not been changed yet, but the new constants must be accessible.

Run: Open browser console, type `STEPS.length` - should return `12`.
Run: `STEP_MAP['properties']` - should return `10`.

**Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat: add 12-step linear journey definitions to data.js"
```

---

### Task 2: Add New Camera Positions to map-controller.js

**Files:**
- Modify: `js/map-controller.js:45-63` (extend `CAMERA_STEPS`)

**Context:** The current `CAMERA_STEPS` has positions named after the old A/B/C journeys. We need to add new named positions for steps that don't have an exact match, and ensure every step's `cameraKey` resolves. Several existing positions can be reused as-is.

**Step 1: Add missing camera positions**

After the existing `CAMERA_STEPS` entries (line 62), add these new named positions. Do not remove the existing ones yet (they are still referenced by map-controller methods like `showAirlineRoutes`):

```javascript
// Add inside CAMERA_STEPS object:
    // 12-step additions (some alias existing positions)
    resources:          { center: [130.78, 32.83], zoom: 11.5, pitch: 45, bearing: -5, duration: 2000 },
    strategic:          { center: [129.5, 31.5], zoom: 5, pitch: 20, bearing: 0, duration: 3000 },
    government:         { center: [130.78, 32.84], zoom: 11.5, pitch: 48, bearing: -10, duration: 2000 },
    corporate:          { center: [130.80, 32.86], zoom: 12, pitch: 52, bearing: 30, duration: 2500 },
    scienceParkZones:   { center: [130.78, 32.87], zoom: 11, pitch: 45, bearing: 5, duration: 2000 },
    transport:          { center: [130.80, 32.86], zoom: 12, pitch: 55, bearing: 15, duration: 2500 },
    education:          { center: [130.7, 32.5], zoom: 7, pitch: 25, bearing: 0, duration: 2500 },
    futureOutlook:      { center: [130.83, 32.87], zoom: 11.5, pitch: 50, bearing: -20, duration: 2000 },
    zones:              { center: [130.82, 32.82], zoom: 12.5, pitch: 50, bearing: -15, duration: 2000 },
    areaChanges:        { center: [130.83, 32.87], zoom: 11.5, pitch: 50, bearing: -20, duration: 2000 },
```

**Step 2: Verify no syntax errors**

Open browser, check console. Type `CAMERA_STEPS.resources` - should return object with center/zoom/pitch/bearing.

**Step 3: Commit**

```bash
git add js/map-controller.js
git commit -m "feat: add camera positions for 12-step journey"
```

---

### Task 3: Rewrite App State Machine for Linear Steps

**Files:**
- Modify: `js/app.js` (rewrite state machine core)

**Context:** This is the largest change. The entire `App` object is rewritten to use a `currentStep` index (1-12) instead of `question` + `step` pairs. The core loop becomes: `goToStep(n)` which (1) runs exit choreography for current step, (2) flies camera, (3) shows/hides layers, (4) renders chatbox and panel.

**Step 1: Rewrite App.state and core navigation**

Replace the entire `App.state` object and add the core `goToStep` method. Keep `init()` and `start()` mostly the same but route to step 1 instead of `startJourneyA()`.

```javascript
const App = {
    state: {
        currentStep: 0,       // 1-12, 0 = not started
        subItemsExplored: [], // Track which sub-items within current step have been viewed
        activeProperty: null, // Currently selected property ID (step 10)
        futureView: false,    // Whether future toggle is active (steps 8, 11)
    },

    /**
     * Initialize the app
     */
    init() {
        UI.init();
        MapController.init();
    },

    /**
     * Start the journey (called when Start button is clicked)
     */
    async start() {
        UI.showApp();
        await new Promise(r => setTimeout(r, 600));
        await MapController.waitReady();
        if (MapController.map) {
            MapController.map.resize();
        }
        await MapController.cinematicEntry();
        await new Promise(r => setTimeout(r, TIMING.breath));
        this.goToStep(1);
    },

    /**
     * Core step navigation. Handles exit from current step,
     * camera flight, layer management, and content rendering.
     */
    async goToStep(stepIndex) {
        const step = STEPS[stepIndex - 1];
        if (!step) return;

        const prevStep = this.state.currentStep;

        // --- Exit choreography for previous step ---
        if (prevStep > 0) {
            await this._exitStep(prevStep);
        }

        // --- Update state ---
        this.state.currentStep = stepIndex;
        this.state.subItemsExplored = [];
        this.state.activeProperty = null;

        // --- Progress bar ---
        UI.updateJourneyProgress(stepIndex, STEPS.length);

        // --- Camera flight ---
        const camKey = step.cameraKey;
        const camPos = CAMERA_STEPS[camKey] || CAMERA_STEPS.A0;
        await MapController.flyToStep(camPos);

        // --- Breathing room ---
        await new Promise(r => setTimeout(r, TIMING.breathShort));

        // --- Layer management ---
        this._showStepLayers(step);

        // --- Time toggle visibility ---
        if (step.showTimeToggle) {
            UI.showTimeToggle();
        } else {
            UI.hideTimeToggle();
        }

        // --- Render chatbox and panel ---
        this._renderStepChatbox(step);
        this._renderStepPanel(step);

        // --- Data layers ---
        UI.showDataLayers(stepIndex);

        // --- Heartbeat ---
        MapController.startHeartbeat();

        // --- Accessibility ---
        UI.announceToScreenReader(`Step ${stepIndex}: ${step.title}`);
    },

    /**
     * Advance to the next step. Called by "Continue" buttons.
     */
    nextStep() {
        const next = this.state.currentStep + 1;
        if (next <= STEPS.length) {
            this.goToStep(next);
        }
    },

    /**
     * Go back to the previous step.
     */
    prevStep() {
        const prev = this.state.currentStep - 1;
        if (prev >= 1) {
            this.goToStep(prev);
        }
    },
    // ... (remaining methods defined in subsequent tasks)
};
```

**Step 2: Add the _exitStep private method**

This method handles cleanup when leaving a step. It fades out markers, hides chatbox/panel, and cleans up step-specific layers.

```javascript
    /**
     * Exit choreography for a step.
     * Fades markers, hides UI, cleans up layers.
     */
    async _exitStep(stepIndex) {
        MapController.stopHeartbeat();
        UI.saveChatboxToHistory();

        const step = STEPS[stepIndex - 1];
        if (!step) return;

        // Fade out all visible markers from this step's layer groups
        const markersToFade = [];
        (step.layers || []).forEach(group => {
            const ids = MapController._layerGroups[group] || [];
            ids.forEach(id => {
                if (MapController.markers[id]) markersToFade.push(MapController.markers[id]);
            });
        });

        // Also collect airline markers, infrastructure markers, talent markers
        if (MapController.airlineOriginMarker) markersToFade.push(MapController.airlineOriginMarker);
        markersToFade.push(...MapController.airlineDestinationMarkers);
        markersToFade.push(...MapController.infrastructureMarkers);

        if (markersToFade.length > 0) {
            await MapController.fadeOutMarkers(markersToFade);
        }

        // Hide UI
        UI.hideChatbox();
        UI.hidePanel();

        // Clean up step-specific map elements
        this._hideStepLayers(step);

        // Reset future view if active
        if (this.state.futureView) {
            UI.setTimeView('present');
            this.state.futureView = false;
        }

        await new Promise(r => setTimeout(r, TIMING.breathShort));
    },
```

**Step 3: Add _showStepLayers and _hideStepLayers**

These methods manage which map layers are visible for each step by calling the existing MapController show/hide methods.

```javascript
    /**
     * Show the map layers required for a step.
     */
    _showStepLayers(step) {
        const layers = step.layers || [];

        if (layers.includes('resources')) {
            MapController.showResourceMarker('water');
        }
        if (layers.includes('kyushuEnergy')) {
            MapController.showKyushuEnergy();
        }
        if (layers.includes('airlineRoutes')) {
            MapController.showAirlineRoutes();
        }
        if (layers.includes('governmentChain')) {
            MapController.showGovernmentChain();
        }
        if (layers.includes('sciencePark')) {
            MapController.showSciencePark();
        }
        if (layers.includes('investmentZones')) {
            MapController.showInvestmentZones();
        }
        if (layers.includes('companies')) {
            MapController.showCompanyMarkers();
        }
        if (layers.includes('semiconductorNetwork')) {
            setTimeout(() => {
                MapController.showSemiconductorNetwork();
            }, AppData.companies.length * 80 + 200);
        }
        if (layers.includes('futureZones')) {
            // Future zones shown via time toggle or directly
        }
        if (layers.includes('infrastructureRoads')) {
            MapController.showInfrastructureRoads();
        }
        if (layers.includes('talentPipeline')) {
            MapController.showTalentPipeline();
        }
        if (layers.includes('properties')) {
            MapController.addPropertyMarkers(AppData.properties);
            const jasmCoords = AppData.jasmLocation || [32.874, 130.785];
            MapController.addRouteLines(AppData.properties, jasmCoords);
        }
    },

    /**
     * Hide the map layers from a step (during exit).
     */
    _hideStepLayers(step) {
        const layers = step.layers || [];

        if (layers.includes('airlineRoutes')) MapController.hideAirlineRoutes();
        if (layers.includes('kyushuEnergy')) MapController.hideKyushuEnergy();
        if (layers.includes('talentPipeline')) MapController.hideTalentPipeline();
        if (layers.includes('infrastructureRoads')) MapController.hideInfrastructureRoads();
        if (layers.includes('investmentZones')) MapController.hideInvestmentZones();
        if (layers.includes('semiconductorNetwork')) MapController.hideSemiconductorNetwork();
        // Resources, sciencePark, companies, properties - cleaned up via marker fade
    },
```

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: rewrite App state machine for linear 12-step navigation"
```

---

### Task 4: Implement Per-Step Chatbox Content

**Files:**
- Modify: `js/app.js` (add `_renderStepChatbox` method)

**Context:** Each step has a chatbox with: (1) a title and narrative paragraph, (2) optional clickable sub-items, (3) a "Continue" button advancing to next step. Sub-items use the existing `.chatbox-options` pattern.

**Step 1: Add _renderStepChatbox method**

This is a large switch/map that renders chatbox HTML for each step. Place it inside the `App` object.

```javascript
    /**
     * Render chatbox content for a step.
     * Each step gets a title, narrative, optional sub-items, and Continue button.
     */
    _renderStepChatbox(step) {
        const chatboxContent = this._getStepChatboxContent(step);
        UI.showChatbox(chatboxContent, { skipHistory: true });
    },

    /**
     * Generate chatbox HTML for a given step.
     */
    _getStepChatboxContent(step) {
        const subItemsHtml = this._renderSubItems(step);
        const continueBtn = step.index < STEPS.length
            ? `<button class="chatbox-continue primary" onclick="App.nextStep()">Continue</button>`
            : '';

        // Step-specific narratives
        const narratives = {
            'resources': {
                title: 'Resources',
                body: 'Semiconductor fabs need <strong>10 million gallons of water daily</strong> and enough electricity to power a small city. Kumamoto has both in surplus.',
                afterItems: ''
            },
            'strategic-location': {
                title: 'Strategic location',
                body: 'Kyushu sits closer to Taiwan, Korea, and Shanghai than Tokyo or Osaka. A semiconductor executive can reach any major Asian foundry partner in <strong>under 4 hours.</strong>',
                afterItems: '<p style="color: var(--color-text-secondary); margin-top: 8px;">Click destinations on the map to see route details.</p>'
            },
            'government-support': {
                title: 'Government support',
                body: '<strong>4+ trillion yen</strong> from the national government. <strong>480 billion yen</strong> from Kumamoto Prefecture. Every level of government is aligned behind semiconductors.',
                afterItems: '<p style="margin-top: 8px;">Click tier markers to see commitment details.</p>'
            },
            'corporate-investment': {
                title: 'Corporate investment',
                body: 'TSMC committed <strong>2.16 trillion yen</strong> for two fabs. Sony, SUMCO, Kyocera, Rohm Apollo, Mitsubishi, Tokyo Electron all announced expansions. <strong>Seven major players</strong>, all converging on Kumamoto.',
                afterItems: '<p style="margin-top: 8px;">Click company markers to see investment scale.</p>'
            },
            'science-park-zones': {
                title: 'Science park and zones',
                body: 'Kumamoto Prefecture designated a special semiconductor development zone with phased activation across multiple municipalities.',
                afterItems: ''
            },
            'transport-access': {
                title: 'Transport access',
                body: 'New expressway links shaving <strong>15 minutes</strong> off the JASM commute. A new rail station. <strong>340 billion yen</strong> in road infrastructure under construction.',
                afterItems: '<p style="margin-top: 8px;">Click any <strong>teal dashed road</strong> or station marker to see details.</p>'
            },
            'education-pipeline': {
                title: 'Education pipeline',
                body: 'METI\'s Kyushu Semiconductor Human Resources Development Alliance coordinates <strong>five universities</strong> across the region, building a purpose-built talent pipeline.',
                afterItems: ''
            },
            'future-outlook': {
                title: 'Future outlook',
                body: 'Toggle to <strong>Future View</strong> to see the 2030+ completed state: science park expansion, grand airport, road completions, and new stations.',
                afterItems: '<p style="margin-top: var(--space-4); font-size: var(--text-sm); color: var(--color-text-tertiary);">Use the Present/Future toggle in the top-left corner.</p>'
            },
            'investment-zones': {
                title: 'Investment zones',
                body: 'Three zones in the silicon triangle, each with a distinct role in the semiconductor ecosystem.',
                afterItems: ''
            },
            'properties': {
                title: 'Investment properties',
                body: `${AppData.properties.length} properties in the semiconductor corridor. Average <strong>12-minute drive</strong> to JASM. Click any amber marker to see the full financial picture.`,
                afterItems: ''
            },
            'area-changes': {
                title: 'Area changes',
                body: 'See what is changing on the ground. Toggle between present and future views. Click infrastructure icons to see evidence.',
                afterItems: ''
            },
            'final': {
                title: 'Journey complete',
                body: '',  // Handled specially below
                afterItems: ''
            }
        };

        const n = narratives[step.id] || { title: step.title, body: '', afterItems: '' };

        // Step 12 (final) gets special recap content
        if (step.id === 'final') {
            return this._renderFinalChatbox();
        }

        // Step 10 (properties) gets fund stats
        let fundStats = '';
        if (step.id === 'properties') {
            const gktk = AppData.gktk;
            if (gktk) {
                const irrValue = gktk.stats[3].value;
                const aumValue = gktk.fundSize;
                const holdValue = gktk.stats[2].value;
                fundStats = `
                    <div class="chatbox-fund-stats">
                        <div class="chatbox-fund-label">GKTK Fund &middot; ${irrValue} Target IRR</div>
                        <div class="chatbox-fund-detail">${aumValue} Target AUM &middot; ${holdValue} Hold</div>
                    </div>
                `;
            }
        }

        return `
            <h3>${n.title}</h3>
            <p>${n.body}</p>
            ${fundStats}
            ${subItemsHtml}
            ${n.afterItems}
            ${continueBtn}
        `;
    },

    /**
     * Render clickable sub-items for a step.
     */
    _renderSubItems(step) {
        if (!step.subItems || step.subItems.length === 0) return '';

        const items = step.subItems.map(item => {
            const explored = this.state.subItemsExplored.includes(item.id);
            return `<button class="chatbox-option ${explored ? 'completed' : ''}"
                        onclick="App.selectSubItem('${item.id}')"
                        ${explored ? 'aria-disabled="true"' : ''}>
                    ${item.label}${explored ? '<span class="sr-only"> (explored)</span>' : ''}
                </button>`;
        }).join('');

        const exploredCount = this.state.subItemsExplored.length;
        const totalCount = step.subItems.length;
        const progress = totalCount > 0
            ? `<div class="resource-progress" style="font-size: var(--text-sm); color: var(--color-text-tertiary); margin-bottom: var(--space-2);">${exploredCount} of ${totalCount} explored</div>`
            : '';

        return `
            ${progress}
            <div class="chatbox-options" role="group" aria-label="Step options">
                ${items}
            </div>
        `;
    },

    /**
     * Handle sub-item selection within a step.
     */
    selectSubItem(itemId) {
        if (!this.state.subItemsExplored.includes(itemId)) {
            this.state.subItemsExplored.push(itemId);
        }
        // Dispatch to step-specific handler
        this._handleSubItem(this.state.currentStep, itemId);
        // Refresh chatbox to show updated explored state
        const step = STEPS[this.state.currentStep - 1];
        if (step) this._renderStepChatbox(step);
    },
```

**Step 2: Add _handleSubItem dispatcher**

This routes sub-item clicks to the appropriate map and panel actions.

```javascript
    /**
     * Handle a sub-item click for a specific step.
     * Routes to the correct map and panel behavior.
     */
    _handleSubItem(stepIndex, itemId) {
        switch (stepIndex) {
            case 1: // Resources
                this._handleResourceSubItem(itemId);
                break;
            case 3: // Government support
                this._handleGovernmentSubItem(itemId);
                break;
            case 5: // Science park + zones
                this._handleZonePlanSubItem(itemId);
                break;
            case 6: // Transport access
                this._handleTransportSubItem(itemId);
                break;
            case 7: // Education pipeline
                this._handleEducationSubItem(itemId);
                break;
            case 9: // Investment zones
                this._handleInvestmentZoneSubItem(itemId);
                break;
            case 10: // Properties
                this._handlePropertySubItem(itemId);
                break;
        }
    },
```

**Step 3: Implement step-specific sub-item handlers**

These are the detailed handlers for each step. Each one calls existing MapController and UI methods.

```javascript
    // --- Step 1: Resources ---
    _handleResourceSubItem(itemId) {
        if (itemId === 'water') {
            MapController.showResourceMarker('water');
            const resource = AppData.resources.water;
            if (resource) UI.showResourcePanel(resource);
        } else if (itemId === 'power-solar' || itemId === 'power-wind' || itemId === 'power-nuclear') {
            MapController.showKyushuEnergy();
            const resource = AppData.resources.power;
            if (resource) UI.showResourcePanel(resource);
            // Fly to Kyushu-wide view for energy
            MapController.flyToStep(CAMERA_STEPS.A2_overview);
        }
    },

    // --- Step 3: Government ---
    _handleGovernmentSubItem(itemId) {
        const tier = AppData.governmentTiers.find(t => t.id === itemId);
        if (tier) {
            UI.showGovernmentTierPanel(tier);
            if (tier.coords) {
                MapController.flyToStep({
                    center: MapController._toMapbox(tier.coords),
                    zoom: 12, pitch: 48, bearing: -10, duration: 1500
                });
            }
        }
    },

    // --- Step 5: Science park + zones ---
    _handleZonePlanSubItem(itemId) {
        if (itemId === 'science-park') {
            const sp = AppData.sciencePark;
            UI.showPanel(`
                <div class="subtitle">Development zone</div>
                <h2>${sp.name}</h2>
                <p>${sp.description}</p>
                <div class="stat-grid">
                    ${sp.stats.map(s => `<div class="stat-item"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
                </div>
            `);
            MapController.flyToStep(CAMERA_STEPS.B1_sciencePark);
        } else if (itemId === 'gov-zones') {
            // Show all zone overlays
            const group = UI.findEvidenceGroup('government-zones');
            if (group) App.showSingleEvidenceGroup(group);
        } else if (itemId === 'kikuyo-plan') {
            const zone = AppData.futureZones.find(z => z.id === 'kikuyo');
            if (zone) {
                UI.showPanel(`
                    <div class="subtitle">Long-term plan</div>
                    <h2>${zone.name}</h2>
                    <p>${zone.description}</p>
                    <div class="stat-grid">
                        ${zone.stats.map(s => `<div class="stat-item"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
                    </div>
                    <div class="evidence-image-container" style="margin-top: var(--space-4);">
                        <img src="assets/use-case-images/evidence-semiconductor-clusters.webp" alt="Kikuyo development cluster plan" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                `);
                MapController.flyToStep({ center: MapController._toMapbox(zone.coords), zoom: 13, pitch: 50, bearing: 10, duration: 2000 });
            }
        } else if (itemId === 'ozu-plan') {
            const zone = AppData.futureZones.find(z => z.id === 'ozu');
            if (zone) {
                UI.showPanel(`
                    <div class="subtitle">Long-term plan</div>
                    <h2>${zone.name}</h2>
                    <p>${zone.description}</p>
                    <div class="stat-grid">
                        ${zone.stats.map(s => `<div class="stat-item"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
                    </div>
                    <div class="evidence-image-container" style="margin-top: var(--space-4);">
                        <img src="assets/use-case-images/evidence-industrial-park-locations.webp" alt="Ozu development plan" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                `);
                MapController.flyToStep({ center: MapController._toMapbox(zone.coords), zoom: 13, pitch: 50, bearing: -10, duration: 2000 });
            }
        }
    },

    // --- Step 6: Transport ---
    _handleTransportSubItem(itemId) {
        if (itemId === 'airport') {
            const airport = AppData.governmentChain.levels.find(l => l.id === 'grand-airport');
            if (airport) {
                UI.showPanel(`
                    <div class="subtitle">Infrastructure plan</div>
                    <h2>Grand airport concept</h2>
                    <p>${airport.description}</p>
                    <div class="stat-grid">
                        ${airport.stats.map(s => `<div class="stat-item"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
                    </div>
                    <div class="evidence-image-container" style="margin-top: var(--space-4);">
                        <img src="assets/use-case-images/evidence-new-grand-airport.webp" alt="Grand airport concept" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                `);
            }
        } else if (itemId === 'railway') {
            const station = AppData.infrastructureStation;
            UI.showPanel(`
                <div class="subtitle">Infrastructure plan</div>
                <h2>New railway</h2>
                <p>${station.description}</p>
                <div class="stat-grid">
                    ${station.stats.map(s => `<div class="stat-item"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
                </div>
                <div class="evidence-image-container" style="margin-top: var(--space-4);">
                    <img src="assets/use-case-images/evidence-new-railway-system.webp" alt="New railway plan" style="width: 100%; border-radius: var(--radius-medium);" />
                </div>
            `);
        } else if (itemId === 'roads') {
            // Show infrastructure roads and evidence
            const group = UI.findEvidenceGroup('transportation-network');
            if (group) App.showSingleEvidenceGroup(group);
        }
    },

    // --- Step 7: Education ---
    _handleEducationSubItem(itemId) {
        if (itemId === 'universities') {
            UI.renderInspectorPanel(7, { title: 'Talent pipeline' });
            MapController.showTalentPipeline();
        } else if (itemId === 'training') {
            const group = UI.findEvidenceGroup('education-pipeline');
            if (group) {
                const item = group.items.find(i => i.id === 'training-centers');
                if (item) UI.showEvidenceDetail(item, group);
            }
        } else if (itemId === 'employment') {
            const group = UI.findEvidenceGroup('education-pipeline');
            if (group) {
                const item = group.items.find(i => i.id === 'graduate-numbers');
                if (item) UI.showEvidenceDetail(item, group);
            }
        }
    },

    // --- Step 9: Investment zones ---
    _handleInvestmentZoneSubItem(itemId) {
        const zoneData = {
            'kikuyo-zone': {
                name: 'Kikuyo zone',
                role: 'Factory core / new urban core',
                description: 'Manufacturing nucleus and new urban district. Haramizu station new station area targeted as advanced new urban district integrating residence, commerce, education, and research.',
                coords: [32.88, 130.83]
            },
            'koshi-zone': {
                name: 'Koshi zone',
                role: 'R&D / tools and process innovation',
                description: 'Research and development focus with equipment chain concentration. Home to Tokyo Electron and supporting tool manufacturers.',
                coords: [32.85, 130.78]
            },
            'ozu-zone': {
                name: 'Ozu zone',
                role: 'Gateway / office and logistics support',
                description: 'Transportation hub with logistics coordination and supplier office locations. Gateway to the semiconductor corridor.',
                coords: [32.86, 130.87]
            }
        };
        const zone = zoneData[itemId];
        if (zone) {
            UI.showPanel(`
                <div class="subtitle">Silicon triangle</div>
                <h2>${zone.name}</h2>
                <p style="color: var(--color-text-secondary); font-weight: var(--font-weight-medium);">${zone.role}</p>
                <p style="margin-top: var(--space-3);">${zone.description}</p>
            `);
            MapController.flyToStep({
                center: MapController._toMapbox(zone.coords),
                zoom: 13, pitch: 50, bearing: 15, duration: 2000
            });
        }
    },

    // --- Step 10: Properties ---
    _handlePropertySubItem(itemId) {
        const property = AppData.properties.find(p => p.id === itemId);
        if (property) {
            this.state.activeProperty = itemId;
            UI.showPropertyPanel(property);
            MapController.forwardReveal(property);
        }
    },
```

**Step 4: Add the _renderFinalChatbox method**

This replicates the current journey recap with AI chat access.

```javascript
    /**
     * Render the final step chatbox (journey recap + AI chat).
     * Same pattern as current complete() flow.
     */
    _renderFinalChatbox() {
        const propCount = AppData.properties.length;
        let totalNetProfit = 0;
        AppData.properties.forEach(p => {
            const fc = p.cards.find(c => c.type === 'financial');
            if (!fc) return;
            const d = fc.data;
            if (d.scenarios && d.scenarios.average) {
                if (d.scenarios.average.netProfit != null) {
                    totalNetProfit += d.scenarios.average.netProfit;
                } else if (d.scenarios.average.exitPrice != null && d.acquisitionCost != null) {
                    totalNetProfit += d.scenarios.average.exitPrice - d.acquisitionCost;
                }
            } else if (d.paths && d.paths.sale) {
                totalNetProfit += d.paths.sale.grossProfit || 0;
            }
        });
        const formatYen = (num) => {
            if (num >= 10000000) return '\u00a5' + (num / 1000000).toFixed(1) + 'M';
            return '\u00a5' + num.toLocaleString();
        };

        return `
            <div class="journey-recap">
                <h3>Journey complete</h3>
                <div class="journey-recap-checklist">
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Natural advantages verified
                    </div>
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        4T+ yen government commitment
                    </div>
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${propCount} investment properties
                    </div>
                </div>
                <div class="journey-recap-headline">
                    <div class="journey-recap-headline-label">Combined 5-year return</div>
                    <div class="journey-recap-headline-value">${formatYen(totalNetProfit)}</div>
                    <div class="journey-recap-headline-detail">across the portfolio</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                    <button class="chatbox-continue primary" onclick="UI.hideChatbox(); UI.showAIChat();">
                        Ask Me Anything
                    </button>
                    <button class="chatbox-continue secondary" onclick="UI.hideChatbox(); UI.showAIChat(); UI.downloadSummary();">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                        Download summary
                    </button>
                </div>
            </div>
        `;
    },
```

**Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat: implement per-step chatbox content and sub-item handlers"
```

---

### Task 5: Implement Per-Step Panel Content

**Files:**
- Modify: `js/app.js` (add `_renderStepPanel` method)

**Context:** Each step optionally shows a right panel with contextual information. Steps 1-8 show evidence/overview panels. Step 10 shows property cards. Step 12 shows nothing (recap only).

**Step 1: Add _renderStepPanel method**

```javascript
    /**
     * Render the right panel for a step.
     * Some steps auto-show a panel, others wait for sub-item clicks.
     */
    _renderStepPanel(step) {
        // Steps that auto-show panel on entry
        switch (step.id) {
            case 'strategic-location':
                UI.showAllAirlineRoutes();
                break;

            case 'corporate-investment':
                UI.showInvestmentOverview();
                break;

            case 'future-outlook':
                // Show composite future outlook panel
                UI.showPanel(`
                    <div class="subtitle">Future outlook</div>
                    <h2>2030+ vision</h2>
                    <p>Under the science park and grand airport plan, this is a comprehensive long-term urbanization plan.</p>
                    <div class="evidence-image-container" style="margin-top: var(--space-4);">
                        <img src="assets/use-case-images/evidence-science-park.webp" alt="Science park plan" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                    <div class="evidence-image-container" style="margin-top: var(--space-4);">
                        <img src="assets/use-case-images/evidence-new-grand-airport.webp" alt="Grand airport concept" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                    <div class="evidence-image-container" style="margin-top: var(--space-4);">
                        <img src="assets/use-case-images/evidence-kumamoto-future-road-network.webp" alt="Future road network" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                `);
                break;

            case 'investment-zones':
                // Show zone overview panel
                UI.showPanel(`
                    <div class="subtitle">Silicon triangle</div>
                    <h2>Investment opportunity zones</h2>
                    <p>Three zones with distinct roles in the semiconductor ecosystem. Click a zone to see details.</p>
                    <div class="evidence-image-container" style="margin-top: var(--space-4);">
                        <img src="assets/use-case-images/evidence-tsmc-infrastructure-overview.webp" alt="TSMC infrastructure overview" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                `);
                break;

            case 'area-changes':
                // Show evidence library for area changes
                UI.showEvidenceListPanel();
                break;

            case 'properties':
                // Panel shows on property marker click, not auto
                break;

            case 'final':
                // No panel for final step
                break;

            default:
                // Steps with sub-items: panel shows on sub-item click
                // Steps without: show a default evidence panel if evidence groups exist
                break;
        }
    },
```

**Step 2: Commit**

```bash
git add js/app.js
git commit -m "feat: implement per-step panel content rendering"
```

---

### Task 6: Update restoreChatbox and Backward Navigation

**Files:**
- Modify: `js/app.js` (rewrite `restoreChatbox`, `restart`, backward nav)

**Context:** The current `restoreChatbox()` has a large if/else chain for all Q1-Q5 states. Replace with a simple lookup into the step definition.

**Step 1: Rewrite restoreChatbox**

```javascript
    /**
     * Restore chatbox content based on current step.
     * Called when user clicks the FAB to reopen chatbox.
     */
    restoreChatbox() {
        const step = STEPS[this.state.currentStep - 1];
        if (step) {
            const content = this._getStepChatboxContent(step);
            UI.showChatbox(content);
        } else {
            UI.showChatbox(`
                <h3>Kumamoto investment guide</h3>
                <p>Explore the map to learn about investment opportunities.</p>
            `);
        }
    },
```

**Step 2: Rewrite restart**

```javascript
    /**
     * Restart the presentation from the beginning.
     */
    restart() {
        MapController.destroy();
        UI.hidePanel();
        UI.hideChatbox();
        UI.hideAIChat();
        UI.hideLayersToggle();
        UI.hidePanelToggle();
        UI.hideTimeToggle();
        MapController.resetView();

        // Clean up stray overlays
        document.querySelectorAll('.moreharvest-entry').forEach(el => el.remove());
        document.querySelectorAll('.mapboxgl-marker').forEach(el => {
            if (el.parentNode) el.remove();
        });
        document.querySelectorAll('.elevated-marker').forEach(el => {
            if (el.parentNode) el.remove();
        });

        // Reset state
        this.state.currentStep = 0;
        this.state.subItemsExplored = [];
        this.state.activeProperty = null;
        this.state.futureView = false;

        setTimeout(() => {
            this.goToStep(1);
        }, TIMING.restartDelay);
    },
```

**Step 3: Remove old journey methods**

Delete these methods from `App` (they are replaced by `goToStep` and step handlers):
- `startJourneyA`, `showOpeningEvidence`, `stepA1`, `stepA2`, `selectResource`, `updateResourceChatbox`
- `stepA3`, `stepA3_location`, `stepA3_talent`, `visitInstitution`, `updateTalentChatbox`
- `transitionToJourneyB`, `startJourneyB`, `stepB4`, `stepB6`, `updateB6Chatbox`, `stepB7`
- `transitionToJourneyC`, `startJourneyC`, `complete`, `showJourneyRecap`
- `goBackToJourneyA`, `goBackToJourneyB`

Keep these methods (still used):
- `init`, `start`, `showEvidenceGroupPanel`, `showSingleEvidenceGroup`, `showEvidenceLibrary`
- `restoreChatbox` (rewritten above), `restart` (rewritten above)

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: update restoreChatbox, restart, and remove old journey methods"
```

---

### Task 7: Update UI Progress Bar for 12 Steps

**Files:**
- Modify: `js/ui.js` (update `updateJourneyProgress`)

**Context:** The current progress bar shows 3 or 5 segments. Update to show 12 segments with the current step highlighted.

**Step 1: Find and update updateJourneyProgress**

Search for `updateJourneyProgress` in `js/ui.js`. Update it to accept `(currentStep, totalSteps)` instead of a question number.

```javascript
    /**
     * Update the journey progress bar for 12-step linear flow.
     * @param {number} currentStep - Current step (1-12)
     * @param {number} totalSteps - Total steps (default 12)
     */
    updateJourneyProgress(currentStep, totalSteps = 12) {
        let progressBar = document.getElementById('journey-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'journey-progress';
            progressBar.className = 'journey-progress';
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('aria-valuemin', '1');
            document.getElementById('map-container').appendChild(progressBar);
        }

        progressBar.setAttribute('aria-valuenow', currentStep);
        progressBar.setAttribute('aria-valuemax', totalSteps);
        progressBar.setAttribute('aria-label', `Step ${currentStep} of ${totalSteps}`);

        let html = '';
        for (let i = 1; i <= totalSteps; i++) {
            const state = i < currentStep ? 'completed' : i === currentStep ? 'active' : '';
            html += `<div class="progress-segment ${state}" data-step="${i}"></div>`;
        }
        progressBar.innerHTML = html;
        progressBar.classList.remove('hidden');
    },
```

**Step 2: Add hideTimeToggle to UI if missing**

Check if `UI.hideTimeToggle()` exists. If not, add it:

```javascript
    hideTimeToggle() {
        if (this.elements.timeToggle) {
            this.elements.timeToggle.classList.add('hidden');
        }
    },
```

**Step 3: Commit**

```bash
git add js/ui.js
git commit -m "feat: update progress bar for 12-step flow"
```

---

### Task 8: Update CSS for 12-Segment Progress Bar

**Files:**
- Modify: `css/styles.css` (update `.journey-progress` and `.progress-segment`)

**Context:** The progress bar needs to show 12 small segments instead of 3-5. Each segment is a small dot or bar.

**Step 1: Find and update journey progress styles**

Search for `.journey-progress` in `css/styles.css`. Update to:

```css
.journey-progress {
    position: absolute;
    top: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    z-index: 300;
    display: flex;
    gap: 3px;
    padding: var(--space-1) var(--space-3);
    background: var(--color-bg-primary);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-medium);
}

.progress-segment {
    width: 20px;
    height: 4px;
    border-radius: var(--radius-full);
    background: var(--color-bg-tertiary);
    transition: background-color var(--duration-fast) var(--easing-standard),
                width var(--duration-fast) var(--easing-standard);
}

.progress-segment.completed {
    background: var(--color-primary);
}

.progress-segment.active {
    background: var(--color-primary);
    width: 28px;
}
```

**Step 2: Commit**

```bash
git add css/styles.css
git commit -m "feat: update progress bar CSS for 12-step segments"
```

---

### Task 9: Add Government Tier Dashboard Panel to UI

**Files:**
- Modify: `js/ui.js` (add `showGovernmentTierPanel`)

**Context:** Step 3 needs a panel that shows government tiers with commitment amounts and a visual hierarchy. The existing `governmentTiers` data in data.js has `tier`, `commitment`, `subItems`, etc.

**Step 1: Add showGovernmentTierPanel method to UI**

```javascript
    /**
     * Show government tier detail panel with commitment dashboard.
     * @param {Object} tier - Government tier data from AppData.governmentTiers
     */
    showGovernmentTierPanel(tier) {
        let subItemsHtml = '';
        if (tier.subItems && tier.subItems.length > 0) {
            subItemsHtml = `
                <div style="margin-top: var(--space-4);">
                    <div style="font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); margin-bottom: var(--space-3);">Key initiatives</div>
                    ${tier.subItems.map(sub => `
                        <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-medium); margin-bottom: var(--space-2);">
                            <div style="flex: 1;">
                                <div style="font-weight: var(--font-weight-medium);">${sub.name}</div>
                                <div style="font-size: var(--text-sm); color: var(--color-text-secondary);">${sub.subtitle}</div>
                            </div>
                            <div style="font-weight: var(--font-weight-semibold); color: var(--color-primary);">${sub.commitment}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const content = `
            <div class="subtitle">${tier.tierLabel}</div>
            <h2>${tier.name}</h2>
            <div style="display: flex; align-items: baseline; gap: var(--space-2); margin: var(--space-4) 0;">
                <span style="font-size: var(--text-3xl); font-weight: var(--font-weight-bold); color: ${tier.color};">${tier.commitment}</span>
                <span style="font-size: var(--text-sm); color: var(--color-text-secondary);">${tier.commitmentLabel}</span>
            </div>
            <p>${tier.description}</p>
            <div class="stat-grid" style="margin-top: var(--space-4);">
                ${tier.stats.map(s => `<div class="stat-item"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
            </div>
            ${subItemsHtml}
        `;

        this.showPanel(content);
    },
```

**Step 2: Commit**

```bash
git add js/ui.js
git commit -m "feat: add government tier dashboard panel"
```

---

### Task 10: Add Koshi Zone Data to data.js

**Files:**
- Modify: `js/data.js` (add Koshi zone to `investmentZones` and a standalone zone detail object)

**Context:** The current data has Kikuyo and Ozu zones but is missing the Koshi zone for the silicon triangle (step 9). Add it.

**Step 1: Add Koshi zone to investmentZones array**

Find the `investmentZones` array in data.js (around line 660) and verify it has the `tsmc-area` entry. The three zones should map to:
- Kikuyo zone = around JASM core
- Koshi zone = R&D / tools
- Ozu zone = gateway / logistics

The existing `investmentZones` has `central-city`, `middle-zone`, `tsmc-area`. These need to be renamed/replaced to match the silicon triangle:

```javascript
    // Silicon Triangle Investment Zones (step 9)
    investmentZones: [
        {
            id: 'kikuyo-zone',
            name: 'Kikuyo zone',
            role: 'Factory core / new urban core',
            coords: [32.88, 130.83],
            radius: 4500,
            color: 'rgba(251, 185, 49, 0.15)',
            strokeColor: 'rgba(251, 185, 49, 0.4)'
        },
        {
            id: 'koshi-zone',
            name: 'Koshi zone',
            role: 'R&D / tools and process innovation',
            coords: [32.85, 130.78],
            radius: 3500,
            color: 'rgba(0, 122, 255, 0.15)',
            strokeColor: 'rgba(0, 122, 255, 0.4)'
        },
        {
            id: 'ozu-zone',
            name: 'Ozu zone',
            role: 'Gateway / office and logistics support',
            coords: [32.86, 130.87],
            radius: 4000,
            color: 'rgba(52, 199, 89, 0.15)',
            strokeColor: 'rgba(52, 199, 89, 0.4)'
        }
    ],
```

**Step 2: Commit**

```bash
git add js/data.js
git commit -m "feat: add silicon triangle zone data for step 9"
```

---

### Task 11: Wire Up the MoreHarvest Entry for Step 10 Transition

**Files:**
- Modify: `js/app.js` (add MoreHarvest cinematic before step 10)

**Context:** The current app shows a MoreHarvest brand entry cinematic when transitioning from Journey B to Journey C (properties). We want the same cinematic to play when entering step 10 (properties). Update `goToStep` to trigger this before the property step.

**Step 1: Add pre-step hook in goToStep**

Inside the `goToStep` method, after exit choreography and before camera flight, add:

```javascript
        // --- Special pre-step cinematics ---
        if (stepIndex === 10 && prevStep > 0 && prevStep !== 10) {
            await UI.showMoreHarvestEntry();
            await MapController.elevateToCorridorView();
            await new Promise(r => setTimeout(r, TIMING.breath));
        }
```

**Step 2: Commit**

```bash
git add js/app.js
git commit -m "feat: add MoreHarvest cinematic entry before properties step"
```

---

### Task 12: Update Data Layers Panel for 12 Steps

**Files:**
- Modify: `js/ui.js` (update `showDataLayers` to accept step index 1-12)

**Context:** The current `showDataLayers(questionNumber)` builds layer checkboxes based on the Q1-Q5 number. Update it to use the step index and show appropriate layers for each step.

**Step 1: Update showDataLayers**

Find `showDataLayers` in ui.js. Update the layer configuration to use step indices:

```javascript
    /**
     * Show data layers panel configured for the current step.
     * @param {number} stepIndex - Current step (1-12)
     */
    showDataLayers(stepIndex) {
        // Show the layers toggle button
        this.showLayersToggle();

        // Close the panel when step changes (button stays visible)
        if (this.layersPanelOpen) {
            this.toggleLayersPanel();
        }

        // Configure available layers based on step
        // (Layer panel content is built dynamically when opened)
        this._currentStepForLayers = stepIndex;
    },
```

**Step 2: Commit**

```bash
git add js/ui.js
git commit -m "feat: update data layers panel for 12-step indices"
```

---

### Task 13: Update Legend for 12 Steps

**Files:**
- Modify: `js/ui.js` (update legend rendering to use step index)

**Context:** The map legend currently updates based on journey A/B/C. Update it to show relevant marker types based on the current step index.

**Step 1: Find and update legend rendering**

Search for `legend` in ui.js. Update the legend items to match the step's active layers. The legend should show:
- Steps 1-2: Base map, Resources, Energy
- Steps 3-4: Base map, Government, Corporate sites
- Steps 5-8: Base map, Science park, Development zones, Infrastructure
- Steps 9-10: Base map, Investment zones, Properties
- Steps 11-12: All core items

**Step 2: Commit**

```bash
git add js/ui.js
git commit -m "feat: update map legend for 12-step flow"
```

---

### Task 14: Clean Up Old Journey References in UI

**Files:**
- Modify: `js/ui.js` (update `updateInspectorForStep`, `renderInspectorPanel`, and any journey-specific methods)

**Context:** Several UI methods reference old step IDs like `Q1_water`, `Q2_gov`, etc. These need to be updated or removed.

**Step 1: Search and update all old step ID references**

Search for `Q1_`, `Q2_`, `Q3_`, `Q4_`, `Q5_` in ui.js and update to use the new step system. Most of these are in `updateInspectorForStep` which maps step strings to panel content. This method should now accept the step index directly.

**Step 2: Search for `question ===` and `journeyA`, `journeyB`, `journeyC`**

Update any remaining journey-letter references to use step indices.

**Step 3: Commit**

```bash
git add js/ui.js
git commit -m "refactor: remove old journey A/B/C references from UI"
```

---

### Task 15: Clean Up Old Journey References in MapController

**Files:**
- Modify: `js/map-controller.js` (remove journey-specific comments, update any step-gated logic)

**Context:** MapController methods are mostly step-agnostic (they show/hide layers). But some comments and conditions reference the old journey structure. Clean these up.

**Step 1: Search and update comments**

Search for `Journey A`, `Journey B`, `Journey C`, `Q1`, `Q2`, `Q3` in map-controller.js. Update comments to reference step numbers instead.

**Step 2: Commit**

```bash
git add js/map-controller.js
git commit -m "refactor: update MapController comments for 12-step flow"
```

---

### Task 16: Update index.html Start Screen

**Files:**
- Modify: `index.html` (update start screen text if needed)

**Context:** The start screen currently says "Start the Journey" (singular). This still works for the linear flow. Verify the start button calls `App.start()` and the "Skip to Dashboard" button still works.

**Step 1: Verify start button**

Read index.html and confirm `#start-btn` calls `App.start()`. Confirm `#skip-to-dashboard-btn` exists and calls `UI.startDashboardMode()`.

**Step 2: Commit (only if changes needed)**

```bash
git add index.html
git commit -m "chore: verify start screen for 12-step flow"
```

---

### Task 17: End-to-End Smoke Test

**Files:** None (manual testing)

**Context:** Open the app in a browser and click through all 12 steps. Verify:

**Step 1: Test each step sequentially**

1. Click "Start the Journey" - cinematic entry plays, step 1 chatbox appears
2. Click sub-items in step 1 (water, solar, wind, nuclear) - markers appear, panel updates
3. Click "Continue" - camera flies to strategic location (step 2), airline routes appear
4. Continue through all 12 steps, verifying:
   - Camera flies to correct position
   - Correct markers appear/disappear
   - Chatbox content matches step
   - Sub-items are clickable and track explored state
   - Panel shows correct content
   - Progress bar updates (12 segments)
   - Time toggle appears only on steps 8 and 11
   - Properties step shows MoreHarvest entry
   - Final step shows recap with AI chat access

**Step 2: Test backward navigation**

- Use chatbox back button to return to previous chatbox content
- Verify panel back button works within a step

**Step 3: Test restart**

- Click restart (however it is triggered) and verify full reset

**Step 4: Test dashboard mode**

- From start screen, click "Skip to Dashboard"
- Verify dashboard loads with all layers

---

### Task 18: Final Commit

**Step 1: Commit any remaining fixes**

```bash
git add -A
git commit -m "feat: complete 12-step linear journey rewrite"
```

---

## Migration Checklist

Before considering the rewrite complete, verify:

- [ ] `STEPS` array has exactly 12 entries with correct IDs
- [ ] `App.state.currentStep` drives all navigation (no `question`/`step` pairs)
- [ ] Every step has chatbox content rendered by `_getStepChatboxContent`
- [ ] Sub-items within each step are clickable and update explored state
- [ ] Camera flies to the correct position for each step
- [ ] Markers appear/disappear correctly between steps
- [ ] Progress bar shows 12 segments
- [ ] Time toggle only visible on steps 8 and 11
- [ ] MoreHarvest cinematic plays before step 10
- [ ] Final step (12) shows recap and AI chat access
- [ ] Dashboard mode still works from start screen
- [ ] FAB restores chatbox based on current step
- [ ] No console errors during full step-through
- [ ] No Japanese text in UI (English only, romanized place names)
- [ ] No uppercase text anywhere (sentence case per CLAUDE.md)
- [ ] All old `startJourneyA/B/C`, `stepA1/A2/A3`, `stepB4/B6/B7` methods removed
- [ ] Old `STAGE_MAP` compatibility shim works for any unreferenced legacy code

---

## Risk Notes

1. **Large refactor**: This touches all 4 JS files. Work in a feature branch.
2. **MapController methods are reusable**: The show/hide methods in map-controller.js do not need rewriting. They are called by the new step handlers just as the old journey methods called them.
3. **UI panel/chatbox patterns are preserved**: The new step handlers generate the same HTML patterns (`.chatbox-options`, `.stat-grid`, etc.) so CSS does not change.
4. **Evidence groups are unchanged**: The `AppData.evidenceGroups` structure stays the same. The new steps reference them via `UI.findEvidenceGroup()` just like before.
5. **Property cards are unchanged**: The 4-card property panel system stays the same. Step 10 reuses `UI.showPropertyPanel()`.
6. **Dashboard mode is orthogonal**: The dashboard skip path does not interact with the 12-step flow. It loads all layers directly.

---

## File Change Summary

| File | Change Type | Scope |
|------|------------|-------|
| `js/data.js` | Modify | Add `STEPS` array, `STEP_MAP`, update `investmentZones` to silicon triangle, keep `STAGE_MAP` shim |
| `js/app.js` | Rewrite | Replace 3-journey state machine with `goToStep(n)` + step handlers |
| `js/map-controller.js` | Minor modify | Add camera positions, update comments |
| `js/ui.js` | Modify | Update progress bar, add `showGovernmentTierPanel`, update data layers, update legend |
| `css/styles.css` | Minor modify | Update progress bar CSS for 12 segments |
| `index.html` | Verify only | Confirm start button wiring |
