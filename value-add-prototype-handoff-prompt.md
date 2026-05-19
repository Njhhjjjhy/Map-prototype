# Handoff brief — value-add-prototype side of the map sync workflow

You are Claude Code working inside `value-add-prototype`. The product owner (a non-developer) is handing you this prompt at the start of a new session. Read this entire file before touching anything.

## Context: what this is, and what it is NOT

`map-prototype` (a sibling repo at `../map-prototype`) has just adopted a new `pnpm sync` command that builds the map and copies its output into THIS repo's two embed folders. Your job is to absorb the slideshow side of that workflow: update this repo's CLAUDE.md so future sessions understand the new arrangement, commit the synced files, verify the slides still work, and push.

This is **NOT** a migration. The three projects (`map-prototype`, this one, `3d-vertical-test`) stay independent and active. Each has its own daily editing workflow, its own Vercel deploy, its own audience. You are not absorbing anyone's source code. You are not archiving anything.

A previous proposal (May 2026) tried to merge all three into a monorepo and was abandoned. Read `../map-prototype/docs/abandoned/README.md` if you are tempted to re-propose that. **Do not.**

## Authority chain

Read in this order. Do not skip.

1. **This file** — process, scope, decisions already made.
2. `value-add-prototype/CLAUDE.md` (your current repo) — design system, commit rules, banned behaviors. Specifically the rule: "NEVER COMMIT BEFORE I TELL YOU" with the documented exception that `/feature <branch_name>` and `/feature finish` are explicit authorization.
3. `../map-prototype/docs/architecture-and-sync-workflow.md` — **canonical doc** for how the three projects fit together, what `pnpm sync` does, where per-embed customizations live, the daily workflow scenarios. Read in full.
4. `../map-prototype/CLAUDE.md` — the map's design rules. Useful background; not authoritative for THIS repo. They govern only what appears inside the iframe.
5. `value-add-prototype/src/components/shared/MapHost.tsx` and `PropertyMapHost.tsx` — the React wrappers that mount the map iframe today. The iframe URL and postMessage contract live here.
6. `value-add-prototype/docs/visual-identity.md` and `docs/architecture.md` — the slideshow's own design and architecture docs.

## Decisions already made (do not re-litigate)

- **Three projects stay independent.** No merging. No archiving. No "monorepo migration."
- **The map's source of truth is `../map-prototype`.** Not here. You will never edit map source files from this repo.
- **The map is embedded as a build-time snapshot**, not iframed live. Reason: offline pitches. Do not change the iframe URL to point at the live map deploy.
- **The 3D tour is iframed live cross-origin** from the map (`https://3d-vertical-test.vercel.app`). Do not bring the tour into this repo. Do not change the cross-origin URL.
- **Per-embed customizations live in `public/playground/prototypes/.../map-prototype-v1/assets/embed-mobile-overrides.css`.** Step-6 and step-12 have different versions, intentionally. The map's sync script preserves them; do not centralize them.

## Source paths

| Repo | Path |
|---|---|
| value-add-prototype (you are here) | `/Users/riaan/Documents/Design Files/Code Projects/value-add-prototype` |
| map-prototype (sibling, source of truth for the map) | `/Users/riaan/Documents/Design Files/Code Projects/map-prototype` |

## Process rules

- **STOP before any code.** Phase 0 below requires user input. Do not proceed past Phase 0 without explicit "yes, go" from the user.
- **One phase at a time.** After each phase, summarize what changed and ask the user to verify before starting the next. Do not chain phases silently.
- **No commit, push, or PR until the user invokes `/feature finish`.** Per this repo's `CLAUDE.md`: do not stage, commit, push, or open a PR until the user explicitly says so. The `/feature <branch_name>` invocation only creates the branch; commits wait for `/feature finish`. If the `/feature` skill's per-prompt instructions say to commit incrementally, ignore that part.
- **Use a feature branch.** Invoke `/feature adopt-map-sync-workflow` at the start of Phase 1. Creating the branch is fine; committing into it is not (until `/feature finish`).
- **Scope is narrow.** The only files you will edit in this repo during this work are:
  - `value-add-prototype/CLAUDE.md` (add a section explaining the sync workflow)
  - `value-add-prototype/public/playground/prototypes/.../map-prototype-v1/` folders (committing the synced content — these have already been overwritten by `pnpm sync` running in the map repo)
- **Do not edit anything in `../map-prototype/`.** That's a separate repo with its own feature branches. The map side of this workflow is already done and merged there.
- **No new dependencies.** This work does not require any new npm packages.

## The four phases

Each phase has: actions, verification, "ask the user" gate.

---

### Phase 0 — Read, inventory, ask

**Actions:**

1. Read all six docs in the Authority chain above.
2. Confirm the sync has happened in the map repo. Run:
   ```bash
   ls -la ../map-prototype/scripts/sync-to-slideshow.js
   git log --oneline -10 ../map-prototype | head -10
   ```
   You should see the sync script exists and there are recent commits to map-prototype mentioning sync.
3. Inventory the current state of this repo's embed folders. Run:
   ```bash
   git status public/playground/prototypes/step-6-section-3-map/map-prototype-v1/
   git status public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/
   ```
   Expect to see modified and untracked files (the synced output). If both are clean, the user has not yet run `pnpm sync` in map-prototype — stop and ask them to do so first.
4. Verify the per-embed override files survived the sync:
   ```bash
   ls public/playground/prototypes/step-6-section-3-map/map-prototype-v1/assets/embed-mobile-overrides.css
   ls public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/assets/embed-mobile-overrides.css
   diff public/playground/prototypes/step-6-section-3-map/map-prototype-v1/assets/embed-mobile-overrides.css \
        public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/assets/embed-mobile-overrides.css | head -5
   ```
   Both files should exist. The diff should show they differ from each other (step-6 has translucent macOS chrome, step-12 has flat iPad chrome). If either is missing or they are identical, stop — something went wrong in the sync.
5. Read `value-add-prototype/CLAUDE.md` and identify the place where the embedded sub-apps section should go (typically after the "File structure" section).

**Ask the user (mandatory before Phase 1):**

> 1. I have read the canonical architecture doc and confirmed the sync ran (or did not run — please confirm). **Proceed with Phase 1 (update CLAUDE.md to document the new workflow)?**
> 2. The two `embed-mobile-overrides.css` files are present and differ from each other? Confirm yes or report what you see.

Do not start Phase 1 until you have answers to both.

---

### Phase 1 — Update CLAUDE.md to document the sync workflow

**Actions:**

1. Invoke `/feature adopt-map-sync-workflow` to create the feature branch. Do NOT commit anything yet.
2. Open `value-add-prototype/CLAUDE.md` and add a new section after the existing "File structure" section (or wherever sub-app documentation logically belongs):

   ```markdown
   ## Embedded map (managed externally by map-prototype)

   The map shown on slides 6, 7, 11, and 12 is built and synced from a separate repo (`../map-prototype`). This repo holds only the **built snapshot** of the map, at:

   - `public/playground/prototypes/step-6-section-3-map/map-prototype-v1/`
   - `public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/`

   These folders are managed by `pnpm sync` running in `../map-prototype`. **Do not hand-edit any file inside them** except the `assets/embed-mobile-overrides.css` file, which is a per-embed customization preserved across syncs.

   When the product owner asks you to change something about the map (colors, markers, scenes, copy, behavior), the answer is almost always: "that change has to be made in `../map-prototype`, then synced here." Tell them. Do not edit the synced files directly.

   The two exceptions where edits IN THIS REPO are correct:
   - **`embed-mobile-overrides.css` in either folder** — these are mobile-specific style overrides scoped to each slide context. Edit freely; the next sync will preserve them.
   - **The React wrappers `src/components/shared/MapHost.tsx` and `PropertyMapHost.tsx`** — these mount the iframe and pass query params + the Mapbox token. Edit when the wrapping behavior needs to change.

   The 3D property tour that launches from the Ozu-1 marker is iframed live cross-origin from `https://3d-vertical-test.vercel.app` — a third independent project. Do not bring it into this repo.

   Full architecture and sync workflow: `../map-prototype/docs/architecture-and-sync-workflow.md`.
   ```

3. Also add to the "Process rules" section of `CLAUDE.md`:

   ```markdown
   **Map and tour verification.** Before declaring any task that touched `public/playground/prototypes/.../map-prototype-v1/`, `src/components/shared/MapHost.tsx`, or `src/components/shared/PropertyMapHost.tsx` complete, you must:

   1. Run `pnpm dev`.
   2. Manually click through to slides 6, 7, 11, and 12.
   3. On slide 11 or 12, tap the Ozu-1 marker and verify the 3D tour launches, plays at least the first scene, and returns to the map cleanly when you click forward through all 5 scenes.
   4. Confirm no red errors in the browser console.

   If any step fails, do not report the task complete. Fix it or report the blocker.
   ```

**Verification:**

- The new sections exist in `CLAUDE.md` and read coherently with the rest of the file.
- No other files were modified.

**Ask the user:**

> Phase 1 complete. CLAUDE.md now documents the sync workflow and the verification rule. **Proceed to Phase 2 (test the synced slides)?**

---

### Phase 2 — Test the synced slides

**Actions:**

1. Run `pnpm dev`.
2. Open the local dev URL (likely `http://localhost:3000`).
3. Navigate to slide 6. Confirm the map renders with the government-support scene. No console errors.
4. Advance to slide 7. Confirm the map transitions and the scene changes.
5. Navigate to slide 11. Confirm the map shows only the Ozu-1 property (other properties filtered out).
6. Advance to slide 12. Confirm the map is visible with the full UI.
7. On slide 11 or 12, tap the **Ozu-1 marker on the map**.
8. The 3D tour should mount as a full-viewport iframe.
9. Navigate forward through all 5 tour scenes (exterior → room 1 → kitchen → laundry → living + dining).
10. Tap forward on the final scene. The tour iframe should unmount and you should return to the map cleanly.
11. Confirm no red console errors anywhere in this flow.

**Verification:**

- All four slides render the map.
- The Ozu-1 marker → tour flow works end to end.
- No console errors.

**Ask the user:**

> Phase 2 complete. Slides 6, 7, 11, 12 all render correctly and the 3D tour flow works end-to-end. **Proceed to Phase 3 (final review before /feature finish)?**

If anything failed in Phase 2, do NOT proceed. Report what failed, ask the user how to handle it. Common failure modes:
- Map renders but Mapbox tiles missing → `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` not set in `.env.local`. Ask the user to add it.
- 3D tour shows blank black screen → you may be offline, or the 3D tour deploy is down. Open `https://3d-vertical-test.vercel.app/value-add-journey.html` directly to confirm.
- Console errors about missing files → the sync may have left a broken state. Ask the user to re-run `pnpm sync` in map-prototype.

---

### Phase 3 — Final review and handoff to `/feature finish`

**Actions:**

1. Run `git status` and confirm the staged changes are limited to:
   - `value-add-prototype/CLAUDE.md` (modified)
   - `value-add-prototype/public/playground/prototypes/step-6-section-3-map/map-prototype-v1/` (modified + new files from the sync)
   - `value-add-prototype/public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/` (modified + new files from the sync)
2. If any unexpected files are modified (e.g. `src/` files you don't remember touching), stop and ask the user.
3. Summarize what changed for the user:
   - CLAUDE.md updated with the new "Embedded map" section and the verification process rule.
   - Both `map-prototype-v1/` folders contain the freshly built map output plus their per-embed overrides.
   - Nothing else changed.

**Ask the user:**

> All three phases complete. The working tree has accumulated changes — nothing is committed yet. When you are ready, invoke `/feature finish` and I will commit, push, open the PR, and walk it through review per the skill.

---

## After `/feature finish` (post-merge)

When the PR is merged, the next Vercel deploy of value-add-prototype will pick up the freshly synced map. Tell the user:

1. Wait for Vercel to finish deploying (check the Vercel dashboard for value-add-prototype).
2. **On a real iPad device**, open the live slideshow URL.
3. Click through slides 6, 7, 11, 12 again and tap the Ozu-1 marker. Verify everything works on the actual deployed site, not just localhost. iPad Safari can behave differently from desktop Chrome.
4. If anything looks wrong on the live deploy, the rollback is to revert the merged PR (one click on GitHub).

---

## What you must NOT do

- Do **NOT** edit any file inside `public/playground/prototypes/.../map-prototype-v1/` except `embed-mobile-overrides.css`. Those folders are managed by the sync in map-prototype.
- Do **NOT** edit anything inside `../map-prototype/`. That's a separate repo.
- Do **NOT** copy the 3D tour into this repo. It stays as a live cross-origin iframe at `https://3d-vertical-test.vercel.app`.
- Do **NOT** change the iframe URL in `MapHost.tsx` to point at `map-prototype.vercel.app`. The build-time snapshot is intentional (offline pitches).
- Do **NOT** rename query string params (`embed`, `host`, `lang`, `steps`, `startStep`).
- Do **NOT** rename postMessage event names (`gktk-map-ready`, `gktk-map-complete`, `gktk-set-chromeless`, `journeyComplete`).
- Do **NOT** install Howler, ScrollTrigger, or Lenis (banned per root CLAUDE.md).
- Do **NOT** propose a monorepo or merger of any kind. Read `../map-prototype/docs/abandoned/README.md` if tempted.
- Do **NOT** commit before `/feature finish`. The `/feature <branch_name>` invocation only creates the branch.

## When you are blocked

- Sync hasn't been run in map-prototype? Stop, ask the user to `cd ../map-prototype && pnpm sync` first.
- Slides fail in Phase 2 testing? Stop, show what failed, ask the user. Do not try to "fix" by editing the synced files — fix the underlying issue in map-prototype if it's a map bug, or in this repo if it's a wrapper bug.
- Mapbox token absent? Ask the user.
- Path/file missing? Ask the user.

Do not improvise. The work is intentionally mechanical. If something is unclear, the answer is to ask.

---

## Quick reference — what changes in this repo after Phase 3

```
value-add-prototype/
├── CLAUDE.md                                              MODIFIED
│   (added "Embedded map" section and verification process rule)
├── public/
│   └── playground/prototypes/
│       ├── step-6-section-3-map/map-prototype-v1/         MODIFIED (synced)
│       │   ├── index.html                                  ← regenerated
│       │   ├── assets/index-<new-hash>.js                  ← new
│       │   ├── assets/index-<new-hash>.css                 ← new
│       │   ├── assets/embed-mobile-overrides.css           ← PRESERVED (do not touch via sync)
│       │   └── assets/...other build files                 ← regenerated
│       └── step-12-section-6-product-hardware/map-prototype-v1/   MODIFIED (synced)
│           (same structure as above; embed-mobile-overrides.css differs from step-6's)
└── src/                                                    UNCHANGED
```

No `src/` changes. No new packages. No new scripts. The build pipeline, the routing, the React shell, the design system, the PDF, the playground viewer — all untouched.

---

## Begin

Start Phase 0 now: read the six docs in the Authority chain, run the inventory commands, and ask the two user questions listed at the end of Phase 0. Do not start Phase 1 until you have answers.
