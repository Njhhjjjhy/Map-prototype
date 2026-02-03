/**
 * Map functionality using Leaflet and OpenStreetMap
 */

const MapManager = {
    map: null,
    markers: {},
    clusterGroups: {},
    highlightedEvidenceMarker: null, // Track highlighted evidence marker for bidirectional sync
    selectedInfrastructureRoad: null, // Track selected infrastructure road for single-selection
    infrastructureRoadPolylines: {}, // Track road polylines for selection state
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
            property: '#ff9500',
            company: '#007aff'
        };
        const color = colors[type] || '#fbb931';

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
     * Uses clustering when there are 5+ companies to prevent overlapping
     */
    showCompanyMarkers() {
        const useCluster = AppData.companies.length >= 5;

        AppData.companies.forEach(company => {
            const marker = L.marker(company.coords, {
                icon: this.createMarkerIcon('company')
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
     * Uses clustering when there are 5+ properties to prevent overlapping
     */
    showPropertyMarkers() {
        const useCluster = AppData.properties.length >= 5;

        AppData.properties.forEach(property => {
            const marker = L.marker(property.coords, {
                icon: this.createMarkerIcon('property')
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
            'pdf': '#6e7073',    // Gray for documents
            'image': '#007aff', // Blue for images
            'web': '#34c759'    // Green for web links
        };
        const color = colors[type] || colors['pdf'];

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

        AppData.infrastructureRoads.forEach(road => {
            const polyline = L.polyline(road.coords, {
                color: '#5ac8fa', // --color-map-infrastructure
                weight: 5,
                opacity: 0.7,
                dashArray: '10, 6',
                lineCap: 'round',
                lineJoin: 'round'
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
    }
};
