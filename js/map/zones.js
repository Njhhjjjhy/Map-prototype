import { AppData } from "../data/index.js";
import { MAP_COLORS, CAMERA_STEPS } from "./constants.js";

export const methods = {
  showSciencePark(opts = {}) {
    const sp = AppData.sciencePark;

    // Generate circle polygon
    const centerLngLat = this._toMapbox(sp.center);
    const circleGeoJson = this._generateCirclePolygon(centerLngLat, sp.radius);

    const sourceId = "science-park-circle";
    this._safeAddSource(sourceId, { type: "geojson", data: circleGeoJson });

    // Fill layer
    this.map.addLayer({
      id: `${sourceId}-fill`,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": MAP_COLORS.primary,
        "fill-opacity": 0.18,
      },
    });

    // Stroke layer
    this.map.addLayer({
      id: `${sourceId}-stroke`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": MAP_COLORS.primary,
        "line-width": 2.5,
        "line-opacity": 0.85,
      },
    });

    this._layerGroups.sciencePark.push(
      `${sourceId}-fill`,
      `${sourceId}-stroke`,
    );
    this._layerGroups.sciencePark.push(sourceId); // track source too

    // Fly to center (skip when camera is already positioned by goToStep)
    if (!opts.skipFly) {
      this.flyToStep(CAMERA_STEPS.B1_sciencePark);
    }
  },

  setScienceParkCircleVisible(visible) {
    const vis = visible ? "visible" : "none";
    if (this.map.getLayer("science-park-circle-fill")) {
      this.map.setLayoutProperty("science-park-circle-fill", "visibility", vis);
    }
    if (this.map.getLayer("science-park-circle-stroke")) {
      this.map.setLayoutProperty(
        "science-park-circle-stroke",
        "visibility",
        vis,
      );
    }
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

    // Render each industrial zone as a circle polygon
    zone.industrialZones.forEach((iz, index) => {
      const sourceId = `gov-zone-${iz.id}`;
      const circleGeoJson = this._generateCirclePolygon(
        this._toMapbox(iz.coords),
        iz.radius,
        48,
      );

      this._safeAddSource(sourceId, { type: "geojson", data: circleGeoJson });

      this.map.addLayer({
        id: `${sourceId}-fill`,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": iz.color,
          "fill-opacity": 1,
        },
      });

      this.map.addLayer({
        id: `${sourceId}-stroke`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": iz.strokeColor,
          "line-width": 2,
          "line-opacity": 0.6,
        },
      });

      group.push(`${sourceId}-fill`, `${sourceId}-stroke`, sourceId);

      // Labeled marker at center of each zone
      const labelHtml = `<div class="gov-zone-label">
      <span class="gov-zone-label-text">${iz.name}</span>
      ${iz.subtitle ? `<span class="gov-zone-label-sub">${iz.subtitle}</span>` : ""}
    </div>`;

      const markerId = `gov-zone-marker-${iz.id}`;
      const { marker } = this._createMarker(iz.coords, labelHtml, {
        className: "gov-zone-label-wrapper",
        ariaLabel: iz.name,
      });

      if (marker) {
        this.markers[markerId] = marker;
        group.push(markerId);
      }
    });

    // Render company dot markers
    if (zone.companyDots) {
      zone.companyDots.forEach((dot) => {
        const dotHtml = `<div class="gov-company-dot" style="--dot-color: ${dot.color};">
        <div class="gov-company-dot-circle"></div>
        <span class="gov-company-dot-label">${dot.label}</span>
      </div>`;

        const markerId = `gov-dot-${dot.id}`;
        const { marker } = this._createMarker(dot.coords, dotHtml, {
          className: "gov-company-dot-wrapper",
          ariaLabel: dot.label,
        });

        if (marker) {
          this.markers[markerId] = marker;
          group.push(markerId);
        }
      });
    }

    // Render infrastructure lines and point markers
    if (zone.infrastructureLines) {
      zone.infrastructureLines.forEach((infra) => {
        if (infra.type === "line") {
          // Draw a line between two points
          const sourceId = `gov-infra-${infra.id}`;
          this._safeAddSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [infra.from[1], infra.from[0]],
                  [infra.to[1], infra.to[0]],
                ],
              },
            },
          });

          this.map.addLayer({
            id: `${sourceId}-line`,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": infra.color,
              "line-width": 3,
              "line-dasharray": [6, 4],
              "line-opacity": 0.8,
            },
            layout: { "line-cap": "round", "line-join": "round" },
          });

          group.push(`${sourceId}-line`, sourceId);

          // Label marker at midpoint
          const midCoords = [
            (infra.from[0] + infra.to[0]) / 2,
            (infra.from[1] + infra.to[1]) / 2,
          ];
          const labelHtml = `<div class="gov-zone-label">
          <span class="gov-zone-label-text">${infra.label}</span>
        </div>`;
          const markerId = `gov-infra-marker-${infra.id}`;
          const { marker } = this._createMarker(midCoords, labelHtml, {
            className: "gov-zone-label-wrapper",
            ariaLabel: infra.label,
          });
          if (marker) {
            this.markers[markerId] = marker;
            group.push(markerId);
          }
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
