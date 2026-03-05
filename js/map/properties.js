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

  showTalentPipeline(opts = {}) {
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
        className: "talent-marker-wrapper",
        entrance: "ripple",
      });

      if (!marker || !element) return;

      if (delay > 0) {
        element.style.animationDelay = `${delay}ms`;
      }

      this._addTooltip(marker, element, `${inst.name} — ${inst.city}`);
      element.addEventListener("click", () => {
        if (typeof UI !== "undefined") {
          UI.showTalentInspector(inst.id);
        }
      });

      const id = `talent-${inst.id}`;
      this.markers[id] = marker;
      this._layerGroups.talentPipeline.push(id);
    });

    // Draw connection lines from each university to JASM
    const jasmCoords = AppData.jasmLocation || [32.874, 130.785];
    const jasmLngLat = this._toMapbox(jasmCoords);

    const lineFeatures = pipeline.institutions.map((inst) => ({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [this._toMapbox(inst.coords), jasmLngLat],
      },
      properties: { institutionId: inst.id, name: inst.name },
    }));

    const sourceId = "talent-pipeline-lines";
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: lineFeatures },
    });

    this.map.addLayer({
      id: `${sourceId}-line`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": "rgba(0, 122, 255, 0.35)",
        "line-width": 1.5,
        "line-dasharray": [4, 4],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    this._layerGroups.talentPipeline.push(`${sourceId}-line`, sourceId);

    // Fly to Kyushu overview to show all institutions
    if (!opts.skipFly) {
      this.flyToStep({
        center: [130.7, 32.5],
        zoom: 7,
        pitch: 25,
        bearing: 0,
        duration: 2500,
      });
    }
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
    });

    // Remove connection lines layer and source
    this._safeRemoveLayer("talent-pipeline-lines-line");
    this._safeRemoveSource("talent-pipeline-lines");

    this._layerGroups.talentPipeline = [];
  },

  showPropertyContextLines(property) {
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
      road: conn.road.name,
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
        "line-width": 12,
        "line-opacity": ["number", ["feature-state", "opacity"], 0],
        "line-blur": 8,
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
        "line-width": 3,
        "line-opacity": ["number", ["feature-state", "opacity"], 0],
        "line-dasharray": [6, 4],
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    // Label layer along lines
    this.map.addLayer({
      id: `${sourceId}-labels`,
      type: "symbol",
      source: sourceId,
      layout: {
        "symbol-placement": "line-center",
        "text-field": ["get", "label"],
        "text-size": 12,
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-anchor": "center",
        "text-offset": [0, -1.2],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": ["get", "color"],
        "text-halo-color": "#ffffff",
        "text-halo-width": 2,
        "text-opacity": ["number", ["feature-state", "textOpacity"], 0],
      },
    });

    // Stagger line appearance
    features.forEach((feature, index) => {
      setTimeout(() => {
        if (!this.map || !this.map.getSource(sourceId)) return;
        this.map.setFeatureState(
          { source: sourceId, id: index },
          { opacity: 0.2, textOpacity: 0 },
        );
        // Fade in over two frames
        setTimeout(() => {
          if (!this.map || !this.map.getSource(sourceId)) return;
          this.map.setFeatureState(
            { source: sourceId, id: index },
            { opacity: 0.7, textOpacity: 1 },
          );
        }, 150);
      }, index * 200);
    });

    this._layerGroups.propertyContextLines.push(
      `${sourceId}-glow`,
      `${sourceId}-line`,
      `${sourceId}-labels`,
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
          { opacity: 0, textOpacity: 0 },
        );
      });
    }
    // Remove layers after fade completes
    setTimeout(() => {
      this._removeLayerGroup("propertyContextLines");
    }, 300);
  },
};
