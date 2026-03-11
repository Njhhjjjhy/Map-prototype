import { STEPS, STAGE_TABS, AppData } from "../data/index.js";
import { MapController } from "../map/index.js";
import { icardStats, icard, emptyCard } from "../shared/templates.js";
import { t } from "../i18n/index.js";

export const methods = {
  async startDashboardMode() {
    this.dashboardMode = true;
    await MapController.waitReady();
    if (MapController.map) MapController.map.resize();

    try {
      MapController.clearAll();
      MapController.resetView();
    } catch (e) {
      console.warn("Dashboard: Error resetting map:", e);
    }

    this.hidePanelToggle();

    this.showTimeToggle();
    this.setTimeView("present");

    try {
      this.createDashboardMarkers();
    } catch (e) {
      console.error("Dashboard: Error creating markers:", e);
    }

    this.showDataLayers("dashboard");

    // Open inspector panel at stage 8 (real estate overview)
    setTimeout(() => {
      this.renderInspectorPanel(7, { title: t("Kumamoto corridor") });
      this.dashboardPanelOpen = true;
      this.setPanelHome(() => {
        this.renderInspectorPanel(7, { title: t("Kumamoto corridor") });
      });
    }, 300);

    setTimeout(() => {
      this.lastChatType = "aiChat";
      this.showChatFab();
    }, 600);
  },

  /**
   * Toggle dashboard panel open/closed
   */
  toggleDashboardPanel() {
    if (this.dashboardPanelOpen) {
      this.hideDashboardPanel();
    } else {
      this.showDashboardPanel();
    }
  },

  /**
   * Show the dashboard panel (inspector mode)
   */
  showDashboardPanel() {
    this.dashboardPanelOpen = true;
    this.hidePanelToggle();

    const stage = this.inspectorStage || 8;
    this.renderInspectorPanel(stage, {
      title: this.inspectorTitle || t("Kumamoto corridor"),
    });
  },

  /**
   * Hide the dashboard panel
   */
  hideDashboardPanel() {
    this.dashboardPanelOpen = false;
    this.elements.rightPanel.classList.remove("visible");
    this.elements.rightPanel.classList.add("hidden");
    this.panelOpen = false;
  },

  /**
   * Create core markers for Dashboard mode (no entrance animations)
   * These markers are needed for data layer toggles to work
   */
  createDashboardMarkers() {
    // Defensive check: ensure map is initialized before accessing it
    if (!MapController.map || !MapController.initialized) {
      console.warn("Dashboard: Map not ready, skipping marker creation");
      return;
    }

    // Property markers removed per design decision

    // Create company markers (for 'companies' layer)
    AppData.companies.forEach((company) => {
      const html = MapController._brandedMarkerHtml(company.id);
      const { marker, element } = MapController._createMarker(
        company.coords,
        html,
        { entrance: "none", ariaLabel: company.name },
      );

      MapController._addTooltip(marker, element, company.name);
      element.addEventListener("click", () =>
        UI.renderInspectorPanel(2, { title: company.name }),
      );

      MapController.markers[company.id] = marker;
      if (!MapController._layerGroups.companies)
        MapController._layerGroups.companies = [];
      MapController._layerGroups.companies.push(company.id);

      // Start hidden by default
      marker.remove();
    });

    // Create science park boundary and marker (for 'sciencePark' layer)
    const sp = AppData.sciencePark;
    if (!MapController._layerGroups.sciencePark)
      MapController._layerGroups.sciencePark = [];

    // Add boundary circle as Mapbox layer
    if (!MapController.map.getSource("science-park-source")) {
      MapController.map.addSource("science-park-source", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: MapController._toMapbox(sp.center),
          },
        },
      });

      MapController.map.addLayer({
        id: "science-park-circle",
        type: "circle",
        source: "science-park-source",
        paint: {
          "circle-radius": {
            stops: [
              [10, 50],
              [15, 200],
            ],
          },
          "circle-color": "#ff3b30",
          "circle-opacity": 0.15,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ff3b30",
          "circle-stroke-opacity": 0.4,
        },
        layout: { visibility: "none" },
      });
    }

    // Create science park marker
    const spHtml = MapController._markerIconHtml("sciencePark");
    const { marker: spMarker, element: spElement } =
      MapController._createMarker(sp.center, spHtml, {
        entrance: "none",
        ariaLabel: t("Kumamoto Science Park"),
      });

    MapController._addTooltip(spMarker, spElement, t("Kumamoto Science Park"));
    spElement.addEventListener("click", () => {
      UI.renderInspectorPanel(4, { title: t("Kumamoto Science Park") });
    });

    MapController.markers["science-park"] = spMarker;
    MapController._layerGroups.sciencePark.push("science-park");

    // Start hidden by default
    spMarker.remove();
  },

  // ================================
  // INSPECTOR PANEL SYSTEM
  // ================================

  // Inspector state
  inspectorStage: null,
  inspectorTab: 0,
  inspectorTitle: "",
  inspectorView: "fund",

  /**
   * Render the inspector panel for a given stage
   */
  renderInspectorPanel(stage, options = {}) {
    const tabDef = STAGE_TABS[stage];
    if (!tabDef) return;

    this.inspectorStage = stage;
    this.inspectorTitle = options.title || tabDef.label || "";

    if (options.property) this.currentProperty = options.property;

    // Auto-select tab when entity focus requires it (e.g. institution -> Universities tab)
    const startTab = options.startTab || 0;
    this.inspectorTab = startTab;

    const subtitle = tabDef.label || "";
    const tabs = tabDef.tabs || [];

    let tabsHtml = "";
    if (tabs.length > 1) {
      tabsHtml =
        '<div class="inspector-tabs">' +
        tabs
          .map(
            (t, i) =>
              `<button class="inspector-tab${i === startTab ? " active" : ""}" data-tab-index="${i}">${t}</button>`,
          )
          .join("") +
        "</div>";
    }

    const bodyContent = this.renderStageTab(stage, startTab, options);

    // Don't render subtitle when it matches the title (prevents duplicate labels)
    const showSubtitle = subtitle && subtitle !== this.inspectorTitle;

    // Property navigation arrows for stage 9
    let navArrowsHtml = "";
    if (
      stage === 9 &&
      options.property &&
      AppData.properties &&
      AppData.properties.length > 1
    ) {
      const props = AppData.properties;
      const currentIdx = props.findIndex((p) => p.id === options.property.id);
      const prevIdx = (currentIdx - 1 + props.length) % props.length;
      const nextIdx = (currentIdx + 1) % props.length;
      navArrowsHtml = `<div class="inspector-nav-arrows">
        <button class="inspector-nav-btn" data-nav-property="${props[prevIdx].id}" aria-label="${t("Previous property")}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="inspector-nav-label">${currentIdx + 1} / ${props.length}</span>
        <button class="inspector-nav-btn" data-nav-property="${props[nextIdx].id}" aria-label="${t("Next property")}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>`;
    }

    const html = `
            <div class="inspector-resize-handle"></div>
            <div class="inspector-title-bar">
                ${showSubtitle ? `<div class="inspector-subtitle">${subtitle}</div>` : ""}
                <h2 class="inspector-title">${this.inspectorTitle}</h2>
                ${navArrowsHtml}
            </div>
            ${tabsHtml}
            <div class="inspector-body">
                <div class="icard-grid">${bodyContent}</div>
            </div>
        `;

    this.showPanel(html, { clearHistory: true });

    setTimeout(() => {
      const panel = this.elements.rightPanel;
      if (!panel) return;

      panel.querySelectorAll(".inspector-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.switchInspectorTab(parseInt(btn.dataset.tabIndex, 10), options);
        });
      });

      this.initPanelResize();
      this._attachInspectorHandlers(options);

      // Property navigation arrow handlers
      panel.querySelectorAll(".inspector-nav-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const propId = btn.dataset.navProperty;
          if (propId && typeof App !== "undefined") {
            App.activatePropertyDashboard(propId);
          }
        });
      });
    }, 0);

    // Fly to entity coordinates if provided
    if (options.flyTo && typeof MapController !== "undefined") {
      MapController.flyToStep(options.flyTo);
    }
  },

  /**
   * Switch active inspector tab
   */
  switchInspectorTab(tabIndex, options = {}) {
    this.inspectorTab = tabIndex;
    const panel = this.elements.rightPanel;
    if (!panel) return;

    panel.querySelectorAll(".inspector-tab").forEach((btn, i) => {
      btn.classList.toggle("active", i === tabIndex);
    });

    const body = panel.querySelector(".inspector-body");
    if (body) {
      body.innerHTML =
        '<div class="icard-grid">' +
        this.renderStageTab(this.inspectorStage, tabIndex, options) +
        "</div>";
      this._attachInspectorHandlers(options);
    }
  },

  /**
   * Update inspector panel based on current step
   */
  /**
   * Update inspector panel for the current step index.
   * @param {number} stepIndex - Step index (1-11)
   */
  updateInspectorForStep(stepIndex) {
    if (!stepIndex || stepIndex <= 2) return;

    if (stepIndex !== this.inspectorStage) {
      const tabDef = STAGE_TABS[stepIndex] || {};
      this.renderInspectorPanel(stepIndex, { title: tabDef.label || "" });
    }
  },

  /**
   * Initialize left-edge panel resize
   */
  initPanelResize() {
    const panel = this.elements.rightPanel;
    if (!panel) return;
    const handle = panel.querySelector(".inspector-resize-handle");
    if (!handle) return;

    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      handle.classList.add("active");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      const onMouseMove = (ev) => {
        const maxWidth = window.innerWidth * 0.6;
        let width = window.innerWidth - ev.clientX;
        width = Math.max(320, Math.min(width, maxWidth));
        panel.style.setProperty("--panel-width", width + "px");
        panel.style.width = width + "px";
      };
      const onMouseUp = () => {
        handle.classList.remove("active");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  },

  /**
   * Render content for a stage tab
   */
  renderStageTab(stage, tabIndex, options = {}) {
    switch (stage) {
      case 1:
        return this._renderStage1(tabIndex);
      case 2:
        return this._renderStage2(tabIndex);
      case 3:
        return this._renderStage3(tabIndex, options);
      case 4:
        return this._renderStage4(tabIndex);
      case 5:
        return this._renderStage6(tabIndex, options);
      case 6:
        return this._renderStage7(tabIndex);
      case 7:
        return this._renderStage8(tabIndex);
      case 9:
        return this._renderStage5(tabIndex, options);
      default:
        return "";
    }
  },
  _renderStage1(tabIndex) {
    let html = `<div class="icard icard-standard">
            <div class="icard-title">${t("Resources and location")}</div>
            <p style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: var(--space-2);">${t("Kumamoto's natural advantages: water, power, and strategic position in the semiconductor supply chain.")}</p>
        </div>`;
    return html;
  },
  _renderStage2(tabIndex) {
    switch (tabIndex) {
      case 0: {
        // Support tab: government tiers
        const tiers = AppData.governmentTiers || [];
        let html = "";
        tiers.forEach((t) => {
          html += `<div class="icard icard-standard">
                        ${t.tierLabel ? `<div class="icard-source">${t.tierLabel}</div>` : ""}
                        <div class="icard-title">${t.name}</div>
                        <div class="icard-stats-grid">
                            ${icardStats(t.stats || [])}
                        </div>
                    </div>`;
        });
        return html || emptyCard(t("No government data available."));
      }
      case 1: {
        // Investment tab: corporate companies
        const companies = AppData.companies || [];
        return companies.map((c) => this.renderCorporateCard(c)).join("");
      }
      default:
        return "";
    }
  },
  _renderStage3(tabIndex, options = {}) {
    // Employment data view
    if (options.view === "employment") {
      return this.renderEmploymentView();
    }
    // Entity-focused view: single institution card with pipeline context
    if (options.institution) {
      let html = this.renderInstitutionCard(options.institution);
      html += this.renderPipelineContextCard(options.institution);
      return html;
    }
    // Default: combined workforce + universities overview
    let html = this.renderWorkforceCard();
    html += (AppData.talentPipeline?.institutions || [])
      .map((inst) => this.renderInstitutionCard(inst))
      .join("");
    return html;
  },
  _renderStage4(tabIndex) {
    switch (tabIndex) {
      case 0: {
        let html = this.renderZoneProfileCard(AppData.sciencePark);
        const tiers = AppData.governmentTiers || [];
        tiers.forEach((t) => {
          html += `<div class="icard icard-standard">
                        ${t.tierLabel ? `<div class="icard-source">${t.tierLabel}</div>` : ""}
                        <div class="icard-title">${t.name}</div>
                        <div class="icard-stats-grid">
                            ${icardStats(t.stats || [])}
                        </div>
                    </div>`;
        });
        return html;
      }
      case 1:
        return this.renderTimelineCard(
          this._gatherTimelineItems("infrastructure"),
          t("Infrastructure timeline"),
        );
      case 2:
        return this._renderEvidenceForGroup("government-zones");
      default:
        return "";
    }
  },
  _renderStage5(tabIndex, options) {
    const property =
      options.property ||
      this.currentProperty ||
      (AppData.properties && AppData.properties[0]) ||
      {};
    switch (tabIndex) {
      case 0: {
        // Truth engine tab
        const te = this._getTruthEngineData(property);
        return this._renderTruthEngineCard(property, te);
      }
      case 1: {
        // Future outlook tab
        const fo = this._getFutureOutlookData(property);
        return this._renderFutureOutlookCard(property, fo);
      }
      case 2: {
        // Financials tab
        return (
          this.renderCalculatorCard(property) +
          this.renderYieldSummaryCard(property)
        );
      }
      case 3: {
        // Images tab - exteriors first, then interiors, deduplicated
        const imgs = this._getImagesData(property);
        const allImages = [
          ...new Set(
            [imgs.exterior, imgs.site, ...(imgs.interior || [])].filter(
              Boolean,
            ),
          ),
        ];
        return allImages.length
          ? this.renderEvidenceGalleryCard(
              allImages,
              "",
            )
          : emptyCard(t("No images available."));
      }
      default:
        return "";
    }
  },
  _renderTruthEngineCard(property, te) {
    if (
      !te ||
      (!te.basicSettings &&
        !te.designStrategy &&
        !te.landStrategy &&
        !te.summary)
    ) {
      return emptyCard(t("No truth engine data available."));
    }
    let html = "";

    // Summary paragraph
    if (te.summary) {
      html += `<div class="icard icard-standard">
                <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin: 0;">${te.summary}</p>
            </div>`;
    }

    // Basic settings
    if (te.basicSettings) {
      const entries = Object.entries(te.basicSettings);
      html += `<div class="icard icard-standard icard-overview">
                <div class="icard-title">${t("Overview")}</div>
                <div class="icard-detail-list">
                    ${entries
                      .map(
                        ([key, val]) => `<div class="icard-detail-row">
                        <span class="icard-detail-label">${key.replace(/([A-Z])/g, " $1").toLowerCase().replace(/^./, (s) => s.toUpperCase())}</span>
                        <span class="icard-detail-value">${val}</span>
                    </div>`,
                      )
                      .join("")}
                </div>
            </div>`;
    }

    // Commute to JASM
    html += this.renderCommuteCard(property);

    return html;
  },
  _renderFutureOutlookCard(property, fo) {
    if (!fo || !fo.factors?.length) {
      return emptyCard(t("No future outlook data available."));
    }
    let html = "";
    html += fo.factors
      .map(
        (f) => `<div class="icard icard-standard">
            <div class="icard-title">${f.title}</div>
            <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-2);">${f.impact}</p>
        </div>`,
      )
      .join("");
    return html;
  },
  _renderStage6(tabIndex, options) {
    const zones = AppData.futureZones || [];
    const zone = options.zone || zones[0] || {};
    switch (tabIndex) {
      case 0:
        return this.renderZoneProfileCard(zone);
      case 1: {
        let html = "";
        const props = AppData.properties || [];
        if (props.length) {
          const avgYield =
            props.reduce((s, p) => {
              const fin = this._getFinancialData(p);
              if (fin.paths?.rental?.yield) return s + fin.paths.rental.yield;
              const avg = fin.scenarios?.average;
              return s + (avg?.noiTicRatio || avg?.irr || 0);
            }, 0) / props.length;
          html += this.renderYieldSummaryCard({
            cards: [
              {
                type: "financial",
                data: {
                  scenarios: {
                    bear: { noiTicRatio: avgYield * 0.8, irr: avgYield * 0.8 },
                    average: { noiTicRatio: avgYield, irr: avgYield },
                    bull: { noiTicRatio: avgYield * 1.2, irr: avgYield * 1.2 },
                  },
                },
              },
            ],
          });
        }
        return html;
      }
      case 2:
        return this._renderEvidenceForGroup("government-zones");
      default:
        return "";
    }
  },
  _renderStage7(tabIndex) {
    switch (tabIndex) {
      case 0: {
        let html = "";
        const risks = AppData.dataLayers?.riskyArea?.markers || [];
        risks.forEach((r) => (html += this.renderRiskCard(r)));
        const roads = AppData.infrastructureRoads || [];
        roads.forEach((road) => {
          html += icard(
            { title: road.name },
            `<div class="icard-stats-grid">
                            ${icardStats([
                              { value: road.status, label: t("Status") },
                              {
                                value: road.commuteImpact,
                                label: t("Commute saved"),
                              },
                              {
                                value: road.completionDate,
                                label: t("Completion"),
                              },
                              { value: road.budget, label: t("Budget") },
                            ])}
                        </div>`,
          );
        });
        return html;
      }
      case 1:
        return this.renderTimelineCard(
          this._gatherTimelineItems("history"),
          t("Event history"),
        );
      case 2: {
        let html = this.renderTimelineCard(
          this._gatherTimelineItems("mitigation"),
          t("Mitigation investments"),
        );
        html += this._renderEvidenceForGroup("transportation-network");
        return html;
      }
      default:
        return "";
    }
  },
  _renderStage8(tabIndex) {
    switch (tabIndex) {
      case 0:
        return this.renderDemandCard();
      case 1: {
        let html = "";
        const props = AppData.properties || [];
        if (props.length) {
          html += this.renderYieldSummaryCard(props[0]);
        }
        const stats = AppData.areaStats || {};
        html += `<div class="icard icard-standard">
                    <div class="icard-title">${t("Area statistics")}</div>
                    <div class="icard-yield-row">
                        <div class="icard-yield-item">
                            <div class="icard-yield-value">${stats.avgAppreciation || "n/a"}</div>
                            <div class="icard-yield-label">${t("Avg appreciation")}</div>
                        </div>
                        <div class="icard-yield-item">
                            <div class="icard-yield-value">${stats.avgRentalYield || "n/a"}</div>
                            <div class="icard-yield-label">${t("Avg rental yield")}</div>
                        </div>
                        <div class="icard-yield-item">
                            <div class="icard-yield-value">${stats.occupancyRate || "n/a"}</div>
                            <div class="icard-yield-label">${t("Occupancy rate")}</div>
                        </div>
                    </div>
                </div>`;
        return html;
      }
      case 2:
        return (AppData.properties || [])
          .map((p) => this.renderPropertySummaryCard(p))
          .join("");
      default:
        return "";
    }
  },

  // ---- Evidence / timeline helpers ----
  _renderEvidenceForGroup(groupId) {
    const group = AppData.evidenceGroups?.[groupId];
    if (!group || !group.items?.length) {
      return emptyCard(t("No evidence documents available."));
    }
    return group.items.map((item) => this.renderEvidenceDocCard(item)).join("");
  },
  _gatherTimelineItems(type) {
    if (type === "infrastructure") {
      const roads = AppData.infrastructureRoads || [];
      const station = AppData.infrastructureStation
        ? [AppData.infrastructureStation]
        : [];
      const haramizu = AppData.haramizuStation ? [AppData.haramizuStation] : [];
      return [...roads, ...station, ...haramizu].map((item) => ({
        date: item.completionDate || item.completion || "",
        title: item.name || "",
        meta: item.budget || "",
        status: item.status || "",
      }));
    }
    if (type === "history") {
      return [
        {
          date: "2016",
          title: t("Kumamoto earthquake"),
          meta: t("M7.3, significant infrastructure damage"),
          status: "Past",
        },
        {
          date: "2021",
          title: t("TSMC Japan announced"),
          meta: t("National semiconductor strategy launched"),
          status: "Past",
        },
        {
          date: "2022",
          title: t("JASM construction begins"),
          meta: t("Phase 1 groundbreaking"),
          status: "Past",
        },
        {
          date: "2024",
          title: t("JASM Phase 1 operational"),
          meta: t("First wafers produced"),
          status: "Past",
        },
        {
          date: "2025",
          title: t("Phase 2 construction"),
          meta: t("Second fab under construction"),
          status: "Current",
        },
      ];
    }
    if (type === "mitigation") {
      const risks = AppData.dataLayers?.riskyArea?.markers || [];
      return risks.map((r) => ({
        date: r.mitigation?.includes("2025") ? "2025" : "2024",
        title: r.name,
        meta: r.mitigation || "",
        status: "Planned",
      }));
    }
    return [];
  },

  // ---- Card data accessors ----
  _getFinancialData(property) {
    if (property.cards) {
      const card = property.cards.find((c) => c.type === "financial");
      return card?.data || {};
    }
    // Fallback for legacy flat structure
    return property.financials || {};
  },
  _getImagesData(property) {
    if (property.cards) {
      const card = property.cards.find((c) => c.type === "images");
      return card?.data || {};
    }
    // Fallback for legacy flat structure
    return {
      exterior: property.exteriorImage || property.image || "",
      interior: property.interiorImages || [],
      site: "",
    };
  },
  _getTruthEngineData(property) {
    if (property.cards) {
      const card = property.cards.find((c) => c.type === "truth-engine");
      return card?.data || {};
    }
    return {};
  },
  _getFutureOutlookData(property) {
    if (property.cards) {
      const card = property.cards.find((c) => c.type === "future-outlook");
      return card?.data || {};
    }
    return {};
  },

  // ---- Card renderers ----
  renderDecisionBadgeCard(property) {
    const fin = this._getFinancialData(property);
    const strategy = fin.strategy || "hold";
    return `<div class="icard icard-compact icard-decision">
            <div class="icard-decision-label">${strategy}</div>
        </div>`;
  },
  renderFinancialTableCard(tableData, title) {
    if (!tableData) return "";
    const headers = tableData.headers || [];
    const rows = tableData.rows || [];

    const renderRow = (row) => {
      const cls = row.isTotal
        ? "row-total"
        : row.isDisclosure
          ? "icard-disclosure-row"
          : "row-header";
      let html = `<tr class="${cls}"${row.isDisclosure ? ' data-disclosure="collapsed"' : ""}>
                <td>${row.isDisclosure ? '<span class="disclosure-arrow">&#9654;</span> ' : ""}${row.label}</td>
                ${(row.values || []).map((v) => `<td>${v}</td>`).join("")}
            </tr>`;
      if (row.isDisclosure && row.subRows) {
        row.subRows.forEach((sr) => {
          html += `<tr class="icard-sub-row" style="display: none;">
                        <td>${sr.label}</td>
                        ${(sr.values || []).map((v) => `<td>${v}</td>`).join("")}
                    </tr>`;
        });
      }
      return html;
    };

    return `<div class="icard icard-hero">
            <div class="icard-title">${title}</div>
            <table class="icard-financial-table">
                <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
                <tbody>${rows.map((r) => renderRow(r)).join("")}</tbody>
            </table>
        </div>`;
  },
  renderCalculatorCard(property) {
    const fin = this._getFinancialData(property);
    const scenarios = fin.scenarios || {};
    const scenario = this.currentScenario || "average";
    const sc = scenarios[scenario] || {};
    // Internal only: used for yield % calculation, never displayed
    const totalCost = fin.totalInvestment || fin.acquisitionCost || 0;

    let rows = [];
    if (fin.paths) {
      // Paths property: show guaranteed rent + yield, market yield
      const rental = fin.paths.rental || {};
      const market = fin.paths.market || {};
      rows = [
        {
          label: t("Monthly rent"),
          value: this.formatYen(rental.monthlyRent || 0) + "/mo",
        },
        {
          label: t("Guaranteed yield"),
          value: ((rental.yield || 0) * 100).toFixed(1) + "%",
          highlight: true,
        },
        {
          label: t("Market yield"),
          value: ((market.yield || 0) * 100).toFixed(1) + "%",
          highlight: true,
        },
      ];
    } else if (sc.annualRent) {
      // BTR property: show rent + yield (no absolute costs or exit prices)
      rows = [
        {
          label: t("Monthly rent"),
          value: this.formatYen(Math.round((sc.annualRent || 0) / 12)) + "/mo",
        },
        { label: t("Annual rent"), value: this.formatYen(sc.annualRent || 0) },
        {
          label: t("Rental yield"),
          value:
            totalCost > 0
              ? ((sc.annualRent / totalCost) * 100).toFixed(1) + "%"
              : "-",
          highlight: true,
        },
        {
          label: t("IRR"),
          value: ((sc.irr || 0) * 100).toFixed(1) + "%",
          highlight: true,
        },
      ];
    } else {
      // Land development: show IRR only (no absolute values)
      rows = [
        {
          label: t("IRR"),
          value: ((sc.irr || 0) * 100).toFixed(1) + "%",
          highlight: true,
        },
      ];
    }

    const statsHtml = rows
      .map(
        (r) => `<div class="icard-calc-row">
            <span class="icard-calc-label">${r.label}</span>
            <span class="icard-calc-value${r.highlight ? " highlight" : ""}">${r.value}</span>
        </div>`,
      )
      .join("");

    // Only show scenario toggle for properties with scenarios
    const hasScenarios = scenarios.bear || scenarios.bull;

    return `<div class="icard icard-hero icard-calculator">
            <div class="icard-calculator-header">
                <div class="icard-title">${t("Return calculator")}</div>
            </div>
            ${
              hasScenarios
                ? `<div class="icard-calculator-controls">
                <div class="icard-scenario-toggle">
                    <button class="icard-scenario-btn${scenario === "bear" ? " active" : ""}" data-scenario="bear">${t("Bear")}</button>
                    <button class="icard-scenario-btn${scenario === "average" ? " active" : ""}" data-scenario="average">${t("Avg")}</button>
                    <button class="icard-scenario-btn${scenario === "bull" ? " active" : ""}" data-scenario="bull">${t("Bull")}</button>
                </div>
            </div>
            <div class="icard-chart-section">
                <div class="chart-container" style="height: 120px;">
                    <canvas id="scenario-chart" role="img" aria-label="${t("Bar chart comparing investment scenarios: Bear, Average, and Bull net profit")}"></canvas>
                </div>
                <div id="scenario-chart-table"></div>
            </div>`
                : ""
            }
            <div class="icard-calc-stats">${statsHtml}</div>
        </div>`;
  },
  renderYieldSummaryCard(property) {
    return `<div class="icard icard-standard">
            <div class="icard-title">${t("Yield")}</div>
            <div style="font-size: var(--text-2xl); font-weight: var(--font-weight-semibold); color: var(--color-primary);">5%</div>
        </div>`;
  },
  renderEvidenceDocCard(item) {
    const meta = [item.date || ""].filter(Boolean).join(" ");
    return `<div class="icard icard-compact" data-evidence-id="${item.id || ""}">
            <div class="icard-evidence-doc">
                <div class="icard-evidence-thumb">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div class="icard-evidence-info">
                    <div class="icard-evidence-title">${item.title || t("Document")}</div>
                    ${meta ? `<div class="icard-evidence-meta">${meta}</div>` : ""}
                </div>
                ${item.viewed ? '<span class="icard-evidence-viewed">&#10003;</span>' : ""}
            </div>
        </div>`;
  },
  renderEvidenceGalleryCard(images, title) {
    const thumbs = images || [];
    return `<div class="icard icard-compact">
            ${title ? `<div class="icard-title">${title}</div>` : ""}
            <div class="icard-gallery-grid">
                ${thumbs.map((src, i) => `<img class="icard-gallery-thumb" src="${src}" alt="${title || t("Image")}" data-gallery-index="${i}" loading="lazy" />`).join("")}
            </div>
        </div>`;
  },
  renderCorporateCard(company) {
    const initial = (company.name || "C").charAt(0);
    const stats = company.stats || [];
    return `<div class="icard icard-standard" data-company-id="${company.id || ""}">
            <div class="icard-corporate-header">
                <div class="icard-corporate-logo">${initial}</div>
                <div>
                    <div class="icard-corporate-name">${company.name}</div>
                    <div class="icard-corporate-subtitle">${company.subtitle || ""}</div>
                </div>
            </div>
            <div class="icard-stats-grid">
                ${icardStats(stats)}
            </div>
        </div>`;
  },
  renderTimelineCard(items, title) {
    if (!items || !items.length) {
      return `<div class="icard icard-hero"><div class="icard-title">${title || t("Timeline")}</div><p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">${t("No timeline data available.")}</p></div>`;
    }
    const now = new Date().getFullYear();
    return `<div class="icard icard-hero">
            <div class="icard-title">${title || t("Timeline")}</div>
            <div class="icard-timeline">
                ${items
                  .map((item) => {
                    const year = parseInt(String(item.date), 10);
                    const isFuture =
                      item.status === "Planning" ||
                      item.status === "Planned" ||
                      (year && year > now);
                    return `<div class="icard-timeline-item${isFuture ? " future" : ""}">
                        <div class="icard-timeline-date">${item.date || ""}</div>
                        <div class="icard-timeline-title">${item.title || ""}</div>
                        ${item.meta ? `<div class="icard-timeline-meta">${item.meta}</div>` : ""}
                    </div>`;
                  })
                  .join("")}
            </div>
        </div>`;
  },
  renderCommuteCard(property) {
    return icard(
      { title: t("Commute to JASM") },
      `<div class="icard-stats-grid">
                ${icardStats([
                  {
                    value: property.distanceToJasm || "n/a",
                    label: t("Distance"),
                  },
                  { value: property.driveTime || "n/a", label: t("Drive time") },
                ])}
            </div>`,
    );
  },
  renderRiskCard(risk) {
    const level = (risk.risk || "moderate").toLowerCase();
    return `<div class="icard icard-standard">
            <div class="icard-risk-header">
                <span class="icard-risk-severity ${level}"></span>
                <span class="icard-risk-type">${risk.type || t("Risk")} - ${risk.risk || t("Moderate")}</span>
            </div>
            <div class="icard-title">${risk.name || ""}</div>
            ${risk.mitigation ? `<div class="icard-risk-description">${risk.mitigation}</div>` : ""}
        </div>`;
  },
  renderZoneProfileCard(zone) {
    if (!zone) return "";
    const stats = zone.stats || [];
    return `<div class="icard icard-hero">
            ${zone.subtitle ? `<div class="icard-source">${zone.subtitle}</div>` : ""}
            <div class="icard-title">${zone.name || t("Zone profile")}</div>
            <div class="icard-stats-grid">
                ${icardStats(stats)}
            </div>
            ${zone.description ? `<p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-3); line-height: var(--line-height-normal);">${zone.description}</p>` : ""}
        </div>`;
  },
  renderWorkforceCard() {
    const pipeline = AppData.talentPipeline || {};
    const institutions = pipeline.institutions || [];
    return `<div class="icard icard-hero">
            <div class="icard-title">${t("Semiconductor talent pipeline")}</div>
            ${pipeline.description ? `<p style="font-size: var(--text-sm); color: var(--color-text-secondary); line-height: var(--line-height-normal); margin-bottom: var(--space-3);">${pipeline.description}</p>` : ""}
            <div class="icard-workforce-institutions">
                ${institutions
                  .map(
                    (inst) => `<div class="icard-institution">
                    <span class="icard-institution-color" style="background: ${inst.color || "#007aff"}"></span>
                    <div>
                        <div class="icard-institution-name">${inst.name}</div>
                        <div class="icard-institution-role">${inst.role || ""}</div>
                    </div>
                </div>`,
                  )
                  .join("")}
            </div>
        </div>`;
  },
  renderInstitutionCard(inst) {
    if (!inst) return "";
    const details = inst.details || inst.stats || [];
    return `<div class="icard icard-standard icard-institution">
            <div class="icard-inst-header">
                <div class="icard-title" style="margin: 0; padding-right: 0;">${inst.fullName || inst.name}</div>
                ${inst.city ? `<div class="icard-inst-city">${inst.city}</div>` : ""}
            </div>
            ${inst.role ? `<p class="icard-inst-description">${inst.role}</p>` : ""}
            ${
              details.length
                ? `<div class="icard-detail-list">
                ${details
                  .map(
                    (d) => `<div class="icard-detail-row">
                    <span class="icard-detail-label">${d.label}</span>
                    <span class="icard-detail-value">${d.value}</span>
                </div>`,
                  )
                  .join("")}
            </div>`
                : ""
            }
        </div>`;
  },
  renderPipelineContextCard(inst) {
    if (!inst) return "";
    return `<div class="icard icard-standard">
            <div class="icard-source">${t("Pipeline connection")}</div>
            <p style="font-size: var(--text-sm); color: var(--color-text-secondary); line-height: var(--line-height-normal);">
                ${inst.fullName || inst.name} ${t("feeds directly into the Kumamoto semiconductor corridor, supplying graduates and researchers to JASM and other employers in the cluster.")}
            </p>
        </div>`;
  },
  renderEmploymentView() {
    const data = AppData.employmentData;
    if (!data)
      return '<div class="icard icard-hero"><div class="icard-title">' + t("Employment data") + '</div><p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">' + t("No employment data available.") + '</p></div>';

    let html = `<div class="icard icard-hero">
            <div class="icard-title">${t("Semiconductor employment")}</div>
            <p style="font-size: var(--text-sm); color: var(--color-text-secondary); line-height: var(--line-height-normal); margin-bottom: var(--space-3);">${data.summary}</p>
        </div>`;

    (data.companies || []).forEach((company) => {
      const statsHtml = (company.stats || [])
        .map(
          (s) => `<div class="icard-stat">
                <div class="icard-stat-value">${s.value}</div>
                <div class="icard-stat-label">${s.label}</div>
            </div>`,
        )
        .join("");

      html += `<div class="icard icard-standard">
                <div class="icard-source">${company.name}</div>
                <div class="icard-headline-metric" style="font-size: var(--text-2xl); font-weight: 700; color: var(--color-text-primary); margin: var(--space-2) 0;">${company.headline}</div>
                <div style="font-size: var(--text-xs); color: var(--color-text-tertiary); margin-bottom: var(--space-3);">${company.headlineLabel}</div>
                <div class="icard-stats-grid">${statsHtml}</div>
                <p style="font-size: var(--text-sm); color: var(--color-text-secondary); line-height: var(--line-height-normal); margin-top: var(--space-3);">${company.description}</p>
                ${company.quote ? `<blockquote style="font-size: var(--text-sm); color: var(--color-text-secondary); border-left: 3px solid var(--color-primary); padding-left: var(--space-3); margin: var(--space-3) 0; font-style: italic;">"${company.quote}"<br/><span style="font-size: var(--text-xs); color: var(--color-text-tertiary); font-style: normal;">- ${company.quoteSource || ""}</span></blockquote>` : ""}
                ${company.evidence ? `<button class="icard-evidence-btn" onclick="UI.showGalleryFromUrl('${company.evidence.url}', '${company.evidence.title.replace(/'/g, "\\'")}')">${t("View source document")}</button>` : ""}
            </div>`;
    });

    return html;
  },
  renderDemandCard() {
    const demand = AppData.demandProjections || {};
    const forecast = demand.rentalDemandForecast || [];
    if (!forecast.length) {
      return '<div class="icard icard-hero"><div class="icard-title">' + t("Rental demand forecast") + '</div><p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">' + t("No forecast data available.") + '</p></div>';
    }
    const maxUnits = Math.max(...forecast.map((f) => f.units || 0), 1);
    return `<div class="icard icard-hero">
            <div class="icard-title">${t("Rental demand forecast")}</div>
            <div class="icard-demand-rows">
                ${forecast
                  .map((f) => {
                    const pct = Math.round(((f.units || 0) / maxUnits) * 100);
                    return `<div class="icard-demand-row">
                        <span class="icard-demand-year">${f.year || ""}</span>
                        <div class="icard-demand-bar"><div class="icard-demand-fill" style="width: ${pct}%"></div></div>
                        <span class="icard-demand-value">${(f.units || 0).toLocaleString()}</span>
                    </div>`;
                  })
                  .join("")}
            </div>
            ${demand.inventoryConstraints ? `<p style="font-size: var(--text-xs); color: var(--color-text-tertiary); margin-top: var(--space-3); line-height: var(--line-height-normal);">${demand.inventoryConstraints}</p>` : ""}
        </div>`;
  },
  renderStickySummaryRow(property) {
    const fin = this._getFinancialData(property);
    const avg = fin.scenarios?.average || {};
    const rental = fin.paths?.rental || {};
    const annualIncome = avg.annualRent || rental.annualRent || 0;
    const yieldVal = rental.yield || avg.noiTicRatio || avg.irr || 0;
    return `<div class="icard-sticky-summary">
            <div>
                <div class="icard-sticky-label">${t("Rental yield")}</div>
                <div class="icard-sticky-value">${(yieldVal * 100).toFixed(1)}%</div>
            </div>
            <div style="text-align: right;">
                <div class="icard-sticky-label">${t("Projected annual income")}</div>
                <div class="icard-sticky-value">${this.formatYen(annualIncome)}</div>
            </div>
        </div>`;
  },
  renderPropertySummaryCard(property) {
    const imgs = this._getImagesData(property);
    const thumb = imgs.exterior || "";
    return `<div class="icard icard-standard" data-property-id="${property.id || ""}" style="cursor: pointer;">
            <div style="display: flex; gap: var(--space-3);">
                ${thumb ? `<img style="width: 64px; height: 48px; border-radius: var(--radius-small); object-fit: cover; flex-shrink: 0;" src="${thumb}" alt="${property.name || ""}" loading="lazy" />` : ""}
                <div>
                    <div class="icard-title" style="margin-bottom: var(--space-1);">${property.name || t("Property")}</div>
                    <div style="font-size: var(--text-xs); color: var(--color-text-tertiary);">${property.distanceToJasm || ""} ${property.driveTime ? "- " + property.driveTime : ""}</div>
                </div>
            </div>
        </div>`;
  },
  _attachInspectorHandlers(options = {}) {
    const panel = this.elements.rightPanel;
    if (!panel) return;

    // Scenario toggle (calculator card)
    panel
      .querySelectorAll(".icard-scenario-toggle .icard-scenario-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          this.currentScenario = btn.dataset.scenario;
          this._refreshCalculator(options);
        });
      });

    // View toggle (fund / broker)
    panel
      .querySelectorAll(".icard-view-toggle .icard-view-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          this.inspectorView = btn.dataset.view;
          this._refreshCalculator(options);
        });
      });

    // Financial table disclosure rows
    panel.querySelectorAll(".icard-disclosure-row").forEach((row) => {
      row.addEventListener("click", () => {
        const isCollapsed = row.dataset.disclosure === "collapsed";
        row.dataset.disclosure = isCollapsed ? "expanded" : "collapsed";
        const arrow = row.querySelector(".disclosure-arrow");
        if (arrow) arrow.style.transform = isCollapsed ? "rotate(90deg)" : "";
        let sibling = row.nextElementSibling;
        while (sibling && sibling.classList.contains("icard-sub-row")) {
          sibling.style.display = isCollapsed ? "table-row" : "none";
          sibling = sibling.nextElementSibling;
        }
      });
    });

    // Gallery thumbs
    panel.querySelectorAll(".icard-gallery-thumb").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        const grid = thumb.closest(".icard-gallery-grid");
        if (!grid) return;
        const allImgs = Array.from(grid.querySelectorAll("img")).map(
          (img) => img.src,
        );
        const idx = parseInt(thumb.dataset.galleryIndex, 10) || 0;
        this.showQuickLook({
          type: "gallery",
          images: allImgs,
          startIndex: idx,
          title: t("Gallery"),
        });
      });
    });

    // Property summary cards (click to open stage 9)
    panel.querySelectorAll("[data-property-id]").forEach((card) => {
      card.addEventListener("click", () => {
        const propId = card.dataset.propertyId;
        const property = (AppData.properties || []).find(
          (p) => p.id === propId,
        );
        if (property) {
          this.currentProperty = property;
          this.renderInspectorPanel(9, { title: property.name, property });
        }
      });
    });

    // Evidence doc cards (click to open Quick Look with actual image)
    panel.querySelectorAll("[data-evidence-id]").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const evidenceId = card.dataset.evidenceId;
        if (!evidenceId) return;
        const titleEl = card.querySelector(".icard-evidence-title");
        const metaEl = card.querySelector(".icard-evidence-meta");
        const title = titleEl?.textContent || t("Document");
        const source = metaEl?.textContent || "";

        // Look up evidence item to get its image
        let image = null;
        const groups = AppData.evidenceGroups || {};
        for (const group of Object.values(groups)) {
          const item = (group.items || []).find((i) => i.id === evidenceId);
          if (item && item.image) {
            image = item.image;
            break;
          }
        }

        if (image) {
          this.showQuickLook({ type: "image", src: image, title });
        } else {
          this.showQuickLook({ type: "doc", title, source });
        }
      });
    });

    // Render scenario chart if canvas is present (properties with bear/avg/bull)
    const property =
      options.property || this.currentProperty || AppData.properties?.[0];
    if (property && panel.querySelector("#scenario-chart")) {
      setTimeout(() => this.renderScenarioChart(property), 50);
    }
  },
  _refreshCalculator(options = {}) {
    const panel = this.elements.rightPanel;
    if (!panel) return;
    const calc = panel.querySelector(".icard-calculator");
    if (!calc) return;
    const property =
      options.property || this.currentProperty || AppData.properties?.[0] || {};

    // Update toggle button active states in-place (no DOM replacement)
    const scenario = this.currentScenario || "average";
    const view = this.inspectorView || "fund";
    calc.querySelectorAll(".icard-scenario-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scenario === scenario);
    });
    calc.querySelectorAll(".icard-view-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });

    // Build new stats HTML
    const fin = this._getFinancialData(property);
    let statsHtml = "";

    if (fin.paths) {
      // Paths-based property: show rental yield summary
      const rental = fin.paths.rental || {};
      const market = fin.paths.market || {};
      const rows = [
        {
          label: t("Monthly rent"),
          value: this.formatYen(rental.monthlyRent || 0) + "/mo",
        },
        { label: t("Annual rent"), value: this.formatYen(rental.annualRent || 0) },
        {
          label: t("Rental yield"),
          value: ((rental.yield || 0) * 100).toFixed(1) + "%",
          highlight: true,
        },
      ];
      if (market.yield) {
        rows.push({
          label: t("Market yield"),
          value: ((market.yield || 0) * 100).toFixed(1) + "%",
          highlight: true,
        });
      }
      statsHtml = rows
        .map(
          (r) => `<div class="icard-calc-row">
                <span class="icard-calc-label">${r.label}</span>
                <span class="icard-calc-value${r.highlight ? " highlight" : ""}">${r.value}</span>
            </div>`,
        )
        .join("");
    } else {
      const scenarios = fin.scenarios || {};
      const sc = scenarios[scenario] || {};
      const rows = [
        { label: t("Annual rent"), value: this.formatYen(sc.annualRent || 0) },
        { label: t("NOI"), value: this.formatYen(sc.noi || 0) },
        {
          label: t("IRR"),
          value: ((sc.irr || 0) * 100).toFixed(1) + "%",
          highlight: true,
        },
      ];
      statsHtml = rows
        .map(
          (r) => `<div class="icard-calc-row">
                <span class="icard-calc-label">${r.label}</span>
                <span class="icard-calc-value${r.highlight ? " highlight" : ""}">${r.value}</span>
            </div>`,
        )
        .join("");
    }

    // Crossfade: fade out, swap content, fade in
    const statsEl = calc.querySelector(".icard-calc-stats");
    if (statsEl) {
      statsEl.classList.add("fading");
      setTimeout(() => {
        statsEl.innerHTML = statsHtml;
        statsEl.classList.remove("fading");
      }, 150);
    }
  },

  // ---- Quick Look ----
};
