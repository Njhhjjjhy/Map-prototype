# Architecture and package workflow

> This is the canonical document for how `map-prototype`, `value-add-prototype`, and `3d-vertical-test` fit together as a single product. It supersedes the older `docs/value-add-prototype-relationship.md` (which now redirects here) and the rejected merger plan in `docs/abandoned/`.
>
> **Status (2026-05-20):** Sections 4 and 5 describe the **target state** — the `mountMap()` package consumption model. That migration is **incomplete**. Today, `value-add-prototype` still iframes a committed static snapshot of this project's Vite build under `public/playground/prototypes/.../map-prototype-v1/`, and `MapHost.tsx` / `PropertyMapHost.tsx` do not call `mountMap()`. The `pnpm sync` automation that used to refresh those snapshots was retired in Stage 5; refresh is now a manual rebuild + copy step until the package migration resumes. See [`CLAUDE.md`](../CLAUDE.md) for the current-state summary and [`docs/for-riaan.md`](for-riaan.md) for the full plan.

## 1. The three projects

| Project | Folder | Repo | Vercel deploy | Role |
|---|---|---|---|---|
| **map-prototype** (this project) | `/Users/riaan/Documents/Design Files/Code Projects/map-prototype` | `moreharvest/interactive-map-prototype` | Standalone map URL | Interactive Kumamoto map. Vanilla JS + Mapbox GL JS. Edited daily. Also publishes the `@moreharvest/map-core` package. |
| **value-add-prototype** | `/Users/riaan/Documents/Design Files/Code Projects/value-add-prototype` | (private) | value-add-prototype URL | Investor pitch project. Next.js + React. 22 steps. Edited weekly. Consumes `@moreharvest/map-core`. |
| **3d-vertical-test** | (separate folder) | (separate repo) | `https://3d-vertical-test.vercel.app` | Three.js property tour of Ozu-1. Edited daily. |

All three are **active, independent projects**. None is being merged into another. None is being archived. Each has its own git history, its own Vercel deploy, its own daily life. They cooperate at runtime through a package import (map-prototype → value-add-prototype) and a cross-origin iframe (map → 3d-vertical-test).

## 2. The runtime arrangement (what the user sees)

```
┌──────────────────────────────────────────────────────────────┐
│  value-add-prototype.vercel.app  (on iPad)                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Slide 6, 7, 11, or 12: <div> hosting @moreharvest/    │  │
│  │  map-core, mounted via mountMap() in the same page.    │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Map (canvas + overlays, same-document)          │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  On slide 11/12: tap Ozu-1 marker          │  │  │  │
│  │  │  │  iframes 3d-vertical-test.vercel.app       │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  3D property tour (five scenes)      │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

Two layers, not three: the map lives in the same DOM as the value-add-prototype shell (no iframe between them), and the 3D tour is the only remaining cross-origin iframe.

## 3. Where the map and tour come from (build-time vs run-time)

| Embed | Mechanism | Why |
|---|---|---|
| value-add-prototype → Map | **`pnpm` dependency** on `@moreharvest/map-core` (currently a local `link:../map-prototype` for development; switches to a git-tag dep for CI/Vercel). The package's built artifacts get bundled into value-add-prototype's Next.js output, so investor pitches keep working offline. | Investor pitches happen in meeting rooms with unreliable wi-fi. Bundling the package at build time gives the same offline guarantee the old snapshot approach gave, without the manual sync. |
| Map → Tour | **Live cross-origin iframe** of `https://3d-vertical-test.vercel.app/value-add-journey.html` | The tour is rarely the centerpiece of a pitch and is short; an iframe loading a few seconds is acceptable. Avoiding a build-time copy means edits to the tour appear instantly without any sync step. |

Both choices are deliberate. Do not change them without revisiting the trade-offs above.

## 4. The two map-host components inside value-add-prototype

The slideshow mounts the map at two distinct host components, one per context:

- `value-add-prototype/src/components/shared/MapHost.tsx` — used on slides 6 and 7. Calls `mountMap()` with `scenes: ['government-support', 'corporate-investment', 'transport-access']`. Wraps the mount in a 3D-transformed scene for the descent animation between step 6 and step 7.
- `value-add-prototype/src/components/shared/PropertyMapHost.tsx` — used on slides 11 and 12. Calls `mountMap()` with `scenes: ['properties']` and `properties: ['ozu-1']`. Starts with `chromeless: true` so the sheet UI slides up when the user lands on step 12.

Both components dynamically import `mapbox-gl`, `chart.js/auto`, and `@moreharvest/map-core`, wire the first two as `window.mapboxgl` and `window.Chart` (the package's bare-global contract), then call `mountMap()` on a `<div>` ref.

There is no longer a separate per-embed CSS override file. The two contexts differ only in their `mountMap` options.

## 5. The workflow

When you change the map and want value-add-prototype to pick up the new version:

1. **Edit the map** in this project. Use `pnpm dev` here to verify in standalone view.
2. **No build step.** In development, value-add-prototype's `node_modules/@moreharvest/map-core` is a symlink (`link:../map-prototype`) back to this project, so source changes are picked up by the Next.js dev server live.
3. **Test inside value-add-prototype.** `cd ../value-add-prototype`, `pnpm dev`, and navigate to slides 6, 7, 11, or 12. Visually verify the change. On slide 11 or 12, tap the Ozu-1 marker and confirm the 3D tour launches.
4. **Commit in this project.** Push to map-prototype's git. The standalone map's Vercel deploys.
5. **Commit in value-add-prototype if its lockfile changed.** When the dep moves from `link:` to a real version (git-tag or published), bumping the version in value-add-prototype's `package.json` and `pnpm install` are how changes propagate to its Vercel build. While the dep is still `link:`, value-add-prototype only needs a re-deploy if its own code changed.

The old `pnpm sync` step is gone. There are no more snapshot folders, no more per-embed overrides to preserve, no separate copy in value-add-prototype's `public/`.

## 6. Daily workflow examples

### Scenario A: you change a marker color in the map

1. Edit the relevant file in this project's `js/` or `css/`.
2. `pnpm dev` here to verify the change in standalone view.
3. `cd ../value-add-prototype`, `pnpm dev`, click slide 6 to verify in the slideshow context.
4. Commit + push in map-prototype. Standalone Vercel deploys.
5. If value-add-prototype's Vercel needs the change: bump the dep version, commit + push there too.

### Scenario B: you change a tour scene

1. Edit the relevant file in 3d-vertical-test.
2. Push 3d-vertical-test. Vercel auto-deploys.
3. **Nothing else to do.** The map (and value-add-prototype) see the new tour on next load — no sync, no rebuild needed.

### Scenario C: you change something in value-add-prototype itself (not the embedded map)

1. Edit the relevant file in value-add-prototype.
2. `pnpm dev` there to verify.
3. Commit + push in value-add-prototype. Vercel deploys.
4. **Nothing happens to map-prototype.** value-add-prototype-only changes do not flow back to the standalone map.

### Scenario D: you need slide-6 and slide-12 to differ visually beyond what mountMap options expose

1. Add a new option to `mountMap` in this project (and to `js/map-core/options.js`).
2. Update the consumer in value-add-prototype (`MapHost.tsx` or `PropertyMapHost.tsx`) to pass it.
3. There is no per-embed override CSS file anymore — all per-context differences must go through `mountMap` options. This is intentional; it prevents drift between the standalone map and the embedded map.

## 7. What about value-add-prototype's own design system?

value-add-prototype has its own design tokens, components, and visual identity (see `value-add-prototype/docs/visual-identity.md`). Those govern everything **around** the embedded map mount — the React shell, the navigation, the non-map slides, the PDF.

The map's design system (in this project's `docs/` and `CLAUDE.md`) governs everything **inside** the map mount.

Because the map now lives in the same document as the value-add-prototype shell, the map's CSS is loaded into the consumer page. `mountMap` writes scoping attributes (`data-embed`, `data-embed-host`) to `<html>` so the map's selectors apply only where intended; the package's global selectors (`body`, `button`, etc.) are scoped under those attributes wherever they could otherwise leak. If you see styling bleed between the slideshow shell and the map, that is the contract being broken — patch it in the package, not in the consumer.

## 8. Why three projects instead of one monorepo

On 2026-05-19 a plan was drafted to absorb all three projects into one monorepo (see `docs/abandoned/`). It was abandoned the same day because:

- The product owner edits map-prototype and 3d-vertical-test **every day** as primary projects, not as snapshot prototypes.
- Absorbing them would force every daily edit through value-add-prototype's heavier (Next.js) toolchain.
- Each project has its own deploy lifecycle, its own audience (the standalone map URL is used in non-pitch contexts), and its own iteration speed.

The right shape was: keep three projects, ship the map as a package that value-add-prototype installs. That is what `@moreharvest/map-core` does. The cross-origin tour iframe was already automatic and needed no change.

Read `docs/abandoned/README.md` before re-proposing any merger.

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| value-add-prototype's `pnpm install` fails on `@moreharvest/map-core` | The `link:../map-prototype` path doesn't resolve | Confirm map-prototype is a sibling folder. For CI / Vercel, switch the dep to a git-tag URL with a deploy token. |
| Slide 6 or 7 shows a blank map area | `mountMap` threw or never resolved. Check the browser console for the `[map-core]` warning or a Mapbox token error. | Make sure `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set in value-add-prototype's `.env.local`. |
| Slide 12 shows multiple property markers, not just Ozu-1 | The `properties` option was not passed to `mountMap`, OR a stale module-load IIFE ran before `setProperties` was called. | Verify `PropertyMapHost.tsx` passes `properties: ['ozu-1']` to `mountMap`. |
| Map styles bleed into the slideshow shell (or vice versa) | A global selector in the package's CSS isn't scoped under `[data-embed]`. | Patch the package's `css/styles.css` to scope the selector, then bump the dep version. |
| Mapbox tiles fail to load in airplane-mode test | Mapbox tiles require network unless they were pre-cached. | This was a known limitation of the iframe approach too. The fix path is: vector-tile bundling in the package; out of scope for Stage 5. |
| The 3D tour stopped loading inside the map | 3d-vertical-test's Vercel deploy is broken, or the user is offline | Open `https://3d-vertical-test.vercel.app/value-add-journey.html` directly to check; reconnect if offline |

## 10. Files of interest

- [`js/map-core.js`](../js/map-core.js) — the `mountMap` entry point and the destroy lifecycle
- [`js/map-core/options.js`](../js/map-core/options.js) — option resolution with URL-param fallbacks for the standalone shell
- [`js/map-core/scaffold.js`](../js/map-core/scaffold.js) — DOM injected when mounting into an empty container
- [`js/map-core/embed-valueadd.js`](../js/map-core/embed-valueadd.js) — the value-add-prototype host helper (postMessage contract, click intercepts on first/last step)
- [`package.json`](../package.json) — package exports and peer-dep contract
- [`CLAUDE.md`](../CLAUDE.md) — top-level rules for this project; "How this repo relates to value-add-prototype" section is the short version of this doc
- [`docs/plans/map-core-extraction-execution-plan.md`](plans/map-core-extraction-execution-plan.md) — the full extraction plan, stages 1–5
- [`docs/abandoned/`](abandoned/) — the rejected merger plan
