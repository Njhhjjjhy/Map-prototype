# Architecture and sync workflow

> This is the canonical document for how `map-prototype`, `value-add-prototype`, and `3d-vertical-test` fit together as a single product. It supersedes the older `docs/value-add-prototype-relationship.md` (which now redirects here) and the rejected merger plan in `docs/abandoned/`.

## 1. The three projects

| Project | Folder | Repo | Vercel deploy | Role |
|---|---|---|---|---|
| **map-prototype** (this project) | `/Users/riaan/Documents/Design Files/Code Projects/map-prototype` | `moreharvest/interactive-map-prototype` | Standalone map URL | Interactive Kumamoto map. Vanilla JS + Mapbox GL JS. Edited daily. |
| **value-add-prototype** | `/Users/riaan/Documents/Design Files/Code Projects/value-add-prototype` | (private) | Slideshow URL | Investor pitch slideshow. Next.js + React. 22 steps. Edited weekly. |
| **3d-vertical-test** | (separate folder) | (separate repo) | `https://3d-vertical-test.vercel.app` | Three.js property tour of Ozu-1. Edited daily. |

All three are **active, independent projects**. None is being merged into another. None is being archived. Each has its own git history, its own Vercel deploy, its own daily life. They cooperate at runtime through iframes.

## 2. The runtime arrangement (what the user sees)

```
┌──────────────────────────────────────────────────────────────┐
│  value-add-prototype.vercel.app  (the slideshow, on iPad)    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Slide 6, 7, 11, or 12: iframe of the embedded map     │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Map (loaded from /playground/prototypes/...)    │  │  │
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

Three iframes deep. Each level is owned by a different project. The slideshow embeds the map. The map iframes the 3D tour.

## 3. Where the map and tour come from (build-time vs run-time)

| Embed | Mechanism | Why |
|---|---|---|
| Slideshow → Map | **Build-time snapshot** copied into `value-add-prototype/public/playground/prototypes/.../map-prototype-v1/` | Investor pitches happen in meeting rooms with unreliable wi-fi. An offline-capable embedded copy is required. A live iframe of the standalone map URL would break a pitch if the network drops mid-sentence. |
| Map → Tour | **Live cross-origin iframe** of `https://3d-vertical-test.vercel.app/value-add-journey.html` | The tour is rarely the centerpiece of a pitch and is short; an iframe loading a few seconds is acceptable. Avoiding a build-time copy means edits to the tour appear instantly without any sync step. |

Both choices are deliberate. Do not change them without revisiting the trade-offs above.

## 4. The two embed slots inside the slideshow

The slideshow embeds the map at two distinct paths, one for each context:

- `value-add-prototype/public/playground/prototypes/step-6-section-3-map/map-prototype-v1/` — used on slides 6 and 7. Scenes: government support, corporate investment, transport access.
- `value-add-prototype/public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/` — used on slides 11 and 12. Scene: properties (filtered to only Ozu-1).

Both folders contain the same map build, but each has its own **per-embed override file** (`assets/embed-mobile-overrides.css`) with subtly different mobile styling tuned to its slide context (step-6 uses translucent macOS chrome; step-12 uses flat iPad chrome).

This is why a naive "copy dist into both folders" approach is wrong — it would destroy the per-embed customizations. The sync script ([`scripts/sync-to-slideshow.js`](../scripts/sync-to-slideshow.js)) preserves them automatically.

## 5. The sync workflow

When you change the map and want the slideshow to pick up the new version, run from this project:

```bash
pnpm sync
```

The script does five things, in order:

1. **Builds** the map (`vite build` → `dist/`).
2. **Scans** both target folders in value-add-prototype for files that exist in the target but not in the fresh `dist/`. Those are the per-embed customizations.
3. **Filters** out stale Vite build artifacts from the list to preserve (anything matching `assets/index-<hash>.{js,css}` that isn't in the current build is treated as a leftover from an earlier sync, not a customization).
4. **Wipes** each target folder, **copies** the fresh `dist/` into each, and **restores** the per-embed customizations on top.
5. **Prints** a summary listing what was preserved per folder, plus a "next steps" reminder.

Result: both target folders now contain the latest map build plus their respective per-embed override files, with all stale artifacts cleared out.

For dry runs (build only, no copy), use `pnpm sync:dry`.

## 6. After running sync: the slideshow side

`pnpm sync` only writes into `value-add-prototype/public/...`. It does not commit anything. To actually ship the new map to the live slideshow:

1. `cd ../value-add-prototype`
2. Open `pnpm dev` and visually verify slides 6, 7, 11, 12. On slide 11 or 12, tap the Ozu-1 marker and confirm the 3D tour launches.
3. Commit the updated `map-prototype-v1/` folders in value-add-prototype.
4. Push to value-add-prototype's git. Vercel auto-deploys.

This is the **only** point where the slideshow project becomes involved. Until you commit, the sync is local.

## 7. Daily workflow examples

### Scenario A: you change a marker color in the map

1. Edit the relevant file in this project's `js/` or `css/`.
2. `pnpm dev` here to verify the change in standalone view.
3. When ready: `pnpm sync` here.
4. `cd ../value-add-prototype`, `pnpm dev`, click slide 6 to verify.
5. Commit in value-add-prototype, push. Vercel deploys.

### Scenario B: you change a tour scene

1. Edit the relevant file in 3d-vertical-test.
2. Push 3d-vertical-test. Vercel auto-deploys.
3. **Nothing else to do.** The map (and slideshow) see the new tour on next load — no sync needed.

### Scenario C: you change something in the slideshow itself (not the embedded map)

1. Edit the relevant file in value-add-prototype.
2. `pnpm dev` there to verify.
3. Commit + push in value-add-prototype. Vercel deploys.
4. **Nothing happens to map-prototype.** Slideshow-only changes do not flow back to the standalone map.

### Scenario D: you change the per-embed override CSS for step-12

1. Edit `value-add-prototype/public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/assets/embed-mobile-overrides.css` directly.
2. Verify in `pnpm dev` over there.
3. Commit + push in value-add-prototype.
4. **The next `pnpm sync` from this project will preserve your change.** The sync only overwrites files that come from this project's build; your override stays.

## 8. Per-embed customization rules

- **Naming:** override files must NOT match `assets/index-<hash>.{js,css}` (Vite's build artifact pattern). Use descriptive names like `embed-mobile-overrides.css` or `step-12-overrides.css`. Files matching the build-artifact pattern are treated as stale and discarded.
- **Location:** place override files anywhere inside the target folder. The sync preserves them at the same relative path.
- **Per-target:** each target folder has its own overrides. To add an override to both, edit the file in both folders.
- **Promoting an override to the standard build:** if an override should apply to BOTH embeds (and the standalone map), move it into this project's source (`css/` or `assets/`). Then it ships in `dist/` automatically and no override is needed.

## 9. What about value-add-prototype's own design system?

The slideshow has its own design tokens, components, and visual identity (see `value-add-prototype/docs/visual-identity.md`). Those govern everything **outside** the embedded map iframe — the React shell, the navigation, the non-map slides, the PDF.

The map's design system (in this project's `docs/` and `CLAUDE.md`) governs everything **inside** the map iframe.

The two design systems can differ where their goals differ (the map uses macOS HIG; the slideshow uses iPad-first flat design). Do not "harmonize" them without a deliberate decision.

## 10. Why three projects instead of one monorepo

On 2026-05-19 a plan was drafted to absorb all three projects into one monorepo (see `docs/abandoned/`). It was abandoned the same day because:

- The product owner edits map-prototype and 3d-vertical-test **every day** as primary projects, not as snapshot prototypes.
- Absorbing them would force every daily edit through value-add-prototype's heavier (Next.js) toolchain.
- Each project has its own deploy lifecycle, its own audience (the standalone map URL is used in non-pitch contexts), and its own iteration speed.

The right shape was: keep three projects, automate only the painful sync step between map-prototype and value-add-prototype. That is what `pnpm sync` does. The cross-origin tour iframe was already automatic and needed no change.

Read `docs/abandoned/README.md` before re-proposing any merger.

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `pnpm sync` says "No dist/ found" | Build step failed or was skipped | Just re-run `pnpm sync` (it builds first) |
| `pnpm sync` says "Slideshow folder not found at ..." | value-add-prototype isn't a sibling of this project | Either move it back, or update `SLIDESHOW_ROOT` in `scripts/sync-to-slideshow.js` |
| Sync output lists `index-<hash>.js` as "preserved" | Stale build artifacts that resurfaced via git restore | Already fixed — those files now get filtered out automatically |
| Slideshow still shows old map after sync | (a) you forgot to commit + push in value-add-prototype, or (b) Vercel hasn't finished deploying | Check value-add-prototype's git log, then Vercel deploys page |
| `embed-mobile-overrides.css` mysteriously disappeared from a target folder | Sync ran against an empty target (someone deleted it manually) | Restore the file from value-add-prototype's git history, re-run sync |
| The 3D tour stopped loading inside the map | 3d-vertical-test's Vercel deploy is broken, or the user is offline | Open `https://3d-vertical-test.vercel.app/value-add-journey.html` directly to check; reconnect if offline |

## 12. Files of interest

- [`scripts/sync-to-slideshow.js`](../scripts/sync-to-slideshow.js) — the sync logic (~100 lines)
- [`package.json`](../package.json) — defines `pnpm sync` and `pnpm sync:dry`
- [`CLAUDE.md`](../CLAUDE.md) — top-level rules for this project; "How this repo relates to value-add-prototype" section is the short version of this doc
- [`docs/abandoned/`](abandoned/) — the rejected merger plan
- `value-add-prototype-handoff-prompt.md` (repo root) — the prompt the product owner pastes into Claude in value-add-prototype to bootstrap the slideshow side of this workflow
