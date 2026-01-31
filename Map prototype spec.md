# MAP-PROTOTYPE: App Specification

## Overview

A desktop-only interactive presentation app built around a Google Map of Kumamoto, Japan's emerging semiconductor corridor. Designed as a sales tool for investment advisors to walk clients through real estate opportunities. The app presents as a "choose your own adventure" experience but is actually a carefully sequenced narrative that builds context before presenting financial projections.

---

## Core Concept: Guided Discovery

The three journeys are sequential (A → B → C), but the UI should never feel like a linear slideshow. Instead, it should feel like the presenter and client are exploring a map together and uncovering information organically. The sequencing exists because each journey builds credibility for the next:

- **"Why Kumamoto?"** establishes location value
- **"Infrastructure Plan"** proves institutional commitment
- **"Investment Projections"** delivers the payoff

The illusion of choice comes from how the presenter interacts with the map. They click markers, toggle layers, and reveal panels as if discovering things in real-time, even though the sequence is predetermined. The client should feel like they're on a guided tour with a knowledgeable local, not sitting through a pitch deck.

---

## Initial State

The app launches to a blank white screen with a single centered button.

| Property | Value |
|----------|-------|
| Button fill color | `#fbb931` (yellow) |
| Button text color | black |
| Button text | "Start the Journey" |

Nothing else is visible. No map, no UI chrome, no branding. Just the button.

---

## After "Start the Journey"

1. The button fades out
2. The map fades in, centered on Kumamoto Prefecture
3. Journey A ("Why Kumamoto?") begins automatically

There is no journey selection screen. The experience flows from A → B → C with natural transition points that feel like the presenter is choosing to go deeper rather than being forced to the next slide.

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

### The Control Bar
Contains layer toggles and the future/present switch. These controls appear only when relevant to the current journey step.

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
A "Future / Present" toggle appears in the control bar.

**Step B7**
The presenter clicks the Future toggle. The map transitions to show the projected future state of the Science Park cluster with additional planned developments.

**Step B8**
Smaller circle markers appear representing future development zones (Kikuyo, Ozu areas).

**Step B9**
Clicking any small circle shows the relevant local government's long-term plan in the right panel. Link to official documentation opens in gallery.

**Step B10**
The presenter can toggle back to Present view to compare.

### Transition Out
After exploring the infrastructure layer, a prompt suggests "Let's look at a specific investment opportunity..." This leads into Journey C.

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
Use Leaflet with OpenStreetMap (free, no API key required). Add markers, polygons, and polylines dynamically based on current journey step. The Future/Present toggle swaps between two overlay states.

### State Management
Implement a simple state machine or step counter. The app should always know which journey and step it's on. Steps proceed forward only within a journey, but the presenter can revisit map elements after completing a section.

### Progressive Reveal
All UI components except the initial button start hidden. Reveal with fade/slide transitions as each step requires them. Transitions should feel smooth, not jarring.

### Gallery
Build a modal that can display images, render PDFs (using pdf.js or similar), and embed external sites via iframe.

### Transitions Between Journeys
These should feel conversational, not mechanical. A brief text prompt in the chatbox or a subtle UI cue works better than a "Journey Complete! Start Journey B?" dialog.

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
| B | B1 | Infrastructure layer activates |
| B | B2 | Science Park radius circle appears, clickable |
| B | B3 | Right panel shows master plan |
| B | B4 | Corporate markers appear (JASM, Sony, etc.) |
| B | B5 | Click company → see investment details |
| B | B6 | Future/Present toggle appears |
| B | B7 | Toggle to Future view |
| B | B8 | Future development zone markers appear |
| B | B9 | Click zone → see government plans |
| B | B10 | Toggle back to Present |
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