# MAP-PROTOTYPE: App Specification

## Overview

A desktop-only interactive presentation app built around a Leaflet map of Kumamoto, Japan's emerging semiconductor corridor. Designed as a sales tool for investment advisors to walk clients through real estate opportunities. The app presents as a "choose your own adventure" experience but is actually a carefully sequenced narrative that builds context before presenting financial projections.

---

## Core Concept: Guided Discovery

The three journeys are sequential (A → B → C), but the UI should never feel like a linear slideshow. Instead, it should feel like the presenter and client are exploring a map together and uncovering information organically. The sequencing exists because each journey builds credibility for the next:

- **"Why Kumamoto?"** establishes location value
- **"Infrastructure Plan"** proves institutional commitment
- **"Investment Projections"** delivers the payoff

The illusion of choice comes from how the presenter interacts with the map. They click markers, toggle layers, and reveal panels as if discovering things in real-time, even though the sequence is predetermined. The client should feel like they're on a guided tour with a knowledgeable local, not sitting through a pitch deck.

---

## Initial State

The app launches to a blank white screen with two options:

| Element | Property | Value |
|---------|----------|-------|
| Primary Button | Fill color | `#fbb931` (yellow) |
| Primary Button | Text color | black |
| Primary Button | Text | "Start the Journey" |
| Secondary Link | Style | Ghost button (text-only) |
| Secondary Link | Text | "Skip to Dashboard" |

The primary button initiates the guided journey experience. The secondary link bypasses all journeys and goes directly to Dashboard mode for free exploration.

---

## After "Start the Journey"

1. The button fades out
2. The map fades in, centered on Kumamoto Prefecture
3. Journey A ("Why Kumamoto?") begins automatically

There is no journey selection screen. The experience flows from A → B → C with natural transition points that feel like the presenter is choosing to go deeper rather than being forced to the next slide.

---

## Dashboard Mode ("Skip to Dashboard")

An alternative entry point for users who want to explore the map freely without the guided narrative.

### Transition In
Clicking "Skip to Dashboard" on the initial screen.

### What Appears
1. Map fades in, centered on Kumamoto Prefecture
2. Dashboard toggle button appears (top-right)
3. Data Layers toggle button appears (left side, aligned with dashboard toggle)
4. Map legend appears (bottom-right)
5. Dashboard panel slides in from right
6. Chat FAB appears (bottom-center) after a short delay

### AI Chat in Dashboard Mode
- Accessed via the Chat FAB (yellow floating button)
- Opens the same AI Chat interface as post-journey
- **CTAs are hidden** (Download Summary, Explore Again) — these only make sense after completing a journey
- Users can ask questions about Kumamoto freely

### Available Features
- Full map interaction (pan, zoom, click markers)
- Data Layers panel for toggling map overlays
- Dashboard panel with overview statistics
- AI Chat for questions about Kumamoto

---

## Progressive UI Reveal

UI elements do not exist on screen until the current step requires them.

- When a step needs the right panel, it slides in
- When a step needs a map layer toggle, it appears in the control bar
- When a step concludes and an element is no longer needed, it can fade out or remain depending on whether it's useful for context

The goal is to avoid visual clutter and keep the client focused on exactly what's being discussed.

---

## App Components

### The Map
The central element occupying most of the screen. Displays Kumamoto with interactive markers, polygon overlays (like the Science Park radius), route lines, and layer states (present vs. future).

### The Right Panel
A slide-in panel on the right displaying contextual information for whatever map element is currently selected. Content includes text, statistics, images, and links to supporting materials.

### The Chatbox
A small overlay that displays prompts or guided questions. Appears when the narrative needs to pose a question to frame the next section (e.g., "Why Kumamoto?").

### The Gallery Modal
A full-screen overlay for viewing PDFs, images, or embedded external content without leaving the app.

### The Evidence Library
A disclosure-based panel that organizes supporting documentation into collapsible groups. Each evidence group contains multiple items that can be explored individually. Items with geographic coordinates display markers on the map with bidirectional selection sync (clicking a list item highlights its marker; clicking a marker opens its detail view).

### The Control Bar
Contains layer toggles and the future/present switch. These controls appear only when relevant to the current journey step.

### The Panel Toggle
A 36x36px button (top-right of map) that toggles right panel visibility. Uses brand yellow active state. Icon: Lucide `panel-right`.

### The Dashboard Toggle
A 36x36px button (below panel toggle, top-right) that switches to Dashboard mode with overview statistics. Uses brand yellow active state. Icon: Lucide `bar-chart-3`. Has `aria-expanded` for accessibility.

### The Property Quick Look
A macOS Quick Look-style full-screen image preview at z-index 2000. Triggered by property image interaction. Dismissible via click, Escape, or close button. Entrance animation scales from 0.9 to 1.

### The Cinematic Skip Button
A translucent button appearing during the opening 3D fly-in animation. Glass-morphism style (backdrop-filter blur). Disappears when animation completes or journey begins.

### The Data Layers Button
A toggle button (always visible) that opens a panel for controlling map layer visibility. The button remains visible across all journey states; when journeys change, the panel closes but the button stays accessible.

### The Map Legend
Displays marker types for the current view. Core items (Base Map, Science Park, Corporate Sites, Real Estate) are always visible; journey-specific items are added below. All icons use Lucide icon library for consistency with the Data Layers panel.

---

## Journey A: "Why Kumamoto?"

### Purpose
Establish why Kumamoto is a strategic investment location. Focus on natural advantages (water, power) that attracted semiconductor manufacturers.

### Transition In
Automatic after "Start the Journey" button is clicked.

### Steps

**Step A1**
The chatbox appears with the question "Why Kumamoto?" displayed as a clickable prompt. The map is visible but has no markers yet.

**Step A2**
After clicking the prompt, the chatbox updates to show two options: "Water Resources" and "Power Infrastructure." These appear as clickable text or small cards.

**Step A3**
The presenter clicks one option. The map pans/zooms to that location. A marker or highlighted area appears.

**Step A4**
The presenter clicks the marker. The right panel slides in showing information about that resource (statistics, geographic advantages, source citations).

**Step A5**
The right panel includes a "View Evidence" link.

**Step A6**
Clicking the link opens the gallery modal with a PDF or website preview showing the source material.

**Step A7**
The presenter closes the gallery and returns to the map. They can repeat A3–A6 for the other resource option.

**Step A8**
After exploring both resources, the chatbox offers a link to "View Energy Infrastructure Evidence" which opens the Evidence Library filtered to the energy-infrastructure group.

### Transition Out
After both resources have been explored (or the presenter indicates readiness), a subtle prompt or the chatbox suggests "Now let's look at what's being built here..." This leads into Journey B.

---

## Journey B: "Infrastructure Plan"

### Purpose
Demonstrate the scale of institutional investment and government planning in the region. Prove that Kumamoto isn't speculative — major players are already committed.

### Transition In
Flows naturally from Journey A's conclusion.

### Steps

**Step B1**
The Infrastructure layer activates on the map. New elements become visible.

**Step B2**
A red circle overlay appears representing the Kumamoto Science Park radius. The presenter clicks this circle.

**Step B3**
The right panel slides in with the Science Park master plan overview (government documentation, development timeline, key statistics). Includes a link to supporting materials (opens in gallery).

**Step B4**
Corporate investment markers appear on the map (JASM, Sony, Tokyo Electron, Mitsubishi Electric, etc.).

**Step B5**
The presenter clicks any company marker. The right panel updates to show that company's investment amount, job creation numbers, and press release excerpts. Link to full press release opens in gallery.

**Step B6**
A "Future / Present" toggle appears in the control bar. The presenter clicks the Future toggle. The map transitions to show the projected future state of the Science Park cluster with additional planned developments. Smaller circle markers appear representing future development zones (Kikuyo, Ozu areas). Clicking any small circle shows the relevant local government's long-term plan in the right panel. Link to official documentation opens in gallery. The presenter can toggle back to Present view to compare.

The chatbox provides quick access to the Evidence Library with links to explore:
- Government Development Zones
- Transportation Network
- Education & Talent Pipeline

Each opens the Evidence Library expanded to that category.

A "View Road Improvements" button appears in the chatbox to advance to Step B7.

**Step B7: Infrastructure Roads**
Teal dashed polylines appear on the map showing planned and in-progress road infrastructure projects. These roads support the narrative that government investment in transportation makes nearby properties more accessible and valuable.

| Visual Treatment | Value |
|------------------|-------|
| Color | `#5ac8fa` (teal) |
| Stroke weight | 5px default, 7px on hover/selected |
| Dash pattern | `10, 6` (dashed default, solid when selected) |
| Opacity | 0.7 default, 1.0 on hover/selected |

Interaction:
- Hover shows cursor change and increased opacity
- Single selection only (clicking another road deselects the previous)
- Click opens right panel with road details

Right panel content structure:
- Subtitle: "Infrastructure Plan"
- Title: Road name
- Headline metric: Commute time saved (e.g., "-8 min")
- Stats grid: Drive time to JASM, Status, Completion date, Budget
- Description text
- "View Source Document" button

The chatbox shows explanatory text and a "View Properties" button to transition to Journey C.

### Transition Out
After exploring infrastructure roads, the presenter clicks "View Properties" to advance to Journey C, which presents specific investment opportunities.

---

## Journey C: "Investment Financial Projections"

### Purpose
Present specific investment properties with financial modeling. This is the close — everything prior was building credibility for this moment.

### Transition In
Flows naturally from Journey B's conclusion.

### Steps

**Step C1**
Investment property markers appear on the map (these are the actual properties being sold).

**Step C2**
The presenter clicks a property marker. A route line draws from the property to JASM, visually showing proximity to the employment center.

**Step C3**
The right panel slides in with basic property info: distance to JASM, driving time, neighborhood context.

**Step C4**
A "Truth Engine" button appears in the right panel.

**Step C5**
Clicking Truth Engine expands the panel to show long-term growth drivers: rezoning projects, announced corporate expansions, infrastructure improvements. Each item can link to source documentation (opens in gallery).

**Step C6**
A "Performance Calculator" button appears.

**Step C7**
Clicking Performance Calculator transforms the right panel into a financial modeling view showing:
- Property rendering or photo
- Total acquisition cost
- Estimated selling price
- Applicable taxes
- Pre-tax and post-tax income projections
- Net profit calculation

**Step C8**
A scenario toggle appears with three options: Bear Case, Average Case, and Bull Case. Each shows different percentage assumptions and resulting projections. The presenter can flip between them.

**Step C9**
A link to the rental report (from property manager) appears. Opens in gallery.

**Step C10**
A final section displays area average growth statistics and (when available) the company's track record on previous projects.

**Step C11**
Journey concludes. The presenter can return to earlier points on the map for follow-up questions, or end the presentation.

---

## Technical Notes for Claude Code

### Data
All statistics, projections, company info, and map coordinates should be placeholder/mock data. Generate realistic-looking fake numbers, charts, and graphs. This is a demo.

### Map
Use Mapbox GL JS for 3D terrain with pitch/bearing camera control. Add markers, polygons, and polylines dynamically based on current journey step. The Future/Present toggle swaps between two overlay states. Camera positions are defined in `CAMERA_STEPS` (16 named positions) in `map-controller.js`.

### Cinematic Entry
The app opens with a 3D fly-in from high altitude descending to Kumamoto. A "Skip Intro" button appears during this animation. The heartbeat system provides ambient bearing drift when the presenter is idle (5s threshold).

### Draggable Modals
All major panels (chatbox, right panel, AI chat, gallery) are draggable via their header/title areas. Position persists during the session; `resetDragPosition()` restores defaults.

### Chart.js Integration
Three chart types render financial data: scenario comparison bars (Bear/Average/Bull), historical trend lines (appreciation), and investment comparisons. Every chart has an accessible companion `<details>` table with colorblind-safe palettes.

### State Management
The app uses a state machine in `App.state` with the following properties:

| Property | Type | Values |
|----------|------|--------|
| `journey` | string | `null`, `'A'`, `'B'`, `'C'` |
| `step` | string | `'A0'`..`'A3'`, `'B1'`..`'B7'`, `'C1'`, `'complete'` |
| `a3Phase` | string | `'infrastructure'` or `'location'` (A3 sub-phases) |
| `resourcesExplored` | array | Tracks which resources (water/power) user viewed |
| `companiesExplored` | array | Tracks companies viewed |
| `evidenceGroupsViewed` | array | Tracks disclosure groups visited |
| `dashboardMode` | boolean | Alternative presentation mode |
| `dashboardPanelOpen` | boolean | Panel state in dashboard |

**UI State** (tracked in `UI` object):
- `panelHistory` / `chatboxHistory`: Navigation stacks with scroll position
- `lastChatType`: `'chatbox'` or `'aiChat'` (determines FAB behavior)
- `layersPanelOpen`: Data layers panel visibility
- `disclosureState`: Expanded/collapsed state per disclosure group

**MapController State:**
- `corridorMode`: 3D corridor view active (Journey C)
- `revealing`: Property drill-down in progress
- `selectedInfrastructureRoad`: Single-selection tracking
- `highlightedEvidenceMarker`: Bidirectional sync marker state

### Progressive Reveal
All UI components except the initial button start hidden. Reveal with fade/slide transitions as each step requires them. Transitions should feel smooth, not jarring.

### Gallery
Build a modal that can display images, render PDFs (using pdf.js or similar), and embed external sites via iframe.

### Evidence Groups (Multi-Item Evidence Display)
Evidence is organized into hierarchical groups containing multiple related items. This allows presenters to dive deep into supporting documentation for any topic.

**Structure:**
- Each group has an ID, title, icon, and array of items
- Items contain: title, description, type (pdf/website/report), source citation
- Items may have coordinates for map marker display

**Evidence Library Panel:**
- Displays all evidence groups with disclosure triangles
- Groups expand/collapse to show contained items
- Clicking an item opens its detail view with full description and "View Source" action

**Bidirectional Map Sync:**
- Evidence items with coordinates show markers on the map
- Clicking a list item: highlights corresponding map marker and pans to it
- Clicking a map marker: opens the item's detail view in the panel
- "Back to List" button returns to the evidence library while clearing marker highlights

**Current Evidence Groups:**
| Group ID | Title | Use Case |
|----------|-------|----------|
| `energy-infrastructure` | Energy Infrastructure | Journey A power resources |
| `government-zones` | Government Development Zones | Journey B future planning |
| `transportation-network` | Transportation Network | Journey B infrastructure |
| `education-pipeline` | Education & Talent Pipeline | Journey B workforce |

### Haramizu Station Hub
A 70-hectare mixed-use development area near Haramizu Station. Contains 3 zones (Vibrancy, Knowledge Cluster, Live-Work) developed by Mitsui + JR Kyushu with Phase 1 targeted for 2028. Displayed during Journey B infrastructure steps with its own panel view (`showHaramizuPanel()`).

### Government Tiers
Two parallel data structures represent government commitment:
- `governmentChain`: Linear chain of commitments (Central to Local)
- `governmentTiers`: 3-tier hierarchy (Central, Prefectural, Local) with color-coded tiers and nested sub-items for local government zones

### Airline Routes
Origin: Aso Kumamoto Airport (KMJ). Destinations include Seoul, Busan, Shanghai, Taipei, Kaohsiung, Taichung, and Hong Kong. Each destination includes `semiconductorLink` (connecting to a corporate partner), flight time, airlines, frequency, and active/suspended status.

### Property Truth Engine
Each property in data.js includes a `truthEngine` array of value drivers (e.g., "Kikuyo Station Expansion: +15% projected value", "JASM Phase 2: +25% rental demand"). Displayed when the presenter clicks the Truth Engine button in Journey C.

### Area Market Statistics
`areaStats` in data.js tracks: average appreciation (+8.5%), average rental yield (+5.8%), occupancy rate (97.2%), and a historical track record array of yearly appreciation figures.

### Transitions Between Journeys
These should feel conversational, not mechanical. A brief text prompt in the chatbox or a subtle UI cue works better than a "Journey Complete! Start Journey B?" dialog. The `TIMING.breath` (600ms) and `TIMING.breathShort` (300ms) constants provide narrative pauses between beats.

---

## Summary: Step Reference

| Journey | Step | Action |
|---------|------|--------|
| A | A1 | Chatbox shows "Why Kumamoto?" prompt |
| A | A2 | Chatbox shows Water/Power options |
| A | A3 | Map pans to selected resource location |
| A | A4 | Right panel shows resource info |
| A | A5 | "View Evidence" link available |
| A | A6 | Gallery opens with source material |
| A | A7 | Return to map, repeat for other option |
| A | A8 | Evidence Library link for energy infrastructure |
| B | B1 | Infrastructure layer activates |
| B | B2 | Science Park radius circle appears, clickable |
| B | B3 | Right panel shows master plan |
| B | B4 | Corporate markers appear (JASM, Sony, etc.) |
| B | B5 | Click company → see investment details |
| B | B6 | Future/Present toggle with development zones |
| B | B7 | Infrastructure roads appear, click to see commute impact |
| C | C1 | Investment property markers appear |
| C | C2 | Click property → route to JASM draws |
| C | C3 | Right panel shows basic property info |
| C | C4 | Truth Engine button appears |
| C | C5 | Truth Engine shows growth drivers |
| C | C6 | Performance Calculator button appears |
| C | C7 | Financial modeling view |
| C | C8 | Bear/Average/Bull scenario toggle |
| C | C9 | Rental report link |
| C | C10 | Area growth stats and track record |
| C | C11 | Journey concludes |