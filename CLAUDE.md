# CLAUDE.md - Map Prototype Design System

## How this repo relates to value-add-prototype (read first)

This is an active, standalone project. The product owner edits it every day. It deploys to its own Vercel URL.

### Current state (what is actually deployed today)

`value-add-prototype` (a sibling folder, the investor pitch project) embeds the map on slides 6, 7, 11, and 12 by iframing a **committed static snapshot** of this project's Vite build, located at:

- `value-add-prototype/public/playground/prototypes/step-6-section-3-map/map-prototype-v1/`
- `value-add-prototype/public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/`

`MapHost.tsx` and `PropertyMapHost.tsx` reference those `index.html` files. The snapshot is a frozen `pnpm build` output that was last refreshed on 2026-03-12. To update the map inside `value-add-prototype` you must rebuild this project and copy the new `dist/` output over those two folders, preserving each folder's `assets/embed-mobile-overrides.css` file. The old `scripts/sync-to-slideshow.js` automation that did this was retired; the snapshots themselves remain committed in `value-add-prototype` as static files.

This guarantees the offline pitch requirement: nothing the slideshow shows is fetched at runtime, so unreliable wi-fi in meeting rooms never breaks the embedded map.

### Target state (the `mountMap()` package model)

This project publishes the npm package `@moreharvest/map-core` with a `mountMap()` entry point at [`js/map-core.js`](js/map-core.js). The plan in [`docs/for-riaan.md`](docs/for-riaan.md) describes the intended migration: replace the iframe + snapshot with a direct `mountMap()` call inside the React host components. That migration is **not finished**. `node_modules/@moreharvest/map-core` is currently a `link:../map-prototype` symlink in `value-add-prototype`, but no source file imports it.

When future work resumes the migration, follow [`docs/architecture-and-sync-workflow.md`](docs/architecture-and-sync-workflow.md), which describes the package consumption model end-to-end.

### The other project

The 3D property tour (`3d-vertical-test`, a third active project) is iframed live cross-origin by the map — no sync needed; edits there are picked up on next load.

### Do not merge

**Do not** propose merging these repos into a monorepo. A previous plan tried this and was rejected because it would break the daily editing workflow on each project. See [`docs/abandoned/README.md`](docs/abandoned/README.md) for the full reasoning.

---

## Project Overview

Interactive presentation app for real estate sales in Kumamoto, Japan. Desktop-only web app that guides presenters through three sequential "journeys" building investment credibility.

**Technology Stack:** HTML/CSS/JavaScript (no frameworks), Mapbox GL JS (3D), Vanilla JS state machine, Chart.js (dataviz)

---

## Design Philosophy

macOS Human Interface Guidelines (HIG) adapted for web: clarity, deference, depth, consistency.

---

## Strict Rules

All mandatory constraints. Each rule has one canonical definition here.

### Process Rules

**Language:**
- English only. No Japanese (hiragana, katakana, kanji) in UI text.
- Never add bilingual properties (titleJa, nameJa, questionJa).
- Japanese place names use romanized (romaji) form only.

**Claude response style:**
- Never use emojis, uppercase, or exaggeration.
- Always use proper grammar, Oxford commas, and end sentences with periods.
- Never use em dash.
- Use clear, direct, professional communication.

**Project naming:**
- Always refer to the investor pitch project by its literal name `value-add-prototype`. Never use shorthand like "slideshow", "deck", "pitch deck", "the pitch", or any other paraphrase, even when quoting or paraphrasing existing docs. Same rule applies to `map-prototype` and `3d-vertical-test`: use the literal repo name when referring to the project. Using "the map" or "the tour" is fine when describing the visible thing inside the experience, but switch back to the literal name when referring to the project or repo.

**Context window management:**
- Never exceed 50% context window usage (100,000 tokens out of 200,000).
- Break large tasks into smaller steps to prevent context overflow.
- If approaching 50%, pause and ask user before continuing.

**Feature branch commits:**
- On a feature branch, never commit, push, or open a PR until the user invokes `/feature finish`. Make changes freely; let them accumulate uncommitted. Wait for `/feature finish` to commit and push everything.
- When commits eventually happen (during `/feature finish`), the commit body must be the user's raw prompt text, copied verbatim with no rewording or expansion. Only the commit title line may be a generated summary.
- When `/feature <name>` is invoked on master, check for uncommitted changes BEFORE creating the branch. If changes exist, present exactly two options: (1) drop the changes, (2) save them to a separate feature branch with a commit, PR, and merge to master, then create the requested branch. Never silently carry uncommitted master changes into a new branch.

**Feature branch scope (map vs value-add-prototype):**
- Immediately after a new feature branch is created via `/feature <name>` (and before making any code changes), Claude must ask the user: "Is this work for map-prototype (this project) only, or does it also need changes in value-add-prototype (the investor pitch project, which embeds this project's static snapshot on slides 6, 7, 11, 12)?"
- If "map-prototype only": work happens in this repo only.
- If "also value-add-prototype": Claude makes the map-prototype changes in this repo, then makes any consumer-side changes in value-add-prototype. If the change must be visible inside the slideshow's embedded map (not just the standalone deploy), the snapshot folders under `value-add-prototype/public/playground/prototypes/.../map-prototype-v1/` must also be refreshed (see "Refreshing the embedded map snapshot" below). Claude tells the user to test slides 6, 7, 11, and 12 in value-add-prototype before any commit in either repo, and reminds them that the value-add-prototype side needs its own commit + push to deploy.
- For full context on the three-project architecture, see `docs/architecture-and-sync-workflow.md`.

**Refreshing the embedded map snapshot (`/feature finish` propagation step):**
- On `/feature finish` in this project, if the merge changed anything that affects what slides 6, 7, 11, or 12 render (any file under `js/`, `css/`, `assets/`, `index.html`, or `landmarks.json` / `layers.json` / `regions.json`), the slideshow snapshots must be rebuilt. The pitch deck will otherwise continue showing the March 2026 snapshot.
- Manual rebuild procedure (until the `mountMap()` migration in `docs/for-riaan.md` is finished):
  1. In `map-prototype`: `pnpm install && pnpm build`. Confirm `dist/index.html` and `dist/assets/` regenerated.
  2. For each of the two embed folders in `value-add-prototype/public/playground/prototypes/.../map-prototype-v1/`:
     - Save the existing `assets/embed-mobile-overrides.css` to `/tmp`.
     - Wipe the folder contents.
     - Copy the new `dist/.` into the folder.
     - Restore the saved `embed-mobile-overrides.css` over the new copy.
  3. Verify slides 6, 7, 11, and 12 in `value-add-prototype` with `pnpm dev`. Tap the Ozu-1 marker on slide 12 to confirm the 3D tour still launches.
  4. Commit and push in `value-add-prototype` so its Vercel deploy picks up the new snapshot.
- If the merge only changed docs, plans, QA notes, the dev-only step jumper, or anything that does not appear in the production Vite build, skip the snapshot rebuild and tell the user explicitly that propagation was skipped and why.
- The deferred `mountMap()` migration removes this manual step entirely; until then, treat the snapshot rebuild as the propagation contract.

**Dynamically created overlays:**
- Always remove existing instances before creating new ones (prevent element accumulation).
- Check `element.parentNode` exists before calling `.remove()`.
- Clean up in all restart/reset functions.

**Escape key handling:**
- Use a single unified Escape key handler that checks overlays from highest z-index to lowest and closes only the topmost one. Never register multiple independent Escape listeners that can all fire on the same keypress.
- Closing a modal overlay must never close the dashboard, chatbox, or panel behind it.

**Camera positioning on touch devices (iPad):**
- On any iPad-layout viewport (detected via `(hover: none) and (pointer: coarse)` OR `(max-width: 1440px)`, since Safari Responsive Design Mode does not emulate touch and reports iPad Pro 13" landscape as 1370px, slightly above 1366), every camera move must center the content being shown inside the *visible* viewport, i.e., the portion of the map that is not occluded by the right panel (or the bottom sheet in portrait). The content must never end up behind the panel.
- Mechanism: a config passed to `flyToStep` in `js/map/camera.js` may carry an optional `ipad: { center, zoom, pitch, bearing }` partial override. On iPad-layout viewports (`this._isTouchDevice`), the override is merged on top of the desktop config before flying. Without an `ipad` block, the desktop config is used as-is.
- No global auto-shift is applied. The existing desktop CAMERA_STEPS entries and the inline sub-item configs in `js/step-handlers.js` already carry their own panel compensation, hand-tuned per step. A global pan/padding shift would double-correct and push content off-screen left.
- Property tour reveal (`forwardReveal` and `reverseReveal` in `js/map/camera.js`) calls `map.flyTo` directly and does NOT go through `flyToStep`. Iframing changes for that path must be made on those call sites specifically.
- Do not introduce `map.setPadding`, `flyTo({ offset })`, or wrapper-level padding hacks. The single source of iPad re-framing is per-step `ipad:` overrides on configs that need them.
- To author an `ipad:` override: open the standalone app in iPad emulation, navigate to the step, use the camera-explorer dev tool (wrench icon, top-left). The tool emits an `ipad: { ... }` snippet you paste inline into the relevant `CAMERA_STEPS` entry.
- Desktop behavior is unchanged.
- This rule applies inside the iframe-embedded map snapshot in `value-add-prototype` slides 6, 7, 11, and 12 by virtue of running the same build.

**Touch-compatible hover behavior:**
- For tooltip-style hover on map markers, DOM elements, or any control where hover reveals information, use pointer events (`pointerenter` / `pointerleave` / `pointercancel`) rather than `mouseenter` / `mouseleave`. Pointer events fire for mouse, trackpad, Apple Pencil hover, and touch, so the same code works across every iPadOS input mode.
- For Mapbox layer hover (`map.on("mouseenter", layerId, ...)`), also wire a matching `map.on("click", layerId, ...)` handler that performs the equivalent reveal, since Mapbox layer events are mouse-only on touch devices.
- Never write inline `onmouseenter` / `onmouseleave` attributes in JS-generated HTML strings. Use CSS `:hover` rules and add the new selector to the `@media (hover: none)` neutraliser in `css/styles.css` so the hover state cannot stick after a tap on touch.

**Dev / QA tools in production:**
- Any dev or QA-only UI block in `index.html` must be wrapped with the `<!-- DEV-ONLY-START -->` and `<!-- DEV-ONLY-END -->` marker comments. The Vite plugin in `vite.config.js` strips everything between those markers from production builds, so dev tools never ship to the deployed site. In `pnpm dev` the markers are no-ops and the tools are visible.

### Visual Rules

**Typography prohibitions:**
- Never use all caps or uppercase for any UI text. Use bold weight or color for emphasis.
- Never center-align body text. Always left-align (align-start).
- Never justify text.

**Case rules:** Always sentence case. Only two exceptions: primary CTAs (amber fill) and modal overlay headings use Title Case.

**Evidence card descriptions:** All `evidenceCard` description text must be complete sentences ending with a period. Never use sentence fragments.

**Dark mode:** Not supported. Light mode only. No `prefers-color-scheme` queries.

**Spacing enforcement:**
- Always use spacing tokens from the 8pt grid. Never use arbitrary pixel values.
- Never skip section gaps. Use `--space-6` (24px) minimum between sections.

| Context | Required Token |
|---------|----------------|
| Title to next section | `--space-6` (24px) |
| Header to content block | `--space-6` (24px) |
| Between related items | `--space-3` or `--space-4` |
| Between unrelated sections | `--space-6` to `--space-8` |
| Panel/card internal padding | `--space-6` (24px) |
| Icon to adjacent text | `--space-2` (8px) |
| Button internal padding | `--space-3` x `--space-6` |

When in doubt: `--space-6` (24px) for section gaps, `--space-4` (16px) for related elements.

**Modal list item spacing:**
- All items inside `.chatbox-options` container (`gap: var(--space-4)`).
- Never add inline `style="margin-top"` to individual items.
- Checkmarks use `margin-left: auto` (not fixed spacing).
- CTA buttons: `margin-top: var(--space-6)` from last item.

**AI Chat internal spacing:**
- `.ai-chat-header`: `margin-top: var(--space-4)` (gap after close button).
- `.ai-chat-suggestions` and `.ai-chat-messages`: `margin-top: var(--space-6)` (section gap after header).

**Navigation pattern:**
- Icon-only back button in panel/chatbox header. Never text-based "Back to..." CTAs.
- Back icon appears automatically when history exists. No redundant navigation controls.

---

## Quick Reference: Design Tokens

**Fonts:** `"Rem", sans-serif` (headings/labels/CTAs), `"Noto Sans JP", sans-serif` (body).

**Type scale:** `--text-xs` 11px, `--text-sm` 13px, `--text-base` 15px, `--text-lg` 17px, `--text-xl` 20px, `--text-2xl` 22px, `--text-3xl` 28px, `--text-4xl` 34px, `--text-5xl` 40px.

**Colors:** `--color-primary` #fbb931, `--color-text-primary` #1e1f20, `--color-text-secondary` #4a4b4d, `--color-text-tertiary` #6e7073, `--color-bg-primary` #ffffff, `--color-bg-secondary` #f5f5f7, `--color-bg-tertiary` #e8e8ed, `--color-info` #007aff, `--color-error` #ff3b30, `--color-success` #34c759.

**Spacing (8pt grid):** `--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px, `--space-5` 20px, `--space-6` 24px, `--space-8` 32px, `--space-10` 40px, `--space-12` 48px.

**Radius:** `--radius-small` 4px, `--radius-medium` 8px, `--radius-large` 12px, `--radius-xlarge` 16px, `--radius-full` 9999px.

**Shadows:** `--shadow-subtle`, `--shadow-medium`, `--shadow-large`, `--shadow-xlarge`, `--shadow-inset`.

**Timing:** `--duration-fast` 150ms, `--duration-normal` 250ms, `--duration-slow` 350ms, `--duration-slower` 500ms, `--duration-scene` 1500ms.

**Z-index layers:** map 0, controls 10, markers 20, transition-overlay 50, chatbox 100, panel 200, control-bar 300, UI overlays 500, modals 1000, tooltips 1100, quick-look 2000.

For full CSS definitions and detailed values, see `docs/design-tokens.md`.

---

## Detailed Specs (Separate Files)

| File | Contents |
|------|----------|
| `docs/design-tokens.md` | Full CSS custom properties: typography, colors, spacing, radius, shadows, elevation |
| `docs/components.md` | All component specs: buttons, panels, chatbox, AI chat, gallery, legend, data layers, FAB, modals, charts, dashboard |
| `docs/motion.md` | Animation keyframes, timing tokens, heartbeat, camera choreography, narrative timing |
| `docs/interaction-patterns.md` | Touch targets, focus management, hover states, cursors, ARIA patterns, accessibility |
| `docs/checklist.md` | Implementation QA checklist for all component types |

---

## Vercel deploy acceptance gate

Before merging any feature branch that touched the production-visible map (anything in this project's `js/`, `css/`, `assets/`, `index.html`, or `landmarks.json` / `layers.json` / `regions.json`), and after the snapshot rebuild step above, the change must pass the offline-pitch acceptance test in `value-add-prototype`:

1. With `value-add-prototype` running locally (or its Vercel preview deployed), put the iPad (or browser) into **airplane mode** so no network requests succeed.
2. Walk through slides 5 → 6 → 7 (first map embed) and 10 → 11 → 12 (property map embed). Confirm: the map renders without a network-error banner; markers, panels, and the dashboard appear; the camera moves between steps; tapping the Ozu-1 marker on slide 12 launches the 3D tour iframe.
3. If Mapbox vector tiles fail to render without network (a known limitation — see `docs/architecture-and-sync-workflow.md` §9), record the gap and ship anyway; the rest of the embed must still be operable.
4. Take a screenshot of each of slides 6, 7, 11, 12 in airplane mode for the QA archive.

This is the only acceptance test that proves the offline-pitch guarantee survives a given change. Type checks, lint, and the in-browser `pnpm dev` walkthrough do not substitute for it.

## Distribution of `@moreharvest/map-core`

Until the `mountMap()` migration in `docs/for-riaan.md` is finished, the npm package `@moreharvest/map-core` is **not consumed at runtime** by `value-add-prototype`. The `link:../map-prototype` symlink in `value-add-prototype/node_modules` exists for future migration work but no source file imports from it today. Distribution mechanism (git-tag dep, registry publish, etc.) is therefore deferred — there is nothing to distribute until a consumer imports the package. Tags from this repo (currently `map-core-v1.0.0`) are bookkeeping for the future migration, not a deploy contract.

---

## Map outlines and polygons

When adding a new map area, zone boundary, or polygon overlay, use the existing skills rather than manually writing coordinates:

1. **`@trace-outline`** - guides the user through drawing the shape in Google My Maps and exporting it as KML.
2. **`@smooth-outline`** - runs Chaikin's corner-cutting algorithm on the exported KML to produce smooth coordinates ready for `js/data.js`.

The smoothing script lives at `~/.claude/skills/smooth-outline/smooth-polygon.py`. KML files go in `assets/map-outlines/`.

---

## File Structure

```
map-prototype/
├── index.html                  # Main entry point
├── css/
│   └── styles.css              # All CSS (single file)
├── js/
│   ├── main.js                 # Module entry point, global exposure
│   ├── app.js                  # Core state machine, step navigation (708 lines)
│   ├── step-handlers.js        # Step-specific sub-item handlers (1,203 lines)
│   ├── map/
│   │   ├── index.js            # MapController facade
│   │   ├── state.js            # Shared mutable state
│   │   ├── constants.js        # MAP_COLORS, CAMERA_FEELINGS, CAMERA_STEPS
│   │   ├── core.js             # init, destroy, safe helpers, utilities
│   │   ├── camera.js           # flyToStep, cinematic moves, reveal
│   │   ├── markers.js          # Marker creation, HTML templates
│   │   ├── airlines.js         # Airline routes, arc lines
│   │   ├── heartbeat.js        # Idle drift, marker pulse
│   │   ├── resources.js        # Water, energy, resource arcs
│   │   ├── zones.js            # Science park, investment zones
│   │   ├── properties.js       # Property context lines, talent pipeline
│   │   ├── infrastructure.js   # Roads, government, airport, rail
│   │   └── data-layers.js      # Data layer markers, animated routes
│   ├── ui/
│   │   ├── index.js            # UI facade
│   │   ├── state.js            # Shared UI state
│   │   ├── core.js             # Init, chatbox, panel, FAB, progress
│   │   ├── cards.js            # Detail panels, government, airline, property
│   │   ├── charts.js           # Chart.js rendering, calculator
│   │   ├── data-layers.js      # Data layer toggles, dashboard, QA panel
│   │   ├── ai-chat.js          # AI chat system
│   │   ├── overlays.js         # Transition overlay, gallery, quick look
│   │   ├── evidence.js         # Disclosure groups, evidence preview
│   │   └── inspector.js        # Inspector panel, stage renderers, cards
│   ├── data/
│   │   ├── index.js            # AppData facade
│   │   ├── steps.js            # STEPS, STAGE_TABS, CAMERA_STEPS
│   │   ├── resources.js        # Water, power, sewage, silicon island
│   │   ├── infrastructure.js   # Science park, airport, roads, stations
│   │   ├── government.js       # Government chain, tiers, boundary
│   │   ├── companies.js        # Corporate investment data
│   │   ├── properties.js       # Property cards, zones, GKTK fund
│   │   ├── evidence.js         # Evidence groups
│   │   └── data-layers.js      # Toggleable data layer definitions
│   ├── shared/
│   │   ├── utils.js            # formatYen, toggleArrayItem, cycleIndex
│   │   ├── icons.js            # SVG icon map
│   │   ├── timing.js           # TIMING constants
│   │   └── history-stack.js    # Reusable HistoryStack class
│   └── dev/
│       ├── step-jumper.js      # Step jumper tool
│       └── qa-reporter.js      # QA reporter tool
├── assets/
│   ├── placeholders/           # Placeholder images
│   └── map-outlines/           # KML and GeoJSON boundary data
├── docs/
│   ├── design-tokens.md        # Full CSS token definitions
│   ├── components.md           # Component specifications
│   ├── motion.md               # Animation & timing specs
│   ├── interaction-patterns.md # Interaction & accessibility
│   ├── checklist.md            # QA checklist
│   ├── BEATSHEET.md            # Narrative beat sheet
│   ├── Map prototype spec.md   # App specification
│   └── plans/                  # Design documents and plans
├── CLAUDE.md                   # This file (design system rules)
└── package.json                # Dependencies
```

---

*Last updated: March 5, 2026*
*Based on macOS Human Interface Guidelines with project-specific customizations*


## Obsidian vault

- Path: /Users/riaan/Documents/personal/obsidian-vault
- After each session, write a handoff note to /Users/riaan/Documents/personal/obsidian-vault/sessions/
- Use filename format: YYYY-MM-DD-[project-name]-[topic].md
