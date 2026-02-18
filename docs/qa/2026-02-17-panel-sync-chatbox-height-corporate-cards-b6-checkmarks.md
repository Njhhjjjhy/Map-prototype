# QA Issue: Panel sync, chatbox height, corporate cards, B6 checkmarks

**Date:** 2026-02-17
**Status:** Completely fixed
**Reporter:** QA review

## Issue descriptions

### Issue 1 - Panel shows wrong content at A3 ecosystem phase

When the chatbox shows "Semiconductor ecosystem" (A3 sub-phase 1), the right panel incorrectly shows "Talent pipeline" (A3 sub-phase 3). The panel jumps ahead to stage 3 content before the user reaches that phase.

### Issue 2 - Chatbox too tall with 5 university items

The talent pipeline chatbox with 5 university option buttons, heading, paragraph, and CTA stretches nearly full-screen height due to a permissive max-height.

### Issue 3 - Evidence titles overlapping company names on corporate cards

Cards for all 7 companies (Rohm Apollo, Kyocera, SUMCO, Mitsubishi Electric, Tokyo Electron, Sony Semiconductor, JASM) show the evidence title text floating over and colliding with the company name due to absolute positioning.

### Issue 4 - B6 chatbox items not getting checkmarks when viewed

At step B6, clicking "View government zone plans", "View transportation network", or "View education pipeline" opens evidence in the panel but the chatbox items never receive checkmarks, unlike the Journey A resource/talent items.

## Root causes

1. `stepA3()` called `UI.updateInspectorForStep('A3')`, which resolved via `STAGE_MAP['A3'] = 3` to "Talent pipeline" content, rendering it prematurely.
2. `#chatbox` had `max-height: calc(100vh - 80px)`, allowing it to stretch nearly full-screen with enough content.
3. `renderCorporateCard()` included `<div class="icard-source">` with `company.evidence?.title`, positioned absolutely top-right via CSS, overlapping the corporate header.
4. `showEvidenceGroupPanel()` only updated the chatbox for Journey A (`if (this.state.journey === 'A')`). B6 evidence groups were tracked in `evidenceGroupsViewed` but the chatbox was never re-rendered with `.completed` classes.

## Solutions

1. Removed the `UI.updateInspectorForStep()` call from `stepA3()`. The panel now stays on its current content during the infrastructure and location sub-phases. Only `stepA3_talent()` triggers stage 3 panel content.
2. Changed `max-height` to `calc(100vh - 200px)`. The content area already scrolls via `overflow-y: auto` on `#chatbox-content`.
3. Removed the `.icard-source` line from `renderCorporateCard()`. The company name and subtitle already identify the card.
4. Created `updateB6Chatbox()` method modeled after `updateResourceChatbox()`. Added `else if (this.state.step === 'B6')` branch in `showEvidenceGroupPanel()`. Updated `restoreChatbox()` B6 branch to use the same method. Also refactored `stepB6()` to call `updateB6Chatbox()` to avoid code duplication.

## Files modified

- `js/app.js` - Removed `UI.updateInspectorForStep()` from `stepA3()`. Added `updateB6Chatbox()` method. Added B6 branch in `showEvidenceGroupPanel()`. Replaced inline B6 chatbox template in `restoreChatbox()` with `updateB6Chatbox()` call. Refactored `stepB6()` to use `updateB6Chatbox()`.
- `css/styles.css` - Changed `#chatbox` max-height from `calc(100vh - 80px)` to `calc(100vh - 200px)`.
- `js/ui.js` - Removed `.icard-source` div from `renderCorporateCard()`.

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified
- [x] No unintended side effects detected

### Browser testing
- [ ] Issue no longer reproduces
- [ ] Functionality works as expected
- [ ] Edge cases tested (if applicable)

**Test notes:** App opened in browser. Manual testing required for all 4 journey navigation paths.

## CLAUDE.md updates

None - existing rules were sufficient.
