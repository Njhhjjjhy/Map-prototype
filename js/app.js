/**
 * Main App - State Machine for Journey Progression
 */

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
        MapManager.init();
    },

    /**
     * Start the journey (called when Start button is clicked)
     */
    start() {
        UI.showApp();

        // Wait for transition, then refresh map and start Journey A
        setTimeout(() => {
            // Force map to recalculate size after container becomes visible
            MapManager.map.invalidateSize();
            this.startJourneyA();
        }, 600);
    },

    // ================================
    // JOURNEY A: Why Kumamoto?
    // ================================

    startJourneyA() {
        this.state.journey = 'A';
        this.state.step = 'A1';
        this.state.resourcesExplored = [];
        this.state.evidenceGroupsViewed = [];

        // Show legend for Journey A
        UI.showLegend('A');

        // Show data layers toggle for Journey A
        UI.showDataLayers('A');

        // A1: Show "Why Kumamoto?" prompt
        UI.showChatbox(`
            <h3>Why Kumamoto?</h3>
            <p>Discover what makes this region special for semiconductor investment.</p>
            <button class="chatbox-continue primary" onclick="App.stepA2()">
                Start Exploring
            </button>
        `);
    },

    stepA2() {
        this.state.step = 'A2';

        // Show resource options
        UI.updateChatbox(`
            <h3>Why Kumamoto?</h3>
            <p>Two key factors attracted the world's leading chipmakers:</p>
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
        MapManager.showResourceMarker(resourceId);

        // Track explored resources
        if (!this.state.resourcesExplored.includes(resourceId)) {
            this.state.resourcesExplored.push(resourceId);
        }

        // Show the resource panel immediately (default to water if first time)
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
            progressText = 'You\'ve explored both key factors.';
        } else if (exploredCount === 1) {
            progressText = `Explore the remaining resource to continue. (${exploredCount}/2)`;
        } else {
            progressText = 'Click the markers on the map to learn more.';
        }

        let content = `
            <h3>Why Kumamoto?</h3>
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

        UI.updateChatbox(`
            <h3>Why Kumamoto?</h3>
            <p><strong>Existing Semiconductor Infrastructure</strong></p>
            <p style="color: var(--color-text-secondary); margin-top: 8px;">
                TSMC chose Kumamoto because the supply chain was already here.
                Sony, Tokyo Electron, and Mitsubishi have operated in the region for decades.
            </p>
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

        // Show airline routes legend
        UI.showAirlineRoutesLegend();

        // Show airline routes with animation
        await MapManager.showAirlineRoutes();

        UI.updateChatbox(`
            <h3>Why Kumamoto?</h3>
            <p><strong>Strategic Location</strong></p>
            <p style="color: var(--color-text-secondary); margin-top: 8px;">
                Aso Kumamoto Airport connects directly to 7 international destinations
                across 4 regions. Click destinations to see route details.
            </p>
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

        // Hide legend before transition
        UI.hideLegend();

        // Clear airline routes before transition
        MapManager.hideAirlineRoutes();

        // Show memorable journey transition (Peak-End Rule)
        await UI.showJourneyTransition('B');

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

        // Update legend for Journey B
        UI.showLegend('B');

        // B1: Show government commitment chain with chatbox intro
        UI.showChatbox(`
            <h3>Government Support</h3>
            <p>${AppData.governmentChain.intro}</p>
            <p style="margin-top: 12px;"><strong>Click the numbered markers</strong> to see each level's commitment — from national policy to local planning.</p>
        `, { skipHistory: true });

        // Show government chain markers (staggered animation)
        MapManager.showGovernmentChain();

        // Also show Science Park as part of B1 context
        setTimeout(() => {
            MapManager.showSciencePark();
        }, 1200);

        // After delay, add button to continue to B4
        setTimeout(() => {
            UI.updateChatbox(`
                <h3>Government Support</h3>
                <p>${AppData.governmentChain.intro}</p>
                <p style="margin-top: 12px;"><strong>Click the numbered markers</strong> to explore each level's commitment.</p>
                <button class="chatbox-continue primary" onclick="App.stepB4()">
                    See Who's Building Here
                </button>
            `);
        }, 2500);
    },

    stepB4() {
        this.state.step = 'B4';

        MapManager.showCompanyMarkers();

        UI.updateChatbox(`
            <h3>Government Support</h3>
            <p><strong>The result:</strong> Major corporations have committed billions.</p>
            <p>Click company markers to see their investments.</p>
            <button class="chatbox-continue primary" onclick="App.stepB6()">
                Show Development Timeline
            </button>
        `);
    },

    stepB6() {
        this.state.step = 'B6';

        // Show the Future/Present toggle
        UI.showControlBar();
        UI.showTimeToggle();

        UI.updateChatbox(`
            <h3>Government Support</h3>
            <p>Use the <strong>Future / Present</strong> toggle above to see planned developments.</p>
            <p>Future view shows development zones taking shape.</p>
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
        MapManager.showInfrastructureRoads();

        // Update legend to include infrastructure roads
        UI.showLegend('B7');

        UI.updateChatbox(`
            <h3>Changes in Area</h3>
            <p><strong>Government commitment is one thing. Here's what's actually changing.</strong></p>
            <p>These infrastructure projects are cutting commute times — making nearby properties more valuable.</p>
            <p style="margin-top: 8px;"><strong>Click a highlighted road</strong> to see the impact.</p>
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
            MapManager.hideInfrastructureRoads();
        }

        // Show memorable journey transition (Peak-End Rule)
        await UI.showJourneyTransition('C');

        this.startJourneyC();
    },

    // ================================
    // JOURNEY C: Investment Projections
    // ================================

    startJourneyC() {
        this.state.journey = 'C';
        this.state.step = 'C1';

        // C1: Show property markers
        MapManager.showPropertyMarkers();

        // Update data layers toggle for Journey C
        UI.showDataLayers('C');

        // Update legend for Journey C
        UI.showLegend('C');

        // Generate portfolio summary (Peak Experience)
        const portfolioSummary = UI.showPortfolioSummary();

        UI.showChatbox(`
            <h3>Investment Opportunities</h3>
            <p>You've seen why Kumamoto, the government backing, and what's changing on the ground.</p>
            <p><strong>Now let's look at specific investment opportunities.</strong></p>
            <p style="margin-top: 12px;">Amber markers show available properties. Click to see financials.</p>
            ${portfolioSummary}
            <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
                Route lines show distance to JASM employment center.
            </p>
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
    complete() {
        this.state.step = 'complete';

        // Show the AI chat for follow-up questions
        UI.showAIChat();
    },

    /**
     * Restart the presentation
     */
    restart() {
        MapManager.clearAll();
        UI.hidePanel();
        UI.hideControlBar();
        UI.hideChatbox();
        UI.hideAIChat();
        UI.hideLayersToggle();
        UI.hidePanelToggle();
        MapManager.resetView();

        setTimeout(() => {
            this.startJourneyA();
        }, 500);
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
            MapManager.showEvidenceGroupMarkers(group);
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
            if (step === 'A1') {
                UI.showChatbox(`
                    <h3>Why Kumamoto?</h3>
                    <p>Discover what makes this region special for semiconductor investment.</p>
                    <button class="chatbox-continue primary" onclick="App.stepA2()">
                        Start Exploring
                    </button>
                `);
            } else if (step === 'A3') {
                // Restore based on which phase of A3 we're in
                if (this.state.a3Phase === 'location') {
                    UI.showChatbox(`
                        <h3>Why Kumamoto?</h3>
                        <p><strong>Strategic Location</strong></p>
                        <p style="color: var(--color-text-secondary); margin-top: 8px;">
                            Aso Kumamoto Airport connects directly to 7 international destinations
                            across 4 regions. Click destinations to see route details.
                        </p>
                        <button class="chatbox-continue primary" onclick="App.transitionToJourneyB()">
                            See Government Commitment
                        </button>
                    `);
                } else {
                    // Default to infrastructure phase
                    UI.showChatbox(`
                        <h3>Why Kumamoto?</h3>
                        <p><strong>Existing Semiconductor Infrastructure</strong></p>
                        <p style="color: var(--color-text-secondary); margin-top: 8px;">
                            TSMC chose Kumamoto because the supply chain was already here.
                            Sony, Tokyo Electron, and Mitsubishi have operated in the region for decades.
                        </p>
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
                    <p>${AppData.governmentChain.intro}</p>
                    <p style="margin-top: 12px;"><strong>Click the numbered markers</strong> to explore each level's commitment.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB4()">
                        See Who's Building Here
                    </button>
                `);
            } else if (step === 'B4') {
                UI.showChatbox(`
                    <h3>Government Support</h3>
                    <p><strong>The result:</strong> Major corporations have committed billions.</p>
                    <p>Click company markers to see their investments.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB6()">
                        Show Development Timeline
                    </button>
                `);
            } else if (step === 'B6') {
                UI.showChatbox(`
                    <h3>Government Support</h3>
                    <p>Use the <strong>Future / Present</strong> toggle above to see planned developments.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB7()">
                        See What's Changing
                    </button>
                `);
            } else if (step === 'B7') {
                UI.showChatbox(`
                    <h3>Changes in Area</h3>
                    <p><strong>Government commitment is one thing. Here's what's actually changing.</strong></p>
                    <p>Click a highlighted road or the station marker to see details.</p>
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
            const portfolioSummary = UI.showPortfolioSummary();
            UI.showChatbox(`
                <h3>Investment Opportunities</h3>
                <p>You've seen why Kumamoto, the government backing, and what's changing on the ground.</p>
                <p><strong>Click property markers to see financials.</strong></p>
                ${portfolioSummary}
                <button class="chatbox-continue primary" onclick="App.complete()">
                    Any More Questions?
                </button>
            `);
        } else {
            // Default: show a generic message
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
