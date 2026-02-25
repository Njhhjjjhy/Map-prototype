# Infrastructure Roads Step — Design Document

**Date:** 2026-02-03
**Status:** Approved
**Location:** Journey B, Step B7 (after development zones, before Journey C)

---

## Overview

Add a new step to Journey B that displays clickable infrastructure road overlays on the map. When clicked, roads show details in the right panel including commute impact to JASM. This supports the narrative that government road investment makes nearby properties more accessible and valuable.

---

## Data Structure

Add to `data.js`:

```javascript
infrastructureRoads: [
  {
    id: 'route-57-bypass',
    name: 'Route 57 Bypass',
    coords: [[lat, lng], [lat, lng], ...],  // Polyline path
    status: 'Under Construction',
    completionDate: '2026',
    budget: '¥86B',
    length: '12.4 km',
    driveToJasm: '14 min',
    commuteImpact: '-8 min',
    description: 'New arterial route bypassing congested areas, providing direct access to the Science Park corridor.',
    documentLink: '#'
  },
  // 2-3 roads total
]
```

---

## Visual Treatment

### CSS Token

Add to design tokens:
```css
--color-map-infrastructure: #5ac8fa;  /* Teal - distinct from blue JASM route */
```

### Polyline States

**Default:**
- Color: `var(--color-map-infrastructure)` (#5ac8fa)
- Stroke weight: 5px
- Dash pattern: `10, 6`
- Opacity: 0.7

**Hover:**
- Stroke weight: 7px
- Opacity: 1.0
- Cursor: pointer

**Selected:**
- Solid line (no dash)
- Stroke weight: 7px
- Opacity: 1.0
- Glow: `0 0 8px rgba(90, 200, 250, 0.5)`

### Interaction

- Single selection only (clicking another road deselects the first)
- Layer renders above base tiles, below markers
- Roads fade in over 300ms when step activates

---

## Right Panel Content

### Structure

```
[Subtitle] Infrastructure Plan
[Title]    Route 57 Bypass

[Headline Metric]
-8 min
Commute Saved

[Stats Grid - 5 items]
14 min          | Drive to JASM
-8 min          | Commute Saved
Under Construction | Status
2026            | Completion
¥86B            | Budget

[Description]
New arterial route bypassing congested areas...

[Button] View Source Document
```

### Behavior

- Clicking different road replaces panel content (no close/reopen)
- Clicking same road again: no change (stays selected)
- Close button: deselects road, returns to default state

---

## Journey Flow

### Step Sequence

```
B6 (Future/Present toggle + zones)
    ↓
[Button: "View Road Improvements"]
    ↓
B7 (Infrastructure Roads) ← NEW
    ↓
[Button: "View Properties"]
    ↓
Journey C
```

### B7 Chatbox Content

```html
<h3>Infrastructure Roads</h3>
<p>These road projects cut commute times for JASM workers — making nearby properties more accessible and more valuable.</p>
<p>Click a highlighted road to see details.</p>
<button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
    View Properties
</button>
```

### Map Behavior

- Infrastructure roads fade in when B7 activates
- Map view adjusts to show all roads within corridor
- Roads remain visible until Journey C transition

---

## Legend Update

Add to Journey B legend (visible in B7):
- Infrastructure Roads | Teal | `route` icon (Lucide)

---

## Implementation Files

| File | Changes |
|------|---------|
| `js/data.js` | Add `infrastructureRoads` array |
| `js/app.js` | Add `stepB7()`, update `stepB6()` to include transition button |
| `js/map.js` | Add `showInfrastructureRoads()`, `hideInfrastructureRoads()`, selection logic |
| `js/ui.js` | Add `showRoadPanel()` function |
| `css/styles.css` | Add `--color-map-infrastructure` token, road hover/selected styles |

---

## Success Criteria

1. Roads appear as teal dashed polylines on map
2. Hover shows cursor change and visual feedback
3. Click selects road and shows panel with commute metrics
4. Only one road selected at a time
5. Panel shows headline metric (commute saved) prominently
6. "View Properties" button transitions to Journey C
7. Narrative focuses on commute benefits, not government spending
