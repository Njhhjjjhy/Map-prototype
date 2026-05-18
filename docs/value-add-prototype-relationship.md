# Map prototype and value-add prototype: how they relate

A plain-English guide for the (non-developer) project owner. Read this first if you forget how the two folders fit together.

---

## There are two separate projects

On your computer:

- **Folder A: `map-prototype`** -- the interactive map. This is the project we are currently inside.
  Path: `/Users/riaan/Documents/Design Files/Code Projects/map-prototype/`
- **Folder B: `value-add-prototype`** -- the investor pitch slideshow (iPad-first, 22 steps).
  Path: `/Users/riaan/Documents/Design Files/Code Projects/value-add-prototype/`

They are independent projects with independent git histories, independent design systems, and independent build processes.

---

## The slideshow borrows the map

The slideshow (Folder B) does not have its own map. On a few slides, it opens a small window and shows the map (from Folder A) inside that window.

There are two windows in the slideshow that show the map:

| Slideshow slide | What the window shows |
|---|---|
| Step 6  -- Section 3: Map | Full map with UI. Scenes: government support, then corporate investment, then science park and grand airport. |
| Step 7  -- Section 4: Transition | Same three scenes, but the map "descends" in 3D and a quote panel appears on top. |
| Step 11 -- Section 6: Transition | Properties scene (filtered to only **Chateau Life Ozu 1**), hidden during a tilt animation. |
| Step 12 -- Section 6: Hardware  | Properties scene (filtered to only **Chateau Life Ozu 1**), shown with full UI. |

So out of all the scenes in the map (10 in total), the slideshow uses **4**:

1. `government-support`
2. `corporate-investment`
3. `transport-access` (also called "Science park and grand airport")
4. `properties` -- but filtered to only show **Ozu 1**

---

## How to change the map (the part shown in the slideshow)

> If you want to change anything about the map -- colors, markers, scenes, copy, behavior -- you change it **in Folder A**, never in Folder B.

The steps are:

1. Open Folder A (`map-prototype`, the project we are currently inside).
2. Make the change here (or ask Claude to).
3. Claude runs one command (`pnpm build`) to "build" the map. Takes about a second.
4. Claude copies the built map into Folder B's special location.
5. Open Folder B (`value-add-prototype`) and check that slides 6, 7, 11, and 12 still look right.

That is the whole workflow.

---

## Why "the copy step is broken" right now (March 2026)

Currently, Folder B contains a stale, hand-edited copy of the map. Someone took an old build of the map and pasted ~870 lines of extra code on top of it so the slideshow could talk to the iframe (tell it which scenes to show, when to hide its UI, when the user has finished, etc.).

This means a normal "copy the new build over" would **overwrite those hand-edits** and break slides 6, 7, 11, and 12.

**Path B (the proper fix)** moves all 870 lines of hand-edits INTO Folder A's source code, gated so they only run when the map is loaded as an iframe (with `?embed=1` in the URL). After Path B, the live deployed map is unchanged, but the build output of Folder A is now exactly what Folder B needs -- no hand-editing required.

After Path B, the workflow becomes truly one-step:

1. Change the map in Folder A.
2. Claude builds and copies. Done.

---

## What lives where -- quick reference

**Folder A (`map-prototype`):**
- Source for the map: `index.html`, `css/`, `js/`, `assets/`.
- Build output: `dist/` (created when Claude runs `pnpm build`).
- Documentation: `docs/`, `CLAUDE.md`.

**Folder B (`value-add-prototype`):**
- The slideshow code: `src/`.
- The embedded map (copied from Folder A's build): `public/playground/prototypes/step-6-section-3-map/map-prototype-v1/` and `public/playground/prototypes/step-12-section-6-product-hardware/map-prototype-v1/`.
- The React wrapper that loads the iframe: `src/components/shared/MapHost.tsx` and `src/components/shared/PropertyMapHost.tsx`.
- The slide files that use the map: `src/components/steps/step-6-*`, `step-7-*`, `step-11-*`, `step-12-*`.

---

## How Claude decides which project to work on

When you invoke `/feature <name>` to start a new feature branch, Claude must ask:

> "Is this work for the map (this project), or for value-add-prototype (the slideshow that embeds the map)?"

- If **map**: work happens here in Folder A only. Normal feature branch flow.
- If **value-add-prototype**: work likely changes the map AND requires a fresh build + copy into Folder B. Claude makes the changes here, builds, copies into Folder B, and tells you to test in the slideshow before any commit.

This rule is also recorded in `CLAUDE.md` under Process Rules so Claude never forgets.

---

## A note on git

Folder A and Folder B are separate git repositories. A change in Folder A produces a commit in Folder A's repo. The copy-into-Folder-B step produces files inside Folder B, which (if committed) produces a separate commit in Folder B's repo. The two commits are independent and live in different histories.

When Path B is in place, the contract between them is: "a fresh build of Folder A is exactly what Folder B needs." Both sides of that contract have to land before the slideshow shows the new map.
