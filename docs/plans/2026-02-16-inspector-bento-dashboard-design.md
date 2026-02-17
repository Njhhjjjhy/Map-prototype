# Inspector-style bento dashboard redesign

**Date:** 2026-02-16
**Status:** All sections approved
**Replaces:** Current Finder sidebar dashboard (round 3 from QA doc `2026-02-16-dashboard-bento-redesign.md`)
**Inspiration:** Coinbase Design System layout patterns (not color/typography), macOS NSInspectorPanel, Keynote Format Inspector, Xcode Attributes Inspector

---

## Design philosophy

The right panel is not a generic dashboard. It is a contextual inspector for whatever the presenter has selected on the map. It reflects the current selection and journey stage, following the macOS inspector panel pattern.

---

## Section 1: Panel chrome (approved)

### Title bar

Thin bar at the top of the panel shows what is being inspected. Content changes based on the last map interaction, not the chatbox step. Examples: "JASM Fab 2", "Kikuyo Zone", "Property 3-12 Haramizu".

### Segmented control

Below the title bar. Switches between content tabs. Tabs are contextual per stage:

| Stage | Context | Tabs |
|-------|---------|------|
| 1-2 | Opening / why Kumamoto | No panel |
| 3 | Talent pipeline | Workforce / Universities / Sources |
| 4 | Infrastructure / science park | Plans / Timeline / Sources |
| 5 | Corporate investment | Investment / Timeline / Press |
| 6 | Silicon triangle zones | Profile / Metrics / Sources |
| 7 | Risks + infrastructure roads | Assessment / History / Mitigation |
| 8 | Real estate thesis | Demand / Yields / Properties |
| 9 | Property detail | Overview / Financials / Evidence |

Every step that shows a right panel has a defined tab set. No step with a visible panel is missing tabs.

### Resize

Single vertical drag handle on the left edge of the panel. Width-only resize. Panel anchored to the right viewport edge (macOS Mail.app split-view divider pattern). No top edge handle, no free resize.

- Min width: ~320px
- Max width: ~60vw

### Step-to-stage lookup

A flat, one-directional lookup table. Each fine-grained step ID maps to a stage number. The panel only asks "what stage am I in?" and gets back a stage number that determines the tab set and card manifest. It never needs to go the other direction.

Structure:
```javascript
const STAGE_MAP = {
    'A0': 1,
    'A1': 2,
    'A2': 2,
    // ... authored during implementation based on actual presentation flow
};
```

The exact groupings depend on what the A0-A8, B1-B7, C1-C11 sequences represent in the codebase. The mapping must be authored during implementation. But the structure is fixed: flat object, no logic, no conditionals.

**Stage 5 coupling note:** The stage 5 card manifest (corporate investment cards) is ordered to match the map pin-drop animation sequence. If the pin-drop order changes, the manifest order must update to match. Add a comment in the lookup table noting this dependency.

---

## Section 2: Bento card system (approved)

### Three card sizes

| Size | Width | Behavior |
|------|-------|----------|
| Hero | Full panel width | Primary content per tab. Only one visible at a time. |
| Standard | Half panel width when panel > ~500px; full width otherwise | Stacks 2-across when wide enough. Single CSS container query breakpoint. |
| Compact | Full panel width, minimal height | Supporting material: PDF links, thumbnails, references. |

The ~500px breakpoint is measured via CSS container query on the panel content area. At minimum width (~320px), standard cards always stack vertically. They go 2-across only when the user drags the panel wider. Exact breakpoint value to be determined during implementation.

### Card ordering

**Authored order per tab manifest.** Each tab in the step mapping defines its cards in a specific sequence, and they render in that sequence. The layout system does not enforce a type hierarchy (hero-then-standard-then-compact). A tab can define cards in any order.

**Single layout exception:** The decision badge card is always pinned to the top of the stage 9 overview tab, regardless of manifest order. No other card gets this treatment.

### Card anatomy (every card, no exceptions)

```
+------------------------------------------+
|                             source badge  |  <- top-right, muted provenance
|  Title line                               |  <- semibold, the claim or metric
|                                           |
|  Value area                               |  <- diverges by card type
|  (table / calculator / stats / timeline)  |
|                                           |
|  Action row                               |  <- open PDF, show on map, expand
+------------------------------------------+
```

- **Source badge:** Muted text, top-right. Provenance string: "Kumamoto Prefecture, 2025-03" or "METI official release". Maps to citation fidelity requirement.
- **Title line:** Display font, semibold. The claim or metric name.
- **Value area:** Where card types diverge.
- **Action row:** Bottom. Contextual actions. Each action typed as either `quicklook` or `external` (see section 4).

### Visual style

macOS NSBox: subtle rounded rect with system background material. Uses existing `--radius-medium` (8px), `--shadow-subtle` for resting state. No heavy borders. Cards separated by `--space-4` gap.

---

## Section 3: Card types (approved)

### Decision badge card

- **Size:** Compact, pinned to top of stage 9 overview tab (sole layout exception)
- **Content:** Pursue / hold / pass with color coding (green / amber / red). Three supporting metrics that triggered the recommendation.
- **Data status:** 40% exists. Properties exist but need recommendation field and decision metrics.

### Financial table card

- **Size:** Hero (stage 9 financials tab)
- **Content:** NSOutlineView pattern with disclosure triangles. Expandable subcategories: hard costs, acquisition fees, fit-out. Multiple scenario columns (28M / 30M / 32M) displayed horizontally. Notes column with inline sources. Collapsed state shows only total investment cost line.
- **Data status:** 70% exists. Scenario structure good. Cost breakdown subcategories and notes column need to be added.

### Performance calculator card

- **Size:** Hero (stage 9 overview tab)
- **Content:** Small property thumbnail in top-right corner of card (not a large embedded image -- full property images live in the evidence tab gallery variant). Segmented control toggles bear / avg / bull -- instant swap, no animation. Secondary toggle switches between fund manager view and broker view.
  - Fund manager: total cost, estimated selling price, tax, pre/after-tax income, profit
  - Broker: estimated rental high / avg / low, projected growth, area average
- **Data status:** 60% exists. Fund manager data derivable from scenarios. Broker-specific metrics need to be added.

### Yield summary card

- **Size:** Standard (stage 9 overview, stage 8 yields tab)
- **Content:** Three large numbers side by side: gross yield, net yield, cash-on-cash return. Each shows bear / avg / bull range as subtle inline span beneath primary value.
- **Data status:** 50% exists. Derivable from property scenario data.

### Evidence card (two variants)

- **Size:** Compact (sources/evidence tabs across multiple stages)
- **Document variant:** Thumbnail, title, source, date, viewed checkmark state. "Open" action triggers Quick Look for PDF.
- **Gallery variant:** Clickable image grid. Opens Quick Look with left/right navigation on click. Used for property images outside calculator context.
- **Data status:** 75% exists. Strong structure. Thumbnails, dates, and viewed state need to be added.

### Corporate investment card

- **Size:** Standard (stage 5 investment tab)
- **Content:** Company logo, investment amount, job creation number, timeline, facility type. Press release link at bottom with viewed state tracking.
- **Data status:** 85% exists. Logos and structured timeline fields need to be added.

### Infrastructure timeline card

- **Size:** Hero or standard depending on tab (stage 4)
- **Content:** Vertical timeline with completion dates and budgets. Current items solid, future items dashed. Clicking a timeline item opens supporting PDF via Quick Look.
- **Data status:** 90% exists. Infrastructure roads data is clean and ready.

### Commute card

- **Size:** Standard (stage 9 overview tab)
- **Content:** Distance and driving time to JASM. Shift-aware times (2am, 8am, midnight) as a small table, not a single generic number. Toggle for current vs. future routes showing infrastructure impact (25 min to 12 min, bypass completion 2027).
- **Data status:** 65% exists. Basic commute data good. Shift-aware breakdown needs to be added.

### Risk card

- **Size:** Standard (stage 7 assessment tab)
- **Content:** Severity rating with color indicator. Historical data summary. Mitigation notes.
- **Data status:** 80% exists. Risk data in data layers is solid.

### Zone profile card

- **Size:** Hero (stage 6 profile tab)
- **Content:** Full profile for whichever zone is clicked. Demographics, real estate metrics, infrastructure connections.
- **Data status:** 60% exists. Basic zone definitions exist. Detailed profiles need enrichment.

### Workforce data card

- **Size:** Hero (stage 4 workforce tab)
- **Content:** University partnerships, graduate counts, employment rates, research funding.
- **Data status:** 95% exists. Talent pipeline data is the most complete in the codebase.

### Demand projection card

- **Size:** Hero (stage 8 demand tab)
- **Content:** Rental demand forecasts driven by job growth. Inventory constraints, seasonal patterns.
- **Data status:** 50% exists. Job growth and trend data exist but explicit demand projections need to be authored.

---

## Section 4: Quick Look modal (approved)

### Trigger rules

**Quick Look triggers (preview in modal):**
- Document evidence card "open" action: opens PDF in Quick Look
- Gallery evidence card thumbnail click: opens image Quick Look with left/right navigation
- Any inline "view document" or "view source document" button within other card types (financial table notes, infrastructure timeline items)

**External link triggers (open natively, not Quick Look):**
- Document evidence card source link: opens external URL in new browser tab
- Corporate investment card press release link: opens external URL in new browser tab
- Any link explicitly labeled as an external source

**Mental model:** Quick Look = content preview stays inside the app. Link = leaves to source. Each action in the card action row is typed as either `quicklook` or `external`, and the UI routes accordingly.

### Visual treatment

- Extends existing `#property-quick-look` component at z-index 2000 (one overlay system, not two parallel stacks)
- Frosted backdrop: `background: rgba(0, 0, 0, 0.5)` with `backdrop-filter: blur(8px)`
- Content centered in viewport, max-width ~900px, max-height ~90vh
- Content container: white background, `--radius-xlarge` (16px), `--shadow-xlarge`
- Entrance animation: scale(0.95) to scale(1) with opacity fade, `--duration-normal` (250ms)

### Dismiss

Click outside content area, press Escape, or click close button in top-right corner of content. All three methods always available.

### Content types

- PDF: Rendered in iframe or embedded viewer
- Image: Scaled to fit with maintained aspect ratio
- Gallery: Left/right navigation arrows, keyboard arrow support

### Panel state preservation

The right panel remains exactly as it was behind the frosted overlay. Closing Quick Look returns the user to the same panel state, same scroll position, same tab. No state is lost. This was a core requirement from earlier design sessions.

---

## Section 5: Step mapping (approved)

### Stage renumbering recommendation

The actual presentation flow in the codebase is:

```
A0 -> A1/A2 -> A3 -> B1/B2/B3 -> B4/B5 -> B6 -> B7 -> C1 -> C2+
```

Stage 3 (infrastructure/science park) maps to B1-B3 which is Journey B. Stage 4 (talent pipeline) maps to A3 which is Journey A. In the presentation flow, A3 comes before B1 -- so stages 3 and 4 are swapped relative to presentation order.

**Recommendation:** Renumber stages to match presentation order:

| Fine-grained steps | Proposed stage | Context |
|---|---|---|
| A0 | 1 | Opening question |
| A1, A2 | 2 | Natural advantages, utility infrastructure |
| A3 (talent phases) | 3 | Talent pipeline, universities |
| B1, B2, B3 | 4 | Science park, government support |
| B4, B5 | 5 | Corporate investment markers |
| B6 | 6 | Future zones, silicon triangle |
| B7 | 7 | Risk areas, infrastructure roads |
| C1 | 8 | Real estate thesis, demand |
| C2-C11 | 9 | Property detail, financials |

**Status: Confirmed.** Stages are numbered to match presentation order. The tab sets in section 1 already reflect this numbering.

### Card manifests per stage (confirmed)

**Stages 1-2:** No panel. Map + chatbox only.

**Stage 3 (talent pipeline):**
- Workforce tab: workforce data card (hero), employment stats cards (standard)
- Universities tab: university profile cards (standard, one per institution)
- Sources tab: evidence cards (compact, education pipeline group)

**Stage 4 (infrastructure/science park):**
- Plans tab: zone profile card (hero, science park), government investment stats (standard)
- Timeline tab: infrastructure timeline card (hero)
- Sources tab: evidence cards (compact, government development group)

**Stage 5 (corporate investment):**
- Investment tab: corporate investment cards (standard, one per company in pin-drop order)
- Timeline tab: infrastructure timeline card (hero, corporate commitment dates)
- Press tab: evidence cards (compact, press releases)

**Stage 6 (silicon triangle zones):**
- Profile tab: zone profile card (hero, for clicked zone)
- Metrics tab: yield summary card (standard), demand stats (standard)
- Sources tab: evidence cards (compact, zone planning documents)

**Stage 7 (risks + infrastructure roads):**
- Assessment tab: risk cards (standard, per active risk area), infrastructure road cards (standard)
- History tab: historical event timeline (hero)
- Mitigation tab: infrastructure timeline card (hero, mitigation investments), evidence cards (compact)

**Stage 8 (real estate thesis):**
- Demand tab: demand projection card (hero)
- Yields tab: yield summary card (standard), area comparison stats (standard)
- Properties tab: property summary cards (standard, one per property)

**Stage 9 (property detail):**
- Overview tab: decision badge (pinned top, sole layout exception), performance calculator card (hero, thumbnail image only -- saves ~200px vs embedded hero image, keeping yield and commute closer to fold), yield summary card (standard), commute card (standard)
- Financials tab: sticky summary row (total investment cost + projected annual income -- always visible as cross-reference anchor), financial table card (hero, table 1: acquisition costs), financial table card (hero, table 2: rental projections -- scrolls below first). Sequential presentation: cost then income. The overview tab's yield summary already synthesizes the delta.
- Evidence tab: evidence cards (gallery variant for property images), evidence cards (document variant for supporting PDFs)

---

## What this removes from original Approach A

- No drag-resizable top edge. Width-only resize via split-view divider.
- No CSS grid auto-fill/minmax reflow. Cards stack vertically within the panel. Standard cards go 2-across only when panel is wide enough (simple container query, not a reflowing grid engine).
- No "I've seen this before" mode. That is phase 2 exploratory territory.
- No context engine. A static step-to-cards lookup map.

---

## Data gaps summary

**Status: All gaps filled.** Audit on 2026-02-17 confirmed all 14 card renderers have complete data in data.js. Fallback patterns (`|| 0`, `|| 'n/a'`) are defensive code, not masking missing data.

| Card type | Data status | Notes |
|-----------|-------------|-------|
| Decision badge | 100% | `recommendation` and `decisionMetrics` added to both properties |
| Financial table | 100% | `costBreakdown` with subcategories added to both properties |
| Performance calculator | 100% | `brokerMetrics` (rental ranges, growth, area average) added |
| Yield summary | 100% | Derived from `financials.scenarios` per property |
| Evidence cards | 100% | `rentalReport` with title, date, type, viewed state |
| Corporate investment | 100% | All 7 companies with stats, evidence, subtitles |
| Infrastructure timeline | 100% | Roads data complete |
| Commute | 100% | `commuteShifts` (shift2am, shift8am, shiftMidnight) added |
| Risk | 100% | `riskyArea.markers` with name, risk, type, mitigation |
| Zone profile | 100% | `sciencePark` and `futureZones` with stats, descriptions |
| Workforce data | 100% | `talentPipeline` with 5 institutions, stats, roles |
| Demand projection | 100% | `demandProjections` with forecast arrays, constraints |

---

## Key files (implemented)

| File | Lines | Content |
|------|-------|---------|
| `js/ui.js` | ~3600-3780 | Dashboard mode (startDashboardMode, createDashboardMarkers, toggleDashboardPanel) |
| `js/ui.js` | ~3790-5260 | Inspector system (renderInspectorPanel, stage renderers, 14 card renderers, Quick Look, resize) |
| `css/styles.css` | ~4700-5580 | Inspector and icard CSS (panel chrome, card grid, container query, all card types) |
| `js/data.js` | 11-38 | STAGE_MAP and STAGE_TABS lookup tables |
| `js/data.js` | Full file | Properties, companies, infrastructure, evidence, zones, talent, risks |
| `js/app.js` | Step functions | updateInspectorForStep calls at each step transition |

---

## Design evolution context

This is the fourth iteration of the dashboard panel design:

1. **Round 1:** Accordion disclosure groups -- rejected (too much friction)
2. **Round 2:** Bento card grid with dark hero -- rejected (iOS widget style, not macOS)
3. **Round 3:** Finder sidebar -- implemented, currently live (correct for navigation, weak for data presentation)
4. **Round 4 (this design):** Inspector-style bento panel -- the Finder sidebar was navigation-only. This redesign makes the panel a full contextual inspector with rich data cards, following Coinbase CDS layout patterns adapted to macOS inspector chrome.

See `docs/qa/2026-02-16-dashboard-bento-redesign.md` for rounds 1-3 implementation history.
