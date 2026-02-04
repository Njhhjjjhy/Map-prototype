/**
 * Main App - State Machine for Journey Progression
 */

const App = {
    // Current journey state
    state: {
        journey: null, // 'A', 'B', 'C'
        step: null,    // Current step within journey
        resourcesExplored: [], // Track which resources have been viewed
        companiesExplored: [], // Track which companies have been viewed
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

        let content = `
            <h3>Why Kumamoto?</h3>
            <p>Click the markers on the map to learn more.</p>
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
            content += `
                <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('energy-infrastructure')" style="margin-top: 8px;">
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
     * A3: Strategic Advantages — narrative only (no markers)
     * Pair 2 of "Why Kumamoto" pillars
     */
    stepA3() {
        this.state.step = 'A3';

        UI.updateChatbox(`
            <h3>Why Kumamoto?</h3>
            <p><strong>Beyond natural resources, Kumamoto offers strategic advantages:</strong></p>
            <div style="margin: 16px 0;">
                <p style="margin-bottom: 12px;">
                    <strong>Existing Semiconductor Infrastructure</strong><br>
                    <span style="color: var(--color-text-secondary);">TSMC chose Kumamoto because the supply chain was already here. Sony, Tokyo Electron, and Mitsubishi have operated in the region for decades.</span>
                </p>
                <p>
                    <strong>Strategic Location</strong><br>
                    <span style="color: var(--color-text-secondary);">Gateway to Asia with port access and Kumamoto Airport's growing international cargo routes. 2 hours to Shanghai, 1.5 hours to Taipei.</span>
                </p>
            </div>
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

        // B1: Show infrastructure layer with Science Park
        MapManager.showSciencePark();

        // Show data layers toggle for Journey B
        UI.showDataLayers('B');

        // Show panel toggle button
        UI.showPanelToggle();

        // Update legend for Journey B
        UI.showLegend('B');

        UI.showChatbox(`
            <h3>Infrastructure Plan</h3>
            <p>The red circle shows the Kumamoto Science Park corridor.</p>
            <p>Click the circle to see the master plan.</p>
        `, { skipHistory: true });

        // B4: After a delay, show company markers
        setTimeout(() => {
            this.stepB4();
        }, 2000);
    },

    stepB4() {
        this.state.step = 'B4';

        MapManager.showCompanyMarkers();

        UI.updateChatbox(`
            <h3>Infrastructure Plan</h3>
            <p>Major corporations have committed billions to this region.</p>
            <p>Click company markers to see their investments.</p>
            <button class="chatbox-continue primary" onclick="App.stepB6()">
                Show Time Controls
            </button>
        `);
    },

    stepB6() {
        this.state.step = 'B6';

        // Show the Future/Present toggle
        UI.showControlBar();
        UI.showTimeToggle();

        UI.updateChatbox(`
            <h3>Infrastructure Plan</h3>
            <p>Use the <strong>Future / Present</strong> toggle above to see planned developments.</p>
            <p>Future view shows upcoming development zones.</p>
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
                View Road Improvements
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
            <h3>Infrastructure Roads</h3>
            <p>These road projects cut commute times for JASM workers — making nearby properties more accessible and more valuable.</p>
            <p><strong>Click a highlighted road to see details.</strong></p>
            <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
                View Properties
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
            <p>Amber markers show available investment properties.</p>
            <p><strong>Click a property to see financials and projections.</strong></p>
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
                this.stepA3();
            } else {
                this.updateResourceChatbox();
                UI.elements.chatbox.classList.remove('hidden');
                UI.hideChatFab();
            }
        } else if (journey === 'B') {
            if (step === 'B1' || step === 'B4') {
                UI.showChatbox(`
                    <h3>Infrastructure Plan</h3>
                    <p>Major corporations have committed billions to this region.</p>
                    <p>Click company markers to see their investments.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB6()">
                        Show Time Controls
                    </button>
                `);
            } else if (step === 'B7') {
                UI.showChatbox(`
                    <h3>Infrastructure Roads</h3>
                    <p>These road projects cut commute times for JASM workers — making nearby properties more accessible and more valuable.</p>
                    <p><strong>Click a highlighted road to see details.</strong></p>
                    <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
                        View Properties
                    </button>
                `);
            } else {
                UI.showChatbox(`
                    <h3>Infrastructure Plan</h3>
                    <p>Use the <strong>Future / Present</strong> toggle above to see planned developments.</p>
                    <p>Future view shows upcoming development zones.</p>
                    <button class="chatbox-continue primary" onclick="App.stepB7()">
                        View Road Improvements
                    </button>
                `);
            }
        } else if (journey === 'C') {
            const portfolioSummary = UI.showPortfolioSummary();
            UI.showChatbox(`
                <h3>Investment Opportunities</h3>
                <p>Amber markers show available investment properties.</p>
                <p><strong>Click a property to see financials and projections.</strong></p>
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
