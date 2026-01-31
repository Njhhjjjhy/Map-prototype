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

        // Show legend for Journey A
        UI.showLegend('A');

        // Track explored resources
        if (!this.state.resourcesExplored.includes(resourceId)) {
            this.state.resourcesExplored.push(resourceId);
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
            <div class="chatbox-options">
                <button class="chatbox-option ${waterExplored ? 'completed' : ''}" onclick="App.selectResource('water')">
                    Water Resources
                </button>
                <button class="chatbox-option ${powerExplored ? 'completed' : ''}" onclick="App.selectResource('power')">
                    Power Infrastructure
                </button>
            </div>
        `;

        if (allExplored) {
            content += `
                <button class="chatbox-continue primary" onclick="App.transitionToJourneyB()">
                    See what's being built here
                </button>
            `;
        }

        UI.updateChatbox(content);
    },

    transitionToJourneyB() {
        UI.hideChatbox();
        UI.hidePanel();

        setTimeout(() => {
            this.startJourneyB();
        }, 300);
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

        // Show legend and data layers for Journey B
        UI.showLegend('B');
        UI.showDataLayers('B');

        UI.showChatbox(`
            <h3>Infrastructure Plan</h3>
            <p>The red circle shows the Kumamoto Science Park corridor.</p>
            <p>Click the circle to see the master plan.</p>
        `);

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
            <button class="chatbox-continue" onclick="App.stepB6()">
                Show time controls
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
            <button class="chatbox-continue" onclick="App.transitionToJourneyC()">
                View investment opportunities
            </button>
        `);
    },

    transitionToJourneyC() {
        UI.hideChatbox();
        UI.hidePanel();

        // Reset to present view
        UI.setTimeView('present');

        setTimeout(() => {
            this.startJourneyC();
        }, 300);
    },

    // ================================
    // JOURNEY C: Investment Projections
    // ================================

    startJourneyC() {
        this.state.journey = 'C';
        this.state.step = 'C1';

        // C1: Show property markers
        MapManager.showPropertyMarkers();

        // Update legend and data layers for Journey C
        UI.showLegend('C');
        UI.showDataLayers('C');

        UI.showChatbox(`
            <h3>Investment Opportunities</h3>
            <p>Amber markers show available investment properties.</p>
            <p>Click a property to see financials and projections.</p>
            <p style="font-size: 14px; color: #9ca3af; margin-top: 16px;">
                Route lines show distance to JASM employment center.
            </p>
            <button class="chatbox-continue" onclick="App.complete()">
                Any more questions?
            </button>
        `);

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
        UI.hideLegend();
        UI.hideDataLayers();
        MapManager.resetView();

        setTimeout(() => {
            this.startJourneyA();
        }, 500);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
