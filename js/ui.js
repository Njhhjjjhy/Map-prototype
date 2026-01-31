/**
 * UI Components - Panel, Chatbox, Gallery, Controls
 */

const UI = {
    elements: {},
    currentScenario: 'average',
    currentProperty: null,

    /**
     * Initialize UI elements
     */
    init() {
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            startBtn: document.getElementById('start-btn'),
            appContainer: document.getElementById('app-container'),
            controlBar: document.getElementById('control-bar'),
            timeToggle: document.getElementById('time-toggle'),
            presentBtn: document.getElementById('present-btn'),
            futureBtn: document.getElementById('future-btn'),
            chatbox: document.getElementById('chatbox'),
            chatboxContent: document.getElementById('chatbox-content'),
            rightPanel: document.getElementById('right-panel'),
            panelClose: document.getElementById('panel-close'),
            panelContent: document.getElementById('panel-content'),
            galleryModal: document.getElementById('gallery-modal'),
            galleryClose: document.getElementById('gallery-close'),
            galleryOverlay: document.getElementById('gallery-overlay'),
            galleryBody: document.getElementById('gallery-body')
        };

        this.bindEvents();
    },

    /**
     * Bind UI events
     */
    bindEvents() {
        // Start button
        this.elements.startBtn.addEventListener('click', () => {
            App.start();
        });

        // Panel close
        this.elements.panelClose.addEventListener('click', () => {
            this.hidePanel();
        });

        // Gallery close
        this.elements.galleryClose.addEventListener('click', () => {
            this.hideGallery();
        });

        this.elements.galleryOverlay.addEventListener('click', () => {
            this.hideGallery();
        });

        // Keyboard handling for gallery (Escape to close)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.galleryModal.classList.contains('hidden')) {
                this.hideGallery();
            }
        });

        // Keyboard handling for panel (Escape to close)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.rightPanel.classList.contains('hidden')) {
                this.hidePanel();
            }
        });

        // Time toggle buttons
        this.elements.presentBtn.addEventListener('click', () => {
            this.setTimeView('present');
        });

        this.elements.futureBtn.addEventListener('click', () => {
            this.setTimeView('future');
        });
    },

    /**
     * Transition from start screen to app
     */
    showApp() {
        this.elements.startScreen.classList.add('fade-out');
        this.elements.appContainer.classList.remove('hidden');

        setTimeout(() => {
            this.elements.appContainer.classList.add('visible');
        }, 50);

        setTimeout(() => {
            this.elements.startScreen.classList.add('hidden');
        }, 500);
    },

    // ================================
    // CHATBOX
    // ================================

    showChatbox(content) {
        this.elements.chatboxContent.innerHTML = content;
        this.elements.chatbox.classList.remove('hidden');
    },

    hideChatbox() {
        this.elements.chatbox.classList.add('hidden');
    },

    updateChatbox(content) {
        this.elements.chatboxContent.innerHTML = content;
    },

    // ================================
    // RIGHT PANEL
    // ================================

    showPanel(content) {
        this.elements.panelContent.innerHTML = content;
        this.elements.rightPanel.classList.remove('hidden');
    },

    hidePanel() {
        this.elements.rightPanel.classList.add('hidden');
        MapManager.clearRoute();
    },

    /**
     * Show resource panel (Journey A)
     */
    showResourcePanel(resource) {
        const statsHtml = resource.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">${resource.subtitle}</div>
            <h2>${resource.name}</h2>
            <p>${resource.description}</p>
            <div class="stat-grid">${statsHtml}</div>
            <button class="panel-btn primary" onclick="UI.showEvidence('${resource.id}', 'resource')">
                View Evidence
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show Science Park panel (Journey B)
     */
    showScienceParkPanel() {
        const sp = AppData.sciencePark;
        const statsHtml = sp.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">${sp.subtitle}</div>
            <h2>${sp.name}</h2>
            <p>${sp.description}</p>
            <div class="stat-grid">${statsHtml}</div>
            <button class="panel-btn primary" onclick="UI.showEvidence('sciencePark', 'sciencePark')">
                View Master Plan
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show company panel (Journey B)
     */
    showCompanyPanel(company) {
        const statsHtml = company.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">${company.subtitle}</div>
            <h2>${company.name}</h2>
            <p>${company.description}</p>
            <div class="stat-grid">${statsHtml}</div>
            <button class="panel-btn primary" onclick="UI.showEvidence('${company.id}', 'company')">
                View Press Release
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show future zone panel (Journey B - Future view)
     */
    showFutureZonePanel(zone) {
        const statsHtml = zone.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">${zone.subtitle}</div>
            <h2>${zone.name}</h2>
            <p>${zone.description}</p>
            <div class="stat-grid">${statsHtml}</div>
            <button class="panel-btn primary" onclick="UI.showEvidence('${zone.id}', 'zone')">
                View Development Plan
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show property panel (Journey C)
     */
    showPropertyPanel(property) {
        this.currentProperty = property;
        const statsHtml = property.basicStats.map(stat => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">${property.subtitle}</div>
            <h2>${property.name}</h2>
            <p style="color: #9ca3af; margin-bottom: 8px;">${property.address}</p>
            <p>${property.description}</p>
            <div class="stat-grid">${statsHtml}</div>
            <button class="panel-btn" onclick="UI.showTruthEngine()">
                Truth Engine
            </button>
            <button class="panel-btn" onclick="UI.showPerformanceCalculator()">
                Performance Calculator
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show Truth Engine (Journey C - growth drivers)
     */
    showTruthEngine() {
        const property = this.currentProperty;
        if (!property) return;

        const driversHtml = property.truthEngine.map(driver => `
            <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                <h4 style="font-size: 16px; margin-bottom: 8px;">${driver.title}</h4>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${driver.description}</p>
                <div style="font-size: 14px; font-weight: 600; color: #22c55e;">${driver.impact}</div>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">Growth Drivers</div>
            <h2>Truth Engine</h2>
            <p>Key factors driving future value appreciation for this property:</p>
            ${driversHtml}
            <button class="panel-btn" onclick="UI.showPropertyPanel(UI.currentProperty)">
                Back to Property
            </button>
            <button class="panel-btn primary" onclick="UI.showPerformanceCalculator()">
                Performance Calculator
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show Performance Calculator (Journey C - financials)
     */
    showPerformanceCalculator() {
        const property = this.currentProperty;
        if (!property) return;

        this.updateCalculator(property);
    },

    /**
     * Update calculator with scenario
     */
    updateCalculator(property, scenario = 'average') {
        this.currentScenario = scenario;
        const fin = property.financials;
        const data = fin.scenarios[scenario];

        const formatYen = (num) => '¥' + num.toLocaleString();
        const formatPercent = (num) => (num * 100).toFixed(1) + '%';

        const content = `
            <div class="subtitle">Financial Projection</div>
            <h2>Performance Calculator</h2>

            <div class="calculator-section">
                <h4>Scenario</h4>
                <div class="scenario-toggle">
                    <button class="scenario-btn ${scenario === 'bear' ? 'active' : ''}" onclick="UI.updateCalculator(UI.currentProperty, 'bear')">
                        Bear
                    </button>
                    <button class="scenario-btn ${scenario === 'average' ? 'active' : ''}" onclick="UI.updateCalculator(UI.currentProperty, 'average')">
                        Average
                    </button>
                    <button class="scenario-btn ${scenario === 'bull' ? 'active' : ''}" onclick="UI.updateCalculator(UI.currentProperty, 'bull')">
                        Bull
                    </button>
                </div>

                <div class="calc-row">
                    <span class="calc-label">Acquisition Cost</span>
                    <span class="calc-value">${formatYen(fin.acquisitionCost)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Appreciation Rate</span>
                    <span class="calc-value">${formatPercent(data.appreciation)}/yr</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Est. Selling Price (5yr)</span>
                    <span class="calc-value">${formatYen(data.sellingPrice)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Rental Yield</span>
                    <span class="calc-value">${formatPercent(data.rentalYield)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Annual Rental Income</span>
                    <span class="calc-value">${formatYen(data.annualRent)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Applicable Taxes</span>
                    <span class="calc-value negative">${formatYen(data.taxes)}</span>
                </div>
                <div class="calc-row total">
                    <span class="calc-label">Net Profit (5yr)</span>
                    <span class="calc-value positive">${formatYen(data.netProfit)}</span>
                </div>
            </div>

            <button class="panel-btn" onclick="UI.showEvidence('${property.id}', 'rental')">
                View Rental Report
            </button>
            <button class="panel-btn" onclick="UI.showAreaStats()">
                Area Statistics
            </button>
            <button class="panel-btn" onclick="UI.showPropertyPanel(UI.currentProperty)">
                Back to Property
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show area statistics (Journey C conclusion)
     */
    showAreaStats() {
        const stats = AppData.areaStats;
        const trackHtml = stats.trackRecord.map(record => `
            <div class="calc-row">
                <span class="calc-label">${record.year}</span>
                <span class="calc-value positive">${record.appreciation}</span>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">Market Overview</div>
            <h2>Area Statistics</h2>

            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.avgAppreciation}</div>
                    <div class="stat-label">Avg. Annual Appreciation</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.avgRentalYield}</div>
                    <div class="stat-label">Avg. Rental Yield</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.occupancyRate}</div>
                    <div class="stat-label">Occupancy Rate</div>
                </div>
            </div>

            <div class="calculator-section">
                <h4>Historical Performance</h4>
                ${trackHtml}
            </div>

            <button class="panel-btn" onclick="UI.showPerformanceCalculator()">
                Back to Calculator
            </button>
        `;

        this.showPanel(content);
    },

    // ================================
    // GALLERY
    // ================================

    showGallery(title, type, description) {
        const icons = {
            pdf: '📄',
            image: '🖼️',
            web: '🌐'
        };

        const content = `
            <div class="placeholder-doc">
                <div class="icon">${icons[type] || '📄'}</div>
                <h3>${title}</h3>
                <p>${description}</p>
                <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
                    [Placeholder - actual document would appear here]
                </p>
            </div>
        `;

        this.elements.galleryBody.innerHTML = content;
        this.elements.galleryModal.classList.remove('hidden');

        // Focus management for accessibility
        this.lastFocusedElement = document.activeElement;
        this.elements.galleryClose.focus();
    },

    hideGallery() {
        this.elements.galleryModal.classList.add('hidden');

        // Return focus to trigger element
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }
    },

    /**
     * Show evidence based on type
     */
    showEvidence(id, type) {
        let evidence;

        if (type === 'resource') {
            evidence = AppData.resources[id]?.evidence;
        } else if (type === 'sciencePark') {
            evidence = AppData.sciencePark.evidence;
        } else if (type === 'company') {
            const company = AppData.companies.find(c => c.id === id);
            evidence = company?.evidence;
        } else if (type === 'zone') {
            const zone = AppData.futureZones.find(z => z.id === id);
            evidence = zone?.evidence;
        } else if (type === 'rental') {
            const property = AppData.properties.find(p => p.id === id);
            evidence = property?.rentalReport;
        }

        if (evidence) {
            this.showGallery(evidence.title, evidence.type, evidence.description);
        }
    },

    // ================================
    // CONTROL BAR
    // ================================

    showControlBar() {
        this.elements.controlBar.classList.remove('hidden');
    },

    hideControlBar() {
        this.elements.controlBar.classList.add('hidden');
    },

    showTimeToggle() {
        this.elements.timeToggle.classList.remove('hidden');
    },

    hideTimeToggle() {
        this.elements.timeToggle.classList.add('hidden');
    },

    setTimeView(view) {
        if (view === 'future') {
            this.elements.presentBtn.classList.remove('active');
            this.elements.presentBtn.setAttribute('aria-pressed', 'false');
            this.elements.futureBtn.classList.add('active');
            this.elements.futureBtn.setAttribute('aria-pressed', 'true');
            MapManager.showFutureZones();
            this.updateLegendForJourneyB(true);
        } else {
            this.elements.futureBtn.classList.remove('active');
            this.elements.futureBtn.setAttribute('aria-pressed', 'false');
            this.elements.presentBtn.classList.add('active');
            this.elements.presentBtn.setAttribute('aria-pressed', 'true');
            MapManager.hideFutureZones();
            this.updateLegendForJourneyB(false);
        }
    },

    // ================================
    // MAP LEGEND
    // ================================

    showLegend(journey) {
        const legendItems = document.getElementById('legend-items');
        let html = '';

        if (journey === 'A') {
            html = `
                <div class="legend-item">
                    <div class="legend-marker" style="background: #7c3aed;"></div>
                    <span class="legend-label">Natural Resources</span>
                </div>
            `;
        } else if (journey === 'B') {
            html = this.getLegendForJourneyB(false);
        } else if (journey === 'C') {
            html = `
                <div class="legend-item">
                    <div class="legend-marker" style="background: #d97706;"></div>
                    <span class="legend-label">Investment Properties</span>
                </div>
                <div class="legend-item">
                    <div class="legend-marker" style="background: #2563eb;"></div>
                    <span class="legend-label">Corporate Facilities</span>
                </div>
                <div class="legend-divider"></div>
                <div class="legend-item">
                    <div class="legend-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke-dasharray="3 3"/>
                        </svg>
                    </div>
                    <span class="legend-label">Route to JASM</span>
                </div>
            `;
        }

        legendItems.innerHTML = html;
        document.getElementById('map-legend').classList.remove('hidden');
    },

    getLegendForJourneyB(showFuture) {
        let html = `
            <div class="legend-item">
                <div class="legend-marker" style="background: #ef4444; border-radius: 50%; border: 2px dashed #ef4444;"></div>
                <span class="legend-label">Science Park Corridor</span>
            </div>
            <div class="legend-item">
                <div class="legend-marker" style="background: #2563eb;"></div>
                <span class="legend-label">Corporate Investment</span>
            </div>
        `;

        if (showFuture) {
            html += `
                <div class="legend-divider"></div>
                <div class="legend-item">
                    <div class="legend-marker" style="background: #8b5cf6; opacity: 0.6;"></div>
                    <span class="legend-label">Future Development Zone</span>
                </div>
                <div class="legend-item">
                    <div class="legend-marker" style="background: #0d9488;"></div>
                    <span class="legend-label">Planned Expansion</span>
                </div>
            `;
        }

        return html;
    },

    updateLegendForJourneyB(showFuture) {
        const legendItems = document.getElementById('legend-items');
        legendItems.innerHTML = this.getLegendForJourneyB(showFuture);
    },

    hideLegend() {
        document.getElementById('map-legend').classList.add('hidden');
    },

    // ================================
    // DATA LAYERS PANEL
    // ================================

    showDataLayers(journey) {
        const layerItems = document.getElementById('layer-items');
        let html = '';

        if (journey === 'B') {
            html = `
                <div class="layer-item active" data-layer="sciencePark" onclick="UI.toggleLayer('sciencePark')">
                    <div class="layer-radio"></div>
                    <div class="layer-icon">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <span class="layer-label">Science Park</span>
                </div>
                <div class="layer-item active" data-layer="companies" onclick="UI.toggleLayer('companies')">
                    <div class="layer-radio"></div>
                    <div class="layer-icon">
                        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </div>
                    <span class="layer-label">Corporate Sites</span>
                </div>
            `;
        } else if (journey === 'C') {
            html = `
                <div class="layer-item active" data-layer="properties" onclick="UI.toggleLayer('properties')">
                    <div class="layer-radio"></div>
                    <div class="layer-icon">
                        <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    </div>
                    <span class="layer-label">Properties</span>
                </div>
                <div class="layer-item active" data-layer="companies" onclick="UI.toggleLayer('companies')">
                    <div class="layer-radio"></div>
                    <div class="layer-icon">
                        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </div>
                    <span class="layer-label">Corporate Sites</span>
                </div>
                <div class="layer-item active" data-layer="sciencePark" onclick="UI.toggleLayer('sciencePark')">
                    <div class="layer-radio"></div>
                    <div class="layer-icon">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
                    </div>
                    <span class="layer-label">Science Park</span>
                </div>
            `;
        }

        layerItems.innerHTML = html;
        document.getElementById('data-layers').classList.remove('hidden');
    },

    hideDataLayers() {
        document.getElementById('data-layers').classList.add('hidden');
    },

    toggleLayer(layerName) {
        const layerItem = document.querySelector(`[data-layer="${layerName}"]`);
        const isActive = layerItem.classList.contains('active');

        if (isActive) {
            layerItem.classList.remove('active');
            MapManager.hideLayer(layerName);
        } else {
            layerItem.classList.add('active');
            MapManager.showLayer(layerName);
        }
    },

    // ================================
    // AI CHAT (Post-Journey)
    // ================================

    initAIChat() {
        const form = document.getElementById('ai-chat-form');
        const input = document.getElementById('ai-chat-input');
        const suggestions = document.getElementById('ai-chat-suggestions');

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = input.value.trim();
            if (message) {
                this.sendAIMessage(message);
                input.value = '';
            }
        });

        // Handle suggestion chip clicks
        suggestions.addEventListener('click', (e) => {
            const chip = e.target.closest('.ai-chat-chip');
            if (chip) {
                const question = chip.dataset.question;
                this.sendAIMessage(question);
            }
        });
    },

    showAIChat() {
        // Hide the journey chatbox
        this.hideChatbox();

        // Show AI chat
        const aiChat = document.getElementById('ai-chat');
        aiChat.classList.remove('hidden');

        // Initialize if not already done
        if (!this.aiChatInitialized) {
            this.initAIChat();
            this.aiChatInitialized = true;
        }

        // Focus the input
        setTimeout(() => {
            document.getElementById('ai-chat-input').focus();
        }, 400);
    },

    hideAIChat() {
        document.getElementById('ai-chat').classList.add('hidden');
    },

    sendAIMessage(message) {
        const suggestionsContainer = document.getElementById('ai-chat-suggestions');

        // Hide suggestions after first message
        suggestionsContainer.classList.add('hidden');

        // Add user message
        this.addChatMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        // Generate response after delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateAIResponse(message);
            this.addChatMessage(response, 'assistant');
        }, 1200 + Math.random() * 800);
    },

    addChatMessage(content, role) {
        const messagesContainer = document.getElementById('ai-chat-messages');

        const messageEl = document.createElement('div');
        messageEl.className = `ai-chat-message ${role}`;
        messageEl.innerHTML = `<div class="message-content">${content}</div>`;

        messagesContainer.appendChild(messageEl);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    showTypingIndicator() {
        const messagesContainer = document.getElementById('ai-chat-messages');

        const typingEl = document.createElement('div');
        typingEl.className = 'ai-chat-typing';
        typingEl.id = 'ai-typing-indicator';
        typingEl.innerHTML = '<span></span><span></span><span></span>';

        messagesContainer.appendChild(typingEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    hideTypingIndicator() {
        const typing = document.getElementById('ai-typing-indicator');
        if (typing) {
            typing.remove();
        }
    },

    generateAIResponse(question) {
        const q = question.toLowerCase();

        // Semiconductor industry questions
        if (q.includes('semiconductor') || q.includes('reshaping') || q.includes('chip')) {
            return "Japan is revitalizing its semiconductor industry as part of national economic security strategy. After decades of decline, the government committed ¥3.9 trillion to rebuild domestic chip production. TSMC's Kumamoto fab represents the centerpiece—bringing cutting-edge manufacturing back to Japan while reducing reliance on overseas supply chains.";
        }

        // Kumamoto as hub
        if (q.includes('kumamoto') && (q.includes('chosen') || q.includes('hub') || q.includes('why'))) {
            return "Kumamoto was selected for three key reasons: <strong>1)</strong> Abundant ultra-pure water from the Aso volcanic aquifer—essential for chip fabrication. <strong>2)</strong> Reliable power infrastructure with low natural disaster risk. <strong>3)</strong> An existing semiconductor ecosystem including Sony's image sensor facility and skilled workforce.";
        }

        // TSMC / JASM
        if (q.includes('tsmc') || q.includes('jasm')) {
            return "JASM (Japan Advanced Semiconductor Manufacturing) is TSMC's joint venture with Sony and Denso. The first fab began mass production in 2024 with 22/28nm processes. A second fab for 6nm chips is under construction, with ¥2 trillion combined investment expected to create 3,400+ jobs.";
        }

        // Land prices
        if (q.includes('land') || q.includes('price') || q.includes('property')) {
            return "Land prices in the Kumamoto Science Park corridor have appreciated 15-25% annually since TSMC's announcement. Kikuyo and Ozu areas see the strongest growth due to proximity to JASM. Residential land near the fab has roughly doubled since 2021, though prices remain 40-60% below Tokyo suburban equivalents.";
        }

        // Traffic
        if (q.includes('traffic') || q.includes('commute') || q.includes('transport')) {
            return "Traffic congestion has increased significantly with JASM construction. Kumamoto Prefecture is investing ¥50 billion in infrastructure upgrades including new expressway connections and public transit improvements. The planned Kumamoto Airport rail link will reduce commute times when completed.";
        }

        // Investment / returns
        if (q.includes('invest') || q.includes('return') || q.includes('profit') || q.includes('yield')) {
            return "Investment properties in the corridor typically show 4-6% gross rental yields with projected appreciation of 8-15% annually through 2030. Properties within 15 minutes of JASM command premium rents from engineers and technicians. The best opportunities balance current yield with appreciation potential.";
        }

        // Default response
        return "That's a great question about the Kumamoto semiconductor corridor. The region is experiencing unprecedented transformation with over ¥4 trillion in committed investment. Would you like to know more about specific topics like land prices, infrastructure plans, or investment opportunities?";
    }
};
