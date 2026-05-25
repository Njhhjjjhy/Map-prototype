import { AppData } from "../data/index.js";
import { MapController } from "../map/index.js";
import {
  panelHeader,
  statGrid,
  bentoStats,
  evidenceCard,
  toggleRow,
  dataAttribution,
  connectionItem,
  proseBlock,
  statSection,
  listSection,
  evidenceBlockHtml,
  imageBlock,
  imageGalleryBlock,
  sectionLabel,
  footerCta,
} from "../shared/templates.js";
import { t } from "../i18n/index.js";
import { $id, $sel } from "../shared/dom-scope.js";
import { buildCompactTabsHtml } from "./inspector-tabs.js";

export const methods = {
  showInvestmentOverview() {
    this._investmentActiveTab = this._investmentActiveTab || "investment";
    const tabs = [
      {
        id: "investment",
        label: t("Investment"),
        onclick: `UI.switchInvestmentTab('investment')`,
      },
      {
        id: "companies",
        label: t("Companies"),
        onclick: `UI.switchInvestmentTab('companies')`,
      },
    ];
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === this._investmentActiveTab),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 5 · ${t("Corporate investment")}`,
        title: t("Corporate investment"),
        tabs,
        activeIndex,
        bodyHtml: this._buildInvestmentTabBody(this._investmentActiveTab),
      }),
    );
  },

  switchInvestmentTab(tabId) {
    this._investmentActiveTab = tabId;
    const tabIds = ["investment", "companies"];
    const activeIndex = Math.max(0, tabIds.indexOf(tabId));
    const body = this.elements.panelContent?.querySelector(".panel-a-body");
    if (body) body.innerHTML = this._buildInvestmentTabBody(tabId);
    this.elements.panelContent
      ?.querySelectorAll(".panel-a-tab")
      .forEach((btn, i) => {
        btn.setAttribute(
          "aria-selected",
          i === activeIndex ? "true" : "false",
        );
      });
  },

  _investmentLogoMap: {
    jasm: "assets/Jasm-logo.svg",
    sony: "assets/Sony-logo.svg",
    "tokyo-electron": "assets/Tokyo-electron-logo.svg",
    mitsubishi: "assets/Mitsubishi-electric-logo.svg",
    sumco: "assets/Sumco-logo.svg",
    kyocera: "assets/Kyocera-logo.svg",
    "rohm-apollo": "assets/Rohm-logo.svg",
  },

  _buildInvestmentTabBody(tabId) {
    const companies = AppData.companies || [];
    if (tabId === "companies") {
      const items = companies.map((c) => {
        const logo = this._investmentLogoMap[c.id];
        const icon = logo
          ? `<img src="${logo}" alt="${(c.name || "").replace(/"/g, "&quot;")}" />`
          : "";
        return {
          icon,
          title: c.name,
          sub: c.subtitle || "",
          value: c.stats?.[0]?.value || "",
        };
      });
      return `
        ${listSection({ label: t("Major players"), items })}
      `;
    }
    // investment (default)
    const headlineCompanies = ["jasm", "sony", "tokyo-electron", "mitsubishi"];
    const headlineItems = headlineCompanies
      .map((id, i) => {
        const c = companies.find((x) => x.id === id);
        if (!c) return null;
        return {
          label: c.name,
          value: c.stats?.[0]?.value || "",
          hero: i === 0,
        };
      })
      .filter(Boolean);
    return `
      ${proseBlock(t("Capital is concentrated in semiconductor fabrication, packaging, equipment, and supply chain. The corridor brings together TSMC's Japan venture, Sony's image sensor expansion, and Tokyo Electron's new equipment facility."))}
      ${statSection({ label: t("Headline capital"), items: headlineItems })}
    `;
  },

  showResourcePanel() {
    this._waterActiveTab = this._waterActiveTab || "overview";
    const tabs = [
      { id: "overview", label: t("Overview"), onclick: `UI.switchWaterTab('overview')` },
      { id: "companies", label: t("Companies"), onclick: `UI.switchWaterTab('companies')` },
    ];
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === this._waterActiveTab),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 1 · ${t("Water resources")}`,
        title: t("Water resources"),
        tabs,
        activeIndex,
        bodyHtml: this._buildWaterTabBody(this._waterActiveTab),
        footerHtml: this._buildWaterTabFooter(this._waterActiveTab),
      }),
    );
  },

  switchWaterTab(tabId) {
    this._waterActiveTab = tabId;
    const tabIds = ["overview", "companies"];
    const activeIndex = Math.max(0, tabIds.indexOf(tabId));
    const body = this.elements.panelContent?.querySelector(".panel-a-body");
    if (body) body.innerHTML = this._buildWaterTabBody(tabId);
    const footer = this.elements.panelContent?.querySelector(".panel-a-footer");
    if (footer) footer.innerHTML = this._buildWaterTabFooter(tabId);
    this.elements.panelContent
      ?.querySelectorAll(".panel-a-tab")
      .forEach((btn, i) => {
        btn.setAttribute(
          "aria-selected",
          i === activeIndex ? "true" : "false",
        );
      });
  },

  _buildWaterTabBody(tabId) {
    const water = AppData.resources?.water;
    if (!water) return "";

    if (tabId === "companies") {
      const factoryIcon =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>';
      const items = (water.evidenceMarkers || []).map((m) => {
        const location = m.stats?.find((s) => s.label === t("Location"))?.value || "";
        const established = m.stats?.find((s) => s.label === t("Established"))?.value || "";
        return {
          icon: factoryIcon,
          title: m.name,
          sub: location,
          value: established,
        };
      });
      return `
        ${proseBlock(t("Major brands chose Kumamoto for premium production. Their continued operation is proof of long-term groundwater quality and abundance."))}
        ${listSection({ label: t("Brands"), items })}
      `;
    }

    // overview (default)
    const items = (water.stats || []).map((s, i) => ({
      label: s.label,
      value: s.value,
      hero: i === 0,
    }));
    return `
      ${proseBlock(water.description || "")}
      ${statSection({ label: water.name || t("Aso Groundwater Basin"), items })}
      <div class="step-section">
        ${evidenceBlockHtml({
          title: water.evidence?.title || t("TSMC ESG evidence"),
          description: water.evidence?.description || "",
          onclick: `UI.showEvidence('water', 'resource')`,
        })}
      </div>
    `;
  },

  _buildWaterTabFooter(tabId) {
    if (tabId !== "overview") return "";
    return `<button type="button" class="cta secondary" style="width: 100%;" onclick="UI.showEvidence('water', 'resource')">${t("View evidence")}</button>`;
  },

  /**
   * Show dedicated Haramizu station panel with 3 development zones.
   */
  showHaramizuPanel() {
    const haramizu = AppData.haramizuStation;
    if (!haramizu) return;

    const statsItems = (haramizu.stats || []).map((s) => ({
      label: s.label,
      value: s.value,
    }));

    const zoneItems = (haramizu.zones || []).map((zone) => ({
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      title: zone.name,
      sub: zone.description,
    }));

    const bodyHtml = `
      ${proseBlock(haramizu.description || "")}
      ${statsItems.length ? statSection({ items: statsItems }) : ""}
      ${zoneItems.length ? listSection({ label: t("Development zones"), items: zoneItems }) : ""}
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: haramizu.subtitle || "",
        title: haramizu.name || "",
        bodyHtml,
      }),
    );
  },

  /**
   * Show government overview panel with all three tiers in a dashboard view.
   */
  showGovernmentOverview() {
    const tiers = AppData.governmentTiers || [];

    const tierItems = tiers.map((tier) => ({
      icon: `<span style="display: inline-block; width: 12px; height: 12px; border-radius: var(--radius-full); background: ${tier.color}; flex-shrink: 0;"></span>`,
      title: `${tier.name}`,
      sub: tier.tierLabel,
      value: tier.commitment,
    }));

    // Wire each item to its onclick handler in-place.
    const baseList = listSection({ items: tierItems });
    let wired = baseList;
    tiers.forEach((tier) => {
      wired = wired.replace(
        '<li class="step-list-item">',
        `<li class="step-list-item" style="cursor: pointer;" onclick="App._handleGovernmentSubItem('${tier.id}')">`,
      );
    });

    const bodyHtml = `
      ${statSection({
        items: [
          { label: t("Combined commitment"), value: "¥4T+", hero: true },
        ],
      })}
      <div class="step-section">
        ${sectionLabel(t("Tap a tier to see details"))}
        ${wired}
      </div>
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Government commitment"),
        title: t("National to local alignment"),
        bodyHtml,
      }),
    );
  },

  /**
   * Show government tier detail panel with commitment dashboard.
   * @param {Object} tier - Government tier data from AppData.governmentTiers
   */
  showGovernmentTierPanel(tier) {
    const statsItems = (tier.stats || []).map((s) => ({
      label: s.label,
      value: s.value,
    }));

    const subInitiativeItems = (tier.subItems || []).map((sub) => ({
      icon: `<span style="color: ${tier.color}; font-weight: var(--font-weight-bold);">${(sub.name || "").charAt(0)}</span>`,
      title: sub.name,
      sub: sub.subtitle,
      value: sub.commitment,
    }));

    const bodyHtml = `
      ${statSection({
        tier: tier.id,
        items: [
          {
            label: tier.commitmentLabel || t("Commitment"),
            value: tier.commitment || "",
            hero: true,
          },
        ],
      })}
      ${proseBlock(tier.description || "")}
      ${tier.id !== "central" && statsItems.length ? statSection({ items: statsItems }) : ""}
      ${subInitiativeItems.length ? listSection({ label: t("Key initiatives"), items: subInitiativeItems }) : ""}
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: tier.tierLabel || t("Government tier"),
        title: tier.name || "",
        bodyHtml,
      }),
    );
  },

  /**
   * Show single infrastructure road detail panel.
   * @param {Object} road - Road data from AppData.infrastructureRoads
   */
  showRoadDetailPanel(road) {
    const bodyHtml = `
      ${statSection({
        items: [
          { label: t("Commute saved"), value: road.commuteImpact || "-", hero: true },
        ],
      })}
      ${statSection({
        items: [
          { label: t("Drive to JASM"), value: road.driveToJasm || "-" },
          { label: t("Status"), value: road.status || "-" },
          { label: t("Completion"), value: road.completionDate || "-" },
          { label: t("Budget"), value: road.budget || "-" },
        ],
      })}
      ${proseBlock(road.description || "")}
      ${
        road.documentLink
          ? `<div class="step-section">${evidenceBlockHtml({
              title: t("View source document"),
              description: t("Open the official project document."),
              onclick: `UI.openEvidenceDocument('${road.documentLink}')`,
            })}</div>`
          : ""
      }
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Infrastructure plan"),
        title: road.name || "",
        bodyHtml,
      }),
    );
  },

  /**
   * Show single company detail panel.
   * @param {Object} company - Company data from AppData.companies
   */
  showCompanyDetailPanel(company) {
    const statsItems = (company.stats || []).map((s) => ({
      label: s.label,
      value: s.value,
    }));

    const bodyHtml = `
      ${statsItems.length ? statSection({ items: statsItems }) : ""}
      ${proseBlock(company.description || "")}
      ${
        company.evidence?.image
          ? `<div class="step-section">${evidenceBlockHtml({
              title: t("View evidence"),
              description: company.evidence.title || company.name,
              onclick: `UI.showEvidenceLightbox('${company.evidence.image}', '${(company.name || "").replace(/'/g, "\\'")}')`,
            })}</div>`
          : ""
      }
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Corporate investment"),
        title: company.name || "",
        bodyHtml,
      }),
    );
  },

  /**
   * Show panel for water evidence marker (Coca-Cola, Suntory)
   * @param {Object} evidence - Evidence marker data
   */
  showWaterEvidencePanel(evidence) {
    const bodyHtml = `
      ${proseBlock(evidence.description || "")}
      ${
        evidence.image
          ? `<div class="step-section">${evidenceBlockHtml({
              title: t("View evidence"),
              description: evidence.subtitle || "",
              onclick: `UI.showEvidenceLightbox('${evidence.image}', '${(evidence.name || "").replace(/'/g, "\\'")}')`,
            })}</div>`
          : ""
      }
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: evidence.subtitle || t("Water quality evidence"),
        title: evidence.name || "",
        bodyHtml,
      }),
    );
  },

  /**
   * Show energy station panel for Kyushu energy markers
   * @param {Object} station - Energy station data
   * @param {string} type - 'solar', 'wind', or 'nuclear'
   */
  showEnergyStationPanel(station, type) {
    const typeLabels = {
      solar: t("Solar power"),
      wind: t("Wind energy"),
      nuclear: t("Nuclear power"),
    };

    const bodyHtml = `
      ${statSection({
        items: [
          { label: t("Capacity"), value: station.capacity || "-" },
          { label: t("Prefecture"), value: station.prefecture || "-" },
        ],
      })}
      ${proseBlock(t("Kyushu leads Japan in renewable energy adoption, providing the stable and diverse power mix semiconductor manufacturing requires."))}
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: typeLabels[type] || t("Energy station"),
        title: station.name || "",
        bodyHtml,
      }),
    );
  },

  /**
   * Focus map on an energy station when clicked in disclosure list.
   * Flies camera to the station and highlights its marker.
   * @param {string} stationId - e.g. 'solar-kagoshima'
   * @param {string} type - 'solar', 'wind', or 'nuclear'
   */
  focusEnergyStation(stationId, type) {
    MapController.focusEnergyStation(stationId, type);

    // Highlight the selected row in the panel
    document
      .querySelectorAll(".energy-facility-item.selected")
      .forEach((el) => {
        el.classList.remove("selected");
        el.style.background = "";
      });
    const selectedItem = $sel(
      `.energy-facility-item[data-station-id="${stationId}"]`,
    );
    if (selectedItem) {
      selectedItem.classList.add("selected");
      selectedItem.style.background = "var(--color-bg-secondary)";
    }
  },

  // ────────────────────────────────────────────────
  // Future outlook panel (step 8)
  // ────────────────────────────────────────────────

  showFutureOutlookPanel() {
    this._futureOutlookActiveTab = this._futureOutlookActiveTab || "plans";
    const tabs = [
      { id: "plans", label: t("Plans"), onclick: `UI.switchFutureOutlookTab('plans')` },
      { id: "timeline", label: t("Timeline"), onclick: `UI.switchFutureOutlookTab('timeline')` },
    ];
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === this._futureOutlookActiveTab),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 8 · ${t("Future outlook")}`,
        title: t("Future outlook"),
        tabs,
        activeIndex,
        bodyHtml: this._buildFutureOutlookTabBody(this._futureOutlookActiveTab),
      }),
    );
  },

  switchFutureOutlookTab(tabId) {
    this._futureOutlookActiveTab = tabId;
    const tabIds = ["plans", "timeline"];
    const activeIndex = Math.max(0, tabIds.indexOf(tabId));
    const body = this.elements.panelContent?.querySelector(".panel-a-body");
    if (body) body.innerHTML = this._buildFutureOutlookTabBody(tabId);
    this.elements.panelContent
      ?.querySelectorAll(".panel-a-tab")
      .forEach((btn, i) => {
        btn.setAttribute(
          "aria-selected",
          i === activeIndex ? "true" : "false",
        );
      });
  },

  // Compatibility shim: toggleFutureLayer in step-handlers.js still
  // calls this. The new panel body is static (does not reflect
  // individual layer toggle state), so re-render is a no-op.
  updateFutureOutlookPanel() {},

  _buildFutureOutlookTabBody(tabId) {
    const flaskIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>';
    const planeIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>';
    const targetIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>';
    const routeIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>';
    const clockIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

    if (tabId === "timeline") {
      return `
        ${proseBlock(t("Construction milestones and completion targets across the corridor."))}
        ${statSection({
          label: t("Vision horizon"),
          items: [
            { label: t("Master plan target"), value: "2040", hero: true },
            { label: t("Government investment"), value: "¥4.8T" },
            { label: t("Projected new jobs"), value: "50,000" },
            { label: t("Major facilities"), value: "12" },
          ],
        })}
      `;
    }

    // plans (default)
    return `
      ${proseBlock(t("Composite 2030+ vision: science park expansion, grand airport access, government zone clusters, road network, and traffic flow."))}
      ${listSection({
        label: t("Planned developments"),
        items: [
          { icon: flaskIcon, title: t("Science park"), sub: t("560 ha designated, ¥2T public investment.") },
          { icon: planeIcon, title: t("Grand airport access"), sub: t("6.8 km new rail, 44 min station to airport.") },
          { icon: targetIcon, title: t("Government zone clusters"), sub: t("Kikuyo and Ozu long-term plans.") },
          { icon: routeIcon, title: t("Road extensions"), sub: t("Naka-Kyushu Cross Road segments.") },
          { icon: clockIcon, title: t("10-20 minute concept"), sub: t("Anywhere in corridor to the airport.") },
        ],
      })}
    `;
  },

  showFutureOutlookEvidence() {
    this.showQuickLook({
      type: "gallery",
      images: [
        "assets/use-case-images/evidence-10-minute-ring-road-2.webp",
        "assets/use-case-images/evidence-10-minute-ring-road-3.webp",
        "assets/use-case-images/evidence-new-grand-airport.webp",
        "assets/use-case-images/evidence-science-park.webp",
        "assets/use-case-images/evidence-kumamoto-future-road-network.webp",
      ],
      title: t("Future outlook evidence"),
    });
  },

  showPowerSourcesPanel() {
    this._powerActiveTab = this._powerActiveTab || "overview";
    const tabs = [
      { id: "overview", label: t("Overview"), onclick: `UI.switchPowerTab('overview')` },
      { id: "companies", label: t("Companies"), onclick: `UI.switchPowerTab('companies')` },
    ];
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === this._powerActiveTab),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 2 · ${t("Power resources")}`,
        title: t("Power resources"),
        tabs,
        activeIndex,
        bodyHtml: this._buildPowerTabBody(this._powerActiveTab),
        footerHtml: this._buildPowerTabFooter(this._powerActiveTab),
      }),
    );
  },

  switchPowerTab(tabId) {
    this._powerActiveTab = tabId;
    const tabIds = ["overview", "companies"];
    const activeIndex = Math.max(0, tabIds.indexOf(tabId));
    const body = this.elements.panelContent?.querySelector(".panel-a-body");
    if (body) body.innerHTML = this._buildPowerTabBody(tabId);
    const footer = this.elements.panelContent?.querySelector(".panel-a-footer");
    if (footer) footer.innerHTML = this._buildPowerTabFooter(tabId);
    this.elements.panelContent
      ?.querySelectorAll(".panel-a-tab")
      .forEach((btn, i) => {
        btn.setAttribute(
          "aria-selected",
          i === activeIndex ? "true" : "false",
        );
      });
  },

  updatePowerSourcesPanel() {
    // Re-render the active tab body (called when map state changes
    // outside the panel; the panel itself drives tab switches via
    // switchPowerTab).
    const body = this.elements.panelContent?.querySelector(".panel-a-body");
    if (body) body.innerHTML = this._buildPowerTabBody(this._powerActiveTab || "overview");
  },

  _buildPowerTabBody(tabId) {
    const power = AppData.resources?.power;
    const kyushu = AppData.kyushuEnergy;
    if (!power) return "";

    if (tabId === "companies") {
      const sunIcon =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
      const windIcon =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>';
      const atomIcon =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>';

      const buildItems = (stations, icon) =>
        (stations || []).map((s) => ({
          icon,
          title: s.name,
          sub: s.prefecture || "",
          value: s.capacity || "",
        }));

      const items = [
        ...buildItems(kyushu?.solar, sunIcon),
        ...buildItems(kyushu?.wind, windIcon),
        ...buildItems(kyushu?.nuclear, atomIcon),
      ];

      return `
        ${proseBlock(power.energyMix?.description || t("Kyushu leads Japan in energy diversity, providing the stable power semiconductor fabs require."))}
        ${listSection({ label: t("Energy stations"), items })}
      `;
    }

    // overview (default)
    const items = (power.stats || []).map((s, i) => ({
      label: s.label,
      value: s.value,
      hero: i === 0,
    }));
    return `
      ${proseBlock(power.description || "")}
      ${statSection({ label: power.name || t("Kyushu Power Grid"), items })}
      <div class="step-section">
        ${evidenceBlockHtml({
          title: power.evidence?.title || t("Kyushu Electric infrastructure plan"),
          description: power.evidence?.description || "",
          onclick: `UI.showEvidence('power', 'resource')`,
        })}
      </div>
    `;
  },

  _buildPowerTabFooter(tabId) {
    if (tabId !== "overview") return "";
    return `<button type="button" class="cta secondary" style="width: 100%;" onclick="UI.showEvidence('power', 'resource')">${t("View evidence")}</button>`;
  },

  // ────────────────────────────────────────────────
  // Step 9 - Investment opportunity zones overview (Central / Middle / JASM)
  // Distinct from Step 10's showInvestmentZonesPanel (Ozu 1 property).
  // ────────────────────────────────────────────────

  showInvestmentZonesOverviewPanel() {
    this._investmentZoneActiveTab = this._investmentZoneActiveTab || "central-city-zone";
    const zones = this._investmentZonePanelData();
    const tabs = zones.map((z) => ({
      id: z.id,
      label: z.label,
      onclick: `App._handleInvestmentZoneSubItem('${z.id}')`,
    }));
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === this._investmentZoneActiveTab),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 9 · ${t("Silicon triangle")}`,
        title: t("Investment opportunity zones"),
        tabs,
        activeIndex,
        bodyHtml: this._buildInvestmentZoneTabBody(this._investmentZoneActiveTab),
      }),
    );
  },

  _investmentZonePanelData() {
    return [
      {
        id: "central-city-zone",
        label: t("Central city"),
        prose: t("Kyushu-level business support center, suitable for Japanese corporate senior executive families."),
        stats: [
          { label: t("Product type"), value: t("RC mansion condominiums") },
          { label: t("Connection"), value: t("Shinkansen 30 min to Hakata") },
        ],
      },
      {
        id: "middle-zone",
        label: t("Middle zone"),
        prose: t("Lifestyle density between the city and the corridor. Large retail anchors are in place; internationalized services like bilingual clinics and intl preschools are still maturing."),
        stats: [
          { label: t("Product type"), value: t("High-spec detached rentals") },
          { label: t("Opportunity"), value: t("Intl services maturing") },
        ],
      },
      {
        id: "jasm-zone",
        label: t("JASM"),
        prose: t("Adjacent to TSMC's JASM fab. Strong demand from engineer secondees, growing through Fab 2 ramp."),
        stats: [
          { label: t("Product type"), value: t("Corporate RC + 3-4LDK") },
          { label: t("Target tenants"), value: t("Engineers, secondees") },
          { label: t("Demand waves"), value: t("Wave 1 now, Wave 2 ~2027") },
          { label: t("Supply gap"), value: t("Catches up 2028-2029") },
        ],
      },
    ];
  },

  _buildInvestmentZoneTabBody(activeId) {
    const zones = this._investmentZonePanelData();
    const zone = zones.find((z) => z.id === activeId) || zones[0];
    const items = (zone.stats || []).map((s, i) => ({
      label: s.label,
      value: s.value,
      hero: i === 0,
    }));
    return `
      ${proseBlock(zone.prose || "")}
      ${statSection({ label: zone.label, items })}
    `;
  },

  // ────────────────────────────────────────────────
  // Investment zones panel (step 11 / properties)
  // ────────────────────────────────────────────────

  showInvestmentZonesPanel() {
    this._ozu1ActiveTab = this._ozu1ActiveTab || "truth-engine";
    const property = AppData.properties.find((p) => p.id === "ozu-1");
    if (!property) return;

    const tabs = [
      { id: "truth-engine", label: t("Truth engine"), onclick: `UI.switchOzu1Tab('truth-engine')` },
      { id: "future-outlook", label: t("Future outlook"), onclick: `UI.switchOzu1Tab('future-outlook')` },
      { id: "financials", label: t("Financials"), onclick: `UI.switchOzu1Tab('financials')` },
      { id: "images", label: t("Images"), onclick: `UI.switchOzu1Tab('images')` },
    ];
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === this._ozu1ActiveTab),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 10 · ${t("Investment properties")}`,
        title: property.name,
        tabs,
        activeIndex,
        bodyHtml: this._buildOzu1TabBody(this._ozu1ActiveTab, property),
        footerHtml: this._buildOzu1TabFooter(this._ozu1ActiveTab, property),
      }),
    );
  },

  switchOzu1Tab(tabId) {
    this._ozu1ActiveTab = tabId;
    const tabIds = ["truth-engine", "future-outlook", "financials", "images"];
    const activeIndex = Math.max(0, tabIds.indexOf(tabId));
    const property = AppData.properties.find((p) => p.id === "ozu-1");
    const body = this.elements.panelContent?.querySelector(".panel-a-body");
    if (body && property) body.innerHTML = this._buildOzu1TabBody(tabId, property);
    const footer = this.elements.panelContent?.querySelector(".panel-a-footer");
    if (footer && property) footer.innerHTML = this._buildOzu1TabFooter(tabId, property);
    this.elements.panelContent
      ?.querySelectorAll(".panel-a-tab")
      .forEach((btn, i) => {
        btn.setAttribute(
          "aria-selected",
          i === activeIndex ? "true" : "false",
        );
      });
  },

  _buildOzu1TabFooter(tabId, property) {
    if (tabId !== "financials") return "";
    const evidence = property.cards.find((c) => c.type === "financial")?.data
      ?.rentalEvidence;
    if (!evidence) return "";
    const titleEsc = (evidence.title || "").replace(/'/g, "\\'");
    return `<button type="button" class="cta secondary" style="width: 100%;" onclick="UI.showEvidenceLightbox('${evidence.image}', '${titleEsc}')">${t("View evidence")}</button>`;
  },

  updateInvestmentZonesPanel() {
    // No-op: the property panel no longer reflects zone toggle state.
  },

  _buildOzu1TabBody(tabId, property) {
    const truthCard = property.cards.find((c) => c.type === "truth-engine");
    const futureCard = property.cards.find((c) => c.type === "future-outlook");
    const financialCard = property.cards.find((c) => c.type === "financial");
    const imagesCard = property.cards.find((c) => c.type === "images");

    const checkIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
    const sparkleIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>';

    if (tabId === "future-outlook") {
      const factors = (futureCard?.data?.factors || []).map((f) => ({
        icon: sparkleIcon,
        title: f.title,
        sub: f.impact,
      }));
      return `
        ${proseBlock(t("Area development plans affecting Ozu 1."))}
        ${listSection({ label: t("Drivers"), items: factors })}
      `;
    }

    if (tabId === "financials") {
      const evidence = financialCard?.data?.rentalEvidence;
      const evidenceHtml = evidence
        ? `<div class="step-section">${evidenceBlockHtml({
            title: t("AI rent assessment (4LDK / 89 sqm)"),
            description: t("Assessed rent ¥160,000/month from comparable properties."),
            onclick: `UI.showEvidenceLightbox('${evidence.image}', '${(evidence.title || "").replace(/'/g, "\\'")}')`,
          })}</div>`
        : "";
      return `
        ${statSection({
          label: t("Build-to-rent"),
          items: [
            { label: t("Acquisition cost"), value: "¥45.6M", hero: true },
            { label: t("Loan amount"), value: "¥22.8M" },
            { label: t("Annual rent (avg)"), value: "¥2.28M" },
            { label: t("Target IRR (avg)"), value: "5.0%" },
            { label: t("Hold period"), value: `5 ${t("years")}` },
            { label: t("Monthly repayment"), value: "¥120,818" },
          ],
        })}
        ${evidenceHtml}
      `;
    }

    if (tabId === "images") {
      const imgs = imagesCard?.data || {};
      const propName = (property.name || "").replace(/'/g, "\\'");
      const exteriorHtml = imgs.exterior
        ? imageBlock({
            label: t("Exterior"),
            src: imgs.exterior,
            alt: `${property.name} ${t("exterior")}`,
            onclick: `UI.showEvidenceLightbox('${imgs.exterior}', '${propName}')`,
          })
        : "";
      const interiorHtml = imgs.interior?.length
        ? imageGalleryBlock({
            label: t("Interior"),
            images: imgs.interior,
            onClickEachAttr: `onclick="UI.showEvidenceLightbox(this.src, '${propName} ${t("interior")}')"`,
          })
        : "";
      return `${exteriorHtml}${interiorHtml}`;
    }

    // truth-engine (default)
    const basics = truthCard?.data?.basicSettings || {};
    const design = truthCard?.data?.designStrategy || {};
    const featureItems = (design.features || []).map((f) => ({
      icon: checkIcon,
      title: f,
    }));
    return `
      ${statSection({
        label: t("Property details"),
        items: [
          { label: t("Type"), value: basics.propertyType || "" },
          { label: t("Layout"), value: basics.layout || "" },
          { label: t("Land area"), value: basics.landArea || "" },
          { label: t("Building"), value: basics.buildingArea || "" },
          { label: t("Availability"), value: basics.availability || "" },
          { label: t("Address"), value: property.address || basics.address || "" },
        ],
      })}
      ${listSection({
        label: t("Design strategy - expat family standard spec"),
        items: featureItems,
      })}
    `;
  },

  // ────────────────────────────────────────────────
  // Government support panel (step 4)
  // ────────────────────────────────────────────────

  /**
   * Show the government support panel with 3 toggleable government levels.
   * Called from App._renderStepPanel when step.id === 'government-support'.
   * @param {string[]} activeLevels - e.g. ['central', 'local']
   */
  showGovernmentPanel(activeLevels) {
    const tiers = AppData.governmentTiers || [];
    const activeId = (activeLevels && activeLevels[0]) || tiers[0]?.id;
    const tabs = tiers.map((tier) => ({
      id: tier.id,
      label: this._governmentTabLabel(tier.id),
      onclick: `if (!App.state.activeGovernmentLevels.includes('${tier.id}')) App.toggleGovernmentLevel('${tier.id}')`,
    }));
    const activeIndex = Math.max(
      0,
      tiers.findIndex((tier) => tier.id === activeId),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 4 · ${t("Government support")}`,
        title: t("Government support"),
        tabs,
        activeIndex,
        bodyHtml: this._buildGovernmentTierBody(activeId),
      }),
    );
  },

  /**
   * Short tab label per tier (matches playground "Central / Prefecture /
   * Local" header). Tier.tier in data is the long form ("Central
   * government" etc.) so it must be shortened.
   */
  _governmentTabLabel(id) {
    return {
      central: t("Central"),
      prefectural: t("Prefecture"),
      local: t("Local"),
    }[id] || id;
  },

  /**
   * Re-render the active tier's body content. Used by toggleGovernmentLevel
   * (single-select tab switch) — swaps panel-a-body and updates the
   * panel-a-tab aria-selected state without rebuilding the chrome.
   */
  updateGovernmentPanel(activeLevels) {
    const tiers = AppData.governmentTiers || [];
    const activeId = (activeLevels && activeLevels[0]) || tiers[0]?.id;
    const body = this.elements.panelContent?.querySelector(".panel-a-body");
    if (body) body.innerHTML = this._buildGovernmentTierBody(activeId);

    // Update tab aria-selected so the visual highlight follows the
    // active tier.
    const activeIndex = Math.max(
      0,
      tiers.findIndex((tier) => tier.id === activeId),
    );
    this.elements.panelContent
      ?.querySelectorAll(".panel-a-tab")
      .forEach((btn, i) => {
        btn.setAttribute(
          "aria-selected",
          i === activeIndex ? "true" : "false",
        );
      });
  },

  /**
   * Build the body for a SINGLE active government tier — matches the
   * playground "Compact tabs" pattern where the panel-a-tabs strip
   * switches between tiers and the body shows only the active one
   * (prose intro + bolded entity label + 2x2 stat grid).
   */
  _buildGovernmentTierBody(activeId) {
    const tiers = AppData.governmentTiers || [];
    const tier = tiers.find((tr) => tr.id === activeId) || tiers[0];
    if (!tier) return "";

    const tierSlug = tier.id === "prefectural" ? "prefecture" : tier.id;
    const stats = (tier.stats || []).map((s, i) => ({
      label: s.label,
      value: s.value,
      hero: i === 0,
    }));

    const mapPinIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';

    const municipalityItems = (tier.subItems || []).map((sub) => ({
      icon: mapPinIcon,
      title: sub.name,
      sub: sub.subtitle,
      value: sub.commitment,
    }));

    return `
      ${proseBlock(tier.description || "")}
      ${statSection({ label: tier.name, tier: tierSlug, items: stats })}
      ${municipalityItems.length ? listSection({ label: t("Municipalities"), items: municipalityItems }) : ""}
    `;
  },

  showEducationPanel() {
    this._educationActiveTab = this._educationActiveTab || "universities";
    const tabs = [
      { id: "universities", label: t("Universities"), onclick: `App._handleEducationSubItem('universities')` },
      { id: "employment", label: t("Employment"), onclick: `App._handleEducationSubItem('employment')` },
    ];
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === this._educationActiveTab),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 7 · ${t("Education and talent pipeline")}`,
        title: t("Education and talent pipeline"),
        tabs,
        activeIndex,
        bodyHtml: this._buildEducationTabBody(this._educationActiveTab),
        footerHtml: this._buildEducationTabFooter(this._educationActiveTab),
      }),
    );
  },

  _buildEducationTabBody(tabId) {
    if (tabId === "employment") {
      const data = AppData.employmentData;
      if (!data) return "";
      const companies = data.companies || [];

      const logoMap = {
        jasm: "assets/Jasm-logo.svg",
        tel: "assets/Tokyo-electron-logo.svg",
      };
      const items = companies.map((c) => {
        const logo = logoMap[c.id];
        const icon = logo
          ? `<img src="${logo}" alt="${(c.name || "").replace(/"/g, "&quot;")}" />`
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>';
        return {
          icon,
          title: c.name,
          sub: c.headlineLabel || "",
          value: c.headline || "",
        };
      });

      const jasm = companies.find((c) => c.id === "jasm");
      const salaryItems = (jasm?.stats || []).map((s, i) => ({
        label: s.label,
        value: s.value,
        hero: i === 0,
      }));

      const evidenceImg = "assets/use-case-images/step-7-TSMC.webp";
      const evidenceTitle = t("METI semiconductor workforce report");

      return `
        ${proseBlock(data.summary || "")}
        ${salaryItems.length ? statSection({ label: t("Salary comparison"), items: salaryItems }) : ""}
        ${listSection({ label: t("Major employers"), items })}
        <div class="step-section">
          ${evidenceBlockHtml({
            title: evidenceTitle,
            description: t("Workforce growth and salary data."),
            onclick: `UI.showQuickLook({ type: 'image', src: '${evidenceImg}', title: '${evidenceTitle}' })`,
          })}
        </div>
      `;
    }

    // universities (default)
    const pipeline = AppData.talentPipeline;
    if (!pipeline) return "";
    const fallbackIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
    const items = (pipeline.institutions || []).map((inst) => ({
      icon: inst.logo
        ? `<img src="${inst.logo}" alt="${(inst.fullName || inst.name || "").replace(/"/g, "&quot;")}" />`
        : fallbackIcon,
      title: inst.fullName || inst.name,
      sub: inst.role || "",
      value: inst.city || "",
    }));
    return `
      ${proseBlock(pipeline.description || "")}
      ${listSection({ label: t("Institutions"), items })}
    `;
  },

  _buildEducationTabFooter(tabId) {
    if (tabId !== "employment") return "";
    const evidenceImg = "assets/use-case-images/step-7-TSMC.webp";
    const evidenceTitle = t("METI semiconductor workforce report");
    return `<button type="button" class="cta secondary" style="width: 100%;" onclick="UI.showQuickLook({ type: 'image', src: '${evidenceImg}', title: '${evidenceTitle}' })">${t("View evidence")}</button>`;
  },

  /**
   * Show inspector stage 3 focused on a single institution (step 7 education pipeline).
   * Accepts an institution ID string or institution object.
   */
  showTalentInspector(instOrId) {
    const institutions = AppData.talentPipeline?.institutions || [];
    const inst =
      typeof instOrId === "string"
        ? institutions.find((i) => i.id === instOrId)
        : instOrId;
    if (!inst) return;

    const flyTo = inst.coords
      ? {
          center: MapController._toMapbox(inst.coords),
          zoom: 11,
          pitch: 35,
          bearing: 0,
          duration: 1500,
        }
      : undefined;

    this.renderInspectorPanel(3, {
      title: inst.name,
      institution: inst,
      startTab: 0,
      flyTo,
    });
  },

  /**
   * Show airline route panel for a single destination.
   * Clean layout: headline flight time, airline, description.
   */
  showAirlineRoutePanel(destination) {
    const isSuspended = destination.status === "suspended";

    const heroLabel = isSuspended
      ? `${t("Service suspended")} - ${t("Flight time when active")}`
      : t("Direct flight time");

    const semiSection = destination.semiconductorLink
      ? `<div class="step-section">${evidenceBlockHtml({
          title: destination.semiconductorLink.company,
          description: destination.semiconductorLink.role,
        })}</div>`
      : "";

    const bodyHtml = `
      ${statSection({
        items: [
          { label: heroLabel, value: destination.flightTime, hero: true },
        ],
      })}
      ${semiSection}
      ${statSection({
        items: [
          { label: t("Airlines"), value: destination.airlines.join(", ") },
          { label: t("Region"), value: destination.region },
        ],
      })}
      ${proseBlock(destination.description || "")}
      <div class="step-section">
        ${evidenceBlockHtml({
          title: t("View all routes"),
          description: t("All international routes from Aso Kumamoto Airport."),
          onclick: `UI.showAllAirlineRoutes()`,
        })}
      </div>
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("International route"),
        title: `${destination.name} (${destination.code})`,
        bodyHtml,
      }),
    );
  },

  showAllAirlineRoutes() {
    this._airlineActiveTab = this._airlineActiveTab || "routes";
    const tabs = [
      { id: "routes", label: t("Routes"), onclick: `UI.switchAirlineTab('routes')` },
      { id: "hub", label: t("Hub"), onclick: `UI.switchAirlineTab('hub')` },
    ];
    const activeIndex = Math.max(
      0,
      tabs.findIndex((tab) => tab.id === this._airlineActiveTab),
    );

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `${t("Step")} 3 · ${t("Strategic location")}`,
        title: t("Aso Kumamoto Airport"),
        tabs,
        activeIndex,
        bodyHtml: this._buildAirlineTabBody(this._airlineActiveTab),
      }),
    );
  },

  switchAirlineTab(tabId) {
    this._airlineActiveTab = tabId;
    const tabIds = ["routes", "hub"];
    const activeIndex = Math.max(0, tabIds.indexOf(tabId));
    const body = this.elements.panelContent?.querySelector(".panel-a-body");
    if (body) body.innerHTML = this._buildAirlineTabBody(tabId);
    this.elements.panelContent
      ?.querySelectorAll(".panel-a-tab")
      .forEach((btn, i) => {
        btn.setAttribute(
          "aria-selected",
          i === activeIndex ? "true" : "false",
        );
      });
  },

  _buildAirlineTabBody(tabId) {
    const routes = AppData.airlineRoutes?.destinations || [];
    const activeRoutes = routes.filter((r) => r.status === "active");

    if (tabId === "hub") {
      const regions = [...new Set(activeRoutes.map((r) => r.region))];
      const airlines = [...new Set(activeRoutes.flatMap((r) => r.airlines))];
      const semiLinks = activeRoutes
        .filter((r) => r.semiconductorLink)
        .map((r) => r.semiconductorLink.company);
      return `
        ${proseBlock(t("Aso Kumamoto Airport's role as the corridor's direct gateway to Asia and the semiconductor supply chain."))}
        ${statSection({
          label: t("Hub overview"),
          items: [
            { label: t("Direct destinations"), value: `${activeRoutes.length}`, hero: true },
            { label: t("Primary regions"), value: regions.join(", ") },
            { label: t("Active airlines"), value: `${airlines.length}` },
            { label: t("Semiconductor links"), value: semiLinks.join(" + ") || "-" },
          ],
        })}
      `;
    }

    // routes (default)
    const planeIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>';
    const items = activeRoutes.map((r) => ({
      icon: planeIcon,
      title: r.name,
      sub: r.airlines.join(", "),
      value: r.flightTime,
    }));
    const sectionHtml = listSection({
      label: `${t("Active routes")} (${activeRoutes.length})`,
      items,
    });
    // Wire click handlers so each row opens the single-route panel.
    const wiredSectionHtml = activeRoutes.reduce(
      (html, r) =>
        html.replace(
          '<li class="step-list-item">',
          `<li class="step-list-item" style="cursor: pointer;" onclick="UI.showAirlineRoutePanel(AppData.airlineRoutes.destinations.find(function(d){return d.id === '${r.id}';}))">`,
        ),
      sectionHtml,
    );

    return `
      ${proseBlock(`${t("Direct connections to")} ${activeRoutes.length} ${t("destinations across Korea, Taiwan, and greater Asia.")}`)}
      ${wiredSectionHtml}
    `;
  },

  /**
   * Cinematic property drill-down: 3-stage transition
   *
   * Stage 1: Bird's-eye 3D tilt (2.5s) — Mapbox camera flyTo
   * Stage 2: Crossfade to exterior photo (hold 800ms + fade 800ms)
   * Stage 3: Crossfade to interior gallery (800ms) — if images exist
   *
   * Total: ≤5s. Right panel visible throughout all stages.
   * Interruptible via cancelDrillDown() at any point.
   *
   * @param {Object} property - Property data object
   */
  async showPropertyReveal(property) {
    // Accept string ID or object
    if (typeof property === "string") {
      property = AppData.properties.find((p) => p.id === property);
      if (!property) return;
    }

    // Cancel any in-progress drill-down
    if (this._drillDown) {
      this._drillDown.cancelled = true;
    }

    const drillDown = { cancelled: false, property };
    this._drillDown = drillDown;

    // Stage 1: Fly to property (1.8s) - camera only
    await MapController.forwardReveal(property);
    if (drillDown.cancelled) return;

    // Show the inspector panel immediately after fly completes
    this.renderInspectorPanel(9, { title: property.name, property });

    // Stage 2: Crossfade to exterior photo (800ms) - stay on exterior, user navigates
    const overlay = this._ensureTransitionOverlay();
    const imgs = this._getImagesData(property);
    const exteriorSrc = imgs.exterior;
    this._setTransitionImage(overlay, exteriorSrc, `${property.name} exterior`);
    this._setTransitionLabel(overlay, property.name, property.subtitle);

    // Set up gallery images (exterior + interiors) for manual navigation
    const interiorImages = imgs.interior || [];
    this._drillDownImages = [exteriorSrc, ...interiorImages];
    this._drillDownImageIndex = 0;

    // Wait one frame for image to paint, then fade in
    await new Promise((resolve) => requestAnimationFrame(resolve));
    $id("map-container").classList.add("immersive-active");
    overlay.classList.add("visible");
    await this._delay(800);
    if (drillDown.cancelled) return;

    // Show gallery nav if there are multiple images to browse
    if (this._drillDownImages.length > 1) {
      this._showGalleryNav(overlay);
    }

    // Show property-to-property navigation
    this._updatePropertyNav(overlay);
  },

  /**
   * Cancel an in-progress drill-down and reverse to 2D map
   */
  async cancelDrillDown() {
    if (this._drillDown) {
      this._drillDown.cancelled = true;
    }

    // Fade out transition overlay (uses fast exit transition from CSS)
    const overlay = $id("transition-overlay");
    if (overlay && overlay.classList.contains("visible")) {
      overlay.classList.remove("visible");
      const galleryNav = overlay.querySelector(".transition-gallery-nav");
      if (galleryNav) galleryNav.classList.add("hidden");
      const propNav = overlay.querySelector(".transition-property-nav");
      if (propNav) propNav.classList.add("hidden");
    }

    // Restore map controls
    document
      .getElementById("map-container")
      .classList.remove("immersive-active");

    // Reverse camera back to saved view
    await MapController.reverseReveal();

    // Restore investment zone circles if on properties step
    if (App.state.currentStep === 9) {
      MapController.showInvestmentZones();
    }

    // Cleanup
    this._drillDown = null;
    this._drillDownImages = null;
    this._drillDownImageIndex = 0;
  },

  /**
   * Show a panel listing all properties in a selected zone for drill-down.
   * Each row is clickable and calls App.selectProperty().
   * @param {string} label - zone group label (e.g. "Ozu properties")
   * @param {Array} properties - array of property objects in this zone
   */
  showZonePropertiesPanel(label, properties, options = {}) {
    const propertyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="${MAP_COLORS.property}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

    const items = properties.map((p) => ({
      icon: propertyIcon,
      title: p.name,
      sub: p.type || p.subtitle || "",
    }));

    // Wire each li to selectProperty by id.
    const baseList = listSection({ items });
    let wired = baseList;
    properties.forEach((p) => {
      wired = wired.replace(
        '<li class="step-list-item">',
        `<li class="step-list-item" style="cursor: pointer;" onclick="App.selectProperty('${p.id}')">`,
      );
    });

    const bodyHtml = `
      ${proseBlock(`${properties.length} ${properties.length === 1 ? t("property") : t("properties")} ${t("in this zone")}`)}
      ${wired}
      ${
        options.evidencePdf
          ? `<div class="step-section">${evidenceBlockHtml({
              title: t("Evidence report"),
              description: t("Open the official zone evidence PDF."),
              onclick: `UI.showQuickLook({ type: 'pdf', src: '${options.evidencePdf}', title: '${t("Evidence report")}' })`,
            })}</div>`
          : ""
      }
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Properties"),
        title: label,
        bodyHtml,
      }),
    );
  },

  /**
   * Show the Step 1 context panel: property connections to infrastructure.
   * @param {Object} property - property object with connections data
   */
  showPropertyContextPanel(property) {
    if (typeof property === "string") {
      property = AppData.properties.find((p) => p.id === property);
      if (!property) return;
    }

    const conn = property.connections;
    if (!conn) return;

    // Build connection list items
    const connectionIcons = {
      jasm: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>',
      station:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
      airport:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
      road: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5ac8fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>',
    };

    const items = [
      {
        icon: connectionIcons.jasm,
        title: t("JASM (TSMC)"),
        sub: `${conn.jasm.distance} - ${conn.jasm.time} ${t("drive")}`,
      },
      {
        icon: connectionIcons.station,
        title: conn.station.name,
        sub: `${conn.station.distance} - ${conn.station.time}`,
      },
      {
        icon: connectionIcons.airport,
        title: t("Kumamoto Airport"),
        sub: `${conn.airport.distance} - ${conn.airport.time} ${t("drive")}`,
      },
      {
        icon: connectionIcons.road,
        title: conn.road.name,
        sub: t("Planned infrastructure extension"),
      },
    ];

    const bodyHtml = `
      ${listSection({ label: t("Connections"), items })}
      ${proseBlock(t("Click the property marker to explore details"))}
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Infrastructure access"),
        title: property.name,
        bodyHtml,
      }),
      { clearHistory: true },
    );
    this.currentProperty = property;
  },

  /**
   * Show endpoint detail in the right panel when a context-line endpoint marker is clicked.
   */
  showEndpointDetail(property, type) {
    if (typeof property === "string") {
      property = AppData.properties.find((p) => p.id === property);
      if (!property) return;
    }
    const conn = property.connections;
    if (!conn || !conn[type]) return;

    const target = conn[type];
    const colors = {
      jasm: "#ff3b30",
      station: "#007aff",
      airport: "#34c759",
      road: "#5ac8fa",
    };
    const names = {
      jasm: t("JASM (TSMC)"),
      station: target.name || t("Station"),
      airport: t("Kumamoto Airport"),
      road: target.name || t("Road"),
    };
    const subtitles = {
      jasm: t("Semiconductor factory"),
      station: t("Rail connection"),
      airport: t("Air access"),
      road: t("Road infrastructure"),
    };

    const color = colors[type] || "#6e7073";
    const name = names[type];
    const subtitle = subtitles[type];

    const statItems = [];
    if (target.distance) {
      statItems.push({ label: t("Distance"), value: target.distance });
    }
    if (target.time) {
      statItems.push({ label: t("Drive time"), value: target.time });
    }

    const bodyHtml = `
      ${proseBlock(`${t("Connection from")} ${property.name}`)}
      ${statItems.length ? statSection({ items: statItems }) : ""}
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: `<span style="color: ${color};">${subtitle}</span>`,
        title: name,
        bodyHtml,
      }),
    );
  },

  /**
   * Create or return the transition overlay element (lazy, once)
   * @private
   */
  backToAllProperties() {
    this.hidePanel();
  },

  /**
   * Show Truth Engine (step 10 - growth drivers)
   */
  showPortfolioSummary() {
    const properties = AppData.properties;

    // Calculate total potential (using average scenario)
    let totalNetProfit = 0;
    const propertyNames = [];

    properties.forEach((property) => {
      const fin = this._getFinancialData(property);
      totalNetProfit += fin.scenarios?.average?.netProfit || 0;
      propertyNames.push(property.name);
    });

    const formatYen = (num) => {
      if (num >= 10000000) {
        return "¥" + (num / 1000000).toFixed(1) + "M";
      }
      return "¥" + num.toLocaleString();
    };

    // GKTK fund info
    const gktk = AppData.gktk;
    const gktkHtml = gktk
      ? `
            <div class="gktk-banner">
                <div class="gktk-label">${gktk.fullName}</div>
                <div class="gktk-size">${gktk.fundSize}</div>
                <div class="gktk-note">${gktk.fundSizeNote} &middot; ${gktk.vintage} vintage &middot; ${gktk.stats[3].value} target IRR</div>
            </div>
        `
      : "";

    const content = `
            ${gktkHtml}
            <div class="portfolio-summary">
                <div class="portfolio-summary-label">${t("Combined 5-year potential")}</div>
                <div class="portfolio-summary-value">${formatYen(totalNetProfit)}</div>
                <div class="portfolio-summary-detail">${t("Projected return across")} ${properties.length} ${t("properties")}</div>
                <div class="portfolio-summary-properties">
                    ${propertyNames.join(" • ")}
                </div>
            </div>
        `;

    return content;
  },

  /**
   * Return GKTK fund banner HTML (for disclosure sections)
   */
  showGktkSummary() {
    const gktk = AppData.gktk;
    if (!gktk) return `<p>${t("Fund data unavailable.")}</p>`;
    return `
            <div class="gktk-banner">
                <div class="gktk-label">${gktk.fullName}</div>
                <div class="gktk-size">${gktk.fundSize}</div>
                <div class="gktk-note">${gktk.fundSizeNote} &middot; ${gktk.vintage} vintage &middot; ${gktk.stats[3].value} target IRR</div>
            </div>
        `;
  },

  /**
   * Return portfolio returns card HTML (for disclosure sections)
   */
  showPortfolioCard() {
    const properties = AppData.properties;
    let totalNetProfit = 0;
    const propertyNames = [];

    properties.forEach((property) => {
      const fin = this._getFinancialData(property);
      totalNetProfit += fin.scenarios?.average?.netProfit || 0;
      propertyNames.push(property.name);
    });

    const formatYen = (num) => {
      if (num >= 10000000) return "¥" + (num / 1000000).toFixed(1) + "M";
      return "¥" + num.toLocaleString();
    };

    return `
            <div class="portfolio-summary">
                <div class="portfolio-summary-label">${t("Combined 5-year potential")}</div>
                <div class="portfolio-summary-value">${formatYen(totalNetProfit)}</div>
                <div class="portfolio-summary-detail">${t("Projected return across")} ${properties.length} ${t("properties")}</div>
                <div class="portfolio-summary-properties">
                    ${propertyNames.join(" • ")}
                </div>
            </div>
        `;
  },

  /**
   * Show Performance Calculator with headline stat and progressive disclosure
   * @param {Object} property - Property to show financials for
   * @param {string} scenario - Scenario to highlight (default: 'average')
   */
  showPerformanceCalculatorEnhanced(property, scenario = "average") {
    this.currentProperty = property;
    this.currentScenario = scenario;
    const fin = this._getFinancialData(property);
    const data = (fin.scenarios || {})[scenario] || {};

    const formatYen = (num) => "¥" + num.toLocaleString();
    const formatYenCompact = (num) => {
      if (num >= 1000000) return "¥" + (num / 1000000).toFixed(1) + "M";
      return formatYen(num);
    };
    const formatPercent = (num) =>
      (num >= 0 ? "+" : "") + (num * 100).toFixed(1) + "%";

    // Get confidence info
    const confidence = this.getConfidenceInfo(scenario);
    const sellingPriceInfo = this.formatWithConfidence(
      data.sellingPrice,
      scenario,
    );

    const scenarioBtns = `
      <div class="step-section">
        ${sectionLabel(t("Scenario"))}
        <div style="display: inline-flex; gap: var(--space-1); background: var(--color-bg-secondary); padding: 2px; border-radius: var(--radius-small);">
          ${["bear", "average", "bull"]
            .map(
              (sc) =>
                `<button type="button" style="appearance: none; border: none; background: ${
                  scenario === sc ? "var(--color-bg-primary)" : "transparent"
                }; padding: var(--space-1) var(--space-3); font-family: var(--font-display); font-size: var(--text-xs); font-weight: ${
                  scenario === sc
                    ? "var(--font-weight-semibold)"
                    : "var(--font-weight-medium)"
                }; color: var(--color-text-primary); border-radius: calc(var(--radius-small) - 2px); cursor: pointer;" onclick="UI.showPerformanceCalculatorEnhanced(UI.currentProperty, '${sc}')">${sc.charAt(0).toUpperCase() + sc.slice(1)}</button>`,
            )
            .join("")}
        </div>
      </div>
    `;

    const breakdownItems = [
      { label: t("Appreciation rate"), value: `${formatPercent(data.appreciation)}/${t("yr")}` },
      { label: t("Est. selling price (5yr)"), value: sellingPriceInfo.display },
      { label: t("Rental yield"), value: formatPercent(data.noiTicRatio || data.irr || 0) },
      { label: t("Annual rental income"), value: formatYen(data.annualRent) },
      { label: t("Applicable taxes"), value: formatYen(data.taxes) },
    ];

    const bodyHtml = `
      ${statSection({
        items: [
          {
            label: `${t("Projected 5-year return")} - ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} ${t("case")}`,
            value: formatYenCompact(data.netProfit),
            hero: true,
          },
        ],
      })}
      ${scenarioBtns}
      <div class="step-section">
        ${sectionLabel(t("Scenario comparison"))}
        <div style="height: 120px;">
          <canvas id="scenario-chart" role="img" aria-label="${t("Bar chart comparing investment scenarios")}"></canvas>
        </div>
        <div id="scenario-chart-table"></div>
      </div>
      ${statSection({ label: t("Detailed breakdown"), items: breakdownItems })}
      <div class="step-section">
        ${evidenceBlockHtml({
          title: t("View rental report"),
          description: t("Open the detailed rental projection."),
          onclick: `UI.showEvidence('${property.id}', 'rental')`,
        })}
        ${evidenceBlockHtml({
          title: t("Area statistics"),
          description: t("Compare to nearby market averages."),
          onclick: `UI.showAreaStats()`,
        })}
      </div>
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Financial projection"),
        title: t("Performance calculator"),
        bodyHtml,
      }),
    );

    // Render chart after DOM update
    setTimeout(() => this.renderScenarioChart(property), 50);
  },

  /**
   * Toggle financials disclosure expanded state
   */
  toggleFinancialsDisclosure() {
    const disclosure = $id("financials-disclosure");
    const header = disclosure.querySelector(".financials-disclosure-header");
    const isExpanded = disclosure.classList.contains("expanded");

    if (isExpanded) {
      disclosure.classList.remove("expanded");
      header.setAttribute("aria-expanded", "false");
    } else {
      disclosure.classList.add("expanded");
      header.setAttribute("aria-expanded", "true");
    }
  },
};
