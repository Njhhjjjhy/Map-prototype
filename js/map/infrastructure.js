import { AppData } from "../data/index.js";
import { MAP_COLORS, CAMERA_STEPS } from "./constants.js";
import { TIMING } from "../app.js";

export const methods = {
  showAirportMarker(airport) {
    if (!airport || !airport.coords) return;

    // Remove existing airport marker
    if (this.markers["airport"]) {
      this.markers["airport"].remove();
      delete this.markers["airport"];
    }

    const markerHtml = `<div style="
          display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;
      "><div style="
          width: 28px; height: 28px;
          background: #ff9500;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
      ">✈</div><span style="
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-primary);
          text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;
      ">${airport.name}</span></div>`;

    const { marker } = this._createMarker(airport.coords, markerHtml, {
      className: "airport-marker",
    });
    this.markers["airport"] = marker;
    this._layerGroups.infrastructureRoads.push("airport");
  },

  hideAirportMarker() {
    if (this.markers["airport"]) {
      const el = this.markers["airport"].getElement();
      if (el) el.classList.add("marker-fade-out");
      this.markers["airport"].remove();
      delete this.markers["airport"];
    }
    // Remove from infrastructure roads group tracking
    const idx = this._layerGroups.infrastructureRoads.indexOf("airport");
    if (idx !== -1) this._layerGroups.infrastructureRoads.splice(idx, 1);
  },

  showGovernmentChain() {
    const chain = AppData.governmentChain;
    if (!chain || !chain.levels) return;

    chain.levels.forEach((level, index) => {
      setTimeout(() => {
        const color =
          level.type === "concept" ? MAP_COLORS.property : "#34c759";
        const innerHtml = `<span style="font-size: 14px; font-weight: 600; color: white;">${index + 1}</span>`;
        const html = this._elevatedMarkerHtml(innerHtml, color);

        const entrance = index === 0 ? "anchor" : "ripple";
        const { marker, element } = this._createMarker(level.coords, html, {
          entrance,
          ariaLabel: level.name,
        });
        // Build a tier-compatible object from the chain level data
        const tierData = {
          tierLabel: level.subtitle || "Government commitment",
          name: level.name,
          commitment: level.stats?.[0]?.value || "",
          commitmentLabel: level.stats?.[0]?.label || "",
          color: color,
          description: level.description || "",
          stats: level.stats || [],
        };
        element.addEventListener("click", () =>
          UI.showGovernmentTierPanel(tierData),
        );

        const id = `govt-${level.id}`;
        this.markers[id] = marker;
        this._layerGroups.governmentChain.push(id);
      }, index * 200);
    });

    // Announce markers after they have landed
    const announceDelay = chain.levels.length * 200 + 100;
    setTimeout(() => {
      UI.announceToScreenReader(
        chain.levels.length + " government commitment markers added",
      );
    }, announceDelay);
  },

  selectGovernmentLevel(levelId) {
    if (AppData.governmentTiers) {
      for (const tier of AppData.governmentTiers) {
        if (tier.id === levelId) {
          this.flyToStep({
            center: this._toMapbox(tier.coords),
            zoom: 12,
            pitch: 50,
            bearing: 15,
            duration: 2000,
          });
          UI.renderInspectorPanel(4, { title: tier.name });
          return;
        }
        if (tier.subItems) {
          const sub = tier.subItems.find((s) => s.id === levelId);
          if (sub) {
            this.flyToStep({
              center: this._toMapbox(sub.coords),
              zoom: 13,
              pitch: 50,
              bearing: 20,
              duration: 2000,
            });
            UI.renderInspectorPanel(4, { title: sub.name });
            return;
          }
        }
      }
    }
    const level = AppData.governmentChain.levels.find((l) => l.id === levelId);
    if (!level) return;
    this.flyToStep({
      center: this._toMapbox(level.coords),
      zoom: 12,
      pitch: 50,
      bearing: 15,
      duration: 2000,
    });
    UI.renderInspectorPanel(4, { title: level.name });
  },

  showGovernmentLevel(level) {
    // Hide first to prevent duplicates
    this.hideGovernmentLevel(level);

    const tiers = AppData.governmentTiers || [];
    const tier = tiers.find((t) => t.id === level);
    if (!tier) return;

    const groupKey =
      level === "central"
        ? "governmentArc"
        : level === "prefectural"
          ? "prefectureHighlight"
          : "municipalityCircles";

    if (level === "central") {
      this._showCentralArc(tier, groupKey);
    } else if (level === "prefectural") {
      this._showPrefectureHighlight(tier, groupKey);
    } else if (level === "local") {
      this._showMunicipalityCircles(tier, groupKey);
    }
  },

  _showCentralArc(tier, groupKey) {
    const color = tier.color || "#007aff";
    const origin = tier.tokyoCoords || [35.6762, 139.6503];
    const destination = tier.coords;

    // Calculate arc midpoint with height
    const midLat = (origin[0] + destination[0]) / 2;
    const midLng = (origin[1] + destination[1]) / 2;
    const dLat = destination[0] - origin[0];
    const dLng = destination[1] - origin[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    const arcHeight = Math.max(0.3, Math.min(1.5, distance * 0.25));
    const arcMid = [midLat + arcHeight, midLng];
    const points = this.generateBezierPoints(origin, arcMid, destination, 80);

    const sourceId = "govt-central-arc";
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: points },
      },
    });

    // Glow layer
    const glowLayerId = `${sourceId}-glow`;
    this.map.addLayer({
      id: glowLayerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": color,
        "line-width": 12,
        "line-opacity": 0,
        "line-blur": 4,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    // Main arc line
    const layerId = `${sourceId}-line`;
    this.map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": color,
        "line-width": 4,
        "line-opacity": 0.9,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    this._layerGroups[groupKey].push(glowLayerId, layerId, sourceId);

    // Animated reveal then ambient flow
    this._animateEnergyLine(layerId, glowLayerId, 0, 2500, 0);

    // Origin marker at Tokyo
    const tokyoHtml = this._elevatedMarkerHtml(
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>',
      color,
      32,
    );
    const tokyoId = "govt-central-tokyo";
    const { marker: tokyoMarker } = this._createMarker(origin, tokyoHtml, {
      entrance: "anchor",
      ariaLabel: "Tokyo - Central Government",
    });
    if (tokyoMarker) {
      this.markers[tokyoId] = tokyoMarker;
      this._layerGroups[groupKey].push(tokyoId);
    }

    // Destination marker at Kumamoto
    const kumaHtml = this._elevatedMarkerHtml(
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>',
      color,
      32,
    );
    const kumaId = "govt-central-kuma";
    const { marker: kumaMarker } = this._createMarker(destination, kumaHtml, {
      entrance: "ripple",
      ariaLabel: "Kumamoto - National policy destination",
    });
    if (kumaMarker) {
      this.markers[kumaId] = kumaMarker;
      this._layerGroups[groupKey].push(kumaId);
    }

    UI.announceToScreenReader(
      "Central government arc from Tokyo to Kumamoto added",
    );
  },

  _showPrefectureHighlight(tier, groupKey) {
    const color = tier.color || "#34c759";
    const boundary = AppData.kumamotoPrefectureBoundary;
    if (!boundary) return;

    const sourceId = "govt-prefecture-boundary";
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: boundary,
    });

    // Fill layer
    const fillId = `${sourceId}-fill`;
    this.map.addLayer({
      id: fillId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": color,
        "fill-opacity": 0,
      },
    });

    // Outline layer
    const outlineId = `${sourceId}-outline`;
    this.map.addLayer({
      id: outlineId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": color,
        "line-width": 2.5,
        "line-opacity": 0,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    this._layerGroups[groupKey].push(fillId, outlineId, sourceId);

    // Animate fade-in
    let startTime = null;
    const duration = 800;
    const self = this;

    const animateFade = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      try {
        if (self.map.getLayer(fillId)) {
          self.map.setPaintProperty(fillId, "fill-opacity", eased * 0.15);
        }
        if (self.map.getLayer(outlineId)) {
          self.map.setPaintProperty(outlineId, "line-opacity", eased * 0.7);
        }
      } catch (e) {
        return;
      }

      if (progress < 1) {
        self._energyLineAnimations[fillId] = requestAnimationFrame(animateFade);
      } else {
        delete self._energyLineAnimations[fillId];
      }
    };

    this._energyLineAnimations[fillId] = requestAnimationFrame(animateFade);

    // Prefecture center marker
    const prefHtml = this._elevatedMarkerHtml(
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>',
      color,
      32,
    );
    const prefId = "govt-prefecture-marker";
    const { marker: prefMarker } = this._createMarker(tier.coords, prefHtml, {
      entrance: "anchor",
      ariaLabel: "Kumamoto Prefecture",
    });
    if (prefMarker) {
      this.markers[prefId] = prefMarker;
      this._layerGroups[groupKey].push(prefId);
    }

    UI.announceToScreenReader("Kumamoto prefecture boundary highlighted");
  },

  _showMunicipalityCircles(tier, groupKey) {
    const color = tier.color || "#ff9500";
    const subItems = tier.subItems || [];
    if (subItems.length === 0) return;

    const circleStagger = 200;
    const markerBaseDelay = subItems.length * circleStagger + 400;

    // Phase 1: circles fade in with stagger
    subItems.forEach((item, index) => {
      const delay = index * circleStagger;

      setTimeout(() => {
        const circleSourceId = `govt-local-circle-${item.id}`;
        const circleFeature = item.boundary
          ? {
              type: "Feature",
              geometry: { type: "Polygon", coordinates: [item.boundary] },
            }
          : this._generateCirclePolygon(this._toMapbox(item.coords), 1200, 48);

        this._safeAddSource(circleSourceId, {
          type: "geojson",
          data: circleFeature,
        });

        const fillId = `${circleSourceId}-fill`;
        this.map.addLayer({
          id: fillId,
          type: "fill",
          source: circleSourceId,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.12,
          },
        });

        const outlineId = `${circleSourceId}-outline`;
        this.map.addLayer({
          id: outlineId,
          type: "line",
          source: circleSourceId,
          paint: {
            "line-color": color,
            "line-width": 2,
            "line-opacity": 0.5,
          },
        });

        this._layerGroups[groupKey].push(fillId, outlineId, circleSourceId);
      }, delay);
    });

    // Phase 2: labeled markers pop up after all circles are visible
    subItems.forEach((item, index) => {
      const delay = markerBaseDelay + index * 250;

      setTimeout(() => {
        const markerHtml = `<div class="municipality-labeled-marker" style="--marker-color: ${color};">
        <div class="municipality-label">
          <span class="municipality-label-name">${item.name}</span>
          <span class="municipality-label-value">${item.commitment}</span>
        </div>
        <div class="municipality-pulse-marker">
          <div class="municipality-pulse-ring" style="--pulse-color: ${color};"></div>
          <div class="municipality-pulse-dot" style="background: ${color};">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>
      </div>`;

        const markerId = `govt-local-${item.id}`;
        const { marker, element } = this._createMarker(
          item.coords,
          markerHtml,
          {
            className: "municipality-marker-wrapper",
            ariaLabel: `${item.name} - ${item.commitment}`,
          },
        );

        if (marker && element) {
          this.markers[markerId] = marker;
          this._layerGroups[groupKey].push(markerId);
        }
      }, delay);
    });

    const announceDelay = markerBaseDelay + subItems.length * 250 + 200;
    setTimeout(() => {
      UI.announceToScreenReader(
        subItems.length + " local municipality markers added",
      );
    }, announceDelay);
  },

  hideGovernmentLevel(level) {
    const groupKey =
      level === "central"
        ? "governmentArc"
        : level === "prefectural"
          ? "prefectureHighlight"
          : "municipalityCircles";

    const group = this._layerGroups[groupKey] || [];

    // Cancel running animations
    group.forEach((id) => {
      if (this._energyLineAnimations[id]) {
        cancelAnimationFrame(this._energyLineAnimations[id]);
        delete this._energyLineAnimations[id];
      }
    });

    // Remove markers
    group.forEach((id) => {
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

    // Remove layers then sources
    group.forEach((id) => {
      if (
        id.endsWith("-fill") ||
        id.endsWith("-outline") ||
        id.endsWith("-line") ||
        id.endsWith("-glow")
      ) {
        this._safeRemoveLayer(id);
      }
    });
    group.forEach((id) => {
      if (
        !id.endsWith("-fill") &&
        !id.endsWith("-outline") &&
        !id.endsWith("-line") &&
        !id.endsWith("-glow") &&
        !this.markers[id]
      ) {
        this._safeRemoveSource(id);
      }
    });

    this._layerGroups[groupKey] = [];
  },

  hideAllGovernmentLevels() {
    ["central", "prefectural", "local"].forEach((level) =>
      this.hideGovernmentLevel(level),
    );
  },

  showCompanyMarkers() {
    // Clear existing company markers to prevent accumulation across steps
    this._layerGroups.companies.forEach((id) => {
      if (this.markers[id]) {
        const el = this.markers[id].getElement();
        this.markers[id].remove();
        if (el && el.parentNode) el.remove();
        delete this.markers[id];
      }
    });
    this._layerGroups.companies = [];

    AppData.companies.forEach((company, index) => {
      setTimeout(() => {
        const html = this._brandedMarkerHtml(company.id);
        const entrance = company.id === "jasm" ? "anchor" : "ripple";
        const { marker, element } = this._createMarker(company.coords, html, {
          entrance,
          ariaLabel: company.name,
        });

        const tooltipText =
          (company.stats && company.stats[0] && company.stats[0].value) ||
          company.name;
        this._addTooltip(marker, element, tooltipText);
        element.addEventListener("click", () =>
          UI.showCompanyDetailPanel(company),
        );

        this.markers[company.id] = marker;
        this._layerGroups.companies.push(company.id);
      }, index * 80);
    });

    // Announce after all markers have landed
    setTimeout(
      () => {
        UI.announceToScreenReader(
          AppData.companies.length + " company markers added to map",
        );
      },
      AppData.companies.length * 80 + 100,
    );
  },

  showSemiconductorNetwork() {
    this.hideSemiconductorNetwork();

    const jasmCoords = AppData.jasmLocation || [32.874, 130.785];
    const jasmLngLat = this._toMapbox(jasmCoords);

    // Build connection line GeoJSON from each non-JASM company to JASM
    const features = AppData.companies
      .filter((c) => c.id !== "jasm")
      .map((company) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [this._toMapbox(company.coords), jasmLngLat],
        },
        properties: { companyId: company.id, name: company.name },
      }));

    const sourceId = "semiconductor-network";
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features },
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

    this._layerGroups.semiconductorNetwork.push(`${sourceId}-line`, sourceId);
  },

  hideSemiconductorNetwork() {
    this._removeLayerGroup("semiconductorNetwork");
  },

  showSingleInfrastructureRoad(road) {
    const sourceId = `single-road-${road.id}`;
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: road.coords.map((c) => this._toMapbox(c)),
        },
      },
    });

    this.map.addLayer({
      id: `${sourceId}-line`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": MAP_COLORS.infrastructure,
        "line-width": 7,
        "line-opacity": 1,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    this._layerGroups.infrastructureRoads.push(`${sourceId}-line`, sourceId);

    // Fit bounds
    const coords = road.coords.map((c) => this._toMapbox(c));
    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(coords[0], coords[0]),
    );
    this.map.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 13 });
  },

  showInfrastructureRoads(opts = {}) {
    this.hideInfrastructureRoads();

    // Build a FeatureCollection for all roads
    const features = AppData.infrastructureRoads.map((road, index) => ({
      type: "Feature",
      id: index,
      geometry: {
        type: "LineString",
        coordinates: road.coords.map((c) => this._toMapbox(c)),
      },
      properties: {
        id: road.id,
        name: road.name,
        index: index,
      },
    }));

    const sourceId = "infrastructure-roads";
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features },
    });

    // Glow layer — wide translucent halo behind selected road
    this.map.addLayer({
      id: "infrastructure-roads-glow",
      type: "line",
      source: sourceId,
      paint: {
        "line-color": MAP_COLORS.infrastructure,
        "line-width": 16,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          0.25,
          0,
        ],
        "line-blur": 6,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    // Main dashed line — all roads
    this.map.addLayer({
      id: "infrastructure-roads-line",
      type: "line",
      source: sourceId,
      paint: {
        "line-color": MAP_COLORS.infrastructure,
        "line-width": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          7,
          5,
        ],
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1.0,
          ["boolean", ["feature-state", "selected"], false],
          0,
          ["number", ["feature-state", "opacity"], 0],
        ],
        "line-dasharray": [10, 6],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    // Solid selected overlay — replaces dashed line for selected road
    this.map.addLayer({
      id: "infrastructure-roads-selected",
      type: "line",
      source: sourceId,
      paint: {
        "line-color": MAP_COLORS.infrastructure,
        "line-width": 7,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          1.0,
          0,
        ],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    // Label layer — road names along the lines so they look interactive
    this.map.addLayer({
      id: "infrastructure-roads-labels",
      type: "symbol",
      source: sourceId,
      layout: {
        "symbol-placement": "line-center",
        "text-field": ["get", "name"],
        "text-size": 12,
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-anchor": "center",
        "text-offset": [0, -1.2],
        "text-allow-overlap": false,
        "text-ignore-placement": false,
      },
      paint: {
        "text-color": "#1e1f20",
        "text-halo-color": "#ffffff",
        "text-halo-width": 2,
        "text-opacity": ["number", ["feature-state", "textOpacity"], 0],
      },
    });

    // Per-road stagger: reveal each road sequentially with TIMING.infraStagger delay
    features.forEach((feature, index) => {
      setTimeout(() => {
        if (!this.map || !this.map.getSource(sourceId)) return;
        this.map.setFeatureState(
          { source: sourceId, id: index },
          { opacity: 0.7, textOpacity: 0.9 },
        );
      }, index * TIMING.infraStagger);
    });

    this._layerGroups.infrastructureRoads.push(
      "infrastructure-roads-glow",
      "infrastructure-roads-line",
      "infrastructure-roads-selected",
      "infrastructure-roads-labels",
      sourceId,
    );

    // Announce roads added
    setTimeout(() => {
      UI.announceToScreenReader(
        AppData.infrastructureRoads.length +
          " infrastructure road overlays shown",
      );
    }, 400);

    // Store road index mapping for feature-state
    this._roadIndexMap = {};
    AppData.infrastructureRoads.forEach((road, index) => {
      this._roadIndexMap[road.id] = index;
    });

    // Hover interaction
    let hoveredRoadId = null;
    this.map.on("mouseenter", "infrastructure-roads-line", (e) => {
      this.map.getCanvas().style.cursor = "pointer";
      if (e.features.length > 0) {
        if (hoveredRoadId !== null) {
          this.map.setFeatureState(
            { source: sourceId, id: hoveredRoadId },
            { hover: false },
          );
        }
        hoveredRoadId = e.features[0].id;
        this.map.setFeatureState(
          { source: sourceId, id: hoveredRoadId },
          { hover: true },
        );
      }
    });

    this.map.on("mouseleave", "infrastructure-roads-line", () => {
      this.map.getCanvas().style.cursor = "";
      if (hoveredRoadId !== null) {
        this.map.setFeatureState(
          { source: sourceId, id: hoveredRoadId },
          { hover: false },
        );
        hoveredRoadId = null;
      }
    });

    // Click interaction
    this.map.on("click", "infrastructure-roads-line", (e) => {
      if (e.features.length > 0) {
        const roadId = e.features[0].properties.id;
        const road = AppData.infrastructureRoads.find((r) => r.id === roadId);
        if (road) {
          this.selectInfrastructureRoad(roadId);
          UI.showRoadDetailPanel(road);
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

      const { marker, element } = this._createMarker(
        station.coords,
        stationHtml,
        {
          className: "infrastructure-station-marker",
        },
      );
      element.addEventListener("click", () => {
        this.clearInfrastructureRoadSelection();
        UI.renderInspectorPanel(6, { title: station.name });
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

      const { marker, element } = this._createMarker(
        haramizu.coords,
        haramizuHtml,
        {
          className: "infrastructure-haramizu-marker",
        },
      );
      this._addTooltip(marker, element, haramizu.name);
      element.addEventListener("click", () => {
        this.clearInfrastructureRoadSelection();
        UI.showHaramizuPanel();
      });
      this.infrastructureMarkers.push(marker);
      this._layerGroups.infrastructureRoads.push(`station-${haramizu.id}`);
      this.markers[`station-${haramizu.id}`] = marker;
    }

    // Fly to show all roads
    if (!opts.skipFly) {
      this.flyToStep(CAMERA_STEPS.B7);
    }
  },

  hideInfrastructureRoads() {
    // Remove line, glow, selected, and label layers
    this._safeRemoveLayer("infrastructure-roads-labels");
    this._safeRemoveLayer("infrastructure-roads-selected");
    this._safeRemoveLayer("infrastructure-roads-line");
    this._safeRemoveLayer("infrastructure-roads-glow");
    this._safeRemoveSource("infrastructure-roads");

    // Remove station markers
    this.infrastructureMarkers.forEach((m) => {
      const element = m.getElement();
      m.remove();
      if (element && element.parentNode) {
        element.remove();
      }
    });
    this.infrastructureMarkers = [];

    // Clean up marker references
    this._layerGroups.infrastructureRoads.forEach((id) => {
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
    if (
      this.selectedInfrastructureRoad &&
      this.selectedInfrastructureRoad !== roadId
    ) {
      this.deselectInfrastructureRoad(this.selectedInfrastructureRoad);
    }

    const featureIndex = this._roadIndexMap?.[roadId];
    if (featureIndex !== undefined) {
      this.map.setFeatureState(
        { source: "infrastructure-roads", id: featureIndex },
        { selected: true },
      );
    }
    this.selectedInfrastructureRoad = roadId;
  },

  deselectInfrastructureRoad(roadId) {
    const featureIndex = this._roadIndexMap?.[roadId];
    if (featureIndex !== undefined) {
      this.map.setFeatureState(
        { source: "infrastructure-roads", id: featureIndex },
        { selected: false },
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

  showRailCommute() {
    this.hideRailCommute();
    const duration = 5000;
    // Offset each line sideways so they run parallel like a subway map
    const offsets = [-4, 0, 4];

    this._railCommuteData.routes.forEach((route, idx) => {
      const fullCoords = route.path.map((c) => this._toMapbox(c));
      const sourceId = `rail-commute-${route.id}`;
      const startCoord = fullCoords[0];

      this._safeAddSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [startCoord, startCoord],
          },
        },
      });

      // Colored line with lateral offset
      const lineLayer = `${sourceId}-line`;
      this.map.addLayer({
        id: lineLayer,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": route.color,
          "line-width": 4,
          "line-opacity": 0.9,
          "line-offset": offsets[idx] || 0,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      this._layerGroups.railCommute.push(lineLayer, sourceId);

      // All three grow simultaneously
      this._startLineGrow(sourceId, fullCoords, duration, 0);
    });
  },

  hideRailCommute() {
    this._layerGroups.railCommute.forEach((id) => {
      this._stopLineGrow(id);
      if (this.map && this.map.getLayer(id)) {
        this._safeRemoveLayer(id);
      } else if (this.map && this.map.getSource(id)) {
        this._safeRemoveSource(id);
      }
    });
    this._layerGroups.railCommute = [];
  },

  async _loadInfraPlanData() {
    if (this._infraPlanCache) return this._infraPlanCache;
    try {
      const resp = await fetch("assets/map-outlines/infra.json");
      const data = await resp.json();
      this._infraPlanCache = data.filter(
        (d) => d.id === "north-liaison-road" || d.id === "airport-liaison-road",
      );
      // Simplify: keep every Nth point to reduce coordinate density
      this._infraPlanCache.forEach((corridor) => {
        const path = corridor.resolvedPath;
        const step = Math.max(1, Math.floor(path.length / 80));
        const simplified = [];
        for (let i = 0; i < path.length; i += step) {
          simplified.push(path[i]);
        }
        if (simplified[simplified.length - 1] !== path[path.length - 1]) {
          simplified.push(path[path.length - 1]);
        }
        corridor.resolvedPath = simplified;
      });
      return this._infraPlanCache;
    } catch (e) {
      console.warn("Failed to load infra.json:", e);
      return [];
    }
  },

  async showInfraPlan() {
    this.hideInfraPlan();
    const corridors = await this._loadInfraPlanData();
    if (!corridors.length) return;
    const duration = 5000;

    corridors.forEach((corridor, idx) => {
      const meta = this._infraPlanMeta[corridor.id] || {
        name: corridor.name,
        color: "#FBB931",
      };
      const fullCoords = corridor.resolvedPath.map((p) => [p.lng, p.lat]);
      const sourceId = `infra-plan-${corridor.id}`;
      const startCoord = fullCoords[0];

      this._safeAddSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [startCoord, startCoord],
          },
        },
      });

      // Line that grows along the road corridor
      const lineLayer = `${sourceId}-line`;
      this.map.addLayer({
        id: lineLayer,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": meta.color,
          "line-width": 5,
          "line-opacity": 0.9,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      this._layerGroups.infraPlan.push(lineLayer, sourceId);

      // Grow the line by updating source data each frame
      this._startLineGrow(sourceId, fullCoords, duration, idx * 1000);
    });
  },

  hideInfraPlan() {
    this._layerGroups.infraPlan.forEach((id) => {
      this._stopLineGrow(id);
      if (this.map && this.map.getLayer(id)) {
        this._safeRemoveLayer(id);
      } else if (this.map && this.map.getSource(id)) {
        this._safeRemoveSource(id);
      }
    });
    this._layerGroups.infraPlan = [];
  },

  highlightRoadExtensions() {
    if (!this.map) return;
    try {
      if (this.map.getLayer("infrastructure-roads-line")) {
        this.map.setPaintProperty("infrastructure-roads-line", "line-width", 6);
        // Update each feature's opacity state for emphasis
        const roads = AppData.infrastructureRoads || [];
        roads.forEach((road, index) => {
          this.map.setFeatureState(
            { source: "infrastructure-roads", id: index },
            { opacity: 0.9, textOpacity: 1.0 },
          );
        });
      }
    } catch (e) {
      /* layer may not exist yet */
    }
  },

  resetRoadHighlight() {
    if (!this.map) return;
    try {
      if (this.map.getLayer("infrastructure-roads-line")) {
        this.map.setPaintProperty("infrastructure-roads-line", "line-width", [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          7,
          ["boolean", ["feature-state", "selected"], false],
          7,
          5,
        ]);
        const roads = AppData.infrastructureRoads || [];
        roads.forEach((road, index) => {
          this.map.setFeatureState(
            { source: "infrastructure-roads", id: index },
            { opacity: 0.7, textOpacity: 0.9 },
          );
        });
      }
    } catch (e) {
      /* layer may not exist */
    }
  },

  showAirportAccessRoutes() {
    const data = AppData.grandAirportData?.airportAccessRoutes;
    if (!data || !this.map) return;

    // Clean up previous if any
    this.hideAirportAccessRoutes();

    // 1. "Previously announced" route - dashed blue line (animated draw)
    const prevCoords = data.previousRoute.map((c) => this._toMapbox(c));
    const prevSourceId = "ga-prev-route";
    this._safeAddSource(prevSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: [prevCoords[0], prevCoords[0]] },
      },
    });
    // Glow
    this.map.addLayer({
      id: `${prevSourceId}-glow`,
      type: "line",
      source: prevSourceId,
      paint: {
        "line-color": "#007aff",
        "line-width": 6,
        "line-opacity": 0.12,
        "line-blur": 3,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    // Main line
    this.map.addLayer({
      id: `${prevSourceId}-line`,
      type: "line",
      source: prevSourceId,
      paint: {
        "line-color": "#007aff",
        "line-width": 2.5,
        "line-opacity": 0.5,
        "line-dasharray": [4, 3],
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    this._layerGroups.grandAirportAccess.push(
      `${prevSourceId}-glow`,
      `${prevSourceId}-line`,
      prevSourceId,
    );
    // Animate draw
    this._animateRoadDraw(prevSourceId, prevCoords, 1200);

    // 2. "Newly announced" route - airport-monorail polygon (filled corridor)
    const govZone = (AppData.scienceParkZonePlans || []).find(
      (z) => z.id === "sp-gov-zone",
    );
    const monorail = govZone?.infrastructureLines?.find(
      (l) => l.id === "airport-monorail",
    );
    const newSourceId = "ga-new-route";
    const polyCoords = monorail?.polygon || [];
    this._safeAddSource(newSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [polyCoords] },
      },
    });
    // Fill
    this.map.addLayer({
      id: `${newSourceId}-fill`,
      type: "fill",
      source: newSourceId,
      paint: {
        "fill-color": "#007aff",
        "fill-opacity": 0.2,
      },
    });
    // Stroke
    this.map.addLayer({
      id: `${newSourceId}-stroke`,
      type: "line",
      source: newSourceId,
      paint: {
        "line-color": "#007aff",
        "line-width": 2,
        "line-opacity": 0.8,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    this._layerGroups.grandAirportAccess.push(
      `${newSourceId}-fill`,
      `${newSourceId}-stroke`,
      newSourceId,
    );

    // 3. Landmark markers (elevated 36px, hover tooltip, click for detail)
    const landmarkIcons = {
      plane: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
      "train-front": `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M4 11V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M2 16h20M4 16l-2 6h20l-2-6"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>`,
      cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/></svg>`,
      factory: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>`,
      microscope: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>`,
    };

    data.landmarks.forEach((lm) => {
      const id = `ga-landmark-${lm.id}`;

      // Use branded JASM logo instead of generic icon
      let html;
      if (lm.id === "jasm-landmark") {
        html = this._brandedMarkerHtml("jasm");
      } else {
        const iconSvg = landmarkIcons[lm.icon] || landmarkIcons.plane;
        html = this._elevatedMarkerHtml(iconSvg, lm.color, 36);
      }

      const { marker, element } = this._createMarker(lm.coords, html, {
        className: "ga-landmark-marker",
        entrance: "anchor",
        ariaLabel: lm.name,
      });

      // Hover tooltip (text on hover only)
      this._addTooltip(marker, element, lm.name);

      // Click to show detail in dashboard
      element.addEventListener("click", () => {
        App.showAirportLandmarkDetail(lm.id);
      });

      this.markers[id] = marker;
      this._layerGroups.grandAirportAccess.push(id);
    });

    // 4. JR Hohi Line - east-west railway context (animated draw)
    const railwayData = AppData.grandAirportData?.railway;
    if (railwayData?.jrHohiLine) {
      const hohiCoords = railwayData.jrHohiLine.map((c) => this._toMapbox(c));
      const hohiSourceId = "ga-access-hohi-line";
      this._safeAddSource(hohiSourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: [hohiCoords[0], hohiCoords[0]] },
        },
      });
      // Subtle glow
      this.map.addLayer({
        id: `${hohiSourceId}-glow`,
        type: "line",
        source: hohiSourceId,
        paint: {
          "line-color": "#6e7073",
          "line-width": 6,
          "line-opacity": 0.08,
          "line-blur": 3,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      // Main line - solid gray railway
      this.map.addLayer({
        id: `${hohiSourceId}-line`,
        type: "line",
        source: hohiSourceId,
        paint: {
          "line-color": "#6e7073",
          "line-width": 2.5,
          "line-opacity": 0.6,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });
      this._layerGroups.grandAirportAccess.push(
        `${hohiSourceId}-glow`,
        `${hohiSourceId}-line`,
        hohiSourceId,
      );
      // Animate draw (staggered after prev route)
      setTimeout(() => {
        this._animateRoadDraw(hohiSourceId, hohiCoords, 1200);
      }, 500);
    }

    // 5. Line interactions: pulse animation, hover tooltips, click handlers
    const routesMeta = data.routes || [];
    const lineConfigs = [
      {
        lineId: `${prevSourceId}-line`,
        glowId: `${prevSourceId}-glow`,
        baseWidth: 2.5,
        routeId: "prev-route",
      },
      {
        lineId: `${newSourceId}-fill`,
        glowId: `${newSourceId}-stroke`,
        baseWidth: 2,
        routeId: "new-route",
        isPolygon: true,
      },
      {
        lineId: "ga-access-hohi-line-line",
        glowId: "ga-access-hohi-line-glow",
        baseWidth: 2.5,
        routeId: "hohi-line",
      },
    ];

    // Shared popup for hover tooltips
    const linePopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "mapbox-tooltip",
      offset: [0, -10],
    });
    this._airportRoutePopup = linePopup;

    // Event handlers stored for cleanup
    this._airportRouteHandlers = [];

    lineConfigs.forEach(({ lineId, baseWidth, routeId, isPolygon }) => {
      if (!this.map.getLayer(lineId)) return;
      const meta = routesMeta.find((r) => r.id === routeId);
      const name = meta?.name || routeId;

      const enterHandler = (e) => {
        this.map.getCanvas().style.cursor = "pointer";
        if (isPolygon) {
          if (this.map.getLayer(lineId)) {
            this.map.setPaintProperty(lineId, "fill-opacity", 0.35);
          }
        } else {
          if (this.map.getLayer(lineId)) {
            this.map.setPaintProperty(lineId, "line-width", baseWidth + 2);
          }
        }
        linePopup.setLngLat(e.lngLat).setText(name).addTo(this.map);
      };
      const moveHandler = (e) => {
        linePopup.setLngLat(e.lngLat);
      };
      const leaveHandler = () => {
        this.map.getCanvas().style.cursor = "";
        if (isPolygon) {
          if (this.map.getLayer(lineId)) {
            this.map.setPaintProperty(lineId, "fill-opacity", 0.2);
          }
        } else {
          if (this.map.getLayer(lineId)) {
            this.map.setPaintProperty(lineId, "line-width", baseWidth);
          }
        }
        linePopup.remove();
      };
      const clickHandler = () => {
        App.showAirportLineDetail(routeId);
      };

      this.map.on("mouseenter", lineId, enterHandler);
      this.map.on("mousemove", lineId, moveHandler);
      this.map.on("mouseleave", lineId, leaveHandler);
      this.map.on("click", lineId, clickHandler);

      this._airportRouteHandlers.push(
        { event: "mouseenter", layer: lineId, fn: enterHandler },
        { event: "mousemove", layer: lineId, fn: moveHandler },
        { event: "mouseleave", layer: lineId, fn: leaveHandler },
        { event: "click", layer: lineId, fn: clickHandler },
      );
    });

    // Pulse animation on glow and main line layers
    let phase = 0;
    const pulseConfigs = [
      // Glow layers
      { id: `${prevSourceId}-glow`, base: 0.12, amp: 0.1 },
      { id: "ga-access-hohi-line-glow", base: 0.08, amp: 0.08 },
      // Main line layers
      { id: `${prevSourceId}-line`, base: 0.5, amp: 0.25 },
      { id: "ga-access-hohi-line-line", base: 0.6, amp: 0.2 },
      // Polygon layers (fill + stroke)
      { id: `${newSourceId}-fill`, base: 0.2, amp: 0.08, prop: "fill-opacity" },
      { id: `${newSourceId}-stroke`, base: 0.8, amp: 0.15 },
    ];
    this._airportRoutePulseTimer = setInterval(() => {
      phase += 0.04;
      pulseConfigs.forEach(({ id, base, amp, prop }) => {
        if (this.map.getLayer(id)) {
          const opacity = base + amp * Math.sin(phase);
          this.map.setPaintProperty(id, prop || "line-opacity", opacity);
        }
      });
    }, 50);
  },

  hideAirportAccessRoutes() {
    // Clean up pulse animation
    if (this._airportRoutePulseTimer) {
      clearInterval(this._airportRoutePulseTimer);
      this._airportRoutePulseTimer = null;
    }

    // Clean up event handlers
    if (this._airportRouteHandlers?.length) {
      this._airportRouteHandlers.forEach(({ event, layer, fn }) => {
        this.map.off(event, layer, fn);
      });
      this._airportRouteHandlers = [];
    }

    // Clean up popup
    if (this._airportRoutePopup) {
      this._airportRoutePopup.remove();
      this._airportRoutePopup = null;
    }

    const group = this._layerGroups.grandAirportAccess;
    group.forEach((id) => {
      // Remove map layers/sources
      this._safeRemoveLayer(id);
      this._safeRemoveSource(id);
      // Remove HTML markers
      if (this.markers[id]) {
        const el = this.markers[id].getElement();
        if (el) el.classList.add("marker-fade-out");
        this.markers[id].remove();
        delete this.markers[id];
      }
    });
    this._layerGroups.grandAirportAccess = [];
  },

  showRailwayStations() {
    const data = AppData.grandAirportData?.railway;
    if (!data || !this.map) return;

    // Clean up previous if any
    this.hideRailwayStations();

    // 1. Prepare line coordinates and station positions along the line
    const lineCoords = data.jrHohiLine.map((c) => this._toMapbox(c));
    const lineSourceId = "ga-jr-hohi-line";

    // Build a lookup: for each station, find which segment index it sits at
    // by matching its coords to the nearest point in jrHohiLine
    const stationLinePositions = data.stations.map((station) => {
      const sCoord = this._toMapbox(station.coords);
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < lineCoords.length; i++) {
        const dx = lineCoords[i][0] - sCoord[0];
        const dy = lineCoords[i][1] - sCoord[1];
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      return { station, segmentIndex: bestIdx };
    });

    // Start with a zero-length line at the first point
    this._safeAddSource(lineSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [lineCoords[0], lineCoords[0]],
        },
      },
    });

    // Glow layer
    this.map.addLayer({
      id: `${lineSourceId}-glow`,
      type: "line",
      source: lineSourceId,
      paint: {
        "line-color": "#ff9500",
        "line-width": 8,
        "line-opacity": 0.12,
        "line-blur": 4,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    // Main line
    this.map.addLayer({
      id: `${lineSourceId}-line`,
      type: "line",
      source: lineSourceId,
      paint: {
        "line-color": "#ff9500",
        "line-width": 3,
        "line-opacity": 0.8,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    this._layerGroups.grandAirportRailway.push(
      `${lineSourceId}-glow`,
      `${lineSourceId}-line`,
      lineSourceId,
    );

    // 2. Station marker helpers
    const stationIcons = {
      "train-front": `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M4 11V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M2 16h20M4 16l-2 6h20l-2-6"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>`,
      station: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>`,
    };

    // Track which stations have been revealed
    const revealedStations = new Set();

    // Function to create and show a station marker
    const revealStation = (station) => {
      if (revealedStations.has(station.id)) return;
      revealedStations.add(station.id);

      const color = station.color;
      const iconSvg =
        stationIcons[station.icon] || stationIcons["train-front"];
      const id = `ga-station-${station.id}`;

      // Proposed station gets a dashed-circle style to indicate planning stage
      let html;
      if (station.type === "proposed") {
        html = `<div class="elevated-marker" style="height: 36px; display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: 28px; height: 28px;
            background: transparent;
            border: 2.5px dashed ${color};
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          "><svg viewBox="0 0 24 24" fill="${color}" width="14" height="14"><path d="M4 11V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M2 16h20M4 16l-2 6h20l-2-6"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg></div>
          <div style="width: 2px; flex: 1; background: ${color}; opacity: 0.4;"></div>
        </div>`;
      } else {
        html = this._elevatedMarkerHtml(iconSvg, color, 36);
      }

      const { marker, element } = this._createMarker(station.coords, html, {
        className: "ga-station-marker",
        entrance: "anchor",
        ariaLabel: station.name,
      });

      this._addTooltip(marker, element, station.name);

      element.addEventListener("click", () => {
        App.showRailwayStationDetail(station.id);
      });

      this.markers[id] = marker;
      this._layerGroups.grandAirportRailway.push(id);
    };

    // 3. Animate the line drawing progressively from Kumamoto to Higo-Ozu
    const drawDuration = 2500;
    const totalSegments = lineCoords.length - 1;
    const startTime = performance.now();

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / drawDuration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - t, 3);

      const currentLength = eased * totalSegments;
      const full = Math.floor(currentLength);
      const frac = currentLength - full;

      // Build coordinates up to the current progress point
      const drawn = lineCoords.slice(0, full + 1);
      if (full < totalSegments) {
        const from = lineCoords[full];
        const to = lineCoords[full + 1];
        drawn.push([
          from[0] + (to[0] - from[0]) * frac,
          from[1] + (to[1] - from[1]) * frac,
        ]);
      }

      const source = this.map.getSource(lineSourceId);
      if (source) {
        source.setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates:
              drawn.length >= 2 ? drawn : [lineCoords[0], lineCoords[0]],
          },
        });
      }

      // Reveal station markers as the line reaches them
      stationLinePositions.forEach(({ station, segmentIndex }) => {
        if (full >= segmentIndex) {
          revealStation(station);
        }
      });

      if (t < 1) {
        const rafId = requestAnimationFrame(animateStep);
        this._railwayDrawRafs.push(rafId);
      } else {
        // Animation complete - start pulse
        this._startRailwayPulse(lineSourceId);
      }
    };

    const rafId = requestAnimationFrame(animateStep);
    this._railwayDrawRafs.push(rafId);
  },

  _startRailwayPulse(lineSourceId) {
    let railPhase = 0;
    this._railwayPulseTimer = setInterval(() => {
      railPhase += 0.05;
      const sin = Math.sin(railPhase);
      if (this.map.getLayer(`${lineSourceId}-glow`)) {
        this.map.setPaintProperty(
          `${lineSourceId}-glow`,
          "line-opacity",
          0.15 + 0.15 * sin,
        );
        this.map.setPaintProperty(
          `${lineSourceId}-glow`,
          "line-width",
          8 + 4 * sin,
        );
      }
      if (this.map.getLayer(`${lineSourceId}-line`)) {
        this.map.setPaintProperty(
          `${lineSourceId}-line`,
          "line-opacity",
          0.6 + 0.4 * sin,
        );
      }
    }, 50);
  },

  hideRailwayStations() {
    // Cancel any pending draw animations
    if (this._railwayDrawRafs) {
      this._railwayDrawRafs.forEach((id) => cancelAnimationFrame(id));
    }
    this._railwayDrawRafs = [];

    // Clean up pulse animation
    if (this._railwayPulseTimer) {
      clearInterval(this._railwayPulseTimer);
      this._railwayPulseTimer = null;
    }

    const group = this._layerGroups.grandAirportRailway;
    group.forEach((id) => {
      this._safeRemoveLayer(id);
      this._safeRemoveSource(id);
      if (this.markers[id]) {
        const el = this.markers[id].getElement();
        if (el) el.classList.add("marker-fade-out");
        this.markers[id].remove();
        delete this.markers[id];
      }
    });
    this._layerGroups.grandAirportRailway = [];
  },

  showRoadExtensions() {
    const roads = AppData.grandAirportData?.roadExtensions;
    if (!roads || !this.map) return;

    this.hideRoadExtensions();

    const drawDuration = 1200;
    const stagger = 500;

    // Shared popup for hover tooltips
    this._roadExtPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: "mapbox-tooltip",
      offset: [0, -10],
    });
    this._roadExtHandlers = [];

    roads.forEach((road, index) => {
      const allCoords = road.coords.map((c) => this._toMapbox(c));
      const sourceId = `ga-road-ext-${road.id}`;
      const color = road.color || "#e63f5a";

      // Start with a zero-length line at the first point
      this._safeAddSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [allCoords[0], allCoords[0]],
          },
        },
      });

      // Glow layer
      this.map.addLayer({
        id: `${sourceId}-glow`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 10,
          "line-opacity": 0.2,
          "line-blur": 6,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      // Main line
      this.map.addLayer({
        id: `${sourceId}-line`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 4,
          "line-opacity": 0.9,
        },
        layout: { "line-cap": "round", "line-join": "round" },
      });

      this._layerGroups.grandAirportRoads.push(
        `${sourceId}-glow`,
        `${sourceId}-line`,
        sourceId,
      );

      // Hover + click handlers on the main line layer
      const lineLayerId = `${sourceId}-line`;
      const glowLayerId = `${sourceId}-glow`;
      const baseLineWidth = 4;
      const roadId = road.id;

      const enterHandler = () => {
        this.map.getCanvas().style.cursor = "pointer";
        if (this.map.getLayer(lineLayerId)) {
          this.map.setPaintProperty(
            lineLayerId,
            "line-width",
            baseLineWidth + 2,
          );
        }
        if (this.map.getLayer(glowLayerId)) {
          this.map.setPaintProperty(glowLayerId, "line-opacity", 0.4);
        }
      };

      const moveHandler = (e) => {
        if (this._roadExtPopup) {
          this._roadExtPopup
            .setLngLat(e.lngLat)
            .setText(road.name)
            .addTo(this.map);
        }
      };

      const leaveHandler = () => {
        this.map.getCanvas().style.cursor = "";
        if (this.map.getLayer(lineLayerId)) {
          this.map.setPaintProperty(lineLayerId, "line-width", baseLineWidth);
        }
        if (this.map.getLayer(glowLayerId)) {
          this.map.setPaintProperty(glowLayerId, "line-opacity", 0.2);
        }
        if (this._roadExtPopup) this._roadExtPopup.remove();
      };

      const clickHandler = () => {
        App.showRoadExtensionDetail(roadId);
      };

      this.map.on("mouseenter", lineLayerId, enterHandler);
      this.map.on("mousemove", lineLayerId, moveHandler);
      this.map.on("mouseleave", lineLayerId, leaveHandler);
      this.map.on("click", lineLayerId, clickHandler);

      this._roadExtHandlers.push(
        { event: "mouseenter", layer: lineLayerId, fn: enterHandler },
        { event: "mousemove", layer: lineLayerId, fn: moveHandler },
        { event: "mouseleave", layer: lineLayerId, fn: leaveHandler },
        { event: "click", layer: lineLayerId, fn: clickHandler },
      );

      // Stagger the draw animation for each road
      const delay = index * stagger;
      setTimeout(() => {
        this._animateRoadDraw(sourceId, allCoords, drawDuration);
      }, delay);
    });

  },

  _animateRoadDraw(sourceId, allCoords, duration) {
    const startTime = performance.now();
    const totalSegments = allCoords.length - 1;

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);

      const currentLength = eased * totalSegments;
      const full = Math.floor(currentLength);
      const frac = currentLength - full;

      // Build coordinates up to the current progress point
      const drawn = allCoords.slice(0, full + 1);

      // Interpolate a partial point between the current segment endpoints
      if (full < totalSegments) {
        const from = allCoords[full];
        const to = allCoords[full + 1];
        drawn.push([
          from[0] + (to[0] - from[0]) * frac,
          from[1] + (to[1] - from[1]) * frac,
        ]);
      }

      const source = this.map.getSource(sourceId);
      if (source) {
        source.setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates:
              drawn.length >= 2 ? drawn : [allCoords[0], allCoords[0]],
          },
        });
      }

      if (t < 1) {
        const rafId = requestAnimationFrame(step);
        this._roadDrawRafs.push(rafId);
      }
    };

    const rafId = requestAnimationFrame(step);
    this._roadDrawRafs.push(rafId);
  },

  _startRoadPulse(roads) {
    let phase = 0;
    const glowIds = roads.map((r) => `ga-road-ext-${r.id}-glow`);
    const lineIds = roads.map((r) => `ga-road-ext-${r.id}-line`);

    this._roadExtPulseTimer = setInterval(() => {
      phase += 0.05;
      const sin = Math.sin(phase);
      glowIds.forEach((id) => {
        if (this.map.getLayer(id)) {
          this.map.setPaintProperty(id, "line-opacity", 0.15 + 0.15 * sin);
          this.map.setPaintProperty(id, "line-width", 10 + 4 * sin);
        }
      });
      lineIds.forEach((id) => {
        if (this.map.getLayer(id)) {
          this.map.setPaintProperty(id, "line-opacity", 0.6 + 0.4 * sin);
        }
      });
    }, 50);
  },

  hideRoadExtensions() {
    // Cancel any pending draw animations
    if (this._roadDrawRafs) {
      this._roadDrawRafs.forEach((id) => cancelAnimationFrame(id));
    }
    this._roadDrawRafs = [];

    // Cancel pulse start timeout
    if (this._roadPulseTimeout) {
      clearTimeout(this._roadPulseTimeout);
      this._roadPulseTimeout = null;
    }

    // Cancel pulse interval
    if (this._roadExtPulseTimer) {
      clearInterval(this._roadExtPulseTimer);
      this._roadExtPulseTimer = null;
    }

    // Clean up hover/click event handlers
    if (this._roadExtHandlers?.length) {
      this._roadExtHandlers.forEach(({ event, layer, fn }) => {
        this.map.off(event, layer, fn);
      });
      this._roadExtHandlers = [];
    }

    // Clean up popup
    if (this._roadExtPopup) {
      this._roadExtPopup.remove();
      this._roadExtPopup = null;
    }

    const group = this._layerGroups.grandAirportRoads;
    group.forEach((id) => {
      this._safeRemoveLayer(id);
      this._safeRemoveSource(id);
    });
    this._layerGroups.grandAirportRoads = [];
  },
};
