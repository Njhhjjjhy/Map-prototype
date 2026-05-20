Here's the raw markdown:

```markdown
# Plan revision: shared map package as the single source of truth

> **What this is.** A revision of your three-project / `pnpm sync` plan (2026-05-19). It keeps everything you got right — three independent projects, offline-capable investor pitches, no merger — but replaces the *copy-and-restore* sync mechanism with a **shared, versioned map package** that both the standalone map and the pitch deck consume as a build-time dependency. The goal you stated stands: one source of truth, no duplicated code, consumers import it instead of holding a copy.
>
> **What I want you to read first:** §2 (the constraint we cannot break) and §7 (what this does *not* eliminate). The "seamless / zero-touch update" framing is only partly achievable and I want us aligned on exactly which part, so we don't ship a plan that over-promises.

---

## 1. The one-line difference from your plan

Your plan: `map-prototype` builds, a script **copies** `dist/` into two folders inside `value-add-prototype`, then re-overlays the per-embed CSS, and those copied files get **committed** into `value-add-prototype`.

This revision: the reusable map becomes a **package** (`@moreharvest/map-core`). `map-prototype` becomes a thin app that imports it. `value-add-prototype` adds it as a **build-time dependency** and imports it too. Nothing is copied. Nothing map-related is committed into `value-add-prototype` except a dependency reference. Refreshing the embedded map = bump the dependency and rebuild.

Everything else in your plan — the three projects staying independent, the offline snapshot for pitches, no monorepo, the `/feature finish` automation idea — survives, recast around the package.

---

## 2. The constraint we cannot break (and your plan was right about this)

Your §3 makes the call that the embedded map must be an **offline-capable build-time snapshot**, not a live iframe, because investor pitches happen on unreliable wi-fi and a dropped network mid-pitch is unacceptable. **That reasoning is correct and this revision keeps it.**

This is the crucial point: a shared package does **not** mean a live runtime link. The package is consumed at **build time**. When `value-add-prototype` builds, the map code is bundled into *its own* build output, exactly as offline-capable as the copied snapshot is today. The difference is purely *how the bytes get there*: a resolved dependency + bundler, instead of a bespoke copy script writing into the repo.

So "use the shared library directly, seamlessly updated" needs one precise correction before it goes to the colleague: the library is shared and is the single source of truth, but the pitch deck still **rebuilds to absorb an update** — it does not fetch the latest map at pitch time. Anything that fetched at runtime would re-break the offline requirement you already solved. Keep the build step; kill the copy step.

---

## 3. "Isn't this the monorepo/merger you already rejected?" — No

You explicitly preempted a re-proposed merger, and you were right to. This is not that. The distinction, stated plainly so the colleague can check it:

- **The abandoned monorepo** forced your *daily editing* of `map-prototype` and `3d-vertical-test` through `value-add-prototype`'s heavier Next.js toolchain. That broke your workflow. That objection is valid and permanent.
- **A shared package** does the opposite. `map-prototype` keeps its own repo, its own Vercel deploy, its own Vite toolchain, its own daily `pnpm dev`. You still edit the map *in the map project, with the map's tooling*. `value-add-prototype` only ever sees a finished, versioned artifact — it never pulls map source into its editing loop. No repo is absorbed. No daily workflow moves toolchains.

One concrete guardrail to make this true: **do not use a pnpm workspace / linked monorepo** for distribution. A workspace would re-create exactly the coupling that was abandoned. Use a versioned dependency instead (§5). If the colleague's first reaction is "this is the monorepo again," this section and §5 are the answer.

---

## 4. What actually goes in the package (and what doesn't)

Only the map is duplicated today, so only the map needs to become a package. The 3D tour is already iframed live and has zero duplication — it is **unchanged** by this plan.

`@moreharvest/map-core` contains the reusable map: Mapbox setup, markers, interaction logic, the Ozu-1 tap-to-iframe-the-tour behavior — the parts that are identical in the standalone deploy and in every embed.

It deliberately excludes: the standalone app shell (page chrome, routing, anything that only makes sense at the standalone URL) and per-embed presentation (the step-6 vs step-12 styling). Those become **consumer responsibilities**, passed in as configuration (§6).

API shape — important technical detail for the colleague: `map-prototype` is vanilla JS + Mapbox; `value-add-prototype` is Next.js + React. So the package must expose a **framework-agnostic mount API**, not a React component:

```js
import { mountMap } from '@moreharvest/map-core'
const handle = mountMap(targetEl, { theme, chrome, tourEmbedUrl, ... })
// handle.destroy() for cleanup; React side wraps this in a useEffect
```

The vanilla standalone app calls `mountMap` directly. The React app calls it from an effect inside a thin wrapper component. Same core, two host frameworks, zero divergence.

---

## 5. Distribution: how `value-add-prototype` gets a specific version

This is the mechanism that replaces `pnpm sync`. Three options, with a recommendation:

| Option | How an update propagates | Infra needed | Verdict |
|---|---|---|---|
| **Git-tag dependency** (recommended) | Tag `map-prototype` (e.g. `map-core-v1.4.0`); in `value-add-prototype`, point the dependency at that tag; `pnpm install`; rebuild | None — the repo is already on GitHub (`moreharvest/interactive-map-prototype`) | **Default.** No new infra, repos stay independent, no monorepo, semver-ish via tags. |
| **Private registry / GitHub Packages** | `pnpm publish` from `map-prototype`; bump semver range in `value-add-prototype` | A registry / GH Packages auth | Clean semver, but added publish infra. Reserve as an upgrade path if versioning gets busy. |
| **pnpm workspace** | Automatic link | Monorepo | **Rejected** — re-creates the abandoned coupling (§3). |

Git-tag dependency is the sweet spot: it gives the single-source-of-truth and no-copied-code wins with essentially no new infrastructure, and it cannot be mistaken for a merger.

---

## 6. Per-embed customization gets *better*, not preserved-by-hand

Today the sync script's most fragile job is: wipe the target folder, copy the build in, then carefully re-overlay `embed-mobile-overrides.css` (translucent macOS chrome for step-6, flat iPad chrome for step-12), while filtering stale `index-<hash>` artifacts so they don't masquerade as customizations. That whole dance exists *because* the mechanism is file copying.

Under the package model that dance disappears. step-6 and step-12 styling become **arguments**:

```js
mountMap(el, { theme: 'translucent-macos' })   // slides 6 / 7
mountMap(el, { theme: 'flat-ipad' })           // slides 11 / 12
```

The customizations are now first-class configuration owned by `value-add-prototype`, version-controlled there as intent rather than as files-to-rescue-after-every-wipe. There is no "stale artifact filtering" because nothing is being wiped. This is a genuine robustness gain, not just a relocation of the problem — it removes an entire class of "the script ate my override" failure.

A secondary win: the standalone map and the embedded map are now provably the same code (same package version), so the silent drift that copy-based syncing can hide becomes impossible.

---

## 7. What this does NOT eliminate (read before sending to the colleague)

Honesty here protects the plan's credibility:

- **A propagation step still exists.** To refresh the embedded map you still bump the dependency and rebuild `value-add-prototype`. The win is *what* that step is: a clean, toolchain-native version bump instead of a bespoke wipe-copy-restore script. It is not zero-touch and the plan should not claim it is.
- **There is upfront extraction work.** Separating the reusable core from the app shell and defining a stable `mountMap` config API is real work, done once. The current sync script works *now*; this is an investment that pays back over many future edits, not a free swap.
- **You version an API now.** Once `value-add-prototype` depends on `@moreharvest/map-core`, breaking the config shape breaks the deck's build. That is a feature (drift becomes a loud build error instead of a silent visual bug) but it is a discipline the copy approach didn't demand.
- **The 3D tour is untouched.** It is iframed live by design; no package, no change. Don't let the "single source of truth" framing sweep it in.

Net: this is "one source of truth, no duplicated committed code, no fragile copy script, no possible drift, cleaner customization" — bought with one-time extraction and an API-versioning discipline. That is a strong trade, but state it as a trade.

---

## 8. Migration path (incremental, low-risk, your current workflow keeps working throughout)

The good news: this can land *without* a flag day, and `pnpm sync` keeps working until the package fully replaces it.

1. **Extract.** Pull the reusable map core out of `map-prototype` into a `packages/map-core` (or a sibling) with a `mountMap` entry point. `map-prototype`'s standalone app is refactored to consume its own core via the new API. Standalone deploy must look identical — that's the regression gate.
2. **Tag** the first version (`map-core-v1.0.0`).
3. **One embed first.** Switch only the step-12 embed in `value-add-prototype` to the package dependency + `theme: 'flat-ipad'`. Verify slides 11/12 offline (airplane mode test — this is the real acceptance test, not just `pnpm dev`).
4. **Second embed.** Switch step-6 → `theme: 'translucent-macos'`. Verify slides 6/7 offline.
5. **Retire the copy.** Once both embeds run off the package, delete `scripts/sync-to-slideshow.js`, `pnpm sync`, and the committed copied map folders from `value-add-prototype`. Update the architecture doc and both `CLAUDE.md`s.

At every step before 5, the old `pnpm sync` path still exists as a fallback, so a failed extraction never blocks a pitch.

---

## 9. Part 2 recast: auto-propagation on `/feature finish`, library edition

Your Part 2 goal still holds and gets *simpler*, because the step being automated is now "bump a version and rebuild" rather than "run a copy script then restore overrides."

What `/feature finish` in `map-prototype` does after a map-affecting merge:

1. *(Existing)* Apply review comments, merge PR, return to master, pull.
2. **(NEW)** Tag the new `map-core` version.
3. **(NEW)** `cd ../value-add-prototype`, update the dependency to the new tag, `pnpm install`, run a build to confirm the embeds compile and render.
4. **(NEW)** Show the diff (it will essentially be the lockfile + dep line — much smaller and more reviewable than today's bulk-copied `dist/`).
5. **(NEW)** Ask: "Commit the bump and `/feature finish` in `value-add-prototype`?" → on yes, branch, commit, PR, merge, both Vercel deploys fire.
6. **Report** both deployed URLs.

Edge cases map cleanly onto yours: "nothing to sync" → "the merge didn't change map-core, no version bump needed, skip 2–6"; "build error" → stop and report, `map-prototype` merge already succeeded, fix the API/consumer and re-bump; "unrelated uncommitted changes in `value-add-prototype`" → same prompt as your plan. The orchestration shape is identical to your §5; only the mechanical middle step changed from *copy* to *version-bump + build*.

---

## 10. Re-answering your three questions, under this model

**Q1 — Is this the design you want?** This revision says: yes to your goal and your constraints, but the mechanism becomes a versioned package, not a copy script. The decision for the colleague is whether the one-time extraction (§7, §8) is worth retiring the sync script permanently. My recommendation: yes, because the fragile wipe/restore/stale-artifact logic is exactly the kind of code that breaks silently right before a pitch.

**Q2 — Step-8 default (one-confirmation vs. pause-at-each-step).** Under the package model the propagated change is small and reviewable (a dependency bump, not a bulk file copy), and the build in step 3 of §9 catches breakage *before* anything is committed. That makes **(a) one confirmation upfront** the reasonable default here, with the build acting as the safety gate. Still pause on the explicit edge cases (unrelated changes, build failure).

**Q3 — `3d-vertical-test` end-of-finish reminder.** Unchanged from your plan; the tour stays iframed live and outside the package. A one-line "tour deployed, consumers pick it up on next load, no action needed" reminder is still fine and still needs its own small feature branch in that repo. Not blocking.

---

## 11. Open decisions I need from the colleague

1. **Distribution mechanism:** git-tag dependency (my recommendation, §5) vs. private registry. Pick one; it changes the tagging/publish step in §9.
2. **Package boundary:** confirm the split in §4 — core = map+markers+tour-tap behavior; consumer-owned = app shell + per-embed theming. If the colleague wants more or less in the core, say so before extraction starts.
3. **Extraction owner & timing:** §8 step 1 is the only substantial chunk of work. Who does it, and does it block on anything currently shipping through the existing `pnpm sync`?
4. **Acceptance test:** confirm that "embeds verified in airplane mode" (not just `pnpm dev`) is the gate for steps 3–4 of §8, since the offline guarantee is the whole reason the snapshot exists.

Answer 1–4 and the extraction can start without disturbing the current daily workflow.

---

## 12. What stays exactly as in your plan

- Three independent projects, three repos, three Vercel deploys, three daily editing loops.
- Offline-capable embedded map for pitches (preserved by build-time bundling, §2).
- No monorepo, no merger, no archive (§3).
- No new `/feature`-style skill; behavior lives in `CLAUDE.md` rules as you proposed.
- The map → 3D-tour live cross-origin iframe contract — untouched.
- `3d-vertical-test` propagation (none needed) — untouched.

The only thing being retired is `scripts/sync-to-slideshow.js` and the committed copied map folders. Everything else is preserved or improved.
```