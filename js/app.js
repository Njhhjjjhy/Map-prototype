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

        // --- Data layers and legend ---
        UI.showDataLayers(stepIndex);
        UI.updateLegend(stepIndex);

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
    // Per-step chatbox content
    // ================================

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
                body: '',
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

    /**
     * Render the final step chatbox (journey recap + AI chat).
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

    // ================================
    // Per-step panel content
    // ================================

    /**
     * Render the right panel for a step.
     * Some steps auto-show a panel, others wait for sub-item clicks.
     */
    _renderStepPanel(step) {
        switch (step.id) {
            case 'strategic-location':
                UI.showAllAirlineRoutes();
                break;

            case 'corporate-investment':
                UI.showInvestmentOverview();
                break;

            case 'future-outlook':
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
                break;
        }
    },

    // ================================
    // Evidence groups
    // ================================

    /**
     * Show evidence group panel from chatbox link.
     */
    showEvidenceGroupPanel(groupId) {
        const group = UI.findEvidenceGroup(groupId);
        if (group) {
            if (!this.state.evidenceGroupsViewed.includes(groupId)) {
                this.state.evidenceGroupsViewed.push(groupId);
            }

            UI.disclosureState[groupId] = true;
            this.showSingleEvidenceGroup(group);
            MapController.showEvidenceGroupMarkers(group);
            MapController.fitToEvidenceGroup(group);
        }
    },

    /**
     * Show panel with a single evidence group.
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
     * Show evidence library with all groups.
     */
    showEvidenceLibrary() {
        UI.showEvidenceListPanel();
    },

    // ================================
    // Restore and restart
    // ================================

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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
