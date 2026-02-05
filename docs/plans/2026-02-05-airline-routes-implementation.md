# Airline Routes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add interactive airline route visualization from Aso Kumamoto Airport showing 7 international destinations during Journey A3 Strategic Location phase.

**Architecture:** Arc lines drawn as bezier curves on Leaflet map, with destination markers that open right panel on click. Routes appear via staggered animation when A3 transitions to Strategic Location phase.

**Tech Stack:** Leaflet.js, vanilla JS, existing MapManager/UI patterns

---

## Task 1: Add Airline Routes Data

**Files:**
- Modify: `js/data.js` (add after line 465, after `jasmLocation`)

**Step 1: Add the airlineRoutes data structure**

Add this after the `jasmLocation` line in `data.js`:

```javascript
    // Journey A: Airline Routes (Strategic Location)
    airlineRoutes: {
        origin: {
            name: 'Aso Kumamoto Airport',
            coords: [32.8373, 130.8551],
            code: 'KMJ'
        },
        destinations: [
            {
                id: 'seoul-incheon',
                name: 'Seoul Incheon',
                coords: [37.4602, 126.4407],
                code: 'ICN',
                country: 'South Korea',
                region: 'Korea',
                status: 'active',
                flightTime: '1h 30m',
                airlines: ['Asiana Airlines', 'Jin Air'],
                frequency: '7 flights/week',
                significance: 'Direct TSMC supply chain link',
                description: 'Direct service to Seoul\'s primary international airport.'
            },
            {
                id: 'busan-gimhae',
                name: 'Busan Gimhae',
                coords: [35.1796, 128.9382],
                code: 'PUS',
                country: 'South Korea',
                region: 'Korea',
                status: 'active',
                flightTime: '1h 15m',
                airlines: ['Jin Air'],
                frequency: '3 flights/week',
                significance: 'TBD',
                description: 'Direct service to South Korea\'s second-largest city.'
            },
            {
                id: 'shanghai-pudong',
                name: 'Shanghai Pudong',
                coords: [31.1443, 121.8083],
                code: 'PVG',
                country: 'China',
                region: 'China',
                status: 'suspended',
                flightTime: '2h 00m',
                airlines: ['TBD'],
                frequency: 'Suspended',
                significance: 'Manufacturing partner access',
                description: 'Service currently suspended.'
            },
            {
                id: 'taiwan-taoyuan',
                name: 'Taiwan Taoyuan',
                coords: [25.0797, 121.2342],
                code: 'TPE',
                country: 'Taiwan',
                region: 'Taiwan',
                status: 'active',
                flightTime: '2h 30m',
                airlines: ['TBD'],
                frequency: 'TBD',
                significance: 'TSMC headquarters connection',
                description: 'Direct service to Taiwan\'s main international gateway.'
            },
            {
                id: 'tainan',
                name: 'Tainan Airport',
                coords: [22.9504, 120.2057],
                code: 'TNN',
                country: 'Taiwan',
                region: 'Taiwan',
                status: 'active',
                flightTime: 'TBD',
                airlines: ['TBD'],
                frequency: 'TBD',
                significance: 'TSMC Fab 18 access',
                description: 'Direct service to southern Taiwan semiconductor hub.'
            },
            {
                id: 'kaohsiung',
                name: 'Kaohsiung International',
                coords: [22.5771, 120.3500],
                code: 'KHH',
                country: 'Taiwan',
                region: 'Taiwan',
                status: 'active',
                flightTime: '2h 15m',
                airlines: ['TBD'],
                frequency: 'TBD',
                significance: 'Southern Taiwan industrial access',
                description: 'Direct service to Taiwan\'s second-largest city.'
            },
            {
                id: 'hong-kong',
                name: 'Hong Kong International',
                coords: [22.3080, 113.9185],
                code: 'HKG',
                country: 'Hong Kong',
                region: 'Hong Kong',
                status: 'suspended',
                flightTime: '3h 00m',
                airlines: ['TBD'],
                frequency: 'Suspended',
                significance: 'Financial hub connection',
                description: 'Service currently suspended.'
            }
        ]
    },
```

**Step 2: Verify data loads without errors**

Open browser console, check `AppData.airlineRoutes` returns the data.

**Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat(data): add airline routes data structure

7 international routes from Aso Kumamoto Airport with
region grouping and significance fields for panel display.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add Airline Routes Layer and Bezier Generation

**Files:**
- Modify: `js/map.js` (add layer initialization and bezier methods)

**Step 1: Add layer initialization**

In `MapManager.init()`, after line 85 (`this.layers.infrastructureRoads = L.layerGroup();`), add:

```javascript
        this.layers.airlineRoutes = L.layerGroup();
```

**Step 2: Add airlineRoutes tracking property**

After line 40 (`infrastructureMarkers: [],`), add:

```javascript
    airlineRoutePolylines: [],
    airlineDestinationMarkers: [],
    airlineOriginMarker: null,
```

**Step 3: Add bezier point generation method**

Add this method after `flyToLocation` (around line 1246):

```javascript
    // ================================
    // AIRLINE ROUTES (Journey A - Strategic Location)
    // ================================

    /**
     * Generate points along a quadratic bezier curve
     * @param {Array} p0 - Start point [lat, lng]
     * @param {Array} p1 - Control point [lat, lng]
     * @param {Array} p2 - End point [lat, lng]
     * @param {number} numPoints - Number of points to generate
     * @returns {Array} Array of [lat, lng] points
     */
    generateBezierPoints(p0, p1, p2, numPoints) {
        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const lat = (1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0];
            const lng = (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1];
            points.push([lat, lng]);
        }
        return points;
    },

    /**
     * Create an arc line (great circle approximation) between two points
     * @param {Array} origin - Start coordinates [lat, lng]
     * @param {Array} destination - End coordinates [lat, lng]
     * @param {string} status - 'active' or 'suspended'
     * @returns {L.Polyline} Leaflet polyline
     */
    createArcLine(origin, destination, status) {
        const midLat = (origin[0] + destination[0]) / 2;
        const midLng = (origin[1] + destination[1]) / 2;

        // Calculate arc height with minimum floor for short routes
        const distance = this.map.distance(origin, destination);
        const arcHeight = Math.max(0.8, distance * 0.00015);

        // Control point offset northward for arc effect
        const arcMid = [midLat + arcHeight, midLng];

        // Generate smooth bezier curve
        const points = this.generateBezierPoints(origin, arcMid, destination, 50);

        return L.polyline(points, {
            color: status === 'active' ? '#007aff' : '#a3a5a8',
            weight: status === 'active' ? 3 : 2,
            opacity: status === 'active' ? 0.8 : 0.5,
            dashArray: status === 'suspended' ? '8, 6' : null,
            className: `airline-route airline-route--${status}`
        });
    },
```

**Step 4: Verify no syntax errors**

Open browser, check console for errors.

**Step 5: Commit**

```bash
git add js/map.js
git commit -m "feat(map): add bezier curve generation for airline routes

Implements quadratic bezier with minimum arc height to ensure
even short routes read as flight paths.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add Airline Routes Display Methods

**Files:**
- Modify: `js/map.js` (add show/hide methods)

**Step 1: Add origin marker method**

Add after `createArcLine`:

```javascript
    /**
     * Create origin airport marker (Aso Kumamoto Airport)
     * Larger than destination markers, branded yellow
     */
    createAirportOriginMarker() {
        const origin = AppData.airlineRoutes.origin;

        const marker = L.marker(origin.coords, {
            icon: L.divIcon({
                className: 'airport-origin-marker',
                html: `
                    <div style="
                        width: 48px;
                        height: 56px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: ${MAP_COLORS.primary};
                            border: 3px solid white;
                            border-radius: 50%;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
                                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                            </svg>
                        </div>
                        <span style="
                            font-family: var(--font-display);
                            font-size: 11px;
                            font-weight: 600;
                            color: var(--color-text-primary);
                            background: white;
                            padding: 2px 6px;
                            border-radius: 4px;
                            margin-top: 4px;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                        ">${origin.code}</span>
                    </div>
                `,
                iconSize: [48, 56],
                iconAnchor: [24, 28]
            })
        });

        marker.bindTooltip(origin.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -30],
            className: 'map-tooltip'
        });

        return marker;
    },

    /**
     * Create destination airport marker
     * @param {Object} destination - Destination data
     */
    createDestinationMarker(destination) {
        const color = destination.status === 'active' ? '#007aff' : '#a3a5a8';

        const marker = L.marker(destination.coords, {
            icon: L.divIcon({
                className: 'airport-destination-marker',
                html: `
                    <div style="
                        width: 36px;
                        height: 36px;
                        background: ${color};
                        border: 2px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: transform 0.15s ease;
                    ">
                        <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            })
        });

        marker.bindTooltip(`${destination.name} (${destination.code})`, {
            permanent: false,
            direction: 'top',
            offset: [0, -20],
            className: 'map-tooltip'
        });

        marker.on('click', () => {
            UI.showAirlineRoutePanel(destination);
        });

        return marker;
    },
```

**Step 2: Add main show/hide methods**

```javascript
    /**
     * Utility sleep function for animations
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Show airline routes with staggered animation
     * Called when A3 transitions to Strategic Location phase
     */
    async showAirlineRoutes() {
        const routes = AppData.airlineRoutes;
        const origin = routes.origin.coords;

        // Clear any existing
        this.hideAirlineRoutes();

        // 1. Show origin marker immediately
        this.airlineOriginMarker = this.createAirportOriginMarker();
        this.layers.airlineRoutes.addLayer(this.airlineOriginMarker);
        this.layers.airlineRoutes.addTo(this.map);

        // 2. Animated zoom out to East Asia view
        await new Promise(resolve => {
            this.map.flyTo([28, 122], 4, { duration: 1.2 });
            setTimeout(resolve, 1300);
        });

        // 3. Draw routes with stagger
        for (let i = 0; i < routes.destinations.length; i++) {
            await this.sleep(150);
            const dest = routes.destinations[i];
            const arcLine = this.createArcLine(origin, dest.coords, dest.status);
            this.airlineRoutePolylines.push(arcLine);
            this.layers.airlineRoutes.addLayer(arcLine);
        }

        // 4. Add destination markers after all routes drawn
        await this.sleep(200);
        routes.destinations.forEach(dest => {
            const marker = this.createDestinationMarker(dest);
            this.airlineDestinationMarkers.push(marker);
            this.layers.airlineRoutes.addLayer(marker);
        });
    },

    /**
     * Hide airline routes and clean up
     */
    hideAirlineRoutes() {
        this.layers.airlineRoutes.clearLayers();
        this.airlineRoutePolylines = [];
        this.airlineDestinationMarkers = [];
        this.airlineOriginMarker = null;
    },
```

**Step 3: Verify no syntax errors**

Open browser, check console.

**Step 4: Commit**

```bash
git add js/map.js
git commit -m "feat(map): add airline route display with staggered animation

Origin marker, destination markers, and arc lines with
coordinated reveal sequence for presentation impact.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Add Airline Route Panel in UI

**Files:**
- Modify: `js/ui.js` (add panel rendering methods)

**Step 1: Add showAirlineRoutePanel method**

Add after `showStationPanel` method (around line 1227):

```javascript
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
                            ⚠ Service Suspended
                        </div>
                    </div>
                </div>
            `
            : `
                <div class="stat-grid" style="grid-template-columns: 1fr;">
                    <div class="stat-item" style="text-align: center;">
                        <div class="stat-value" style="font-size: var(--text-4xl); color: var(--color-info);">${destination.flightTime}</div>
                        <div class="stat-label">Flight Time</div>
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
                    <div class="stat-label">Flight Time (when active)</div>
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

        const content = `
            <div class="subtitle">International Route</div>
            <h2>${destination.name} (${destination.code})</h2>

            ${headlineHtml}

            <div class="stat-grid">
                ${statsHtml}
            </div>

            <p>${destination.description}</p>

            <button class="panel-btn secondary" onclick="UI.showAllAirlineRoutes()">
                View All Routes →
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

        const activeHtml = activeRoutes.map(r => `
            <div class="route-list-item" onclick="UI.showAirlineRoutePanel(AppData.airlineRoutes.destinations.find(d => d.id === '${r.id}'))" style="
                padding: 12px;
                margin-bottom: 8px;
                background: var(--color-bg-secondary);
                border-radius: var(--radius-medium);
                cursor: pointer;
                transition: background 0.15s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500;">${r.name} (${r.code})</span>
                    <span style="color: var(--color-text-secondary);">${r.flightTime}</span>
                </div>
                <div style="font-size: var(--text-sm); color: var(--color-text-tertiary); margin-top: 4px;">
                    ${r.region} · ${r.frequency}
                </div>
            </div>
        `).join('');

        const suspendedHtml = suspendedRoutes.map(r => `
            <div class="route-list-item" onclick="UI.showAirlineRoutePanel(AppData.airlineRoutes.destinations.find(d => d.id === '${r.id}'))" style="
                padding: 12px;
                margin-bottom: 8px;
                background: var(--color-bg-secondary);
                border-radius: var(--radius-medium);
                cursor: pointer;
                opacity: 0.6;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500;">${r.name} (${r.code})</span>
                    <span style="color: var(--color-text-tertiary);">Suspended</span>
                </div>
            </div>
        `).join('');

        const content = `
            <div class="subtitle">Aso Kumamoto Airport</div>
            <h2>All International Routes</h2>

            <p style="margin-bottom: 16px;">7 destinations across 4 regions connecting Kumamoto to key Asian markets.</p>

            <h4 style="margin-bottom: 12px; color: var(--color-text-secondary);">Active Routes (${activeRoutes.length})</h4>
            ${activeHtml}

            <h4 style="margin-top: 24px; margin-bottom: 12px; color: var(--color-text-tertiary);">Suspended Routes (${suspendedRoutes.length})</h4>
            ${suspendedHtml}
        `;

        this.showPanel(content);
    },
```

**Step 2: Verify no syntax errors**

Open browser, check console.

**Step 3: Commit**

```bash
git add js/ui.js
git commit -m "feat(ui): add airline route panel and route list views

Individual route panels with headline metrics, stats grid,
and significance. All-routes view shows active/suspended grouping.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Split A3 into Two Phases

**Files:**
- Modify: `js/app.js` (split stepA3, add stepA3_location)

**Step 1: Modify state initialization**

In `App` object, after `resourcesExplored: [],` (around line 12), add:

```javascript
        a3Phase: null, // 'infrastructure' or 'location'
```

**Step 2: Replace stepA3 method**

Find the existing `stepA3()` method (around line 160) and replace it with:

```javascript
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
```

**Step 3: Update transitionToJourneyB to clear routes**

Find `transitionToJourneyB()` method and add route cleanup after `UI.hidePanel();`:

```javascript
    async transitionToJourneyB() {
        // Save Journey A content to history BEFORE transition
        UI.saveChatboxToHistory();

        UI.hideChatbox();
        UI.hidePanel();

        // Clear airline routes before transition
        MapManager.hideAirlineRoutes();

        // Show memorable journey transition (Peak-End Rule)
        await UI.showJourneyTransition('B');

        this.startJourneyB();
    },
```

**Step 4: Test the flow**

1. Start app
2. Click through A1 → A2 → explore resource → A3
3. Verify A3 shows "Existing Semiconductor Infrastructure" first
4. Click "See Strategic Location"
5. Verify map zooms out, routes animate in
6. Click a destination marker
7. Verify panel shows route details

**Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat(app): split A3 into infrastructure and location phases

Routes appear only when Strategic Location section activates,
preventing distraction during semiconductor infrastructure narrative.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update Legend for A3 Location Phase

**Files:**
- Modify: `js/ui.js` (update showLegend method)

**Step 1: Find showLegend method and add airline routes case**

Locate the `showLegend` method in ui.js. Add a new case for 'A3-location' or modify the 'A' case to handle the phase.

Add this after the existing legend items setup:

```javascript
    /**
     * Show legend for airline routes (A3 location phase)
     */
    showAirlineRoutesLegend() {
        const legendHtml = `
            <div class="legend-item" style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <div style="
                    width: 20px; height: 20px;
                    background: #fbb931;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    display: flex; align-items: center; justify-content: center;
                ">
                    <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                </div>
                <span style="font-size: var(--text-sm);">Aso Kumamoto Airport</span>
            </div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <div style="
                    width: 20px; height: 20px;
                    background: #007aff;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    display: flex; align-items: center; justify-content: center;
                ">
                    <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                </div>
                <span style="font-size: var(--text-sm);">Active Route</span>
            </div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 12px;">
                <div style="
                    width: 20px; height: 20px;
                    background: #a3a5a8;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    display: flex; align-items: center; justify-content: center;
                ">
                    <svg viewBox="0 0 24 24" fill="white" width="12" height="12">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                </div>
                <span style="font-size: var(--text-sm);">Suspended Route</span>
            </div>
        `;

        this.elements.legend.innerHTML = legendHtml;
        this.elements.legend.classList.remove('hidden');
    },
```

**Step 2: Call legend from stepA3_location**

In `app.js`, update `stepA3_location()` to show the legend:

```javascript
    async stepA3_location() {
        this.state.a3Phase = 'location';

        // Show airline routes legend
        UI.showAirlineRoutesLegend();

        // Show airline routes with animation
        await MapManager.showAirlineRoutes();
        // ... rest of method
    },
```

**Step 3: Hide legend on transition to Journey B**

In `transitionToJourneyB()`, add legend hide:

```javascript
        // Hide legend before transition
        UI.hideLegend();
```

**Step 4: Commit**

```bash
git add js/ui.js js/app.js
git commit -m "feat(ui): add airline routes legend for A3 location phase

Shows origin marker, active route, and suspended route
indicators matching the map visualization.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Test Complete Flow and Adjust Zoom

**Files:**
- May need to adjust: `js/map.js` (zoom coordinates)

**Step 1: Full flow test**

1. Refresh browser, start journey
2. Navigate: A1 → A2 → select resource → A3 (infrastructure)
3. Click "See Strategic Location"
4. Verify:
   - Map smoothly zooms to East Asia
   - Origin marker (yellow, KMJ label) appears first
   - Routes animate in one by one
   - Destination markers appear after routes
   - All 7 destinations visible (especially Hong Kong in southwest)
5. Click Seoul Incheon marker
6. Verify panel shows flight time headline, stats, description
7. Click "View All Routes →"
8. Verify all-routes list panel appears
9. Click "See Government Commitment"
10. Verify routes clear, map transitions to Journey B

**Step 2: Adjust zoom if needed**

If Hong Kong is cut off, modify the `flyTo` in `showAirlineRoutes()`:

```javascript
// Try [26, 120] or zoom 3 if destinations are cut off
this.map.flyTo([26, 120], 4, { duration: 1.2 });
```

**Step 3: Final commit if adjustments made**

```bash
git add js/map.js
git commit -m "fix(map): adjust zoom center to fit all destinations

Ensures Hong Kong visible in southwest corner.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Final Verification and Cleanup

**Step 1: Check console for errors**

Open browser console, run through entire Journey A flow. Fix any errors.

**Step 2: Verify design document alignment**

Compare implementation against `docs/plans/2026-02-05-airline-routes-design.md`:
- [x] Data structure matches
- [x] Arc lines with bezier
- [x] Staggered animation
- [x] Active vs suspended styling
- [x] Panel layout matches spec
- [x] A3 two-phase split
- [x] Legend updates

**Step 3: Create summary commit**

If all tasks complete and working:

```bash
git log --oneline -10
```

Review commits, ensure feature is complete.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add airline routes data | data.js |
| 2 | Add bezier generation | map.js |
| 3 | Add route display methods | map.js |
| 4 | Add route panel UI | ui.js |
| 5 | Split A3 into phases | app.js |
| 6 | Update legend | ui.js, app.js |
| 7 | Test and adjust zoom | map.js |
| 8 | Final verification | all |

**Estimated commits:** 6-8 incremental commits
