/**
 * Main App - State Machine for Journey Progression
 */

/**
 * Shared timing constants — semantic names for setTimeout values.
 * CSS token equivalents noted in comments.
 */
/**
 * Shared timing constants — semantic names for setTimeout values.
 * CSS token equivalents noted in comments.
 */
const TIMING = {
    scene: 800,          // --duration-scene (journey transition hold)
    fast: 150,           // --duration-fast
    normal: 250,         // --duration-normal
    slow: 350,           // --duration-slow
    flyDuration: 2000,    // Mapbox flyTo milliseconds
    flyEase: 0.15,       // Deprecated (kept for reference)
    revealDelay: 1200,   // science park after gov chain
    buttonDelay: 2500,   // continue button after markers
    infraStagger: 100,   // infrastructure road stagger
    restartDelay: 500,   // delay before restart
};

const App = {
    // Current journey state
    state: {
        journey: null, // 'A', 'B', 'C'
        step: null,    // Current step within journey
        resourcesExplored: [], // Track which resources have been viewed
        a3Phase: null, // 'infrastructure' or 'location'
        companiesExplored: [], // Track which companies have been viewed
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
     * Triggers cinematic 3D fly-in from Kyushu aerial to Kumamoto,
     * then settles into 3D view and starts Journey A.
     */
    async start() {
        UI.showApp();

        // Wait for start screen fade to complete
        await new Promise(r => setTimeout(r, 600));

        // Force map to recalculate size
        MapController.map.resize();

        // Cinematic arrival — camera descends from sky to Kumamoto
        await MapController.cinematicEntry();

        // Fly to Journey A starting position
        await MapController.flyToStep(CAMERA_STEPS.A0);

        this.startJourneyA();
    },

    // ================================
    // JOURNEY A: Why Kumamoto?
    // ================================

    startJourneyA() {
        this.state.journey = 'A';
        this.state.step = 'A0';
        this.state.resourcesExplored = [];
        this.state.evidenceGroupsViewed = [];

        // Show data layers toggle for Journey A
        UI.showDataLayers('A');

        // A0: Opening question — frames the entire narrative
        const q = AppData.openingQuestion;
        UI.showChatbox(`
            <h3>Why Kumamoto?</h3>
            <p class="chatbox-question">${q.question}</p>
            <button class="chatbox-continue primary" onclick="App.showOpeningEvidence()">
                View the Evidence
            </button>
        `);
    },

    /**
     * A0: Show supporting evidence for the opening question
     */
    showOpeningEvidence() {
        const docs = AppData.openingQuestion.supportingDocs;
        const docsHtml = docs.map(doc => {
            const iconName = doc.type === 'government' ? 'landmark' : doc.type === 'news' ? 'newspaper' : 'bar-chart-3';
            return `
                <div class="evidence-item" onclick="UI.showGallery('${doc.title}')">
                    <div class="evidence-item-icon">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <div class="evidence-item-content">
                        <div class="evidence-item-title">${doc.title}</div>
                        <div class="evidence-item-source">${doc.source}</div>
                    </div>
                </div>
            `;
        }).join('');

        UI.showPanel(`
            <div class="subtitle">Supporting Evidence</div>
            <h2>¥10 Trillion Commitment</h2>
            <p>Japan designated semiconductors as critical infrastructure, committing unprecedented public funds.</p>
            <div class="evidence-library" style="margin-top: var(--space-6);">
                ${docsHtml}
            </div>
        `);

        // Re-init lucide icons in the panel
        if (window.lucide) lucide.createIcons();

        // Update chatbox to continue
        const q = AppData.openingQuestion;
        UI.updateChatbox(`
            <h3>Why Kumamoto?</h3>
            <p class="chatbox-question">${q.question}</p>
            <button class="chatbox-continue primary" onclick="App.stepA1()">
                Explore the Region
            </button>
        `);
    },

    /**
     * A1: Why Kumamoto? intro
     */
    stepA1() {
        this.state.step = 'A1';
        UI.hidePanel();

        // Cinematic camera re-angle
        MapController.flyToStep(CAMERA_STEPS.A1);

        UI.updateChatbox(`
            <h3>Natural Advantages</h3>
            <p>Before the factories came, Kumamoto already had something most cities can't offer. Let me show you.</p>
            <button class="chatbox-continue primary" onclick="App.stepA2()">
                Start Exploring
            </button>
        `);
    },

    stepA2() {
        this.state.step = 'A2';

        // Show Kyushu-wide energy markers and water resource markers together
        MapController.showKyushuEnergy();
        MapController.showResourceMarker('water');

        // Show combined utility infrastructure options
        UI.updateChatbox(`
            <h3>Utility Infrastructure</h3>
            <p>Semiconductor fabs need <strong>10 million gallons of water daily</strong> and enough electricity to power a small city. Kumamoto has both — in surplus.</p>
            <div class="chatbox-options">
                <button class="chatbox-option" onclick="App.selectResource('water')">
                    Water Resources
                </button>
                <button class="chatbox-option" onclick="App.selectResource('power')">
                    Power Infrastructure
                </button>
            </div>
        `);
    },

    selectResource(resourceId) {
        this.state.step = 'A3';

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

        // Chain: when panel closes, auto-advance to next unexplored resource
        const nextResource = resourceId === 'water' ? 'power' : 'water';
        const nextExplored = this.state.resourcesExplored.includes(nextResource);
        if (!nextExplored) {
            UI.onPanelClose(() => {
                this.selectResource(nextResource);
            });
        }
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

        let content = `
            <h3>Utility Infrastructure</h3>
            <p>${progressText}</p>
            <div class="chatbox-options" role="group" aria-label="Resource options">
                <button class="chatbox-option ${waterExplored ? 'completed' : ''}"
                        onclick="App.selectResource('water')"
                        ${waterExplored ? 'aria-disabled="true"' : ''}>
                    Water Resources${waterExplored ? '<span class="sr-only"> (explored)</span>' : ''}
                </button>
                <button class="chatbox-option ${powerExplored ? 'completed' : ''}"
                        onclick="App.selectResource('power')"
                        ${powerExplored ? 'aria-disabled="true"' : ''}>
                    Power Infrastructure${powerExplored ? '<span class="sr-only"> (explored)</span>' : ''}
                </button>
            </div>
        `;

        // Show evidence group link when power is explored
        if (powerExplored) {
            const evidenceViewed = this.state.evidenceGroupsViewed.includes('energy-infrastructure');
            content += `
                <button class="chatbox-option ${evidenceViewed ? 'completed' : ''}" onclick="App.showEvidenceGroupPanel('energy-infrastructure')" style="margin-top: 8px;">
                    View Energy Infrastructure Evidence
                </button>
            `;
        }

        if (allExplored) {
            content += `
                <button class="chatbox-continue primary" onclick="App.stepA3()">
                    Continue
                </button>
            `;
        }

        UI.updateChatbox(content);
    },

    /**
     * A3 Phase 1: Existing Semiconductor Infrastructure — narrative only
     */
    stepA3() {
        this.state.step = 'A3';
        this.state.a3Phase = 'infrastructure';

        // Cinematic flight to semiconductor ecosystem area
        MapController.flyToStep(CAMERA_STEPS.A3_ecosystem);

        UI.updateChatbox(`
            <h3>Semiconductor Ecosystem</h3>
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
        this.state.a3Phase = 'location';

        // Show airline routes with animation
        await MapController.showAirlineRoutes();

        UI.updateChatbox(`
            <h3>Strategic Location</h3>
            <p>Seven direct international routes — Seoul, Shanghai, Taipei, Hong Kong. A semiconductor executive can reach any major Asian foundry partner in <strong>under 4 hours.</strong></p>
            <p style="color: var(--color-text-secondary); margin-top: 8px;">Click destinations on the map to see route details.</p>
            <button class="chatbox-continue primary" onclick="App.transitionToJourneyB()">
                See Government Commitment
            </button>
        `);
    },

    async transitionToJourneyB() {
        // Save Journey A content to history BEFORE transition
        UI.saveChatboxToHistory();

        UI.hideChatbox();
        UI.hidePanel();

        // Clear airline routes and energy markers before transition
        MapController.hideAirlineRoutes();
        MapController.hideKyushuEnergy();

        // Show memorable journey transition (Peak-End Rule)
        await UI.showJourneyTransition('B');

        // Cinematic sweep back to corridor from new angle
        await MapController.flyToStep(CAMERA_STEPS.A_to_B);

        this.startJourneyB();
    },

    // ================================
    // JOURNEY B: Infrastructure Plan
    // ================================

    startJourneyB() {
        this.state.journey = 'B';
        this.state.step = 'B1';
        this.state.companiesExplored = [];

        // Show data layers toggle for Journey B
        UI.showDataLayers('B');

        // Show panel toggle button
        UI.showPanelToggle();

        // B1: Show government commitment chain with chatbox intro
        UI.showChatbox(`
            <h3>Government Support</h3>
            <p><strong>¥4 trillion</strong> from the national government. <strong>¥480 billion</strong> from Kumamoto Prefecture. Every level of government is aligned behind one bet: semiconductors.</p>
            <p style="margin-top: 12px;">Click the numbered markers to trace the commitment chain.</p>
        `, { skipHistory: true });

        // Fly to government chain area
        MapController.flyToStep(CAMERA_STEPS.B1);

        // Show government chain markers (staggered animation)
        MapController.showGovernmentChain();

        // Also show Science Park as part of B1 context
        setTimeout(() => {
            MapController.showSciencePark();
        }, TIMING.revealDelay);

        // After delay, add button to continue to B4
        setTimeout(() => {
            UI.updateChatbox(`
                <h3>Government Support</h3>
                <p><strong>¥4 trillion</strong> from the national government. <strong>¥480 billion</strong> from Kumamoto Prefecture. Every level is aligned.</p>
                <p style="margin-top: 12px;">Click the numbered markers to trace the commitment chain.</p>
                <button class="chatbox-continue primary" onclick="App.stepB4()">
                    See Who's Building Here
                </button>
            `);
        }, TIMING.buttonDelay);
    },

    stepB4() {
        this.state.step = 'B4';

        // Cinematic flight to company cluster
        MapController.flyToStep(CAMERA_STEPS.B4);
        MapController.showCompanyMarkers();

        UI.updateChatbox(`
            <h3>Corporate Investment</h3>
            <p>The signal landed. TSMC committed <strong>¥2.16 trillion</strong> for two fabs. Sony expanded its sensor line. Rohm, Mitsubishi, Tokyo Electron — each announced expansions within 18 months.</p>
            <p style="margin-top: 8px;">Click company markers to see the scale.</p>
            <button class="chatbox-continue primary" onclick="App.stepB6()">
                Show Development Timeline
            </button>
        `);
    },

    stepB6() {
        this.state.step = 'B6';

        // Cinematic flight to development area
        MapController.flyToStep(CAMERA_STEPS.B6);

        // Show the Future/Present toggle
        UI.showControlBar();
        UI.showTimeToggle();

        UI.updateChatbox(`
            <h3>Development Timeline</h3>
            <p>Use the <strong>Future / Present</strong> toggle above. Watch how the corridor transforms — new zones, new transport links, new talent pipelines.</p>
            <div class="chatbox-options" style="margin-top: 12px;">
                <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('government-zones')">
                    View Government Zone Plans
                </button>
                <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('transportation-network')">
                    View Transportation Network
                </button>
                <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('education-pipeline')">
                    View Education Pipeline
                </button>
            </div>
            <button class="chatbox-continue primary" onclick="App.stepB7()">
                See What's Changing
            </button>
        `);
    },

    stepB7() {
        this.state.step = 'B7';

        // Reset to present view for clarity
        UI.setTimeView('present');

        // Show infrastructure roads on the map
        MapController.showInfrastructureRoads();

        UI.updateChatbox(`
            <h3>Changes in Area</h3>
            <p>Commitment is promises. This is concrete. New expressway links shaving <strong>15 minutes</strong> off the JASM commute. A new rail station. <strong>¥340 billion</strong> in road infrastructure already under construction.</p>
            <p style="margin-top: 8px;">Click a highlighted road or station marker to see details.</p>
            <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
                View Investment Opportunities
            </button>
        `);
    },

    async transitionToJourneyC() {
        // Save Journey B content to history BEFORE transition
        UI.saveChatboxToHistory();

        UI.hideChatbox();
        UI.hidePanel();

        // Reset to present view
        UI.setTimeView('present');

        // Hide infrastructure roads if shown
        if (this.state.step === 'B7') {
            MapController.hideInfrastructureRoads();
        }

        // Show memorable journey transition (Peak-End Rule)
        await UI.showJourneyTransition('C');

        // Show MoreHarvest grand entry before properties
        await UI.showMoreHarvestEntry();

        this.startJourneyC();
    },

    // ================================
    // JOURNEY C: Investment Projections
    // ================================

    async startJourneyC() {
        this.state.journey = 'C';
        this.state.step = 'C1';

        // Mapbox is already initialized from cinematic entry
        // Elevate to 3D corridor view — the map tilts and buildings rise
        await MapController.elevateToCorridorView();

        // Add property markers and route lines to Mapbox 3D view
        const jasmCoords = AppData.jasmLocation || [32.874, 130.785];
        MapController.addPropertyMarkers(AppData.properties);
        MapController.addRouteLines(AppData.properties, jasmCoords);

        // Update data layers toggle for Journey C
        UI.showDataLayers('C');

        // Show property list in right panel
        UI.showPropertyListPanel();

        // Calculate portfolio stats for narrative
        const propCount = AppData.properties.length;
        let totalNetProfit = 0;
        AppData.properties.forEach(p => {
            totalNetProfit += p.financials.scenarios.average.netProfit;
        });
        const formatYen = (num) => {
            if (num >= 10000000) return '¥' + (num / 1000000).toFixed(1) + 'M';
            return '¥' + num.toLocaleString();
        };

        UI.showChatbox(`
            <h3>Investment Opportunities</h3>
            <p>${propCount} properties in the semiconductor corridor. Average <strong>12-minute drive</strong> to JASM. Combined 5-year projected return: <strong>${formatYen(totalNetProfit)}</strong> across the portfolio.</p>
            <p style="margin-top: 8px;">Click any amber marker to see the full financial picture.</p>
            <div class="chatbox-disclosures">
                <details class="chatbox-disclosure">
                    <summary>Fund Overview</summary>
                    <div class="chatbox-disclosure-body">
                        ${UI.showGktkSummary()}
                    </div>
                </details>
                <details class="chatbox-disclosure">
                    <summary>Portfolio Returns</summary>
                    <div class="chatbox-disclosure-body">
                        ${UI.showPortfolioCard()}
                    </div>
                </details>
            </div>
            <button class="chatbox-continue primary" onclick="App.complete()">
                Any More Questions?
            </button>
        `, { skipHistory: true });

        // Hide time toggle for clarity
        UI.hideTimeToggle();
    },

    /**
     * Complete the presentation - show AI chat for follow-up questions
     */
    async complete() {
        this.state.step = 'complete';

        UI.hideChatbox();
        UI.hidePanel();

        // Brief completion moment, then open AI chat
        await UI.showJourneyTransition('complete');
        UI.hideChatbox();
        UI.showAIChat();
    },

    /**
     * Restart the presentation
     */
    restart() {
        MapController.destroy();
        UI.hidePanel();
        UI.hideControlBar();
        UI.hideChatbox();
        UI.hideAIChat();
        UI.hideLayersToggle();
        UI.hidePanelToggle();
        MapController.resetView();

        setTimeout(() => {
            this.startJourneyA();
        }, TIMING.restartDelay);
    },

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
                if (this.state.journey === 'A') {
                    this.updateResourceChatbox();
                }
            }

            // Ensure group is expanded
            UI.disclosureState[groupId] = true;

            // Show the panel with just this group
            this.showSingleEvidenceGroup(group);

            // Show markers for this group's items
            MapController.showEvidenceGroupMarkers(group);
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
            <div class="subtitle">Supporting Evidence</div>
            <h2>${group.title}</h2>
            <p>Select an item below to view detailed documentation.</p>
            ${groupHtml}
            <button class="panel-btn" onclick="UI.showEvidenceListPanel()">
                View All Evidence
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

    /**
     * Restore chatbox content based on current journey state
     * Called when user clicks the FAB to reopen chatbox
     */
    restoreChatbox() {
        const { journey, step } = this.state;

        if (journey === 'A') {
            if (step === 'A0') {
                const q = AppData.openingQuestion;
                UI.showChatbox(`
                    <h3>Why Kumamoto?</h3>
                    <p class="chatbox-question">${q.question}</p>
                    <button class="chatbox-continue primary" onclick="App.showOpeningEvidence()">
                        View the Evidence
                    </button>
                `);
            } else if (step === 'A1') {
                UI.showChatbox(`
                    <h3>Natural Advantages</h3>
                    <p>Before the factories came, Kumamoto already had something most cities can't offer. Let me show you.</p>
                    <button class="chatbox-continue primary" onclick="App.stepA2()">
                        Start Exploring
                    </button>
                `);
            } else if (step === 'A3') {
                if (this.state.a3Phase === 'location') {
                    UI.showChatbox(`
                        <h3>Strategic Location</h3>
                        <p>Seven direct international routes — Seoul, Shanghai, Taipei, Hong Kong. A semiconductor executive can reach any major Asian foundry partner in <strong>under 4 hours.</strong></p>
                        <p style="color: var(--color-text-secondary); margin-top: 8px;">Click destinations on the map to see route details.</p>
                        <button class="chatbox-continue primary" onclick="App.transitionToJourneyB()">
                            See Government Commitment
                        </button>
                    `);
                } else {
                    UI.showChatbox(`
                        <h3>Semiconductor Ecosystem</h3>
                        <p>TSMC didn't build in a vacuum. <strong>Sony has operated here since 1987.</strong> Tokyo Electron and Mitsubishi run precision manufacturing within 30km. The supply chain was already here — TSMC plugged in.</p>
                        <button class="chatbox-continue primary" onclick="App.stepA3_location()">
                            See Strategic Location
                        </button>
                    `);
                }
            } else {
                this.updateResourceChatbox();
                UI.elements.chatbox.classList.remove('hidden');
                UI.hideChatFab();
            }
        } else if (journey === 'B') {
            if (step === 'B1') {
                UI.showChatbox(`
                    <h3>Government Support</h3>
                    <p><strong>¥4 trillion</strong> from the national government. <strong>¥480 billion</strong> from Kumamoto Prefecture. Every level is aligned.</p>
                    <p style="margin-top: 12px;">Click the numbered markers to trace the commitment chain.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB4()">
                        See Who's Building Here
                    </button>
                `);
            } else if (step === 'B4') {
                UI.showChatbox(`
                    <h3>Corporate Investment</h3>
                    <p>The signal landed. TSMC committed <strong>¥2.16 trillion</strong> for two fabs. Sony expanded its sensor line. Rohm, Mitsubishi, Tokyo Electron — each announced expansions within 18 months.</p>
                    <p style="margin-top: 8px;">Click company markers to see the scale.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB6()">
                        Show Development Timeline
                    </button>
                `);
            } else if (step === 'B6') {
                UI.showChatbox(`
                    <h3>Development Timeline</h3>
                    <p>Use the <strong>Future / Present</strong> toggle above. Watch how the corridor transforms — new zones, new transport links, new talent pipelines.</p>
                    <div class="chatbox-options" style="margin-top: 12px;">
                        <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('government-zones')">
                            View Government Zone Plans
                        </button>
                        <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('transportation-network')">
                            View Transportation Network
                        </button>
                        <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('education-pipeline')">
                            View Education Pipeline
                        </button>
                    </div>
                    <button class="chatbox-continue primary" onclick="App.stepB7()">
                        See What's Changing
                    </button>
                `);
            } else if (step === 'B7') {
                UI.showChatbox(`
                    <h3>Changes in Area</h3>
                    <p>Commitment is promises. This is concrete. New expressway links shaving <strong>15 minutes</strong> off the JASM commute. <strong>¥340 billion</strong> in road infrastructure already under construction.</p>
                    <p style="margin-top: 8px;">Click a highlighted road or station marker to see details.</p>
                    <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
                        View Investment Opportunities
                    </button>
                `);
            } else {
                UI.showChatbox(`
                    <h3>Infrastructure Plan</h3>
                    <p>Explore the markers on the map to learn about developments.</p>
                `);
            }
        } else if (journey === 'C') {
            const propCount = AppData.properties.length;
            let totalNetProfit = 0;
            AppData.properties.forEach(p => {
                totalNetProfit += p.financials.scenarios.average.netProfit;
            });
            const formatYen = (num) => {
                if (num >= 10000000) return '¥' + (num / 1000000).toFixed(1) + 'M';
                return '¥' + num.toLocaleString();
            };

            UI.showChatbox(`
                <h3>Investment Opportunities</h3>
                <p>${propCount} properties in the semiconductor corridor. Average <strong>12-minute drive</strong> to JASM. Combined 5-year projected return: <strong>${formatYen(totalNetProfit)}</strong> across the portfolio.</p>
                <p style="margin-top: 8px;">Click any amber marker to see the full financial picture.</p>
                <div class="chatbox-disclosures">
                    <details class="chatbox-disclosure">
                        <summary>Fund Overview</summary>
                        <div class="chatbox-disclosure-body">
                            ${UI.showGktkSummary()}
                        </div>
                    </details>
                    <details class="chatbox-disclosure">
                        <summary>Portfolio Returns</summary>
                        <div class="chatbox-disclosure-body">
                            ${UI.showPortfolioCard()}
                        </div>
                    </details>
                </div>
                <button class="chatbox-continue primary" onclick="App.complete()">
                    Any More Questions?
                </button>
            `);
        } else {
            UI.showChatbox(`
                <h3>Kumamoto Investment Guide</h3>
                <p>Explore the map to learn about investment opportunities.</p>
            `);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
