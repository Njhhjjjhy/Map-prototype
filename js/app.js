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
  continueBtn,
  SVG_ARROW_RIGHT,
} from "./shared/templates.js";
import { t } from "./i18n/index.js";

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

    // Wait for map to be ready
    await MapController.waitReady();
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

    // Show chatbox with initial content
    UI.showChatbox(`
            <h3>${t("Kumamoto investment guide")}</h3>
            <p>${t("Explore the map and use the data layers to learn about investment opportunities in Kumamoto's semiconductor corridor.")}</p>
            ${continueBtn("App.goToStep(1)", t("Start Journey"), { arrow: true })}
        `);
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

    // --- Render chatbox and panel ---
    this._renderStepChatbox(step);
    this._renderStepPanel(step);

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

      // Restore initial welcome chatbox with Start Journey CTA
      UI.showChatbox(`
                <h3>${t("Kumamoto investment guide")}</h3>
                <p>${t("Explore the map and use the data layers to learn about investment opportunities in Kumamoto's semiconductor corridor.")}</p>
                ${continueBtn("App.goToStep(1)", t("Start Journey"), { arrow: true })}
            `);

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
    UI.saveChatboxToHistory();

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
    document.getElementById("chatbox")?.resetDragPosition?.();
    document.getElementById("right-panel")?.resetDragPosition?.();
    document.getElementById("ai-chat")?.resetDragPosition?.();

    // Hide UI sequentially for cleaner exit
    UI.hideChatbox();
    await new Promise((r) => setTimeout(r, TIMING.fast));
    UI.hidePanel();

    // Clean up step-specific map elements
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
    // Clean up zone plan highlights, airport marker, road highlights (step 6)
    if (step.id === "transport-access") {
      MapController.hideZonePlanHighlight();
      if (MapController.markers["airport"]) {
        MapController.markers["airport"].remove();
        delete MapController.markers["airport"];
      }
    }
    // Clean up property markers on exit
    if (step.id === "properties") {
      MapController.fadeOutMarkerGroup("properties");
    }
    // Clean up science park circle layers and markers
    if (layers.includes("sciencePark")) {
      MapController._removeLayerGroup("sciencePark");
    }
  },

  // ================================
  // Per-step chatbox content
  // ================================

  /**
   * Render chatbox content for a step.
   * Each step gets a title, narrative, optional sub-items, and Continue button.
   */
  _renderStepChatbox(step) {
    const chatboxContent = this._getStepChatboxContent(step);
    if (step.id === "final") {
      // Final step shows AI chat panel directly, skip the step chatbox
      UI.showQAMode();
      return;
    }
    UI.showChatbox(chatboxContent, { skipHistory: true });
  },

  /**
   * Generate chatbox HTML for a given step.
   */
  _getStepChatboxContent(step) {
    const subItemsHtml = this._renderSubItems(step);
    const continueBtnHtml =
      step.index < STEPS.length ? continueBtn("App.nextStep()") : "";

    // Step-specific narratives
    const narratives = {
      resources: {
        title: t("Resources"),
        body: t("Semiconductor fabs need <strong>10 million gallons of water daily</strong> and enough electricity to power a small city. Kumamoto has both in surplus."),
        afterItems: "",
      },
      "strategic-location": {
        title: t("Strategic location"),
        body: t("Seoul and Taipei are both just <strong>1 hour 40 minutes</strong> by direct flight from Kumamoto. Busan is 1h 25m. Every major semiconductor hub in Asia is under 3 hours away."),
        afterItems:
          t('<p style="color: var(--color-text-secondary); margin-top: var(--space-2);">Click destinations on the map to see route details.</p>'),
      },
      "government-support": {
        title: t("Government support"),
        body: t("<strong>4+ trillion yen</strong> from the national government. <strong>480 billion yen</strong> from Kumamoto Prefecture. Every level of government is aligned behind semiconductors."),
        afterItems:
          t('<p style="margin-top: var(--space-2);">Click tier markers to see commitment details.</p>'),
      },
      "corporate-investment": {
        title: t("Corporate investment"),
        body: t("TSMC committed <strong>2.16 trillion yen</strong> for two fabs. Sony, SUMCO, Kyocera, Rohm Apollo, Mitsubishi, Tokyo Electron all announced expansions. <strong>Seven major players</strong>, all converging on Kumamoto."),
        afterItems:
          t('<p style="margin-top: var(--space-2);">Click company markers to see investment scale.</p>'),
      },
      "transport-access": {
        title: t("Science park and grand airport"),
        body: t("Kumamoto Science Park anchors a semiconductor corridor backed by <strong>¥4.8 trillion</strong> in government investment. A new airport vision connects the corridor to Asia."),
        afterItems: "",
      },
      "education-pipeline": {
        title: t("Education and talent pipeline"),
        body: t("METI's Kyushu Semiconductor Human Resources Development Alliance coordinates <strong>five universities</strong> across the region, building a purpose-built talent pipeline."),
        afterItems: "",
      },
      "future-outlook": {
        title: t("Future outlook"),
        body: t("See the 2030+ completed state: science park expansion, grand airport, road completions, and new stations."),
        afterItems: "",
      },
      "investment-zones": {
        title: t("Investment zones"),
        body: t("Three zones in the silicon triangle, each with a distinct role in the semiconductor ecosystem."),
        afterItems: "",
      },
      properties: {
        title: t("Investment properties"),
        body: t("{{count}} properties in the semiconductor corridor. Average <strong>12-minute drive</strong> to JASM. Click any amber marker to see the full financial picture.", { count: AppData.properties.length }),
        afterItems: "",
      },
      final: {
        title: t("Journey complete"),
        body: "",
        afterItems: "",
      },
    };

    const n = narratives[step.id] || {
      title: step.title,
      body: "",
      afterItems: "",
    };

    // Step 12 (final) gets special recap content
    if (step.id === "final") {
      return this._renderFinalChatbox();
    }

    // Step 4 (government-support) gets toggle rows instead of sub-items
    if (step.id === "government-support") {
      return this._renderGovernmentChatbox(n, continueBtnHtml);
    }

    // Step 7 (future-outlook) gets a "See the Future" CTA only
    if (step.id === "future-outlook") {
      return `
        <h3>${n.title}</h3>
        <p>${n.body}</p>
        <div class="chatbox-options">
          <button class="chatbox-continue primary" onclick="UI.setTimeView('future')">${t("See the Future")}</button>
        </div>
      `;
    }

    const navRow = continueBtnHtml
      ? `<div class="chatbox-nav-row">${continueBtnHtml}</div>`
      : "";

    return `
            <h3>${n.title}</h3>
            <p>${n.body}</p>
            ${subItemsHtml}
            ${n.afterItems}
            ${navRow}
        `;
  },

  /**
   * Render clickable sub-items for a step.
   * Supports nested children via `children` array on parent items.
   */
  _renderSubItems(step) {
    if (!step.subItems || step.subItems.length === 0) return "";

    // Collect all leaf items for counting (children count, not parents)
    const leafItems = [];
    step.subItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => leafItems.push(child));
      } else {
        leafItems.push(item);
      }
    });

    const items = step.subItems
      .map((item) => {
        const explored = this.state.subItemsExplored.includes(item.id);
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
          const isSelected =
            this.state.activeParentGroup === item.id ||
            this.state.subItemsExplored.includes(item.id);
          const checkmark = isSelected
            ? `<svg class="chatbox-option-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            : "";

          // Children rendered as toggle rows in the dashboard panel
          return `<button class="chatbox-option chatbox-option-parent ${isSelected ? "selected" : ""}"
                            onclick="App.toggleSubItemGroup('${item.id}')">
                        ${item.label}
                        ${checkmark}
                    </button>`;
        }

        const iconSvg =
          item.icon === "house"
            ? `<svg class="chatbox-option-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`
            : "";
        const checkmark = explored
          ? `<svg class="chatbox-option-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
          : "";

        return `<button class="chatbox-option ${explored ? "completed" : ""}"
                        onclick="App.selectSubItem('${item.id}')"
                        ${explored ? 'aria-disabled="true"' : ""}>
                    ${iconSvg}
                    <span class="chatbox-option-label">${item.label}</span>
                    ${checkmark}
                    ${explored ? '<span class="sr-only"> (explored)</span>' : ""}
                </button>`;
      })
      .join("");

    return `
            <div class="chatbox-options" role="group" aria-label="Step options">
                ${items}
            </div>
        `;
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
        UI.showUniversitiesPanel(this.state.activeUniversities);
        break;

      case "future-outlook":
        this._renderFutureOutlookDashboard();
        break;

      case "investment-zones":
        UI.showPanel(`
                    ${panelHeader("Silicon triangle", "Investment opportunity zones", "Three zones with distinct roles in the semiconductor ecosystem. Click a zone to see details.")}
                    ${evidenceImage("assets/use-case-images/evidence-tsmc-infrastructure-overview.webp", "TSMC infrastructure overview")}
                `);
        break;

      case "properties":
        // Initialize with Kikuyo zone active by default
        this.state.activeInvestmentZones = [];
        this.state.activeInvestmentZones.push("kikuyo-zone");
        MapController.showInvestmentZone("kikuyo-zone");
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
  restoreChatbox() {
    const step = STEPS[this.state.currentStep - 1];
    if (step) {
      const content = this._getStepChatboxContent(step);
      UI.showChatbox(content);
    } else {
      UI.showChatbox(`
                <h3>${t("Kumamoto investment guide")}</h3>
                <p>${t("Explore the map and use the data layers to learn about investment opportunities in Kumamoto's semiconductor corridor.")}</p>
                ${continueBtn("App.goToStep(1)", t("Start Journey"), { arrow: true })}
            `);
    }
  },

  /**
   * Restart the presentation from the beginning.
   */
  restart() {
    MapController.destroy();
    UI.hidePanel();
    UI.hideChatbox();
    UI.hideAIChat();
    UI.hideLayersToggle();
    UI.hidePanelToggle();
    UI.hideTimeToggle();
    MapController.resetView();

    // Clean up stray overlays
    document
      .querySelectorAll(".moreharvest-entry")
      .forEach((el) => el.remove());
    document.querySelectorAll(".mapboxgl-marker").forEach((el) => {
      if (el.parentNode) el.remove();
    });
    document.querySelectorAll(".elevated-marker").forEach((el) => {
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
