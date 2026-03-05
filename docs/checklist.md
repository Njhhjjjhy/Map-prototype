# Implementation Checklist

QA verification checklist for all components.

---

## Before Each Component

- [ ] Typography uses correct font family (Display vs Body)
- [ ] Text case follows rules (Title Case vs Sentence case)
- [ ] No uppercase text anywhere
- [ ] All text left-aligned
- [ ] Font sizes use rem units from scale

## For Every Interactive Element

- [ ] Default, hover, focus-visible, active/pressed, and disabled states styled
- [ ] Meets 44x44px minimum touch target
- [ ] Cursor: pointer applied

## For Every Button

- [ ] Uses `--color-primary` fill (#fbb931) and `--color-text-on-primary` text (#1e1f20)
- [ ] All four states styled (hover, focus, disabled, pressed)
- [ ] Icon gap is 8px if icon present
- [ ] Title Case label text

## Accessibility Audit

- [ ] Color contrast passes 4.5:1 / 3:1
- [ ] Focus indicators visible
- [ ] `prefers-reduced-motion` respected
- [ ] ARIA labels on icon-only buttons
- [ ] Semantic heading hierarchy
- [ ] Skip link present

## Spacing Verification

- [ ] All values derive from 8pt scale
- [ ] Internal spacing <= external spacing
- [ ] Consistent gaps between similar elements

## Map Legend

- [ ] Always shows core items: Base Map, Science Park, Corporate Sites, Real Estate
- [ ] Journey-specific items added below core items
- [ ] Development Zone hidden in Present view (Journey B)
- [ ] All icons use Lucide icons matching Data Layers panel
- [ ] Legend positioned bottom-right, doesn't overlap chatbox

## Data Layers Panel

- [ ] Toggle button always visible (never hidden)
- [ ] Panel closes when journey changes (button stays visible)
- [ ] Checkboxes use `--radius-small` (4px) on 16px boxes (macOS HIG)
- [ ] All layers start inactive (unchecked) by default
- [ ] Multiple layers can be selected simultaneously

## Floating Action Button (Chat FAB)

- [ ] Appears when chatbox or AI chat is closed
- [ ] Hidden when chatbox or AI chat is open
- [ ] Reopens correct chat type (last closed)
- [ ] 56x56px size, brand-colored with proper hover/active states

## AI Chat

- [ ] Header margin-top: `--space-4` (16px)
- [ ] Suggestions/messages margin-top: `--space-6` (24px)
- [ ] Suggestions hide after first message sent
- [ ] CTAs hidden in Dashboard mode, visible only post-journey

## All Modals

- [ ] Header: flexbox, space-between, gap 8px between title and close
- [ ] Close button: flex-shrink: 0
- [ ] Items in `.chatbox-options` container with `gap: var(--space-4)`
- [ ] CTA spacing: `margin-top: var(--space-6)` from last item
- [ ] No inline `style="margin-top"` on individual items
- [ ] Dynamically created overlays clean up existing instances first

## Evidence Library

- [ ] Disclosure groups expand/collapse on header click
- [ ] Chevron rotates 90deg when expanded
- [ ] Items with coordinates show blue location indicator dot
- [ ] Bidirectional sync: item click highlights marker, marker click opens item
- [ ] "Back to List" clears marker highlights

## Infrastructure Roads

- [ ] Teal dashed polylines, hover increases stroke (5px to 7px)
- [ ] Single selection only (dashed to solid on select)
- [ ] Panel shows headline metric, stats grid, source button
- [ ] Roads fade in over 300ms when B7 activates

## Panel Toggle / Dashboard Toggle

- [ ] Both 36x36px with 44px touch target
- [ ] Active state uses brand yellow background
- [ ] `backdrop-filter: blur(20px) saturate(180%)`

## Property Quick Look

- [ ] Full-screen at z-index 2000
- [ ] `quickLookZoomIn` entrance animation
- [ ] Dismissible via click, Escape, or close button

## Charts

- [ ] Every chart has companion accessible data table in `<details>`
- [ ] Colorblind-safe palettes
- [ ] Canvas instances tracked in `UI.charts`
