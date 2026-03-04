/**
 * MapController — Unified Mapbox GL JS 3D map engine
 *
 * Replaces both MapManager (Leaflet) and MapboxReveal (Mapbox overlay).
 * Single persistent Mapbox GL JS instance for all journeys with cinematic
 * camera choreography throughout.
 *
 * API:
 *   MapController.init()                          — Create Mapbox instance + 3D buildings
 *   MapController.flyToStep(config)               — Cinematic camera flight to any position
 *   MapController.elevateToCorridorView()         — Tilt into 3D corridor (steps 9-10)
 *   MapController.forwardReveal(property)         — Bird's-eye drill-down to property
 *   MapController.reverseReveal()                 — Fly back to corridor
 *   MapController.preloadImages(property)         — Preload images on hover
 *   MapController.destroy()                       — Reset state (app restart)
 */

/**
 * Design system colors — mirrors CSS custom properties from CLAUDE.md
 */
const MAP_COLORS = {
  primary: "#fbb931",
  error: "#ff3b30",
  info: "#007aff",
  warning: "#ff9500",
  success: "#34c759",
  resource: "#ff3b30",
  company: "#007aff",
  property: "#ff9500",
  zone: "#5856D6",
  route: "#64748b",
  infrastructure: "#5ac8fa",
  evidencePdf: "#6e7073",
  evidenceImage: "#007aff",
  evidenceWeb: "#34c759",
};

/**
 * Transition feelings — easing presets for camera moves.
 * Each feeling defines an easing function and a duration multiplier.
 *
 * Usage: MapController.flyToStep(config, { feeling: 'dramatic', cinematicLevel: 7 })
 */
const CAMERA_FEELINGS = {
  smooth: {
    label: "Smooth",
    easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t), // ease-in-out
    durationMultiplier: 1.0,
  },
  snappy: {
    label: "Snappy",
    easing: (t) => 1 - Math.pow(1 - t, 3), // fast deceleration
    durationMultiplier: 0.6,
  },
  dramatic: {
    label: "Dramatic",
    easing: (t) => t * t * (3 - 2 * t), // smoothstep — slow build, slow settle
    durationMultiplier: 1.8,
  },
  gentle: {
    label: "Gentle",
    easing: (t) => t * (2 - t), // ease-out — soft deceleration
    durationMultiplier: 1.4,
  },
};

/**
 * Cinematic level — scales the drama of camera transitions.
 * Level 1 = near-instant cut, Level 10 = full cinematic production.
 *
 * Affects: duration, bearing sweep amplitude, pitch smoothing.
 */
const CINEMATIC_SCALE = {
  // Duration multiplier: level 1 = 0.3x, level 5 = 1.0x, level 10 = 2.0x
  durationMultiplier(level) {
    return 0.3 + (level - 1) * (1.7 / 9);
  },
  // Bearing sweep: how much extra bearing rotation during flight
  bearingSweep(level) {
    return (level - 1) * 2; // 0° at level 1, 18° at level 10
  },
  // Pitch offset: slight extra tilt for drama
  pitchBoost(level) {
    return (level - 1) * 0.5; // 0° at level 1, 4.5° at level 10
  },
};

/**
 * Camera positions for each journey step — cinematic choreography
 * All centers are [lng, lat] (Mapbox format)
 */
const CAMERA_STEPS = {
  // Intro sequence: close-in on investment area, then smooth zoom-out to reveal region
  intro_close: {
    center: [130.8063, 32.7361],
    zoom: 12.0,
    pitch: 52,
    bearing: 29,
    duration: 2000,
  },
  intro_wide: {
    center: [131.658, 32.3559],
    zoom: 8.2,
    pitch: 54,
    bearing: 42,
    duration: 2500,
  },

  A0: {
    center: [130.78, 32.82],
    zoom: 11.5,
    pitch: 45,
    bearing: 10,
    duration: 2000,
  },
  A1: {
    center: [130.78, 32.83],
    zoom: 11.5,
    pitch: 45,
    bearing: -5,
    duration: 1500,
  },
  A2_overview: {
    center: [130.75, 32.8],
    zoom: 8.5,
    pitch: 35,
    bearing: 0,
    duration: 2500,
  },
  A2_water: {
    center: [130.9932, 32.5486],
    zoom: 10,
    pitch: 56,
    bearing: 56,
    duration: 2000,
  },
  A2_power: {
    center: [132.5772, 32.9895],
    zoom: 6.8,
    pitch: 37,
    bearing: 0,
    duration: 2000,
  },
  A3_ecosystem: {
    center: [130.78, 32.84],
    zoom: 11.5,
    pitch: 50,
    bearing: 20,
    duration: 2000,
  },
  A3_location: {
    center: [131.3969, 29.4475],
    zoom: 5.0,
    pitch: 22,
    bearing: 4,
    duration: 3000,
  },
  A3_talent: {
    center: [130.7, 32.5],
    zoom: 7,
    pitch: 25,
    bearing: 0,
    duration: 2500,
  },
  A4_government: {
    center: [136.0188, 28.8513],
    zoom: 5.5,
    pitch: 47,
    bearing: 9,
    duration: 3000,
  },
  A_to_B: {
    center: [130.75, 32.84],
    zoom: 11,
    pitch: 48,
    bearing: -10,
    duration: 2500,
  },
  B1: {
    center: [130.78, 32.84],
    zoom: 11.5,
    pitch: 48,
    bearing: -10,
    duration: 2000,
  },
  B1_sciencePark: {
    center: [130.78, 32.87],
    zoom: 11,
    pitch: 45,
    bearing: 5,
    duration: 1500,
  },
  B4: {
    center: [130.9345, 32.7499],
    zoom: 10.5,
    pitch: 54,
    bearing: 34,
    duration: 2500,
  },
  B6: {
    center: [130.83, 32.87],
    zoom: 11.5,
    pitch: 50,
    bearing: -20,
    duration: 2000,
  },
  B6_scienceParkAirport: {
    center: [131.1104, 32.7376],
    zoom: 9.8,
    pitch: 47,
    bearing: 9,
    duration: 2500,
  },
  B7: {
    center: [130.8, 32.86],
    zoom: 12,
    pitch: 55,
    bearing: 15,
    duration: 2500,
  },
  B_to_C: {
    center: [130.82, 32.82],
    zoom: 12.5,
    pitch: 50,
    bearing: -15,
    duration: 2000,
  },
  corridor: {
    center: [131.0329, 32.855],
    zoom: 10.7,
    pitch: 54,
    bearing: 0,
    duration: 2000,
  },
  complete: {
    center: [130.78, 32.84],
    zoom: 11,
    pitch: 40,
    bearing: 0,
    duration: 2000,
  },

  // 12-step additions (some alias existing positions)
  resources: {
    center: [130.78, 32.83],
    zoom: 11.5,
    pitch: 45,
    bearing: -5,
    duration: 2000,
  },
  strategic: {
    center: [129.5, 31.5],
    zoom: 5,
    pitch: 20,
    bearing: 0,
    duration: 3000,
  },
  government: {
    center: [130.78, 32.84],
    zoom: 11.5,
    pitch: 48,
    bearing: -10,
    duration: 2000,
  },
  corporate: {
    center: [130.8, 32.86],
    zoom: 12,
    pitch: 52,
    bearing: 30,
    duration: 2500,
  },
  scienceParkZones: {
    center: [130.78, 32.87],
    zoom: 11,
    pitch: 45,
    bearing: 5,
    duration: 2000,
  },
  transport: {
    center: [130.8, 32.86],
    zoom: 12,
    pitch: 55,
    bearing: 15,
    duration: 2500,
  },
  education: {
    center: [130.7, 32.5],
    zoom: 7,
    pitch: 25,
    bearing: 0,
    duration: 2500,
  },
  futureOutlook: {
    center: [130.83, 32.87],
    zoom: 11.5,
    pitch: 50,
    bearing: -20,
    duration: 2000,
  },
  zones: {
    center: [130.82, 32.82],
    zoom: 12.5,
    pitch: 50,
    bearing: -15,
    duration: 2000,
  },
  areaChanges: {
    center: [130.83, 32.87],
    zoom: 11.5,
    pitch: 50,
    bearing: -20,
    duration: 2000,
  },
};

const MapController = {
  map: null,
  initialized: false,
  _initStarted: false,
  _readyPromise: null,
  _currentAnimation: null,
  reducedMotion: false,
  revealing: false,
  corridorMode: false,
  _corridorView: null,
  _previousView: null,
  // Marker tracking
  markers: {}, // mapboxgl.Marker instances by ID
  _markerElements: {}, // DOM elements for cleanup
  popups: {},

  // Layer tracking — source/layer IDs per group for batch show/hide
  _layerGroups: {
    resources: [],
    sciencePark: [],
    companies: [],
    futureZones: [],
    properties: [],
    route: [],
    evidenceMarkers: [],
    infrastructureRoads: [],
    airlineRoutes: [],
    kyushuEnergy: [],
    energySolar: [],
    energyWind: [],
    energyNuclear: [],
    governmentChain: [],
    governmentArc: [],
    prefectureHighlight: [],
    municipalityCircles: [],
    investmentZones: [],
    semiconductorNetwork: [],
    talentPipeline: [],
    resourceArcs: [],
    zonePlanHighlight: [],
    grandAirportAccess: [],
    grandAirportRailway: [],
    grandAirportRoads: [],
    propertyContextLines: [],
  },

  // Road extension animation tracking
  _roadDrawRafs: [],
  _roadPulseTimeout: null,

  // Infrastructure road tracking
  selectedInfrastructureRoad: null,
  infrastructureRoadPolylines: {},
  infrastructureMarkers: [],

  // Airline route tracking
  airlineRoutePolylines: [],
  airlineDestinationMarkers: [],
  airlineOriginMarker: null,

  // Data layer tracking
  dataLayerMarkers: {},
  _dataLayerGroups: {},

  // Animated route layer tracking (traffic flow, rail commute)
  _animatedLayers: {
    trafficFlow: { active: false, routes: [] },
    railCommute: { active: false, routes: [] },
  },
  _animationFrame: null,
  _animationOffset: 0,

  // Energy type line animation tracking
  _energyLineAnimations: {},

  // Evidence marker tracking
  highlightedEvidenceMarker: null,

  // Pre-data-layer view save
  preDataLayerView: null,

  // Heartbeat — ambient life between interactions
  _heartbeat: {
    active: false,
    driftInterval: null,
    bearingPerTick: 0.05, // degrees per tick (~0.5°/10s)
    tickMs: 1000, // tick interval
    idleTimeout: null,
    idleThreshold: 5000, // ms of no interaction before drift starts
    pulsingMarkers: [],
  },

  // ================================
  // LIFECYCLE
  // ================================

  /**
   * Initialize the Mapbox GL JS map
   */
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

  /**
   * Wait for the map to be ready
   */
  async waitReady() {
    if (this._readyPromise) {
      return await this._readyPromise;
    }
    return this.initialized;
  },

  // ================================
  // CAMERA
  // ================================

  /**
   * Fly camera to a step position with cinematic easing.
   *
   * @param {Object} config — { center, zoom, pitch, bearing, duration }
   * @param {Object} [opts] — Optional transition overrides
   * @param {string} [opts.feeling] — 'smooth' | 'snappy' | 'dramatic' | 'gentle'
   * @param {number} [opts.cinematicLevel] — 1-10 drama scale (default 5)
   */
  async flyToStep(config, opts = {}) {
    if (!this.initialized) return;

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

  /**
   * Elevate to 3D corridor view (steps 9-10: investment zones, properties)
   */
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

  /**
   * Bird's-eye camera tilt to property location (enhanced)
   * @param {Object} property — Property data with coords [lat, lng]
   */
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

    if (this.reducedMotion) {
      map.jumpTo({ center: targetCenter, zoom: 16.5, pitch: 55, bearing });
      await this._delay(100);
      this.revealing = false;
      this._currentAnimation = null;
      return;
    }

    // Property drill-down: zoom 16.5, pitch 55
    map.flyTo({
      center: targetCenter,
      zoom: 16.5,
      pitch: 55,
      bearing: bearing,
      duration: 1800,
      essential: true,
    });

    await this._waitForMoveEnd(3000);

    this.revealing = false;
    this._currentAnimation = null;
  },

  /**
   * Fly camera back to saved view
   */
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

  // ================================
  // MARKERS — HTML Markers with Elevation Effect
  // ================================

  /**
   * Create a Mapbox GL JS HTML marker
   * @param {Array} coords — [lat, lng] (data format)
   * @param {string} html — Inner HTML for marker element
   * @param {Object} options — { className, anchor, offset }
   * @returns {{ marker: mapboxgl.Marker, element: HTMLElement }}
   */
  _createMarker(coords, html, options = {}) {
    // Defensive check: ensure map exists before creating markers
    if (!this.map || !this.initialized) {
      console.warn(
        "MapController: Attempted to create marker before map initialized",
      );
      return { marker: null, element: null };
    }

    const el = document.createElement("div");
    el.className = options.className || "mapbox-marker-wrapper";
    el.innerHTML = html;

    // Apply entrance animation to inner element (not wrapper)
    // to avoid interfering with Mapbox's transform positioning
    if (options.entrance && el.firstElementChild) {
      el.firstElementChild.classList.add(`marker-${options.entrance}`);
    }

    // Keyboard accessibility
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    if (options.ariaLabel) {
      el.setAttribute("aria-label", options.ariaLabel);
    }
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });

    try {
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: options.anchor || "center",
        offset: options.offset || [0, 0],
      })
        .setLngLat(this._toMapbox(coords))
        .addTo(this.map);

      return { marker, element: el };
    } catch (error) {
      console.error("MapController: Failed to create marker:", error);
      // Clean up the orphaned element
      if (el.parentNode) el.remove();
      return { marker: null, element: null };
    }
  },

  /**
   * Create elevated marker HTML (floating above terrain with drop shadow)
   * @param {string} innerHtml — Content inside the marker circle
   * @param {string} color — Background color
   * @param {number} size — Visual size in px
   * @param {Object} extraStyles — Additional inline styles
   */
  _elevatedMarkerHtml(
    innerHtml,
    color,
    size = 36,
    extraStyles = {},
    shape = "circle",
  ) {
    const borderWidth = size > 32 ? 3 : 2;
    const extra = Object.entries(extraStyles)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
    return `<div class="custom-marker-hitarea marker-shape-${shape}" style="
            width: 48px; height: 48px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
        "><div class="elevated-marker" style="
            width: ${size}px; height: ${size}px;
            background: ${color};
            border: ${borderWidth}px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15);
            display: flex; align-items: center; justify-content: center;
            transition: transform var(--duration-fast) var(--easing-standard),
                        box-shadow var(--duration-fast) var(--easing-standard);
            ${extra}
        ">${innerHtml}</div></div>`;
  },

  /**
   * Create marker icon HTML for different types
   */
  _markerIconHtml(type, subtype = null, customColor = null) {
    const colors = {
      resource: MAP_COLORS.resource,
      company: MAP_COLORS.company,
      property: MAP_COLORS.property,
      zone: MAP_COLORS.zone,
    };

    const shapes = {
      resource: "circle",
      company: "square",
      property: "pin",
      zone: "diamond",
    };

    const icons = {
      property: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z"/></svg>`,
      company: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M22 22H2V10l7-3v3l7-3v3l6-3v15zM4 20h16v-8l-4 2v-2l-5 2v-2l-5 2v-2l-2 1v7z"/><rect x="6" y="14" width="3" height="3"/><rect x="11" y="14" width="3" height="3"/><rect x="16" y="14" width="3" height="3"/></svg>`,
      water: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 2c-5.33 8-8 12-8 15a8 8 0 1 0 16 0c0-3-2.67-7-8-15z"/></svg>`,
      power: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M13 2L4 14h7v8l9-12h-7V2z"/></svg>`,
      zone: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M4 4h4V2H2v6h2V4zm16 0v4h2V2h-6v2h4zM4 20v-4H2v6h6v-2H4zm16 0h-4v2h6v-6h-2v4z"/><circle cx="12" cy="12" r="4"/></svg>`,
    };

    const icon = icons[subtype] || icons[type] || "";
    const color = customColor || colors[type] || MAP_COLORS.primary;
    const shape = shapes[type] || "circle";

    return this._elevatedMarkerHtml(icon, color, 36, {}, shape);
  },

  /**
   * Create branded company marker HTML
   */
  _brandedMarkerHtml(companyId) {
    const brands = {
      jasm: {
        text: "JASM",
        logo: "assets/Jasm-logo.svg",
        bg: "#ffffff",
        size: 56,
        imgSize: 44,
      },
      sony: {
        text: "Sony",
        logo: "assets/Sony-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      "tokyo-electron": {
        text: "Tokyo Electron",
        logo: "assets/Tokyo-electron-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      mitsubishi: {
        text: "Mitsubishi Electric",
        logo: "assets/Mitsubishi-electric-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      sumco: {
        text: "SUMCO",
        logo: "assets/Sumco-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      kyocera: {
        text: "Kyocera",
        logo: "assets/Kyocera-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      "rohm-apollo": {
        text: "Rohm",
        logo: "assets/Rohm-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
    };

    const brand = brands[companyId];
    if (!brand) return this._markerIconHtml("company");

    const innerHtml = `<img src="${brand.logo}" alt="${brand.text}" style="
            width: ${brand.imgSize}px;
            height: ${brand.imgSize}px;
            object-fit: contain;
        ">`;

    return this._elevatedMarkerHtml(
      innerHtml,
      brand.bg,
      brand.size,
      {},
      "square",
    );
  },

  /**
   * Add a hover popup (tooltip replacement)
   */
  _addTooltip(marker, element, text, offset = [0, -24]) {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: offset,
      className: "mapbox-tooltip",
    }).setText(text);

    element.addEventListener("mouseenter", () => {
      popup.setLngLat(marker.getLngLat()).addTo(this.map);
    });
    element.addEventListener("mouseleave", () => {
      popup.remove();
    });

    return popup;
  },

  // ================================
  // WATER RESOURCE LAYER (v2 - layer toggle driven)
  // ================================

  /**
   * Show water resource layer: water area highlights + Coca-Cola and Suntory logo markers
   * Camera stays in place - no fly.
   */
  showWaterResourceLayer() {
    const waterData = AppData.resources.water;
    if (!waterData) return;

    // Add water area highlight polygon on map
    this._showWaterAreaOverlay();

    // Add Coca-Cola and Suntory logo markers
    this._showBrandLogoMarkers();
  },

  /**
   * Hide water resource layer: remove overlays and brand markers
   */
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

  /**
   * Show water area highlight overlay on the map (Aso groundwater basin area)
   */
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

  /**
   * Show Coca-Cola and Suntory brand logo markers on the map
   */
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

  // ================================
  // STEPS 1-2 — Resources, Strategic Location
  // ================================

  /**
   * Show resource markers (step 1: resources)
   */
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

  // ================================
  // RESOURCE ARCS (step 1: resource → JASM)
  // ================================

  /**
   * Draw curved arc lines from resource sources to JASM.
   * For water: arcs from water source + evidence markers to JASM.
   * For power: arcs from all energy stations of that type to JASM.
   */
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

  /**
   * Show ALL resource arcs (water + energy) at once.
   * Used on step entry so arcs are visible immediately.
   */
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

  /**
   * Show Kyushu-wide energy infrastructure markers
   */
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

  // ================================
  // Per-type energy display (multi-select)
  // ================================

  /**
   * Show markers and animated arc lines for a single energy type.
   * Additive - multiple types can be active simultaneously.
   * @param {string} type - 'solar', 'wind', or 'nuclear'
   */
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

  /**
   * Animate a single energy arc line using line-trim-offset.
   * Phase 1: Draw line from source to JASM (directional reveal).
   * Phase 2: Staggered opacity pulsing (ambient energy flow).
   *
   * line-trim-offset: [a, b] trims (hides) the section from a to b.
   * To reveal source-to-JASM: [eased, 1] shrinks the trim from the end.
   *
   * @param {string} layerId - Main line Mapbox layer ID
   * @param {string} glowLayerId - Glow line Mapbox layer ID
   * @param {number} delay - Stagger delay before animation starts (ms)
   * @param {number} duration - Reveal phase duration (ms)
   * @param {number} staggerIndex - Index for phase offset in flow animation
   */
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

  /**
   * Repeating draw-and-fade cycle on the glow layer that creates the
   * visual impression of energy pulses traveling from source to JASM.
   * Main line dims to a permanent arc; glow repeatedly reveals and fades.
   *
   * @param {string} layerId - Main line layer (dimmed to permanent arc)
   * @param {string} glowLayerId - Glow line layer (animated flow)
   * @param {number} staggerIndex - Phase offset index
   */
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

  /**
   * Hide markers and lines for a single energy type.
   * @param {string} type - 'solar', 'wind', or 'nuclear'
   */
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

  /**
   * Hide all per-type energy displays.
   * Called on step exit to clean up.
   */
  hideAllEnergyTypes() {
    ["solar", "wind", "nuclear"].forEach((type) => this.hideEnergyType(type));
  },

  /**
   * Focus map on a specific energy station marker.
   * Flies camera to the station and pulses the marker.
   * @param {string} stationId - e.g. 'solar-kagoshima'
   * @param {string} type - 'solar', 'wind', or 'nuclear'
   */
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

  /**
   * Clear energy station marker highlight.
   */
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

  /**
   * Show training center marker on the map
   * @param {Object} item - Evidence item with coords and title
   */
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

  /**
   * Show employment data marker on the map
   * @param {Object} item - Evidence item with coords and title
   */
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

  /**
   * Show talent pipeline — Kyushu-wide university/institution markers
   * Similar scope to showKyushuEnergy (extends beyond Kumamoto)
   */
  showTalentPipeline() {
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
    this.flyToStep({
      center: [130.7, 32.5],
      zoom: 7,
      pitch: 25,
      bearing: 0,
      duration: 2500,
    });
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

  /**
   * Save/restore map view for data layer zoom
   */
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

  // ================================
  // STEPS 3-8 — Government, Companies, Zones, Roads, Education, Future
  // ================================

  /**
   * Show Science Park circle (steps 3, 5: government support, science park)
   * @param {Object} [opts] - Options
   * @param {boolean} [opts.skipFly] - Skip camera flight (camera already positioned by goToStep)
   */
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

  /**
   * Toggle visibility of the science park amber circle layers.
   * @param {boolean} visible - Whether the circle should be visible
   */
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

  /**
   * Show a single zone plan polygon highlight on the map.
   * Removes any previous zone plan highlight first (one at a time).
   * @param {Object} zone - Zone plan data from AppData.scienceParkZonePlans
   */
  showZonePlanHighlight(zone, opts = {}) {
    if (!zone || !zone.polygon) return;

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

    const sourceId = `zone-plan-${zone.id}`;
    const geoJson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [zone.polygon],
      },
    };

    this._safeAddSource(sourceId, { type: "geojson", data: geoJson });

    // Fill layer
    this.map.addLayer({
      id: `${sourceId}-fill`,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": zone.color || "rgba(0, 122, 255, 0.25)",
        "fill-opacity": 0,
      },
    });

    // Stroke layer
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

    // Animate in
    this.map.setPaintProperty(`${sourceId}-fill`, "fill-opacity", 0.3);
    this.map.setPaintProperty(`${sourceId}-stroke`, "line-opacity", 0.9);

    this._layerGroups.zonePlanHighlight.push(
      `${sourceId}-fill`,
      `${sourceId}-stroke`,
      sourceId,
    );

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

  /**
   * Remove the current zone plan polygon highlight from the map.
   */
  hideZonePlanHighlight() {
    this._layerGroups.zonePlanHighlight.forEach((id) => {
      this._safeRemoveLayer(id);
      this._safeRemoveSource(id);
    });
    this._layerGroups.zonePlanHighlight = [];
  },

  /**
   * Show airport marker on the map
   * @param {Object} airport - Airport data with coords [lat, lng]
   */
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

  /**
   * Show government commitment chain markers
   */
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

  /**
   * Select a government level — fly to marker
   */
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

  // ────────────────────────────────────────────────
  // Government level toggles (step 4)
  // ────────────────────────────────────────────────

  /**
   * Show a single government level on the map.
   * Central: animated Bezier arc from Tokyo to Kumamoto (blue).
   * Prefectural: fill + outline of Kumamoto prefecture boundary (green).
   * Local: circle polygons + pulsing DOM markers for each municipality (orange).
   * @param {string} level - 'central' | 'prefectural' | 'local'
   */
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

  /**
   * Central government: animated Bezier arc from Tokyo to Kumamoto.
   */
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

  /**
   * Prefectural government: filled + outlined Kumamoto boundary.
   */
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

  /**
   * Local government: circle polygons + pulsing DOM markers for municipalities.
   */
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
        const circleFeature = this._generateCirclePolygon(
          this._toMapbox(item.coords),
          1200,
          48,
        );

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

  /**
   * Hide a single government level from the map.
   * @param {string} level - 'central' | 'prefectural' | 'local'
   */
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

  /**
   * Hide all government level layers.
   * Called on step exit to clean up.
   */
  hideAllGovernmentLevels() {
    ["central", "prefectural", "local"].forEach((level) =>
      this.hideGovernmentLevel(level),
    );
  },

  /**
   * Show company markers (step 4: corporate investment)
   */
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

  /**
   * Show semiconductor network — all 7 companies with connection lines to JASM
   * Visual pattern: thin lines from each company to JASM facility (per feedback map-1.png)
   */
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

  /**
   * Show future development zones (steps 5, 8: science park, future outlook)
   */
  showFutureZones() {
    AppData.futureZones.forEach((zone) => {
      // Circle polygon
      const centerLngLat = this._toMapbox(zone.coords);
      const circleGeoJson = this._generateCirclePolygon(
        centerLngLat,
        zone.radius,
      );

      const zoneColor = zone.color || MAP_COLORS.zone;
      const zoneStroke = zone.strokeColor || zoneColor;

      const sourceId = `future-zone-${zone.id}`;
      this._safeAddSource(sourceId, { type: "geojson", data: circleGeoJson });

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

  /**
   * Show investment zone overlays with persistent labels (step 9: investment zones)
   */
  showInvestmentZones() {
    AppData.investmentZones.forEach((zone) => {
      const centerLngLat = this._toMapbox(zone.coords);
      const circleGeoJson = this._generateCirclePolygon(
        centerLngLat,
        zone.radius,
      );

      const sourceId = `inv-zone-${zone.id}`;
      this._safeAddSource(sourceId, { type: "geojson", data: circleGeoJson });

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
        coordinates: this._toMapbox(zone.coords),
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

  /**
   * Show a single investment zone by ID (for toggle-based control).
   */
  showInvestmentZone(zoneId) {
    const zone = AppData.investmentZones.find((z) => z.id === zoneId);
    if (!zone || !this.map) return;

    const centerLngLat = this._toMapbox(zone.coords);
    const circleGeoJson = this._generateCirclePolygon(
      centerLngLat,
      zone.radius,
    );

    const sourceId = `inv-zone-${zone.id}`;
    this._safeAddSource(sourceId, { type: "geojson", data: circleGeoJson });

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
  },

  /**
   * Hide a single investment zone by ID.
   */
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

  // ================================
  // PROPERTY CONTEXT LINES (step 11: property 2-step flow)
  // ================================

  /**
   * Draw animated context lines from a property to JASM, station, airport, and road.
   * Camera pulls back to overview so all connections are visible.
   * @param {Object} property - property object with coords and connections
   */
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
      jasm: `<svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M22 22H2V10l7-3v3l7-3v3l6-3v15zM4 20h16v-8l-4 2v-2l-5 2v-2l-5 2v-2l-2 1v7z"/></svg>`,
      station: `<svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M12 2C8 2 5 4 5 8v6c0 2 1 3.5 3 4l-2 2v1h12v-1l-2-2c2-.5 3-2 3-4V8c0-4-3-6-7-6zm-2 14H8v-4h2v4zm6 0h-2v-4h2v4zm2-6H6V8c0-3 2.5-4 6-4s6 1 6 4v2z"/></svg>`,
      airport: `<svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
      road: `<svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M11 2v3H8l1 3h2v3H8l1 3h2v3H8l1 3h2v2h2v-2h2l-1-3h-2v-3h3l-1-3h-2V8h3l-1-3h-2V2h-2z"/></svg>`,
    };
    types.forEach((type, index) => {
      const target = conn[type];
      if (!target || !target.coords) return;
      const endpointId = `context-endpoint-${type}`;
      const color = lineColors[type];
      const icon = endpointIcons[type] || "";
      const html = this._elevatedMarkerHtml(icon, color, 24);
      const { marker } = this._createMarker(target.coords, html, {
        ariaLabel: lineLabels[type],
      });
      if (marker) {
        // Fade in with stagger matching lines
        const el = marker.getElement();
        if (el) {
          el.style.opacity = "0";
          el.style.transition = "opacity 300ms ease";
          setTimeout(
            () => {
              el.style.opacity = "1";
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

  /**
   * Remove context lines with fade out.
   */
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

  // ================================
  // INFRASTRUCTURE ROADS (step 6: transport access)
  // ================================

  showInfrastructureRoads() {
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
    this.flyToStep(CAMERA_STEPS.B7);
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

  /**
   * Emphasize infrastructure roads for future outlook view.
   * Makes planned/approved roads more visually prominent with solid lines and glow.
   */
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

  /**
   * Reset road extension highlighting back to default styling.
   */
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

  // ================================
  // GRAND AIRPORT ACCESS ROUTES
  // ================================

  /**
   * Draw two rail routes from Aso Kumamoto Airport to Higo-Ozu Station
   * plus landmark markers along the corridor.
   */
  showAirportAccessRoutes() {
    const data = AppData.grandAirportData?.airportAccessRoutes;
    if (!data || !this.map) return;

    // Clean up previous if any
    this.hideAirportAccessRoutes();

    // 1. "Previously announced" route - dashed blue line
    const prevCoords = data.previousRoute.map((c) => this._toMapbox(c));
    const prevSourceId = "ga-prev-route";
    this._safeAddSource(prevSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: prevCoords },
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

    // 2. "Newly announced" route - solid red curve via bezier
    const nr = data.newRoute;
    const curvePoints = this.generateBezierPoints(
      nr.start,
      nr.control,
      nr.end,
      nr.numPoints || 60,
    );
    const newSourceId = "ga-new-route";
    this._safeAddSource(newSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: curvePoints },
      },
    });
    // Glow layer
    this.map.addLayer({
      id: `${newSourceId}-glow`,
      type: "line",
      source: newSourceId,
      paint: {
        "line-color": "#ff3b30",
        "line-width": 7,
        "line-opacity": 0.15,
        "line-blur": 4,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    // Main line
    this.map.addLayer({
      id: `${newSourceId}-line`,
      type: "line",
      source: newSourceId,
      paint: {
        "line-color": "#ff3b30",
        "line-width": 3.5,
        "line-opacity": 0.85,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });
    this._layerGroups.grandAirportAccess.push(
      `${newSourceId}-glow`,
      `${newSourceId}-line`,
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

    // 4. JR Hohi Line - east-west railway context
    const railwayData = AppData.grandAirportData?.railway;
    if (railwayData?.jrHohiLine) {
      const hohiCoords = railwayData.jrHohiLine.map((c) => this._toMapbox(c));
      const hohiSourceId = "ga-access-hohi-line";
      this._safeAddSource(hohiSourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: hohiCoords },
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
        lineId: `${newSourceId}-line`,
        glowId: `${newSourceId}-glow`,
        baseWidth: 3.5,
        routeId: "new-route",
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

    lineConfigs.forEach(({ lineId, baseWidth, routeId }) => {
      if (!this.map.getLayer(lineId)) return;
      const meta = routesMeta.find((r) => r.id === routeId);
      const name = meta?.name || routeId;

      const enterHandler = (e) => {
        this.map.getCanvas().style.cursor = "pointer";
        if (this.map.getLayer(lineId)) {
          this.map.setPaintProperty(lineId, "line-width", baseWidth + 2);
        }
        linePopup.setLngLat(e.lngLat).setText(name).addTo(this.map);
      };
      const moveHandler = (e) => {
        linePopup.setLngLat(e.lngLat);
      };
      const leaveHandler = () => {
        this.map.getCanvas().style.cursor = "";
        if (this.map.getLayer(lineId)) {
          this.map.setPaintProperty(lineId, "line-width", baseWidth);
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
      { id: `${newSourceId}-glow`, base: 0.15, amp: 0.12 },
      { id: "ga-access-hohi-line-glow", base: 0.08, amp: 0.08 },
      // Main line layers
      { id: `${prevSourceId}-line`, base: 0.5, amp: 0.25 },
      { id: `${newSourceId}-line`, base: 0.85, amp: 0.15 },
      { id: "ga-access-hohi-line-line", base: 0.6, amp: 0.2 },
    ];
    this._airportRoutePulseTimer = setInterval(() => {
      phase += 0.04;
      pulseConfigs.forEach(({ id, base, amp }) => {
        if (this.map.getLayer(id)) {
          const opacity = base + amp * Math.sin(phase);
          this.map.setPaintProperty(id, "line-opacity", opacity);
        }
      });
    }, 50);
  },

  /**
   * Remove airport access route lines, landmark markers, and interaction handlers.
   */
  hideAirportAccessRoutes() {
    // Clean up pulse animation
    if (this._airportRoutePulseTimer) {
      clearInterval(this._airportRoutePulseTimer);
      this._airportRoutePulseTimer = null;
    }

    // Clean up event handlers
    if (this._airportRouteHandlers) {
      this._airportRouteHandlers.forEach(({ event, layer, fn }) => {
        this.map.off(event, layer, fn);
      });
      this._airportRouteHandlers = null;
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

  // ================================
  // GRAND AIRPORT RAILWAY STATIONS
  // ================================

  /**
   * Draw the JR Hohi Line and station markers along it.
   * Planned stations are highlighted with orange, existing with gray.
   */
  showRailwayStations() {
    const data = AppData.grandAirportData?.railway;
    if (!data || !this.map) return;

    // Clean up previous if any
    this.hideRailwayStations();

    // 1. JR Hohi Line
    const lineCoords = data.jrHohiLine.map((c) => this._toMapbox(c));
    const lineSourceId = "ga-jr-hohi-line";
    this._safeAddSource(lineSourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: lineCoords },
      },
    });
    // Glow
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

    // 2. Station markers (elevated style, tooltip on hover, click for detail)
    const trainIconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="14" height="14"><path d="M4 11V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7"/><path d="M2 16h20"/><path d="M4 16l-2 6h20l-2-6"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>`;

    data.stations.forEach((station) => {
      const isPlanned = station.type === "planned";
      const color = isPlanned ? "#ff9500" : "#6e7073";
      const id = `ga-station-${station.id}`;

      const html = this._elevatedMarkerHtml(trainIconSvg, color, 36);

      const { marker, element } = this._createMarker(station.coords, html, {
        className: "ga-station-marker",
        entrance: "anchor",
        ariaLabel: station.name,
      });

      // Hover tooltip (text on hover only)
      this._addTooltip(marker, element, station.name);

      // Click to show detail in dashboard
      element.addEventListener("click", () => {
        App.showRailwayStationDetail(station.id);
      });

      this.markers[id] = marker;
      this._layerGroups.grandAirportRailway.push(id);
    });

    // Pulse animation - oscillate glow width and opacity for visible breathing effect
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

  /**
   * Remove JR Hohi Line and station markers.
   */
  hideRailwayStations() {
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

  // ================================
  // GRAND AIRPORT ROAD EXTENSIONS
  // ================================

  /**
   * Draw three high-standard road extensions with progressive line-drawing animation.
   * Roads are based on the Kumamoto Metropolitan Area future road network plan:
   *   1. North connection road (Kumamoto Kita JCT to Ozu-Nishi IC)
   *   2. Airport connection road (Kumamoto IC to Aso Kumamoto Airport)
   *   3. South connection road (city south to Kashima JCT)
   */
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

      // Main dashed line
      this.map.addLayer({
        id: `${sourceId}-line`,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": 4,
          "line-opacity": 0.9,
          "line-dasharray": [6, 4],
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

    // Start breathing pulse after all roads finish drawing
    const totalDrawTime = roads.length * stagger + drawDuration + 200;
    this._roadPulseTimeout = setTimeout(() => {
      this._startRoadPulse(roads);
    }, totalDrawTime);
  },

  /**
   * Progressively extend a line from its first point to full length.
   * Uses ease-out cubic for natural deceleration.
   */
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

  /**
   * Start a continuous breathing pulse on all road extension glow layers.
   */
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

  /**
   * Remove road extension lines and clean up all animations.
   */
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
    if (this._roadExtHandlers) {
      this._roadExtHandlers.forEach(({ event, layer, fn }) => {
        this.map.off(event, layer, fn);
      });
      this._roadExtHandlers = null;
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

  /**
   * Remove the airport marker from the map.
   */
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

  // ================================
  // STEPS 9-11 — Investment Zones, Properties, Area Changes
  // ================================

  /**
   * Show property markers (Leaflet-compatible API for dashboard)
   */
  showPropertyMarkers() {
    // Group properties by zone for staggered cascade
    const zoneOrder = [];
    const zoneMap = {};
    AppData.properties.forEach((property) => {
      const zone = property.zone || "Other";
      if (!zoneMap[zone]) {
        zoneMap[zone] = [];
        zoneOrder.push(zone);
      }
      zoneMap[zone].push(property);
    });

    // Stagger: 300ms between zones, 100ms between items within a zone
    let baseDelay = 0;
    zoneOrder.forEach((zone) => {
      const properties = zoneMap[zone];
      properties.forEach((property, indexInZone) => {
        const delay = baseDelay + indexInZone * 100;
        setTimeout(() => {
          const html = this._markerIconHtml("property");
          const { marker, element } = this._createMarker(
            property.coords,
            html,
            {
              entrance: "emerge",
              ariaLabel: property.name,
            },
          );

          this._addTooltip(marker, element, property.name);

          element.addEventListener("mouseover", () =>
            this.preloadImages(property),
          );
          element.addEventListener("click", () => {
            UI.showPropertyReveal(property);
          });

          this.markers[property.id] = marker;
          this._layerGroups.properties.push(property.id);
        }, delay);
      });
      baseDelay += properties.length * 100 + 300;
    });
  },

  // ================================
  // EVIDENCE MARKERS
  // ================================

  showEvidenceGroupMarkers(group) {
    this.clearEvidenceMarkers();

    let evidenceIndex = 0;
    group.items.forEach((item) => {
      if (item.coords) {
        const html = this._evidenceMarkerHtml(item.type, false, group.icon);
        const delay = evidenceIndex * 60;
        evidenceIndex++;
        const { marker, element } = this._createMarker(item.coords, html, {
          className: "evidence-marker-wrapper",
          entrance: "emerge",
        });
        if (delay > 0) {
          element.style.animationDelay = `${delay}ms`;
        }

        element.addEventListener("click", () => {
          UI.selectDisclosureItem(group.id, item.id);
        });

        const id = `evidence-${group.id}-${item.id}`;
        this.markers[id] = marker;
        this._markerElements[id] = element;
        this._layerGroups.evidenceMarkers.push(id);
      }
    });
  },

  /**
   * Fly camera to fit all evidence items with coordinates in a group
   * @param {Object} group - Evidence group data with items[]
   */
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

  clearEvidenceMarkers() {
    this._layerGroups.evidenceMarkers.forEach((id) => {
      if (this.markers[id]) {
        this.markers[id].remove();
        delete this.markers[id];
      }
      delete this._markerElements[id];
    });
    this._layerGroups.evidenceMarkers = [];
    this.highlightedEvidenceMarker = null;
  },

  highlightEvidenceMarker(groupId, itemId) {
    const markerId = `evidence-${groupId}-${itemId}`;
    const marker = this.markers[markerId];

    if (marker) {
      this.clearEvidenceMarkerHighlight();

      const group = AppData.evidenceGroups[groupId];
      const item = group?.items.find((i) => i.id === itemId);
      const type = item?.type || "pdf";

      // Update marker HTML to highlighted state
      const element = this._markerElements[markerId];
      if (element) {
        element.innerHTML = this._evidenceMarkerHtml(type, true, group?.icon);
      }

      this.highlightedEvidenceMarker = { marker, groupId, itemId };

      // Pan to marker
      this.map.panTo(marker.getLngLat(), { duration: 500 });
    }
  },

  clearEvidenceMarkerHighlight() {
    if (this.highlightedEvidenceMarker) {
      const { groupId, itemId } = this.highlightedEvidenceMarker;
      const markerId = `evidence-${groupId}-${itemId}`;

      const group = AppData.evidenceGroups[groupId];
      const item = group?.items.find((i) => i.id === itemId);
      const type = item?.type || "pdf";

      const element = this._markerElements[markerId];
      if (element) {
        element.innerHTML = this._evidenceMarkerHtml(type, false, group?.icon);
      }

      this.highlightedEvidenceMarker = null;
    }
  },

  _evidenceMarkerHtml(type, highlighted = false, groupIcon = null) {
    const contentColors = {
      zap: "#ff9500",
      route: "#5ac8fa",
      landmark: "#007aff",
      "graduation-cap": "#34c759",
    };
    const docColors = {
      pdf: MAP_COLORS.evidencePdf,
      image: MAP_COLORS.evidenceImage,
      web: MAP_COLORS.evidenceWeb,
    };
    const color =
      (groupIcon && contentColors[groupIcon]) ||
      docColors[type] ||
      MAP_COLORS.evidencePdf;

    const contentIcons = {
      zap: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
      route: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12"/></svg>`,
      landmark: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
      "graduation-cap": `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>`,
    };
    const docIcons = {
      pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      image: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
      web: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    };
    const iconSvg =
      (groupIcon && contentIcons[groupIcon]) ||
      docIcons[type] ||
      docIcons["pdf"];

    const highlightStyle = highlighted
      ? `box-shadow: 0 0 0 4px rgba(251, 185, 49, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3); transform: scale(1.2);`
      : `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);`;

    return `<div style="
            width: 28px; height: 28px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            ${highlightStyle}
            transition: box-shadow 0.15s ease, transform 0.15s ease;
        "><div style="width: 14px; height: 14px;">${iconSvg}</div></div>`;
  },

  // ================================
  // DATA LAYER MARKERS
  // ================================

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

  // ================================
  // ANIMATED ROUTE LAYERS (Traffic Flow, Rail Commute)
  // ================================

  /**
   * Show animated route layer with flowing dots
   * @param {string} layerName - 'trafficFlow' or 'railCommute'
   * @param {Object} layerData - Data containing routes array
   */
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

  /**
   * Hide animated route layer
   * @param {string} layerName - 'trafficFlow' or 'railCommute'
   */
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

  /**
   * Start the route animation loop
   */
  _startRouteAnimation() {
    if (this._animationFrame || this.reducedMotion) return;

    const animate = () => {
      this._animationOffset = (this._animationOffset + 1) % 100;

      // Update all active animated layers
      Object.entries(this._animatedLayers).forEach(
        ([layerName, layerState]) => {
          if (!layerState.active) return;

          layerState.routes.forEach((route) => {
            if (!route._layerIds) return;

            const speed = route._speed || 100;
            const spacing = route._dotSpacing || 30;

            // Calculate animated offset
            const dashOffset =
              ((this._animationOffset * speed) / 100) % spacing;
            const dashPhase = dashOffset / spacing;

            // Update the dash array to create flowing dot effect
            const dotsLayerId = route._layerIds.dots;
            if (this.map.getLayer(dotsLayerId)) {
              this.map.setPaintProperty(dotsLayerId, "line-dasharray", [
                0,
                dashPhase * 4,
                0.5,
                (1 - dashPhase) * 4,
              ]);
            }
          });
        },
      );

      this._animationFrame = requestAnimationFrame(animate);
    };

    this._animationFrame = requestAnimationFrame(animate);
  },

  /**
   * Stop the route animation loop
   */
  _stopRouteAnimation() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
    this._animationOffset = 0;
  },

  _dataLayerMarkerHtml(layerName, color) {
    const icons = {
      trafficFlow: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
      railCommute: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 3 L4 7 L8 11"/><path d="M4 7 L20 7"/><rect x="6" y="11" width="12" height="10" rx="2"/><path d="M9 21v-2h6v2"/></svg>`,
      electricity: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      employment: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      infrastructure: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
      realEstate: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
      riskyArea: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
      baseMap: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    };
    const iconSvg = icons[layerName] || icons.baseMap;

    return `<div style="
            width: 36px; height: 36px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: transform var(--duration-fast) var(--easing-standard);
        "><div style="width: 18px; height: 18px;">${iconSvg}</div></div>`;
  },

  // ================================
  // AIRLINE ROUTES (step 2: strategic location)
  // ================================

  generateBezierPoints(p0, p1, p2, numPoints) {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat =
        (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
      const lng =
        (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
      points.push([lng, lat]); // Mapbox [lng, lat] format
    }
    return points;
  },

  async showAirlineRoutes() {
    const routes = AppData.airlineRoutes;
    const origin = routes.origin.coords;
    const activeRoutes = routes.destinations.filter(
      (d) => d.status === "active",
    );
    const suspendedRoutes = routes.destinations.filter(
      (d) => d.status === "suspended",
    );

    this.hideAirlineRoutes();

    // 1. Origin marker (placed immediately, visible as camera arrives)
    const originHtml = `<div style="display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;">
            <div style="width: 10px; height: 10px; background: ${MAP_COLORS.primary}; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); flex-shrink: 0;"></div>
            <span style="font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--color-text-primary); text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;">Kumamoto</span>
        </div>`;
    const { marker: originMarker } = this._createMarker(origin, originHtml, {
      className: "airport-origin-marker",
      anchor: "left",
    });
    this.airlineOriginMarker = originMarker;

    // 1b. TSMC HQ marker at Hsinchu, Taiwan (appears immediately with origin)
    const tsmcHqCoords = [24.8, 120.97];
    const tsmcHqHtml = `<div style="display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer;">
            <div style="width: 48px; height: 48px; background: #ffffff; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="assets/tsmc-logo.svg" alt="TSMC" style="width: 36px; height: 36px; object-fit: contain;" />
            </div>
            <span style="font-family: var(--font-display); font-size: 11px; font-weight: 600; color: var(--color-text-primary); text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white; white-space: nowrap;">Hsinchu</span>
        </div>`;
    const { marker: tsmcHqMarker } = this._createMarker(
      tsmcHqCoords,
      tsmcHqHtml,
      {
        className: "tsmc-hq-marker",
        ariaLabel: "TSMC headquarters, Hsinchu, Taiwan",
      },
    );
    this.tsmcHqMarker = tsmcHqMarker;

    // Camera fly is handled by goToStep() - no redundant flyToStep here.
    // Routes draw immediately as camera is arriving.

    // 2. Draw active routes sequentially with staggered reveal
    for (let i = 0; i < activeRoutes.length; i++) {
      await this._delay(150);
      const dest = activeRoutes[i];
      this._addAnimatedArcLine(
        origin,
        dest.coords,
        dest.status,
        dest.semiconductorLink,
        i,
      );
    }

    // 3. Destination markers for active routes
    //    Skip TSMC destinations - the TSMC HQ logo marker already covers them.
    await this._delay(100);
    activeRoutes.forEach((dest) => {
      if (dest.semiconductorLink?.company === "TSMC") return;
      const marker = dest.semiconductorLink
        ? this._createBrandedDestinationMarker(dest)
        : this._createDestinationMarker(dest);
      this.airlineDestinationMarkers.push(marker);
    });

    // 4. Suspended routes last, dimmer
    if (suspendedRoutes.length > 0) {
      await this._delay(200);
      for (let i = 0; i < suspendedRoutes.length; i++) {
        const dest = suspendedRoutes[i];
        const idx = activeRoutes.length + i;
        this._addArcLine(
          origin,
          dest.coords,
          dest.status,
          dest.semiconductorLink,
          idx,
        );
        const marker = this._createDestinationMarker(dest);
        this.airlineDestinationMarkers.push(marker);
      }
    }
  },

  _addArcLine(origin, destination, status, semiLink, index) {
    const midLat = (origin[0] + destination[0]) / 2;
    const midLng = (origin[1] + destination[1]) / 2;

    // Calculate arc height
    const dLat = destination[0] - origin[0];
    const dLng = destination[1] - origin[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    const arcHeight = Math.max(0.3, Math.min(2.0, distance * 0.15));

    const arcMid = [midLat + arcHeight, midLng];
    const points = this.generateBezierPoints(origin, arcMid, destination, 50);

    let routeColor = "#c0766e";
    let weight = 1.5;
    if (semiLink) {
      const brandColors = { TSMC: "#c4001a", Samsung: "#1428a0" };
      routeColor = brandColors[semiLink.company] || routeColor;
      weight = 2.5;
    }
    const opacity = status === "suspended" ? 0.4 : 0.7;

    const sourceId = `airline-route-${index}`;
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
        "line-color": routeColor,
        "line-width": weight,
        "line-opacity": opacity,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    this._layerGroups.airlineRoutes.push(`${sourceId}-line`, sourceId);
  },

  /**
   * Add an arc line with animated progressive reveal.
   * Draws the line from origin outward to destination over ~600ms.
   */
  _addAnimatedArcLine(origin, destination, status, semiLink, index) {
    const midLat = (origin[0] + destination[0]) / 2;
    const midLng = (origin[1] + destination[1]) / 2;

    const dLat = destination[0] - origin[0];
    const dLng = destination[1] - origin[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    const arcHeight = Math.max(0.3, Math.min(2.0, distance * 0.15));

    const arcMid = [midLat + arcHeight, midLng];
    const allPoints = this.generateBezierPoints(
      origin,
      arcMid,
      destination,
      50,
    );

    let routeColor = "#c0766e";
    let weight = 1.5;
    if (semiLink) {
      const brandColors = { TSMC: "#c4001a", Samsung: "#1428a0" };
      routeColor = brandColors[semiLink.company] || routeColor;
      weight = 2.5;
    }
    const opacity = status === "suspended" ? 0.4 : 0.7;

    const sourceId = `airline-route-${index}`;

    // Start with just the first two points (origin)
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
        "line-color": routeColor,
        "line-width": weight,
        "line-opacity": opacity,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    this._layerGroups.airlineRoutes.push(`${sourceId}-line`, sourceId);

    // Progressively extend the line to simulate drawing outward
    const totalSteps = 12;
    const stepInterval = 50; // ~600ms total
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

  _createDestinationMarker(destination) {
    const dotColor = "#c0766e";
    const cityName = destination.name.replace(
      / (International|Airport|Gimhae|Pudong|Taoyuan)$/i,
      "",
    );

    const html = `<div style="display: flex; align-items: center; gap: var(--space-1); white-space: nowrap; cursor: pointer;">
            <div style="width: 8px; height: 8px; background: ${dotColor}; border-radius: 50%; flex-shrink: 0;"></div>
            <span style="font-family: var(--font-display); font-size: 12px; font-weight: 500; color: var(--color-text-primary); text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white;">${cityName}</span>
        </div>`;

    const { marker, element } = this._createMarker(destination.coords, html, {
      className: "airport-destination-marker",
      anchor: "left",
    });
    element.addEventListener("click", () =>
      UI.showAirlineRoutePanel(destination),
    );
    return marker;
  },

  _createBrandedDestinationMarker(destination) {
    const link = destination.semiconductorLink;
    const brandColors = { TSMC: "#c4001a", Samsung: "#1428a0" };
    const brandLogos = { TSMC: "assets/tsmc-logo.svg" };
    const color = brandColors[link.company] || "#c0766e";
    const abbrev = link.company === "Samsung" ? "SS" : link.company;
    const cityName = destination.name.replace(
      / (International|Airport|Gimhae|Pudong|Taoyuan)$/i,
      "",
    );

    const logoSrc = brandLogos[link.company];
    const iconHtml = logoSrc
      ? `<div style="width: 36px; height: 36px; background: #ffffff; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                <img src="${logoSrc}" alt="${link.company}" style="width: 26px; height: 26px; object-fit: contain;" />
            </div>`
      : `<div style="width: 28px; height: 28px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="font-family: var(--font-display); font-size: 8px; font-weight: 800; color: white; letter-spacing: 0.3px;">${abbrev}</span>
            </div>`;

    const html = `<div style="display: flex; align-items: center; gap: var(--space-2); white-space: nowrap; cursor: pointer;">
            ${iconHtml}
            <div style="display: flex; flex-direction: column;">
                <span style="font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--color-text-primary); text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;">${cityName}</span>
                <span style="font-family: var(--font-display); font-size: 10px; font-weight: 500; color: ${color}; text-shadow: 0 0 3px white, 0 0 3px white;">${link.company} ${link.role}</span>
            </div>
        </div>`;

    const { marker, element } = this._createMarker(destination.coords, html, {
      className: "airport-destination-marker branded-destination",
      anchor: "left",
    });
    element.addEventListener("click", () =>
      UI.showAirlineRoutePanel(destination),
    );
    return marker;
  },

  hideAirlineRoutes() {
    // Remove line layers/sources
    this._layerGroups.airlineRoutes.forEach((id) => {
      this._safeRemoveLayer(id);
      this._safeRemoveSource(id);
    });
    this._layerGroups.airlineRoutes = [];

    // Remove TSMC HQ marker
    if (this.tsmcHqMarker) {
      const tsmcEl = this.tsmcHqMarker.getElement();
      this.tsmcHqMarker.remove();
      if (tsmcEl && tsmcEl.parentNode) {
        tsmcEl.remove();
      }
      this.tsmcHqMarker = null;
    }

    // Remove markers
    if (this.airlineOriginMarker) {
      const element = this.airlineOriginMarker.getElement();
      this.airlineOriginMarker.remove();
      if (element && element.parentNode) {
        element.remove();
      }
      this.airlineOriginMarker = null;
    }
    this.airlineDestinationMarkers.forEach((m) => {
      const element = m.getElement();
      m.remove();
      if (element && element.parentNode) {
        element.remove();
      }
    });
    this.airlineDestinationMarkers = [];
  },

  // ================================
  // DASHBOARD HELPERS
  // ================================

  showSinglePropertyMarker(property) {
    const html = this._markerIconHtml("property");
    const { marker, element } = this._createMarker(property.coords, html);
    this._addTooltip(marker, element, property.name);
    this.markers[property.id] = marker;
    this._layerGroups.properties.push(property.id);
  },

  showSingleCompanyMarker(company) {
    const html = this._brandedMarkerHtml(company.id);
    const { marker, element } = this._createMarker(company.coords, html);
    this._addTooltip(marker, element, company.name);
    this.markers[company.id] = marker;
    this._layerGroups.companies.push(company.id);
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

  // ================================
  // LAYER VISIBILITY
  // ================================

  ensureLayerMarkers(layerName) {
    const group = this._layerGroups[layerName];
    const hasMarkers =
      group && group.length > 0 && group.some((id) => this.markers[id]);

    if (hasMarkers) {
      // Markers exist, just re-add them to the map
      this.showLayer(layerName);
      return;
    }

    // Create markers on demand with bounce entrance
    if (layerName === "sciencePark") {
      // Create science park circle and marker
      this.showSciencePark();
      // Apply bounce entrance to any newly created markers in the group
      this._applyBounceToGroup("sciencePark");
    } else if (layerName === "companies") {
      // Create company markers with bounce instead of staggered ripple
      this._layerGroups.companies = [];
      AppData.companies.forEach((company, index) => {
        const html = this._brandedMarkerHtml(company.id);
        const { marker, element } = this._createMarker(company.coords, html, {
          entrance: "data-bounce",
          ariaLabel: company.name,
        });
        if (!marker || !element) return;

        // Stagger bounce entrance
        if (element.firstElementChild) {
          element.firstElementChild.style.animationDelay = `${index * 60}ms`;
        }

        const tooltipText =
          (company.stats && company.stats[0] && company.stats[0].value) ||
          company.name;
        this._addTooltip(marker, element, tooltipText);
        element.addEventListener("click", () =>
          UI.showCompanyDetailPanel(company),
        );

        this.markers[company.id] = marker;
        this._layerGroups.companies.push(company.id);
      });
    } else if (layerName === "resources" || layerName === "waterResources") {
      // Create water resource layer with bounce
      this.showWaterResourceLayer();
    } else if (layerName === "properties") {
      // Properties are managed by journey steps; just show existing
      this.showLayer(layerName);
      return;
    } else {
      // Unknown map layer, try showing existing
      this.showLayer(layerName);
      return;
    }

    // Fit bounds around the layer's markers
    this._fitBoundsForLayer(layerName);
  },

  _applyBounceToGroup(layerName) {
    const group = this._layerGroups[layerName];
    if (!group) return;
    group.forEach((id, index) => {
      const marker = this.markers[id];
      if (!marker) return;
      const el = marker.getElement();
      if (el && el.firstElementChild) {
        el.firstElementChild.classList.add("marker-data-bounce");
        el.firstElementChild.style.animationDelay = `${index * 60}ms`;
      }
    });
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

  /**
   * Fly to a location (simple API)
   */
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

  // ================================
  // IDLE HEARTBEAT — ambient life between interactions
  // ================================

  /**
   * Start the heartbeat system — camera drift + marker pulse
   * when user is idle for 5+ seconds.
   */
  startHeartbeat() {
    if (this.reducedMotion || !this.initialized || !this.map) return;
    this._heartbeat.active = true;
    this._resetIdleTimer();

    // Listen for user interaction to pause drift
    if (!this._heartbeat._boundReset) {
      this._heartbeat._boundReset = () => this._resetIdleTimer();
      this.map.on("mousedown", this._heartbeat._boundReset);
      this.map.on("touchstart", this._heartbeat._boundReset);
      this.map.on("wheel", this._heartbeat._boundReset);
    }
  },

  /**
   * Stop the heartbeat system entirely.
   */
  stopHeartbeat() {
    this._heartbeat.active = false;
    this._stopDrift();
    this.clearMarkerPulse();
    clearTimeout(this._heartbeat.idleTimeout);
    this._heartbeat.idleTimeout = null;
  },

  /**
   * Pause drift during programmatic camera movements.
   * Called by flyToStep.
   */
  pauseHeartbeat() {
    this._stopDrift();
    clearTimeout(this._heartbeat.idleTimeout);
    this._heartbeat.idleTimeout = null;
  },

  /**
   * Reset the idle timer — starts drift after threshold.
   */
  _resetIdleTimer() {
    if (!this._heartbeat.active) return;
    this._stopDrift();
    clearTimeout(this._heartbeat.idleTimeout);
    this._heartbeat.idleTimeout = setTimeout(() => {
      this._startDrift();
    }, this._heartbeat.idleThreshold);
  },

  /**
   * Start slow bearing drift.
   */
  _startDrift() {
    if (!this._heartbeat.active || !this.map || this._heartbeat.driftInterval)
      return;
    this._heartbeat.driftInterval = setInterval(() => {
      if (!this.map) return;
      const current = this.map.getBearing();
      this.map.setBearing(current + this._heartbeat.bearingPerTick);
    }, this._heartbeat.tickMs);
  },

  /**
   * Stop the drift interval.
   */
  _stopDrift() {
    if (this._heartbeat.driftInterval) {
      clearInterval(this._heartbeat.driftInterval);
      this._heartbeat.driftInterval = null;
    }
  },

  /**
   * Apply pulse animation to all markers in a layer group.
   * @param {string} groupName — Key in this._layerGroups
   */
  setActiveMarkerPulse(groupName) {
    if (this.reducedMotion) return;
    this.clearMarkerPulse();
    const ids = this._layerGroups[groupName] || [];
    ids.forEach((id) => {
      const marker = this.markers[id];
      if (marker) {
        const el = marker.getElement();
        if (el) {
          el.classList.add("marker-pulse");
          this._heartbeat.pulsingMarkers.push(el);
        }
      }
    });
  },

  /**
   * Remove pulse from all pulsing markers.
   */
  clearMarkerPulse() {
    this._heartbeat.pulsingMarkers.forEach((el) => {
      el.classList.remove("marker-pulse");
    });
    this._heartbeat.pulsingMarkers = [];
  },

  // ================================
  // MARKER EXIT CHOREOGRAPHY
  // ================================

  /**
   * Fade out an array of Mapbox HTML markers before removing them.
   * Applies the .marker-exiting CSS class (200ms accelerate fade),
   * waits for the animation, then removes the markers from the map.
   * @param {Array} markers — Array of mapboxgl.Marker instances
   */
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

  /**
   * Fade out all HTML markers tracked in a _layerGroups entry.
   * @param {string} groupName — Key in this._layerGroups
   */
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

  // ================================
  // CLEAR / RESET / DESTROY
  // ================================

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

  /**
   * Preload property images
   */
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

  /**
   * Reset state for app restart
   */
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

  // ================================
  // PRIVATE HELPERS
  // ================================

  /**
   * Convert [lat, lng] to [lng, lat] for Mapbox
   */
  _toMapbox(coords) {
    return [coords[1], coords[0]];
  },

  /**
   * Enable map interaction after cinematic entry
   */
  _enableInteraction() {
    const map = this.map;
    map.scrollZoom.enable();
    map.boxZoom.enable();
    map.dragPan.enable();
    map.dragRotate.enable();
    map.keyboard.enable();
    map.touchZoomRotate.enable();
  },

  /**
   * Calculate bearing between two points
   */
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

  /**
   * Wait for moveend with timeout
   */
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

  /**
   * Add 3D building extrusion layer
   */
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

  /**
   * Set 3D building extrusion opacity (for dramatic reveal)
   * @param {number} opacity — 0 to 1
   */
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

  /**
   * Generate a circle polygon from center + radius
   * @param {Array} center — [lng, lat]
   * @param {number} radiusMeters
   * @returns {Object} GeoJSON Polygon
   */
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

  /**
   * Safely add a source (remove existing first)
   */
  _safeAddSource(id, sourceSpec) {
    this._safeRemoveSource(id);
    this.map.addSource(id, sourceSpec);
  },

  /**
   * Safely remove a layer
   */
  _safeRemoveLayer(id) {
    try {
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id);
      }
    } catch (e) {
      /* layer may not exist */
    }
  },

  /**
   * Safely remove a source (and its layers)
   */
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

  /**
   * Remove all markers and layers in a named group
   */
  _removeLayerGroup(groupName) {
    const group = this._layerGroups[groupName];
    if (!group) return;

    group.forEach((id) => {
      // Remove HTML marker AND its DOM element
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
      // Remove Mapbox layer
      this._safeRemoveLayer(id);
      // Remove Mapbox source (if it matches — layers and sources may share ID)
      this._safeRemoveSource(id);
    });

    this._layerGroups[groupName] = [];
  },

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  _frame() {
    return new Promise((resolve) => requestAnimationFrame(resolve));
  },

  // ================================
  // CAMERA DEBUG TOOL (dev only)
  // ================================

  _cameraDebug: {
    active: false,
    rafId: null,
  },

  /**
   * Initialize the camera debug tool. Call once after map init.
   */
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
