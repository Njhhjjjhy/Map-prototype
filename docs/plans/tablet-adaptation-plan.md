# Tablet adaptation plan

iPad-first responsive adaptation for the map prototype. Desktop experience is completely unchanged. Tablet support is layered on top using iPadOS Human Interface Guidelines and Apple Maps as the primary design reference.

---

## Design reference: Apple Maps on iPad

The Apple Maps iPad layout is the guiding pattern for this adaptation. Key characteristics:

### Left panel sheet

- A persistent left-anchored sheet holds all content (search, place cards, directions, details).
- The sheet has a fixed width (~380pt in landscape, ~320pt in portrait on smaller iPads).
- The map fills the remaining viewport to the right of the sheet.
- The sheet has rounded corners (top-right and bottom-right) and a subtle shadow separating it from the map.
- The sheet scrolls internally. The map never scrolls.

### Sheet states

- **Expanded:** Full height, showing complete content with internal scroll.
- **Compact:** Shorter height, showing summary/header content only. Map gets more space.
- **Dismissed:** Sheet slides fully off-screen to the left. Map fills the entire viewport. A button or gesture brings it back.

### Sheet behavior

- The sheet does not float. It is anchored to the left edge and respects safe areas.
- In portrait on smaller iPads (mini, base), the sheet becomes a bottom sheet instead of a left panel, because there is not enough horizontal space for both.
- Content transitions happen inside the sheet (push/pop navigation), not as separate modals.
- The sheet never overlaps the map controls (zoom, compass, location). Those stay on the map side.

### Interaction model

- Swipe left on the sheet to dismiss. Swipe right from the left edge (or tap a button) to restore.
- Sheet drag handle at the top allows vertical resize between expanded and compact states.
- Tapping a map marker populates the sheet with that marker's content (sheet opens if dismissed).
- The map remains fully interactive at all times, even when the sheet is expanded.

---

## Target devices and breakpoints

### iPad viewport matrix

| Device | Screen | Landscape | Portrait | Pixel ratio |
|--------|--------|-----------|----------|-------------|
| iPad mini (6th gen) | 8.3" | 1133 x 744 | 744 x 1133 | 2x |
| iPad (10th gen) | 10.9" | 1180 x 820 | 820 x 1180 | 2x |
| iPad Air (M2) | 11" | 1180 x 820 | 820 x 1180 | 2x |
| iPad Pro 11" | 11" | 1194 x 834 | 834 x 1194 | 2x |
| iPad Pro 13" | 12.9" | 1366 x 1024 | 1024 x 1366 | 2x |

### Proposed breakpoints

| Name | Range | Targets | Layout mode |
|------|-------|---------|-------------|
| Tablet portrait small | 744px - 834px width | iPad mini, base iPad in portrait | Bottom sheet (not enough horizontal space for left panel) |
| Tablet portrait large | 834px - 1024px width | iPad Air, Pro 11" in portrait | Left panel sheet |
| Tablet landscape | 1024px - 1366px width | All iPads in landscape | Left panel sheet + right panel |

Above 1366px: desktop layout, completely unchanged.

### Orientation handling

- **Landscape** on all iPads: left panel sheet for chatbox, right panel for dashboard. Map fills the middle.
- **Portrait** on larger iPads (Air, Pro): left panel sheet, right panel converts to bottom sheet.
- **Portrait** on smaller iPads (mini, base): both chatbox and dashboard become bottom sheets (stacked or tabbed).

### Multitasking exclusion

iPadOS Split View and Slide Over create viewports as narrow as 320px. This is a presentation tool. Do not support split modes. Show a "use full screen for the best experience" message below 700px viewport width.

---

## Layout strategy

### Principle: adaptive, not fluid

The layout snaps to device-appropriate configurations rather than fluidly scaling. Three distinct modes:

1. **Desktop** (width > 1366px): Current layout. Zero changes.
2. **Tablet landscape** (1024px - 1366px): Left panel sheet (chatbox) + right panel (dashboard) + map center.
3. **Tablet portrait** (744px - 1024px): Left panel sheet or bottom sheet depending on available width + bottom sheet dashboard.

### Presenter context

The iPad serves two roles:

- **Handheld:** Presenter holds the iPad and taps through the presentation. Needs large touch targets, one-handed reachability.
- **External display controller:** iPad is connected to a projector/screen via AirPlay or cable. Presenter uses the iPad as a controller while the audience sees the map on the big screen. Needs clear, confident tap targets. The panel layout still applies because the presenter needs to see content while controlling the flow.

Both roles are served by the same layout. The left panel sheet pattern works for both because it keeps controls accessible while leaving the map visible.

---

## Component adaptation plan

### The chatbox: floating modal to left panel sheet (tablet only)

This is the largest single change. On desktop, the chatbox remains a centered floating modal. On tablet, it becomes a left-anchored panel sheet following the Apple Maps pattern.

#### Tablet landscape layout

- **Position:** Fixed left edge, full viewport height minus top/bottom safe areas.
- **Width:** 360px on iPad Pro 13", 320px on smaller iPads. Use `clamp(300px, 30vw, 380px)`.
- **Border radius:** 0 on left edge, `--radius-xlarge` (16px) on top-right and bottom-right.
- **Shadow:** `--shadow-large` on the right edge to separate from map.
- **Background:** `--color-bg-primary` with slight blur backdrop on the map edge.
- **Internal layout:** Scrollable content area with sticky header (back button, step title).
- **Map offset:** The map container gets `padding-left` equal to the sheet width so the map center point shifts right, keeping the map properly framed.

#### Tablet portrait layout (large iPads, 834px+)

- Same left panel sheet but narrower: `clamp(280px, 35vw, 340px)`.
- Max-height: full viewport height minus safe areas.
- Map offset applies the same way.

#### Tablet portrait layout (small iPads, <834px)

- Sheet converts to a **bottom sheet** instead of left panel (insufficient horizontal space).
- Full width, anchored to bottom.
- Three snap points: collapsed (~100px, header only), half (50vh), expanded (85vh).
- Map fills full viewport, sheet overlays from below.
- Drag handle bar at top of sheet for vertical gesture control.

#### Sheet states and transitions

| State | Sheet position | Map behavior | Trigger |
|-------|---------------|--------------|---------|
| Expanded | Full height, full width (left panel) | Offset left by sheet width | Content loaded, tap on sheet |
| Compact | Reduced height, header + summary visible | Offset left by sheet width | Drag down, scroll to top |
| Dismissed | Off-screen left (translateX(-100%)) | Full viewport, no offset | Swipe left, explicit close |
| Restored | Slides in from left | Re-offsets | Swipe from left edge, FAB tap, marker tap |

#### Content mapping

All existing chatbox content renders inside the sheet. The internal navigation (back button, history stack) works identically. Content types that currently appear in the chatbox:

- Step introduction text and options.
- Sub-step detail content.
- Chatbox option buttons (selection lists).
- Evidence disclosure groups.

All of these render inside the sheet's scrollable content area. No structural changes to the content itself, only its container.

#### FAB behavior on tablet

- When the sheet is **expanded or compact**, the FAB is hidden (the sheet is already visible).
- When the sheet is **dismissed**, the FAB appears at bottom-left (not center) to indicate "tap to open sheet."
- FAB position: `bottom: calc(var(--space-8) + env(safe-area-inset-bottom))`, `left: var(--space-6)`.

---

### Right panel (dashboard)

#### Tablet landscape

- Keep current right-side fixed panel.
- Width: `clamp(280px, 28vw, 360px)` (slightly narrower than desktop to share space with left sheet).
- Map sits between the left sheet and right panel.
- Panel toggle button remains top-right of the map area (not the viewport).

#### Tablet portrait (large iPads)

- Convert to bottom sheet (same pattern as small-iPad chatbox sheet).
- Full width, three snap points.
- Sits below the map. The left chatbox sheet still occupies the left edge.
- Tab bar at bottom sheet top allows switching between dashboard sections.

#### Tablet portrait (small iPads)

- Bottom sheet, shared with chatbox via a tab/segment control.
- Two tabs: "Content" (chatbox) and "Dashboard" (panel).
- Only one is visible at a time. Swiping between tabs switches content.
- This prevents two overlapping bottom sheets.

---

### AI chat

#### Tablet landscape and portrait

- AI chat renders inside the left panel sheet, replacing chatbox content (push navigation).
- Back button returns to the previous chatbox content.
- No separate floating modal.

#### Keyboard avoidance

- When the software keyboard appears, the AI chat input and message list reposition above the keyboard.
- Use `visualViewport` API to detect keyboard height:
  ```
  window.visualViewport.addEventListener('resize', adjustForKeyboard)
  ```
- The sheet content area shrinks to `visualViewport.height` minus header height.
- The input field stays pinned to the bottom of the visible area (above keyboard).
- Messages list scrolls to show the latest message.

---

### Map controls positioning (tablet)

With the left sheet present, map-anchored controls must avoid overlapping the sheet.

| Control | Desktop position | Tablet position |
|---------|-----------------|-----------------|
| Progress bar | Top center of viewport | Top center of **map area** (offset right by half sheet width) |
| Time toggle | Top left | Top left **of map area** (to the right of the sheet) |
| Layers toggle | Left side | Left side **of map area** (to the right of the sheet) |
| Data layers panel | Left side | Left side **of map area** |
| Panel toggle | Top right | Top right of map area |
| Compass / zoom (Mapbox) | Default Mapbox position | Offset to stay within map area |

The key principle: all controls that were relative to the viewport are now relative to the **map area** (the space between the left sheet and right panel).

---

### Gallery modal

#### Tablet portrait

- `width: calc(100vw - var(--space-6) * 2)`
- `height: calc(100vh - var(--space-12))`
- Close button: 44x44px touch target.
- Navigation arrows: 48x48px.

#### Tablet landscape

- Current dimensions work. Touch target increases only.

---

### Transition overlay (property drill-down)

- Navigation buttons increase to 48x48px.
- Label text increases by one step.
- No layout changes since it fills the map container (which is already offset by the sheet).

---

### Evidence preview

- `max-width: calc(100vw - var(--space-8))` in portrait.
- Close button: 44x44px.

---

## Touch interactions

### Pointer Events migration

Replace all mouse-only event handling with Pointer Events API. This covers mouse, touch, and Apple Pencil with one code path.

| Current | Replacement |
|---------|-------------|
| `mousedown` | `pointerdown` |
| `mousemove` | `pointermove` |
| `mouseup` | `pointerup` |

Affected files:
- `js/ui/core.js` - `makeDraggable()` (desktop only after this change, since tablet uses the sheet pattern).
- `js/ui/inspector.js` - panel resize handle (landscape tablet only).

Add `touch-action: none` on drag handles. Add `element.setPointerCapture(e.pointerId)` for reliable tracking.

### Sheet gesture handling (new)

For the left panel sheet and bottom sheet patterns:

**Left panel sheet (horizontal gestures):**
- Swipe left on sheet to dismiss (sheet slides off-screen left).
- Swipe right from left edge to restore (iOS system edge gesture pattern).
- Velocity threshold: > 0.5px/ms triggers dismiss/restore.
- Distance threshold: > 80px movement.

**Bottom sheet (vertical gestures):**
- Drag handle at top of sheet for vertical movement.
- Snap to collapsed/half/expanded based on velocity and position.
- Velocity threshold: > 0.5px/ms triggers snap.
- Distance threshold: > 50px movement.
- Use `will-change: transform` and `translateY()` for 60fps animation.

### Map touch

Mapbox GL JS natively supports touch gestures. Two additions:

- Enable `touchPitch` explicitly (currently only `touchZoomRotate` is enabled).
- Verify `.custom-marker-hitarea` elements meet 44x44px minimum. Increase `::before { inset: -8px }` to `inset: -12px` if needed.

### Apple Pencil hover

iPadOS 16.1+ supports Pencil hover, which triggers CSS `:hover` states. This is beneficial for:

- Map marker hover effects (scale, tooltip preview).
- Button hover state feedback.
- Row/item highlight on hover.

No code changes needed. CSS `:hover` rules already exist and will activate with Pencil hover automatically. Ensure no hover state hides critical information (it should only enhance, never gate).

### Hover media query guards

Wrap any hover-only information reveals (if any exist) in `@media (hover: hover)` so finger-touch users are not disadvantaged. All functional interactions already use click/tap.

### Window resize and orientation change

Add a handler (currently missing entirely from the codebase):

- Call `MapController.map.resize()` on viewport change.
- Detect orientation and viewport size.
- Switch between left-panel and bottom-sheet modes.
- Reposition dragged modals (desktop) back to defaults.
- Update sheet widths and snap points.
- Recalculate map offset (`padding-left`).

---

## Touch target audit

Every interactive element needs 44pt minimum touch target per Apple HIG.

| Element | Current size | Required change |
|---------|-------------|-----------------|
| Progress bar segments | 20x4px visible | 44x44px hit area via padding/pseudo |
| Close buttons (various) | 32-36px | Expand hit area to 44px |
| Back buttons | 36px | Expand hit area to 44px |
| Layers toggle | 36x36px | Expand to 44x44px |
| Panel toggle | 36x36px | Expand to 44x44px |
| Chatbox option buttons | ~40px tall | Min-height 44px |
| Disclosure group headers | Variable | Min-height 44px |
| Inspector tab buttons | Variable | Min-height 44px |
| Gallery nav arrows | 40x40px | Expand to 48x48px |
| Transition overlay nav | 40x40px | Expand to 48x48px |
| FAB | 56px | Fine (exceeds 44pt) |

Use the existing `::before { inset: -Npx }` pattern for expanding hit areas without changing visual size.

---

## Typography and spacing

The existing type scale and 8pt spacing grid work well on iPad. No changes to tokens.

Two adjustments:
- In sheet content areas, enforce `--text-base` (15px) minimum for body text (no `--text-xs` or `--text-sm` for readable content).
- Chart labels inside the dashboard panel: `--text-sm` (13px) minimum. Some currently use `--text-xs` (11px) which is hard to read at arm's length.

---

## Safe areas

Extend safe area inset handling to all four edges. Currently only `env(safe-area-inset-bottom)` is used.

- Left sheet: respect `env(safe-area-inset-left)` for internal padding.
- Right panel: respect `env(safe-area-inset-right)`.
- Top controls: respect `env(safe-area-inset-top)`.
- Bottom sheet/FAB: already uses bottom inset, keep as-is.

---

## Implementation order

| Order | Scope | Effort | Dependencies |
|-------|-------|--------|--------------|
| 1 | Safe areas and viewport meta | Small | None |
| 2 | Touch target sizing (CSS only) | Small | None |
| 3 | Pointer Events migration | Medium | None |
| 4 | Hover media query guards | Small | None |
| 5 | Resize/orientation handler | Medium | None |
| 6 | Left panel sheet - CSS structure | Large | 1 |
| 7 | Left panel sheet - JS gestures | Large | 3, 6 |
| 8 | Map area offset and controls repositioning | Medium | 6 |
| 9 | Chatbox content rendering inside sheet | Medium | 6 |
| 10 | AI chat inside sheet + keyboard avoidance | Medium | 9 |
| 11 | Right panel bottom sheet (portrait) | Large | 6 |
| 12 | Small iPad bottom sheet fallback | Medium | 11 |
| 13 | Map touch adjustments | Small | None |
| 14 | Gallery and overlay touch targets | Small | 2 |
| 15 | Typography adjustments | Small | 6 |
| 16 | FAB behavior tied to sheet state | Small | 7 |

---

## What stays the same (no changes)

- Desktop layout (above 1366px width): zero changes to any component.
- Desktop chatbox: remains a centered floating modal.
- State machine and step navigation logic.
- Map camera choreography and animation timing.
- Data model and content structure.
- Chart rendering (Chart.js is touch-aware natively).
- Color system, typography scale, spacing tokens.
- All component visual design (only container and positioning adapt).
- Dark mode: still not supported.

## What is out of scope

- **Mobile phone support.** Phones are too small for this map-heavy presentation.
- **iPadOS multitasking split modes.** Presentation tool, not a utility app.
- **Mapbox touch overhaul.** Mapbox has solid built-in touch support.
- **Complete CSS rewrite.** This is additive. New media queries layer on top.
- **Framework migration.** Vanilla JS is fine. Pointer Events and visualViewport APIs are native.

---

## iPadOS HIG alignment

| Guideline | Covered by |
|-----------|------------|
| 44pt minimum touch targets | Touch target audit |
| Safe area respect (all edges) | Safe areas section |
| Landscape and portrait support | Layout strategy |
| Pointer Events (mouse + touch + pencil) | Pointer Events migration |
| Apple Pencil hover support | Hover section (CSS :hover works natively) |
| `@media (hover: hover)` guards | Hover media query guards |
| Left panel sheet (Apple Maps pattern) | Chatbox redesign |
| Bottom sheet for secondary content | Right panel portrait |
| Smooth gesture-driven transitions | Sheet gesture handling |
| No reliance on right-click | Map touch adjustments |
| Readable text at arm's length | Typography adjustments |
| Keyboard avoidance for inputs | AI chat keyboard handling |

---

*Plan created: March 6, 2026*
