# Map core extraction — execution plan

> **Companion to:** [`map-core-package-extraction-plan.md`](map-core-package-extraction-plan.md) (the colleague's strategy doc).
>
> **What this doc is:** the strategy doc engages with principles. This doc engages with **what's actually in `map-prototype`'s code as of 2026-05-19**, identifies the concrete refactor work each stage requires, calls out the things the strategy doc handwaved, and proposes specific acceptance tests.
>
> **Status:** Plan only. No code changes have been made. Branch: `feature/extract-map-core-package`.

---

## 1. What the audit found (the things the strategy doc didn't engage with)

The colleague's plan assumed the map could be wrapped in a `mountMap(targetEl, options)` function with minimal refactoring of the existing source. The audit confirms the **boundary is achievable**, but the path is bigger than the strategy implied. Six load-bearing findings:

### 1.1 State is module-scoped, not instance-scoped

Every major module (`MapController`, `UI`, `App`) keeps state as a global singleton:

- `js/map/state.js` — ~80 properties (map instance, markers, layers, animation tracking, etc.)
- `js/ui/state.js` — 26+ properties (panel state, chart refs, modal state)
- `App.state` in `js/app.js` — 10 properties (current step, exploration state, active filters)

For `mountMap()` to work cleanly (even just once, let alone supporting multiple instances), these singletons must become **instance-scoped via a factory pattern**. That's a real refactor, not a wrapper.

### 1.2 External libraries are CDN-loaded, not npm imports

`index.html` loads Mapbox GL JS and Chart.js via `<script>` tags (lines 1052, 1055). They are **not** ES module imports. The package cannot bundle them. Two options:

- **Peer dependencies:** the package declares `mapbox-gl` and `chart.js` as `peerDependencies`; the consumer (value-add-prototype) installs them via npm; the package imports them as ES modules. **Requires changing how the standalone app loads them too** (otherwise the standalone breaks).
- **Window globals:** the package expects `window.mapboxgl` and `window.Chart` to exist; the consumer loads them however they want (CDN or npm). Looser contract; easier transition.

Recommendation: window globals to start, peer-deps as a later cleanup. Avoid coupling extraction risk to bundler-internals risk.

### 1.3 DOM coupling is extensive and scattered

The map code reaches for ~30 specific DOM IDs (`#map`, `#right-panel`, `#gallery-modal`, `#panel-toggle`, etc.) via `document.querySelector` / `getElementById` scattered across `js/ui/*.js` and `js/step-handlers.js`. Some elements are created dynamically; others are expected to exist at init time.

For `mountMap()` to be cleanly scoped to a target element, all of these need to either:

- Be queried inside the target element (`targetEl.querySelector(...)` instead of `document.querySelector(...)`), or
- Be created dynamically as children of the target element by the package.

The audit found that most overlays (panel, gallery, evidence preview) are created dynamically — those are easier to fix. The handful of elements expected to pre-exist need explicit creation during `mountMap`.

### 1.4 Step filtering happens at module load time

`js/data/steps.js` runs an IIFE at module load that mutates the global `STEPS` array based on the `?steps=` URL param. This means by the time `App.init()` runs, the steps are already filtered.

For the package, this needs to move from "URL param at module load" to "config arg at `mountMap()` call." That requires removing the IIFE and exposing a `setScenes(scenes: string[])` function the package calls during init.

### 1.5 Initialization is tightly choreographed

`App.init()` orchestrates a specific sequence: `UI.init()` (cache DOM refs) → `MapController.init()` (create Mapbox instance) → `await MapController.waitReady()` (wait for tiles) → enable interaction → show UI → optionally fire `window.__uncoverSetup()` for embed hosts. If any step fails silently, the app hangs.

The package needs to expose this as clean lifecycle hooks (e.g. `onReady`, `onError`) so consumers can handle failure without inspecting internals.

### 1.6 Embed-mode handling is scattered across HTML, CSS, and JS

The embed mode (`?embed=1&host=valueadd`) is not isolated to one file — it's split across:

- `index.html` inline script (sets `data-embed="1"`)
- `index.html` inline CSS (hides dev tools and language toggle)
- `index.html` inline postMessage handler (listens for `gktk-set-chromeless`)
- `index.html` setup-cover script (waits 3s, fires `gktk-map-ready`)
- `value-add-tour.js` (cross-origin tour iframe)
- Many CSS rules in `css/styles.css` keyed off `[data-embed="1"]`

For the package to handle embed mode cleanly, all of this needs to be consolidated into the package as opt-in behavior controlled by options (e.g. `embed: { host: 'valueadd', chromeless: false }`).

### Net assessment

The boundary IS clean. The work IS achievable. But the colleague's plan estimated this as a single-PR extraction with the bulk of the effort being "define `mountMap`." The reality: it's a multi-stage refactor of how state, DOM access, init sequencing, and embed mode are organized. Probably 5–7 PRs over 2–4 weeks of focused work, depending on how many sessions per week.

---

## 2. The four open decisions from Section 11 (with my recommendation per each)

These are blockers per the strategy doc.

### Decision 1: Distribution mechanism

| Option | Pros | Cons |
|---|---|---|
| **Git-tag dependency** (recommended) | No new infra. Repos stay independent. value-add-prototype's `package.json` points at `github:moreharvest/interactive-map-prototype#map-core-v1.0.0`. | Requires public repo OR a deploy key for value-add-prototype's CI. The map-prototype repo is private — see note below. |
| Private npm registry / GitHub Packages | Clean semver. Standard npm workflow. | Setup overhead (auth tokens, registry config). |
| pnpm workspace (monorepo) | Easy local linking. | **Rejected** — re-creates the abandoned coupling. |

**Note about the git-tag option:** the map-prototype repo is `moreharvest/interactive-map-prototype` and presumed private. value-add-prototype's CI (Vercel) would need a GitHub access token to pull from a private repo. Solvable (Vercel supports GitHub auth tokens as env vars) but worth knowing upfront.

**My recommendation: git-tag dependency.** Lowest infra cost, fastest to start, no new tooling. If versioning gets busy later we can promote to a registry.

### Decision 2: Package boundary

The audit's proposed boundary (see Section 13 of the audit, summarized below):

**Goes in `@moreharvest/map-core` (the package):**
- All of `js/map/*` (map rendering, markers, camera, animations)
- Most of `js/ui/*` (panel, gallery, evidence preview, charts, data layers) — but NOT `value-add-tour.js` and NOT the inspector dashboard (see below)
- `js/app.js` (step progression state machine)
- `js/step-handlers.js` (per-step rendering)
- `js/data/*` (step definitions, properties, regions, etc.)
- `js/shared/*` (utilities)
- `js/i18n/*` (localization)
- `css/styles.css` and `css/embed-mobile.css`
- Map data assets (`landmarks.json`, `regions.json`, `layers.json`, KML files, image assets)

**Stays in the standalone app shell:**
- `index.html` (the standalone HTML page)
- `js/main.js` (standalone entry point)
- `js/ui/value-add-tour.js` (a product feature for tour playback — but this is debatable, see below)
- The language toggle button (`#lang-toggle` and its handler)
- `js/dev/*` (dev tools — already excluded from production builds)
- Any restart button / "explore mode" UI that's standalone-specific

**Ambiguous (needs your decision):**
1. **`value-add-tour.js`** — this is the tap-to-open-3D-tour behavior on the Ozu-1 property. The strategy doc assumes it stays in the standalone shell, but value-add-prototype's slideshow ALSO uses this exact behavior (on slide 11/12). If we leave it out of the package, value-add-prototype's slideshow loses the tour-launch capability. **Recommendation: include it in the package, configurable via `tourUrl: string | null` option.** Pass `null` to disable.

2. **`inspector.js` (property inspector dashboard)** — is this a standalone-only feature, or does the slideshow's embedded map also use it? If the latter, include in package. If the former, exclude. **I'd need to check value-add-prototype's slides 11/12 behavior to confirm.** Best default: include it; consumer can opt out via config if not needed.

3. **The "AI chat" feature** (`js/ui/ai-chat.js` — if present) — likely standalone-only. Confirm before extraction.

### Decision 3: Extraction owner & timing

Me. Now is fine — but be aware:

- The current `pnpm sync` script (merged today) keeps working throughout the extraction. We never break the existing workflow.
- The extraction happens in 5 stages (see Section 3 below). Each stage is its own PR. After each merged PR, the standalone map still works AND `pnpm sync` still works AND the slideshow keeps embedding the synced output.
- Stage 5 (the cutover) is the only stage where the slideshow stops using `pnpm sync` and starts using the package directly. That's the highest-risk stage and gets the most testing.
- Total estimate: 2–4 weeks of focused work (assuming a few hours per session, a few sessions per week). Could be faster if Claude is doing most of the heavy lifting.

### Decision 4: Acceptance test for offline behavior

The strategy doc says "embeds verified in airplane mode" is the gate for stages 3–4. I agree.

**Concrete test:**
- Open value-add-prototype on iPad. Confirm slides 6, 7, 11, 12 render the map fully.
- Turn iPad to airplane mode (or disable wi-fi).
- Reload value-add-prototype.
- Navigate to slides 6, 7, 11, 12 again. Map should still render fully (all tiles, all markers, all data). No grey gaps where Mapbox tiles failed to load.
- Tap the Ozu-1 marker on slide 11/12. The tour iframe will fail (it's an external URL, requires network). That's expected — the map itself must still work offline.

This test must pass before merging stage 3 and stage 4.

---

## 3. The five stages (each is its own PR)

### Stage 1: Refactor state from singletons to instance-scoped

**Goal:** every place that does `MapController.state.x = ...` becomes `instance.mapState.x = ...`. Same for UI and App state.

**Files touched:** `js/map/state.js`, `js/map/*.js`, `js/ui/state.js`, `js/ui/*.js`, `js/app.js`, `js/step-handlers.js`, `js/main.js`.

**No new files. No new packages. Just internal refactoring.**

**Acceptance test:** Standalone `pnpm dev` boots, full journey from step 1 to last step works exactly as before. `pnpm sync` runs and value-add-prototype slides 6/7/11/12 still work. **No behavior change visible.**

**Estimated effort:** 1–2 sessions. Largest risk area: ensuring no module-scoped side effects were missed.

### Stage 2: Replace `document.querySelector` with target-scoped queries

**Goal:** all DOM queries in `js/ui/*.js` and `js/step-handlers.js` use `instance.root.querySelector()` instead of `document.querySelector()`. Overlays (panel, gallery, etc.) become children of `instance.root` instead of `document.body`.

**Files touched:** `js/ui/*.js`, `js/step-handlers.js`, `index.html` (move some elements out of `<body>` and into `#app-container`).

**Acceptance test:** Same as Stage 1. Plus a verification that you can mount the map into a non-default container and overlays render relative to it.

**Estimated effort:** 1–2 sessions. Trickiest part: dynamically-created elements that get appended to `document.body` need to be appended to the target container instead.

### Stage 3: Define and expose the `mountMap` API; extract the package boundary

**Goal:** Create the file structure for the package. Define `mountMap(targetEl, options) → { destroy() }`. Make `js/main.js` (the standalone entry) call `mountMap` instead of running init directly.

**Files touched:** Net new — `packages/map-core/src/index.js` exports `mountMap`. Vite config updated to support library mode build alongside the existing app build. `js/main.js` becomes ~10 lines that import `mountMap` and call it.

**Options exposed by `mountMap`:**
```js
mountMap(targetEl, {
  mapboxToken: 'pk.eyJ...',        // optional; falls back to window.__GKTK_MAPBOX_ACCESS_TOKEN or URL param
  scenes: ['government-support', 'corporate-investment', 'transport-access'],  // optional; defaults to all
  startStep: 1,                     // optional; defaults to welcome screen
  lang: 'en',                       // 'en' | 'zh-TW'
  theme: 'translucent-macos',       // 'translucent-macos' | 'flat-ipad' | 'default'
  embedHost: null,                  // null | 'valueadd' — enables host-specific postMessage contract
  tourUrl: 'https://3d-vertical-test.vercel.app/value-add-journey.html',  // tour iframe URL; pass null to disable
  onReady: () => {},                // called when map is fully initialized
  onComplete: () => {},             // called when user finishes the journey
  onError: (err) => {},             // called on init failure
});
```

**Acceptance test:** Standalone app still works (it's now consuming its own core). `pnpm sync` still works (the bundle now includes the `mountMap` export). value-add-prototype unchanged.

**Estimated effort:** 1–2 sessions.

### Stage 4: Tag the first version; consume in value-add-prototype on ONE embed slot first

**Goal:** Tag `map-prototype` at `map-core-v1.0.0`. In value-add-prototype, install it as a git-tag dependency. Replace the **step-12 embed only** (the property hardware step) with the package + a thin React wrapper that calls `mountMap`.

**Files touched (in value-add-prototype):**
- `package.json` — add `"@moreharvest/map-core": "github:moreharvest/interactive-map-prototype#map-core-v1.0.0"`
- `src/components/shared/PropertyMapHost.tsx` — call `mountMap` from a `useEffect` instead of mounting the static iframe
- `public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/` — remove (no longer needed, package replaces it)

**Files touched (in map-prototype):**
- Tag created on master: `map-core-v1.0.0`
- No source changes

**Acceptance test:**
- Slide 12 in value-add-prototype renders the map (loaded via package, not iframe).
- All map behaviors work: marker tap, scene transitions, tour launch from Ozu-1.
- **Airplane mode test passes** for slide 12.
- Slide 6 (still using `pnpm sync` snapshot) still works unchanged.
- The `embed-mobile-overrides.css` for step-12 is no longer needed (theme arg handles it).

**Estimated effort:** 1 session.

### Stage 5: Switch the second embed slot; retire the sync script

**Goal:** Replace the step-6 embed with the package too (using `theme: 'translucent-macos'`). Once both embed slots use the package, delete `scripts/sync-to-slideshow.js`, the `pnpm sync` script in `package.json`, and the two `map-prototype-v1/` folders in value-add-prototype's `public/`.

**Files touched (in value-add-prototype):**
- `src/components/shared/MapHost.tsx` — call `mountMap` from `useEffect`
- `public/playground/prototypes/step-6-section-3-map/map-prototype-v1/` — remove
- `package.json` — update dependency tag if any map-core changes are needed

**Files touched (in map-prototype):**
- `scripts/sync-to-slideshow.js` — delete
- `package.json` — remove `sync` and `sync:dry` scripts
- `docs/architecture-and-sync-workflow.md` — rewrite for the new package-based architecture
- `CLAUDE.md` — update the feature-branch scope rule

**Acceptance test:**
- All four slides (6, 7, 11, 12) work in value-add-prototype.
- **Airplane mode test passes for all four.**
- Standalone map still works.
- No mention of `pnpm sync` anywhere in either repo.
- Architecture doc reflects the package model.

**Estimated effort:** 1–2 sessions.

---

## 4. What does NOT change (preserved from current state)

- Three independent projects (`map-prototype`, `value-add-prototype`, `3d-vertical-test`). None merged, none archived.
- Daily editing workflow for `map-prototype` — `pnpm dev` here, edit, push, deploy. Same as today.
- The 3D tour iframe stays cross-origin (`3d-vertical-test` unchanged).
- The offline guarantee for investor pitches (preserved by build-time bundling, just like today).
- The per-embed styling differences (now expressed as `theme` arg instead of CSS overlay file).
- Your `/feature` and `/feature finish` workflows.

---

## 5. Risks identified during the audit

| Risk | Mitigation |
|---|---|
| **Module-scoped state refactor (Stage 1) introduces subtle bugs** — singletons that get accessed from multiple modules might miss being instance-scoped. | Do Stage 1 first as its own PR with no other changes. Test thoroughly before moving on. Use search-based audits to find all references. |
| **External libraries via window globals create a runtime contract that's easy to forget** — if a consumer doesn't load Mapbox before `mountMap`, you get a confusing error. | The package checks `window.mapboxgl` at init and throws a clear error: "`mountMap` requires Mapbox GL JS to be loaded. Add `<script src='...'>` to your HTML before calling `mountMap`." |
| **Vite library mode + app mode coexistence may need workarounds** — the strip-dev-only plugin and the HTML entry might conflict with library builds. | Stage 3 prototypes this first; if Vite can't handle both cleanly, we use a separate build config (`vite.config.lib.js`) or split into a workspace at that point. |
| **The tour iframe behavior is shared between map-prototype and value-add-prototype** — if it stays only in the standalone shell, the slideshow's embedded map can't launch it. | Include it in the package, configurable via `tourUrl` option. See Decision 2 ambiguity #1. |
| **First package version may be unstable** — early consumers (value-add-prototype's step-12 embed) might hit API issues. | Stage 4 deliberately migrates ONE embed first. Step-6 stays on the old sync until step-12 is proven. |
| **Vercel CI for value-add-prototype needs auth to pull the private map-prototype repo** — git-tag dependency from a private repo requires a GitHub access token. | Set up the token before Stage 4. Vercel docs cover this; it's a 5-minute setup. |

---

## 6. What I need from you (the product owner) before I start Stage 1

Answer the open decisions in Section 2 above. Specifically:

1. **Distribution mechanism:** confirm "git-tag dependency" (recommended)? Or do you want private registry?
2. **Package boundary:** confirm the proposed boundary in Section 2, Decision 2? Specifically the ambiguous items:
   - `value-add-tour.js` → include in package (recommended) or exclude?
   - `inspector.js` → include in package (recommended) or exclude?
   - Anything else you want explicitly in or out?
3. **Extraction owner & timing:** "me, now" — confirm I should start as soon as the open decisions are answered?
4. **Acceptance test:** confirm the airplane-mode-on-iPad test as the gate for Stages 4 and 5?

Once you answer those four, I start Stage 1.

---

## 7. Working with the strategy doc

This execution plan and the strategy doc at [`map-core-package-extraction-plan.md`](map-core-package-extraction-plan.md) are designed to be read together:

- The strategy doc explains **why** this approach (versus monorepo, copy-script, etc.) and **what** the end state looks like.
- This execution plan explains **how** to get there given the actual codebase, and **what could go wrong**.

If anything in this execution plan contradicts the strategy doc, this plan wins (because it's grounded in the audit). If anything in the strategy doc is missing from this plan, surface it as a comment.

---

## 8. After Stage 5: ongoing daily workflow

Once the extraction is complete:

- Edit `map-prototype` → use `/feature` + `/feature finish` as today. The deploy of the standalone map URL is unchanged.
- Need value-add-prototype to pick up a map change? Run a script (`pnpm tag-and-publish` or similar) that creates a new git tag (`map-core-v1.4.0`). Then in value-add-prototype, bump the dependency in `package.json`, `pnpm install`, push. Vercel rebuilds the deck with the new map.
- Edit `value-add-prototype` (slideshow shell, not the map) → use `/feature` + `/feature finish` over there. Same as today.
- Edit `3d-vertical-test` → push. Tour deploys. Map (in both contexts) sees it on next load. Same as today.

The Part 2 idea from earlier (auto-orchestrate value-add-prototype's `/feature finish` from inside `map-prototype`'s `/feature finish`) is even simpler under the package model — the propagation step is just a dependency bump, not a sync. We can revisit that automation after Stage 5 ships if it's still useful.
