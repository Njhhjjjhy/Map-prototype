# QA Issue: Present/future toggle missing in dashboard mode

**Date:** 2026-02-18
**Status:** Fixed
**Reporter:** QA Review

## Issue description

When clicking "I've seen this before" on the start screen, the present/future time toggle does not appear. Dashboard mode explicitly hides the toggle, preventing users from viewing future development zones.

## Root cause

`startDashboardMode()` in `js/ui.js` contained explicit code to hide the time toggle:

```javascript
const timeToggle = document.getElementById('time-toggle');
if (timeToggle) timeToggle.classList.add('hidden');
```

Dashboard mode was originally designed to skip all journey content, and the toggle was hidden as part of that. However, the present/future view is essential for users who have already seen the presentation and want to explore freely.

## Solution

Replaced the hide logic with `showTimeToggle()` and `setTimeView('present')`. This shows the toggle with the coachmark pulse animation and initializes it to the "present" view. The existing `setTimeView()` method works independently of journey state, calling `MapController.showFutureZones()` / `MapController.hideFutureZones()` directly.

## Files modified

- `js/ui.js` - `startDashboardMode()`: replaced two lines that hid the time toggle with calls to show it and set initial state

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified
- [x] No unintended side effects detected

### Browser testing
- [ ] Issue no longer reproduces
- [ ] Functionality works as expected
- [ ] Edge cases tested (if applicable)

**Test notes:** Awaiting user browser verification.

## CLAUDE.md updates

None - existing rules were sufficient. The Dashboard Mode section in CLAUDE.md already documents that the time toggle should be available in dashboard mode (it lists data layers as "Available" in both journey and dashboard modes). The implementation simply did not match the spec.
