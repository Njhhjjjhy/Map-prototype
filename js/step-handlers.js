import { STEPS, AppData } from "./data/index.js";
import { CAMERA_STEPS, MAP_COLORS, MapController } from "./map/index.js";
import { UI } from "./ui/index.js";
import { t } from "./i18n/index.js";
import {
  panelHeader,
  bentoStats,
  evidenceImage,
  toggleRow,
  evidenceCard,
  continueBtn,
  proseBlock,
  sectionLabel,
  statSection,
  listSection,
  evidenceBlockHtml,
} from "./shared/templates.js";
import { buildCompactTabsHtml } from "./ui/inspector-tabs.js";

export const stepHandlers = {
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

        if (groupId === "grand-airport-group") {
          MapController.setScienceParkCircleVisible(false);
          // Auto-toggle airport access as the default child
          this.state.activeDevelopmentChildren = ["ga-airport-access"];
          this._showDevelopmentMapElement("ga-airport-access");
        } else if (groupId === "science-park-group") {
          MapController.setScienceParkCircleVisible(true);
        }
      }

      // Always fly camera when expanding grand airport group
      const isExpanding = this.state.expandedGroups.includes(groupId);
      if (groupId === "grand-airport-group" && isExpanding) {
        MapController.flyToStep({
          center: [130.7969, 32.7976],
          zoom: 12.2,
          pitch: 61,
          bearing: 25,
          duration: 2000,
        });
      }

      this._renderDevelopmentDashboard();
    }

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
      // Auto-show all 3 energy types on entry (playground convention:
      // panel is informational, all relevant map state shown together).
      this.state.activeEnergyTypes = [];
      MapController.flyToStep(CAMERA_STEPS.A2_power);
      ["solar", "wind", "nuclear"].forEach((type) => {
        this.state.activeEnergyTypes.push(type);
        MapController.showEnergyType(type);
      });
      UI.showPowerSourcesPanel();

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
   * Single-select energy type via tab click. Deactivates any other
   * active types and activates the chosen one. Called by panel-a-tab
   * onclick handlers in the power sources panel.
   */
  selectEnergyType(type) {
    if (this.state.activeEnergyTypes.includes(type)) return;
    [...this.state.activeEnergyTypes]
      .filter((t) => t !== type)
      .forEach((t) => this.toggleEnergyType(t));
    this.toggleEnergyType(type);
  },

  /**
   * Single-select investment zone via tab click.
   */
  selectInvestmentZone(zoneId) {
    if (this.state.activeInvestmentZones.includes(zoneId)) return;
    [...this.state.activeInvestmentZones]
      .filter((z) => z !== zoneId)
      .forEach((z) => this.toggleInvestmentZone(z));
    this.toggleInvestmentZone(zoneId);
  },

  /**
   * Single-select future layer via tab click.
   */
  selectFutureLayer(layerName) {
    if (this.state.activeFutureLayers?.includes(layerName)) return;
    [...(this.state.activeFutureLayers || [])]
      .filter((l) => l !== layerName)
      .forEach((l) => this.toggleFutureLayer(l));
    this.toggleFutureLayer(layerName);
  },

  /**
   * Single-select development child via tab click (science park /
   * grand airport sub-items).
   */
  selectDevelopmentChild(childId) {
    if (this.state.activeDevelopmentChildren?.includes(childId)) return;
    [...(this.state.activeDevelopmentChildren || [])]
      .filter((c) => c !== childId)
      .forEach((c) => this.toggleDevelopmentChild(c));
    this.toggleDevelopmentChild(childId);
  },

  /**
   * Single-select university via tab click.
   */
  selectUniversity(universityId) {
    if (this.state.activeUniversities?.includes(universityId)) return;
    [...(this.state.activeUniversities || [])]
      .filter((u) => u !== universityId)
      .forEach((u) => this.toggleUniversity(u));
    this.toggleUniversity(universityId);
  },

  /**
   * Single-select employer via tab click.
   */
  selectEmployer(employerId) {
    if (this.state.activeEmployers?.includes(employerId)) return;
    [...(this.state.activeEmployers || [])]
      .filter((e) => e !== employerId)
      .forEach((e) => this.toggleEmployer(e));
    this.toggleEmployer(employerId);
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
    // Re-render panel to reflect toggle state
    UI.updateGovernmentPanel(this.state.activeGovernmentLevels);
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

  // --- Step 3: Government ---
  _handleGovernmentSubItem(itemId) {
    // Redirect to toggle for the new toggle-based pattern
    this.toggleGovernmentLevel(itemId);
  },

  // --- Step 5: Science Park + Grand Airport ---

  /**
   * Show the future outlook dashboard in the right panel.
   */
  _renderFutureOutlookDashboard() {
    if (!this.state.activeFutureLayers) {
      this.state.activeFutureLayers = [];
    }
    // Auto-activate all 5 future overlay layers on step entry. Playground
    // convention: the panel is informational, all relevant map state shown
    // together.
    const allFutureLayers = [
      "futureSciencePark",
      "futureAirport",
      "futureGovZones",
      "futureRoads",
      "futureTrafficFlow",
    ];
    allFutureLayers.forEach((layer) => {
      if (!this.state.activeFutureLayers.includes(layer)) {
        this.toggleFutureLayer(layer);
      }
    });
    UI.showFutureOutlookPanel();
  },

  /**
   * Toggle a future layer on/off (multi-select).
   * Called from the future outlook panel toggles.
   */
  toggleFutureLayer(layerName) {
    if (!this.state.activeFutureLayers) {
      this.state.activeFutureLayers = [];
    }

    const idx = this.state.activeFutureLayers.indexOf(layerName);

    if (idx >= 0) {
      this.state.activeFutureLayers.splice(idx, 1);
      if (layerName === "futureSciencePark") {
        MapController._cleanupScienceParkTooltips();
        MapController._removeLayerGroup("sciencePark");
      } else if (layerName === "futureAirport") {
        MapController.hideAirportAccessRoutes();
        MapController.hideRailwayStations();
      } else if (layerName === "futureGovZones") {
        MapController.hideZonePlanHighlight();
      } else if (layerName === "futureRoads") {
        MapController.hideRoadExtensions();
        MapController._hideFutureRoadOverlays();
        MapController.hideInfrastructureRoads();
      } else if (layerName === "futureTrafficFlow") {
        MapController.hideDataLayerMarkers("trafficFlow");
      }
    } else {
      this.state.activeFutureLayers.push(layerName);
      if (layerName === "futureSciencePark") {
        MapController.showSciencePark({ skipFly: true });
      } else if (layerName === "futureAirport") {
        MapController.showAirportAccessRoutes();
        MapController.showRailwayStations();
      } else if (layerName === "futureGovZones") {
        const govZone = AppData.scienceParkZonePlans.find(
          (z) => z.id === "sp-gov-zone",
        );
        if (govZone) {
          MapController.showZonePlanHighlight(govZone, { skipFly: true });
        }
      } else if (layerName === "futureRoads") {
        MapController.showRoadExtensions();
        MapController._showFutureRoadOverlays();
        MapController.showInfrastructureRoads({ skipFly: true });
      } else if (layerName === "futureTrafficFlow") {
        const trafficData = AppData.dataLayers.trafficFlow;
        if (trafficData) {
          MapController.showDataLayerMarkers("trafficFlow", trafficData);
        }
      }
    }

    UI.updateFutureOutlookPanel(this.state.activeFutureLayers);
  },

  _renderDevelopmentDashboard() {
    const activeGroup = this.state.activeParentGroup || "science-park-group";
    const tabs = [
      {
        id: "science-park-group",
        label: t("Science park"),
        onclick: `App.setDevelopmentParentGroup('science-park-group')`,
      },
      {
        id: "grand-airport-group",
        label: t("Grand airport"),
        onclick: `App.setDevelopmentParentGroup('grand-airport-group')`,
      },
    ];
    const activeIndex = tabs.findIndex((t) => t.id === activeGroup);

    const bodyHtml =
      activeGroup === "grand-airport-group"
        ? this._buildAirportDashboardSection()
        : this._buildSciencePartDashboardSection();

    UI.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 6 · ${t("Development plan")}`,
        title: t("Science park and grand airport"),
        tabs,
        activeIndex: Math.max(0, activeIndex),
        bodyHtml,
      }),
    );
  },

  /**
   * Switch which parent dashboard group is active (Science park or
   * Grand airport) via panel-a-tab click. Re-renders the panel body.
   */
  setDevelopmentParentGroup(groupId) {
    if (this.state.activeParentGroup === groupId) return;
    this.state.activeParentGroup = groupId;
    if (!this.state.subItemsExplored.includes(groupId)) {
      this.state.subItemsExplored.push(groupId);
    }
    this._renderDevelopmentDashboard();
  },

  _buildSciencePartDashboardSection() {
    const targetIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
    const mapPinIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';

    return `
      ${proseBlock(t("The Kumamoto Prefectural Government has designated this area as a special semiconductor development zone, offering tax incentives, streamlined permitting, and infrastructure investments totaling ¥4.8 trillion."))}
      ${statSection({
        label: t("Science park overview"),
        items: [
          { label: t("Government investment"), value: "¥4.8T", hero: true },
          { label: t("Completion target"), value: "2040" },
          { label: t("Projected new jobs"), value: "50,000" },
          { label: t("Major facilities planned"), value: "12" },
        ],
      })}
      ${listSection({
        label: t("Zone plans"),
        items: [
          {
            icon: targetIcon,
            title: t("Government zone plan"),
            sub: t("560 ha designated, ¥2T public investment."),
            value: "560ha",
          },
          {
            icon: mapPinIcon,
            title: t("Kikuyo long-term plan"),
            sub: t("Land readjustment around JASM."),
          },
          {
            icon: mapPinIcon,
            title: t("Ozu long-term plan"),
            sub: t("Industrial expansion and airport access."),
          },
        ],
      })}
    `;
  },

  _buildAirportDashboardSection() {
    const planeIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>';
    const trainIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/></svg>';
    const routeIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>';
    const clockIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

    return `
      ${proseBlock(t("A new 6.8 km rail connection will link Aso Kumamoto Airport directly to the JR Hohi Line, with an estimated travel time of 44 minutes from Kumamoto Station."))}
      ${statSection({
        label: t("Grand airport vision"),
        items: [
          { label: t("New rail link"), value: "6.8km" },
          { label: t("Rail investment"), value: "¥41B" },
          { label: t("Station to airport"), value: "44min", hero: true },
          { label: t("Strategic plan"), value: t("4 pillars") },
        ],
      })}
      ${listSection({
        label: t("Connectivity"),
        items: [
          {
            icon: planeIcon,
            title: t("Airport access"),
            sub: t("Direct rail and road links from corridor."),
          },
          {
            icon: trainIcon,
            title: t("New railway stations"),
            sub: t("Stations between Mitsuriki and Haramizu."),
          },
          {
            icon: routeIcon,
            title: t("Road extensions"),
            sub: t("Naka-Kyushu Cross Road segments."),
          },
          {
            icon: clockIcon,
            title: t("10-20 minute concept"),
            sub: t("Anywhere in corridor to the airport."),
          },
        ],
      })}
    `;
  },

  /**
   * Show landmark detail in the right panel when a landmark marker is clicked.
   */
  showAirportLandmarkDetail(landmarkId) {
    const data = AppData.grandAirportData?.airportAccessRoutes;
    const lm = data?.landmarks?.find((l) => l.id === landmarkId);
    if (!lm) return;

    const items = (lm.stats || []).map((s) => ({ label: s.label, value: s.value }));
    UI.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `<span style="color: ${lm.color};">${t("Airport access")}</span>`,
        title: lm.name || "",
        bodyHtml: `
          ${proseBlock(lm.description || "")}
          ${items.length ? statSection({ items }) : ""}
        `,
      }),
    );
  },

  /**
   * Show route line detail in the right panel when a route line is clicked.
   */
  showAirportLineDetail(routeId) {
    const routes = AppData.grandAirportData?.airportAccessRoutes?.routes;
    const route = routes?.find((r) => r.id === routeId);
    if (!route) return;

    const items = (route.stats || []).map((s) => ({ label: s.label, value: s.value }));
    UI.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `<span style="color: ${route.color};">${t("Airport access")}</span>`,
        title: route.name || "",
        bodyHtml: `
          ${proseBlock(route.description || "")}
          ${items.length ? statSection({ items }) : ""}
        `,
      }),
    );
  },

  /**
   * Show JR Hohi Line detail in the right panel when the orange line is clicked.
   */
  showHohiLineDetail() {
    const route = AppData.grandAirportData?.airportAccessRoutes?.routes?.find(
      (r) => r.id === "hohi-line",
    );
    if (!route) return;

    const items = (route.stats || []).map((s) => ({ label: s.label, value: s.value }));
    UI.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `<span style="color: #ff9500;">${t("New railway stations")}</span>`,
        title: route.name || "",
        bodyHtml: `
          ${proseBlock(route.description || "")}
          ${items.length ? statSection({ items }) : ""}
        `,
      }),
    );
  },

  /**
   * Show road extension detail in the right panel when a road line is clicked.
   */
  showRoadExtensionDetail(roadId) {
    const roads = AppData.grandAirportData?.roadExtensions;
    const road = roads?.find((r) => r.id === roadId);
    if (!road) return;

    const color = road.color || "#e63f5a";
    const items = (road.stats || []).map((s) => ({ label: s.label, value: s.value }));
    UI.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `<span style="color: ${color};">${t("Road extensions")}</span>`,
        title: road.name || "",
        bodyHtml: `
          ${proseBlock(road.description || "")}
          ${items.length ? statSection({ items }) : ""}
        `,
      }),
    );
  },

  /**
   * Show railway station detail in the right panel when a station marker is clicked.
   */
  showRailwayStationDetail(stationId) {
    const data = AppData.grandAirportData?.railway;
    const station = data?.stations?.find((s) => s.id === stationId);
    if (!station) return;

    const color =
      station.type === "planned" || station.type === "proposed"
        ? "#ff9500"
        : "#6e7073";
    const items = (station.stats || []).map((s) => ({ label: s.label, value: s.value }));
    UI.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `<span style="color: ${color};">${t("New railway stations")}</span>`,
        title: station.name || "",
        bodyHtml: `
          ${proseBlock(station.description || "")}
          ${items.length ? statSection({ items }) : ""}
        `,
      }),
    );
  },

  /**
   * Toggle a development child (multi-select).
   * Each child toggles independently. Activating a science park zone
   * flies the camera to that zone's position.
   */
  /**
   * Select a government zone cluster and update the dashboard.
   * Called from Mapbox GL fill layer click handlers.
   */
  selectGovZoneCluster(clusterId) {
    this.state.selectedGovZoneCluster = clusterId;
    this.state.selectedGovZoneInfra = null;
    MapController.setGovZoneClusterHighlight(clusterId);

    // Sweep camera to the cluster's overhead position
    const govZone = (AppData.scienceParkZonePlans || []).find(
      (z) => z.id === "sp-gov-zone",
    );
    const cluster = govZone?.industrialZones?.find((iz) => iz.id === clusterId);
    if (cluster?.camera) {
      MapController.flyToStep(cluster.camera);
    }

    this._renderDevelopmentDashboard();
  },

  /**
   * Select a government zone infrastructure item (road, etc.) and update the dashboard.
   * Called from Mapbox GL line layer click handlers.
   */
  selectGovZoneInfra(infraId) {
    this.state.selectedGovZoneInfra = infraId;
    this.state.selectedGovZoneCluster = null;
    MapController.setGovZoneClusterHighlight(null);
    this._renderDevelopmentDashboard();
  },

  toggleDevelopmentChild(childId) {
    const active = this.state.activeDevelopmentChildren;
    const idx = active.indexOf(childId);

    if (idx !== -1) {
      // Turn off this child; clear selections when gov-zone is deactivated
      if (childId === "sp-gov-zone") {
        this.state.selectedGovZoneCluster = null;
        this.state.selectedGovZoneInfra = null;
        MapController.setGovZoneClusterHighlight(null);
      }
      active.splice(idx, 1);
      this._removeDevelopmentMapElement(childId);
    } else {
      // Turn on this child
      active.push(childId);
      this._showDevelopmentMapElement(childId);
    }

    // Show circles only when no children are active
    if (this.state.activeParentGroup === "science-park-group") {
      MapController.setScienceParkCircleVisible(active.length === 0);
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
    } else if (childId === "ga-ten-twenty-concept") {
      MapController.showTenTwentyConcept();
      if (gaCamera) MapController.flyToStep(gaCamera);
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
      MapController.hideZonePlanHighlight();
      return;
    }

    if (childId === "ga-airport-access") {
      MapController.hideAirportAccessRoutes();
    } else if (childId === "ga-railway-stations") {
      MapController.hideRailwayStations();
    } else if (childId === "ga-road-extensions") {
      MapController.hideRoadExtensions();
    } else if (childId === "ga-ten-twenty-concept") {
      MapController.hideTenTwentyConcept();
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
    MapController.hideTenTwentyConcept();
  },

  // --- Step 7: Education ---
  // Single-select tab handler. Drives map state for the chosen tab and
  // re-renders the panel via UI.showEducationPanel().
  _handleEducationSubItem(itemId) {
    UI._educationActiveTab = itemId;
    if (itemId === "universities") {
      MapController.hideEmploymentMarkers();
      const institutions = AppData.talentPipeline?.institutions || [];
      this.state.activeUniversities = institutions.map((inst) => inst.id);
      MapController.showTalentPipeline({ skipFly: true });
    } else if (itemId === "employment") {
      MapController.hideTalentPipeline();
      MapController.showEmploymentMarkers();
      this.state.activeEmployers = [];
    }
    UI.showEducationPanel();
  },

  // Marker-click handlers for Step 7. Keep these even though the panel
  // no longer surfaces them as toggles — map/properties.js calls them
  // when the user clicks a university or employer marker.
  toggleUniversity(universityId) {
    const idx = this.state.activeUniversities.indexOf(universityId);
    if (idx >= 0) {
      this.state.activeUniversities.splice(idx, 1);
    } else {
      this.state.activeUniversities.push(universityId);
      const institutions = AppData.talentPipeline?.institutions || [];
      const inst = institutions.find((i) => i.id === universityId);
      if (inst && inst.coords) {
        MapController.flyToStep({
          center: MapController._toMapbox(inst.coords),
          zoom: 11,
          pitch: 35,
          bearing: 0,
          duration: 1500,
        });
      }
    }
    MapController.updateTalentArcVisibility(this.state.activeUniversities);
  },

  toggleEmployer(employerId) {
    const idx = this.state.activeEmployers.indexOf(employerId);
    if (idx >= 0) {
      this.state.activeEmployers.splice(idx, 1);
    } else {
      this.state.activeEmployers.push(employerId);
      const companies = AppData.employmentData?.companies || [];
      const company = companies.find((c) => c.id === employerId);
      if (company && company.coords) {
        MapController.flyToStep({
          center: MapController._toMapbox(company.coords),
          zoom: 13,
          pitch: 35,
          bearing: 0,
          duration: 1500,
        });
      }
    }
  },

  // --- Step 8: Investment zones ---
  _handleInvestmentZoneSubItem(itemId) {
    const zoneData = {
      "central-city-zone": {
        name: t("Central city"),
        details: [
          [t("Product type"), t("RC mansion condominiums and accommodation")],
          [t("Connection"), t("Shinkansen 30-minute connection to Hakata")],
          [
            t("Role"),
            t("Kyushu-level business support center, suitable for Japanese corporate senior executive families"),
          ],
        ],
        coords: [32.8016, 130.7014],
      },
      "middle-zone": {
        name: t("Middle zone"),
        details: [
          [
            t("Product type"),
            t("High-spec detached house rentals or renovations upgraded to expatriate standard"),
          ],
          [
            t("Opportunity"),
            t("Large retail drives lifestyle density but internationalized services (bilingual clinics, international preschools) still being built out"),
          ],
        ],
        coords: [32.8364, 130.7575],
      },
      "jasm-zone": {
        name: t("JASM"),
        details: [
          [
            t("Product type"),
            t("Corporate RC condominiums and 3-4LDK detached houses"),
          ],
          [
            t("Target tenants"),
            t("Single engineers, long-term secondees, short-to-medium-term secondees"),
          ],
          [
            t("Two demand waves"),
            t("Wave 1 now (construction + early Fab 1 occupants), wave 2 ~2027 (Fab 2 brings higher-income engineers with higher housing quality expectations)"),
          ],
          [
            t("Supply gap"),
            t("Supply catches up to demand around 2028-2029"),
          ],
        ],
        coords: [32.8678, 130.8419],
        showLogo: true,
      },
    };
    const zone = zoneData[itemId];
    if (zone) {
      UI._investmentZoneActiveTab = itemId;
      UI.showInvestmentZonesOverviewPanel();

      // Show JASM logo marker on the map
      if (zone.showLogo) {
        MapController._removeLayerGroup("properties");
        const el = document.createElement("div");
        el.style.cssText =
          "width: 56px; height: 56px; background: white; border-radius: var(--radius-medium); box-shadow: var(--shadow-medium); display: flex; align-items: center; justify-content: center; padding: 6px;";
        el.innerHTML =
          '<img src="assets/Jasm-logo.svg" alt="JASM" style="width: 44px; height: 44px; object-fit: contain;">';
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(MapController._toMapbox(zone.coords))
          .addTo(MapController.map);
        MapController.markers["jasm-logo"] = marker;
        MapController._layerGroups.investmentZones.push("jasm-logo");
      }

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
      label: t("Kikuyo properties"),
      evidencePdf: "assets/pdfs/Kikuyo-evidence-rent-report.pdf",
      camera: {
        center: [130.83, 32.87],
        zoom: 12.5,
        pitch: 52,
        bearing: 20,
        ipad: {
          center: [130.91, 32.85],
          pitch: 35,
          bearing: 0,
        },
      },
    },
    "ozu-properties": {
      filter: "ozu",
      zoneId: "ozu-zone",
      label: t("Ozu properties"),
      evidencePdf: "assets/pdfs/Ozu-evidence-rent-report.pdf",
      camera: {
        center: [130.87, 32.865],
        zoom: 12.7,
        pitch: 52,
        bearing: 45,
        ipad: {
          center: [130.9377, 32.8789],
          zoom: 11.8,
          pitch: 50,
          bearing: 1,
        },
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
        ipad: zoneInfo.camera.ipad,
      });
    }

    // Show zone properties panel for individual drill-down
    UI.showZonePropertiesPanel(zoneInfo.label, zoneProps, {
      evidencePdf: zoneInfo.evidencePdf,
    });
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
   * Render the final step recap (no longer used - kept as data reference).
   */
  _renderFinalRecap() {
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
                <h3>${t("Journey complete")}</h3>
                <div class="journey-recap-checklist">
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${t("Natural advantages verified")}
                    </div>
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${t("4T+ yen government commitment")}
                    </div>
                    <div class="journey-recap-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${propCount} ${t("investment properties")}
                    </div>
                </div>
                <div class="journey-recap-headline">
                    <div class="journey-recap-headline-label">${t("Combined 5-year return")}</div>
                    <div class="journey-recap-headline-value">${formatYen(totalNetProfit)}</div>
                    <div class="journey-recap-headline-detail">${t("across the portfolio")}</div>
                </div>
                ${continueBtn("App.enterQAMode()", t("Enter Q&amp;A"))}
            </div>
        `;
  },


  // ================================
  // Per-step panel content
  // ================================

  /**
   * Render the right panel for a step.
   * Some steps auto-show a panel, others wait for sub-item clicks.
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

    const bodyHtml = `
      ${proseBlock(t("Select an item below to view detailed documentation."))}
      <div class="step-section">
        ${groupHtml}
      </div>
      <div class="step-section">
        ${evidenceBlockHtml({
          title: t("View all evidence"),
          description: t("Browse the full evidence library."),
          onclick: `UI.showEvidenceListPanel()`,
        })}
      </div>
    `;

    UI.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Supporting evidence"),
        title: group.title,
        bodyHtml,
      }),
    );
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
};
