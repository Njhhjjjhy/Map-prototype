# QA Session: Panel and Dashboard Redesign

**Date:** 2026-02-16
**Status:** Rounds 1-4 complete. Round 4 inspector-style bento panel fully implemented. See `docs/plans/2026-02-16-inspector-bento-dashboard-design.md` for design, `docs/qa/2026-02-17-inspector-cleanup-session.md` for implementation and polish.
**Scope:** Journey panels, dashboard mode, dashboard panel

---

## Part 1: Journey Panel Redesign (Bento Cards)

### Issue

Right panel across all journeys looked flat and unorganized. User requested macOS-style bento card modules with rounded containers, background differentiation, and clear visual hierarchy.

### Solution

Created a modular card system (`.panel-bento-card`) applied to all five journey panel functions:

| Card variant | Background | Use case |
|-------------|------------|----------|
| `.panel-bento-card.primary` | White (`--color-bg-primary`) | Descriptions, actions |
| `.panel-bento-card` (default) | Light gray (`--color-bg-secondary`) | Stats, data |
| `.panel-bento-card.tertiary` | Medium gray (`--color-bg-tertiary`) | Supporting info |

**Components added:**
- `.panel-bento-layout` - Container (flexbox, 16px gap)
- `.panel-bento-card` - Card module (12px radius, subtle shadow)
- `.panel-bento-hero` / `.panel-bento-hero-value` - Large metric display
- `.panel-bento-stats` - 2-column stat grid
- `.panel-bento-btn` - Three-tier button hierarchy (primary/secondary/ghost)

**Functions refactored:** `showResourcePanel`, `showScienceParkPanel`, `showCompanyPanel`, `showFutureZonePanel`, `showPropertyPanel`

**Not updated (legacy style):** Government tier, infrastructure road, evidence, airport route, investment overview, performance calculator, truth engine panels.

### Files modified

- `css/styles.css` - +230 lines (bento card system, panel wrapper animation)
- `js/ui.js` - ~150 lines modified across 5 functions

---

## Part 2: Dashboard Mode Fixes

### Issue 1: White rectangle on map

Control bar (`#control-bar`) was not hidden when entering dashboard mode, leaving a white rectangle in the top-left corner.

**Fix:** Added `controlBar.classList.add('hidden')` in `startDashboardMode()`.

### Issue 2: Data layers not working

`MapController.clearAll()` removed all markers, so data layer toggles had nothing to show/hide.

**Fix:** Created `createDashboardMarkers()` function that recreates property, company, and science park markers after `clearAll()`. Markers use `entrance: 'none'` and start hidden (user toggles visibility via data layers panel).

### Issue 3: Toggle button visibility

Dashboard toggle appeared incorrectly or was missing at various points.

**Fix:** Corrected visibility logic: `startDashboardMode()` shows dashboard toggle + hides panel toggle. `showDashboardPanel()` hides panel toggle. `hidePanel()` restores dashboard toggle when in dashboard mode.

### Files modified

- `js/ui.js` - `startDashboardMode()`, `createDashboardMarkers()` (+100 lines), toggle logic

---

## Part 3: Dashboard Panel - Design Evolution

The dashboard panel content went through three design iterations on this date.

### Round 1: Bento grid with disclosure groups

**Approach:** Accordion-style sections with expand/collapse.
**Rejected:** Too much interaction friction. All content should be visible by default.

### Round 2: Bento card grid

**Approach:** Dark gradient hero card with stats, colored 36px icon containers, card borders with lift-on-hover transforms, footer labels ("View all") with chevrons, description text per card.

**Six fixes applied:**
1. WCAG contrast fix (increased opacity values on dark hero card)
2. Removed redundant "Investment Dashboard" title
3. Fixed panel scroll (overflow hidden, compacted padding)
4. Changed to single-column layout (removed 2-column `.bento-card-row`)
5. Fixed toggle reopen (dashboard toggle stays visible after close)
6. Added entrance animation (`bentoCardIn` with staggered delays)

**Rejected after review:** User reported "still awful, still breaking contrast + usability + macOS + design guidelines." The fundamental design concept was wrong - bento grid is an iOS home screen / marketing page pattern, not a macOS sidebar.

### Round 3: Finder sidebar (superseded by round 4)

User referenced macOS Sequoia Finder sidebar as the target pattern. Complete rewrite.

**What was killed:**

| Removed | Reason |
|---------|--------|
| Dark gradient hero card | Marketing widget, not sidebar |
| 36px colored icon containers | iOS widget style |
| Card borders + 12px radius | Cards do not belong in a sidebar |
| `translateY(-1px)` hover lift | Web/mobile pattern |
| `box-shadow` on hover | Sidebar items have no shadows |
| "View all" footer labels | iOS table view pattern |
| Description text per card | Finder uses badges, not descriptions |
| 3-column stats grid in hero | Dashboard KPI, not sidebar |

**What replaced it:**

```
[X close]

Kumamoto corridor                ← Clean header
¥10T+ government investment      ← Subtitle

Overview                          ← Section label (small, semibold, gray)
─────────────────────────────
  4  Properties                   ← Stat rows (brand yellow value + label)
  8  Companies
  5  Roads

───── divider ─────

Browse                            ← Section label
─────────────────────────────
🏠 Properties             [4]    ← Flat row: 16px icon + label + badge + chevron
🏢 Corporate              [8]
🔧 Infrastructure         [5]
📄 Evidence               [12]
```

**New CSS classes:**

| Class | Purpose |
|-------|---------|
| `.dashboard-sidebar` | Container (replaces `.dashboard-bento`) |
| `.dashboard-sidebar-header` | Title + subtitle block |
| `.dashboard-sidebar-title` | `--text-xl`, semibold |
| `.dashboard-sidebar-subtitle` | `--text-sm`, secondary color |
| `.dashboard-section-label` | Small semibold gray section header |
| `.dashboard-stat-row` | Value + label pair, baseline-aligned |
| `.dashboard-stat-value` | Brand yellow, `--text-xl`, bold |
| `.dashboard-stat-label` | `--text-sm`, secondary color |
| `.dashboard-section-divider` | 1px border line |
| `.dashboard-sidebar-row` | Flat button row (transparent bg, no border) |
| `.dashboard-sidebar-row-icon` | 16px icon, direct accent color |
| `.dashboard-sidebar-row-label` | `--text-base`, regular weight |
| `.dashboard-sidebar-row-badge` | Gray pill with count |
| `.dashboard-sidebar-row-chevron` | 12px subtle chevron |

**Hover behavior:** Background highlight only (`--color-bg-secondary`). No lift, no border change, no shadow.

**Entrance animation:** Renamed `bentoCardIn` to `sidebarItemIn`. Reduced translateY from 12px to 8px. Extended stagger to 10 children at 40ms intervals.

**Dashboard-item drill-down rows** also updated: removed borders and `translateX(2px)` hover. Now flat Finder-style with background highlight only.

### Files modified (round 3)

- `css/styles.css` - Replaced ~280 lines of bento CSS with ~170 lines of Finder sidebar CSS. Updated `.dashboard-item` hover. Removed stale `.dashboard-section-header:active`.
- `js/ui.js` - Rewrote `generateDashboardContent()` from bento cards to flat sidebar.

---

## Verification

### Code review
- [x] Journey panel bento cards (`panel-bento-*`) unaffected by dashboard changes
- [x] No orphaned bento class references in CSS for dashboard
- [x] CSS class names match JS HTML generation
- [x] Entrance animation selector `.dashboard-sidebar > *` matches JS container
- [x] All text on light backgrounds passes WCAG AA 4.5:1
- [x] No uppercase text, all spacing uses design tokens
- [x] Dashboard-item active state uses `background` not `scale`
- [x] Data layers create markers correctly after `clearAll()`
- [x] Toggle visibility logic correct in all code paths
- [x] Control bar hidden in dashboard mode

### Browser testing
- [ ] Awaiting user confirmation

**Test steps:**
1. Open app, click "I've seen this before"
2. Dashboard panel appears floating with clean sidebar layout
3. "Overview" section with stat rows, "Browse" section with flat rows
4. Hover rows - subtle gray background only
5. Click row to drill down, back button returns to sidebar
6. Close panel, dashboard toggle stays visible, reopen works
7. Data layers toggle shows/hides markers correctly
8. No white rectangle in top-left (control bar hidden)
9. Start a journey - journey panels use bento card system
10. Panel back navigation, history, draggable all still work

---

## Design decisions

**Journey panels use bento cards. Dashboard panel used Finder sidebar. Why the difference?**

Journey panels present *content* - descriptions, stats, metrics, actions. Card containers create visual grouping and hierarchy for this mixed content. This follows macOS System Settings pattern.

The dashboard panel was *navigation* - it listed categories to browse. A flat sidebar with sections was the correct macOS pattern for navigation lists (Finder, Notes, Reminders sidebar). Cards add unnecessary chrome to what should be a simple list.

**Round 4 (implemented):** The Finder sidebar was correct for navigation but too weak for data presentation. Round 4 (`docs/plans/2026-02-16-inspector-bento-dashboard-design.md`) replaced the sidebar with a contextual inspector panel -- macOS NSInspectorPanel pattern with bento cards, segmented control tabs, and stage-aware content manifests. Fully implemented and polished across two sessions (`docs/qa/2026-02-17-inspector-cleanup-session.md`): 14 card renderers, 9 stages, all data gaps filled, dead code removed, resize/container query polish complete.
