# Map Prototype Design

## Overview

Interactive presentation app for real estate sales in Kumamoto, Japan. Desktop-only web app that guides presenters through three sequential "journeys" building investment credibility.

## Technology

- **HTML/CSS/JavaScript** - No frameworks, portable and simple
- **Leaflet + OpenStreetMap** - Free map library, no API key required
- **Vanilla JS state machine** - Tracks journey progress

## File Structure

```
map-prototype/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main app logic & state machine
│   ├── map.js          # Map setup, markers, layers
│   ├── data.js         # All mock data
│   └── ui.js           # Panel, chatbox, gallery, controls
└── assets/
    └── placeholders/   # Placeholder images for gallery
```

## Visual Design

### Starting Screen
- Pure white background
- Single yellow button (#fbb931) centered: "Start the Journey"
- No other elements visible

### Active Layout
- Map: ~70% of screen (left)
- Right panel: ~30% width (slides in when needed)
- Chatbox: floats bottom-left of map
- Control bar: appears at top when needed
- Gallery: dark overlay for document viewing

### Colors
- Primary: #fbb931 (yellow)
- Text: dark on light backgrounds
- Map: standard OpenStreetMap styling

## Journey Flow

### Journey A: "Why Kumamoto?"
1. Chatbox shows "Why Kumamoto?" prompt
2. Options appear: "Water Resources" / "Power Infrastructure"
3. Selection zooms map, shows marker
4. Marker click opens right panel with info
5. "View Evidence" opens gallery with placeholder
6. After both explored, transition prompt to Journey B

### Journey B: "Infrastructure Plan"
1. Red circle overlay shows Science Park radius
2. Corporate markers appear (JASM, Sony, etc.)
3. Click marker for investment details
4. Future/Present toggle appears
5. Future view shows development zones
6. Transition prompt to Journey C

### Journey C: "Investment Projections"
1. Property markers appear
2. Click property draws route to JASM
3. Right panel shows property details
4. Truth Engine button reveals growth factors
5. Performance Calculator shows financials
6. Bear/Average/Bull scenario toggle

## Mock Data

All data is placeholder for demo purposes:
- Approximate real locations in Kumamoto
- Fictional but realistic company investment figures
- Sample property financials with projections

## Deployment

Works both:
- Locally: Open index.html in browser
- Online: Upload to any web hosting service
