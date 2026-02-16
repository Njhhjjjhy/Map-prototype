# QA Fix: Remove Journey Transition Modals

**Date:** February 12, 2026
**Type:** Bug Fix / UX Improvement
**Status:** Complete

## Issue

Three unwanted intro modals were appearing during journey transitions:

1. "Infrastructure Plan" modal (Journey A → B transition)
2. "Investment Opportunities" modal (Journey B → C transition)
3. Completion modal (Journey end)

These modals were never requested and interrupted the narrative flow by forcing the user to click "continue" before the camera could transition to the next journey.

## Solution

Removed all three calls to `UI.showJourneyTransition()` from `app.js`:

- **Line 341:** Removed Journey A → B transition modal
- **Line 526:** Removed Journey B → C transition modal
- **Line 610:** Removed journey completion modal

## Behavior After Fix

### Journey A → B Transition
```javascript
// Old flow:
markers fade → UI exits → modal appears → user clicks → camera moves

// New flow:
markers fade → UI exits → brief pause (300ms) → camera moves directly
```

### Journey B → C Transition
```javascript
// Old flow:
markers fade → UI exits → modal appears → user clicks → More Harvest screen → camera moves

// New flow:
markers fade → UI exits → brief pause (300ms) → More Harvest screen → camera moves directly
```

### Journey Completion
```javascript
// Old flow:
UI exits → modal appears → user clicks → recap appears

// New flow:
UI exits → brief pause (600ms) → recap appears directly
```

## Files Changed

- `js/app.js` - Removed 3 calls to `UI.showJourneyTransition()`
- `BEATSHEET.md` - Updated "The Farewell" and "The Handoff" beat descriptions to reflect new transition timing

## Impact

- **Smoother narrative flow:** No interruption between journey transitions
- **Faster progression:** Removed 3 unnecessary user interactions
- **More cinematic:** Camera movements now flow directly from exit to entrance

## Notes

The `UI.showJourneyTransition()` method and `getJourneyTransitionContent()` helper still exist in `ui.js` but are no longer called. These can be removed in a future cleanup if no other use cases emerge.
