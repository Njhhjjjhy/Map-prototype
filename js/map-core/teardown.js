/**
 * Tear down all module-level state set up by `mountMap()`.
 *
 * Runs in destroy() and must leave the document in a state where
 * mountMap can be called again on a fresh container without picking up
 * stale Mapbox handles, Chart.js instances, event listeners, or DOM
 * overlays.
 *
 * Imported lazily inside `destroy()` to keep this file off the hot
 * path during init.
 */
import { MapController } from "../map/index.js";
import { UI } from "../ui/index.js";
import { App } from "../app.js";
import { state as uiState } from "../ui/state.js";

export function teardownAll() {
  // --- Animations and async work ---
  if (App._transitioning) App._transitioning = false;

  // --- Charts (Chart.js instances) ---
  if (uiState.charts) {
    Object.keys(uiState.charts).forEach((id) => {
      try {
        uiState.charts[id].destroy();
      } catch (_e) {}
      delete uiState.charts[id];
    });
  }

  // --- Map: layers, markers, then the Mapbox instance itself ---
  try {
    MapController.destroy();
  } catch (_e) {}
  if (MapController.map) {
    try {
      MapController.map.remove();
    } catch (_e) {}
    MapController.map = null;
  }
  MapController.initialized = false;
  MapController._initStarted = false;
  MapController._readyPromise = null;

  // --- DOM overlays the package may have appended ---
  document.querySelectorAll(".moreharvest-entry").forEach((el) => el.remove());
  document.querySelectorAll(".mapboxgl-marker").forEach((el) => {
    if (el.parentNode) el.remove();
  });
  document.querySelectorAll(".elevated-marker").forEach((el) => {
    if (el.parentNode) el.remove();
  });
  const cover = document.getElementById("__setup-cover");
  if (cover && cover.parentNode) cover.parentNode.removeChild(cover);

  // --- Tour iframe (might be open) ---
  if (uiState.valueAddTourIframe && uiState.valueAddTourIframe.parentNode) {
    try {
      UI.closeValueAddTour();
    } catch (_e) {
      uiState.valueAddTourIframe.parentNode.removeChild(uiState.valueAddTourIframe);
    }
  }

  // --- App state reset ---
  App.state.currentStep = 0;
  App.state.subItemsExplored = [];
  App.state.expandedGroups = [];
  App.state.activeProperty = null;
  App.state.futureView = false;
  App.state.activeEnergyTypes = [];
  App.state.activeGovernmentLevels = [];
  App.state.visitedGovernmentLevels = [];
  App.state.activeInvestmentZones = [];
  App.state.activeUniversities = [];
  App.state.activeEmployers = [];
  App.state.qaMode = false;

  // --- UI state reset (high-traffic fields only — anything else gets reset
  //     on next init via UI.init()) ---
  uiState.elements = {};
  uiState.panelOpen = false;
  uiState.layersPanelOpen = false;
  uiState.activeDataLayers = {};
  uiState._dataLayerDashboardActive = false;
  uiState.panelHistory = [];
  uiState.currentPanelView = null;
  uiState.currentPanelViewFunction = null;

  // --- Document-level attributes the package may have set ---
  document.documentElement.removeAttribute("data-embed");
  document.documentElement.removeAttribute("data-embed-host");
  document.documentElement.removeAttribute("data-chromeless");
}
