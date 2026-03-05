# Interaction Patterns & Accessibility

Touch targets, focus management, hover states, cursor conventions, and ARIA patterns.

---

## Touch & Click Targets

All interactive elements must meet minimum target sizes (HIG + WCAG):

- **Minimum:** 44x44px
- **Recommended:** 48x48px
- Expand small icons with `::before { inset: -8px }` pseudo-element if needed

---

## Focus Management

```css
:focus { outline: none; }
:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}
.card:focus-within {
  box-shadow: 0 0 0 3px var(--color-info);
}
```

---

## Hover States

All interactive elements must provide visual hover feedback with transitions:

```css
.interactive {
  transition:
    background-color var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard),
    transform var(--duration-fast) var(--easing-standard);
}
```

---

## Cursor States

| State | Cursor | Applies to |
|-------|--------|-----------|
| Clickable | `pointer` | buttons, links, `[role="button"]` |
| Disabled | `not-allowed` | `:disabled`, `[aria-disabled="true"]` |
| Draggable | `grab` / `grabbing` | Draggable modals |
| Map pan | `move` | Map interactions |

---

## Accessibility (WCAG 2.1 AA)

### Minimum Requirements

1. **Color Contrast** - 4.5:1 for text, 3:1 for UI components
2. **Touch Targets** - Minimum 44x44px
3. **Focus Indicators** - Visible focus rings for keyboard navigation
4. **Motion** - Respect `prefers-reduced-motion`
5. **Text Scaling** - Support up to 200% zoom
6. **Semantic HTML** - Proper heading hierarchy, landmarks, ARIA where needed

### ARIA Patterns

```html
<!-- Button -->
<button type="button" aria-label="Start the journey">Start the Journey</button>

<!-- Icon-only button -->
<button type="button" aria-label="Close panel">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Toggle button -->
<button type="button" aria-pressed="false" aria-label="Toggle future view">Future</button>

<!-- Panel -->
<aside role="complementary" aria-label="Property details" aria-hidden="false">...</aside>

<!-- Map region -->
<div role="application" aria-label="Interactive map of Kumamoto investment areas" tabindex="0">...</div>
```

### Screen Reader Support

```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

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
.skip-link:focus { top: var(--space-4); }
```
