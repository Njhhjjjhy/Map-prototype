import { AppData } from "../data/index.js";

export const methods = {
  showTrainingCenterMarker(item) {
    if (!item || !item.coords) return;

    // Remove existing training marker
    if (this.markers["training-center"]) {
      this.markers["training-center"].remove();
      delete this.markers["training-center"];
    }

    const markerHtml = `<div style="
          display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;
      "><div style="
          width: 28px; height: 28px;
          background: #34c759;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          color: white;
      ">T</div><span style="
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
          text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;
      ">${item.title}</span></div>`;

    const { marker } = this._createMarker(item.coords, markerHtml, {
      className: "training-center-marker",
    });
    this.markers["training-center"] = marker;
    this._layerGroups.talentPipeline.push("training-center");
  },

  showEmploymentMarker(item) {
    if (!item || !item.coords) return;

    // Remove existing employment marker
    if (this.markers["employment-data"]) {
      this.markers["employment-data"].remove();
      delete this.markers["employment-data"];
    }

    const markerHtml = `<div style="
          display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;
      "><div style="
          width: 28px; height: 28px;
          background: #007aff;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
      "><svg viewBox="0 0 24 24" fill="white" width="14" height="14"><rect x="2" y="7" width="6" height="14" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/><rect x="16" y="10" width="6" height="11" rx="1"/></svg></div><span style="
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
          text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;
      ">${item.title}</span></div>`;

    const { marker } = this._createMarker(item.coords, markerHtml, {
      className: "employment-data-marker",
    });
    this.markers["employment-data"] = marker;
    this._layerGroups.talentPipeline.push("employment-data");
  },

  async showTalentPipeline(opts = {}) {
    this.hideTalentPipeline();

    const pipeline = AppData.talentPipeline;
    if (!pipeline || !pipeline.institutions) return;

    const jasmCoords = AppData.jasmLocation || [32.88565, 130.84237];

    // JASM logo marker at the convergence point
    const jasmHtml = `<div style="
            width: 48px; height: 48px;
            background: #ffffff;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
        "><img src="assets/Jasm-logo.svg" alt="JASM" style="width: 36px; height: 36px; object-fit: contain;" /></div>`;
    const { marker: jasmMarker } = this._createMarker(jasmCoords, jasmHtml, {
      className: "jasm-talent-marker",
      entrance: "ripple",
    });
    this.markers["talent-jasm"] = jasmMarker;
    this._layerGroups.talentPipeline.push("talent-jasm");

    // Place all university markers first
    pipeline.institutions.forEach((inst) => {
      const html = `<div class="talent-marker-icon" style="
              width: 48px; height: 48px;
              background: #ffffff;
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              border: 2px solid white;
              cursor: pointer;
              overflow: hidden;
          "><img src="${inst.logo}" alt="${inst.name}" style="width: 36px; height: 36px; object-fit: contain;" /></div>`;

      const { marker, element } = this._createMarker(inst.coords, html, {
        className: "talent-marker-wrapper",
        entrance: "ripple",
      });

      if (!marker || !element) return;

      // Hover-only name label
      this._addTooltip(marker, element, inst.name);
      element.addEventListener("click", () => {
        if (typeof App !== "undefined") {
          App.toggleUniversity(inst.id);
        }
      });

      const id = `talent-${inst.id}`;
      this.markers[id] = marker;
      this._layerGroups.talentPipeline.push(id);
    });

    // Animate arc lines one by one with staggered overlap
    const staggerDelay = 400;
    for (let i = 0; i < pipeline.institutions.length; i++) {
      const inst = pipeline.institutions[i];
      if (i > 0) await this._delay(staggerDelay);
      this._addAnimatedTalentArc(inst.coords, jasmCoords, inst, i);
    }
  },

  _addAnimatedTalentArc(origin, destination, inst, index) {
    const midLat = (origin[0] + destination[0]) / 2;
    const midLng = (origin[1] + destination[1]) / 2;

    const dLat = destination[0] - origin[0];
    const dLng = destination[1] - origin[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    const arcHeight = Math.max(0.15, Math.min(1.0, distance * 0.12));

    const arcMid = [midLat + arcHeight, midLng];
    const allPoints = this.generateBezierPoints(
      origin,
      arcMid,
      destination,
      50,
    );

    const color = inst.color || "rgba(0, 122, 255, 0.6)";
    const sourceId = `talent-arc-${index}`;

    this._safeAddSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: allPoints.slice(0, 2) },
      },
    });

    this.map.addLayer({
      id: `${sourceId}-line`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": color,
        "line-width": 2,
        "line-opacity": 0.6,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    this._layerGroups.talentPipeline.push(`${sourceId}-line`, sourceId);

    // Progressively extend the line
    const totalSteps = 15;
    const stepInterval = 40;
    let currentStep = 0;

    const drawNext = () => {
      currentStep++;
      if (currentStep > totalSteps) return;
      const src = this.map.getSource(sourceId);
      if (!src) return;

      const pointCount = Math.round(
        (currentStep / totalSteps) * allPoints.length,
      );
      const pts = allPoints.slice(0, Math.max(2, pointCount));
      src.setData({
        type: "Feature",
        geometry: { type: "LineString", coordinates: pts },
      });

      if (currentStep < totalSteps) {
        setTimeout(drawNext, stepInterval);
      }
    };
    setTimeout(drawNext, stepInterval);
  },

  showEmploymentMarkers() {
    this.hideEmploymentMarkers();

    const employers = [
      {
        id: "emp-jasm",
        coords: AppData.jasmLocation || [32.88565, 130.84237],
        logo: "assets/Jasm-logo.svg",
        name: "JASM (TSMC)",
        dataId: "jasm",
      },
      {
        id: "emp-tel",
        coords: [32.85, 130.73],
        logo: "assets/Tokyo-electron-logo.svg",
        name: "Tokyo Electron",
        dataId: "tel",
      },
    ];

    employers.forEach((emp, index) => {
      const html = `<div style="
              width: 48px; height: 48px;
              background: #ffffff;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              display: flex; align-items: center; justify-content: center;
              overflow: hidden;
              cursor: pointer;
          "><img src="${emp.logo}" alt="${emp.name}" style="width: 36px; height: 36px; object-fit: contain;" /></div>`;

      const { marker, element } = this._createMarker(emp.coords, html, {
        className: "employment-company-marker",
        entrance: "ripple",
      });

      if (!marker || !element) return;

      if (index > 0) {
        element.style.animationDelay = `${index * 100}ms`;
      }

      this._addTooltip(marker, element, emp.name);
      element.addEventListener("click", () => {
        if (typeof App !== "undefined") {
          App.toggleEmployer(emp.dataId);
        }
      });

      this.markers[emp.id] = marker;
      if (!this._layerGroups.employmentMarkers) {
        this._layerGroups.employmentMarkers = [];
      }
      this._layerGroups.employmentMarkers.push(emp.id);
    });
  },

  hideEmploymentMarkers() {
    const group = this._layerGroups.employmentMarkers || [];
    group.forEach((id) => {
      if (this.markers[id]) {
        const marker = this.markers[id];
        const el = marker.getElement();
        marker.remove();
        if (el && el.parentNode) el.remove();
        delete this.markers[id];
      }
    });
    this._layerGroups.employmentMarkers = [];
  },

  hideTalentPipeline() {
    this._layerGroups.talentPipeline.forEach((id) => {
      if (this.markers[id]) {
        const marker = this.markers[id];
        const element = marker.getElement();
        marker.remove();
        if (element && element.parentNode) {
          element.remove();
        }
        delete this.markers[id];
      }
      // Remove arc layers and sources
      if (id.endsWith("-line")) {
        this._safeRemoveLayer(id);
      } else if (id.startsWith("talent-arc-")) {
        this._safeRemoveSource(id);
      }
    });

    // Legacy cleanup
    this._safeRemoveLayer("talent-pipeline-lines-line");
    this._safeRemoveSource("talent-pipeline-lines");

    this._layerGroups.talentPipeline = [];
  },

  showPropertyContextLines(property) {
    // Clean up hover listeners from previous lines
    if (this._contextLineHoverCleanup) {
      this._contextLineHoverCleanup();
      this._contextLineHoverCleanup = null;
    }
    // Synchronous cleanup (skip fade-out animation when replacing lines immediately)
    this._removeLayerGroup("propertyContextLines");

    const conn = property.connections;
    if (!conn) return;

    const propLngLat = this._toMapbox(property.coords);

    // Build line features for each connection type
    const lineColors = {
      jasm: "#ff3b30",
      station: "#007aff",
      airport: "#34c759",
      road: "#5ac8fa",
    };

    const lineLabels = {
      jasm: `JASM - ${conn.jasm.time}`,
      station: `${conn.station.name} - ${conn.station.time}`,
      airport: `Airport - ${conn.airport.time}`,
      road: `${conn.road.name} - ${conn.road.time}`,
    };

    const features = [];
    const types = ["jasm", "station", "airport", "road"];
    const allCoords = [propLngLat];

    types.forEach((type, index) => {
      const target = conn[type];
      if (!target || !target.coords) return;
      const targetLngLat = this._toMapbox(target.coords);
      allCoords.push(targetLngLat);

      features.push({
        type: "Feature",
        id: index,
        geometry: {
          type: "LineString",
          coordinates: [propLngLat, targetLngLat],
        },
        properties: {
          type: type,
          label: lineLabels[type],
          color: lineColors[type],
          index: index,
        },
      });
    });

    const sourceId = "property-context-lines";
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features },
    });

    // Glow layer
    this.map.addLayer({
      id: `${sourceId}-glow`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": ["get", "color"],
        "line-width": 24,
        "line-opacity": ["number", ["feature-state", "opacity"], 0],
        "line-blur": 16,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    // Main line layer - dashed
    this.map.addLayer({
      id: `${sourceId}-line`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": ["get", "color"],
        "line-width": 6,
        "line-opacity": ["number", ["feature-state", "opacity"], 0],
        "line-dasharray": [6, 4],
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    // Transparent wide hit-test layer for easier hover
    this.map.addLayer({
      id: `${sourceId}-hit`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "transparent",
        "line-width": 24,
        "line-opacity": 1,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    // Hover tooltip on lines (same pattern as icon/logo hovers)
    const lineLayerId = `${sourceId}-hit`;
    const lineTooltip = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: [0, -12],
      className: "mapbox-tooltip",
    });

    const onLineMouseMove = (e) => {
      if (!e.features || !e.features.length) return;
      this.map.getCanvas().style.cursor = "pointer";
      const label = e.features[0].properties.label;
      lineTooltip.setLngLat(e.lngLat).setText(label).addTo(this.map);
    };
    const onLineMouseLeave = () => {
      this.map.getCanvas().style.cursor = "";
      lineTooltip.remove();
    };

    this.map.on("mousemove", lineLayerId, onLineMouseMove);
    this.map.on("mouseleave", lineLayerId, onLineMouseLeave);

    // Store cleanup references for hover listeners
    this._contextLineHoverCleanup = () => {
      lineTooltip.remove();
      if (this.map) {
        this.map.off("mousemove", lineLayerId, onLineMouseMove);
        this.map.off("mouseleave", lineLayerId, onLineMouseLeave);
      }
    };

    // Stagger line appearance
    features.forEach((feature, index) => {
      setTimeout(() => {
        if (!this.map || !this.map.getSource(sourceId)) return;
        this.map.setFeatureState(
          { source: sourceId, id: index },
          { opacity: 0.2 },
        );
        // Fade in over two frames
        setTimeout(() => {
          if (!this.map || !this.map.getSource(sourceId)) return;
          this.map.setFeatureState(
            { source: sourceId, id: index },
            { opacity: 0.7 },
          );
        }, 150);
      }, index * 200);
    });

    this._layerGroups.propertyContextLines.push(
      `${sourceId}-glow`,
      `${sourceId}-line`,
      `${sourceId}-hit`,
      sourceId,
    );

    // Add endpoint markers at each connection target so lines clearly lead somewhere
    const endpointIcons = {
      jasm: `<img src="assets/Jasm-logo.svg" width="22" height="22" style="object-fit: contain;" alt="JASM" />`,
      station: `<svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12 2C8 2 5 4 5 8v6c0 2 1 3.5 3 4l-2 2v1h12v-1l-2-2c2-.5 3-2 3-4V8c0-4-3-6-7-6zm-2 14H8v-4h2v4zm6 0h-2v-4h2v4zm2-6H6V8c0-3 2.5-4 6-4s6 1 6 4v2z"/></svg>`,
      airport: `<svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
      road: `<svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M11 2v3H8l1 3h2v3H8l1 3h2v3H8l1 3h2v2h2v-2h2l-1-3h-2v-3h3l-1-3h-2V8h3l-1-3h-2V2h-2z"/></svg>`,
    };
    const endpointNames = {
      jasm: "JASM (TSMC)",
      station: conn.station?.name || "Station",
      airport: "Kumamoto Airport",
      road: conn.road?.name || "Road",
    };
    types.forEach((type, index) => {
      const target = conn[type];
      if (!target || !target.coords) return;
      const endpointId = `context-endpoint-${type}`;
      const color = lineColors[type];
      const icon = endpointIcons[type] || "";
      // JASM uses white background for logo; others use colored background
      const markerBg = type === "jasm" ? "#ffffff" : color;
      const html = this._elevatedMarkerHtml(icon, markerBg, 36);
      const { marker, element } = this._createMarker(target.coords, html, {
        ariaLabel: endpointNames[type],
      });
      if (marker) {
        // Hover tooltip
        this._addTooltip(marker, element, endpointNames[type], [0, -28]);

        // Click to show endpoint detail in panel
        element.addEventListener("click", () => {
          UI.showEndpointDetail(property, type);
        });

        // Fade in with stagger matching lines
        if (element) {
          element.style.opacity = "0";
          element.style.transition = "opacity 300ms ease";
          setTimeout(
            () => {
              element.style.opacity = "1";
            },
            index * 200 + 150,
          );
        }
        this.markers[endpointId] = marker;
        this._layerGroups.propertyContextLines.push(endpointId);
      }
    });

    // Fly to per-property camera position (or fallback to fitBounds)
    if (property.camera) {
      this.map.flyTo({
        center: property.camera.center,
        zoom: property.camera.zoom,
        pitch: property.camera.pitch,
        bearing: property.camera.bearing,
        duration: 1500,
      });
    } else {
      const bounds = allCoords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]),
      );
      this.map.fitBounds(bounds, {
        padding: { top: 80, bottom: 100, left: 80, right: 420 },
        duration: 1500,
        maxZoom: 12,
        pitch: 45,
        bearing: 0,
      });
    }
  },

  removePropertyContextLines() {
    // Clean up hover listeners
    if (this._contextLineHoverCleanup) {
      this._contextLineHoverCleanup();
      this._contextLineHoverCleanup = null;
    }

    const sourceId = "property-context-lines";
    if (!this.map || !this.map.getSource(sourceId)) {
      // Nothing to remove - just clear the tracking array in case of stale entries
      this._layerGroups.propertyContextLines = [];
      return;
    }
    // Fade out feature states
    const features = this.map.getSource(sourceId)._data;
    if (features && features.features) {
      features.features.forEach((_, i) => {
        this.map.setFeatureState(
          { source: sourceId, id: i },
          { opacity: 0 },
        );
      });
    }
    // Remove layers after fade completes
    setTimeout(() => {
      this._removeLayerGroup("propertyContextLines");
    }, 300);
  },
};
