# Design Tokens

Full CSS custom property definitions for the design system. For rules and constraints, see CLAUDE.md Strict Rules.

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

### Type Scale (macOS HIG)

All font sizes use `rem` units with `1rem = 16px` base.

```css
:root {
  --text-xs: 0.6875rem;    /* 11px - Caption 2 */
  --text-sm: 0.8125rem;    /* 13px - Footnote */
  --text-base: 0.9375rem;  /* 15px - Subheadline */
  --text-lg: 1.0625rem;    /* 17px - Body/Headline */
  --text-xl: 1.25rem;      /* 20px - Title 3 */
  --text-2xl: 1.375rem;    /* 22px - Title 2 */
  --text-3xl: 1.75rem;     /* 28px - Title 1 */
  --text-4xl: 2.125rem;    /* 34px - Large Title */
  --text-5xl: 2.5rem;      /* 40px - Hero */

  --line-height-tight: 1.25;       /* Headings, labels */
  --line-height-normal: 1.5;       /* Body copy */
  --line-height-relaxed: 1.75;     /* Long-form reading */
}
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

```css
:root {
  --tracking-display: -0.02em;   /* Display sizes (20pt+) */
  --tracking-body: 0;            /* Default */
  --tracking-small: 0.01em;      /* Small text needs more air */
}
```

### Case Rules

**Strict rule: always use sentence case.** Only two exceptions:

1. **Primary CTAs** with brand-amber fill (action buttons)
2. **Modal overlay headings** (h2/h3 inside modal dialogs)

| Element Type | Case | Example |
|--------------|------|---------|
| Primary CTAs (amber fill) | Title Case | "Start the Journey", "Continue", "Schedule a Consultation" |
| Modal headings (h2/h3 inside modals) | Title Case | "Ask Me Anything About Kumamoto" |
| Everything else | Sentence case | "Supporting evidence", "View evidence", "Water resources" |

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

### Contrast Requirements (WCAG AA)

| Text Size | Minimum Contrast Ratio |
|-----------|----------------------|
| Normal text (< 18pt) | 4.5:1 |
| Large text (>= 18pt or 14pt bold) | 3:1 |
| UI components, icons | 3:1 |

**Verified Combinations:**

- `#1e1f20` on `#ffffff` - 16.5:1 (passes)
- `#1e1f20` on `#fbb931` - 8.2:1 (passes)
- `#4a4b4d` on `#ffffff` - 8.6:1 (passes)

---

## Spacing System (8pt Grid)

```css
:root {
  --space-unit: 8px;
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

### Internal <= External Rule

Per Gestalt proximity: internal spacing (padding) should be less than or equal to external spacing (margin).

### Allowed Hardcoded Exceptions

| Value | Use Case | Rationale |
|-------|----------|-----------|
| `1px` | Segmented control gaps (`#time-toggle`, `.scenario-toggle`) | Hairline separator |
| `2px` | Segmented control padding, badge padding | Sub-grid precision |
| `124px` | Layers toggle and dashboard toggle positioning | Same horizontal line |
| `168px` | Data layers panel positioning | Below layers toggle (124px + 36px + 8px) |

---

## Corner Radius

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

**Nested Radius Rule:** inner radius = outer radius - padding (use minimum `--radius-small` if result is negative).

---

## Shadows & Elevation

```css
:root {
  --shadow-subtle:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.08);

  --shadow-medium:
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.08);

  --shadow-large:
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.12);

  --shadow-xlarge:
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.16);

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
