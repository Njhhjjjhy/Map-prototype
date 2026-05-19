# Migration brief — absorb map-prototype into value-add-prototype

> ## ⚠️ ABANDONED — DO NOT EXECUTE
>
> This prompt was drafted and merged on 2026-05-19 then abandoned the same day. The migration it describes would have archived `map-prototype` — but the product owner edits `map-prototype` daily, so the plan was wrong.
>
> The actual workflow that replaced it: a `pnpm sync` command in `map-prototype` that builds and copies the map into `value-add-prototype`'s embed folders in one shot, preserving per-embed customizations. Both repos stay independent and active. See [`README.md`](README.md) in this folder for the full story and [`docs/syncing-to-value-add-prototype.md`](../syncing-to-value-add-prototype.md) for the current workflow.
>
> If a Claude session in `value-add-prototype` is ever pointed at this file, stop and tell the product owner. Do not execute it.

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

**Estimated effort:** 1–2 sessions. The work is mechanical (copy files, wire scripts, verify). Most elapsed time is the product owner clicking through slides 6, 7, 11, 12 after each phase. Do not over-engineer.

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
- **No commit, push, or PR until the user invokes `/feature finish`.** Per this repo's `CLAUDE.md` and the product owner's standing rule: do not stage, commit, push, or open a PR at any point during the migration. Let all changes accumulate uncommitted on the feature branch. When the user invokes `/feature finish`, then commit and push everything per the `/feature` skill. If the `/feature` skill instructions say to commit incrementally, ignore that part.
- **Use a feature branch.** Invoke `/feature migrate-map-prototype-in` at the start of Phase 1. Creating the branch is fine; committing into it is not (until `/feature finish`).
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
5. **Verify the Mapbox token is set** in `value-add-prototype/.env.local`. Run `grep NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN .env.local`. If empty or missing, do not proceed — the map will silently fail to render its base layer during verification. Ask the user for the token (it likely lives in `map-prototype/.env.local`, in the user's Mapbox account dashboard, or in Vercel's env vars for the existing map deploy).
6. **Discover the 3D tour source** in this order, stopping at the first hit:
   - **(a) Vercel link.** Ask the user to open the `3d-vertical-test` project in Vercel and check Settings → Git → "Connected Git Repository." If linked, get that GitHub URL.
   - **(b) Local search.** Run `find ~/Documents -type d \( -iname "*3d*" -o -iname "*vertical*" -o -iname "*tour*" -o -iname "*journey*" \) 2>/dev/null | head -20`. Filter for real source directories (has `.git/`, `package.json`, or `index.html`).
   - **(c) Ask directly.** "Do you remember where the source for the 3D tour lives?"
   - **(d) Last resort: mirror.** If none of (a)–(c) finds it, plan to capture every network request the deployed page makes via DevTools Network panel during Phase 4 and reconstruct `embedded-apps/value-add-journey/` from those downloads. `wget --mirror` alone is unreliable for three.js apps because dynamic imports defeat it.

   Report what you found and which path you'll use in Phase 4.

**Ask the user (mandatory before Phase 1):**

> 1. I have read the migration plan and inventoried both repos. **Proceed with Phase 1 (create the embedded-apps folder and copy the map source)?**
> 2. The 3D tour source: [report what you found from step 6 above]. Confirm the approach you'll use in Phase 4.
> 3. **`map-prototype` Vercel deploy** — does the standalone map have a public URL anyone uses today (e.g. linked from anywhere)? If yes, I will leave that deploy live; if no, you can delete it from Vercel after migration. Tell me which.
> 4. **Mapbox token:** [report whether you found `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env.local`]. If missing, please paste it into `.env.local` now before I proceed.

Do not start Phase 1 until you have answers to all four. Note: the older versions of this prompt asked about sub-lockfile vs workspace — the answer is now default to sub-lockfile (each `embedded-apps/<sub>/` keeps its own `pnpm-lock.yaml`). Do not ask the user.

---

### Phase 1 — Create `embedded-apps/map/` and copy the map source

**Actions:**

1. Invoke `/feature migrate-map-prototype-in` to create the feature branch. Do NOT commit anything yet — wait for the user to invoke `/feature finish` at the very end.
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
   - `pnpm-lock.yaml` (default — sub-lockfile, see Phase 0 note)
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
6. Add a scope block at the top of `embedded-apps/map/CLAUDE.md`:
   > **Scope:** This file and `embedded-apps/map/docs/` govern the map's internal UI only — everything that appears inside the iframe at slides 6, 7, 11, 12. The slideshow's React shell, the PDF, the playground, and everything else outside the iframe are governed by the root `CLAUDE.md` and `docs/visual-identity.md`.
   >
   > The two design languages may differ (map uses macOS HIG; slideshow uses iPad-first flat). That is intentional. Do not harmonize tokens between the two systems without an explicit user instruction.
7. `cd embedded-apps/map && pnpm install && pnpm build`. The build must succeed with zero errors. The output appears in `embedded-apps/map/dist/`.
8. Confirm `embedded-apps/map/dist/index.html` exists and contains the embed-mode markers.

**Verification:**

- `cd embedded-apps/map && pnpm build` exits 0.
- `dist/` is populated.
- Adding `embedded-apps/map/node_modules/` and `embedded-apps/map/dist/` to `.gitignore` (do this).

**Ask the user:**

> Phase 1 complete. Map source is in `embedded-apps/map/` and builds clean. Proceed to Phase 2?

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

> Phase 2 complete. Build pipeline runs and slides 6, 7, 11, 12 render correctly. Proceed to Phase 3?

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

1. **Get the source.** Follow the path from Phase 0 step 6:
   - **(a) Vercel-linked source repo found.** Clone it adjacent to value-add-prototype, then copy its contents into `embedded-apps/value-add-journey/`. Read its `package.json` and note: does it have a `build` script? If yes, this is **Variant B** below. If no (it's static HTML + assets), this is **Variant A**.
   - **(b) Local source folder found.** Copy contents into `embedded-apps/value-add-journey/`. Same Variant A vs B check on the `package.json`.
   - **(d) Last resort — mirror.** With the user, open `https://3d-vertical-test.vercel.app/value-add-journey.html` in Chrome. DevTools → Network → reload. Sort by name. For every asset listed (HTML, JS, JSON, textures, HDRs, KTX, GLB), right-click → "Save as" and save it into `embedded-apps/value-add-journey/` at the same relative path the URL implies. This is tedious — ~20–50 assets typically. If the user is unwilling to do this, the migration stops here until they decide.

   After (a), (b), or (d), the result is **Variant A** (static folder, no build step) unless (a)/(b) showed a `build` script in its `package.json` (then **Variant B**).

2. **Decide variant and stage into public.** Create `value-add-prototype/scripts/copy-tour-dist.js`:

   ```js
   // Variant A (default — tour is static HTML + assets): SRC = embedded-apps/value-add-journey/
   // Variant B (tour has its own build step):           SRC = embedded-apps/value-add-journey/dist/
   const fs = require('node:fs');
   const path = require('node:path');
   const SRC = path.join(__dirname, '..', 'embedded-apps', 'value-add-journey'); // or '..', 'embedded-apps', 'value-add-journey', 'dist'
   const TARGET = path.join(__dirname, '..', 'public', 'tours', 'ozu-1');
   fs.rmSync(TARGET, { recursive: true, force: true });
   fs.mkdirSync(TARGET, { recursive: true });
   fs.cpSync(SRC, TARGET, { recursive: true });
   ```

   If the tour's entry file is `value-add-journey.html`, rename the copy at `public/tours/ozu-1/value-add-journey.html` to `index.html`. The map will iframe `/tours/ozu-1/` which resolves to `/tours/ozu-1/index.html`.

3. Add the variant-specific `build:tour` to `package.json`. Pick exactly one, do not include `|| true` fallback:

   **Variant A (static):**
   ```jsonc
   "build:tour": "node scripts/copy-tour-dist.js"
   ```

   **Variant B (has its own build):**
   ```jsonc
   "build:tour": "cd embedded-apps/value-add-journey && pnpm install --frozen-lockfile && pnpm build && cd ../.. && node scripts/copy-tour-dist.js"
   ```

   Update `build:embedded` to include both:
   ```jsonc
   "build:embedded": "pnpm run build:map && pnpm run build:tour"
   ```

4. Run `pnpm run build:embedded`. Confirm `public/tours/ozu-1/index.html` exists.

5. Verify in `pnpm dev`: open `http://localhost:3000/tours/ozu-1/` in a separate tab. The tour should load and play independently (no map, no slideshow). All 5 scenes navigable. No 404s in console.

**Verification:**

- `public/tours/ozu-1/index.html` reachable at `http://localhost:3000/tours/ozu-1/`.
- All scenes (exterior, room 1, kitchen, laundry, living + dining) render.
- No 404s for textures, HDRs, JS modules.

**Ask the user:**

> Phase 4 complete. 3D tour is now hosted same-origin at `/tours/ozu-1/`. The map iframe still points at the old cross-origin URL — Phase 5 fixes that. Proceed to Phase 5?

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

> Phase 5 complete. The map now iframes the tour from `/tours/ozu-1/` (same-origin). End-to-end flow works: tap Ozu-1 → tour plays → return to map. Proceed to Phase 6?

---

### Phase 6 — Documentation, automations, and acceptance pass

This phase does four things: documents the migration in CLAUDE.md, installs the three "won't forget" automations, runs the full acceptance checklist (12 items, including Vercel preview), and on completion saves project memory so future Claude sessions don't relearn the layout.

**Actions:**

1. Update `value-add-prototype/CLAUDE.md`. Add a new section after the existing "File structure" section:

   ```markdown
   ## Embedded sub-apps

   `embedded-apps/` holds source for two iframe-loaded apps that ship inside the slideshow:

   - `embedded-apps/map/` — the interactive Kumamoto map (vanilla JS + Mapbox GL JS). Loaded on slides 6, 7, 11, 12. Scoped design rules live in `embedded-apps/map/CLAUDE.md` and `embedded-apps/map/docs/`.
   - `embedded-apps/value-add-journey/` — the three.js Ozu-1 property tour. Loaded by the map (inside the iframe) when the user taps the Ozu-1 marker on slide 11/12.

   Build pipeline: `pnpm run build:embedded` builds both sub-apps and stages their output into `public/`. The root `build` and `dev` scripts run this automatically.

   When editing the map: edit files under `embedded-apps/map/`, then `pnpm run build:map` (or just `pnpm dev`, which runs the build first). Never hand-edit `public/playground/prototypes/.../map-prototype-v1/` — that folder is regenerated by the build script and your edits will be lost.

   **Design system scope:** the map's docs (`embedded-apps/map/docs/`) govern only what appears inside the iframe. The slideshow's `docs/visual-identity.md` governs everything outside it. They are allowed to differ.
   ```

2. Update `value-add-prototype/CLAUDE.md` under "Process rules" — add the verification rule (Automation #1):

   ```markdown
   **Map and tour verification.** Before declaring any task that touched `embedded-apps/map/`, `embedded-apps/value-add-journey/`, `scripts/copy-*.js`, or the React wrappers (`MapHost.tsx`, `PropertyMapHost.tsx`) complete, you must:

   1. Run `pnpm run build:embedded` and confirm it exits 0.
   2. Run `pnpm dev` and manually click through slides 6, 7, 11, 12.
   3. On slide 11 or 12, tap the Ozu-1 marker and verify the tour mounts, plays at least the first scene, and returns to the map when you click through to the end.
   4. Confirm no red errors in the browser console.

   If any step fails, do not report the task complete. Fix it or report the blocker.
   ```

3. Install the pre-commit safety net (Automation #2). Add `simple-git-hooks` to `devDependencies`:

   ```bash
   pnpm add -D simple-git-hooks
   ```

   Add to `package.json`:

   ```jsonc
   "simple-git-hooks": {
     "pre-commit": "pnpm run build:embedded && pnpm exec tsc --noEmit"
   },
   "scripts": {
     "postinstall": "simple-git-hooks"
   }
   ```

   Run `pnpm install` to register the hook. Test it: make a trivial change in `embedded-apps/map/`, stage it, try to commit — the commit should run the build first. (Remember: do not actually commit during the migration. Stage, test the hook fires, unstage.)

4. Confirm Vercel preview deploys are enabled (Automation #3). In Vercel project settings → Git → "Preview Deployments." Should be on by default for all branches. If not, turn on. Tell the user that the migration PR's preview URL is how they'll do final acceptance.

5. Update or remove the stale rules in `embedded-apps/map/CLAUDE.md`:
   - The "Migration notice (read first)" section at the top is no longer the migration — it has happened. Rewrite to: "Scope: this file governs the embedded map only. See root CLAUDE.md for everything else."
   - The "Feature branch scope (map vs value-add-prototype)" section is obsolete — one repo now. Remove or rewrite as "All edits happen in this repo. The map source is at `embedded-apps/map/`."
   - The "Always run pnpm build and copy into the two embed locations" rule is now automatic — clarify that the build script handles it.

6. Create `scripts/verify-embedded.js` (~30 lines): boots Next.js dev briefly, fetches the four embed entry URLs, reports HTTP 200/non-200. Wire it as `"verify:embedded": "node scripts/verify-embedded.js"` in package.json. The user can run this anytime as a fast smoke test.

7. Run the full acceptance checklist (12 items now — see `embedded-apps/map/docs/migration-to-value-add-prototype.md` section "Acceptance criteria"). Walk the user through each item and confirm.

8. **Vercel preview deploy acceptance (item 11).** Since you cannot push during the migration, the Vercel preview check happens after `/feature finish` opens the PR. Tell the user: "After `/feature finish` runs, the PR will get a Vercel preview URL within ~2 minutes. Open it on your iPad — not just your laptop — and verify slides 6, 7, 11, 12 and the Ozu-1 tour. Localhost on a laptop is necessary but not sufficient — iPad Safari has quirks."

9. Once all 12 acceptance items pass, instruct the user to:
   - Merge the migration PR in this repo.
   - On the GitHub side, archive the `map-prototype` repo (Settings → Archive).
   - On Vercel, sunset the standalone map deploy if the user confirmed in Phase 0 it has no live consumers.
   - Sunset the `3d-vertical-test` Vercel deploy.

10. **Save project memory.** After the merge, save these to `value-add-prototype/.claude/memory/` (or wherever this repo's auto-memory lives):

    - Feedback: "The map source lives at `embedded-apps/map/`. Edit there, never in `public/playground/prototypes/...`. The `public/` copies are regenerated by `pnpm run build:embedded` and overwritten on the next build. Same for the tour: source in `embedded-apps/value-add-journey/`, build output in `public/tours/ozu-1/`."
    - Project: "Migration from the standalone `map-prototype` repo completed [date]. The old repo is archived on GitHub. All map and tour work now happens here."
    - Reference: "Map's internal design system docs live at `embedded-apps/map/docs/`. The slideshow's docs at `docs/`. Scoped to their respective surfaces and may differ — do not harmonize without explicit user instruction."

**Verification:**

- All 12 acceptance items pass.
- The dev server (`pnpm dev`) starts clean from a fresh `pnpm install`.
- A fresh clone of this repo, followed by `pnpm install && pnpm build`, produces a working production build with the map and tour included.
- `pnpm run verify:embedded` exits 0.
- Pre-commit hook fires on a staged change (verified by attempting a commit and watching the hook run).
- Vercel preview URL renders correctly on iPad Safari.

**Ask the user:**

> All six phases complete. Migration verified. The working tree has accumulated changes across all six phases — nothing is committed yet. When you are ready, invoke `/feature finish` and I will commit, push, open the PR, and walk it through review per the skill.

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

Start Phase 0 now: read the six docs in the Authority chain, inventory both repos, verify the Mapbox token is set, discover the 3D tour source (Vercel → local → ask → mirror), and ask the four user questions listed at the end of Phase 0. Do not start Phase 1 until you have answers.
