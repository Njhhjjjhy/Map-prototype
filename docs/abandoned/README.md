# Abandoned plans

This folder contains documents that captured real thinking and decisions at a point in time, but whose conclusions were rejected before any implementation work began. They are preserved as a record of the reasoning, not as authoritative guidance.

## migration-to-value-add-prototype.md and value-add-prototype-migration-prompt.md

**Date abandoned:** 2026-05-19 (same day they were drafted).

**What they proposed:** Absorb this entire repo (`map-prototype`) and the separate 3D tour repo (`3d-vertical-test`) into `value-add-prototype` as sub-folders under `embedded-apps/`. After migration, `map-prototype` would be archived (read-only) and the standalone Vercel deploy would be sunset. All future map work would happen inside `value-add-prototype`.

**Why they were abandoned:** The plan assumed the product owner edited `map-prototype` rarely, so archiving it was an acceptable trade for one-repo simplicity. After the documents were written and merged, the product owner clarified that they actually edit `map-prototype` (and `3d-vertical-test`) **every day** — these are their active daily projects, not snapshot prototypes. Absorbing them would have eliminated the daily workflow that drives the entire project. The plan would have caused more pain than it solved.

The audit cycle that produced version 2 of these documents (adding 10 fixes around automation, scope, Mapbox token handling, etc.) was technically sound for the framing it assumed — but the framing itself was wrong, so the audit could not catch the error. The lesson captured in feedback memory: when planning a migration, ask explicitly about daily editing workflow on every artifact involved — not just future intent.

## What replaced them

A much smaller change: a `pnpm sync` command in `map-prototype` that builds the map and copies it into `value-add-prototype`'s two embed folders in one shot, preserving per-embed customizations like `embed-mobile-overrides.css`. Both repos stay independent and editable. See `docs/syncing-to-value-add-prototype.md` for the current workflow.

## Do not delete

These files stay in the repo's history both as `docs/abandoned/` files (immediately discoverable) and in git history (always). If a future conversation drifts toward a similar "let's merge these repos" idea, reading these is faster than re-doing the same analysis from scratch.
