/**
 * MapController — Unified Mapbox GL JS 3D map engine
 *
 * Replaces both MapManager (Leaflet) and MapboxReveal (Mapbox overlay).
 * Single persistent Mapbox GL JS instance for all journeys with cinematic
 * camera choreography throughout.
 *
 * API:
 *   MapController.init()                          — Create Mapbox instance + 3D buildings
 *   MapController.cinematicEntry()                — Sky-to-Kumamoto arrival
 *   MapController.flyToStep(config)               — Cinematic camera flight to any position
 *   MapController.elevateToCorridorView()         — Tilt into 3D corridor for Journey C
 *   MapController.forwardReveal(property)         — Bird's-eye drill-down to property
 *   MapController.reverseReveal()                 — Fly back to corridor
 *   MapController.addPropertyMarkers(properties)  — Amber markers on Mapbox
 *   MapController.addRouteLines(properties, jasm) — Route lines to JASM
 *   MapController.preloadImages(property)         — Preload images on hover
 *   MapController.destroy()                       — Reset state (app restart)
 */

/**
 * Design system colors — mirrors CSS custom properties from CLAUDE.md
 */
const MAP_COLORS = {
    primary: '#fbb931',
    error: '#ff3b30',
    info: '#007aff',
    warning: '#ff9500',
    success: '#34c759',
    resource: '#ff3b30',
    company: '#007aff',
    property: '#ff9500',
    zone: '#5856D6',
    route: '#64748b',
    infrastructure: '#5ac8fa',
    evidencePdf: '#6e7073',
    evidenceImage: '#007aff',
    evidenceWeb: '#34c759'
};

/**
 * Camera positions for each journey step — cinematic choreography
 * All centers are [lng, lat] (Mapbox format)
 */
const CAMERA_STEPS = {
    A0: { center: [130.78, 32.82], zoom: 11.5, pitch: 45, bearing: 10, duration: 2000 },
    A1: { center: [130.78, 32.83], zoom: 11.5, pitch: 45, bearing: -5, duration: 1500 },
    A2_overview: { center: [130.75, 32.80], zoom: 8.5, pitch: 35, bearing: 0, duration: 2500 },
    A2_water: { center: [130.90, 32.88], zoom: 13, pitch: 50, bearing: 25, duration: 2000 },
    A2_power: { center: [130.65, 32.75], zoom: 12, pitch: 45, bearing: -15, duration: 2000 },
    A3_ecosystem: { center: [130.78, 32.84], zoom: 11.5, pitch: 50, bearing: 20, duration: 2000 },
    A3_location: { center: [129.5, 31.5], zoom: 5, pitch: 20, bearing: 0, duration: 3000 },
    A3_talent: { center: [130.7, 32.5], zoom: 7, pitch: 25, bearing: 0, duration: 2500 },
    A_to_B: { center: [130.75, 32.84], zoom: 11, pitch: 48, bearing: -10, duration: 2500 },
    B1: { center: [130.78, 32.84], zoom: 11.5, pitch: 48, bearing: -10, duration: 2000 },
    B1_sciencePark: { center: [130.78, 32.87], zoom: 11, pitch: 45, bearing: 5, duration: 1500 },
    B4: { center: [130.80, 32.86], zoom: 12, pitch: 52, bearing: 30, duration: 2500 },
    B6: { center: [130.83, 32.87], zoom: 11.5, pitch: 50, bearing: -20, duration: 2000 },
    B7: { center: [130.80, 32.86], zoom: 12, pitch: 55, bearing: 15, duration: 2500 },
    B_to_C: { center: [130.82, 32.82], zoom: 12.5, pitch: 50, bearing: -15, duration: 2000 },
    corridor: { center: [130.82, 32.82], zoom: 12.5, pitch: 50, bearing: -15, duration: 2000 },
    complete: { center: [130.78, 32.84], zoom: 11, pitch: 40, bearing: 0, duration: 2000 }
};

const MapController = {
    map: null,
    initialized: false,
    _initStarted: false,
    _readyPromise: null,
    _currentAnimation: null,
    reducedMotion: false,
    revealing: false,
    corridorMode: false,
    _corridorView: null,
    _previousView: null,
    skipButton: null,

    // Marker tracking
    markers: {},              // mapboxgl.Marker instances by ID
    _markerElements: {},      // DOM elements for cleanup
    popups: {},

    // Layer tracking — source/layer IDs per group for batch show/hide
    _layerGroups: {
        resources: [],
        sciencePark: [],
        companies: [],
        futureZones: [],
        properties: [],
        route: [],
        evidenceMarkers: [],
        infrastructureRoads: [],
        airlineRoutes: [],
        kyushuEnergy: [],
        governmentChain: [],
        investmentZones: [],
        semiconductorNetwork: [],
        talentPipeline: []
    },

    // Infrastructure road tracking
    selectedInfrastructureRoad: null,
    infrastructureRoadPolylines: {},
    infrastructureMarkers: [],

    // Airline route tracking
    airlineRoutePolylines: [],
    airlineDestinationMarkers: [],
    airlineOriginMarker: null,

    // Data layer tracking
    dataLayerMarkers: {},
    _dataLayerGroups: {},

    // Animated route layer tracking (traffic flow, rail commute)
    _animatedLayers: {
        trafficFlow: { active: false, routes: [] },
        railCommute: { active: false, routes: [] }
    },
    _animationFrame: null,
    _animationOffset: 0,

    // Evidence marker tracking
    highlightedEvidenceMarker: null,

    // Pre-data-layer view save
    preDataLayerView: null,

    // Heartbeat — ambient life between interactions
    _heartbeat: {
        active: false,
        driftInterval: null,
        bearingPerTick: 0.05,   // degrees per tick (~0.5°/10s)
        tickMs: 1000,           // tick interval
        idleTimeout: null,
        idleThreshold: 5000,    // ms of no interaction before drift starts
        pulsingMarkers: []
    },

    // ================================
    // LIFECYCLE
    // ================================

    /**
     * Initialize the Mapbox GL JS map
     */
    init() {
        if (this._initStarted) return;
        this._initStarted = true;

        const token = window.MAPBOX_ACCESS_TOKEN;
        if (!token || token === 'YOUR_TOKEN_HERE') {
            console.warn('MapController: No valid Mapbox access token.');
            this._readyPromise = Promise.resolve(false);
            return;
        }

        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        mapboxgl.accessToken = token;

        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [130.75, 32.8],
            zoom: 10,
            pitch: 0,
            bearing: 0,
            antialias: true,
            interactive: false,  // Disabled during cinematic entry
            attributionControl: false
        });

        this.map.on('style.load', () => {
            this._addBuildingLayer();
        });

        // Skip button for cinematic entry
        this.skipButton = document.getElementById('cinematic-skip');
        if (this.skipButton) {
            this.skipButton.addEventListener('click', () => {
                this.skipCinematicEntry();
            });
        }

        this._readyPromise = new Promise((resolve) => {
            this.map.on('error', (e) => {
                console.error('MapController: Map error —', e.error?.message || e.message || e);
            });

            this.map.on('load', () => {
                this.initialized = true;
                resolve(true);
            });

            setTimeout(() => {
                if (!this.initialized) {
                    console.warn('MapController: Timed out waiting for map load.');
                    resolve(false);
                }
            }, 8000);
        });
    },

    /**
     * Wait for the map to be ready
     */
    async waitReady() {
        if (this._readyPromise) {
            return await this._readyPromise;
        }
        return this.initialized;
    },

    // ================================
    // CAMERA
    // ================================

    /**
     * Cinematic arrival — camera descends from Kyushu aerial to Kumamoto
     */
    async cinematicEntry() {
        if (!this.initialized && this._readyPromise) {
            const ready = await this._readyPromise;
            if (!ready) return;
        } else if (!this.initialized) {
            return;
        }

        if (this.reducedMotion) return;

        const thisAnimation = { cancelled: false };
        this._currentAnimation = thisAnimation;
        const map = this.map;

        // Position camera high over Kyushu
        map.jumpTo({
            center: [131.0, 33.5],
            zoom: 6,
            pitch: 0,
            bearing: 0
        });

        await this._frame();
        map.resize();
        await this._frame();

        // Show skip button after a moment
        if (this.skipButton) {
            await this._delay(500);
            if (thisAnimation.cancelled) return;
            this.skipButton.classList.add('visible');
        }

        // Stage 1: Descend — zoom 6→10, pitch 0→40
        map.flyTo({
            center: [130.75, 32.8],
            zoom: 10,
            pitch: 40,
            bearing: 0,
            duration: 2000,
            essential: true
        });

        await this._waitForMoveEnd(3000);
        if (thisAnimation.cancelled) return;

        // Stage 2: Settle — zoom 10→12.5, pitch 40→50
        map.flyTo({
            center: [130.78, 32.82],
            zoom: 12.5,
            pitch: 50,
            bearing: 15,
            duration: 1500,
            essential: true
        });

        await this._waitForMoveEnd(2500);
        if (thisAnimation.cancelled) return;

        // Hold for a breath — let the audience absorb where they are
        await this._delay(600);
        if (thisAnimation.cancelled) return;

        // Hide skip button
        if (this.skipButton) this.skipButton.classList.remove('visible');

        // Enable user interaction after cinematic entry
        this._enableInteraction();

        // Start ambient heartbeat
        this.startHeartbeat();

        this._currentAnimation = null;
    },

    /**
     * Skip the cinematic entry
     */
    skipCinematicEntry() {
        if (this._currentAnimation) {
            this._currentAnimation.cancelled = true;
            this.map.stop();
            this._currentAnimation = null;
        }
        if (this.skipButton) this.skipButton.classList.remove('visible');

        // Jump to the end position
        this.map.jumpTo({
            center: [130.78, 32.82],
            zoom: 12.5,
            pitch: 50,
            bearing: 15
        });

        this._enableInteraction();
        this.startHeartbeat();
    },

    /**
     * Fly camera to a step position with cinematic easing
     * @param {Object} config — { center, zoom, pitch, bearing, duration }
     */
    async flyToStep(config) {
        if (!this.initialized) return;

        // Pause heartbeat drift during programmatic camera moves
        this.pauseHeartbeat();

        const map = this.map;
        const duration = config.duration || 2000;

        if (this.reducedMotion) {
            map.jumpTo({
                center: config.center,
                zoom: config.zoom,
                pitch: config.pitch,
                bearing: config.bearing
            });
            this._resetIdleTimer();
            return;
        }

        map.flyTo({
            center: config.center,
            zoom: config.zoom,
            pitch: config.pitch,
            bearing: config.bearing,
            duration: duration,
            essential: true
        });

        await this._waitForMoveEnd(duration + 1500);

        // Resume heartbeat idle timer after camera settles
        this._resetIdleTimer();
    },

    /**
     * Elevate to 3D corridor view for Journey C
     */
    async elevateToCorridorView() {
        if (!this.initialized && this._readyPromise) {
            const ready = await this._readyPromise;
            if (!ready) return;
        } else if (!this.initialized) {
            return;
        }

        this.corridorMode = true;
        this._corridorView = CAMERA_STEPS.corridor;

        if (this.reducedMotion) {
            this.map.jumpTo(this._corridorView);
            return;
        }

        this.map.flyTo({
            ...this._corridorView,
            duration: 2000,
            essential: true
        });

        await this._waitForMoveEnd(3000);
    },

    /**
     * Bird's-eye camera tilt to property location (enhanced)
     * @param {Object} property — Property data with coords [lat, lng]
     */
    async forwardReveal(property) {
        if (this._currentAnimation) {
            this._currentAnimation.cancelled = true;
            this.map.stop();
        }

        if (!this.initialized && this._readyPromise) {
            const ready = await this._readyPromise;
            if (!ready) return;
        } else if (!this.initialized) {
            return;
        }

        this.revealing = true;
        const thisAnimation = { cancelled: false };
        this._currentAnimation = thisAnimation;
        const map = this.map;

        // Save corridor view for reverse
        if (this.corridorMode) {
            this._previousView = this._corridorView;
        } else {
            this._previousView = {
                center: map.getCenter().toArray(),
                zoom: map.getZoom(),
                pitch: map.getPitch(),
                bearing: map.getBearing()
            };
        }

        const targetCenter = this._toMapbox(property.coords);
        const bearing = property.bestBearing ||
            this._calculateBearing(map.getCenter(), targetCenter);

        if (this.reducedMotion) {
            map.jumpTo({ center: targetCenter, zoom: 18, pitch: 65, bearing });
            await this._delay(100);
            this.revealing = false;
            this._currentAnimation = null;
            return;
        }

        // Street-level drill-down: zoom 18, pitch 65 for true street view
        map.flyTo({
            center: targetCenter,
            zoom: 18,
            pitch: 65,
            bearing: bearing,
            duration: 2500,
            essential: true
        });

        await this._waitForMoveEnd(4000);
        if (thisAnimation.cancelled) { this.revealing = false; return; }

        // Gentle orbit at street level — rotate bearing by 15° over 2.5s
        if (!thisAnimation.cancelled) {
            map.easeTo({
                bearing: bearing + 15,
                duration: 2500,
                easing: (t) => t * (2 - t) // ease-out
            });
        }

        this.revealing = false;
        this._currentAnimation = null;
    },

    /**
     * Fly camera back to saved view
     */
    async reverseReveal() {
        if (!this.initialized) return;

        if (this._currentAnimation) {
            this._currentAnimation.cancelled = true;
            this.map.stop();
            this._currentAnimation = null;
        }

        // Restore default building opacity
        this.setBuildingOpacity(0.5);

        this.revealing = false;
        const map = this.map;

        // Corridor mode: fly back to corridor view
        if (this.corridorMode && this._corridorView) {
            if (this.reducedMotion) {
                map.jumpTo(this._corridorView);
                this._previousView = null;
                return;
            }

            map.flyTo({
                ...this._corridorView,
                duration: 1500,
                essential: true,
                easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
            });

            await this._waitForMoveEnd(2500);
            this._previousView = null;
            return;
        }

        // Standard mode: fly back to previous view
        const previousView = this._previousView;
        if (previousView) {
            if (this.reducedMotion) {
                map.jumpTo(previousView);
            } else {
                map.flyTo({
                    center: previousView.center,
                    zoom: previousView.zoom,
                    pitch: previousView.pitch,
                    bearing: previousView.bearing,
                    duration: 1500,
                    essential: true
                });
                await this._waitForMoveEnd(2500);
            }
        }

        this._previousView = null;
    },

    // ================================
    // MARKERS — HTML Markers with Elevation Effect
    // ================================

    /**
     * Create a Mapbox GL JS HTML marker
     * @param {Array} coords — [lat, lng] (data format)
     * @param {string} html — Inner HTML for marker element
     * @param {Object} options — { className, anchor, offset }
     * @returns {{ marker: mapboxgl.Marker, element: HTMLElement }}
     */
    _createMarker(coords, html, options = {}) {
        // Defensive check: ensure map exists before creating markers
        if (!this.map || !this.initialized) {
            console.warn('MapController: Attempted to create marker before map initialized');
            return { marker: null, element: null };
        }

        const el = document.createElement('div');
        el.className = options.className || 'mapbox-marker-wrapper';
        el.innerHTML = html;

        // Apply entrance animation to inner element (not wrapper)
        // to avoid interfering with Mapbox's transform positioning
        if (options.entrance && el.firstElementChild) {
            el.firstElementChild.classList.add(`marker-${options.entrance}`);
        }

        // Keyboard accessibility
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        if (options.ariaLabel) {
            el.setAttribute('aria-label', options.ariaLabel);
        }
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });

        try {
            const marker = new mapboxgl.Marker({
                element: el,
                anchor: options.anchor || 'center',
                offset: options.offset || [0, 0]
            })
            .setLngLat(this._toMapbox(coords))
            .addTo(this.map);

            return { marker, element: el };
        } catch (error) {
            console.error('MapController: Failed to create marker:', error);
            // Clean up the orphaned element
            if (el.parentNode) el.remove();
            return { marker: null, element: null };
        }
    },

    /**
     * Create elevated marker HTML (floating above terrain with drop shadow)
     * @param {string} innerHtml — Content inside the marker circle
     * @param {string} color — Background color
     * @param {number} size — Visual size in px
     * @param {Object} extraStyles — Additional inline styles
     */
    _elevatedMarkerHtml(innerHtml, color, size = 36, extraStyles = {}, shape = 'circle') {
        const borderWidth = size > 32 ? 3 : 2;
        const extra = Object.entries(extraStyles).map(([k, v]) => `${k}: ${v}`).join('; ');
        return `<div class="custom-marker-hitarea marker-shape-${shape}" style="
            width: 48px; height: 48px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
        "><div class="elevated-marker" style="
            width: ${size}px; height: ${size}px;
            background: ${color};
            border: ${borderWidth}px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15);
            display: flex; align-items: center; justify-content: center;
            transition: transform var(--duration-fast) var(--easing-standard),
                        box-shadow var(--duration-fast) var(--easing-standard);
            ${extra}
        ">${innerHtml}</div></div>`;
    },

    /**
     * Create marker icon HTML for different types
     */
    _markerIconHtml(type, subtype = null) {
        const colors = {
            resource: MAP_COLORS.resource,
            company: MAP_COLORS.company,
            property: MAP_COLORS.property,
            zone: MAP_COLORS.zone
        };

        const shapes = {
            resource: 'circle',
            company: 'square',
            property: 'pin',
            zone: 'diamond'
        };

        const icons = {
            property: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z"/></svg>`,
            company: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M22 22H2V10l7-3v3l7-3v3l6-3v15zM4 20h16v-8l-4 2v-2l-5 2v-2l-5 2v-2l-2 1v7z"/><rect x="6" y="14" width="3" height="3"/><rect x="11" y="14" width="3" height="3"/><rect x="16" y="14" width="3" height="3"/></svg>`,
            water: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 2c-5.33 8-8 12-8 15a8 8 0 1 0 16 0c0-3-2.67-7-8-15z"/></svg>`,
            power: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M13 2L4 14h7v8l9-12h-7V2z"/></svg>`,
            zone: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M4 4h4V2H2v6h2V4zm16 0v4h2V2h-6v2h4zM4 20v-4H2v6h6v-2H4zm16 0h-4v2h6v-6h-2v4z"/><circle cx="12" cy="12" r="4"/></svg>`
        };

        const icon = icons[subtype] || icons[type] || '';
        const color = colors[type] || MAP_COLORS.primary;
        const shape = shapes[type] || 'circle';

        return this._elevatedMarkerHtml(icon, color, 36, {}, shape);
    },

    /**
     * Create branded company marker HTML
     */
    _brandedMarkerHtml(companyId) {
        const brands = {
            jasm: { text: 'JASM', bg: '#c4001a', textColor: '#ffffff', fontSize: '9px', fontWeight: '800', letterSpacing: '0.3px' },
            sony: { text: 'SONY', bg: '#000000', textColor: '#ffffff', fontSize: '9px', fontWeight: '700', letterSpacing: '0.8px' },
            'tokyo-electron': { text: 'TEL', bg: '#007aff', textColor: '#ffffff', fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' },
            mitsubishi: { text: 'ME', bg: '#cc0000', textColor: '#ffffff', fontSize: '11px', fontWeight: '800', letterSpacing: '0' },
            sumco: { text: 'S', bg: '#1a5276', textColor: '#ffffff', fontSize: '13px', fontWeight: '800', letterSpacing: '0' },
            kyocera: { text: 'KC', bg: '#e74c3c', textColor: '#ffffff', fontSize: '10px', fontWeight: '700', letterSpacing: '0.3px' },
            'rohm-apollo': { text: 'RA', bg: '#6c3483', textColor: '#ffffff', fontSize: '10px', fontWeight: '700', letterSpacing: '0.3px' }
        };

        const brand = brands[companyId];
        if (!brand) return this._markerIconHtml('company');

        const innerHtml = `<span style="
            font-family: var(--font-display);
            font-size: ${brand.fontSize};
            font-weight: ${brand.fontWeight};
            color: ${brand.textColor};
            letter-spacing: ${brand.letterSpacing};
            line-height: 1;
        ">${brand.text}</span>`;

        return this._elevatedMarkerHtml(innerHtml, brand.bg, 40, {}, 'square');
    },

    /**
     * Add a hover popup (tooltip replacement)
     */
    _addTooltip(marker, element, text, offset = [0, -24]) {
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: offset,
            className: 'mapbox-tooltip'
        }).setText(text);

        element.addEventListener('mouseenter', () => {
            popup.setLngLat(marker.getLngLat()).addTo(this.map);
        });
        element.addEventListener('mouseleave', () => {
            popup.remove();
        });

        return popup;
    },

    // ================================
    // JOURNEY A — Resources
    // ================================

    /**
     * Show resource markers (Journey A)
     */
    showResourceMarker(resourceId) {
        const resource = AppData.resources[resourceId];
        if (!resource) return;

        // Remove old marker if it exists (prevent accumulation)
        if (this.markers[resourceId]) {
            const oldMarker = this.markers[resourceId];
            const oldElement = oldMarker.getElement();
            oldMarker.remove();
            // Ensure DOM element is also removed
            if (oldElement && oldElement.parentNode) {
                oldElement.remove();
            }
            delete this.markers[resourceId];
        }

        const html = this._markerIconHtml('resource', resourceId);
        const { marker, element } = this._createMarker(resource.coords, html, { entrance: 'anchor', ariaLabel: resource.name + ' resource' });

        // Guard against null marker (map not initialized)
        if (!marker || !element) return;

        this._addTooltip(marker, element, resource.name);
        element.addEventListener('click', () => UI.showResourcePanel(resource));

        this.markers[resourceId] = marker;
        if (!this._layerGroups.resources.includes(resourceId)) {
            this._layerGroups.resources.push(resourceId);
        }

        // Fly to location
        this.flyToStep({
            center: this._toMapbox(resource.coords),
            zoom: AppData.mapConfig.resourceZoom || 13,
            pitch: 50,
            bearing: resourceId === 'water' ? 25 : -15,
            duration: 2000
        });

        // Show evidence markers for water
        if (resourceId === 'water') {
            this._showWaterEvidenceMarkers();
        }
    },

    _showWaterEvidenceMarkers() {
        const waterData = AppData.resources.water;
        if (!waterData.evidenceMarkers) return;

        waterData.evidenceMarkers.forEach(evidence => {
            const dotHtml = `<div style="
                width: 24px; height: 24px;
                display: flex; align-items: center; justify-content: center;
            "><div style="
                width: 12px; height: 12px;
                background: #007aff;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            "></div></div>`;

            const { marker, element } = this._createMarker(evidence.coords, dotHtml, {
                className: 'water-evidence-marker'
            });

            element.addEventListener('click', () => UI.showWaterEvidencePanel(evidence));
            this.markers[`water-evidence-${evidence.id}`] = marker;
            this._layerGroups.resources.push(`water-evidence-${evidence.id}`);
        });
    },

    /**
     * Show Kyushu-wide energy infrastructure markers
     */
    showKyushuEnergy() {
        this.hideKyushuEnergy();

        const energyData = AppData.kyushuEnergy;
        const colorMap = { solar: '#ff9500', wind: '#5ac8fa', nuclear: '#ff3b30' };
        const iconMap = { solar: '☀', wind: '💨', nuclear: '⚛' };

        let staggerIndex = 0;
        ['solar', 'wind', 'nuclear'].forEach(type => {
            energyData[type].forEach(station => {
                const html = `<div style="
                    width: 28px; height: 28px;
                    background: ${colorMap[type]};
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                    border: 2px solid white;
                "><span style="font-size: 14px;">${iconMap[type]}</span></div>`;

                const delay = staggerIndex * 60;
                staggerIndex++;
                const { marker, element } = this._createMarker(station.coords, html, {
                    className: 'energy-marker-wrapper',
                    entrance: 'ripple'
                });

                // Guard against null marker (map not initialized)
                if (!marker || !element) return;

                if (delay > 0) {
                    element.style.animationDelay = `${delay}ms`;
                }

                this._addTooltip(marker, element, `${station.name} — ${station.capacity}`);
                element.addEventListener('click', () => UI.showEnergyStationPanel(station, type));

                const id = `energy-${station.id}`;
                this.markers[id] = marker;
                this._layerGroups.kyushuEnergy.push(id);
            });
        });

        // Fly to show all energy sources
        this.flyToStep(CAMERA_STEPS.A2_overview);
    },

    hideKyushuEnergy() {
        this._layerGroups.kyushuEnergy.forEach(id => {
            if (this.markers[id]) {
                const marker = this.markers[id];
                const element = marker.getElement();
                marker.remove();
                if (element && element.parentNode) {
                    element.remove();
                }
                delete this.markers[id];
            }
        });
        this._layerGroups.kyushuEnergy = [];
    },

    /**
     * Show talent pipeline — Kyushu-wide university/institution markers
     * Similar scope to showKyushuEnergy (extends beyond Kumamoto)
     */
    showTalentPipeline() {
        this.hideTalentPipeline();

        const pipeline = AppData.talentPipeline;
        if (!pipeline || !pipeline.institutions) return;

        pipeline.institutions.forEach((inst, index) => {
            const delay = index * 80;

            // Institution marker with first letter as icon
            const initial = inst.name.charAt(0);
            const html = `<div style="
                width: 32px; height: 32px;
                background: ${inst.color};
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                border: 2px solid white;
            "><span style="
                font-family: var(--font-display);
                font-size: 13px;
                font-weight: 700;
                color: #ffffff;
                line-height: 1;
            ">${initial}</span></div>`;

            const { marker, element } = this._createMarker(inst.coords, html, {
                className: 'talent-marker-wrapper',
                entrance: 'ripple'
            });

            if (!marker || !element) return;

            if (delay > 0) {
                element.style.animationDelay = `${delay}ms`;
            }

            this._addTooltip(marker, element, `${inst.name} — ${inst.city}`);
            element.addEventListener('click', () => {
                if (typeof UI !== 'undefined') {
                    UI.showTalentInspector(inst.id);
                }
            });

            const id = `talent-${inst.id}`;
            this.markers[id] = marker;
            this._layerGroups.talentPipeline.push(id);
        });

        // Fly to Kyushu overview to show all institutions
        this.flyToStep({
            center: [130.7, 32.5],
            zoom: 7,
            pitch: 25,
            bearing: 0,
            duration: 2500
        });
    },

    hideTalentPipeline() {
        this._layerGroups.talentPipeline.forEach(id => {
            if (this.markers[id]) {
                const marker = this.markers[id];
                const element = marker.getElement();
                marker.remove();
                if (element && element.parentNode) {
                    element.remove();
                }
                delete this.markers[id];
            }
        });
        this._layerGroups.talentPipeline = [];
    },

    /**
     * Save/restore map view for data layer zoom
     */
    savePreDataLayerView() {
        const map = this.map;
        this.preDataLayerView = {
            center: map.getCenter().toArray(),
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing()
        };
    },

    restorePreDataLayerView() {
        if (this.preDataLayerView) {
            this.flyToStep({
                center: this.preDataLayerView.center,
                zoom: this.preDataLayerView.zoom,
                pitch: this.preDataLayerView.pitch,
                bearing: this.preDataLayerView.bearing,
                duration: 1500
            });
            this.preDataLayerView = null;
        }
    },

    // ================================
    // JOURNEY B — Government, Companies, Zones, Roads
    // ================================

    /**
     * Show Science Park circle (Journey B)
     */
    showSciencePark() {
        const sp = AppData.sciencePark;

        // Generate circle polygon
        const centerLngLat = this._toMapbox(sp.center);
        const circleGeoJson = this._generateCirclePolygon(centerLngLat, sp.radius);

        const sourceId = 'science-park-circle';
        this._safeAddSource(sourceId, { type: 'geojson', data: circleGeoJson });

        // Fill layer
        this.map.addLayer({
            id: `${sourceId}-fill`,
            type: 'fill',
            source: sourceId,
            paint: {
                'fill-color': MAP_COLORS.error,
                'fill-opacity': 0.1
            }
        });

        // Stroke layer
        this.map.addLayer({
            id: `${sourceId}-stroke`,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': MAP_COLORS.error,
                'line-width': 3,
                'line-opacity': 0.7
            }
        });

        this._layerGroups.sciencePark.push(`${sourceId}-fill`, `${sourceId}-stroke`);
        this._layerGroups.sciencePark.push(sourceId); // track source too

        // Fly to center
        this.flyToStep(CAMERA_STEPS.B1_sciencePark);
    },

    /**
     * Show government commitment chain markers
     */
    showGovernmentChain() {
        const chain = AppData.governmentChain;
        if (!chain || !chain.levels) return;

        chain.levels.forEach((level, index) => {
            setTimeout(() => {
                const color = level.type === 'concept' ? MAP_COLORS.property : '#34c759';
                const innerHtml = `<span style="font-size: 14px; font-weight: 600; color: white;">${index + 1}</span>`;
                const html = this._elevatedMarkerHtml(innerHtml, color);

                const entrance = index === 0 ? 'anchor' : 'ripple';
                const { marker, element } = this._createMarker(level.coords, html, { entrance, ariaLabel: level.name });
                element.addEventListener('click', () => UI.renderInspectorPanel(4, { title: level.name }));

                const id = `govt-${level.id}`;
                this.markers[id] = marker;
                this._layerGroups.governmentChain.push(id);
            }, index * 200);
        });

        // Announce after all markers have landed
        setTimeout(() => {
            UI.announceToScreenReader(chain.levels.length + ' government commitment markers added');
        }, chain.levels.length * 200 + 100);
    },

    /**
     * Select a government level — fly to marker
     */
    selectGovernmentLevel(levelId) {
        if (AppData.governmentTiers) {
            for (const tier of AppData.governmentTiers) {
                if (tier.id === levelId) {
                    this.flyToStep({
                        center: this._toMapbox(tier.coords),
                        zoom: 12, pitch: 50, bearing: 15, duration: 2000
                    });
                    UI.renderInspectorPanel(4, { title: tier.name });
                    return;
                }
                if (tier.subItems) {
                    const sub = tier.subItems.find(s => s.id === levelId);
                    if (sub) {
                        this.flyToStep({
                            center: this._toMapbox(sub.coords),
                            zoom: 13, pitch: 50, bearing: 20, duration: 2000
                        });
                        UI.renderInspectorPanel(4, { title: sub.name });
                        return;
                    }
                }
            }
        }
        const level = AppData.governmentChain.levels.find(l => l.id === levelId);
        if (!level) return;
        this.flyToStep({
            center: this._toMapbox(level.coords),
            zoom: 12, pitch: 50, bearing: 15, duration: 2000
        });
        UI.renderInspectorPanel(4, { title: level.name });
    },

    /**
     * Show company markers (Journey B)
     */
    showCompanyMarkers() {
        AppData.companies.forEach((company, index) => {
            setTimeout(() => {
                const html = this._brandedMarkerHtml(company.id);
                const entrance = company.id === 'jasm' ? 'anchor' : 'ripple';
                const { marker, element } = this._createMarker(company.coords, html, { entrance, ariaLabel: company.name });

                this._addTooltip(marker, element, company.name);
                element.addEventListener('click', () => UI.renderInspectorPanel(5, { title: company.name }));

                this.markers[company.id] = marker;
                this._layerGroups.companies.push(company.id);
            }, index * 80);
        });

        // Announce after all markers have landed
        setTimeout(() => {
            UI.announceToScreenReader(AppData.companies.length + ' company markers added to map');
        }, AppData.companies.length * 80 + 100);
    },

    /**
     * Show semiconductor network — all 7 companies with connection lines to JASM
     * Visual pattern: thin lines from each company to JASM facility (per feedback map-1.png)
     */
    showSemiconductorNetwork() {
        this.hideSemiconductorNetwork();

        const jasmCoords = AppData.jasmLocation || [32.874, 130.785];
        const jasmLngLat = this._toMapbox(jasmCoords);

        // Build connection line GeoJSON from each non-JASM company to JASM
        const features = AppData.companies
            .filter(c => c.id !== 'jasm')
            .map(company => ({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [this._toMapbox(company.coords), jasmLngLat]
                },
                properties: { companyId: company.id, name: company.name }
            }));

        const sourceId = 'semiconductor-network';
        this._safeAddSource(sourceId, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features }
        });

        this.map.addLayer({
            id: `${sourceId}-line`,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': 'rgba(0, 122, 255, 0.35)',
                'line-width': 1.5,
                'line-dasharray': [4, 4]
            },
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            }
        });

        this._layerGroups.semiconductorNetwork.push(`${sourceId}-line`, sourceId);
    },

    hideSemiconductorNetwork() {
        this._removeLayerGroup('semiconductorNetwork');
    },

    /**
     * Show future development zones (Journey B - Future view)
     */
    showFutureZones() {
        AppData.futureZones.forEach(zone => {
            // Circle polygon
            const centerLngLat = this._toMapbox(zone.coords);
            const circleGeoJson = this._generateCirclePolygon(centerLngLat, zone.radius);

            const sourceId = `future-zone-${zone.id}`;
            this._safeAddSource(sourceId, { type: 'geojson', data: circleGeoJson });

            this.map.addLayer({
                id: `${sourceId}-fill`,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': MAP_COLORS.zone,
                    'fill-opacity': 0.12
                }
            });

            this.map.addLayer({
                id: `${sourceId}-stroke`,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': MAP_COLORS.zone,
                    'line-width': 2,
                    'line-dasharray': [5, 10]
                }
            });

            this._layerGroups.futureZones.push(`${sourceId}-fill`, `${sourceId}-stroke`, sourceId);

            // Zone marker at center
            const markerHtml = this._markerIconHtml('zone');
            const { marker, element } = this._createMarker(zone.coords, markerHtml, { ariaLabel: zone.name + ' development zone' });

            this._addTooltip(marker, element, zone.name);
            element.addEventListener('click', () => UI.renderInspectorPanel(6, { title: zone.name, zone }));

            this.markers[zone.id] = marker;
            this._layerGroups.futureZones.push(zone.id);
        });
    },

    hideFutureZones() {
        this._removeLayerGroup('futureZones');
    },

    /**
     * Show investment zone overlays with persistent labels (Journey B)
     */
    showInvestmentZones() {
        AppData.investmentZones.forEach(zone => {
            const centerLngLat = this._toMapbox(zone.coords);
            const circleGeoJson = this._generateCirclePolygon(centerLngLat, zone.radius);

            const sourceId = `inv-zone-${zone.id}`;
            this._safeAddSource(sourceId, { type: 'geojson', data: circleGeoJson });

            this.map.addLayer({
                id: `${sourceId}-fill`,
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': zone.color,
                    'fill-opacity': 1
                }
            });

            this.map.addLayer({
                id: `${sourceId}-stroke`,
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': zone.strokeColor,
                    'line-width': 2,
                    'line-dasharray': [5, 10]
                }
            });

            this._layerGroups.investmentZones.push(`${sourceId}-fill`, `${sourceId}-stroke`, sourceId);
        });

        // Persistent zone labels as a single symbol layer
        const labelSourceId = 'inv-zone-labels';
        const labelFeatures = AppData.investmentZones.map(zone => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: this._toMapbox(zone.coords)
            },
            properties: { name: zone.name }
        }));

        this._safeAddSource(labelSourceId, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: labelFeatures }
        });

        this.map.addLayer({
            id: `${labelSourceId}-text`,
            type: 'symbol',
            source: labelSourceId,
            layout: {
                'text-field': ['get', 'name'],
                'text-size': 14,
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
                'text-allow-overlap': true,
                'text-ignore-placement': true
            },
            paint: {
                'text-color': '#1e1f20',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2.5
            }
        });

        this._layerGroups.investmentZones.push(`${labelSourceId}-text`, labelSourceId);
    },

    hideInvestmentZones() {
        this._removeLayerGroup('investmentZones');
    },

    // ================================
    // INFRASTRUCTURE ROADS (Journey B)
    // ================================

    showInfrastructureRoads() {
        this.hideInfrastructureRoads();

        // Build a FeatureCollection for all roads
        const features = AppData.infrastructureRoads.map((road, index) => ({
            type: 'Feature',
            id: index,
            geometry: {
                type: 'LineString',
                coordinates: road.coords.map(c => this._toMapbox(c))
            },
            properties: {
                id: road.id,
                name: road.name,
                index: index
            }
        }));

        const sourceId = 'infrastructure-roads';
        this._safeAddSource(sourceId, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features }
        });

        // Start fully transparent — we'll fade in below
        this.map.addLayer({
            id: 'infrastructure-roads-line',
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': MAP_COLORS.infrastructure,
                'line-width': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false], 7,
                    ['boolean', ['feature-state', 'selected'], false], 7,
                    5
                ],
                'line-opacity': 0,
                'line-dasharray': [10, 6]
            },
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            }
        });

        // Label layer — road names along the lines so they look interactive
        this.map.addLayer({
            id: 'infrastructure-roads-labels',
            type: 'symbol',
            source: sourceId,
            layout: {
                'symbol-placement': 'line-center',
                'text-field': ['get', 'name'],
                'text-size': 12,
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
                'text-anchor': 'center',
                'text-offset': [0, -1.2],
                'text-allow-overlap': false,
                'text-ignore-placement': false
            },
            paint: {
                'text-color': '#1e1f20',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2,
                'text-opacity': 0
            }
        });

        // Set 300ms transitions for the fade-in
        this.map.setPaintProperty('infrastructure-roads-line', 'line-opacity-transition', { duration: 300, delay: 0 });
        this.map.setPaintProperty('infrastructure-roads-labels', 'text-opacity-transition', { duration: 300, delay: 0 });

        // 300ms fade-in (CLAUDE.md spec) via Mapbox paint transition
        requestAnimationFrame(() => {
            if (this.map.getLayer('infrastructure-roads-line')) {
                this.map.setPaintProperty('infrastructure-roads-line', 'line-opacity', [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false], 1.0,
                    ['boolean', ['feature-state', 'selected'], false], 1.0,
                    0.7
                ]);
            }
            if (this.map.getLayer('infrastructure-roads-labels')) {
                this.map.setPaintProperty('infrastructure-roads-labels', 'text-opacity', 0.9);
            }
        });

        this._layerGroups.infrastructureRoads.push('infrastructure-roads-line', 'infrastructure-roads-labels', sourceId);

        // Announce roads added
        setTimeout(() => {
            UI.announceToScreenReader(AppData.infrastructureRoads.length + ' infrastructure road overlays shown');
        }, 400);

        // Store road index mapping for feature-state
        this._roadIndexMap = {};
        AppData.infrastructureRoads.forEach((road, index) => {
            this._roadIndexMap[road.id] = index;
        });

        // Hover interaction
        let hoveredRoadId = null;
        this.map.on('mouseenter', 'infrastructure-roads-line', (e) => {
            this.map.getCanvas().style.cursor = 'pointer';
            if (e.features.length > 0) {
                if (hoveredRoadId !== null) {
                    this.map.setFeatureState(
                        { source: sourceId, id: hoveredRoadId },
                        { hover: false }
                    );
                }
                hoveredRoadId = e.features[0].id;
                this.map.setFeatureState(
                    { source: sourceId, id: hoveredRoadId },
                    { hover: true }
                );
            }
        });

        this.map.on('mouseleave', 'infrastructure-roads-line', () => {
            this.map.getCanvas().style.cursor = '';
            if (hoveredRoadId !== null) {
                this.map.setFeatureState(
                    { source: sourceId, id: hoveredRoadId },
                    { hover: false }
                );
                hoveredRoadId = null;
            }
        });

        // Click interaction
        this.map.on('click', 'infrastructure-roads-line', (e) => {
            if (e.features.length > 0) {
                const roadId = e.features[0].properties.id;
                const road = AppData.infrastructureRoads.find(r => r.id === roadId);
                if (road) {
                    this.selectInfrastructureRoad(roadId);
                    UI.renderInspectorPanel(7, { title: road.name });
                }
            }
        });

        // Station markers
        const station = AppData.infrastructureStation;
        if (station) {
            const stationHtml = `<div style="
                width: 28px; height: 28px;
                background: #5ac8fa;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M4 15v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M4 11h16v4H4z"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/></svg></div>`;

            const { marker, element } = this._createMarker(station.coords, stationHtml, {
                className: 'infrastructure-station-marker'
            });
            element.addEventListener('click', () => {
                this.clearInfrastructureRoadSelection();
                UI.renderInspectorPanel(7, { title: station.name });
            });
            this.infrastructureMarkers.push(marker);
            this._layerGroups.infrastructureRoads.push(`station-${station.id}`);
            this.markers[`station-${station.id}`] = marker;
        }

        // Haramizu station
        const haramizu = AppData.haramizuStation;
        if (haramizu) {
            const haramizuHtml = `<div style="
                width: 32px; height: 32px;
                background: #ff9500;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg></div>`;

            const { marker, element } = this._createMarker(haramizu.coords, haramizuHtml, {
                className: 'infrastructure-haramizu-marker'
            });
            this._addTooltip(marker, element, haramizu.name);
            element.addEventListener('click', () => {
                this.clearInfrastructureRoadSelection();
                UI.renderInspectorPanel(7, { title: haramizu.name });
            });
            this.infrastructureMarkers.push(marker);
            this._layerGroups.infrastructureRoads.push(`station-${haramizu.id}`);
            this.markers[`station-${haramizu.id}`] = marker;
        }

        // Fly to show all roads
        this.flyToStep(CAMERA_STEPS.B7);
    },

    hideInfrastructureRoads() {
        // Remove line and label layers
        this._safeRemoveLayer('infrastructure-roads-labels');
        this._safeRemoveLayer('infrastructure-roads-line');
        this._safeRemoveSource('infrastructure-roads');

        // Remove station markers
        this.infrastructureMarkers.forEach(m => {
            const element = m.getElement();
            m.remove();
            if (element && element.parentNode) {
                element.remove();
            }
        });
        this.infrastructureMarkers = [];

        // Clean up marker references
        this._layerGroups.infrastructureRoads.forEach(id => {
            if (this.markers[id]) {
                const marker = this.markers[id];
                const element = marker.getElement();
                marker.remove();
                if (element && element.parentNode) {
                    element.remove();
                }
                delete this.markers[id];
            }
        });
        this._layerGroups.infrastructureRoads = [];

        this.selectedInfrastructureRoad = null;
    },

    selectInfrastructureRoad(roadId) {
        // Deselect previous
        if (this.selectedInfrastructureRoad && this.selectedInfrastructureRoad !== roadId) {
            this.deselectInfrastructureRoad(this.selectedInfrastructureRoad);
        }

        const featureIndex = this._roadIndexMap?.[roadId];
        if (featureIndex !== undefined) {
            this.map.setFeatureState(
                { source: 'infrastructure-roads', id: featureIndex },
                { selected: true }
            );
        }
        this.selectedInfrastructureRoad = roadId;
    },

    deselectInfrastructureRoad(roadId) {
        const featureIndex = this._roadIndexMap?.[roadId];
        if (featureIndex !== undefined) {
            this.map.setFeatureState(
                { source: 'infrastructure-roads', id: featureIndex },
                { selected: false }
            );
        }
        if (this.selectedInfrastructureRoad === roadId) {
            this.selectedInfrastructureRoad = null;
        }
    },

    clearInfrastructureRoadSelection() {
        if (this.selectedInfrastructureRoad) {
            this.deselectInfrastructureRoad(this.selectedInfrastructureRoad);
        }
    },

    // ================================
    // JOURNEY C — Properties & Routes
    // ================================

    /**
     * Add property markers to the Mapbox map for corridor view
     */
    addPropertyMarkers(properties) {
        if (!this.initialized || !this.map) return;

        // Remove any legacy circle layers (safe no-op if absent)
        this._safeRemoveLayer('property-markers-circle');
        this._safeRemoveLayer('property-markers-stroke');
        this._safeRemoveSource('property-markers');

        // Remove existing DOM property markers
        this._layerGroups.properties.forEach(id => {
            if (this.markers[id]) {
                const el = this.markers[id].getElement();
                this.markers[id].remove();
                if (el && el.parentNode) el.remove();
                delete this.markers[id];
            }
        });
        this._layerGroups.properties = [];

        // Create DOM-based icon markers (consistent with dashboard)
        properties.forEach((property, index) => {
            setTimeout(() => {
                const html = this._markerIconHtml('property');
                const { marker, element } = this._createMarker(property.coords, html, {
                    entrance: 'emerge',
                    ariaLabel: property.name
                });

                if (!marker) return;

                this._addTooltip(marker, element, property.name);

                element.addEventListener('mouseover', () => this.preloadImages(property));
                element.addEventListener('click', () => {
                    if (typeof UI !== 'undefined') {
                        UI.showPropertyReveal(property);
                    }
                });

                this.markers[property.id] = marker;
                this._layerGroups.properties.push(property.id);
            }, index * 100);
        });
    },

    /**
     * Add route lines from properties to JASM
     */
    addRouteLines(properties, jasmCoords) {
        if (!this.initialized || !this.map) return;

        const map = this.map;
        const jasmLngLat = this._toMapbox(jasmCoords);

        this._safeRemoveLayer('property-routes-line');
        this._safeRemoveSource('property-routes');

        const geojson = {
            type: 'FeatureCollection',
            features: properties.map(p => ({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [this._toMapbox(p.coords), jasmLngLat]
                }
            }))
        };

        map.addSource('property-routes', { type: 'geojson', data: geojson });

        map.addLayer({
            id: 'property-routes-line',
            type: 'line',
            source: 'property-routes',
            paint: {
                'line-color': '#007aff',
                'line-width': 2,
                'line-opacity': 0.5
            },
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            }
        });
    },

    /**
     * Show property markers (Leaflet-compatible API for dashboard)
     */
    showPropertyMarkers() {
        AppData.properties.forEach((property, index) => {
            setTimeout(() => {
                const html = this._markerIconHtml('property');
                const { marker, element } = this._createMarker(property.coords, html, { entrance: 'emerge', ariaLabel: property.name });

                this._addTooltip(marker, element, property.name);

                element.addEventListener('mouseover', () => this.preloadImages(property));
                element.addEventListener('click', () => {
                    UI.showPropertyReveal(property);
                });

                this.markers[property.id] = marker;
                this._layerGroups.properties.push(property.id);
            }, index * 100);
        });
    },

    // ================================
    // EVIDENCE MARKERS
    // ================================

    showEvidenceGroupMarkers(group) {
        this.clearEvidenceMarkers();

        let evidenceIndex = 0;
        group.items.forEach(item => {
            if (item.coords) {
                const html = this._evidenceMarkerHtml(item.type, false, group.icon);
                const delay = evidenceIndex * 60;
                evidenceIndex++;
                const { marker, element } = this._createMarker(item.coords, html, {
                    className: 'evidence-marker-wrapper',
                    entrance: 'emerge'
                });
                if (delay > 0) {
                    element.style.animationDelay = `${delay}ms`;
                }

                element.addEventListener('click', () => {
                    UI.selectDisclosureItem(group.id, item.id);
                });

                const id = `evidence-${group.id}-${item.id}`;
                this.markers[id] = marker;
                this._markerElements[id] = element;
                this._layerGroups.evidenceMarkers.push(id);
            }
        });
    },

    clearEvidenceMarkers() {
        this._layerGroups.evidenceMarkers.forEach(id => {
            if (this.markers[id]) {
                this.markers[id].remove();
                delete this.markers[id];
            }
            delete this._markerElements[id];
        });
        this._layerGroups.evidenceMarkers = [];
        this.highlightedEvidenceMarker = null;
    },

    highlightEvidenceMarker(groupId, itemId) {
        const markerId = `evidence-${groupId}-${itemId}`;
        const marker = this.markers[markerId];

        if (marker) {
            this.clearEvidenceMarkerHighlight();

            const group = AppData.evidenceGroups[groupId];
            const item = group?.items.find(i => i.id === itemId);
            const type = item?.type || 'pdf';

            // Update marker HTML to highlighted state
            const element = this._markerElements[markerId];
            if (element) {
                element.innerHTML = this._evidenceMarkerHtml(type, true, group?.icon);
            }

            this.highlightedEvidenceMarker = { marker, groupId, itemId };

            // Pan to marker
            this.map.panTo(marker.getLngLat(), { duration: 500 });
        }
    },

    clearEvidenceMarkerHighlight() {
        if (this.highlightedEvidenceMarker) {
            const { groupId, itemId } = this.highlightedEvidenceMarker;
            const markerId = `evidence-${groupId}-${itemId}`;

            const group = AppData.evidenceGroups[groupId];
            const item = group?.items.find(i => i.id === itemId);
            const type = item?.type || 'pdf';

            const element = this._markerElements[markerId];
            if (element) {
                element.innerHTML = this._evidenceMarkerHtml(type, false, group?.icon);
            }

            this.highlightedEvidenceMarker = null;
        }
    },

    _evidenceMarkerHtml(type, highlighted = false, groupIcon = null) {
        const contentColors = {
            'zap': '#ff9500', 'route': '#5ac8fa',
            'landmark': '#007aff', 'graduation-cap': '#34c759'
        };
        const docColors = {
            'pdf': MAP_COLORS.evidencePdf, 'image': MAP_COLORS.evidenceImage,
            'web': MAP_COLORS.evidenceWeb
        };
        const color = (groupIcon && contentColors[groupIcon]) || docColors[type] || MAP_COLORS.evidencePdf;

        const contentIcons = {
            'zap': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
            'route': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12"/></svg>`,
            'landmark': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
            'graduation-cap': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>`
        };
        const docIcons = {
            'pdf': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
            'image': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
            'web': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
        };
        const iconSvg = (groupIcon && contentIcons[groupIcon]) || docIcons[type] || docIcons['pdf'];

        const highlightStyle = highlighted
            ? `box-shadow: 0 0 0 4px rgba(251, 185, 49, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3); transform: scale(1.2);`
            : `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);`;

        return `<div style="
            width: 28px; height: 28px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            ${highlightStyle}
            transition: box-shadow 0.15s ease, transform 0.15s ease;
        "><div style="width: 14px; height: 14px;">${iconSvg}</div></div>`;
    },

    // ================================
    // DATA LAYER MARKERS
    // ================================

    showDataLayerMarkers(layerName, layerData) {
        if (!layerData || !layerData.markers) return;

        this.hideDataLayerMarkers(layerName);

        const layerColors = {
            trafficFlow: '#ef4444', railCommute: '#8b5cf6', electricity: '#f59e0b',
            employment: '#10b981', infrastructure: '#3b82f6', realEstate: '#f97316',
            riskyArea: '#dc2626', baseMap: '#6b7280'
        };
        const color = layerColors[layerName] || MAP_COLORS.primary;

        this._dataLayerGroups[layerName] = [];
        this.dataLayerMarkers[layerName] = {};

        layerData.markers.forEach(markerData => {
            if (!markerData.coords) return;

            const html = this._dataLayerMarkerHtml(layerName, color);
            const { marker, element } = this._createMarker(markerData.coords, html, {
                className: 'data-layer-marker-wrapper'
            });

            this._addTooltip(marker, element, markerData.name);
            element.addEventListener('click', () => UI.focusDataLayerMarker(layerName, markerData.id));

            const id = `data-${layerName}-${markerData.id}`;
            this.markers[id] = marker;
            this.dataLayerMarkers[layerName][markerData.id] = marker;
            this._dataLayerGroups[layerName].push(id);
        });

        // Show animated route layers for traffic flow and rail commute
        if (layerName === 'trafficFlow' || layerName === 'railCommute') {
            this.showAnimatedRouteLayer(layerName, layerData);
        }

        // Fit bounds (skip for electricity — handled by showKyushuEnergy)
        if (layerName !== 'electricity') {
            const allCoords = layerData.markers.filter(m => m.coords).map(m => this._toMapbox(m.coords));
            if (allCoords.length > 0) {
                const bounds = allCoords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]));
                this.map.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 12 });
            }
        }
    },

    hideDataLayerMarkers(layerName) {
        if (this._dataLayerGroups[layerName]) {
            this._dataLayerGroups[layerName].forEach(id => {
                if (this.markers[id]) {
                    const marker = this.markers[id];
                    const element = marker.getElement();
                    marker.remove();
                    // Ensure DOM element is also removed
                    if (element && element.parentNode) {
                        element.remove();
                    }
                    delete this.markers[id];
                }
            });
            delete this._dataLayerGroups[layerName];
        }
        if (this.dataLayerMarkers[layerName]) {
            delete this.dataLayerMarkers[layerName];
        }

        // Hide animated route layers for traffic flow and rail commute
        if (layerName === 'trafficFlow' || layerName === 'railCommute') {
            this.hideAnimatedRouteLayer(layerName);
        }
    },

    focusDataLayerMarker(layerName, markerId) {
        const marker = this.dataLayerMarkers[layerName]?.[markerId];
        if (marker) {
            this.map.flyTo({
                center: marker.getLngLat(),
                zoom: 14,
                duration: 800
            });
        }
    },

    // ================================
    // ANIMATED ROUTE LAYERS (Traffic Flow, Rail Commute)
    // ================================

    /**
     * Show animated route layer with flowing dots
     * @param {string} layerName - 'trafficFlow' or 'railCommute'
     * @param {Object} layerData - Data containing routes array
     */
    showAnimatedRouteLayer(layerName, layerData) {
        if (!layerData || !layerData.routes || layerData.routes.length === 0) return;
        if (!this.map || !this.map.isStyleLoaded()) return;

        // Hide existing layer first
        this.hideAnimatedRouteLayer(layerName);

        const routes = layerData.routes;
        this._animatedLayers[layerName].routes = routes;
        this._animatedLayers[layerName].active = true;

        // Add each route as a separate layer with animated dots
        routes.forEach((route, index) => {
            const sourceId = `${layerName}-route-${index}`;
            const baseLayerId = `${layerName}-route-base-${index}`;
            const dotsLayerId = `${layerName}-route-dots-${index}`;
            const glowLayerId = `${layerName}-route-glow-${index}`;

            // Create GeoJSON for the route
            const geojson = {
                type: 'Feature',
                properties: {
                    name: route.name,
                    level: route.level || 'medium',
                    routeType: route.type || 'main'
                },
                geometry: {
                    type: 'LineString',
                    coordinates: route.path
                }
            };

            // Add source
            this._safeAddSource(sourceId, {
                type: 'geojson',
                data: geojson,
                lineMetrics: true
            });

            // Traffic flow: different styles per congestion level
            if (layerName === 'trafficFlow') {
                const levelStyles = {
                    high: { width: 6, opacity: 0.8, dotSize: 4, dotSpacing: 30, speed: 80 },
                    medium: { width: 5, opacity: 0.8, dotSize: 3, dotSpacing: 30, speed: 120 },
                    low: { width: 4, opacity: 0.8, dotSize: 2.5, dotSpacing: 30, speed: 180 }
                };
                const style = levelStyles[route.level] || levelStyles.medium;

                // Glow effect base
                this.map.addLayer({
                    id: glowLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': route.color,
                        'line-width': style.width * 1.8,
                        'line-opacity': 0.3,
                        'line-blur': 4
                    }
                });

                // Base line
                this.map.addLayer({
                    id: baseLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': route.color,
                        'line-width': style.width,
                        'line-opacity': style.opacity * 0.3
                    }
                });

                // Animated dots layer using dashed line trick
                this.map.addLayer({
                    id: dotsLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': route.color,
                        'line-width': style.dotSize,
                        'line-opacity': style.opacity,
                        'line-dasharray': [0, 2],  // Will animate this
                        'line-gap-width': style.width
                    }
                });

                // Store route metadata for animation
                route._layerIds = { glow: glowLayerId, base: baseLayerId, dots: dotsLayerId };
                route._speed = style.speed;
                route._dotSpacing = style.dotSpacing;
            }

            // Rail commute: track-style rendering
            if (layerName === 'railCommute') {
                const typeStyles = {
                    main: { width: 10, dotSize: 4, opacity: 0.9, speed: 100 },
                    secondary: { width: 8, dotSize: 3.5, opacity: 0.8, speed: 120 },
                    planned: { width: 6, dotSize: 3, opacity: 0.7, speed: 140 }
                };
                const style = typeStyles[route.type] || typeStyles.main;

                // Track base (dark sleeper effect)
                this.map.addLayer({
                    id: baseLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': '#1a1a2e',
                        'line-width': style.width,
                        'line-opacity': style.opacity
                    }
                });

                // Rails (parallel lines with dashed pattern)
                this.map.addLayer({
                    id: glowLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': '#666688',
                        'line-width': 6,
                        'line-opacity': 0.8,
                        'line-dasharray': [0.1, 1.5]  // Sleeper pattern
                    }
                });

                // Animated flowing dots
                this.map.addLayer({
                    id: dotsLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': route.color,
                        'line-width': style.dotSize,
                        'line-opacity': 0.9,
                        'line-dasharray': [0, 2],  // Will animate this
                        'line-gap-width': style.width
                    }
                });

                // Store route metadata for animation
                route._layerIds = { glow: glowLayerId, base: baseLayerId, dots: dotsLayerId };
                route._speed = style.speed;
                route._dotSpacing = 30;
            }
        });

        // Start animation loop if not already running
        this._startRouteAnimation();
    },

    /**
     * Hide animated route layer
     * @param {string} layerName - 'trafficFlow' or 'railCommute'
     */
    hideAnimatedRouteLayer(layerName) {
        if (!this._animatedLayers[layerName].active) return;

        const routes = this._animatedLayers[layerName].routes;
        routes.forEach((route, index) => {
            const sourceId = `${layerName}-route-${index}`;
            const baseLayerId = `${layerName}-route-base-${index}`;
            const dotsLayerId = `${layerName}-route-dots-${index}`;
            const glowLayerId = `${layerName}-route-glow-${index}`;

            this._safeRemoveLayer(dotsLayerId);
            this._safeRemoveLayer(baseLayerId);
            this._safeRemoveLayer(glowLayerId);
            this._safeRemoveSource(sourceId);
        });

        this._animatedLayers[layerName].active = false;
        this._animatedLayers[layerName].routes = [];

        // Stop animation if no layers are active
        const anyActive = Object.values(this._animatedLayers).some(layer => layer.active);
        if (!anyActive) {
            this._stopRouteAnimation();
        }
    },

    /**
     * Start the route animation loop
     */
    _startRouteAnimation() {
        if (this._animationFrame || this.reducedMotion) return;

        const animate = () => {
            this._animationOffset = (this._animationOffset + 1) % 100;

            // Update all active animated layers
            Object.entries(this._animatedLayers).forEach(([layerName, layerState]) => {
                if (!layerState.active) return;

                layerState.routes.forEach(route => {
                    if (!route._layerIds) return;

                    const speed = route._speed || 100;
                    const spacing = route._dotSpacing || 30;

                    // Calculate animated offset
                    const dashOffset = ((this._animationOffset * speed) / 100) % spacing;
                    const dashPhase = dashOffset / spacing;

                    // Update the dash array to create flowing dot effect
                    const dotsLayerId = route._layerIds.dots;
                    if (this.map.getLayer(dotsLayerId)) {
                        this.map.setPaintProperty(
                            dotsLayerId,
                            'line-dasharray',
                            [0, dashPhase * 4, 0.5, (1 - dashPhase) * 4]
                        );
                    }
                });
            });

            this._animationFrame = requestAnimationFrame(animate);
        };

        this._animationFrame = requestAnimationFrame(animate);
    },

    /**
     * Stop the route animation loop
     */
    _stopRouteAnimation() {
        if (this._animationFrame) {
            cancelAnimationFrame(this._animationFrame);
            this._animationFrame = null;
        }
        this._animationOffset = 0;
    },

    _dataLayerMarkerHtml(layerName, color) {
        const icons = {
            trafficFlow: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
            railCommute: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 3 L4 7 L8 11"/><path d="M4 7 L20 7"/><rect x="6" y="11" width="12" height="10" rx="2"/><path d="M9 21v-2h6v2"/></svg>`,
            electricity: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
            employment: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
            infrastructure: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
            realEstate: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
            riskyArea: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
            baseMap: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
        };
        const iconSvg = icons[layerName] || icons.baseMap;

        return `<div style="
            width: 36px; height: 36px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: transform var(--duration-fast) var(--easing-standard);
        "><div style="width: 18px; height: 18px;">${iconSvg}</div></div>`;
    },

    // ================================
    // AIRLINE ROUTES (Journey A - Strategic Location)
    // ================================

    generateBezierPoints(p0, p1, p2, numPoints) {
        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const lat = (1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0];
            const lng = (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1];
            points.push([lng, lat]); // Mapbox [lng, lat] format
        }
        return points;
    },

    async showAirlineRoutes() {
        const routes = AppData.airlineRoutes;
        const origin = routes.origin.coords;

        this.hideAirlineRoutes();

        // 1. Origin marker
        const originHtml = `<div style="display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;">
            <div style="width: 10px; height: 10px; background: ${MAP_COLORS.primary}; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); flex-shrink: 0;"></div>
            <span style="font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--color-text-primary); text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;">Kumamoto</span>
        </div>`;
        const { marker: originMarker } = this._createMarker(origin, originHtml, {
            className: 'airport-origin-marker',
            anchor: 'left'
        });
        this.airlineOriginMarker = originMarker;

        // 2. Zoom out to show Japan
        await this.flyToStep(CAMERA_STEPS.A3_location);

        // 3. Draw routes with stagger
        for (let i = 0; i < routes.destinations.length; i++) {
            await this._delay(150);
            const dest = routes.destinations[i];
            this._addArcLine(origin, dest.coords, dest.status, dest.semiconductorLink, i);
        }

        // 4. Destination markers
        await this._delay(200);
        routes.destinations.forEach(dest => {
            const marker = dest.semiconductorLink
                ? this._createBrandedDestinationMarker(dest)
                : this._createDestinationMarker(dest);
            this.airlineDestinationMarkers.push(marker);
        });
    },

    _addArcLine(origin, destination, status, semiLink, index) {
        const midLat = (origin[0] + destination[0]) / 2;
        const midLng = (origin[1] + destination[1]) / 2;

        // Calculate arc height
        const dLat = destination[0] - origin[0];
        const dLng = destination[1] - origin[1];
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);
        const arcHeight = Math.max(0.3, Math.min(2.0, distance * 0.15));

        const arcMid = [midLat + arcHeight, midLng];
        const points = this.generateBezierPoints(origin, arcMid, destination, 50);

        let routeColor = '#c0766e';
        let weight = 1.5;
        if (semiLink) {
            const brandColors = { 'TSMC': '#c4001a', 'Samsung': '#1428a0' };
            routeColor = brandColors[semiLink.company] || routeColor;
            weight = 2.5;
        }
        const opacity = status === 'suspended' ? 0.4 : 0.7;

        const sourceId = `airline-route-${index}`;
        this._safeAddSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: points }
            }
        });

        this.map.addLayer({
            id: `${sourceId}-line`,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': routeColor,
                'line-width': weight,
                'line-opacity': opacity
            },
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            }
        });

        this._layerGroups.airlineRoutes.push(`${sourceId}-line`, sourceId);
    },

    _createDestinationMarker(destination) {
        const dotColor = '#c0766e';
        const cityName = destination.name.replace(/ (International|Airport|Gimhae|Pudong|Taoyuan)$/i, '');

        const html = `<div style="display: flex; align-items: center; gap: var(--space-1); white-space: nowrap; cursor: pointer;">
            <div style="width: 8px; height: 8px; background: ${dotColor}; border-radius: 50%; flex-shrink: 0;"></div>
            <span style="font-family: var(--font-display); font-size: 12px; font-weight: 500; color: var(--color-text-primary); text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white;">${cityName}</span>
        </div>`;

        const { marker, element } = this._createMarker(destination.coords, html, {
            className: 'airport-destination-marker',
            anchor: 'left'
        });
        element.addEventListener('click', () => UI.showAirlineRoutePanel(destination));
        return marker;
    },

    _createBrandedDestinationMarker(destination) {
        const link = destination.semiconductorLink;
        const brandColors = { 'TSMC': '#c4001a', 'Samsung': '#1428a0' };
        const color = brandColors[link.company] || '#c0766e';
        const abbrev = link.company === 'Samsung' ? 'SS' : link.company;
        const cityName = destination.name.replace(/ (International|Airport|Gimhae|Pudong|Taoyuan)$/i, '');

        const html = `<div style="display: flex; align-items: center; gap: var(--space-2); white-space: nowrap; cursor: pointer;">
            <div style="width: 28px; height: 28px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-family: var(--font-display); font-size: 8px; font-weight: 800; color: white; letter-spacing: 0.3px;">${abbrev}</span>
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--color-text-primary); text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;">${cityName}</span>
                <span style="font-family: var(--font-display); font-size: 10px; font-weight: 500; color: ${color}; text-shadow: 0 0 3px white, 0 0 3px white;">${link.company} ${link.role}</span>
            </div>
        </div>`;

        const { marker, element } = this._createMarker(destination.coords, html, {
            className: 'airport-destination-marker branded-destination',
            anchor: 'left'
        });
        element.addEventListener('click', () => UI.showAirlineRoutePanel(destination));
        return marker;
    },

    hideAirlineRoutes() {
        // Remove line layers/sources
        this._layerGroups.airlineRoutes.forEach(id => {
            this._safeRemoveLayer(id);
            this._safeRemoveSource(id);
        });
        this._layerGroups.airlineRoutes = [];

        // Remove markers
        if (this.airlineOriginMarker) {
            const element = this.airlineOriginMarker.getElement();
            this.airlineOriginMarker.remove();
            if (element && element.parentNode) {
                element.remove();
            }
            this.airlineOriginMarker = null;
        }
        this.airlineDestinationMarkers.forEach(m => {
            const element = m.getElement();
            m.remove();
            if (element && element.parentNode) {
                element.remove();
            }
        });
        this.airlineDestinationMarkers = [];
    },

    // ================================
    // DASHBOARD HELPERS
    // ================================

    showSinglePropertyMarker(property) {
        const html = this._markerIconHtml('property');
        const { marker, element } = this._createMarker(property.coords, html);
        this._addTooltip(marker, element, property.name);
        this.markers[property.id] = marker;
        this._layerGroups.properties.push(property.id);
    },

    showSingleCompanyMarker(company) {
        const html = this._brandedMarkerHtml(company.id);
        const { marker, element } = this._createMarker(company.coords, html);
        this._addTooltip(marker, element, company.name);
        this.markers[company.id] = marker;
        this._layerGroups.companies.push(company.id);
    },

    showSingleInfrastructureRoad(road) {
        const sourceId = `single-road-${road.id}`;
        this._safeAddSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: road.coords.map(c => this._toMapbox(c))
                }
            }
        });

        this.map.addLayer({
            id: `${sourceId}-line`,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': MAP_COLORS.infrastructure,
                'line-width': 7,
                'line-opacity': 1
            },
            layout: { 'line-cap': 'round', 'line-join': 'round' }
        });

        this._layerGroups.infrastructureRoads.push(`${sourceId}-line`, sourceId);

        // Fit bounds
        const coords = road.coords.map(c => this._toMapbox(c));
        const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
        this.map.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 13 });
    },

    // ================================
    // LAYER VISIBILITY
    // ================================

    showLayer(layerName) {
        // Show all markers in a layer group
        this._layerGroups[layerName]?.forEach(id => {
            if (this.markers[id]) {
                this.markers[id].addTo(this.map);
            }
        });

        // Also show Mapbox map layers if they exist
        const layerIds = this._getMapboxLayerIds(layerName);
        layerIds.forEach(layerId => {
            if (this.map.getLayer(layerId)) {
                this.map.setLayoutProperty(layerId, 'visibility', 'visible');
            }
        });
    },

    hideLayer(layerName) {
        this._layerGroups[layerName]?.forEach(id => {
            if (this.markers[id]) {
                const marker = this.markers[id];
                const element = marker.getElement();
                marker.remove();
                // Ensure DOM element is also removed
                if (element && element.parentNode) {
                    element.remove();
                }
            }
        });

        const layerIds = this._getMapboxLayerIds(layerName);
        layerIds.forEach(layerId => {
            if (this.map.getLayer(layerId)) {
                this.map.setLayoutProperty(layerId, 'visibility', 'none');
            }
        });
    },

    _getMapboxLayerIds(layerName) {
        // Return any map layer IDs associated with a named group
        const mapping = {
            sciencePark: ['science-park-circle-fill', 'science-park-circle-stroke', 'science-park-circle'],
            infrastructureRoads: ['infrastructure-roads-line']
        };
        return mapping[layerName] || [];
    },

    /**
     * Fly to a location (simple API)
     */
    flyTo(coords, zoom) {
        this.flyToStep({
            center: this._toMapbox(coords),
            zoom: zoom || 13,
            pitch: 50,
            bearing: 15,
            duration: 2000
        });
    },

    flyToLocation(coords, zoom = 14) {
        this.map.flyTo({
            center: this._toMapbox(coords),
            zoom: zoom,
            duration: 1000
        });
    },

    // ================================
    // IDLE HEARTBEAT — ambient life between interactions
    // ================================

    /**
     * Start the heartbeat system — camera drift + marker pulse
     * when user is idle for 5+ seconds.
     */
    startHeartbeat() {
        if (this.reducedMotion || !this.initialized || !this.map) return;
        this._heartbeat.active = true;
        this._resetIdleTimer();

        // Listen for user interaction to pause drift
        if (!this._heartbeat._boundReset) {
            this._heartbeat._boundReset = () => this._resetIdleTimer();
            this.map.on('mousedown', this._heartbeat._boundReset);
            this.map.on('touchstart', this._heartbeat._boundReset);
            this.map.on('wheel', this._heartbeat._boundReset);
        }
    },

    /**
     * Stop the heartbeat system entirely.
     */
    stopHeartbeat() {
        this._heartbeat.active = false;
        this._stopDrift();
        this.clearMarkerPulse();
        clearTimeout(this._heartbeat.idleTimeout);
        this._heartbeat.idleTimeout = null;
    },

    /**
     * Pause drift during programmatic camera movements.
     * Called by flyToStep.
     */
    pauseHeartbeat() {
        this._stopDrift();
        clearTimeout(this._heartbeat.idleTimeout);
        this._heartbeat.idleTimeout = null;
    },

    /**
     * Reset the idle timer — starts drift after threshold.
     */
    _resetIdleTimer() {
        if (!this._heartbeat.active) return;
        this._stopDrift();
        clearTimeout(this._heartbeat.idleTimeout);
        this._heartbeat.idleTimeout = setTimeout(() => {
            this._startDrift();
        }, this._heartbeat.idleThreshold);
    },

    /**
     * Start slow bearing drift.
     */
    _startDrift() {
        if (!this._heartbeat.active || !this.map || this._heartbeat.driftInterval) return;
        this._heartbeat.driftInterval = setInterval(() => {
            if (!this.map) return;
            const current = this.map.getBearing();
            this.map.setBearing(current + this._heartbeat.bearingPerTick);
        }, this._heartbeat.tickMs);
    },

    /**
     * Stop the drift interval.
     */
    _stopDrift() {
        if (this._heartbeat.driftInterval) {
            clearInterval(this._heartbeat.driftInterval);
            this._heartbeat.driftInterval = null;
        }
    },

    /**
     * Apply pulse animation to all markers in a layer group.
     * @param {string} groupName — Key in this._layerGroups
     */
    setActiveMarkerPulse(groupName) {
        if (this.reducedMotion) return;
        this.clearMarkerPulse();
        const ids = this._layerGroups[groupName] || [];
        ids.forEach(id => {
            const marker = this.markers[id];
            if (marker) {
                const el = marker.getElement();
                if (el) {
                    el.classList.add('marker-pulse');
                    this._heartbeat.pulsingMarkers.push(el);
                }
            }
        });
    },

    /**
     * Remove pulse from all pulsing markers.
     */
    clearMarkerPulse() {
        this._heartbeat.pulsingMarkers.forEach(el => {
            el.classList.remove('marker-pulse');
        });
        this._heartbeat.pulsingMarkers = [];
    },

    // ================================
    // MARKER EXIT CHOREOGRAPHY
    // ================================

    /**
     * Fade out an array of Mapbox HTML markers before removing them.
     * Applies the .marker-exiting CSS class (200ms accelerate fade),
     * waits for the animation, then removes the markers from the map.
     * @param {Array} markers — Array of mapboxgl.Marker instances
     */
    async fadeOutMarkers(markers) {
        if (!markers || markers.length === 0) return;
        markers.forEach(m => {
            const el = m.getElement();
            // Apply exit animation to inner element (not wrapper)
            // to avoid interfering with Mapbox's transform positioning
            if (el && el.firstElementChild) {
                el.firstElementChild.classList.add('marker-exiting');
            } else if (el) {
                el.classList.add('marker-exiting');
            }
        });
        await this._delay(200);
        markers.forEach(m => m.remove());
    },

    /**
     * Fade out all HTML markers tracked in a _layerGroups entry.
     * @param {string} groupName — Key in this._layerGroups
     */
    async fadeOutMarkerGroup(groupName) {
        const ids = this._layerGroups[groupName] || [];
        const markers = [];
        ids.forEach(id => {
            if (this.markers[id]) markers.push(this.markers[id]);
        });
        await this.fadeOutMarkers(markers);
        // Clean up references
        ids.forEach(id => delete this.markers[id]);
        this._layerGroups[groupName] = [];
    },

    // ================================
    // CLEAR / RESET / DESTROY
    // ================================

    clearAll() {
        // Remove all HTML markers AND their DOM elements
        Object.values(this.markers).forEach(marker => {
            if (marker && marker.remove) {
                const element = marker.getElement();
                marker.remove();
                // Ensure DOM element is also removed
                if (element && element.parentNode) {
                    element.remove();
                }
            }
        });
        this.markers = {};
        this._markerElements = {};

        // Remove all Mapbox layers and sources for each group
        Object.keys(this._layerGroups).forEach(groupName => {
            this._removeLayerGroup(groupName);
        });

        // Reset layer groups
        Object.keys(this._layerGroups).forEach(k => {
            this._layerGroups[k] = [];
        });

        // Clear data layer markers
        Object.keys(this._dataLayerGroups).forEach(layerName => {
            this.hideDataLayerMarkers(layerName);
        });

        // Stop any route animations
        this._stopRouteAnimation();

        // Clear property markers and routes
        this._safeRemoveLayer('property-markers-circle');
        this._safeRemoveLayer('property-markers-stroke');
        this._safeRemoveSource('property-markers');
        this._safeRemoveLayer('property-routes-line');
        this._safeRemoveSource('property-routes');

        // Clear airline routes
        this.hideAirlineRoutes();

        // Clear infrastructure
        this.infrastructureMarkers.forEach(m => {
            const element = m.getElement();
            m.remove();
            if (element && element.parentNode) {
                element.remove();
            }
        });
        this.infrastructureMarkers = [];
        this.selectedInfrastructureRoad = null;
        this.highlightedEvidenceMarker = null;

        // Clean up any orphaned marker elements that weren't tracked in this.markers
        // Mapbox wraps all custom marker elements in .mapboxgl-marker containers
        const orphanedMarkers = document.querySelectorAll('.mapboxgl-marker');
        orphanedMarkers.forEach(el => {
            if (el.parentNode) el.remove();
        });

        // Also clean up any orphaned elevated-marker elements that escaped their parent
        const orphanedElevatedMarkers = document.querySelectorAll('.elevated-marker');
        orphanedElevatedMarkers.forEach(el => {
            if (el.parentNode) el.remove();
        });
    },

    clearRoute() {
        this._safeRemoveLayer('property-routes-line');
        this._safeRemoveSource('property-routes');
    },

    resetView() {
        const config = AppData.mapConfig;
        this.flyToStep({
            center: this._toMapbox(config.center),
            zoom: config.initialZoom,
            pitch: 45,
            bearing: 10,
            duration: 1500
        });
    },

    /**
     * Preload property images
     */
    preloadImages(property) {
        if (property._imagesPreloaded) return;
        const urls = [];
        if (property.exteriorImage) urls.push(property.exteriorImage);
        if (property.image) urls.push(property.image);
        if (property.interiorImages) urls.push(...property.interiorImages);
        urls.forEach(url => { const img = new Image(); img.src = url; });
        property._imagesPreloaded = true;
    },

    /**
     * Reset state for app restart
     */
    destroy() {
        this.stopHeartbeat();

        if (this._currentAnimation) {
            this._currentAnimation.cancelled = true;
            this._currentAnimation = null;
        }

        this.clearAll();

        if (this.skipButton) this.skipButton.classList.remove('visible');
        this.revealing = false;
        this.corridorMode = false;
        this._corridorView = null;
        this._previousView = null;
    },

    // ================================
    // PRIVATE HELPERS
    // ================================

    /**
     * Convert [lat, lng] to [lng, lat] for Mapbox
     */
    _toMapbox(coords) {
        return [coords[1], coords[0]];
    },

    /**
     * Enable map interaction after cinematic entry
     */
    _enableInteraction() {
        const map = this.map;
        map.scrollZoom.enable();
        map.boxZoom.enable();
        map.dragPan.enable();
        map.dragRotate.enable();
        map.keyboard.enable();
        map.touchZoomRotate.enable();
    },

    /**
     * Calculate bearing between two points
     */
    _calculateBearing(from, to) {
        const fromLng = (from.lng || from[0]) * Math.PI / 180;
        const fromLat = (from.lat || from[1]) * Math.PI / 180;
        const toLng = to[0] * Math.PI / 180;
        const toLat = to[1] * Math.PI / 180;

        const dLng = toLng - fromLng;
        const y = Math.sin(dLng) * Math.cos(toLat);
        const x = Math.cos(fromLat) * Math.sin(toLat) -
                  Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);

        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360;
    },

    /**
     * Wait for moveend with timeout
     */
    _waitForMoveEnd(timeout = 5000) {
        return new Promise(resolve => {
            const timer = setTimeout(() => {
                this.map.off('moveend', onEnd);
                resolve();
            }, timeout);
            const onEnd = () => {
                clearTimeout(timer);
                resolve();
            };
            this.map.once('moveend', onEnd);
        });
    },

    /**
     * Add 3D building extrusion layer
     */
    _addBuildingLayer() {
        const map = this.map;
        if (map.getLayer('3d-buildings')) return;

        const layers = map.getStyle().layers;
        let labelLayerId;
        for (const layer of layers) {
            if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
                labelLayerId = layer.id;
                break;
            }
        }

        map.addLayer({
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 12,
            paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                    'interpolate', ['linear'], ['zoom'],
                    12, 0,
                    13, ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate', ['linear'], ['zoom'],
                    12, 0,
                    13, ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.5
            }
        }, labelLayerId);
    },

    /**
     * Set 3D building extrusion opacity (for dramatic reveal)
     * @param {number} opacity — 0 to 1
     */
    setBuildingOpacity(opacity) {
        if (!this.initialized || !this.map) return;
        if (this.map.getLayer('3d-buildings')) {
            this.map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', opacity);
        }
    },

    /**
     * Generate a circle polygon from center + radius
     * @param {Array} center — [lng, lat]
     * @param {number} radiusMeters
     * @returns {Object} GeoJSON Polygon
     */
    _generateCirclePolygon(center, radiusMeters, steps = 64) {
        const coords = [];
        const km = radiusMeters / 1000;

        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * 360;
            const rad = angle * Math.PI / 180;
            // Approximate: 1 degree latitude ≈ 111.32 km
            const dLat = (km * Math.cos(rad)) / 111.32;
            const dLng = (km * Math.sin(rad)) / (111.32 * Math.cos(center[1] * Math.PI / 180));
            coords.push([center[0] + dLng, center[1] + dLat]);
        }

        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coords]
            }
        };
    },

    /**
     * Safely add a source (remove existing first)
     */
    _safeAddSource(id, sourceSpec) {
        this._safeRemoveSource(id);
        this.map.addSource(id, sourceSpec);
    },

    /**
     * Safely remove a layer
     */
    _safeRemoveLayer(id) {
        try {
            if (this.map.getLayer(id)) {
                this.map.removeLayer(id);
            }
        } catch (e) { /* layer may not exist */ }
    },

    /**
     * Safely remove a source (and its layers)
     */
    _safeRemoveSource(id) {
        try {
            if (this.map.getSource(id)) {
                // Remove all layers using this source first
                const style = this.map.getStyle();
                if (style && style.layers) {
                    style.layers.forEach(layer => {
                        if (layer.source === id) {
                            this.map.removeLayer(layer.id);
                        }
                    });
                }
                this.map.removeSource(id);
            }
        } catch (e) { /* source may not exist */ }
    },

    /**
     * Remove all markers and layers in a named group
     */
    _removeLayerGroup(groupName) {
        const group = this._layerGroups[groupName];
        if (!group) return;

        group.forEach(id => {
            // Remove HTML marker AND its DOM element
            if (this.markers[id]) {
                const marker = this.markers[id];
                const element = marker.getElement();
                marker.remove();
                // Ensure DOM element is also removed
                if (element && element.parentNode) {
                    element.remove();
                }
                delete this.markers[id];
            }
            // Remove Mapbox layer
            this._safeRemoveLayer(id);
            // Remove Mapbox source (if it matches — layers and sources may share ID)
            this._safeRemoveSource(id);
        });

        this._layerGroups[groupName] = [];
    },

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    _frame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }
};
