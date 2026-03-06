import { AppData } from "../data/index.js";
import { TIMING } from "../app.js";
import { panelHeader, statGrid, dataAttribution } from "../shared/templates.js";

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
                <summary>View data as table</summary>
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
    const canvas = document.getElementById("scenario-chart");
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
    const chartLabel = isBTR ? "Annual rent" : "Net Profit (5yr)";
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
        labels: ["Bear", "Average", "Bull"],
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
    const tableContainer = document.getElementById("scenario-chart-table");
    if (tableContainer) {
      const formatYen = (num) => "¥" + (num || 0).toLocaleString();
      tableContainer.innerHTML = this.generateDataTable(
        ["Scenario", chartLabel],
        [
          ["Bear", formatYen(fin.scenarios.bear[metric])],
          ["Average", formatYen(fin.scenarios.average[metric])],
          ["Bull", formatYen(fin.scenarios.bull[metric])],
        ],
        `Scenario comparison showing projected ${chartLabel.toLowerCase()} for bear, average, and bull market conditions`,
      );
    }
  },

  /**
   * Render historical appreciation trend line chart
   */
  renderTrendChart() {
    const canvas = document.getElementById("trend-chart");
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
            label: "Annual appreciation",
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
              label: (ctx) => ctx.raw + "% appreciation",
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
    const tableContainer = document.getElementById("trend-chart-table");
    if (tableContainer) {
      tableContainer.innerHTML = this.generateDataTable(
        ["Year", "Appreciation"],
        stats.trackRecord.map((r) => [r.year, r.appreciation]),
        "Historical property appreciation rates in the Kumamoto semiconductor corridor",
      );
    }
  },

  /**
   * Render company investment comparison horizontal bar chart
   */
  renderInvestmentChart() {
    const canvas = document.getElementById("investment-chart");
    if (!canvas) return;

    this.destroyChart("investment");
    const ctx = canvas.getContext("2d");

    // Sort companies by investment amount (descending)
    const companies = [...AppData.companies].sort((a, b) => {
      const getAmount = (stats) => {
        const inv = stats.find(
          (s) =>
            s.label.includes("investment") || s.label.includes("Investment"),
        );
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
      const inv = c.stats.find(
        (s) => s.label.includes("investment") || s.label.includes("Investment"),
      );
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
            label: "Investment (¥B)",
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
    const tableContainer = document.getElementById("investment-chart-table");
    if (tableContainer) {
      const formatInvestment = (val) =>
        val >= 1000 ? "¥" + (val / 1000).toFixed(1) + "T" : "¥" + val + "B";
      tableContainer.innerHTML = this.generateDataTable(
        ["Company", "Investment"],
        labels.map((label, i) => [label, formatInvestment(investments[i])]),
        "Corporate investment comparison in the Kumamoto semiconductor corridor",
      );
    }
  },

  /**
   * Show investment overview with company comparison chart
   */
  showTruthEngine() {
    const property = this.currentProperty;
    if (!property) return;

    const driversHtml = property.truthEngine
      .map(
        (driver) => `
            <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                <h4 style="font-size: 16px; margin-bottom: 8px;">${driver.title}</h4>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${driver.description}</p>
                <div style="font-size: 14px; font-weight: 600; color: #22c55e;">${driver.impact}</div>
            </div>
        `,
      )
      .join("");

    const content = `
            ${panelHeader("Growth drivers", "Truth engine", "Key factors driving future value appreciation for this property:")}
            ${driversHtml}
            <button class="panel-btn primary" onclick="UI.showPerformanceCalculator()">
                Performance calculator
            </button>
        `;

    this.showPanel(content);
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

    const content = `
            ${panelHeader("Financial projection", "Performance calculator")}

            <div class="calculator-section">
                <h4>Scenario comparison</h4>
                <div class="chart-container" style="height: 120px; margin-bottom: 16px;">
                    <canvas id="scenario-chart" role="img" aria-label="Bar chart comparing investment scenarios: Bear case ${formatYen(fin.scenarios.bear.netProfit)}, Average case ${formatYen(fin.scenarios.average.netProfit)}, Bull case ${formatYen(fin.scenarios.bull.netProfit)}"></canvas>
                </div>
                <div id="scenario-chart-table"></div>

                <h4>Details: <span class="scenario-label">${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Case</span></h4>
                <div class="scenario-toggle">
                    <button class="scenario-btn ${scenario === "bear" ? "active" : ""}" onclick="UI.updateCalculator(UI.currentProperty, 'bear')">
                        <span class="scenario-icon" aria-hidden="true">▼</span> Bear
                    </button>
                    <button class="scenario-btn ${scenario === "average" ? "active" : ""}" onclick="UI.updateCalculator(UI.currentProperty, 'average')">
                        <span class="scenario-icon" aria-hidden="true">—</span> Average
                    </button>
                    <button class="scenario-btn ${scenario === "bull" ? "active" : ""}" onclick="UI.updateCalculator(UI.currentProperty, 'bull')">
                        <span class="scenario-icon" aria-hidden="true">▲</span> Bull
                    </button>
                </div>

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
                <div class="calc-row total">
                    <span class="calc-label">Net profit (5yr)</span>
                    <div class="calc-value-with-confidence">
                        <span class="calc-value positive">${formatYenSigned(data.netProfit)}</span>
                        <span class="confidence-range" title="${confidence.level} confidence">
                            Range: ${netProfitInfo.range}
                            <span class="confidence-badge confidence-${confidence.level.toLowerCase()}">${confidence.level}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div class="data-attribution">
                <p class="data-timestamp">Sample data &middot; Q1 2026</p>
                <p>Price data from Kumamoto Land Registry (Jan 2026)</p>
                <p>Rental estimates based on local property managers</p>
            </div>

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
   * Show area statistics (step 11 conclusion)
   */
  showAreaStats() {
    const stats = AppData.areaStats;

    const content = `
            ${panelHeader("Market overview", "Area statistics")}

            ${statGrid([
              {
                value: stats.avgAppreciation,
                label: "Avg. annual appreciation",
              },
              { value: stats.avgRentalYield, label: "Avg. rental yield" },
              { value: stats.occupancyRate, label: "Occupancy rate" },
            ])}

            <div class="calculator-section">
                <h4>Appreciation trend</h4>
                <div class="chart-container" style="height: 160px; margin: 16px 0;">
                    <canvas id="trend-chart" role="img" aria-label="Line chart showing appreciation trend: 2022 at 6.2%, 2023 at 9.1%, 2024 at 11.3% - showing accelerating growth"></canvas>
                </div>
                <div id="trend-chart-table"></div>
                <p class="chart-caption">Year-over-year property appreciation in the Kumamoto semiconductor corridor.</p>
            </div>

            ${dataAttribution("Data from Kumamoto Prefecture Real Estate Association")}
        `;

    this.showPanel(content);

    // Render chart after DOM update
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
