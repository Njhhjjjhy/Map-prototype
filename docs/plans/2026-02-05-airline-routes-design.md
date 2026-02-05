# Airline Routes Feature Design

**Date:** 2026-02-05
**Status:** Ready for implementation
**Context:** Enhances "Why Kumamoto" Journey A with Strategic Location visualization

---

## Overview

Add interactive airline route visualization to show international connectivity from Aso Kumamoto Airport. Routes appear during the Strategic Location section of Journey A, Step A3.

**Business goal:** Reinforce the "Strategic Location" pillar of the investment thesis by demonstrating direct regional connectivity to Korea, Taiwan, China, and Hong Kong.

---

## Data Structure

Add to `AppData` in `data.js`:

```javascript
airlineRoutes: {
    origin: {
        name: 'Aso Kumamoto Airport',
        coords: [32.8373, 130.8551],
        code: 'KMJ'
    },
    destinations: [
        {
            id: 'seoul-incheon',
            name: 'Seoul Incheon',
            coords: [37.4602, 126.4407],
            code: 'ICN',
            country: 'South Korea',
            region: 'Korea',
            status: 'active',
            flightTime: '1h 30m',
            airlines: ['Asiana Airlines', 'Jin Air'],
            frequency: '7 flights/week',
            significance: 'Direct TSMC supply chain link',
            description: 'Direct service to Seoul\'s primary international airport.'
        },
        {
            id: 'busan-gimhae',
            name: 'Busan Gimhae',
            coords: [35.1796, 128.9382],
            code: 'PUS',
            country: 'South Korea',
            region: 'Korea',
            status: 'active',
            flightTime: '1h 15m',
            airlines: ['Jin Air'],
            frequency: '3 flights/week',
            significance: 'TBD',
            description: 'Direct service to South Korea\'s second-largest city.'
        },
        {
            id: 'shanghai-pudong',
            name: 'Shanghai Pudong',
            coords: [31.1443, 121.8083],
            code: 'PVG',
            country: 'China',
            region: 'China',
            status: 'suspended',
            flightTime: '2h 00m',
            airlines: ['TBD'],
            frequency: 'Suspended',
            significance: 'Manufacturing partner access',
            description: 'Service currently suspended.'
        },
        {
            id: 'taiwan-taoyuan',
            name: 'Taiwan Taoyuan',
            coords: [25.0797, 121.2342],
            code: 'TPE',
            country: 'Taiwan',
            region: 'Taiwan',
            status: 'active',
            flightTime: '2h 30m',
            airlines: ['TBD'],
            frequency: 'TBD',
            significance: 'TSMC headquarters connection',
            description: 'Direct service to Taiwan\'s main international gateway.'
        },
        {
            id: 'tainan',
            name: 'Tainan Airport',
            coords: [22.9504, 120.2057],
            code: 'TNN',
            country: 'Taiwan',
            region: 'Taiwan',
            status: 'active',
            flightTime: 'TBD',
            airlines: ['TBD'],
            frequency: 'TBD',
            significance: 'TSMC Fab 18 access',
            description: 'Direct service to southern Taiwan semiconductor hub.'
        },
        {
            id: 'kaohsiung',
            name: 'Kaohsiung International',
            coords: [22.5771, 120.3500],
            code: 'KHH',
            country: 'Taiwan',
            region: 'Taiwan',
            status: 'active',
            flightTime: '2h 15m',
            airlines: ['TBD'],
            frequency: 'TBD',
            significance: 'Southern Taiwan industrial access',
            description: 'Direct service to Taiwan\'s second-largest city.'
        },
        {
            id: 'hong-kong',
            name: 'Hong Kong International',
            coords: [22.3080, 113.9185],
            code: 'HKG',
            country: 'Hong Kong',
            region: 'Hong Kong',
            status: 'suspended',
            flightTime: '3h 00m',
            airlines: ['TBD'],
            frequency: 'Suspended',
            significance: 'Financial hub connection',
            description: 'Service currently suspended.'
        }
    ]
}
```

### Field Definitions

| Field | Purpose |
|-------|---------|
| `region` | Groups destinations for talking points ("3 Taiwan routes") |
| `status` | Controls visual styling (`active` vs `suspended`) |
| `significance` | Investment thesis tie-in for right panel |
| `description` | Factual, brief text for panel display |

---

## Map Visualization

### Arc Lines (Great Circle Routes)

Routes rendered as quadratic bezier curves arcing northward to simulate great circle paths.

```javascript
// In map.js

generateBezierPoints(p0, p1, p2, numPoints) {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const lat = (1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0];
        const lng = (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1];
        points.push([lat, lng]);
    }
    return points;
}

createArcLine(origin, destination, status) {
    const midLat = (origin[0] + destination[0]) / 2;
    const midLng = (origin[1] + destination[1]) / 2;

    // Calculate arc height with minimum floor
    const distance = this.map.distance(origin, destination);
    const arcHeight = Math.max(0.8, distance * 0.00015);  // Min 0.8° offset

    const arcMid = [midLat + arcHeight, midLng];
    const points = this.generateBezierPoints(origin, arcMid, destination, 50);

    return L.polyline(points, {
        color: status === 'active' ? '#007aff' : '#a3a5a8',
        weight: status === 'active' ? 3 : 2,
        opacity: status === 'active' ? 0.8 : 0.5,
        dashArray: status === 'suspended' ? '8, 6' : null,
        className: `airline-route airline-route--${status}`
    });
}
```

### Visual Styling

| Status | Color | Weight | Opacity | Dash |
|--------|-------|--------|---------|------|
| Active | `#007aff` | 3px | 0.8 | Solid |
| Suspended | `#a3a5a8` | 2px | 0.5 | `8, 6` dashed |

### Markers

**Origin (Aso Kumamoto Airport):**
- Size: 40×48px (larger than standard 32×40px)
- Color: `#fbb931` (brand yellow)
- Label: "KMJ" visible below marker
- Not clickable (anchor only)

**Destinations:**
- Size: 32×40px (standard)
- Color: `#007aff` (active) or `#a3a5a8` (suspended)
- Clickable → opens right panel
- Tainan/Kaohsiung: slight offset to prevent overlap at zoom 4-5

### Layer Group

All routes and markers wrapped in single layer group for easy show/hide:

```javascript
this.airlineRoutesLayer = L.layerGroup();
```

---

## Animation Sequence

When Strategic Location phase activates:

```javascript
async showAirlineRoutes() {
    // 1. Show origin marker immediately
    this.showAirportOriginMarker();

    // 2. Animated zoom out to East Asia view (1 second)
    await this.map.flyTo([28, 122], 4, { duration: 1 });

    // 3. Draw routes with stagger (150ms between each)
    const routes = AppData.airlineRoutes.destinations;
    for (let i = 0; i < routes.length; i++) {
        await this.sleep(150);
        this.drawArcLine(routes[i]);  // Animated draw from origin
    }

    // 4. Add destination markers after all routes drawn
    this.showDestinationMarkers();
}
```

**Zoom level note:** Starting point `[28, 122]` at zoom 4. Verify all 7 destinations fit within map viewport (especially Hong Kong in southwest). Adjust center south or drop to zoom 4 if needed based on actual panel layout width.

---

## Right Panel

### Active Route Panel

```
[Subtitle] International Route
[Title]    Seoul Incheon (ICN)

[Headline]
1h 30m
Flight Time

[Stats Grid]
Region       | South Korea
Airlines     | Asiana, Jin Air
Frequency    | 7 flights/week
Status       | Active
Significance | Direct TSMC supply chain link

[Description]
Direct service to Seoul's primary international airport.

[Link] View all routes →
```

### Suspended Route Panel

```
[Subtitle] International Route
[Title]    Shanghai Pudong (PVG)

[Headline Badge]
⚠ Service Suspended

[Stats Grid]
Region            | China
Flight Time       | 2h 00m (when active)
Airlines          | TBD
Significance      | Manufacturing partner access

[Description]
Service currently suspended.

[Link] View all routes →
```

### View All Routes

Clicking "View all routes →" shows summary list in panel (similar to evidence library pattern):

```
[Title] All International Routes

[Active Routes - 5]
• Seoul Incheon (ICN) — 1h 30m
• Busan Gimhae (PUS) — 1h 15m
• Taiwan Taoyuan (TPE) — 2h 30m
• Tainan (TNN) — TBD
• Kaohsiung (KHH) — 2h 15m

[Suspended Routes - 2]
• Shanghai Pudong (PVG)
• Hong Kong (HKG)
```

Each item clickable to return to individual route panel.

---

## Journey A3 Transition

Split A3 into two internal phases to control when routes appear.

### Phase 1: Existing Semiconductor Infrastructure

```javascript
stepA3() {
    this.state.step = 'A3';
    this.state.a3Phase = 'infrastructure';

    UI.updateChatbox(`
        <h3>Why Kumamoto?</h3>
        <p><strong>Existing Semiconductor Infrastructure</strong></p>
        <p>TSMC chose Kumamoto because the supply chain was already here.
        Sony, Tokyo Electron, and Mitsubishi have operated in the region for decades.</p>
        <button class="chatbox-continue primary" onclick="App.stepA3_location()">
            See Strategic Location
        </button>
    `);
}
```

### Phase 2: Strategic Location (routes appear)

```javascript
stepA3_location() {
    this.state.a3Phase = 'location';

    // Show airline routes on map (animated sequence)
    MapManager.showAirlineRoutes();

    UI.updateChatbox(`
        <h3>Why Kumamoto?</h3>
        <p><strong>Strategic Location</strong></p>
        <p>Aso Kumamoto Airport connects directly to 7 international destinations
        across 4 regions. Click destinations to see route details.</p>
        <button class="chatbox-continue primary" onclick="App.transitionToJourneyB()">
            See Government Commitment
        </button>
    `);
}
```

Routes persist until Journey B transition, then cleared via `MapManager.hideAirlineRoutes()`.

### Back Navigation

Not implemented for MVP. Linear flow is acceptable since Henry controls pacing. Flag for future enhancement if Q&A navigation is needed.

---

## Legend Update

During A3 Strategic Location phase, legend shows:

| Type | Color | Icon (Lucide) |
|------|-------|---------------|
| Aso Kumamoto Airport | `#fbb931` (yellow) | `plane` |
| Active Route | `#007aff` (blue) | `plane-takeoff` |
| Suspended Route | `#a3a5a8` (gray) | `plane` |

**Note:** Using `plane` (no modifier) for suspended routes creates visual distinction beyond color at legend size. Test visually and adjust if needed.

Legend reverts when Journey B starts.

---

## Implementation Checklist

1. [ ] Add `airlineRoutes` data to `data.js`
2. [ ] Add `generateBezierPoints()` method to `map.js`
3. [ ] Add `createArcLine()` method to `map.js`
4. [ ] Add `showAirlineRoutes()` with animation sequence
5. [ ] Add `hideAirlineRoutes()` cleanup method
6. [ ] Add origin marker (KMJ) styling
7. [ ] Add destination markers with click handlers
8. [ ] Add `showAirlineRoutePanel()` to `ui.js`
9. [ ] Add "View all routes" panel variant
10. [ ] Split `stepA3()` into two phases in `app.js`
11. [ ] Add `stepA3_location()` method
12. [ ] Update `transitionToJourneyB()` to clear routes
13. [ ] Update legend for A3 location phase
14. [ ] Test zoom level with actual viewport width
15. [ ] Test Tainan/Kaohsiung marker overlap

---

## TBD Items for Henry

Content needed before demo:

| Item | Destinations Affected | Notes |
|------|----------------------|-------|
| Airlines | Taiwan Taoyuan, Tainan, Kaohsiung, Shanghai, Hong Kong | Which carriers operate each route |
| Frequency | Taiwan Taoyuan, Tainan, Kaohsiung | Flights per week |
| Flight time | Tainan | Missing from reference |
| Significance text | Busan Gimhae | Investment thesis tie-in |

**Current suspended routes:** Shanghai Pudong, Hong Kong International. Confirm these are still suspended at demo time.

**Taiwan routes talking point:** 3 routes to Taiwan (Taoyuan, Tainan, Kaohsiung) — strong connection to TSMC's home base. Henry can emphasize this during pitch.

---

## Files Modified

| File | Changes |
|------|---------|
| `js/data.js` | Add `airlineRoutes` object |
| `js/map.js` | Add arc line generation, route display, markers |
| `js/app.js` | Split A3 into phases, add `stepA3_location()` |
| `js/ui.js` | Add route panel rendering, "View all routes" variant |

---

*Design validated 2026-02-05*
