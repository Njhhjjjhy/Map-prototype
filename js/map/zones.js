import { AppData } from "../data/index.js";
import { MAP_COLORS, CAMERA_STEPS } from "./constants.js";

export const methods = {
  showSciencePark(opts = {}) {
    if (!opts.skipCircles) {
      const circles = [
        {
          id: "science-park-circle-tsmc",
          label: "TSMC Semiconductor Hub",
          center: [130.825, 32.885],
          radius: 12000,
          color: MAP_COLORS.primary,
        },
        {
          id: "science-park-circle-airport",
          label: "Kumamoto Airport Development Zone",
          center: [130.85989089814692, 32.841638592865074],
          radius: 10000,
          color: "#7C3AED",
        },
      ];

      circles.forEach(({ id, center, radius, color }) => {
        const geoJson = this._generateCirclePolygon(center, radius);
        this._safeAddSource(id, { type: "geojson", data: geoJson });

        this.map.addLayer({
          id: `${id}-fill`,
          type: "fill",
          source: id,
          paint: { "fill-color": color, "fill-opacity": 0.18 },
        });

        this.map.addLayer({
          id: `${id}-stroke`,
          type: "line",
          source: id,
          paint: {
            "line-color": color,
            "line-width": 2.5,
            "line-opacity": 0.85,
          },
        });

        this._layerGroups.sciencePark.push(`${id}-fill`, `${id}-stroke`, id);
      });
    }

    // Fly to center (skip when camera is already positioned by goToStep)
    if (!opts.skipFly) {
      this.flyToStep(CAMERA_STEPS.B1_sciencePark);
    }
  },

  setScienceParkCircleVisible(visible) {
    const vis = visible ? "visible" : "none";
    const ids = ["science-park-circle-tsmc", "science-park-circle-airport"];
    ids.forEach((id) => {
      if (this.map.getLayer(`${id}-fill`)) {
        this.map.setLayoutProperty(`${id}-fill`, "visibility", vis);
      }
      if (this.map.getLayer(`${id}-stroke`)) {
        this.map.setLayoutProperty(`${id}-stroke`, "visibility", vis);
      }
    });
  },

  showZonePlanHighlight(zone, opts = {}) {
    if (!zone) return;

    // Remove this specific zone if it already exists (avoid duplicates)
    const existingId = `zone-plan-${zone.id}`;
    this._safeRemoveLayer(`${existingId}-fill`);
    this._safeRemoveLayer(`${existingId}-stroke`);
    this._safeRemoveSource(existingId);
    const group = this._layerGroups.zonePlanHighlight;
    [`${existingId}-fill`, `${existingId}-stroke`, existingId].forEach((id) => {
      const i = group.indexOf(id);
      if (i !== -1) group.splice(i, 1);
    });

    // If zone has industrialZones array, render cluster view instead of single polygon
    if (zone.industrialZones) {
      this._showGovZoneClusters(zone);
    } else if (zone.polygon) {
      // Standard single-polygon rendering
      const sourceId = `zone-plan-${zone.id}`;
      const geoJson = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [zone.polygon],
        },
      };

      this._safeAddSource(sourceId, { type: "geojson", data: geoJson });

      this.map.addLayer({
        id: `${sourceId}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": zone.color || "rgba(0, 122, 255, 0.25)",
          "fill-opacity": 0,
        },
      });

      this.map.addLayer({
        id: `${sourceId}-stroke`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": zone.strokeColor || "#007aff",
          "line-width": 2.5,
          "line-opacity": 0,
        },
      });

      this.map.setPaintProperty(`${sourceId}-fill`, "fill-opacity", 0.3);
      this.map.setPaintProperty(`${sourceId}-stroke`, "line-opacity", 0.9);

      this._layerGroups.zonePlanHighlight.push(
        `${sourceId}-fill`,
        `${sourceId}-stroke`,
        sourceId,
      );
    }

    // Fly to zone camera position (skip when called from subitem click)
    if (zone.camera && !opts.skipFly) {
      this.flyToStep({
        center: zone.camera.center,
        zoom: zone.camera.zoom,
        pitch: zone.camera.pitch,
        bearing: zone.camera.bearing,
        duration: 2000,
      });
    }
  },

  _showGovZoneClusters(zone) {
    const group = this._layerGroups.zonePlanHighlight;

    // Shared hover popup for all cluster fills and road hover
    this._govZonePopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: [0, -4],
      className: "mapbox-tooltip",
    });
    this._govZoneEventCleanups = this._govZoneEventCleanups || [];

    // Store cluster IDs so setGovZoneClusterHighlight can address them by fill layer name
    this._govZoneClusterIds = zone.industrialZones.map((iz) => iz.id);

    // Render each industrial zone as a clickable circle polygon
    zone.industrialZones.forEach((iz) => {
      const sourceId = `gov-zone-${iz.id}`;
      const fillId = `${sourceId}-fill`;
      const strokeId = `${sourceId}-stroke`;
      const circleGeoJson = this._generateCirclePolygon(
        this._toMapbox(iz.coords),
        iz.radius,
        48,
      );

      this._safeAddSource(sourceId, { type: "geojson", data: circleGeoJson });

      this.map.addLayer({
        id: fillId,
        type: "fill",
        source: sourceId,
        paint: { "fill-color": iz.color, "fill-opacity": 1 },
      });

      this.map.addLayer({
        id: strokeId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": iz.strokeColor,
          "line-width": 2,
          "line-opacity": 0.6,
        },
      });

      group.push(fillId, strokeId, sourceId);

      // Hover: show tooltip with cluster name
      const tooltipText = iz.name;
      const popup = this._govZonePopup;

      const enterFn = (e) => {
        popup.setLngLat(e.lngLat).setText(tooltipText).addTo(this.map);
        this.map.getCanvas().style.cursor = "pointer";
      };
      const moveFn = (e) => popup.setLngLat(e.lngLat);
      const leaveFn = () => {
        popup.remove();
        this.map.getCanvas().style.cursor = "";
      };
      const clickFn = () => App.selectGovZoneCluster(iz.id);

      this.map.on("mouseenter", fillId, enterFn);
      this.map.on("mousemove", fillId, moveFn);
      this.map.on("mouseleave", fillId, leaveFn);
      this.map.on("click", fillId, clickFn);

      this._govZoneEventCleanups.push(
        () => { this.map.off("mouseenter", fillId, enterFn); popup.remove(); },
        () => this.map.off("mousemove", fillId, moveFn),
        () => this.map.off("mouseleave", fillId, leaveFn),
        () => this.map.off("click", fillId, clickFn),
      );
    });

    // Render company logo markers (non-interactive visual labels)
    if (zone.companyDots) {
      zone.companyDots.forEach((dot) => {
        const logoHtml = dot.logo
          ? `<div style="
              width: 36px; height: 36px;
              background: #ffffff;
              border: 2px solid rgba(0,0,0,0.1);
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              display: flex; align-items: center; justify-content: center;
              overflow: hidden;
            "><img src="${dot.logo}" alt="${dot.label}" style="width: 26px; height: 26px; object-fit: contain;"></div>`
          : `<div class="gov-company-dot"><div class="gov-company-dot-circle" style="--dot-color: #1a2744;"></div><span class="gov-company-dot-label">${dot.label}</span></div>`;

        const markerId = `gov-dot-${dot.id}`;
        const { marker, element } = this._createMarker(dot.coords, logoHtml, {
          className: "gov-company-dot-wrapper",
          ariaLabel: dot.label,
        });

        if (marker) {
          this._addTooltip(marker, element, dot.label, [0, -8]);
          this.markers[markerId] = marker;
          group.push(markerId);
        }
      });
    }

    // Start faint looping pulse on all cluster fills
    this._startGovZoneClusterPulse(zone.industrialZones.map((iz) => iz.id));

    // Render infrastructure lines and point markers
    if (zone.infrastructureLines) {
      // Road layers must sit beneath cluster fills — insert before the first cluster fill layer
      const firstClusterFillId = zone.industrialZones?.[0]?.id
        ? `gov-zone-${zone.industrialZones[0].id}-fill`
        : null;
      const beforeCluster =
        firstClusterFillId && this.map.getLayer(firstClusterFillId)
          ? firstClusterFillId
          : undefined;

      zone.infrastructureLines
        .filter((infra) => infra.id !== "airport-monorail")
        .forEach((infra) => {
          if (infra.type === "line") {
            // Build full coordinates from path array or from/to pair
            const fullCoords = infra.path
              ? infra.path.map(([lat, lng]) => [lng, lat])
              : [
                  [infra.from[1], infra.from[0]],
                  [infra.to[1], infra.to[0]],
                ];
            const startCoord = fullCoords[0];

            const sourceId = `gov-infra-${infra.id}`;

            // Identical pattern to showInfraPlan: start at first coord, grow via rAF
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

            const lineLayer = `${sourceId}-line`;
            // Insert beneath the cluster fill layers
            this.map.addLayer(
              {
                id: lineLayer,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": infra.color,
                  "line-width": 4,
                  "line-opacity": 0.9,
                },
                layout: { "line-cap": "round", "line-join": "round" },
              },
              beforeCluster,
            );

            group.push(lineLayer, sourceId);

            // Grow slowly (8 s) with a small delay so the clusters settle first
            this._startLineGrow(sourceId, fullCoords, 8000, 300);

            // Hover tooltip and click on the visible line layer
            const roadEnterFn = (e) => {
              this._govZonePopup
                .setLngLat(e.lngLat)
                .setText(infra.label)
                .addTo(this.map);
              this.map.getCanvas().style.cursor = "pointer";
            };
            const roadMoveFn = (e) => this._govZonePopup.setLngLat(e.lngLat);
            const roadLeaveFn = () => {
              this._govZonePopup.remove();
              this.map.getCanvas().style.cursor = "";
            };
            const roadClickFn = () => App.selectGovZoneInfra(infra.id);

            this.map.on("mouseenter", lineLayer, roadEnterFn);
            this.map.on("mousemove", lineLayer, roadMoveFn);
            this.map.on("mouseleave", lineLayer, roadLeaveFn);
            this.map.on("click", lineLayer, roadClickFn);

            this._govZoneEventCleanups.push(
              () => this.map.off("mouseenter", lineLayer, roadEnterFn),
              () => this.map.off("mousemove", lineLayer, roadMoveFn),
              () => this.map.off("mouseleave", lineLayer, roadLeaveFn),
              () => this.map.off("click", lineLayer, roadClickFn),
            );
          } else if (infra.type === "polygon") {
            // Draw a filled polygon outline (e.g. monorail corridor)
            const sourceId = `gov-infra-${infra.id}`;
            this._safeAddSource(sourceId, {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [infra.polygon],
                },
              },
            });

            this.map.addLayer({
              id: `${sourceId}-fill`,
              type: "fill",
              source: sourceId,
              paint: {
                "fill-color": infra.color,
                "fill-opacity": 1,
              },
            });

            this.map.addLayer({
              id: `${sourceId}-stroke`,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": infra.strokeColor || infra.color,
                "line-width": 2,
                "line-opacity": 0.8,
              },
            });

            group.push(`${sourceId}-fill`, `${sourceId}-stroke`, sourceId);

            // Label at centroid
            const coords = infra.polygon;
            const midIdx = Math.floor(coords.length / 2);
            const labelCoords = [coords[midIdx][1], coords[midIdx][0]];
            const labelHtml = `<div class="gov-zone-label">
          <span class="gov-zone-label-text">${infra.label}</span>
        </div>`;
            const markerId = `gov-infra-marker-${infra.id}`;
            const { marker } = this._createMarker(labelCoords, labelHtml, {
              className: "gov-zone-label-wrapper",
              ariaLabel: infra.label,
            });
            if (marker) {
              this.markers[markerId] = marker;
              group.push(markerId);
            }
          } else if (infra.type === "point") {
            // Labeled point marker
            const labelHtml = `<div class="gov-zone-label">
          <span class="gov-zone-label-text">${infra.label}</span>
        </div>`;
            const markerId = `gov-infra-marker-${infra.id}`;
            const { marker } = this._createMarker(infra.coords, labelHtml, {
              className: "gov-zone-label-wrapper",
              ariaLabel: infra.label,
            });
            if (marker) {
              this.markers[markerId] = marker;
              group.push(markerId);
            }
          }
        });
    }
  },

  hideZonePlanHighlight() {
    // Stop any running line-grow animations on infra roads
    if (this._lineGrowAnimations) {
      Object.keys(this._lineGrowAnimations).forEach((id) => {
        if (id.startsWith("gov-infra-")) this._stopLineGrow(id);
      });
    }

    // Clean up Mapbox GL event listeners attached to cluster fill/road layers
    if (this._govZoneEventCleanups) {
      this._govZoneEventCleanups.forEach((fn) => { try { fn(); } catch (_) {} });
      this._govZoneEventCleanups = [];
    }
    if (this._govZonePopup) {
      this._govZonePopup.remove();
      this._govZonePopup = null;
    }
    this._stopGovZoneClusterPulse();
    this._govZoneClusterIds = null;
    this._govZoneSelectedClusterId = null;

    const group = this._layerGroups.zonePlanHighlight;
    group.forEach((id) => {
      // Remove DOM markers
      if (this.markers[id]) {
        const marker = this.markers[id];
        const element = marker.getElement();
        marker.remove();
        if (element && element.parentNode) {
          element.remove();
        }
        delete this.markers[id];
      }
      this._safeRemoveLayer(id);
      this._safeRemoveSource(id);
    });
    this._layerGroups.zonePlanHighlight = [];
  },

  setGovZoneClusterHighlight(clusterId) {
    this._govZoneSelectedClusterId = clusterId;
    if (!this._govZoneClusterIds || !this.map) return;
    this._govZoneClusterIds.forEach((id) => {
      const fillId = `gov-zone-${id}-fill`;
      if (this.map.getLayer(fillId)) {
        this.map.setPaintProperty(
          fillId,
          "fill-opacity",
          id === clusterId ? 1.0 : 0.45,
        );
      }
    });
  },

  _startGovZoneClusterPulse(clusterIds) {
    this._stopGovZoneClusterPulse();
    let phase = 0;
    this._govZoneClusterPulseTimer = setInterval(() => {
      if (!this.map) return;
      phase += 0.2;
      // Sharp pulse waveform: spends most time near base, briefly spikes to peak
      const t = Math.pow((Math.sin(phase) + 1) / 2, 3);
      const opacity = 0.25 + 0.75 * t;
      clusterIds.forEach((id) => {
        const fillId = `gov-zone-${id}-fill`;
        if (this.map.getLayer(fillId)) {
          this.map.setPaintProperty(fillId, "fill-opacity", opacity);
        }
      });
    }, 50);
  },

  _stopGovZoneClusterPulse() {
    if (this._govZoneClusterPulseTimer) {
      clearInterval(this._govZoneClusterPulseTimer);
      this._govZoneClusterPulseTimer = null;
    }
  },

  showFutureZones() {
    AppData.futureZones.forEach((zone) => {
      // Use boundary polygon if available, otherwise fall back to circle
      const zoneGeoJson = zone.boundary
        ? {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [zone.boundary] },
          }
        : this._generateCirclePolygon(this._toMapbox(zone.coords), zone.radius);

      const zoneColor = zone.color || MAP_COLORS.zone;
      const zoneStroke = zone.strokeColor || zoneColor;

      const sourceId = `future-zone-${zone.id}`;
      this._safeAddSource(sourceId, { type: "geojson", data: zoneGeoJson });

      this.map.addLayer({
        id: `${sourceId}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": zoneColor,
          "fill-opacity": 0.2,
        },
      });

      this.map.addLayer({
        id: `${sourceId}-stroke`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": zoneStroke,
          "line-width": 2.5,
          "line-dasharray": [5, 10],
        },
      });

      this._layerGroups.futureZones.push(
        `${sourceId}-fill`,
        `${sourceId}-stroke`,
        sourceId,
      );

      // Zone marker at center — use per-zone color
      const markerHtml = this._markerIconHtml("zone", null, zoneColor);
      const { marker, element } = this._createMarker(zone.coords, markerHtml, {
        ariaLabel: zone.name + " development zone",
      });

      this._addTooltip(marker, element, zone.name);
      element.addEventListener("click", () =>
        UI.renderInspectorPanel(5, { title: zone.name, zone }),
      );

      this.markers[zone.id] = marker;
      this._layerGroups.futureZones.push(zone.id);

      // Cluster satellite markers for facilities within the zone
      if (zone.facilities) {
        zone.facilities.forEach((facility, i) => {
          const dotId = `${zone.id}-facility-${i}`;
          const dotHtml = `<div style="
                      display: flex; align-items: center; gap: 4px; white-space: nowrap;
                  "><div style="
                      width: 10px; height: 10px;
                      background: ${zoneColor};
                      border: 1.5px solid white;
                      border-radius: 50%;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                      flex-shrink: 0;
                  "></div><span style="
                      font-family: var(--font-display);
                      font-size: 10px;
                      font-weight: 500;
                      color: var(--color-text-secondary);
                      text-shadow: 0 0 3px white, 0 0 3px white;
                  ">${facility.label}</span></div>`;

          const { marker: satMarker } = this._createMarker(
            facility.coords,
            dotHtml,
            {
              className: "zone-facility-marker",
            },
          );
          this.markers[dotId] = satMarker;
          this._layerGroups.futureZones.push(dotId);
        });
      }
    });
  },

  hideFutureZones() {
    this._removeLayerGroup("futureZones");
  },

  showInvestmentZones() {
    AppData.investmentZones.forEach((zone) => {
      const boundaryGeoJson = this._zoneBoundaryToGeoJson(zone);

      const sourceId = `inv-zone-${zone.id}`;
      this._safeAddSource(sourceId, { type: "geojson", data: boundaryGeoJson });

      this.map.addLayer({
        id: `${sourceId}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": zone.color,
          "fill-opacity": 1,
        },
      });

      this.map.addLayer({
        id: `${sourceId}-stroke`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": zone.strokeColor,
          "line-width": 2,
          "line-dasharray": [5, 10],
        },
      });

      this._layerGroups.investmentZones.push(
        `${sourceId}-fill`,
        `${sourceId}-stroke`,
        sourceId,
      );
    });

    // Persistent zone labels as a single symbol layer
    const labelSourceId = "inv-zone-labels";
    const labelFeatures = AppData.investmentZones.map((zone) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: this._toMapbox(zone.center),
      },
      properties: { name: zone.name },
    }));

    this._safeAddSource(labelSourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: labelFeatures },
    });

    this.map.addLayer({
      id: `${labelSourceId}-text`,
      type: "symbol",
      source: labelSourceId,
      layout: {
        "text-field": ["get", "name"],
        "text-size": 14,
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "#1e1f20",
        "text-halo-color": "#ffffff",
        "text-halo-width": 2.5,
      },
    });

    this._layerGroups.investmentZones.push(
      `${labelSourceId}-text`,
      labelSourceId,
    );
  },

  hideInvestmentZones() {
    this._removeLayerGroup("investmentZones");
  },

  showInvestmentZone(zoneId) {
    const zone = AppData.investmentZones.find((z) => z.id === zoneId);
    if (!zone || !this.map) return;

    const boundaryGeoJson = this._zoneBoundaryToGeoJson(zone);
    const centerLngLat = this._toMapbox(zone.center);

    const sourceId = `inv-zone-${zone.id}`;
    this._safeAddSource(sourceId, { type: "geojson", data: boundaryGeoJson });

    this.map.addLayer({
      id: `${sourceId}-fill`,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": zone.color,
        "fill-opacity": 1,
      },
    });

    this.map.addLayer({
      id: `${sourceId}-stroke`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": zone.strokeColor,
        "line-width": 2,
        "line-dasharray": [5, 10],
      },
    });

    // Per-zone label
    const labelSourceId = `inv-zone-label-${zone.id}`;
    this._safeAddSource(labelSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: centerLngLat,
        },
        properties: { name: zone.name },
      },
    });

    this.map.addLayer({
      id: `${labelSourceId}-text`,
      type: "symbol",
      source: labelSourceId,
      layout: {
        "text-field": ["get", "name"],
        "text-size": 14,
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "#1e1f20",
        "text-halo-color": "#ffffff",
        "text-halo-width": 2.5,
      },
    });

    this._layerGroups.investmentZones.push(
      `${sourceId}-fill`,
      `${sourceId}-stroke`,
      sourceId,
      `${labelSourceId}-text`,
      labelSourceId,
    );

    // Subtle camera ease to focus on the selected zone
    this.map.easeTo({
      center: centerLngLat,
      zoom: 11.8,
      pitch: 50,
      bearing: this.map.getBearing(),
      duration: 1200,
      easing: (t) => t * (2 - t),
    });
  },

  hideInvestmentZone(zoneId) {
    if (!this.map) return;
    const sourceId = `inv-zone-${zoneId}`;
    const labelSourceId = `inv-zone-label-${zoneId}`;
    const ids = [
      `${sourceId}-fill`,
      `${sourceId}-stroke`,
      `${labelSourceId}-text`,
    ];

    ids.forEach((id) => this._safeRemoveLayer(id));
    this._safeRemoveSource(sourceId);
    this._safeRemoveSource(labelSourceId);

    // Clean tracking array
    this._layerGroups.investmentZones =
      this._layerGroups.investmentZones.filter(
        (id) =>
          !id.startsWith(`inv-zone-${zoneId}`) &&
          !id.startsWith(`inv-zone-label-${zoneId}`),
      );
  },
};
