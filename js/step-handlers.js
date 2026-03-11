import { STEPS, AppData } from "./data/index.js";
import { CAMERA_STEPS, MAP_COLORS, MapController } from "./map/index.js";
import { UI } from "./ui/index.js";
import {
  panelHeader,
  bentoStats,
  evidenceImage,
  toggleRow,
  evidenceCard,
  SVG_CHECKMARK,
  continueBtn,
  SVG_ARROW_RIGHT,
} from "./shared/templates.js";

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
   * Show the future outlook dashboard in the right panel.
   */
  _renderFutureOutlookDashboard() {
    if (!this.state.activeFutureLayers) {
      this.state.activeFutureLayers = [];
    }
    UI.showFutureOutlookPanel(this.state.activeFutureLayers);
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
          return toggleRow({
            id: z.id,
            label: z.name,
            color: z.strokeColor,
            icon,
            active: isActive,
            onclick: `App.toggleDevelopmentChild('${z.id}')`,
          });
        })
        .join("");

      // Build bottom section: Clusters when gov-zone is active, Evidence for other zones
      const govZoneActive = activeChildren.includes("sp-gov-zone");
      const otherActiveZones = activeChildren
        .filter((id) => id !== "sp-gov-zone")
        .map((id) => zones.find((z) => z.id === id))
        .filter(Boolean);

      let clustersHtml = "";
      if (govZoneActive) {
        const govZone = zones.find((z) => z.id === "sp-gov-zone");
        const clusters = govZone?.industrialZones || [];
        const infraLines = govZone?.infrastructureLines || [];

        const selectedClusterId = this.state.selectedGovZoneCluster;
        const selectedInfraId = this.state.selectedGovZoneInfra;
        const selectedCluster = clusters.find((c) => c.id === selectedClusterId);
        const selectedInfra = infraLines.find((l) => l.id === selectedInfraId);

        let clustersBodyHtml;
        if (selectedCluster) {
          const clusterImageHtml = selectedCluster.image
            ? `<div style="margin-top: var(--space-4); border-radius: var(--radius-medium); overflow: hidden; cursor: pointer;" onclick="UI.showEvidenceLightbox('${selectedCluster.image}', '${selectedCluster.name.replace(/'/g, "\\'")}')">
                <img src="${selectedCluster.image}" alt="${selectedCluster.name}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
              </div>`
            : "";
          clustersBodyHtml = evidenceCard({
            color: "#ff3b30",
            subtitle: selectedCluster.direction,
            title: selectedCluster.name,
            description: selectedCluster.description || "",
            stats: selectedCluster.stats || [],
            extra: clusterImageHtml,
          });
        } else if (selectedInfra) {
          clustersBodyHtml = `
            <div style="border-left: 3px solid #34c759; padding: var(--space-3) var(--space-4); background: rgba(52, 199, 89, 0.04); border-radius: 0 var(--radius-medium) var(--radius-medium) 0;">
              <div style="font-size: var(--text-xs); color: #34c759; font-family: var(--font-display); font-weight: var(--font-weight-semibold); letter-spacing: 0.02em; margin-bottom: var(--space-2);">Road infrastructure${selectedInfra.status ? ` · ${selectedInfra.status}` : ""}</div>
              <div style="font-size: var(--text-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); line-height: 1.4;">${selectedInfra.label}</div>
              ${selectedInfra.description ? `<div style="font-size: var(--text-xs); color: var(--color-text-secondary); margin-top: var(--space-2); line-height: 1.5;">${selectedInfra.description}</div>` : ""}
            </div>
          `;
        } else {
          clustersBodyHtml = `
            <p style="font-size: var(--text-sm); color: var(--color-text-tertiary);">Select a cluster or road on the map to view details.</p>
          `;
        }

        clustersHtml = `
          <div style="margin-top: var(--space-6);">
            <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">Clusters</div>
            ${clustersBodyHtml}
          </div>
        `;
      }

      let evidenceHtml = "";
      if (otherActiveZones.length > 0) {
        const cardsHtml = otherActiveZones
          .map((zone) => {
            const imageHtml = `<div style="margin-top: var(--space-4); border-radius: var(--radius-medium); overflow: hidden; cursor: pointer;" onclick="UI.showEvidenceLightbox('assets/use-case-images/evidence-science-park.webp', '${zone.name.replace(/'/g, "\\'")}')">
                      <img src="assets/use-case-images/evidence-science-park.webp" alt="${zone.name}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                  </div>`;

            return evidenceCard({
              color: zone.strokeColor,
              subtitle: "Development zone",
              title: zone.name,
              description: zone.description,
              stats: zone.stats,
              extra: imageHtml,
            });
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
        ${panelHeader("Development zones", "Science park", sp.description)}
        <div style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);">
            ${rowsHtml}
        </div>
        ${clustersHtml}
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
        {
          id: "ga-ten-twenty-concept",
          label: "10-20 minute concept",
          color: "#FF69B4",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        },
      ];

      const rowsHtml = airportChildren
        .map((c) => {
          const isActive = activeChildren.includes(c.id);
          return toggleRow({
            id: c.id,
            label: c.label,
            color: c.color,
            icon: c.icon,
            active: isActive,
            onclick: `App.toggleDevelopmentChild('${c.id}')`,
          });
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
            const imagesHtml = ev.images
              .map(
                (img) => `
                <div style="margin-top: var(--space-4); border-radius: var(--radius-medium); overflow: hidden; cursor: pointer;" onclick="UI.showEvidenceLightbox('${img.src}', '${img.alt.replace(/'/g, "\\'")}')">
                    <img src="${img.src}" alt="${img.alt}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                </div>
              `,
              )
              .join("");

            return evidenceCard({
              color: child.color,
              subtitle: ev.subtitle,
              title: ev.title,
              description: ev.description,
              stats: ev.stats,
              extra: imagesHtml,
            });
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
        ${panelHeader("Development zones", "Grand airport concept", airport?.description || "A proposed expansion of Aso Kumamoto Airport to serve as a regional semiconductor logistics hub.")}
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

    const statsHtml = lm.stats?.length ? bentoStats(lm.stats) : "";

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

    const statsHtml = route.stats?.length ? bentoStats(route.stats) : "";

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
    const statsHtml = road.stats?.length ? bentoStats(road.stats) : "";

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

    const color =
      station.type === "planned" || station.type === "proposed"
        ? "#ff9500"
        : "#6e7073";
    const statsHtml = station.stats?.length ? bentoStats(station.stats) : "";

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
      // Science-park zone plans are mutually exclusive - deactivate siblings
      const spZoneIds = (AppData.scienceParkZonePlans || []).map((z) => z.id);
      if (spZoneIds.includes(childId)) {
        const spActive = active.filter((id) => spZoneIds.includes(id));
        spActive.forEach((id) => {
          if (id === "sp-gov-zone") {
            this.state.selectedGovZoneCluster = null;
            this.state.selectedGovZoneInfra = null;
            MapController.setGovZoneClusterHighlight(null);
          }
          const i = active.indexOf(id);
          if (i !== -1) active.splice(i, 1);
          this._removeDevelopmentMapElement(id);
        });
      }

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

  // --- Step 6: Education ---
  _handleEducationSubItem(itemId) {
    if (itemId === "universities") {
      // Show university markers with animated arcs
      MapController.hideTalentPipeline();
      MapController.hideEmploymentMarkers();
      this.state.activeUniversities = [];
      UI.showUniversitiesPanel(this.state.activeUniversities);
      MapController.showTalentPipeline({ skipFly: true });
    } else if (itemId === "employment") {
      // Hide university markers, show JASM and TEL markers only
      MapController.hideTalentPipeline();
      MapController.showEmploymentMarkers();
      this.state.activeEmployers = [];
      UI.showEmploymentPanel(this.state.activeEmployers);
    }
  },

  toggleUniversity(universityId) {
    const idx = this.state.activeUniversities.indexOf(universityId);
    if (idx >= 0) {
      this.state.activeUniversities.splice(idx, 1);
    } else {
      this.state.activeUniversities.push(universityId);

      // Fly camera to the toggled-on university
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
    UI.updateUniversitiesPanel(this.state.activeUniversities);
  },

  toggleEmployer(employerId) {
    const idx = this.state.activeEmployers.indexOf(employerId);
    if (idx >= 0) {
      this.state.activeEmployers.splice(idx, 1);
    } else {
      this.state.activeEmployers.push(employerId);

      // Fly camera to the toggled-on employer
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
    UI.updateEmploymentPanel(this.state.activeEmployers);
  },

  // --- Step 8: Investment zones ---
  _handleInvestmentZoneSubItem(itemId) {
    const zoneData = {
      "central-city-zone": {
        name: "Central city",
        details: [
          ["Product type", "RC mansion condominiums and accommodation"],
          ["Connection", "Shinkansen 30-minute connection to Hakata"],
          [
            "Role",
            "Kyushu-level business support center, suitable for Japanese corporate senior executive families",
          ],
        ],
        coords: [32.8016, 130.7014],
      },
      "middle-zone": {
        name: "Middle zone",
        details: [
          [
            "Product type",
            "High-spec detached house rentals or renovations upgraded to expatriate standard",
          ],
          [
            "Opportunity",
            "Large retail drives lifestyle density but internationalized services (bilingual clinics, international preschools) still being built out",
          ],
        ],
        coords: [32.8364, 130.7575],
      },
      "jasm-zone": {
        name: "JASM",
        details: [
          [
            "Product type",
            "Corporate RC condominiums and 3-4LDK detached houses",
          ],
          [
            "Target tenants",
            "Single engineers, long-term secondees, short-to-medium-term secondees",
          ],
          [
            "Two demand waves",
            "Wave 1 now (construction + early Fab 1 occupants), wave 2 ~2027 (Fab 2 brings higher-income engineers with higher housing quality expectations)",
          ],
          [
            "Supply gap",
            "Supply catches up to demand around 2028-2029",
          ],
        ],
        coords: [32.8678, 130.8419],
        showLogo: true,
      },
    };
    const zone = zoneData[itemId];
    if (zone) {
      const rows = zone.details
        .map(
          ([label, value]) =>
            `<div style="display: flex; flex-direction: column; gap: var(--space-1);">
              <span style="font-weight: var(--font-weight-semibold); font-size: var(--text-sm); color: var(--color-text-primary);">${label}</span>
              <span style="font-size: var(--text-sm); color: var(--color-text-secondary);">${value}</span>
            </div>`,
        )
        .join("");

      UI.showPanel(`
                <div class="subtitle">Silicon triangle</div>
                <h2>${zone.name}</h2>
                <div style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-4);">
                    ${rows}
                </div>
            `);

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
      label: "Kikuyo properties",
      evidencePdf: "assets/pdfs/Kikuyo-evidence-rent-report.pdf",
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
      evidencePdf: "assets/pdfs/Ozu-evidence-rent-report.pdf",
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
                ${continueBtn("App.enterQAMode()", "Enter Q&amp;A")}
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

    // Switch AI chat panel to Q&A mode (suggestions, input, download summary)
    UI.showQAMode();

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
            ${panelHeader("Supporting evidence", group.title, "Select an item below to view detailed documentation.")}
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
                ${continueBtn("App.goToStep(1)", "Start Journey", { arrow: true })}
            `);
    }
  },
};
