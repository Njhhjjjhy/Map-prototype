/**
 * Main App - State Machine for Journey Progression
 */

import { STEPS, AppData } from "./data/index.js";
import { CAMERA_STEPS, MapController } from "./map/index.js";
import { UI } from "./ui.js";

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
            <h3>Kumamoto investment guide</h3>
            <p>Explore the map and use the data layers to learn about investment opportunities in Kumamoto's semiconductor corridor.</p>
            <button class="chatbox-continue primary" onclick="App.goToStep(1)">Start Journey <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
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
      await UI.showMoreHarvestEntry();
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
                <h3>Kumamoto investment guide</h3>
                <p>Explore the map and use the data layers to learn about investment opportunities in Kumamoto's semiconductor corridor.</p>
                <button class="chatbox-continue primary" onclick="App.goToStep(1)">Start Journey <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
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
    await new Promise((r) => setTimeout(r, 100));
    UI.hidePanel();

    // Clean up step-specific map elements
    this._hideStepLayers(step);

    // Reset future view if active
    if (this.state.futureView) {
      UI.setTimeView("present");
      this.state.futureView = false;
    }

    await new Promise((r) => setTimeout(r, 500));
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
    }
    // Properties step: markers shown on individual selection, not on entry
  },

  /**
   * Hide the map layers from a step (during exit).
   */
  _hideStepLayers(step) {
    const layers = step.layers || [];

    if (layers.includes("airlineRoutes")) MapController.hideAirlineRoutes();
    if (layers.includes("talentPipeline")) MapController.hideTalentPipeline();
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
    UI.showChatbox(chatboxContent, { skipHistory: true });
  },

  /**
   * Generate chatbox HTML for a given step.
   */
  _getStepChatboxContent(step) {
    const subItemsHtml = this._renderSubItems(step);
    const continueBtn =
      step.index < STEPS.length
        ? `<button class="chatbox-continue primary" onclick="App.nextStep()">Continue</button>`
        : "";

    // Step-specific narratives
    const narratives = {
      resources: {
        title: "Resources",
        body: "Semiconductor fabs need <strong>10 million gallons of water daily</strong> and enough electricity to power a small city. Kumamoto has both in surplus.",
        afterItems: "",
      },
      "strategic-location": {
        title: "Strategic location",
        body: "Seoul and Taipei are both just <strong>1 hour 40 minutes</strong> by direct flight from Kumamoto. Busan is 1h 25m. Every major semiconductor hub in Asia is under 3 hours away.",
        afterItems:
          '<p style="color: var(--color-text-secondary); margin-top: var(--space-2);">Click destinations on the map to see route details.</p>',
      },
      "government-support": {
        title: "Government support",
        body: "<strong>4+ trillion yen</strong> from the national government. <strong>480 billion yen</strong> from Kumamoto Prefecture. Every level of government is aligned behind semiconductors.",
        afterItems:
          '<p style="margin-top: var(--space-2);">Click tier markers to see commitment details.</p>',
      },
      "corporate-investment": {
        title: "Corporate investment",
        body: "TSMC committed <strong>2.16 trillion yen</strong> for two fabs. Sony, SUMCO, Kyocera, Rohm Apollo, Mitsubishi, Tokyo Electron all announced expansions. <strong>Seven major players</strong>, all converging on Kumamoto.",
        afterItems:
          '<p style="margin-top: var(--space-2);">Click company markers to see investment scale.</p>',
      },
      "transport-access": {
        title: "Science park and grand airport",
        body: "Kumamoto Science Park anchors a semiconductor corridor backed by <strong>¥4.8 trillion</strong> in government investment. A new airport vision connects the corridor to Asia.",
        afterItems: "",
      },
      "education-pipeline": {
        title: "Education pipeline",
        body: "METI's Kyushu Semiconductor Human Resources Development Alliance coordinates <strong>five universities</strong> across the region, building a purpose-built talent pipeline.",
        afterItems: "",
      },
      "future-outlook": {
        title: "Future outlook",
        body: "Toggle to <strong>Future View</strong> to see the 2030+ completed state: science park expansion, grand airport, road completions, and new stations.",
        afterItems:
          '<p style="margin-top: var(--space-4); font-size: var(--text-sm); color: var(--color-text-tertiary);">Use the Present/Future toggle in the top-left corner.</p>',
      },
      "investment-zones": {
        title: "Investment zones",
        body: "Three zones in the silicon triangle, each with a distinct role in the semiconductor ecosystem.",
        afterItems: "",
      },
      properties: {
        title: "Investment properties",
        body: `${AppData.properties.length} properties in the semiconductor corridor. Average <strong>12-minute drive</strong> to JASM. Click any amber marker to see the full financial picture.`,
        afterItems: "",
      },
      final: {
        title: "Journey complete",
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
      return this._renderGovernmentChatbox(n, continueBtn);
    }

    // Step 10 (properties) gets fund stats
    let fundStats = "";
    if (step.id === "properties") {
      const gktk = AppData.gktk;
      if (gktk) {
        const irrValue = gktk.stats[3].value;
        const aumValue = gktk.fundSize;
        const holdValue = gktk.stats[2].value;
        fundStats = `
                    <div class="chatbox-fund-stats">
                        <div class="chatbox-fund-label">GKTK Fund &middot; ${irrValue} Target IRR</div>
                        <div class="chatbox-fund-detail">${aumValue} Target AUM &middot; ${holdValue} Hold</div>
                    </div>
                `;
      }
    }

    const navRow = continueBtn
      ? `<div class="chatbox-nav-row">${continueBtn}</div>`
      : "";

    return `
            <h3>${n.title}</h3>
            <p>${n.body}</p>
            ${fundStats}
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

  /**
   * Toggle expansion of a parent sub-item group.
   */
  toggleSubItemGroup(groupId) {
    const idx = this.state.expandedGroups.indexOf(groupId);
    if (idx >= 0) {
      this.state.expandedGroups.splice(idx, 1);
    } else {
      this.state.expandedGroups.push(groupId);
    }

    // Track active parent group and update dashboard
    const step = STEPS[this.state.currentStep - 1];
    if (step && step.id === "transport-access") {
      const prevGroup = this.state.activeParentGroup;
      this.state.activeParentGroup = groupId;

      // Mark group as explored so it stays visually selected
      if (!this.state.subItemsExplored.includes(groupId)) {
        this.state.subItemsExplored.push(groupId);
      }

      // Clean up map elements and reset children when parent group changes
      if (prevGroup !== groupId) {
        this._cleanupDevelopmentMapElements();
        this.state.activeDevelopmentChildren = [];

        // Toggle science park circle and camera based on selected group
        if (groupId === "grand-airport-group") {
          MapController.setScienceParkCircleVisible(false);
          MapController.flyToStep({
            center: [130.9384, 32.8342],
            zoom: 11.8,
            pitch: 50,
            bearing: 22,
            duration: 2000,
          });
        } else if (groupId === "science-park-group") {
          MapController.setScienceParkCircleVisible(true);
        }
      }

      this._renderDevelopmentDashboard();
    }

    // Re-render chatbox to reflect expanded state
    if (step) this._renderStepChatbox(step);
  },

  /**
   * Handle sub-item selection within a step.
   */
  selectSubItem(itemId) {
    if (!this.state.subItemsExplored.includes(itemId)) {
      this.state.subItemsExplored.push(itemId);
    }
    // Dispatch to step-specific handler
    this._handleSubItem(this.state.currentStep, itemId);
    // Refresh chatbox to show updated explored state
    const step = STEPS[this.state.currentStep - 1];
    if (step) this._renderStepChatbox(step);
  },

  /**
   * Handle a sub-item click for a specific step.
   * Routes to the correct map and panel behavior.
   */
  _handleSubItem(stepIndex, itemId) {
    switch (stepIndex) {
      case 1: // Resources
        this._handleResourceSubItem(itemId);
        break;
      case 3: // Government support
        this._handleGovernmentSubItem(itemId);
        break;
      case 5: // Transport access
        this._handleTransportSubItem(itemId);
        break;
      case 6: // Education pipeline
        this._handleEducationSubItem(itemId);
        break;
      case 8: // Investment zones
        this._handleInvestmentZoneSubItem(itemId);
        break;
      case 9: // Properties
        this._handlePropertySubItem(itemId);
        break;
    }
  },

  // --- Step 1: Resources ---
  _handleResourceSubItem(itemId) {
    if (itemId === "water") {
      // Clean up power/energy layers if switching from power
      MapController.hideAllEnergyTypes();
      MapController.hideKyushuEnergy();
      UI.deactivateDataLayer("electricity");

      MapController.showResourceMarker("water");
      const resource = AppData.resources.water;
      if (resource) UI.showResourcePanel(resource);
      MapController.flyToStep(CAMERA_STEPS.A2_water);

      // Auto-activate the Water resources data layer checkbox
      UI.activateDataLayer("waterResources");
    } else if (itemId === "power") {
      // Hide water markers and overlays before showing power
      this._hideWaterLayers();
      UI.deactivateDataLayer("waterResources");
      // Reset active energy types for fresh entry
      this.state.activeEnergyTypes = [];
      // Fly to power resources overview
      MapController.flyToStep(CAMERA_STEPS.A2_power);
      // Auto-activate solar: show markers + arc lines on the map
      this.state.activeEnergyTypes.push("solar");
      MapController.showEnergyType("solar");
      // Show power sources panel with solar already toggled on
      UI.showPowerSourcesPanel(this.state.activeEnergyTypes);

      // Auto-activate the Power data layer checkbox
      UI.activateDataLayer("electricity");
    }
  },

  /**
   * Hide water-specific markers, overlays, arcs, and uncheck the data layer.
   */
  _hideWaterLayers() {
    // Remove water marker and evidence markers from the map
    const resourceIds = [...(MapController._layerGroups.resources || [])];
    resourceIds.forEach((id) => {
      if (MapController.markers[id]) {
        const el = MapController.markers[id].getElement();
        MapController.markers[id].remove();
        if (el && el.parentNode) el.remove();
        delete MapController.markers[id];
      }
    });
    MapController._layerGroups.resources = [];

    // Safety net: remove any orphaned water evidence markers from the DOM
    document
      .querySelectorAll(".water-evidence-marker, .water-brand-marker")
      .forEach((el) => {
        if (el.parentNode) el.remove();
      });

    // Remove water area overlay and brand logos
    MapController.hideWaterResourceLayer();

    // Remove resource arc lines (water to JASM)
    MapController.hideResourceArcs();

    // Uncheck the Water resources data layer checkbox
    UI.deactivateDataLayer("waterResources");
  },

  /**
   * Toggle an energy type on/off (multi-select).
   * Called from the power sources panel toggles.
   */
  toggleEnergyType(type) {
    const idx = this.state.activeEnergyTypes.indexOf(type);
    if (idx >= 0) {
      // Turn off
      this.state.activeEnergyTypes.splice(idx, 1);
      MapController.hideEnergyType(type);
    } else {
      // Turn on
      this.state.activeEnergyTypes.push(type);
      MapController.showEnergyType(type);
    }
    // Re-render the panel to reflect toggle state
    UI.updatePowerSourcesPanel(this.state.activeEnergyTypes);
  },

  /**
   * Toggle an investment zone on/off (multi-select).
   * Called from the investment zones panel toggles.
   */
  toggleInvestmentZone(zoneId) {
    const idx = this.state.activeInvestmentZones.indexOf(zoneId);
    if (idx >= 0) {
      this.state.activeInvestmentZones.splice(idx, 1);
      MapController.hideInvestmentZone(zoneId);
    } else {
      this.state.activeInvestmentZones.push(zoneId);
      MapController.showInvestmentZone(zoneId);
    }
    UI.updateInvestmentZonesPanel(this.state.activeInvestmentZones);
  },

  /**
   * Toggle a government level (single-select).
   * Selecting a new level deselects the previous one.
   * Called from the chatbox toggle rows.
   */
  toggleGovernmentLevel(level) {
    const idx = this.state.activeGovernmentLevels.indexOf(level);
    if (idx >= 0) {
      // Turn off the currently active level
      this.state.activeGovernmentLevels.splice(idx, 1);
      MapController.hideGovernmentLevel(level);
    } else {
      // Single-select: hide all other levels first
      const previous = [...this.state.activeGovernmentLevels];
      previous.forEach((prev) => {
        MapController.hideGovernmentLevel(prev);
      });
      this.state.activeGovernmentLevels = [level];
      MapController.showGovernmentLevel(level);

      // Track as visited so chatbox keeps showing it as completed
      if (!this.state.visitedGovernmentLevels.includes(level)) {
        this.state.visitedGovernmentLevels.push(level);
      }

      // Fly to the appropriate camera position for this level
      this._flyToGovernmentLevel(level);
    }
    // Re-render panel and chatbox to reflect toggle state
    UI.updateGovernmentPanel(this.state.activeGovernmentLevels);
    const step = STEPS[this.state.currentStep - 1];
    if (step) this._renderStepChatbox(step);
  },

  /**
   * Fly the camera to the appropriate position for a government level.
   * @param {string} level - 'central' | 'prefectural' | 'local'
   */
  _flyToGovernmentLevel(level) {
    const cameras = {
      central: CAMERA_STEPS.A4_government,
      prefectural: {
        center: [131.9774, 32.3468],
        zoom: 7.9,
        pitch: 49,
        bearing: 21,
        duration: 3000,
      },
      local: {
        center: [130.9998, 32.8093],
        zoom: 10.7,
        pitch: 52,
        bearing: 19,
        duration: 3000,
      },
    };
    const cam = cameras[level];
    if (cam) {
      MapController.flyToStep(cam);
    }
  },

  /**
   * Render chatbox content for the government-support step.
   * Uses chatbox-option buttons (matching water/power resources look) with toggle behavior.
   */
  _renderGovernmentChatbox(narrative, continueBtn) {
    const tiers = AppData.governmentTiers || [];
    const visitedLevels = this.state.visitedGovernmentLevels;

    const items = tiers
      .map((tier) => {
        const isVisited = visitedLevels.includes(tier.id);
        return `<button class="chatbox-option${isVisited ? " completed" : ""}"
                        onclick="App.toggleGovernmentLevel('${tier.id}')"
                        aria-pressed="${isVisited}">
                    ${tier.tier}${isVisited ? '<span class="sr-only"> (active)</span>' : ""}
                </button>`;
      })
      .join("");

    const navRow = continueBtn
      ? `<div class="chatbox-nav-row">${continueBtn}</div>`
      : "";

    return `
            <h3>${narrative.title}</h3>
            <p>${narrative.body}</p>
            <div class="chatbox-options" role="group" aria-label="Government levels">
                ${items}
            </div>
            ${narrative.afterItems}
            ${navRow}
        `;
  },

  // --- Step 3: Government ---
  _handleGovernmentSubItem(itemId) {
    // Redirect to toggle for the new toggle-based pattern
    this.toggleGovernmentLevel(itemId);
  },

  // --- Step 5: Science Park + Grand Airport ---

  /**
   * Build and display the development dashboard panel.
   * Shows parent overview + toggle rows for children + evidence for active child.
   * Called when a parent group is selected or a child is toggled.
   */
  _renderDevelopmentDashboard() {
    const group = this.state.activeParentGroup;
    const activeChildren = this.state.activeDevelopmentChildren;

    if (group === "science-park-group") {
      const sp = AppData.sciencePark;
      const zones = AppData.scienceParkZonePlans || [];

      const zoneIcons = {
        "sp-gov-zone":
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        "sp-kikuyo-plan":
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>',
        "sp-ozu-plan":
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect x="6" y="10" width="12" height="12"/></svg>',
      };

      const rowsHtml = zones
        .map((z) => {
          const isActive = activeChildren.includes(z.id);
          const icon =
            zoneIcons[z.id] ||
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>';
          return `
            <button class="energy-toggle-row${isActive ? " active" : ""}"
                    onclick="App.toggleDevelopmentChild('${z.id}')"
                    aria-pressed="${isActive}">
                <span class="energy-toggle-icon" style="color: ${z.strokeColor};">${icon}</span>
                <span class="energy-toggle-label">${z.name}</span>
                <span class="energy-toggle-switch ${isActive ? "on" : ""}">
                    <span class="energy-toggle-knob"></span>
                </span>
            </button>
          `;
        })
        .join("");

      // Evidence cards for all active children
      let evidenceHtml = "";
      const activeZones = activeChildren
        .map((id) => zones.find((z) => z.id === id))
        .filter(Boolean);

      if (activeZones.length > 0) {
        const cardsHtml = activeZones
          .map((zone) => {
            const statsHtml = zone.stats
              ? zone.stats
                  .map(
                    (s) => `
                    <div class="panel-bento-stat">
                        <div class="panel-bento-stat-value">${s.value}</div>
                        <div class="panel-bento-stat-label">${s.label}</div>
                    </div>
                  `,
                  )
                  .join("")
              : "";

            return `
              <div class="energy-evidence-card" style="border-left: 3px solid ${zone.strokeColor};">
                  <div class="panel-bento-label" style="color: ${zone.strokeColor};">Development zone</div>
                  <div style="font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">${zone.name}</div>
                  <p style="font-size: var(--text-sm); margin-bottom: var(--space-4);">${zone.description}</p>
                  ${statsHtml ? `<div class="panel-bento-stats">${statsHtml}</div>` : ""}
                  <div style="margin-top: var(--space-4); border-radius: var(--radius-medium); overflow: hidden; cursor: pointer;" onclick="UI.showEvidenceLightbox('assets/use-case-images/evidence-science-park.webp', '${zone.name.replace(/'/g, "\\'")}')">
                      <img src="assets/use-case-images/evidence-science-park.webp" alt="${zone.name}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                  </div>
              </div>
            `;
          })
          .join("");

        evidenceHtml = `
          <div style="margin-top: var(--space-6);">
              <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">Evidence</div>
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                  ${cardsHtml}
              </div>
          </div>
        `;
      }

      UI.showPanel(`
        <div class="subtitle">Development zones</div>
        <h2>Science park</h2>
        <p>${sp.description}</p>
        <div style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);">
            ${rowsHtml}
        </div>
        ${evidenceHtml}
      `);
    } else if (group === "grand-airport-group") {
      const airport = AppData.governmentChain?.levels?.find(
        (l) => l.id === "grand-airport",
      );

      const airportChildren = [
        {
          id: "ga-airport-access",
          label: "Airport access",
          color: "#007aff",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
        },
        {
          id: "ga-railway-stations",
          label: "New railway stations",
          color: "#ff9500",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7"/><path d="M2 16h20"/><path d="M4 16l-2 6h20l-2-6"/><path d="M9.5 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/><path d="M15.5 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/></svg>',
        },
        {
          id: "ga-road-extensions",
          label: "Road extensions",
          color: "#34c759",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
        },
      ];

      const rowsHtml = airportChildren
        .map((c) => {
          const isActive = activeChildren.includes(c.id);
          return `
            <button class="energy-toggle-row${isActive ? " active" : ""}"
                    onclick="App.toggleDevelopmentChild('${c.id}')"
                    aria-pressed="${isActive}">
                <span class="energy-toggle-icon" style="color: ${c.color};">${c.icon}</span>
                <span class="energy-toggle-label">${c.label}</span>
                <span class="energy-toggle-switch ${isActive ? "on" : ""}">
                    <span class="energy-toggle-knob"></span>
                </span>
            </button>
          `;
        })
        .join("");

      // Evidence cards for all active children (multi-select)
      let evidenceHtml = "";
      const activeItems = activeChildren
        .map((id) => {
          const child = airportChildren.find((c) => c.id === id);
          if (!child) return null;
          const ev = this._getAirportChildEvidence(id, airport);
          return ev ? { child, ev } : null;
        })
        .filter(Boolean);

      if (activeItems.length > 0) {
        const cardsHtml = activeItems
          .map(({ child, ev }) => {
            const statsHtml = ev.stats?.length
              ? ev.stats
                  .map(
                    (s) => `
                    <div class="panel-bento-stat">
                        <div class="panel-bento-stat-value">${s.value}</div>
                        <div class="panel-bento-stat-label">${s.label}</div>
                    </div>
                  `,
                  )
                  .join("")
              : "";

            const imagesHtml = ev.images
              .map(
                (img) => `
                <div style="margin-top: var(--space-4); border-radius: var(--radius-medium); overflow: hidden; cursor: pointer;" onclick="UI.showEvidenceLightbox('${img.src}', '${img.alt.replace(/'/g, "\\'")}')">
                    <img src="${img.src}" alt="${img.alt}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                </div>
              `,
              )
              .join("");

            return `
              <div class="energy-evidence-card" style="border-left: 3px solid ${child.color};">
                  <div class="panel-bento-label" style="color: ${child.color};">${ev.subtitle}</div>
                  <div style="font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">${ev.title}</div>
                  <p style="font-size: var(--text-sm); margin-bottom: var(--space-4);">${ev.description}</p>
                  ${statsHtml ? `<div class="panel-bento-stats">${statsHtml}</div>` : ""}
                  ${imagesHtml}
              </div>
            `;
          })
          .join("");

        evidenceHtml = `
          <div style="margin-top: var(--space-6);">
              <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">Evidence</div>
              <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                  ${cardsHtml}
              </div>
          </div>
        `;
      }

      UI.showPanel(`
        <div class="subtitle">Development zones</div>
        <h2>Grand airport concept</h2>
        <p>${airport?.description || "A proposed expansion of Aso Kumamoto Airport to serve as a regional semiconductor logistics hub."}</p>
        <div style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);">
            ${rowsHtml}
        </div>
        ${evidenceHtml}
      `);
    }
  },

  /**
   * Return evidence data for a grand airport child item.
   */
  _getAirportChildEvidence(childId, airport) {
    if (childId === "ga-airport-access") {
      return {
        subtitle: "Grand airport concept",
        title: "Airport access",
        description:
          airport?.description ||
          "Airport access infrastructure connecting the semiconductor corridor to Aso Kumamoto Airport.",
        stats: airport?.stats || [],
        images: [
          {
            src: "assets/use-case-images/evidence-airport-master-plan.webp",
            alt: "Airport master plan",
          },
        ],
      };
    }
    if (childId === "ga-railway-stations") {
      return {
        subtitle: "Grand airport concept",
        title: "New railway stations",
        description:
          "A new 6.8km rail connection will link Aso Kumamoto Airport directly to the JR Hohi Line, with an estimated travel time of 44 minutes from Kumamoto Station.",
        stats: airport?.stats || [],
        images: [
          {
            src: "assets/use-case-images/evidence-airport-to-city-railway.webp",
            alt: "Airport to city railway",
          },
          {
            src: "assets/use-case-images/evidence-new-railway-system.webp",
            alt: "New railway system",
          },
        ],
      };
    }
    if (childId === "ga-road-extensions") {
      return {
        subtitle: "Grand airport concept",
        title: "Road extensions",
        description:
          'The "10-minute ring" concept connects the airport, industrial parks, and residential zones at approximately 10-minute drive intervals, creating an integrated urban corridor.',
        stats: [],
        images: [
          {
            src: "assets/use-case-images/evidence-kumamoto-future-road-network.webp",
            alt: "Future road network",
          },
          {
            src: "assets/use-case-images/evidence-10-minute-ring-road-2.webp",
            alt: "10-minute ring road",
          },
        ],
      };
    }
    return null;
  },

  /**
   * Show landmark detail in the right panel when a landmark marker is clicked.
   */
  showAirportLandmarkDetail(landmarkId) {
    const data = AppData.grandAirportData?.airportAccessRoutes;
    const lm = data?.landmarks?.find((l) => l.id === landmarkId);
    if (!lm) return;

    const statsHtml = lm.stats?.length
      ? `<div class="panel-bento-stats">${lm.stats
          .map(
            (s) => `
            <div class="panel-bento-stat">
              <div class="panel-bento-stat-value">${s.value}</div>
              <div class="panel-bento-stat-label">${s.label}</div>
            </div>`,
          )
          .join("")}</div>`
      : "";

    UI.showPanel(`
      <div class="subtitle" style="color: ${lm.color};">Airport access</div>
      <h2>${lm.name}</h2>
      <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-3);">${lm.description || ""}</p>
      ${statsHtml ? `<div style="margin-top: var(--space-4);">${statsHtml}</div>` : ""}
    `);
  },

  /**
   * Show route line detail in the right panel when a route line is clicked.
   */
  showAirportLineDetail(routeId) {
    const routes = AppData.grandAirportData?.airportAccessRoutes?.routes;
    const route = routes?.find((r) => r.id === routeId);
    if (!route) return;

    const statsHtml = route.stats?.length
      ? `<div class="panel-bento-stats">${route.stats
          .map(
            (s) => `
            <div class="panel-bento-stat">
              <div class="panel-bento-stat-value">${s.value}</div>
              <div class="panel-bento-stat-label">${s.label}</div>
            </div>`,
          )
          .join("")}</div>`
      : "";

    UI.showPanel(`
      <div class="subtitle" style="color: ${route.color};">Airport access</div>
      <h2>${route.name}</h2>
      <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-3);">${route.description || ""}</p>
      ${statsHtml ? `<div style="margin-top: var(--space-4);">${statsHtml}</div>` : ""}
    `);
  },

  /**
   * Show road extension detail in the right panel when a road line is clicked.
   */
  showRoadExtensionDetail(roadId) {
    const roads = AppData.grandAirportData?.roadExtensions;
    const road = roads?.find((r) => r.id === roadId);
    if (!road) return;

    const color = road.color || "#e63f5a";
    const statsHtml = road.stats?.length
      ? `<div class="panel-bento-stats">${road.stats
          .map(
            (s) => `
            <div class="panel-bento-stat">
              <div class="panel-bento-stat-value">${s.value}</div>
              <div class="panel-bento-stat-label">${s.label}</div>
            </div>`,
          )
          .join("")}</div>`
      : "";

    UI.showPanel(`
      <div class="subtitle" style="color: ${color};">Road extensions</div>
      <h2>${road.name}</h2>
      <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-3);">${road.description || ""}</p>
      ${statsHtml ? `<div style="margin-top: var(--space-4);">${statsHtml}</div>` : ""}
    `);
  },

  /**
   * Show railway station detail in the right panel when a station marker is clicked.
   */
  showRailwayStationDetail(stationId) {
    const data = AppData.grandAirportData?.railway;
    const station = data?.stations?.find((s) => s.id === stationId);
    if (!station) return;

    const color = station.type === "planned" ? "#ff9500" : "#6e7073";
    const statsHtml = station.stats?.length
      ? `<div class="panel-bento-stats">${station.stats
          .map(
            (s) => `
            <div class="panel-bento-stat">
              <div class="panel-bento-stat-value">${s.value}</div>
              <div class="panel-bento-stat-label">${s.label}</div>
            </div>`,
          )
          .join("")}</div>`
      : "";

    UI.showPanel(`
      <div class="subtitle" style="color: ${color};">New railway stations</div>
      <h2>${station.name}</h2>
      <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-3);">${station.description || ""}</p>
      ${statsHtml ? `<div style="margin-top: var(--space-4);">${statsHtml}</div>` : ""}
    `);
  },

  /**
   * Toggle a development child (multi-select).
   * Each child toggles independently. Activating a science park zone
   * flies the camera to that zone's position.
   */
  toggleDevelopmentChild(childId) {
    const active = this.state.activeDevelopmentChildren;
    const idx = active.indexOf(childId);

    if (idx !== -1) {
      // Turn off this child
      active.splice(idx, 1);
      this._removeDevelopmentMapElement(childId);
    } else {
      // Grand-airport children are mutually exclusive - deactivate siblings
      if (childId.startsWith("ga-")) {
        const gaChildren = active.filter((id) => id.startsWith("ga-"));
        gaChildren.forEach((id) => {
          const i = active.indexOf(id);
          if (i !== -1) active.splice(i, 1);
          this._removeDevelopmentMapElement(id);
        });
      }

      // Turn on this child
      active.push(childId);
      this._showDevelopmentMapElement(childId);
    }

    // Re-render panel to reflect toggle state
    this._renderDevelopmentDashboard();
  },

  /**
   * Show the map element and fly to camera for a single development child.
   */
  _showDevelopmentMapElement(childId) {
    const zonePlan = (AppData.scienceParkZonePlans || []).find(
      (z) => z.id === childId,
    );
    if (zonePlan) {
      // Show polygon and fly to zone camera
      MapController.showZonePlanHighlight(zonePlan, { skipFly: false });
      return;
    }

    // Grand airport children
    const gaCamera = AppData.grandAirportData?.cameras?.[childId];
    if (childId === "ga-airport-access") {
      MapController.showAirportAccessRoutes();
      if (gaCamera) MapController.flyToStep(gaCamera);
    } else if (childId === "ga-railway-stations") {
      MapController.showRailwayStations();
      if (gaCamera) MapController.flyToStep(gaCamera);
    } else if (childId === "ga-road-extensions") {
      MapController.showRoadExtensions();
      MapController.flyToStep({
        center: [130.9597, 32.8539],
        zoom: 10.9,
        pitch: 54,
        bearing: 0,
      });
    }
  },

  /**
   * Remove the map element for a single development child.
   */
  _removeDevelopmentMapElement(childId) {
    const zonePlan = (AppData.scienceParkZonePlans || []).find(
      (z) => z.id === childId,
    );
    if (zonePlan) {
      const sourceId = `zone-plan-${zonePlan.id}`;
      MapController._safeRemoveLayer(`${sourceId}-fill`);
      MapController._safeRemoveLayer(`${sourceId}-stroke`);
      MapController._safeRemoveSource(sourceId);
      const group = MapController._layerGroups.zonePlanHighlight;
      [`${sourceId}-fill`, `${sourceId}-stroke`, sourceId].forEach((id) => {
        const i = group.indexOf(id);
        if (i !== -1) group.splice(i, 1);
      });
      return;
    }

    if (childId === "ga-airport-access") {
      MapController.hideAirportAccessRoutes();
    } else if (childId === "ga-railway-stations") {
      MapController.hideRailwayStations();
    } else if (childId === "ga-road-extensions") {
      MapController.hideRoadExtensions();
    }
  },

  /**
   * Clean up all map elements added by development children.
   */
  _cleanupDevelopmentMapElements() {
    MapController.hideZonePlanHighlight();
    MapController.hideAirportMarker();
    MapController.hideAirportAccessRoutes();
    MapController.hideRailwayStations();
    MapController.hideRoadExtensions();
  },

  // --- Step 6: Education ---
  _handleEducationSubItem(itemId) {
    if (itemId === "universities") {
      UI.renderInspectorPanel(6, { title: "Talent pipeline" });
      MapController.showTalentPipeline();
    } else if (itemId === "training") {
      const group = UI.findEvidenceGroup("education-pipeline");
      if (group) {
        const item = group.items.find((i) => i.id === "training-centers");
        if (item) {
          UI.showDisclosureItemDetail(group, item);
          if (item.coords) {
            MapController.showTrainingCenterMarker(item);
            MapController.flyToStep({
              center: MapController._toMapbox(item.coords),
              zoom: 12,
              pitch: 48,
              bearing: 0,
              duration: 2000,
            });
          }
        }
      }
    } else if (itemId === "employment") {
      const group = UI.findEvidenceGroup("education-pipeline");
      if (group) {
        const item = group.items.find((i) => i.id === "graduate-numbers");
        if (item) {
          UI.showDisclosureItemDetail(group, item);
          if (item.coords) {
            MapController.showEmploymentMarker(item);
            MapController.flyToStep({
              center: MapController._toMapbox(item.coords),
              zoom: 12,
              pitch: 48,
              bearing: 0,
              duration: 2000,
            });
          }
        }
      }
    }
  },

  // --- Step 8: Investment zones ---
  _handleInvestmentZoneSubItem(itemId) {
    const zoneData = {
      "kikuyo-zone": {
        name: "Kikuyo",
        role: "Factory core / new urban core",
        description:
          "Manufacturing nucleus and new urban district. Haramizu station new station area targeted as advanced new urban district integrating residence, commerce, education, and research.",
        coords: [32.86, 130.83],
      },
      "ozu-zone": {
        name: "Ozu",
        role: "Gateway / office and logistics support",
        description:
          "Transportation hub with logistics coordination and supplier office locations. Gateway to the semiconductor corridor.",
        coords: [32.88, 130.87],
      },
      "koshi-zone": {
        name: "Koshi",
        role: "R&D / tools and process innovation",
        description:
          "Research and development focus with equipment chain concentration. Home to Tokyo Electron and supporting tool manufacturers.",
        coords: [32.905, 130.76],
      },
    };
    const zone = zoneData[itemId];
    if (zone) {
      UI.showPanel(`
                <div class="subtitle">Silicon triangle</div>
                <h2>${zone.name}</h2>
                <p style="color: var(--color-text-secondary); font-weight: var(--font-weight-medium);">${zone.role}</p>
                <p style="margin-top: var(--space-3);">${zone.description}</p>
            `);
      MapController.flyToStep({
        center: MapController._toMapbox(zone.coords),
        zoom: 13,
        pitch: 50,
        bearing: 15,
        duration: 2000,
      });
    }
  },

  // --- Step 9: Properties (zone group flow) ---

  /**
   * Zone group ID to zone filter mapping.
   * Maps chatbox sub-item IDs to property zone name fragments.
   */
  _propertyZoneMap: {
    "kikuyo-properties": {
      filter: "kikuyo",
      zoneId: "kikuyo-zone",
      label: "Kikuyo properties",
      camera: {
        center: [130.83, 32.87],
        zoom: 12.5,
        pitch: 52,
        bearing: 20,
      },
    },
    "ozu-properties": {
      filter: "ozu",
      zoneId: "ozu-zone",
      label: "Ozu properties",
      camera: {
        center: [130.87, 32.865],
        zoom: 12.7,
        pitch: 52,
        bearing: 45,
      },
    },
  },

  /**
   * Handle zone group selection from chatbox.
   * Shows the zone boundary, property markers, and cinematic camera sweep.
   */
  _handlePropertySubItem(itemId) {
    const zoneInfo = this._propertyZoneMap[itemId];
    if (!zoneInfo) return;

    this.state.activePropertyZone = itemId;
    this.state.activeProperty = null;

    // Find properties in this zone
    const zoneProps = AppData.properties.filter(
      (p) => p.zone && p.zone.toLowerCase().includes(zoneInfo.filter),
    );
    if (zoneProps.length === 0) return;

    // Clean up previous state
    MapController.hideInvestmentZones();
    MapController._removeLayerGroup("properties");
    MapController.removePropertyContextLines();

    // Show just this zone boundary
    MapController.showInvestmentZone(zoneInfo.zoneId);

    // Show markers for all properties in this zone
    zoneProps.forEach((prop) => {
      MapController.showSinglePropertyMarker(prop);
    });

    // Fly to the specified camera position for this zone
    if (zoneInfo.camera) {
      MapController.flyToStep({
        center: [zoneInfo.camera.center[0], zoneInfo.camera.center[1]],
        zoom: zoneInfo.camera.zoom,
        pitch: zoneInfo.camera.pitch,
        bearing: zoneInfo.camera.bearing || 0,
        duration: 2000,
      });
    }

    // Show zone properties panel for individual drill-down
    UI.showZonePropertiesPanel(zoneInfo.label, zoneProps);
  },

  /**
   * Select an individual property from the zone properties panel.
   * Shows context lines and property marker, then allows drill-down.
   */
  selectProperty(propertyId) {
    const property = AppData.properties.find((p) => p.id === propertyId);
    if (!property) return;

    this.state.activeProperty = propertyId;

    // Hide zone boundaries so property is the focus
    MapController.hideInvestmentZones();

    // Remove all property markers, show only selected one
    MapController._removeLayerGroup("properties");
    MapController.showSinglePropertyMarker(property);

    // Draw context lines to infrastructure connections
    MapController.showPropertyContextLines(property);

    // Show full tabbed inspector immediately (truth engine, financials, etc.)
    this.activatePropertyDashboard(property.id);
  },

  /**
   * Open property dashboard with tabbed inspector.
   * Called when user clicks the property marker after context lines are shown.
   */
  activatePropertyDashboard(propertyId) {
    const property = AppData.properties.find(
      (p) => p.id === (propertyId || this.state.activeProperty),
    );
    if (!property) return;

    this.state.activeProperty = property.id;

    // Show tabbed inspector panel for this property
    UI.renderInspectorPanel(9, { title: property.name, property });
  },

  /**
   * Render the final step chatbox (journey recap + AI chat).
   */
  _renderFinalChatbox() {
    const propCount = AppData.properties.length;
    let totalNetProfit = 0;
    AppData.properties.forEach((p) => {
      const fc = p.cards.find((c) => c.type === "financial");
      if (!fc) return;
      const d = fc.data;
      if (d.scenarios && d.scenarios.average) {
        if (d.scenarios.average.netProfit != null) {
          totalNetProfit += d.scenarios.average.netProfit;
        } else if (
          d.scenarios.average.exitPrice != null &&
          d.acquisitionCost != null
        ) {
          totalNetProfit += d.scenarios.average.exitPrice - d.acquisitionCost;
        }
      } else if (d.paths && d.paths.market) {
        // Market path uses yield, not gross profit; skip absolute profit
        totalNetProfit += 0;
      }
    });
    const formatYen = (num) => {
      if (num >= 10000000) return "\u00a5" + (num / 1000000).toFixed(1) + "M";
      return "\u00a5" + num.toLocaleString();
    };

    return `
            <div class="journey-recap">
                <h3>Journey complete</h3>
                <div class="journey-recap-checklist">
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Natural advantages verified
                    </div>
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        4T+ yen government commitment
                    </div>
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${propCount} investment properties
                    </div>
                </div>
                <div class="journey-recap-headline">
                    <div class="journey-recap-headline-label">Combined 5-year return</div>
                    <div class="journey-recap-headline-value">${formatYen(totalNetProfit)}</div>
                    <div class="journey-recap-headline-detail">across the portfolio</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                    <button class="chatbox-continue primary" onclick="App.enterQAMode()">
                        Enter Q&amp;A
                    </button>
                    <button class="chatbox-continue secondary" onclick="UI.hideChatbox(); setTimeout(() => { UI.showAIChat(); UI.downloadSummary(); }, 600);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                        Download summary
                    </button>
                </div>
            </div>
        `;
  },

  // ================================
  // Q&A Mode
  // ================================

  /**
   * Enter Q&A mode: clean map, show AI chat, enable all data layer toggles.
   */
  async enterQAMode() {
    if (this._transitioning) return;
    this._transitioning = true;
    this.state.qaMode = true;

    // Clean up the current step
    if (this.state.currentStep > 0) {
      await this._exitStep(this.state.currentStep);
    }

    // Clear all map annotations for a clean base map
    MapController.clearAll();

    // Hide progress bar and time toggle
    UI.updateJourneyProgress(0, STEPS.length);
    UI.hideTimeToggle();

    // Populate data layers panel with all 11 layer groups (all unselected)
    UI.showDataLayers("qa");

    // Show AI chat with Q&A suggestion chips
    UI.showQAChatbox();

    // Ensure right panel is hidden initially
    UI.hidePanel();

    // Show persistent controls
    UI.showLayersToggle();
    UI.showPanelToggle();

    // Restart ambient motion
    MapController.startHeartbeat();

    this._transitioning = false;
  },

  // ================================
  // Per-step panel content
  // ================================

  /**
   * Render the right panel for a step.
   * Some steps auto-show a panel, others wait for sub-item clicks.
   */
  _renderStepPanel(step) {
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

      case "future-outlook": {
        // Show airport marker on the map for the future outlook
        const airport = AppData.governmentChain?.levels?.find(
          (l) => l.id === "grand-airport",
        );
        if (airport) MapController.showAirportMarker(airport);

        // Emphasize road extensions for the future vision
        setTimeout(() => MapController.highlightRoadExtensions(), 500);

        UI.showPanel(`
                    <div class="subtitle">Future outlook</div>
                    <h2>2030+ vision</h2>
                    <p>Under the science park and grand airport plan, this is a comprehensive long-term urbanization plan.</p>
                    <div class="evidence-image-container" style="margin-top: var(--space-4); cursor: pointer;" onclick="UI.showEvidenceLightbox('assets/use-case-images/evidence-science-park.webp', 'Science park plan')">
                        <img src="assets/use-case-images/evidence-science-park.webp" alt="Science park plan" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                    <div class="evidence-image-container" style="margin-top: var(--space-4); cursor: pointer;" onclick="UI.showEvidenceLightbox('assets/use-case-images/evidence-new-grand-airport.webp', 'Grand airport concept')">
                        <img src="assets/use-case-images/evidence-new-grand-airport.webp" alt="Grand airport concept" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                    <div class="evidence-image-container" style="margin-top: var(--space-4); cursor: pointer;" onclick="UI.showEvidenceLightbox('assets/use-case-images/evidence-kumamoto-future-road-network.webp', 'Future road network')">
                        <img src="assets/use-case-images/evidence-kumamoto-future-road-network.webp" alt="Future road network" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                `);
        break;
      }

      case "investment-zones":
        UI.showPanel(`
                    <div class="subtitle">Silicon triangle</div>
                    <h2>Investment opportunity zones</h2>
                    <p>Three zones with distinct roles in the semiconductor ecosystem. Click a zone to see details.</p>
                    <div class="evidence-image-container" style="margin-top: var(--space-4); cursor: pointer;" onclick="UI.showEvidenceLightbox('assets/use-case-images/evidence-tsmc-infrastructure-overview.webp', 'TSMC infrastructure overview')">
                        <img src="assets/use-case-images/evidence-tsmc-infrastructure-overview.webp" alt="TSMC infrastructure overview" style="width: 100%; border-radius: var(--radius-medium);" />
                    </div>
                `);
        break;

      case "properties":
        // Initialize with Kikuyo zone active by default
        this.state.activeInvestmentZones = [];
        this.state.activeInvestmentZones.push("kikuyo-zone");
        MapController.showInvestmentZone("kikuyo-zone");
        UI.showInvestmentZonesPanel(this.state.activeInvestmentZones);
        break;

      case "final":
        // No panel for final step
        break;

      default:
        // Steps with sub-items: panel shows on sub-item click
        break;
    }
  },

  // ================================
  // Evidence groups
  // ================================

  /**
   * Show evidence group panel from chatbox link.
   */
  showEvidenceGroupPanel(groupId) {
    const group = UI.findEvidenceGroup(groupId);
    if (group) {
      if (!this.state.evidenceGroupsViewed.includes(groupId)) {
        this.state.evidenceGroupsViewed.push(groupId);
      }

      UI.disclosureState[groupId] = true;
      this.showSingleEvidenceGroup(group);
      MapController.showEvidenceGroupMarkers(group);
      MapController.fitToEvidenceGroup(group);
    }
  },

  /**
   * Show panel with a single evidence group.
   */
  showSingleEvidenceGroup(group) {
    UI.disclosureState[group.id] = true;
    const groupHtml = UI.generateDisclosureGroup(group);

    const content = `
            <div class="subtitle">Supporting evidence</div>
            <h2>${group.title}</h2>
            <p>Select an item below to view detailed documentation.</p>
            ${groupHtml}
            <button class="panel-btn" onclick="UI.showEvidenceListPanel()">
                View all evidence
            </button>
        `;

    UI.showPanel(content);
  },

  /**
   * Show evidence library with all groups.
   */
  showEvidenceLibrary() {
    UI.showEvidenceListPanel();
  },

  // ================================
  // Marker pulse per step
  // ================================

  /**
   * Apply marker pulse to the primary marker group for a step.
   * Highlights contextually relevant markers with subtle breathing.
   */
  _applyStepPulse(step) {
    const pulseMap = {
      resources: "resources",
      "government-support": "governmentChain",
      "corporate-investment": "companies",
      "transport-access": "sciencePark",
      "education-pipeline": "talentPipeline",
      "investment-zones": "investmentZones",
      properties: "properties",
    };
    const group = pulseMap[step.id];
    if (group) {
      // Delay pulse until markers have had time to appear
      setTimeout(() => {
        MapController.setActiveMarkerPulse(group);
      }, TIMING.breathMedium);
    }
  },

  // ================================
  // Restore and restart
  // ================================

  /**
   * Restore chatbox content based on current step.
   * Called when user clicks the FAB to reopen chatbox.
   */
  restoreChatbox() {
    const step = STEPS[this.state.currentStep - 1];
    if (step) {
      const content = this._getStepChatboxContent(step);
      UI.showChatbox(content);
    } else {
      UI.showChatbox(`
                <h3>Kumamoto investment guide</h3>
                <p>Explore the map and use the data layers to learn about investment opportunities in Kumamoto's semiconductor corridor.</p>
                <button class="chatbox-continue primary" onclick="App.goToStep(1)">Start Journey <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
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

export { TIMING, App };
