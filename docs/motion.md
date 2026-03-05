# Motion & Animation

Core motion principles and timing tokens. Follows macOS HIG: purposeful, responsive, natural, respectful of reduced motion.

---

## Timing Tokens

```css
:root {
  --duration-instant: 0ms;       /* Immediate state changes */
  --duration-fast: 150ms;        /* Micro-interactions */
  --duration-normal: 250ms;      /* Default transitions */
  --duration-slow: 350ms;        /* Complex animations */
  --duration-slower: 500ms;      /* Page transitions */
  --duration-scene: 1500ms;      /* Cinematic journey transitions */

  --easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);     /* General use */
  --easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);   /* Entrances */
  --easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1);     /* Exits */
  --easing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);  /* Playful bounce */
}
```

## Animation Use Cases

| Interaction | Duration | Easing | Example |
|-------------|----------|--------|---------|
| Button hover | `--duration-fast` | `--easing-standard` | Background color shift |
| Panel slide | `--duration-normal` | `--easing-decelerate` | Right panel entrance |
| Fade in | `--duration-normal` | `--easing-standard` | Chatbox appearance |
| Map zoom | `--duration-slow` | `--easing-decelerate` | Journey location change |
| Modal open | `--duration-normal` | `--easing-decelerate` | Gallery overlay |
| Modal close | `--duration-fast` | `--easing-accelerate` | Gallery dismiss |
| Tooltip | `--duration-fast` | `--easing-standard` | Hover reveal |

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto !important; }
}
```

---

## Map Marker Animations

Three entrance types differentiate marker categories:

```css
/* Heavy anchor drop - Science park, government markers */
@keyframes anchorDrop {
  from { transform: scale(0.3) translateY(-16px); opacity: 0; }
  65%  { transform: scale(1.06) translateY(0); opacity: 1; }
  to   { transform: scale(1) translateY(0); opacity: 1; }
}

/* Lighter ripple - Company markers (cascading entrance) */
@keyframes rippleIn {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* Gentle rise - Property markers */
@keyframes markerEmerge {
  from { transform: translateY(8px) scale(0.9); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

/* Exit animation - All markers */
@keyframes markerFadeOut {
  to { opacity: 0; transform: scale(0.85) translateY(4px); }
}

/* Selected marker pulse */
@keyframes markerPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}
```

### Route Drawing

```css
.route-line-animated {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawRoute var(--duration-slower) var(--easing-decelerate) forwards;
}
@keyframes drawRoute { to { stroke-dashoffset: 0; } }
```

### Infrastructure Road Fade-in

```css
@keyframes roadFadeIn {
  from { opacity: 0; stroke-opacity: 0; }
  to   { opacity: 0.7; stroke-opacity: 0.7; }
}
```

---

## Heartbeat / Ambient Motion

Continuous background animation when presenter pauses.

```javascript
MapController._heartbeat = {
    active: false,
    driftInterval: null,
    bearingPerTick: 0.05,   // ~0.5 degrees per 10 seconds
    tickMs: 1000,
    idleTimeout: null,
    idleThreshold: 5000,    // Activates after 5s of no interaction
    pulsingMarkers: []
};
```

- **Drift:** Slow bearing rotation
- **Idle detection:** Activates after 5s, pauses on any interaction
- **Reduced motion:** Entirely disabled when `prefers-reduced-motion` is active

---

## Camera Choreography

16 named camera positions for the 3D journey.

```javascript
const CAMERA_STEPS = {
    A0:             { center: [130.78, 32.82], zoom: 11.5, pitch: 45, bearing: 10 },
    A1:             { center: [130.78, 32.83], zoom: 11.5, pitch: 45, bearing: -5 },
    A2_overview:    { center: [130.75, 32.80], zoom: 8.5,  pitch: 35, bearing: 0 },
    A2_water:       { center: [130.90, 32.88], zoom: 13,   pitch: 50, bearing: 25 },
    A2_power:       { center: [130.65, 32.75], zoom: 12,   pitch: 45, bearing: -15 },
    A3_ecosystem:   { center: [130.78, 32.84], zoom: 11.5, pitch: 50, bearing: 20 },
    A3_location:    { center: [129.5,  31.5],  zoom: 5,    pitch: 20, bearing: 0 },
    A_to_B:         { center: [130.75, 32.84], zoom: 11,   pitch: 48, bearing: -10 },
    B1:             { center: [130.78, 32.84], zoom: 11.5, pitch: 48, bearing: -10 },
    B1_sciencePark: { center: [130.78, 32.87], zoom: 11,   pitch: 45, bearing: 5 },
    B4:             { center: [130.80, 32.86], zoom: 12,   pitch: 52, bearing: 30 },
    B6:             { center: [130.83, 32.87], zoom: 11.5, pitch: 50, bearing: -20 },
    B7:             { center: [130.80, 32.86], zoom: 12,   pitch: 55, bearing: 15 },
    B_to_C:         { center: [130.82, 32.82], zoom: 12.5, pitch: 50, bearing: -15 },
    corridor:       { center: [130.82, 32.82], zoom: 12.5, pitch: 50, bearing: -15 },
    complete:       { center: [130.78, 32.84], zoom: 11,   pitch: 40, bearing: 0 }
};
```

---

## Narrative Timing Constants

```javascript
const TIMING = {
    scene: 1500,         // Journey transition hold
    fast: 150,
    normal: 250,
    slow: 350,
    flyDuration: 2000,   // Mapbox flyTo
    revealDelay: 1200,   // Science park reveal after gov chain
    buttonDelay: 2500,   // Continue button after markers land
    infraStagger: 100,   // Infrastructure road stagger
    restartDelay: 500,

    // Narrative breathing room
    breath: 600,         // Full pause
    breathMedium: 400,   // Marker cluster to next content
    breathShort: 300,    // Quick pause
};
```

---

## Line reveal animation (map lines)

Technique for animating map lines that "grow" along their path from start to end. Used for rail commute and infrastructure plan data layers.

**How it works:** Instead of relying on paint properties like `line-trim-offset` (unreliable across Mapbox versions), the animation incrementally extends the GeoJSON source coordinates each frame using `source.setData()`. A `_subPath()` helper interpolates between vertices based on a 0-1 progress value, producing smooth sub-pixel growth along the full path.

**Key implementation details:**
- Source starts with a zero-length line: `coordinates: [startCoord, startCoord]`
- `requestAnimationFrame` loop computes progress with ease-out cubic: `1 - Math.pow(1 - t, 3)`
- `_subPath(fullCoords, t)` computes cumulative segment lengths, finds the target distance, and interpolates between the two bounding vertices
- All layers sharing the same source grow together automatically
- For parallel lines (e.g. subway-map style rail routes), use `line-offset` paint property to space them laterally

**Reference methods in `map-controller.js`:**
- `_startLineGrow(sourceId, fullCoords, duration, delay)` - starts the animation
- `_stopLineGrow(sourceId)` - cancels it
- `_subPath(fullCoords, t)` - returns partial coordinate array for fraction t
- `_lerpCoord(a, b, t)` - linear interpolation between two coordinates
