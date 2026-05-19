/**
 * DOM scope helpers — Stage 2 of the map-core extraction.
 *
 * Goal: replace ~100 calls to `document.getElementById` / `document.querySelector`
 * inside the package boundary with scope-aware helpers that look up elements
 * inside a configured `root` container rather than the global `document`.
 *
 * Today (Stage 1+2):
 * - The root is set to `#app-container` (the current standalone scaffold) when
 *   `mountMap()` is called. Behavior matches the previous document-scoped lookups
 *   because the scaffold is always a child of document.
 *
 * Later (Stage 3):
 * - Consumers (value-add-prototype) will pass an arbitrary container to mountMap.
 *   The package will inject its DOM scaffold into that container. The helpers
 *   below already support this because they query off the configured root.
 *
 * Helpers (intentionally short names — they replace high-frequency call sites):
 * - `$id(id)`        → `root.querySelector('#' + id)`     (replaces `document.getElementById(id)`)
 * - `$sel(selector)` → `root.querySelector(selector)`     (replaces `document.querySelector(selector)`)
 * - `$all(selector)` → `root.querySelectorAll(selector)`  (replaces `document.querySelectorAll(selector)`)
 * - `getRoot()`      → returns the current root element (or `document` as fallback)
 *
 * What does NOT change:
 * - Document-level state mutations (`document.documentElement.setAttribute`,
 *   `document.body.style.cursor`, scroll locks) — these stay as `document.*`
 *   because they are intentionally global.
 * - Elements intentionally appended to `document.body` (modal-style overlays,
 *   the tour iframe) — these stay body-scoped because they need to escape any
 *   container's stacking context.
 * - `document.addEventListener` for global hotkeys — stays document-scoped.
 */

let _root = null;

/**
 * Configure the root element that subsequent helper calls will query from.
 * Called by `mountMap()`. Pass `null` to reset back to document fallback
 * (used during teardown in `destroy()`).
 */
export function setRoot(el) {
  _root = el || null;
}

/**
 * Return the current root element, or `document` as a fallback. The fallback
 * exists so that helpers continue to work safely if a module accidentally
 * runs before `setRoot()` is called (e.g. during early load, dev tools).
 */
export function getRoot() {
  return _root || document;
}

/**
 * Query for an element by ID, scoped to the configured root.
 * Drop-in replacement for `document.getElementById(id)`.
 */
export function $id(id) {
  return getRoot().querySelector("#" + id);
}

/**
 * Query for the first matching element, scoped to the configured root.
 * Drop-in replacement for `document.querySelector(selector)`.
 */
export function $sel(selector) {
  return getRoot().querySelector(selector);
}

/**
 * Query for all matching elements, scoped to the configured root.
 * Drop-in replacement for `document.querySelectorAll(selector)`.
 */
export function $all(selector) {
  return getRoot().querySelectorAll(selector);
}
