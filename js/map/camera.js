import { AppData } from "../data/index.js";
import { CAMERA_FEELINGS, CINEMATIC_SCALE, CAMERA_STEPS } from "./constants.js";

export const methods = {
  async flyToStep(config, opts = {}) {
    if (!this.initialized) return;

    // iPad rule: a per-step `ipad: { center, zoom, pitch, bearing }` partial
    // override on the config lets specific steps re-frame for the wider
    // iPad right panel. No global auto-shift is applied; the existing
    // desktop configs already carry their own panel compensation and a
    // global shift would double-correct.
    if (this._isIpadLayout() && config && config.ipad) {
      config = { ...config, ...config.ipad };
    }

    // Pause heartbeat drift during programmatic camera moves
    this.pauseHeartbeat();

    const map = this.map;
    const feeling = CAMERA_FEELINGS[opts.feeling] || null;
    const level = Math.max(1, Math.min(10, opts.cinematicLevel || 5));

    // Calculate final duration: base * feeling multiplier * cinematic multiplier
    let baseDuration = config.duration || 2000;
    if (feeling) baseDuration *= feeling.durationMultiplier;
    baseDuration *= CINEMATIC_SCALE.durationMultiplier(level);
    const duration = Math.round(baseDuration);

    // Calculate bearing with cinematic sweep
    const bearingSweep = CINEMATIC_SCALE.bearingSweep(level);
    const finalBearing =
      (config.bearing || 0) + (bearingSweep > 0 ? bearingSweep * 0.5 : 0);

    // Calculate pitch with cinematic boost (capped at 65)
    const pitchBoost = CINEMATIC_SCALE.pitchBoost(level);
    const finalPitch = Math.min(65, (config.pitch || 0) + pitchBoost);

    if (this.reducedMotion) {
      map.jumpTo({
        center: config.center,
        zoom: config.zoom,
        pitch: finalPitch,
        bearing: finalBearing,
      });
      this._resetIdleTimer();
      return;
    }

    const flyOptions = {
      center: config.center,
      zoom: config.zoom,
      pitch: finalPitch,
      bearing: finalBearing,
      duration: duration,
      essential: true,
    };

    // Apply feeling easing if specified
    if (feeling) flyOptions.easing = feeling.easing;

    map.flyTo(flyOptions);

    await this._waitForMoveEnd(duration + 1500);

    // Resume heartbeat idle timer after camera settles
    this._resetIdleTimer();
  },

  async cinematicSpiralTo(coords) {
    if (!this.initialized) return;

    this.pauseHeartbeat();

    const center = this._toMapbox(coords);
    const currentBearing = this.map.getBearing();
    const duration = 2500;

    if (this.reducedMotion) {
      this.map.jumpTo({
        center,
        zoom: 13,
        pitch: 52,
        bearing: currentBearing + 40,
      });
      this._resetIdleTimer();
      return;
    }

    this.map.flyTo({
      center,
      zoom: 13,
      pitch: 52,
      bearing: currentBearing + 40,
      duration,
      essential: true,
      easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    });

    await this._waitForMoveEnd(duration + 1500);
    this._resetIdleTimer();
  },

  async elevateToCorridorView() {
    if (!this.initialized && this._readyPromise) {
      const ready = await this._readyPromise;
      if (!ready) return;
    } else if (!this.initialized) {
      return;
    }

    this.corridorMode = true;
    this._corridorView = CAMERA_STEPS.corridor;

    if (this.reducedMotion) {
      this.map.jumpTo(this._corridorView);
      return;
    }

    this.map.flyTo({
      ...this._corridorView,
      duration: 2000,
      essential: true,
    });

    await this._waitForMoveEnd(3000);
  },

  // Fit the camera so all the given [lat, lng] coordinates are in view, clear
  // of the right panel. Center and zoom are derived from the points (not
  // hardcoded); pitch and bearing come from opts (Step 10 passes Ozu-1's
  // values). Padding and maxZoom reuse the existing property fit-to-bounds.
  fitToCoords(coords, opts = {}) {
    if (!this.initialized || !Array.isArray(coords) || coords.length === 0) {
      return;
    }
    this.pauseHeartbeat();
    const lngLats = coords.map((c) => this._toMapbox(c));
    const bounds = lngLats.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(lngLats[0], lngLats[0]),
    );
    const isIpad = this._isIpadLayout();
    this.map.fitBounds(bounds, {
      padding: {
        top: 80,
        bottom: 100,
        left: 80,
        right: isIpad ? 680 : 420,
      },
      maxZoom: 12,
      pitch: opts.pitch != null ? opts.pitch : isIpad ? 30 : 45,
      bearing: opts.bearing != null ? opts.bearing : 0,
      duration: opts.duration != null ? opts.duration : 2000,
      essential: true,
    });
  },

  async forwardReveal(property) {
    if (this._currentAnimation) {
      this._currentAnimation.cancelled = true;
      this.map.stop();
    }

    if (!this.initialized && this._readyPromise) {
      const ready = await this._readyPromise;
      if (!ready) return;
    } else if (!this.initialized) {
      return;
    }

    this.revealing = true;
    const thisAnimation = { cancelled: false };
    this._currentAnimation = thisAnimation;
    const map = this.map;

    // Save corridor view for reverse
    if (this.corridorMode) {
      this._previousView = this._corridorView;
    } else {
      this._previousView = {
        center: map.getCenter().toArray(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      };
    }

    const targetCenter = this._toMapbox(property.coords);
    const bearing =
      property.bestBearing ||
      this._calculateBearing(map.getCenter(), targetCenter);

    // iPad re-frames the property drill-down so the property pin lands
    // in the visible-left center of the wider iPad panel layout. The
    // east-shifted center moves the pin out from behind the panel; the
    // lower zoom and flatter pitch undo the "too close / too high" framing.
    const isIpad = this._isIpadLayout();
    const driveZoom = isIpad ? 14.0 : 16.5;
    const drivePitch = isIpad ? 40 : 55;
    let flightCenter = targetCenter;
    if (isIpad) {
      // Shift the centerpoint east in screen-east direction (panel is on
      // the right). At zoom 14, lat ~32.75, 280 screen-px east is roughly
      // 0.018 degrees longitude. Bearing-rotated.
      const lat = targetCenter[1];
      const dppLat = 360 / (Math.pow(2, driveZoom) * 512);
      const cosLat = Math.cos((lat * Math.PI) / 180);
      const dppLng = cosLat > 0.001 ? dppLat / cosLat : dppLat;
      const B = (bearing * Math.PI) / 180;
      const N = 350;
      const dLng = N * dppLng * Math.cos(B);
      const dLat = -N * dppLat * Math.sin(B);
      flightCenter = [targetCenter[0] + dLng, targetCenter[1] + dLat];
    }

    if (this.reducedMotion) {
      map.jumpTo({ center: flightCenter, zoom: driveZoom, pitch: drivePitch, bearing });
      await this._delay(100);
      this.revealing = false;
      this._currentAnimation = null;
      return;
    }

    map.flyTo({
      center: flightCenter,
      zoom: driveZoom,
      pitch: drivePitch,
      bearing: bearing,
      duration: 1800,
      essential: true,
    });

    await this._waitForMoveEnd(3000);

    this.revealing = false;
    this._currentAnimation = null;
  },

  async reverseReveal() {
    if (!this.initialized) return;

    if (this._currentAnimation) {
      this._currentAnimation.cancelled = true;
      this.map.stop();
      this._currentAnimation = null;
    }

    // Restore default building opacity
    this.setBuildingOpacity(0.5);

    this.revealing = false;
    const map = this.map;

    // Corridor mode: fly back to corridor view
    if (this.corridorMode && this._corridorView) {
      if (this.reducedMotion) {
        map.jumpTo(this._corridorView);
        this._previousView = null;
        return;
      }

      map.flyTo({
        ...this._corridorView,
        duration: 1500,
        essential: true,
        easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      });

      await this._waitForMoveEnd(2500);
      this._previousView = null;
      return;
    }

    // Standard mode: fly back to previous view
    const previousView = this._previousView;
    if (previousView) {
      if (this.reducedMotion) {
        map.jumpTo(previousView);
      } else {
        map.flyTo({
          center: previousView.center,
          zoom: previousView.zoom,
          pitch: previousView.pitch,
          bearing: previousView.bearing,
          duration: 1500,
          essential: true,
        });
        await this._waitForMoveEnd(2500);
      }
    }

    this._previousView = null;
  },

  flyTo(coords, zoom) {
    this.flyToStep({
      center: this._toMapbox(coords),
      zoom: zoom || 13,
      pitch: 50,
      bearing: 15,
      duration: 2000,
    });
  },

  flyToLocation(coords, zoom = 14) {
    this.map.flyTo({
      center: this._toMapbox(coords),
      zoom: zoom,
      duration: 1000,
    });
  },

  resetView() {
    const config = AppData.mapConfig;
    this.flyToStep({
      center: this._toMapbox(config.center),
      zoom: config.initialZoom,
      pitch: 45,
      bearing: 10,
      duration: 1500,
    });
  },

  fitToEvidenceGroup(group) {
    const coordItems = group.items.filter((item) => item.coords);
    if (coordItems.length === 0) return;

    if (coordItems.length === 1) {
      // Single item: fly directly to it
      this.flyToStep({
        center: this._toMapbox(coordItems[0].coords),
        zoom: 12,
        pitch: 50,
        bearing: 15,
        duration: 1500,
      });
    } else {
      // Multiple items: fit bounds around all of them
      const lngLats = coordItems.map((item) => this._toMapbox(item.coords));
      const bounds = lngLats.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(lngLats[0], lngLats[0]),
      );
      this.map.fitBounds(bounds, {
        padding: 100,
        duration: 1500,
        maxZoom: 13,
        pitch: 45,
        bearing: 10,
      });
    }
  },

  focusDataLayerMarker(layerName, markerId) {
    const marker = this.dataLayerMarkers[layerName]?.[markerId];
    if (marker) {
      this.map.flyTo({
        center: marker.getLngLat(),
        zoom: 14,
        duration: 800,
      });
    }
  },
};
