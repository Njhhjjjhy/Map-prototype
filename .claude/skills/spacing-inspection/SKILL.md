---
name: spacing-inspection
description: Exhaustive inspection of CSS files for hardcoded spacing and radius values. Use when checking design token compliance, reviewing spacing consistency, or when the user mentions "spacing inspection", "token audit", "hardcoded pixels", or "design system compliance".
allowed-tools: Bash(grep:*), Bash(find:*), Bash(wc:*), Bash(cat:*), Bash(awk:*), Bash(sed:*), Bash(sort:*), Bash(head:*), Bash(tail:*)
disable-model-invocation: true
---

# Spacing & Radius Token Inspection

You are a **deterministic auditor**. Your job is to find EVERY hardcoded px value in spacing and radius properties across the project. Miss nothing. Rush nothing. You are not summarising — you are producing a complete inventory.

## CRITICAL: Execution Rules

1. **grep is your source of truth.** Do NOT read files with your own eyes and try to spot values. Use grep/find/awk to extract every match first. Then classify.
2. **Every grep match must appear in your final report.** If grep found 47 matches, your report has 47 entries. No exceptions.
3. **Count before and after.** Run `wc -l` on your grep output at the start. Run it on your report at the end. The numbers MUST match. If they don't, find what you missed.
4. **Work file by file.** Do not try to process everything in one pass. Process one file at a time so you don't lose track.
5. **Never say "and similar" or "etc."** List every single occurrence.

## Token Scale

### Spacing tokens

| Token | Value |
|---|---|
| `--space-0` | `0` |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--space-20` | `80px` |
| `--space-24` | `96px` |

On-scale px values: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

### Radius tokens

| Token | Value |
|---|---|
| `--radius-none` | `0` |
| `--radius-small` | `4px` |
| `--radius-medium` | `8px` |
| `--radius-large` | `12px` |
| `--radius-xlarge` | `16px` |
| `--radius-full` | `9999px` |

On-scale radius values: 0, 4, 8, 12, 16, 9999

## Target Properties

**Spacing:** `padding`, `padding-top`, `padding-right`, `padding-bottom`, `padding-left`, `margin`, `margin-top`, `margin-right`, `margin-bottom`, `margin-left`, `gap`, `row-gap`, `column-gap`, `inset`, `top`, `right`, `bottom`, `left`

**Radius:** `border-radius`, `border-top-left-radius`, `border-top-right-radius`, `border-bottom-right-radius`, `border-bottom-left-radius`

## Classification Buckets

1. **❌ Off-scale** — The px value is NOT in the token scale (e.g., `6px`, `10px`, `14px`, `28px`). Needs a design decision.
2. **🔶 On-scale but hardcoded** — The px value matches a token but uses raw number instead of `var()` (e.g., `padding: 16px` instead of `padding: var(--space-4)`). Direct replacement.
3. **🔶 Percentage radius** — `border-radius: 50%` should become `var(--radius-full)`.
4. **✅ Already tokenised** — Uses `var(--space-*)` or `var(--radius-*)`. Count these for adoption rate but do not list as violations.

## Procedure — Follow EXACTLY in order

### Phase 1: Discovery (grep)

Run these commands and save the raw output. This is your ground truth.

```bash
# Step 1: Find all CSS files
find . -type f \( -name "*.css" -o -name "*.html" -o -name "*.jsx" -o -name "*.vue" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/vendor/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  > /tmp/spacing-inspection-files.txt

# Step 2: Count files
echo "FILES FOUND:"
wc -l < /tmp/spacing-inspection-files.txt

# Step 3: Grep for ALL spacing and radius declarations with line numbers
grep -rn -E '(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left|border-radius|border-top-left-radius|border-top-right-radius|border-bottom-right-radius|border-bottom-left-radius)\s*:' \
  --include="*.css" --include="*.html" --include="*.jsx" --include="*.vue" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor --exclude-dir=dist --exclude-dir=build \
  . > /tmp/spacing-inspection-raw.txt

# Step 4: Count total raw matches
echo "RAW MATCHES:"
wc -l < /tmp/spacing-inspection-raw.txt
```

### Phase 2: Filter

From the raw matches, REMOVE these (they are not violations):

- Lines inside `:root` or `[data-theme]` blocks (these define the tokens)
- Lines using `var(--space-*)` or `var(--radius-*)` (already tokenised — count for adoption rate)
- Lines using `calc()`, `auto`, `inherit`, `initial`, `unset`, `revert`
- Lines with value `0` (no units — always valid)
- Lines from vendor/library selectors: `.leaflet-*`, `.mapboxgl-*`, `.maplibregl-*`
- `transition`, `animation`, `transform` properties that happen to match (false positives from `top`/`right`/`bottom`/`left` in shorthand)
- CSS custom property definitions (`--space-*:`, `--radius-*:`)

Run filtering:

```bash
# Step 5: Filter out token definitions, var() usage, calc, auto, vendor classes
grep -v ':root' /tmp/spacing-inspection-raw.txt \
  | grep -v 'var(--space' \
  | grep -v 'var(--radius' \
  | grep -v 'calc(' \
  | grep -v ': *auto' \
  | grep -v ': *inherit' \
  | grep -v ': *initial' \
  | grep -v ': *unset' \
  | grep -v '\.leaflet-' \
  | grep -v '\.mapboxgl-' \
  | grep -v '\.maplibregl-' \
  | grep -v '\-\-space-' \
  | grep -v '\-\-radius-' \
  > /tmp/spacing-inspection-filtered.txt

# Step 6: Count filtered violations
echo "VIOLATIONS TO CLASSIFY:"
wc -l < /tmp/spacing-inspection-filtered.txt
```

### Phase 3: Classify EVERY match

Go through `/tmp/spacing-inspection-filtered.txt` line by line. For EACH line:

1. Identify the property and value(s)
2. For shorthand properties (`padding: 8px 16px 8px 16px`), classify EACH value separately
3. Check if the px value exists in the token scale
4. Assign the correct bucket (❌ off-scale, 🔶 on-scale-hardcoded, 🔶 pct-radius)
5. If on-scale, name the exact replacement token
6. If off-scale, name the two nearest tokens (lower and higher)

### Phase 4: Also count tokenised declarations

```bash
# Step 7: Count already-tokenised declarations for adoption rate
echo "ALREADY TOKENISED:"
grep -rn -E '(padding|margin|gap|border-radius).*var\(--space-|var\(--radius-' \
  --include="*.css" --include="*.html" --include="*.jsx" --include="*.vue" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.git \
  . | wc -l
```

### Phase 5: Verification

```bash
# Step 8: VERIFY your report
echo "=== VERIFICATION ==="
echo "Raw grep matches:        $(wc -l < /tmp/spacing-inspection-raw.txt)"
echo "Filtered violations:     $(wc -l < /tmp/spacing-inspection-filtered.txt)"
echo "Items in your report:    [YOU MUST FILL THIS IN]"
echo "Match? If no, find what you missed."
```

**If your report count doesn't match the filtered violations count, STOP and find the discrepancy before continuing.**

## Output Format

### Header

```
# Spacing & Radius Token Inspection Report
Generated: [date]
Project: [project name]
```

### Summary Table

```
| Metric | Count |
|---|---|
| Files scanned | X |
| Total declarations found | X |
| Already tokenised (✅) | X |
| Violations found | X |
| — ❌ Off-scale | X |
| — 🔶 On-scale hardcoded | X |
| — 🔶 Percentage radius | X |
| Token adoption rate | X% |
```

Token adoption = tokenised / (tokenised + violations) × 100

### Violations by File

For EVERY violation. No grouping. No summarising. Every. Single. One.

```
## filename.css

Line 42: `.card { padding: 6px 16px }`
  → `6px` ❌ Off-scale. Nearest: --space-1 (4px) ↓ or --space-2 (8px) ↑. Design decision.
  → `16px` 🔶 On-scale. Replace with `var(--space-4)`

Line 87: `.header { margin-bottom: 24px }`
  → `24px` 🔶 On-scale. Replace with `var(--space-6)`

Line 103: `.avatar { border-radius: 50% }`
  → `50%` 🔶 Percentage radius. Replace with `var(--radius-full)`
```

### Design Decisions Needed

Group off-scale values by px size. For each, list ALL occurrences and the two nearest tokens.

```
### `6px` — 3 occurrences
Nearest: --space-1 (4px) or --space-2 (8px)
- [ ] Line 42 in card.css: `.card { padding: 6px }`
- [ ] Line 88 in nav.css: `.nav-item { margin-right: 6px }`
- [ ] Line 12 in modal.css: `.modal-body { gap: 6px }`
Decision: ____________
```

### Quick-Fix List

For on-scale hardcoded values, output a sed-ready replacement list:

```
## Direct Replacements (copy-paste ready)

filename.css:42    padding: 16px     →  padding: var(--space-4)
filename.css:87    margin-bottom: 24px  →  margin-bottom: var(--space-6)
```

## Common Off-Scale Values Reference

| Hardcoded | Lower | Higher | Likely intent |
|---|---|---|---|
| `1px` | `0` | `4px` (--space-1) | Probably a border, not spacing — verify |
| `2px` | `0` | `4px` (--space-1) | Design decision |
| `3px` | `0` | `4px` (--space-1) | Design decision |
| `5px` | `4px` (--space-1) | `8px` (--space-2) | Likely `--space-1` |
| `6px` | `4px` (--space-1) | `8px` (--space-2) | Likely `--space-2` |
| `10px` | `8px` (--space-2) | `12px` (--space-3) | Could be either |
| `14px` | `12px` (--space-3) | `16px` (--space-4) | Likely `--space-4` |
| `18px` | `16px` (--space-4) | `20px` (--space-5) | Design decision |
| `22px` | `20px` (--space-5) | `24px` (--space-6) | Design decision |
| `28px` | `24px` (--space-6) | `32px` (--space-8) | Design decision |
| `36px` | `32px` (--space-8) | `40px` (--space-10) | Design decision |

## Edge Cases

- **Shorthand with mixed values:** `padding: 8px 6px` — TWO separate entries in your report
- **Negative margins:** Report as violation. Suggest `calc(-1 * var(--space-N))` if on-scale
- **`1px` values:** Often borders, not spacing. Flag but note "verify if border or spacing"
- **`100%` width/height:** Not spacing — skip. Only flag `50%` on border-radius
- **`!important`:** Strip before checking value. Still a violation if hardcoded
- **Media queries:** Check declarations inside media queries too — don't skip them
- **Duplicate selectors:** Report each occurrence separately even if same selector appears in multiple files
- **Multi-value shorthand:** `margin: 8px 16px 8px 0` has FOUR values — check each one. `0` is fine, report the rest
