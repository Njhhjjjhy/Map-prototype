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

    // Navigation history for back button support
    panelHistory: [], // Stack of panel content functions to enable back navigation
    currentPanelView: null, // Current panel view identifier
    chatboxHistory: [], // Stack of chatbox content for back navigation

    // Data layer state - track which layers are active with their data
    activeDataLayers: {}, // { layerName: { markers: [], panel: null } }

    // Dashboard state
    dashboardMode: false, // Whether we're in dashboard mode vs journey mode
    dashboardPanelOpen: false, // Whether dashboard panel is open

    /**
     * Initialize UI elements
     */
    init() {
        this.elements = {
            startScreen: document.getElementById('start-screen'),
            startBtn: document.getElementById('start-btn'),
            appContainer: document.getElementById('app-container'),
            timeToggle: document.getElementById('time-toggle'),
            presentBtn: document.getElementById('present-btn'),
            futureBtn: document.getElementById('future-btn'),
            chatbox: document.getElementById('chatbox'),
            chatboxTitle: document.getElementById('chatbox-title'),
            chatboxContent: document.getElementById('chatbox-content'),
            chatboxClose: document.getElementById('chatbox-close'),
            chatboxBack: document.getElementById('chatbox-back'),
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
            panelToggle: document.getElementById('panel-toggle'),
            skipToDashboardBtn: document.getElementById('skip-to-dashboard-btn'),
            dashboardToggle: document.getElementById('dashboard-toggle')
        };

        this.layersPanelOpen = false;
        this.panelOpen = false;
        this.lastChatType = 'chatbox'; // Track which chat was last shown
        this.bindEvents();
        this.initDraggableModals();
    },

    // ================================
    // DRAGGABLE MODALS
    // ================================

    /**
     * Initialize draggable functionality for modals
     */
    initDraggableModals() {
        // Make chatbox draggable (drag from header)
        this.makeDraggable(this.elements.chatbox, '#chatbox-body');

        // Make right panel draggable (drag from header area)
        this.makeDraggable(this.elements.rightPanel, '#panel-content .subtitle, #panel-content h2');

        // Make AI chat draggable (drag from header)
        this.makeDraggable(this.elements.aiChat, '.ai-chat-header');

        // Make gallery modal draggable (drag from content area header)
        this.makeDraggable(document.getElementById('gallery-content'), '.placeholder-doc h3');
    },

    /**
     * Make an element draggable
     * @param {HTMLElement} element - The element to make draggable
     * @param {string} handleSelector - CSS selector for the drag handle within the element
     */
    makeDraggable(element, handleSelector) {
        if (!element) return;

        let isDragging = false;
        let startX, startY, startLeft, startTop;
        let hasBeenDragged = false;

        // Store original position info
        const originalPosition = {
            position: element.style.position,
            left: element.style.left,
            top: element.style.top,
            transform: element.style.transform
        };

        const onMouseDown = (e) => {
            // Only start drag if clicking on the handle
            const handle = element.querySelector(handleSelector);
            if (!handle || !handle.contains(e.target)) return;

            // Don't drag if clicking on buttons or interactive elements
            if (e.target.closest('button, a, input, select, textarea')) return;

            isDragging = true;
            hasBeenDragged = true;

            // Get current position
            const rect = element.getBoundingClientRect();

            if (!element.dataset.draggable) {
                // First drag - convert from centered position to absolute
                element.dataset.draggable = 'true';
                element.style.position = 'fixed';
                element.style.left = rect.left + 'px';
                element.style.top = rect.top + 'px';
                element.style.transform = 'none';
                element.style.bottom = 'auto';
                element.style.right = 'auto';
            }

            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left) || rect.left;
            startTop = parseInt(element.style.top) || rect.top;

            // Add grabbing cursor
            element.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';

            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;

            // Constrain to viewport
            const rect = element.getBoundingClientRect();
            const minTop = 0;
            const maxTop = window.innerHeight - 50; // Keep at least 50px visible
            const minLeft = -rect.width + 50;
            const maxLeft = window.innerWidth - 50;

            newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
            newTop = Math.max(minTop, Math.min(maxTop, newTop));

            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
        };

        const onMouseUp = () => {
            if (!isDragging) return;

            isDragging = false;
            element.style.cursor = '';
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        // Add event listeners
        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Store reset function for later use
        element.resetDragPosition = () => {
            if (hasBeenDragged) {
                element.dataset.draggable = '';
                element.style.position = originalPosition.position;
                element.style.left = originalPosition.left;
                element.style.top = originalPosition.top;
                element.style.transform = originalPosition.transform;
                element.style.bottom = '';
                element.style.right = '';
                hasBeenDragged = false;
            }
        };
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

        // Keyboard handling for 3D camera reveal (Escape to cancel drill-down)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._drillDown) {
                // Only cancel if an actual drill-down is in progress
                // (don't exit corridor mode on Escape)
                if (this.panelOpen) {
                    this.hidePanel();
                } else {
                    this.cancelDrillDown();
                }
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

        // Skip to Dashboard button
        if (this.elements.skipToDashboardBtn) {
            this.elements.skipToDashboardBtn.addEventListener('click', () => {
                this.startDashboardMode();
            });
        }

        // Dashboard toggle button
        if (this.elements.dashboardToggle) {
            this.elements.dashboardToggle.addEventListener('click', () => {
                this.toggleDashboardPanel();
            });
        }
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
                this._retriggerAnimation(this.elements.chatbox);
            }
        }
    },

    /**
     * Show the chat FAB button with icon matching the chat type it will reopen
     */
    showChatFab() {
        const fab = this.elements.chatFab;

        // Swap icon: sparkles for AI chat, message-square for chatbox
        if (this.lastChatType === 'aiChat') {
            fab.innerHTML = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                <path d="M5 3v4"></path><path d="M19 17v4"></path>
                <path d="M3 5h4"></path><path d="M17 19h4"></path>
            </svg>`;
            fab.setAttribute('aria-label', 'Reopen AI chat');
        } else {
            fab.innerHTML = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>`;
            fab.setAttribute('aria-label', 'Reopen guide');
        }

        fab.classList.remove('hidden');
        this._retriggerAnimation(fab);
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
                    label: 'Annual appreciation',
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
        const colors = ['#2563eb', '#ea580c', '#0d9488', '#7c3aed'];

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

        const content = `
            <div class="subtitle">Corporate investment</div>
            <h2>Investment comparison</h2>
            <p>Total corporate investment in the Kumamoto semiconductor corridor.</p>
            <div class="chart-container" style="height: 200px; margin: 24px 0;">
                <canvas id="investment-chart" role="img" aria-label="Bar chart comparing corporate investments: JASM leads with ¥1.2T, followed by Sony ¥850B, Tokyo Electron ¥320B, Mitsubishi ¥260B"></canvas>
            </div>
            <div id="investment-chart-table"></div>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">¥2.6T+</div>
                    <div class="stat-label">Total investment</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">9,600+</div>
                    <div class="stat-label">Direct jobs</div>
                </div>
            </div>
            <div class="data-attribution">
                <p class="data-timestamp">Sample data &middot; Q1 2026</p>
                <p>Investment data from official company announcements</p>
            </div>
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
            // Remove start-screen from DOM entirely to prevent logo accumulation
            if (this.elements.startScreen && this.elements.startScreen.parentNode) {
                this.elements.startScreen.remove();
            }
        }, 500);
    },

    // ================================
    // CHATBOX
    // ================================

    /**
     * Show chatbox with content
     * @param {string} content - HTML content to display
     * @param {Object} options - { preserveHistory: boolean, skipHistory: boolean }
     *   - preserveHistory: true = save current content to history before showing new
     *   - skipHistory: true = don't touch history at all (for transitions)
     *   - default = clear history (for fresh starts)
     */
    showChatbox(content, options = {}) {
        const { preserveHistory = false, skipHistory = false } = options;

        if (skipHistory) {
            // Don't touch history at all (for transition screens)
        } else if (preserveHistory) {
            // Save current content to history before updating (for cross-journey navigation)
            const currentTitle = this.elements.chatboxTitle.textContent;
            const currentContent = this.elements.chatboxContent.innerHTML;

            if (currentTitle || currentContent.trim()) {
                const historyContent = currentTitle
                    ? `<h3>${currentTitle}</h3>${currentContent}`
                    : currentContent;
                this.chatboxHistory.push(historyContent);
            }
        } else {
            // Clear history when showing chatbox fresh (new journey start)
            this.chatboxHistory = [];
        }

        this._setChatboxContent(content);
        this._updateChatboxBackButton();
        this.elements.chatbox.classList.remove('hidden');
        this._retriggerAnimation(this.elements.chatbox);
        this.hideChatFab();
    },

    hideChatbox() {
        const chatbox = this.elements.chatbox;
        // Add closing animation class
        chatbox.classList.add('closing');
        this.lastChatType = 'chatbox';

        // DON'T clear history when hiding - preserve for back navigation across journeys

        // Wait for animation to complete, then hide
        const animationDuration = TIMING.fast; // matches --duration-fast
        setTimeout(() => {
            chatbox.classList.add('hidden');
            chatbox.classList.remove('closing');
            this.showChatFab();
        }, animationDuration);
    },

    /**
     * Update chatbox content, saving current content to history
     */
    updateChatbox(content) {
        // Save current content to history before updating
        const currentTitle = this.elements.chatboxTitle.textContent;
        const currentContent = this.elements.chatboxContent.innerHTML;

        if (currentTitle || currentContent.trim()) {
            // Build the full content string for history
            const historyContent = currentTitle
                ? `<h3>${currentTitle}</h3>${currentContent}`
                : currentContent;

            // Don't push if same as last history item (avoid duplicates)
            const lastHistory = this.chatboxHistory[this.chatboxHistory.length - 1];
            if (!lastHistory || lastHistory !== historyContent) {
                this.chatboxHistory.push(historyContent);
            }
        }

        this._setChatboxContent(content);
        this._updateChatboxBackButton();
    },

    /**
     * Navigate back to previous chatbox content
     */
    chatboxBack() {
        if (this.chatboxHistory.length === 0) return;

        const previousContent = this.chatboxHistory.pop();
        if (previousContent) {
            this._setChatboxContent(previousContent);
            this._updateChatboxBackButton();
        }
    },

    /**
     * Save current chatbox content to history (for cross-journey navigation)
     * Call this BEFORE transitioning to a new journey
     */
    saveChatboxToHistory() {
        const currentTitle = this.elements.chatboxTitle.textContent;
        const currentContent = this.elements.chatboxContent.innerHTML;

        if (currentTitle || currentContent.trim()) {
            const historyContent = currentTitle
                ? `<h3>${currentTitle}</h3>${currentContent}`
                : currentContent;

            // Don't push duplicates
            const lastHistory = this.chatboxHistory[this.chatboxHistory.length - 1];
            if (!lastHistory || lastHistory !== historyContent) {
                this.chatboxHistory.push(historyContent);
            }
        }
    },

    /**
     * Enable/disable chatbox back button based on history
     * Button is always visible, but disabled when no history
     */
    _updateChatboxBackButton() {
        if (this.chatboxHistory.length > 0) {
            this.elements.chatboxBack.disabled = false;
        } else {
            this.elements.chatboxBack.disabled = true;
        }
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

    /**
     * Show panel with content and automatic history tracking
     * History is automatically tracked when navigating between panels
     * @param {string} content - HTML content to display
     * @param {Object} options - Optional settings: { clearHistory }
     */
    showPanel(content, options = {}) {
        const { clearHistory = false } = options;

        // Clear history if requested (for starting a new flow)
        if (clearHistory) {
            this.panelHistory = [];
        }

        // Automatically save current content to history if panel is open with content
        if (this.panelOpen && this.elements.panelContent.innerHTML.trim()) {
            // Don't push if content is the same (avoid duplicates)
            const currentContent = this.elements.panelContent.innerHTML;
            const lastHistory = this.panelHistory[this.panelHistory.length - 1];
            const lastContent = lastHistory ? lastHistory.content : '';

            if (currentContent !== lastContent) {
                this.panelHistory.push({
                    content: currentContent,
                    scrollTop: this.elements.rightPanel.scrollTop
                });
            }
        }

        this.elements.panelContent.innerHTML = content;
        this.elements.rightPanel.classList.remove('hidden');
        this.elements.rightPanel.classList.add('visible');
        this.panelOpen = true;

        // Update toolbar back button based on history
        this._updateToolbarBackButton();

        // Show panel toggle button (will be visible/active when panel is open)
        // Skip in dashboard mode — dashboard uses its own toggle
        if (!this.dashboardMode) {
            this.showPanelToggle();
        }
        this.updatePanelToggleState();

        // Announce panel opening to screen readers
        const titleEl = this.elements.panelContent.querySelector('h2');
        if (titleEl) {
            this.announceToScreenReader('Details panel opened: ' + titleEl.textContent);
        }
    },

    /**
     * Inject back button into panel toolbar
     */
    injectBackButton(content) {
        // Back button is now injected into .panel-toolbar, not into content
        // This is handled in showPanel via _updateToolbarBackButton
        return content;
    },

    /**
     * Update toolbar back button based on history state
     */
    _updateToolbarBackButton() {
        const toolbar = document.querySelector('.panel-toolbar');
        if (!toolbar) return;

        // Remove existing back button
        const existing = toolbar.querySelector('.panel-back-btn');
        if (existing) existing.remove();

        if (this.panelHistory.length > 0) {
            const backBtn = document.createElement('button');
            backBtn.className = 'panel-back-btn';
            backBtn.setAttribute('aria-label', 'Go back');
            backBtn.onclick = () => this.navigateBack();
            backBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
            toolbar.insertBefore(backBtn, toolbar.firstChild);
        }
    },

    /**
     * Navigate back to previous panel view
     */
    navigateBack() {
        if (this.panelHistory.length === 0) return;

        const previousView = this.panelHistory.pop();
        if (previousView) {
            // Check if we still have more history after this pop
            this.elements.panelContent.innerHTML = previousView.content;

            // Update toolbar back button
            this._updateToolbarBackButton();

            // Restore scroll position
            if (previousView.scrollTop !== undefined) {
                this.elements.rightPanel.scrollTop = previousView.scrollTop;
            }
        }
    },

    /**
     * Clear panel history (call when starting a new panel flow)
     */
    clearPanelHistory() {
        this.panelHistory = [];
        this.currentPanelView = null;
        this.currentPanelViewFunction = null;
    },

    hidePanel() {
        const panel = this.elements.rightPanel;
        // Add closing class for exit animation (uses accelerate easing)
        panel.classList.add('closing');
        this.announceToScreenReader('Details panel closed');

        // If drill-down is active, cancel and reverse (to corridor or 2D map)
        // In corridor mode, only reverse if an actual drill-down is in progress
        if (this._drillDown) {
            this.cancelDrillDown();
        }

        // Clear panel history when closing
        this.clearPanelHistory();

        // Wait for animation to complete, then remove visible
        const animationDuration = TIMING.fast; // matches --duration-fast
        setTimeout(() => {
            panel.classList.remove('visible');
            panel.classList.remove('closing');
            panel.classList.add('hidden');
            this.panelOpen = false;
            this.updatePanelToggleState();
            MapController.clearRoute();

            // Also reset dashboard state if in dashboard mode
            if (this.dashboardPanelOpen || this.dashboardMode) {
                this.dashboardPanelOpen = false;
                // Reset dashboard state
                if (this.elements.dashboardToggle) {
                    this.elements.dashboardToggle.classList.remove('active');
                    this.elements.dashboardToggle.setAttribute('aria-expanded', 'false');
                }
                // Keep dashboard toggle visible so user can reopen
                this.showDashboardToggle();
            }

            // Fire onPanelClose callback if set
            if (this._onPanelClose) {
                const cb = this._onPanelClose;
                this._onPanelClose = null;
                cb();
            }
        }, animationDuration);
    },

    /**
     * Set a one-time callback for when the panel closes
     * @param {Function} callback
     */
    onPanelClose(callback) {
        this._onPanelClose = callback;
    },

    /**
     * Toggle the right panel open/closed
     */
    togglePanel() {
        if (this.panelOpen) {
            this.hidePanel();
        } else {
            // If there's existing content, just show the panel
            if (this.elements.panelContent.innerHTML.trim()) {
                this.elements.rightPanel.classList.remove('hidden');
                this.elements.rightPanel.classList.add('visible');
                this.panelOpen = true;
                this.updatePanelToggleState();
            } else {
                // Render inspector panel for current journey step
                const currentStep = App.state.step;
                if (currentStep) {
                    const stage = STAGE_MAP[currentStep];
                    if (stage && stage >= 3) {
                        const tabDef = STAGE_TABS[stage] || {};
                        this.renderInspectorPanel(stage, { title: tabDef.label || '' });
                    }
                }
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
            <div class="panel-bento-stat">
                <div class="panel-bento-stat-value">${stat.value}</div>
                <div class="panel-bento-stat-label">${stat.label}</div>
            </div>
        `).join('');

        // Generate energy mix section for power resource (disclosure groups)
        let energyMixHtml = '';
        if (resource.id === 'power' && resource.energyMix) {
            const iconMap = {
                Solar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
                Wind: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
                Nuclear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2a7 7 0 0 0-5.4 11.5"/><path d="M12 2a7 7 0 0 1 5.4 11.5"/><path d="M7 20.7a7 7 0 0 0 10 0"/></svg>'
            };
            const colorMap = { Solar: '#ff9500', Wind: '#5ac8fa', Nuclear: '#ff3b30' };

            const renderEnergyDisclosure = (type, facilities) => {
                const groupId = `energy-${type.toLowerCase()}`;
                return `
                    <div class="disclosure-group" data-group-id="${groupId}">
                        <button class="disclosure-header" aria-expanded="false" onclick="UI.toggleDisclosureGroup('${groupId}')">
                            <span class="disclosure-triangle" aria-hidden="true">
                                <svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l6 4-6 4V4z"/></svg>
                                <svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 6 4-6H4z"/></svg>
                            </span>
                            <span class="disclosure-icon" style="color: ${colorMap[type]}">${iconMap[type]}</span>
                            <span class="disclosure-title">${type}</span>
                            <span class="disclosure-badge">${facilities.length}</span>
                        </button>
                        <div class="disclosure-content">
                            ${facilities.map(f => `
                                <div class="disclosure-item energy-facility-item" data-station-id="${f.id || ''}" data-station-type="${type.toLowerCase()}" style="display: flex; justify-content: space-between; padding: var(--space-2) var(--space-4); font-size: var(--text-sm); cursor: pointer; border-radius: var(--radius-small); transition: background-color var(--duration-fast) var(--easing-standard);"${f.id ? ` onclick="UI.focusEnergyStation('${f.id}', '${type.toLowerCase()}')"` : ''}>
                                    <span style="color: var(--color-text-secondary);">${f.name || f.examples || f}</span>
                                    <span style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">${f.capacity || ''}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            };

            energyMixHtml = `
                <div style="margin-top: var(--space-4);">
                    <div class="panel-bento-label" style="margin-bottom: var(--space-2);">Energy mix</div>
                    <p>${resource.energyMix.description}</p>
                    <div style="margin-top: var(--space-4);">
                        ${resource.energyMix.sources.map(source => {
                            const key = source.type;
                            const energyData = AppData.kyushuEnergy;
                            const facilities = energyData ? energyData[key.toLowerCase()] || [] : [];
                            return renderEnergyDisclosure(key, facilities);
                        }).join('')}
                    </div>
                </div>
            `;
        }

        const content = `
            <div class="subtitle">${resource.subtitle}</div>
            <h2>${resource.name}</h2>
            <p>${resource.description}</p>
            <div class="panel-bento-stats" style="margin-top: var(--space-4);">
                ${statsHtml}
            </div>
            ${energyMixHtml}
            <div style="margin-top: var(--space-6);">
                <button class="panel-bento-btn primary full-width" onclick="UI.showEvidence('${resource.id}', 'resource')">
                    View Evidence
                </button>
            </div>
        `;

        this.showPanel(content);
    },

    /**
     * Show panel for water evidence marker (Coca-Cola, Suntory)
     * @param {Object} evidence - Evidence marker data
     */
    showWaterEvidencePanel(evidence) {
        const statsHtml = evidence.stats.map(stat => `
            <div class="stat-card">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">Water quality evidence</div>
            <h2>${evidence.name}</h2>
            <p class="panel-subtitle">${evidence.subtitle}</p>
            <p>${evidence.description}</p>
            <div class="stats-grid">
                ${statsHtml}
            </div>
            <p class="evidence-note" style="margin-top: 16px; font-size: 14px; color: var(--color-text-secondary);">
                Major manufacturers chose Kumamoto for water quality — proof the resource meets industrial standards.
            </p>
        `;

        this.showPanel(content);
    },

    /**
     * Show energy station panel for Kyushu energy markers
     * @param {Object} station - Energy station data
     * @param {string} type - 'solar', 'wind', or 'nuclear'
     */
    showEnergyStationPanel(station, type) {
        const typeLabels = { solar: 'Solar power', wind: 'Wind energy', nuclear: 'Nuclear power' };
        const typeColors = { solar: '#ff9500', wind: '#5ac8fa', nuclear: '#ff3b30' };

        const content = `
            <h2>${station.name}</h2>
            <div style="
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-1) var(--space-3);
                background: ${typeColors[type]}15;
                border-radius: var(--radius-small);
                font-family: var(--font-display);
                font-size: var(--text-sm);
                font-weight: var(--font-weight-semibold);
                color: ${typeColors[type]};
                margin-bottom: var(--space-4);
            ">${typeLabels[type]}</div>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">${station.capacity}</div>
                    <div class="stat-label">Capacity</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${station.prefecture}</div>
                    <div class="stat-label">Prefecture</div>
                </div>
            </div>
            <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">
                Kyushu leads Japan in renewable energy adoption, providing the stable and diverse power mix semiconductor manufacturing requires.
            </p>
        `;

        this.showPanel(content);
    },

    /**
     * Focus map on an energy station when clicked in disclosure list.
     * Flies camera to the station and highlights its marker.
     * @param {string} stationId - e.g. 'solar-kagoshima'
     * @param {string} type - 'solar', 'wind', or 'nuclear'
     */
    focusEnergyStation(stationId, type) {
        MapController.focusEnergyStation(stationId, type);

        // Highlight the selected row in the panel
        document.querySelectorAll('.energy-facility-item.selected').forEach(el => {
            el.classList.remove('selected');
            el.style.background = '';
        });
        const selectedItem = document.querySelector(`.energy-facility-item[data-station-id="${stationId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            selectedItem.style.background = 'var(--color-bg-secondary)';
        }
    },

    /**
     * Show inspector stage 3 focused on a single institution (Journey A talent pipeline).
     * Accepts an institution ID string or institution object.
     */
    showTalentInspector(instOrId) {
        const institutions = AppData.talentPipeline?.institutions || [];
        const inst = typeof instOrId === 'string'
            ? institutions.find(i => i.id === instOrId)
            : instOrId;
        if (!inst) return;

        const flyTo = inst.coords ? {
            center: MapController._toMapbox(inst.coords),
            zoom: 11,
            pitch: 35,
            bearing: 0,
            duration: 1500
        } : undefined;

        this.renderInspectorPanel(3, {
            title: inst.name,
            institution: inst,
            startTab: 0,
            flyTo
        });
    },

    /**
     * Show airline route panel for a destination
     * @param {Object} destination - Destination data
     */
    showAirlineRoutePanel(destination) {
        const isSuspended = destination.status === 'suspended';

        // Headline: flight time for active, status badge for suspended
        const headlineHtml = isSuspended
            ? `
                <div class="stat-grid" style="grid-template-columns: 1fr;">
                    <div class="stat-item" style="text-align: center;">
                        <div class="stat-value" style="font-size: var(--text-2xl); color: var(--color-warning);">
                            ⚠ Service suspended
                        </div>
                    </div>
                </div>
            `
            : `
                <div class="stat-grid" style="grid-template-columns: 1fr;">
                    <div class="stat-item" style="text-align: center;">
                        <div class="stat-value" style="font-size: var(--text-4xl); color: var(--color-info);">${destination.flightTime}</div>
                        <div class="stat-label">Flight time</div>
                    </div>
                </div>
            `;

        // Stats grid - different for suspended vs active
        const statsHtml = isSuspended
            ? `
                <div class="stat-item">
                    <div class="stat-value">${destination.region}</div>
                    <div class="stat-label">Region</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${destination.flightTime}</div>
                    <div class="stat-label">Flight time (when active)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${destination.airlines.join(', ')}</div>
                    <div class="stat-label">Airlines</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${destination.significance}</div>
                    <div class="stat-label">Significance</div>
                </div>
            `
            : `
                <div class="stat-item">
                    <div class="stat-value">${destination.region}</div>
                    <div class="stat-label">Region</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${destination.airlines.join(', ')}</div>
                    <div class="stat-label">Airlines</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${destination.frequency}</div>
                    <div class="stat-label">Frequency</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">Active</div>
                    <div class="stat-label">Status</div>
                </div>
                <div class="stat-item" style="grid-column: 1 / -1;">
                    <div class="stat-value">${destination.significance}</div>
                    <div class="stat-label">Significance</div>
                </div>
            `;

        // Semiconductor connection badge
        const semiBadge = destination.semiconductorLink
            ? `<div class="semiconductor-badge" style="
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-1) var(--space-3);
                background: ${destination.semiconductorLink.color}15;
                border: 1px solid ${destination.semiconductorLink.color}40;
                border-radius: var(--radius-small);
                font-family: var(--font-display);
                font-size: var(--text-sm);
                font-weight: var(--font-weight-semibold);
                color: ${destination.semiconductorLink.color};
                margin-bottom: var(--space-4);
            ">${destination.semiconductorLink.company} — ${destination.semiconductorLink.role}</div>`
            : '';

        const content = `
            <div class="subtitle">International route</div>
            <h2>${destination.name} (${destination.code})</h2>
            ${semiBadge}

            ${headlineHtml}

            <div class="stat-grid">
                ${statsHtml}
            </div>

            <p>${destination.description}</p>

            <button class="panel-btn secondary" onclick="UI.showAllAirlineRoutes()">
                View all routes →
            </button>
        `;

        this.showPanel(content);
    },

    /**
     * Show all airline routes summary panel
     */
    showAllAirlineRoutes() {
        const routes = AppData.airlineRoutes.destinations;
        const activeRoutes = routes.filter(r => r.status === 'active');
        const suspendedRoutes = routes.filter(r => r.status === 'suspended');

        // Initialize disclosure state: active routes start expanded
        this.disclosureState['active-routes'] = true;
        this.disclosureState['suspended-routes'] = false;

        const renderRouteItem = (r, isSuspended) => `
            <div class="disclosure-item route-list-item" onclick="UI.showAirlineRoutePanel(AppData.airlineRoutes.destinations.find(d => d.id === '${r.id}'))" style="
                padding: var(--space-3) var(--space-4);
                cursor: pointer;
                transition: background var(--duration-fast) var(--easing-standard);
                ${isSuspended ? 'opacity: 0.6;' : ''}
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: var(--font-weight-medium);">${r.name} (${r.code})</span>
                    <span style="color: var(--color-text-${isSuspended ? 'tertiary' : 'secondary'});">${isSuspended ? 'Suspended' : r.flightTime}</span>
                </div>
                ${!isSuspended ? `<div style="font-size: var(--text-sm); color: var(--color-text-tertiary); margin-top: 2px;">${r.region} · ${r.frequency}</div>` : ''}
            </div>
        `;

        const content = `
            <div class="subtitle">Aso Kumamoto Airport</div>
            <h2>All international routes</h2>
            <p style="margin-bottom: var(--space-4);">${routes.length} destinations across 4 regions connecting Kumamoto to key Asian markets.</p>

            <div class="disclosure-group expanded" data-group-id="active-routes">
                <button class="disclosure-header" aria-expanded="true" onclick="UI.toggleDisclosureGroup('active-routes')">
                    <span class="disclosure-triangle" aria-hidden="true">
                        <svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l6 4-6 4V4z"/></svg>
                        <svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 6 4-6H4z"/></svg>
                    </span>
                    <span class="disclosure-icon" style="color: var(--color-success);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1l5.2 3L6 14.3 3.7 14c-.4 0-.7.2-.9.5l-.1.3c-.1.3 0 .7.3.9l2.4 1.4 1.4 2.4c.2.3.6.4.9.3l.3-.1c.3-.2.5-.5.5-.9L8.3 16l3 2.9c.5.4 1 .5 1.4.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>
                    </span>
                    <span class="disclosure-title">Active routes</span>
                    <span class="disclosure-badge">${activeRoutes.length}</span>
                </button>
                <div class="disclosure-content">
                    ${activeRoutes.map(r => renderRouteItem(r, false)).join('')}
                </div>
            </div>

            <div class="disclosure-group" data-group-id="suspended-routes">
                <button class="disclosure-header" aria-expanded="false" onclick="UI.toggleDisclosureGroup('suspended-routes')">
                    <span class="disclosure-triangle" aria-hidden="true">
                        <svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l6 4-6 4V4z"/></svg>
                        <svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 6 4-6H4z"/></svg>
                    </span>
                    <span class="disclosure-icon" style="color: var(--color-text-tertiary);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
                    </span>
                    <span class="disclosure-title">Suspended routes</span>
                    <span class="disclosure-badge">${suspendedRoutes.length}</span>
                </button>
                <div class="disclosure-content">
                    ${suspendedRoutes.map(r => renderRouteItem(r, true)).join('')}
                </div>
            </div>
        `;

        this.showPanel(content);
    },

    /**
     * Cinematic property drill-down: 3-stage transition
     *
     * Stage 1: Bird's-eye 3D tilt (2.5s) — Mapbox camera flyTo
     * Stage 2: Crossfade to exterior photo (hold 800ms + fade 800ms)
     * Stage 3: Crossfade to interior gallery (800ms) — if images exist
     *
     * Total: ≤5s. Right panel visible throughout all stages.
     * Interruptible via cancelDrillDown() at any point.
     *
     * @param {Object} property - Property data object
     */
    async showPropertyReveal(property) {
        // Accept string ID or object
        if (typeof property === 'string') {
            property = AppData.properties.find(p => p.id === property);
            if (!property) return;
        }

        // Cancel any in-progress drill-down
        if (this._drillDown) {
            this._drillDown.cancelled = true;
        }

        const drillDown = { cancelled: false, property };
        this._drillDown = drillDown;

        // Stage 1: Fly to street level (2.5s) — camera only, no panel yet
        await MapController.forwardReveal(property);
        if (drillDown.cancelled) return;

        // Stage 2: Hold on 3D building — let the user see the structure
        // Boost building opacity for dramatic effect
        MapController.setBuildingOpacity(0.85);
        await this._delay(2000);
        if (drillDown.cancelled) return;

        // Now show the inspector panel (after the building has been appreciated)
        this.renderInspectorPanel(9, { title: property.name, property });

        // Stage 3: Crossfade to exterior photo (800ms)
        const overlay = this._ensureTransitionOverlay();
        const exteriorSrc = property.exteriorImage || property.image;
        this._setTransitionImage(overlay, exteriorSrc, `${property.name} exterior`);
        this._setTransitionLabel(overlay, property.name, property.subtitle);

        // Wait one frame for image to paint, then fade in
        await new Promise(resolve => requestAnimationFrame(resolve));
        document.getElementById('map-container').classList.add('immersive-active');
        overlay.classList.add('visible');
        await this._delay(800);
        if (drillDown.cancelled) return;

        // Stage 4: Crossfade to interior (800ms) — if images exist
        if (property.interiorImages && property.interiorImages.length > 0) {
            this._drillDownImages = [exteriorSrc, ...property.interiorImages];
            this._drillDownImageIndex = 1;

            this._crossfadeTransitionImage(
                overlay,
                property.interiorImages[0],
                `${property.name} interior`
            );
            await this._delay(800);
            if (drillDown.cancelled) return;

            // Show gallery nav if multiple interior images
            if (property.interiorImages.length > 1) {
                this._showGalleryNav(overlay);
            }
        }
    },

    /**
     * Cancel an in-progress drill-down and reverse to 2D map
     */
    async cancelDrillDown() {
        if (this._drillDown) {
            this._drillDown.cancelled = true;
        }

        // Fade out transition overlay (uses fast exit transition from CSS)
        const overlay = document.getElementById('transition-overlay');
        if (overlay && overlay.classList.contains('visible')) {
            overlay.classList.remove('visible');
            const nav = overlay.querySelector('.transition-gallery-nav');
            if (nav) nav.classList.add('hidden');
        }

        // Restore map controls
        document.getElementById('map-container').classList.remove('immersive-active');

        // Reverse camera back to saved view
        await MapController.reverseReveal();

        // Cleanup
        this._drillDown = null;
        this._drillDownImages = null;
        this._drillDownImageIndex = 0;
    },

    /**
     * Create or return the transition overlay element (lazy, once)
     * @private
     */
    _ensureTransitionOverlay() {
        let overlay = document.getElementById('transition-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'transition-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <img class="transition-img transition-img-a" src="" alt="">
            <img class="transition-img transition-img-b" src="" alt="">
            <div class="transition-label">
                <span class="transition-name"></span>
                <span class="transition-type"></span>
            </div>
            <div class="transition-gallery-nav hidden">
                <button class="transition-prev" aria-label="Previous image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <span class="transition-counter"></span>
                <button class="transition-next" aria-label="Next image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                    </svg>
                </button>
            </div>
        `;

        // Gallery navigation handlers
        overlay.querySelector('.transition-prev').addEventListener('click', () => this._galleryPrev());
        overlay.querySelector('.transition-next').addEventListener('click', () => this._galleryNext());

        document.getElementById('map-container').appendChild(overlay);
        return overlay;
    },

    /**
     * Set the initial transition image (img-a active)
     * @private
     */
    _setTransitionImage(overlay, src, alt) {
        const imgA = overlay.querySelector('.transition-img-a');
        const imgB = overlay.querySelector('.transition-img-b');
        imgA.src = src;
        imgA.alt = alt;
        imgA.classList.add('active');
        imgB.classList.remove('active');
        this._activeTransitionImg = 'a';
    },

    /**
     * Set the label text on the transition overlay
     * @private
     */
    _setTransitionLabel(overlay, name, type) {
        overlay.querySelector('.transition-name').textContent = name;
        overlay.querySelector('.transition-type').textContent = type;
    },

    /**
     * True crossfade: swap active between img-a and img-b
     * @private
     */
    _crossfadeTransitionImage(overlay, src, alt) {
        const isA = this._activeTransitionImg === 'a';
        const incoming = overlay.querySelector(isA ? '.transition-img-b' : '.transition-img-a');
        const outgoing = overlay.querySelector(isA ? '.transition-img-a' : '.transition-img-b');

        incoming.src = src;
        incoming.alt = alt;
        incoming.classList.add('active');
        outgoing.classList.remove('active');

        this._activeTransitionImg = isA ? 'b' : 'a';
    },

    /**
     * Show gallery prev/next nav and update counter
     * @private
     */
    _showGalleryNav(overlay) {
        const nav = overlay.querySelector('.transition-gallery-nav');
        nav.classList.remove('hidden');
        this._updateGalleryCounter(overlay);
    },

    /** @private */
    _updateGalleryCounter(overlay) {
        const counter = overlay.querySelector('.transition-counter');
        const total = this._drillDownImages ? this._drillDownImages.length : 0;
        const current = (this._drillDownImageIndex || 0) + 1;
        counter.textContent = `${current} / ${total}`;
    },

    /** @private */
    _galleryPrev() {
        if (!this._drillDownImages || this._drillDownImageIndex <= 0) return;
        this._drillDownImageIndex--;
        const overlay = document.getElementById('transition-overlay');
        const src = this._drillDownImages[this._drillDownImageIndex];
        const name = this._drillDown?.property?.name || '';
        this._crossfadeTransitionImage(overlay, src, `${name} view`);
        this._updateGalleryCounter(overlay);
    },

    /** @private */
    _galleryNext() {
        if (!this._drillDownImages || this._drillDownImageIndex >= this._drillDownImages.length - 1) return;
        this._drillDownImageIndex++;
        const overlay = document.getElementById('transition-overlay');
        const src = this._drillDownImages[this._drillDownImageIndex];
        const name = this._drillDown?.property?.name || '';
        this._crossfadeTransitionImage(overlay, src, `${name} view`);
        this._updateGalleryCounter(overlay);
    },

    /**
     * Promise-based delay helper
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Navigate back from property detail to corridor/map view
     */
    backToAllProperties() {
        this.hidePanel();
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
            <div class="subtitle">Growth drivers</div>
            <h2>Truth engine</h2>
            <p>Key factors driving future value appreciation for this property:</p>
            ${driversHtml}
            <button class="panel-btn primary" onclick="UI.showPerformanceCalculator()">
                Performance calculator
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

        const content = `
            <div class="subtitle">Financial projection</div>
            <h2>Performance calculator</h2>

            <div class="calculator-section">
                <h4>Scenario comparison</h4>
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
                    <span class="calc-label">Acquisition cost</span>
                    <span class="calc-value">${formatYen(fin.acquisitionCost)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Appreciation rate</span>
                    <span class="calc-value">${formatPercent(data.appreciation)}/yr</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Est. selling price (5yr)</span>
                    <div class="calc-value-with-confidence">
                        <span class="calc-value">${sellingPriceInfo.display}</span>
                        <span class="confidence-range" title="${confidence.level} confidence">
                            Range: ${sellingPriceInfo.range}
                            <span class="confidence-badge confidence-${confidence.level.toLowerCase()}">${confidence.level}</span>
                        </span>
                    </div>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Rental yield</span>
                    <span class="calc-value">${formatPercent(data.rentalYield)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Annual rental income</span>
                    <span class="calc-value">${formatYen(data.annualRent)}</span>
                </div>
                <div class="calc-row">
                    <span class="calc-label">Applicable taxes</span>
                    <span class="calc-value negative">${formatYen(data.taxes)}</span>
                </div>
                <div class="calc-row total">
                    <span class="calc-label">Net profit (5yr)</span>
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
                <p class="data-timestamp">Sample data &middot; Q1 2026</p>
                <p>Price data from Kumamoto Land Registry (Jan 2026)</p>
                <p>Rental estimates based on local property managers</p>
            </div>

            <button class="panel-btn" onclick="UI.showEvidence('${property.id}', 'rental')">
                View rental report
            </button>
            <button class="panel-btn" onclick="UI.showAreaStats()">
                Area statistics
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

        const content = `
            <div class="subtitle">Market overview</div>
            <h2>Area statistics</h2>

            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.avgAppreciation}</div>
                    <div class="stat-label">Avg. annual appreciation</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.avgRentalYield}</div>
                    <div class="stat-label">Avg. rental yield</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.occupancyRate}</div>
                    <div class="stat-label">Occupancy rate</div>
                </div>
            </div>

            <div class="calculator-section">
                <h4>Appreciation trend</h4>
                <div class="chart-container" style="height: 160px; margin: 16px 0;">
                    <canvas id="trend-chart" role="img" aria-label="Line chart showing appreciation trend: 2022 at 6.2%, 2023 at 9.1%, 2024 at 11.3% - showing accelerating growth"></canvas>
                </div>
                <div id="trend-chart-table"></div>
                <p class="chart-caption">Year-over-year property appreciation in the Kumamoto semiconductor corridor.</p>
            </div>

            <div class="data-attribution">
                <p class="data-timestamp">Sample data &middot; Q1 2026</p>
                <p>Data from Kumamoto Prefecture Real Estate Association</p>
            </div>
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
            <div class="gallery-header">
                <h3>${title}</h3>
            </div>
            <div class="placeholder-doc">
                <div class="icon">${icons[type] || icons.pdf}</div>
                <p>${description}</p>
                <p style="margin-top: var(--space-6); font-size: 14px; color: var(--color-text-secondary);">
                    [Placeholder - actual document would appear here]
                </p>
            </div>
        `;

        this.elements.galleryBody.innerHTML = content;
        this.elements.galleryModal.classList.remove('hidden');
        document.getElementById('map-container').classList.add('immersive-active');

        // Focus management for accessibility
        this.lastFocusedElement = document.activeElement;
        this.elements.galleryClose.focus();

        // Set up focus trap
        this.setupFocusTrap(this.elements.galleryModal);
    },

    hideGallery() {
        this.elements.galleryModal.classList.add('hidden');
        document.getElementById('map-container').classList.remove('immersive-active');

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

        // Set up focus trap
        this.setupFocusTrap(quickLook);
    },

    /**
     * Hide property image Quick Look modal
     */
    hidePropertyImageQuickLook() {
        const quickLook = document.getElementById('property-quick-look');
        if (quickLook) {
            quickLook.classList.add('hidden');
        }

        // Remove focus trap
        this.removeFocusTrap();

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
                        aria-controls="disclosure-content-${group.id}"
                        id="disclosure-header-${group.id}"
                        onclick="UI.toggleDisclosureGroup('${group.id}')">
                    <span class="disclosure-triangle" aria-hidden="true">
                        <svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 4l6 4-6 4V4z"/>
                        </svg>
                        <svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4 6l4 6 4-6H4z"/>
                        </svg>
                    </span>
                    <span class="disclosure-icon" aria-hidden="true">
                        ${this.getLucideIcon(group.icon)}
                    </span>
                    <span class="disclosure-title">${group.title}</span>
                    <span class="disclosure-badge">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                </button>
                <div class="disclosure-content"
                     id="disclosure-content-${group.id}"
                     role="region"
                     aria-labelledby="disclosure-header-${group.id}">
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
            MapController.highlightEvidenceMarker(groupId, itemId);
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
        MapController.clearEvidenceMarkerHighlight();

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
            <div class="subtitle">Evidence library</div>
            <h2>Supporting documents</h2>
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
    // TIME TOGGLE
    // ================================

    showTimeToggle() {
        this.elements.timeToggle.classList.remove('hidden');

        // Pulse coachmark to draw presenter attention (3 pulses, ~3.6s)
        this.elements.timeToggle.classList.add('coachmark');
        this.elements.timeToggle.addEventListener('animationend', () => {
            this.elements.timeToggle.classList.remove('coachmark');
        }, { once: true });
    },

    hideTimeToggle() {
        this.elements.timeToggle.classList.add('hidden');
    },

    setTimeView(view) {
        if (view === 'future') {
            this.elements.presentBtn.classList.remove('active');
            this.elements.presentBtn.setAttribute('aria-checked', 'false');
            this.elements.futureBtn.classList.add('active');
            this.elements.futureBtn.setAttribute('aria-checked', 'true');
            MapController.showFutureZones();
        } else {
            this.elements.futureBtn.classList.remove('active');
            this.elements.futureBtn.setAttribute('aria-checked', 'false');
            this.elements.presentBtn.classList.add('active');
            this.elements.presentBtn.setAttribute('aria-checked', 'true');
            MapController.hideFutureZones();
        }

    },

    // ================================
    // HOLD TO CONFIRM (Future/Present toggle replacement)
    // ================================

    // ================================
    // JOURNEY PROGRESS BAR
    // ================================

    /**
     * Update the journey progress bar to reflect current journey
     * @param {string} journey - 'A', 'B', 'C', or 'complete'
     */
    updateJourneyProgress(journey) {
        const progressBar = document.getElementById('journey-progress');
        if (!progressBar) return;

        // Show the progress bar
        progressBar.classList.remove('hidden');

        const steps = progressBar.querySelectorAll('.journey-progress-step');
        const journeyOrder = ['A', 'B', 'C'];
        const currentIndex = journeyOrder.indexOf(journey);

        steps.forEach((step, i) => {
            step.classList.remove('active', 'completed');
            if (journey === 'complete') {
                step.classList.add('completed');
            } else if (i < currentIndex) {
                step.classList.add('completed');
            } else if (i === currentIndex) {
                step.classList.add('active');
            }
        });
    },

    /**
     * Hide the journey progress bar
     */
    hideJourneyProgress() {
        const progressBar = document.getElementById('journey-progress');
        if (progressBar) progressBar.classList.add('hidden');
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
                <button type="button" class="layer-item" data-layer="resources"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('resources')"
                        title="Toggle resource markers on the map">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.riskyArea}</span>
                    <span class="layer-label">Resources</span>
                </button>
            `;
        } else if (journey === 'B') {
            mapLayersHtml = `
                <button type="button" class="layer-item" data-layer="sciencePark"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('sciencePark')"
                        title="Toggle Kumamoto Science Park boundary">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.sciencePark}</span>
                    <span class="layer-label">Science park</span>
                </button>
                <button type="button" class="layer-item" data-layer="companies"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('companies')"
                        title="Toggle corporate headquarters markers">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.companies}</span>
                    <span class="layer-label">Corporate sites</span>
                </button>
            `;
        } else if (journey === 'C') {
            mapLayersHtml = `
                <button type="button" class="layer-item" data-layer="properties"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('properties')"
                        title="Toggle investment property markers">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.properties}</span>
                    <span class="layer-label">Properties</span>
                </button>
                <button type="button" class="layer-item" data-layer="companies"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('companies')"
                        title="Toggle corporate headquarters markers">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.companies}</span>
                    <span class="layer-label">Corporate sites</span>
                </button>
                <button type="button" class="layer-item" data-layer="sciencePark"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('sciencePark')"
                        title="Toggle Kumamoto Science Park boundary">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.sciencePark}</span>
                    <span class="layer-label">Science park</span>
                </button>
            `;
        } else if (journey === 'dashboard') {
            // Dashboard mode - show all core layer controls (inactive by default)
            mapLayersHtml = `
                <button type="button" class="layer-item" data-layer="properties"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('properties')"
                        title="Toggle investment property markers">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.properties}</span>
                    <span class="layer-label">Properties</span>
                </button>
                <button type="button" class="layer-item" data-layer="companies"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('companies')"
                        title="Toggle corporate headquarters markers">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.companies}</span>
                    <span class="layer-label">Corporate sites</span>
                </button>
                <button type="button" class="layer-item" data-layer="sciencePark"
                        role="switch" aria-checked="false" onclick="UI.toggleLayer('sciencePark')"
                        title="Toggle Kumamoto Science Park boundary">
                    <span class="layer-checkbox" aria-hidden="true"></span>
                    <span class="layer-icon" aria-hidden="true">${icons.sciencePark}</span>
                    <span class="layer-label">Science park</span>
                </button>
            `;
        }

        // Data layers (these are inactive by default) - sentence case labels
        const dataLayersHtml = `
            <button type="button" class="layer-item" data-layer="baseMap"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('baseMap')"
                    title="Show base map layer">
                <span class="layer-checkbox" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.baseMap}</span>
                <span class="layer-label">Base map</span>
            </button>
            <button type="button" class="layer-item" data-layer="trafficFlow"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('trafficFlow')"
                    title="Show traffic flow data overlay">
                <span class="layer-checkbox" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.trafficFlow}</span>
                <span class="layer-label">Traffic flow</span>
            </button>
            <button type="button" class="layer-item" data-layer="railCommute"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('railCommute')"
                    title="Show rail commute routes and times">
                <span class="layer-checkbox" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.railCommute}</span>
                <span class="layer-label">Rail commute</span>
            </button>
            <button type="button" class="layer-item" data-layer="electricity"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('electricity')"
                    title="Show regional electricity usage data">
                <span class="layer-checkbox" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.electricity}</span>
                <span class="layer-label">Electricity usage</span>
            </button>
            <button type="button" class="layer-item" data-layer="employment"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('employment')"
                    title="Show employment statistics by area">
                <span class="layer-checkbox" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.employment}</span>
                <span class="layer-label">Employment</span>
            </button>
            <button type="button" class="layer-item" data-layer="infrastructure"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('infrastructure')"
                    title="Show planned infrastructure projects">
                <span class="layer-checkbox" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.infrastructure}</span>
                <span class="layer-label">Infrastructure plan</span>
            </button>
            <button type="button" class="layer-item" data-layer="realEstate"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('realEstate')"
                    title="Show real estate market data">
                <span class="layer-checkbox" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icons.realEstate}</span>
                <span class="layer-label">Real estate</span>
            </button>
            <button type="button" class="layer-item" data-layer="riskyArea"
                    role="switch" aria-checked="false" onclick="UI.toggleDataLayer('riskyArea')"
                    title="Show flood and hazard risk zones">
                <span class="layer-checkbox" aria-hidden="true"></span>
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
            this._retriggerAnimation(this.elements.dataLayers);
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
            MapController.hideLayer(layerName);
            this.announceToScreenReader(`${this.getLayerDisplayName(layerName)} layer hidden`);
        } else {
            layerItem.classList.add('active');
            layerItem.setAttribute('aria-checked', 'true');
            MapController.showLayer(layerName);
            this.announceToScreenReader(`${this.getLayerDisplayName(layerName)} layer shown`);

            // In dashboard mode, show layer info in the panel
            if (this.dashboardMode) {
                const layerData = AppData.dataLayers[layerName];
                if (layerData) {
                    this.showDataLayerPanel(layerName, layerData);
                }
            }
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

    toggleDataLayer(layerName) {
        const layerItem = document.querySelector(`#data-layer-items [data-layer="${layerName}"]`);
        if (!layerItem) return;

        const isActive = layerItem.classList.contains('active');
        const displayName = this.getLayerDisplayName(layerName);

        if (isActive) {
            // Deactivate layer
            layerItem.classList.remove('active');
            layerItem.setAttribute('aria-checked', 'false');

            // Hide markers and clear from active layers
            MapController.hideDataLayerMarkers(layerName);
            delete this.activeDataLayers[layerName];

            // Electricity layer: hide Kyushu energy facilities and restore view
            if (layerName === 'electricity') {
                // Don't hide if Journey A step A2 is active (it also shows Kyushu energy)
                if (!App || !App.state || App.state.step !== 'A2') {
                    MapController.hideKyushuEnergy();
                }
                MapController.restorePreDataLayerView();
            }

            this.announceToScreenReader(`${displayName} layer hidden`);
        } else {
            // Activate layer - show markers and panel
            layerItem.classList.add('active');
            layerItem.setAttribute('aria-checked', 'true');

            // Get layer data
            const layerData = AppData.dataLayers[layerName];
            if (layerData) {
                // Show markers on map
                MapController.showDataLayerMarkers(layerName, layerData);

                // Track active layer
                this.activeDataLayers[layerName] = true;

                // Electricity layer: show Kyushu-wide energy facilities
                if (layerName === 'electricity') {
                    MapController.savePreDataLayerView();
                    MapController.showKyushuEnergy();
                }

                // Show info panel for this layer
                this.showDataLayerPanel(layerName, layerData);
            }

            this.announceToScreenReader(`${displayName} layer shown`);
        }
    },

    /**
     * Show data layer info panel
     * @param {string} layerName - Layer identifier
     * @param {Object} layerData - Layer data from AppData
     */
    showDataLayerPanel(layerName, layerData) {
        const statsHtml = layerData.stats ? layerData.stats.map(stat => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('') : '';

        const markersListHtml = layerData.markers ? `
            <div class="data-layer-markers-list">
                <h4>Locations</h4>
                ${layerData.markers.map(marker => `
                    <button class="data-layer-marker-item" onclick="UI.focusDataLayerMarker('${layerName}', '${marker.id}')">
                        <span class="marker-name">${marker.name}</span>
                    </button>
                `).join('')}
            </div>
        ` : '';

        // Kyushu energy facilities section for electricity layer (disclosure groups)
        let kyushuEnergyHtml = '';
        if (layerName === 'electricity' && AppData.kyushuEnergy) {
            const energy = AppData.kyushuEnergy;
            const iconMap = {
                solar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
                wind: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
                nuclear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2a7 7 0 0 0-5.4 11.5"/><path d="M12 2a7 7 0 0 1 5.4 11.5"/><path d="M7 20.7a7 7 0 0 0 10 0"/></svg>'
            };
            const colorMap = { solar: '#ff9500', wind: '#5ac8fa', nuclear: '#ff3b30' };
            const labelMap = { solar: 'Solar', wind: 'Wind', nuclear: 'Nuclear' };

            const renderEnergyGroup = (type, facilities) => {
                const groupId = `datalayer-energy-${type}`;
                return `
                    <div class="disclosure-group" data-group-id="${groupId}">
                        <button class="disclosure-header" aria-expanded="false" onclick="UI.toggleDisclosureGroup('${groupId}')">
                            <span class="disclosure-triangle" aria-hidden="true">
                                <svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l6 4-6 4V4z"/></svg>
                                <svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 6 4-6H4z"/></svg>
                            </span>
                            <span class="disclosure-icon" style="color: ${colorMap[type]}">${iconMap[type]}</span>
                            <span class="disclosure-title">${labelMap[type]}</span>
                            <span class="disclosure-badge">${facilities.length}</span>
                        </button>
                        <div class="disclosure-content">
                            ${facilities.map(f => `
                                <div class="disclosure-item energy-facility-item" data-station-id="${f.id}" data-station-type="${type}" style="display: flex; justify-content: space-between; padding: var(--space-2) var(--space-4); font-size: var(--text-sm);" onclick="UI.focusEnergyStation('${f.id}', '${type}')">
                                    <span style="color: var(--color-text-secondary);">${f.name}</span>
                                    <span style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">${f.capacity}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            };

            kyushuEnergyHtml = `
                <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--color-bg-tertiary);">
                    <h4 style="font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">Kyushu energy facilities</h4>
                    ${renderEnergyGroup('solar', energy.solar)}
                    ${renderEnergyGroup('wind', energy.wind)}
                    ${renderEnergyGroup('nuclear', energy.nuclear)}
                </div>
            `;
        }

        const content = `
            <div class="subtitle">Data layer</div>
            <h2>${layerData.name}</h2>
            <p>${layerData.description}</p>
            ${statsHtml ? `<div class="stat-grid">${statsHtml}</div>` : ''}
            ${markersListHtml}
            ${kyushuEnergyHtml}
        `;

        this.showPanel(content);
    },

    /**
     * Focus on a specific data layer marker
     * @param {string} layerName - Layer identifier
     * @param {string} markerId - Marker identifier
     */
    focusDataLayerMarker(layerName, markerId) {
        const layerData = AppData.dataLayers[layerName];
        if (!layerData) return;

        const marker = layerData.markers.find(m => m.id === markerId);
        if (!marker) return;

        // Pan map to marker
        MapController.focusDataLayerMarker(layerName, markerId);

        // Show marker detail panel
        this.showDataLayerMarkerDetail(layerName, layerData, marker);
    },

    /**
     * Show detail panel for a specific data layer marker
     */
    showDataLayerMarkerDetail(_layerName, layerData, marker) {
        // Build dynamic stats based on marker properties
        let detailsHtml = '<div class="property-details">';

        // Add all properties except id, coords, and name
        Object.entries(marker).forEach(([key, value]) => {
            if (!['id', 'coords', 'name'].includes(key)) {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                detailsHtml += `
                    <div class="property-detail-row">
                        <span class="property-detail-label">${label}</span>
                        <span class="property-detail-value">${value}</span>
                    </div>
                `;
            }
        });

        detailsHtml += '</div>';

        const content = `
            <div class="subtitle">${layerData.name}</div>
            <h2>${marker.name}</h2>
            ${detailsHtml}
        `;

        this.showPanel(content);
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
    // MAP LEGEND
    // ================================

    updateLegend() { /* removed */ },
    hideLegend() { /* removed */ },

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

    /**
     * Re-trigger CSS animation on an element by forcing reflow
     */
    _retriggerAnimation(el) {
        el.style.animation = 'none';
        el.offsetHeight; // force reflow
        el.style.animation = '';
    },

    showAIChat() {
        // Hide the journey chatbox (without showing FAB)
        this.elements.chatbox.classList.add('hidden');

        // Hide FAB since we're showing AI chat
        this.hideChatFab();

        // Show AI chat with entrance animation
        const aiChat = document.getElementById('ai-chat');
        aiChat.classList.remove('hidden');
        this._retriggerAnimation(aiChat);

        // Hide CTAs in dashboard mode (no journey to summarize or restart)
        const ctasElement = document.getElementById('ai-chat-ctas');
        if (ctasElement) {
            if (this.dashboardMode) {
                ctasElement.classList.add('hidden');
            } else {
                ctasElement.classList.remove('hidden');
            }
        }

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
        const aiChat = document.getElementById('ai-chat');
        // Add closing animation class
        aiChat.classList.add('closing');
        this.lastChatType = 'aiChat';

        // Wait for animation to complete, then hide
        const animationDuration = TIMING.fast; // matches --duration-fast
        setTimeout(() => {
            aiChat.classList.add('hidden');
            aiChat.classList.remove('closing');
            this.showChatFab();
        }, animationDuration);
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

        // Risk questions
        if (q.includes('risk')) {
            response = "Key risks to consider:<br><br><strong>Natural disaster:</strong> The 2016 Kumamoto earthquake caused significant damage. Seismic building codes have since been upgraded.<br><br><strong>Construction delays:</strong> TSMC's second fab timeline could shift, affecting demand projections.<br><br><strong>Currency exposure:</strong> Yen-denominated assets carry FX risk for international investors.<br><br><strong>Liquidity:</strong> Regional Japanese real estate is less liquid than metro markets.<br><br>However, the ¥4T+ government commitment and TSMC's operational first fab provide strong downside protection.";
        }
        // How to invest
        else if (q.includes('how') && q.includes('invest')) {
            response = "The GKTK Fund offers a structured entry point:<br><br>1. <strong>Schedule a consultation</strong> with our Kumamoto specialists<br>2. Review the fund prospectus and individual property details<br>3. Complete KYC and accreditation verification<br>4. Fund commitment with quarterly capital calls<br><br>Minimum investment starts at ¥50M. Would you like to schedule a call with an advisor?";
        }
        // Semiconductor industry questions
        else if (q.includes('semiconductor') || q.includes('reshaping') || q.includes('chip')) {
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
    },

    // ================================
    // JOURNEY TRANSITIONS (Progress Indicator)
    // ================================

    /**
     * Show journey transition with in-panel progress indicator
     * @param {string} journeyId - The journey to transition to ('B' or 'C')
     */
    showJourneyTransition(journeyId) {
        return new Promise((resolve) => {
            const content = this.getJourneyTransitionContent(journeyId);

            this.showChatbox(`
                <div class="journey-progress-container">
                    <div class="journey-progress-indicator">
                        ${content.icon}
                    </div>
                    <h3>${content.title}</h3>
                    <p class="journey-progress-subtitle">${content.subtitle}</p>
                </div>
            `, { skipHistory: true });

            // Hold for scene duration, then resolve
            setTimeout(() => {
                resolve();
            }, TIMING.scene);
        });
    },

    /**
     * Get content for journey transition based on journey ID
     */
    getJourneyTransitionContent(journeyId) {
        const journeys = {
            'B': {
                title: 'Infrastructure plan',
                subtitle: 'See how billions in corporate investment are transforming the region',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                </svg>`
            },
            'C': {
                title: 'Investment opportunities',
                subtitle: 'Explore properties positioned for growth in the semiconductor corridor',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>`
            },
            'complete': {
                title: 'Journey complete',
                subtitle: 'You\'ve explored the Kumamoto investment opportunity',
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>`
            }
        };
        return journeys[journeyId] || journeys['complete'];
    },

    /**
     * Show MoreHarvest grand entry — branded full-screen overlay
     * Appears between Journey B → C transition and property markers
     */
    showMoreHarvestEntry() {
        return new Promise(resolve => {
            // Remove any existing overlays to prevent accumulation
            const existingOverlays = document.querySelectorAll('.moreharvest-entry');
            existingOverlays.forEach(el => el.remove());

            const overlay = document.createElement('div');
            overlay.className = 'moreharvest-entry';
            overlay.innerHTML = `
                <img class="moreharvest-entry-logo" src="assets/Assets4-white.svg" alt="MoreHarvest" draggable="false">
                <div class="moreharvest-entry-tagline">Japanese property investment made easy.</div>
            `;
            document.body.appendChild(overlay);

            // Fade in
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    overlay.classList.add('visible');
                });
            });

            // Fade out after 2.5 seconds
            setTimeout(() => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    // Ensure removal with fallback
                    if (overlay.parentNode) {
                        overlay.remove();
                    }
                    resolve();
                }, 350);
            }, 2500);
        });
    },

    // ================================
    // PORTFOLIO SUMMARY (Peak Experience)
    // ================================

    /**
     * Calculate and display portfolio summary card
     * Shows combined potential across all explored properties
     */
    showPortfolioSummary() {
        const properties = AppData.properties;

        // Calculate total potential (using average scenario)
        let totalAcquisition = 0;
        let totalNetProfit = 0;
        const propertyNames = [];

        properties.forEach(property => {
            totalAcquisition += property.financials.acquisitionCost;
            totalNetProfit += property.financials.scenarios.average.netProfit;
            propertyNames.push(property.name);
        });

        const formatYen = (num) => {
            if (num >= 10000000) {
                return '¥' + (num / 1000000).toFixed(1) + 'M';
            }
            return '¥' + num.toLocaleString();
        };

        // GKTK fund info
        const gktk = AppData.gktk;
        const gktkHtml = gktk ? `
            <div class="gktk-banner">
                <div class="gktk-label">${gktk.fullName}</div>
                <div class="gktk-size">${gktk.fundSize}</div>
                <div class="gktk-note">${gktk.fundSizeNote} &middot; ${gktk.vintage} vintage &middot; ${gktk.stats[3].value} target IRR</div>
            </div>
        ` : '';

        const content = `
            ${gktkHtml}
            <div class="portfolio-summary">
                <div class="portfolio-summary-label">Combined 5-year potential</div>
                <div class="portfolio-summary-value">${formatYen(totalNetProfit)}</div>
                <div class="portfolio-summary-detail">Projected return across ${properties.length} properties</div>
                <div class="portfolio-summary-properties">
                    ${propertyNames.join(' • ')}
                </div>
            </div>
        `;

        return content;
    },

    /**
     * Return GKTK fund banner HTML (for disclosure sections)
     */
    showGktkSummary() {
        const gktk = AppData.gktk;
        if (!gktk) return '<p>Fund data unavailable.</p>';
        return `
            <div class="gktk-banner">
                <div class="gktk-label">${gktk.fullName}</div>
                <div class="gktk-size">${gktk.fundSize}</div>
                <div class="gktk-note">${gktk.fundSizeNote} &middot; ${gktk.vintage} vintage &middot; ${gktk.stats[3].value} target IRR</div>
            </div>
        `;
    },

    /**
     * Return portfolio returns card HTML (for disclosure sections)
     */
    showPortfolioCard() {
        const properties = AppData.properties;
        let totalNetProfit = 0;
        const propertyNames = [];

        properties.forEach(property => {
            totalNetProfit += property.financials.scenarios.average.netProfit;
            propertyNames.push(property.name);
        });

        const formatYen = (num) => {
            if (num >= 10000000) return '¥' + (num / 1000000).toFixed(1) + 'M';
            return '¥' + num.toLocaleString();
        };

        return `
            <div class="portfolio-summary">
                <div class="portfolio-summary-label">Combined 5-year potential</div>
                <div class="portfolio-summary-value">${formatYen(totalNetProfit)}</div>
                <div class="portfolio-summary-detail">Projected return across ${properties.length} properties</div>
                <div class="portfolio-summary-properties">
                    ${propertyNames.join(' • ')}
                </div>
            </div>
        `;
    },

    /**
     * Show Performance Calculator with headline stat and progressive disclosure
     * @param {Object} property - Property to show financials for
     * @param {string} scenario - Scenario to highlight (default: 'average')
     */
    showPerformanceCalculatorEnhanced(property, scenario = 'average') {
        this.currentProperty = property;
        this.currentScenario = scenario;
        const fin = property.financials;
        const data = fin.scenarios[scenario];

        const formatYen = (num) => '¥' + num.toLocaleString();
        const formatYenCompact = (num) => {
            if (num >= 1000000) return '¥' + (num / 1000000).toFixed(1) + 'M';
            return formatYen(num);
        };
        const formatPercent = (num) => (num >= 0 ? '+' : '') + (num * 100).toFixed(1) + '%';

        // Get confidence info
        const confidence = this.getConfidenceInfo(scenario);
        const sellingPriceInfo = this.formatWithConfidence(data.sellingPrice, scenario);

        const content = `
            <div class="subtitle">Financial projection</div>
            <h2>Performance calculator</h2>

            <!-- HEADLINE STAT - Von Restorff Effect -->
            <div class="headline-stat">
                <div class="headline-stat-label">Projected 5-year return</div>
                <div class="headline-stat-value">${formatYenCompact(data.netProfit)}</div>
                <div class="headline-stat-sublabel">${scenario.charAt(0).toUpperCase() + scenario.slice(1)} case scenario</div>
            </div>

            <!-- SCENARIO SELECTOR -->
            <div class="calculator-section">
                <h4>Scenario comparison</h4>
                <div class="chart-container" style="height: 120px; margin-bottom: 16px;">
                    <canvas id="scenario-chart" role="img" aria-label="Bar chart comparing investment scenarios"></canvas>
                </div>
                <div id="scenario-chart-table"></div>

                <div class="scenario-toggle">
                    <button class="scenario-btn ${scenario === 'bear' ? 'active' : ''}" onclick="UI.showPerformanceCalculatorEnhanced(UI.currentProperty, 'bear')">
                        <span class="scenario-icon" aria-hidden="true">▼</span> Bear
                    </button>
                    <button class="scenario-btn ${scenario === 'average' ? 'active' : ''}" onclick="UI.showPerformanceCalculatorEnhanced(UI.currentProperty, 'average')">
                        <span class="scenario-icon" aria-hidden="true">—</span> Average
                    </button>
                    <button class="scenario-btn ${scenario === 'bull' ? 'active' : ''}" onclick="UI.showPerformanceCalculatorEnhanced(UI.currentProperty, 'bull')">
                        <span class="scenario-icon" aria-hidden="true">▲</span> Bull
                    </button>
                </div>
            </div>

            <!-- PROGRESSIVE DISCLOSURE - Detailed Breakdown -->
            <div class="financials-disclosure" id="financials-disclosure">
                <button class="financials-disclosure-header" onclick="UI.toggleFinancialsDisclosure()" aria-expanded="false" aria-controls="financials-details">
                    <span class="financials-disclosure-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        View detailed breakdown
                    </span>
                    <span class="financials-disclosure-chevron">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </button>
                <div class="financials-disclosure-content" id="financials-details">
                    <div class="calc-row">
                        <span class="calc-label">Acquisition cost</span>
                        <span class="calc-value">${formatYen(fin.acquisitionCost)}</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Appreciation rate</span>
                        <span class="calc-value">${formatPercent(data.appreciation)}/yr</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Est. selling price (5yr)</span>
                        <div class="calc-value-with-confidence">
                            <span class="calc-value">${sellingPriceInfo.display}</span>
                            <span class="confidence-range" title="${confidence.level} confidence">
                                Range: ${sellingPriceInfo.range}
                                <span class="confidence-badge confidence-${confidence.level.toLowerCase()}">${confidence.level}</span>
                            </span>
                        </div>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Rental yield</span>
                        <span class="calc-value">${formatPercent(data.rentalYield)}</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Annual rental income</span>
                        <span class="calc-value">${formatYen(data.annualRent)}</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Applicable taxes</span>
                        <span class="calc-value negative">${formatYen(data.taxes)}</span>
                    </div>
                </div>
            </div>

            <div class="data-attribution">
                <p class="data-timestamp">Sample data &middot; Q1 2026</p>
                <p>Price data from Kumamoto Land Registry (Jan 2026)</p>
            </div>

            <button class="panel-btn" onclick="UI.showEvidence('${property.id}', 'rental')">
                View rental report
            </button>
            <button class="panel-btn" onclick="UI.showAreaStats()">
                Area statistics
            </button>
        `;

        this.showPanel(content);

        // Render chart after DOM update
        setTimeout(() => this.renderScenarioChart(property), 50);
    },

    /**
     * Toggle financials disclosure expanded state
     */
    toggleFinancialsDisclosure() {
        const disclosure = document.getElementById('financials-disclosure');
        const header = disclosure.querySelector('.financials-disclosure-header');
        const isExpanded = disclosure.classList.contains('expanded');

        if (isExpanded) {
            disclosure.classList.remove('expanded');
            header.setAttribute('aria-expanded', 'false');
        } else {
            disclosure.classList.add('expanded');
            header.setAttribute('aria-expanded', 'true');
        }
    },

    // ================================
    // AI CHAT CTAs (Strengthen Ending)
    // ================================

    /**
     * Show AI Chat with CTAs for clear calls to action
     */
    showAIChatWithCTAs() {
        // Show standard AI chat first
        this.showAIChat();

        // Add CTAs section after a delay (when user might be finishing)
        // Note: CTAs are shown immediately in the enhanced version
    },

    /**
     * Get AI Chat CTAs HTML
     * @returns {string} HTML for CTA buttons
     */
    getAIChatCTAsHtml() {
        return `
            <div class="ai-chat-ctas">
                <button class="ai-chat-cta" onclick="UI.downloadSummary()">
                    <span class="ai-chat-cta-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                    </span>
                    Download summary
                </button>
            </div>
        `;
    },

    /**
     * Handle download summary CTA — generates and downloads an HTML summary
     */
    downloadSummary() {
        this.addChatMessage("I'd like to download a summary of this presentation.", 'user');
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();

            // Build summary content from app data
            const properties = AppData.properties || [];
            const companies = AppData.companies || [];
            const gktk = AppData.gktk || {};
            const sciencePark = AppData.sciencePark || {};

            let propertiesHtml = properties.map(p => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.type || '—'}</td>
                    <td>${p.driveTime || '—'}</td>
                    <td>${p.basicStats?.find(s => s.label === 'Floor area')?.value || '—'}</td>
                </tr>
            `).join('');

            let companiesHtml = companies.map(c => `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.subtitle || '—'}</td>
                    <td>${c.stats?.[0]?.value || '—'}</td>
                    <td>${c.stats?.[1]?.value || '—'}</td>
                </tr>
            `).join('');

            const summaryHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Kumamoto investment summary</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1e1f20; }
  h1 { font-size: 28px; margin-bottom: 8px; }
  h2 { font-size: 20px; margin-top: 32px; border-bottom: 2px solid #fbb931; padding-bottom: 8px; }
  .subtitle { color: #6e7073; font-size: 15px; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e8e8ed; }
  th { font-weight: 600; background: #f5f5f7; }
  .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
  .stat-card { background: #f5f5f7; border-radius: 8px; padding: 16px; }
  .stat-value { font-size: 22px; font-weight: 700; color: #1e1f20; }
  .stat-label { font-size: 13px; color: #6e7073; margin-top: 4px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e8e8ed; color: #6e7073; font-size: 13px; }
</style>
</head>
<body>
<h1>Kumamoto investment summary</h1>
<p class="subtitle">Greater Kumamoto Technology Corridor — presentation summary</p>

<h2>Fund overview</h2>
<div class="stat-grid">
  ${(gktk.stats || []).map(s => `<div class="stat-card"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
</div>

<h2>Science Park corridor</h2>
<p>${sciencePark.description || ''}</p>
<div class="stat-grid">
  ${(sciencePark.stats || []).map(s => `<div class="stat-card"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('')}
</div>

<h2>Corporate partners</h2>
<table>
  <thead><tr><th>Company</th><th>Sector</th><th>Investment</th><th>Employees</th></tr></thead>
  <tbody>${companiesHtml}</tbody>
</table>

<h2>Investment properties</h2>
<table>
  <thead><tr><th>Property</th><th>Type</th><th>Drive to JASM</th><th>Floor Area</th></tr></thead>
  <tbody>${propertiesHtml}</tbody>
</table>

<div class="footer">
  <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  <p>This summary is for informational purposes only and does not constitute investment advice.</p>
</div>
</body>
</html>`;

            // Trigger file download
            const blob = new Blob([summaryHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'kumamoto-investment-summary.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.addChatMessage("Your summary has been downloaded. It includes the fund overview, corporate partners, and property details we reviewed.", 'assistant');
        }, 800);
    },

    // ================================
    // DASHBOARD MODE
    // ================================

    /**
     * Start dashboard mode (skips journeys)
     */
    async startDashboardMode() {
        this.dashboardMode = true;

        this.showApp();
        await new Promise(r => setTimeout(r, 600));
        await MapController.waitReady();
        if (MapController.map) MapController.map.resize();

        try {
            MapController.clearAll();
            MapController.resetView();
        } catch (e) {
            console.warn('Dashboard: Error resetting map:', e);
        }

        this.showDashboardToggle();
        this.hidePanelToggle();

        this.showTimeToggle();
        this.setTimeView('present');

        try {
            this.createDashboardMarkers();
        } catch (e) {
            console.error('Dashboard: Error creating markers:', e);
        }

        this.showDataLayers('dashboard');

        // Open inspector panel at stage 8 (real estate overview)
        setTimeout(() => {
            this.renderInspectorPanel(8, { title: 'Kumamoto corridor' });
            this.dashboardPanelOpen = true;
        }, 300);

        setTimeout(() => {
            this.lastChatType = 'aiChat';
            this.showChatFab();
        }, 600);
    },

    /**
     * Show the dashboard toggle button
     */
    showDashboardToggle() {
        if (this.elements.dashboardToggle) {
            this.elements.dashboardToggle.classList.remove('hidden');
        }
    },

    /**
     * Hide the dashboard toggle button
     */
    hideDashboardToggle() {
        if (this.elements.dashboardToggle) {
            this.elements.dashboardToggle.classList.add('hidden');
        }
    },

    /**
     * Toggle dashboard panel open/closed
     */
    toggleDashboardPanel() {
        if (this.dashboardPanelOpen) {
            this.hideDashboardPanel();
        } else {
            this.showDashboardPanel();
        }
    },

    /**
     * Show the dashboard panel (inspector mode)
     */
    showDashboardPanel() {
        this.dashboardPanelOpen = true;

        if (this.elements.dashboardToggle) {
            this.elements.dashboardToggle.classList.add('active');
            this.elements.dashboardToggle.setAttribute('aria-expanded', 'true');
        }

        this.hidePanelToggle();

        const stage = this.inspectorStage || 8;
        this.renderInspectorPanel(stage, { title: this.inspectorTitle || 'Kumamoto corridor' });

    },

    /**
     * Hide the dashboard panel
     */
    hideDashboardPanel() {
        this.dashboardPanelOpen = false;

        // Update toggle button state
        if (this.elements.dashboardToggle) {
            this.elements.dashboardToggle.classList.remove('active');
            this.elements.dashboardToggle.setAttribute('aria-expanded', 'false');
        }

        // Hide panel
        this.elements.rightPanel.classList.remove('visible');
        this.elements.rightPanel.classList.add('hidden');
        this.panelOpen = false;
    },

    /**
     * Create core markers for Dashboard mode (no entrance animations)
     * These markers are needed for data layer toggles to work
     */
    createDashboardMarkers() {
        // Defensive check: ensure map is initialized before accessing it
        if (!MapController.map || !MapController.initialized) {
            console.warn('Dashboard: Map not ready, skipping marker creation');
            return;
        }

        // Create property markers (for 'properties' layer)
        AppData.properties.forEach((property) => {
            const html = MapController._markerIconHtml('property');
            const { marker, element } = MapController._createMarker(property.coords, html, { entrance: 'none', ariaLabel: property.name });

            MapController._addTooltip(marker, element, property.name);
            element.addEventListener('click', () => UI.showPropertyReveal(property));

            MapController.markers[property.id] = marker;
            if (!MapController._layerGroups.properties) MapController._layerGroups.properties = [];
            MapController._layerGroups.properties.push(property.id);

            // Start hidden by default (user toggles visibility)
            marker.remove();
        });

        // Create company markers (for 'companies' layer)
        AppData.companies.forEach((company) => {
            const html = MapController._brandedMarkerHtml(company.id);
            const { marker, element } = MapController._createMarker(company.coords, html, { entrance: 'none', ariaLabel: company.name });

            MapController._addTooltip(marker, element, company.name);
            element.addEventListener('click', () => UI.renderInspectorPanel(5, { title: company.name }));

            MapController.markers[company.id] = marker;
            if (!MapController._layerGroups.companies) MapController._layerGroups.companies = [];
            MapController._layerGroups.companies.push(company.id);

            // Start hidden by default
            marker.remove();
        });

        // Create science park boundary and marker (for 'sciencePark' layer)
        const sp = AppData.sciencePark;
        if (!MapController._layerGroups.sciencePark) MapController._layerGroups.sciencePark = [];

        // Add boundary circle as Mapbox layer
        if (!MapController.map.getSource('science-park-source')) {
            MapController.map.addSource('science-park-source', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: MapController._toMapbox(sp.center)
                    }
                }
            });

            MapController.map.addLayer({
                id: 'science-park-circle',
                type: 'circle',
                source: 'science-park-source',
                paint: {
                    'circle-radius': { stops: [[10, 50], [15, 200]] },
                    'circle-color': '#ff3b30',
                    'circle-opacity': 0.15,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ff3b30',
                    'circle-stroke-opacity': 0.4
                },
                layout: { 'visibility': 'none' }
            });
        }

        // Create science park marker
        const spHtml = MapController._markerIconHtml('sciencePark');
        const { marker: spMarker, element: spElement } = MapController._createMarker(sp.center, spHtml, { entrance: 'none', ariaLabel: 'Kumamoto Science Park' });

        MapController._addTooltip(spMarker, spElement, 'Kumamoto Science Park');
        spElement.addEventListener('click', () => {
            UI.renderInspectorPanel(4, { title: 'Kumamoto Science Park' });
        });

        MapController.markers['science-park'] = spMarker;
        MapController._layerGroups.sciencePark.push('science-park');

        // Start hidden by default
        spMarker.remove();
    },

    // ================================
    // INSPECTOR PANEL SYSTEM
    // ================================

    // Inspector state
    inspectorStage: null,
    inspectorTab: 0,
    inspectorTitle: '',
    inspectorView: 'fund',

    /**
     * Render the inspector panel for a given stage
     */
    renderInspectorPanel(stage, options = {}) {
        const tabDef = STAGE_TABS[stage];
        if (!tabDef) return;

        this.inspectorStage = stage;
        this.inspectorTitle = options.title || tabDef.label || '';

        if (options.property) this.currentProperty = options.property;

        // Auto-select tab when entity focus requires it (e.g. institution -> Universities tab)
        const startTab = options.startTab || 0;
        this.inspectorTab = startTab;

        const subtitle = tabDef.label || '';
        const tabs = tabDef.tabs || [];

        let tabsHtml = '';
        if (tabs.length > 1) {
            tabsHtml = '<div class="inspector-tabs">' +
                tabs.map((t, i) =>
                    `<button class="inspector-tab${i === startTab ? ' active' : ''}" data-tab-index="${i}">${t}</button>`
                ).join('') +
                '</div>';
        }

        const bodyContent = this.renderStageTab(stage, startTab, options);

        // Don't render subtitle when it matches the title (prevents duplicate labels)
        const showSubtitle = subtitle && subtitle !== this.inspectorTitle;

        const html = `
            <div class="inspector-resize-handle"></div>
            <div class="inspector-title-bar">
                ${showSubtitle ? `<div class="inspector-subtitle">${subtitle}</div>` : ''}
                <h2 class="inspector-title">${this.inspectorTitle}</h2>
            </div>
            ${tabsHtml}
            <div class="inspector-body">
                <div class="icard-grid">${bodyContent}</div>
            </div>
        `;

        this.showPanel(html, { clearHistory: true });

        setTimeout(() => {
            const panel = this.elements.rightPanel;
            if (!panel) return;

            panel.querySelectorAll('.inspector-tab').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.switchInspectorTab(parseInt(btn.dataset.tabIndex, 10), options);
                });
            });

            this.initPanelResize();
            this._attachInspectorHandlers(options);
        }, 0);

        // Fly to entity coordinates if provided
        if (options.flyTo && typeof MapController !== 'undefined') {
            MapController.flyToStep(options.flyTo);
        }
    },

    /**
     * Switch active inspector tab
     */
    switchInspectorTab(tabIndex, options = {}) {
        this.inspectorTab = tabIndex;
        const panel = this.elements.rightPanel;
        if (!panel) return;

        panel.querySelectorAll('.inspector-tab').forEach((btn, i) => {
            btn.classList.toggle('active', i === tabIndex);
        });

        const body = panel.querySelector('.inspector-body');
        if (body) {
            body.innerHTML = '<div class="icard-grid">' +
                this.renderStageTab(this.inspectorStage, tabIndex, options) +
                '</div>';
            this._attachInspectorHandlers(options);
        }
    },

    /**
     * Update inspector panel based on current step
     */
    updateInspectorForStep(stepId) {
        const stage = STAGE_MAP[stepId];
        if (!stage || stage <= 2) return;

        if (stage !== this.inspectorStage) {
            const tabDef = STAGE_TABS[stage] || {};
            this.renderInspectorPanel(stage, { title: tabDef.label || '' });
        }
    },

    /**
     * Initialize left-edge panel resize
     */
    initPanelResize() {
        const panel = this.elements.rightPanel;
        if (!panel) return;
        const handle = panel.querySelector('.inspector-resize-handle');
        if (!handle) return;

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handle.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            const onMouseMove = (ev) => {
                const maxWidth = window.innerWidth * 0.6;
                let width = window.innerWidth - ev.clientX;
                width = Math.max(320, Math.min(width, maxWidth));
                panel.style.setProperty('--panel-width', width + 'px');
                panel.style.width = width + 'px';
            };
            const onMouseUp = () => {
                handle.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    },

    /**
     * Render content for a stage tab
     */
    renderStageTab(stage, tabIndex, options = {}) {
        switch (stage) {
            case 1: return this._renderStage1(tabIndex);
            case 3: return this._renderStage3(tabIndex, options);
            case 4: return this._renderStage4(tabIndex);
            case 5: return this._renderStage5(tabIndex);
            case 6: return this._renderStage6(tabIndex, options);
            case 7: return this._renderStage7(tabIndex);
            case 8: return this._renderStage8(tabIndex);
            case 9: return this._renderStage9(tabIndex, options);
            default: return '';
        }
    },

    _renderStage1(tabIndex) {
        const q = AppData.openingQuestion;
        let html = `<div class="icard icard-standard">
            <div class="icard-title">${q.question}</div>
            <p style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: var(--space-2);">Japan designated semiconductors as critical infrastructure, committing unprecedented public funds.</p>
        </div>`;
        const docs = q.supportingDocs || [];
        html += docs.map(doc => this.renderEvidenceDocCard({
            id: doc.id,
            title: doc.title,
            type: doc.type,
            date: doc.source,
            viewed: false
        })).join('');
        return html;
    },

    _renderStage3(tabIndex, options = {}) {
        // Entity-focused view: single institution card
        if (options.institution) {
            return this.renderInstitutionCard(options.institution);
        }
        // Combined workforce + universities in a single scrollable view
        let html = this.renderWorkforceCard();
        html += (AppData.talentPipeline?.institutions || [])
            .map(inst => this.renderInstitutionCard(inst)).join('');
        return html;
    },

    _renderStage4(tabIndex) {
        switch (tabIndex) {
            case 0: {
                let html = this.renderZoneProfileCard(AppData.sciencePark);
                const tiers = AppData.governmentTiers || [];
                tiers.forEach(t => {
                    html += `<div class="icard icard-standard">
                        ${t.tierLabel ? `<div class="icard-source">${t.tierLabel}</div>` : ''}
                        <div class="icard-title">${t.name}</div>
                        <div class="icard-stats-grid">
                            ${(t.stats || []).map(s => `<div class="icard-stat">
                                <div class="icard-stat-value">${s.value}</div>
                                <div class="icard-stat-label">${s.label}</div>
                            </div>`).join('')}
                        </div>
                    </div>`;
                });
                return html;
            }
            case 1: return this.renderTimelineCard(this._gatherTimelineItems('infrastructure'), 'Infrastructure timeline');
            case 2: return this._renderEvidenceForGroup('government-zones');
            default: return '';
        }
    },

    _renderStage5(tabIndex) {
        const companies = AppData.companies || [];
        switch (tabIndex) {
            case 0:
                // Stage 5: card order matches pin-drop animation sequence
                return companies.map(c => this.renderCorporateCard(c)).join('');
            case 1: {
                const items = companies.map(c => ({
                    date: (c.stats?.find(s => s.label.includes('operational') || s.label.includes('Opening') || s.label.includes('Completion'))?.value) || '',
                    title: c.name,
                    meta: (c.stats?.find(s => s.label.includes('investment') || s.label === 'Investment')?.value) || '',
                    status: 'Confirmed'
                }));
                return this.renderTimelineCard(items, 'Corporate commitment timeline');
            }
            case 2: {
                return companies.map(c => {
                    if (!c.evidence) return '';
                    return this.renderEvidenceDocCard({
                        id: c.id + '-evidence',
                        title: c.evidence.title || c.name + ' announcement',
                        type: c.evidence.type || 'pdf',
                        date: '',
                        viewed: false
                    });
                }).join('');
            }
            default: return '';
        }
    },

    _renderStage6(tabIndex, options) {
        const zones = AppData.futureZones || [];
        const zone = options.zone || zones[0] || {};
        switch (tabIndex) {
            case 0: return this.renderZoneProfileCard(zone);
            case 1: {
                let html = '';
                const props = AppData.properties || [];
                if (props.length) {
                    const avgYield = props.reduce((s, p) => {
                        const avg = p.financials?.scenarios?.average;
                        return s + (avg?.rentalYield || 0);
                    }, 0) / props.length;
                    html += this.renderYieldSummaryCard({
                        financials: { scenarios: {
                            bear: { rentalYield: avgYield * 0.8 },
                            average: { rentalYield: avgYield },
                            bull: { rentalYield: avgYield * 1.2 }
                        }}
                    });
                }
                return html;
            }
            case 2: return this._renderEvidenceForGroup('government-zones');
            default: return '';
        }
    },

    _renderStage7(tabIndex) {
        switch (tabIndex) {
            case 0: {
                let html = '';
                const risks = AppData.dataLayers?.riskyArea?.markers || [];
                risks.forEach(r => html += this.renderRiskCard(r));
                const roads = AppData.infrastructureRoads || [];
                roads.forEach(road => {
                    html += `<div class="icard icard-standard">
                        <div class="icard-title">${road.name}</div>
                        <div class="icard-stats-grid">
                            <div class="icard-stat">
                                <div class="icard-stat-value">${road.status}</div>
                                <div class="icard-stat-label">Status</div>
                            </div>
                            <div class="icard-stat">
                                <div class="icard-stat-value">${road.commuteImpact}</div>
                                <div class="icard-stat-label">Commute saved</div>
                            </div>
                            <div class="icard-stat">
                                <div class="icard-stat-value">${road.completionDate}</div>
                                <div class="icard-stat-label">Completion</div>
                            </div>
                            <div class="icard-stat">
                                <div class="icard-stat-value">${road.budget}</div>
                                <div class="icard-stat-label">Budget</div>
                            </div>
                        </div>
                    </div>`;
                });
                return html;
            }
            case 1: return this.renderTimelineCard(this._gatherTimelineItems('history'), 'Event history');
            case 2: {
                let html = this.renderTimelineCard(this._gatherTimelineItems('mitigation'), 'Mitigation investments');
                html += this._renderEvidenceForGroup('transportation-network');
                return html;
            }
            default: return '';
        }
    },

    _renderStage8(tabIndex) {
        switch (tabIndex) {
            case 0: return this.renderDemandCard();
            case 1: {
                let html = '';
                const props = AppData.properties || [];
                if (props.length) {
                    html += this.renderYieldSummaryCard(props[0]);
                }
                const stats = AppData.areaStats || {};
                html += `<div class="icard icard-standard">
                    <div class="icard-title">Area statistics</div>
                    <div class="icard-yield-row">
                        <div class="icard-yield-item">
                            <div class="icard-yield-value">${stats.avgAppreciation || 'n/a'}</div>
                            <div class="icard-yield-label">Avg appreciation</div>
                        </div>
                        <div class="icard-yield-item">
                            <div class="icard-yield-value">${stats.avgRentalYield || 'n/a'}</div>
                            <div class="icard-yield-label">Avg rental yield</div>
                        </div>
                        <div class="icard-yield-item">
                            <div class="icard-yield-value">${stats.occupancyRate || 'n/a'}</div>
                            <div class="icard-yield-label">Occupancy rate</div>
                        </div>
                    </div>
                </div>`;
                return html;
            }
            case 2:
                return (AppData.properties || []).map(p => this.renderPropertySummaryCard(p)).join('');
            default: return '';
        }
    },

    _renderStage9(tabIndex, options) {
        const property = options.property || this.currentProperty || (AppData.properties && AppData.properties[0]) || {};
        switch (tabIndex) {
            case 0:
                return this.renderDecisionBadgeCard(property) +
                    this.renderCalculatorCard(property) +
                    this.renderYieldSummaryCard(property) +
                    this.renderCommuteCard(property);
            case 1:
                return this.renderStickySummaryRow(property) +
                    this.renderFinancialTableCard(this._buildAcquisitionTable(property), 'Acquisition costs') +
                    this.renderFinancialTableCard(this._buildRentalTable(property), 'Rental income projection');
            case 2: {
                let html = '';
                const images = [property.exteriorImage, ...(property.interiorImages || [])].filter(Boolean);
                if (images.length) {
                    html += this.renderEvidenceGalleryCard(images, property.name || 'Property gallery');
                }
                if (property.rentalReport) {
                    html += this.renderEvidenceDocCard({
                        ...property.rentalReport,
                        id: property.id + '-rental-report'
                    });
                }
                return html;
            }
            default: return '';
        }
    },

    // ---- Evidence / timeline helpers ----

    _renderEvidenceForGroup(groupId) {
        const group = AppData.evidenceGroups?.[groupId];
        if (!group || !group.items?.length) {
            return '<div class="icard icard-compact"><p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">No evidence documents available.</p></div>';
        }
        return group.items.map(item => this.renderEvidenceDocCard(item)).join('');
    },

    _gatherTimelineItems(type) {
        if (type === 'infrastructure') {
            const roads = AppData.infrastructureRoads || [];
            const station = AppData.infrastructureStation ? [AppData.infrastructureStation] : [];
            const haramizu = AppData.haramizuStation ? [AppData.haramizuStation] : [];
            return [...roads, ...station, ...haramizu].map(item => ({
                date: item.completionDate || item.completion || '',
                title: item.name || '',
                meta: item.budget || '',
                status: item.status || ''
            }));
        }
        if (type === 'history') {
            return [
                { date: '2016', title: 'Kumamoto earthquake', meta: 'M7.3, significant infrastructure damage', status: 'Past' },
                { date: '2021', title: 'TSMC Japan announced', meta: 'National semiconductor strategy launched', status: 'Past' },
                { date: '2022', title: 'JASM construction begins', meta: 'Phase 1 groundbreaking', status: 'Past' },
                { date: '2024', title: 'JASM Phase 1 operational', meta: 'First wafers produced', status: 'Past' },
                { date: '2025', title: 'Phase 2 construction', meta: 'Second fab under construction', status: 'Current' }
            ];
        }
        if (type === 'mitigation') {
            const risks = AppData.dataLayers?.riskyArea?.markers || [];
            return risks.map(r => ({
                date: r.mitigation?.includes('2025') ? '2025' : '2024',
                title: r.name,
                meta: r.mitigation || '',
                status: 'Planned'
            }));
        }
        return [];
    },

    _buildAcquisitionTable(property) {
        const cost = property.financials?.acquisitionCost || 0;
        const breakdown = property.costBreakdown || {};
        return {
            headers: ['Item', 'Amount'],
            rows: [
                { label: 'Hard costs', values: [this.formatYen(breakdown.hardCosts || Math.round(cost * 0.87))] },
                { label: 'Acquisition fees', values: [this.formatYen(breakdown.acquisitionFees || Math.round(cost * 0.05))], isDisclosure: true, subRows: [
                    { label: 'Agent commission', values: [this.formatYen(Math.round(cost * 0.03))] },
                    { label: 'Legal and admin', values: [this.formatYen(breakdown.legalFees || Math.round(cost * 0.02))] }
                ]},
                { label: 'Fit-out', values: [this.formatYen(breakdown.fitOut || Math.round(cost * 0.04))] },
                { label: 'Stamp duty', values: [this.formatYen(breakdown.stampDuty || Math.round(cost * 0.03))] },
                { label: 'Total investment', values: [this.formatYen(cost)], isTotal: true }
            ]
        };
    },

    _buildRentalTable(property) {
        const rp = property.rentalProjections || {};
        const bear = rp.bear || {};
        const avg = rp.average || {};
        const bull = rp.bull || {};
        return {
            headers: ['', 'Bear', 'Average', 'Bull'],
            rows: [
                { label: 'Monthly rent', values: [this.formatYen(bear.monthlyRent || 0), this.formatYen(avg.monthlyRent || 0), this.formatYen(bull.monthlyRent || 0)] },
                { label: 'Management fee', values: [this.formatYen(bear.managementFee || 0), this.formatYen(avg.managementFee || 0), this.formatYen(bull.managementFee || 0)] },
                { label: 'Vacancy rate', values: [(bear.vacancyRate * 100 || 0).toFixed(0) + '%', (avg.vacancyRate * 100 || 0).toFixed(0) + '%', (bull.vacancyRate * 100 || 0).toFixed(0) + '%'] },
                { label: 'Net annual income', values: [this.formatYen(bear.annualNetIncome || 0), this.formatYen(avg.annualNetIncome || 0), this.formatYen(bull.annualNetIncome || 0)], isTotal: true }
            ]
        };
    },

    // ---- Card renderers ----

    renderDecisionBadgeCard(property) {
        const rec = property.recommendation || 'hold';
        const metrics = property.decisionMetrics || [];
        return `<div class="icard icard-compact icard-decision ${rec}">
            <div class="icard-decision-label">${rec}</div>
            <div class="icard-decision-metrics">
                ${metrics.map(m => `<div class="icard-decision-metric"><strong>${m.label}:</strong> ${m.value}</div>`).join('')}
            </div>
        </div>`;
    },

    renderFinancialTableCard(tableData, title) {
        if (!tableData) return '';
        const headers = tableData.headers || [];
        const rows = tableData.rows || [];

        const renderRow = (row) => {
            const cls = row.isTotal ? 'row-total' : (row.isDisclosure ? 'icard-disclosure-row' : 'row-header');
            let html = `<tr class="${cls}"${row.isDisclosure ? ' data-disclosure="collapsed"' : ''}>
                <td>${row.isDisclosure ? '<span class="disclosure-arrow">&#9654;</span> ' : ''}${row.label}</td>
                ${(row.values || []).map(v => `<td>${v}</td>`).join('')}
            </tr>`;
            if (row.isDisclosure && row.subRows) {
                row.subRows.forEach(sr => {
                    html += `<tr class="icard-sub-row" style="display: none;">
                        <td>${sr.label}</td>
                        ${(sr.values || []).map(v => `<td>${v}</td>`).join('')}
                    </tr>`;
                });
            }
            return html;
        };

        return `<div class="icard icard-hero">
            <div class="icard-title">${title}</div>
            <table class="icard-financial-table">
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows.map(r => renderRow(r)).join('')}</tbody>
            </table>
        </div>`;
    },

    renderCalculatorCard(property) {
        const fin = property.financials || {};
        const scenarios = fin.scenarios || {};
        const scenario = this.currentScenario || 'average';
        const sc = scenarios[scenario] || {};
        const view = this.inspectorView || 'fund';
        const broker = property.brokerMetrics || {};
        const thumb = property.thumbnail || '';

        let statsHtml = '';
        if (view === 'fund') {
            const rows = [
                { label: 'Total cost', value: this.formatYen(fin.acquisitionCost || 0) },
                { label: 'Selling price', value: this.formatYen(sc.sellingPrice || 0) },
                { label: 'Tax', value: this.formatYen(sc.taxes || 0) },
                { label: 'Annual rent', value: this.formatYen(sc.annualRent || 0) },
                { label: 'Net profit', value: this.formatYen(sc.netProfit || 0), highlight: true }
            ];
            statsHtml = rows.map(r => `<div class="icard-calc-row">
                <span class="icard-calc-label">${r.label}</span>
                <span class="icard-calc-value${r.highlight ? ' highlight' : ''}">${r.value}</span>
            </div>`).join('');
        } else {
            const rows = [
                { label: 'Rental high', value: this.formatYen(broker.rentalHigh || 0) + '/mo' },
                { label: 'Rental average', value: this.formatYen(broker.rentalAvg || 0) + '/mo' },
                { label: 'Rental low', value: this.formatYen(broker.rentalLow || 0) + '/mo' },
                { label: 'Projected growth', value: ((broker.projectedGrowth || 0) * 100).toFixed(1) + '%' },
                { label: 'Area average', value: this.formatYen(broker.areaAverage || 0) + '/mo' }
            ];
            statsHtml = rows.map(r => `<div class="icard-calc-row">
                <span class="icard-calc-label">${r.label}</span>
                <span class="icard-calc-value">${r.value}</span>
            </div>`).join('');
        }

        return `<div class="icard icard-hero icard-calculator">
            <div class="icard-calculator-header">
                <div class="icard-title">Return calculator</div>
                ${thumb ? `<img class="icard-calculator-thumbnail" src="${thumb}" alt="${property.name || ''}" />` : ''}
            </div>
            <div class="icard-calculator-controls">
                <div class="icard-scenario-toggle">
                    <button class="icard-scenario-btn${scenario === 'bear' ? ' active' : ''}" data-scenario="bear">Bear</button>
                    <button class="icard-scenario-btn${scenario === 'average' ? ' active' : ''}" data-scenario="average">Avg</button>
                    <button class="icard-scenario-btn${scenario === 'bull' ? ' active' : ''}" data-scenario="bull">Bull</button>
                </div>
                <div class="icard-view-toggle">
                    <button class="icard-view-btn${view === 'fund' ? ' active' : ''}" data-view="fund">Fund manager</button>
                    <button class="icard-view-btn${view === 'broker' ? ' active' : ''}" data-view="broker">Broker</button>
                </div>
            </div>
            <div class="icard-calc-stats">${statsHtml}</div>
        </div>`;
    },

    renderYieldSummaryCard(property) {
        const fin = property.financials || {};
        const scenarios = fin.scenarios || {};
        const bear = scenarios.bear || {};
        const avg = scenarios.average || {};
        const bull = scenarios.bull || {};

        const grossYield = (v) => ((v.rentalYield || 0) * 100).toFixed(1);
        const netYield = (v) => ((v.rentalYield || 0) * 100 * 0.85).toFixed(1);
        const cashOnCash = (v) => ((v.netProfit || 0) / (fin.acquisitionCost || 1) * 100).toFixed(1);

        return `<div class="icard icard-standard">
            <div class="icard-title">Yield summary</div>
            <div class="icard-yield-row">
                <div class="icard-yield-item">
                    <div class="icard-yield-value">${grossYield(avg)}%</div>
                    <div class="icard-yield-label">Gross yield</div>
                    <div class="icard-yield-range">${grossYield(bear)}% - ${grossYield(bull)}%</div>
                </div>
                <div class="icard-yield-item">
                    <div class="icard-yield-value">${netYield(avg)}%</div>
                    <div class="icard-yield-label">Net yield</div>
                    <div class="icard-yield-range">${netYield(bear)}% - ${netYield(bull)}%</div>
                </div>
                <div class="icard-yield-item">
                    <div class="icard-yield-value">${cashOnCash(avg)}%</div>
                    <div class="icard-yield-label">Cash-on-cash</div>
                    <div class="icard-yield-range">${cashOnCash(bear)}% - ${cashOnCash(bull)}%</div>
                </div>
            </div>
        </div>`;
    },

    renderEvidenceDocCard(item) {
        const meta = [item.date || ''].filter(Boolean).join(' ');
        return `<div class="icard icard-compact" data-evidence-id="${item.id || ''}">
            <div class="icard-evidence-doc">
                <div class="icard-evidence-thumb">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div class="icard-evidence-info">
                    <div class="icard-evidence-title">${item.title || 'Document'}</div>
                    ${meta ? `<div class="icard-evidence-meta">${meta}</div>` : ''}
                </div>
                ${item.viewed ? '<span class="icard-evidence-viewed">&#10003;</span>' : ''}
            </div>
        </div>`;
    },

    renderEvidenceGalleryCard(images, title) {
        const thumbs = (images || []).slice(0, 6);
        return `<div class="icard icard-compact">
            <div class="icard-title">${title || 'Gallery'}</div>
            <div class="icard-gallery-grid">
                ${thumbs.map((src, i) => `<img class="icard-gallery-thumb" src="${src}" alt="${title || 'Image'}" data-gallery-index="${i}" loading="lazy" />`).join('')}
            </div>
        </div>`;
    },

    renderCorporateCard(company) {
        const initial = (company.name || 'C').charAt(0);
        const stats = company.stats || [];
        return `<div class="icard icard-standard" data-company-id="${company.id || ''}">
            <div class="icard-corporate-header">
                <div class="icard-corporate-logo">${initial}</div>
                <div>
                    <div class="icard-corporate-name">${company.name}</div>
                    <div class="icard-corporate-subtitle">${company.subtitle || ''}</div>
                </div>
            </div>
            <div class="icard-stats-grid">
                ${stats.map(s => `<div class="icard-stat">
                    <div class="icard-stat-value">${s.value}</div>
                    <div class="icard-stat-label">${s.label}</div>
                </div>`).join('')}
            </div>
        </div>`;
    },

    renderTimelineCard(items, title) {
        if (!items || !items.length) {
            return `<div class="icard icard-hero"><div class="icard-title">${title || 'Timeline'}</div><p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">No timeline data available.</p></div>`;
        }
        const now = new Date().getFullYear();
        return `<div class="icard icard-hero">
            <div class="icard-title">${title || 'Timeline'}</div>
            <div class="icard-timeline">
                ${items.map(item => {
                    const year = parseInt(String(item.date), 10);
                    const isFuture = item.status === 'Planning' || item.status === 'Planned' || (year && year > now);
                    return `<div class="icard-timeline-item${isFuture ? ' future' : ''}">
                        <div class="icard-timeline-date">${item.date || ''}</div>
                        <div class="icard-timeline-title">${item.title || ''}</div>
                        ${item.meta ? `<div class="icard-timeline-meta">${item.meta}</div>` : ''}
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    },

    renderCommuteCard(property) {
        const shifts = property.commuteShifts || {};
        return `<div class="icard icard-standard">
            <div class="icard-title">Commute to JASM</div>
            <div class="icard-stats-grid">
                <div class="icard-stat">
                    <div class="icard-stat-value">${property.distanceToJasm || 'n/a'}</div>
                    <div class="icard-stat-label">Distance</div>
                </div>
                <div class="icard-stat">
                    <div class="icard-stat-value">${property.driveTime || 'n/a'}</div>
                    <div class="icard-stat-label">Drive time</div>
                </div>
            </div>
            <table class="icard-commute-table">
                <thead><tr><th>Shift</th><th>Drive time</th></tr></thead>
                <tbody>
                    <tr><td>2:00 am</td><td>${shifts.shift2am || 'n/a'}</td></tr>
                    <tr><td>8:00 am</td><td>${shifts.shift8am || 'n/a'}</td></tr>
                    <tr><td>Midnight</td><td>${shifts.shiftMidnight || 'n/a'}</td></tr>
                </tbody>
            </table>
        </div>`;
    },

    renderRiskCard(risk) {
        const level = (risk.risk || 'moderate').toLowerCase();
        return `<div class="icard icard-standard">
            <div class="icard-risk-header">
                <span class="icard-risk-severity ${level}"></span>
                <span class="icard-risk-type">${risk.type || 'Risk'} - ${risk.risk || 'Moderate'}</span>
            </div>
            <div class="icard-title">${risk.name || ''}</div>
            ${risk.mitigation ? `<div class="icard-risk-description">${risk.mitigation}</div>` : ''}
        </div>`;
    },

    renderZoneProfileCard(zone) {
        if (!zone) return '';
        const stats = zone.stats || [];
        return `<div class="icard icard-hero">
            ${zone.subtitle ? `<div class="icard-source">${zone.subtitle}</div>` : ''}
            <div class="icard-title">${zone.name || 'Zone profile'}</div>
            <div class="icard-stats-grid">
                ${stats.map(s => `<div class="icard-stat">
                    <div class="icard-stat-value">${s.value}</div>
                    <div class="icard-stat-label">${s.label}</div>
                </div>`).join('')}
            </div>
            ${zone.description ? `<p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-3); line-height: var(--line-height-normal);">${zone.description}</p>` : ''}
        </div>`;
    },

    renderWorkforceCard() {
        const pipeline = AppData.talentPipeline || {};
        const institutions = pipeline.institutions || [];
        return `<div class="icard icard-hero">
            <div class="icard-title">Semiconductor talent pipeline</div>
            ${pipeline.description ? `<p style="font-size: var(--text-sm); color: var(--color-text-secondary); line-height: var(--line-height-normal); margin-bottom: var(--space-3);">${pipeline.description}</p>` : ''}
            <div class="icard-workforce-institutions">
                ${institutions.map(inst => `<div class="icard-institution">
                    <span class="icard-institution-color" style="background: ${inst.color || '#007aff'}"></span>
                    <div>
                        <div class="icard-institution-name">${inst.name}</div>
                        <div class="icard-institution-role">${inst.role || ''}</div>
                    </div>
                </div>`).join('')}
            </div>
        </div>`;
    },

    renderInstitutionCard(inst) {
        if (!inst) return '';
        const details = inst.details || inst.stats || [];
        return `<div class="icard icard-standard icard-institution">
            <div class="icard-inst-header">
                <div class="icard-title" style="margin: 0; padding-right: 0;">${inst.fullName || inst.name}</div>
                ${inst.city ? `<div class="icard-inst-city">${inst.city}</div>` : ''}
            </div>
            ${inst.role ? `<p class="icard-inst-description">${inst.role}</p>` : ''}
            ${details.length ? `<div class="icard-detail-list">
                ${details.map(d => `<div class="icard-detail-row">
                    <span class="icard-detail-label">${d.label}</span>
                    <span class="icard-detail-value">${d.value}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>`;
    },

    renderDemandCard() {
        const demand = AppData.demandProjections || {};
        const forecast = demand.rentalDemandForecast || [];
        if (!forecast.length) {
            return '<div class="icard icard-hero"><div class="icard-title">Rental demand forecast</div><p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">No forecast data available.</p></div>';
        }
        const maxUnits = Math.max(...forecast.map(f => f.units || 0), 1);
        return `<div class="icard icard-hero">
            <div class="icard-title">Rental demand forecast</div>
            <div class="icard-demand-rows">
                ${forecast.map(f => {
                    const pct = Math.round(((f.units || 0) / maxUnits) * 100);
                    return `<div class="icard-demand-row">
                        <span class="icard-demand-year">${f.year || ''}</span>
                        <div class="icard-demand-bar"><div class="icard-demand-fill" style="width: ${pct}%"></div></div>
                        <span class="icard-demand-value">${(f.units || 0).toLocaleString()}</span>
                    </div>`;
                }).join('')}
            </div>
            ${demand.inventoryConstraints ? `<p style="font-size: var(--text-xs); color: var(--color-text-tertiary); margin-top: var(--space-3); line-height: var(--line-height-normal);">${demand.inventoryConstraints}</p>` : ''}
        </div>`;
    },

    renderStickySummaryRow(property) {
        const cost = property.financials?.acquisitionCost || 0;
        const avg = property.financials?.scenarios?.average || {};
        return `<div class="icard-sticky-summary">
            <div>
                <div class="icard-sticky-label">Total investment</div>
                <div class="icard-sticky-value">${this.formatYen(cost)}</div>
            </div>
            <div style="text-align: right;">
                <div class="icard-sticky-label">Projected annual income</div>
                <div class="icard-sticky-value">${this.formatYen(avg.annualRent || 0)}</div>
            </div>
        </div>`;
    },

    renderPropertySummaryCard(property) {
        const thumb = property.thumbnail || property.image || '';
        return `<div class="icard icard-standard" data-property-id="${property.id || ''}" style="cursor: pointer;">
            <div style="display: flex; gap: var(--space-3);">
                ${thumb ? `<img style="width: 64px; height: 48px; border-radius: var(--radius-small); object-fit: cover; flex-shrink: 0;" src="${thumb}" alt="${property.name || ''}" loading="lazy" />` : ''}
                <div>
                    <div class="icard-title" style="margin-bottom: var(--space-1);">${property.name || 'Property'}</div>
                    <div style="font-size: var(--text-xs); color: var(--color-text-tertiary);">${property.distanceToJasm || ''} ${property.driveTime ? '- ' + property.driveTime : ''}</div>
                </div>
            </div>
        </div>`;
    },

    formatYen(amount) {
        if (!amount) return '\u00a50';
        const abs = Math.abs(amount);
        const sign = amount < 0 ? '-' : '';
        if (abs >= 1e12) return sign + '\u00a5' + (abs / 1e12).toFixed(1) + 'T';
        if (abs >= 1e9) return sign + '\u00a5' + (abs / 1e9).toFixed(1) + 'B';
        if (abs >= 1e6) return sign + '\u00a5' + (abs / 1e6).toFixed(1) + 'M';
        return sign + '\u00a5' + abs.toLocaleString();
    },

    // ---- Inspector event handlers ----

    _attachInspectorHandlers(options = {}) {
        const panel = this.elements.rightPanel;
        if (!panel) return;

        // Scenario toggle (calculator card)
        panel.querySelectorAll('.icard-scenario-toggle .icard-scenario-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentScenario = btn.dataset.scenario;
                this._refreshCalculator(options);
            });
        });

        // View toggle (fund / broker)
        panel.querySelectorAll('.icard-view-toggle .icard-view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.inspectorView = btn.dataset.view;
                this._refreshCalculator(options);
            });
        });

        // Financial table disclosure rows
        panel.querySelectorAll('.icard-disclosure-row').forEach(row => {
            row.addEventListener('click', () => {
                const isCollapsed = row.dataset.disclosure === 'collapsed';
                row.dataset.disclosure = isCollapsed ? 'expanded' : 'collapsed';
                const arrow = row.querySelector('.disclosure-arrow');
                if (arrow) arrow.style.transform = isCollapsed ? 'rotate(90deg)' : '';
                let sibling = row.nextElementSibling;
                while (sibling && sibling.classList.contains('icard-sub-row')) {
                    sibling.style.display = isCollapsed ? 'table-row' : 'none';
                    sibling = sibling.nextElementSibling;
                }
            });
        });

        // Gallery thumbs
        panel.querySelectorAll('.icard-gallery-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const grid = thumb.closest('.icard-gallery-grid');
                if (!grid) return;
                const allImgs = Array.from(grid.querySelectorAll('img')).map(img => img.src);
                const idx = parseInt(thumb.dataset.galleryIndex, 10) || 0;
                this.showQuickLook({ type: 'gallery', images: allImgs, startIndex: idx, title: 'Gallery' });
            });
        });

        // Property summary cards (click to open stage 9)
        panel.querySelectorAll('[data-property-id]').forEach(card => {
            card.addEventListener('click', () => {
                const propId = card.dataset.propertyId;
                const property = (AppData.properties || []).find(p => p.id === propId);
                if (property) {
                    this.currentProperty = property;
                    this.renderInspectorPanel(9, { title: property.name, property });
                }
            });
        });

        // Evidence doc cards (click to open Quick Look document preview)
        panel.querySelectorAll('[data-evidence-id]').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const evidenceId = card.dataset.evidenceId;
                if (!evidenceId) return;
                const titleEl = card.querySelector('.icard-evidence-title');
                const metaEl = card.querySelector('.icard-evidence-meta');
                this.showQuickLook({
                    type: 'doc',
                    title: titleEl?.textContent || 'Document',
                    source: metaEl?.textContent || ''
                });
            });
        });
    },

    _refreshCalculator(options = {}) {
        const panel = this.elements.rightPanel;
        if (!panel) return;
        const calc = panel.querySelector('.icard-calculator');
        if (!calc) return;
        const property = options.property || this.currentProperty || AppData.properties?.[0] || {};

        // Update toggle button active states in-place (no DOM replacement)
        const scenario = this.currentScenario || 'average';
        const view = this.inspectorView || 'fund';
        calc.querySelectorAll('.icard-scenario-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scenario === scenario);
        });
        calc.querySelectorAll('.icard-view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Build new stats HTML
        const fin = property.financials || {};
        const scenarios = fin.scenarios || {};
        const sc = scenarios[scenario] || {};
        const broker = property.brokerMetrics || {};
        let statsHtml = '';
        if (view === 'fund') {
            const rows = [
                { label: 'Total cost', value: this.formatYen(fin.acquisitionCost || 0) },
                { label: 'Selling price', value: this.formatYen(sc.sellingPrice || 0) },
                { label: 'Tax', value: this.formatYen(sc.taxes || 0) },
                { label: 'Annual rent', value: this.formatYen(sc.annualRent || 0) },
                { label: 'Net profit', value: this.formatYen(sc.netProfit || 0), highlight: true }
            ];
            statsHtml = rows.map(r => `<div class="icard-calc-row">
                <span class="icard-calc-label">${r.label}</span>
                <span class="icard-calc-value${r.highlight ? ' highlight' : ''}">${r.value}</span>
            </div>`).join('');
        } else {
            const rows = [
                { label: 'Rental high', value: this.formatYen(broker.rentalHigh || 0) + '/mo' },
                { label: 'Rental average', value: this.formatYen(broker.rentalAvg || 0) + '/mo' },
                { label: 'Rental low', value: this.formatYen(broker.rentalLow || 0) + '/mo' },
                { label: 'Projected growth', value: ((broker.projectedGrowth || 0) * 100).toFixed(1) + '%' },
                { label: 'Area average', value: this.formatYen(broker.areaAverage || 0) + '/mo' }
            ];
            statsHtml = rows.map(r => `<div class="icard-calc-row">
                <span class="icard-calc-label">${r.label}</span>
                <span class="icard-calc-value">${r.value}</span>
            </div>`).join('');
        }

        // Crossfade: fade out, swap content, fade in
        const statsEl = calc.querySelector('.icard-calc-stats');
        if (statsEl) {
            statsEl.classList.add('fading');
            setTimeout(() => {
                statsEl.innerHTML = statsHtml;
                statsEl.classList.remove('fading');
            }, 150);
        }
    },

    // ---- Quick Look ----

    showQuickLook(options = {}) {
        const quickLook = document.getElementById('property-quick-look');
        if (!quickLook) return;
        const content = document.getElementById('quick-look-content');
        if (!content) return;

        const type = options.type || 'image';

        if (type === 'image') {
            content.innerHTML = `
                <button id="quick-look-close" aria-label="Close" onclick="UI.hideQuickLook()">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="2" x2="2" y2="14"></line><line x1="2" y1="2" x2="14" y2="14"></line></svg>
                </button>
                <img id="quick-look-image" src="${options.src || ''}" alt="${options.title || ''}" />
            `;
        } else if (type === 'gallery') {
            const images = options.images || [];
            const idx = options.startIndex || 0;
            quickLook.dataset.galleryImages = JSON.stringify(images);
            quickLook.dataset.galleryIndex = idx;
            const src = images[idx] || '';
            content.innerHTML = `
                <button id="quick-look-close" aria-label="Close" onclick="UI.hideQuickLook()">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="2" x2="2" y2="14"></line><line x1="2" y1="2" x2="14" y2="14"></line></svg>
                </button>
                <button id="quick-look-prev" aria-label="Previous" onclick="UI._quickLookNav(-1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <img id="quick-look-image" src="${src}" alt="${options.title || ''}" />
                <button id="quick-look-next" aria-label="Next" onclick="UI._quickLookNav(1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <div style="position: absolute; bottom: var(--space-3); left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.7); font-size: var(--text-xs);">${idx + 1} / ${images.length}</div>
            `;
            this._quickLookKeyHandler = (e) => {
                if (e.key === 'ArrowLeft') this._quickLookNav(-1);
                else if (e.key === 'ArrowRight') this._quickLookNav(1);
                else if (e.key === 'Escape') this.hideQuickLook();
            };
            document.addEventListener('keydown', this._quickLookKeyHandler);
        } else if (type === 'doc') {
            content.innerHTML = `
                <button id="quick-look-close" aria-label="Close" onclick="UI.hideQuickLook()">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="2" x2="2" y2="14"></line><line x1="2" y1="2" x2="14" y2="14"></line></svg>
                </button>
                <div class="quick-look-doc">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <h3>${options.title || 'Document'}</h3>
                    ${options.source ? `<p>${options.source}</p>` : ''}
                </div>
            `;
        }

        quickLook.classList.remove('hidden');
    },

    _quickLookNav(direction) {
        const quickLook = document.getElementById('property-quick-look');
        if (!quickLook) return;
        let images;
        try { images = JSON.parse(quickLook.dataset.galleryImages || '[]'); } catch (e) { return; }
        if (!images.length) return;
        let idx = parseInt(quickLook.dataset.galleryIndex, 10) || 0;
        idx += direction;
        if (idx < 0) idx = images.length - 1;
        if (idx >= images.length) idx = 0;
        quickLook.dataset.galleryIndex = idx;
        const img = document.getElementById('quick-look-image');
        if (img) img.src = images[idx] || '';
        const counter = quickLook.querySelector('[style*="bottom"]');
        if (counter) counter.textContent = `${idx + 1} / ${images.length}`;
    },

    hideQuickLook() {
        const quickLook = document.getElementById('property-quick-look');
        if (quickLook) quickLook.classList.add('hidden');
        if (this._quickLookKeyHandler) {
            document.removeEventListener('keydown', this._quickLookKeyHandler);
            this._quickLookKeyHandler = null;
        }
    },

    /**
     * Format stat label for display
     */
    formatStatLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    },

    /**
     * Set investment scenario and refresh inspector
     */
    setScenario(scenario, propertyId) {
        this.currentScenario = scenario;
        if (propertyId) {
            const property = AppData.properties.find(p => p.id === propertyId);
            if (property) this.currentProperty = property;
        }
        if (this.inspectorStage === 9) {
            this._refreshCalculator({ property: this.currentProperty });
        }
    }
};
