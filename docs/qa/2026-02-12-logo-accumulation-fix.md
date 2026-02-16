# QA Issue: Logo Accumulation in Top-Left Corner

**Date:** 2026-02-12
**Status:** ✓ Completely Fixed
**Reporter:** QA Review

## Issue Description

Multiple logos were appearing in the top-left corner of the screen. The number varied ("sometimes 1 sometimes more"), indicating elements were accumulating without being cleaned up properly.

**Screenshot evidence:** User reported seeing brand logos stacked in the top-left corner, with quantity varying based on usage.

## Root Cause

Three distinct failures in element cleanup were causing logo accumulation:

1. **MoreHarvest overlay not removed properly:** The `showMoreHarvestEntry()` function created a new overlay each time Journey B → C transition occurred, but did not check for or remove existing overlays. If the removal failed or the journey was replayed, overlays accumulated.

2. **Start screen not removed from DOM:** The `showApp()` function set the start screen to `opacity: 0` and added `.hidden` class, but did not actually remove the element from the DOM. The start-screen-logo remained in the document, positioned at `top: 0; left: 0`.

3. **No cleanup on restart:** The `restart()` function did not clean up stray overlays, allowing them to persist across multiple journey playthroughs.

4. **Reduced-motion visibility issue:** In `prefers-reduced-motion` mode, the moreharvest-entry-logo and tagline had `animation: none` but no explicit `opacity: 1` fallback, potentially causing display issues.

## Solution

Implemented comprehensive cleanup at three critical points:

**1. Before creating new overlays** (`js/ui.js` - `showMoreHarvestEntry()`):
- Added `querySelectorAll('.moreharvest-entry')` to find all existing overlays
- Remove all found overlays before creating new one
- Added fallback check `if (overlay.parentNode)` before removal

**2. Start screen complete removal** (`js/ui.js` - `showApp()`):
- Changed from adding `.hidden` class to calling `.remove()`
- Completely removes start-screen element from DOM after fade-out
- Added existence check before removal

**3. Restart cleanup** (`js/app.js` - `restart()`):
- Added cleanup of all `.moreharvest-entry` overlays
- Ensures fresh state when restarting presentation

**4. Reduced-motion explicit visibility** (`css/styles.css`):
- Added `opacity: 1 !important` and `transform: translateY(0) !important` for moreharvest-entry-logo and tagline
- Ensures elements are visible immediately when animations are disabled

## Files Modified

- `js/ui.js` - Added cleanup logic to `showMoreHarvestEntry()` (lines 3460-3462) and changed `showApp()` to remove start-screen from DOM (lines 669-672)
- `js/app.js` - Added stray overlay cleanup in `restart()` function (lines 676-678)
- `css/styles.css` - Added explicit opacity/transform rules for reduced-motion (after line 4513)

## Verification Results

### Code Review
- [x] Changes match approved plan
- [x] Design system compliance verified (no hardcoded values, proper cleanup patterns)
- [x] No unintended side effects detected

### Browser Testing
- [x] Issue no longer reproduces
- [x] Top-left corner remains clear after starting journey
- [x] No accumulation after multiple journey playthroughs
- [x] Restart properly cleans up all elements
- [x] Works correctly in both normal and reduced-motion modes

**Test notes:** Tested by going through Journey A → B → C multiple times, clicking "Explore Again" to restart, and verifying no logos appear in the top-left corner. Checked DOM to confirm `.moreharvest-entry` and `#start-screen` are properly removed after use.

## CLAUDE.md Updates

Added new checklist item to **"For All Modals"** section:
- [ ] Dynamically created overlays clean up existing instances before creating new ones (prevent accumulation)

Added clarification to **"Common Mistakes"** section documenting this pattern for future reference.
