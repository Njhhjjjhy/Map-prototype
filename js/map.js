/**
 * Map functionality using Leaflet and OpenStreetMap
 */

const MapManager = {
    map: null,
    markers: {},
    layers: {
        resources: null,
        sciencePark: null,
        companies: null,
        futureZones: null,
        properties: null,
        route: null
    },

    /**
     * Initialize the map
     */
    init() {
        const config = AppData.mapConfig;

        // Create map with smooth animation options
        this.map = L.map('map', {
            zoomControl: true,
            attributionControl: true,
            zoomAnimation: true,
            zoomAnimationThreshold: 4,
            fadeAnimation: true,
            markerZoomAnimation: true,
            wheelDebounceTime: 80,
            wheelPxPerZoomLevel: 120,
            zoomSnap: 0.25,
            zoomDelta: 0.5
        }).setView(config.center, config.initialZoom);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Initialize layer groups
        this.layers.resources = L.layerGroup();
        this.layers.sciencePark = L.layerGroup();
        this.layers.companies = L.layerGroup();
        this.layers.futureZones = L.layerGroup();
        this.layers.properties = L.layerGroup();
        this.layers.route = L.layerGroup();
    },

    /**
     * Create a custom marker icon with distinct icons per type
     */
    createMarkerIcon(type, subtype = null) {
        // Colors aligned with legend
        const colors = {
            resource: '#ff3b30',   // Red
            company: '#007aff',    // Blue
            property: '#ff9500',   // Orange/Amber
            zone: '#ff3b30'        // Red
        };

        // SVG icons for each type (white fill for contrast)
        const icons = {
            // Property: House icon
            property: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z"/>
            </svg>`,
            // Company: Factory icon
            company: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M22 22H2V10l7-3v3l7-3v3l6-3v15zM4 20h16v-8l-4 2v-2l-5 2v-2l-5 2v-2l-2 1v7z"/>
                <rect x="6" y="14" width="3" height="3"/>
                <rect x="11" y="14" width="3" height="3"/>
                <rect x="16" y="14" width="3" height="3"/>
            </svg>`,
            // Water resource: Water drop icon
            water: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M12 2c-5.33 8-8 12-8 15a8 8 0 1 0 16 0c0-3-2.67-7-8-15z"/>
            </svg>`,
            // Power resource: Lightning bolt icon
            power: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M13 2L4 14h7v8l9-12h-7V2z"/>
            </svg>`,
            // Zone: Expand/growth icon
            zone: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M4 4h4V2H2v6h2V4zm16 0v4h2V2h-6v2h4zM4 20v-4H2v6h6v-2H4zm16 0h-4v2h6v-6h-2v4z"/>
                <circle cx="12" cy="12" r="4"/>
            </svg>`
        };

        // Select icon based on type and subtype
        let icon = icons[type] || icons[subtype] || '';
        const color = colors[type] || '#fbb931';

        return L.divIcon({
            className: 'custom-marker-wrapper',
            html: `<div class="custom-marker ${type}-marker" style="
                width: 32px;
                height: 32px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">${icon}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    },

    /**
     * Pan and zoom to a location with smooth easing
     */
    flyTo(coords, zoom) {
        this.map.flyTo(coords, zoom || AppData.mapConfig.resourceZoom, {
            duration: 1.8,
            easeLinearity: 0.15
        });
    },

    /**
     * Show resource markers (Journey A)
     */
    showResourceMarker(resourceId) {
        const resource = AppData.resources[resourceId];
        if (!resource) return;

        const marker = L.marker(resource.coords, {
            icon: this.createMarkerIcon('resource', resourceId)
        });

        marker.on('click', () => {
            UI.showResourcePanel(resource);
        });

        this.markers[resourceId] = marker;
        this.layers.resources.addLayer(marker);
        this.layers.resources.addTo(this.map);

        // Fly to location
        this.flyTo(resource.coords, AppData.mapConfig.resourceZoom);
    },

    /**
     * Show Science Park circle (Journey B)
     */
    showSciencePark() {
        const sp = AppData.sciencePark;

        // Create circle
        const circle = L.circle(sp.center, {
            radius: sp.radius,
            color: '#ff3b30',
            weight: 3,
            fillColor: '#ff3b30',
            fillOpacity: 0.1,
            className: 'science-park-circle'
        });

        circle.on('click', () => {
            UI.showScienceParkPanel();
        });

        this.layers.sciencePark.addLayer(circle);
        this.layers.sciencePark.addTo(this.map);

        // Fly to center with smooth easing
        this.map.flyTo(sp.center, 11, {
            duration: 2,
            easeLinearity: 0.15
        });
    },

    /**
     * Show company markers (Journey B)
     */
    showCompanyMarkers() {
        AppData.companies.forEach(company => {
            const marker = L.marker(company.coords, {
                icon: this.createMarkerIcon('company')
            });

            marker.on('click', () => {
                UI.showCompanyPanel(company);
            });

            this.markers[company.id] = marker;
            this.layers.companies.addLayer(marker);
        });

        this.layers.companies.addTo(this.map);
    },

    /**
     * Show future development zones (Journey B - Future view)
     */
    showFutureZones() {
        AppData.futureZones.forEach(zone => {
            // Create circle for zone - purple to contrast teal markers
            const circle = L.circle(zone.coords, {
                radius: zone.radius,
                color: '#ff3b30',
                weight: 2,
                fillColor: '#ff3b30',
                fillOpacity: 0.12,
                dashArray: '5, 10'
            });

            circle.on('click', () => {
                UI.showFutureZonePanel(zone);
            });

            // Add marker at center
            const marker = L.marker(zone.coords, {
                icon: this.createMarkerIcon('zone')
            });

            marker.on('click', () => {
                UI.showFutureZonePanel(zone);
            });

            this.layers.futureZones.addLayer(circle);
            this.layers.futureZones.addLayer(marker);
            this.markers[zone.id] = marker;
        });

        this.layers.futureZones.addTo(this.map);
    },

    /**
     * Hide future zones (return to Present view)
     */
    hideFutureZones() {
        this.map.removeLayer(this.layers.futureZones);
    },

    /**
     * Show property markers (Journey C)
     */
    showPropertyMarkers() {
        AppData.properties.forEach(property => {
            const marker = L.marker(property.coords, {
                icon: this.createMarkerIcon('property')
            });

            marker.on('click', () => {
                this.showRouteToJasm(property);
                UI.showPropertyPanel(property);
            });

            this.markers[property.id] = marker;
            this.layers.properties.addLayer(marker);
        });

        this.layers.properties.addTo(this.map);
    },

    /**
     * Show route line from property to JASM
     */
    showRouteToJasm(property) {
        // Clear existing route
        this.layers.route.clearLayers();

        // Create route line - neutral color to let markers stand out
        const route = L.polyline(
            [property.coords, AppData.jasmLocation],
            {
                color: '#64748b',
                weight: 3,
                dashArray: '8, 8',
                opacity: 0.7
            }
        );

        this.layers.route.addLayer(route);
        this.layers.route.addTo(this.map);

        // Fit bounds to show both points with smooth animation
        const bounds = L.latLngBounds([property.coords, AppData.jasmLocation]);
        this.map.flyToBounds(bounds, {
            padding: [80, 80],
            duration: 1.5,
            easeLinearity: 0.2
        });
    },

    /**
     * Clear route line
     */
    clearRoute() {
        this.layers.route.clearLayers();
    },

    /**
     * Clear all layers and markers
     */
    clearAll() {
        Object.values(this.layers).forEach(layer => {
            if (layer) {
                layer.clearLayers();
                if (this.map.hasLayer(layer)) {
                    this.map.removeLayer(layer);
                }
            }
        });
        this.markers = {};
    },

    /**
     * Reset map to initial view
     */
    resetView() {
        const config = AppData.mapConfig;
        this.map.flyTo(config.center, config.initialZoom, {
            duration: 1.5,
            easeLinearity: 0.2
        });
    },

    /**
     * Show a specific layer by name
     */
    showLayer(layerName) {
        const layer = this.layers[layerName];
        if (layer && !this.map.hasLayer(layer)) {
            layer.addTo(this.map);
        }
    },

    /**
     * Hide a specific layer by name
     */
    hideLayer(layerName) {
        const layer = this.layers[layerName];
        if (layer && this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }
    }
};
