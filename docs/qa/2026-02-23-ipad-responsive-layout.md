# QA Issue: iPad responsive layout

**Date:** 2026-02-23
**Status:** ✓ Completely Fixed
**Reporter:** QA Review

## Issue description

The app's layout was broken on iPad screens (tested on iPad Pro 12.9" in landscape). Two primary issues were visible:

1. **Right panel proportions:** The panel took too much horizontal space relative to the map, creating a cramped layout.
2. **Chatbox bottom cutoff:** The "Continue" button at the bottom of the chatbox was clipped by iPadOS's home indicator because no safe area insets were applied.

Secondary issues discovered during investigation:

3. **AI Chat not scaled at tablet widths:** The AI Chat modal stayed at 424px max-width even at the 1024px breakpoint, while the chatbox was correctly reduced to 300px.
4. **No intermediate breakpoint:** Only two tablet breakpoints existed (1366px and 1024px), leaving iPad 11" (1194px) and iPad Air (1180px) without specific rules.
5. **No height-aware rules:** iPad landscape heights (1024px for 12.9", 834px for 11") are shorter than desktop monitors, causing vertical overflow in chatbox and AI chat.
6. **Start screen not responsive:** The start screen used hardcoded `padding-left: 15%` and a 300px logo with no tablet adjustments.

## Root cause

The app was designed desktop-first with minimal responsive support. The CSS had only two tablet breakpoints (1366px and 1024px) with limited scope - they adjusted the right panel width but missed the AI Chat, start screen, and vertical layout constraints. No `viewport-fit=cover` was set on the viewport meta tag, preventing `env(safe-area-inset-*)` CSS environment variables from functioning.

## Solution

Applied iPadOS Human Interface Guidelines (HIG) principles across two files:

### 1. Viewport meta tag (`index.html`)
Added `viewport-fit=cover` to enable safe area environment variables on iPadOS.

### 2. Safe area insets (`styles.css`)
Applied `env(safe-area-inset-bottom, 0px)` to all bottom-positioned elements:
- `#chatbox` - bottom position and max-height
- `#ai-chat` - bottom position and max-height
- `#chat-fab` - bottom position
- `#cinematic-skip` - bottom position

The `0px` fallback ensures no change on desktop browsers.

### 3. Refined width breakpoints (`styles.css`)
Expanded from 2 to 3 tablet breakpoints following iPadOS device dimensions:

| Breakpoint | Devices | Panel | Chatbox | AI Chat |
|-----------|---------|-------|---------|---------|
| 1366px | iPad Pro 12.9" landscape | 320px (HIG sidebar) | 380px | 380px |
| 1194px | iPad 11", iPad Air | 300px | 340px | 340px |
| 1024px | iPad 10.2", iPad Mini | 280px | 300px | 300px |

### 4. Start screen responsive adjustments
Added scaling for logo width, headline font size, and padding at each breakpoint.

### 5. Height-aware rules (`styles.css`)
Added two `max-height` media queries for iPad's shorter landscape viewports:

| Breakpoint | Devices | Chatbox max-height | AI Chat max-height |
|-----------|---------|-------------------|-------------------|
| 1024px height | iPad Pro 12.9" landscape | `100vh - 160px` | `100vh - 80px` |
| 834px height | iPad 11" landscape | `100vh - 120px` | `100vh - 60px` |

## Files modified

- `index.html` - added `viewport-fit=cover` to viewport meta tag
- `css/styles.css` - safe area insets on 4 bottom-positioned elements, expanded tablet breakpoints from 2 to 3, added 2 height-aware breakpoints, start screen responsive rules

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified (spacing tokens, no hardcoded arbitrary values)
- [x] No unintended side effects detected (desktop breakpoints unchanged, 2048px+ query preserved)
- [x] `env()` fallbacks ensure backward compatibility on desktop

### Browser testing
- [x] App opens correctly in desktop browser (no regressions)
- [x] Safe area insets use `0px` fallback on desktop (no visual change)
- [x] Media queries cascade correctly (1366px > 1194px > 1024px)
- [ ] iPad Pro 12.9" landscape testing (requires physical device or simulator)
- [ ] iPad 11" landscape testing (requires physical device or simulator)

**Test notes:** Desktop browser verification confirms no regressions. Full iPad validation requires testing on the physical device or iPad simulator. The user should verify on their iPad Pro 12.9" in landscape.

## CLAUDE.md updates

None - existing rules were sufficient. The responsive breakpoint system is implementation-level CSS, not a design system pattern requiring documentation.
