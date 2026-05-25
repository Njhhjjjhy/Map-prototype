/**
 * Reusable HTML template functions ("mini-components").
 * Each returns an HTML string. Used across ui/, step-handlers, and app.
 */

import { t } from "../i18n/index.js";

// --- SVG constants ---

export const SVG_CHECKMARK = `<svg class="chatbox-option-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

export const SVG_ARROW_RIGHT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

export const SVG_CHEVRON_RIGHT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

export const SVG_CHEVRON_LEFT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

export const SVG_TRIANGLE_COLLAPSED = `<svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l6 4-6 4V4z"/></svg>`;

export const SVG_TRIANGLE_EXPANDED = `<svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 6 4-6H4z"/></svg>`;

// --- Layout components ---

/**
 * Panel header: subtitle + heading + description.
 * @param {string} subtitle
 * @param {string} heading
 * @param {string} [description]
 * @returns {string}
 */
export function panelHeader(subtitle, heading, description) {
  return `<div class="subtitle">${subtitle}</div>
<h2>${heading}</h2>
${description ? `<p>${description}</p>` : ""}`;
}

/**
 * Stat grid with value/label items.
 * @param {Array<{value: string, label: string}>} stats
 * @param {string} [style] - Optional inline style for the grid
 * @returns {string}
 */
export function statGrid(stats, style) {
  if (!stats || stats.length === 0) return "";
  const items = stats
    .map(
      (s) => `<div class="stat-item">
    <div class="stat-value">${s.value}</div>
    <div class="stat-label">${s.label}</div>
</div>`,
    )
    .join("");
  return `<div class="stat-grid"${style ? ` style="${style}"` : ""}>${items}</div>`;
}

/**
 * Panel bento stat grid (alternate stat style).
 * @param {Array<{value: string, label: string}>} stats
 * @returns {string}
 */
export function bentoStats(stats) {
  if (!stats || stats.length === 0) return "";
  const items = stats
    .map(
      (s) => `<div class="panel-bento-stat">
    <div class="panel-bento-stat-value">${s.value}</div>
    <div class="panel-bento-stat-label">${s.label}</div>
</div>`,
    )
    .join("");
  return `<div class="panel-bento-stats">${items}</div>`;
}

/**
 * Inspector card stat grid.
 * @param {Array<{value: string, label: string}>} stats
 * @returns {string}
 */
export function icardStats(stats) {
  if (!stats || stats.length === 0) return "";
  return stats
    .map(
      (s) => `<div class="icard-stat">
    <div class="icard-stat-value">${s.value}</div>
    <div class="icard-stat-label">${s.label}</div>
</div>`,
    )
    .join("");
}

/**
 * Inspector card wrapper.
 * @param {Object} opts
 * @param {string} [opts.title]
 * @param {string} [opts.variant] - "standard", "compact", "hero"
 * @param {string} [opts.attrs] - Extra attributes (data-*, onclick, etc.)
 * @param {string} content - Inner HTML
 * @returns {string}
 */
export function icard(
  { title, variant = "standard", attrs = "" } = {},
  content,
) {
  return `<div class="icard icard-${variant}"${attrs ? ` ${attrs}` : ""}>
${title ? `<div class="icard-title">${title}</div>` : ""}
${content}
</div>`;
}

/**
 * Empty state / no-data fallback card.
 * @param {string} message
 * @returns {string}
 */
export function emptyCard(message) {
  return `<div class="icard icard-compact"><p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">${message}</p></div>`;
}

// --- Interactive components ---

/**
 * Clickable evidence image.
 * @param {string} src - Image URL
 * @param {string} alt - Alt text
 * @returns {string}
 */
export function evidenceImage(src, alt) {
  return `<div class="evidence-image-container" style="margin-top: var(--space-4); cursor: pointer;" onclick="UI.showEvidenceLightbox('${src}', '${alt}')">
    <img src="${src}" alt="${alt}" style="width: 100%; border-radius: var(--radius-medium);" />
</div>`;
}

/**
 * Energy/zone toggle row with switch.
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.label
 * @param {string} opts.color
 * @param {string} opts.icon - SVG string
 * @param {boolean} opts.active
 * @param {string} opts.onclick - onclick handler string
 * @returns {string}
 */
export function toggleRow({ id, label, color, icon, active, onclick }) {
  return `<button class="energy-toggle-row${active ? " active" : ""}" onclick="${onclick}" aria-pressed="${active}">
    <span class="energy-toggle-icon"${color ? ` style="color: ${color};"` : ""}>${icon || ""}</span>
    <span class="energy-toggle-label">${label}</span>
    <span class="energy-toggle-switch ${active ? "on" : ""}">
        <span class="energy-toggle-knob"></span>
    </span>
</button>`;
}

/**
 * Energy evidence card (colored border, label, stats, images).
 * @param {Object} opts
 * @param {string} opts.color - Border/label color
 * @param {string} opts.subtitle
 * @param {string} opts.title
 * @param {string} opts.description
 * @param {Array} [opts.stats] - Stats array for bentoStats()
 * @param {string} [opts.extra] - Additional HTML after stats
 * @returns {string}
 */
export function evidenceCard({
  color,
  subtitle,
  title,
  description,
  stats,
  extra = "",
}) {
  const statsHtml = stats && stats.length > 0 ? bentoStats(stats) : "";
  return `<div class="energy-evidence-card" style="border-left: 3px solid ${color};">
    <div class="panel-bento-label" style="color: ${color};">${subtitle}</div>
    <div style="font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--font-weight-semibold); margin-bottom: var(--space-3);">${title}</div>
    <p style="font-size: var(--text-sm); margin-bottom: var(--space-4);">${description}</p>
    ${statsHtml}
    ${extra}
</div>`;
}

/**
 * Continue button for chatbox.
 * @param {string} onclick - onclick handler
 * @param {string} [label="Continue"] - Button text
 * @param {Object} [opts]
 * @param {boolean} [opts.arrow] - Show arrow icon
 * @param {string} [opts.variant="primary"] - "primary" or "secondary"
 * @returns {string}
 */
export function continueBtn(
  onclick,
  label,
  { arrow = false, variant = "primary" } = {},
) {
  const btnLabel = label || t("Continue");
  return `<button class="chatbox-continue ${variant}" onclick="${onclick}">${btnLabel}${arrow ? ` ${SVG_ARROW_RIGHT}` : ""}</button>`;
}

/**
 * Data attribution footer.
 * @param {string} source
 * @returns {string}
 */
export function dataAttribution(source) {
  return `<div class="data-attribution">
    <p class="data-timestamp">${t("Sample data · Q1 2026")}</p>
    <p>${source}</p>
</div>`;
}

/**
 * Disclosure triangle pair (collapsed + expanded SVGs).
 * @returns {string}
 */
export function disclosureTriangle() {
  return `<span class="disclosure-triangle" aria-hidden="true">${SVG_TRIANGLE_COLLAPSED}${SVG_TRIANGLE_EXPANDED}</span>`;
}

/**
 * Context connection item (icon + name + detail).
 * @param {string} icon - SVG string
 * @param {string} name
 * @param {string} detail
 * @returns {string}
 */
export function connectionItem(icon, name, detail) {
  return `<div class="context-connection-item">
    <div class="context-connection-icon">${icon}</div>
    <div class="context-connection-info">
        <div class="context-connection-name">${name}</div>
        <div class="context-connection-detail">${detail}</div>
    </div>
</div>`;
}

// ============================================================
// Playground "Compact tabs" body block primitives
// Source: playground/index.html renderBlock() at lines 1550-1639.
// These produce the canonical step-section / stat-grid / step-list /
// evidence-block / step-image markup that the Compact tabs body
// expects. CSS for these classes lives under
// `#panel-content:has(.panel-a-header) ...` in css/styles.css so
// they don't collide with the legacy `#panel-content .stat-grid`
// rules.
// ============================================================

/**
 * Plain prose paragraph. Mirrors playground { type: "prose" }.
 */
export function proseBlock(text) {
  if (!text) return "";
  return `<p class="step-prose">${text}</p>`;
}

/**
 * Stat block: optional section label + 2-col stat grid.
 * `items` is [{ label, value, hero? }]. `hero: true` spans the
 * full row and renders the value at display size — used for
 * single headline figures (mirrors playground statGrid.hero).
 * `tier` is one of "central" | "prefectural" | "local" and tints
 * the section label.
 */
export function statSection({ label, items, tier } = {}) {
  if (!items || !items.length) return "";
  const rowsHtml = items
    .map(
      (it) => `
      <div class="stat-row${it.hero ? " hero" : ""}">
        <div class="stat-label">${it.label || ""}</div>
        <div class="stat-value">${it.value ?? ""}</div>
      </div>`,
    )
    .join("");
  const tierClass = tier ? ` tier-${tier}` : "";
  const labelHtml = label
    ? `<p class="section-label${tierClass}">${label}</p>`
    : "";
  return `
    <div class="step-section">
      ${labelHtml}
      <div class="stat-grid">${rowsHtml}</div>
    </div>`;
}

/**
 * List block: optional section label + vertical list of items.
 * `items` is [{ icon, title, sub, value }]. `icon` is either an
 * SVG string (preferred) or an `<img>` element. The icon tile is
 * fixed to 32x32 with a white background; pass `iconLogo: true`
 * if the icon is an image logo (controls sizing).
 */
export function listSection({ label, items } = {}) {
  if (!items || !items.length) return "";
  const itemsHtml = items
    .map(
      (it) => `
      <li class="step-list-item">
        <span class="step-list-icon">${it.icon || ""}</span>
        <div class="step-list-body">
          <div class="step-list-title">${it.title || ""}</div>
          ${it.sub ? `<div class="step-list-sub">${it.sub}</div>` : ""}
        </div>
        ${it.value ? `<span class="step-list-value">${it.value}</span>` : ""}
      </li>`,
    )
    .join("");
  const labelHtml = label ? `<p class="section-label">${label}</p>` : "";
  return `
    <div class="step-section">
      ${labelHtml}
      <ul class="step-list">${itemsHtml}</ul>
    </div>`;
}

/**
 * Evidence block: clickable tile with icon, title, description.
 * If `onclick` is provided, renders as a button so it's keyboard-
 * accessible; otherwise renders as a div.
 */
const EVIDENCE_DEFAULT_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';

export function evidenceBlockHtml({ title, description, icon, onclick } = {}) {
  if (!title && !description) return "";
  const iconHtml = icon || EVIDENCE_DEFAULT_ICON;
  const inner = `
    <span class="evidence-block-icon">${iconHtml}</span>
    <div class="evidence-block-body">
      <div class="evidence-block-title">${title || ""}</div>
      ${description ? `<div class="evidence-block-desc">${description}</div>` : ""}
    </div>
  `;
  if (onclick) {
    return `<button type="button" class="evidence-block" onclick="${onclick}">${inner}</button>`;
  }
  return `<div class="evidence-block">${inner}</div>`;
}

/**
 * Single image block, optional section label.
 */
export function imageBlock({ label, src, alt, onclick } = {}) {
  if (!src) return "";
  const labelHtml = label ? `<p class="section-label">${label}</p>` : "";
  const clickAttr = onclick ? ` onclick="${onclick}" style="cursor: pointer;"` : "";
  return `
    <div class="step-section">
      ${labelHtml}
      <div class="step-image"${clickAttr}><img src="${src}" alt="${alt || ""}" loading="lazy" /></div>
    </div>`;
}

/**
 * Image gallery block: 3-col grid of cover-cropped thumbnails.
 */
export function imageGalleryBlock({ label, images, onClickEachAttr } = {}) {
  if (!images || !images.length) return "";
  const imgsHtml = images
    .map(
      (src, i) =>
        `<img src="${src}" alt="" loading="lazy" data-gallery-index="${i}"${onClickEachAttr ? ` ${onClickEachAttr}` : ""} />`,
    )
    .join("");
  const labelHtml = label ? `<p class="section-label">${label}</p>` : "";
  return `
    <div class="step-section">
      ${labelHtml}
      <div class="step-image-gallery">${imgsHtml}</div>
    </div>`;
}

/**
 * Standalone section-label heading. Use when you need a label
 * without an attached block (rare).
 */
export function sectionLabel(text, tier) {
  if (!text) return "";
  const tierClass = tier ? ` tier-${tier}` : "";
  return `<p class="section-label${tierClass}">${text}</p>`;
}

/**
 * Footer "View evidence" CTA. The playground's renderFooterCta
 * surfaces this only when the active tab contains an evidence
 * block. Callers decide when to include it. `onclick` is passed
 * through verbatim; supply your own click target (lightbox, PDF,
 * gallery, etc.).
 */
export function footerCta({ label = "View evidence", onclick } = {}) {
  return `<button type="button" class="cta secondary" onclick="${onclick || ""}">${label}</button>`;
}
