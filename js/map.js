/**
 * Map functionality using Leaflet and OpenStreetMap
 */

/**
 * Design system colors - mirrors CSS custom properties from CLAUDE.md
 * Keep in sync with :root variables in styles.css
 */
const MAP_COLORS = {
    // Semantic colors
    primary: '#fbb931',
    error: '#ff3b30',
    info: '#007aff',
    warning: '#ff9500',
    success: '#34c759',

    // Marker types (aligned with legend)
    resource: '#ff3b30',   // Red
    company: '#007aff',    // Blue
    property: '#ff9500',   // Orange/Amber
    zone: '#ff3b30',       // Red

    // Map-specific
    route: '#64748b',      // Neutral gray for route lines
    infrastructure: '#5ac8fa', // Teal for infrastructure roads

    // Evidence marker types
    evidencePdf: '#6e7073',    // Gray for documents
    evidenceImage: '#007aff',  // Blue for images
    evidenceWeb: '#34c759'     // Green for web links
};

const MapManager = {
    map: null,
    markers: {},
    clusterGroups: {},
    highlightedEvidenceMarker: null, // Track highlighted evidence marker for bidirectional sync
    selectedInfrastructureRoad: null, // Track selected infrastructure road for single-selection
    infrastructureRoadPolylines: {}, // Track road polylines for selection state
    infrastructureMarkers: [], // Track infrastructure markers (station, etc.)
    layers: {
        resources: null,
        sciencePark: null,
        companies: null,
        futureZones: null,
        properties: null,
        route: null,
        evidenceMarkers: null,
        infrastructureRoads: null
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
        this.layers.evidenceMarkers = L.layerGroup();
        this.layers.infrastructureRoads = L.layerGroup();

        // Initialize marker cluster groups for when there are many markers
        this.initClusterGroups();
    },

    /**
     * Initialize marker cluster groups with custom styling
     */
    initClusterGroups() {
        const clusterOptions = {
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            disableClusteringAtZoom: 14,
            maxClusterRadius: 50,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                let size = 'small';
                if (count >= 10) size = 'medium';
                if (count >= 25) size = 'large';

                return L.divIcon({
                    html: `<div class="marker-cluster marker-cluster-${size}"><span>${count}</span></div>`,
                    className: 'marker-cluster-wrapper',
                    iconSize: L.point(40, 40)
                });
            }
        };

        // Create separate cluster groups for each marker type
        this.clusterGroups.properties = L.markerClusterGroup({
            ...clusterOptions,
            iconCreateFunction: (cluster) => this.createClusterIcon(cluster, 'property')
        });

        this.clusterGroups.companies = L.markerClusterGroup({
            ...clusterOptions,
            iconCreateFunction: (cluster) => this.createClusterIcon(cluster, 'company')
        });
    },

    /**
     * Create custom cluster icon with type-specific styling
     */
    createClusterIcon(cluster, type) {
        const count = cluster.getChildCount();
        const colors = {
            property: MAP_COLORS.property,
            company: MAP_COLORS.company
        };
        const color = colors[type] || MAP_COLORS.primary;

        let size = 36;
        if (count >= 10) size = 44;
        if (count >= 25) size = 52;

        return L.divIcon({
            html: `<div class="marker-cluster" style="
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                font-size: ${size > 40 ? '14px' : '12px'};
                font-weight: 600;
                color: white;
            ">${count}</div>`,
            className: 'marker-cluster-wrapper',
            iconSize: L.point(size, size)
        });
    },

    /**
     * Create a custom marker icon with distinct icons per type
     */
    createMarkerIcon(type, subtype = null) {
        // Colors aligned with legend - uses MAP_COLORS design tokens
        const colors = {
            resource: MAP_COLORS.resource,
            company: MAP_COLORS.company,
            property: MAP_COLORS.property,
            zone: MAP_COLORS.zone
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
        const color = colors[type] || MAP_COLORS.primary;

        // 48px hit area for touch targets (HIG accessibility)
        // Visual marker is 36px, but hit area is 48px
        return L.divIcon({
            className: 'custom-marker-wrapper',
            html: `<div class="custom-marker-hitarea" style="
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            "><div class="custom-marker ${type}-marker" style="
                width: 36px;
                height: 36px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.15s ease;
            ">${icon}</div></div>`,
            iconSize: [48, 48],
            iconAnchor: [24, 24]
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

        // Add tooltip with resource name
        marker.bindTooltip(resource.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -20],
            className: 'map-tooltip'
        });

        marker.on('click', () => {
            UI.showResourcePanel(resource);
        });

        this.markers[resourceId] = marker;
        this.layers.resources.addLayer(marker);
        this.layers.resources.addTo(this.map);

        // Fly to location
        this.flyTo(resource.coords, AppData.mapConfig.resourceZoom);

        // Show evidence markers for water
        if (resourceId === 'water') {
            this.showWaterEvidenceMarkers();
        }
    },

    /**
     * Show evidence markers for water resource
     */
    showWaterEvidenceMarkers() {
        const waterData = AppData.resources.water;
        if (!waterData.evidenceMarkers) return;

        waterData.evidenceMarkers.forEach(evidence => {
            const marker = L.marker(evidence.coords, {
                icon: L.divIcon({
                    className: 'evidence-marker water-evidence',
                    html: `<div class="marker-dot" style="background: #007aff;"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            });

            marker.on('click', () => {
                UI.showWaterEvidencePanel(evidence);
            });

            marker.addTo(this.map);
            this.markers.push(marker);
        });
    },

    /**
     * Show Science Park circle (Journey B)
     */
    showSciencePark() {
        const sp = AppData.sciencePark;

        // Create circle
        const circle = L.circle(sp.center, {
            radius: sp.radius,
            color: MAP_COLORS.error,
            weight: 3,
            fillColor: MAP_COLORS.error,
            fillOpacity: 0.1,
            className: 'science-park-circle'
        });

        // Add tooltip with science park name
        circle.bindTooltip(sp.name, {
            permanent: false,
            direction: 'top',
            className: 'map-tooltip'
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
     * Uses clustering when there are 5+ companies to prevent overlapping
     */
    showCompanyMarkers() {
        const useCluster = AppData.companies.length >= 5;

        AppData.companies.forEach(company => {
            const marker = L.marker(company.coords, {
                icon: this.createMarkerIcon('company')
            });

            // Add tooltip with company name
            marker.bindTooltip(company.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -20],
                className: 'map-tooltip'
            });

            marker.on('click', () => {
                UI.showCompanyPanel(company);
            });

            this.markers[company.id] = marker;

            if (useCluster) {
                this.clusterGroups.companies.addLayer(marker);
            } else {
                this.layers.companies.addLayer(marker);
            }
        });

        if (useCluster) {
            this.clusterGroups.companies.addTo(this.map);
        } else {
            this.layers.companies.addTo(this.map);
        }
    },

    /**
     * Show government commitment chain markers
     */
    showGovernmentChain() {
        const chain = AppData.governmentChain;
        if (!chain || !chain.levels) return;

        chain.levels.forEach((level, index) => {
            // Stagger marker appearance for momentum effect
            setTimeout(() => {
                const marker = L.marker(level.coords, {
                    icon: L.divIcon({
                        className: 'government-marker',
                        html: `<div class="marker-dot" style="background: ${level.type === 'concept' ? '#ff9500' : '#34c759'}; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><span style="font-size: 10px; font-weight: bold; color: white;">${index + 1}</span></div>`,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    })
                });

                marker.on('click', () => {
                    UI.showGovernmentLevelPanel(level);
                });

                marker.addTo(this.map);
                this.markers[`govt-${level.id}`] = marker;
            }, index * 200); // 200ms stagger between markers
        });
    },

    /**
     * Show future development zones (Journey B - Future view)
     */
    showFutureZones() {
        AppData.futureZones.forEach(zone => {
            // Create circle for zone - red to indicate development areas
            const circle = L.circle(zone.coords, {
                radius: zone.radius,
                color: MAP_COLORS.zone,
                weight: 2,
                fillColor: MAP_COLORS.zone,
                fillOpacity: 0.12,
                dashArray: '5, 10'
            });

            // Add tooltip with zone name
            circle.bindTooltip(zone.name, {
                permanent: false,
                direction: 'top',
                className: 'map-tooltip'
            });

            circle.on('click', () => {
                UI.showFutureZonePanel(zone);
            });

            // Add marker at center
            const marker = L.marker(zone.coords, {
                icon: this.createMarkerIcon('zone')
            });

            // Add tooltip with zone name
            marker.bindTooltip(zone.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -20],
                className: 'map-tooltip'
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
     * Uses clustering when there are 5+ properties to prevent overlapping
     */
    showPropertyMarkers() {
        const useCluster = AppData.properties.length >= 5;

        AppData.properties.forEach(property => {
            const marker = L.marker(property.coords, {
                icon: this.createMarkerIcon('property')
            });

            // Add tooltip with property name
            marker.bindTooltip(property.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -20],
                className: 'map-tooltip'
            });

            marker.on('click', () => {
                this.showRouteToJasm(property);
                UI.showPropertyPanel(property);
            });

            this.markers[property.id] = marker;

            if (useCluster) {
                this.clusterGroups.properties.addLayer(marker);
            } else {
                this.layers.properties.addLayer(marker);
            }
        });

        if (useCluster) {
            this.clusterGroups.properties.addTo(this.map);
        } else {
            this.layers.properties.addTo(this.map);
        }
    },

    /**
     * Show route line from property to JASM
     */
    showRouteToJasm(property) {
        // Clear existing route
        this.layers.route.clearLayers();

        // Create route line - neutral color to let markers stand out
        // Uses CSS animation class for drawing effect
        const route = L.polyline(
            [property.coords, AppData.jasmLocation],
            {
                color: MAP_COLORS.route,
                weight: 3,
                dashArray: '8, 8',
                opacity: 0.7,
                className: 'route-line-animated'
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

        // Also clear cluster groups
        Object.values(this.clusterGroups).forEach(cluster => {
            if (cluster) {
                cluster.clearLayers();
                if (this.map.hasLayer(cluster)) {
                    this.map.removeLayer(cluster);
                }
            }
        });

        this.markers = {};
        this.highlightedEvidenceMarker = null;
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
        // Check regular layers first
        const layer = this.layers[layerName];
        if (layer && !this.map.hasLayer(layer)) {
            layer.addTo(this.map);
        }

        // Also check cluster groups
        const cluster = this.clusterGroups[layerName];
        if (cluster && !this.map.hasLayer(cluster)) {
            cluster.addTo(this.map);
        }
    },

    /**
     * Hide a specific layer by name
     */
    hideLayer(layerName) {
        // Check regular layers first
        const layer = this.layers[layerName];
        if (layer && this.map.hasLayer(layer)) {
            this.map.removeLayer(layer);
        }

        // Also check cluster groups
        const cluster = this.clusterGroups[layerName];
        if (cluster && this.map.hasLayer(cluster)) {
            this.map.removeLayer(cluster);
        }
    },

    // ================================
    // EVIDENCE GROUP MARKERS
    // ================================

    /**
     * Show markers for evidence sub-items that have distinct coordinates
     * @param {Object} group - Evidence group with items
     */
    showEvidenceGroupMarkers(group) {
        // Clear existing evidence markers
        this.layers.evidenceMarkers.clearLayers();

        group.items.forEach(item => {
            if (item.coords) {
                const marker = L.marker(item.coords, {
                    icon: this.createEvidenceMarkerIcon(item.type)
                });

                marker.on('click', () => {
                    UI.selectDisclosureItem(group.id, item.id);
                });

                // Store marker with composite key
                this.markers[`evidence-${group.id}-${item.id}`] = marker;
                this.layers.evidenceMarkers.addLayer(marker);
            }
        });

        this.layers.evidenceMarkers.addTo(this.map);
    },

    /**
     * Clear all evidence markers
     */
    clearEvidenceMarkers() {
        this.layers.evidenceMarkers.clearLayers();

        // Remove evidence markers from markers object
        Object.keys(this.markers).forEach(key => {
            if (key.startsWith('evidence-')) {
                delete this.markers[key];
            }
        });

        this.highlightedEvidenceMarker = null;
    },

    /**
     * Create evidence marker icon
     * @param {string} type - Document type (pdf, image, web)
     * @returns {L.DivIcon} Leaflet div icon
     */
    createEvidenceMarkerIcon(type, highlighted = false) {
        const colors = {
            'pdf': MAP_COLORS.evidencePdf,
            'image': MAP_COLORS.evidenceImage,
            'web': MAP_COLORS.evidenceWeb
        };
        const color = colors[type] || MAP_COLORS.evidencePdf;

        const icons = {
            'pdf': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>`,
            'image': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>`,
            'web': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>`
        };
        const iconSvg = icons[type] || icons['pdf'];

        const highlightStyle = highlighted
            ? `box-shadow: 0 0 0 4px rgba(251, 185, 49, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);`
            : `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);`;

        return L.divIcon({
            html: `
                <div style="
                    width: 28px;
                    height: 28px;
                    background: ${color};
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    ${highlightStyle}
                    transition: box-shadow 0.15s ease;
                ">
                    <div style="width: 14px; height: 14px;">
                        ${iconSvg}
                    </div>
                </div>
            `,
            className: 'evidence-marker',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });
    },

    /**
     * Highlight a specific evidence marker (for bidirectional sync)
     * @param {string} groupId - Group ID
     * @param {string} itemId - Item ID
     */
    highlightEvidenceMarker(groupId, itemId) {
        const markerId = `evidence-${groupId}-${itemId}`;
        const marker = this.markers[markerId];

        if (marker) {
            // Clear previous highlight
            this.clearEvidenceMarkerHighlight();

            // Store reference to highlighted marker
            this.highlightedEvidenceMarker = { marker, groupId, itemId };

            // Find the item to get its type
            const group = AppData.evidenceGroups[groupId];
            const item = group?.items.find(i => i.id === itemId);
            const type = item?.type || 'pdf';

            // Update icon to highlighted state
            marker.setIcon(this.createEvidenceMarkerIcon(type, true));

            // Pan to marker
            this.map.panTo(marker.getLatLng(), { duration: 0.5 });
        }
    },

    /**
     * Clear evidence marker highlight
     */
    clearEvidenceMarkerHighlight() {
        if (this.highlightedEvidenceMarker) {
            const { marker, groupId, itemId } = this.highlightedEvidenceMarker;

            // Find the item to get its type
            const group = AppData.evidenceGroups[groupId];
            const item = group?.items.find(i => i.id === itemId);
            const type = item?.type || 'pdf';

            // Reset to normal icon
            marker.setIcon(this.createEvidenceMarkerIcon(type, false));
            this.highlightedEvidenceMarker = null;
        }
    },

    // ================================
    // INFRASTRUCTURE ROADS (Journey B)
    // ================================

    /**
     * Show infrastructure road overlays
     * Roads appear as teal dashed polylines that are clickable
     */
    showInfrastructureRoads() {
        // Clear any existing roads
        this.layers.infrastructureRoads.clearLayers();
        this.infrastructureRoadPolylines = {};
        this.selectedInfrastructureRoad = null;

        AppData.infrastructureRoads.forEach((road, index) => {
            const polyline = L.polyline(road.coords, {
                color: MAP_COLORS.infrastructure,
                weight: 5,
                opacity: 0, // Start invisible for animation
                dashArray: '10, 6',
                lineCap: 'round',
                lineJoin: 'round',
                className: 'infrastructure-road-animated'
            });

            // Stagger the fade-in animation
            setTimeout(() => {
                polyline.setStyle({ opacity: 0.7 });
            }, index * 100);

            // Add tooltip with road name (macOS HIG: 500ms delay)
            polyline.bindTooltip(road.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -10],
                className: 'map-tooltip'
            });

            // Store reference for selection state management
            this.infrastructureRoadPolylines[road.id] = polyline;

            // Hover effects
            polyline.on('mouseover', () => {
                if (this.selectedInfrastructureRoad !== road.id) {
                    polyline.setStyle({
                        weight: 7,
                        opacity: 1.0
                    });
                }
            });

            polyline.on('mouseout', () => {
                if (this.selectedInfrastructureRoad !== road.id) {
                    polyline.setStyle({
                        weight: 5,
                        opacity: 0.7
                    });
                }
            });

            // Click to select
            polyline.on('click', () => {
                this.selectInfrastructureRoad(road.id);
                UI.showRoadPanel(road);
            });

            this.layers.infrastructureRoads.addLayer(polyline);
        });

        this.layers.infrastructureRoads.addTo(this.map);

        // Also show station marker
        const station = AppData.infrastructureStation;
        if (station) {
            const stationMarker = L.marker(station.coords, {
                icon: L.divIcon({
                    className: 'infrastructure-marker station-marker',
                    html: `<div class="marker-icon" style="background: #5ac8fa; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M4 15v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M4 11h16v4H4z"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/></svg></div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            });

            stationMarker.on('click', () => {
                // Deselect any selected road
                this.clearInfrastructureRoadSelection();
                UI.showStationPanel(station);
            });

            stationMarker.addTo(this.map);
            this.infrastructureMarkers.push(stationMarker);
        }

        // Fit bounds to show all roads
        const allCoords = AppData.infrastructureRoads.flatMap(r => r.coords);
        if (allCoords.length > 0) {
            const bounds = L.latLngBounds(allCoords);
            this.map.flyToBounds(bounds, {
                padding: [60, 60],
                duration: 1.5,
                easeLinearity: 0.2
            });
        }
    },

    /**
     * Hide infrastructure road overlays
     */
    hideInfrastructureRoads() {
        this.map.removeLayer(this.layers.infrastructureRoads);
        this.selectedInfrastructureRoad = null;
        this.infrastructureRoadPolylines = {};

        // Remove station markers
        this.infrastructureMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.infrastructureMarkers = [];
    },

    /**
     * Select an infrastructure road (single-selection pattern)
     * @param {string} roadId - ID of the road to select
     */
    selectInfrastructureRoad(roadId) {
        // Deselect previous road if different
        if (this.selectedInfrastructureRoad && this.selectedInfrastructureRoad !== roadId) {
            this.deselectInfrastructureRoad(this.selectedInfrastructureRoad);
        }

        // Select new road
        const polyline = this.infrastructureRoadPolylines[roadId];
        if (polyline) {
            polyline.setStyle({
                weight: 7,
                opacity: 1.0,
                dashArray: null // Solid line when selected
            });
            this.selectedInfrastructureRoad = roadId;
        }
    },

    /**
     * Deselect an infrastructure road
     * @param {string} roadId - ID of the road to deselect
     */
    deselectInfrastructureRoad(roadId) {
        const polyline = this.infrastructureRoadPolylines[roadId];
        if (polyline) {
            polyline.setStyle({
                weight: 5,
                opacity: 0.7,
                dashArray: '10, 6'
            });
        }
        if (this.selectedInfrastructureRoad === roadId) {
            this.selectedInfrastructureRoad = null;
        }
    },

    /**
     * Clear infrastructure road selection (called when panel closes)
     */
    clearInfrastructureRoadSelection() {
        if (this.selectedInfrastructureRoad) {
            this.deselectInfrastructureRoad(this.selectedInfrastructureRoad);
        }
    },

    // ================================
    // DATA LAYER MARKERS
    // ================================

    /**
     * Store for data layer markers
     */
    dataLayerMarkers: {},

    /**
     * Show markers for a data layer
     * @param {string} layerName - Layer identifier
     * @param {Object} layerData - Layer data with markers array
     */
    showDataLayerMarkers(layerName, layerData) {
        if (!layerData || !layerData.markers) return;

        // Initialize layer if not exists
        if (!this.layers[layerName]) {
            this.layers[layerName] = L.layerGroup();
        }

        // Clear existing markers for this layer
        this.layers[layerName].clearLayers();
        this.dataLayerMarkers[layerName] = {};

        // Color map for different layer types
        const layerColors = {
            trafficFlow: '#ef4444',    // Red
            railCommute: '#8b5cf6',    // Purple
            electricity: '#f59e0b',    // Amber
            employment: '#10b981',     // Emerald
            infrastructure: '#3b82f6', // Blue
            realEstate: '#f97316',     // Orange
            riskyArea: '#dc2626',      // Red
            baseMap: '#6b7280'         // Gray
        };

        const color = layerColors[layerName] || MAP_COLORS.primary;

        layerData.markers.forEach(markerData => {
            if (!markerData.coords) return;

            const marker = L.marker(markerData.coords, {
                icon: this.createDataLayerMarkerIcon(layerName, color)
            });

            // Add tooltip with name
            marker.bindTooltip(markerData.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -20],
                className: 'map-tooltip'
            });

            // Click to show detail
            marker.on('click', () => {
                UI.focusDataLayerMarker(layerName, markerData.id);
            });

            this.dataLayerMarkers[layerName][markerData.id] = marker;
            this.layers[layerName].addLayer(marker);
        });

        this.layers[layerName].addTo(this.map);

        // Fit bounds to show all markers
        const allCoords = layerData.markers.filter(m => m.coords).map(m => m.coords);
        if (allCoords.length > 0) {
            const bounds = L.latLngBounds(allCoords);
            this.map.flyToBounds(bounds, {
                padding: [80, 80],
                duration: 1,
                maxZoom: 12
            });
        }
    },

    /**
     * Hide markers for a data layer
     * @param {string} layerName - Layer identifier
     */
    hideDataLayerMarkers(layerName) {
        if (this.layers[layerName]) {
            this.map.removeLayer(this.layers[layerName]);
            this.layers[layerName].clearLayers();
        }
        if (this.dataLayerMarkers[layerName]) {
            delete this.dataLayerMarkers[layerName];
        }
    },

    /**
     * Focus on a specific data layer marker
     * @param {string} layerName - Layer identifier
     * @param {string} markerId - Marker identifier
     */
    focusDataLayerMarker(layerName, markerId) {
        const marker = this.dataLayerMarkers[layerName]?.[markerId];
        if (marker) {
            const latlng = marker.getLatLng();
            this.map.flyTo(latlng, 14, {
                duration: 0.8
            });
            marker.openTooltip();
        }
    },

    /**
     * Create marker icon for data layer
     * @param {string} layerName - Layer type
     * @param {string} color - Marker color
     * @returns {L.DivIcon} Leaflet div icon
     */
    createDataLayerMarkerIcon(layerName, color) {
        // Icons for each layer type (Lucide-style)
        const icons = {
            trafficFlow: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
            </svg>`,
            railCommute: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M8 3 L4 7 L8 11"/><path d="M4 7 L20 7"/>
                <rect x="6" y="11" width="12" height="10" rx="2"/>
                <path d="M9 21v-2h6v2"/>
            </svg>`,
            electricity: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>`,
            employment: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>`,
            infrastructure: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/>
                <line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/>
                <polygon points="12 2 20 7 4 7"/>
                <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>`,
            realEstate: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>`,
            riskyArea: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
            </svg>`,
            baseMap: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>`
        };

        const iconSvg = icons[layerName] || icons.baseMap;

        return L.divIcon({
            html: `
                <div style="
                    width: 36px;
                    height: 36px;
                    background: ${color};
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.15s ease;
                ">
                    <div style="width: 18px; height: 18px;">
                        ${iconSvg}
                    </div>
                </div>
            `,
            className: 'data-layer-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    },

    // ================================
    // DASHBOARD HELPER METHODS
    // ================================

    /**
     * Show a single property marker (for dashboard)
     * @param {Object} property - Property data
     */
    showSinglePropertyMarker(property) {
        const marker = L.marker(property.coords, {
            icon: this.createMarkerIcon('property')
        });

        marker.bindTooltip(property.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -20],
            className: 'map-tooltip'
        });

        this.markers[property.id] = marker;
        this.layers.properties.addLayer(marker);
        this.layers.properties.addTo(this.map);
    },

    /**
     * Show a single company marker (for dashboard)
     * @param {Object} company - Company data
     */
    showSingleCompanyMarker(company) {
        const marker = L.marker(company.coords, {
            icon: this.createMarkerIcon('company')
        });

        marker.bindTooltip(company.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -20],
            className: 'map-tooltip'
        });

        this.markers[company.id] = marker;
        this.layers.companies.addLayer(marker);
        this.layers.companies.addTo(this.map);
    },

    /**
     * Show a single infrastructure road (for dashboard)
     * @param {Object} road - Road data
     */
    showSingleInfrastructureRoad(road) {
        const polyline = L.polyline(road.coords, {
            color: MAP_COLORS.infrastructure,
            weight: 7,
            opacity: 1,
            dashArray: null, // Solid line when selected
            lineCap: 'round',
            lineJoin: 'round'
        });

        polyline.bindTooltip(road.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
            className: 'map-tooltip'
        });

        this.layers.infrastructureRoads.addLayer(polyline);
        this.layers.infrastructureRoads.addTo(this.map);

        // Fit bounds to show the road
        const bounds = L.latLngBounds(road.coords);
        this.map.flyToBounds(bounds, {
            padding: [80, 80],
            duration: 1,
            maxZoom: 13
        });
    },

    /**
     * Fly to a specific location
     * @param {Array} coords - [lat, lng]
     * @param {number} zoom - Zoom level
     */
    flyToLocation(coords, zoom = 14) {
        this.map.flyTo(coords, zoom, {
            duration: 1,
            easeLinearity: 0.2
        });
    }
};
