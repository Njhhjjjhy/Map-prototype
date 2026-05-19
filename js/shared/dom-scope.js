/**
 * DOM scope helpers — Stage 2 of the map-core extraction, refined in
 * Stage 3 to handle the standalone's split DOM.
 *
 * Goal: replace ~100 calls to `document.getElementById` / `document.querySelector`
 * inside the package boundary with scope-aware helpers that look up elements
 * inside a configured `root` container rather than the global `document`.
 *
 * The standalone's HTML splits its DOM across two trees:
 * - Inside `#app-container`: map, panel, dev tools, control bar.
 * - Outside `#app-container` (at body level): `#gallery-modal`,
 *   `#property-quick-look`, `#evidence-preview`, `#lang-toggle`,
 *   `#rotate-overlay`. These live at the body so they can escape any
 *   stacking context.
 *
 * Helpers therefore:
 * 1. Treat the root itself as a match when `id === root.id` (since
 *    `querySelector('#foo')` does not match the calling element itself,
 *    only its descendants).
 * 2. Fall back to `document` when an element-scoped query returns
 *    nothing, so body-level overlays still resolve.
 *
 * The fallback is a one-way ratchet: it never *replaces* a root-scope
 * match. Consumers that want a strictly scoped lookup can call
 * `getRoot().querySelector(...)` directly.
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
 * Query for an element by ID. Scoped to the configured root with a
 * `document` fallback for body-level overlays.
 */
export function $id(id) {
  const root = getRoot();
  if (root.nodeType === 1 && root.id === id) return root;
  let found = root.querySelector("#" + id);
  if (!found && root !== document) {
    found = document.querySelector("#" + id);
  }
  return found;
}

/**
 * Query for the first matching element. Scoped to the configured root
 * with a `document` fallback when the root yields nothing.
 */
export function $sel(selector) {
  const root = getRoot();
  let found = root.querySelector(selector);
  if (!found && root !== document) {
    found = document.querySelector(selector);
  }
  return found;
}

/**
 * Query for all matching elements. Scoped to the configured root with a
 * `document` fallback used only when the root has zero matches (so we
 * never return overlapping NodeLists). Callers that need a strict
 * root-scoped list can call `getRoot().querySelectorAll(...)` directly.
 */
export function $all(selector) {
  const root = getRoot();
  const fromRoot = root.querySelectorAll(selector);
  if (fromRoot.length > 0 || root === document) return fromRoot;
  return document.querySelectorAll(selector);
}
