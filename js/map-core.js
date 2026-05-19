/**
 * Map core entry point — the framework-agnostic mount API.
 *
 * This is Stage 1 of the package extraction (see docs/plans/
 * map-core-extraction-execution-plan.md). The goal of Stage 1 is to
 * establish the mountMap / destroy surface area without changing
 * runtime behavior. The standalone app (js/main.js) now boots through
 * mountMap instead of calling App.init directly.
 *
 * Later stages will:
 * - Stage 2: scope DOM queries to targetEl instead of document.
 * - Stage 3: accept and apply options (mapboxToken, scenes, startStep,
 *            lang, theme, embedHost, tourUrl) instead of relying on URL params.
 * - Stage 4: tag and consume from value-add-prototype's step-12 embed.
 * - Stage 5: switch step-6 too and retire pnpm sync.
 *
 * Today (Stage 1):
 * - mountMap(targetEl, options) calls App.init() exactly as before.
 *   targetEl and options are accepted but not yet acted on.
 * - destroy() is a stub. Standalone never calls it. The real
 *   implementation lands in Stage 3 when consumers (value-add-prototype)
 *   need to remount the map between slides.
 */

import { App } from "./app.js";
import { setRoot } from "./shared/dom-scope.js";

let _mounted = false;

/**
 * Mount the map experience.
 *
 * @param {HTMLElement} [_targetEl] - The container element. Currently ignored;
 *   the map assumes a pre-existing #app-container in the DOM. Stage 2 will
 *   scope DOM queries to this element.
 * @param {object} [_options] - Mount-time config. Currently ignored; URL params
 *   are still the source of truth. Stage 3 will switch precedence to options.
 * @returns {{ destroy: () => void }} A handle with a destroy method.
 */
export function mountMap(_targetEl, _options = {}) {
  if (_mounted) {
    console.warn(
      "[map-core] mountMap called while already mounted. Stage 1 only " +
        "supports a single mount per page; call destroy() before remounting " +
        "(destroy is a stub until Stage 3).",
    );
  }
  _mounted = true;

  // Stage 2: scope subsequent helper queries (`$id`, `$sel`, `$all`) to the
  // targetEl. For the standalone app this is `#app-container` and behavior
  // matches the previous document-scoped lookups (scaffold is a child of doc).
  // For future package consumers this scopes the map's DOM queries to their
  // container instead of the global document.
  setRoot(_targetEl || document);

  // Existing init runs against the page DOM. Stage 3 will pass options through.
  App.init();

  return { destroy };
}

/**
 * Tear down the mounted map and reset state for a future mount.
 *
 * Stage 1: stub. The standalone app never calls destroy. The full
 * implementation (Mapbox cleanup, marker removal, chart teardown, event
 * listener removal, state reset) lands in Stage 3 once value-add-prototype
 * needs to remount the map between slides.
 */
export function destroy() {
  console.warn(
    "[map-core] destroy() is a stub in Stage 1. Full cleanup lands in " +
      "Stage 3 when value-add-prototype starts consuming the package.",
  );
  setRoot(null);
  _mounted = false;
}
