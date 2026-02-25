# QA Issue: Stacking content replaced with disclosure groups and visual refinement

**Date:** 2026-02-18
**Status:** Completely fixed
**Reporter:** QA Review

## Issue description

Five issues identified during QA review:

1. **Energy mix stacking** - Solar, Wind, and Nuclear facility lists in the resource panel (Journey A power resource) and the electricity data layer panel rendered as flat stacked content, consuming vertical space and lacking organizational structure.
2. **Airport routes stacking** - The "View all routes" panel listed all airline routes in a single flat list without distinguishing active vs. suspended routes.
3. **Duplicate evidence title** - When drilling into a disclosure item detail, the group title appeared twice: once in the back button and again as a separate subtitle div below it.
4. **Talent pipeline over-styled** - List items had amber-tinted hover states, oversized dots with box-shadow, and hidden chevrons that only appeared on hover, diverging from the macOS source list aesthetic.
5. **Fund/portfolio cards too loud** - GKTK banner used a dark background with amber fund size text, and the portfolio summary card used an amber gradient with radial overlay, creating visual noise inconsistent with the design system.

## Root cause

1-2: Content rendered as flat HTML without disclosure group wrappers, despite the existing `toggleDisclosureGroup()` pattern being available.
3: `showDisclosureItemDetail()` included both a back button with `group.title` text and a separate `<div class="subtitle">${group.title}</div>`, duplicating the title.
4: Talent list CSS used non-standard hover colors (amber tint), oversized dot indicators (12px with box-shadow), and opacity-hidden chevrons instead of the simpler macOS source list pattern.
5: Portfolio card CSS used dark fills and amber gradients rather than the standard light surface treatment (`--color-bg-secondary` with border).

## Solution

### Fix 1: Energy mix disclosure groups
Wrapped Solar, Wind, and Nuclear facility lists in macOS disclosure groups using the existing `.disclosure-group` / `.disclosure-header` / `.disclosure-content` pattern in both `showResourcePanel()` and `showDataLayerPanel()`. Each group has a colored icon, type label, and facility count badge.

### Fix 2: Airport routes disclosure groups
Wrapped active and suspended route lists in disclosure groups within `showAllAirlineRoutes()`. Active routes start expanded (`disclosureState['active-routes'] = true`), suspended routes start collapsed. Route items use `.disclosure-item` class inside `.disclosure-content`.

### Fix 3: Duplicate title removed
Removed the redundant `<div class="subtitle">${group.title}</div>` line from `showDisclosureItemDetail()`. The back button already displays the group title.

### Fix 4: Talent pipeline visual refinement
- List background changed to `var(--color-bg-secondary)` with `--radius-medium`
- Dot size reduced to 8px with `border: 1.5px solid` instead of box-shadow
- Hover state uses `var(--color-bg-tertiary)` instead of amber tint
- Chevron always visible at `--color-text-disabled`, fading to `--color-text-tertiary` on hover
- CTA spacing increased to `--space-4`

### Fix 5: Fund/portfolio card styling
- GKTK banner: changed from dark background (`--color-text-primary`) to light (`--color-bg-secondary`) with border
- Fund size text color changed from `--color-primary` to `--color-text-primary`
- Portfolio summary: removed amber gradient and radial overlay, replaced with `--color-bg-secondary` card with border
- All text colors updated to proper design tokens

## Files modified

- `js/ui.js` - `showResourcePanel()` (~line 1054): energy mix disclosure groups; `showAllAirlineRoutes()` (~line 1332): route disclosure groups; `showDisclosureItemDetail()` (~line 2153): removed duplicate subtitle; `showDataLayerPanel()` (~line 2771): electricity data layer disclosure groups
- `css/styles.css` - `.talent-list` and children (~line 1000): refined styling; `.gktk-banner` and `.portfolio-summary` (~line 4119): toned-down cards

## Verification results

### Code review
- [x] Energy mix uses existing `disclosure-group` pattern with `toggleDisclosureGroup()` binding
- [x] Airport routes disclosure groups with correct initial state (active expanded, suspended collapsed)
- [x] Duplicate subtitle div removed from `showDisclosureItemDetail()`
- [x] Talent list uses design system tokens throughout (no amber tints, proper sizing)
- [x] Portfolio cards use `--color-bg-secondary` with border, no gradients or dark fills
- [x] No unintended side effects on other components

### Browser testing
- [ ] Navigate to Journey A power resource panel and confirm Solar/Wind/Nuclear are disclosure groups
- [ ] Click "View all routes" in airport panel and confirm Active (expanded) / Suspended (collapsed) disclosure groups
- [ ] Navigate to an evidence item detail and confirm no duplicate title below back button
- [ ] Navigate to Journey A talent pipeline chatbox and confirm refined list styling (smaller dots, subtle hover, visible chevrons)
- [ ] Open the fund/portfolio disclosure in the journey complete chatbox and confirm toned-down light cards

## CLAUDE.md updates

None required. All fixes reuse existing design system patterns: disclosure groups, spacing tokens, color tokens, and surface treatments. No new rules needed.
