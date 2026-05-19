/**
 * Map core entry point — the framework-agnostic mount API.
 *
 * Stage 3 of the package extraction (see docs/plans/
 * map-core-extraction-execution-plan.md). The `mountMap` surface
 * now accepts a full options object, applies it before booting the
 * existing App / UI / MapController stack, and `destroy()` tears
 * everything back down so the same page can mount again.
 *
 * Options applied here (resolved via map-core/options.js, with URL
 * fallbacks for the standalone shell):
 *   - mapboxToken: written to `window.MAPBOX_ACCESS_TOKEN` so
 *     `MapController.init()` picks it up.
 *   - scenes: forwarded to `setScenes()` which rebuilds STEPS in
 *     place (replaces the old module-load IIFE filter).
 *   - startStep: stashed on `App._startStep`; `App.init()` reads it
 *     after the first camera flight and jumps the journey.
 *   - lang: written to localStorage and re-applied to i18next so
 *     `setScenes()` produces strings in the chosen language.
 *   - embedHost: sets `data-embed` / `data-embed-host` attributes
 *     and wires up the iPhone or valueadd host helpers from
 *     map-core/embed-*.js.
 *   - chromeless: sets `data-chromeless` on <html>.
 *   - tourUrl: forwarded to UI so the property tour iframe loads
 *     the configured URL (pass `null` to disable).
 *   - onReady / onComplete / onError: lifecycle hooks invoked from
 *     `App.init()` / the valueadd embed's click intercept /
 *     MapController error paths.
 *
 * `destroy()` runs the teardown sequence in map-core/teardown.js:
 * Mapbox `map.remove()`, marker DOM cleanup, Chart.js teardown,
 * event listener removal, App / UI state reset, and removal of any
 * document-level attributes the package set.
 */

import { TIMING, App } from "./app.js";
import { setRoot } from "./shared/dom-scope.js";
import { STEPS, STAGE_TABS, AppData, setScenes } from "./data/index.js";
import {
  MAP_COLORS,
  CAMERA_FEELINGS,
  CAMERA_STEPS,
  MapController,
} from "./map/index.js";
import { UI } from "./ui/index.js";
import { i18n } from "./i18n/index.js";
import { resolveOptions } from "./map-core/options.js";
import { setupIPhoneEmbed } from "./map-core/embed-iphone.js";
import { setupValueAddEmbed } from "./map-core/embed-valueadd.js";
import { teardownAll } from "./map-core/teardown.js";
import { SCAFFOLD_HTML } from "./map-core/scaffold.js";

// Expose globals required by inline onclick handlers across the
// scaffold HTML and JS-generated markup. The standalone shell used to
// set these from js/main.js; doing it here means every consumer of
// mountMap() gets them without having to know what to wire up.
function exposeGlobals() {
  if (typeof window === "undefined") return;
  window.STEPS = STEPS;
  window.STAGE_TABS = STAGE_TABS;
  window.AppData = AppData;
  window.MAP_COLORS = MAP_COLORS;
  window.CAMERA_FEELINGS = CAMERA_FEELINGS;
  window.CAMERA_STEPS = CAMERA_STEPS;
  window.MapController = MapController;
  window.UI = UI;
  window.TIMING = TIMING;
  window.App = App;
}

let _mounted = false;
let _embedTeardown = null;
let _resolvedOptions = null;

/**
 * Mount the map experience.
 *
 * @param {HTMLElement} [targetEl] - The container element. Scopes the
 *   package's DOM queries via `setRoot`. Defaults to `document` when
 *   omitted (used by the standalone where the scaffold is at the page
 *   root).
 * @param {object} [options] - Mount-time config. See file header for
 *   the full list and resolution precedence.
 * @returns {{ destroy: () => void }} A handle with a destroy method.
 */
export function mountMap(targetEl, options = {}) {
  if (_mounted) {
    console.warn(
      "[map-core] mountMap called while already mounted. Call destroy() " +
        "before remounting.",
    );
  }
  _mounted = true;

  exposeGlobals();

  const opts = resolveOptions(options);
  _resolvedOptions = opts;

  // --- Language: apply BEFORE setScenes so the rebuilt STEPS picks up
  //     the chosen translations. Falls back to whatever i18next loaded
  //     at module init time when no lang option / URL param is given.
  if (opts.lang && opts.lang !== i18n.language) {
    try {
      localStorage.setItem("app-lang", opts.lang);
    } catch (_e) {}
    document.documentElement.lang = opts.lang;
    i18n.changeLanguage(opts.lang);
  }

  // --- Scenes: rebuild STEPS / STAGE_TABS in place.
  setScenes(opts.scenes);

  // --- DOM scaffold. The standalone shell has the full scaffold in
  //     index.html, so #map already exists. When a consumer mounts
  //     into an empty element (no #map descendant) we inject the
  //     scaffold from map-core/scaffold.js so $id() lookups + Mapbox's
  //     own document.getElementById('map') resolve.
  if (
    targetEl &&
    targetEl !== document &&
    targetEl.nodeType === 1 &&
    !targetEl.querySelector("#map")
  ) {
    targetEl.innerHTML = SCAFFOLD_HTML;
  }

  // --- DOM scope root for $id / $sel / $all helpers.
  setRoot(targetEl || document);

  // --- Mapbox token: kept on window for MapController.init() which
  //     reads `window.MAPBOX_ACCESS_TOKEN`. (A later cleanup pass can
  //     pass it directly; this preserves the existing contract.)
  if (opts.mapboxToken) {
    window.MAPBOX_ACCESS_TOKEN = opts.mapboxToken;
  }

  // --- Tour URL: stash for `UI.openValueAddTour` to read at click time.
  //     `null` disables the tour launch.
  window.__GKTK_TOUR_URL = opts.tourUrl;

  // --- Embed-mode document attributes (replaces the inline scripts that
  //     used to live at the top of index.html). Setting them now, before
  //     `App.init()` paints, prevents the bundle's default chrome from
  //     flashing through.
  if (opts.embedHost) {
    document.documentElement.setAttribute("data-embed", "1");
    document.documentElement.setAttribute(
      "data-embed-host",
      opts.embedHost === "iphone" ? "" : opts.embedHost,
    );
    if (opts.embedHost === "iphone") {
      // The iPhone host historically left `data-embed-host` unset.
      // Remove the empty value we just wrote to preserve CSS selectors
      // like `:not([data-embed-host="valueadd"])`.
      document.documentElement.removeAttribute("data-embed-host");
    }
  }
  if (opts.chromeless) {
    document.documentElement.setAttribute("data-chromeless", "1");
  }

  // --- Embed-mode behavior. iPhone host waits for DOMContentLoaded
  //     internally; valueadd host runs immediately.
  if (opts.embedHost === "iphone") {
    if (document.readyState === "loading") {
      const onReady = () => {
        document.removeEventListener("DOMContentLoaded", onReady);
        _embedTeardown = setupIPhoneEmbed();
      };
      document.addEventListener("DOMContentLoaded", onReady);
    } else {
      _embedTeardown = setupIPhoneEmbed();
    }
  } else if (opts.embedHost === "valueadd") {
    const handle = setupValueAddEmbed({ onComplete: opts.onComplete });
    _embedTeardown = handle.teardown;
  }

  // --- Lifecycle hooks. The valueadd embed already calls onComplete on
  //     forward-at-last-step; the standalone wires it through App.
  App._startStep = opts.startStep;
  App._onReady = () => {
    try {
      opts.onReady();
    } catch (_e) {}
  };
  App._onError = (err) => {
    try {
      opts.onError(err);
    } catch (_e) {}
  };

  // --- Existing init runs against the page DOM.
  App.init();

  return { destroy };
}

/**
 * Tear down the mounted map and reset state for a future mount.
 */
export function destroy() {
  if (!_mounted) return;

  if (typeof _embedTeardown === "function") {
    try {
      _embedTeardown();
    } catch (_e) {}
    _embedTeardown = null;
  }

  try {
    teardownAll();
  } catch (_e) {}

  setRoot(null);
  delete window.__GKTK_TOUR_URL;
  App._startStep = null;
  App._onReady = null;
  App._onError = null;
  _resolvedOptions = null;
  _mounted = false;
}
