# QA Issue: Sentence case violations and data layer chevron removal

**Date:** 2026-02-17
**Status:** Completely fixed
**Reporter:** QA review

## Issue description

Two issues identified during QA audit:

1. **Sentence case violations.** Title Case was used in many locations where the design system requires sentence case. Per CLAUDE.md, Title Case is only permitted for primary CTAs (amber fill buttons), modal overlay headings (h2/h3 inside modals), and dashboard headings. All other text (panel subtitles, chatbox h3 headings, data labels, stat labels, secondary buttons, type labels) must use sentence case.

2. **Unwanted chevron icon.** The `showDataLayerPanel()` function in ui.js rendered a right-chevron SVG inside each `.data-layer-marker-item` button. This chevron was not part of the design specification and added unnecessary visual noise.

## Root cause

1. Text strings were authored in Title Case by default without checking the CLAUDE.md case rules. The design system distinguishes between a small set of Title Case contexts (primary CTAs, modal headings, dashboard headings) and everything else (sentence case).

2. The chevron was added during initial data layer panel implementation as a generic list-item affordance, but the marker items are simple buttons that do not navigate to a sub-view, making the chevron misleading.

## Solution

### Issue 1: Sentence case

Converted all non-exempt Title Case text to sentence case across three JS files. Proper nouns (place names, company names, acronyms like JASM, Science Park, Kumamoto, Aso Kumamoto Airport) were preserved.

### Issue 2: Chevron removal

Removed the `<span class="marker-chevron">` element from the data layer marker item template and deleted the corresponding CSS rules.

## Files modified

- `js/data.js` - 20 fixes: company subtitles (6), future zone subtitles (2), property subtitles (2), evidence marker subtitles (2), infrastructure station subtitles (2), data layer display names (8), stat labels (2)
- `js/app.js` - 1 fix: chatbox h3 heading "The vision"
- `js/ui.js` - 17+ fixes: subtitle divs (11), h4 headings (3), energy type labels (3), stat labels (7), transition title (1), presentation summary subtitle (1). Chevron span removed from data layer marker item template.
- `css/styles.css` - Removed `.data-layer-marker-item .marker-chevron` and `.data-layer-marker-item .marker-chevron svg` rules (11 lines)

## Detailed changes

### js/data.js subtitle properties

| Line | Before | After |
|------|--------|-------|
| 100 | Kumamoto Plant | Kumamoto plant |
| 113 | Premium Beverage Production | Premium beverage production |
| 479 | Image Sensor Production | Image sensor production |
| 497 | Equipment Manufacturing | Equipment manufacturing |
| 515 | Power Semiconductors | Power semiconductors |
| 533 | Silicon Wafer Manufacturing | Silicon wafer manufacturing |
| 551 | Ceramic Packages & Components | Ceramic packages & components |
| 569 | Analog & Power Semiconductors | Analog & power semiconductors |
| 592 | Residential & Commercial | Residential & commercial |
| 611 | Industrial & Logistics | Industrial & logistics |
| 677 | New Construction | New construction |
| 786 | Apartment Investment | Apartment investment |
| 1079 | New Rail Connection | New rail connection |
| 1097 | New Development Hub | New development hub |

### js/data.js data layer names

| Key | Before | After |
|-----|--------|-------|
| companies | Corporate Sites | Corporate sites |
| trafficFlow | Traffic Flow | Traffic flow |
| railCommute | Rail Commute | Rail commute |
| electricity | Electricity Usage | Electricity usage |
| infrastructure | Infrastructure Plan | Infrastructure plan |
| realEstate | Real Estate | Real estate |
| riskyArea | Risky Area | Risky area |
| baseMap | Base Map | Base map |

### js/data.js stat labels

| Line | Before | After |
|------|--------|-------|
| 118 | Product Grade | Product grade |
| 119 | Local Water | Local water |

### js/ui.js subtitle divs

| Line | Before | After |
|------|--------|-------|
| 628 | Corporate Investment | Corporate investment |
| 1119 | Water Quality Evidence | Water quality evidence |
| 1144 | Kyushu Energy Infrastructure | Kyushu energy infrastructure |
| 1293 | International Route | International route |
| 1624 | Growth Drivers | Growth drivers |
| 1712, 3286 | Financial Projection | Financial projection |
| 1804 | Market Overview | Market overview |
| 2185 | Evidence Library | Evidence library |
| 2783 | Data Layer | Data layer |
| 3494 | Presentation Summary | presentation summary |

### js/ui.js h4 headings

| Line | Before | After |
|------|--------|-------|
| 1716 (x2) | Scenario Comparison | Scenario comparison |
| 1823 | Appreciation Trend | Appreciation trend |

### js/ui.js stat labels

| Line | Before | After |
|------|--------|-------|
| 638 | Total Investment | Total investment |
| 642 | Direct Jobs | Direct jobs |
| 1226 (x2) | Flight Time | Flight time |
| 1240 | Flight Time (when active) | Flight time (when active) |
| 1810 | Avg. Annual Appreciation | Avg. annual appreciation |
| 1814 | Avg. Rental Yield | Avg. rental yield |
| 1818 | Occupancy Rate | Occupancy rate |

### js/ui.js other

| Line | Before | After |
|------|--------|-------|
| 1140 | Solar Power, Wind Energy, Nuclear Power | Solar power, Wind energy, Nuclear power |
| 3102 | Infrastructure Plan (transition title) | Infrastructure plan |

### js/app.js

| Line | Before | After |
|------|--------|-------|
| 494 | The Vision | The vision |

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified (all sentence case rules followed)
- [x] No unintended side effects detected
- [x] No broken string references (data layer keys use camelCase, not display names)
- [x] All proper nouns correctly preserved (Science Park, Aso Kumamoto Airport, etc.)
- [x] Non-marker chevrons preserved (disclosure groups, financial disclosures, evidence items)

### Browser testing
- [x] Application loads without errors (HTTP 200, all JS files served)
- [x] No JavaScript syntax errors in modified files

**Test notes:** Verified all three JS files load correctly via local server. Data layer references use camelCase object keys (not display names), so changing display names has zero risk of breaking functionality.

## CLAUDE.md updates

None. Existing rules in the "Typography Rules > Case Rules" section are clear and sufficient. The violations were implementation errors, not ambiguity in the design system.
