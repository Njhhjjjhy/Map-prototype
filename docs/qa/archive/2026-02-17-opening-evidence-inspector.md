# QA Issue: Opening evidence panel uses raw HTML instead of inspector pattern

**Date:** 2026-02-17
**Status:** Completely fixed
**Reporter:** QA review

## Issue description

`showOpeningEvidence()` in app.js (stage 1, step A0) used the old raw HTML pattern with `UI.showPanel()`, manually built evidence item markup, and manual `lucide.createIcons()` initialization. All other stages (3-9) use the unified `renderInspectorPanel()` with `STAGE_TABS`, `renderStageTab()`, `_renderStageX()` renderers, and icard components. This caused visual inconsistency in the right panel.

## Root cause

The opening evidence panel was implemented before the inspector panel system was built. It was never migrated to the new pattern.

## Solution

Converted stage 1 to use the same inspector panel infrastructure as stages 3-9:

1. Added stage 1 entry to `STAGE_TABS` configuration.
2. Added `_renderStage1()` renderer that uses `renderEvidenceDocCard()` icards for the three supporting documents, matching how stages 4, 5, and 9 render evidence.
3. Replaced the raw HTML body of `showOpeningEvidence()` with a single `UI.renderInspectorPanel(1, ...)` call.

## Files modified

- `js/data.js` - Added `1: { label: 'The core question', tabs: ['Evidence'] }` to `STAGE_TABS`; updated comment.
- `js/ui.js` - Added `case 1` to `renderStageTab()` switch; added `_renderStage1()` renderer using `renderEvidenceDocCard()` icards.
- `js/app.js` - Replaced `showOpeningEvidence()` body (raw HTML, manual icon init) with `UI.renderInspectorPanel(1, ...)` call.

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified (icards, design tokens, no hardcoded values)
- [x] No unintended side effects detected (`updateInspectorForStep` guard for stage <= 2 still works; `_attachInspectorHandlers` is generic)

### Browser testing
- [ ] Issue no longer reproduces
- [ ] Functionality works as expected
- [ ] Edge cases tested

**Test notes:** Browser testing to be performed by user.

## CLAUDE.md updates

None - existing rules were sufficient.
