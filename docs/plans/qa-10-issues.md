# QA Fix Plan: 10 Panel and Button Issues

## Issue #1: "View evidence" button - wrong case + too much padding

- Root cause: Button has `.primary` amber fill but text is sentence case ("View evidence"). Also wrapped in an unnecessary `.panel-bento-card.primary` container adding 24px padding around it.
- Files: `js/ui.js:1092-1098`
- Fix: Change text to "View Evidence" (Title Case for primary CTA per CLAUDE.md). Remove the wrapping `.panel-bento-card.primary` div around the actions section.

## Issue #2: Stats grid - too much padding

- Root cause: `.panel-bento-stat` cards have 16px padding inside a `.panel-bento-card` wrapper with 24px padding, creating excessive nested whitespace.
- Files: `js/ui.js:1082-1087`, `css/styles.css:1841-1846`
- Fix: Remove the wrapper `.panel-bento-card` around the stats grid. Stats grid sits directly in the panel content.

## Issue #3: Right panel - too many nested containers + bad hierarchy

- Root cause: `showResourcePanel()` wraps description, stats, and actions in separate `.panel-bento-card` divs inside a `.panel-bento-layout`. Creates 3 levels of visual nesting.
- Files: `js/ui.js:1070-1100`
- Fix: Flatten the structure. Remove bento layout. Use: subtitle, h2 title, direct paragraph text, direct stat grid, direct action button. No card wrappers.

## Issue #4: Double labels (Energy infrastructure)

- Root cause: Panel subtitle says "Kyushu energy infrastructure" while the toolbar back button already shows "Energy infrastructure" from the previous panel. Redundant.
- Files: `js/ui.js:1142-1143`
- Fix: Remove the subtitle div from energy station panel content since the back button already provides context.

## Issue #5: Talent pipeline tabs - remove + simplify

- Root cause: Stage 3 has 3 tabs (Workforce/Universities/Sources) fragmenting content into separate views.
- Files: `js/data.js:31`, `js/ui.js:3920-3932`
- Fix: Change stage 3 to single tab (no tab bar rendered). Combine workforce and university content into one scrollable view.

## Issue #6: Double labels (Talent pipeline)

- Root cause: `inspectorTitle` and `subtitle` both derived from `tabDef.label` ("Talent pipeline"), so both show the same text.
- Files: `js/ui.js:3777, 3785, 3802`
- Fix: Don't render subtitle when it matches the title. Remove the duplicate.

## Issue #7: Panel should match journey content

- Root cause: The evidence library panel shows generic "Supporting documents" unrelated to the current journey step.
- Files: `js/ui.js:2183-2190`
- Fix: Panel content should be the inspector panel driven by current journey step, matching the dashboard design pattern (stage-based `renderInspectorPanel`).

## Issue #8: University list needs checkmarks

- Root cause: University list items in chatbox use `.chatbox-option` without `.completed` tracking when clicked (unlike the resource exploration pattern which tracks and shows checkmarks).
- Files: `js/app.js:344-348`
- Fix: Track visited institutions in `App.state`. Add `.completed` class to visited university items, matching the resource exploration checkmark pattern.

## Issue #9: Ask Me Anything + Download summary - vertical stack

- Root cause: Two buttons rendered as consecutive `.chatbox-continue` elements without a flex-column wrapper, causing them to sit side by side.
- Files: `js/app.js:696-706`
- Fix: Wrap both buttons in a flex-column container with `gap: var(--space-3)`.

## Issue #10: Remove "Schedule a Consultation"

- Root cause: Button exists in AI chat CTAs section in index.html.
- Files: `index.html:217-227`
- Fix: Remove the Schedule a Consultation button entirely from index.html and remove the `scheduleConsultation()` method from ui.js.
