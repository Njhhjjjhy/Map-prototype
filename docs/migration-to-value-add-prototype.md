# Migration plan: map-prototype into value-add-prototype

## Status

- **Author:** Claude (in map-prototype), 2026-05-19
- **Target executor:** Claude (in value-add-prototype), using `value-add-prototype-migration-prompt.md` at the root of this repo
- **State:** Plan only. No source has moved yet. Both repos are still independent.

## Why this migration exists

Today there are two independent git repos that have to be kept in sync by hand:

- `map-prototype` (this repo) — the source of truth for the map.
- `value-add-prototype` — the slideshow that embeds the map's built output in an iframe at slides 6, 7, 11, 12.

Every map change requires: edit here → `pnpm build` → copy `dist/` into two folders inside the other repo → test in the other repo → commit in both. Two repos, two PRs, two deploys, easy to drift. The 3D property tour adds a third repo (separately deployed at `https://3d-vertical-test.vercel.app`) and a cross-origin `postMessage` contract.

After this migration:

- One repo (`value-add-prototype`).
- One source of truth for the map (its source folder, not its built output).
- One source of truth for the 3D tour.
- One Vercel deploy.
- No cross-origin `postMessage` between the map and the 3D tour — they are same-origin.

The map remains an iframe inside the React slideshow. It is **not** being rewritten as a React component. That would be a multi-week port of ~10k lines of vanilla JS, Mapbox imperative API, Chart.js, and step state-machine code, with high regression risk on a presentation already in active use. The iframe boundary stays; only its location moves.

## Target architecture

```
value-add-prototype/                              (one repo)
├── src/                                          Next.js / React (unchanged)
│   ├── components/
│   │   ├── shared/MapHost.tsx                    Existing React wrapper around the map iframe
│   │   └── shared/PropertyMapHost.tsx            Existing React wrapper for steps 11–12
│   └── ...
├── embedded-apps/                                NEW. Source of truth for everything that ships as an iframe.
│   ├── map/                                      Migrated from map-prototype/ (root contents)
│   │   ├── index.html
│   │   ├── css/
│   │   ├── js/
│   │   ├── assets/
│   │   ├── package.json                          Renamed to "@embedded/map" or similar
│   │   ├── vite.config.js
│   │   └── ...
│   └── value-add-journey/                        Migrated from the 3D tour deploy.
│       ├── index.html
│       ├── (three.js scene files, textures, HDRs)
│       └── ...
├── public/
│   ├── playground/prototypes/
│   │   ├── step-6-section-3-map/map-prototype-v1/      Built output of embedded-apps/map (build target, not edited by hand)
│   │   └── step-12-section-6-product-hardware/map-prototype-v1/  Same built output (duplicated for the second embed slot)
│   └── tours/
│       └── ozu-1/                                Built output (or direct copy) of embedded-apps/value-add-journey
├── package.json                                  Adds new scripts:
│                                                   "build:map"     → cd embedded-apps/map && pnpm build, copy dist into both public/ paths
│                                                   "build:tour"    → cd embedded-apps/value-add-journey && pnpm build, copy into public/tours/ozu-1/
│                                                   "build:embedded"→ runs both
│                                                 The existing "build" script runs build:embedded before next build, so Vercel builds everything together.
└── ...
```

Source lives in `embedded-apps/`. Built artifacts live in `public/`. `public/` is overwritten by build scripts and is not hand-edited.

## Why "drop in iframe source" instead of a React port

| Option | Effort | Risk | Wins |
|---|---|---|---|
| **Iframe source (chosen)** | Hours | Low — the iframe already works | Eliminates dual repo. Eliminates cross-origin tour. Keeps a working app intact. |
| Full React port | Weeks | High — Mapbox imperative API, Chart.js, 10k+ JS lines, step state machine, all iPad-OS touch work would need re-implementation in React patterns | Slightly cleaner long-term integration if the slideshow ever needs to read/write map state directly |

The chosen option does not preclude a future React port. If that day comes, the source lives in one place already and can be incrementally rewritten.

## What is being migrated

### From `map-prototype/` (this repo)

| Source | Destination | Notes |
|---|---|---|
| `index.html` | `embedded-apps/map/index.html` | Verbatim. Embed mode (`?embed=1&host=valueadd`) and the dev-only markers stay. |
| `css/` | `embedded-apps/map/css/` | Verbatim. |
| `js/` | `embedded-apps/map/js/` | Verbatim, with ONE edit: `js/ui/value-add-tour.js` — change `TOUR_ORIGIN` from `https://3d-vertical-test.vercel.app` to the empty string (same-origin) and `TOUR_URL` from absolute to `/tours/ozu-1/index.html`. Drop or relax the `event.origin` check accordingly (same-origin = compare to `window.location.origin`). |
| `assets/` | `embedded-apps/map/assets/` | Verbatim. KMLs, placeholder images, map outlines. |
| `package.json` | `embedded-apps/map/package.json` | Rename `"name"` from `map-prototype` to `@embedded/map`. Keep the same Vite version and i18next dep. |
| `pnpm-lock.yaml` | `embedded-apps/map/pnpm-lock.yaml` | Verbatim if the user is OK with a sub-lockfile, otherwise let it regenerate after `pnpm install`. |
| `vite.config.js` | `embedded-apps/map/vite.config.js` | Verbatim. The `stripDevOnly` plugin stays. |
| `landmarks.json`, `layers.json`, `regions.json` | `embedded-apps/map/` | Verbatim. |
| `public/` (Mapbox token bootstrap, if present) | `embedded-apps/map/public/` | Verbatim. |
| `docs/` | Copied **and** referenced. See "Docs migration" below. |
| `CLAUDE.md` | Merged into value-add-prototype's CLAUDE.md as a scoped section, see "Docs migration". The standalone file in `embedded-apps/map/` is kept as a read-only reference. |
| `.env.local` (`VERCEL_OIDC_TOKEN`, Mapbox token if local) | Not migrated. value-add-prototype already has `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in its own env and passes it to the iframe via `window.__GKTK_MAPBOX_ACCESS_TOKEN` (see existing `MapHost.tsx`). |
| `dist/` | Not migrated. Regenerated by the build script. |
| `node_modules/` | Not migrated. Regenerated by `pnpm install`. |
| `showcase/` | Not migrated. Gitignored, per-project. |
| `.handoffs/` | Not migrated. Project-local. |
| Old prompt at root `value-add-journey-map-prototype-prompt.md` | Not migrated. Stale; describes work that is already done. |

### From the 3D tour deploy (`https://3d-vertical-test.vercel.app/value-add-journey.html`)

The source repo for this Vercel deploy is unknown to Claude in this project. The handoff prompt instructs Claude in value-add-prototype to ask the user for the source repo. If the user does not know, Claude is to mirror the live deployed assets (HTML + all JS chunks + textures + HDRs) into `embedded-apps/value-add-journey/` using `wget --mirror` or `curl`, then commit them as the new source of truth.

### iPad-OS work

Recent map-prototype work added iPad-OS HIG compliance: viewport-fit, dvh units, touch-action, overscroll-behavior, swipe-to-advance, HIG keyboard parity, rotate-to-landscape overlay, pointer-event marker tooltips, widened right panel to ~400pt Apple Maps reference, and pointer-event hover patterns.

These behaviors are **internal to the map** and travel with the source — no extra work to "preserve" them. The handoff prompt also instructs Claude in value-add-prototype to read this repo's `docs/ipad-research/` and `docs/plans/tablet-adaptation-plan.md`, then audit the slideshow itself against the same HIG patterns where they make sense (viewport-fit, dvh, touch-action, swipe-to-advance, rotate overlay). value-add-prototype's `CLAUDE.md` is already iPad-first; this is a check, not a rewrite.

## Build pipeline design

After migration, value-add-prototype's `package.json` gets these scripts:

```jsonc
{
  "scripts": {
    "build:map": "cd embedded-apps/map && pnpm install --frozen-lockfile && pnpm build && node ../../scripts/copy-map-dist.js",
    "build:tour": "cd embedded-apps/value-add-journey && (pnpm install --frozen-lockfile || true) && (pnpm build || true) && node ../../scripts/copy-tour-dist.js",
    "build:embedded": "pnpm run build:map && pnpm run build:tour",
    "build": "pnpm run build:embedded && next build",
    "dev": "pnpm run build:embedded && next dev"
  }
}
```

The two `scripts/copy-*.js` helpers (~20 lines each) wipe the target public/ folders and copy the freshly built dist into them. The `build:tour` script is permissive (`|| true`) because the 3D tour may be a static HTML page with no build step — in that case the copy script alone is enough.

Vercel runs `pnpm build`, which runs `build:embedded` first, which builds both sub-apps and stages their output into `public/` so Next.js picks them up. No CI changes needed beyond the new scripts.

## Acceptance criteria

The migration is done when **every one of these is true**, verified manually by the user:

1. `value-add-prototype/embedded-apps/map/` contains the full map source (matches today's `map-prototype/` minus the excluded files).
2. `cd value-add-prototype && pnpm install && pnpm build` succeeds from a clean clone.
3. `value-add-prototype/public/playground/prototypes/step-6-section-3-map/map-prototype-v1/index.html` exists and was produced by the build script (not hand-copied).
4. The same built copy exists at `value-add-prototype/public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/index.html`.
5. `pnpm dev` in value-add-prototype renders slides 6, 7, 11, 12 with the map visible and interactive, no console errors, no missing assets.
6. On slide 11/12, tapping the Ozu-1 marker opens the 3D tour as a full-viewport iframe, the tour plays through all 5 scenes, and tapping forward on the final scene returns the user to the map cleanly (iframe unmounted, body scroll restored).
7. The 3D tour loads from `/tours/ozu-1/index.html` (same-origin), not from `https://3d-vertical-test.vercel.app`. Browser network tab confirms.
8. iPad-OS behaviors inside the embedded map work: tap and swipe step nav, marker tooltip on tap, rotate-to-landscape prompt in portrait on a touch device.
9. `value-add-prototype/CLAUDE.md` references the embedded-apps folder and lists the new scripts. The dual-repo workflow rule in this repo's CLAUDE.md is removed or marked superseded.
10. This repo (`map-prototype`) is archived on GitHub (read-only). Local clone preserved per user's note that they "might want to work on it again."

## Rollback plan

If migration breaks slides 6, 7, 11, 12 and Claude in value-add-prototype cannot fix it within one session:

1. Revert the migration PR in value-add-prototype (one click on GitHub).
2. The hand-copied `map-prototype-v1/` folders inside `public/playground/prototypes/` remain in place from before the migration — slides 6, 7, 11, 12 keep working off those.
3. This repo (`map-prototype`) is unarchived and becomes the source of truth again.
4. Open a Linear/issue ticket describing what broke; retry the migration after fixing.

The migration PR is therefore atomic: either everything lands or everything reverts. Do not partially merge.

## Known gotchas for the value-add-prototype Claude

- **Mapbox token.** The iframe reads its token from `window.__GKTK_MAPBOX_ACCESS_TOKEN`, which `MapHost.tsx` sets from `process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`. Do not break this contract. If the token is missing, the map silently fails to render its base layer — verify it loads in `pnpm dev`.
- **Dev-only block stripping.** The map's `vite.config.js` has a custom plugin that strips `<!-- DEV-ONLY-START -->...<!-- DEV-ONLY-END -->` blocks at production build time. Do not modify or remove this plugin during migration — the embed mode rules in `index.html` depend on it.
- **The `?embed=1&host=valueadd` URL contract.** The slideshow's React wrappers pass this query string. The map keys CSS rules and JS behaviors off `data-embed-host="valueadd"`. Do not rename the query param or the data attribute.
- **postMessage event names.** The map emits `gktk-map-ready`, `gktk-map-complete`, and listens for `gktk-set-chromeless`. The slideshow wrappers (`MapHost.tsx`, `PropertyMapHost.tsx`) subscribe to those exact names. Do not rename.
- **3D tour postMessage.** Today the tour emits `{ type: 'journeyComplete' }` cross-origin to its parent. After migration, the tour and map are same-origin. The map's `value-add-tour.js` should still listen for the same event — just relax or update the origin check to accept the same-origin case. Do not remove the origin check entirely.
- **No close button on the tour.** Per the original tour brief: no X, no skip, no Esc, no swipe-to-dismiss. The user must navigate forward through all 5 scenes. Carry this rule forward.
- **The PropertyMapHost iframe filters to Ozu-1 only.** This is enforced inside the map by the URL params and recent commit `0ec693a Move Tour CTA off dashboard onto map, hide all non-Ozu-1 properties in Step 10`. Verify that filter still works after migration.
- **Sub-lockfile vs root lockfile.** value-add-prototype already uses pnpm. The embedded-apps sub-apps can share the root lockfile via a `pnpm-workspace.yaml`, or keep their own lockfiles. The user's preference is unknown — Claude in value-add-prototype should ask.

## Docs migration

| Source doc (this repo) | Action |
|---|---|
| `CLAUDE.md` (map-prototype design rules) | Copied verbatim to `value-add-prototype/embedded-apps/map/CLAUDE.md`. Marked as scoped: "This file governs the embedded map only. Outside the map, see the root `CLAUDE.md`." A short pointer is added to value-add-prototype's root `CLAUDE.md` explaining the scoping. |
| `docs/value-add-prototype-relationship.md` | Superseded by this migration. Move into `embedded-apps/map/docs/` as historical reference, or delete. Claude in value-add-prototype decides with the user. |
| `docs/design-tokens.md`, `docs/components.md`, `docs/motion.md`, `docs/interaction-patterns.md`, `docs/checklist.md`, `docs/BEATSHEET.md`, `docs/Map prototype spec.md` | Copied to `embedded-apps/map/docs/`. Scoped to the map. |
| `docs/ipad-research/` | Copied to `embedded-apps/map/docs/ipad-research/` AND referenced from value-add-prototype's `docs/ipad-research/` (already exists per its CLAUDE.md). If both repos already have ipad-research notes, merge or cross-reference. |
| `docs/plans/tablet-adaptation-plan.md` | Copied to `embedded-apps/map/docs/plans/`. Cross-referenced from value-add-prototype's `docs/` so slideshow work can benefit. |
| `docs/qa/2026-02-23-ipad-responsive-layout.md` | Copied to `embedded-apps/map/docs/qa/`. |
| `docs/financials/` | Copied to `embedded-apps/map/docs/financials/`. |
| `docs/camera-vocabulary.md` | Copied. |
| `docs/plans/` (rest) | Copied. |
| `docs/qa/` (rest) | Copied. |
| `QA_20260312.md`, `QA_20260312_raw.md` (root) | Copied to `embedded-apps/map/`. |

After migration, the canonical location for all map-related design docs is `value-add-prototype/embedded-apps/map/`. The copies in this repo become stale and reflect a frozen point in time.

## What this repo (map-prototype) becomes after migration

- **GitHub:** Archived (read-only). No new commits, no new PRs.
- **Local working copy:** Preserved. The user noted they may want to revisit. The full git history stays accessible by re-cloning.
- **Vercel deploy:** Keep or sunset based on whether the standalone map URL is still linked from anywhere. (Check first; do not delete without confirmation.)
- **`/feature` workflow:** Stops here. From the migration onward, all map feature branches happen in value-add-prototype.
