# Plan: roll out playground "Compact tabs" to all remaining step-entry dashboards

Goal: every step-entry dashboard in production matches the playground's Variant A "Compact tabs" design. Steps 4, 5, 6, 10 are references and already done. This plan covers the remaining steps.

## Scope (confirmed)

In scope:
- Step-entry dashboards only.
- Sub-items become tabs (1 step = 1 panel = N tabs in the panel-a-tabs strip).

Out of scope (do not touch in this rollout):
- Marker-click panels.
- Chatbox buttons themselves.
- Map state, camera, markers, animations.
- Data files in `js/data/`.
- AI chat panel (which is what Step 11 Q&A mode uses).

## Definition of "correct" (the playground Variant A spec)

Every step-entry panel must:
1. Use `buildCompactTabsHtml` chrome.
2. Breadcrumb: `Step N · Title` (middle dot separator, user-facing step number).
3. `panel-title` is the step's title (exactly as listed below).
4. `panel-a-tabs` strip: 2-4 tabs. Single-select. Click swaps panel-a-body + panel-a-footer + tab aria-selected. Chrome never flickers.
5. `panel-a-body` built ONLY from playground primitives: `proseBlock`, `statSection`, `listSection`, `evidenceBlockHtml`, `imageBlock`, `imageGalleryBlock`.
6. `panel-a-footer`: shows "View evidence" button (`<button class="cta secondary" style="width: 100%;">`) ONLY when active tab contains an `evidence-block`. Same onclick as the block.
7. NO Chart.js, NO `toggleRow`, NO inline-styled cards, NO `panelHeader()`, NO `evidenceCard()`, NO icard markup in step-entry panels.
8. Fixed 540px panel width, single close button. (Already enforced globally.)

## Full enumeration of all 11 user-facing steps

| # | Breadcrumb · Title | Data id | Source file | Status |
|---|---|---|---|---|
| 1 | Step 1 · Water resources | resources (water sub-item) | cards.js | TODO |
| 2 | Step 2 · Power resources | resources (power sub-item) | cards.js | TODO |
| 3 | Step 3 · Strategic location | strategic-location | cards.js | TODO |
| 4 | Step 4 · Government support | government-support | cards.js | DONE |
| 5 | Step 5 · Corporate investment | corporate-investment | cards.js | DONE |
| 6 | Step 6 · Science park and grand airport | transport-access | step-handlers.js | DONE |
| 7 | Step 7 · Education and talent pipeline | education-pipeline | cards.js | TODO |
| 8 | Step 8 · Future outlook | future-outlook | cards.js + step-handlers.js | TODO |
| 9 | Step 9 · Investment opportunity zones | investment-zones | app.js (inline) | TODO |
| 10 | Step 10 · Investment properties | properties | cards.js | DONE |
| 11 | Step 11 · Q&A mode | final | js/ui/ai-chat.js (`showQAChatbox` / `showQAMode`) | NO CHANGE — AI chat panel handles this; no right-side dashboard |

6 TODO steps: 1, 2, 3, 7, 8, 9.

## Confirmed tab structures per TODO step

All TODO steps use the same "Step N · Title" breadcrumb format and the playground primitives only. Map state per tab is preserved using existing single-select helpers (selectEnergyType, etc.).

### Step 1 — Water resources
Tabs: `Overview` / `Companies`. Footer "View evidence" on tabs that contain an evidence block.

- **Overview** — `proseBlock(resources.water.description)` + `statSection({ label: "Aso Groundwater Basin", items: [hero "¥0 / Water acquisition cost", "1.8B / Cubic meters annual capacity", "99.99% / Natural purity level", "60% / Lower than Tokyo rates"] })` + `evidenceBlockHtml({ title: "TSMC ESG evidence", description: "Official government report on groundwater sustainability and industrial allocation", onclick: showEvidenceLightbox })`. Footer mirrors the evidence block.
- **Companies** — `proseBlock("Major brands rely on Kumamoto groundwater for premium production.")` + `listSection({ label: "Brands", items: resources.water.evidenceMarkers.map(...) })` (Coca-Cola, Suntory). No evidence block, no footer.

### Step 2 — Power resources
Tabs: `Overview` / `Companies`. Footer "View evidence" on tabs that contain an evidence block.

- **Overview** — `proseBlock(resources.power.description)` + `statSection({ label: "Kyushu Power Grid", items: [hero "2.4GW / Available industrial capacity", "99.999% / Grid reliability", "¥12/kWh / Industrial rate", "15% / Renewable mix"] })` + `evidenceBlockHtml({ title: "Kyushu Electric infrastructure plan", description: "Investment roadmap for semiconductor corridor power infrastructure", onclick: openEvidence })`. Footer mirrors.
- **Companies** — `proseBlock(resources.power.energyMix.description)` + `listSection({ label: "Energy stations", items: kyushuEnergy.solar + wind + nuclear flattened, each: { icon: sun/wind/atom svg, title: station.name, sub: station.prefecture, value: station.capacity } })`. No evidence block.

### Step 3 — Strategic location
Tabs: `Routes` / `Hub`. Footer "View evidence" on the tab that contains an evidence block.

- **Routes** — `proseBlock("Direct connections from Aso Kumamoto Airport to N destinations across Korea, Taiwan, and greater Asia.")` + `listSection({ label: "Active routes", items: airlineRoutes.destinations.filter(active).map(r => ({ icon: planeIcon, title: r.name, sub: r.airlines.join(", "), value: r.flightTime })) })`.
- **Hub** — `proseBlock("The airport's role as the corridor's gateway to Asia and the semiconductor supply chain.")` + `statSection({ label: "Hub overview", items: [hero "{N} / Direct destinations", "Korea + Taiwan / Primary regions", "{N} / Active airlines", "Sep 2026 / Service refresh"] })` + optional `evidenceBlockHtml` linking to an airport overview doc if one exists. Footer mirrors if evidence is present.

### Step 7 — Education and talent pipeline
Tabs: `Universities` / `Employment`. No nested sub-tabs. Footer "View evidence" on tabs that contain an evidence block.

- **Universities** — `proseBlock(talentPipeline.description)` + `listSection({ label: "Institutions", items: talentPipeline.institutions.map(i => ({ icon: <img src={i.logo}>, title: i.fullName, sub: i.role, value: i.city })) })`. No evidence block (institutions don't have one in data).
- **Employment** — `proseBlock(employmentData.summary)` + `statSection({ label: "Salary comparison", items: [hero "¥280K / JASM university graduate", "¥320K / Master's", "¥360K / Doctorate", "¥201K / Kumamoto average"] })` + `listSection({ label: "Major employers", items: employmentData.companies.map(c => ({ icon: <img src={c.id==='jasm'?Jasm-logo:Tokyo-electron-logo}>, title: c.name, sub: c.headlineLabel, value: c.headline })) })` + `evidenceBlockHtml({ title: "METI semiconductor workforce report", description: "Workforce growth and salary data", onclick: open METI PDF })`. Footer mirrors.

### Step 8 — Future outlook
Tabs: `Plans` / `Timeline`. All 5 future overlay layers auto-shown on step entry (per user). No toggling in panel.

- **Plans** — `proseBlock("Composite 2030+ vision: science park expansion, grand airport, government zones, road network, and traffic flow.")` + `listSection({ label: "Planned developments", items: [{ icon: flaskIcon, title: "Science park", sub: "560 ha + ¥2T public investment" }, { icon: planeIcon, title: "Grand airport access", sub: "6.8 km rail, 44 min station-to-airport" }, { icon: targetIcon, title: "Government zones", sub: "Kikuyo and Ozu long-term plans" }, { icon: routeIcon, title: "Road extensions", sub: "Naka-Kyushu Cross Road segments" }, { icon: clockIcon, title: "10-20 minute concept", sub: "Anywhere in corridor to airport" }] })`.
- **Timeline** — `proseBlock("Construction milestones and completion targets across the corridor.")` + `statSection({ label: "Vision horizon", items: [hero "2040 / Master plan target", "¥4.8T / Government investment", "50,000 / New jobs", "12 / Major facilities"] })`.

### Step 9 — Investment opportunity zones
Tabs: `Central city` / `Middle zone` / `JASM`. Default active tab: Central city. Each tab click flies camera to that zone's coords (existing logic in `_handleInvestmentZoneSubItem`).

- **Central city** — `proseBlock("Kyushu-level business support center, suitable for Japanese corporate senior executive families.")` + `statSection({ label: "Central city", items: [hero "Shinkansen 30-min / Connection to Hakata", "RC mansion condominiums and accommodation / Product type"] })`.
- **Middle zone** — `proseBlock("Lifestyle density between the city and the corridor; internationalized services still maturing.")` + `statSection({ label: "Middle zone", items: [hero "High-spec detached rentals / Product type", "Bilingual clinics, intl preschools / Maturing services"] })`.
- **JASM** — `proseBlock("Adjacent to TSMC's JASM fab. Strong demand from engineer secondees, growing through Fab 2 ramp.")` + `statSection({ label: "JASM zone", items: [hero "Corporate RC + 3-4LDK detached / Product type", "Single engineers, secondees / Target tenants", "Wave 1 now, Wave 2 ~2027 / Demand waves", "2028-2029 / Supply catches up"] })` + (existing) shows JASM logo marker on the map.

## Phasing

Each phase is one step. No commits between phases. `/feature finish` at the end triggers commit + push + merge + snapshot propagation.

| Phase | Step | Files touched |
|---|---|---|
| 1 | Step 1 (Water resources) | js/ui/cards.js — rewrite `showResourcePanel(water)` to Overview/Companies tabs + footer; add `switchWaterTab` + `_buildWaterTabBody` + `_buildWaterTabFooter` |
| 2 | Step 2 (Power resources) | js/ui/cards.js — rewrite `showPowerSourcesPanel` to Overview/Companies tabs + footer (replace existing Solar/Wind/Nuclear tabs); add `switchPowerTab` + `_buildPowerTabBody` + `_buildPowerTabFooter` |
| 3 | Step 3 (Strategic location) | js/ui/cards.js — rewrite `showAllAirlineRoutes` to Routes/Hub tabs; add `switchAirlineTab` + `_buildAirlineTabBody` + `_buildAirlineTabFooter` |
| 4 | Step 7 (Education) | js/ui/cards.js — replace `showUniversitiesPanel` and `showEmploymentPanel` with one `showEducationPanel` (Universities/Employment tabs); js/step-handlers.js — update `_handleEducationSubItem` to call `selectEducationTab` |
| 5 | Step 8 (Future outlook) | js/ui/cards.js — rewrite `showFutureOutlookPanel` to Plans/Timeline tabs; js/step-handlers.js — update `_renderFutureOutlookDashboard` to auto-show all 5 layers on entry (no toggle UI in panel) |
| 6 | Step 9 (Investment zones) | js/app.js — rewrite the inline `case "investment-zones"` to call a new `UI.showInvestmentZonesOverviewPanel()` (different name from Step 10's `showInvestmentZonesPanel`); js/ui/cards.js — add `showInvestmentZonesOverviewPanel` + `switchInvestmentZoneTab` + `_buildInvestmentZoneTabBody`; js/step-handlers.js — update `_handleInvestmentZoneSubItem` to call `selectInvestmentZoneTab` |
| 7 | Verify | Walk every step 1-10 in dev server. Confirm map state at each tab switch. Take screenshots at 540px panel width. |
| 8 | /feature finish | User invokes /feature finish. Commit, push, merge to master. Rebuild dist. Propagate snapshots to value-add-prototype. Acceptance test slides 6, 7, 11, 12 in airplane mode. |

## What this plan does NOT change

- Chatbox sub-item buttons stay where they are. Clicking a chatbox sub-item now switches the panel tab instead of opening a separate sub-panel.
- Marker-click panels (clicking a logo / marker on the map) stay as-is.
- Map state / layers / markers / cameras.
- The compact-tabs scaffold helpers in `js/ui/inspector-tabs.js`.
- Block primitive helpers in `js/shared/templates.js`.
- Any file in `js/data/`.
- Step 11 (Q&A mode) — AI chat panel handles it; no right-side dashboard added.

## Anti-goals (don't drift into these)

- Don't redesign the playground primitives.
- Don't optimize the build or refactor unrelated code.
- Don't touch CLAUDE.md guidelines until /feature finish.
- Don't propagate to value-add-prototype snapshots until /feature finish.
- Don't commit until /feature finish.
