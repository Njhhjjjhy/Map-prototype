# CLAUDE.md - Map Prototype Design System

## Project Overview

Interactive presentation app for real estate sales in Kumamoto, Japan. Desktop-only web app that guides presenters through three sequential "journeys" building investment credibility.

**Technology Stack:** HTML/CSS/JavaScript (no frameworks), Mapbox GL JS (3D), Vanilla JS state machine, Chart.js (dataviz)

### Language Rule

```
ENGLISH ONLY - NO JAPANESE OR OTHER NON-ENGLISH TEXT

All UI text, labels, data properties, and content must be in English.
NEVER add Japanese (hiragana, katakana, kanji) text to the UI.
NEVER add titleJa, nameJa, questionJa, or similar bilingual properties.
NEVER display non-English translations in chatbox, panels, or overlays.
Use English-only for all user-facing strings.
Japanese place names should use their romanized (romaji) form only.
```

### Claude Response Guidelines

```
STRICT RULES FOR ALL CLAUDE RESPONSES

These rules apply to all Claude outputs and responses in this context window:

NEVER use emojis.
NEVER use uppercase.
NEVER exaggerate.

Always use proper grammar and end sentences with periods.
Always use Oxford commas.
Never use em dash.

Use clear, direct, professional communication.
Focus on factual, measured descriptions.
Maintain a calm, helpful tone without unnecessary emphasis.
```

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
  --text-xs: 0.6875rem;    /* 11px - Caption 2 */
  --text-sm: 0.8125rem;    /* 13px - Footnote */
  --text-base: 0.9375rem;  /* 15px - Subheadline */
  --text-lg: 1.0625rem;    /* 17px - Body/Headline */
  --text-xl: 1.25rem;      /* 20px - Title 3 */
  --text-2xl: 1.375rem;    /* 22px - Title 2 */
  --text-3xl: 1.75rem;     /* 28px - Title 1 */
  --text-4xl: 2.125rem;    /* 34px - Large Title */
  --text-5xl: 2.5rem;      /* 40px - Hero */

  /* Line Heights */
  --line-height-tight: 1.25;       /* Headings, labels */
  --line-height-normal: 1.5;       /* Body copy */
  --line-height-relaxed: 1.75;     /* Long-form reading */
}
```

### Typography Rules

#### Case Rules

**Title Case is used ONLY for:**
1. Primary CTAs with brand-amber fill that are action buttons
2. Modal overlay headings (h2/h3 inside modals)
3. Dashboard headings

**Sentence case is used for:**
- All secondary buttons and links
- All labels and menu items
- Panel headings and subtitles (right panel)
- Body copy
- Placeholder text
- All other UI text

| Element Type | Case | Example |
|--------------|------|---------|
| Primary CTAs (amber fill) | Title Case | "Start the Journey", "Continue", "Schedule a Consultation" |
| Secondary buttons | Sentence case | "View evidence", "View master plan", "Corporate investment chart" |
| Labels and options | Sentence case | "Water resources", "Power infrastructure" |
| Modal headings | Title Case | "Ask Me Anything About Kumamoto" |
| Panel headings | Sentence case | "Supporting evidence", "Infrastructure plan" |
| Dashboard headings | Title Case | "Investment Overview", "Market Statistics" |
| Body copy | Sentence case | "Click the marker to view property details." |
| Placeholder text | Sentence case | "Enter your search query..." |

#### Absolute Prohibitions

```
NEVER USE ALL CAPS - Not for headings, buttons, labels, or emphasis.
NEVER USE UPPERCASE - Use bold weight or color for emphasis instead.
Never center-align body text - Always left-align (align-start).
Never justify text - Creates uneven spacing.
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
  
  /* Borders */
  --color-border: rgba(0, 0, 0, 0.1);        /* Default borders */
  --color-border-strong: rgba(0, 0, 0, 0.15); /* Emphasized borders */

  /* Map-Specific */
  --color-map-route: #007aff;         /* Route lines */
  --color-map-zone-future: rgba(251, 185, 49, 0.2);  /* Development zones */
  --color-map-radius: rgba(255, 59, 48, 0.15);       /* Science park radius */
  --color-map-infrastructure: #5ac8fa; /* Infrastructure road overlays */
}
```

### Dark Mode

```
DARK MODE IS NOT SUPPORTED
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

- `#1e1f20` on `#ffffff` - 16.5:1 (passes)
- `#1e1f20` on `#fbb931` - 8.2:1 (passes)
- `#4a4b4d` on `#ffffff` - 8.6:1 (passes)

---

## Spacing System (8pt Grid)

All spacing values derive from an 8-point base unit. Use 4pt for fine-tuning icons and small text.

```css
:root {
  /* Base Unit */
  --space-unit: 8px;
  
  /* Spacing Scale */
  --space-0: 0;
  --space-1: 4px;    /* 0.5 unit - Icon gaps, fine adjustments */
  --space-2: 8px;    /* 1 unit - Tight spacing */
  --space-3: 12px;   /* 1.5 units - Compact elements */
  --space-4: 16px;   /* 2 units - Default padding */
  --space-5: 20px;   /* 2.5 units - Comfortable spacing */
  --space-6: 24px;   /* 3 units - Section gaps */
  --space-8: 32px;   /* 4 units - Large gaps */
  --space-10: 40px;  /* 5 units - Panel padding */
  --space-12: 48px;  /* 6 units - Section breaks */
  --space-16: 64px;  /* 8 units - Major sections */
  --space-20: 80px;  /* 10 units - Hero spacing */
  --space-24: 96px;  /* 12 units - Page margins */
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

### Mandatory Spacing Rules

```
STRICT SPACING ENFORCEMENT - NEVER DEVIATE

These spacing values are mandatory and must be followed exactly:

NEVER use arbitrary pixel values - Always use spacing tokens.
NEVER mix spacing systems - Only 8pt grid values.
NEVER skip section gaps - Use --space-6 (24px) minimum between sections.
NEVER guess spacing - Refer to this table.

REQUIRED SPACING BY CONTEXT:
┌─────────────────────────────────────┬──────────────────────────┐
│ Context                             │ Required Token           │
├─────────────────────────────────────┼──────────────────────────┤
│ Title to next section               │ --space-6 (24px)         │
│ Header to content block             │ --space-6 (24px)         │
│ Between related items               │ --space-3 or --space-4   │
│ Between unrelated sections          │ --space-6 to --space-8   │
│ Panel/card internal padding         │ --space-6 (24px)         │
│ Icon to adjacent text               │ --space-2 (8px)          │
│ Button internal padding             │ --space-3 × --space-6    │
└─────────────────────────────────────┴──────────────────────────┘

When in doubt: --space-6 (24px) for section gaps, --space-4 (16px) for related elements.
```

### Allowed Exceptions

The following hardcoded pixel values are permitted for specific UI patterns:

| Value | Use Case | Rationale |
|-------|----------|-----------|
| `1px` | Segmented control gaps (`#time-toggle`, `.scenario-toggle`) | Creates hairline separator for macOS segmented control aesthetic |
| `2px` | Segmented control padding, badge padding, tight icon gaps | Sub-grid precision for compact UI components |
| `124px` | Layers toggle and dashboard toggle positioning | Aligns both toggles on same horizontal line |
| `168px` | Data layers panel positioning (`#data-layers { top: 168px }`) | Calculated alignment below layers toggle (124px + 36px button + 8px gap) |

```css
/* ALLOWED: Segmented control pattern */
#time-toggle {
  gap: 1px;      /* Hairline separator */
  padding: 2px;  /* Tight outer padding */
}

/* ALLOWED: Calculated positioning */
#layers-toggle,
#dashboard-toggle {
  top: 124px;    /* Same horizontal line */
}

#data-layers {
  top: 168px;    /* Aligns below #layers-toggle */
}

/* NOT ALLOWED: Random hardcoded values */
.some-component {
  padding: 6px;   /* Use --space-2 (8px) instead */
  margin: 10px;   /* Use --space-3 (12px) instead */
}
```

---

## Buttons

### Button Hierarchy

1. **Primary** - Main action, highest visual prominence (brand yellow)
2. **Secondary** - Alternative actions (outlined or subtle fill)
3. **Tertiary** - Lowest prominence (text-only, icon-only)
4. **Destructive** - Irreversible actions (error red)

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

/* Hover - Cursor enters button area */
.button-primary:hover {
  background-color: var(--color-primary-hover);  /* #e5a82c */
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
}

/* Focused - Keyboard navigation (Tab) */
.button-primary:focus-visible {
  background-color: var(--color-primary);
  outline: 3px solid var(--color-info);  /* #007aff */
  outline-offset: 2px;
  box-shadow: var(--shadow-medium);
}

/* Pressed/Active - Mouse down or Enter key */
.button-primary:active {
  background-color: var(--color-primary-pressed);  /* #cc9526 */
  box-shadow: var(--shadow-subtle);
  transform: translateY(0);
}

/* Disabled - Cannot interact */
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

1. **Optical Size Alignment** - Icons at different sizes should feel balanced, not mathematically identical
2. **Consistent Weight** - Maintain uniform stroke weight (1.5px recommended)
3. **Clear Silhouette** - Icons must be recognizable at smallest intended size
4. **Filled vs Outlined** - Use filled for selected/active states; outlined for inactive
5. **Touch Targets** - Icons clickable area must be at least 44×44px regardless of visual size

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

Per HIG, corner radius should relate to element size - larger elements can have larger radii.

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
  /* Subtle - Default resting state */
  --shadow-subtle: 
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.08);
  
  /* Medium - Hover states, slight elevation */
  --shadow-medium: 
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.08);
  
  /* Large - Modals, dropdowns, popovers */
  --shadow-large: 
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.12);
  
  /* XLarge - Critical modals, overlays */
  --shadow-xlarge: 
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.16);
  
  /* Inset - Pressed states, wells */
  --shadow-inset: 
    inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
```

### Elevation Hierarchy

| Level | Usage | Shadow | Z-Index |
|-------|-------|--------|---------|
| 0 | Base content | none | 0 |
| 1 | Cards, panels, map controls | `--shadow-subtle` | 10 |
| 2 | Markers, hover states | `--shadow-medium` | 20 |
| 2.5 | Transition overlay | - | 50 |
| 3 | Chatbox | `--shadow-large` | 100 |
| 4 | Right panel | `--shadow-large` | 200 |
| 5 | Control bar | `--shadow-medium` | 300 |
| 6 | UI overlays (FAB, AI chat, data layers, legend) | `--shadow-large` | 500 |
| 7 | Modals, gallery overlay | `--shadow-xlarge` | 1000 |
| 8 | Tooltips | `--shadow-medium` | 1100 |
| 9 | Modal backdrops (Quick Look, gallery) | `--shadow-xlarge` | 2000 |
| 10 | Skip link | - | 9999 |

---

## Motion & Animation

### Core Principles (Per HIG)

1. **Purposeful** - Animation should convey meaning, not decorate
2. **Responsive** - Immediate feedback for user actions
3. **Natural** - Follow real-world physics (ease-out for entrances, ease-in for exits)
4. **Respectful** - Honor `prefers-reduced-motion` preferences

### Timing Tokens

```css
:root {
  /* Durations */
  --duration-instant: 0ms;       /* Immediate state changes */
  --duration-fast: 150ms;        /* Micro-interactions */
  --duration-normal: 250ms;      /* Default transitions */
  --duration-slow: 350ms;        /* Complex animations */
  --duration-slower: 500ms;      /* Page transitions */
  --duration-scene: 1500ms;      /* Cinematic journey transitions */

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

Three distinct marker entrance animations differentiate marker types:

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

**Route drawing:**
```css
.route-line-animated {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawRoute var(--duration-slower) var(--easing-decelerate) forwards;
}

@keyframes drawRoute {
  to { stroke-dashoffset: 0; }
}
```

**Infrastructure road fade-in:**
```css
@keyframes roadFadeIn {
  from { opacity: 0; stroke-opacity: 0; }
  to   { opacity: 0.7; stroke-opacity: 0.7; }
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

1. **Color Contrast** - 4.5:1 for text, 3:1 for UI components
2. **Touch Targets** - Minimum 44×44px
3. **Focus Indicators** - Visible focus rings for keyboard navigation
4. **Motion** - Respect `prefers-reduced-motion`
5. **Text Scaling** - Support up to 200% zoom without loss of functionality
6. **Semantic HTML** - Proper heading hierarchy, landmarks, ARIA where needed

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

#### Modal List Item Spacing (MANDATORY)

```
STRICT RULE: All modal items must follow these spacing requirements.

SPACING HIERARCHY:
- Between ALL items: var(--space-4) (16px) via parent gap
- Last item to CTA button: var(--space-6) (24px) via button margin-top
- Checkmark to right edge: margin-left: auto (fills remaining space)

STRUCTURE:
.chatbox-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);  /* 16px between ALL items */
}

.chatbox-option {
  width: 100%;  /* Full width of container */
  display: flex;
  align-items: center;
  justify-content: flex-start;  /* For checkmark positioning */
}

.chatbox-option.completed::after {
  margin-left: auto;  /* Push checkmark to right edge */
}

.chatbox-continue.primary {
  margin-top: var(--space-6);  /* 24px section gap */
}
```

**Rules:**
- All items MUST be inside `.chatbox-options` container to benefit from gap spacing
- Never add inline `style="margin-top"` to individual items
- Checkmarks use `margin-left: auto` (NOT fixed spacing like `var(--space-4)`)
- CTA buttons always have 24px spacing from last item (section gap)
- Items with metadata labels/chevrons use `justify-content: space-between`

### AI Chat

The AI Chat modal appears after journey completion or in Dashboard mode, allowing users to ask questions about Kumamoto.

#### AI Chat Context Modes

| Mode | Access | CTAs Visible | Use Case |
|------|--------|--------------|----------|
| Post-Journey | After completing any journey | Yes | Download summary, schedule consultation |
| Dashboard | Via FAB in "Skip to Dashboard" | No | Explore freely without journey context |

```css
#ai-chat {
  /* Layout */
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;

  /* Sizing */
  width: 100%;
  max-width: 424px;
  padding: var(--space-2) var(--space-4) var(--space-8) var(--space-4);

  /* Visual */
  background: #FEFEFE;
  border-radius: var(--radius-xlarge);
  box-shadow: var(--shadow-large);
}
```

#### AI Chat Internal Spacing (MANDATORY)

```
STRICT RULE: All content sections must have --space-6 (24px) gap from header.

Structure:
┌─────────────────────────────────────┐
│  [X] Close button (top-right)       │
│                                     │
│  ← --space-4 margin-top →           │
│  Ask Me Anything About Kumamoto     │  ← Header (h3)
│                                     │
│  ← --space-6 margin-top →           │  ← REQUIRED 24px gap
│  ┌─────────────────────────────┐    │
│  │ Suggestion chips OR         │    │  ← .ai-chat-suggestions
│  │ Message bubbles             │    │     OR .ai-chat-messages
│  └─────────────────────────────┘    │
│                                     │
│  [Input field]                      │
└─────────────────────────────────────┘

REQUIRED margin-top values:
- .ai-chat-header: var(--space-4) - gap after close button
- .ai-chat-suggestions: var(--space-6) - section gap after header
- .ai-chat-messages: var(--space-6) - section gap after header
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

### Modal Header (Required for ALL Modals)

All modals must follow this header spacing rule:

```css
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);  /* 8px - REQUIRED spacing between title and close button */
}

.modal-title {
  flex: 1;
  margin: 0;
}

.modal-close {
  flex-shrink: 0;
  /* Gap of 8px is enforced by parent's gap property */
}
```

**Rule:** The space between the modal title and the close button-icon MUST be `--space-2` (8px). This applies to all modals including gallery overlays, dialogs, and any overlay content with a dismissible header.

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
  border-radius: var(--radius-full);
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
| Base Map | `#6e7073` (gray) | `map-pin` | Yes |
| Science Park | `#ff3b30` (red) | `flask-conical` | Yes |
| Corporate Sites | `#007aff` (blue) | `building-2` | Yes |
| Real Estate | `#ff9500` (orange) | `house` | Yes |
| Resources | `#ff3b30` (red) | `droplet` | Journey A only |
| Development Zone | `#ff3b30` (red) | `target` | Journey B (Future view only) |
| Infrastructure Roads | `#5ac8fa` (teal) | `route` | Journey B (Step B7 only) |
| Route to JASM | `#64748b` (gray) | `route` | Journey C only |

#### Legend Content Structure

**Core items (always visible in all journeys):**
- Base Map
- Science Park
- Corporate Sites
- Real Estate

**Journey-specific additions:**
- **Journey A**: + Resources
- **Journey B**: + Development Zone (visible only in Future view), + Infrastructure Roads (visible only in Step B7)
- **Journey C**: + Route to JASM

### Infrastructure Road Overlays

Polyline overlays representing planned and in-progress road infrastructure. Visible during Journey B Step B7.

```css
.infrastructure-road {
  /* Default state */
  stroke: var(--color-map-infrastructure);  /* #5ac8fa */
  stroke-width: 5px;
  stroke-dasharray: 10, 6;
  stroke-opacity: 0.7;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-standard);
}

.infrastructure-road:hover {
  stroke-width: 7px;
  stroke-opacity: 1.0;
}

.infrastructure-road.selected {
  stroke-width: 7px;
  stroke-dasharray: none;  /* Solid line */
  stroke-opacity: 1.0;
  filter: drop-shadow(0 0 8px rgba(90, 200, 250, 0.5));
}
```

#### Infrastructure Road Behavior

- **Single selection**: Only one road can be selected at a time
- **Hover feedback**: Stroke weight increases, opacity increases to 1.0
- **Selected state**: Dashed line becomes solid, glow effect applied
- **Panel sync**: Clicking road opens right panel with road details
- **Fade in**: Roads appear with 300ms fade when step activates

#### Infrastructure Road Panel Content

The right panel for infrastructure roads follows this structure:

```
[Subtitle] Infrastructure Plan
[Title]    {Road Name}

[Headline Metric]
{-X min}
Commute Saved

[Stats Grid]
Drive to JASM  | {time}
Status         | {Under Construction / Planned / Complete}
Completion     | {year}
Budget         | {amount}

[Description]
{Road description text}

[Button] View Source Document
```

### Data Layers Panel

The Data Layers panel allows toggling visibility of map layers and data overlays.

#### Data Layers Toggle Button

```css
#layers-toggle {
  /* Always visible - never hidden */
  position: absolute;
  top: var(--space-20);
  left: var(--space-3);
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

#### Data Layer Checkbox Styling

```css
/* macOS-style checkbox */
.layer-checkbox {
  width: var(--icon-sm);
  height: var(--icon-sm);
  border: 1.5px solid var(--color-text-tertiary);
  border-radius: var(--radius-medium);  /* 8px - macOS HIG rounded checkbox */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--easing-standard);
}

.layer-item.active .layer-checkbox {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.layer-item.active .layer-checkbox::after {
  content: '';
  width: 9px;
  height: 5px;
  border-left: 2px solid var(--color-text-primary);
  border-bottom: 2px solid var(--color-text-primary);
  transform: rotate(-45deg) translateY(-1px);
}
```

**Design Notes:**
- Uses `--radius-medium` (8px) for proper macOS rounded corners
- Never fully circular (radio buttons) or sharp squares
- Checkmark created with CSS borders for performance
- Follows macOS Big Sur+ checkbox aesthetic

#### Data Layer Items

All layer icons use **Lucide** icons for consistency with the Legend.

**Control Type:** Checkboxes (multiple selection enabled)

**Visual Styling:**
- Rounded checkboxes (`--radius-medium` / 8px) following macOS HIG
- Checkmark indicator when active
- Brand yellow fill (`--color-primary`) when checked

| Layer | Icon (Lucide) | Default State |
|-------|---------------|---------------|
| Science Park | `flask-conical` | Inactive |
| Corporate Sites | `building-2` | Inactive |
| Properties | `house` | Inactive |
| Base Map | `map-pin` | Inactive |
| Traffic Flow | `car` | Inactive |
| Rail Commute | `train-front` | Inactive |
| Electricity Usage | `zap` | Inactive |
| Employment | `briefcase` | Inactive |
| Infrastructure Plan | `landmark` | Inactive |
| Real Estate | `house` | Inactive |
| Risky Area | `droplet` | Inactive |

**Behavior:**
- **Multiple selection**: Users can toggle multiple layers on/off simultaneously
- **All inactive by default**: Layers start unchecked, users choose which to display
- **Independent toggles**: Each layer can be shown/hidden independently

### Evidence Library Panel

A disclosure-based panel for browsing hierarchical evidence groups with multiple items per category.

```css
.evidence-library {
  /* Container */
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.evidence-group {
  /* Disclosure group container */
  border: 1px solid var(--color-bg-tertiary);
  border-radius: var(--radius-medium);
  overflow: hidden;
}

.evidence-group-header {
  /* Clickable header row */
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--easing-standard);
}

.evidence-group-header:hover {
  background: var(--color-bg-tertiary);
}

.evidence-group-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
}

.evidence-group-title {
  flex: 1;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.evidence-group-chevron {
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
  transition: transform var(--duration-fast) var(--easing-standard);
}

.evidence-group.expanded .evidence-group-chevron {
  transform: rotate(90deg);
}

.evidence-group-items {
  /* Items container - hidden by default */
  display: none;
  padding: var(--space-2);
  background: var(--color-bg-primary);
}

.evidence-group.expanded .evidence-group-items {
  display: block;
}

.evidence-item {
  /* Individual evidence item */
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-small);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--easing-standard);
}

.evidence-item:hover {
  background: var(--color-bg-secondary);
}

.evidence-item.has-location::after {
  /* Location indicator */
  content: '';
  width: 8px;
  height: 8px;
  background: var(--color-info);
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: auto;
}
```

#### Evidence Library Behavior

- **Disclosure groups**: Click header to expand/collapse item list
- **Item interaction**: Click item to view detail with source link
- **Location indicator**: Blue dot on items with map coordinates
- **Bidirectional sync**: Clicking item highlights map marker; clicking marker opens item detail
- **Back navigation**: "Back to List" returns to library and clears marker highlights

#### Evidence Marker Styles

```css
.evidence-marker {
  /* Map marker for evidence items */
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-bg-primary);
  border: 2px solid currentColor;
  box-shadow: var(--shadow-medium);
  display: flex;
  align-items: center;
  justify-content: center;
}

.evidence-marker.highlighted {
  /* Selected state */
  transform: scale(1.2);
  box-shadow: var(--shadow-large), 0 0 0 4px rgba(0, 122, 255, 0.3);
}
```

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
  border-radius: var(--radius-full);
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

### Cinematic Skip Button

A translucent button that appears during the opening 3D fly-in animation, allowing presenters to skip ahead.

```css
#cinematic-skip {
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 10;
  padding: var(--space-2) var(--space-5);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-medium);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-normal) var(--easing-standard);
}

#cinematic-skip.visible {
  opacity: 1;
  pointer-events: auto;
}

#cinematic-skip:hover {
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
}
```

#### Skip Button Behavior

- **Appears during**: Cinematic 3D fly-in entry only
- **Hidden when**: Journey starts, or animation completes naturally
- **Action**: Immediately ends the fly-in and settles at the Journey A starting position
- **Text**: "Skip Intro"

### Panel Toggle Button

A map control button that toggles the right panel visibility.

```css
#panel-toggle {
  position: absolute;
  top: var(--space-20);
  right: var(--space-3);
  z-index: 500;
  width: 36px;
  height: 36px;
  background: var(--color-bg-primary);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

#panel-toggle.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-primary);
}
```

- **Icon**: Sidebar right (Lucide `panel-right`)
- **Accessibility**: `aria-label="Toggle details panel"`

### Dashboard Toggle Button

A map control button that switches to Dashboard mode with overview statistics.

```css
#dashboard-toggle {
  position: absolute;
  top: 124px;  /* Aligns below panel-toggle */
  right: var(--space-3);
  z-index: 500;
  width: 36px;
  height: 36px;
  background: var(--color-bg-primary);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

#dashboard-toggle.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-primary);
}
```

- **Icon**: Bar chart (Lucide `bar-chart-3`)
- **Accessibility**: `aria-expanded="false"`, toggles on click
- **Available in**: Dashboard mode and post-journey

### Property Quick Look

A macOS Quick Look-style full-screen image preview for property photos. Overlays the entire viewport.

```css
#property-quick-look {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### Quick Look Behavior

- **Triggered by**: Hovering/clicking property images in the right panel
- **Dismiss**: Click overlay, press Escape, or click close button
- **Animation**: `quickLookZoomIn` - scale(0.9) to scale(1) entrance

### Disclosure Groups

A macOS NSOutlineView-style component for expandable content sections. Used in Evidence Library and data display.

```css
.disclosure-group {
  margin: var(--space-4) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-medium);
  overflow: hidden;
  background: var(--color-bg-primary);
}

.disclosure-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--easing-standard);
}

.disclosure-header:hover {
  background: var(--color-bg-tertiary);
}

.disclosure-header:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: -3px;
}

.disclosure-content {
  display: none;
  padding: var(--space-2);
}

.disclosure-group.expanded .disclosure-content {
  display: block;
  animation: disclosureExpand var(--duration-normal) var(--easing-decelerate);
}
```

#### Disclosure Group Behavior

- **Expand/collapse**: Click header to toggle content visibility
- **Triangle rotation**: Chevron rotates 90deg when expanded (macOS style)
- **Animation**: Content fades in on expand
- **Keyboard**: Enter/Space toggles, `aria-expanded` tracks state
- **Nesting**: Supports items with secondary actions (location indicator, chevron)

### Transition Overlay

A cinematic crossfade overlay used during property drill-down sequences (3D map to exterior photo to interior gallery).

```css
#transition-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
}
```

#### Transition Overlay Behavior

- **Used during**: Property reveal drill-down (Journey C)
- **Sequence**: 3D map view fades to exterior photo, then to interior gallery
- **Duration**: Uses `--duration-scene` (1500ms) for cinematic pacing
- **Sits inside**: `#map-container` so right panel remains visible above

### Draggable Modals

All major UI panels support drag-to-reposition interaction for presenter flexibility.

#### Draggable Elements

| Element | Drag Handle | Default Position |
|---------|-------------|-----------------|
| Chatbox | `#chatbox-body` | Bottom-left |
| Right Panel | Panel subtitle/title | Right side |
| AI Chat | `.ai-chat-header` | Bottom-center |
| Gallery | `.placeholder-doc h3` | Center |

#### Drag Behavior

- **Activation**: Mouse down on drag handle, then drag
- **Constraints**: Viewport boundary enforcement (cannot drag off-screen)
- **Position memory**: `element.dataset.draggable` persists repositioned state
- **Reset**: `resetDragPosition()` restores original CSS layout
- **First drag**: Converts from CSS-centered position to fixed absolute coordinates

### Chart.js Integration (Data Visualization)

Three chart types render financial data with accessible companion tables.

| Chart Type | Function | Use Case |
|------------|----------|----------|
| Scenario comparison bars | `renderScenarioChart()` | Bear/Average/Bull case comparison (Journey C) |
| Historical trend line | `renderTrendChart()` | Area appreciation over time |
| Investment comparison | `renderInvestmentChart()` | Company investment amounts |

#### Chart Accessibility

- Every chart includes a companion `<details>` disclosure with an accessible `<table>`
- Tables include `<caption>`, proper heading scopes, and screen-reader-friendly structure
- Generated via `generateDataTable(headers, rows, caption)` helper
- Colorblind-safe palettes used for all chart colors

### Dashboard Mode

An alternative presentation mode for free exploration without the guided narrative.

#### Entry Points

- **"Skip to Dashboard"** ghost button on start screen
- **Post-journey**: Available after completing all three journeys

#### Dashboard UI Differences

| Element | Journey Mode | Dashboard Mode |
|---------|-------------|----------------|
| Chatbox | Narrative-driven prompts | Hidden |
| AI Chat CTAs | Download Summary, Schedule Consultation | Hidden |
| Dashboard toggle | Available | Active |
| Data layers | Available | Available |
| Panel content | Journey-step contextual | Overview statistics |

#### Dashboard State

```javascript
App.state.dashboardMode = true;   // Alternative mode active
App.state.dashboardPanelOpen = true; // Panel shows overview stats
```

### Heartbeat / Ambient Motion

A continuous background animation system that maintains visual life when the presenter pauses.

```javascript
MapController._heartbeat = {
    active: false,
    driftInterval: null,
    bearingPerTick: 0.05,   // ~0.5 degrees per 10 seconds
    tickMs: 1000,           // Tick interval
    idleTimeout: null,
    idleThreshold: 5000,    // Activates after 5s of no interaction
    pulsingMarkers: []      // Selective marker pulse animation
};
```

#### Heartbeat Behavior

- **Drift**: Slow bearing rotation creates subtle camera movement
- **Idle detection**: Activates after 5 seconds of no user interaction
- **Pause on interaction**: Any mousedown, touchstart, or wheel event pauses drift
- **Marker pulse**: Selected markers can have subtle scale pulse via `markerPulse` keyframe
- **Reduced motion**: Entirely disabled when `prefers-reduced-motion` is active

### Camera Choreography

16 named camera positions define the 3D journey through the map.

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

### Narrative Timing Constants

Semantic timing values used in JavaScript for orchestrating narrative beats.

```javascript
const TIMING = {
    scene: 1500,         // Journey transition hold (synced with --duration-scene)
    fast: 150,           // --duration-fast
    normal: 250,         // --duration-normal
    slow: 350,           // --duration-slow
    flyDuration: 2000,   // Mapbox flyTo milliseconds
    revealDelay: 1200,   // Science park reveal after gov chain
    buttonDelay: 2500,   // Continue button after markers land
    infraStagger: 100,   // Infrastructure road stagger
    restartDelay: 500,   // Delay before restart

    // Narrative breathing room
    breath: 600,         // Full pause: let a scene register
    breathMedium: 400,   // Marker cluster to next content
    breathShort: 300,    // Quick pause: let exit complete before transition
};
```

### Panel History & Navigation

A stack-based navigation system for the right panel and chatbox supporting back/forward traversal.

- **`panelHistory`**: Stack of previous panel states with scroll position
- **`chatboxHistory`**: Chatbox content navigation history
- **Back icon**: Auto-injected icon button in panel/chatbox header when history exists
- **Scroll restore**: Previous scroll position restored on back navigation
- **Deduplication**: Prevents duplicate entries on repeated navigations

#### Navigation Pattern

```
STRICT RULE: Use only icon-based back navigation.

Correct: Icon-only back button in panel/chatbox header.
Never: Text-based "Back to..." CTAs/buttons.
Never: Redundant navigation controls.

Navigation is handled by a single back icon that appears automatically when
history exists. Do not add text-based "Back to..." buttons - they are redundant
and violate the single-control principle.
```

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

**Additional z-index values used in CSS (not tokenized):**

| Value | Elements | Rationale |
|-------|----------|-----------|
| `50` | `#transition-overlay` | Above markers, below chatbox; cinematic crossfade |
| `500` | FAB, AI chat, data layers, legend, panel-toggle, dashboard-toggle | UI overlays above control bar, below modals |
| `2000` | `#property-quick-look`, gallery backdrop | Modal backdrops above gallery content |

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

  --color-border: rgba(0, 0, 0, 0.1);
  --color-border-strong: rgba(0, 0, 0, 0.15);

  --color-success: #34c759;
  --color-warning: #ff9500;
  --color-error: #ff3b30;
  --color-info: #007aff;
  
  --color-map-route: #007aff;
  --color-map-zone-future: rgba(251, 185, 49, 0.2);
  --color-map-radius: rgba(255, 59, 48, 0.15);
  --color-map-infrastructure: #5ac8fa;
  
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
  --shadow-large: 0 4px 8px rgba(55, 26, 26, 0.04), 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xlarge: 0 8px 16px rgba(0, 0, 0, 0.08), 0 24px 48px rgba(0, 0, 0, 0.16);
  --shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.08);
  
  /* ========== MOTION ========== */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  --duration-scene: 1500ms;

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
- [ ] Checkboxes use `--radius-medium` (8px) rounded corners (macOS HIG)
- [ ] Checkboxes show checkmark when active, not radio dot
- [ ] All layers start inactive (unchecked) by default
- [ ] Multiple layers can be selected simultaneously
- [ ] Active/inactive states visually distinct
- [ ] Layer toggles correctly show/hide map elements

### For Floating Action Button (Chat FAB)

- [ ] Appears when chatbox or AI chat is closed
- [ ] Hidden when chatbox or AI chat is open
- [ ] Reopens correct chat type (last closed)
- [ ] Restores chatbox content based on journey state
- [ ] 56×56px size meets touch target requirements
- [ ] Brand-colored with proper hover/active states

### For AI Chat

- [ ] Header margin-top is `--space-4` (16px) - gap after close button
- [ ] Suggestions margin-top is `--space-6` (24px) - section gap after header
- [ ] Messages margin-top is `--space-6` (24px) - section gap after header
- [ ] Suggestions hide after first message sent
- [ ] Both suggestions and messages maintain 24px gap from header title
- [ ] CTAs (Download Summary, Schedule Consultation) hidden in Dashboard mode
- [ ] CTAs visible only after completing a journey (not in Skip to Dashboard)

### For All Modals

- [ ] Header uses flexbox with `justify-content: space-between`
- [ ] Gap between title and close button is exactly 8px (`--space-2`)
- [ ] Close button is flex-shrink: 0 to prevent compression
- [ ] Title has flex: 1 to fill available space
- [ ] All items inside `.chatbox-options` container (never outside)
- [ ] Item spacing is 16px (`gap: var(--space-4)`)
- [ ] Last item to CTA spacing is 24px (`margin-top: var(--space-6)`)
- [ ] Checkmarks use `margin-left: auto` (right-aligned)
- [ ] All items are full width (`width: 100%`)
- [ ] No inline `style="margin-top"` on individual items

### For Evidence Library

- [ ] Disclosure groups expand/collapse on header click
- [ ] Chevron rotates 90° when expanded
- [ ] Items with coordinates show blue location indicator dot
- [ ] Clicking item with location highlights map marker
- [ ] Clicking map marker opens item detail view
- [ ] "Back to List" clears marker highlights
- [ ] Evidence markers scale up (1.2×) when highlighted
- [ ] Highlighted markers have blue ring shadow

### For Cinematic Skip Button

- [ ] Appears only during 3D fly-in animation
- [ ] Hidden after animation completes or journey starts
- [ ] Translucent background with backdrop-filter
- [ ] Hover brightens background to rgba(0,0,0,0.5)
- [ ] Active state at scale(0.97)

### For Panel Toggle / Dashboard Toggle

- [ ] Both use 36×36px size with touch target expansion to 44px
- [ ] Panel toggle at top: `--space-20`, right: `--space-3`
- [ ] Dashboard toggle at top: 124px, right: `--space-3`
- [ ] Active state uses brand yellow background
- [ ] `backdrop-filter: blur(20px) saturate(180%)`

### For Property Quick Look

- [ ] Full-screen overlay at z-index: 2000
- [ ] `quickLookZoomIn` entrance animation
- [ ] Dismissible via click, Escape key, or close button
- [ ] Overlay background with backdrop blur

### For Disclosure Groups

- [ ] Header uses `--color-bg-secondary` background
- [ ] Hover state changes to `--color-bg-tertiary`
- [ ] Focus-visible with inset outline (offset: -3px)
- [ ] Triangle rotates on expand (macOS style)
- [ ] Content fade-in via `disclosureExpand` animation
- [ ] `aria-expanded` attribute tracks state

### For Charts (Data Visualization)

- [ ] Every chart has companion accessible data table in `<details>`
- [ ] Tables include proper `<caption>` and heading scopes
- [ ] Colorblind-safe palettes used
- [ ] Chart.js instances tracked in `UI.charts` to prevent memory leaks
- [ ] Canvas elements have proper IDs for lifecycle management

### For Infrastructure Roads

- [ ] Roads appear as teal dashed polylines (#5ac8fa)
- [ ] Hover increases stroke weight (5px → 7px) and opacity (0.7 → 1.0)
- [ ] Click selects road (dashed → solid, glow effect)
- [ ] Single selection only (clicking another road deselects previous)
- [ ] Right panel shows headline metric (commute saved) prominently
- [ ] Stats grid includes: Drive to JASM, Status, Completion, Budget
- [ ] "View Source Document" button opens gallery
- [ ] Roads fade in over 300ms when B7 activates
- [ ] Legend shows Infrastructure Roads item during B7

---

## File Structure

```
map-prototype/
├── index.html              # Main entry point
├── css/
│   └── styles.css          # All CSS: tokens, base, components, utilities (single file)
├── js/
│   ├── app.js              # Main app logic & state machine (TIMING, CAMERA_STEPS)
│   ├── map-controller.js   # Mapbox GL JS setup, markers, layers, 3D camera, heartbeat
│   ├── data.js             # All mock data (journeys, properties, evidence, roads, etc.)
│   └── ui.js               # Panel, chatbox, gallery, charts, draggable, disclosure
├── assets/
│   ├── placeholders/       # Placeholder images for gallery
│   ├── Assets1.png         # Brand logo (dark)
│   ├── Assets2.png         # Brand logo (alt)
│   ├── Assets3.svg         # Brand mark (SVG)
│   ├── Assets4.svg         # Brand mark (variant)
│   └── Assets4-white.svg   # Brand mark (white, for dark backgrounds)
├── docs/
│   └── plans/              # Design documents and implementation plans
├── feedback/               # User research: feedback rounds and presentation scripts
├── BEATSHEET.md            # Narrative beat sheet for journey choreography
├── Map prototype spec.md   # App specification (journey steps, components, behavior)
├── CLAUDE.md               # This design system document
└── package.json            # Dependencies (Chart.js, etc.)
```

---

*Last updated: February 12, 2026*
*Based on macOS Human Interface Guidelines with project-specific customizations*