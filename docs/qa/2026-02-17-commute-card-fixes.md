# QA Issue: Commute card chevron and table alignment

**Date:** 2026-02-17
**Status:** Partially fixed (code changes applied, pending browser verification)
**Reporter:** QA Review

## Issue Description

The "Commute to JASM" card in the right panel (Journey C, stage 9) had two issues:
1. An unwanted icon ("chevron") appearing at the top of the panel, overlaying card content when scrolled.
2. Table column misalignment - the "Shift" column header was left-aligned but its data cells were right-aligned, creating a visual disconnect.

## Root Cause

1. **Chevron/close button overlay**: The `#panel-close` button (and other close buttons) had `position: absolute` applied in the touch target expansion CSS block. Since `.panel-toolbar` lacked explicit positioning, the close button was positioned relative to the `#right-panel` fixed container, causing it to float over scrollable content instead of staying within its toolbar flow.

2. **Table alignment**: `.icard-commute-table td` had a blanket `text-align: right` rule. This right-aligned the first column's data (shift times like "2:00 am") while its header "Shift" was left-aligned. Headers and data within the same column were visually mismatched.

## Solution

1. Changed `position: absolute` to `position: relative` on all close buttons in the touch target expansion block. `position: relative` is the correct value for providing a positioning context for `::before` hit area pseudo-elements without removing buttons from normal document flow.

2. Replaced the blanket `text-align` rules with column-specific alignment: first column (`th:first-child`, `td:first-child`) left-aligned; second column (`th:last-child`, `td:last-child`) right-aligned. Headers and data now align consistently within each column.

## Files Modified

- `css/styles.css` - Changed `position: absolute` to `position: relative` on close buttons (line 4414); replaced commute table alignment rules with per-column alignment (lines 5349-5368)

## Verification Results

### Code Review
- [x] Changes match approved plan
- [x] Design system compliance verified (uses design tokens, no hardcoded values)
- [x] No unintended side effects detected (position: relative is correct for ::before context)

### Browser Testing
- [ ] Issue no longer reproduces
- [ ] Functionality works as expected
- [ ] Edge cases tested (if applicable)

**Test notes:** Pending browser verification by user.

## CLAUDE.md Updates

None - existing rules were sufficient.
