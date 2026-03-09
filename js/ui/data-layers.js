import { AppData } from "../data/index.js";
import { MapController } from "../map/index.js";
import {
  panelHeader,
  statGrid,
  disclosureTriangle,
} from "../shared/templates.js";

export const methods = {
  showDataLayers(stepIndex) {
    // Lucide-style SVG icons
    const icons = {
      // Home icon (Lucide: home)
      properties: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>`,
      // Building icon (Lucide: building-2)
      companies: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
            </svg>`,
      // Flask icon (Lucide: flask-conical)
      sciencePark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
                <path d="M8.5 2h7"/><path d="M7 16h10"/>
            </svg>`,
      // Map pin icon (Lucide: map-pin)
      baseMap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>`,
      // Car icon (Lucide: car)
      trafficFlow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
            </svg>`,
      // Train icon (Lucide: train-front)
      railCommute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/>
                <path d="m9 15-1-1"/><path d="m15 15 1-1"/>
                <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/>
                <path d="m8 19-2 3"/><path d="m16 19 2 3"/>
            </svg>`,
      // Zap icon (Lucide: zap)
      electricity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
            </svg>`,
      // Briefcase icon (Lucide: briefcase)
      employment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                <rect width="20" height="14" x="2" y="6" rx="2"/>
            </svg>`,
      // Landmark icon (Lucide: landmark)
      infrastructure: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/>
                <line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/>
                <line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
            </svg>`,
      // House icon (Lucide: house)
      realEstate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>`,
      // Droplet icon (Lucide: droplet)
      riskyArea: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
            </svg>`,
      // Plane icon (Lucide: plane)
      airlineRoutes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>`,
      // Train icon (Lucide: train-front)
      railCommute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/>
                <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/>
                <path d="m8 19-2 3"/><path d="m16 19 2 3"/>
            </svg>`,
      // Road icon (Lucide: route)
      infraPlan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
                <circle cx="18" cy="5" r="3"/>
            </svg>`,
    };

    // Populate Data Layers section with cumulative step-ordered items.
    // At step N, items for steps 1 through N appear. Only the current
    // step's item is auto-selected (via syncDataLayersToStep).
    const dataLayerItems = document.getElementById("data-layer-items");

    // Store current step for reference
    this._currentStepForLayers = stepIndex;

    // Close panel when step changes (button stays visible)
    if (this.layersPanelOpen) {
      this.toggleLayersPanel();
    }

    // Clear active state so previous step's selections don't persist
    this.activeDataLayers = {};

    // Helper to build a layer button (all use unified toggleLayer)
    const layerBtn = (layer, icon, label) => `
            <button type="button" class="layer-item" data-layer="${layer}"
                    role="switch" aria-checked="false" onclick="UI.toggleLayer('${layer}')"
                    title="Toggle ${label.toLowerCase()} on the map">
                <span class="layer-checkbox" aria-hidden="true"></span>
                <span class="layer-icon" aria-hidden="true">${icon}</span>
                <span class="layer-label">${label}</span>
            </button>
        `;

    // Sequential data layer items ordered by journey step.
    // Each entry maps a step index to a toggleable layer.
    const LAYER_SEQUENCE = [
      {
        step: 1,
        layer: "waterResources",
        icon: icons.riskyArea,
        label: "Water resources",
      },
      {
        step: 1,
        layer: "electricity",
        icon: icons.electricity,
        label: "Power resources",
      },
      {
        step: 2,
        layer: "airlineRoutes",
        icon: icons.airlineRoutes,
        label: "Strategic location",
      },
      {
        step: 3,
        layer: "governmentChain",
        icon: icons.infrastructure,
        label: "Government support",
      },
      {
        step: 4,
        layer: "companies",
        icon: icons.companies,
        label: "Corporate investment",
      },
      {
        step: 5,
        layer: "sciencePark",
        icon: icons.sciencePark,
        label: "Science park",
        labelFrom5: "Science park & airport concept",
      },
      {
        step: 6,
        layer: "scienceParkClusters",
        icon: icons.sciencePark,
        label: "Science park clusters",
      },
      {
        step: 7,
        layer: "talentPipeline",
        icon: icons.employment,
        label: "Talent pipeline",
      },
      {
        step: 8,
        layer: "futureOutlook",
        icon: icons.infrastructure,
        label: "Future outlook",
      },
      {
        step: 9,
        layer: "investmentZones",
        icon: icons.realEstate,
        label: "Investment zones",
      },
      {
        step: 10,
        layer: "properties",
        icon: icons.properties,
        label: "Properties",
      },
      {
        step: 10,
        layer: "railCommute",
        icon: icons.railCommute,
        label: "Rail commute",
      },
      {
        step: 10,
        layer: "infraPlan",
        icon: icons.infraPlan,
        label: "Infrastructure plan",
      },
    ];

    let html = "";
    if (stepIndex === "initial") {
      html = layerBtn("waterResources", icons.riskyArea, "Water resources");
    } else if (stepIndex === "dashboard" || stepIndex === "qa") {
      // Dashboard / Q&A: show all available layers (use extended label for combined entry)
      html = LAYER_SEQUENCE.map((item) => {
        const label = item.labelFrom5 || item.label;
        return layerBtn(item.layer, item.icon, label);
      }).join("");
    } else if (typeof stepIndex === "number" && stepIndex >= 1) {
      // Show items for steps 1 through current step
      // From step 6+, use extended label for the science park entry
      html = LAYER_SEQUENCE.filter((item) => item.step <= stepIndex)
        .map((item) => {
          const label =
            stepIndex >= 5 && item.labelFrom5 ? item.labelFrom5 : item.label;
          return layerBtn(item.layer, item.icon, label);
        })
        .join("");
    }

    dataLayerItems.innerHTML = html;

    // Show the toggle button but keep panel hidden until user clicks
    this.showLayersToggle();
  },

  /**
   * Auto-activate data layer checkboxes that match the step's active map layers.
   * Maps step.layers entries to their corresponding data-layer attribute values.
   * @param {Object} step - The current step object from STEPS array
   */
  syncDataLayersToStep(step) {
    if (!step || !step.layers) return;

    // Map from step.layers entries to data-layer attribute values
    const layerToDataAttr = {
      resources: "waterResources",
      companies: "companies",
      sciencePark: "sciencePark",
      infrastructureRoads: "infrastructure",
      airlineRoutes: "airlineRoutes",
      governmentChain: "governmentChain",
    };

    const activeLayers = step.layers;
    const allItems = document.querySelectorAll("#data-layer-items .layer-item");

    allItems.forEach((item) => {
      const layerKey = item.getAttribute("data-layer");
      const shouldBeActive = activeLayers.some(
        (l) => layerToDataAttr[l] === layerKey,
      );

      if (shouldBeActive) {
        item.classList.add("active");
        item.setAttribute("aria-checked", "true");
        this.activeDataLayers[layerKey] = true;
      }
    });
  },

  /**
   * Activate a single data layer checkbox by its data-layer attribute.
   */
  activateDataLayer(layerKey) {
    const item = document.querySelector(
      `#data-layer-items [data-layer="${layerKey}"]`,
    );
    if (item && !item.classList.contains("active")) {
      item.classList.add("active");
      item.setAttribute("aria-checked", "true");
    }
  },

  /**
   * Deactivate a single data layer checkbox by its data-layer attribute.
   */
  deactivateDataLayer(layerKey) {
    const item = document.querySelector(
      `#data-layer-items [data-layer="${layerKey}"]`,
    );
    if (item) {
      item.classList.remove("active");
      item.setAttribute("aria-checked", "false");
    }
  },
  hideDataLayers() {
    document.getElementById("data-layers").classList.add("hidden");
    this.layersPanelOpen = false;
    this.elements.layersToggle.classList.remove("active");
    this.elements.layersToggle.setAttribute("aria-expanded", "false");
  },

  /**
   * Reset all data layers to inactive state.
   */
  resetAllDataLayers() {
    this.activeDataLayers = {};
    const allItems = document.querySelectorAll("#data-layer-items .layer-item");
    allItems.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-checked", "false");
    });
  },

  /**
   * Toggle layers panel visibility
   */
  toggleLayersPanel() {
    if (this.layersPanelOpen) {
      this.elements.dataLayers.classList.add("hidden");
      this.elements.layersToggle.classList.remove("active");
      this.elements.layersToggle.setAttribute("aria-expanded", "false");
      this.layersPanelOpen = false;
    } else {
      this.elements.dataLayers.classList.remove("hidden");
      this._retriggerAnimation(this.elements.dataLayers);
      this.elements.layersToggle.classList.add("active");
      this.elements.layersToggle.setAttribute("aria-expanded", "true");
      this.layersPanelOpen = true;
    }
  },

  /**
   * Show layers toggle button
   */
  showLayersToggle() {
    this.elements.layersToggle.classList.remove("hidden");
  },

  /**
   * Reset map to overview position and clear drill-down layers
   */

  /**
   * Reset layers toggle to unselected state (button stays visible, panel closes)
   */
  hideLayersToggle() {
    // Keep button visible but close panel and reset to unselected state
    this.hideDataLayers();
  },
  toggleLayer(layerName) {
    const layerItem = document.querySelector(
      `#data-layer-items [data-layer="${layerName}"]`,
    );
    if (!layerItem) return;

    const isActive = layerItem.classList.contains("active");
    const displayName = this.getLayerDisplayName(layerName);

    // Categorize layer type
    const mapLayers = [
      "sciencePark",
      "companies",
      "properties",
      "resources",
      "baseMap",
    ];
    const isMapLayer = mapLayers.includes(layerName);

    if (isActive) {
      // Deactivate
      layerItem.classList.remove("active");
      layerItem.setAttribute("aria-checked", "false");
      delete this.activeDataLayers[layerName];

      if (layerName === "waterResources") {
        MapController.hideWaterResourceLayer();
        if (!App.state.qaMode) this.hidePanel();
      } else if (layerName === "airlineRoutes") {
        MapController.hideAirlineRoutes();
        if (!App.state.qaMode) this.hidePanel();
      } else if (layerName === "electricity") {
        MapController.fadeOutDataLayerMarkersAnimated(layerName);
        if (!App || !App.state || App.state.currentStep !== 1) {
          MapController.hideKyushuEnergy();
        }
        if (!App.state.qaMode) MapController.restorePreDataLayerView();
      } else if (layerName === "governmentChain") {
        MapController.hideLayer("governmentChain");
        MapController.hideAllGovernmentLevels();
        if (!App.state.qaMode) this.hidePanel();
      } else if (layerName === "scienceParkClusters") {
        MapController.fadeOutMarkerGroup("sciencePark");
      } else if (layerName === "talentPipeline") {
        MapController.hideTalentPipeline();
      } else if (layerName === "futureOutlook") {
        MapController.hideFutureZones();
        MapController.hideInfrastructureRoads();
      } else if (layerName === "investmentZones") {
        MapController.hideInvestmentZones();
      } else if (layerName === "properties") {
        MapController.fadeOutMarkerGroup("properties");
      } else if (layerName === "railCommute") {
        MapController.hideRailCommute();
      } else if (layerName === "infraPlan") {
        MapController.hideInfraPlan();
      } else if (isMapLayer) {
        MapController.hideLayer(layerName);
      } else {
        // Data layer with animated exit
        MapController.fadeOutDataLayerMarkersAnimated(layerName);
      }

      this.announceToScreenReader(`${displayName} layer hidden`);
      this._handleDataLayerDashboard(layerName);
    } else {
      // Activate
      layerItem.classList.add("active");
      layerItem.setAttribute("aria-checked", "true");
      this.activeDataLayers[layerName] = true;

      if (layerName === "waterResources") {
        MapController.showWaterResourceLayer();
        if (!App.state.qaMode) {
          MapController.flyToStep(CAMERA_STEPS.A2_water);
          this.showWaterResourcesEvidence();
        }
      } else if (layerName === "airlineRoutes") {
        MapController.showAirlineRoutes();
        if (!App.state.qaMode) {
          MapController.flyToStep(CAMERA_STEPS.A3_location);
          this.showAllAirlineRoutes();
        }
      } else if (layerName === "electricity") {
        const layerData = AppData.dataLayers[layerName];
        if (layerData) {
          if (!App.state.qaMode) MapController.savePreDataLayerView();
          MapController.showDataLayerMarkers(layerName, layerData);
          MapController.showKyushuEnergy();
          if (!App.state.qaMode) this.showDataLayerPanel(layerName, layerData);
        }
      } else if (layerName === "governmentChain") {
        // On the government step, restore active level; otherwise show chain
        if (
          App &&
          App.state &&
          App.state.activeGovernmentLevels &&
          App.state.activeGovernmentLevels.length > 0
        ) {
          App.state.activeGovernmentLevels.forEach((lvl) =>
            MapController.showGovernmentLevel(lvl),
          );
        } else {
          MapController.showGovernmentChain();
        }
        if (!App.state.qaMode) {
          MapController.flyToStep(CAMERA_STEPS.A4_government);
        }
      } else if (layerName === "scienceParkClusters") {
        MapController.showSciencePark({ skipCircles: App.state.qaMode });
      } else if (layerName === "talentPipeline") {
        MapController.showTalentPipeline({ skipFly: App.state.qaMode });
      } else if (layerName === "futureOutlook") {
        MapController.showFutureZones();
        MapController.showInfrastructureRoads({ skipFly: App.state.qaMode });
      } else if (layerName === "investmentZones") {
        MapController.showInvestmentZones();
      } else if (layerName === "properties") {
        MapController.showPropertyMarkers();
      } else if (layerName === "railCommute") {
        MapController.showRailCommute();
      } else if (layerName === "infraPlan") {
        MapController.showInfraPlan();
      } else if (isMapLayer) {
        MapController.ensureLayerMarkers(layerName, {
          skipFitBounds: App.state.qaMode,
          skipCircles: App.state.qaMode,
        });
      } else {
        // Standard data layer
        const layerData = AppData.dataLayers[layerName];
        if (layerData) {
          MapController.showDataLayerMarkers(layerName, layerData);
          this.showDataLayerPanel(layerName, layerData);
        }
      }

      this.announceToScreenReader(`${displayName} layer shown`);
      this._handleDataLayerDashboard(layerName);
    }
  },

  /**
   * Show JASM ESG report evidence in the right panel for water resources
   */
  showWaterResourcesEvidence() {
    const water = AppData.resources.water;
    const content = `
            ${panelHeader("JASM ESG report", "Water resources", water.description)}
            <div class="evidence-image-container" style="margin-top: var(--space-4); cursor: pointer;" onclick="UI.showEvidenceLightbox('assets/use-case-images/evidence-renewable-energy.webp', 'JASM ESG report - green power and sustainability section')">
                <img src="assets/use-case-images/evidence-renewable-energy.webp"
                     alt="JASM ESG report - green power and sustainability section"
                     style="width: 100%; border-radius: var(--radius-medium); border: 1px solid var(--color-border);" />
            </div>
            <div class="panel-bento-stats" style="margin-top: var(--space-4);">
                ${water.stats
                  .map(
                    (stat) => `
                    <div class="panel-bento-stat">
                        <div class="panel-bento-stat-value">${stat.value}</div>
                        <div class="panel-bento-stat-label">${stat.label}</div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;

    this.showPanel(content);
  },

  /**
   * Show full-view of JASM ESG evidence document
   */
  showWaterEvidenceFullView() {
    this.showGallery(
      "JASM ESG report",
      "image",
      "Green power and sustainability section",
      "assets/use-case-images/evidence-renewable-energy.webp",
    );
  },

  /**
   * Get display name for layer (for screen reader announcements)
   */
  getLayerDisplayName(layerName) {
    const names = {
      properties: "Properties",
      companies: "Corporate sites",
      sciencePark: "Science park",
      baseMap: "Base map",
      trafficFlow: "Traffic flow",
      railCommute: "Rail commute",
      infraPlan: "Infrastructure plan",
      electricity: "Electricity usage",
      employment: "Employment",
      infrastructure: "Infrastructure roads",
      realEstate: "Real estate",
      riskyArea: "Risky area",
      airlineRoutes: "Strategic location",
      governmentChain: "Government support",
      waterResources: "Water resources",
      scienceParkClusters: "Science park clusters",
      talentPipeline: "Talent pipeline",
      futureOutlook: "Future outlook",
      investmentZones: "Investment zones",
    };
    return names[layerName] || layerName;
  },

  /**
   * Show data layer info panel
   * @param {string} layerName - Layer identifier
   * @param {Object} layerData - Layer data from AppData
   */
  showDataLayerPanel(layerName, layerData) {
    const statsHtml = statGrid(layerData.stats);

    const markersListHtml = layerData.markers
      ? `
            <div class="data-layer-markers-list">
                <h4>Locations</h4>
                ${layerData.markers
                  .map(
                    (marker) => `
                    <button class="data-layer-marker-item" onclick="UI.focusDataLayerMarker('${layerName}', '${marker.id}')">
                        <span class="marker-name">${marker.name}</span>
                    </button>
                `,
                  )
                  .join("")}
            </div>
        `
      : "";

    // Kyushu energy facilities section for electricity layer (disclosure groups)
    let kyushuEnergyHtml = "";
    if (layerName === "electricity" && AppData.kyushuEnergy) {
      const energy = AppData.kyushuEnergy;
      const iconMap = {
        solar:
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
        wind: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
        nuclear:
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2a7 7 0 0 0-5.4 11.5"/><path d="M12 2a7 7 0 0 1 5.4 11.5"/><path d="M7 20.7a7 7 0 0 0 10 0"/></svg>',
      };
      const colorMap = {
        solar: "#ff9500",
        wind: "#5ac8fa",
        nuclear: "#ff3b30",
      };
      const labelMap = { solar: "Solar", wind: "Wind", nuclear: "Nuclear" };

      const renderEnergyGroup = (type, facilities) => {
        const groupId = `datalayer-energy-${type}`;
        return `
                    <div class="disclosure-group" data-group-id="${groupId}">
                        <button class="disclosure-header" aria-expanded="false" onclick="UI.toggleDisclosureGroup('${groupId}')">
                            ${disclosureTriangle()}
                            <span class="disclosure-icon" style="color: ${colorMap[type]}">${iconMap[type]}</span>
                            <span class="disclosure-title">${labelMap[type]}</span>
                            <span class="disclosure-badge">${facilities.length}</span>
                        </button>
                        <div class="disclosure-content">
                            ${facilities
                              .map(
                                (f) => `
                                <div class="disclosure-item energy-facility-item" data-station-id="${f.id}" data-station-type="${type}" style="display: flex; justify-content: space-between; padding: var(--space-2) var(--space-4); font-size: var(--text-sm);" onclick="UI.focusEnergyStation('${f.id}', '${type}')">
                                    <span style="color: var(--color-text-secondary);">${f.name}</span>
                                    <span style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">${f.capacity}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `;
      };

      kyushuEnergyHtml = `
                <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--color-bg-tertiary);">
                    <h4 style="font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">Kyushu energy facilities</h4>
                    ${renderEnergyGroup("solar", energy.solar)}
                    ${renderEnergyGroup("wind", energy.wind)}
                    ${renderEnergyGroup("nuclear", energy.nuclear)}
                </div>
            `;
    }

    const content = `
            ${panelHeader("Data layer", layerData.name, layerData.description)}
            ${statsHtml}
            ${markersListHtml}
            ${kyushuEnergyHtml}
        `;

    this.showPanel(content);
  },

  /**
   * Handle dashboard auto-open when data layers are toggled while chatbox is closed.
   * Journey takes priority when chatbox is open.
   */
  _handleDataLayerDashboard() {
    // In Q&A mode, always use the tabbed QA panel
    if (App.state.qaMode) {
      const activeKeys = Object.keys(this.activeDataLayers);
      if (activeKeys.length === 0) {
        this.hidePanel();
        return;
      }
      this._renderQAPanel();
      return;
    }

    const chatbox = this.elements.chatbox;
    const chatboxOpen = chatbox && !chatbox.classList.contains("hidden");

    // Journey takes priority when chatbox is open
    if (chatboxOpen) return;

    // Check if any data layers are active
    const activeKeys = Object.keys(this.activeDataLayers);
    if (activeKeys.length === 0) {
      // No layers active; close dashboard if it was showing data layer content
      if (this._dataLayerDashboardActive) {
        this._dataLayerDashboardActive = false;
        this.hidePanel();
      }
      return;
    }

    // Auto-open dashboard with data layer sections
    this._dataLayerDashboardActive = true;
    this._renderDataLayerDashboard();
  },

  /**
   * Render scrollable dashboard with disclosure sections for each active data layer.
   */
  _renderDataLayerDashboard() {
    const activeKeys = Object.keys(this.activeDataLayers);
    if (activeKeys.length === 0) return;

    let sectionsHtml = "";
    activeKeys.forEach((layerName) => {
      const displayName = this.getLayerDisplayName(layerName);

      // Try to get data from AppData.dataLayers, or build minimal section
      const layerData = AppData.dataLayers[layerName];
      const description = layerData ? layerData.description : "";
      const statsHtml =
        layerData && layerData.stats
          ? statGrid(layerData.stats, "padding: var(--space-2) var(--space-4);")
          : "";

      const markersHtml =
        layerData && layerData.markers
          ? layerData.markers
              .map(
                (m) => `
                <button class="data-layer-marker-item" onclick="UI.focusDataLayerMarker('${layerName}', '${m.id}')">
                    <span class="marker-name">${m.name}</span>
                </button>
            `,
              )
              .join("")
          : "";

      const groupId = `dashboard-layer-${layerName}`;
      sectionsHtml += `
                <div class="disclosure-group expanded" data-group-id="${groupId}">
                    <button class="disclosure-header" aria-expanded="true" onclick="UI.toggleDisclosureGroup('${groupId}')">
                        ${disclosureTriangle()}
                        <span class="disclosure-title">${displayName}</span>
                    </button>
                    <div class="disclosure-content">
                        ${description ? `<p style="padding: var(--space-2) var(--space-4); font-size: var(--text-sm); color: var(--color-text-secondary);">${description}</p>` : ""}
                        ${statsHtml}
                        ${markersHtml ? `<div class="data-layer-markers-list" style="padding: var(--space-2) var(--space-4);">${markersHtml}</div>` : ""}
                    </div>
                </div>
            `;
    });

    const content = `
            ${panelHeader("Data layers", "Active layers")}
            <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-4);">
                ${sectionsHtml}
            </div>
        `;

    this.showPanel(content);
  },

  // ================================
  // Q&A TABBED PANEL
  // ================================

  /**
   * Render a tabbed right panel for Q&A mode showing active layers as tabs.
   */
  _renderQAPanel() {
    const activeKeys = Object.keys(this.activeDataLayers);
    if (activeKeys.length === 0) {
      this.hidePanel();
      return;
    }

    // Default to first active tab if current selection is no longer active
    if (!this._qaActiveTab || !this.activeDataLayers[this._qaActiveTab]) {
      this._qaActiveTab = activeKeys[0];
    }

    const tabsHtml = activeKeys
      .map((key) => {
        const label = this.getLayerDisplayName(key);
        const active = key === this._qaActiveTab ? " active" : "";
        return `<button class="qa-tab${active}" data-layer="${key}" onclick="UI._switchQATab('${key}')">${label}</button>`;
      })
      .join("");

    const bodyHtml = this._getQATabContent(this._qaActiveTab);

    const content = `
      <div class="subtitle">Q&amp;A mode</div>
      <h2>Layer details</h2>
      <div class="qa-panel-tabs">${tabsHtml}</div>
      <div class="qa-tab-body">${bodyHtml}</div>
    `;

    this.showPanel(content);

    // Render chart if companies tab is active
    if (this._qaActiveTab === "companies") {
      setTimeout(() => this.renderInvestmentChart(), 50);
    }
  },

  /**
   * Switch the active tab in Q&A mode panel.
   */
  _switchQATab(layerKey) {
    this._qaActiveTab = layerKey;
    this._renderQAPanel();
  },

  /**
   * Get panel body HTML for a given layer key in Q&A mode.
   * Delegates to existing data or builds from AppData.dataLayers.
   */
  _getQATabContent(layerKey) {
    // Water resources - JASM ESG evidence
    if (layerKey === "waterResources") {
      const water = AppData.resources.water;
      return `
        <p>${water.description}</p>
        <div class="evidence-image-container" style="margin-top: var(--space-4); cursor: pointer;" onclick="UI.showEvidenceLightbox('assets/use-case-images/evidence-renewable-energy.webp', 'JASM ESG report')">
          <img src="assets/use-case-images/evidence-renewable-energy.webp" alt="JASM ESG report" style="width: 100%; border-radius: var(--radius-medium); border: 1px solid var(--color-border);" />
        </div>
        <div class="panel-bento-stats" style="margin-top: var(--space-4);">
          ${water.stats.map((s) => `<div class="panel-bento-stat"><div class="panel-bento-stat-value">${s.value}</div><div class="panel-bento-stat-label">${s.label}</div></div>`).join("")}
        </div>
      `;
    }

    // Airline routes - destination summary
    if (layerKey === "airlineRoutes") {
      const routes = AppData.airlineRoutes;
      const activeCount = routes.destinations
        ? routes.destinations.filter((d) => d.status === "active").length
        : 0;
      const destList = routes.destinations
        ? routes.destinations
            .map(
              (d) =>
                `<div class="data-layer-marker-item" style="cursor: default;"><span class="marker-name">${d.name} (${d.code})</span><span style="color: var(--color-text-tertiary); font-size: var(--text-sm);">${d.flightTime}</span></div>`,
            )
            .join("")
        : "";
      return `
        <p>Direct flights from ${routes.origin.name} (${routes.origin.code}) connect Kumamoto to major semiconductor hubs across Asia.</p>
        <div class="panel-bento-stats" style="margin-top: var(--space-4);">
          <div class="panel-bento-stat"><div class="panel-bento-stat-value">${activeCount}</div><div class="panel-bento-stat-label">Active routes</div></div>
          <div class="panel-bento-stat"><div class="panel-bento-stat-value">${routes.destinations ? routes.destinations.length : 0}</div><div class="panel-bento-stat-label">Total destinations</div></div>
        </div>
        <div class="data-layer-markers-list" style="margin-top: var(--space-4);">${destList}</div>
      `;
    }

    // Government chain - support levels
    if (layerKey === "governmentChain") {
      const gov = AppData.governmentChain;
      const levelsList = gov.levels
        ? gov.levels
            .map(
              (lvl) =>
                `<div class="data-layer-marker-item" style="cursor: default;"><span class="marker-name">${lvl.name}</span><span style="color: var(--color-text-tertiary); font-size: var(--text-sm);">${lvl.stats[0].value}</span></div>`,
            )
            .join("")
        : "";
      return `
        <p>${gov.intro}</p>
        <div class="data-layer-markers-list" style="margin-top: var(--space-4);">${levelsList}</div>
      `;
    }

    // Corporate investment - chart
    if (layerKey === "companies") {
      return `
        <p>Total corporate investment in the Kumamoto semiconductor corridor.</p>
        <div class="chart-container" style="height: 280px; margin: var(--space-6) 0;">
          <canvas id="investment-chart" role="img" aria-label="Corporate investment comparison chart"></canvas>
        </div>
        <div id="investment-chart-table"></div>
        ${statGrid([
          { value: "¥2.6T+", label: "Total investment" },
          { value: "9,600+", label: "Direct jobs" },
        ])}
      `;
    }

    // Properties - list
    if (layerKey === "properties" && AppData.properties) {
      const list = AppData.properties
        .map(
          (p) =>
            `<button class="data-layer-marker-item" onclick="UI.showPropertyDetail && UI.showPropertyDetail('${p.id}')"><span class="marker-name">${p.name}</span></button>`,
        )
        .join("");
      return `
        <p>Investment properties in the Kumamoto corridor.</p>
        <div class="data-layer-markers-list" style="margin-top: var(--space-4);">${list}</div>
      `;
    }

    // Fallback: render from AppData.dataLayers
    const layerData = AppData.dataLayers[layerKey];
    if (layerData) {
      const statsHtml = layerData.stats
        ? statGrid(layerData.stats, "margin-top: var(--space-4);")
        : "";
      const markersHtml = layerData.markers
        ? `<div class="data-layer-markers-list" style="margin-top: var(--space-4);">${layerData.markers.map((m) => `<button class="data-layer-marker-item" onclick="UI.focusDataLayerMarker('${layerKey}', '${m.id}')"><span class="marker-name">${m.name}</span></button>`).join("")}</div>`
        : "";
      return `
        <p>${layerData.description}</p>
        ${statsHtml}
        ${markersHtml}
      `;
    }

    return `<p>No details available for this layer.</p>`;
  },

  /**
   * Focus on a specific data layer marker
   * @param {string} layerName - Layer identifier
   * @param {string} markerId - Marker identifier
   */
  focusDataLayerMarker(layerName, markerId) {
    const layerData = AppData.dataLayers[layerName];
    if (!layerData) return;

    const marker = layerData.markers.find((m) => m.id === markerId);
    if (!marker) return;

    // Pan map to marker
    MapController.focusDataLayerMarker(layerName, markerId);

    // Show marker detail panel
    this.showDataLayerMarkerDetail(layerName, layerData, marker);
  },

  /**
   * Show detail panel for a specific data layer marker
   */
  showDataLayerMarkerDetail(_layerName, layerData, marker) {
    // Build dynamic stats based on marker properties
    let detailsHtml = '<div class="property-details">';

    // Add all properties except id, coords, and name
    Object.entries(marker).forEach(([key, value]) => {
      if (!["id", "coords", "name"].includes(key)) {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        detailsHtml += `
                    <div class="property-detail-row">
                        <span class="property-detail-label">${label}</span>
                        <span class="property-detail-value">${value}</span>
                    </div>
                `;
      }
    });

    detailsHtml += "</div>";

    const content = `
            ${panelHeader(layerData.name, marker.name)}
            ${detailsHtml}
        `;

    this.showPanel(content);
  },
};
