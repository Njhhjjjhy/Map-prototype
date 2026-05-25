/**
 * Main App - State Machine for Journey Progression
 */

import { STEPS, AppData } from "./data/index.js";
import { CAMERA_STEPS, MapController } from "./map/index.js";
import { UI } from "./ui/index.js";
import { stepHandlers } from "./step-handlers.js";
import {
  panelHeader,
  evidenceImage,
  proseBlock,
  imageBlock,
} from "./shared/templates.js";
import { t } from "./i18n/index.js";
import { buildCompactTabsHtml } from "./ui/inspector-tabs.js";
import { $id, $all } from "./shared/dom-scope.js";

/**
 * Shared timing constants - semantic names for setTimeout values.
 * CSS token equivalents noted in comments.
 */
const TIMING = {
  scene: 1500, // --duration-scene (journey transition hold — synced with CSS token)
  fast: 150, // --duration-fast
  normal: 250, // --duration-normal
  slow: 350, // --duration-slow
  flyDuration: 2000, // Mapbox flyTo milliseconds
  flyEase: 0.15, // Deprecated (kept for reference)
  revealDelay: 1200, // science park after gov chain
  buttonDelay: 2500, // continue button after markers
  infraStagger: 100, // infrastructure road stagger
  restartDelay: 500, // delay before restart

  // Narrative breathing room — rest pauses between beats
  breath: 600, // full pause: let a scene register before the next begins
  breathMedium: 400, // marker cluster → next content
  breathShort: 300, // quick pause: let an exit complete before a transition starts
};

const App = {
  _transitioning: false, // Lock to prevent concurrent step transitions

  state: {
    currentStep: 0, // 1-11, 0 = not started
    subItemsExplored: [], // Track which sub-items within current step have been viewed
    expandedGroups: [], // Track which parent sub-items are expanded
    activeParentGroup: null, // Currently selected/highlighted parent group in chatbox
    activeProperty: null, // Currently selected property ID (step 10)
    futureView: false, // Whether future toggle is active (step 8)
    evidenceGroupsViewed: [], // Track which evidence groups have been viewed
    activeEnergyTypes: [], // Track which energy types are toggled on (solar, wind, nuclear)
    activeGovernmentLevels: [], // Track which government levels are toggled on (central, prefectural, local)
    visitedGovernmentLevels: [], // Track which government levels have been viewed (persists across toggles)
    activeInvestmentZones: [], // Track which investment zones are toggled on (kikuyo-zone, ozu-zone, koshi-zone)
    activeUniversities: [], // Track which universities are toggled on (education step)
    activeEmployers: [], // Track which employers are toggled on (education step)
    qaMode: false, // Whether Q&A mode is active (post-journey exploration)
  },

  /**
   * Initialize the app - loads map directly, no start screen
   */
  async init() {
    UI.init();
    MapController.init();

    // Skip start screen entirely - show app container immediately
    UI.showAppDirect();

    // Wait for map to be ready. If init failed (bad token / timeout),
    // surface it to the onError hook so consumers can render a fallback
    // instead of silently sitting on an empty container.
    const mapOk = await MapController.waitReady();
    if (!mapOk && typeof this._onError === "function") {
      this._onError(new Error("Map failed to initialize"));
    }
    if (MapController.map) {
      MapController.map.resize();
    }

    // Enable interaction and show initial UI
    MapController._enableInteraction();
    MapController.startHeartbeat();
    MapController.initCameraDebug();

    // Show the three persistent UI elements
    UI.showLayersToggle();
    UI.showPanelToggle();

    // Populate data layers for the initial state
    UI.showDataLayers("initial");

    // Show nav arrows (step 0 = welcome, forward only)
    UI.showNavArrows(0, STEPS.length);

    /* Auto-advance to a configured start step. `mountMap` passes the
       resolved value via `App._startStep` (sourced from options.startStep
       or the legacy ?startStep= URL param). Used by the value-add-prototype
       slideshow to skip the welcome screen and land directly on a
       per-slide step. After the step's camera flight completes, fire
       the onReady hook and remove any setup cover the valueadd embed
       host placed (legacy bridge for non-package consumers). */
    try {
      const startStep = this._startStep;
      if (
        Number.isFinite(startStep) &&
        startStep >= 1 &&
        startStep <= STEPS.length
      ) {
        await this.goToStep(startStep);
      }
    } catch (_e) {}
    if (typeof this._onReady === "function") {
      this._onReady();
    }
    if (typeof window.__uncoverSetup === "function") {
      window.__uncoverSetup();
    }
  },

  /**
   * Core step navigation. Handles exit from current step,
   * camera flight, layer management, and content rendering.
   */
  async goToStep(stepIndex) {
    const step = STEPS[stepIndex - 1];
    if (!step) return;

    // Transition lock - prevent concurrent step transitions
    if (this._transitioning) return;
    this._transitioning = true;

    const prevStep = this.state.currentStep;

    // --- Exit choreography for previous step ---
    if (prevStep > 0) {
      await this._exitStep(prevStep);
    }

    // --- Update state ---
    this.state.currentStep = stepIndex;
    this.state.subItemsExplored = [];
    this.state.expandedGroups = [];
    this.state.activeProperty = null;
    this.state.activeParentGroup = null;
    this.state.activeEnergyTypes = [];
    this.state.activeGovernmentLevels = [];
    this.state.activeDevelopmentChildren = [];
    this.state.activeUniversities = [];
    this.state.activeEmployers = [];

    // Step 6: auto-select Science Park group on entry
    if (step.id === "transport-access") {
      this.state.activeParentGroup = "science-park-group";
      if (!this.state.subItemsExplored.includes("science-park-group")) {
        this.state.subItemsExplored.push("science-park-group");
      }
    }

    // --- Progress bar ---
    UI.updateJourneyProgress(stepIndex, STEPS.length);

    // --- Special pre-step cinematics ---
    if (stepIndex === 9 && prevStep > 0 && prevStep !== 9) {
      // Clear all map layers, markers, and labels so the map is clean on entry
      MapController.clearAll();
      await MapController.elevateToCorridorView();
      await new Promise((r) => setTimeout(r, TIMING.breath));
    }

    // --- Intro sequence: two-part camera move before Step 1 ---
    const isIntro = stepIndex === 1 && prevStep === 0;
    if (isIntro) {
      await MapController.flyToStep(CAMERA_STEPS.intro_close, {
        feeling: "dramatic",
      });
      await new Promise((r) => setTimeout(r, TIMING.breath));
      await MapController.flyToStep(CAMERA_STEPS.intro_wide, {
        feeling: "smooth",
      });
      await new Promise((r) => setTimeout(r, TIMING.breathShort));
    } else {
      // --- Standard camera flight ---
      const camKey = step.cameraKey;
      const camPos = CAMERA_STEPS[camKey] || CAMERA_STEPS.A0;
      await MapController.flyToStep(camPos);
    }

    // --- Breathing room ---
    await new Promise((r) => setTimeout(r, TIMING.breathShort));

    // --- Layer management (skip camera flights if intro just played) ---
    this._showStepLayers(step, { skipFly: isIntro });

    // --- Time toggle visibility ---
    if (step.showTimeToggle) {
      UI.showTimeToggle();
    } else {
      UI.hideTimeToggle();
    }

    // --- Render panel (auto-open) and nav arrows ---
    this._renderStepPanel(step);
    UI.showNavArrows(stepIndex, STEPS.length);

    // --- Data layers ---
    UI.showDataLayers(stepIndex);
    UI.syncDataLayersToStep(step);

    // --- Heartbeat + marker pulse ---
    MapController.startHeartbeat();
    this._applyStepPulse(step);

    // --- Accessibility ---
    UI.announceToScreenReader(`Step ${stepIndex}: ${step.title}`);

    this._transitioning = false;
  },

  /**
   * Advance to the next step. Called by "Continue" buttons.
   */
  nextStep() {
    const next = this.state.currentStep + 1;
    if (next <= STEPS.length) {
      this.goToStep(next);
    }
  },

  /**
   * Go back to the previous step. Step 1 returns to the welcome state (step 0).
   */
  async prevStep() {
    const current = this.state.currentStep;
    if (current <= 0) return;
    if (this._transitioning) return;

    if (current === 1) {
      // Return to welcome state (step 0)
      this._transitioning = true;
      await this._exitStep(1);
      this.state.currentStep = 0;
      this.state.subItemsExplored = [];
      this.state.expandedGroups = [];
      this.state.activeProperty = null;

      UI.updateJourneyProgress(0, STEPS.length);
      UI.showNavArrows(0, STEPS.length);

      MapController.startHeartbeat();
      this._transitioning = false;
    } else {
      this.goToStep(current - 1);
    }
  },

  /**
   * Exit choreography for a step.
   * Fades markers, hides UI, cleans up layers.
   */
  async _exitStep(stepIndex) {
    MapController.stopHeartbeat();

    const step = STEPS[stepIndex - 1];
    if (!step) return;

    // Fade out all visible markers from this step's layer groups
    const markersToFade = [];
    (step.layers || []).forEach((group) => {
      const ids = MapController._layerGroups[group] || [];
      ids.forEach((id) => {
        if (MapController.markers[id])
          markersToFade.push(MapController.markers[id]);
      });
    });

    // Also collect airline markers, infrastructure markers, talent markers
    if (MapController.airlineOriginMarker)
      markersToFade.push(MapController.airlineOriginMarker);
    markersToFade.push(...MapController.airlineDestinationMarkers);
    markersToFade.push(...MapController.infrastructureMarkers);

    if (markersToFade.length > 0) {
      await MapController.fadeOutMarkers(markersToFade);
    }

    // Reset drag positions before hiding UI
    $id("right-panel")?.resetDragPosition?.();

    // Hide UI
    UI.hidePanel();

    // Clean up all map elements for a fresh start
    MapController.clearAll();
    this._hideStepLayers(step);

    // Reset future view if active
    if (this.state.futureView) {
      UI.setTimeView("present");
      this.state.futureView = false;
      this.state.activeFutureLayers = [];
    }

    await new Promise((r) => setTimeout(r, TIMING.restartDelay));
  },

  /**
   * Show the map layers required for a step.
   */
  _showStepLayers(step, opts = {}) {
    // Clean up any existing layers for this step first (idempotent re-entry)
    this._hideStepLayers(step);

    const layers = step.layers || [];

    if (layers.includes("resources")) {
      MapController.showResourceMarker("water", { skipFly: opts.skipFly });
    }
    if (layers.includes("airlineRoutes")) {
      MapController.showAirlineRoutes();
    }
    if (layers.includes("governmentChain")) {
      if (step.id === "government-support") {
        // Reset and auto-activate central level (like solar for power resources)
        this.state.activeGovernmentLevels = ["central"];
        this.state.visitedGovernmentLevels = ["central"];
        MapController.showGovernmentLevel("central");
      } else {
        MapController.showGovernmentChain();
      }
    }
    if (layers.includes("sciencePark")) {
      MapController.showSciencePark({ skipFly: true });
    }
    if (layers.includes("futureZones")) {
      MapController.showFutureZones();
    }
    if (layers.includes("investmentZones") && step.id !== "properties") {
      MapController.showInvestmentZones();
    }
    if (layers.includes("companies")) {
      MapController.showCompanyMarkers();
    }
    if (layers.includes("semiconductorNetwork")) {
      setTimeout(
        () => {
          MapController.showSemiconductorNetwork();
        },
        AppData.companies.length * 80 + 200,
      );
    }
    if (layers.includes("infrastructureRoads")) {
      MapController.showInfrastructureRoads();
    }
    if (layers.includes("talentPipeline")) {
      MapController.showTalentPipeline();
      // Auto-select "universities" sub-item on entry
      if (!this.state.subItemsExplored.includes("universities")) {
        this.state.subItemsExplored.push("universities");
      }
    }
    // Properties step: markers shown on individual selection, not on entry
  },

  /**
   * Hide the map layers from a step (during exit).
   */
  _hideStepLayers(step) {
    const layers = step.layers || [];

    if (layers.includes("airlineRoutes")) MapController.hideAirlineRoutes();
    if (layers.includes("talentPipeline")) {
      MapController.hideTalentPipeline();
      MapController.hideEmploymentMarkers();
    }
    if (layers.includes("infrastructureRoads"))
      MapController.hideInfrastructureRoads();
    if (layers.includes("investmentZones")) MapController.hideInvestmentZones();
    if (layers.includes("semiconductorNetwork"))
      MapController.hideSemiconductorNetwork();
    if (layers.includes("resources")) {
      MapController.hideResourceArcs();
      MapController.hideKyushuEnergy();
      MapController.hideAllEnergyTypes();
      UI.deactivateDataLayer("electricity");
      UI.deactivateDataLayer("waterResources");
    }
    if (layers.includes("governmentChain")) {
      MapController.hideAllGovernmentLevels();
    }
    if (layers.includes("companies")) {
      MapController.fadeOutMarkerGroup("companies");
    }
    if (layers.includes("futureZones")) {
      MapController.hideFutureZones();
    }
    // Clean up zone plan highlights, airport marker, grand airport children (step 6)
    if (step.id === "transport-access") {
      MapController.hideZonePlanHighlight();
      MapController.hideAirportAccessRoutes();
      MapController.hideRailwayStations();
      MapController.hideRoadExtensions();
      MapController.hideTenTwentyConcept();
      MapController.setScienceParkCircleVisible(false);
      if (MapController.markers["airport"]) {
        MapController.markers["airport"].remove();
        delete MapController.markers["airport"];
      }
    }
    // Clean up future outlook layers on exit
    if (step.id === "future-outlook") {
      MapController._cleanupScienceParkTooltips();
      MapController._removeLayerGroup("sciencePark");
      MapController.hideAirportAccessRoutes();
      MapController.hideRailwayStations();
      MapController.hideZonePlanHighlight();
      MapController.hideRoadExtensions();
      MapController._hideFutureRoadOverlays();
      MapController.hideInfrastructureRoads();
      MapController.hideDataLayerMarkers("trafficFlow");
      UI.hideTimeToggle();
    }
    // Clean up property markers on exit
    if (step.id === "properties") {
      MapController.fadeOutMarkerGroup("properties");
    }
    // Clean up science park circle layers and markers
    if (layers.includes("sciencePark")) {
      MapController._cleanupScienceParkTooltips();
      MapController._removeLayerGroup("sciencePark");
    }
  },


  _renderStepPanel(step) {
    let hasPanel = true;
    switch (step.id) {
      case "strategic-location":
        UI.showAllAirlineRoutes();
        break;

      case "government-support":
        UI.showGovernmentPanel(this.state.activeGovernmentLevels);
        break;

      case "corporate-investment":
        UI.showInvestmentOverview();
        break;

      case "transport-access":
        this._renderDevelopmentDashboard();
        break;

      case "education-pipeline":
        this._handleEducationSubItem("universities");
        break;

      case "future-outlook":
        this._renderFutureOutlookDashboard();
        break;

      case "investment-zones":
        this._handleInvestmentZoneSubItem("central-city-zone");
        break;

      case "properties":
        // Step 10 surfaces only Ozu-1 as the investment property.
        this.state.activeInvestmentZones = ["ozu-zone"];
        MapController.showInvestmentZone("ozu-zone");
        UI.showInvestmentZonesPanel(this.state.activeInvestmentZones);
        break;

      default:
        // Steps with sub-items or no panel: panel shows on sub-item click
        hasPanel = false;
        break;
    }

    if (hasPanel) {
      // Store home function so the panel home button can reset to this view
      const stepRef = step;
      UI.setPanelHome(() => this._renderStepPanel(stepRef));
    } else {
      // For sub-item steps, enable content-based home capture.
      // The first showPanel call will be saved as home content.
      UI.clearPanelHome();
    }
  },

  // ================================
  // Evidence groups
  // ================================

  /**
   * Show evidence group panel from chatbox link.
   */

  /**
   * Restart the presentation from the beginning.
   */
  restart() {
    MapController.destroy();
    UI.hidePanel();
    UI.hideNavArrows();
    UI.hideLayersToggle();
    UI.hidePanelToggle();
    UI.hideTimeToggle();
    MapController.resetView();

    // Clean up stray overlays
    document
      .querySelectorAll(".moreharvest-entry")
      .forEach((el) => el.remove());
    $all(".mapboxgl-marker").forEach((el) => {
      if (el.parentNode) el.remove();
    });
    $all(".elevated-marker").forEach((el) => {
      if (el.parentNode) el.remove();
    });

    // Reset state
    this._transitioning = false;
    this.state.currentStep = 0;
    this.state.subItemsExplored = [];
    this.state.expandedGroups = [];
    this.state.activeProperty = null;
    this.state.futureView = false;
    UI.activeDataLayers = {};
    UI._dataLayerDashboardActive = false;

    setTimeout(() => {
      this.goToStep(1);
    }, TIMING.restartDelay);
  },
};

Object.assign(App, stepHandlers);

export { TIMING, App };
