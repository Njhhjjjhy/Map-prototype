# Present/Future Toggle: Redesign with Original Segmented Control

**Date:** 2026-02-12
**Branch:** `feat/hybrid-presentation`
**Goal:** Restore the original Present/Future segmented toggle UI with a new positioning strategy that eliminates toolbar conflicts.

---

## Problem Recap

The hold-to-confirm implementation was a workaround for a positioning conflict:
- The Present/Future toggle (`#time-toggle`) and journey progress bar (`#journey-progress`) both occupied top-center position
- Attempts to move the toggle right or below failed due to panel overlap and vertical stacking constraints
- Current solution embeds interaction in chatbox, which is non-standard and disconnected from the map

---

## Solution: Top-Left Map Control Positioning

Restore the original segmented control toggle and position it as a **permanent map control** in the top-left corner, mirroring the top-right control cluster.

### Design Rationale

| Constraint | How This Solves It |
|------------|-------------------|
| No stacking with progress bar | Toggle at top-left, progress bar at top-center — completely separate |
| No right panel overlap | Left side has no panel, full clearance guaranteed |
| No vertical stacking | Single control at its position, no elements above/below |
| Visual balance | Mirrors right-side controls (panel toggle, dashboard toggle, layers toggle) |
| Persistent visibility | Always visible when needed, not buried in chatbox |

---

## Layout Comparison

### Before (Conflicting)
```
┌────────────────────────────────────────────────────────┐
│              [Progress Bar]                            │ ← top-center
│              [Present/Future Toggle]                   │ ← STACKING CONFLICT
│                                                        │
│  Map Content                                          │
└────────────────────────────────────────────────────────┘
```

### After (Resolved)
```
┌────────────────────────────────────────────────────────┐
│ [Present/Future]       [Progress Bar]     [Controls]  │
│  ← top-left           ← top-center         ← top-right
│                                                        │
│  Map Content                                          │
└────────────────────────────────────────────────────────┘
```

---

## Component Specification

### Toggle Position

```css
#time-toggle {
  position: absolute;
  top: var(--space-4);     /* 16px from top */
  left: var(--space-3);    /* 12px from left - aligns with layers toggle */
  z-index: 500;            /* Same as other map controls */
}
```

### Visual Design (Unchanged)

The segmented control design remains exactly as it was:

```css
#time-toggle {
  /* Container */
  display: inline-flex;
  gap: 1px;                /* Hairline separator */
  padding: 2px;            /* Tight outer padding */
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
}

.time-btn {
  /* Segment button */
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-medium) - 2px);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-standard);
}

.time-btn.active {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-subtle);
}
```

### Interaction Behavior (Unchanged)

- **Click Present**: Hides development zones, shows current state
- **Click Future**: Shows development zones with yellow overlay
- **Active state**: Visual feedback on selected segment
- **Step B6 entrance**: Toggle appears with coachmark animation (existing)
- **Step B7+**: Toggle remains visible until journey transition

---

## Files Changed

| File | Changes |
|------|---------|
| `css/styles.css` | **Remove** `.hold-to-confirm` styles (~80 lines). **Update** `#time-toggle` position from `left: 50%; transform: translateX(-50%)` to `left: var(--space-3)`. Remove `class="hidden"` dormant state styles. |
| `js/ui.js` | **Remove** `initHoldToConfirm()`, `resetHoldToConfirm()`, `setTimeViewFromHold()` methods. **Restore** original `setTimeView(view)` method with toggle DOM dependency. Remove hold re-init logic from `_setChatboxContent()`. |
| `js/app.js` | **Rewrite** `stepB6()` to remove hold button HTML from chatbox. **Restore** `showTimeToggle()`, `hideTimeToggle()` calls. Update `stepB7()` to use `UI.setTimeView('present')`. Remove `resetToPresent()` method. |
| `index.html` | **Remove** `class="hidden"` from `#control-bar` and `#time-toggle` — restore to active state. |

---

## Code Migration

### Remove from `js/ui.js`

Delete these methods entirely:
- `initHoldToConfirm(button, onConfirm, options)`
- `resetHoldToConfirm()`
- `setTimeViewFromHold(view)`

### Restore to `js/ui.js`

```javascript
setTimeView(view) {
    const presentBtn = this.elements.presentBtn;
    const futureBtn = this.elements.futureBtn;

    if (view === 'present') {
        presentBtn.classList.add('active');
        futureBtn.classList.remove('active');
        MapController.hideFutureZones();
    } else if (view === 'future') {
        futureBtn.classList.add('active');
        presentBtn.classList.remove('active');
        MapController.showFutureZones();
    }
}
```

### Update `js/app.js` Step B6

**Before (hold-to-confirm in chatbox):**
```javascript
stepB6() {
    // ... chatbox content with hold button HTML ...
    UI.initHoldToConfirm(button, () => { /* ... */ });
}
```

**After (restored toggle):**
```javascript
stepB6() {
    UI.updateChatbox({
        title: "The Vision",
        content: `
            <p>Toggle to <strong>Future View</strong> in the top-left corner to see the planned development zones.</p>
        `
    });

    UI.showTimeToggle();  // Shows the toggle with coachmark animation

    // Future zones are revealed when user clicks "Future" button
    // (handled by existing click listeners on #future-btn)
}
```

### Update `js/app.js` Step B7

```javascript
stepB7() {
    UI.setTimeView('present');  // Revert to present view
    UI.hideTimeToggle();        // Hide toggle after use

    // ... rest of B7 logic
}
```

---

## Control Bar Visibility Logic

The `#control-bar` container holds `#time-toggle`. Visibility is managed at the toggle level, not the container:

| Journey Step | `#control-bar` | `#time-toggle` | Rationale |
|--------------|---------------|----------------|-----------|
| Before B6 | Exists in DOM | `display: none` | Not needed yet |
| B6 | Visible | `display: flex` + coachmark | User needs to toggle view |
| B7 | Visible | `display: flex` | Toggle still functional |
| B8+ | Hidden | `display: none` | No longer relevant |

**CSS Update:**
```css
#control-bar {
    position: absolute;
    top: var(--space-4);
    left: var(--space-3);  /* Changed from left: 50%; transform: translateX(-50%); */
    z-index: 500;
    display: flex;
    gap: var(--space-2);
}

#time-toggle {
    /* No position overrides - inherits from parent #control-bar */
    display: none;  /* Hidden by default */
}

#time-toggle.visible {
    display: inline-flex;
}
```

---

## User Flow (Journey B)

```
Step B6: "Toggle to Future View in the top-left corner"
         ↓
User sees toggle at top-left with subtle coachmark glow
         ↓
User clicks [Future] segment
         ↓
Development zones fade in with yellow overlay
         ↓
Step B7: Toggle reverts to [Present], infrastructure roads appear
         ↓
Step B8: Toggle hidden, no longer needed
```

---

## Rollback Strategy

If this positioning creates unforeseen conflicts:

**Fallback Option: Bottom-Left Cluster**
- Position toggle at `bottom: var(--space-6); left: var(--space-6);` (next to chatbox)
- Creates a "control cluster" in bottom-left corner
- Still avoids top-center conflict with progress bar

---

## Testing Checklist

- [ ] Toggle appears at top-left on Step B6 entry
- [ ] Clicking "Present" hides development zones
- [ ] Clicking "Future" shows development zones
- [ ] No overlap with progress bar (top-center)
- [ ] No overlap with right panel (right side)
- [ ] No overlap with layers toggle (left side, lower down at 80px)
- [ ] Coachmark animation plays on first appearance
- [ ] Toggle hides correctly after Step B7/B8
- [ ] Active state styling works (selected segment highlighted)
- [ ] Keyboard navigation works (Tab + Enter/Space)
- [ ] Screen reader announces state changes
- [ ] Reduced motion respects `prefers-reduced-motion`

---

## Visual Hierarchy

```
Top-Left Corner:
  ↓ 16px from top
  [Present | Future]  ← New position

  ↓ 64px gap

  [Layers Toggle]     ← Existing control (80px from top)

Top-Right Corner:
  ↓ 80px from top
  [Panel Toggle]
  [Dashboard Toggle]
```

Balanced, symmetrical, no conflicts.

---

## Migration Steps

1. **Update CSS**: Change `#control-bar` position to `left: var(--space-3)`
2. **Remove HTML `hidden` class**: Make `#control-bar` and `#time-toggle` active again
3. **Delete hold-to-confirm code**: Remove `.hold-to-confirm` styles, JS methods, chatbox HTML
4. **Restore `setTimeView()` method**: Bring back original toggle interaction logic
5. **Update Step B6**: Remove hold button, add instruction to use top-left toggle
6. **Test visibility logic**: Ensure toggle shows/hides at correct journey steps
7. **Verify no conflicts**: Check against progress bar, panel, other controls

---

*This redesign restores familiar UI patterns, eliminates chatbox clutter, and positions the toggle where it's always accessible and conflict-free.*
