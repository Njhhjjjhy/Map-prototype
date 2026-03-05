import { AppData } from "../data/index.js";
import { MAP_COLORS } from "./constants.js";

export const methods = {
  showDataLayerMarkers(layerName, layerData) {
    if (!layerData || !layerData.markers) return;

    this.hideDataLayerMarkers(layerName);

    const layerColors = {
      trafficFlow: "#ef4444",
      railCommute: "#8b5cf6",
      electricity: "#f59e0b",
      employment: "#10b981",
      infrastructure: "#3b82f6",
      realEstate: "#f97316",
      riskyArea: "#dc2626",
      baseMap: "#6b7280",
    };
    const color = layerColors[layerName] || MAP_COLORS.primary;

    this._dataLayerGroups[layerName] = [];
    this.dataLayerMarkers[layerName] = {};

    layerData.markers.forEach((markerData, index) => {
      if (!markerData.coords) return;

      const html = this._dataLayerMarkerHtml(layerName, color);
      const { marker, element } = this._createMarker(markerData.coords, html, {
        className: "data-layer-marker-wrapper",
        entrance: "data-bounce",
      });

      // Stagger entrance animation (60ms per marker)
      if (element && element.firstElementChild) {
        element.firstElementChild.style.animationDelay = `${index * 60}ms`;
      }

      this._addTooltip(marker, element, markerData.name);
      element.addEventListener("click", () =>
        UI.focusDataLayerMarker(layerName, markerData.id),
      );

      const id = `data-${layerName}-${markerData.id}`;
      this.markers[id] = marker;
      this.dataLayerMarkers[layerName][markerData.id] = marker;
      this._dataLayerGroups[layerName].push(id);
    });

    // Show animated route layers for traffic flow and rail commute
    if (layerName === "trafficFlow" || layerName === "railCommute") {
      this.showAnimatedRouteLayer(layerName, layerData);
    }

    // Fit bounds (skip for electricity — handled by showKyushuEnergy)
    if (layerName !== "electricity") {
      const allCoords = layerData.markers
        .filter((m) => m.coords)
        .map((m) => this._toMapbox(m.coords));
      if (allCoords.length > 0) {
        const bounds = allCoords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]),
        );
        this.map.fitBounds(bounds, {
          padding: 80,
          duration: 1000,
          maxZoom: 12,
        });
      }
    }
  },

  hideDataLayerMarkers(layerName) {
    if (this._dataLayerGroups[layerName]) {
      this._dataLayerGroups[layerName].forEach((id) => {
        if (this.markers[id]) {
          const marker = this.markers[id];
          const element = marker.getElement();
          marker.remove();
          // Ensure DOM element is also removed
          if (element && element.parentNode) {
            element.remove();
          }
          delete this.markers[id];
        }
      });
      delete this._dataLayerGroups[layerName];
    }
    if (this.dataLayerMarkers[layerName]) {
      delete this.dataLayerMarkers[layerName];
    }

    // Hide animated route layers for traffic flow and rail commute
    if (layerName === "trafficFlow" || layerName === "railCommute") {
      this.hideAnimatedRouteLayer(layerName);
    }
  },

  fadeOutDataLayerMarkersAnimated(layerName) {
    const group = this._dataLayerGroups[layerName];
    if (!group || group.length === 0) {
      this.hideDataLayerMarkers(layerName);
      return;
    }

    // Apply exit animation to each marker's inner element
    group.forEach((id) => {
      const marker = this.markers[id];
      if (!marker) return;
      const el = marker.getElement();
      if (el && el.firstElementChild) {
        el.firstElementChild.classList.remove("marker-data-bounce");
        el.firstElementChild.classList.add("marker-data-exit");
      }
    });

    // Wait for animation to complete, then clean up DOM
    setTimeout(() => {
      this.hideDataLayerMarkers(layerName);
    }, 1000);
  },

  showAnimatedRouteLayer(layerName, layerData) {
    if (!layerData || !layerData.routes || layerData.routes.length === 0)
      return;
    if (!this.map || !this.map.isStyleLoaded()) return;

    // Hide existing layer first
    this.hideAnimatedRouteLayer(layerName);

    const routes = layerData.routes;
    this._animatedLayers[layerName].routes = routes;
    this._animatedLayers[layerName].active = true;

    // Add each route as a separate layer with animated dots
    routes.forEach((route, index) => {
      const sourceId = `${layerName}-route-${index}`;
      const baseLayerId = `${layerName}-route-base-${index}`;
      const dotsLayerId = `${layerName}-route-dots-${index}`;
      const glowLayerId = `${layerName}-route-glow-${index}`;

      // Create GeoJSON for the route
      const geojson = {
        type: "Feature",
        properties: {
          name: route.name,
          level: route.level || "medium",
          routeType: route.type || "main",
        },
        geometry: {
          type: "LineString",
          coordinates: route.path,
        },
      };

      // Add source
      this._safeAddSource(sourceId, {
        type: "geojson",
        data: geojson,
        lineMetrics: true,
      });

      // Traffic flow: different styles per congestion level
      if (layerName === "trafficFlow") {
        const levelStyles = {
          high: {
            width: 6,
            opacity: 0.8,
            dotSize: 4,
            dotSpacing: 30,
            speed: 80,
          },
          medium: {
            width: 5,
            opacity: 0.8,
            dotSize: 3,
            dotSpacing: 30,
            speed: 120,
          },
          low: {
            width: 4,
            opacity: 0.8,
            dotSize: 2.5,
            dotSpacing: 30,
            speed: 180,
          },
        };
        const style = levelStyles[route.level] || levelStyles.medium;

        // Glow effect base
        this.map.addLayer({
          id: glowLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": route.color,
            "line-width": style.width * 1.8,
            "line-opacity": 0.3,
            "line-blur": 4,
          },
        });

        // Base line
        this.map.addLayer({
          id: baseLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": route.color,
            "line-width": style.width,
            "line-opacity": style.opacity * 0.3,
          },
        });

        // Animated dots layer using dashed line trick
        this.map.addLayer({
          id: dotsLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": route.color,
            "line-width": style.dotSize,
            "line-opacity": style.opacity,
            "line-dasharray": [0, 2], // Will animate this
            "line-gap-width": style.width,
          },
        });

        // Store route metadata for animation
        route._layerIds = {
          glow: glowLayerId,
          base: baseLayerId,
          dots: dotsLayerId,
        };
        route._speed = style.speed;
        route._dotSpacing = style.dotSpacing;
      }

      // Rail commute: track-style rendering
      if (layerName === "railCommute") {
        const typeStyles = {
          main: { width: 10, dotSize: 4, opacity: 0.9, speed: 100 },
          secondary: { width: 8, dotSize: 3.5, opacity: 0.8, speed: 120 },
          planned: { width: 6, dotSize: 3, opacity: 0.7, speed: 140 },
        };
        const style = typeStyles[route.type] || typeStyles.main;

        // Track base (dark sleeper effect)
        this.map.addLayer({
          id: baseLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#1a1a2e",
            "line-width": style.width,
            "line-opacity": style.opacity,
          },
        });

        // Rails (parallel lines with dashed pattern)
        this.map.addLayer({
          id: glowLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#666688",
            "line-width": 6,
            "line-opacity": 0.8,
            "line-dasharray": [0.1, 1.5], // Sleeper pattern
          },
        });

        // Animated flowing dots
        this.map.addLayer({
          id: dotsLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": route.color,
            "line-width": style.dotSize,
            "line-opacity": 0.9,
            "line-dasharray": [0, 2], // Will animate this
            "line-gap-width": style.width,
          },
        });

        // Store route metadata for animation
        route._layerIds = {
          glow: glowLayerId,
          base: baseLayerId,
          dots: dotsLayerId,
        };
        route._speed = style.speed;
        route._dotSpacing = 30;
      }
    });

    // Start animation loop if not already running
    this._startRouteAnimation();
  },

  hideAnimatedRouteLayer(layerName) {
    if (!this._animatedLayers[layerName].active) return;

    const routes = this._animatedLayers[layerName].routes;
    routes.forEach((route, index) => {
      const sourceId = `${layerName}-route-${index}`;
      const baseLayerId = `${layerName}-route-base-${index}`;
      const dotsLayerId = `${layerName}-route-dots-${index}`;
      const glowLayerId = `${layerName}-route-glow-${index}`;

      this._safeRemoveLayer(dotsLayerId);
      this._safeRemoveLayer(baseLayerId);
      this._safeRemoveLayer(glowLayerId);
      this._safeRemoveSource(sourceId);
    });

    this._animatedLayers[layerName].active = false;
    this._animatedLayers[layerName].routes = [];

    // Stop animation if no layers are active
    const anyActive = Object.values(this._animatedLayers).some(
      (layer) => layer.active,
    );
    if (!anyActive) {
      this._stopRouteAnimation();
    }
  },

  showLayer(layerName) {
    // Show all markers in a layer group
    this._layerGroups[layerName]?.forEach((id) => {
      if (this.markers[id]) {
        this.markers[id].addTo(this.map);
      }
    });

    // Also show Mapbox map layers if they exist
    const layerIds = this._getMapboxLayerIds(layerName);
    layerIds.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, "visibility", "visible");
      }
    });
  },

  hideLayer(layerName) {
    this._layerGroups[layerName]?.forEach((id) => {
      if (this.markers[id]) {
        const marker = this.markers[id];
        const element = marker.getElement();
        marker.remove();
        // Ensure DOM element is also removed
        if (element && element.parentNode) {
          element.remove();
        }
      }
    });

    const layerIds = this._getMapboxLayerIds(layerName);
    layerIds.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, "visibility", "none");
      }
    });
  },
};
