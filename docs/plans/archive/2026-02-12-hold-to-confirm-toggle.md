# Hold-to-Confirm: Future/Present Toggle Replacement

**Date:** 2026-02-12
**Branch:** `feat/hybrid-presentation`
**Goal:** Replace the Present/Future segmented toggle with a hold-to-confirm interaction embedded in the chatbox, eliminating toolbar stacking issues.

---

## Problem

The Present/Future segmented toggle (`#control-bar > #time-toggle`) and the journey progress bar (`#journey-progress`) were both absolutely positioned at the top-center of the map (`top: var(--space-4); left: 50%; transform: translateX(-50%)`). During Journey B Step 6, both are visible simultaneously, causing them to stack on top of each other.

### Failed Fix Attempt

The QA fix moved the control bar from center (`left: 50%`) to right-aligned (`right: var(--space-6)`). This caused the toggle to disappear because:

- The right panel is `position: fixed; right: 0; width: 380px; z-index: 1000`
- The control bar inside `#map-container` at `right: 24px` with `z-index: 500` renders directly behind the panel
- The map container is `flex: 1` and takes full viewport width (panel overlays, doesn't push)

A second proposed fix (keeping center alignment but moving the control bar below the progress bar at `top: 60px`) was rejected — no vertical stacking of toolbar elements is acceptable.

### Root Cause

The design has two competing centered toolbar elements at the same vertical position. Any positional fix (left, right, below) either hides the toggle behind other UI or creates unwanted visual stacking.

---

## Solution: Hold-to-Confirm Interaction

Inspired by [motion.dev/examples/react-hold-to-confirm](https://motion.dev/examples/react-hold-to-confirm). Replace the separate toolbar toggle with a press-and-hold CTA button embedded directly in the chatbox at step B6.

### Interaction Flow

```
    DEFAULT                  HOLDING                  CONFIRMED
   +------------+  mousedown +------------+  800ms   +--------------------+
   | outlined   | ---------> | fill       | -------> | solid yellow       |
   | "See       |            | animating  |          | "Viewing Future    |
   |  Future    | <--------- | left->right|          |  Plans" + check    |
   |  Plans"    |  mouseup   +------------+          |                    |
   +------------+  (resets)                           | [Back to Present]  |
                                                      +--------+-----------+
                                                               | click
                                                      +--------v-----------+
                                                      | PRESENT VIEW       |
                                                      | Button re-enables  |
                                                      | for another hold   |
                                                      +--------------------+
```

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Button location | Inside chatbox | Eliminates all toolbar positioning conflicts; chatbox is bottom-left, far from progress bar |
| Interaction type | Hold-to-confirm (permanent) | Presenter needs hands free after activating future view to click evidence options; peek-and-release would block other interactions |
| Hold duration | 800ms | Short enough to feel responsive, long enough to prevent accidental activation |
| Reset mechanism | "Back to Present View" text link | Tertiary button below the confirmed CTA; simple click, no hold needed |
| Old toggle code | Left dormant | HTML stays `class="hidden"`, CSS/JS methods remain but are never called; prevents null reference errors |
| Reduced motion | Single click | `prefers-reduced-motion` users get instant confirm without hold animation |

### Visual Design

- **Default state:** Outlined button with `border: 1.5px solid --color-primary`, transparent background, clock icon
- **Holding:** `::before` pseudo-element fills left-to-right with brand yellow (`--color-primary`), 800ms linear transition on `scaleX(0)` to `scaleX(1)`
- **Released early:** Fill retracts smoothly (300ms ease)
- **Confirmed:** Solid yellow background, checkmark icon, text "Viewing Future Plans", `pointer-events: none`
- **Back to Present:** Tertiary text link with left arrow, resets to default state

---

## Files Changed

| File | Changes |
|------|---------|
| `css/styles.css` | Added `.hold-to-confirm` button styles (~80 lines) with `::before` progress fill, `.holding`, `.resetting`, `.confirmed` states, `.hold-to-confirm-reset` tertiary button. Added reduced-motion rules. |
| `js/ui.js` | Added `setTimeViewFromHold(view)` — calls MapController directly, no toggle DOM dependency. Added `initHoldToConfirm(button, onConfirm, options)` — handles mouse/touch/keyboard hold with timer. Added `resetHoldToConfirm()` for cleanup. Added re-init in `_setChatboxContent()` for chatbox history restore. |
| `js/app.js` | Rewired `stepB6()` to embed hold button in chatbox. Added `resetToPresent()` method. Updated `stepB7()` and `transitionToJourneyC()` to use `setTimeViewFromHold()`. Removed 5 orphaned calls: `showControlBar()`, `showTimeToggle()`, `hideTimeToggle()`, `hideControlBar()` (x2). |
| `index.html` | No changes — `#control-bar` HTML stays dormant with `class="hidden"` |

### New Methods

**`UI.initHoldToConfirm(button, onConfirm, options)`**
- Attaches mousedown/mouseup/touchstart/touchend/keydown/keyup listeners
- Manages `.holding` / `.resetting` / `.confirmed` class transitions
- 800ms `setTimeout` triggers confirmation
- Prevents context menu on long press (mobile)
- Stores `_holdCleanup` on element for teardown
- `prefers-reduced-motion` converts to single click

**`UI.setTimeViewFromHold(view)`**
- Calls `MapController.showFutureZones()` or `hideFutureZones()` directly
- Decoupled from the old toggle DOM elements

**`App.resetToPresent()`**
- Reverts future view, restores hold button to default state, re-initializes hold listener
- Called from the "Back to Present View" button `onclick`

### Chatbox History Handling

The chatbox stores content as innerHTML for back navigation. When content is restored from history, the hold button's event listeners are lost. Fixed by adding a re-initialization check in `_setChatboxContent()` — after setting innerHTML, if a `.hold-to-confirm` element exists and the current step is B6, `initHoldToConfirm()` is called again.

---

## Dependency Chain

```
stepB6() ---> UI.updateChatbox() ---> .hold-to-confirm button in DOM
          |                       |
          +-> UI.initHoldToConfirm() ---> mousedown handler
                                          |
                                          +-> 800ms timer
                                          |     |
                                          |     +-> .confirmed class
                                          |     +-> UI.setTimeViewFromHold('future')
                                          |           +-> MapController.showFutureZones()
                                          |
                                          +-> mouseup (early) ---> .resetting class (300ms retract)

App.resetToPresent() ---> UI.setTimeViewFromHold('present')
                     |      +-> MapController.hideFutureZones()
                     +-> restore button HTML + re-init listeners

stepB7() ---> UI.resetHoldToConfirm() (cleanup)
         +-> UI.setTimeViewFromHold('present')
```

---

## What Remains Dormant

The following code is no longer called but was intentionally kept to avoid null reference errors and allow easy rollback:

- **HTML:** `#control-bar`, `#time-toggle`, `#present-btn`, `#future-btn` (lines 61-66 in index.html)
- **CSS:** `#control-bar`, `#time-toggle`, `.time-btn`, `.time-btn.active`, `@keyframes toggleCoachmark`, `#time-toggle.coachmark` (lines 661-730 in styles.css)
- **JS:** `UI.elements.controlBar`, `UI.elements.timeToggle`, `UI.elements.presentBtn`, `UI.elements.futureBtn`, `UI.showControlBar()`, `UI.hideControlBar()`, `UI.showTimeToggle()`, `UI.hideTimeToggle()`, `UI.setTimeView()`, click event listeners for present/future buttons
