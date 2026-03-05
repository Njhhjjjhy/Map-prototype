# Component Specifications

Detailed CSS specs and behavior for all UI components. For design tokens, see `docs/design-tokens.md`. For rules, see CLAUDE.md.

---

## Buttons

### Button Hierarchy

1. **Primary** - Main action, highest visual prominence (brand yellow)
2. **Secondary** - Alternative actions (outlined or subtle fill)
3. **Tertiary** - Lowest prominence (text-only, icon-only)
4. **Destructive** - Irreversible actions (error red)

### Primary Button

```css
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);  /* 12px 24px */
  min-height: 40px;
  min-width: 80px;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  text-transform: none;  /* Title Case, NOT uppercase */
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  border: none;
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-subtle);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-standard);
}
```

### Button States (Required for ALL Buttons)

```css
.button-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
}

.button-primary:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
  box-shadow: var(--shadow-medium);
}

.button-primary:active {
  background-color: var(--color-primary-pressed);
  box-shadow: var(--shadow-subtle);
  transform: translateY(0);
}

.button-primary:disabled,
.button-primary[aria-disabled="true"] {
  background-color: var(--color-primary-disabled);
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
}
.button-secondary:hover { background-color: var(--color-bg-secondary); border-color: var(--color-text-secondary); }
.button-secondary:active { background-color: var(--color-bg-tertiary); }
.button-secondary:disabled { border-color: var(--color-text-disabled); color: var(--color-text-disabled); }
```

### Button Size Variants

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| Small | 32px | 8px 16px | 14px | 16px |
| Medium (default) | 40px | 12px 24px | 16px | 20px |
| Large | 48px | 16px 32px | 18px | 24px |

### Button with Icon

- Icon gap: `--space-2` (8px)
- Icon size: 20px for 16px label text
- Icon-only buttons: square, `padding: var(--space-3)`, min 40x40px

---

## Iconography

Use **SF Symbols** design principles. Icons use **Lucide** library.

```css
:root {
  --icon-xs: 12px;    /* Inline indicators */
  --icon-sm: 16px;    /* Small buttons, lists */
  --icon-md: 20px;    /* Default UI icons */
  --icon-lg: 24px;    /* Prominent actions */
  --icon-xl: 32px;    /* Feature icons */
  --icon-2xl: 48px;   /* Decorative/hero */
  --icon-stroke-weight: 1.5px;
}
```

### Map Marker Icons

| Marker Type | Size | Color |
|-------------|------|-------|
| Point of Interest | 32x40px | `--color-primary` |
| Corporate HQ | 40x48px | `--color-info` |
| Property | 36x44px | `--color-success` |
| Selected State | +20% scale | Add shadow ring |

---

## Right Panel

```css
.panel-right {
  position: fixed;
  top: 0; right: 0;
  width: min(400px, 30vw);
  height: 100vh;
  background: var(--color-bg-primary);
  border-left: 1px solid var(--color-bg-tertiary);
  box-shadow: var(--shadow-large);
  padding: var(--space-6);
  transform: translateX(100%);
  transition: transform var(--duration-normal) var(--easing-decelerate);
}
.panel-right[data-visible="true"] { transform: translateX(0); }
```

---

## Chatbox

```css
.chatbox {
  position: fixed;
  bottom: var(--space-6);
  left: var(--space-6);
  width: min(360px, calc(100vw - var(--space-12)));
  background: var(--color-bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-large);
  padding: var(--space-6);
}
```

---

## AI Chat

```css
#ai-chat {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 424px;
  padding: var(--space-2) var(--space-4) var(--space-8) var(--space-4);
  background: #FEFEFE;
  border-radius: var(--radius-xlarge);
  box-shadow: var(--shadow-large);
}
```

### AI Chat Context Modes

| Mode | Access | CTAs Visible | Use Case |
|------|--------|--------------|----------|
| Post-Journey | After completing any journey | Yes | Download summary, schedule consultation |
| Dashboard | Via FAB in "Skip to Dashboard" | No | Explore freely without journey context |

---

## Gallery Overlay

```css
.gallery-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-overlay);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--easing-standard);
}
.gallery-overlay[data-visible="true"] { opacity: 1; }

.gallery-content {
  width: min(900px, 90vw);
  max-height: 90vh;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xlarge);
  box-shadow: var(--shadow-xlarge);
  padding: var(--space-8);
}
```

---

## Modal Header (Required for ALL Modals)

```css
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);  /* 8px between title and close button */
}
.modal-title { flex: 1; margin: 0; }
.modal-close { flex-shrink: 0; }
```

---

## Control Bar

```css
.control-bar {
  position: fixed;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-2);
  background: var(--color-bg-primary);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
  padding: var(--space-2);
}
```

---

## Toggle Control (Future/Present)

```css
.toggle-group {
  display: inline-flex;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-medium);
  padding: var(--space-1);
}
.toggle-option {
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-medium) - var(--space-1));
  color: var(--color-text-secondary);
  transition: all var(--duration-fast) var(--easing-standard);
}
.toggle-option[aria-pressed="true"] {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-subtle);
}
```

---

## Map Legend

Positioned bottom-right. Shows marker types relevant to current journey. All icons use Lucide.

**Core items (always visible):** Base Map, Science Park, Corporate Sites, Real Estate.

**Journey-specific additions:**
- Journey A: + Resources
- Journey B: + Development Zone (Future view only), + Infrastructure Roads (Step B7 only)
- Journey C: + Route to JASM

| Type | Color | Icon (Lucide) |
|------|-------|---------------|
| Base Map | `#6e7073` (gray) | `map-pin` |
| Science Park | `#ff3b30` (red) | `flask-conical` |
| Corporate Sites | `#007aff` (blue) | `building-2` |
| Real Estate | `#ff9500` (orange) | `house` |
| Resources | `#ff3b30` (red) | `droplet` |
| Development Zone | `#ff3b30` (red) | `target` |
| Infrastructure Roads | `#5ac8fa` (teal) | `route` |
| Route to JASM | `#64748b` (gray) | `route` |

---

## Data Layers Panel

Toggle button always visible (never hidden). Panel closes when journey changes.

- **Control type:** Checkboxes (multiple selection)
- **Checkboxes:** `--radius-small` (4px) on 16px boxes (macOS Big Sur style). Never `--radius-medium` (8px) on 16px - produces circle.
- **Active state:** Brand yellow fill (`--color-primary`) with CSS checkmark
- **All layers start inactive** (unchecked) by default

| Layer | Icon (Lucide) |
|-------|---------------|
| Science Park | `flask-conical` |
| Corporate Sites | `building-2` |
| Properties | `house` |
| Base Map | `map-pin` |
| Traffic Flow | `car` |
| Rail Commute | `train-front` |
| Electricity Usage | `zap` |
| Employment | `briefcase` |
| Infrastructure Plan | `landmark` |
| Real Estate | `house` |
| Risky Area | `droplet` |

---

## Infrastructure Road Overlays

Teal dashed polylines visible during Journey B Step B7.

- **Default:** `#5ac8fa`, 5px stroke, dashed (10, 6), 0.7 opacity
- **Hover:** 7px stroke, opacity 1.0
- **Selected:** 7px solid (no dash), glow effect, single selection only
- **Fade in:** 300ms when B7 activates

### Panel Content Structure

```
[Subtitle] Infrastructure Plan
[Title]    {Road Name}
[Headline Metric] {-X min} Commute Saved
[Stats Grid] Drive to JASM | Status | Completion | Budget
[Description]
[Button] View Source Document
```

---

## Evidence Library Panel

Disclosure-based panel with hierarchical groups.

- **Disclosure groups:** Click header to expand/collapse
- **Chevron:** Rotates 90deg when expanded (macOS style)
- **Location indicator:** Blue dot on items with map coordinates
- **Bidirectional sync:** Item click highlights marker; marker click opens item detail
- **Back navigation:** Returns to list and clears highlights

---

## Floating Action Button (Chat FAB)

```css
#chat-fab {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  width: 56px; height: 56px;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-large);
  cursor: pointer;
}
```

- **Appears when:** Chatbox or AI chat closed by user
- **Action:** Reopens last closed chat type
- **Icon:** `message-square` (Lucide)

---

## Cinematic Skip Button

Translucent button during opening 3D fly-in. Text: "Skip Intro". Hidden after animation completes.

```css
#cinematic-skip {
  position: absolute;
  bottom: var(--space-6); right: var(--space-6);
  z-index: 10;
  padding: var(--space-2) var(--space-5);
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-medium);
}
```

---

## Panel Toggle / Dashboard Toggle

Both 36x36px, same column on the right side.

- **Panel toggle:** `top: var(--space-20)`, `right: var(--space-3)`. Icon: `panel-right`
- **Dashboard toggle:** `top: 124px`, `right: var(--space-3)`. Icon: `bar-chart-3`
- **Active state:** Brand yellow background

---

## Property Quick Look

macOS Quick Look-style full-screen preview at z-index 2000. Dismiss via click, Escape, or close button. `quickLookZoomIn` entrance animation.

---

## Disclosure Groups

macOS NSOutlineView-style expandable content.

- Header: `--color-bg-secondary` background, `--color-bg-tertiary` on hover
- Focus: inset outline (offset: -3px)
- Animation: `disclosureExpand` fade-in
- Keyboard: Enter/Space toggles, `aria-expanded` tracks state

---

## Transition Overlay

Cinematic crossfade during property drill-down (Journey C). z-index 50, inside `#map-container`.

---

## Draggable Modals

| Element | Drag Handle | Default Position |
|---------|-------------|-----------------|
| Chatbox | `#chatbox-body` | Bottom-left |
| Right Panel | Panel subtitle/title | Right side |
| AI Chat | `.ai-chat-header` | Bottom-center |
| Gallery | `.placeholder-doc h3` | Center |

Viewport boundary enforcement. `resetDragPosition()` restores original CSS layout.

---

## Chart.js Integration

| Chart Type | Function | Use Case |
|------------|----------|----------|
| Scenario comparison bars | `renderScenarioChart()` | Bear/Average/Bull (Journey C) |
| Historical trend line | `renderTrendChart()` | Area appreciation over time |
| Investment comparison | `renderInvestmentChart()` | Company investment amounts |

Every chart includes a companion `<details>` disclosure with an accessible `<table>`. Colorblind-safe palettes. Canvas instances tracked in `UI.charts`.

---

## Dashboard Mode

Alternative mode for free exploration without guided narrative.

**Entry points:** "Skip to Dashboard" ghost button, or post-journey completion.

| Element | Journey Mode | Dashboard Mode |
|---------|-------------|----------------|
| Chatbox | Narrative-driven | Hidden |
| AI Chat CTAs | Visible | Hidden |
| Dashboard toggle | Available | Active |

---

## Panel History & Navigation

Stack-based navigation for right panel and chatbox.

- `panelHistory` / `chatboxHistory`: stacks with scroll position
- Back icon: auto-injected when history exists
- Scroll position restored on back navigation
- Deduplication prevents repeated entries
