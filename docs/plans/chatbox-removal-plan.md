# Plan: Remove chatbox, replace with next-step arrow button

## Overview

Remove the chatbox component entirely. Replace it with a single bottom-center arrow-right icon button for step advancement. Move all navigation (sub-item toggles, zone selectors, government tiers) into the dashboard panel. Remove AI chat completely.

---

## What the chatbox currently does

The chatbox serves three distinct roles:

1. **Narrative framing** - headline statistics and credibility anchors per step (e.g., "4+ trillion yen from the national government", "average 12-minute drive to JASM").
2. **Sub-item navigation** - toggles for water/power, government tiers, parent/child groups, zone selectors, property filters.
3. **Step advancement** - the "Continue" primary CTA button.

Role 3 is replaced by the arrow button. Roles 1 and 2 must move to the dashboard.

---

## Content migration audit

Each step's chatbox content must go somewhere. Here is the migration plan per step:

| Step | Chatbox narrative | Sub-item toggles | Migration target |
|------|-------------------|-------------------|-----------------|
| 1. Resources | "10M gallons of water daily..." | Water / Power toggle | Dashboard: narrative becomes panel header blurb; toggle becomes segmented control in panel |
| 2. Strategic location | "Seoul and Taipei both 1h 40m..." | None (map click) | Dashboard: narrative becomes panel header blurb |
| 3. Government support | "4+ trillion yen..." | Central / Prefectural / Local single-select | Dashboard: narrative becomes header blurb; government tiers become segmented control in panel |
| 4. Corporate investment | "TSMC committed 2.16 trillion yen..." | None (map click) | Dashboard: narrative becomes panel header blurb |
| 5. Transport access | "4.8 trillion in government investment..." | Science park / Grand airport parent groups with children | Dashboard: parent/child toggles move to panel as disclosure groups or segmented controls |
| 6. Education pipeline | "METI's Alliance coordinates five universities..." | Universities / Employment toggle | Dashboard: narrative becomes header blurb; toggle becomes segmented control |
| 7. Future outlook | "See the 2030+ completed state..." | None | Dashboard: "See the Future" becomes a toggle switch in the panel |
| 8. Investment zones | "Three zones in the silicon triangle..." | Zone selectors (3) | Dashboard: zones become segmented control or toggle list in panel |
| 9. Properties | "{{count}} properties, avg 12-min drive..." | Zone property filter | Dashboard: narrative becomes header blurb; zone filter becomes segmented control |
| 10. Final | Journey recap, portfolio summary | None | Dashboard: recap content renders as a summary card in the panel |

---

## The next-step arrow button

- Replaces the existing `#chat-fab` element at bottom-center.
- Always visible during the journey (not hidden/shown like the FAB).
- Icon: `arrow-right` (from existing icon set).
- On click: calls `App.nextStep()`.
- On the final step: icon changes to a checkmark or "Q&A" label; triggers `App.enterQAMode()`.
- Disabled state: brief disable after click to prevent double-tap (250ms debounce).
- Back navigation: separate left-arrow button appears to the left when `currentStep > 0`.

Visual spec:
- Same position as current FAB (bottom-center, `--space-8` from bottom edge).
- Same size and style as current FAB (44px touch target, rounded, subtle shadow).
- Two buttons side by side when back is available: `[<] [>]`.

---

## Phase plan

### Phase 1: Dashboard narrative headers

**Goal:** Add narrative framing text to each step's dashboard panel so no content is lost when the chatbox is removed later.

**Changes:**
- In `_renderStepPanel()` (app.js) or the relevant stage renderers (inspector.js), add a narrative header block at the top of each panel.
- The header block contains: step title (already exists), plus a one-liner narrative blurb extracted from current chatbox descriptions.
- Store these blurbs in `js/data/steps.js` as a new `narrative` field on each step object.
- Style: small text under the panel title, using `--text-sm`, `--color-text-secondary`.

**Test:** Open each step. Verify the dashboard panel shows the narrative blurb. Chatbox still works normally (no removal yet).

**Risk:** Low. Additive only.

---

### Phase 2: Move sub-item toggles to dashboard

**Goal:** Every chatbox sub-item interaction is available in the dashboard panel.

**Changes per step type:**

- **Simple toggles** (Steps 1, 6): Add a segmented control to the panel header. Water/Power for Step 1. Universities/Employment for Step 6. Wire to existing `App.selectSubItem()` handlers.
- **Single-select** (Step 3): Add government tier segmented control to panel. Wire to `App.toggleGovernmentLevel()`.
- **Parent/child groups** (Step 5): Add disclosure groups to panel. Science Park and Grand Airport as expandable sections with child items as toggle rows. Wire to existing `App.toggleSubItemGroup()` and `App.selectSubItem()`.
- **Zone selectors** (Step 8): Add zone toggle list or segmented control to panel. Wire to `App.toggleInvestmentZone()`.
- **Property zone filter** (Step 9): Add zone filter (Kikuyo / Ozu) as segmented control or tabs in panel. Wire to existing zone selection logic.
- **Future toggle** (Step 7): Add "See the future" toggle switch in panel. Wire to `UI.setTimeView()`.

**Checkmark tracking:** The chatbox shows green checkmarks for explored items. Move this visual feedback to the dashboard toggles (add a checkmark or filled state to explored items).

**Test:** For each step, use the dashboard toggles to trigger the same map changes and camera flights that the chatbox sub-items currently trigger. Verify all map interactions still work. Chatbox still present (not removed yet).

**Risk:** Medium. This is the most complex phase. Each step's toggle behavior is slightly different. Test each one individually.

---

### Phase 3: Replace FAB with next-step arrow buttons

**Goal:** Replace the chatbox FAB with permanent navigation arrows.

**Changes:**
- Repurpose `#chat-fab` as the forward arrow button. Change icon to `arrow-right`.
- Add a second button `#nav-back` to the left of it for backward navigation.
- Show both buttons whenever the journey is active.
- Forward button: `onclick="App.nextStep()"`.
- Back button: `onclick="App.prevStep()"`, hidden on step 0.
- On final step: forward button shows checkmark icon, triggers `App.enterQAMode()`.
- Remove `reopenChat()` logic from FAB. The FAB no longer opens the chatbox.
- Auto-show the dashboard panel when entering each step (since the chatbox no longer provides the entry point).

**CSS:**
- Bottom-center container with flexbox, gap between buttons.
- Same z-index as current FAB (z-index: 500).
- Entrance animation: fade-in on step load.

**Test:** Navigate forward and backward through all 10 steps using only the arrow buttons. Verify step transitions, camera flights, and map state changes all work correctly.

**Risk:** Low-medium. The navigation logic already exists in `App.nextStep()` and `App.prevStep()`.

---

### Phase 4: Remove the chatbox

**Goal:** Delete all chatbox code, HTML, CSS, and JavaScript.

**Changes:**

**HTML (index.html):**
- Remove `#chatbox` element and all children.
- Keep the repurposed FAB area (now navigation arrows).

**CSS (styles.css):**
- Remove all `#chatbox`, `.chatbox-*` rules.
- Remove `.chatbox-options`, `.chatbox-option`, `.chatbox-continue`, `.chatbox-nav-row`, etc.
- Remove chatbox responsive breakpoints.
- Remove `chatboxExit` keyframe.

**JavaScript:**

*js/ui/core.js:*
- Remove: `showChatbox()`, `hideChatbox()`, `updateChatbox()`, `chatboxBack()`, `saveChatboxToHistory()`, `_setChatboxContent()`, `_updateChatboxBackButton()`.
- Remove: `reopenChat()` (FAB now does navigation, not chatbox restore).
- Remove: `chatboxHistory` state variable, `lastChatType` state variable.
- Simplify `showChatFab()` / `hideChatFab()` to just show/hide nav arrows.

*js/ui/index.js (UI facade):*
- Remove chatbox method exports.

*js/app.js:*
- Remove: `_renderStepChatbox()`, `_getStepChatboxContent()`, `_renderSubItems()`.
- Remove: `_renderGovernmentChatbox()`, `_renderFinalChatbox()`.
- Remove: `restoreChatbox()`.
- Remove chatbox calls from `goToStep()`, `_exitStep()`, `prevStep()`.
- In `goToStep()`: auto-open dashboard panel instead of chatbox.

*js/step-handlers.js:*
- Remove: `_renderStepChatbox()` calls in sub-item handlers (replace with panel refresh only).
- Remove: chatbox re-render calls in `toggleGovernmentLevel()`, `toggleSubItemGroup()`, etc.

*js/ui/ai-chat.js:*
- Remove entire file (AI chat is being removed).

*js/ui/state.js:*
- Remove chatbox-related state fields.

**Test:** Full walkthrough of all 10 steps. Every interaction that previously required the chatbox must now work through the dashboard. No JavaScript errors in console. No orphaned CSS. No broken event handlers.

**Risk:** High. This is the biggest deletion. Must be done carefully with thorough testing after each sub-deletion.

---

### Phase 5: Remove AI chat

**Goal:** Delete all AI chat code.

**Changes:**
- Delete `js/ui/ai-chat.js`.
- Remove AI chat HTML from `index.html` (`#ai-chat-panel` and related elements).
- Remove all `.ai-chat-*` CSS rules.
- Remove `showAIChat()`, `hideAIChat()`, AI chat imports and facade exports.
- Remove AI chat suggestion data.
- Update Q&A mode to skip AI chat entry point - just show data layer dashboard directly.

**Test:** Enter Q&A mode from final step. Verify data layers work without AI chat. No console errors.

**Risk:** Low. AI chat is relatively isolated.

---

### Phase 6: Cleanup and polish

**Goal:** Remove dead code, fix edge cases, verify everything.

**Changes:**
- Search entire codebase for any remaining "chatbox" or "aiChat" references.
- Remove unused CSS classes.
- Remove unused JavaScript functions.
- Update `CLAUDE.md` to reflect new architecture (remove chatbox references in file structure, component list, z-index table).
- Update `docs/components.md` to remove chatbox component spec.
- Test responsive breakpoints (the dashboard panel is now the primary UI - verify it works well at all supported widths).

**Test:** Full regression test. Every step, every toggle, every card, every camera flight.

**Risk:** Low. Cleanup only.

---

## Architecture after removal

```
User flow:
1. Dashboard panel opens automatically on each step
2. Panel shows: narrative header + interactive toggles + detail cards
3. User explores via panel toggles (triggers map changes)
4. User clicks right-arrow to advance to next step
5. On final step: panel shows journey recap card, arrow becomes "Enter Q&A"
6. Q&A mode: data layer dashboard (no AI chat)
```

Components remaining:
- Dashboard panel (right side) - primary UI
- Navigation arrows (bottom center) - step advancement
- Map (full viewport) - interactive visualization
- Data layer toggles (top area) - layer control
- Quick look modal - image/document viewing
- Gallery overlay - image galleries

Components removed:
- Chatbox (bottom center modal)
- AI chat panel
- Chat FAB (repurposed as nav arrows)

---

## Estimated scope

| Phase | Files touched | Complexity |
|-------|--------------|------------|
| 1. Dashboard narratives | 2 (steps.js, app.js or inspector.js) | Low |
| 2. Sub-item toggles | 3-4 (inspector.js, app.js, step-handlers.js, styles.css) | High |
| 3. Arrow buttons | 3 (index.html, core.js, styles.css) | Low |
| 4. Remove chatbox | 6+ (index.html, styles.css, core.js, app.js, step-handlers.js, index.js, state.js) | High |
| 5. Remove AI chat | 4 (ai-chat.js, index.html, styles.css, core.js) | Low |
| 6. Cleanup | All files | Low |

---

## Key risks and mitigations

1. **Camera choreography breaks.** Many camera flights are triggered by chatbox sub-item clicks. Mitigation: in Phase 2, wire the same handlers to dashboard toggles and verify each camera flight.

2. **Exploration state tracking breaks.** The `subItemsExplored` array and checkmark rendering are tightly coupled to chatbox rendering. Mitigation: move checkmark rendering to dashboard toggle state in Phase 2.

3. **Step entry sequencing.** Currently `goToStep()` renders both chatbox and panel. After removal, it must auto-open the dashboard. Mitigation: Phase 3 changes `goToStep()` to auto-show panel.

4. **Government single-select pattern.** The chatbox uses a unique single-select toggle pattern for government tiers. Mitigation: implement as segmented control in dashboard (same visual pattern, different container).

5. **Journey recap on final step.** The portfolio profit calculation and recap checklist have no dashboard equivalent. Mitigation: Phase 2 adds a recap summary card to the dashboard for the final step.
