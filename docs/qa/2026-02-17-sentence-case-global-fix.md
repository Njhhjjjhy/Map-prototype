# QA Issue: Global sentence case enforcement

**Date:** 2026-02-17
**Status:** Completely fixed
**Reporter:** QA review

## Issue description

Title Case was used extensively across the application for non-CTA elements: evidence titles, panel headings, data labels, evidence group headers, infrastructure marker names, traffic route names, truth engine items, and calculator labels. The strict rule is: sentence case everywhere, with Title Case only for primary CTAs (amber fill buttons) and modal overlay headings (h2/h3 inside modal dialogs).

Screenshot showed chatbox option items "New Water Treatment", "Logistics Hub", "Data Center Complex" rendered in Title Case.

## Root cause

Data strings in `data.js` and UI heading strings in `ui.js` were written in Title Case during initial development. The previous CLAUDE.md case rules allowed Title Case for dashboard headings and were ambiguous about data labels and evidence titles.

## Solution

Converted all non-CTA, non-modal-heading text to sentence case across the entire codebase. Proper nouns (place names, company names, facility names) retain their capitalization.

Updated CLAUDE.md to simplify the case rule: Title Case is now restricted to exactly two exceptions (primary CTAs and modal headings). Dashboard headings, panel headings, data labels, and all other UI text must use sentence case.

## Files modified

- `js/data.js` - 42 string changes: evidence document titles, evidence group headers, evidence item titles, infrastructure marker names, traffic route names, truth engine titles, Haramizu zone name
- `js/ui.js` - 25+ string changes: panel h2 headings, calc labels, section headings, summary document headings, portfolio labels, journey step titles, button labels, status labels
- `js/app.js` - 1 string change: panel heading "10 Trillion Commitment" to sentence case
- `index.html` - 1 string change: "Download Summary" button to "Download summary"
- `CLAUDE.md` - Simplified case rules section to enforce strict sentence case with only two exceptions

## Verification results

### Code review
- [x] Changes match approved plan
- [x] Design system compliance verified
- [x] No unintended side effects detected
- [x] Proper nouns preserved (Kumamoto, Science Park, TSMC, Sony, Tokyo Electron, etc.)

### Browser testing
- [x] Grep scan confirms no remaining Title Case violations in non-proper-noun contexts
- [x] All primary CTAs retain Title Case (verified in app.js)
- [x] Modal heading "Ask Me Anything About Kumamoto" unchanged (verified in index.html)

**Test notes:** Ran regex scans across all four JS/HTML files. All remaining capitalized multi-word strings are proper nouns (place names, company names, facility names, road names).

## CLAUDE.md updates

Simplified the Case Rules section:
- Removed "Dashboard headings" from Title Case exceptions
- Reduced Title Case to exactly two exceptions: primary CTAs and modal headings
- Updated the reference table with sentence case examples for dashboard headings, panel headings, evidence titles, and data labels
- Added explicit note that evidence/document titles use sentence case
