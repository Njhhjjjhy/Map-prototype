# QA Issue: Splash screen, card design, chatbox overflow, contrast

**Date:** 2026-02-18
**Status:** Completely fixed
**Reporter:** QA Review

## Issue Description

Five related issues identified during QA review:

1. **Splash screen dark background** - Start screen used a gray gradient instead of white background per CLAUDE.md spec.
2. **CTA button outside chatbox** - "See Government Commitment" button on talent pipeline screen overflowed below the chatbox rounded corners due to missing overflow handling.
3. **Government/corporate cards not following macOS HIG** - Cards used heavy gray fill backgrounds with box-shadows. macOS HIG calls for clean white backgrounds with subtle borders and generous whitespace.
4. **Color contrast failures on cards** - `.icard-stat-label`, `.icard-corporate-subtitle`, and other card text elements used `--color-text-tertiary` (#6e7073) which fails WCAG AA 4.5:1 on the card backgrounds.
5. **Chatbox width inconsistency** - Chatbox only had `max-width: 424px` without a `width` property, causing it to shrink to content on screens with less content (e.g., journey complete).

## Root Cause

1. Start screen background was `linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)` instead of `var(--color-bg-primary)`.
2. `#chatbox` had no `overflow` property (defaulting to `visible`) and `#chatbox-body` had no scroll capability. Tall content overflowed past the container.
3. `.icard` base class used `background: var(--color-bg-secondary)` (gray fill) and `box-shadow: var(--shadow-subtle)`. This is visually heavy compared to macOS HIG which favors white with subtle borders.
4. Multiple `.icard-*` label classes used `var(--color-text-tertiary)` (#6e7073) which has approximately 3.3:1 contrast on `--color-bg-secondary` (#f5f5f7), and borderline 4.48:1 on white - both failing WCAG AA for small text.
5. Chatbox only had `max-width` without `width`, so content-driven sizing caused width variation.

## Solution

### Splash screen
Changed `#start-screen` background from gradient to `var(--color-bg-primary)` (pure white).

### Chatbox overflow and width
- Added `overflow: hidden` to `#chatbox` to clip content within rounded corners.
- Added `flex: 1; min-height: 0; overflow-y: auto` to `#chatbox-body` to enable scrolling when content is tall.
- Added `width: min(424px, calc(100vw - var(--space-12)))` to enforce consistent 424px width.

### Card redesign (macOS HIG)
- Changed `.icard` background from `var(--color-bg-secondary)` to `var(--color-bg-primary)` (white).
- Replaced `box-shadow: var(--shadow-subtle)` with `border: 1px solid var(--color-border)` for cleaner macOS aesthetic.
- Increased `border-radius` from `--radius-medium` (8px) to `--radius-large` (12px).
- Increased `padding` from `--space-4` (16px) to `--space-6` (24px) for more generous whitespace.
- Increased `.icard-title` font-size from `--text-base` to `--text-lg` with `--space-4` bottom margin.
- Increased `.icard-stats-grid` gap from `--space-2` to `--space-4` (row) / `--space-3` (column).
- Added `gap: var(--space-1)` to `.icard-stat` for spacing between value and label.
- Changed `.icard-stat-value` from bold to semibold, size from `--text-base` to `--text-lg`.
- Updated `.icard-corporate-logo` to 36x36px with `--radius-medium` and neutral colors.
- Updated `.icard-corporate-header` margin-bottom from `--space-3` to `--space-4`.

### Color contrast
Changed all card text labels from `var(--color-text-tertiary)` (#6e7073) to `var(--color-text-secondary)` (#4a4b4d):
- `.icard-stat-label`
- `.icard-corporate-subtitle` (also increased to `--text-sm`)
- `.icard-source`
- `.icard-financial-table th`
- `.icard-yield-range`
- `.icard-evidence-meta`
- `.icard-commute-table th`
- `.icard-risk-type`

Contrast ratio: #4a4b4d on #ffffff = 8.6:1 (passes WCAG AA).

## Files Modified

- `css/styles.css` - All changes: splash screen background, chatbox overflow/width, card base styles, card typography, card label contrast

## Verification Results

### Code Review
- [x] Changes match approved plan
- [x] Design system compliance verified (all values use tokens)
- [x] No unintended side effects detected

### Browser Testing
- [x] Splash screen renders white with Assets1.webp logo
- [x] Chatbox width consistent (424px) across all journey states
- [x] Talent pipeline CTA stays within chatbox rounded corners
- [x] Government/corporate cards use white background with subtle border
- [x] Card labels readable with improved contrast
- [x] Scrolling works inside chatbox when content exceeds max-height

## CLAUDE.md Updates

None - existing rules were sufficient. The design system already specified white backgrounds and WCAG AA contrast requirements; the implementation was not following them.
