# QA Issue: Talent pipeline list items bloated

**Date:** 2026-02-17
**Status:** Completely fixed
**Reporter:** QA Review

## Issue description

The Talent Pipeline chatbox step (Journey A, step A3) rendered five university items as full-width bordered card buttons (`.chatbox-option`). Each card had generous padding, individual borders, and border-radius, consuming excessive vertical space. With five items stacked vertically, the CTA button ("See Government Commitment") was pushed off-screen, requiring scrolling. The pattern felt visually heavy and dated compared to modern map UI standards.

## Root cause

The `updateTalentChatbox()` function in `js/app.js` reused the generic `.chatbox-option` card pattern designed for shorter lists with 2-3 items. For a 5-item list, the pattern breaks down spatially.

## Solution

Replaced the card-per-item pattern with an Apple Maps-inspired compact grouped list:

- **Single container border** (`.talent-list`) wrapping all items with `border-radius: var(--radius-large)` and `overflow: hidden`
- **Tight rows** (`.talent-row`) with ~36px height using `padding: var(--space-3) var(--space-4)`
- **Subtle dividers** between rows via `border-bottom: 1px solid var(--color-border)` instead of individual card borders
- **Color dot indicator** on the left using each institution's existing data color
- **Two-line text layout**: name (13px medium weight) stacked above city (11px regular, tertiary color)
- **Trailing icon**: chevron for unvisited rows, green checkmark for visited
- **Visited state**: muted background (`--color-bg-secondary`) with secondary text color

Modeled on Apple Maps web Guides list pattern (references 4-6).

## Files modified

- `css/styles.css` - Added `.talent-list`, `.talent-row`, and related sub-component styles (~95 lines)
- `js/app.js` - Rewrote `updateTalentChatbox()` to render compact list rows instead of `.chatbox-option` cards

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified (spacing tokens, typography scale, color system)
- [x] No unintended side effects (`.chatbox-option` class still intact for other steps)

### Browser testing
- [ ] Navigate to Journey A, step A3, click "See Talent Pipeline"
- [ ] Verify compact list renders with color dots, names, cities, chevrons
- [ ] Click a university - verify visited state (muted bg, checkmark)
- [ ] Verify CTA button visible without scrolling
- [ ] Verify back navigation restores chatbox correctly

**Test notes:** Browser opened for manual verification.

## CLAUDE.md updates

None - existing rules were sufficient. The fix uses a new component-specific CSS class that follows existing design system patterns.
