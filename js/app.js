/**
 * Main App - State Machine for Journey Progression
 */

/**
 * Shared timing constants — semantic names for setTimeout values.
 * CSS token equivalents noted in comments.
 */
const TIMING = {
    scene: 1500,         // --duration-scene (journey transition hold — synced with CSS token)
    fast: 150,           // --duration-fast
    normal: 250,         // --duration-normal
    slow: 350,           // --duration-slow
    flyDuration: 2000,    // Mapbox flyTo milliseconds
    flyEase: 0.15,       // Deprecated (kept for reference)
    revealDelay: 1200,   // science park after gov chain
    buttonDelay: 2500,   // continue button after markers
    infraStagger: 100,   // infrastructure road stagger
    restartDelay: 500,   // delay before restart

    // Narrative breathing room — rest pauses between beats
    breath: 600,         // full pause: let a scene register before the next begins
    breathMedium: 400,   // marker cluster → next content
    breathShort: 300,    // quick pause: let an exit complete before a transition starts
};

const App = {
    state: {
        currentStep: 0,       // 1-12, 0 = not started
        subItemsExplored: [], // Track which sub-items within current step have been viewed
        activeProperty: null, // Currently selected property ID (step 10)
        futureView: false,    // Whether future toggle is active (steps 8, 11)
        evidenceGroupsViewed: [], // Track which evidence groups have been viewed
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

        // --- Special pre-step cinematics ---
        if (stepIndex === 10 && prevStep > 0 && prevStep !== 10) {
            await UI.showMoreHarvestEntry();
            await MapController.elevateToCorridorView();
            await new Promise(r => setTimeout(r, TIMING.breath));
        }

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

    // ================================
    // JOURNEY A: Why Kumamoto?
    // ================================

    startJourneyA() {
        this.state.question = 1;
        this.state.step = 'Q1_intro';
        this.state.resourcesExplored = [];
        this.state.evidenceGroupsViewed = [];
        UI.updateInspectorForStep(this.state.step);

        // Show journey progress bar
        UI.updateJourneyProgress(1);

        // Show data layers toggle for Q1
        UI.showDataLayers(1);
        UI.announceToScreenReader('Journey A: Why Kumamoto');

        // Ensure heartbeat is running (may already be from cinematicEntry,
        // but needed for restart path which skips cinematic)
        MapController.startHeartbeat();

        // A0: Opening — question already shown on start screen, go straight to action
        UI.showChatbox(`
            <h3>Why Kumamoto?</h3>
            <p>The answer starts with three natural advantages that no amount of money can buy.</p>
            <div class="chatbox-options">
                <button class="chatbox-option" onclick="App.showOpeningEvidence()">
                    View evidence
                </button>
            </div>
            <button class="chatbox-continue primary" onclick="App.stepA1()">
                Discover Why
            </button>
        `);
    },

    /**
     * A0: Show supporting evidence for the opening question
     */
    showOpeningEvidence() {
        UI.renderInspectorPanel(1, { title: 'Resources and location' });

        // Gently zoom toward the science park area (JASM commitment location)
        const sp = AppData.sciencePark;
        if (sp && sp.center) {
            MapController.flyToStep({
                center: MapController._toMapbox(sp.center),
                zoom: 12,
                pitch: 50,
                bearing: 15,
                duration: 1500
            });
        }

        // Update chatbox to continue
        UI.updateChatbox(`
            <h3>Why Kumamoto?</h3>
            <p class="chatbox-question">Japan committed over 10 trillion yen to semiconductor infrastructure. Why did they choose Kumamoto?</p>
            <button class="chatbox-continue primary" onclick="App.stepA1()">
                Explore the Region
            </button>
        `);
    },

    /**
     * A1: Why Kumamoto? intro
     */
    stepA1() {
        this.state.step = 'Q1_intro';
        UI.updateInspectorForStep(this.state.step);
        UI.hidePanel();
        UI.announceToScreenReader('Step 1: Natural advantages');

        // Cinematic camera re-angle
        MapController.flyToStep(CAMERA_STEPS.A1);

        UI.updateChatbox(`
            <h3>Natural advantages</h3>
            <p>Before the factories came, Kumamoto already had something most cities can't offer. Let me show you.</p>
            <button class="chatbox-continue primary" onclick="App.stepA2()">
                Start Exploring
            </button>
        `);
    },

    async stepA2() {
        this.state.step = 'Q1_water';
        UI.updateInspectorForStep(this.state.step);
        UI.announceToScreenReader('Step 2: Utility infrastructure');

        // Show Kyushu-wide energy markers and water resource markers together
        MapController.showKyushuEnergy();
        MapController.showResourceMarker('water');

        // Beat: let markers land before narrator speaks
        await new Promise(r => setTimeout(r, TIMING.breathMedium));

        // Show combined utility infrastructure options
        UI.updateChatbox(`
            <h3>Utility infrastructure</h3>
            <p>Semiconductor fabs need <strong>10 million gallons of water daily</strong> and enough electricity to power a small city. Kumamoto has both — in surplus.</p>
            <div class="chatbox-options">
                <button class="chatbox-option" onclick="App.selectResource('water')">
                    Water resources
                </button>
                <button class="chatbox-option" onclick="App.selectResource('power')">
                    Power infrastructure
                </button>
            </div>
        `);
    },

    selectResource(resourceId) {
        this.state.step = resourceId === 'power' ? 'Q1_power' : 'Q1_water';

        // Show marker and fly to location
        MapController.showResourceMarker(resourceId);

        // Track explored resources
        if (!this.state.resourcesExplored.includes(resourceId)) {
            this.state.resourcesExplored.push(resourceId);
        }

        // Show the resource panel immediately
        const resource = AppData.resources[resourceId];
        if (resource) {
            UI.showResourcePanel(resource);
        }

        // Update chatbox to show what's been explored
        this.updateResourceChatbox();
    },

    updateResourceChatbox() {
        const waterExplored = this.state.resourcesExplored.includes('water');
        const powerExplored = this.state.resourcesExplored.includes('power');
        const allExplored = waterExplored && powerExplored;
        const exploredCount = this.state.resourcesExplored.length;

        // Build progress message
        let progressText;
        if (allExplored) {
            progressText = 'Two natural advantages that money can\'t buy — and Kumamoto has both.';
        } else if (exploredCount === 1) {
            progressText = 'One down. Explore the other to see the full picture.';
        } else {
            progressText = 'Semiconductor fabs need <strong>10 million gallons of water daily</strong> and enough electricity to power a small city. Kumamoto has both — in surplus.';
        }

        // Build options array - all items must be inside .chatbox-options for consistent 16px gap
        let options = `
            <button class="chatbox-option ${waterExplored ? 'completed' : ''}"
                    onclick="App.selectResource('water')"
                    ${waterExplored ? 'aria-disabled="true"' : ''}>
                Water resources${waterExplored ? '<span class="sr-only"> (explored)</span>' : ''}
            </button>
            <button class="chatbox-option ${powerExplored ? 'completed' : ''}"
                    onclick="App.selectResource('power')"
                    ${powerExplored ? 'aria-disabled="true"' : ''}>
                Power infrastructure${powerExplored ? '<span class="sr-only"> (explored)</span>' : ''}
            </button>
        `;

        // Show evidence group link when power is explored
        if (powerExplored) {
            const evidenceViewed = this.state.evidenceGroupsViewed.includes('energy-infrastructure');
            options += `
                <button class="chatbox-option ${evidenceViewed ? 'completed' : ''}" onclick="App.showEvidenceGroupPanel('energy-infrastructure')">
                    View energy infrastructure evidence
                </button>
            `;
        }

        let content = `
            <h3>Utility infrastructure</h3>
            <p>${progressText}</p>
            <div class="resource-progress" style="font-size: var(--text-sm); color: var(--color-text-tertiary); margin-bottom: var(--space-2);">${exploredCount} of 2 explored</div>
            <div class="chatbox-options" role="group" aria-label="Resource options">
                ${options}
            </div>
            <button class="chatbox-continue primary" onclick="App.stepA3()">
                Continue
            </button>
        `;

        UI.updateChatbox(content);
    },

    /**
     * A3 Phase 1: Existing Semiconductor Infrastructure — narrative only
     */
    stepA3() {
        this.state.step = 'Q1_silicon';
        this.state.subPhase = 'ecosystem';
        UI.announceToScreenReader('Step 3: Semiconductor ecosystem');

        // Cinematic flight to semiconductor ecosystem area
        MapController.flyToStep(CAMERA_STEPS.A3_ecosystem);

        UI.updateChatbox(`
            <h3>Semiconductor ecosystem</h3>
            <p>TSMC didn't build in a vacuum. <strong>Sony has operated here since 1987.</strong> Tokyo Electron and Mitsubishi run precision manufacturing within 30km. The supply chain was already here — TSMC plugged in.</p>
            <button class="chatbox-continue primary" onclick="App.stepA3_location()">
                See Strategic Location
            </button>
        `);
    },

    /**
     * A3 Phase 2: Strategic Location — airline routes appear
     */
    async stepA3_location() {
        this.state.subPhase = 'location';
        this.state.step = 'Q1_strategic';

        // Show airline routes with animation
        await MapController.showAirlineRoutes();

        // Sync panel to show airline routes overview
        UI.showAllAirlineRoutes();

        UI.updateChatbox(`
            <h3>Strategic location</h3>
            <p>Seven direct international routes — Seoul, Shanghai, Taipei, Hong Kong. A semiconductor executive can reach any major Asian foundry partner in <strong>under 4 hours.</strong></p>
            <p style="color: var(--color-text-secondary); margin-top: 8px;">Click destinations on the map to see route details.</p>
            <button class="chatbox-continue primary" onclick="App.stepA3_talent()">
                See Talent Pipeline
            </button>
        `);
    },

    /**
     * A3 Phase 3: Talent Pipeline — Kyushu-wide university/institution layer
     */
    async stepA3_talent() {
        this.state.subPhase = 'talent';
        this.state.step = 'Q3_education';
        UI.announceToScreenReader('Talent pipeline: Kyushu universities and institutions');

        // Hide airline routes before showing talent pipeline
        MapController.hideAirlineRoutes();

        // Beat: let airline routes fade before new content
        await new Promise(r => setTimeout(r, TIMING.breathShort));

        // Show talent pipeline markers across Kyushu
        MapController.showTalentPipeline();

        // Sync panel to talent pipeline overview
        UI.renderInspectorPanel(3, { title: 'Talent pipeline' });

        // Beat: let markers land
        await new Promise(r => setTimeout(r, TIMING.breathMedium));

        this.updateTalentChatbox();
    },

    visitInstitution(instId) {
        if (!this.state.institutionsVisited.includes(instId)) {
            this.state.institutionsVisited.push(instId);
        }
        UI.showTalentInspector(instId);
        this.updateTalentChatbox();
    },

    updateTalentChatbox() {
        const pipeline = AppData.talentPipeline;
        const chevronSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
        const checkSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

        const instList = pipeline.institutions.map(inst => {
            const visited = this.state.institutionsVisited.includes(inst.id);
            return `<button class="talent-row ${visited ? 'visited' : ''}" onclick="App.visitInstitution('${inst.id}')">
                <span class="talent-row-dot" style="background: ${inst.color}"></span>
                <span class="talent-row-text">
                    <span class="talent-row-name">${inst.name}</span>
                    <span class="talent-row-city">${inst.city}</span>
                </span>
                ${visited ? `<span class="talent-row-trailing">${checkSvg}</span>` : ''}
            </button>`;
        }).join('');

        UI.updateChatbox(`
            <h3>Talent pipeline</h3>
            <p>METI's Kyushu Semiconductor Human Resources Development Alliance coordinates <strong>five universities</strong> across the region. From mandatory semiconductor courses to JASM-partnered research centers, the talent pipeline is purpose-built.</p>
            <div class="talent-list">
                ${instList}
            </div>
            <button class="chatbox-continue primary" onclick="App.transitionToJourneyB()">
                See Government Commitment
            </button>
        `);
    },

    async transitionToJourneyB() {
        MapController.stopHeartbeat();

        // Save Journey A content to history BEFORE transition
        UI.saveChatboxToHistory();

        // Beat: "The Farewell" — choreographed exit sequence
        // 1. Fade out all visible markers (200ms)
        const markersToFade = [];
        if (MapController.airlineOriginMarker) markersToFade.push(MapController.airlineOriginMarker);
        markersToFade.push(...MapController.airlineDestinationMarkers);
        ['kyushuEnergy', 'resources', 'talentPipeline'].forEach(group => {
            const ids = MapController._layerGroups[group] || [];
            ids.forEach(id => {
                if (MapController.markers[id]) markersToFade.push(MapController.markers[id]);
            });
        });
        await MapController.fadeOutMarkers(markersToFade);

        // 2. Chatbox and panel exit (150ms)
        UI.hideChatbox();
        UI.hidePanel();

        // 3. Clean up Mapbox layers (silent — markers already faded)
        MapController.hideAirlineRoutes();
        MapController.hideKyushuEnergy();
        MapController.hideTalentPipeline();

        // 4. Let the old world fully recede
        await new Promise(r => setTimeout(r, TIMING.breathShort));

        // Cinematic sweep back to corridor from new angle
        await MapController.flyToStep(CAMERA_STEPS.A_to_B);

        this.startJourneyB();
    },

    // ================================
    // JOURNEY B: Infrastructure Plan
    // ================================

    startJourneyB() {
        this.state.question = 2;
        this.state.step = 'Q2_gov';
        this.state.companiesExplored = [];
        UI.updateInspectorForStep(this.state.step);

        // Update journey progress bar
        UI.updateJourneyProgress(2);

        // Show data layers toggle for Q2
        UI.showDataLayers(2);
        UI.announceToScreenReader('Journey B: Infrastructure plan');

        // B1: Show government commitment chain with chatbox intro
        // Continue button shown immediately — presenter advances when ready (no auto-update)
        UI.showChatbox(`
            <h3>Government support</h3>
            <p><strong>¥4 trillion</strong> from the national government. <strong>¥480 billion</strong> from Kumamoto Prefecture. Every level of government is aligned behind one bet: semiconductors.</p>
            <p style="margin-top: 12px;">Click the numbered markers to trace the commitment chain.</p>
            <button class="chatbox-continue primary" onclick="App.stepB4()">
                See Who's Building Here
            </button>
        `, { skipHistory: true });

        // Fly to government chain area
        MapController.flyToStep(CAMERA_STEPS.B1);

        // Show government chain markers (staggered animation)
        MapController.showGovernmentChain();

        // Also show Science Park and investment zones as part of B1 context
        setTimeout(() => {
            MapController.showSciencePark();
            MapController.showInvestmentZones();
        }, TIMING.revealDelay);

        // Start heartbeat + pulse on government chain markers
        MapController.startHeartbeat();
        setTimeout(() => {
            MapController.setActiveMarkerPulse('governmentChain');
        }, 2000); // After chain stagger completes
    },

    async stepB4() {
        this.state.step = 'Q2_corporate';
        UI.updateInspectorForStep(this.state.step);
        UI.announceToScreenReader('Step 4: Corporate investment');

        // Switch pulse to company markers
        MapController.clearMarkerPulse();

        // Cinematic flight to company cluster
        MapController.flyToStep(CAMERA_STEPS.B4);
        MapController.showCompanyMarkers();

        // Show connection lines from all companies to JASM
        setTimeout(() => {
            MapController.showSemiconductorNetwork();
        }, AppData.companies.length * 80 + 200);

        // Beat: let company markers land before narrator speaks
        await new Promise(r => setTimeout(r, TIMING.breathMedium));

        // Pulse companies after they've landed
        setTimeout(() => {
            MapController.setActiveMarkerPulse('companies');
        }, 500);

        UI.updateChatbox(`
            <h3>Corporate investment</h3>
            <p>The signal landed. TSMC committed <strong>¥2.16 trillion</strong> for two fabs. Sony expanded its sensor line. SUMCO, Kyocera, Rohm Apollo, Mitsubishi, Tokyo Electron — each announced expansions within 18 months. <strong>Seven major players</strong>, all converging on Kumamoto.</p>
            <p style="margin-top: 8px;">Click company markers to see the scale.</p>
            <button class="chatbox-continue primary" onclick="App.stepB6()">
                Show Development Timeline
            </button>
        `);
    },

    stepB6() {
        this.state.step = 'Q3_timeline';
        this.state.question = 3;
        UI.updateJourneyProgress(3);
        UI.updateInspectorForStep(this.state.step);
        UI.announceToScreenReader('Step 6: Development timeline');

        // Cinematic flight to development area
        MapController.flyToStep(CAMERA_STEPS.B6);

        // Show the Present/Future toggle in top-left corner
        UI.showTimeToggle();

        // Update chatbox with evidence group options
        this.updateB6Chatbox();
    },

    updateB6Chatbox() {
        const groups = ['government-zones', 'transportation-network', 'education-pipeline'];
        const labels = ['View government zone plans', 'View transportation network', 'View education pipeline'];

        const options = groups.map((id, i) => {
            const viewed = this.state.evidenceGroupsViewed.includes(id);
            return `<button class="chatbox-option ${viewed ? 'completed' : ''}" onclick="App.showEvidenceGroupPanel('${id}')">
                ${labels[i]}${viewed ? '<span class="sr-only"> (viewed)</span>' : ''}
            </button>`;
        }).join('');

        UI.updateChatbox(`
            <h3>The vision</h3>
            <p>Toggle to <strong>Future View</strong> in the top-left corner to see the planned development zones.</p>
            <p style="margin-top: var(--space-4); font-size: var(--text-sm); color: var(--color-text-tertiary);">
                Explore the evidence for this transformation:
            </p>
            <div class="chatbox-options">
                ${options}
            </div>
            <button class="chatbox-continue primary" onclick="App.stepB7()">
                See What's Changing
            </button>
        `);
    },

    stepB7() {
        this.state.step = 'Q3_future';
        UI.updateInspectorForStep(this.state.step);

        // Reset to present view (toggle remains visible)
        UI.setTimeView('present');
        UI.announceToScreenReader('Step 7: Infrastructure changes');

        // Show infrastructure roads on the map
        MapController.showInfrastructureRoads();

        UI.updateChatbox(`
            <h3>Changes in area</h3>
            <p>Commitment is promises. This is concrete. New expressway links shaving <strong>15 minutes</strong> off the JASM commute. A new rail station. <strong>¥340 billion</strong> in road infrastructure already under construction.</p>
            <p style="margin-top: 8px;">Click any <strong>teal dashed road</strong> or station marker to see details.</p>
            <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
                View Investment Opportunities
            </button>
        `);
    },

    async transitionToJourneyC() {
        MapController.stopHeartbeat();

        // Save Journey B content to history BEFORE transition
        UI.saveChatboxToHistory();

        // Beat: "The Handoff" — choreographed exit sequence
        // 1. Fade out visible markers (infrastructure stations, gov chain, companies)
        const markersToFade = [...MapController.infrastructureMarkers];
        ['governmentChain', 'companies'].forEach(group => {
            const ids = MapController._layerGroups[group] || [];
            ids.forEach(id => {
                if (MapController.markers[id]) markersToFade.push(MapController.markers[id]);
            });
        });
        if (markersToFade.length > 0) {
            await MapController.fadeOutMarkers(markersToFade);
        }

        // 2. Chatbox and panel exit (150ms)
        UI.hideChatbox();
        UI.hidePanel();

        // Reset to present view (toggle remains visible)
        UI.setTimeView('present');

        // 3. Clean up Mapbox layers (silent — markers already faded)
        if (this.state.step === 'Q3_future') {
            MapController.hideInfrastructureRoads();
        }
        MapController.hideInvestmentZones();
        MapController.hideSemiconductorNetwork();

        // 4. Let the old world fully recede
        await new Promise(r => setTimeout(r, TIMING.breathShort));

        // Show MoreHarvest grand entry before properties
        await UI.showMoreHarvestEntry();

        this.startJourneyC();
    },

    // ================================
    // JOURNEY C: Investment Projections
    // ================================

    async startJourneyC() {
        this.state.question = 5;
        this.state.step = 'Q5_prop1';
        UI.updateInspectorForStep(this.state.step);

        // Update journey progress bar
        UI.updateJourneyProgress(5);

        // Mapbox is already initialized from cinematic entry
        // Elevate to 3D corridor view — the map tilts and buildings rise
        await MapController.elevateToCorridorView();

        // Beat: "The Elevation" — let the corridor perspective register before populating
        await new Promise(r => setTimeout(r, TIMING.breath));

        // Add property markers and route lines to Mapbox 3D view
        const jasmCoords = AppData.jasmLocation || [32.874, 130.785];
        MapController.addPropertyMarkers(AppData.properties);
        MapController.addRouteLines(AppData.properties, jasmCoords);

        // Update data layers toggle for Q5
        UI.showDataLayers(5);
        UI.announceToScreenReader('Journey C: Investment opportunities');

        // Calculate portfolio stats for narrative
        const propCount = AppData.properties.length;

        // Pull fund stats for inline display
        const gktk = AppData.gktk;
        const irrValue = gktk ? gktk.stats[3].value : '12-18%';
        const aumValue = gktk ? gktk.fundSize : '¥2.5B';
        const holdValue = gktk ? gktk.stats[2].value : '5-7yr';

        UI.showChatbox(`
            <h3>Investment opportunities</h3>
            <p>${propCount} properties in the semiconductor corridor. Average <strong>12-minute drive</strong> to JASM.</p>
            <div class="chatbox-fund-stats">
                <div class="chatbox-fund-label">GKTK Fund &middot; ${irrValue} Target IRR</div>
                <div class="chatbox-fund-detail">${aumValue} Target AUM &middot; ${holdValue} Hold</div>
            </div>
            <details class="chatbox-disclosure">
                <summary>View full fund and portfolio details</summary>
                <div class="chatbox-disclosure-body">
                    ${UI.showGktkSummary()}
                    ${UI.showPortfolioCard()}
                </div>
            </details>
            <p style="margin-top: var(--space-3);">Click any amber marker to see the full financial picture.</p>
            <button class="chatbox-continue primary" onclick="App.complete()">
                See Your Summary
            </button>
        `, { skipHistory: true });

        // Start heartbeat — Journey C has Mapbox circle layers, no marker pulse
        MapController.startHeartbeat();
    },

    /**
     * Complete the presentation - show AI chat for follow-up questions
     */
    async complete() {
        this.state.step = 'Q5_final';
        // Skip updateInspectorForStep -- hidePanel() follows immediately and recap takes over
        MapController.stopHeartbeat();

        UI.hideJourneyProgress();
        UI.hideChatbox();
        UI.hidePanel();
        UI.announceToScreenReader('Journey complete');

        // Beat: "The Conversation" — let the journey ending breathe before recap
        await new Promise(r => setTimeout(r, TIMING.breath));

        // Show recap card instead of jumping straight to AI chat
        this.showJourneyRecap();
    },

    /**
     * Show journey recap with key stats and conversion CTAs
     */
    showJourneyRecap() {
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
            if (num >= 10000000) return '¥' + (num / 1000000).toFixed(1) + 'M';
            return '¥' + num.toLocaleString();
        };

        UI.showChatbox(`
            <div class="journey-recap">
                <h3>Journey complete</h3>
                <div class="journey-recap-checklist">
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Natural advantages
                    </div>
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ¥4T+ government commitment
                    </div>
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${propCount} investment properties
                    </div>
                </div>
                <div class="journey-recap-headline">
                    <div class="journey-recap-headline-label">Combined 5-Year Return</div>
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
        `, { skipHistory: true });
    },

    /**
     * Restart the presentation
     */
    restart() {
        MapController.destroy();
        UI.hidePanel();
        UI.hideChatbox();
        UI.hideAIChat();
        UI.hideLayersToggle();
        UI.hidePanelToggle();
        MapController.resetView();

        // Clean up any stray overlays that weren't properly removed
        const strayOverlays = document.querySelectorAll('.moreharvest-entry');
        strayOverlays.forEach(el => el.remove());

        // Clean up any orphaned marker elements (accumulated from multiple restarts)
        // Mapbox wraps all markers in .mapboxgl-marker containers
        const orphanedMarkers = document.querySelectorAll('.mapboxgl-marker');
        orphanedMarkers.forEach(el => {
            if (el.parentNode) el.remove();
        });

        // Also clean up any orphaned elevated-marker elements
        const orphanedElevatedMarkers = document.querySelectorAll('.elevated-marker');
        orphanedElevatedMarkers.forEach(el => {
            if (el.parentNode) el.remove();
        });

        setTimeout(() => {
            this.startJourneyA();
        }, TIMING.restartDelay);
    },

    // ================================
    // HOLD TO CONFIRM (Future/Present)
    // ================================

    /**
     * Reset from future view back to present.
     * Called from the "Back to Present View" button in the chatbox.
     */

    // ================================
    // EVIDENCE GROUPS
    // ================================

    /**
     * Show evidence group panel from chatbox link
     * @param {string} groupId - Evidence group ID
     */
    showEvidenceGroupPanel(groupId) {
        const group = UI.findEvidenceGroup(groupId);
        if (group) {
            // Track that this evidence group has been viewed
            if (!this.state.evidenceGroupsViewed.includes(groupId)) {
                this.state.evidenceGroupsViewed.push(groupId);
                // Update chatbox to show completed state
                if (this.state.question === 1) {
                    this.updateResourceChatbox();
                } else if (this.state.step === 'Q3_timeline') {
                    this.updateB6Chatbox();
                }
            }

            // Ensure group is expanded
            UI.disclosureState[groupId] = true;

            // Show the panel with just this group
            this.showSingleEvidenceGroup(group);

            // Show markers for this group's items and fly camera to them
            MapController.showEvidenceGroupMarkers(group);
            MapController.fitToEvidenceGroup(group);
        }
    },

    /**
     * Show panel with a single evidence group
     * @param {Object} group - Evidence group data
     */
    showSingleEvidenceGroup(group) {
        UI.disclosureState[group.id] = true;
        const groupHtml = UI.generateDisclosureGroup(group);

        const content = `
            <div class="subtitle">Supporting evidence</div>
            <h2>${group.title}</h2>
            <p>Select an item below to view detailed documentation.</p>
            ${groupHtml}
            <button class="panel-btn" onclick="UI.showEvidenceListPanel()">
                View all evidence
            </button>
        `;

        UI.showPanel(content);
    },

    /**
     * Show evidence library with all groups
     */
    showEvidenceLibrary() {
        UI.showEvidenceListPanel();
    },

    // ================================
    // BACKWARD NAVIGATION
    // ================================

    /**
     * Navigate back to Journey A from Journey B
     */
    async goBackToJourneyA() {
        MapController.stopHeartbeat();
        UI.hideChatbox();
        UI.hidePanel();
        MapController.clearAll();

        await MapController.flyToStep(CAMERA_STEPS.A1);
        this.startJourneyA();
    },

    /**
     * Navigate back to Journey B from Journey C
     */
    async goBackToJourneyB() {
        MapController.stopHeartbeat();
        UI.hideChatbox();
        UI.hidePanel();
        MapController.clearAll();

        await MapController.flyToStep(CAMERA_STEPS.B1);
        this.startJourneyB();
    },

    /**
     * Restore chatbox content based on current journey state
     * Called when user clicks the FAB to reopen chatbox
     */
    restoreChatbox() {
        const { question, step, subPhase } = this.state;

        if (question === 1) {
            if (step === 'Q1_intro') {
                UI.showChatbox(`
                    <h3>Why Kumamoto?</h3>
                    <p>The answer starts with three natural advantages that no amount of money can buy.</p>
                    <button class="chatbox-continue primary" onclick="App.stepA1()">
                        Discover Why
                    </button>
                `);
            } else if (step === 'Q1_silicon' || step === 'Q1_strategic' || step === 'Q3_education') {
                if (subPhase === 'talent') {
                    UI.showChatbox(`
                        <h3>Talent pipeline</h3>
                        <p>METI's Kyushu Semiconductor Human Resources Development Alliance coordinates <strong>five universities</strong> across the region, building a purpose-built talent pipeline.</p>
                        <button class="chatbox-continue primary" onclick="App.transitionToJourneyB()">
                            See Government Commitment
                        </button>
                    `);
                } else if (subPhase === 'location') {
                    UI.showChatbox(`
                        <h3>Strategic location</h3>
                        <p>Seven direct international routes — Seoul, Shanghai, Taipei, Hong Kong. A semiconductor executive can reach any major Asian foundry partner in <strong>under 4 hours.</strong></p>
                        <p style="color: var(--color-text-secondary); margin-top: 8px;">Click destinations on the map to see route details.</p>
                        <button class="chatbox-continue primary" onclick="App.stepA3_talent()">
                            See Talent Pipeline
                        </button>
                    `);
                } else {
                    UI.showChatbox(`
                        <h3>Semiconductor ecosystem</h3>
                        <p>TSMC didn't build in a vacuum. <strong>Sony has operated here since 1987.</strong> Tokyo Electron and Mitsubishi run precision manufacturing within 30km. The supply chain was already here — TSMC plugged in.</p>
                        <button class="chatbox-continue primary" onclick="App.stepA3_location()">
                            See Strategic Location
                        </button>
                    `);
                }
            } else {
                // Q1_water or Q1_power (resource explorer)
                this.updateResourceChatbox();
                UI.elements.chatbox.classList.remove('hidden');
                UI.hideChatFab();
            }
        } else if (question === 2) {
            if (step === 'Q2_gov') {
                UI.showChatbox(`
                    <h3>Government support</h3>
                    <p><strong>¥4 trillion</strong> from the national government. <strong>¥480 billion</strong> from Kumamoto Prefecture. Every level of government is aligned behind one bet: semiconductors.</p>
                    <p style="margin-top: 12px;">Click the numbered markers to trace the commitment chain.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB4()">
                        See Who's Building Here
                    </button>
                `);
            } else if (step === 'Q2_corporate') {
                UI.showChatbox(`
                    <h3>Corporate investment</h3>
                    <p>The signal landed. TSMC committed <strong>¥2.16 trillion</strong> for two fabs. Sony expanded its sensor line. SUMCO, Kyocera, Rohm Apollo, Mitsubishi, Tokyo Electron — each announced expansions within 18 months. <strong>Seven major players</strong>, all converging on Kumamoto.</p>
                    <p style="margin-top: 8px;">Click company markers to see the scale.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB6()">
                        Show Development Timeline
                    </button>
                `);
            } else {
                UI.showChatbox(`
                    <h3>Infrastructure plan</h3>
                    <p>Explore the markers on the map to learn about developments.</p>
                `);
            }
        } else if (question === 3) {
            if (step === 'Q3_timeline') {
                this.updateB6Chatbox();
            } else if (step === 'Q3_future') {
                UI.showChatbox(`
                    <h3>Changes in area</h3>
                    <p>Commitment is promises. This is concrete. New expressway links shaving <strong>15 minutes</strong> off the JASM commute. <strong>¥340 billion</strong> in road infrastructure already under construction.</p>
                    <p style="margin-top: 8px;">Click any <strong>teal dashed road</strong> or station marker to see details.</p>
                    <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
                        View Investment Opportunities
                    </button>
                `);
            } else {
                UI.showChatbox(`
                    <h3>Development timeline</h3>
                    <p>Explore the evidence for this transformation.</p>
                `);
            }
        } else if (question === 5) {
            const propCount = AppData.properties.length;
            const gktk = AppData.gktk;
            const irrValue = gktk ? gktk.stats[3].value : '12-18%';
            const aumValue = gktk ? gktk.fundSize : '¥2.5B';
            const holdValue = gktk ? gktk.stats[2].value : '5-7yr';

            UI.showChatbox(`
                <h3>Investment opportunities</h3>
                <p>${propCount} properties in the semiconductor corridor. Average <strong>12-minute drive</strong> to JASM.</p>
                <div class="chatbox-fund-stats">
                    <div class="chatbox-fund-label">GKTK Fund &middot; ${irrValue} Target IRR</div>
                    <div class="chatbox-fund-detail">${aumValue} Target AUM &middot; ${holdValue} Hold</div>
                </div>
                <details class="chatbox-disclosure">
                    <summary>View full fund and portfolio details</summary>
                    <div class="chatbox-disclosure-body">
                        ${UI.showGktkSummary()}
                        ${UI.showPortfolioCard()}
                    </div>
                </details>
                <p style="margin-top: var(--space-3);">Click any amber marker to see the full financial picture.</p>
                <button class="chatbox-continue primary" onclick="App.complete()">
                    See Your Summary
                </button>
            `);
        } else {
            UI.showChatbox(`
                <h3>Kumamoto investment guide</h3>
                <p>Explore the map to learn about investment opportunities.</p>
            `);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
