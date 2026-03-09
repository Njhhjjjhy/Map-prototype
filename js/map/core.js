export const methods = {
  init() {
    if (this._initStarted) return;
    this._initStarted = true;

    const token = window.MAPBOX_ACCESS_TOKEN;
    if (!token || token === "YOUR_TOKEN_HERE") {
      console.warn("MapController: No valid Mapbox access token.");
      this._readyPromise = Promise.resolve(false);
      return;
    }

    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    mapboxgl.accessToken = token;

    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [130.75, 32.8],
      zoom: 7.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
      interactive: true,
      attributionControl: false,
    });

    this.map.on("style.load", () => {
      this._addBuildingLayer();
    });

    this._readyPromise = new Promise((resolve) => {
      this.map.on("error", (e) => {
        console.error(
          "MapController: Map error —",
          e.error?.message || e.message || e,
        );
      });

      this.map.on("load", () => {
        this.initialized = true;
        resolve(true);
      });

      setTimeout(() => {
        if (!this.initialized) {
          console.warn("MapController: Timed out waiting for map load.");
          resolve(false);
        }
      }, 8000);
    });
  },

  async waitReady() {
    if (this._readyPromise) {
      return await this._readyPromise;
    }
    return this.initialized;
  },

  destroy() {
    this.stopHeartbeat();

    if (this._currentAnimation) {
      this._currentAnimation.cancelled = true;
      this._currentAnimation = null;
    }

    this.clearAll();

    this.revealing = false;
    this.corridorMode = false;
    this._corridorView = null;
    this._previousView = null;
  },

  _enableInteraction() {
    const map = this.map;
    map.scrollZoom.enable();
    map.boxZoom.enable();
    map.dragPan.enable();
    map.dragRotate.enable();
    map.keyboard.enable();
    map.touchZoomRotate.enable();
  },

  _addBuildingLayer() {
    const map = this.map;
    if (map.getLayer("3d-buildings")) return;

    const layers = map.getStyle().layers;
    let labelLayerId;
    for (const layer of layers) {
      if (
        layer.type === "symbol" &&
        layer.layout &&
        layer.layout["text-field"]
      ) {
        labelLayerId = layer.id;
        break;
      }
    }

    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 12,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            0,
            13,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            0,
            13,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.5,
        },
      },
      labelLayerId,
    );
  },

  setBuildingOpacity(opacity) {
    if (!this.initialized || !this.map) return;
    if (this.map.getLayer("3d-buildings")) {
      this.map.setPaintProperty(
        "3d-buildings",
        "fill-extrusion-opacity",
        opacity,
      );
    }
  },

  _safeAddSource(id, sourceSpec) {
    this._safeRemoveSource(id);
    this.map.addSource(id, sourceSpec);
  },

  _safeRemoveLayer(id) {
    try {
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id);
      }
    } catch (e) {
      /* layer may not exist */
    }
  },

  _safeRemoveSource(id) {
    try {
      if (this.map.getSource(id)) {
        // Remove all layers using this source first
        const style = this.map.getStyle();
        if (style && style.layers) {
          style.layers.forEach((layer) => {
            if (layer.source === id) {
              this.map.removeLayer(layer.id);
            }
          });
        }
        this.map.removeSource(id);
      }
    } catch (e) {
      /* source may not exist */
    }
  },

  _removeLayerGroup(groupName) {
    const group = this._layerGroups[groupName];
    if (!group) return;

    group.forEach((id) => {
      // Remove HTML marker AND its DOM element
      if (this.markers[id]) {
        const marker = this.markers[id];
        // Remove any open tooltip popup before destroying the marker
        if (marker._popup) {
          marker._popup.remove();
        }
        const element = marker.getElement();
        marker.remove();
        // Ensure DOM element is also removed
        if (element && element.parentNode) {
          element.remove();
        }
        delete this.markers[id];
      }
      // Remove Mapbox layer
      this._safeRemoveLayer(id);
      // Remove Mapbox source (if it matches — layers and sources may share ID)
      this._safeRemoveSource(id);
    });

    this._layerGroups[groupName] = [];
  },

  _toMapbox(coords) {
    return [coords[1], coords[0]];
  },

  _calculateBearing(from, to) {
    const fromLng = ((from.lng || from[0]) * Math.PI) / 180;
    const fromLat = ((from.lat || from[1]) * Math.PI) / 180;
    const toLng = (to[0] * Math.PI) / 180;
    const toLat = (to[1] * Math.PI) / 180;

    const dLng = toLng - fromLng;
    const y = Math.sin(dLng) * Math.cos(toLat);
    const x =
      Math.cos(fromLat) * Math.sin(toLat) -
      Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  },

  _waitForMoveEnd(timeout = 5000) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.map.off("moveend", onEnd);
        resolve();
      }, timeout);
      const onEnd = () => {
        clearTimeout(timer);
        resolve();
      };
      this.map.once("moveend", onEnd);
    });
  },

  _generateCirclePolygon(center, radiusMeters, steps = 64) {
    const coords = [];
    const km = radiusMeters / 1000;

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 360;
      const rad = (angle * Math.PI) / 180;
      // Approximate: 1 degree latitude ≈ 111.32 km
      const dLat = (km * Math.cos(rad)) / 111.32;
      const dLng =
        (km * Math.sin(rad)) / (111.32 * Math.cos((center[1] * Math.PI) / 180));
      coords.push([center[0] + dLng, center[1] + dLat]);
    }

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    };
  },

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  generateBezierPoints(p0, p1, p2, numPoints) {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat =
        (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
      const lng =
        (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
      points.push([lng, lat]);
    }
    return points;
  },

  _frame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  },

  _zoneBoundaryToGeoJson(zone) {
    if (zone.boundary) {
      return {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [zone.boundary],
        },
      };
    }

    // Generate circle polygon from center + radius (km)
    const centerLngLat = this._toMapbox(zone.center);
    const coords = this._circleCoords(centerLngLat, zone.radius || 5, 64);
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    };
  },

  /**
   * Generate circle coordinates as an array of [lng, lat] pairs.
   * @param {number[]} center - [lng, lat]
   * @param {number} radiusKm - radius in kilometers
   * @param {number} steps - number of points on the circle
   * @returns {number[][]} array of [lng, lat] coordinates
   */
  _circleCoords(center, radiusKm, steps = 64) {
    const coords = [];
    const earthRadius = 6371;
    const lat = (center[1] * Math.PI) / 180;
    const lng = (center[0] * Math.PI) / 180;
    const d = radiusKm / earthRadius;

    for (let i = 0; i <= steps; i++) {
      const bearing = (2 * Math.PI * i) / steps;
      const pLat = Math.asin(
        Math.sin(lat) * Math.cos(d) +
          Math.cos(lat) * Math.sin(d) * Math.cos(bearing),
      );
      const pLng =
        lng +
        Math.atan2(
          Math.sin(bearing) * Math.sin(d) * Math.cos(lat),
          Math.cos(d) - Math.sin(lat) * Math.sin(pLat),
        );
      coords.push([(pLng * 180) / Math.PI, (pLat * 180) / Math.PI]);
    }
    return coords;
  },

  savePreDataLayerView() {
    const map = this.map;
    this.preDataLayerView = {
      center: map.getCenter().toArray(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
    };
  },

  restorePreDataLayerView() {
    if (this.preDataLayerView) {
      this.flyToStep({
        center: this.preDataLayerView.center,
        zoom: this.preDataLayerView.zoom,
        pitch: this.preDataLayerView.pitch,
        bearing: this.preDataLayerView.bearing,
        duration: 1500,
      });
      this.preDataLayerView = null;
    }
  },

  _lerpCoord(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  },

  _subPath(fullCoords, t) {
    if (t <= 0) return [fullCoords[0], fullCoords[0]];
    if (t >= 1) return fullCoords;

    // Compute cumulative segment lengths
    const lengths = [0];
    for (let i = 1; i < fullCoords.length; i++) {
      const dx = fullCoords[i][0] - fullCoords[i - 1][0];
      const dy = fullCoords[i][1] - fullCoords[i - 1][1];
      lengths.push(lengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    const totalLen = lengths[lengths.length - 1];
    const targetLen = t * totalLen;

    // Find which segment we're in and interpolate
    const result = [fullCoords[0]];
    for (let i = 1; i < fullCoords.length; i++) {
      if (lengths[i] >= targetLen) {
        const segStart = lengths[i - 1];
        const segEnd = lengths[i];
        const segT = (targetLen - segStart) / (segEnd - segStart);
        result.push(this._lerpCoord(fullCoords[i - 1], fullCoords[i], segT));
        return result;
      }
      result.push(fullCoords[i]);
    }
    return result;
  },

  _getMapboxLayerIds(layerName) {
    // Return any map layer IDs associated with a named group
    const mapping = {
      sciencePark: [
        "science-park-circle-fill",
        "science-park-circle-stroke",
        "science-park-circle",
      ],
      infrastructureRoads: ["infrastructure-roads-line"],
    };
    return mapping[layerName] || [];
  },

  _fitBoundsForLayer(layerName) {
    const group = this._layerGroups[layerName];
    if (!group || group.length === 0) return;

    const coords = [];
    group.forEach((id) => {
      const marker = this.markers[id];
      if (marker && marker.getLngLat) {
        const lngLat = marker.getLngLat();
        coords.push([lngLat.lng, lngLat.lat]);
      }
    });

    if (coords.length > 0) {
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0]),
      );
      this.map.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 12 });
    }
  },

  initCameraDebug() {
    const toggle = document.getElementById("camera-debug-toggle");
    const panel = document.getElementById("camera-debug");
    const copyBtn = document.getElementById("camera-debug-copy");

    if (!toggle || !panel) return;

    toggle.addEventListener("click", () => {
      this._cameraDebug.active = !this._cameraDebug.active;
      panel.classList.toggle("hidden", !this._cameraDebug.active);
      toggle.classList.toggle("active", this._cameraDebug.active);

      if (this._cameraDebug.active) {
        this._startCameraDebugLoop();
      } else {
        this._stopCameraDebugLoop();
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        this._copyCameraValues(copyBtn);
      });
    }
  },

  _startCameraDebugLoop() {
    const update = () => {
      if (!this._cameraDebug.active || !this.map) return;
      this._updateCameraDebugValues();
      this._cameraDebug.rafId = requestAnimationFrame(update);
    };
    update();
  },

  _stopCameraDebugLoop() {
    if (this._cameraDebug.rafId) {
      cancelAnimationFrame(this._cameraDebug.rafId);
      this._cameraDebug.rafId = null;
    }
  },

  _updateCameraDebugValues() {
    const map = this.map;
    if (!map) return;

    const center = map.getCenter();
    const el = (id, val) => {
      const node = document.getElementById(id);
      if (node) node.textContent = val;
    };

    el("cam-lat", center.lat.toFixed(4));
    el("cam-lng", center.lng.toFixed(4));
    el("cam-zoom", map.getZoom().toFixed(1));
    el("cam-pitch", map.getPitch().toFixed(0) + "\u00B0");
    el("cam-bearing", map.getBearing().toFixed(0) + "\u00B0");
  },

  _copyCameraValues(btn) {
    const map = this.map;
    if (!map) return;

    const center = map.getCenter();
    const text = [
      "center: [" + center.lng.toFixed(4) + ", " + center.lat.toFixed(4) + "]",
      "zoom: " + map.getZoom().toFixed(1),
      "pitch: " + map.getPitch().toFixed(0),
      "bearing: " + map.getBearing().toFixed(0),
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 1200);
    });
  },
};
