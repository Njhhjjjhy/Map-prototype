# CLAUDE.md — Map Prototype Design System

## Project Overview

Interactive presentation app for real estate sales in Kumamoto, Japan. Desktop-only web app that guides presenters through three sequential "journeys" building investment credibility.

**Technology Stack:** HTML/CSS/JavaScript (no frameworks), Leaflet + OpenStreetMap, Vanilla JS state machine

---

## Design Philosophy

This design system follows **macOS Human Interface Guidelines (HIG)** principles adapted for web, emphasizing:

- **Clarity:** Every element must be immediately understandable with legible text, precise iconography, and strong visual hierarchy
- **Deference:** The interface supports the map content without competing for attention; controls exist to serve the user's task
- **Depth:** Visual layering, smooth transitions, and logical hierarchy create spatial relationships that guide users naturally
- **Consistency:** Uniform patterns across all journeys reduce cognitive load and build trust

---

## Typography

### Font Families

| Usage | Font Family | Fallback Stack |
|-------|-------------|----------------|
| Headings, Labels, Menu Items, CTAs | `"Rem", sans-serif` | Google Fonts |
| Body Copy | `"Noto Sans JP", sans-serif` | Google Fonts |

**Font Import (add to HTML head):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Rem:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Rem:wght@400;500;600;700&display=swap');
```

### Type Scale (macOS HIG)

All font sizes use `rem` units with `1rem = 16px` base. Scale follows macOS typography conventions.

```css
:root {
  /* macOS Type Scale */
  --text-xs: 0.6875rem;    /* 11px — Caption 2 */
  --text-sm: 0.8125rem;    /* 13px — Footnote */
  --text-base: 0.9375rem;  /* 15px — Subheadline */
  --text-lg: 1.0625rem;    /* 17px — Body/Headline */
  --text-xl: 1.25rem;      /* 20px — Title 3 */
  --text-2xl: 1.375rem;    /* 22px — Title 2 */
  --text-3xl: 1.75rem;     /* 28px — Title 1 */
  --text-4xl: 2.125rem;    /* 34px — Large Title */
  --text-5xl: 2.5rem;      /* 40px — Hero */

  /* Line Heights */
  --line-height-tight: 1.25;       /* Headings, labels */
  --line-height-normal: 1.5;       /* Body copy */
  --line-height-relaxed: 1.75;     /* Long-form reading */
}
```

### Typography Rules

#### Case Rules

| Element Type | Case | Example |
|--------------|------|---------|
| Headings | Title Case | "Investment Projections" |
| Labels | Title Case | "View Evidence" |
| Menu Items | Title Case | "Water Resources" |
| CTAs/Buttons | Title Case | "Start the Journey" |
| Body Copy | Sentence case | "Click the marker to view property details." |
| Placeholder Text | Sentence case | "Enter your search query..." |

#### Absolute Prohibitions

```
❌ NEVER USE ALL CAPS — Not for headings, buttons, labels, or emphasis
❌ NEVER USE UPPERCASE — Use bold weight or color for emphasis instead
❌ Never center-align body text — Always left-align (align-start)
❌ Never justify text — Creates uneven spacing
```

### Font Weights

```css
:root {
  --font-weight-regular: 400;    /* Body copy, secondary text */
  --font-weight-medium: 500;     /* Labels, interactive elements */
  --font-weight-semibold: 600;   /* Headings, emphasis */
  --font-weight-bold: 700;       /* Primary CTAs, critical info */
}
```

### Letter Spacing (Tracking)

Per HIG, adjust tracking based on font size for optimal legibility:

```css
:root {
  /* Display sizes (20pt+) need tighter tracking */
  --tracking-display: -0.02em;   /* -0.32px at 16px base */
  
  /* Text sizes (≤19pt) need looser tracking */
  --tracking-body: 0;            /* Default */
  --tracking-small: 0.01em;      /* Small text needs more air */
}
```

---

## Color System

### Brand Colors

```css
:root {
  /* Primary Brand */
  --color-primary: #fbb931;           /* Brand yellow */
  --color-primary-hover: #e5a82c;     /* 10% darker */
  --color-primary-pressed: #cc9526;   /* 20% darker */
  --color-primary-disabled: #fdd97a;  /* 50% lighter */
  
  /* Text Colors */
  --color-text-primary: #1e1f20;      /* Primary text on light */
  --color-text-secondary: #4a4b4d;    /* Secondary text */
  --color-text-tertiary: #6e7073;     /* Muted text */
  --color-text-disabled: #a3a5a8;     /* Disabled states */
  --color-text-on-primary: #1e1f20;   /* Text on yellow buttons */
  
  /* Backgrounds */
  --color-bg-primary: #ffffff;        /* Main background */
  --color-bg-secondary: #f5f5f7;      /* Subtle differentiation */
  --color-bg-tertiary: #e8e8ed;       /* Cards, panels */
  --color-bg-overlay: rgba(0, 0, 0, 0.5);  /* Modal overlays */
  
  /* Semantic Colors */
  --color-success: #34c759;           /* Positive states */
  --color-warning: #ff9500;           /* Caution states */
  --color-error: #ff3b30;             /* Error states */
  --color-info: #007aff;              /* Informational */
  
  /* Map-Specific */
  --color-map-route: #007aff;         /* Route lines */
  --color-map-zone-future: rgba(251, 185, 49, 0.2);  /* Development zones */
  --color-map-radius: rgba(255, 59, 48, 0.15);       /* Science park radius */
}
```

### Dark Mode

```
⛔ DARK MODE IS NOT SUPPORTED
This application uses light mode exclusively.
Do not implement dark mode variants or prefers-color-scheme queries.
```

### Contrast Requirements (WCAG AA)

Per HIG accessibility guidelines:

| Text Size | Minimum Contrast Ratio |
|-----------|----------------------|
| Normal text (< 18pt) | 4.5:1 |
| Large text (≥ 18pt or 14pt bold) | 3:1 |
| UI components, icons | 3:1 |

**Verified Combinations:**

- `#1e1f20` on `#ffffff` — 16.5:1 ✓
- `#1e1f20` on `#fbb931` — 8.2:1 ✓
- `#4a4b4d` on `#ffffff` — 8.6:1 ✓

---

## Spacing System (8pt Grid)

All spacing values derive from an 8-point base unit. Use 4pt for fine-tuning icons and small text.

```css
:root {
  /* Base Unit */
  --space-unit: 8px;
  
  /* Spacing Scale */
  --space-0: 0;
  --space-1: 4px;    /* 0.5 unit — Icon gaps, fine adjustments */
  --space-2: 8px;    /* 1 unit — Tight spacing */
  --space-3: 12px;   /* 1.5 units — Compact elements */
  --space-4: 16px;   /* 2 units — Default padding */
  --space-5: 20px;   /* 2.5 units — Comfortable spacing */
  --space-6: 24px;   /* 3 units — Section gaps */
  --space-8: 32px;   /* 4 units — Large gaps */
  --space-10: 40px;  /* 5 units — Panel padding */
  --space-12: 48px;  /* 6 units — Section breaks */
  --space-16: 64px;  /* 8 units — Major sections */
  --space-20: 80px;  /* 10 units — Hero spacing */
  --space-24: 96px;  /* 12 units — Page margins */
}
```

### Spacing Application

| Context | Recommended Spacing |
|---------|-------------------|
| Icon to text | `--space-2` (8px) |
| Button internal padding | `--space-3` horizontal, `--space-2` vertical |
| Form field internal padding | `--space-4` (16px) |
| Between form fields | `--space-4` (16px) |
| Card internal padding | `--space-6` (24px) |
| Between cards | `--space-4` (16px) |
| Section padding | `--space-8` to `--space-12` |
| Panel edge padding | `--space-6` (24px) |

### Internal ≤ External Rule

Per Gestalt proximity principles: internal spacing (padding) should be less than or equal to external spacing (margin) to create clear visual groupings.

```
┌──────────────────────────┐
│  ← --space-6 padding →   │  ← --space-8 margin between cards
│  ┌────────────────────┐  │
│  │  Content           │  │
│  │  --space-4 gap     │  │
│  │  More content      │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

---

## Buttons

### Button Hierarchy

1. **Primary** — Main action, highest visual prominence (brand yellow)
2. **Secondary** — Alternative actions (outlined or subtle fill)
3. **Tertiary** — Lowest prominence (text-only, icon-only)
4. **Destructive** — Irreversible actions (error red)

### Primary Button Specification

```css
.button-primary {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);  /* 12px 24px */
  min-height: 40px;  /* Touch target minimum */
  min-width: 80px;
  
  /* Typography */
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  text-transform: none;  /* Title Case, NOT uppercase */
  letter-spacing: var(--tracking-body);
  text-align: center;
  
  /* Visual */
  background-color: var(--color-primary);  /* #fbb931 */
  color: var(--color-text-on-primary);     /* #1e1f20 */
  border: none;
  border-radius: var(--radius-medium);     /* 8px */
  box-shadow: var(--shadow-subtle);
  
  /* Interaction */
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-standard);
}
```

### Button States (Required for ALL Buttons)

```css
/* Default */
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-subtle);
}

/* Hover — Cursor enters button area */
.button-primary:hover {
  background-color: var(--color-primary-hover);  /* #e5a82c */
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
}

/* Focused — Keyboard navigation (Tab) */
.button-primary:focus-visible {
  background-color: var(--color-primary);
  outline: 3px solid var(--color-info);  /* #007aff */
  outline-offset: 2px;
  box-shadow: var(--shadow-medium);
}

/* Pressed/Active — Mouse down or Enter key */
.button-primary:active {
  background-color: var(--color-primary-pressed);  /* #cc9526 */
  box-shadow: var(--shadow-subtle);
  transform: translateY(0);
}

/* Disabled — Cannot interact */
.button-primary:disabled,
.button-primary[aria-disabled="true"] {
  background-color: var(--color-primary-disabled);  /* #fdd97a */
  color: var(--color-text-disabled);
  box-shadow: none;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Secondary Button

```css
.button-secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1.5px solid var(--color-text-tertiary);
  
  /* States */
  &:hover {
    background-color: var(--color-bg-secondary);
    border-color: var(--color-text-secondary);
  }
  
  &:active {
    background-color: var(--color-bg-tertiary);
  }
  
  &:disabled {
    border-color: var(--color-text-disabled);
    color: var(--color-text-disabled);
  }
}
```

### Button with Icon

Icons within buttons follow these rules:

```css
.button-icon {
  /* Icon sizing */
  --icon-size: 20px;  /* For 16px label text */
  
  /* Icon positioning */
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);  /* 8px between icon and text */
}

.button-icon svg,
.button-icon img {
  width: var(--icon-size);
  height: var(--icon-size);
  flex-shrink: 0;
}

/* Icon-only button (square) */
.button-icon-only {
  padding: var(--space-3);  /* 12px all sides */
  aspect-ratio: 1;
  min-width: 40px;
  min-height: 40px;
}
```

### Button Size Variants

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| Small | 32px | 8px 16px | 14px | 16px |
| Medium (default) | 40px | 12px 24px | 16px | 20px |
| Large | 48px | 16px 32px | 18px | 24px |

---

## Iconography

### Icon System

Use **SF Symbols** design principles: optically balanced, consistent stroke weights, semantic clarity.

```css
:root {
  /* Icon Sizes (8pt grid) */
  --icon-xs: 12px;    /* Inline indicators */
  --icon-sm: 16px;    /* Small buttons, lists */
  --icon-md: 20px;    /* Default UI icons */
  --icon-lg: 24px;    /* Prominent actions */
  --icon-xl: 32px;    /* Feature icons */
  --icon-2xl: 48px;   /* Decorative/hero */
  
  /* Icon Stroke */
  --icon-stroke-weight: 1.5px;  /* Consistent across sizes */
}
```

### Icon Guidelines

1. **Optical Size Alignment** — Icons at different sizes should feel balanced, not mathematically identical
2. **Consistent Weight** — Maintain uniform stroke weight (1.5px recommended)
3. **Clear Silhouette** — Icons must be recognizable at smallest intended size
4. **Filled vs Outlined** — Use filled for selected/active states; outlined for inactive
5. **Touch Targets** — Icons clickable area must be at least 44×44px regardless of visual size

### Icon + Text Pairing

```css
/* Icon leading (left of text, LTR) */
.icon-text-pair {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);  /* 8px */
}

/* Ensure vertical optical alignment */
.icon-text-pair svg {
  position: relative;
  top: -1px;  /* Optical adjustment for many icon sets */
}
```

### Map Marker Icons

| Marker Type | Size | Color |
|-------------|------|-------|
| Point of Interest | 32×40px | `--color-primary` |
| Corporate HQ | 40×48px | `--color-info` |
| Property | 36×44px | `--color-success` |
| Selected State | +20% scale | Add shadow ring |

---

## Corner Radius

### Radius Scale

Per HIG, corner radius should relate to element size — larger elements can have larger radii.

```css
:root {
  --radius-none: 0;
  --radius-small: 4px;     /* Small buttons, tags, badges */
  --radius-medium: 8px;    /* Default buttons, cards, inputs */
  --radius-large: 12px;    /* Panels, modals, large cards */
  --radius-xlarge: 16px;   /* Hero containers, overlays */
  --radius-full: 9999px;   /* Pills, circular elements */
}
```

### Application Rules

| Element | Radius |
|---------|--------|
| Buttons (all sizes) | `--radius-medium` (8px) |
| Input fields | `--radius-medium` (8px) |
| Cards | `--radius-large` (12px) |
| Panels | `--radius-large` (12px) |
| Modals/Dialogs | `--radius-xlarge` (16px) |
| Tooltips | `--radius-small` (4px) |
| Tags/Badges | `--radius-small` (4px) |
| Avatars | `--radius-full` (circular) |
| Map controls | `--radius-medium` (8px) |

### Nested Radius Rule

When nesting rounded containers, inner radius = outer radius − padding:

```css
.card {
  border-radius: var(--radius-large);  /* 12px */
  padding: var(--space-4);             /* 16px */
}

.card-inner {
  /* 12px - 16px would be negative, so use minimum */
  border-radius: var(--radius-small);  /* 4px */
}
```

---

## Shadows & Elevation

### Shadow Scale

Per HIG, shadows convey elevation and hierarchy. Use sparingly to maintain clarity.

```css
:root {
  /* Subtle — Default resting state */
  --shadow-subtle: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.08);
  
  /* Medium — Hover states, slight elevation */
  --shadow-medium: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.08);
  
  /* Large — Modals, dropdowns, popovers */
  --shadow-large: 
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.12);
  
  /* XLarge — Critical modals, overlays */
  --shadow-xlarge: 
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.16);
  
  /* Inset — Pressed states, wells */
  --shadow-inset: 
    inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
```

### Elevation Hierarchy

| Level | Usage | Shadow | Z-Index |
|-------|-------|--------|---------|
| 0 | Base content | none | 0 |
| 1 | Cards, panels | `--shadow-subtle` | 10 |
| 2 | Hover states | `--shadow-medium` | 20 |
| 3 | Dropdowns, popovers | `--shadow-large` | 100 |
| 4 | Modals, dialogs | `--shadow-xlarge` | 1000 |
| 5 | Tooltips | `--shadow-medium` | 1100 |
| 6 | Global overlays | `--shadow-xlarge` | 9999 |

---

## Motion & Animation

### Core Principles (Per HIG)

1. **Purposeful** — Animation should convey meaning, not decorate
2. **Responsive** — Immediate feedback for user actions
3. **Natural** — Follow real-world physics (ease-out for entrances, ease-in for exits)
4. **Respectful** — Honor `prefers-reduced-motion` preferences

### Timing Tokens

```css
:root {
  /* Durations */
  --duration-instant: 0ms;       /* Immediate state changes */
  --duration-fast: 150ms;        /* Micro-interactions */
  --duration-normal: 250ms;      /* Default transitions */
  --duration-slow: 350ms;        /* Complex animations */
  --duration-slower: 500ms;      /* Page transitions */
  
  /* Easing Functions */
  --easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);     /* General use */
  --easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);   /* Entrances */
  --easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1);     /* Exits */
  --easing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);  /* Playful bounce */
}
```

### Animation Use Cases

| Interaction | Duration | Easing | Example |
|-------------|----------|--------|---------|
| Button hover | `--duration-fast` | `--easing-standard` | Background color shift |
| Panel slide | `--duration-normal` | `--easing-decelerate` | Right panel entrance |
| Fade in | `--duration-normal` | `--easing-standard` | Chatbox appearance |
| Map zoom | `--duration-slow` | `--easing-decelerate` | Journey location change |
| Modal open | `--duration-normal` | `--easing-decelerate` | Gallery overlay |
| Modal close | `--duration-fast` | `--easing-accelerate` | Gallery dismiss |
| Tooltip | `--duration-fast` | `--easing-standard` | Hover reveal |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Preserve functional scrolling */
  html {
    scroll-behavior: auto !important;
  }
}
```

### Map Animations

```css
/* Map zoom transitions */
.leaflet-container {
  transition: none;  /* Let Leaflet handle internal animations */
}

/* Marker appearance */
.map-marker {
  animation: markerDrop var(--duration-normal) var(--easing-decelerate) forwards;
}

@keyframes markerDrop {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Route drawing */
.map-route {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawRoute var(--duration-slower) var(--easing-decelerate) forwards;
}

@keyframes drawRoute {
  to {
    stroke-dashoffset: 0;
  }
}
```

---

## Interaction Patterns

### Touch & Click Targets

Per HIG accessibility guidelines, all interactive elements must meet minimum target sizes:

```css
:root {
  --touch-target-min: 44px;  /* Minimum interactive area */
  --touch-target-comfortable: 48px;  /* Recommended */
}

/* Ensure clickable area even for small visual elements */
.interactive-element {
  position: relative;
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
}

/* Expand small icons to meet target size */
.icon-button::before {
  content: '';
  position: absolute;
  inset: -8px;  /* Expand touch area */
}
```

### Focus Management

```css
/* Remove default outline, replace with custom */
:focus {
  outline: none;
}

/* Visible focus for keyboard navigation only */
:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Focus within container */
.card:focus-within {
  box-shadow: 0 0 0 3px var(--color-info);
}
```

### Hover States

All interactive elements must provide visual hover feedback:

```css
.interactive {
  transition: 
    background-color var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard),
    transform var(--duration-fast) var(--easing-standard);
}

.interactive:hover {
  /* Choose appropriate feedback for element type */
}
```

### Cursor States

```css
/* Pointer cursor for clickable elements */
button, 
a, 
[role="button"],
.clickable {
  cursor: pointer;
}

/* Disabled cursor */
:disabled,
[aria-disabled="true"] {
  cursor: not-allowed;
}

/* Grab cursor for draggable */
.draggable {
  cursor: grab;
}

.draggable:active {
  cursor: grabbing;
}

/* Map-specific cursors */
.map-pan {
  cursor: move;
}
```

---

## Accessibility

### Minimum Requirements

Per HIG and WCAG 2.1 AA:

1. **Color Contrast** — 4.5:1 for text, 3:1 for UI components
2. **Touch Targets** — Minimum 44×44px
3. **Focus Indicators** — Visible focus rings for keyboard navigation
4. **Motion** — Respect `prefers-reduced-motion`
5. **Text Scaling** — Support up to 200% zoom without loss of functionality
6. **Semantic HTML** — Proper heading hierarchy, landmarks, ARIA where needed

### ARIA Patterns

```html
<!-- Button -->
<button type="button" aria-label="Start the journey">
  Start the Journey
</button>

<!-- Icon-only button -->
<button type="button" aria-label="Close panel">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Toggle button -->
<button 
  type="button" 
  aria-pressed="false"
  aria-label="Toggle future view">
  Future
</button>

<!-- Panel -->
<aside 
  role="complementary" 
  aria-label="Property details"
  aria-hidden="false">
  ...
</aside>

<!-- Map region -->
<div 
  role="application" 
  aria-label="Interactive map of Kumamoto investment areas"
  tabindex="0">
  ...
</div>
```

### Screen Reader Considerations

```css
/* Visually hidden but screen reader accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  z-index: 9999;
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border-radius: var(--radius-medium);
}

.skip-link:focus {
  top: var(--space-4);
}
```

---

## Component Specifications

### Right Panel

```css
.panel-right {
  /* Layout */
  position: fixed;
  top: 0;
  right: 0;
  width: min(400px, 30vw);
  height: 100vh;
  
  /* Visual */
  background: var(--color-bg-primary);
  border-left: 1px solid var(--color-bg-tertiary);
  box-shadow: var(--shadow-large);
  
  /* Spacing */
  padding: var(--space-6);
  
  /* Animation */
  transform: translateX(100%);
  transition: transform var(--duration-normal) var(--easing-decelerate);
}

.panel-right[data-visible="true"] {
  transform: translateX(0);
}
```

### Chatbox

```css
.chatbox {
  /* Layout */
  position: fixed;
  bottom: var(--space-6);
  left: var(--space-6);
  width: min(360px, calc(100vw - var(--space-12)));
  
  /* Visual */
  background: var(--color-bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-large);
  
  /* Spacing */
  padding: var(--space-6);
}
```

### Gallery Overlay

```css
.gallery-overlay {
  /* Layout */
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Visual */
  background: var(--color-bg-overlay);
  backdrop-filter: blur(4px);
  
  /* Animation */
  opacity: 0;
  transition: opacity var(--duration-normal) var(--easing-standard);
}

.gallery-overlay[data-visible="true"] {
  opacity: 1;
}

.gallery-content {
  /* Layout */
  width: min(900px, 90vw);
  max-height: 90vh;
  
  /* Visual */
  background: var(--color-bg-primary);
  border-radius: var(--radius-xlarge);
  box-shadow: var(--shadow-xlarge);
  
  /* Spacing */
  padding: var(--space-8);
}
```

### Control Bar

```css
.control-bar {
  /* Layout */
  position: fixed;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-2);
  
  /* Visual */
  background: var(--color-bg-primary);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
  
  /* Spacing */
  padding: var(--space-2);
}
```

### Toggle Control (Future/Present)

```css
.toggle-group {
  display: inline-flex;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-medium);
  padding: var(--space-1);
}

.toggle-option {
  /* Layout */
  padding: var(--space-2) var(--space-4);
  
  /* Typography */
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  
  /* Visual */
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-medium) - var(--space-1));
  color: var(--color-text-secondary);
  
  /* Transition */
  transition: all var(--duration-fast) var(--easing-standard);
}

.toggle-option[aria-pressed="true"] {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-subtle);
}
```

### Map Legend

The legend displays marker types relevant to the current journey. It appears in the bottom-right corner and updates dynamically.

```css
#map-legend {
  /* Layout */
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 500;
  min-width: 140px;

  /* Visual */
  background: var(--color-bg-primary);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--color-border);

  /* Spacing */
  padding: var(--space-3) var(--space-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.legend-marker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### Legend Marker Types

All icons use **Lucide** icon library for consistency across Legend and Data Layers panel.

| Type | Color | Icon (Lucide) | Always Visible |
|------|-------|---------------|----------------|
| Base Map | `#6e7073` (gray) | `map-pin` | ✓ |
| Science Park | `#ff3b30` (red) | `flask-conical` | ✓ |
| Corporate Sites | `#007aff` (blue) | `building-2` | ✓ |
| Real Estate | `#ff9500` (orange) | `house` | ✓ |
| Resources | `#ff3b30` (red) | `droplet` | Journey A only |
| Development Zone | `#ff3b30` (red) | `target` | Journey B (Future view only) |
| Route to JASM | `#64748b` (gray) | `route` | Journey C only |

#### Legend Content Structure

**Core items (always visible in all journeys):**
- Base Map
- Science Park
- Corporate Sites
- Real Estate

**Journey-specific additions:**
- **Journey A**: + Resources
- **Journey B**: + Development Zone (visible only in Future view)
- **Journey C**: + Route to JASM

### Data Layers Panel

The Data Layers panel allows toggling visibility of map layers and data overlays.

#### Data Layers Toggle Button

```css
#layers-toggle {
  /* Always visible - never hidden */
  position: absolute;
  top: 80px;
  left: 12px;
  z-index: 500;
  width: 36px;
  height: 36px;

  /* Visual */
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);

  /* Icon */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

#layers-toggle.active {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}
```

#### Data Layers Button Behavior

- **Always visible**: The button is always shown on the map, regardless of journey state
- **Toggle action**: Clicking opens/closes the Data Layers panel
- **State persistence**: When journeys change, the button remains visible but the panel closes (unselected state)
- **Icon**: Stacked layers (Lucide `layers`)

#### Data Layer Items

All layer icons use **Lucide** icons for consistency with the Legend:

| Layer | Icon (Lucide) | Default State |
|-------|---------------|---------------|
| Science Park | `flask-conical` | Active (Journey B, C) |
| Corporate Sites | `building-2` | Active (Journey B, C) |
| Properties | `house` | Active (Journey C) |
| Base Map | `map-pin` | Inactive |
| Traffic Flow | `car` | Inactive |
| Rail Commute | `train-front` | Inactive |
| Electricity Usage | `zap` | Inactive |
| Employment | `briefcase` | Inactive |
| Infrastructure Plan | `landmark` | Inactive |
| Real Estate | `house` | Inactive |
| Risky Area | `droplet` | Inactive |

### Floating Action Button (Chat FAB)

A circular button that appears when the chatbox or AI chat is closed, allowing users to reopen them.

```css
#chat-fab {
  /* Layout */
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;

  /* Size */
  width: 56px;
  height: 56px;

  /* Visual */
  background: var(--color-primary);
  border: none;
  border-radius: 50%;
  box-shadow: var(--shadow-large);

  /* Content */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);

  /* Interaction */
  cursor: pointer;
  transition: all 0.2s ease;
}

#chat-fab:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-xlarge);
  transform: translateX(-50%) scale(1.05);
}

#chat-fab:active {
  background: var(--color-primary-pressed);
  transform: translateX(-50%) scale(0.95);
}
```

#### FAB Behavior

- **Appears when**: Chatbox or AI chat is closed by user
- **Action**: Reopens the last closed chat type (chatbox or AI chat)
- **Chatbox restore**: Content is restored based on current journey state
- **Icon**: Chat bubble (Lucide `message-square`)
- **Accessibility**: `aria-label="Reopen guide"`

---

## Layout Specifications

### Starting Screen

```css
.start-screen {
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  
  /* Visual */
  background: var(--color-bg-primary);  /* Pure white */
}

/* Center the single CTA */
.start-cta {
  /* Use Primary Button styles */
  /* Size: Large variant */
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-base);
}
```

### Active Layout Grid

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Control Bar (top center)                      │
├────────────────────────────────────────────────┬────────────────────┤
│                                                │                    │
│                                                │   Right Panel      │
│                                                │   (30% width)      │
│              Map Area                          │                    │
│              (~70% width)                      │   - Title          │
│                                                │   - Content        │
│                                                │   - Actions        │
│                                                │                    │
│  ┌──────────────────┐                         │                    │
│  │    Chatbox       │                         │                    │
│  │    (bottom-left) │                         │                    │
│  └──────────────────┘                         │                    │
└────────────────────────────────────────────────┴────────────────────┘
```

### Z-Index Layering

```css
:root {
  --z-map: 0;
  --z-map-controls: 10;
  --z-markers: 20;
  --z-chatbox: 100;
  --z-panel: 200;
  --z-control-bar: 300;
  --z-gallery: 1000;
  --z-tooltip: 1100;
}
```

---

## CSS Custom Properties Reference

### Complete Token Export

```css
:root {
  /* ========== TYPOGRAPHY ========== */
  --font-display: "Rem", sans-serif;
  --font-body: "Noto Sans JP", sans-serif;

  --text-xs: 0.6875rem;    /* 11px */
  --text-sm: 0.8125rem;    /* 13px */
  --text-base: 0.9375rem;  /* 15px */
  --text-lg: 1.0625rem;    /* 17px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.375rem;    /* 22px */
  --text-3xl: 1.75rem;     /* 28px */
  --text-4xl: 2.125rem;    /* 34px */
  --text-5xl: 2.5rem;      /* 40px */
  
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  --tracking-display: -0.02em;
  --tracking-body: 0;
  --tracking-small: 0.01em;
  
  /* ========== COLORS ========== */
  --color-primary: #fbb931;
  --color-primary-hover: #e5a82c;
  --color-primary-pressed: #cc9526;
  --color-primary-disabled: #fdd97a;
  
  --color-text-primary: #1e1f20;
  --color-text-secondary: #4a4b4d;
  --color-text-tertiary: #6e7073;
  --color-text-disabled: #a3a5a8;
  --color-text-on-primary: #1e1f20;
  
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f7;
  --color-bg-tertiary: #e8e8ed;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);
  
  --color-success: #34c759;
  --color-warning: #ff9500;
  --color-error: #ff3b30;
  --color-info: #007aff;
  
  --color-map-route: #007aff;
  --color-map-zone-future: rgba(251, 185, 49, 0.2);
  --color-map-radius: rgba(255, 59, 48, 0.15);
  
  /* ========== SPACING ========== */
  --space-unit: 8px;
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  
  /* ========== RADIUS ========== */
  --radius-none: 0;
  --radius-small: 4px;
  --radius-medium: 8px;
  --radius-large: 12px;
  --radius-xlarge: 16px;
  --radius-full: 9999px;
  
  /* ========== SHADOWS ========== */
  --shadow-subtle: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-large: 0 4px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xlarge: 0 8px 16px rgba(0, 0, 0, 0.08), 0 24px 48px rgba(0, 0, 0, 0.16);
  --shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.08);
  
  /* ========== MOTION ========== */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  
  --easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
  --easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
  --easing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  /* ========== ICONS ========== */
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;
  --icon-2xl: 48px;
  --icon-stroke-weight: 1.5px;
  
  /* ========== INTERACTIVE ========== */
  --touch-target-min: 44px;
  --touch-target-comfortable: 48px;
  
  /* ========== Z-INDEX ========== */
  --z-map: 0;
  --z-map-controls: 10;
  --z-markers: 20;
  --z-chatbox: 100;
  --z-panel: 200;
  --z-control-bar: 300;
  --z-gallery: 1000;
  --z-tooltip: 1100;
}
```

---

## Checklist for Implementation

### Before Each Component

- [ ] Typography uses correct font family (Display vs Body)
- [ ] Text case follows rules (Title Case vs Sentence case)
- [ ] No uppercase text anywhere
- [ ] All text left-aligned
- [ ] Font sizes use rem units from scale

### For Every Interactive Element

- [ ] Default state styled
- [ ] Hover state implemented
- [ ] Focus-visible state with outline
- [ ] Active/pressed state
- [ ] Disabled state (if applicable)
- [ ] Meets 44×44px minimum touch target
- [ ] Cursor: pointer applied

### For Every Button

- [ ] Uses `--color-primary` fill (#fbb931)
- [ ] Uses `--color-text-on-primary` text (#1e1f20)
- [ ] All four states styled (hover, focus, disabled, pressed)
- [ ] Icon gap is 8px if icon present
- [ ] Title Case label text

### Accessibility Audit

- [ ] Color contrast passes 4.5:1 / 3:1
- [ ] Focus indicators visible
- [ ] `prefers-reduced-motion` respected
- [ ] ARIA labels on icon-only buttons
- [ ] Semantic heading hierarchy
- [ ] Skip link present

### Spacing Verification

- [ ] All values derive from 8pt scale
- [ ] Internal spacing ≤ external spacing
- [ ] Consistent gaps between similar elements

### For Map Legend

- [ ] Always shows core items: Base Map, Science Park, Corporate Sites, Real Estate
- [ ] Journey-specific items added below core items
- [ ] Development Zone item hidden in Present view (Journey B)
- [ ] All icons use Lucide icons matching Data Layers panel
- [ ] Science Park uses `flask-conical` icon (conveys science)
- [ ] Marker colors match actual map markers
- [ ] Legend positioned bottom-right, doesn't overlap chatbox
- [ ] Updates when journey changes

### For Data Layers Panel

- [ ] Toggle button always visible (never hidden)
- [ ] Panel closes when journey changes (button stays visible)
- [ ] All icons use Lucide icons matching Legend
- [ ] Science Park uses `flask-conical` icon (conveys science)
- [ ] Active/inactive states visually distinct
- [ ] Layer toggles correctly show/hide map elements

### For Floating Action Button (Chat FAB)

- [ ] Appears when chatbox or AI chat is closed
- [ ] Hidden when chatbox or AI chat is open
- [ ] Reopens correct chat type (last closed)
- [ ] Restores chatbox content based on journey state
- [ ] 56×56px size meets touch target requirements
- [ ] Brand-colored with proper hover/active states

---

## File Structure

```
map-prototype/
├── index.html          # Main entry point
├── css/
│   ├── tokens.css      # CSS custom properties (from this document)
│   ├── base.css        # Reset, typography, global styles
│   ├── components.css  # Buttons, panels, cards, etc.
│   └── utilities.css   # Spacing, visibility helpers
├── js/
│   ├── app.js          # Main app logic & state machine
│   ├── map.js          # Map setup, markers, layers
│   ├── data.js         # All mock data
│   └── ui.js           # Panel, chatbox, gallery, controls
├── assets/
│   └── placeholders/   # Placeholder images for gallery
└── CLAUDE.md           # This design system document
```

---

*Last updated: February 2026*
*Based on macOS Human Interface Guidelines with project-specific customizations*