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
} from "../shared/templates.js";

export const methods = {
  showInvestmentOverview() {
    const content = `
            ${panelHeader("Corporate investment", "Investment comparison", "Total corporate investment in the Kumamoto semiconductor corridor.")}
            <div class="chart-container" style="height: 280px; margin: 24px 0;">
                <canvas id="investment-chart" role="img" aria-label="Bar chart comparing corporate investments across seven companies in the Kumamoto corridor"></canvas>
            </div>
            <div id="investment-chart-table"></div>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">¥2.6T+</div>
                    <div class="stat-label">Total investment</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">9,600+</div>
                    <div class="stat-label">Direct jobs</div>
                </div>
            </div>
            ${dataAttribution("Investment data from official company announcements")}
        `;

    this.showPanel(content);

    // Render chart after DOM update
    setTimeout(() => this.renderInvestmentChart(), 50);
  },

  /**
   * Show app directly - no start screen, subtle fade-in
   */
  showResourcePanel(resource) {
    const statsHtml = bentoStats(resource.stats);

    // Generate energy mix section for power resource (disclosure groups)
    let energyMixHtml = "";
    if (resource.id === "power" && resource.energyMix) {
      const iconMap = {
        Solar:
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
        Wind: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
        Nuclear:
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2a7 7 0 0 0-5.4 11.5"/><path d="M12 2a7 7 0 0 1 5.4 11.5"/><path d="M7 20.7a7 7 0 0 0 10 0"/></svg>',
      };
      const colorMap = {
        Solar: "#ff9500",
        Wind: "#5ac8fa",
        Nuclear: "#ff3b30",
      };

      const renderEnergyDisclosure = (type, facilities) => {
        const groupId = `energy-${type.toLowerCase()}`;
        return `
                    <div class="disclosure-group" data-group-id="${groupId}">
                        <button class="disclosure-header" aria-expanded="false" onclick="UI.toggleDisclosureGroup('${groupId}')">
                            <span class="disclosure-triangle" aria-hidden="true">
                                <svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l6 4-6 4V4z"/></svg>
                                <svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 6 4-6H4z"/></svg>
                            </span>
                            <span class="disclosure-icon" style="color: ${colorMap[type]}">${iconMap[type]}</span>
                            <span class="disclosure-title">${type}</span>
                            <span class="disclosure-badge">${facilities.length}</span>
                        </button>
                        <div class="disclosure-content">
                            ${facilities
                              .map(
                                (f) => `
                                <div class="disclosure-item energy-facility-item" data-station-id="${f.id || ""}" data-station-type="${type.toLowerCase()}" style="display: flex; justify-content: space-between; padding: var(--space-2) var(--space-4); font-size: var(--text-sm); cursor: pointer; border-radius: var(--radius-small); transition: background-color var(--duration-fast) var(--easing-standard);"${f.id ? ` onclick="UI.focusEnergyStation('${f.id}', '${type.toLowerCase()}')"` : ""}>
                                    <span style="color: var(--color-text-secondary);">${f.name || f.examples || f}</span>
                                    <span style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">${f.capacity || ""}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `;
      };

      energyMixHtml = `
                <div style="margin-top: var(--space-4);">
                    <div class="panel-bento-label" style="margin-bottom: var(--space-2);">Energy mix</div>
                    <p>${resource.energyMix.description}</p>
                    <div style="margin-top: var(--space-4);">
                        ${resource.energyMix.sources
                          .map((source) => {
                            const key = source.type;
                            const energyData = AppData.kyushuEnergy;
                            const facilities = energyData
                              ? energyData[key.toLowerCase()] || []
                              : [];
                            return renderEnergyDisclosure(key, facilities);
                          })
                          .join("")}
                    </div>
                </div>
            `;
    }

    const content = `
            ${panelHeader(resource.subtitle, resource.name, resource.description)}
            <div style="margin-top: var(--space-4);">
                ${statsHtml}
            </div>
            ${energyMixHtml}
            <div style="margin-top: var(--space-6);">
                <button class="panel-bento-btn secondary full-width" onclick="UI.showEvidence('${resource.id}', 'resource')">
                    View evidence
                </button>
            </div>
        `;

    this.showPanel(content);
  },

  /**
   * Show dedicated Haramizu station panel with 3 development zones.
   */
  showHaramizuPanel() {
    const haramizu = AppData.haramizuStation;
    if (!haramizu) return;

    const statsHtml = bentoStats(haramizu.stats);

    const zonesHtml = haramizu.zones
      .map(
        (zone) => `
            <div style="padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-medium);">
                <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-2);">${zone.name}</div>
                <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin: 0;">${zone.description}</p>
            </div>
        `,
      )
      .join("");

    const content = `
            ${panelHeader(haramizu.subtitle, haramizu.name, haramizu.description)}
            <div style="margin-top: var(--space-4);">
                ${statsHtml}
            </div>
            <div style="margin-top: var(--space-6);">
                <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">Development zones</div>
                <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                    ${zonesHtml}
                </div>
            </div>
        `;

    this.showPanel(content);
  },

  /**
   * Show government overview panel with all three tiers in a dashboard view.
   */
  showGovernmentOverview() {
    const tiers = AppData.governmentTiers || [];
    const tierCards = tiers
      .map(
        (tier) => `
            <div style="padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-medium); cursor: pointer;"
                 onclick="App._handleGovernmentSubItem('${tier.id}')">
                <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: ${tier.color}; flex-shrink: 0;"></div>
                    <span style="font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary);">${tier.tierLabel}</span>
                </div>
                <div style="font-weight: var(--font-weight-semibold);">${tier.name}</div>
                <div style="font-size: var(--text-2xl); font-weight: var(--font-weight-bold); color: ${tier.color}; margin-top: var(--space-2);">${tier.commitment}</div>
                <div style="font-size: var(--text-sm); color: var(--color-text-tertiary);">${tier.commitmentLabel}</div>
            </div>
        `,
      )
      .join("");

    const totalCommitment = "¥4T+";
    this.showPanel(`
            ${panelHeader("Government commitment", "National to local alignment")}
            <div style="display: flex; align-items: baseline; gap: var(--space-2); margin: var(--space-4) 0;">
                <span style="font-size: var(--text-3xl); font-weight: var(--font-weight-bold); color: var(--color-primary);">${totalCommitment}</span>
                <span style="font-size: var(--text-sm); color: var(--color-text-secondary);">Combined commitment</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-4);">
                ${tierCards}
            </div>
            <p style="margin-top: var(--space-4); font-size: var(--text-sm); color: var(--color-text-tertiary);">Click any tier for details.</p>
        `);
  },

  /**
   * Show government tier detail panel with commitment dashboard.
   * @param {Object} tier - Government tier data from AppData.governmentTiers
   */
  showGovernmentTierPanel(tier) {
    let subItemsHtml = "";
    if (tier.subItems && tier.subItems.length > 0) {
      subItemsHtml = `
                <div style="margin-top: var(--space-4);">
                    <div style="font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); margin-bottom: var(--space-3);">Key initiatives</div>
                    ${tier.subItems
                      .map(
                        (sub) => `
                        <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-medium); margin-bottom: var(--space-2);">
                            <div style="flex: 1;">
                                <div style="font-weight: var(--font-weight-medium);">${sub.name}</div>
                                <div style="font-size: var(--text-sm); color: var(--color-text-secondary);">${sub.subtitle}</div>
                            </div>
                            <div style="font-weight: var(--font-weight-semibold); color: var(--color-primary);">${sub.commitment}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `;
    }

    const content = `
            ${panelHeader(tier.tierLabel || "Government tier", tier.name)}
            <div style="display: flex; align-items: baseline; gap: var(--space-2); margin: var(--space-4) 0;">
                <span style="font-size: var(--text-3xl); font-weight: var(--font-weight-bold); color: ${tier.color || "var(--color-primary)"};">${tier.commitment}</span>
                <span style="font-size: var(--text-sm); color: var(--color-text-secondary);">${tier.commitmentLabel || ""}</span>
            </div>
            <p>${tier.description}</p>
            ${tier.stats ? statGrid(tier.stats, "margin-top: var(--space-4)") : ""}
            ${subItemsHtml}
        `;

    this.showPanel(content);
  },

  /**
   * Show single infrastructure road detail panel.
   * @param {Object} road - Road data from AppData.infrastructureRoads
   */
  showRoadDetailPanel(road) {
    const content = `
            ${panelHeader("Infrastructure plan", road.name)}
            <div style="display: flex; align-items: baseline; gap: var(--space-2); margin: var(--space-4) 0;">
                <span style="font-size: var(--text-3xl); font-weight: var(--font-weight-bold); color: var(--color-primary);">${road.commuteImpact}</span>
                <span style="font-size: var(--text-sm); color: var(--color-text-secondary);">commute saved</span>
            </div>
            <div class="stat-grid" style="margin-top: var(--space-4);">
                <div class="stat-item"><div class="stat-value">${road.driveToJasm || "-"}</div><div class="stat-label">Drive to JASM</div></div>
                <div class="stat-item"><div class="stat-value">${road.status}</div><div class="stat-label">Status</div></div>
                <div class="stat-item"><div class="stat-value">${road.completionDate}</div><div class="stat-label">Completion</div></div>
                <div class="stat-item"><div class="stat-value">${road.budget}</div><div class="stat-label">Budget</div></div>
            </div>
            <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">${road.description}</p>
            ${
              road.documentLink
                ? `
                <button class="button-secondary" style="margin-top: var(--space-6); width: 100%;" onclick="UI.openEvidenceDocument('${road.documentLink}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    View source document
                </button>
            `
                : ""
            }
        `;

    this.showPanel(content);
  },

  /**
   * Show single company detail panel.
   * @param {Object} company - Company data from AppData.companies
   */
  showCompanyDetailPanel(company) {
    const statsHtml = statGrid(
      company.stats || [],
      "margin-top: var(--space-4)",
    );

    const evidenceHtml = company.evidence
      ? `
            <button class="panel-btn secondary" style="margin-top: var(--space-6);" onclick="UI.openEvidenceDocument('${company.evidence.title}')">
                View source document
            </button>`
      : "";

    const content = `
            ${panelHeader("Corporate investment", company.name)}
            ${company.subtitle ? `<p style="margin-top: var(--space-2); font-size: var(--text-sm); color: var(--color-text-tertiary);">${company.subtitle}</p>` : ""}
            ${statsHtml}
            <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">${company.description || ""}</p>
            ${evidenceHtml}
        `;

    this.showPanel(content);
  },

  /**
   * Show panel for water evidence marker (Coca-Cola, Suntory)
   * @param {Object} evidence - Evidence marker data
   */
  showWaterEvidencePanel(evidence) {
    const content = `
            ${panelHeader("Water quality evidence", evidence.name)}
            <p class="panel-subtitle" style="color: var(--color-text-secondary); margin-bottom: var(--space-4);">${evidence.subtitle}</p>
            <p style="margin-bottom: var(--space-4);">${evidence.description}</p>
            ${statGrid(evidence.stats)}
            <p style="margin-top: var(--space-4); font-size: var(--text-sm); color: var(--color-text-tertiary);">
                Major manufacturers chose Kumamoto for water quality - proof the resource meets industrial standards.
            </p>
        `;

    this.showPanel(content);
  },

  /**
   * Show energy station panel for Kyushu energy markers
   * @param {Object} station - Energy station data
   * @param {string} type - 'solar', 'wind', or 'nuclear'
   */
  showEnergyStationPanel(station, type) {
    const typeLabels = {
      solar: "Solar power",
      wind: "Wind energy",
      nuclear: "Nuclear power",
    };
    const typeColors = {
      solar: "#ff9500",
      wind: "#5ac8fa",
      nuclear: "#ff3b30",
    };

    const content = `
            <h2>${station.name}</h2>
            <div style="
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-1) var(--space-3);
                background: ${typeColors[type]}15;
                border-radius: var(--radius-small);
                font-family: var(--font-display);
                font-size: var(--text-sm);
                font-weight: var(--font-weight-semibold);
                color: ${typeColors[type]};
                margin-bottom: var(--space-4);
            ">${typeLabels[type]}</div>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">${station.capacity}</div>
                    <div class="stat-label">Capacity</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${station.prefecture}</div>
                    <div class="stat-label">Prefecture</div>
                </div>
            </div>
            <p style="margin-top: var(--space-4); color: var(--color-text-secondary);">
                Kyushu leads Japan in renewable energy adoption, providing the stable and diverse power mix semiconductor manufacturing requires.
            </p>
        `;

    this.showPanel(content);
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
    const selectedItem = document.querySelector(
      `.energy-facility-item[data-station-id="${stationId}"]`,
    );
    if (selectedItem) {
      selectedItem.classList.add("selected");
      selectedItem.style.background = "var(--color-bg-secondary)";
    }
  },

  /**
   * Show the power sources panel with 3 toggleable energy types.
   * Called when user clicks the "Power sources" subItem in step 1.
   */
  showPowerSourcesPanel(activeTypes) {
    const content = this._buildPowerSourcesContent(activeTypes || []);
    this.showPanel(content);
  },

  /**
   * Re-render the power sources panel to reflect current toggle state.
   * @param {string[]} activeTypes - e.g. ['solar', 'nuclear']
   */
  updatePowerSourcesPanel(activeTypes) {
    const content = this._buildPowerSourcesContent(activeTypes);
    // Direct innerHTML update (no history push) to avoid stacking
    this.elements.panelContent.innerHTML = content;
  },

  // ────────────────────────────────────────────────
  // Investment zones panel (step 11 / properties)
  // ────────────────────────────────────────────────

  /**
   * Show the investment zones panel with toggleable zones.
   * Called when the "properties" step activates.
   * @param {string[]} activeZones - zone IDs, e.g. ['koshi-zone']
   */
  showInvestmentZonesPanel(activeZones) {
    const content = this._buildInvestmentZonesContent(activeZones || []);
    this.showPanel(content);
  },

  /**
   * Re-render the investment zones panel to reflect current toggle state.
   * @param {string[]} activeZones - currently toggled-on zone IDs
   */
  updateInvestmentZonesPanel(activeZones) {
    const content = this._buildInvestmentZonesContent(activeZones);
    this.elements.panelContent.innerHTML = content;
  },

  /**
   * Build the HTML for the investment zones panel.
   * @param {string[]} activeZones - currently toggled-on zone IDs
   * @returns {string} HTML string
   */
  _buildInvestmentZonesContent(activeZones) {
    const zones = AppData.investmentZones || [];

    const rowsHtml = zones
      .map((zone) => {
        const isActive = activeZones.includes(zone.id);
        return toggleRow({
          id: zone.id,
          label: zone.name,
          icon: `<span style="display: inline-block; width: 12px; height: 12px; border-radius: var(--radius-full); background: ${zone.strokeColor}; flex-shrink: 0;"></span>`,
          active: isActive,
          onclick: `App.toggleInvestmentZone('${zone.id}')`,
        });
      })
      .join("");

    // Build detail cards for active zones
    let detailsHtml = "";
    if (activeZones.length > 0) {
      const cardsHtml = activeZones
        .map((zoneId) => {
          const zone = zones.find((z) => z.id === zoneId);
          if (!zone) return "";

          // Find properties in this zone by exact zone name match
          const zoneProps = AppData.properties.filter(
            (p) => p.zone && p.zone === zone.name,
          );

          let propsListHtml;
          if (zoneProps.length > 0) {
            // Group properties by sub-area
            const subAreaMap = {};
            zoneProps.forEach((p) => {
              const area = p.subArea || "Other";
              if (!subAreaMap[area]) subAreaMap[area] = [];
              subAreaMap[area].push(p);
            });

            propsListHtml = Object.entries(subAreaMap)
              .map(
                ([area, props]) => `
                    <div style="margin-top: var(--space-3);">
                        <div style="font-size: var(--text-xs); font-weight: var(--font-weight-medium); color: var(--color-text-tertiary); text-transform: none; margin-bottom: var(--space-1);">${area}</div>
                        ${props
                          .map(
                            (p) => `
                            <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border-radius: var(--radius-small); cursor: pointer; transition: background-color var(--duration-fast) var(--easing-standard);"
                                 onmouseenter="this.style.background='var(--color-bg-secondary)'"
                                 onmouseleave="this.style.background=''"
                                 onclick="App.selectProperty('${p.id}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-tertiary); flex-shrink: 0;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-family: var(--font-display); font-size: var(--text-sm); font-weight: var(--font-weight-medium);">${p.name}</div>
                                    <div style="font-size: var(--text-xs); color: var(--color-text-tertiary);">${p.subtitle}</div>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-tertiary); flex-shrink: 0;"><path d="m9 18 6-6-6-6"/></svg>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `,
              )
              .join("");
          } else {
            propsListHtml = `<div style="font-size: var(--text-sm); color: var(--color-text-tertiary); padding: var(--space-3);">No properties yet.</div>`;
          }

          return `
                    <div class="energy-evidence-card" style="border-left: 3px solid ${zone.strokeColor};">
                        <div class="panel-bento-label" style="color: ${zone.strokeColor};">${zone.role}</div>
                        <div style="font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">${zone.name}</div>
                        <div style="display: flex; flex-direction: column; gap: 0;">
                            ${propsListHtml}
                        </div>
                    </div>
                `;
        })
        .join("");

      detailsHtml = `
                <div style="margin-top: var(--space-6);">
                    <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">Zone details</div>
                    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                        ${cardsHtml}
                    </div>
                </div>
            `;
    }

    return `
            ${panelHeader("Investment properties", "Zone overview", "Five properties across three investment zones in the semiconductor corridor. Toggle a zone to explore its properties.")}
            <div style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);">
                ${rowsHtml}
            </div>
            ${detailsHtml}
        `;
  },

  /**
   * Build the HTML for the power sources panel.
   * @param {string[]} activeTypes - currently toggled-on types
   * @returns {string} HTML string
   */
  _buildPowerSourcesContent(activeTypes) {
    const types = [
      {
        key: "solar",
        label: "Solar power",
        color: "#ff9500",
        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
      },
      {
        key: "wind",
        label: "Wind energy",
        color: "#5ac8fa",
        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
      },
      {
        key: "nuclear",
        label: "Nuclear baseload",
        color: "#ff3b30",
        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2a7 7 0 0 0-5.4 11.5"/><path d="M12 2a7 7 0 0 1 5.4 11.5"/><path d="M7 20.7a7 7 0 0 0 10 0"/></svg>',
      },
    ];

    const evidence = AppData.kyushuEnergy?.evidence || {};

    const rowsHtml = types
      .map((t) => {
        const isActive = activeTypes.includes(t.key);
        return toggleRow({
          id: t.key,
          label: t.label,
          color: t.color,
          icon: t.icon,
          active: isActive,
          onclick: `App.toggleEnergyType('${t.key}')`,
        });
      })
      .join("");

    // Build evidence cards for active types
    let evidenceHtml = "";
    if (activeTypes.length > 0) {
      const cardsHtml = activeTypes
        .map((key) => {
          const ev = evidence[key];
          if (!ev) return "";
          const t = types.find((t) => t.key === key);

          const imageHtml = ev.image
            ? `
                    <div style="margin-top: var(--space-4); border-radius: var(--radius-medium); overflow: hidden; cursor: pointer;" onclick="UI.showEvidenceLightbox('${ev.image}', '${ev.title.replace(/'/g, "\\'")}')">
                        <img src="${ev.image}" alt="${ev.title}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                    </div>
                `
            : "";

          return evidenceCard({
            color: t.color,
            subtitle: ev.subtitle,
            title: ev.title,
            description: ev.description,
            stats: ev.stats,
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

    return `
            ${panelHeader("Sustainable energy", "Power resources", "Kyushu's diverse energy mix powers the semiconductor corridor with solar, wind, and nuclear baseload - ensuring the stable 24/7 supply fabs require.")}
            <div style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);">
                ${rowsHtml}
            </div>
            ${evidenceHtml}
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
    const content = this._buildGovernmentPanelContent(activeLevels || []);
    this.showPanel(content);
  },

  /**
   * Re-render the government panel to reflect current toggle state.
   * Direct innerHTML update (no history push) to avoid stacking.
   * @param {string[]} activeLevels - currently toggled-on levels
   */
  updateGovernmentPanel(activeLevels) {
    const content = this._buildGovernmentPanelContent(activeLevels);
    this.elements.panelContent.innerHTML = content;
  },

  /**
   * Build the HTML for the government support panel.
   * @param {string[]} activeLevels - currently toggled-on level IDs
   * @returns {string} HTML string
   */
  _buildGovernmentPanelContent(activeLevels) {
    const tiers = AppData.governmentTiers || [];

    const svgIcons = {
      central:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/></svg>',
      prefectural:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>',
      local:
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    };

    // Toggle rows (same pattern as energy types)
    const rowsHtml = tiers
      .map((tier) => {
        const isActive = activeLevels.includes(tier.id);
        return toggleRow({
          id: tier.id,
          label: tier.tier,
          color: tier.color,
          icon: svgIcons[tier.id] || "",
          active: isActive,
          onclick: `App.toggleGovernmentLevel('${tier.id}')`,
        });
      })
      .join("");

    // Build tier detail cards for active levels
    let detailHtml = "";
    if (activeLevels.length > 0) {
      const cardsHtml = activeLevels
        .map((levelId) => {
          const tier = tiers.find((t) => t.id === levelId);
          if (!tier) return "";

          // Sub-items for local tier
          let subItemsHtml = "";
          if (tier.subItems && tier.subItems.length > 0) {
            subItemsHtml = `
                        <div style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
                            ${tier.subItems
                              .map(
                                (sub) => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--color-bg-secondary); border-radius: var(--radius-small);">
                                    <div>
                                        <div style="font-family: var(--font-display); font-size: var(--text-sm); font-weight: var(--font-weight-medium);">${sub.name}</div>
                                        <div style="font-size: var(--text-xs); color: var(--color-text-tertiary);">${sub.subtitle}</div>
                                    </div>
                                    <div style="font-family: var(--font-display); font-size: var(--text-sm); font-weight: var(--font-weight-semibold); color: ${tier.color};">${sub.commitment}</div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    `;
          }

          return evidenceCard({
            color: tier.color,
            subtitle: tier.tierLabel,
            title: tier.name,
            description: tier.description,
            stats: tier.stats,
            extra: subItemsHtml,
          });
        })
        .join("");

      // Combined totals
      const totalCommitment = activeLevels.reduce((sum, id) => {
        const t = tiers.find((t) => t.id === id);
        if (!t) return sum;
        const val = t.commitment || t.stats?.[0]?.value || "";
        const num = parseFloat(val.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(num) ? 0 : num);
      }, 0);

      const summaryHtml =
        activeLevels.length > 1
          ? `
                <div style="margin-top: var(--space-4); padding: var(--space-3) var(--space-4); background: var(--color-bg-tertiary); border-radius: var(--radius-medium); display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: var(--text-sm); color: var(--color-text-secondary);">${activeLevels.length} levels active</span>
                    <span style="font-family: var(--font-display); font-size: var(--text-lg); font-weight: var(--font-weight-bold);">~¥${Math.round(totalCommitment)}B combined</span>
                </div>
            `
          : "";

      // Section heading: use tier label for single-select, generic for multi
      const sectionHeading =
        activeLevels.length === 1
          ? tiers.find((t) => t.id === activeLevels[0])?.tierLabel ||
            "Commitment details"
          : "Active commitments";

      detailHtml = `
                <div style="margin-top: var(--space-6);">
                    <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">${sectionHeading}</div>
                    ${summaryHtml}
                    <div style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-4);">
                        ${cardsHtml}
                    </div>
                </div>
            `;
    }

    return `
            ${panelHeader("Tri-level alignment", "Government support", "Japan's semiconductor strategy is backed by coordinated investment across central, prefectural, and local government - a rare tri-level alignment that de-risks the corridor.")}
            <div style="margin-top: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2);">
                ${rowsHtml}
            </div>
            ${detailHtml}
        `;
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

    // Headline metric
    const headlineHtml = isSuspended
      ? `
                <div class="stat-grid" style="grid-template-columns: 1fr;">
                    <div class="stat-item" style="text-align: center;">
                        <div class="stat-label" style="color: var(--color-text-tertiary); margin-bottom: var(--space-1);">Service suspended</div>
                        <div class="stat-value" style="font-size: var(--text-2xl); color: var(--color-text-tertiary);">${destination.flightTime}</div>
                        <div class="stat-label">Flight time when active</div>
                    </div>
                </div>
            `
      : `
                <div class="stat-grid" style="grid-template-columns: 1fr;">
                    <div class="stat-item" style="text-align: center;">
                        <div class="stat-value" style="font-size: var(--text-4xl); color: var(--color-info);">${destination.flightTime}</div>
                        <div class="stat-label">Direct flight time</div>
                    </div>
                </div>
            `;

    // Compact stats: region + airlines only
    const statsHtml = `
            <div class="stat-item">
                <div class="stat-value">${destination.airlines.join(", ")}</div>
                <div class="stat-label">Airlines</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${destination.region}</div>
                <div class="stat-label">Region</div>
            </div>
        `;

    // Semiconductor connection badge
    const semiBadge = destination.semiconductorLink
      ? `<div class="semiconductor-badge" style="
                display: inline-flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-1) var(--space-3);
                background: ${destination.semiconductorLink.color}15;
                border: 1px solid ${destination.semiconductorLink.color}40;
                border-radius: var(--radius-small);
                font-family: var(--font-display);
                font-size: var(--text-sm);
                font-weight: var(--font-weight-semibold);
                color: ${destination.semiconductorLink.color};
                margin-bottom: var(--space-4);
            ">${destination.semiconductorLink.company} - ${destination.semiconductorLink.role}</div>`
      : "";

    const content = `
            ${panelHeader("International route", `${destination.name} (${destination.code})`)}
            ${semiBadge}

            ${headlineHtml}

            <div class="stat-grid">
                ${statsHtml}
            </div>

            <p>${destination.description}</p>

            <button class="panel-btn secondary" onclick="UI.showAllAirlineRoutes()">
                View all routes
            </button>
        `;

    this.showPanel(content);
  },

  /**
   * Show all airline routes summary panel.
   * Clean table layout: destination name aligned left, flight time aligned right.
   */
  showAllAirlineRoutes() {
    const routes = AppData.airlineRoutes.destinations;
    const activeRoutes = routes.filter((r) => r.status === "active");

    const renderRouteRow = (r) => `
            <div class="disclosure-item route-list-item" onclick="UI.showAirlineRoutePanel(AppData.airlineRoutes.destinations.find(d => d.id === '${r.id}'))" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-3) var(--space-4);
                cursor: pointer;
                transition: background var(--duration-fast) var(--easing-standard);
            ">
                <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                    <span style="font-weight: var(--font-weight-medium); white-space: nowrap;">${r.name}</span>
                    <span style="font-size: var(--text-sm); color: var(--color-text-tertiary);">${r.airlines.join(", ")}</span>
                </div>
                <span style="font-family: var(--font-display); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); white-space: nowrap; margin-left: var(--space-4);">${r.flightTime}</span>
            </div>
        `;

    // Initialize disclosure state
    this.disclosureState["active-routes"] = true;

    const content = `
            ${panelHeader("Aso Kumamoto Airport", "International routes")}
            <p style="margin-bottom: var(--space-4);">Direct connections to ${activeRoutes.length} destinations across Korea, Taiwan, and greater Asia.</p>

            <div class="disclosure-group expanded" data-group-id="active-routes">
                <button class="disclosure-header" aria-expanded="true" onclick="UI.toggleDisclosureGroup('active-routes')">
                    <span class="disclosure-triangle" aria-hidden="true">
                        <svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l6 4-6 4V4z"/></svg>
                        <svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 6 4-6H4z"/></svg>
                    </span>
                    <span class="disclosure-icon" style="color: var(--color-success);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1l5.2 3L6 14.3 3.7 14c-.4 0-.7.2-.9.5l-.1.3c-.1.3 0 .7.3.9l2.4 1.4 1.4 2.4c.2.3.6.4.9.3l.3-.1c.3-.2.5-.5.5-.9L8.3 16l3 2.9c.5.4 1 .5 1.4.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>
                    </span>
                    <span class="disclosure-title">Active routes</span>
                    <span class="disclosure-badge">${activeRoutes.length}</span>
                </button>
                <div class="disclosure-content">
                    ${activeRoutes.map((r) => renderRouteRow(r)).join("")}
                </div>
            </div>
        `;

    this.showPanel(content);
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
    document.getElementById("map-container").classList.add("immersive-active");
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
    const overlay = document.getElementById("transition-overlay");
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
  showZonePropertiesPanel(label, properties) {
    const rows = properties
      .map((p) => {
        const typeLabel = p.type || p.subtitle || "";
        return `
        <div class="zone-property-row" data-property-id="${p.id}"
             style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-medium); cursor: pointer; transition: background-color var(--duration-fast) var(--easing-standard);"
             onmouseenter="this.style.backgroundColor='var(--color-bg-secondary)'"
             onmouseleave="this.style.backgroundColor='transparent'">
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${MAP_COLORS.property}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--font-weight-medium); color: var(--color-text-primary);">${p.name}</div>
            <div style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: 2px;">${typeLabel}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>`;
      })
      .join("");

    const content = `
      ${panelHeader("Properties", label)}
      <p style="color: var(--color-text-secondary); margin-top: var(--space-3);">${properties.length} ${properties.length === 1 ? "property" : "properties"} in this zone</p>
      <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-6);">
        ${rows}
      </div>`;

    this.showPanel(content);
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

    let connectionsHtml = "";

    // JASM
    connectionsHtml += connectionItem(
      connectionIcons.jasm,
      "JASM (TSMC)",
      `${conn.jasm.distance} - ${conn.jasm.time} drive`,
    );

    // Station
    connectionsHtml += connectionItem(
      connectionIcons.station,
      conn.station.name,
      `${conn.station.distance} - ${conn.station.time}`,
    );

    // Airport
    connectionsHtml += connectionItem(
      connectionIcons.airport,
      "Kumamoto Airport",
      `${conn.airport.distance} - ${conn.airport.time} drive`,
    );

    // Road
    connectionsHtml += connectionItem(
      connectionIcons.road,
      conn.road.name,
      "Planned infrastructure extension",
    );

    const html = `
      <div class="inspector-resize-handle"></div>
      <div class="inspector-title-bar">
        <div class="inspector-subtitle">Infrastructure access</div>
        <h2 class="inspector-title">${property.name}</h2>
      </div>
      <div class="inspector-body">
        <div class="context-connections-list">
          ${connectionsHtml}
        </div>
        <div class="context-prompt">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 4 4 4-4"/></svg>
          <span>Click the property marker to explore details</span>
        </div>
      </div>`;

    this.showPanel(html, { clearHistory: true });
    this.currentProperty = property;

    setTimeout(() => {
      this.initPanelResize();
    }, 0);
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
      jasm: "JASM (TSMC)",
      station: target.name || "Station",
      airport: "Kumamoto Airport",
      road: target.name || "Road",
    };
    const subtitles = {
      jasm: "Semiconductor factory",
      station: "Rail connection",
      airport: "Air access",
      road: "Road infrastructure",
    };

    const color = colors[type] || "#6e7073";
    const name = names[type];
    const subtitle = subtitles[type];

    let statsHtml = "";
    if (target.distance) {
      statsHtml += `
        <div class="panel-bento-stat">
          <div class="panel-bento-stat-value">${target.distance}</div>
          <div class="panel-bento-stat-label">Distance</div>
        </div>`;
    }
    if (target.time) {
      statsHtml += `
        <div class="panel-bento-stat">
          <div class="panel-bento-stat-value">${target.time}</div>
          <div class="panel-bento-stat-label">Drive time</div>
        </div>`;
    }

    const html = `
      <div class="inspector-resize-handle"></div>
      <div class="inspector-title-bar">
        <div class="inspector-subtitle" style="color: ${color};">${subtitle}</div>
        <h2 class="inspector-title">${name}</h2>
      </div>
      <div class="inspector-body">
        <p style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-3);">
          Connection from ${property.name}
        </p>
        ${statsHtml ? `<div class="panel-bento-stats" style="margin-top: var(--space-4);">${statsHtml}</div>` : ""}
      </div>`;

    this.showPanel(html);
    setTimeout(() => {
      this.initPanelResize();
    }, 0);
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
                <div class="portfolio-summary-label">Combined 5-year potential</div>
                <div class="portfolio-summary-value">${formatYen(totalNetProfit)}</div>
                <div class="portfolio-summary-detail">Projected return across ${properties.length} properties</div>
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
    if (!gktk) return "<p>Fund data unavailable.</p>";
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
                <div class="portfolio-summary-label">Combined 5-year potential</div>
                <div class="portfolio-summary-value">${formatYen(totalNetProfit)}</div>
                <div class="portfolio-summary-detail">Projected return across ${properties.length} properties</div>
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

    const content = `
            ${panelHeader("Financial projection", "Performance calculator")}

            <!-- HEADLINE STAT - Von Restorff Effect -->
            <div class="headline-stat">
                <div class="headline-stat-label">Projected 5-year return</div>
                <div class="headline-stat-value">${formatYenCompact(data.netProfit)}</div>
                <div class="headline-stat-sublabel">${scenario.charAt(0).toUpperCase() + scenario.slice(1)} case scenario</div>
            </div>

            <!-- SCENARIO SELECTOR -->
            <div class="calculator-section">
                <h4>Scenario comparison</h4>
                <div class="chart-container" style="height: 120px; margin-bottom: 16px;">
                    <canvas id="scenario-chart" role="img" aria-label="Bar chart comparing investment scenarios"></canvas>
                </div>
                <div id="scenario-chart-table"></div>

                <div class="scenario-toggle">
                    <button class="scenario-btn ${scenario === "bear" ? "active" : ""}" onclick="UI.showPerformanceCalculatorEnhanced(UI.currentProperty, 'bear')">
                        <span class="scenario-icon" aria-hidden="true">▼</span> Bear
                    </button>
                    <button class="scenario-btn ${scenario === "average" ? "active" : ""}" onclick="UI.showPerformanceCalculatorEnhanced(UI.currentProperty, 'average')">
                        <span class="scenario-icon" aria-hidden="true">—</span> Average
                    </button>
                    <button class="scenario-btn ${scenario === "bull" ? "active" : ""}" onclick="UI.showPerformanceCalculatorEnhanced(UI.currentProperty, 'bull')">
                        <span class="scenario-icon" aria-hidden="true">▲</span> Bull
                    </button>
                </div>
            </div>

            <!-- PROGRESSIVE DISCLOSURE - Detailed Breakdown -->
            <div class="financials-disclosure" id="financials-disclosure">
                <button class="financials-disclosure-header" onclick="UI.toggleFinancialsDisclosure()" aria-expanded="false" aria-controls="financials-details">
                    <span class="financials-disclosure-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        View detailed breakdown
                    </span>
                    <span class="financials-disclosure-chevron">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </button>
                <div class="financials-disclosure-content" id="financials-details">
                    <div class="calc-row">
                        <span class="calc-label">Appreciation rate</span>
                        <span class="calc-value">${formatPercent(data.appreciation)}/yr</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Est. selling price (5yr)</span>
                        <div class="calc-value-with-confidence">
                            <span class="calc-value">${sellingPriceInfo.display}</span>
                            <span class="confidence-range" title="${confidence.level} confidence">
                                Range: ${sellingPriceInfo.range}
                                <span class="confidence-badge confidence-${confidence.level.toLowerCase()}">${confidence.level}</span>
                            </span>
                        </div>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Rental yield</span>
                        <span class="calc-value">${formatPercent(data.noiTicRatio || data.irr || 0)}</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Annual rental income</span>
                        <span class="calc-value">${formatYen(data.annualRent)}</span>
                    </div>
                    <div class="calc-row">
                        <span class="calc-label">Applicable taxes</span>
                        <span class="calc-value negative">${formatYen(data.taxes)}</span>
                    </div>
                </div>
            </div>

            ${dataAttribution("Price data from Kumamoto Land Registry (Jan 2026)")}

            <button class="panel-btn" onclick="UI.showEvidence('${property.id}', 'rental')">
                View rental report
            </button>
            <button class="panel-btn" onclick="UI.showAreaStats()">
                Area statistics
            </button>
        `;

    this.showPanel(content);

    // Render chart after DOM update
    setTimeout(() => this.renderScenarioChart(property), 50);
  },

  /**
   * Toggle financials disclosure expanded state
   */
  toggleFinancialsDisclosure() {
    const disclosure = document.getElementById("financials-disclosure");
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
