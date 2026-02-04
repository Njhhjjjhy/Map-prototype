# Feedback v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Henry's 4-area demo structure into the existing 3-journey app, adding water/electricity evidence, government commitment chain, and infrastructure expansion.

**Architecture:** Hybrid approach — keep existing journey state machine, add content to data.js, update chatbox messaging in app.js to explicitly frame each demo area.

**Tech Stack:** Vanilla JS, Leaflet, HTML/CSS (no frameworks)

---

## Task 1: Add Water Evidence Markers (Journey A)

**Files:**
- Modify: `js/data.js:16-53` (resources section)

**Step 1: Add Coca-Cola and Suntory evidence to water resource**

In `js/data.js`, add `evidenceMarkers` array to the `water` resource object:

```javascript
water: {
    id: 'water',
    name: 'Aso Groundwater Basin',
    coords: [32.88, 130.90],
    subtitle: 'Natural Water Resources',
    description: 'Kumamoto sits atop one of Japan\'s largest groundwater basins, fed by Mount Aso\'s volcanic soil. This pristine water supply is critical for semiconductor manufacturing, which requires enormous quantities of ultrapure water.',
    stats: [
        { value: '1.8B', label: 'Cubic meters annual capacity' },
        { value: '99.99%', label: 'Natural purity level' },
        { value: '¥0', label: 'Water acquisition cost' },
        { value: '60%', label: 'Lower than Tokyo rates' }
    ],
    evidence: {
        title: 'Kumamoto Water Resources Report',
        type: 'pdf',
        description: 'Official government report on groundwater sustainability and industrial allocation'
    },
    // NEW: Evidence markers proving water quality
    evidenceMarkers: [
        {
            id: 'coca-cola',
            name: 'Coca-Cola Bottlers Japan',
            coords: [32.74, 130.72],
            subtitle: 'Kumamoto Plant',
            description: 'Major beverage manufacturer chose Kumamoto for exceptional water quality and abundance. The plant produces beverages for the entire Kyushu region.',
            stats: [
                { value: '1987', label: 'Established' },
                { value: 'Minami-ku', label: 'Location' },
                { value: '500+', label: 'Employees' },
                { value: 'Kyushu', label: 'Distribution' }
            ]
        },
        {
            id: 'suntory',
            name: 'Suntory Kyushu Kumamoto Factory',
            coords: [32.82, 130.85],
            subtitle: 'Premium Beverage Production',
            description: 'Suntory selected Kashima, Kamimashiki for its pristine groundwater. The facility produces premium beverages requiring the highest water purity standards.',
            stats: [
                { value: '1991', label: 'Established' },
                { value: 'Kashima', label: 'Location' },
                { value: 'Premium', label: 'Product Grade' },
                { value: '100%', label: 'Local Water' }
            ]
        }
    ]
},
```

**Step 2: Test the data structure**

Open browser console and run:
```javascript
console.log(AppData.resources.water.evidenceMarkers);
// Expected: Array with 2 objects (Coca-Cola, Suntory)
```

**Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat(data): add Coca-Cola and Suntory evidence markers for water pillar"
```

---

## Task 2: Add Energy Mix Details to Electricity Panel

**Files:**
- Modify: `js/data.js:36-52` (power resource section)

**Step 1: Add energyMix array to power resource**

Update the `power` object in `js/data.js`:

```javascript
power: {
    id: 'power',
    name: 'Kyushu Power Grid',
    coords: [32.75, 130.65],
    subtitle: 'Power Infrastructure',
    description: 'Kyushu Electric provides stable, competitively priced power to the region. The diverse energy mix ensures grid stability critical for semiconductor manufacturing.',
    stats: [
        { value: '2.4GW', label: 'Available industrial capacity' },
        { value: '99.999%', label: 'Grid reliability' },
        { value: '¥12/kWh', label: 'Industrial rate' },
        { value: '15%', label: 'Renewable mix' }
    ],
    evidence: {
        title: 'Kyushu Electric Infrastructure Plan',
        type: 'pdf',
        description: 'Investment roadmap for semiconductor corridor power infrastructure'
    },
    // NEW: Energy mix breakdown (shown in panel, not on map)
    energyMix: {
        description: 'Kyushu leads Japan in energy diversity, providing the stable power semiconductor fabs require.',
        sources: [
            { type: 'Solar', examples: 'Kagoshima 24.7 MW, Fukuoka 22.9 MW, Nagasaki 10 MW', icon: 'sun' },
            { type: 'Wind', examples: 'Miyazaki 65.55 MW, Saga/Nagasaki 27.2 MW, Goto offshore', icon: 'wind' },
            { type: 'Nuclear', examples: 'Genkai (Saga), Sendai (Kagoshima)', icon: 'atom' }
        ]
    }
}
```

**Step 2: Test the data structure**

```javascript
console.log(AppData.resources.power.energyMix.sources);
// Expected: Array with 3 source objects
```

**Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat(data): add energy mix breakdown for electricity pillar panel"
```

---

## Task 3: Update UI to Show Water Evidence Markers

**Files:**
- Modify: `js/map.js` (add function to show evidence markers)
- Modify: `js/ui.js` (update resource panel to show evidence)

**Step 1: Add showWaterEvidenceMarkers function to map.js**

Find the `showResourceMarker` function in `js/map.js` and add below it:

```javascript
/**
 * Show evidence markers for water resource
 */
showWaterEvidenceMarkers() {
    const waterData = AppData.resources.water;
    if (!waterData.evidenceMarkers) return;

    waterData.evidenceMarkers.forEach(evidence => {
        const marker = L.marker(evidence.coords, {
            icon: L.divIcon({
                className: 'evidence-marker water-evidence',
                html: `<div class="marker-dot" style="background: #007aff;"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        });

        marker.on('click', () => {
            UI.showWaterEvidencePanel(evidence);
        });

        marker.addTo(this.map);
        this.markers.push(marker);
    });
},
```

**Step 2: Update showResourceMarker to also show evidence markers**

Find `showResourceMarker` in `js/map.js` and update it:

```javascript
showResourceMarker(resourceId) {
    const resource = AppData.resources[resourceId];
    if (!resource) return;

    // ... existing marker creation code ...

    // Show evidence markers for water
    if (resourceId === 'water') {
        this.showWaterEvidenceMarkers();
    }
},
```

**Step 3: Add showWaterEvidencePanel to ui.js**

Find the `showResourcePanel` function in `js/ui.js` and add below it:

```javascript
/**
 * Show panel for water evidence marker (Coca-Cola, Suntory)
 * @param {Object} evidence - Evidence marker data
 */
showWaterEvidencePanel(evidence) {
    const statsHtml = evidence.stats.map(stat => `
        <div class="stat-card">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');

    const content = `
        <div class="subtitle">Water Quality Evidence</div>
        <h2>${evidence.name}</h2>
        <p class="panel-subtitle">${evidence.subtitle}</p>
        <p>${evidence.description}</p>
        <div class="stats-grid">
            ${statsHtml}
        </div>
        <p class="evidence-note" style="margin-top: 16px; font-size: 14px; color: var(--color-text-secondary);">
            Major manufacturers chose Kumamoto for water quality — proof the resource meets industrial standards.
        </p>
    `;

    this.showPanel(content);
},
```

**Step 4: Test in browser**

1. Start Journey A
2. Click "Water Resources"
3. Verify Coca-Cola and Suntory markers appear on map
4. Click each marker — panel should show evidence details

**Step 5: Commit**

```bash
git add js/map.js js/ui.js
git commit -m "feat(ui): show water evidence markers (Coca-Cola, Suntory) in Journey A"
```

---

## Task 4: Update Electricity Panel to Show Energy Mix

**Files:**
- Modify: `js/ui.js` (update showResourcePanel)

**Step 1: Update showResourcePanel to include energy mix**

Find `showResourcePanel` in `js/ui.js` and update the panel content generation:

```javascript
showResourcePanel(resource) {
    const statsHtml = resource.stats.map(stat => `
        <div class="stat-card">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');

    // NEW: Generate energy mix section for power resource
    let energyMixHtml = '';
    if (resource.id === 'power' && resource.energyMix) {
        const sourcesHtml = resource.energyMix.sources.map(source => `
            <div class="energy-source">
                <strong>${source.type}:</strong> ${source.examples}
            </div>
        `).join('');

        energyMixHtml = `
            <div class="energy-mix-section" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-bg-tertiary);">
                <h4 style="margin: 0 0 8px 0; font-size: 15px;">Energy Mix</h4>
                <p style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 12px;">${resource.energyMix.description}</p>
                <div class="energy-sources" style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
                    ${sourcesHtml}
                </div>
            </div>
        `;
    }

    const content = `
        <div class="subtitle">${resource.subtitle}</div>
        <h2>${resource.name}</h2>
        <p>${resource.description}</p>
        <div class="stats-grid">
            ${statsHtml}
        </div>
        ${energyMixHtml}
        <button class="panel-btn" onclick="UI.showGallery('${resource.evidence.title}', '${resource.evidence.type}')">
            View Source Document
        </button>
    `;

    this.showPanel(content);
},
```

**Step 2: Test in browser**

1. Start Journey A
2. Click "Power Infrastructure"
3. Verify panel shows energy mix section with Solar, Wind, Nuclear details

**Step 3: Commit**

```bash
git add js/ui.js
git commit -m "feat(ui): show energy mix breakdown in electricity panel"
```

---

## Task 5: Add Step A3 — Strategic Advantages Narrative

**Files:**
- Modify: `js/app.js:60-98` (add stepA3 function)

**Step 1: Update updateResourceChatbox to transition to A3**

Find `updateResourceChatbox` in `js/app.js` and update the "allExplored" section:

```javascript
if (allExplored) {
    content += `
        <button class="chatbox-continue primary" onclick="App.stepA3()">
            Continue
        </button>
    `;
}
```

**Step 2: Add stepA3 function**

Add after `updateResourceChatbox` in `js/app.js`:

```javascript
/**
 * A3: Strategic Advantages — narrative only (no markers)
 * Pair 2 of "Why Kumamoto" pillars
 */
stepA3() {
    this.state.step = 'A3';

    UI.updateChatbox(`
        <h3>Why Kumamoto?</h3>
        <p><strong>Beyond natural resources, Kumamoto offers strategic advantages:</strong></p>
        <div style="margin: 16px 0;">
            <p style="margin-bottom: 12px;">
                <strong>Existing Semiconductor Infrastructure</strong><br>
                <span style="color: var(--color-text-secondary);">TSMC chose Kumamoto because the supply chain was already here. Sony, Tokyo Electron, and Mitsubishi have operated in the region for decades.</span>
            </p>
            <p>
                <strong>Strategic Location</strong><br>
                <span style="color: var(--color-text-secondary);">Gateway to Asia with port access and Kumamoto Airport's growing international cargo routes. 2 hours to Shanghai, 1.5 hours to Taipei.</span>
            </p>
        </div>
        <button class="chatbox-continue primary" onclick="App.transitionToJourneyB()">
            See Government Commitment
        </button>
    `);
},
```

**Step 3: Update restoreChatbox for A3 state**

Find `restoreChatbox` in `js/app.js` and update the Journey A section:

```javascript
if (journey === 'A') {
    if (step === 'A1') {
        // ... existing A1 code ...
    } else if (step === 'A3') {
        this.stepA3();
    } else {
        this.updateResourceChatbox();
        UI.elements.chatbox.classList.remove('hidden');
        UI.hideChatFab();
    }
}
```

**Step 4: Test in browser**

1. Start Journey A
2. Explore both Water and Power resources
3. Click "Continue" — should show A3 strategic narrative
4. Verify semiconductor + location text appears
5. Click "See Government Commitment" — should transition to B

**Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat(app): add Journey A step A3 — strategic advantages narrative"
```

---

## Task 6: Add Government Commitment Chain Data

**Files:**
- Modify: `js/data.js` (add governmentChain section)

**Step 1: Add governmentChain data structure**

Add after `sciencePark` section in `js/data.js` (around line 73):

```javascript
// Journey B: Government Commitment Chain
governmentChain: {
    intro: 'Every level of government is aligned behind this corridor.',
    levels: [
        {
            id: 'national',
            name: 'Japan National Government',
            coords: [32.87, 130.70],
            subtitle: 'Strategic Semiconductor Policy',
            type: 'commitment',
            description: 'The Japanese government designated semiconductors as critical infrastructure, committing ¥10 billion to support domestic chip production in Kumamoto.',
            stats: [
                { value: '¥10B', label: 'Direct commitment' },
                { value: '2021', label: 'Policy announced' },
                { value: 'Critical', label: 'Infrastructure status' },
                { value: '50%', label: 'JASM subsidy' }
            ]
        },
        {
            id: 'prefecture',
            name: 'Kumamoto Prefecture',
            coords: [32.79, 130.74],
            subtitle: 'Regional Coordination',
            type: 'commitment',
            description: 'Kumamoto Prefecture allocated additional funds and streamlined permitting for semiconductor-related development across the region.',
            stats: [
                { value: '¥480B', label: 'Infrastructure budget' },
                { value: '12', label: 'Priority projects' },
                { value: '30%', label: 'Permit time reduction' },
                { value: '2040', label: 'Master plan horizon' }
            ]
        },
        {
            id: 'kikuyo-city',
            name: 'Kikuyo Town',
            coords: [32.88, 130.83],
            subtitle: 'Local Development Plan',
            type: 'commitment',
            description: 'Kikuyo approved rezoning for 2,500 housing units and commercial centers to support semiconductor worker families.',
            stats: [
                { value: '2,500', label: 'Housing units' },
                { value: '¥180B', label: 'Infrastructure' },
                { value: '2028', label: 'Phase 1 complete' },
                { value: '+45%', label: 'Population target' }
            ]
        },
        {
            id: 'ozu-city',
            name: 'Ozu Town',
            coords: [32.86, 130.87],
            subtitle: 'Industrial Expansion',
            type: 'commitment',
            description: 'Ozu designated 120 hectares for industrial and logistics use, supporting the semiconductor supply chain.',
            stats: [
                { value: '120ha', label: 'Industrial land' },
                { value: '¥95B', label: 'Investment' },
                { value: '2027', label: 'Phase 1' },
                { value: '3,000', label: 'Jobs projected' }
            ]
        },
        {
            id: 'grand-airport',
            name: 'Grand Airport Concept',
            coords: [32.84, 130.86],
            subtitle: 'Future Connectivity Vision',
            type: 'concept',
            description: 'Long-term vision to expand Kumamoto Airport into a major cargo hub serving the semiconductor corridor with direct routes to Asia.',
            stats: [
                { value: '2035', label: 'Target completion' },
                { value: '+200%', label: 'Cargo capacity' },
                { value: '8', label: 'New Asia routes' },
                { value: '¥320B', label: 'Projected investment' }
            ]
        }
    ]
},
```

**Step 2: Test data structure**

```javascript
console.log(AppData.governmentChain.levels.length);
// Expected: 5
console.log(AppData.governmentChain.levels.map(l => l.name));
// Expected: ['Japan National Government', 'Kumamoto Prefecture', 'Kikuyo Town', 'Ozu Town', 'Grand Airport Concept']
```

**Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat(data): add government commitment chain data for Journey B"
```

---

## Task 7: Update B1 to Show Government Commitment Chain

**Files:**
- Modify: `js/app.js:159-186` (update startJourneyB)
- Modify: `js/map.js` (add showGovernmentChain function)
- Modify: `js/ui.js` (add showGovernmentLevelPanel function)

**Step 1: Add showGovernmentChain to map.js**

Add to `js/map.js`:

```javascript
/**
 * Show government commitment chain markers
 */
showGovernmentChain() {
    const chain = AppData.governmentChain;
    if (!chain || !chain.levels) return;

    chain.levels.forEach((level, index) => {
        // Stagger marker appearance for momentum effect
        setTimeout(() => {
            const marker = L.marker(level.coords, {
                icon: L.divIcon({
                    className: 'government-marker',
                    html: `<div class="marker-dot" style="background: ${level.type === 'concept' ? '#ff9500' : '#34c759'}; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"><span style="font-size: 10px; font-weight: bold; color: white;">${index + 1}</span></div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            });

            marker.on('click', () => {
                UI.showGovernmentLevelPanel(level);
            });

            marker.addTo(this.map);
            this.markers.push(marker);
        }, index * 200); // 200ms stagger between markers
    });
},
```

**Step 2: Add showGovernmentLevelPanel to ui.js**

Add to `js/ui.js`:

```javascript
/**
 * Show panel for government commitment level
 * @param {Object} level - Government level data
 */
showGovernmentLevelPanel(level) {
    const statsHtml = level.stats.map(stat => `
        <div class="stat-card">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');

    const typeLabel = level.type === 'concept' ? 'Future Vision' : 'Active Commitment';
    const typeColor = level.type === 'concept' ? 'var(--color-warning)' : 'var(--color-success)';

    const content = `
        <div class="subtitle" style="color: ${typeColor};">${typeLabel}</div>
        <h2>${level.name}</h2>
        <p class="panel-subtitle">${level.subtitle}</p>
        <p>${level.description}</p>
        <div class="stats-grid">
            ${statsHtml}
        </div>
    `;

    this.showPanel(content);
},
```

**Step 3: Update startJourneyB in app.js**

Replace the existing `startJourneyB` function:

```javascript
startJourneyB() {
    this.state.journey = 'B';
    this.state.step = 'B1';
    this.state.companiesExplored = [];

    // Show data layers toggle for Journey B
    UI.showDataLayers('B');

    // Show panel toggle button
    UI.showPanelToggle();

    // Update legend for Journey B
    UI.showLegend('B');

    // B1: Show government commitment chain with chatbox intro
    UI.showChatbox(`
        <h3>Government Support</h3>
        <p>${AppData.governmentChain.intro}</p>
        <p style="margin-top: 12px;"><strong>Click the numbered markers</strong> to see each level's commitment — from national policy to local planning.</p>
    `, { skipHistory: true });

    // Show government chain markers (staggered animation)
    MapManager.showGovernmentChain();

    // Also show Science Park as part of B1 context
    setTimeout(() => {
        MapManager.showSciencePark();
    }, 1200);

    // After delay, add button to continue to B4
    setTimeout(() => {
        UI.updateChatbox(`
            <h3>Government Support</h3>
            <p>${AppData.governmentChain.intro}</p>
            <p style="margin-top: 12px;"><strong>Click the numbered markers</strong> to explore each level's commitment.</p>
            <button class="chatbox-continue primary" onclick="App.stepB4()">
                See Who's Building Here
            </button>
        `);
    }, 2500);
},
```

**Step 4: Test in browser**

1. Complete Journey A
2. Transition to Journey B
3. Verify numbered markers appear (staggered)
4. Click each marker — panel shows commitment details
5. Verify "See Who's Building Here" button appears

**Step 5: Commit**

```bash
git add js/app.js js/map.js js/ui.js
git commit -m "feat(app): update B1 to show government commitment chain"
```

---

## Task 8: Reframe B4 as "Result of Government Commitment"

**Files:**
- Modify: `js/app.js:188-201` (update stepB4)

**Step 1: Update stepB4 chatbox messaging**

Replace the existing `stepB4` function:

```javascript
stepB4() {
    this.state.step = 'B4';

    MapManager.showCompanyMarkers();

    UI.updateChatbox(`
        <h3>Government Support</h3>
        <p><strong>The result:</strong> Major corporations have committed billions.</p>
        <p>Click company markers to see their investments.</p>
        <button class="chatbox-continue primary" onclick="App.stepB6()">
            Show Development Timeline
        </button>
    `);
},
```

**Step 2: Test in browser**

1. Reach B4 in Journey B
2. Verify chatbox says "The result:" framing
3. Company markers should appear

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat(app): reframe B4 as result of government commitment"
```

---

## Task 9: Add "Plans to Proof" Transition Before B7

**Files:**
- Modify: `js/app.js:203-229` (update stepB6)

**Step 1: Update stepB6 to set up B7 transition**

Replace the existing `stepB6` function:

```javascript
stepB6() {
    this.state.step = 'B6';

    // Show the Future/Present toggle
    UI.showControlBar();
    UI.showTimeToggle();

    UI.updateChatbox(`
        <h3>Government Support</h3>
        <p>Use the <strong>Future / Present</strong> toggle above to see planned developments.</p>
        <p>Future view shows development zones taking shape.</p>
        <div class="chatbox-options" style="margin-top: 12px;">
            <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('government-zones')">
                View Government Zone Plans
            </button>
            <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('transportation-network')">
                View Transportation Network
            </button>
            <button class="chatbox-option" onclick="App.showEvidenceGroupPanel('education-pipeline')">
                View Education Pipeline
            </button>
        </div>
        <button class="chatbox-continue primary" onclick="App.stepB7()">
            See What's Changing
        </button>
    `);
},
```

**Step 2: Update stepB7 with "Changes in Area" framing**

Replace the existing `stepB7` function:

```javascript
stepB7() {
    this.state.step = 'B7';

    // Reset to present view for clarity
    UI.setTimeView('present');

    // Show infrastructure roads on the map
    MapManager.showInfrastructureRoads();

    // Update legend to include infrastructure roads
    UI.showLegend('B7');

    UI.updateChatbox(`
        <h3>Changes in Area</h3>
        <p><strong>Government commitment is one thing. Here's what's actually changing.</strong></p>
        <p>These infrastructure projects are cutting commute times — making nearby properties more valuable.</p>
        <p style="margin-top: 8px;"><strong>Click a highlighted road</strong> to see the impact.</p>
        <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
            View Investment Opportunities
        </button>
    `);
},
```

**Step 3: Test in browser**

1. Reach B6 in Journey B
2. Verify "See What's Changing" button
3. Click to B7
4. Verify "Changes in Area" header and "government commitment" framing text

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat(app): add plans-to-proof transition and Changes in Area framing"
```

---

## Task 10: Add Station Marker to B7

**Files:**
- Modify: `js/data.js` (add infrastructureStation data)
- Modify: `js/map.js` (update showInfrastructureRoads to include station)
- Modify: `js/ui.js` (add showStationPanel function)

**Step 1: Add infrastructureStation data**

Add after `infrastructureRoads` in `js/data.js`:

```javascript
// Journey B: Infrastructure Station (B7)
infrastructureStation: {
    id: 'kikuyo-station',
    name: 'Kikuyo Station',
    coords: [32.88, 130.81],
    subtitle: 'New Rail Connection',
    status: 'Under Construction',
    completionDate: '2026',
    description: 'New JR Hohi Line station providing direct rail access from Kumamoto City to the Science Park corridor. Reduces commute time for semiconductor workers.',
    stats: [
        { value: '18 min', label: 'To Kumamoto City' },
        { value: '8 min', label: 'To JASM' },
        { value: '15 min', label: 'Train frequency' },
        { value: '8,000', label: 'Daily passengers est.' }
    ],
    commuteImpact: 'Rail option',
    documentLink: '#'
},
```

**Step 2: Update showInfrastructureRoads in map.js to include station**

Find `showInfrastructureRoads` in `js/map.js` and add at the end of the function:

```javascript
// Also show station marker
const station = AppData.infrastructureStation;
if (station) {
    const stationMarker = L.marker(station.coords, {
        icon: L.divIcon({
            className: 'infrastructure-marker station-marker',
            html: `<div class="marker-icon" style="background: #5ac8fa; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M4 15v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M4 11h16v4H4z"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/></svg></div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        })
    });

    stationMarker.on('click', () => {
        // Deselect any selected road
        this.deselectAllRoads();
        UI.showStationPanel(station);
    });

    stationMarker.addTo(this.map);
    this.infrastructureMarkers.push(stationMarker);
}
```

**Step 3: Add showStationPanel to ui.js**

Add to `js/ui.js`:

```javascript
/**
 * Show panel for infrastructure station
 * @param {Object} station - Station data
 */
showStationPanel(station) {
    const statsHtml = station.stats.map(stat => `
        <div class="stat-card">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');

    const content = `
        <div class="subtitle">Infrastructure Plan</div>
        <h2>${station.name}</h2>
        <p class="panel-subtitle">${station.subtitle}</p>

        <div class="headline-metric" style="margin: 16px 0; padding: 16px; background: var(--color-bg-secondary); border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 600; color: var(--color-success);">${station.commuteImpact}</div>
            <div style="font-size: 14px; color: var(--color-text-secondary);">New Commute Option</div>
        </div>

        <div class="stats-grid">
            ${statsHtml}
        </div>

        <p style="margin-top: 16px;">${station.description}</p>

        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-bg-tertiary);">
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;">
                <span style="color: var(--color-text-secondary);">Status</span>
                <span>${station.status}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px;">
                <span style="color: var(--color-text-secondary);">Completion</span>
                <span>${station.completionDate}</span>
            </div>
        </div>
    `;

    this.showPanel(content);
},
```

**Step 4: Update legend for B7 to include station**

Find `getLegendItems` in `js/ui.js` and update the B7 case:

```javascript
case 'B7':
    return [
        ...this.getLegendItems('B'),
        { type: 'Infrastructure Roads', color: '#5ac8fa', icon: 'route' },
        { type: 'New Station', color: '#5ac8fa', icon: 'train-front' }
    ];
```

**Step 5: Test in browser**

1. Reach B7 in Journey B
2. Verify station marker appears alongside roads
3. Click station — panel shows details
4. Legend includes "New Station" item

**Step 6: Commit**

```bash
git add js/data.js js/map.js js/ui.js
git commit -m "feat(app): add Kikuyo Station marker to B7 infrastructure"
```

---

## Task 11: Update Journey C Transition Messaging

**Files:**
- Modify: `js/app.js:278-309` (update startJourneyC)

**Step 1: Update startJourneyC with Area 4 framing**

Replace the chatbox content in `startJourneyC`:

```javascript
startJourneyC() {
    this.state.journey = 'C';
    this.state.step = 'C1';

    // C1: Show property markers
    MapManager.showPropertyMarkers();

    // Update data layers toggle for Journey C
    UI.showDataLayers('C');

    // Update legend for Journey C
    UI.showLegend('C');

    // Generate portfolio summary (Peak Experience)
    const portfolioSummary = UI.showPortfolioSummary();

    UI.showChatbox(`
        <h3>Investment Opportunities</h3>
        <p>You've seen why Kumamoto, the government backing, and what's changing on the ground.</p>
        <p><strong>Now let's look at specific investment opportunities.</strong></p>
        <p style="margin-top: 12px;">Amber markers show available properties. Click to see financials.</p>
        ${portfolioSummary}
        <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
            Route lines show distance to JASM employment center.
        </p>
        <button class="chatbox-continue primary" onclick="App.complete()">
            Any More Questions?
        </button>
    `, { skipHistory: true });

    // Hide time toggle for clarity
    UI.hideTimeToggle();
},
```

**Step 2: Test in browser**

1. Complete B7 and transition to Journey C
2. Verify chatbox shows "You've seen why Kumamoto..." framing
3. Properties should display correctly

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat(app): update Journey C with 4-area narrative summary"
```

---

## Task 12: Update restoreChatbox for All New Steps

**Files:**
- Modify: `js/app.js:392-457` (update restoreChatbox)

**Step 1: Update restoreChatbox with all new step states**

Replace the `restoreChatbox` function:

```javascript
/**
 * Restore chatbox content based on current journey state
 * Called when user clicks the FAB to reopen chatbox
 */
restoreChatbox() {
    const { journey, step } = this.state;

    if (journey === 'A') {
        if (step === 'A1') {
            UI.showChatbox(`
                <h3>Why Kumamoto?</h3>
                <p>Discover what makes this region special for semiconductor investment.</p>
                <button class="chatbox-continue primary" onclick="App.stepA2()">
                    Start Exploring
                </button>
            `);
        } else if (step === 'A3') {
            this.stepA3();
        } else {
            this.updateResourceChatbox();
            UI.elements.chatbox.classList.remove('hidden');
            UI.hideChatFab();
        }
    } else if (journey === 'B') {
        if (step === 'B1') {
            UI.showChatbox(`
                <h3>Government Support</h3>
                <p>${AppData.governmentChain.intro}</p>
                <p style="margin-top: 12px;"><strong>Click the numbered markers</strong> to explore each level's commitment.</p>
                <button class="chatbox-continue primary" onclick="App.stepB4()">
                    See Who's Building Here
                </button>
            `);
        } else if (step === 'B4') {
            UI.showChatbox(`
                <h3>Government Support</h3>
                <p><strong>The result:</strong> Major corporations have committed billions.</p>
                <p>Click company markers to see their investments.</p>
                <button class="chatbox-continue primary" onclick="App.stepB6()">
                    Show Development Timeline
                </button>
            `);
        } else if (step === 'B6') {
            UI.showChatbox(`
                <h3>Government Support</h3>
                <p>Use the <strong>Future / Present</strong> toggle above to see planned developments.</p>
                <button class="chatbox-continue primary" onclick="App.stepB7()">
                    See What's Changing
                </button>
            `);
        } else if (step === 'B7') {
            UI.showChatbox(`
                <h3>Changes in Area</h3>
                <p><strong>Government commitment is one thing. Here's what's actually changing.</strong></p>
                <p>Click a highlighted road or the station marker to see details.</p>
                <button class="chatbox-continue primary" onclick="App.transitionToJourneyC()">
                    View Investment Opportunities
                </button>
            `);
        } else {
            UI.showChatbox(`
                <h3>Infrastructure Plan</h3>
                <p>Explore the markers on the map to learn about developments.</p>
            `);
        }
    } else if (journey === 'C') {
        const portfolioSummary = UI.showPortfolioSummary();
        UI.showChatbox(`
            <h3>Investment Opportunities</h3>
            <p>You've seen why Kumamoto, the government backing, and what's changing on the ground.</p>
            <p><strong>Click property markers to see financials.</strong></p>
            ${portfolioSummary}
            <button class="chatbox-continue primary" onclick="App.complete()">
                Any More Questions?
            </button>
        `);
    } else {
        UI.showChatbox(`
            <h3>Kumamoto Investment Guide</h3>
            <p>Explore the map to learn about investment opportunities.</p>
        `);
    }
},
```

**Step 2: Test in browser**

1. At each step, close chatbox and click FAB
2. Verify correct content restores for each step

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat(app): update restoreChatbox for all feedback v2 steps"
```

---

## Task 13: Final Integration Test

**Files:**
- No code changes — testing only

**Step 1: Run full 4-area narrative flow**

Test the complete demo flow:

1. **Area 1: Why Kumamoto**
   - [ ] A1 intro appears
   - [ ] A2 shows Water + Power options
   - [ ] Water shows Coca-Cola + Suntory evidence markers
   - [ ] Power shows energy mix in panel
   - [ ] A3 shows strategic narrative (semiconductor + location)
   - [ ] Transition button says "See Government Commitment"

2. **Area 2: Government Support**
   - [ ] B1 shows numbered government markers (staggered)
   - [ ] Each marker opens commitment panel
   - [ ] Science Park circle appears
   - [ ] B4 frames companies as "The result"
   - [ ] B6 shows Future/Present toggle

3. **Area 3: Changes in Area**
   - [ ] B7 has "Changes in Area" header
   - [ ] "Government commitment is one thing" framing
   - [ ] Roads + station marker visible
   - [ ] Station panel shows details

4. **Area 4: Investment Opportunities**
   - [ ] C1 shows 4-area summary text
   - [ ] Properties display correctly
   - [ ] AI Chat available at completion

**Step 2: Verify chatbox restore**

At each step, close chatbox → click FAB → verify correct content restores.

**Step 3: Commit final state**

```bash
git add -A
git commit -m "test: verify feedback v2 implementation complete"
```

---

## Summary

| Task | Description | Files Modified |
|------|-------------|----------------|
| 1 | Water evidence markers data | data.js |
| 2 | Energy mix panel data | data.js |
| 3 | Water evidence marker display | map.js, ui.js |
| 4 | Electricity panel energy mix | ui.js |
| 5 | A3 strategic narrative step | app.js |
| 6 | Government chain data | data.js |
| 7 | B1 government chain display | app.js, map.js, ui.js |
| 8 | B4 "result" reframe | app.js |
| 9 | B7 "Changes in Area" framing | app.js |
| 10 | Station marker in B7 | data.js, map.js, ui.js |
| 11 | Journey C 4-area summary | app.js |
| 12 | restoreChatbox updates | app.js |
| 13 | Integration testing | - |

Total: 13 tasks, ~13 commits
