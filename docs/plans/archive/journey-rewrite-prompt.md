# Journey Flow Rewrite - Implementation Prompt

**Use this prompt to start a new chat session. Read every word before writing any code.**

---

## Context

This is an interactive map prototype for a real estate investment presentation about Kumamoto, Japan. The app uses HTML/CSS/JS with Mapbox GL JS.

The current code has **three journeys (A, B, C)** that are entirely map-based. This is wrong. The presentation follows a **Q1-Q5 question structure** that alternates between an external slide deck and the interactive map. The map only activates at specific cue points.

Your job is to rewrite the journey flow in `js/app.js` and `js/data.js` to match the correct Q1-Q5 structure below. Do not change the design system, visual styling, or component patterns. Only restructure the journey steps, data, and state machine.

---

## Critical Files

- `js/app.js` - Main state machine, journey progression, step handlers, transitions. **Primary file to rewrite.**
- `js/data.js` - Journey definitions, step data, evidence data, property data. **Primary file to rewrite.**
- `js/map-controller.js` - Camera positions, markers, layers, map interactions. **Update camera steps and marker logic as needed.**
- `js/ui.js` - Panel content, chatbox content rendering. **Update to match new step IDs.**
- `CLAUDE.md` - Design system. **Do not modify.**
- `feedback/journey-specification.md` - The detailed spec for every map interaction. **Read this file completely before starting. It is the source of truth for map behavior.**
- `feedback/feedback-v6.md` - Meeting notes with additional context. **Read this file.**
- `docs/plans/2026-02-19-new-journey-flow.md` - Draft plan mapping Q1-Q5. **Read this file.**

---

## The Complete Presentation Flow

The presentation is a **two-part experience**: slides (external deck, not our app) + interactive map (our app). The map activates at specific cue points during the slide narrative. Our app only handles the MAP portions. Between map sections, the presenter switches to the slide deck manually.

### Entry Paths

1. **Primary:** Guided Q1-Q5 journey (presenter clicks through sequentially)
2. **Secondary:** "I've seen this before" - skip to fully loaded interactive dashboard

### Slide-to-Map Transition Model

The presenter manually switches between the slide deck and our map app. Our app needs a way for the presenter to trigger each map section (e.g., a control bar or step buttons). The map sections are:

| Cue Point | Direction | What Triggers It |
|-----------|-----------|-----------------|
| Resource list (water/power/strategic) | Slides to Map | Presenter switches to map app for Q1 resources |
| Airline route map complete | Map to Slides | Presenter switches back to slides for Q2 |
| After Q2 slides | Slides to Map | Presenter switches to map for government/corporate overview |
| After government/corporate | Map to Slides | Presenter switches to slides for Q3 intro |
| Talent pipeline slide | Slides to Map | Presenter switches to map for Q3 development/education/future |
| After future outlook | Map to Slides | Presenter switches to slides for Q4 |
| After Q4 slides | Slides to Map | Presenter switches to map for investment zone + Q5 properties |
| After properties | Map to Slides | Presenter switches to slides for closing |
| QA section | Slides to Map | Presenter switches to map for final interactive dashboard |

---

## Q1: "Land already pricey?"

### Slides (not our app)
- Q1 question card
- Why Japan invests in semiconductors, why Kumamoto
- Supply chain crisis (2020+, strategic material, 4-5 trillion yen budget)
- Resource list: water, power, strategic location

### Map Section (our app) - 7 clickable elements

**Entry state:** Kumamoto regional view, base + zones layers active, no properties visible.

The presenter sees a menu/chatbox with these 7 items to click through:

#### 1. Water Resources
- Show Suntory factory + Coca-Cola facility locations on map
- Connection lines from each to JASM
- Marker type: water droplet icons
- Right panel evidence: TSMC ESG sustainability report screenshots, Coca-Cola press release, Suntory water quality docs
- Chatbox narrative about Kumamoto's underground water aquifer

#### 2. Power - Solar
- Zoom out to Kyushu-wide view
- Solar farm markers appear (yellow sun icons) across all Kyushu prefectures
- Airline-style connection lines from each solar farm to JASM
- Animation: slow, clear line drawing
- Right panel evidence: METI solar capacity growth chart (2012-2024)

#### 3. Power - Wind
- Maintain Kyushu-wide view
- Wind farm markers appear (blue wind turbine icons)
- Airline-style connection lines to JASM
- Right panel evidence: METI wind capacity data

#### 4. Power - Nuclear
- Nuclear plant markers: Genkai (33.515N, 129.836E) and Sendai (31.8336N, 130.1894E)
- Airline-style connection lines to JASM
- Right panel evidence: Kyushu Electric power grid nuclear documentation
- Chatbox narrative about stable baseload power for 24/7 fab operations

#### 5. Sewage & Municipal Infrastructure
- Show sewage system planning on map
- Right panel evidence: Kumamoto semiconductor district public sewage PDF, Fukuhara/Haramizu sewage plan

#### 6. Silicon Island Kyushu Heritage
- Show Kyushu semiconductor historical context
- Right panel evidence: BoJ Fukuoka branch report (IC production ~40% domestic share), Kyushu semiconductor company map
- Chatbox narrative about Silicon Island revival

#### 7. Strategic Position (Asia Geopolitics)
- Airline-route style map showing Kyushu position relative to Taiwan, Korea, Shanghai
- Right panel: East Asia map image
- Chatbox narrative about logistics hub advantage

**Exit:** After Strategic Position, presenter switches back to slide deck for Q2.

---

## Q2: "What if TSMC plan changes?"

### Slides (not our app)
- Q2 question card
- TSMC and Japan cooperation agreement
- Japan semiconductor revival
- Sony CMOS
- JASM 1, JASM 2
- National to local policy

### Map Section (our app) - Government + Corporate overview

After Q2 slides, presenter switches to map for:

#### Government Support
- Government commitment markers cascade onto map (National, Prefecture, Kikuyo, Ozu, Grand Airport Concept)
- Science park and investment zones appear

#### Corporate Investment Overview
- Company markers drop in: TSMC/JASM, Sony, SUMCO, Kyocera, Rohm, Mitsubishi, Tokyo Electron
- All company locations visible
- Right panel shows corporate ecosystem

**Exit:** Presenter switches back to slides for Q3 intro.

---

## Q3: "Can properties rent out?"

### Slides (not our app)
- Q3 question card
- Kumamoto semiconductor science park / Grand airport plan
- Talent pipeline slide

### Map Section (our app) - Three groups of clickable content

**Entry trigger:** After talent pipeline slide, presenter switches to map.

#### Group 1: Development Timeline (4 clickable zone items)

| Item | Map Behavior | Right Panel |
|------|-------------|-------------|
| Kumamoto Science Park | Highlight entire cluster boundary | Science park master plan doc |
| Government Zone Plan | Show all zone overlays (Koshi, Kikuyo, Ozu, Kyokushi) | Zone planning documentation |
| Kikuyo Long-Term Plan | Zoom to Kikuyo cluster, show 70-hectare Haramizu zone, new station location | JR Kyushu docs, tender docs (3-zone concept), vision plan |
| Ozu Long-Term Plan | Zoom to Ozu cluster | Ozu vision plan, gateway/logistics role |

#### Group 2: Infrastructure (4 clickable items)

| Item | Map Behavior | Right Panel |
|------|-------------|-------------|
| Grand Airport | Highlight airport area | Grand airport concept docs |
| Airport Access | Highlight access routes | Evidence screenshot |
| New Railway | Highlight rail corridor (Higo-Ozu to airport access road) | Railway construction plan, route details, cost structure |
| Road Extension | Highlight road expansion zones | Road extension construction plan |

#### Group 3: Education Pipeline (4 clickable items)

| Item | Map Behavior | Right Panel |
|------|-------------|-------------|
| Universities | All Kyushu universities with airline-style lines to JASM logo | Talent ecosystem diagram (Kyutech, Kumamoto U, Prefectural U) |
| Training Centers | Training center locations | Training center documentation |
| Employment | Employment centers | TEL salary increase evidence (40% raise, Bloomberg) |
| International Education | International school locations | Kumamoto International School expansion, city internationalization docs |

#### Future Outlook Toggle
- Toggle button switches entire map to 2030+ completed state
- Shows: science park expansion, grand airport new urban zone, road extensions completed (dashed lines become solid), new stations operational, airport access rail
- Right panel evidence: government future outlook documentation
- Narrative: comprehensive long-term urbanization plan

**Exit:** Presenter switches back to slides for Q4.

---

## Q4: "Still appreciation potential?"

### Slides (not our app)
- Q4 question card
- JASM investment situation
- TSMC effect
- Kyushu Financial Group outlook

### Map Section (our app) - Corporate Investment Layer

- Corporate pins drop in sequence across map (TSMC/JASM, Sony, Tokyo Electron, supply chain)
- Each pin clickable for investment details
- Right panel: TSMC infrastructure status map, investment timeline with numbered markers
- "Three major ecosystem builders" table

**Exit:** Presenter continues on map into Q5 (no slide break, or minimal Q5 question card).

---

## Q5: "Future really stable?"

### Map Section (our app) - Investment Zone then Properties

#### Opening: Kumamoto Investment Opportunities Zone
- Large color-coded overlay on map
- Orange/yellow central zone (highest opportunity), green zones (good opportunity)
- Labeled zones: semiconductor cluster, Kikuyo industrial park, Ozu industrial zone, etc.

#### Silicon Triangle Zones Detail (clickable)
- **Kikuyo Zone** - role: "factory core / new urban core" (manufacturing, new station + 70ha zone, Mitsui Fudosan partnership)
- **Koshi Zone** - role: "R&D / tools & process innovation" (equipment chain)
- **Ozu Zone** - role: "gateway / office & logistics support" (transport hub)

#### Property #1: Ozu Sugimizu Land
**Step 1:** Click marker → travel line animates to TSMC, label shows "X minutes by car"
**Step 2:** Click again → zoom to property, boundary highlighted, right panel shows 4 cards:
- Card 1: Images (property photos/renderings)
- Card 2: Truth Engine (specs, design strategy, land strategy)
- Card 3: Future Outlook (area development, infrastructure timeline)
- Card 4: Financial Projection (rental BTR returns, rental market report button)

#### Property #2: Kikuyo Kubota
Same 2-step pattern, same 4 cards.
- Truth Engine: renovation type (buy-renovate-rent or buy-renovate-sell)
- Financial Projection: two paths (renovation + rental, renovation + sale)

#### Property #3: Haramizu Land
Same 2-step pattern, same 4 cards.

#### Observation Areas (different marker style, not immediate investment)
- Hikarinomori Area (high-spec rental opportunity)
- Kumamoto Station Area (RC mansion/hospitality opportunity)

#### Why MoreHarvest Section
Right panel content: deep local knowledge, stable returns (96% occupancy), investor perspective, landmine zone avoidance

**Exit:** Presenter switches to slides for closing.

---

## Closing

### Slides (not our app)
- Understanding Kumamoto opportunities and risk management
- 5 Questions vs Answers summary
- QA section

### Final Map State (our app) - Interactive Dashboard

**Entry trigger:** QA slide is the cue to switch to map for the last time.

- ALL layers simultaneously active: investment zones, property locations, infrastructure, government areas, corporate pins, risk overlays
- Interactive dashboard for answering live investor questions
- "Mix of both" - business development areas + property opportunities + infrastructure context
- Evidence readily accessible from any marker

---

## UX Requirements

### Home Button
- Always visible on map
- Resets to Kumamoto regional overview
- Clears all drill-down layers
- Returns zoom to default state

### Animation Speed
- All zoom/pan animations: slow and clear
- Airline-style connection lines: animate smoothly
- Avoid fast zoom problem
- Allow skip for repeat viewers

### Evidence Panels
- Use actual screenshot images (check `assets/use-case-images/` for available evidence images)
- Each evidence item: main screenshot + optional extra pages
- Click link opens full source

### Property Markers
- House icons (not generic pins)
- Labels clearly visible: "Ozu 1", "Kikuyo 1", "Haramizu Land"
- Travel time lines visually distinct from infrastructure lines

---

## Vision Modal + 3 Circles (from feedback notes)

This is mentioned in the feedback but not precisely placed in the storyboard. It likely belongs in Q3's map section or as a bridge. Implement as:

### Vision Modal
Three sections:
1. Kumamoto Science Park
2. Grand Airport concept
3. Talent pipeline

### 3 Circles Map View (after Vision)
Three overlapping zones on map:
- JASM / Science Park
- Kumamoto Station
- Area between station and Science Park

Used to explain three core growth zones.

---

## Implementation Approach

1. **Read** `feedback/journey-specification.md` completely first. It has every interaction detail.
2. **Read** `feedback/feedback-v6.md` for meeting context.
3. **Read** `docs/plans/2026-02-19-new-journey-flow.md` for the Q1-Q5 mapping.
4. **Read** the current `js/app.js` and `js/data.js` to understand existing patterns.
5. **Restructure** the state machine from A/B/C to Q1-Q5 with the correct step sequences.
6. **Update** data.js with correct step definitions, evidence mappings, and property data.
7. **Update** camera positions if needed for new steps.
8. **Update** UI rendering to match new step IDs.
9. **Test** each Q section works independently.

Do NOT change the design system (CLAUDE.md), component styling, or visual patterns. Only restructure the journey flow and data.

Do NOT add any Japanese text to the UI. English only, romanized place names.

The map app does NOT contain slides. It only handles the MAP portions. The presenter manually switches between slide deck and map app.
