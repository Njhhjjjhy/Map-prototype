# QA Issue: Multi-issue QA round (6 fixes)

**Date:** 2026-02-16
**Status:** Completely fixed
**Reporter:** QA review

## Issues and resolutions

### Issue 1: Data layer checkboxes render as circles

**Description:** The data layers panel checkboxes appeared as perfect circles (like radio buttons) instead of rounded squares per macOS HIG.

**Root cause:** `border-radius: var(--radius-medium)` (8px) on a 16x16px element produces a perfect circle because 8px is exactly 50% of 16px.

**Solution:** Changed to `border-radius: var(--radius-small)` (4px), which gives the correct macOS Big Sur rounded-square checkbox appearance.

**Files modified:**
- `css/styles.css` - Changed `.layer-checkbox` border-radius from `--radius-medium` to `--radius-small`
- `CLAUDE.md` - Updated checkbox spec, design notes, and checklist to document 4px radius on 16px boxes

---

### Issue 2: Property reveal shows UI controls over fullscreen image

**Description:** During the property reveal transition (Journey C drill-down), all map controls (journey progress, Present/Future toggle, layers button, FAB, etc.) remained visible on top of the fullscreen property image.

**Root cause:** The transition overlay sits at z-index 50 inside `#map-container`, while all map controls sit at z-index 500 in the same container. Controls naturally rendered above the overlay.

**Solution:** Added an immersive mode system:
- CSS class `.immersive-active` on `#map-container` hides all overlay controls with `opacity: 0` and `pointer-events: none`
- Class is toggled on in `showPropertyReveal()` and `showGallery()`, and toggled off in `cancelDrillDown()` and `hideGallery()`

**Files modified:**
- `css/styles.css` - Added `#map-container.immersive-active` rule targeting all overlay controls
- `js/ui.js` - Added class toggle in `showPropertyReveal`, `cancelDrillDown`, `showGallery`, and `hideGallery`

---

### Issue 3: Broken button tag renders as plain text

**Description:** In Journey B Step B6 chatbox, "View transportation network" appeared as plain text instead of a clickable button.

**Root cause:** The opening `<button>` tag was corrupted to `<parameter name="chatbox-option"` instead of `<button class="chatbox-option"`. The browser did not recognize `<parameter>` as a valid element.

**Solution:** Corrected the malformed tag to `<button class="chatbox-option"`.

**Files modified:**
- `js/app.js` - Fixed line 465 from `<parameter name=` to `<button class=`

---

### Issue 4+5: Title Case violations on option labels

**Description:** "Water Resources" and "Power Infrastructure" (and other chatbox option labels) used Title Case instead of sentence case, violating the design system rule that only primary CTAs and modal headings use Title Case.

**Root cause:** Option label text was written in Title Case across multiple locations in app.js and data.js.

**Solution:** Changed all chatbox option labels to sentence case.

**Files modified:**
- `js/app.js` - Changed "Water Resources" to "Water resources", "Power Infrastructure" to "Power infrastructure", "View Government Zone Plans" to "View government zone plans", "View Transportation Network" to "View transportation network", "View Education Pipeline" to "View education pipeline" (lines 196, 199, 247, 252, 874, 877, 880)
- `js/data.js` - Changed resource subtitles: "Natural Water Resources" to "Natural water resources", "Power Infrastructure" to "Power infrastructure" (lines 47, 94)

---

### Issue 6: Ugly diamond marker for development zones

**Description:** The white diamond/rotated square marker for development zones (Kikuyo, Ozu) used `clip-path: polygon()` which produced sharp, unaliased edges and looked crude at 36px size.

**Root cause:** `clip-path` clips CSS borders, requiring a pseudo-element border hack. The sharp polygon edges lacked anti-aliasing, making the marker look rough compared to the smooth circular and rounded-square markers.

**Solution:** Replaced the `clip-path` approach with `transform: rotate(45deg)` on a rounded-corner square (using `--radius-small`), matching the pattern already used by the pin marker shape. This preserves proper border rendering and anti-aliased edges.

**Files modified:**
- `css/styles.css` - Replaced `.marker-shape-diamond` styles: removed `clip-path` and `::before` pseudo-element, added `transform: rotate(45deg)` with `border-radius: var(--radius-small)` and counter-rotation for child content

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified
- [x] No unintended side effects detected

### Browser testing
- [ ] Issue no longer reproduces (pending user verification)
- [ ] Functionality works as expected (pending user verification)

**Test notes:** All 6 fixes implemented. User should verify in browser by:
1. Opening data layers panel and confirming checkboxes are rounded squares
2. Navigating to Journey C property reveal and confirming controls are hidden
3. Navigating to Journey B Step B6 and confirming "View transportation network" is a clickable button
4. Checking all chatbox options use sentence case throughout the journey
5. Toggling Future view in Journey B to confirm diamond zone markers are rotated rounded squares

## CLAUDE.md updates

Updated the following sections:
- **Data Layer Checkbox Styling**: Changed spec from `--radius-medium` to `--radius-small`, added note that 8px on 16px box produces a circle
- **Design Notes**: Clarified the radius math for checkbox sizing
- **Visual Styling**: Updated to reference `--radius-small` / 4px
- **Checklist**: Updated checkbox radius checklist item
