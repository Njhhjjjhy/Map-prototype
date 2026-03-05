import { AppData } from "../data/index.js";
import { CAMERA_STEPS } from "./constants.js";

export const methods = {
  showWaterResourceLayer() {
    const waterData = AppData.resources.water;
    if (!waterData) return;

    // Add water area highlight polygon on map
    this._showWaterAreaOverlay();

    // Add Coca-Cola and Suntory logo markers
    this._showBrandLogoMarkers();
  },

  hideWaterResourceLayer() {
    // Remove water area overlay
    this._safeRemoveLayer("water-area-fill");
    this._safeRemoveLayer("water-area-outline");
    this._safeRemoveSource("water-area");

    // Remove brand logo markers
    ["brand-coca-cola", "brand-suntory"].forEach((id) => {
      if (this.markers[id]) {
        const el = this.markers[id].getElement();
        this.markers[id].remove();
        if (el && el.parentNode) el.remove();
        delete this.markers[id];
      }
    });
  },

  _showWaterAreaOverlay() {
    if (!this.initialized) return;

    // Remove existing if present
    this._safeRemoveLayer("water-area-fill");
    this._safeRemoveLayer("water-area-outline");
    this._safeRemoveSource("water-area");

    // Approximate Aso groundwater basin extent
    const waterArea = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [130.7, 32.75],
            [130.95, 32.75],
            [131.0, 32.85],
            [130.95, 32.95],
            [130.75, 32.95],
            [130.65, 32.88],
            [130.7, 32.75],
          ],
        ],
      },
    };

    this._safeAddSource("water-area", {
      type: "geojson",
      data: waterArea,
    });

    this.map.addLayer({
      id: "water-area-fill",
      type: "fill",
      source: "water-area",
      paint: {
        "fill-color": "#007aff",
        "fill-opacity": 0.08,
      },
    });

    this.map.addLayer({
      id: "water-area-outline",
      type: "line",
      source: "water-area",
      paint: {
        "line-color": "#007aff",
        "line-width": 2,
        "line-opacity": 0.4,
        "line-dasharray": [4, 3],
      },
    });
  },

  _showBrandLogoMarkers() {
    const waterData = AppData.resources.water;
    if (!waterData || !waterData.evidenceMarkers) return;

    const brands = {
      "coca-cola": {
        text: "Coca-Cola",
        bg: "#ffffff",
        logo: "assets/Coca-Cola-logo.svg",
      },
      suntory: {
        text: "Suntory",
        bg: "#ffffff",
        logo: "assets/SUNTORY-logo.svg",
      },
    };

    waterData.evidenceMarkers.forEach((evidence) => {
      const markerId = `brand-${evidence.id}`;
      const brand = brands[evidence.id];
      if (!brand) return;

      // Remove existing marker if present
      if (this.markers[markerId]) {
        const oldEl = this.markers[markerId].getElement();
        this.markers[markerId].remove();
        if (oldEl && oldEl.parentNode) oldEl.remove();
        delete this.markers[markerId];
      }

      const innerHtml = `<img src="${brand.logo}" alt="${brand.text}" style="
              width: 42px;
              height: 42px;
              object-fit: contain;
          ">`;

      const iconHtml = this._elevatedMarkerHtml(
        innerHtml,
        brand.bg,
        52,
        {},
        "square",
      );

      const markerHtml = `<div style="display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;">
              ${iconHtml}<span style="
              font-family: var(--font-display);
              font-size: 12px;
              font-weight: 600;
              color: var(--color-text-primary);
              text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;
          ">${brand.text}</span></div>`;

      const { marker, element } = this._createMarker(
        evidence.coords,
        markerHtml,
        {
          className: "water-brand-marker",
          entrance: "ripple",
        },
      );

      if (!marker || !element) return;

      element.addEventListener("click", () =>
        UI.showWaterEvidencePanel(evidence),
      );
      this.markers[markerId] = marker;
    });
  },

  showResourceMarker(resourceId, opts = {}) {
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

    const html = this._markerIconHtml("resource", resourceId);
    const { marker, element } = this._createMarker(resource.coords, html, {
      entrance: "anchor",
      ariaLabel: resource.name + " resource",
    });

    // Guard against null marker (map not initialized)
    if (!marker || !element) return;

    this._addTooltip(marker, element, resource.name);
    element.addEventListener("click", () => UI.showResourcePanel(resource));

    this.markers[resourceId] = marker;
    if (!this._layerGroups.resources.includes(resourceId)) {
      this._layerGroups.resources.push(resourceId);
    }

    // Fly to location (skip if caller handled camera separately)
    if (!opts.skipFly) {
      this.flyToStep({
        center: this._toMapbox(resource.coords),
        zoom: AppData.mapConfig.resourceZoom || 13,
        pitch: 50,
        bearing: resourceId === "water" ? 25 : -15,
        duration: 2000,
      });
    }

    // Show evidence markers for water
    if (resourceId === "water") {
      this._showWaterEvidenceMarkers();
    }
  },

  _showWaterEvidenceMarkers() {
    const waterData = AppData.resources.water;
    if (!waterData.evidenceMarkers) return;

    // Remove existing evidence markers before creating new ones (prevent accumulation)
    waterData.evidenceMarkers.forEach((evidence) => {
      const markerId = `water-evidence-${evidence.id}`;
      if (this.markers[markerId]) {
        const oldEl = this.markers[markerId].getElement();
        this.markers[markerId].remove();
        if (oldEl && oldEl.parentNode) oldEl.remove();
        delete this.markers[markerId];
      }
    });
    // Remove stale entries from layer group
    this._layerGroups.resources = this._layerGroups.resources.filter(
      (id) => !id.startsWith("water-evidence-"),
    );

    const brands = {
      suntory: {
        text: "Suntory",
        bg: "#ffffff",
        logo: "assets/SUNTORY-logo.svg",
      },
      "coca-cola": {
        text: "Coca-Cola",
        bg: "#ffffff",
        logo: "assets/Coca-Cola-logo.svg",
      },
    };

    waterData.evidenceMarkers.forEach((evidence) => {
      const brand = brands[evidence.id];
      const shortName = evidence.id === "coca-cola" ? "Coca-Cola" : "Suntory";
      let markerHtml;

      if (brand) {
        const innerHtml = `<img src="${brand.logo}" alt="${brand.text}" style="
                  width: 42px;
                  height: 42px;
                  object-fit: contain;
              ">`;
        const iconHtml = this._elevatedMarkerHtml(
          innerHtml,
          brand.bg,
          52,
          {},
          "square",
        );
        markerHtml = `<div style="display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;">
                  ${iconHtml}<span style="
                  font-family: var(--font-display);
                  font-size: 12px;
                  font-weight: 600;
                  color: var(--color-text-primary);
                  text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;
              ">${shortName}</span></div>`;
      } else {
        markerHtml = `<div style="
                  display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;
              "><div style="
                  width: 12px; height: 12px;
                  background: #007aff;
                  border-radius: 50%;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                  flex-shrink: 0;
              "></div><span style="
                  font-family: var(--font-display);
                  font-size: 12px;
                  font-weight: 600;
                  color: var(--color-text-primary);
                  text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;
              ">${shortName}</span></div>`;
      }

      const { marker, element } = this._createMarker(
        evidence.coords,
        markerHtml,
        {
          className: "water-evidence-marker",
        },
      );

      element.addEventListener("click", () =>
        UI.showWaterEvidencePanel(evidence),
      );
      this.markers[`water-evidence-${evidence.id}`] = marker;
      this._layerGroups.resources.push(`water-evidence-${evidence.id}`);
    });
  },

  async showResourceArcs(resourceId) {
    this.hideResourceArcs();

    const jasm = AppData.jasmLocation; // [lat, lng]
    const sources = [];

    if (resourceId === "water") {
      const water = AppData.resources.water;
      if (water.coords) {
        sources.push({ coords: water.coords, color: "#007aff", weight: 2 });
      }
      if (water.evidenceMarkers) {
        water.evidenceMarkers.forEach((ev) => {
          sources.push({ coords: ev.coords, color: "#007aff", weight: 1.5 });
        });
      }
    } else {
      // Power sub-types: power-solar, power-wind, power-nuclear
      const typeKey = resourceId.replace("power-", "");
      const colorMap = {
        solar: "#ff9500",
        wind: "#5ac8fa",
        nuclear: "#ff3b30",
      };
      const stations = AppData.kyushuEnergy[typeKey] || [];
      stations.forEach((station) => {
        sources.push({
          coords: station.coords,
          color: colorMap[typeKey] || "#007aff",
          weight: 1.5,
        });
      });
    }

    // Draw arcs with stagger
    for (let i = 0; i < sources.length; i++) {
      await this._delay(120);
      this._addResourceArcLine(
        sources[i].coords,
        jasm,
        sources[i].color,
        sources[i].weight,
        i,
      );
    }
  },

  _addResourceArcLine(origin, destination, color, weight, index) {
    const midLat = (origin[0] + destination[0]) / 2;
    const midLng = (origin[1] + destination[1]) / 2;

    const dLat = destination[0] - origin[0];
    const dLng = destination[1] - origin[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    const arcHeight = Math.max(0.08, Math.min(0.6, distance * 0.2));

    const arcMid = [midLat + arcHeight, midLng];
    const points = this.generateBezierPoints(origin, arcMid, destination, 50);

    const sourceId = `resource-arc-${index}`;
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: points },
      },
    });

    this.map.addLayer({
      id: `${sourceId}-line`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": color,
        "line-width": weight,
        "line-opacity": 0.7,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    this._layerGroups.resourceArcs.push(`${sourceId}-line`, sourceId);
  },

  hideResourceArcs() {
    this._layerGroups.resourceArcs.forEach((id) => {
      this._safeRemoveLayer(id);
      this._safeRemoveSource(id);
    });
    this._layerGroups.resourceArcs = [];
  },

  async showAllResourceArcs() {
    this.hideResourceArcs();

    const jasm = AppData.jasmLocation;
    const sources = [];

    // Water arcs
    const water = AppData.resources.water;
    if (water && water.coords) {
      sources.push({ coords: water.coords, color: "#007aff", weight: 2 });
    }
    if (water && water.evidenceMarkers) {
      water.evidenceMarkers.forEach((ev) => {
        sources.push({ coords: ev.coords, color: "#007aff", weight: 1.5 });
      });
    }

    // Energy arcs (solar, wind, nuclear)
    const colorMap = { solar: "#ff9500", wind: "#5ac8fa", nuclear: "#ff3b30" };
    ["solar", "wind", "nuclear"].forEach((type) => {
      const stations =
        (AppData.kyushuEnergy && AppData.kyushuEnergy[type]) || [];
      stations.forEach((station) => {
        sources.push({
          coords: station.coords,
          color: colorMap[type],
          weight: 1.5,
        });
      });
    });

    for (let i = 0; i < sources.length; i++) {
      await this._delay(120);
      this._addResourceArcLine(
        sources[i].coords,
        jasm,
        sources[i].color,
        sources[i].weight,
        i,
      );
    }
  },

  showKyushuEnergy() {
    this.hideKyushuEnergy();

    const energyData = AppData.kyushuEnergy;
    const colorMap = { solar: "#ff9500", wind: "#5ac8fa", nuclear: "#ff3b30" };
    const iconMap = { solar: "☀", wind: "💨", nuclear: "⚛" };

    let staggerIndex = 0;
    ["solar", "wind", "nuclear"].forEach((type) => {
      energyData[type].forEach((station) => {
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
          className: "energy-marker-wrapper",
          entrance: "ripple",
        });

        // Guard against null marker (map not initialized)
        if (!marker || !element) return;

        if (delay > 0) {
          element.style.animationDelay = `${delay}ms`;
        }

        this._addTooltip(
          marker,
          element,
          `${station.name} — ${station.capacity}`,
        );
        element.addEventListener("click", () =>
          UI.showEnergyStationPanel(station, type),
        );

        const id = `energy-${station.id}`;
        this.markers[id] = marker;
        this._layerGroups.kyushuEnergy.push(id);
      });
    });

    // Draw airline-style connection lines from each energy source to JASM
    const jasmCoords = AppData.jasmLocation || [32.874, 130.785];
    const jasmLngLat = this._toMapbox(jasmCoords);

    const lineFeatures = [];
    ["solar", "wind", "nuclear"].forEach((type) => {
      energyData[type].forEach((station) => {
        lineFeatures.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [this._toMapbox(station.coords), jasmLngLat],
          },
          properties: { type, name: station.name },
        });
      });
    });

    const lineSourceId = "energy-lines";
    this._safeAddSource(lineSourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: lineFeatures },
    });

    this.map.addLayer({
      id: `${lineSourceId}-line`,
      type: "line",
      source: lineSourceId,
      paint: {
        "line-color": [
          "match",
          ["get", "type"],
          "solar",
          "rgba(255, 149, 0, 0.65)",
          "wind",
          "rgba(90, 200, 250, 0.65)",
          "nuclear",
          "rgba(255, 59, 48, 0.65)",
          "rgba(0, 122, 255, 0.65)",
        ],
        "line-width": 3,
        "line-dasharray": [4, 4],
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    this._layerGroups.kyushuEnergy.push(`${lineSourceId}-line`, lineSourceId);

    // Fly to show all energy sources
    this.flyToStep(CAMERA_STEPS.A2_overview);
  },

  hideKyushuEnergy() {
    // Remove line layers first
    this._safeRemoveLayer("energy-lines-line");
    this._safeRemoveSource("energy-lines");

    this._layerGroups.kyushuEnergy.forEach((id) => {
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

  showEnergyType(type) {
    // Hide this type first to prevent duplicates
    this.hideEnergyType(type);

    const energyData = AppData.kyushuEnergy;
    const stations = energyData[type] || [];
    if (stations.length === 0) return;

    const colorMap = { solar: "#ff9500", wind: "#5ac8fa", nuclear: "#ff3b30" };
    const svgIconMap = {
      solar:
        '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
      wind: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
      nuclear:
        '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2a7 7 0 0 0-5.4 11.5"/><path d="M12 2a7 7 0 0 1 5.4 11.5"/><path d="M7 20.7a7 7 0 0 0 10 0"/></svg>',
    };
    const groupKey = `energy${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const color = colorMap[type];

    // Create markers with staggered entrance
    stations.forEach((station, index) => {
      const delay = index * 120;

      const html = `<div class="energy-type-pin" style="
              width: 32px; height: 32px;
              background: ${color};
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 2.5px solid white;
              animation: energyPinDrop 0.5s var(--easing-decelerate) ${delay}ms both;
          ">${svgIconMap[type]}</div>`;

      const { marker, element } = this._createMarker(station.coords, html, {
        className: `energy-${type}-marker-wrapper`,
      });

      if (!marker || !element) return;

      // After pin drop completes, clear inline animation so CSS
      // .energy-type-pin idle pulse can take over
      const inner = element.firstElementChild;
      if (inner) {
        inner.addEventListener(
          "animationend",
          () => {
            inner.style.animation = "";
          },
          { once: true },
        );
      }

      this._addTooltip(
        marker,
        element,
        `${station.name} - ${station.capacity}`,
      );
      element.addEventListener("click", () => {
        // Fly to the marker's location
        this.flyToStep({
          center: this._toMapbox(station.coords),
          zoom: 9.4,
          pitch: 39,
          bearing: 0,
          duration: 2000,
        });
        if (typeof UI !== "undefined") {
          UI.showEnergyStationPanel(station, type);
        }
      });

      const id = `energy-${type}-${station.id}`;
      this.markers[id] = marker;
      this._layerGroups[groupKey].push(id);
    });

    // Draw animated arc lines from each station to JASM
    const jasmCoords = AppData.jasmLocation || [32.874, 130.785];

    stations.forEach((station, index) => {
      const origin = station.coords;
      const midLat = (origin[0] + jasmCoords[0]) / 2;
      const midLng = (origin[1] + jasmCoords[1]) / 2;
      const dLat = jasmCoords[0] - origin[0];
      const dLng = jasmCoords[1] - origin[1];
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);
      const arcHeight = Math.max(0.08, Math.min(0.6, distance * 0.2));
      const arcMid = [midLat + arcHeight, midLng];
      const points = this.generateBezierPoints(origin, arcMid, jasmCoords, 60);

      const sourceId = `energy-arc-${type}-${index}`;
      this._safeAddSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: points },
        },
      });

      // Glow layer (rendered behind main line for visibility)
      const glowLayerId = `${sourceId}-glow`;
      this.map.addLayer({
        id: glowLayerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 10,
          "line-opacity": 0,
          "line-blur": 3,
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

      // Staggered reveal from source to JASM, then ambient flow pulse
      this._animateEnergyLine(layerId, glowLayerId, index * 400, 2500, index);
    });
  },

  _animateEnergyLine(layerId, glowLayerId, delay, duration, staggerIndex) {
    // Start fully trimmed (invisible)
    try {
      this.map.setPaintProperty(layerId, "line-trim-offset", [0, 1]);
    } catch (e) {
      // line-trim-offset not supported; fall back to opacity fade
      this.map.setPaintProperty(layerId, "line-opacity", 0);
      if (glowLayerId) {
        try {
          this.map.setPaintProperty(glowLayerId, "line-opacity", 0);
        } catch (e2) {
          /* */
        }
      }
      setTimeout(() => {
        try {
          this.map.setPaintProperty(layerId, "line-opacity", 0.9);
          if (glowLayerId && this.map.getLayer(glowLayerId)) {
            this.map.setPaintProperty(glowLayerId, "line-opacity", 0.15);
          }
        } catch (e2) {
          /* layer may be gone */
        }
      }, delay);
      return;
    }

    const startTime = performance.now() + delay;
    const self = this;

    const animate = (now) => {
      if (!self.map || !self.map.getLayer(layerId)) return;

      const elapsed = now - startTime;
      if (elapsed < 0) {
        self._energyLineAnimations[layerId] = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(1, elapsed / duration);
      // Ease-out for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      try {
        // [eased, 1] trims the unrevealed portion at the JASM end,
        // making the line draw from source (position 0) toward JASM (position 1)
        self.map.setPaintProperty(layerId, "line-trim-offset", [eased, 1]);
        // Fade glow in sync with reveal
        if (glowLayerId && self.map.getLayer(glowLayerId)) {
          self.map.setPaintProperty(glowLayerId, "line-opacity", eased * 0.15);
        }
      } catch (e) {
        return;
      }

      if (progress < 1) {
        self._energyLineAnimations[layerId] = requestAnimationFrame(animate);
      } else {
        // Reset trim so full line is visible for flow phase
        try {
          self.map.setPaintProperty(layerId, "line-trim-offset", [0, 0]);
        } catch (e) {
          /* */
        }
        delete self._energyLineAnimations[layerId];
        // Phase 2: ambient flow pulse
        self._startEnergyLineFlow(layerId, glowLayerId, staggerIndex);
      }
    };

    this._energyLineAnimations[layerId] = requestAnimationFrame(animate);
  },

  _startEnergyLineFlow(layerId, glowLayerId, staggerIndex) {
    const self = this;
    const drawMs = 1800;
    const fadeMs = 500;
    const pauseMs = 400;
    const totalMs = drawMs + fadeMs + pauseMs;
    const phaseOffset = (staggerIndex || 0) * 650;

    // Dim main line so the flowing glow stands out
    try {
      self.map.setPaintProperty(layerId, "line-opacity", 0.35);
      // Widen glow for more visible flow
      if (glowLayerId && self.map.getLayer(glowLayerId)) {
        self.map.setPaintProperty(glowLayerId, "line-width", 14);
        self.map.setPaintProperty(glowLayerId, "line-blur", 6);
      }
    } catch (e) {
      /* */
    }

    const startTime = performance.now();

    const flow = (now) => {
      if (!self.map || !self.map.getLayer(layerId)) return;
      if (!glowLayerId || !self.map.getLayer(glowLayerId)) return;

      const elapsed = now - startTime + phaseOffset;
      const cycleProgress = (elapsed % totalMs) / totalMs;
      const drawEnd = drawMs / totalMs;
      const fadeEnd = (drawMs + fadeMs) / totalMs;

      try {
        if (cycleProgress < drawEnd) {
          // Draw phase: glow reveals from source toward JASM
          const t = cycleProgress / drawEnd;
          const eased = 1 - Math.pow(1 - t, 2.5);
          self.map.setPaintProperty(glowLayerId, "line-trim-offset", [
            eased,
            1,
          ]);
          self.map.setPaintProperty(glowLayerId, "line-opacity", 0.35);
        } else if (cycleProgress < fadeEnd) {
          // Fade phase: fully drawn, fade out
          const t = (cycleProgress - drawEnd) / (fadeEnd - drawEnd);
          self.map.setPaintProperty(glowLayerId, "line-trim-offset", [1, 1]);
          self.map.setPaintProperty(
            glowLayerId,
            "line-opacity",
            0.35 * (1 - t),
          );
        } else {
          // Pause: invisible, reset trim for next cycle
          self.map.setPaintProperty(glowLayerId, "line-trim-offset", [0, 1]);
          self.map.setPaintProperty(glowLayerId, "line-opacity", 0);
        }
      } catch (e) {
        return;
      }

      self._energyLineAnimations[layerId] = requestAnimationFrame(flow);
    };

    this._energyLineAnimations[layerId] = requestAnimationFrame(flow);
  },

  hideEnergyType(type) {
    const groupKey = `energy${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const group = this._layerGroups[groupKey] || [];

    // Cancel any running animations for this type
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

    // Remove line and glow layers, then sources
    group.forEach((id) => {
      if (id.endsWith("-line") || id.endsWith("-glow")) {
        this._safeRemoveLayer(id);
      }
    });
    group.forEach((id) => {
      if (
        id.startsWith("energy-arc-") &&
        !id.endsWith("-line") &&
        !id.endsWith("-glow")
      ) {
        this._safeRemoveSource(id);
      }
    });

    this._layerGroups[groupKey] = [];
  },

  hideAllEnergyTypes() {
    ["solar", "wind", "nuclear"].forEach((type) => this.hideEnergyType(type));
  },

  focusEnergyStation(stationId, type) {
    const markerId = `energy-${stationId}`;
    const marker = this.markers[markerId];

    if (!marker) return;

    // Clear previous highlight
    this.clearEnergyStationHighlight();

    this._highlightedEnergyStation = { markerId, type };

    // Fly to the marker location - slow, gentle drift
    const lngLat = marker.getLngLat();
    this.map.flyTo({
      center: [lngLat.lng, lngLat.lat],
      zoom: Math.max(this.map.getZoom(), 10.5),
      speed: 0.4,
      curve: 1,
      essential: true,
      easing: (t) => t * (2 - t),
    });

    // Delay marker highlight so the eye settles on the destination first
    setTimeout(() => {
      const element = marker.getElement();
      if (element) {
        const colorMap = {
          solar: "#ff9500",
          wind: "#5ac8fa",
          nuclear: "#ff3b30",
        };
        const color = colorMap[type] || "#ff9500";
        const markerDiv = element.querySelector("div");
        if (markerDiv) {
          markerDiv.style.transition =
            "transform 600ms cubic-bezier(0, 0, 0.2, 1), box-shadow 600ms cubic-bezier(0, 0, 0.2, 1)";
          markerDiv.style.transform = "scale(1.15)";
          markerDiv.style.boxShadow = `0 0 0 3px ${color}30, 0 1px 4px rgba(0,0,0,0.15)`;
        }
      }
    }, 800);
  },

  clearEnergyStationHighlight() {
    if (this._highlightedEnergyStation) {
      const { markerId } = this._highlightedEnergyStation;
      const marker = this.markers[markerId];
      if (marker) {
        const element = marker.getElement();
        if (element) {
          const markerDiv = element.querySelector("div");
          if (markerDiv) {
            markerDiv.style.transform = "";
            markerDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
          }
        }
      }
      this._highlightedEnergyStation = null;
    }
  },

  async fadeOutMarkers(markers) {
    if (!markers || markers.length === 0) return;
    markers.forEach((m) => {
      const el = m.getElement();
      // Apply exit animation to inner element (not wrapper)
      // to avoid interfering with Mapbox's transform positioning
      if (el && el.firstElementChild) {
        el.firstElementChild.classList.add("marker-exiting");
      } else if (el) {
        el.classList.add("marker-exiting");
      }
    });
    await this._delay(200);
    markers.forEach((m) => m.remove());
  },

  async fadeOutMarkerGroup(groupName) {
    const ids = this._layerGroups[groupName] || [];
    const markers = [];
    ids.forEach((id) => {
      if (this.markers[id]) markers.push(this.markers[id]);
    });
    await this.fadeOutMarkers(markers);
    // Clean up references
    ids.forEach((id) => delete this.markers[id]);
    this._layerGroups[groupName] = [];
  },

  clearAll() {
    // Remove all HTML markers AND their DOM elements
    Object.values(this.markers).forEach((marker) => {
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
    Object.keys(this._layerGroups).forEach((groupName) => {
      this._removeLayerGroup(groupName);
    });

    // Reset layer groups
    Object.keys(this._layerGroups).forEach((k) => {
      this._layerGroups[k] = [];
    });

    // Clear data layer markers
    Object.keys(this._dataLayerGroups).forEach((layerName) => {
      this.hideDataLayerMarkers(layerName);
    });

    // Stop any route animations
    this._stopRouteAnimation();

    // Clear property markers and routes
    this._safeRemoveLayer("property-markers-circle");
    this._safeRemoveLayer("property-markers-stroke");
    this._safeRemoveSource("property-markers");
    this._routeShimmerActive = false;
    this._safeRemoveLayer("property-routes-line");
    this._safeRemoveSource("property-routes");

    // Clear airline routes
    this.hideAirlineRoutes();

    // Clear infrastructure
    this.infrastructureMarkers.forEach((m) => {
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
    const orphanedMarkers = document.querySelectorAll(".mapboxgl-marker");
    orphanedMarkers.forEach((el) => {
      if (el.parentNode) el.remove();
    });

    // Also clean up any orphaned elevated-marker elements that escaped their parent
    const orphanedElevatedMarkers =
      document.querySelectorAll(".elevated-marker");
    orphanedElevatedMarkers.forEach((el) => {
      if (el.parentNode) el.remove();
    });
  },

  clearRoute() {
    this._routeShimmerActive = false;
    this._safeRemoveLayer("property-routes-line");
    this._safeRemoveSource("property-routes");
  },

  preloadImages(property) {
    if (property._imagesPreloaded) return;
    const urls = [];
    if (property.exteriorImage) urls.push(property.exteriorImage);
    if (property.image) urls.push(property.image);
    if (property.interiorImages) urls.push(...property.interiorImages);
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
    property._imagesPreloaded = true;
  },
};
