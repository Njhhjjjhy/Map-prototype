# Hybrid Presentation v4 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all MVP feedback items from feedback-v4.md to create a hybrid map + slides presentation covering slides 1-11 for the March presentation.

**Architecture:** Each feedback item becomes one or more discrete tasks modifying `js/data.js` (content), `js/app.js` (state machine flow), `js/map.js` (map features), `js/ui.js` (panels/chatbox), and `css/styles.css` (styling). Changes are additive — existing journey structure A/B/C is preserved but steps are reordered, new steps inserted, and content updated per the presentation script.

**Tech Stack:** Vanilla JS, Leaflet.js, CSS custom properties, Lucide icons, Chart.js

---

## Scope

**MVP items (from feedback-v4.md):**

| # | Feedback | Task(s) |
|---|----------|---------|
| 1 | Opening question before "Why Kumamoto" | Task 1 |
| 2 | Power infrastructure Kyushu-wide map view | Task 3 |
| 3 | Water + Power combined step | Task 3 |
| 4 | Post-modal chaining transitions | Task 4 |
| 5 | Government visual hierarchy (top-to-bottom) | Task 5 |
| 6 | Haramizu Station in B7 | Task 6 |
| 7 | Investment units as list format | Task 7 |
| 8 | GKTK fund size | Task 8 |
| 9 | MoreHarvest grand entry | Task 9 |
| 10 | TSMC & Samsung route highlights | Task 2 |
| 11 | 2D → 3D → interior transitions | Task 10 |
| 12 | Mt. Aso coordinates | DONE (committed on main) |
| 13 | A/B reverse narrative | SKIPPED (Phase 2) |
| 14 | Script as truth source | Applied across all tasks |

---

## Task 1: Opening Question — New Step A0

**Feedback #1:** Add a new opening step before "Why Kumamoto" asking: "Why is Japan's government spending ¥10 trillion in Kumamoto?"

**Files:**
- Modify: `js/app.js` (add `stepA0()`, update `startJourneyA()` and `start()`)
- Modify: `js/data.js` (add opening question data with supporting documents from script Step 1)
- Modify: `js/ui.js` (update `restoreChatbox` for A0 state)

### Step 1: Add opening question data to data.js

Add a new `openingQuestion` object to `AppData` with the content from presentation-script Step 1:

```javascript
// Add after mapConfig in data.js
openingQuestion: {
    title: 'The Core Question',
    question: 'Why is Japan\'s government spending ¥10 trillion in Kumamoto?',
    supportingDocs: [
        {
            title: 'Certified Semiconductor Production Facility Plan',
            source: 'https://www.meti.go.jp/policy/mono_info_service/joho/laws/semiconductor/semiconductor_plan.html',
            type: 'government'
        },
        {
            title: 'Tokyo Pledges $4.9B for TSMC Japan Expansion',
            source: 'reuters.com',
            type: 'news'
        },
        {
            title: 'Japan Making Major Investments in Semiconductor Industry',
            source: 'nippon.com',
            type: 'data'
        }
    ]
},
```

### Step 2: Add A0 step to app.js state machine

Rename current `startJourneyA()` flow so it starts at A0:

```javascript
// In startJourneyA(), change initial step to A0
startJourneyA() {
    this.state.journey = 'A';
    this.state.step = 'A0';
    this.state.resourcesExplored = [];
    this.state.evidenceGroupsViewed = [];

    UI.showLegend('A');
    UI.showDataLayers('A');

    // A0: Opening question — frames the entire narrative
    UI.showChatbox(`
        <h3>${AppData.openingQuestion.title}</h3>
        <p class="chatbox-question">${AppData.openingQuestion.question}</p>
        <p style="color: var(--color-text-tertiary); margin-top: var(--space-2);">
            ${AppData.openingQuestion.questionJa}
        </p>
        <button class="chatbox-continue primary" onclick="App.showOpeningEvidence()">
            View the Evidence
        </button>
    `);
},

showOpeningEvidence() {
    // Show supporting documents in right panel
    const docs = AppData.openingQuestion.supportingDocs;
    const docsHtml = docs.map(doc => `
        <div class="evidence-item" onclick="UI.showGallery('${doc.title}')">
            <div class="evidence-item-icon">
                <i data-lucide="${doc.type === 'government' ? 'landmark' : doc.type === 'news' ? 'newspaper' : 'bar-chart-3'}"></i>
            </div>
            <div class="evidence-item-content">
                <div class="evidence-item-title">${doc.title}</div>
                <div class="evidence-item-source">${doc.source}</div>
            </div>
        </div>
    `).join('');

    UI.showPanel(`
        <div class="subtitle">Supporting Evidence</div>
        <h2>¥10 Trillion Commitment</h2>
        <p>Japan designated semiconductors as critical infrastructure.</p>
        <div class="evidence-library" style="margin-top: var(--space-6);">
            ${docsHtml}
        </div>
    `);

    // Update chatbox to continue to Why Kumamoto
    UI.updateChatbox(`
        <h3>${AppData.openingQuestion.title}</h3>
        <p class="chatbox-question">${AppData.openingQuestion.question}</p>
        <button class="chatbox-continue primary" onclick="App.stepA1()">
            Why Kumamoto?
        </button>
    `);
},

// Rename old startJourneyA content to stepA1
stepA1() {
    this.state.step = 'A1';
    UI.hidePanel();

    UI.updateChatbox(`
        <h3>Why Kumamoto?</h3>
        <p>Discover what makes this region special for semiconductor investment.</p>
        <button class="chatbox-continue primary" onclick="App.stepA2()">
            Start Exploring
        </button>
    `);
},
```

### Step 3: Update restoreChatbox for A0 state

In `restoreChatbox()`, add case for `step === 'A0'`.

### Step 4: Commit

```bash
git add js/app.js js/data.js
git commit -m "feat(journey): add opening question step A0 before Why Kumamoto"
```

---

## Task 2: TSMC & Samsung Route Highlights

**Feedback #10:** Highlight Taiwan (TSMC) and Korea (Samsung) route connections on the airline route map. These are the two semiconductor parent company connections.

**Files:**
- Modify: `js/data.js` (add `semiconductorLink` field to relevant airline routes)
- Modify: `js/map.js` (style TSMC/Samsung routes differently — thicker, branded color)
- Modify: `css/styles.css` (add `.airline-route-semiconductor` class)

### Step 1: Tag routes in data.js

Add `semiconductorLink` property to Taiwan Taoyuan (`TSMC HQ`) and Seoul Incheon (`Samsung`):

```javascript
// taiwan-taoyuan entry
semiconductorLink: { company: 'TSMC', role: 'Headquarters', color: '#007aff' },

// seoul-incheon entry
semiconductorLink: { company: 'Samsung', role: 'Memory Division', color: '#34c759' },
```

### Step 2: Update map.js route rendering

In the `showAirlineRoutes()` method, check for `semiconductorLink` and apply thicker stroke + label:

```javascript
// When creating polyline for a route with semiconductorLink:
const isSemiLink = dest.semiconductorLink;
const routeLine = L.polyline([origin, destCoords], {
    color: isSemiLink ? dest.semiconductorLink.color : '#94a3b8',
    weight: isSemiLink ? 4 : 2,
    opacity: isSemiLink ? 0.9 : 0.6,
    dashArray: isSemiLink ? null : '8, 6',
    className: isSemiLink ? 'airline-route-semiconductor' : 'airline-route'
});
```

### Step 3: Add tooltip with company name

For semiconductor-linked routes, add a permanent tooltip label:

```javascript
if (isSemiLink) {
    routeLine.bindTooltip(dest.semiconductorLink.company, {
        permanent: true,
        direction: 'center',
        className: 'semiconductor-route-label'
    });
}
```

### Step 4: Add CSS for semiconductor route label

```css
.semiconductor-route-label {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-bg-tertiary);
    border-radius: var(--radius-small);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-semibold);
    box-shadow: var(--shadow-subtle);
}
```

### Step 5: Update airline route panel to show semiconductor connection

In `ui.js`, when showing the route detail panel for a semiconductor-linked route, add a highlighted badge:

```html
<span class="semiconductor-badge">{company} Connection</span>
```

### Step 6: Commit

```bash
git add js/data.js js/map.js js/ui.js css/styles.css
git commit -m "feat(map): highlight TSMC and Samsung semiconductor route connections"
```

---

## Task 3: Water + Power Combined Step with Kyushu-wide Power View

**Feedback #2 + #3:** Combine water and power into a single utility infrastructure step. Show power at Kyushu-wide level with map-rendered solar/wind/nuclear locations.

**Files:**
- Modify: `js/data.js` (add Kyushu-wide power station coordinates, restructure resources)
- Modify: `js/map.js` (add `showPowerInfrastructureMap()` for Kyushu-wide energy markers)
- Modify: `js/app.js` (merge A2 water/power into single "Utility Infrastructure" step)
- Modify: `js/ui.js` (update resource panel to show combined view)
- Modify: `css/styles.css` (energy marker styles)

### Step 1: Add Kyushu power station coordinates to data.js

```javascript
// Add to AppData
kyushuEnergy: {
    solar: [
        { name: 'Kagoshima Solar', coords: [31.56, 130.55], capacity: '24.7 MW', prefecture: 'Kagoshima' },
        { name: 'Fukuoka Solar', coords: [33.59, 130.40], capacity: '22.9 MW', prefecture: 'Fukuoka' },
        { name: 'Nagasaki Solar', coords: [32.75, 129.87], capacity: '10 MW', prefecture: 'Nagasaki' }
    ],
    wind: [
        { name: 'Miyazaki Wind', coords: [31.91, 131.42], capacity: '65.55 MW', prefecture: 'Miyazaki' },
        { name: 'Saga-Nagasaki Wind', coords: [33.25, 129.95], capacity: '27.2 MW', prefecture: 'Saga/Nagasaki' },
        { name: 'Goto Offshore Wind', coords: [32.70, 128.85], capacity: 'Offshore', prefecture: 'Nagasaki' }
    ],
    nuclear: [
        { name: 'Genkai Nuclear', coords: [33.515, 129.836], capacity: '3.47 GW', prefecture: 'Saga' },
        { name: 'Sendai Nuclear', coords: [31.8336, 130.1894], capacity: '1.78 GW', prefecture: 'Kagoshima' }
    ]
},
```

### Step 2: Add map.js method for Kyushu energy markers

```javascript
showKyushuEnergy() {
    // Zoom out to show full Kyushu
    this.map.flyTo([32.5, 130.5], 8, { duration: 1.8 });

    // Create energy layer group
    this.layers.energy = L.layerGroup().addTo(this.map);

    const energyData = AppData.kyushuEnergy;
    const iconMap = { solar: 'sun', wind: 'wind', nuclear: 'atom' };
    const colorMap = { solar: '#ff9500', wind: '#5ac8fa', nuclear: '#ff3b30' };

    ['solar', 'wind', 'nuclear'].forEach(type => {
        energyData[type].forEach(station => {
            const marker = L.marker(station.coords, {
                icon: this.createEnergyIcon(type, colorMap[type])
            })
            .bindTooltip(`${station.name}<br>${station.capacity}`, { direction: 'top' })
            .on('click', () => UI.showEnergyStationPanel(station, type));

            this.layers.energy.addLayer(marker);
        });
    });
},

hideKyushuEnergy() {
    if (this.layers.energy) {
        this.map.removeLayer(this.layers.energy);
        this.layers.energy = null;
    }
},
```

### Step 3: Merge A2 into combined utility infrastructure step

In `app.js`, replace the two-button water/power choice with a single combined step:

```javascript
stepA2() {
    this.state.step = 'A2';

    // Show combined utility infrastructure
    UI.updateChatbox(`
        <h3>Why Kumamoto?</h3>
        <p><strong>Utility Infrastructure</strong></p>
        <p>Two critical resources for semiconductor manufacturing:</p>
        <div class="chatbox-options">
            <button class="chatbox-option" onclick="App.showUtilityDetail('water')">
                Water Resources
            </button>
            <button class="chatbox-option" onclick="App.showUtilityDetail('power')">
                Power Infrastructure
            </button>
        </div>
    `);

    // Show Kyushu-wide energy map immediately
    MapManager.showKyushuEnergy();
    MapManager.showResourceMarker('water');
},
```

The two resource buttons still exist for detail drill-down, but both resources are visible on the map simultaneously. After viewing both, the user continues to A3.

### Step 4: Add energy marker CSS

```css
.energy-marker {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: var(--shadow-medium);
}

.energy-marker--solar { background: #ff9500; }
.energy-marker--wind { background: #5ac8fa; }
.energy-marker--nuclear { background: #ff3b30; }
```

### Step 5: Commit

```bash
git add js/data.js js/map.js js/app.js js/ui.js css/styles.css
git commit -m "feat(journey): combine water + power into utility step with Kyushu energy map"
```

---

## Task 4: Post-modal Chaining Transitions

**Feedback #4:** After each reason/evidence closes, flow directly into the next step — don't return to idle state.

**Files:**
- Modify: `js/app.js` (add auto-advance logic after resource panels close)
- Modify: `js/ui.js` (add `onPanelClose` callback support)

### Step 1: Add panel close callback to UI

In `ui.js`, modify `hidePanel()` to support a callback:

```javascript
hidePanel(callback) {
    // existing hide logic...
    if (callback && typeof callback === 'function') {
        setTimeout(callback, 250); // After panel transition
    }
},
```

### Step 2: Chain resource exploration in app.js

After viewing a resource detail, auto-advance to the next unexplored resource or to A3:

```javascript
showUtilityDetail(resourceId) {
    // Show resource panel
    const resource = AppData.resources[resourceId];
    UI.showResourcePanel(resource);

    // Track exploration
    if (!this.state.resourcesExplored.includes(resourceId)) {
        this.state.resourcesExplored.push(resourceId);
    }

    // Update chatbox with progress and auto-advance hint
    this.updateResourceChatbox();
},
```

The key change is that when both resources are explored, the "Continue" button appears automatically in the chatbox without requiring the user to close the panel first.

### Step 3: Chain journey transitions

Ensure `transitionToJourneyB()` and `transitionToJourneyC()` flow smoothly without idle gaps. The current implementation already does this with `showJourneyTransition()`, but verify that:
- Panel closes before transition starts
- Chatbox updates immediately after transition overlay dismisses
- No "dead" state where nothing is happening

### Step 4: Commit

```bash
git add js/app.js js/ui.js
git commit -m "feat(flow): chain post-modal transitions between steps"
```

---

## Task 5: Government Support — Visual Hierarchy (Top-to-Bottom)

**Feedback #5:** Government support section must show cascading hierarchy: national → prefectural → local.

**Files:**
- Modify: `js/ui.js` (update government chain panel rendering to use vertical hierarchy layout)
- Modify: `css/styles.css` (add `.gov-hierarchy` vertical cascade styles)

### Step 1: Create vertical hierarchy component in CSS

```css
.gov-hierarchy {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-top: var(--space-6);
}

.gov-level {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-medium);
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--easing-standard);
    position: relative;
}

.gov-level:hover {
    background: var(--color-bg-tertiary);
}

.gov-level::before {
    content: '';
    position: absolute;
    left: 28px;
    top: 100%;
    width: 2px;
    height: var(--space-1);
    background: var(--color-bg-tertiary);
}

.gov-level:last-child::before {
    display: none;
}

.gov-level-number {
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: var(--color-text-on-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
    flex-shrink: 0;
}

.gov-level-content {
    flex: 1;
}

.gov-level-name {
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
}

.gov-level-subtitle {
    font-size: var(--text-sm);
    color: var(--color-text-tertiary);
}

.gov-level-amount {
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    flex-shrink: 0;
}
```

### Step 2: Update government chain panel rendering in ui.js

When a government marker is clicked, render the right panel with the vertical hierarchy instead of a flat list:

```javascript
showGovernmentHierarchyPanel(selectedLevel) {
    const levels = AppData.governmentChain.levels;
    const hierarchyHtml = levels.map((level, i) => {
        const isSelected = level.id === selectedLevel.id;
        return `
            <div class="gov-level ${isSelected ? 'selected' : ''}"
                 onclick="App.selectGovernmentLevel('${level.id}')">
                <div class="gov-level-number">${i + 1}</div>
                <div class="gov-level-content">
                    <div class="gov-level-name">${level.name}</div>
                    <div class="gov-level-subtitle">${level.subtitle}</div>
                </div>
                <div class="gov-level-amount">${level.stats[0].value}</div>
            </div>
        `;
    }).join('');

    UI.showPanel(`
        <div class="subtitle">Cascading Policy Alignment</div>
        <h2>${selectedLevel.name}</h2>
        <p>${selectedLevel.description}</p>
        <div class="stats-grid" style="margin-top: var(--space-6);">
            ${selectedLevel.stats.map(s => `
                <div class="stat-item">
                    <div class="stat-value">${s.value}</div>
                    <div class="stat-label">${s.label}</div>
                </div>
            `).join('')}
        </div>
        <div class="gov-hierarchy">
            ${hierarchyHtml}
        </div>
    `);
},
```

### Step 3: Reorder government chain data if needed

Verify `AppData.governmentChain.levels` is ordered top-to-bottom: National → Prefecture → Kikuyo → Ozu → Grand Airport. Current order is already correct.

### Step 4: Commit

```bash
git add js/ui.js css/styles.css
git commit -m "feat(ui): add vertical government hierarchy panel (top-to-bottom cascade)"
```

---

## Task 6: Haramizu Station in B7

**Feedback #6:** Add Haramizu station as a specific infrastructure point in the "Changes in Area" step (B7).

**Files:**
- Modify: `js/data.js` (add Haramizu station data alongside existing Kikuyo station, or replace)
- Modify: `js/map.js` (show Haramizu station marker in B7)
- Modify: `js/ui.js` (Haramizu station panel content)

### Step 1: Add Haramizu station data to data.js

Add alongside existing `infrastructureStation`:

```javascript
// Rename or add to data.js
haramizuStation: {
    id: 'haramizu-station',
    name: 'Haramizu Station',
    coords: [32.8698, 130.8230],
    subtitle: 'New Development Hub',
    status: 'Under Development',
    description: 'Haramizu Station area is being developed as a new urban core with 70ha of mixed-use land. Three development zones planned: Vibrancy, Knowledge Cluster, and Live-Work. Mitsui Fudosan and JR Kyushu selected as development partners.',
    stats: [
        { value: '70ha', label: 'Development area' },
        { value: '3 zones', label: 'Mixed-use plan' },
        { value: 'Mitsui + JR', label: 'Development partners' },
        { value: '2028', label: 'Phase 1 target' }
    ],
    zones: [
        { name: 'Vibrancy', description: 'Station-front retail, F&B, international-friendly services' },
        { name: 'Knowledge Cluster', description: 'R&D offices, co-working, university satellite' },
        { name: 'Live-Work', description: 'Mid-high density condos, serviced apartments for engineers' }
    ],
    commuteImpact: 'New urban core',
    documentLink: '#'
},
```

### Step 2: Show Haramizu station marker on map in B7

In `map.js`, update `showInfrastructureRoads()` (or add a companion method) to also place a Haramizu station marker:

```javascript
showHaramizuStation() {
    const station = AppData.haramizuStation;
    const marker = L.marker(station.coords, {
        icon: this.createStationIcon()
    })
    .on('click', () => UI.showHaramizuPanel(station));

    this.layers.infrastructureStation = marker;
    marker.addTo(this.map);
},
```

### Step 3: Create Haramizu panel in ui.js

Show station details with the 3 development zones:

```javascript
showHaramizuPanel(station) {
    const zonesHtml = station.zones.map(z => `
        <div class="zone-item">
            <div class="zone-name">${z.name} <span style="color: var(--color-text-tertiary);">${z.nameEn}</span></div>
            <div class="zone-desc">${z.description}</div>
        </div>
    `).join('');

    UI.showPanel(`
        <div class="subtitle">Infrastructure Development</div>
        <h2>${station.name}</h2>
        <p>${station.description}</p>
        <div class="stats-grid" style="margin-top: var(--space-6);">
            ${station.stats.map(s => `
                <div class="stat-item">
                    <div class="stat-value">${s.value}</div>
                    <div class="stat-label">${s.label}</div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: var(--space-6);">
            <h3 style="margin-bottom: var(--space-3);">Development Zones</h3>
            ${zonesHtml}
        </div>
    `);
},
```

### Step 4: Update B7 step in app.js to mention Haramizu

```javascript
// In stepB7(), add reference to station
MapManager.showHaramizuStation();

// Update chatbox text to mention Haramizu
UI.updateChatbox(`
    <h3>Changes in Area</h3>
    <p><strong>Government commitment is one thing. Here's what's actually changing.</strong></p>
    <p>Click roads or the <strong>Haramizu Station</strong> marker to see development details.</p>
    <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
        View Investment Opportunities
    </button>
`);
```

### Step 5: Commit

```bash
git add js/data.js js/map.js js/ui.js js/app.js
git commit -m "feat(map): add Haramizu Station development hub to B7 step"
```

---

## Task 7: Investment Units as List Format

**Feedback #7:** Show individual units as a list view, not just pins on the map.

**Files:**
- Modify: `js/ui.js` (add `showPropertyListPanel()` with list/table format)
- Modify: `js/app.js` (update `startJourneyC()` to show list in panel)
- Modify: `css/styles.css` (property list styles)

### Step 1: Create property list rendering in ui.js

```javascript
showPropertyListPanel() {
    const properties = AppData.properties;
    const listHtml = properties.map(prop => `
        <div class="property-list-item" onclick="UI.showPropertyPanel('${prop.id}')">
            <div class="property-list-image">
                <img src="${prop.image}" alt="${prop.name}" loading="lazy">
            </div>
            <div class="property-list-info">
                <div class="property-list-name">${prop.name}</div>
                <div class="property-list-type">${prop.type}</div>
                <div class="property-list-stats">
                    <span>${prop.driveTime} to JASM</span>
                    <span>¥${(prop.financials.acquisitionCost / 1000000).toFixed(1)}M</span>
                </div>
            </div>
            <div class="property-list-yield">
                ${(prop.financials.scenarios.average.rentalYield * 100).toFixed(1)}%
                <span class="property-list-yield-label">Yield</span>
            </div>
        </div>
    `).join('');

    UI.showPanel(`
        <div class="subtitle">Portfolio</div>
        <h2>Available Units</h2>
        <p>Click a property to see detailed financials.</p>
        <div class="property-list" style="margin-top: var(--space-6);">
            ${listHtml}
        </div>
    `);
},
```

### Step 2: Add property list CSS

```css
.property-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.property-list-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 1px solid var(--color-bg-tertiary);
    border-radius: var(--radius-medium);
    cursor: pointer;
    transition: background-color var(--duration-fast) var(--easing-standard);
}

.property-list-item:hover {
    background: var(--color-bg-secondary);
}

.property-list-image {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-small);
    overflow: hidden;
    flex-shrink: 0;
}

.property-list-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.property-list-info {
    flex: 1;
    min-width: 0;
}

.property-list-name {
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
}

.property-list-type {
    font-size: var(--text-sm);
    color: var(--color-text-tertiary);
}

.property-list-stats {
    display: flex;
    gap: var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-top: var(--space-1);
}

.property-list-yield {
    text-align: center;
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-success);
    flex-shrink: 0;
}

.property-list-yield-label {
    display: block;
    font-size: var(--text-xs);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-tertiary);
}
```

### Step 3: Auto-open property list panel in Journey C

In `app.js` `startJourneyC()`, add:

```javascript
// Show property list in right panel
UI.showPropertyListPanel();
```

### Step 4: Commit

```bash
git add js/ui.js js/app.js css/styles.css
git commit -m "feat(ui): add property inventory list view for Journey C"
```

---

## Task 8: GKTK Fund Size

**Feedback #8:** Show GKTK investment/fund size to communicate scale.

**Files:**
- Modify: `js/data.js` (add GKTK fund data)
- Modify: `js/ui.js` (show fund info in portfolio summary)

### Step 1: Add GKTK data to data.js

```javascript
// Add to AppData
gktk: {
    name: 'GKTK Fund',
    fullName: 'Greater Kumamoto Technology Corridor Fund',
    fundSize: '¥2.5B',
    fundSizeNote: 'Target AUM',
    strategy: 'Real estate investment in the semiconductor corridor',
    vintage: '2025',
    stats: [
        { value: '¥2.5B', label: 'Fund size' },
        { value: '2025', label: 'Vintage' },
        { value: '5-7yr', label: 'Hold period' },
        { value: '12-18%', label: 'Target IRR' }
    ]
},
```

### Step 2: Show GKTK in portfolio summary

In `ui.js`, update `showPortfolioSummary()` to include GKTK fund info at the top:

```javascript
// Add GKTK banner to portfolio summary
const gktk = AppData.gktk;
const gktkHtml = `
    <div class="gktk-banner" style="margin-bottom: var(--space-6);">
        <div class="gktk-label">${gktk.fullName}</div>
        <div class="gktk-size">${gktk.fundSize}</div>
        <div class="gktk-note">${gktk.fundSizeNote}</div>
    </div>
`;
```

### Step 3: Commit

```bash
git add js/data.js js/ui.js
git commit -m "feat(data): add GKTK fund size to investment portfolio view"
```

---

## Task 9: MoreHarvest Grand Entry

**Feedback #9:** Branded, high-impact introduction when transitioning to properties section.

**Files:**
- Modify: `js/ui.js` (add `showMoreHarvestEntry()` method — full-screen branded overlay)
- Modify: `js/app.js` (insert grand entry before property markers appear in Journey C)
- Modify: `css/styles.css` (grand entry overlay styles)

### Step 1: Create grand entry overlay in CSS

```css
.moreharvest-entry {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-text-primary);
    color: var(--color-bg-primary);
    opacity: 0;
    transition: opacity var(--duration-slow) var(--easing-standard);
}

.moreharvest-entry.visible {
    opacity: 1;
}

.moreharvest-entry-logo {
    font-family: var(--font-display);
    font-size: var(--text-5xl);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--tracking-display);
    color: var(--color-primary);
    margin-bottom: var(--space-4);
    opacity: 0;
    transform: translateY(20px);
    animation: mhEntryFadeUp 0.6s var(--easing-decelerate) 0.3s forwards;
}

.moreharvest-entry-tagline {
    font-family: var(--font-body);
    font-size: var(--text-lg);
    color: var(--color-text-disabled);
    opacity: 0;
    animation: mhEntryFadeUp 0.6s var(--easing-decelerate) 0.6s forwards;
}

@keyframes mhEntryFadeUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### Step 2: Add showMoreHarvestEntry to ui.js

```javascript
showMoreHarvestEntry() {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'moreharvest-entry';
        overlay.innerHTML = `
            <div class="moreharvest-entry-logo">MoreHarvest</div>
            <div class="moreharvest-entry-tagline">Investment Opportunities in Kumamoto</div>
        `;
        document.body.appendChild(overlay);

        // Fade in
        requestAnimationFrame(() => overlay.classList.add('visible'));

        // Fade out after 2.5 seconds
        setTimeout(() => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 350);
        }, 2500);
    });
},
```

### Step 3: Insert grand entry into Journey C transition

In `app.js`, modify `transitionToJourneyC()`:

```javascript
async transitionToJourneyC() {
    UI.saveChatboxToHistory();
    UI.hideChatbox();
    UI.hidePanel();
    UI.setTimeView('present');

    if (this.state.step === 'B7') {
        MapManager.hideInfrastructureRoads();
    }

    // Show journey transition overlay
    await UI.showJourneyTransition('C');

    // Show MoreHarvest grand entry BEFORE properties
    await UI.showMoreHarvestEntry();

    this.startJourneyC();
},
```

### Step 4: Commit

```bash
git add js/ui.js js/app.js css/styles.css
git commit -m "feat(ui): add MoreHarvest branded grand entry before properties"
```

---

## Task 10: 2D to 3D to Interior Transitions

**Feedback #11:** Cinematic property reveal — 2D map → 3D exterior → interior view sequence.

**Files:**
- Modify: `js/data.js` (add `exteriorImage` and `interiorImages` to properties)
- Modify: `js/ui.js` (add `showPropertyReveal()` cinematic sequence)
- Modify: `css/styles.css` (property reveal transition styles)

### Step 1: Add exterior/interior images to property data

```javascript
// Add to each property in AppData.properties
exteriorImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
interiorImages: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
],
```

### Step 2: Create reveal sequence in ui.js

When a property marker is clicked, instead of immediately showing the detail panel, run a cinematic reveal:

```javascript
async showPropertyReveal(property) {
    // Phase 1: Fly to property on map (2D view)
    MapManager.flyTo(property.coords, 16);
    await this.delay(1800);

    // Phase 2: Show exterior image overlay (simulated 3D)
    const overlay = document.createElement('div');
    overlay.className = 'property-reveal';
    overlay.innerHTML = `
        <div class="property-reveal-image">
            <img src="${property.exteriorImage}" alt="${property.name} exterior">
            <div class="property-reveal-label">
                <span>${property.name}</span>
                <span class="property-reveal-type">${property.type}</span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
    await this.delay(2000);

    // Phase 3: Transition to interior (if available)
    if (property.interiorImages && property.interiorImages.length > 0) {
        const img = overlay.querySelector('img');
        img.style.transition = 'opacity 0.5s ease';
        img.style.opacity = '0';
        await this.delay(500);
        img.src = property.interiorImages[0];
        img.alt = `${property.name} interior`;
        img.style.opacity = '1';
        await this.delay(2000);
    }

    // Phase 4: Dismiss and show detail panel
    overlay.classList.remove('visible');
    await this.delay(350);
    overlay.remove();

    // Show the normal property detail panel
    this.showPropertyPanel(property.id);
},

delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
},
```

### Step 3: Add reveal CSS

```css
.property-reveal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-overlay);
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity var(--duration-normal) var(--easing-standard);
}

.property-reveal.visible {
    opacity: 1;
}

.property-reveal-image {
    position: relative;
    width: min(800px, 80vw);
    max-height: 70vh;
    border-radius: var(--radius-xlarge);
    overflow: hidden;
    box-shadow: var(--shadow-xlarge);
}

.property-reveal-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.property-reveal-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--space-6) var(--space-6) var(--space-4);
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white;
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-semibold);
}

.property-reveal-type {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--font-weight-regular);
    opacity: 0.8;
    margin-top: var(--space-1);
}
```

### Step 4: Wire up property marker clicks to use reveal

In `map.js`, update the property marker click handler:

```javascript
// In showPropertyMarkers(), change click handler
marker.on('click', () => {
    UI.showPropertyReveal(property);
});
```

### Step 5: Add `prefers-reduced-motion` support

```css
@media (prefers-reduced-motion: reduce) {
    .property-reveal,
    .moreharvest-entry {
        transition-duration: 0.01ms !important;
    }
    .moreharvest-entry-logo,
    .moreharvest-entry-tagline {
        animation-duration: 0.01ms !important;
    }
}
```

### Step 6: Commit

```bash
git add js/data.js js/ui.js js/map.js css/styles.css
git commit -m "feat(ui): add cinematic 2D → 3D → interior property reveal sequence"
```

---

## Execution Order

Tasks should be implemented in this order (dependencies flow downward):

```
Task 1  (A0 opening question)     — no dependencies
Task 2  (TSMC/Samsung routes)     — no dependencies
Task 3  (Water + Power combined)  — no dependencies
Task 4  (Post-modal chaining)     — after Task 1 + 3 (flow changes)
Task 5  (Government hierarchy)    — no dependencies
Task 6  (Haramizu Station)        — no dependencies
Task 7  (Property list)           — no dependencies
Task 8  (GKTK fund)               — no dependencies
Task 9  (MoreHarvest entry)       — no dependencies
Task 10 (Property reveal)         — after Task 7 (property rendering)
```

Tasks 1, 2, 3, 5, 6, 7, 8 can be parallelized. Task 4 depends on 1+3. Task 9 and 10 can run after their dependencies.

---

*Plan created: February 6, 2026*
*Source of truth: feedback/presentation-script.md + feedback/feedback-v4.md*
