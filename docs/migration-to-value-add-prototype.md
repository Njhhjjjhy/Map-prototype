# Migration plan: map-prototype into value-add-prototype

## Status

- **Author:** Claude (in map-prototype), 2026-05-19
- **Target executor:** Claude (in value-add-prototype), using `value-add-prototype-migration-prompt.md` at the root of this repo
- **State:** Plan only. No source has moved yet. Both repos are still independent.
- **Estimated effort:** 1–2 Claude sessions. The work is mechanical (copy files, wire scripts, verify) — not a rewrite. Most of the elapsed time is the user manually clicking through slides 6, 7, 11, 12 after each phase to confirm nothing broke.

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

The source repo for this Vercel deploy is unknown to Claude in this project. The handoff prompt instructs Claude in value-add-prototype to discover it in this order, stopping at the first hit:

1. **Check Vercel.** Every Vercel project links back to its source repo on its Settings → Git page. Have the user open the `3d-vertical-test` project in Vercel and read the linked GitHub repo URL.
2. **Search the user's local machine.** `find ~/Documents -type d -name "*3d*" -o -name "*vertical*" -o -name "*tour*" -o -name "*journey*"` (then filter for ones that look like real source directories).
3. **Ask the user directly.** Maybe they remember where it lives.
4. **Last resort: mirror the deployed assets.** Use a headless browser (not `wget` alone — three.js dynamic imports often defeat `wget`) to capture every network request the deployed page makes, then download each asset to `embedded-apps/value-add-journey/` at the same relative path. The user can do this manually with DevTools → Network panel if needed.

If only the mirrored assets are available (no source repo), `embedded-apps/value-add-journey/` becomes the new source of truth even though it contains minified/bundled output. The user accepts this trade-off in exchange for not having to track down the original repo.

### iPad-OS work

Recent map-prototype work added iPad-OS HIG compliance: viewport-fit, dvh units, touch-action, overscroll-behavior, swipe-to-advance, HIG keyboard parity, rotate-to-landscape overlay, pointer-event marker tooltips, widened right panel to ~400pt Apple Maps reference, and pointer-event hover patterns.

These behaviors are **internal to the map** and travel with the source — no extra work to "preserve" them. The handoff prompt also instructs Claude in value-add-prototype to read this repo's `docs/ipad-research/` and `docs/plans/tablet-adaptation-plan.md`, then audit the slideshow itself against the same HIG patterns where they make sense (viewport-fit, dvh, touch-action, swipe-to-advance, rotate overlay). value-add-prototype's `CLAUDE.md` is already iPad-first; this is a check, not a rewrite.

## Build pipeline design

After migration, value-add-prototype's `package.json` gets these scripts. The `build:tour` script has two variants — pick one based on whether the 3D tour has its own build step. Do not use the `|| true` fallback pattern; silent failures hide bugs.

**Variant A — 3D tour is a static folder of HTML + assets (no build step):**

```jsonc
{
  "scripts": {
    "build:map": "cd embedded-apps/map && pnpm install --frozen-lockfile && pnpm build && cd ../.. && node scripts/copy-map-dist.js",
    "build:tour": "node scripts/copy-tour-dist.js",
    "build:embedded": "pnpm run build:map && pnpm run build:tour",
    "verify:embedded": "node scripts/verify-embedded.js",
    "build": "pnpm run build:embedded && next build",
    "dev": "pnpm run build:embedded && next dev"
  }
}
```

**Variant B — 3D tour has its own `pnpm build` step (e.g. Vite, Webpack):**

```jsonc
{
  "scripts": {
    "build:map": "cd embedded-apps/map && pnpm install --frozen-lockfile && pnpm build && cd ../.. && node scripts/copy-map-dist.js",
    "build:tour": "cd embedded-apps/value-add-journey && pnpm install --frozen-lockfile && pnpm build && cd ../.. && node scripts/copy-tour-dist.js",
    "build:embedded": "pnpm run build:map && pnpm run build:tour",
    "verify:embedded": "node scripts/verify-embedded.js",
    "build": "pnpm run build:embedded && next build",
    "dev": "pnpm run build:embedded && next dev"
  }
}
```

The three `scripts/*.js` helpers:

- `copy-map-dist.js` (~20 lines) — wipes both `public/playground/prototypes/.../map-prototype-v1/` folders and copies `embedded-apps/map/dist/` into each.
- `copy-tour-dist.js` (~20 lines) — wipes `public/tours/ozu-1/` and copies the tour build output (or static folder) into it.
- `verify-embedded.js` (~30 lines, optional but recommended) — boots the dev server briefly, hits the four embed entry points (`/playground/prototypes/step-6-section-3-map/map-prototype-v1/index.html`, the step-12 path, `/tours/ozu-1/index.html`, and at least one slide URL), and reports HTTP 200 vs anything else. A one-command smoke test the user can run before pushing.

Vercel runs `pnpm build`, which runs `build:embedded` first, which builds both sub-apps and stages their output into `public/` so Next.js picks them up.

**Vercel build memory note:** Vercel's Hobby (free) tier caps build memory at 8GB. A clean install + map build (Vite) + tour build (if Variant B) + Next.js build all in one go can approach this on a large project. If Vercel builds start failing with OOM errors, the fix is either (a) upgrade Vercel plan, or (b) pre-build the embedded apps locally and commit `public/` outputs (defeats half the migration's value). Do not pre-emptively optimize for this; fix it only if it actually breaks.

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
11. **Vercel preview deploy** of the migration PR loads on the deployed preview URL (not just localhost) and slides 6, 7, 11, 12 plus the Ozu-1 tour all work **on a real iPad device** (the primary target). Localhost-on-laptop verification is necessary but not sufficient — Vercel can behave differently (env vars, build cache, routing), and iPad Safari behaves differently from desktop Chrome.
12. The three "I won't forget" automations (see "Maintenance and automation" below) are in place: pre-commit safety net, CLAUDE.md verification rule, Vercel preview deploys enabled.

## Rollback plan

If migration breaks slides 6, 7, 11, 12 and Claude in value-add-prototype cannot fix it within one session:

1. Revert the migration PR in value-add-prototype (one click on GitHub).
2. The hand-copied `map-prototype-v1/` folders inside `public/playground/prototypes/` remain in place from before the migration — slides 6, 7, 11, 12 keep working off those.
3. This repo (`map-prototype`) is unarchived and becomes the source of truth again.
4. Open a Linear/issue ticket describing what broke; retry the migration after fixing.

The migration PR is therefore atomic: either everything lands or everything reverts. Do not partially merge.

## Known gotchas for the value-add-prototype Claude

- **Mapbox token must be present BEFORE Phase 3.** The iframe reads its token from `window.__GKTK_MAPBOX_ACCESS_TOKEN`, which `MapHost.tsx` sets from `process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`. If `value-add-prototype/.env.local` does not have this variable set, the map silently fails to render its base layer — only labels show. Action: before Phase 3, run `grep NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN .env.local`. If empty, ask the user for the token (it lives in `map-prototype/.env.local` if they've used the standalone dev server, or in their Mapbox account dashboard).
- **Dev-only block stripping.** The map's `vite.config.js` has a custom plugin that strips `<!-- DEV-ONLY-START -->...<!-- DEV-ONLY-END -->` blocks at production build time. Do not modify or remove this plugin during migration — the embed mode rules in `index.html` depend on it.
- **The `?embed=1&host=valueadd` URL contract.** The slideshow's React wrappers pass this query string. The map keys CSS rules and JS behaviors off `data-embed-host="valueadd"`. Do not rename the query param or the data attribute.
- **postMessage event names.** The map emits `gktk-map-ready`, `gktk-map-complete`, and listens for `gktk-set-chromeless`. The slideshow wrappers (`MapHost.tsx`, `PropertyMapHost.tsx`) subscribe to those exact names. Do not rename.
- **3D tour postMessage.** Today the tour emits `{ type: 'journeyComplete' }` cross-origin to its parent. After migration, the tour and map are same-origin. The map's `value-add-tour.js` should still listen for the same event — just relax or update the origin check to accept the same-origin case. Do not remove the origin check entirely.
- **No close button on the tour.** Per the original tour brief: no X, no skip, no Esc, no swipe-to-dismiss. The user must navigate forward through all 5 scenes. Carry this rule forward.
- **The PropertyMapHost iframe filters to Ozu-1 only.** This is enforced inside the map by the URL params and recent commit `0ec693a Move Tour CTA off dashboard onto map, hide all non-Ozu-1 properties in Step 10`. Verify that filter still works after migration.
- **Sub-lockfile is the default.** Keep each embedded sub-app's own `pnpm-lock.yaml` inside `embedded-apps/<sub>/`. Do not introduce a pnpm workspace at the repo root — that's added complexity for no real win on a one-developer project, and it forces the sub-apps' dependencies to coexist with the slideshow's, which is the opposite of the isolation the iframe boundary gives you.

## Docs migration

### Authority and scope (read first)

The map and the slideshow use **different design languages** by design:

- The map: macOS HIG (the design system documented in this repo's `CLAUDE.md` and `docs/`).
- The slideshow: iPad-first flat design (the design system documented in `value-add-prototype/CLAUDE.md` and `value-add-prototype/docs/visual-identity.md`).

After migration, both sets of docs coexist inside value-add-prototype. To avoid Claude treating both as universal authority, the scope rule is:

> **`value-add-prototype/embedded-apps/map/CLAUDE.md` and `embedded-apps/map/docs/` govern the map's internal UI only — everything that appears inside the iframe.**
>
> **`value-add-prototype/CLAUDE.md` and `value-add-prototype/docs/` govern everything outside the iframe — the slideshow's React shell, the PDF, the playground viewer, and the overall product.**
>
> Where the two systems differ (e.g. one uses #FBB931 amber as primary and the other uses #fbb931 — same color, different token name conventions), each is correct *within its own scope*. Do not "harmonize" them. Do not promote the map's design tokens into the slideshow or vice versa unless the user explicitly asks.

This rule belongs at the top of `embedded-apps/map/CLAUDE.md` after migration, and as a one-line cross-reference in `value-add-prototype/CLAUDE.md`'s "File structure" section.

### File-by-file

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

## Maintenance and automation (the "I'll forget" safety nets)

The migration itself eliminates the worst forgetting problem (keeping three repos in sync). These three additional automations make the post-migration workflow genuinely fire-and-forget. Phase 6 sets all three up.

### 1. CLAUDE.md verification rule (forces Claude to test before declaring done)

Add this to `value-add-prototype/CLAUDE.md` under "Process rules":

> **Map and tour verification.** Before declaring any task that touched `embedded-apps/map/`, `embedded-apps/value-add-journey/`, `scripts/copy-*.js`, or the React wrappers (`MapHost.tsx`, `PropertyMapHost.tsx`) complete, you must:
>
> 1. Run `pnpm run build:embedded` and confirm it exits 0.
> 2. Run `pnpm dev` and manually click through slides 6, 7, 11, 12.
> 3. On slide 11 or 12, tap the Ozu-1 marker and verify the tour mounts, plays at least the first scene, and returns to the map after you click through to the end.
> 4. Confirm no red errors in the browser console.
>
> If any of these fail, do not report the task complete. Fix or report the blocker.

This makes Claude remember for you. You never have to manually ask "did you test it?"

### 2. Pre-commit safety net (cannot ship broken builds)

Add `simple-git-hooks` (or `husky`) to `value-add-prototype/devDependencies` and configure a pre-commit hook:

```bash
pnpm run build:embedded && pnpm exec tsc --noEmit
```

If the embedded build fails, or TypeScript has errors, the commit refuses. The user cannot accidentally commit a state where the map won't build. Setup is ~5 minutes, then invisible forever.

### 3. Vercel preview deploys (visual proof before merge)

In Vercel project settings, enable "Deploy previews for every branch." Already a default on most plans — confirm it's on. Every PR then gets a unique preview URL. The user clicks it, opens on iPad, confirms the migration didn't break anything visible, then merges.

This catches things localhost can't catch: env var differences, Vercel build cache issues, iPad Safari quirks, network conditions.

### What you still have to remember

Two things. Both are inherently human:

1. **Tell Claude what you want changed.**
2. **Look at the result and confirm it feels right.**

Everything mechanical between those two steps is automated.

---

## What this repo (map-prototype) becomes after migration

- **GitHub:** Archived (read-only). No new commits, no new PRs.
- **Local working copy:** Preserved. The user noted they may want to revisit. The full git history stays accessible by re-cloning.
- **Vercel deploy:** Keep or sunset based on whether the standalone map URL is still linked from anywhere. (Check first; do not delete without confirmation.)
- **`/feature` workflow:** Stops here. From the migration onward, all map feature branches happen in value-add-prototype.

## Note for the value-add-prototype Claude on completion

Once Phase 6 acceptance passes and the user merges the migration PR, save these to value-add-prototype's project memory so future sessions don't have to relearn them:

- **Feedback memory:** "The map source lives at `embedded-apps/map/`. Edit there, never in `public/playground/prototypes/...`. The `public/` copies are regenerated by `pnpm run build:embedded` and will be overwritten on the next build. Same applies to the 3D tour: source in `embedded-apps/value-add-journey/`, build output in `public/tours/ozu-1/`."
- **Project memory:** "Migration from `map-prototype` repo completed [date]. The old repo is archived on GitHub. All map and tour work now happens here."
- **Reference memory:** "Map's internal design system docs live at `embedded-apps/map/docs/`. The slideshow's design system docs live at `docs/`. They are scoped to their respective surfaces and may differ — do not harmonize without explicit user instruction."
