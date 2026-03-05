# CLAUDE.md - Map Prototype Design System

## Project Overview

Interactive presentation app for real estate sales in Kumamoto, Japan. Desktop-only web app that guides presenters through three sequential "journeys" building investment credibility.

**Technology Stack:** HTML/CSS/JavaScript (no frameworks), Mapbox GL JS (3D), Vanilla JS state machine, Chart.js (dataviz)

---

## Design Philosophy

macOS Human Interface Guidelines (HIG) adapted for web: clarity, deference, depth, consistency.

---

## Strict Rules

All mandatory constraints. Each rule has one canonical definition here.

### Process Rules

**Language:**
- English only. No Japanese (hiragana, katakana, kanji) in UI text.
- Never add bilingual properties (titleJa, nameJa, questionJa).
- Japanese place names use romanized (romaji) form only.

**Claude response style:**
- Never use emojis, uppercase, or exaggeration.
- Always use proper grammar, Oxford commas, and end sentences with periods.
- Never use em dash.
- Use clear, direct, professional communication.

**Context window management:**
- Never exceed 50% context window usage (100,000 tokens out of 200,000).
- Break large tasks into smaller steps to prevent context overflow.
- If approaching 50%, pause and ask user before continuing.

**Dynamically created overlays:**
- Always remove existing instances before creating new ones (prevent element accumulation).
- Check `element.parentNode` exists before calling `.remove()`.
- Clean up in all restart/reset functions.

### Visual Rules

**Typography prohibitions:**
- Never use all caps or uppercase for any UI text. Use bold weight or color for emphasis.
- Never center-align body text. Always left-align (align-start).
- Never justify text.

**Case rules:** Always sentence case. Only two exceptions: primary CTAs (amber fill) and modal overlay headings use Title Case.

**Dark mode:** Not supported. Light mode only. No `prefers-color-scheme` queries.

**Spacing enforcement:**
- Always use spacing tokens from the 8pt grid. Never use arbitrary pixel values.
- Never skip section gaps. Use `--space-6` (24px) minimum between sections.

| Context | Required Token |
|---------|----------------|
| Title to next section | `--space-6` (24px) |
| Header to content block | `--space-6` (24px) |
| Between related items | `--space-3` or `--space-4` |
| Between unrelated sections | `--space-6` to `--space-8` |
| Panel/card internal padding | `--space-6` (24px) |
| Icon to adjacent text | `--space-2` (8px) |
| Button internal padding | `--space-3` x `--space-6` |

When in doubt: `--space-6` (24px) for section gaps, `--space-4` (16px) for related elements.

**Modal list item spacing:**
- All items inside `.chatbox-options` container (`gap: var(--space-4)`).
- Never add inline `style="margin-top"` to individual items.
- Checkmarks use `margin-left: auto` (not fixed spacing).
- CTA buttons: `margin-top: var(--space-6)` from last item.

**AI Chat internal spacing:**
- `.ai-chat-header`: `margin-top: var(--space-4)` (gap after close button).
- `.ai-chat-suggestions` and `.ai-chat-messages`: `margin-top: var(--space-6)` (section gap after header).

**Navigation pattern:**
- Icon-only back button in panel/chatbox header. Never text-based "Back to..." CTAs.
- Back icon appears automatically when history exists. No redundant navigation controls.

---

## Quick Reference: Design Tokens

**Fonts:** `"Rem", sans-serif` (headings/labels/CTAs), `"Noto Sans JP", sans-serif` (body).

**Type scale:** `--text-xs` 11px, `--text-sm` 13px, `--text-base` 15px, `--text-lg` 17px, `--text-xl` 20px, `--text-2xl` 22px, `--text-3xl` 28px, `--text-4xl` 34px, `--text-5xl` 40px.

**Colors:** `--color-primary` #fbb931, `--color-text-primary` #1e1f20, `--color-text-secondary` #4a4b4d, `--color-text-tertiary` #6e7073, `--color-bg-primary` #ffffff, `--color-bg-secondary` #f5f5f7, `--color-bg-tertiary` #e8e8ed, `--color-info` #007aff, `--color-error` #ff3b30, `--color-success` #34c759.

**Spacing (8pt grid):** `--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px, `--space-5` 20px, `--space-6` 24px, `--space-8` 32px, `--space-10` 40px, `--space-12` 48px.

**Radius:** `--radius-small` 4px, `--radius-medium` 8px, `--radius-large` 12px, `--radius-xlarge` 16px, `--radius-full` 9999px.

**Shadows:** `--shadow-subtle`, `--shadow-medium`, `--shadow-large`, `--shadow-xlarge`, `--shadow-inset`.

**Timing:** `--duration-fast` 150ms, `--duration-normal` 250ms, `--duration-slow` 350ms, `--duration-slower` 500ms, `--duration-scene` 1500ms.

**Z-index layers:** map 0, controls 10, markers 20, transition-overlay 50, chatbox 100, panel 200, control-bar 300, UI overlays 500, modals 1000, tooltips 1100, quick-look 2000.

For full CSS definitions and detailed values, see `docs/design-tokens.md`.

---

## Detailed Specs (Separate Files)

| File | Contents |
|------|----------|
| `docs/design-tokens.md` | Full CSS custom properties: typography, colors, spacing, radius, shadows, elevation |
| `docs/components.md` | All component specs: buttons, panels, chatbox, AI chat, gallery, legend, data layers, FAB, modals, charts, dashboard |
| `docs/motion.md` | Animation keyframes, timing tokens, heartbeat, camera choreography, narrative timing |
| `docs/interaction-patterns.md` | Touch targets, focus management, hover states, cursors, ARIA patterns, accessibility |
| `docs/checklist.md` | Implementation QA checklist for all component types |

---

## Map outlines and polygons

When adding a new map area, zone boundary, or polygon overlay, use the existing skills rather than manually writing coordinates:

1. **`@trace-outline`** - guides the user through drawing the shape in Google My Maps and exporting it as KML.
2. **`@smooth-outline`** - runs Chaikin's corner-cutting algorithm on the exported KML to produce smooth coordinates ready for `js/data.js`.

The smoothing script lives at `~/.claude/skills/smooth-outline/smooth-polygon.py`. KML files go in `assets/map-outlines/`.

---

## File Structure

```
map-prototype/
├── index.html              # Main entry point
├── css/
│   └── styles.css          # All CSS (single file)
├── js/
│   ├── app.js              # Main app logic & state machine
│   ├── map-controller.js   # Mapbox GL JS setup, markers, layers, 3D camera
│   ├── data.js             # All mock data
│   └── ui.js               # Panel, chatbox, gallery, charts, draggable
├── assets/
│   ├── placeholders/       # Placeholder images
│   ├── Assets1.webp        # Brand logo (dark)
│   ├── Assets2.webp        # Brand logo (alt)
│   ├── Assets3.svg         # Brand mark (SVG)
│   ├── Assets4.svg         # Brand mark (variant)
│   └── Assets4-white.svg   # Brand mark (white)
├── docs/
│   ├── design-tokens.md    # Full CSS token definitions
│   ├── components.md       # Component specifications
│   ├── motion.md           # Animation & timing specs
│   ├── interaction-patterns.md  # Interaction & accessibility
│   ├── checklist.md        # QA checklist
│   ├── BEATSHEET.md        # Narrative beat sheet
│   ├── Map prototype spec.md   # App specification
│   └── plans/              # Design documents and plans
├── feedback/               # User research
├── CLAUDE.md               # This file (design system rules)
└── package.json            # Dependencies
```

---

*Last updated: March 5, 2026*
*Based on macOS Human Interface Guidelines with project-specific customizations*
