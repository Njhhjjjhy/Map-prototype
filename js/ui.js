/**
 * UI Components - Panel, Chatbox, Gallery, Controls
 */

const UI = {
    elements: {},
    currentScenario: 'average',
    currentProperty: null,
    charts: {}, // Track Chart.js instances to prevent memory leaks

    // Disclosure group state
    disclosureState: {}, // Track which groups are expanded: { 'energy-infrastructure': true }
    currentEvidenceGroup: null, // Current group being viewed
    currentEvidenceItem: null, // Current sub-item in detail view

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
            chatboxTitle: document.getElementById('chatbox-title'),
            chatboxContent: document.getElementById('chatbox-content'),
            chatboxClose: document.getElementById('chatbox-close'),
            rightPanel: document.getElementById('right-panel'),
            panelClose: document.getElementById('panel-close'),
            panelContent: document.getElementById('panel-content'),
            galleryModal: document.getElementById('gallery-modal'),
            galleryClose: document.getElementById('gallery-close'),
            galleryOverlay: document.getElementById('gallery-overlay'),
            galleryBody: document.getElementById('gallery-body'),
            layersToggle: document.getElementById('layers-toggle'),
            dataLayers: document.getElementById('data-layers'),
            aiChat: document.getElementById('ai-chat'),
            aiChatClose: document.getElementById('ai-chat-close'),
            chatFab: document.getElementById('chat-fab'),
            panelToggle: document.getElementById('panel-toggle')
        };

        this.layersPanelOpen = false;
        this.panelOpen = false;
        this.lastChatType = 'chatbox'; // Track which chat was last shown
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

        // Chatbox close
        this.elements.chatboxClose.addEventListener('click', () => {
            this.hideChatbox();
        });

        // AI Chat close
        this.elements.aiChatClose.addEventListener('click', () => {
            this.hideAIChat();
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

        // Keyboard handling for property image Quick Look (Escape to close)
        document.addEventListener('keydown', (e) => {
            const quickLook = document.getElementById('property-quick-look');
            if (e.key === 'Escape' && quickLook && !quickLook.classList.contains('hidden')) {
                this.hidePropertyImageQuickLook();
            }
        });

        // Time toggle buttons
        this.elements.presentBtn.addEventListener('click', () => {
            this.setTimeView('present');
        });

        this.elements.futureBtn.addEventListener('click', () => {
            this.setTimeView('future');
        });

        // Layers toggle button
        this.elements.layersToggle.addEventListener('click', () => {
            this.toggleLayersPanel();
        });

        // Chat FAB - reopen chatbox or AI chat
        this.elements.chatFab.addEventListener('click', () => {
            this.reopenChat();
        });

        // Panel toggle button
        this.elements.panelToggle.addEventListener('click', () => {
            this.togglePanel();
        });
    },

    /**
     * Reopen the last closed chat (chatbox or AI chat)
     */
    reopenChat() {
        this.hideChatFab();

        if (this.lastChatType === 'aiChat') {
            this.showAIChat();
        } else {
            // Restore appropriate chatbox content based on current journey state
            if (typeof App !== 'undefined' && App.state) {
                App.restoreChatbox();
            } else {
                this.elements.chatbox.classList.remove('hidden');
            }
        }
    },

    /**
     * Show the chat FAB button
     */
    showChatFab() {
        this.elements.chatFab.classList.remove('hidden');
    },

    /**
     * Hide the chat FAB button
     */
    hideChatFab() {
        this.elements.chatFab.classList.add('hidden');
    },

    // ================================
    // CHART RENDERING (Dataviz)
    // ================================

    /**
     * Destroy existing chart to prevent memory leaks
     */
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    },

    /**
     * Generate accessible data table HTML for chart data
     */
    generateDataTable(headers, rows, caption) {
        const headerHtml = headers.map(h => `<th scope="col">${h}</th>`).join('');
        const rowsHtml = rows.map(row => {
            const cells = row.map((cell, i) =>
                i === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`
            ).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        return `
            <details class="chart-data-table">
                <summary>View data as table</summary>
                <table>
                    <caption class="sr-only">${caption}</caption>
                    <thead><tr>${headerHtml}</tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </details>
        `;
    },

    /**
     * Render scenario comparison bar chart
     */
    renderScenarioChart(property) {
        const canvas = document.getElementById('scenario-chart');
        if (!canvas) return;

        this.destroyChart('scenario');
        const ctx = canvas.getContext('2d');
        const fin = property.financials;

        // Colorblind-safe palette
        const colors = {
            bear: '#6b7280',    // Gray
            average: '#2563eb', // Blue
            bull: '#0d9488'     // Teal
        };

        this.charts['scenario'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Bear', 'Average', 'Bull'],
                datasets: [{
                    label: 'Net Profit (5yr)',
                    data: [
                        fin.scenarios.bear.netProfit,
                        fin.scenarios.average.netProfit,
                        fin.scenarios.bull.netProfit
                    ],
                    backgroundColor: [colors.bear, colors.average, colors.bull],
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => '¥' + ctx.raw.toLocaleString()
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            callback: (val) => '¥' + (val / 1000000).toFixed(0) + 'M'
                        },
                        grid: { display: false }
                    },
                    y: {
                        grid: { display: false }
                    }
                }
            }
        });

        // Add accessible data table
        const tableContainer = document.getElementById('scenario-chart-table');
        if (tableContainer) {
            const formatYen = (num) => '¥' + num.toLocaleString();
            tableContainer.innerHTML = this.generateDataTable(
                ['Scenario', 'Net Profit (5yr)'],
                [
                    ['Bear', formatYen(fin.scenarios.bear.netProfit)],
                    ['Average', formatYen(fin.scenarios.average.netProfit)],
                    ['Bull', formatYen(fin.scenarios.bull.netProfit)]
                ],
                'Scenario comparison showing projected net profit over 5 years for bear, average, and bull market conditions'
            );
        }
    },

    /**
     * Render historical appreciation trend line chart
     */
    renderTrendChart() {
        const canvas = document.getElementById('trend-chart');
        if (!canvas) return;

        this.destroyChart('trend');
        const ctx = canvas.getContext('2d');
        const stats = AppData.areaStats;

        const years = stats.trackRecord.map(r => r.year);
        const values = stats.trackRecord.map(r => parseFloat(r.appreciation.replace('+', '')));

        this.charts['trend'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Annual Appreciation',
                    data: values,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 6,
                    pointBackgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ctx.raw + '% appreciation'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (val) => val + '%'
                        },
                        grid: { color: '#f3f4f6' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });

        // Add accessible data table
        const tableContainer = document.getElementById('trend-chart-table');
        if (tableContainer) {
            tableContainer.innerHTML = this.generateDataTable(
                ['Year', 'Appreciation'],
                stats.trackRecord.map(r => [r.year, r.appreciation]),
                'Historical property appreciation rates in the Kumamoto semiconductor corridor'
            );
        }
    },

    /**
     * Render company investment comparison horizontal bar chart
     */
    renderInvestmentChart() {
        const canvas = document.getElementById('investment-chart');
        if (!canvas) return;

        this.destroyChart('investment');
        const ctx = canvas.getContext('2d');

        // Sort companies by investment amount (descending)
        const companies = [...AppData.companies].sort((a, b) => {
            const getAmount = (stats) => {
                const inv = stats.find(s => s.label.includes('investment') || s.label.includes('Investment'));
                if (!inv) return 0;
                const val = inv.value.replace('¥', '').replace('T', '000').replace('B', '');
                return parseFloat(val);
            };
            return getAmount(b.stats) - getAmount(a.stats);
        });

        const labels = companies.map(c => c.name.split(' ')[0]); // Short names
        const investments = companies.map(c => {
            const inv = c.stats.find(s => s.label.includes('investment') || s.label.includes('Investment'));
            if (!inv) return 0;
            const val = inv.value.replace('¥', '');
            if (val.includes('T')) return parseFloat(val) * 1000;
            return parseFloat(val.replace('B', ''));
        });

        // Colorblind-safe palette
        const colors = ['#2563eb', '#ea580c', '#0d9488', '#c026d3'];

        this.charts['investment'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Investment (¥B)',
                    data: investments,
                    backgroundColor: colors,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const val = ctx.raw;
                                return val >= 1000 ? '¥' + (val/1000).toFixed(1) + 'T' : '¥' + val + 'B';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            callback: (val) => val >= 1000 ? '¥' + (val/1000) + 'T' : '¥' + val + 'B'
                        },
                        grid: { display: false }
                    },
                    y: {
                        grid: { display: false }
                    }
                }
            }
        });

        // Add accessible data table
        const tableContainer = document.getElementById('investment-chart-table');
        if (tableContainer) {
            const formatInvestment = (val) => val >= 1000 ? '¥' + (val/1000).toFixed(1) + 'T' : '¥' + val + 'B';
            tableContainer.innerHTML = this.generateDataTable(
                ['Company', 'Investment'],
                labels.map((label, i) => [label, formatInvestment(investments[i])]),
                'Corporate investment comparison in the Kumamoto semiconductor corridor'
            );
        }
    },

    /**
     * Show investment overview with company comparison chart
     */
    showInvestmentOverview() {
        // Simulated last update time
        const lastUpdated = new Date(Date.now() - 6 * 60 * 60 * 1000); // 6 hours ago
        const relativeTime = this.formatRelativeTime(lastUpdated);

        const content = `
            <div class="subtitle">Corporate Investment</div>
            <h2>Investment Comparison</h2>
            <p>Total corporate investment in the Kumamoto semiconductor corridor.</p>
            <div class="chart-container" style="height: 200px; margin: 24px 0;">
                <canvas id="investment-chart" role="img" aria-label="Bar chart comparing corporate investments: JASM leads with ¥1.2T, followed by Sony ¥850B, Tokyo Electron ¥320B, Mitsubishi ¥260B"></canvas>
            </div>
            <div id="investment-chart-table"></div>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">¥2.6T+</div>
                    <div class="stat-label">Total Investment</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">9,600+</div>
                    <div class="stat-label">Direct Jobs</div>
                </div>
            </div>
            <div class="data-attribution">
                <p class="data-timestamp">Last updated: ${relativeTime}</p>
                <p>Investment data from official company announcements</p>
            </div>
            <button class="panel-btn" onclick="UI.showScienceParkPanel(AppData.sciencePark)">
                Back to Science Park
            </button>
        `;

        this.showPanel(content);

        // Render chart after DOM update
        setTimeout(() => this.renderInvestmentChart(), 50);
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
        this._setChatboxContent(content);
        this.elements.chatbox.classList.remove('hidden');
        this.hideChatFab();
    },

    hideChatbox() {
        this.elements.chatbox.classList.add('hidden');
        this.lastChatType = 'chatbox';
        this.showChatFab();
    },

    updateChatbox(content) {
        this._setChatboxContent(content);
    },

    // Helper to extract h3 title and set content separately
    _setChatboxContent(content) {
        // Parse content to extract h3 title
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const h3 = tempDiv.querySelector('h3');

        if (h3) {
            this.elements.chatboxTitle.textContent = h3.textContent;
            h3.remove();
            this.elements.chatboxContent.innerHTML = tempDiv.innerHTML;
        } else {
            this.elements.chatboxTitle.textContent = '';
            this.elements.chatboxContent.innerHTML = content;
        }
    },

    // ================================
    // RIGHT PANEL
    // ================================

    showPanel(content) {
        this.elements.panelContent.innerHTML = content;
        this.elements.rightPanel.classList.remove('hidden');
        this.elements.rightPanel.classList.add('visible');
        this.panelOpen = true;
        // Show panel toggle button (will be visible/active when panel is open)
        this.showPanelToggle();
        this.updatePanelToggleState();
    },

    hidePanel() {
        this.elements.rightPanel.classList.remove('visible');
        this.panelOpen = false;
        this.updatePanelToggleState();
        MapManager.clearRoute();
    },

    /**
     * Toggle the right panel open/closed
     */
    togglePanel() {
        if (this.panelOpen) {
            this.hidePanel();
        } else {
            // If there's existing content, just show the panel
            // Otherwise, this is a no-op (panel needs content to show)
            if (this.elements.panelContent.innerHTML.trim()) {
                this.elements.rightPanel.classList.remove('hidden');
                this.elements.rightPanel.classList.add('visible');
                this.panelOpen = true;
                this.updatePanelToggleState();
            }
        }
    },

    /**
     * Update the panel toggle button state
     */
    updatePanelToggleState() {
        if (this.panelOpen) {
            this.elements.panelToggle.classList.add('active');
            this.elements.panelToggle.setAttribute('aria-expanded', 'true');
        } else {
            this.elements.panelToggle.classList.remove('active');
            this.elements.panelToggle.setAttribute('aria-expanded', 'false');
        }
    },

    /**
     * Show the panel toggle button
     */
    showPanelToggle() {
        this.elements.panelToggle.classList.remove('hidden');
    },

    /**
     * Hide the panel toggle button
     */
    hidePanelToggle() {
        this.elements.panelToggle.classList.add('hidden');
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
            <button class="panel-btn" onclick="UI.showInvestmentOverview()">
                Corporate Investment Chart
            </button>
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
     * Show infrastructure road panel (Journey B - Infrastructure Roads)
     */
    showRoadPanel(road) {
        const content = `
            <div class="subtitle">Infrastructure Plan</div>
            <h2>${road.name}</h2>

            <div class="stat-grid" style="grid-template-columns: 1fr;">
                <div class="stat-item" style="text-align: center;">
                    <div class="stat-value" style="font-size: var(--text-4xl); color: var(--color-success);">${road.commuteImpact}</div>
                    <div class="stat-label">Commute Saved</div>
                </div>
            </div>

            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">${road.driveToJasm}</div>
                    <div class="stat-label">Drive to JASM</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${road.status}</div>
                    <div class="stat-label">Status</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${road.completionDate}</div>
                    <div class="stat-label">Completion</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${road.budget}</div>
                    <div class="stat-label">Budget</div>
                </div>
            </div>

            <p>${road.description}</p>

            <button class="panel-btn primary" onclick="UI.showGallery('${road.name} - Infrastructure Plan', 'pdf', '${road.description.replace(/'/g, "\\'")}')">
                View Source Document
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show property panel (Journey C)
     * Inspector pattern: Image at top → Property details → Financials
     */
    showPropertyPanel(property) {
        this.currentProperty = property;

        // Property details section (type, location, zone, JASM distance)
        const detailsHtml = `
            <div class="property-details">
                <div class="property-detail-row">
                    <span class="property-detail-label">Type</span>
                    <span class="property-detail-value">${property.type || property.subtitle}</span>
                </div>
                <div class="property-detail-row">
                    <span class="property-detail-label">Location</span>
                    <span class="property-detail-value">${property.address}</span>
                </div>
                <div class="property-detail-row">
                    <span class="property-detail-label">Zone</span>
                    <span class="property-detail-value">${property.zone || 'Science Park Corridor'}</span>
                </div>
                <div class="property-detail-row">
                    <span class="property-detail-label">Distance to JASM</span>
                    <span class="property-detail-value">${property.distanceToJasm} (${property.driveTime} drive)</span>
                </div>
            </div>
        `;

        const content = `
            <div class="property-image-container" onclick="UI.showPropertyImageQuickLook('${property.image}', '${property.name.replace(/'/g, "\\'")}')">
                <img src="${property.image}" alt="${property.name}" class="property-image" loading="lazy">
                <div class="property-image-expand" aria-label="Expand image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                </div>
            </div>
            <div class="subtitle">${property.subtitle}</div>
            <h2>${property.name}</h2>
            ${detailsHtml}
            <p>${property.description}</p>
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
     * Get confidence level and range for estimated values
     */
    getConfidenceInfo(scenario) {
        const confidenceLevels = {
            bear: { level: 'High', variance: 0.05 },
            average: { level: 'Medium', variance: 0.10 },
            bull: { level: 'Low', variance: 0.15 }
        };
        return confidenceLevels[scenario] || confidenceLevels.average;
    },

    /**
     * Format value with confidence range
     */
    formatWithConfidence(value, scenario, isYen = true) {
        const confidence = this.getConfidenceInfo(scenario);
        const variance = value * confidence.variance;
        const low = Math.round(value - variance);
        const high = Math.round(value + variance);

        const formatVal = (v) => {
            if (!isYen) return v.toLocaleString();
            if (v >= 1000000) return '¥' + (v / 1000000).toFixed(1) + 'M';
            return '¥' + v.toLocaleString();
        };

        return {
            display: isYen ? '¥' + value.toLocaleString() : value.toLocaleString(),
            range: `${formatVal(low)} - ${formatVal(high)}`,
            confidence: confidence.level
        };
    },

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return 'Just now';
    },

    /**
     * Update calculator with scenario
     */
    updateCalculator(property, scenario = 'average') {
        this.currentScenario = scenario;
        const fin = property.financials;
        const data = fin.scenarios[scenario];

        const formatYen = (num) => '¥' + num.toLocaleString();
        const formatYenSigned = (num) => (num >= 0 ? '+' : '') + '¥' + num.toLocaleString();
        const formatPercent = (num) => (num >= 0 ? '+' : '') + (num * 100).toFixed(1) + '%';

        // Get confidence info for estimated values
        const sellingPriceInfo = this.formatWithConfidence(data.sellingPrice, scenario);
        const netProfitInfo = this.formatWithConfidence(data.netProfit, scenario);
        const confidence = this.getConfidenceInfo(scenario);

        // Simulated last update time (in real app, this would come from data)
        const lastUpdated = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
        const relativeTime = this.formatRelativeTime(lastUpdated);

        const content = `
            <div class="subtitle">Financial Projection</div>
            <h2>Performance Calculator</h2>

            <div class="calculator-section">
                <h4>Scenario Comparison</h4>
                <div class="chart-container" style="height: 120px; margin-bottom: 16px;">
                    <canvas id="scenario-chart" role="img" aria-label="Bar chart comparing investment scenarios: Bear case ${formatYen(fin.scenarios.bear.netProfit)}, Average case ${formatYen(fin.scenarios.average.netProfit)}, Bull case ${formatYen(fin.scenarios.bull.netProfit)}"></canvas>
                </div>
                <div id="scenario-chart-table"></div>

                <h4>Details: <span class="scenario-label">${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Case</span></h4>
                <div class="scenario-toggle">
                    <button class="scenario-btn ${scenario === 'bear' ? 'active' : ''}" onclick="UI.updateCalculator(UI.currentProperty, 'bear')">
                        <span class="scenario-icon" aria-hidden="true">▼</span> Bear
                    </button>
                    <button class="scenario-btn ${scenario === 'average' ? 'active' : ''}" onclick="UI.updateCalculator(UI.currentProperty, 'average')">
                        <span class="scenario-icon" aria-hidden="true">—</span> Average
                    </button>
                    <button class="scenario-btn ${scenario === 'bull' ? 'active' : ''}" onclick="UI.updateCalculator(UI.currentProperty, 'bull')">
                        <span class="scenario-icon" aria-hidden="true">▲</span> Bull
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
                    <div class="calc-value-with-confidence">
                        <span class="calc-value">${sellingPriceInfo.display}</span>
                        <span class="confidence-range" title="${confidence.level} confidence">
                            Range: ${sellingPriceInfo.range}
                            <span class="confidence-badge confidence-${confidence.level.toLowerCase()}">${confidence.level}</span>
                        </span>
                    </div>
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
                    <div class="calc-value-with-confidence">
                        <span class="calc-value positive">${formatYenSigned(data.netProfit)}</span>
                        <span class="confidence-range" title="${confidence.level} confidence">
                            Range: ${netProfitInfo.range}
                            <span class="confidence-badge confidence-${confidence.level.toLowerCase()}">${confidence.level}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div class="data-attribution">
                <p class="data-timestamp">Last updated: ${relativeTime}</p>
                <p>Price data from Kumamoto Land Registry (Jan 2026)</p>
                <p>Rental estimates based on local property managers</p>
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

        // Render chart after DOM update
        setTimeout(() => this.renderScenarioChart(property), 50);
    },

    /**
     * Show area statistics (Journey C conclusion)
     */
    showAreaStats() {
        const stats = AppData.areaStats;

        // Simulated last update time
        const lastUpdated = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4 hours ago
        const relativeTime = this.formatRelativeTime(lastUpdated);

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
                <h4>Appreciation Trend</h4>
                <div class="chart-container" style="height: 160px; margin: 16px 0;">
                    <canvas id="trend-chart" role="img" aria-label="Line chart showing appreciation trend: 2022 at 6.2%, 2023 at 9.1%, 2024 at 11.3% - showing accelerating growth"></canvas>
                </div>
                <div id="trend-chart-table"></div>
                <p class="chart-caption">Year-over-year property appreciation in the Kumamoto semiconductor corridor.</p>
            </div>

            <div class="data-attribution">
                <p class="data-timestamp">Last updated: ${relativeTime}</p>
                <p>Data from Kumamoto Prefecture Real Estate Association</p>
            </div>

            <button class="panel-btn" onclick="UI.showPerformanceCalculator()">
                Back to Calculator
            </button>
        `;

        this.showPanel(content);

        // Render chart after DOM update
        setTimeout(() => this.renderTrendChart(), 50);
    },

    // ================================
    // GALLERY
    // ================================

    showGallery(title, type, description) {
        // Icons with proper ARIA roles for screen readers
        const icons = {
            pdf: '<span role="img" aria-label="Document">📄</span>',
            image: '<span role="img" aria-label="Image">🖼️</span>',
            web: '<span role="img" aria-label="Web link">🌐</span>'
        };

        const content = `
            <div class="placeholder-doc">
                <div class="icon">${icons[type] || icons.pdf}</div>
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

        // Set up focus trap
        this.setupFocusTrap(this.elements.galleryModal);
    },

    hideGallery() {
        this.elements.galleryModal.classList.add('hidden');

        // Remove focus trap
        this.removeFocusTrap();

        // Return focus to trigger element
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }
    },

    /**
     * Show property image in Quick Look modal (macOS pattern)
     * @param {string} imageUrl - URL of the image to display
     * @param {string} title - Title/alt text for the image
     */
    showPropertyImageQuickLook(imageUrl, title) {
        const quickLook = document.getElementById('property-quick-look');
        const quickLookImage = document.getElementById('quick-look-image');

        if (!quickLook || !quickLookImage) return;

        // Set image source and alt
        quickLookImage.src = imageUrl;
        quickLookImage.alt = title;

        // Store current scroll position in panel (to restore later)
        this.panelScrollPosition = this.elements.panelContent.parentElement.scrollTop;

        // Store last focused element
        this.lastFocusedElement = document.activeElement;

        // Show the modal
        quickLook.classList.remove('hidden');

        // Focus the close button
        const closeBtn = document.getElementById('quick-look-close');
        if (closeBtn) {
            closeBtn.focus();
        }
    },

    /**
     * Hide property image Quick Look modal
     */
    hidePropertyImageQuickLook() {
        const quickLook = document.getElementById('property-quick-look');
        if (quickLook) {
            quickLook.classList.add('hidden');
        }

        // Restore panel scroll position
        if (this.panelScrollPosition !== undefined) {
            this.elements.panelContent.parentElement.scrollTop = this.panelScrollPosition;
        }

        // Return focus
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
        }
    },

    /**
     * Set up focus trap within a modal element
     */
    setupFocusTrap(element) {
        this.focusTrapHandler = (e) => {
            if (e.key !== 'Tab') return;

            const focusable = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusable[0];
            const lastFocusable = focusable[focusable.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        };

        document.addEventListener('keydown', this.focusTrapHandler);
    },

    /**
     * Remove focus trap
     */
    removeFocusTrap() {
        if (this.focusTrapHandler) {
            document.removeEventListener('keydown', this.focusTrapHandler);
            this.focusTrapHandler = null;
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
    // DISCLOSURE GROUPS (macOS NSOutlineView pattern)
    // ================================

    /**
     * Generate disclosure group HTML
     * @param {Object} group - Evidence group data
     * @returns {string} HTML string
     */
    generateDisclosureGroup(group) {
        const isExpanded = this.disclosureState[group.id] || false;
        const itemCount = group.items.length;

        const itemsHtml = group.items.map(item => `
            <button class="disclosure-item"
                    data-group-id="${group.id}"
                    data-item-id="${item.id}"
                    onclick="UI.selectDisclosureItem('${group.id}', '${item.id}')">
                <span class="disclosure-item-icon" aria-hidden="true">
                    ${this.getDocTypeIcon(item.type)}
                </span>
                <span class="disclosure-item-title">${item.title}</span>
                <span class="disclosure-item-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </span>
            </button>
        `).join('');

        return `
            <div class="disclosure-group ${isExpanded ? 'expanded' : ''}"
                 data-group-id="${group.id}">
                <button class="disclosure-header"
                        aria-expanded="${isExpanded}"
                        onclick="UI.toggleDisclosureGroup('${group.id}')">
                    <span class="disclosure-triangle" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </span>
                    <span class="disclosure-icon" aria-hidden="true">
                        ${this.getLucideIcon(group.icon)}
                    </span>
                    <span class="disclosure-title">${group.title}</span>
                    <span class="disclosure-badge">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                </button>
                <div class="disclosure-content" role="group" aria-label="${group.title} items">
                    ${itemsHtml}
                </div>
            </div>
        `;
    },

    /**
     * Toggle disclosure group expanded state
     * @param {string} groupId - ID of the group to toggle
     */
    toggleDisclosureGroup(groupId) {
        this.disclosureState[groupId] = !this.disclosureState[groupId];

        const groupEl = document.querySelector(`[data-group-id="${groupId}"]`);
        if (groupEl) {
            const headerBtn = groupEl.querySelector('.disclosure-header');
            const isExpanded = this.disclosureState[groupId];

            groupEl.classList.toggle('expanded', isExpanded);
            headerBtn.setAttribute('aria-expanded', isExpanded.toString());
        }
    },

    /**
     * Select a sub-item and show its detail view
     * @param {string} groupId - Parent group ID
     * @param {string} itemId - Sub-item ID
     */
    selectDisclosureItem(groupId, itemId) {
        // Store current state for back navigation
        this.currentEvidenceGroup = groupId;
        this.currentEvidenceItem = itemId;

        // Find the item data
        const group = this.findEvidenceGroup(groupId);
        const item = group?.items.find(i => i.id === itemId);

        if (!item) return;

        // Highlight corresponding marker if it has distinct coords
        if (item.coords) {
            MapManager.highlightEvidenceMarker(groupId, itemId);
        }

        // Show detail view
        this.showDisclosureItemDetail(group, item);
    },

    /**
     * Show detail view for a sub-item
     * @param {Object} group - Parent group
     * @param {Object} item - Sub-item data
     */
    showDisclosureItemDetail(group, item) {
        const statsHtml = item.stats ? item.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('') : '';

        const content = `
            <div class="disclosure-detail-header">
                <button class="disclosure-back-btn" onclick="UI.backToDisclosureList('${group.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    ${group.title}
                </button>
            </div>
            <div class="subtitle">${group.title}</div>
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            ${statsHtml ? `<div class="stat-grid">${statsHtml}</div>` : ''}
            <button class="panel-btn primary" onclick="UI.showGallery('${item.title}', '${item.type}', '${item.description.replace(/'/g, "\\'")}')">
                View ${this.getTypeLabel(item.type)}
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Navigate back to disclosure list with group still expanded
     * @param {string} groupId - Group to keep expanded
     */
    backToDisclosureList(groupId) {
        // Ensure the group stays expanded
        this.disclosureState[groupId] = true;

        // Clear marker highlight
        MapManager.clearEvidenceMarkerHighlight();

        // Show the evidence list panel
        this.showEvidenceListPanel(groupId);
    },

    /**
     * Show panel with evidence list containing disclosure groups
     * @param {string} expandedGroupId - Optional group to ensure is expanded
     */
    showEvidenceListPanel(expandedGroupId = null) {
        // Ensure specified group is expanded
        if (expandedGroupId) {
            this.disclosureState[expandedGroupId] = true;
        }

        // Generate HTML for all evidence groups
        const groups = Object.values(AppData.evidenceGroups);
        const groupsHtml = groups.map(group => this.generateDisclosureGroup(group)).join('');

        const content = `
            <div class="subtitle">Evidence Library</div>
            <h2>Supporting Documents</h2>
            <p>Explore detailed evidence and documentation for each category.</p>
            ${groupsHtml}
        `;

        this.showPanel(content);
    },

    /**
     * Find evidence group by ID across all data sources
     * @param {string} groupId - Group ID to find
     * @returns {Object|null} Group data or null
     */
    findEvidenceGroup(groupId) {
        // Check evidenceGroups at top level of AppData
        if (AppData.evidenceGroups && AppData.evidenceGroups[groupId]) {
            return AppData.evidenceGroups[groupId];
        }

        return null;
    },

    /**
     * Get Lucide icon SVG by name
     * @param {string} iconName - Icon name (e.g., 'zap', 'building-2')
     * @returns {string} SVG string
     */
    getLucideIcon(iconName) {
        const icons = {
            'zap': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
            </svg>`,
            'route': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="6" cy="19" r="3"/>
                <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
                <circle cx="18" cy="5" r="3"/>
            </svg>`,
            'landmark': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" x2="21" y1="22" y2="22"/>
                <line x1="6" x2="6" y1="18" y2="11"/>
                <line x1="10" x2="10" y1="18" y2="11"/>
                <line x1="14" x2="14" y1="18" y2="11"/>
                <line x1="18" x2="18" y1="18" y2="11"/>
                <polygon points="12 2 20 7 4 7"/>
            </svg>`,
            'graduation-cap': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>`,
            'file-text': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>`
        };
        return icons[iconName] || icons['file-text'];
    },

    /**
     * Get document type icon
     * @param {string} type - Document type (pdf, image, web)
     * @returns {string} SVG string
     */
    getDocTypeIcon(type) {
        const icons = {
            'pdf': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>`,
            'image': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>`,
            'web': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>`
        };
        return icons[type] || icons['pdf'];
    },

    /**
     * Get human-readable label for document type
     * @param {string} type - Document type
     * @returns {string} Label
     */
    getTypeLabel(type) {
        const labels = {
            'pdf': 'Document',
            'image': 'Gallery',
            'web': 'Source'
        };
        return labels[type] || 'Evidence';
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
        const legendZone = document.getElementById('legend-zone');

        if (view === 'future') {
            this.elements.presentBtn.classList.remove('active');
            this.elements.presentBtn.setAttribute('aria-pressed', 'false');
            this.elements.futureBtn.classList.add('active');
            this.elements.futureBtn.setAttribute('aria-pressed', 'true');
            MapManager.showFutureZones();

            // Show Development Zone in legend
            if (legendZone) {
                legendZone.classList.remove('hidden');
            }
        } else {
            this.elements.futureBtn.classList.remove('active');
            this.elements.futureBtn.setAttribute('aria-pressed', 'false');
            this.elements.presentBtn.classList.add('active');
            this.elements.presentBtn.setAttribute('aria-pressed', 'true');
            MapManager.hideFutureZones();

            // Hide Development Zone in legend
            if (legendZone) {
                legendZone.classList.add('hidden');
            }
        }
    },

    // ================================
    // DATA LAYERS PANEL
    // ================================

    showDataLayers(journey) {
        // Lucide-style SVG icons
        const icons = {
            // Home icon (Lucide: home)
            properties: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>`,
            // Building icon (Lucide: building-2)
            companies: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
            </svg>`,
            // Flask icon (Lucide: flask-conical)
            sciencePark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
                <path d="M8.5 2h7"/><path d="M7 16h10"/>
            </svg>`,
            // Map pin icon (Lucide: map-pin)
            baseMap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>`,
            // Car icon (Lucide: car)
            trafficFlow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
            </svg>`,
            // Train icon (Lucide: train-front)
            railCommute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/>
                <path d="m9 15-1-1"/><path d="m15 15 1-1"/>
                <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/>
                <path d="m8 19-2 3"/><path d="m16 19 2 3"/>
            </svg>`,
            // Zap icon (Lucide: zap)
            electricity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
            </svg>`,
            // Briefcase icon (Lucide: briefcase)
            employment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                <rect width="20" height="14" x="2" y="6" rx="2"/>
            </svg>`,
            // Landmark icon (Lucide: landmark)
            infrastructure: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/>
                <line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/>
                <line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
            </svg>`,
            // House icon (Lucide: house)
            realEstate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>`,
            // Droplet icon (Lucide: droplet)
            riskyArea: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
            </svg>`
        };

        // Populate Data Layers section (includes both map layers and data layers)
        const dataLayerItems = document.getElementById('data-layer-items');

        // Build map layers based on journey (these are active by default)
        let mapLayersHtml = '';
        if (journey === 'A') {
            mapLayersHtml = `
                <button type="button" class="layer-item active" data-layer="resources"
                        role="switch" aria-checked="true" onclick="UI.toggleLayer('resources')">
                    <span class="layer-radio" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.riskyArea}</span>
                    <span class="layer-label">Resources</span>
                </button>
            `;
        } else if (journey === 'B') {
            mapLayersHtml = `
                <button type="button" class="layer-item active" data-layer="sciencePark"
                        role="switch" aria-checked="true" onclick="UI.toggleLayer('sciencePark')">
                    <span class="layer-radio" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.sciencePark}</span>
                    <span class="layer-label">Science park</span>
                </button>
                <button type="button" class="layer-item active" data-layer="companies"
                        role="switch" aria-checked="true" onclick="UI.toggleLayer('companies')">
                    <span class="layer-radio" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.companies}</span>
                    <span class="layer-label">Corporate sites</span>
                </button>
            `;
        } else if (journey === 'C') {
            mapLayersHtml = `
                <button type="button" class="layer-item active" data-layer="properties"
                        role="switch" aria-checked="true" onclick="UI.toggleLayer('properties')">
                    <span class="layer-radio" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.properties}</span>
                    <span class="layer-label">Properties</span>
                </button>
                <button type="button" class="layer-item active" data-layer="companies"
                        role="switch" aria-checked="true" onclick="UI.toggleLayer('companies')">
                    <span class="layer-radio" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.companies}</span>
                    <span class="layer-label">Corporate sites</span>
                </button>
                <button type="button" class="layer-item active" data-layer="sciencePark"
                        role="switch" aria-checked="true" onclick="UI.toggleLayer('sciencePark')">
                    <span class="layer-radio" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.sciencePark}</span>
                    <span class="layer-label">Science park</span>
                </button>
            `;
        }

        // Data layers (these are inactive by default) - sentence case labels
        const dataLayersHtml = `
            <button type="button" class="layer-item" data-layer="baseMap"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('baseMap')">
                <span class="layer-radio" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.baseMap}</span>
                <span class="layer-label">Base map</span>
            </button>
            <button type="button" class="layer-item" data-layer="trafficFlow"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('trafficFlow')">
                <span class="layer-radio" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.trafficFlow}</span>
                <span class="layer-label">Traffic flow</span>
            </button>
            <button type="button" class="layer-item" data-layer="railCommute"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('railCommute')">
                <span class="layer-radio" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.railCommute}</span>
                <span class="layer-label">Rail commute</span>
            </button>
            <button type="button" class="layer-item" data-layer="electricity"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('electricity')">
                <span class="layer-radio" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.electricity}</span>
                <span class="layer-label">Electricity usage</span>
            </button>
            <button type="button" class="layer-item" data-layer="employment"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('employment')">
                <span class="layer-radio" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.employment}</span>
                <span class="layer-label">Employment</span>
            </button>
            <button type="button" class="layer-item" data-layer="infrastructure"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('infrastructure')">
                <span class="layer-radio" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.infrastructure}</span>
                <span class="layer-label">Infrastructure plan</span>
            </button>
            <button type="button" class="layer-item" data-layer="realEstate"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('realEstate')">
                <span class="layer-radio" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.realEstate}</span>
                <span class="layer-label">Real estate</span>
            </button>
            <button type="button" class="layer-item" data-layer="riskyArea"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('riskyArea')">
                <span class="layer-radio" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.riskyArea}</span>
                <span class="layer-label">Risky area</span>
            </button>
        `;

        // Combine map layers and data layers
        dataLayerItems.innerHTML = mapLayersHtml + dataLayersHtml;

        // Show the toggle button but keep panel hidden until user clicks
        this.showLayersToggle();
    },

    hideDataLayers() {
        document.getElementById('data-layers').classList.add('hidden');
        this.layersPanelOpen = false;
        this.elements.layersToggle.classList.remove('active');
        this.elements.layersToggle.setAttribute('aria-expanded', 'false');
    },

    /**
     * Toggle layers panel visibility
     */
    toggleLayersPanel() {
        if (this.layersPanelOpen) {
            this.elements.dataLayers.classList.add('hidden');
            this.elements.layersToggle.classList.remove('active');
            this.elements.layersToggle.setAttribute('aria-expanded', 'false');
            this.layersPanelOpen = false;
        } else {
            this.elements.dataLayers.classList.remove('hidden');
            this.elements.layersToggle.classList.add('active');
            this.elements.layersToggle.setAttribute('aria-expanded', 'true');
            this.layersPanelOpen = true;
        }
    },

    /**
     * Show layers toggle button
     */
    showLayersToggle() {
        this.elements.layersToggle.classList.remove('hidden');
    },

    /**
     * Reset layers toggle to unselected state (button stays visible, panel closes)
     */
    hideLayersToggle() {
        // Keep button visible but close panel and reset to unselected state
        this.hideDataLayers();
    },

    toggleLayer(layerName) {
        const layerItem = document.querySelector(`#data-layer-items [data-layer="${layerName}"]`);
        if (!layerItem) return;

        const isActive = layerItem.classList.contains('active');

        if (isActive) {
            layerItem.classList.remove('active');
            layerItem.setAttribute('aria-checked', 'false');
            MapManager.hideLayer(layerName);
            this.announceToScreenReader(`${this.getLayerDisplayName(layerName)} layer hidden`);
        } else {
            layerItem.classList.add('active');
            layerItem.setAttribute('aria-checked', 'true');
            MapManager.showLayer(layerName);
            this.announceToScreenReader(`${this.getLayerDisplayName(layerName)} layer shown`);
        }
    },

    /**
     * Get display name for layer (for screen reader announcements)
     */
    getLayerDisplayName(layerName) {
        const names = {
            properties: 'Properties',
            companies: 'Corporate sites',
            sciencePark: 'Science park',
            baseMap: 'Base map',
            trafficFlow: 'Traffic flow',
            railCommute: 'Rail commute',
            electricity: 'Electricity usage',
            employment: 'Employment',
            infrastructure: 'Infrastructure plan',
            realEstate: 'Real estate',
            riskyArea: 'Risky area'
        };
        return names[layerName] || layerName;
    },

    // ================================
    // MAP LEGEND
    // ================================

    /**
     * Show map legend with core items always visible plus journey-specific items
     */
    showLegend(journey) {
        const legendItems = document.getElementById('legend-items');
        const legendEl = document.getElementById('map-legend');

        // Lucide SVG icons for legend markers (consistent with Data Layers panel)
        const icons = {
            // Map pin icon (Lucide: map-pin)
            baseMap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>`,
            // Flask icon (Lucide: flask-conical)
            sciencePark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
                <path d="M8.5 2h7"/><path d="M7 16h10"/>
            </svg>`,
            // Building icon (Lucide: building-2)
            company: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
            </svg>`,
            // House icon (Lucide: house)
            property: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>`,
            // Droplet icon (Lucide: droplet)
            resource: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
            </svg>`,
            // Target icon (Lucide: target)
            zone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
            </svg>`,
            // Route icon (Lucide: route)
            route: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="19" r="3"/>
                <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
                <circle cx="18" cy="5" r="3"/>
            </svg>`,
            // Road/highway icon for infrastructure roads
            infrastructureRoad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="19" r="3"/>
                <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
                <circle cx="18" cy="5" r="3"/>
            </svg>`
        };

        // Core items always visible
        let html = `
            <div class="legend-item">
                <div class="legend-marker baseMap">${icons.baseMap}</div>
                <span class="legend-label">Base Map</span>
            </div>
            <div class="legend-item">
                <div class="legend-marker sciencePark">${icons.sciencePark}</div>
                <span class="legend-label">Science Park</span>
            </div>
            <div class="legend-item">
                <div class="legend-marker company">${icons.company}</div>
                <span class="legend-label">Corporate Sites</span>
            </div>
            <div class="legend-item">
                <div class="legend-marker property">${icons.property}</div>
                <span class="legend-label">Real Estate</span>
            </div>
        `;

        // Add journey-specific items
        if (journey === 'A') {
            html += `
                <div class="legend-item">
                    <div class="legend-marker resource">${icons.resource}</div>
                    <span class="legend-label">Resources</span>
                </div>
            `;
        } else if (journey === 'B') {
            html += `
                <div class="legend-item legend-item-future hidden" id="legend-zone">
                    <div class="legend-marker zone">${icons.zone}</div>
                    <span class="legend-label">Development Zone</span>
                </div>
            `;
        } else if (journey === 'B7') {
            // Infrastructure roads step - show road legend item
            html += `
                <div class="legend-item">
                    <div class="legend-marker infrastructureRoad">${icons.infrastructureRoad}</div>
                    <span class="legend-label">Infrastructure Roads</span>
                </div>
            `;
        } else if (journey === 'C') {
            html += `
                <div class="legend-item">
                    <div class="legend-marker route">${icons.route}</div>
                    <span class="legend-label">Route to JASM</span>
                </div>
            `;
        }

        legendItems.innerHTML = html;
        legendEl.classList.remove('hidden');
    },

    /**
     * Hide map legend
     */
    hideLegend() {
        document.getElementById('map-legend').classList.add('hidden');
    },

    toggleDataLayer(layerName) {
        const layerItem = document.querySelector(`#data-layer-items [data-layer="${layerName}"]`);
        if (!layerItem) return;

        const isActive = layerItem.classList.contains('active');
        const displayName = this.getLayerDisplayName(layerName);

        if (isActive) {
            layerItem.classList.remove('active');
            layerItem.setAttribute('aria-checked', 'false');
            MapManager.hideLayer(layerName);
            this.announceToScreenReader(`${displayName} layer hidden`);
        } else {
            layerItem.classList.add('active');
            layerItem.setAttribute('aria-checked', 'true');
            MapManager.showLayer(layerName);
            this.announceToScreenReader(`${displayName} layer shown`);
        }
    },

    /**
     * Announce message to screen readers via live region
     */
    announceToScreenReader(message) {
        const announcer = document.getElementById('map-announcements');
        if (announcer) {
            announcer.textContent = message;
            // Clear after announcement to allow repeated messages
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
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
        // Hide the journey chatbox (without showing FAB)
        this.elements.chatbox.classList.add('hidden');

        // Hide FAB since we're showing AI chat
        this.hideChatFab();

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
        this.lastChatType = 'aiChat';
        this.showChatFab();
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
        let response = '';
        const timestamp = '<div class="ai-data-timestamp">Based on Q3 2024 data</div>';

        // Semiconductor industry questions
        if (q.includes('semiconductor') || q.includes('reshaping') || q.includes('chip')) {
            response = "Japan committed ¥3.9 trillion to rebuild domestic chip production as part of national economic security strategy.<br><br>TSMC's Kumamoto fab is the centerpiece—bringing cutting-edge manufacturing back to Japan.";
        }
        // Kumamoto as hub
        else if (q.includes('kumamoto') && (q.includes('chosen') || q.includes('hub') || q.includes('why'))) {
            response = "Kumamoto was selected for three reasons: ultra-pure water from the Aso aquifer, reliable power infrastructure, and an existing semiconductor ecosystem with Sony's facility.<br><br>These natural advantages were decisive for chip fabrication requirements.";
        }
        // TSMC / JASM
        else if (q.includes('tsmc') || q.includes('jasm')) {
            response = "JASM is TSMC's joint venture with Sony and Denso. The first fab began production in 2024 with 22/28nm chips.<br><br>A second fab for 6nm chips is under construction—¥2 trillion total investment creating 3,400+ jobs.";
        }
        // Land prices
        else if (q.includes('land') || q.includes('price') || q.includes('property')) {
            response = "Land prices have appreciated 15-25% annually since TSMC's announcement.<br><br>Kikuyo and Ozu areas see the strongest growth. Residential land near JASM has roughly doubled since 2021.";
        }
        // Traffic
        else if (q.includes('traffic') || q.includes('commute') || q.includes('transport')) {
            response = "Traffic congestion has increased with JASM construction. The prefecture is investing ¥50 billion in infrastructure upgrades.<br><br>New expressway connections and the planned Kumamoto Airport rail link will reduce commute times.";
        }
        // Investment / returns
        else if (q.includes('invest') || q.includes('return') || q.includes('profit') || q.includes('yield')) {
            response = "Properties show 4-6% gross rental yields with projected appreciation of 8-15% annually through 2030.<br><br>Properties within 15 minutes of JASM command premium rents from engineers and technicians.";
        }
        // Default response
        else {
            response = "The Kumamoto corridor is experiencing unprecedented transformation with over ¥4 trillion in committed investment.<br><br>I can help with land prices, infrastructure plans, or specific investment opportunities.";
        }

        return response + timestamp;
    },

    /**
     * Exit path: Schedule a call
     */
    scheduleCall() {
        this.addChatMessage("I'd like to schedule a call with an advisor.", 'user');
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            this.addChatMessage("I'll connect you with one of our investment advisors. They'll reach out within 24 hours to discuss your specific interests.<br><br><strong>What's the best way to reach you?</strong>", 'assistant');
        }, 800);
    }
};
