/* ================================
   Camera Explorer (dev only)
   Live camera readout with 2D/3D toggle and copy-to-clipboard.
   ================================ */

import { MapController } from "../map/index.js";

const CameraExplorer = {
  active: false,
  _moveHandler: null,
  _buildingsVisible: true,
  _labelsVisible: true,
  _terrainEnabled: false,

  init() {
    const toggle = document.getElementById("camera-explorer-toggle");
    const panel = document.getElementById("camera-explorer");
    if (!toggle || !panel) return;

    this._toggle = toggle;
    this._panel = panel;

    // Cache DOM refs
    this._lngLatEl = panel.querySelector("[data-field='lnglat']");
    this._latLngEl = panel.querySelector("[data-field='latlng']");
    this._zoomEl = panel.querySelector("[data-field='zoom']");
    this._pitchEl = panel.querySelector("[data-field='pitch']");
    this._bearingEl = panel.querySelector("[data-field='bearing']");
    this._configEl = panel.querySelector(".camera-explorer-config");
    this._viewToggle = panel.querySelector(".camera-explorer-view-toggle");
    this._copyBtn = panel.querySelector(".camera-explorer-copy");

    // Toggle panel
    toggle.addEventListener("click", () => {
      this.active = !this.active;
      panel.classList.toggle("hidden", !this.active);
      toggle.classList.toggle("active", this.active);
      if (this.active) {
        this._startListening();
        this._update();
      } else {
        this._stopListening();
      }
    });

    // 2D/3D toggle
    if (this._viewToggle) {
      this._viewToggle.addEventListener("click", () => {
        if (!MapController.initialized) return;
        const map = MapController.map;
        const is3D = map.getPitch() > 5;
        map.easeTo({
          pitch: is3D ? 0 : 50,
          bearing: is3D ? 0 : map.getBearing(),
          duration: 600,
        });
      });
    }

    // Layer toggles (buildings, labels)
    const layerToggles = panel.querySelectorAll(
      ".camera-explorer-layer-toggle",
    );
    layerToggles.forEach((btn) => {
      const layer = btn.dataset.layer;
      // Buildings start visible (the layer exists by default)
      if (layer === "buildings") btn.classList.add("on");
      if (layer === "labels") btn.classList.add("on");

      btn.addEventListener("click", () => {
        if (layer === "buildings") this._toggleBuildings(btn);
        if (layer === "labels") this._toggleLabels(btn);
        if (layer === "terrain") this._toggleTerrain(btn);
      });
    });

    // Sliders
    this._sliders = {};
    this._sliderValues = {};
    this._draggingSlider = false;
    ["zoom", "pitch", "bearing", "exaggeration"].forEach((control) => {
      const range = panel.querySelector(`[data-control='${control}']`);
      const valueEl = panel.querySelector(`[data-control-value='${control}']`);
      if (range && valueEl) {
        this._sliders[control] = range;
        this._sliderValues[control] = valueEl;
        range.addEventListener("input", () => {
          this._draggingSlider = true;
          this._applySlider(control, parseFloat(range.value));
        });
        range.addEventListener("change", () => {
          this._draggingSlider = false;
        });
      }
    });

    // Copy config
    if (this._copyBtn) {
      this._copyBtn.addEventListener("click", () => this._copyConfig());
    }
  },

  _startListening() {
    if (this._moveHandler) return;
    if (!MapController.initialized) return;

    this._moveHandler = () => this._update();
    MapController.map.on("move", this._moveHandler);
  },

  _stopListening() {
    if (!this._moveHandler) return;
    if (!MapController.initialized) return;

    MapController.map.off("move", this._moveHandler);
    this._moveHandler = null;
  },

  _update() {
    if (!MapController.initialized) return;
    const map = MapController.map;

    const center = map.getCenter();
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const bearing = map.getBearing();

    const lng = center.lng.toFixed(4);
    const lat = center.lat.toFixed(4);

    // Live readout
    if (this._lngLatEl) this._lngLatEl.textContent = `${lng}, ${lat}`;
    if (this._latLngEl) this._latLngEl.textContent = `${lat}, ${lng}`;
    if (this._zoomEl) this._zoomEl.textContent = zoom.toFixed(1);
    if (this._pitchEl) this._pitchEl.textContent = Math.round(pitch);
    if (this._bearingEl) this._bearingEl.textContent = Math.round(bearing);

    // Update view toggle label
    if (this._viewToggle) {
      const is3D = pitch > 5;
      this._viewToggle.textContent = is3D ? "Switch to 2D" : "Switch to 3D";
    }

    // Sync sliders (skip if user is dragging one)
    if (!this._draggingSlider) {
      if (this._sliders.zoom) this._sliders.zoom.value = zoom;
      if (this._sliders.pitch) this._sliders.pitch.value = pitch;
      if (this._sliders.bearing) this._sliders.bearing.value = bearing;
    }
    if (this._sliderValues.zoom)
      this._sliderValues.zoom.textContent = zoom.toFixed(1);
    if (this._sliderValues.pitch)
      this._sliderValues.pitch.textContent = Math.round(pitch);
    if (this._sliderValues.bearing)
      this._sliderValues.bearing.textContent = Math.round(bearing);

    // Config preview (Mapbox [lng, lat] format, ready for CAMERA_STEPS)
    if (this._configEl) {
      this._configEl.textContent =
        `{\n` +
        `  center: [${lng}, ${lat}],\n` +
        `  zoom: ${zoom.toFixed(1)},\n` +
        `  pitch: ${Math.round(pitch)},\n` +
        `  bearing: ${Math.round(bearing)},\n` +
        `  duration: 2000,\n` +
        `}`;
    }
  },

  _applySlider(control, value) {
    if (!MapController.initialized) return;
    const map = MapController.map;
    if (control === "zoom") map.setZoom(value);
    else if (control === "pitch") map.setPitch(value);
    else if (control === "bearing") map.setBearing(value);
    else if (control === "exaggeration" && this._terrainEnabled) {
      map.setTerrain({ source: "mapbox-dem", exaggeration: value });
    }
  },

  _toggleBuildings(btn) {
    if (!MapController.initialized) return;
    const map = MapController.map;
    this._buildingsVisible = !this._buildingsVisible;
    btn.classList.toggle("on", this._buildingsVisible);

    if (map.getLayer("3d-buildings")) {
      map.setLayoutProperty(
        "3d-buildings",
        "visibility",
        this._buildingsVisible ? "visible" : "none",
      );
    }
  },

  _toggleTerrain(btn) {
    if (!MapController.initialized) return;
    const map = MapController.map;
    this._terrainEnabled = !this._terrainEnabled;
    btn.classList.toggle("on", this._terrainEnabled);

    if (this._terrainEnabled) {
      // Add DEM source if it doesn't exist
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
      }
      const exVal = this._sliders.exaggeration
        ? parseFloat(this._sliders.exaggeration.value)
        : 1.5;
      map.setTerrain({ source: "mapbox-dem", exaggeration: exVal });

      // Add sky layer for atmosphere
      if (!map.getLayer("sky")) {
        map.addLayer({
          id: "sky",
          type: "sky",
          paint: {
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0, 0],
            "sky-atmosphere-sun-intensity": 15,
          },
        });
      }
    } else {
      map.setTerrain(null);
      if (map.getLayer("sky")) map.removeLayer("sky");
    }
  },

  _toggleLabels(btn) {
    if (!MapController.initialized) return;
    const map = MapController.map;
    this._labelsVisible = !this._labelsVisible;
    btn.classList.toggle("on", this._labelsVisible);

    const visibility = this._labelsVisible ? "visible" : "none";
    const layers = map.getStyle().layers;
    for (const layer of layers) {
      // Toggle symbol layers (labels, POIs, place names)
      if (layer.type === "symbol") {
        map.setLayoutProperty(layer.id, "visibility", visibility);
      }
    }
  },

  _copyConfig() {
    if (!this._configEl) return;
    const text = this._configEl.textContent;
    navigator.clipboard.writeText(text).then(() => {
      this._copyBtn.classList.add("copied");
      setTimeout(() => this._copyBtn.classList.remove("copied"), 1200);
    });
  },
};

export { CameraExplorer };
