# Migration brief — absorb map-prototype into value-add-prototype

You are Claude Code working inside `value-add-prototype`. The product owner (a non-developer) is handing you this prompt at the start of a new session. Read this entire file before touching anything.

## What this is

`map-prototype` is a separate repo whose built output has been hand-copied into this repo's `public/playground/prototypes/` folders so the slideshow can embed it as an iframe on slides 6, 7, 11, 12. A separate Vercel deploy at `https://3d-vertical-test.vercel.app/value-add-journey.html` hosts a three.js property tour that the embedded map iframes on slide 11/12 when the user taps the Ozu-1 marker.

This is three repos for one experience. The migration consolidates them into this one.

After this migration:

- The map's **source** lives in `value-add-prototype/embedded-apps/map/`.
- The 3D tour's **source** lives in `value-add-prototype/embedded-apps/value-add-journey/`.
- A build script in this repo's `package.json` builds both and stages them into `public/`.
- The map continues to load as an iframe inside React (the boundary stays — no React port).
- The 3D tour continues to load as an iframe inside the map, but at a same-origin relative URL (`/tours/ozu-1/index.html`), not the cross-origin Vercel URL.
- `map-prototype` is archived. The 3D tour's Vercel deploy is sunset.

## Authority chain

Read in this order. Do not skip.

1. **This file** (the prompt) — process, scope, decisions already made.
2. `value-add-prototype/CLAUDE.md` (your current repo) — design system, banned behaviors, commit rules.
3. `map-prototype/docs/migration-to-value-add-prototype.md` — the full migration plan, file-by-file mapping, acceptance criteria, rollback. **Read in full.** Path: `/Users/riaan/Documents/Design Files/Code Projects/map-prototype/docs/migration-to-value-add-prototype.md`.
4. `map-prototype/CLAUDE.md` — the design rules that govern the embedded map. These travel with the source and become scoped to `embedded-apps/map/` after migration.
5. `map-prototype/docs/value-add-prototype-relationship.md` — the historical relationship doc. After migration, this is superseded.
6. `value-add-prototype/src/components/shared/MapHost.tsx` and `PropertyMapHost.tsx` — the React wrappers that mount the map iframe today. The iframe URL and postMessage contract live here.

Decisions already made (do not re-litigate):

- **Iframe stays.** No React port of the map. The reasoning is in the migration plan, section "Why drop-in iframe source".
- **Same-origin tour.** The 3D tour moves into this repo's `public/tours/ozu-1/`. Cross-origin postMessage becomes same-origin.
- **map-prototype repo gets archived** after the migration is verified, not deleted.

## Source paths

These are absolute paths on the product owner's machine.

| Repo | Path |
|---|---|
| value-add-prototype (you are here) | `/Users/riaan/Documents/Design Files/Code Projects/value-add-prototype` |
| map-prototype (source to migrate) | `/Users/riaan/Documents/Design Files/Code Projects/map-prototype` |
| 3D tour deployed | `https://3d-vertical-test.vercel.app/value-add-journey.html` |
| 3D tour source repo | Unknown. Ask the user. |

## Process rules

- **STOP before any code.** Phase 0 below requires user input. Do not proceed past Phase 0 without explicit "yes, go" from the user.
- **One phase at a time.** After each phase, summarize what changed and ask the user to verify before starting the next. Do not chain phases silently.
- **No commit until told.** Per this repo's `CLAUDE.md`: "NEVER COMMIT BEFORE I TELL YOU." The migration is multi-commit. After each phase, ask the user before committing.
- **Use a feature branch.** Invoke `/feature migrate-map-prototype-in` at the start of Phase 1. The `/feature` skill in this repo authorizes commits per its rules.
- **No rewrites.** Copy source verbatim. The only files you may edit during migration are:
  - `embedded-apps/map/js/ui/value-add-tour.js` (point at same-origin tour URL).
  - `embedded-apps/map/package.json` (rename the `name` field).
  - `value-add-prototype/package.json` (add the new scripts).
  - `value-add-prototype/CLAUDE.md` (add the embedded-apps pointer).
  - Two new files in `scripts/` for the copy step.
- **No new dependencies in the slideshow.** The migration does not require any new npm packages in value-add-prototype's root `package.json`. The embedded sub-apps keep their own dependencies inside `embedded-apps/<sub>/`.

## The six phases

Each phase has: actions, verification, "ask the user" gate. Do not skip the gates.

---

### Phase 0 — Read, inventory, and ask

**Actions:**

1. Read all six docs in the Authority chain above.
2. Open `map-prototype/` (absolute path above) and list its top-level contents. Confirm the inventory matches what the migration plan describes.
3. Verify the existing embedded copies in this repo:
   - `public/playground/prototypes/step-6-section-3-map/map-prototype-v1/index.html` exists.
   - `public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/index.html` exists.
4. Read this repo's `src/components/shared/MapHost.tsx` and `PropertyMapHost.tsx` fully and report:
   - The exact iframe `src` URL pattern.
   - The exact query string params.
   - The exact postMessage event names the wrappers subscribe to.
5. Check whether the user has a source repo for the 3D tour at `https://3d-vertical-test.vercel.app/value-add-journey.html`. Search nearby paths first (`/Users/riaan/Documents/Design Files/Code Projects/` for any folder with `vertical`, `tour`, `journey`, or `3d` in the name). Report what you find or do not find.

**Ask the user (mandatory before Phase 1):**

> 1. I have read the migration plan and inventoried both repos. **Proceed with Phase 1 (create the embedded-apps folder and copy the map source)?**
> 2. The 3D tour's source repo — do you know where it lives? If not, I will mirror the deployed assets from `https://3d-vertical-test.vercel.app/value-add-journey.html` into `embedded-apps/value-add-journey/` during Phase 4. Confirm that is acceptable.
> 3. **Sub-lockfile or workspace?** The embedded map has its own `pnpm-lock.yaml` today. Two options: (a) keep it as its own lockfile inside `embedded-apps/map/`; (b) convert to a pnpm workspace at the repo root so all three lockfiles share one. Pick (a) unless you have a reason for (b).
> 4. **`map-prototype` Vercel deploy** — does the standalone map have a public URL anyone uses today (e.g. linked from anywhere)? If yes, I will leave that deploy live; if no, you can delete it from Vercel after migration. Tell me which.

Do not start Phase 1 until you have answers to all four.

---

### Phase 1 — Create `embedded-apps/map/` and copy the map source

**Actions:**

1. Invoke `/feature migrate-map-prototype-in` to create the feature branch. This authorizes commits.
2. Create `value-add-prototype/embedded-apps/map/`.
3. Copy from `map-prototype/` to `embedded-apps/map/`:
   - `index.html`
   - `css/`
   - `js/`
   - `assets/`
   - `public/` (if present)
   - `landmarks.json`, `layers.json`, `regions.json`
   - `package.json`
   - `vite.config.js`
   - `pnpm-lock.yaml` (only if the user picked sub-lockfile in Phase 0)
   - `CLAUDE.md` (as `embedded-apps/map/CLAUDE.md`, scoped)
   - `docs/` (full folder, as `embedded-apps/map/docs/`)
   - `QA_20260312.md`, `QA_20260312_raw.md`
4. Do **NOT** copy:
   - `node_modules/`
   - `dist/`
   - `.git/`
   - `.handoffs/`
   - `.vercel/`
   - `.env.local`
   - `showcase/`
   - The old `value-add-journey-map-prototype-prompt.md` at the root of map-prototype (stale; describes work already done).
   - `.claude/`, `.DS_Store`
5. Edit `embedded-apps/map/package.json`: rename `"name": "map-prototype"` to `"name": "@embedded/map"`. Leave everything else verbatim.
6. Add a one-line note at the top of `embedded-apps/map/CLAUDE.md`:
   > **Scope:** This file governs the embedded map only (the iframe at slides 6, 7, 11, 12). For the rest of value-add-prototype see the root `CLAUDE.md`.
7. `cd embedded-apps/map && pnpm install && pnpm build`. The build must succeed with zero errors. The output appears in `embedded-apps/map/dist/`.
8. Confirm `embedded-apps/map/dist/index.html` exists and contains the embed-mode markers.

**Verification:**

- `cd embedded-apps/map && pnpm build` exits 0.
- `dist/` is populated.
- Adding `embedded-apps/map/node_modules/` and `embedded-apps/map/dist/` to `.gitignore` (do this).

**Ask the user:**

> Phase 1 complete. Map source is in `embedded-apps/map/` and builds clean. Commit and proceed to Phase 2?

---

### Phase 2 — Build pipeline and copy scripts

**Actions:**

1. Create `value-add-prototype/scripts/copy-map-dist.js`. About 20 lines. Pseudocode:

   ```js
   // Clean both public/.../map-prototype-v1/ folders and copy embedded-apps/map/dist/ into each.
   const fs = require('node:fs');
   const path = require('node:path');
   const SRC = path.join(__dirname, '..', 'embedded-apps', 'map', 'dist');
   const TARGETS = [
     path.join(__dirname, '..', 'public', 'playground', 'prototypes', 'step-6-section-3-map', 'map-prototype-v1'),
     path.join(__dirname, '..', 'public', 'playground', 'prototypes', 'step-12-section-6-product-hardware', 'map-prototype-v1'),
   ];
   for (const t of TARGETS) {
     fs.rmSync(t, { recursive: true, force: true });
     fs.mkdirSync(t, { recursive: true });
     fs.cpSync(SRC, t, { recursive: true });
   }
   ```

2. Update `value-add-prototype/package.json`. Add scripts:

   ```jsonc
   "build:map": "cd embedded-apps/map && pnpm install --frozen-lockfile && pnpm build && cd ../.. && node scripts/copy-map-dist.js",
   "build:embedded": "pnpm run build:map",
   "build": "pnpm run build:embedded && next build",
   "dev": "pnpm run build:embedded && next dev"
   ```

   Preserve any existing scripts. If `build` and `dev` already exist, modify them to prepend `pnpm run build:embedded && `.

3. Run `pnpm run build:embedded` from the repo root. Verify it:
   - Builds the map cleanly.
   - Wipes and refills both `public/playground/prototypes/.../map-prototype-v1/` folders.

4. Run `pnpm dev`. Open the slideshow. Manually click through to **slides 6, 7, 11, 12**. Confirm:
   - Map renders.
   - No console errors.
   - Existing scene behaviors unchanged (compare against the previous hand-copied build's behavior).

**Verification:**

- Slides 6, 7, 11, 12 visually identical to pre-migration (or the user signs off on any differences).
- `git diff public/playground/prototypes/` shows the contents were regenerated by the build (file mtimes new, contents structurally identical).

**Ask the user:**

> Phase 2 complete. Build pipeline runs and slides 6, 7, 11, 12 render correctly. Commit and proceed to Phase 3?

---

### Phase 3 — Reroute the Mapbox token contract (verify only)

**Actions:**

1. Read `src/components/shared/MapHost.tsx`. Confirm it sets `window.__GKTK_MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` before the iframe mounts.
2. Read `embedded-apps/map/index.html` lines around `mapbox_access_token`. Confirm the iframe reads from `window.__GKTK_MAPBOX_ACCESS_TOKEN` first.
3. Verify `.env.local` (in this repo) has `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` set. If not, ask the user.
4. In `pnpm dev`, on slide 6, open browser DevTools and confirm the Mapbox base layer (3D buildings, terrain) renders. If only labels render, the token is not flowing.

**Verification:**

- Map base layer is fully rendered (3D buildings visible at zoomed-in scenes).

**Ask the user:**

> Phase 3 complete. Mapbox token is flowing from the slideshow env into the iframe. No code changed. Proceed to Phase 4 (3D tour migration)?

---

### Phase 4 — Migrate the 3D tour to same-origin

**Actions:**

1. **Get the source.** Two paths depending on Phase 0 answer:
   - **(a) The user has a source repo.** Copy its contents into `embedded-apps/value-add-journey/`. Note its `package.json` build command if any.
   - **(b) No source repo.** Mirror the deployed assets:
     ```bash
     mkdir -p embedded-apps/value-add-journey
     cd embedded-apps/value-add-journey
     wget --mirror --convert-links --adjust-extension --page-requisites --no-parent \
          --no-host-directories --cut-dirs=0 \
          https://3d-vertical-test.vercel.app/value-add-journey.html
     ```
     Inspect the output. The deployed page references additional JS chunks, textures, and likely an `.hdr` environment file. `wget --mirror` should follow most, but JS-loaded assets (three.js dynamic imports, KTX textures) may not be discovered automatically. Open the page in a browser, open DevTools → Network, reload, and download every asset listed that `wget` missed. Save them at the same relative paths the page expects.
   - **(c) Whichever path above:** verify by opening `embedded-apps/value-add-journey/value-add-journey.html` (or `index.html` if renamed) directly in a browser (`file://`). The tour will likely **fail** on `file://` because of ES module CORS; that is expected. The real test is running it from the dev server in step 3 below.

2. **Stage into public.** Create `value-add-prototype/scripts/copy-tour-dist.js`:

   ```js
   const fs = require('node:fs');
   const path = require('node:path');
   // If the tour has a build step, point SRC at its dist/. If it's a static folder of HTML+assets, point SRC at the folder itself.
   const SRC = path.join(__dirname, '..', 'embedded-apps', 'value-add-journey'); // or .../dist
   const TARGET = path.join(__dirname, '..', 'public', 'tours', 'ozu-1');
   fs.rmSync(TARGET, { recursive: true, force: true });
   fs.mkdirSync(TARGET, { recursive: true });
   fs.cpSync(SRC, TARGET, { recursive: true });
   ```

   Rename the entry file to `index.html` inside `public/tours/ozu-1/` if it's not already.

3. Update `package.json`:

   ```jsonc
   "build:tour": "node scripts/copy-tour-dist.js",
   "build:embedded": "pnpm run build:map && pnpm run build:tour"
   ```

   (If the tour repo has its own build step, prepend `cd embedded-apps/value-add-journey && pnpm install --frozen-lockfile && pnpm build && cd ../.. && ` to `build:tour`.)

4. Run `pnpm run build:embedded`. Confirm `public/tours/ozu-1/index.html` exists.

5. Verify in `pnpm dev`: open `http://localhost:3000/tours/ozu-1/` in a separate tab. The tour should load and play independently (no map, no slideshow). All 5 scenes navigable. No 404s in console.

**Verification:**

- `public/tours/ozu-1/index.html` reachable at `http://localhost:3000/tours/ozu-1/`.
- All scenes (exterior, room 1, kitchen, laundry, living + dining) render.
- No 404s for textures, HDRs, JS modules.

**Ask the user:**

> Phase 4 complete. 3D tour is now hosted same-origin at `/tours/ozu-1/`. The map iframe still points at the old cross-origin URL — Phase 5 fixes that. Commit and proceed to Phase 5?

---

### Phase 5 — Point the map at the same-origin tour

**Actions:**

1. Edit `embedded-apps/map/js/ui/value-add-tour.js`:

   Replace:
   ```js
   const TOUR_ORIGIN = "https://3d-vertical-test.vercel.app";
   const TOUR_URL = `${TOUR_ORIGIN}/value-add-journey.html`;
   ```
   With:
   ```js
   // After migration, the tour is served same-origin from value-add-prototype/public/tours/ozu-1/.
   // The empty TOUR_ORIGIN keeps the postMessage origin check simple: we compare against window.location.origin.
   const TOUR_URL = "/tours/ozu-1/index.html";
   ```

   In the message listener, replace:
   ```js
   if (event.origin !== TOUR_ORIGIN) return;
   ```
   With:
   ```js
   if (event.origin !== window.location.origin) return;
   ```

   Do not remove the origin check entirely. Do not change the `journeyComplete` event name.

2. `pnpm run build:embedded` to rebuild the map with the new tour URL.

3. Verify in `pnpm dev`:
   - Navigate to slide 11 or 12.
   - Tap the Ozu-1 marker on the map.
   - The tour mounts as a full-viewport iframe.
   - Browser network tab: tour loads from `localhost:3000/tours/ozu-1/index.html`, NOT from `3d-vertical-test.vercel.app`.
   - Tap forward through all 5 scenes.
   - On the final scene, tap forward — the tour iframe unmounts, the map is visible again, body scroll restored.

**Verification:**

- Network tab confirms same-origin tour load.
- Tour completion returns to map cleanly.
- No console errors.

**Ask the user:**

> Phase 5 complete. The map now iframes the tour from `/tours/ozu-1/` (same-origin). End-to-end flow works: tap Ozu-1 → tour plays → return to map. Commit and proceed to Phase 6?

---

### Phase 6 — Documentation, CLAUDE.md, and acceptance pass

**Actions:**

1. Update `value-add-prototype/CLAUDE.md`. Add a new section after the existing "File structure" section:

   ```markdown
   ## Embedded sub-apps

   `embedded-apps/` holds source for two iframe-loaded apps that ship inside the slideshow:

   - `embedded-apps/map/` — the interactive Kumamoto map (vanilla JS + Mapbox GL JS). Loaded on slides 6, 7, 11, 12. Scoped design rules live in `embedded-apps/map/CLAUDE.md`.
   - `embedded-apps/value-add-journey/` — the three.js Ozu-1 property tour. Loaded by the map (inside the iframe) when the user taps the Ozu-1 marker on slide 11/12.

   Build pipeline: `pnpm run build:embedded` builds both sub-apps and stages their output into `public/`. The root `build` and `dev` scripts run this automatically.

   When editing the map: edit files under `embedded-apps/map/`, then `pnpm run build:map` (or just `pnpm dev`, which runs the build first). Never hand-edit `public/playground/prototypes/.../map-prototype-v1/` — that folder is regenerated by the build script.
   ```

2. If a `docs/` folder for the map's design system was copied into `embedded-apps/map/docs/`, do not duplicate it at the repo's top-level `docs/`. Cross-reference instead.

3. Update or remove the stale rules in `embedded-apps/map/CLAUDE.md`:
   - The "Feature branch scope (map vs value-add-prototype)" section is obsolete — there is one repo now. Remove or rewrite as "All edits happen in this repo. The map source is at `embedded-apps/map/`."
   - The "Always run pnpm build and copy into the two embed locations" rule is now automatic — clarify that the build script handles it.

4. Run the full acceptance checklist from `embedded-apps/map/docs/migration-to-value-add-prototype.md` section "Acceptance criteria". Walk the user through each item and confirm.

5. Once all 10 acceptance items pass, instruct the user to:
   - Merge the migration PR in this repo.
   - On the GitHub side, archive the `map-prototype` repo (Settings → Archive).
   - On Vercel, sunset the standalone map deploy if the user confirmed in Phase 0 it has no live consumers.
   - Sunset the `3d-vertical-test` Vercel deploy.

**Verification:**

- All 10 acceptance items pass.
- The dev server (`pnpm dev`) starts clean from a fresh `pnpm install`.
- A fresh clone of this repo, followed by `pnpm install && pnpm build`, produces a working production build with the map and tour included.

**Ask the user:**

> All six phases complete. Migration verified. Final commit, push, then I'll wait for your sign-off before invoking `/feature finish`.

---

## What you must NOT do

- Do **NOT** rewrite the map as a React component.
- Do **NOT** modify the map's internal structure beyond the two file edits listed (value-add-tour.js URL, package.json name).
- Do **NOT** delete the old `value-add-journey-map-prototype-prompt.md` from the map-prototype repo — that's a separate repo, not yours to touch.
- Do **NOT** remove `public/playground/prototypes/.../map-prototype-v1/` until the new build pipeline produces them. The product owner needs the old hand-copied builds as fallback until the new ones replace them.
- Do **NOT** rename query string params (`embed`, `host`, `lang`, `steps`, `startStep`) — the React wrappers depend on them.
- Do **NOT** rename postMessage event names (`gktk-map-ready`, `gktk-map-complete`, `gktk-set-chromeless`, `journeyComplete`).
- Do **NOT** remove origin checks. Same-origin check (`event.origin === window.location.origin`) is fine. No origin check is not fine.
- Do **NOT** install new npm packages in the root `package.json` for this migration.
- Do **NOT** install Howler, ScrollTrigger, or Lenis (banned per root CLAUDE.md).
- Do **NOT** add a close button, swipe-to-dismiss, or Esc handler to the 3D tour. The original tour brief is non-negotiable on this.

## iPad-OS work to consider for the slideshow (Phase 6 follow-up, OPTIONAL)

After Phase 6, the embedded map carries forward all its iPad-OS HIG work — viewport-fit, dvh, touch-action, swipe-to-advance between map steps, HIG keyboard parity, marker tooltips via pointer events, rotate-to-landscape overlay. These behaviors travel with the map source; no extra work to preserve them inside the iframe.

The slideshow itself (the React shell that surrounds the iframe) is already iPad-first per its own `CLAUDE.md`. The migration plan recommends a follow-up audit — *separate from this migration*, do not bundle it — to check the slideshow against the same iPad-OS patterns the map proved out:

- `viewport-fit=cover` and safe-area insets (already in place per root `CLAUDE.md`).
- `dvh`/`svh` instead of `vh` for full-height containers (already noted in CLAUDE.md "Browser support" section).
- `touch-action: manipulation` or `pan-y` on tappable surfaces to prevent double-tap zoom.
- `overscroll-behavior: contain` to prevent rubber-band scroll past edges.
- Swipe gestures handled by pointer events, not mouse events.
- Rotate-to-landscape prompt when held in portrait, if that aligns with the deck's primary-orientation rule.

Read `embedded-apps/map/docs/ipad-research/` and `embedded-apps/map/docs/plans/tablet-adaptation-plan.md` (both moved here in Phase 1) before that audit. **Do not start the audit during this migration.** It is a separate feature branch after the migration ships.

## Quick reference — file paths after migration

```
value-add-prototype/
├── embedded-apps/
│   ├── map/                                   SOURCE — edit here
│   │   ├── index.html
│   │   ├── css/styles.css
│   │   ├── js/{main,app,step-handlers}.js, js/{map,ui,data,shared,dev}/
│   │   ├── assets/
│   │   ├── docs/                              Map's design system docs (moved here, scoped to map)
│   │   ├── CLAUDE.md                          Map-scoped design rules
│   │   ├── package.json                       name: "@embedded/map"
│   │   ├── vite.config.js                     Includes stripDevOnly plugin
│   │   └── pnpm-lock.yaml                     If user picked sub-lockfile
│   └── value-add-journey/                     SOURCE — edit here
│       ├── index.html (or value-add-journey.html, rename to index.html)
│       └── (three.js scenes, textures, HDRs)
├── public/
│   ├── playground/prototypes/
│   │   ├── step-6-section-3-map/map-prototype-v1/        BUILD OUTPUT — never hand-edit
│   │   └── step-12-section-6-product-hardware/map-prototype-v1/  BUILD OUTPUT — never hand-edit
│   └── tours/
│       └── ozu-1/                             BUILD OUTPUT — never hand-edit
├── scripts/
│   ├── copy-map-dist.js                       New, ~20 lines
│   └── copy-tour-dist.js                      New, ~20 lines
├── src/
│   └── components/shared/
│       ├── MapHost.tsx                        Unchanged (still iframes /playground/prototypes/.../index.html)
│       └── PropertyMapHost.tsx                Unchanged
└── package.json                               Adds build:map, build:tour, build:embedded; modifies build, dev
```

## When you are blocked

- Path/file missing? Ask the user.
- Tour assets unreachable? Ask the user.
- Mapbox token absent? Ask the user.
- Build errors you cannot diagnose in two attempts? Stop and report.
- Slide 6/7/11/12 visually different after migration? Stop, show a screenshot diff, ask the user to sign off or reject.

Do not improvise. Do not "fix it up." The migration is intentionally mechanical. If something is unclear, the answer is to ask.

---

## Begin

Start Phase 0 now: read the six docs in the Authority chain, inventory both repos, search for the 3D tour source, and ask the four user questions listed at the end of Phase 0. Do not start Phase 1 until you have answers.
