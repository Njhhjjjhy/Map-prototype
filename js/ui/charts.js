import { AppData } from "../data/index.js";
import { TIMING } from "../app.js";
import {
  panelHeader,
  statGrid,
  dataAttribution,
  proseBlock,
  statSection,
  evidenceBlockHtml,
  sectionLabel,
} from "../shared/templates.js";
import { t } from "../i18n/index.js";
import { $id } from "../shared/dom-scope.js";
import { buildCompactTabsHtml } from "./inspector-tabs.js";

export const methods = {
  destroyChart(chartId) {
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
      delete this.charts[chartId];
    }
  },

  /**
   * Generate accessible data table HTML for chart data
   */
  generateDataTable(headers, rows, caption) {
    const headerHtml = headers.map((h) => `<th scope="col">${h}</th>`).join("");
    const rowsHtml = rows
      .map((row) => {
        const cells = row
          .map((cell, i) =>
            i === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`,
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `
            <details class="chart-data-table">
                <summary>${t("View data as table")}</summary>
                <table>
                    <caption class="sr-only">${caption}</caption>
                    <thead><tr>${headerHtml}</tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </details>
        `;
  },

  /**
   * Render scenario comparison bar chart
   */
  renderScenarioChart(property) {
    const canvas = $id("scenario-chart");
    if (!canvas) return;

    this.destroyChart("scenario");
    const ctx = canvas.getContext("2d");
    const fin = this._getFinancialData(property);

    if (
      !fin.scenarios ||
      !fin.scenarios.bear ||
      !fin.scenarios.average ||
      !fin.scenarios.bull
    )
      return;

    // Determine chart metric: netProfit for land dev, annualRent for BTR
    const isBTR = fin.scenarios.average.annualRent != null;
    const chartLabel = isBTR ? t("Annual rent") : t("Net Profit (5yr)");
    const metric = isBTR ? "annualRent" : "netProfit";

    // Colorblind-safe palette
    const colors = {
      bear: "#6b7280", // Gray
      average: "#2563eb", // Blue
      bull: "#0d9488", // Teal
    };

    this.charts["scenario"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [t("Bear"), t("Average"), t("Bull")],
        datasets: [
          {
            label: chartLabel,
            data: [
              fin.scenarios.bear[metric] || 0,
              fin.scenarios.average[metric] || 0,
              fin.scenarios.bull[metric] || 0,
            ],
            backgroundColor: [colors.bear, colors.average, colors.bull],
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => "¥" + (ctx.raw || 0).toLocaleString(),
            },
          },
        },
        scales: {
          x: {
            ticks: {
              callback: (val) => "¥" + (val / 1000000).toFixed(0) + "M",
            },
            grid: { display: false },
          },
          y: {
            grid: { display: false },
          },
        },
      },
    });

    // Add accessible data table
    const tableContainer = $id("scenario-chart-table");
    if (tableContainer) {
      const formatYen = (num) => "¥" + (num || 0).toLocaleString();
      tableContainer.innerHTML = this.generateDataTable(
        [t("Scenario"), chartLabel],
        [
          [t("Bear"), formatYen(fin.scenarios.bear[metric])],
          [t("Average"), formatYen(fin.scenarios.average[metric])],
          [t("Bull"), formatYen(fin.scenarios.bull[metric])],
        ],
        t("Scenario comparison showing projected returns for bear, average, and bull market conditions"),
      );
    }
  },

  /**
   * Render historical appreciation trend line chart
   */
  renderTrendChart() {
    const canvas = $id("trend-chart");
    if (!canvas) return;

    this.destroyChart("trend");
    const ctx = canvas.getContext("2d");
    const stats = AppData.areaStats;

    const years = stats.trackRecord.map((r) => r.year);
    const values = stats.trackRecord.map((r) =>
      parseFloat(r.appreciation.replace("+", "")),
    );

    this.charts["trend"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: t("Annual appreciation"),
            data: values,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            fill: true,
            tension: 0.3,
            pointRadius: 6,
            pointBackgroundColor: "#2563eb",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.raw + "% " + t("appreciation"),
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => val + "%",
            },
            grid: { color: "#f3f4f6" },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });

    // Add accessible data table
    const tableContainer = $id("trend-chart-table");
    if (tableContainer) {
      tableContainer.innerHTML = this.generateDataTable(
        [t("Year"), t("Appreciation")],
        stats.trackRecord.map((r) => [r.year, r.appreciation]),
        t("Historical property appreciation rates in the Kumamoto semiconductor corridor"),
      );
    }
  },

  /**
   * Render company investment comparison horizontal bar chart
   */
  renderInvestmentChart() {
    const canvas = $id("investment-chart");
    if (!canvas) return;

    this.destroyChart("investment");
    const ctx = canvas.getContext("2d");

    // Sort companies by investment amount (descending)
    const isInvestmentLabel = (label) =>
      label.includes("investment") ||
      label.includes("Investment") ||
      label.includes("投資");

    const companies = [...AppData.companies].sort((a, b) => {
      const getAmount = (stats) => {
        const inv = stats.find((s) => isInvestmentLabel(s.label));
        if (!inv) return 0;
        const val = inv.value
          .replace("¥", "")
          .replace("T", "000")
          .replace("B", "");
        return parseFloat(val);
      };
      return getAmount(b.stats) - getAmount(a.stats);
    });

    const labels = companies.map((c) => c.name.split(" ")[0]); // Short names
    const investments = companies.map((c) => {
      const inv = c.stats.find((s) => isInvestmentLabel(s.label));
      if (!inv) return 0;
      const val = inv.value.replace("¥", "");
      if (val.includes("T")) return parseFloat(val) * 1000;
      return parseFloat(val.replace("B", ""));
    });

    // Colorblind-safe palette (covers all 7 companies)
    const colors = [
      "#2563eb",
      "#ea580c",
      "#0d9488",
      "#7c3aed",
      "#d97706",
      "#059669",
      "#dc2626",
    ];

    this.charts["investment"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: t("Investment") + " (¥B)",
            data: investments,
            backgroundColor: colors,
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw;
                return val >= 1000
                  ? "¥" + (val / 1000).toFixed(1) + "T"
                  : "¥" + val + "B";
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              callback: (val) =>
                val >= 1000 ? "¥" + val / 1000 + "T" : "¥" + val + "B",
            },
            grid: { display: false },
          },
          y: {
            grid: { display: false },
          },
        },
      },
    });

    // Add accessible data table
    const tableContainer = $id("investment-chart-table");
    if (tableContainer) {
      const formatInvestment = (val) =>
        val >= 1000 ? "¥" + (val / 1000).toFixed(1) + "T" : "¥" + val + "B";
      tableContainer.innerHTML = this.generateDataTable(
        [t("Company"), t("Investment")],
        labels.map((label, i) => [label, formatInvestment(investments[i])]),
        t("Corporate investment comparison in the Kumamoto semiconductor corridor"),
      );
    }
  },

  /**
   * Show investment overview with company comparison chart
   */
  showTruthEngine() {
    const property = this.currentProperty;
    if (!property) return;

    const driversSections = property.truthEngine
      .map(
        (driver) => `
          ${sectionLabel(driver.impact)}
          <div class="step-section">
            <p class="step-list-title" style="margin: 0;">${driver.title}</p>
            ${proseBlock(driver.description)}
          </div>
        `,
      )
      .join("");

    const bodyHtml = `
      ${proseBlock(t("Key factors driving future value appreciation for this property:"))}
      ${driversSections}
      <div class="step-section">
        ${evidenceBlockHtml({
          title: t("Performance calculator"),
          description: t("Open the projected return calculator."),
          onclick: "UI.showPerformanceCalculator()",
        })}
      </div>
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Growth drivers"),
        title: t("Truth engine"),
        bodyHtml,
      }),
    );
  },

  /**
   * Show Performance Calculator (step 10 - financials)
   */
  showPerformanceCalculator() {
    const property = this.currentProperty;
    if (!property) return;

    this.updateCalculator(property);
  },

  /**
   * Get confidence level and range for estimated values
   */
  updateCalculator(property, scenario = "average") {
    this.currentScenario = scenario;
    const fin = this._getFinancialData(property);
    const data = (fin.scenarios || {})[scenario] || {};

    const formatYen = (num) => "¥" + num.toLocaleString();
    const formatYenSigned = (num) =>
      (num >= 0 ? "+" : "") + "¥" + num.toLocaleString();
    const formatPercent = (num) =>
      (num >= 0 ? "+" : "") + (num * 100).toFixed(1) + "%";

    // Get confidence info for estimated values
    const sellingPriceInfo = this.formatWithConfidence(
      data.sellingPrice,
      scenario,
    );
    const netProfitInfo = this.formatWithConfidence(data.netProfit, scenario);
    const confidence = this.getConfidenceInfo(scenario);

    const scenarioBtns = `
      <div class="step-section">
        ${sectionLabel(`${t("Details")} - ${t(scenario.charAt(0).toUpperCase() + scenario.slice(1))} ${t("Case")}`)}
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
                }; color: var(--color-text-primary); border-radius: calc(var(--radius-small) - 2px); cursor: pointer;" onclick="UI.updateCalculator(UI.currentProperty, '${sc}')">${t(sc.charAt(0).toUpperCase() + sc.slice(1))}</button>`,
            )
            .join("")}
        </div>
      </div>
    `;

    const breakdownItems = [
      { label: t("Appreciation rate"), value: `${formatPercent(data.appreciation)}/yr` },
      { label: t("Est. selling price (5yr)"), value: sellingPriceInfo.display },
      { label: t("Rental yield"), value: formatPercent(data.noiTicRatio || data.irr || 0) },
      { label: t("Annual rental income"), value: formatYen(data.annualRent) },
      { label: t("Applicable taxes"), value: formatYen(data.taxes) },
      { label: t("Net profit (5yr)"), value: formatYenSigned(data.netProfit), hero: true },
    ];

    const bodyHtml = `
      <div class="step-section">
        ${sectionLabel(t("Scenario comparison"))}
        <div style="height: 120px;">
          <canvas id="scenario-chart" role="img" aria-label="${t("Bar chart comparing investment scenarios")}"></canvas>
        </div>
        <div id="scenario-chart-table"></div>
      </div>
      ${scenarioBtns}
      ${statSection({ label: t("Breakdown"), items: breakdownItems })}
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

    setTimeout(() => this.renderScenarioChart(property), 50);
  },

  /**
   * Show area statistics (step 11 conclusion)
   */
  showAreaStats() {
    const stats = AppData.areaStats;

    const bodyHtml = `
      ${statSection({
        items: [
          { label: t("Avg. annual appreciation"), value: stats.avgAppreciation },
          { label: t("Avg. rental yield"), value: stats.avgRentalYield },
          { label: t("Occupancy rate"), value: stats.occupancyRate },
        ],
      })}
      <div class="step-section">
        ${sectionLabel(t("Appreciation trend"))}
        <div style="height: 160px;">
          <canvas id="trend-chart" role="img" aria-label="${t("Line chart showing appreciation trend")}"></canvas>
        </div>
        <div id="trend-chart-table"></div>
        ${proseBlock(t("Year-over-year property appreciation in the Kumamoto semiconductor corridor."))}
      </div>
    `;

    this.showPanel(
      buildCompactTabsHtml({
        breadcrumb: t("Market overview"),
        title: t("Area statistics"),
        bodyHtml,
      }),
    );

    setTimeout(() => this.renderTrendChart(), 50);
  },

  // ================================
  // GALLERY
  // ================================
  setScenario(scenario, propertyId) {
    this.currentScenario = scenario;
    if (propertyId) {
      const property = AppData.properties.find((p) => p.id === propertyId);
      if (property) this.currentProperty = property;
    }
    if (this.inspectorStage === 5) {
      this._refreshCalculator({ property: this.currentProperty });
    }
  },
};
