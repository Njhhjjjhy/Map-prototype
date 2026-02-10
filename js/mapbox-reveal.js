/**
 * MapboxReveal — 3D cinematic property drill-down overlay
 *
 * Uses Mapbox GL JS to create a 3D camera tilt with building extrusions
 * when a property marker is clicked. Overlays on top of the Leaflet map
 * and fades in/out seamlessly.
 *
 * API:
 *   MapboxReveal.init(token)              — Create Mapbox instance (lazy, once)
 *   MapboxReveal.forwardReveal(property, leafletMap) — 3D tilt animation
 *   MapboxReveal.reverseReveal()          — Reverse tilt, fade out
 *   MapboxReveal.preloadImages(property)  — Preload images on hover
 *   MapboxReveal.destroy()                — Reset state (app restart)
 */
const MapboxReveal = {
    map: null,
    container: null,
    initialized: false,
    _initStarted: false,
    _readyPromise: null,
    revealing: false,
    reducedMotion: false,

    /**
     * Initialize the Mapbox GL JS map instance (called once, lazily)
     * @param {string} accessToken — Mapbox API key
     */
    init(accessToken) {
        if (this._initStarted) return;
        this._initStarted = true;

        if (!accessToken || accessToken === 'YOUR_TOKEN_HERE') {
            console.warn('MapboxReveal: No valid Mapbox access token. 3D reveal disabled.');
            this._readyPromise = Promise.resolve(false);
            return;
        }

        this.container = document.getElementById('mapbox-3d');
        if (!this.container) {
            console.warn('MapboxReveal: #mapbox-3d container not found.');
            this._readyPromise = Promise.resolve(false);
            return;
        }

        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        mapboxgl.accessToken = accessToken;

        // Temporarily show container so Mapbox can measure dimensions
        this.container.style.display = 'block';
        this.container.style.opacity = '0';
        this.container.style.pointerEvents = 'none';

        this.map = new mapboxgl.Map({
            container: 'mapbox-3d',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [130.75, 32.8],  // Kumamoto default [lng, lat]
            zoom: 10,
            pitch: 0,
            bearing: 0,
            antialias: true,
            interactive: false,      // No user interaction during reveal
            attributionControl: false
        });

        this.map.on('style.load', () => {
            this._addBuildingLayer();
        });

        // Track ready state with a promise so forwardReveal can wait
        this._readyPromise = new Promise((resolve) => {
            // Handle load errors (bad token, network failure, etc.)
            this.map.on('error', (e) => {
                console.error('MapboxReveal: Map error —', e.error?.message || e.message || e);
            });

            // Hide container after init — it will be shown during reveals
            this.map.on('load', () => {
                this.container.style.display = 'none';
                this.initialized = true;
                resolve(true);
            });

            // Timeout: if Mapbox fails to load within 8s, give up
            setTimeout(() => {
                if (!this.initialized) {
                    console.warn('MapboxReveal: Timed out waiting for map load.');
                    resolve(false);
                }
            }, 8000);
        });
    },

    /**
     * Perform the forward 3D reveal animation
     * @param {Object} property — Property data with coords [lat, lng]
     * @param {Object} leafletMap — Leaflet L.map instance for camera sync
     * @returns {Promise} Resolves when 3D animation completes
     */
    async forwardReveal(property, leafletMap) {
        if (this.revealing) return;

        // Wait for Mapbox to finish loading (handles race condition)
        if (!this.initialized && this._readyPromise) {
            const ready = await this._readyPromise;
            if (!ready) return;  // Mapbox failed to load, skip 3D
        } else if (!this.initialized) {
            return;
        }

        this.revealing = true;

        const container = this.container;
        const map = this.map;

        // 1. Sync Mapbox camera to current Leaflet position
        const center = leafletMap.getCenter();
        const zoom = leafletMap.getZoom();
        map.jumpTo({
            center: [center.lng, center.lat],
            zoom: zoom,
            pitch: 0,
            bearing: 0
        });

        // 2. Show container (display: block) and trigger resize
        container.style.display = 'block';
        await this._frame();
        map.resize();
        await this._frame();

        // 3. Clear inline styles from init() so CSS .active can take effect
        container.style.opacity = '';
        container.style.pointerEvents = '';

        // 4. Fade in container and animate camera simultaneously
        container.classList.add('active');

        const targetCenter = [property.coords[1], property.coords[0]]; // [lng, lat]

        if (this.reducedMotion) {
            // Instant positioning for reduced motion
            map.jumpTo({
                center: targetCenter,
                zoom: 17,
                pitch: 60,
                bearing: -20
            });
            await this._delay(100);
        } else {
            map.easeTo({
                center: targetCenter,
                zoom: 17,
                pitch: 60,
                bearing: -20,
                duration: 2000,
                easing: (t) => t * (2 - t) // ease-out quadratic
            });
            // Wait for camera animation to settle
            await this._delay(2200);
        }

        this.revealing = false;
    },

    /**
     * Reverse the 3D animation and hide the Mapbox overlay
     * @returns {Promise} Resolves when Mapbox is fully hidden
     */
    async reverseReveal() {
        if (!this.initialized) return;
        if (!this.container.classList.contains('active')) return;

        const map = this.map;

        if (this.reducedMotion) {
            this.container.classList.remove('active');
            await this._delay(50);
            this.container.style.display = 'none';
            return;
        }

        // 1. Reverse camera: tilt back to flat
        map.easeTo({
            pitch: 0,
            bearing: 0,
            zoom: map.getZoom() - 1,
            duration: 1200,
            easing: (t) => t * (2 - t)
        });

        // 2. Start fade-out before camera animation completes (overlap)
        await this._delay(800);
        this.container.classList.remove('active');

        // 3. Wait for opacity transition to finish, then hide
        await this._delay(500);
        this.container.style.display = 'none';
    },

    /**
     * Preload property images on marker hover
     * @param {Object} property — Property data
     */
    preloadImages(property) {
        if (property._imagesPreloaded) return;

        const urls = [];
        if (property.exteriorImage) urls.push(property.exteriorImage);
        if (property.image) urls.push(property.image);
        if (property.interiorImages) urls.push(...property.interiorImages);

        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });

        property._imagesPreloaded = true;
    },

    /**
     * Reset state for app restart (does not destroy the Mapbox instance)
     */
    destroy() {
        if (this.container) {
            this.container.classList.remove('active');
            this.container.style.display = 'none';
            this.container.style.opacity = '';
            this.container.style.pointerEvents = '';
        }
        this.revealing = false;
    },

    /**
     * Add 3D building extrusion layer to the Mapbox style
     * @private
     */
    _addBuildingLayer() {
        const map = this.map;

        if (map.getLayer('3d-buildings')) return;

        // Find the first symbol layer to insert buildings below labels
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
            minzoom: 15,
            paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    15.5, ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate', ['linear'], ['zoom'],
                    15, 0,
                    15.5, ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        }, labelLayerId);
    },

    /**
     * Promise-based delay helper
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Wait for next animation frame
     * @private
     */
    _frame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }
};
