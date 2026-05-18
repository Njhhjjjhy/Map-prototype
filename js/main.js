/**
 * Module entry point - imports all modules, exposes globals, and boots the app.
 *
 * All scripts are loaded as ES modules. Inline onclick handlers in HTML
 * and JS-generated markup reference globals (App, UI, MapController, etc.),
 * so we assign them to window here.
 */

import { STEPS, STAGE_TABS, AppData } from "./data/index.js";
import {
  MAP_COLORS,
  CAMERA_FEELINGS,
  CAMERA_STEPS,
  MapController,
} from "./map/index.js";
import { UI } from "./ui/index.js";
import { TIMING, App } from "./app.js";

// Expose all globals for inline onclick handlers and cross-module references
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

// Dev-only QA tools: step jumper, QA reporter, camera explorer, camera debug.
// In production builds (Vercel), import.meta.env.DEV is false and this block is
// stripped out, so the QA tools never load and their UI is removed from the DOM
// BEFORE App.init() runs (so map/core.js camera-debug setup short-circuits).
if (!import.meta.env.DEV) {
  const devSelectors = [
    "#step-jumper-toggle",
    "#step-jumper",
    "#camera-explorer-toggle",
    "#camera-explorer",
    "#qa-toggle",
    "#qa-panel",
    "#camera-debug-toggle",
    "#camera-debug",
    "#layers-toggle",
    "#data-layers",
  ];
  devSelectors.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.style.setProperty("display", "none", "important");
  });
}

// Module scripts are deferred, so the DOM is ready at this point.
App.init();

if (import.meta.env.DEV) {
  const [
    { StepJumper },
    { QAReporter },
    { CameraExplorer },
  ] = await Promise.all([
    import("./dev/step-jumper.js"),
    import("./dev/qa-reporter.js"),
    import("./dev/camera-explorer.js"),
  ]);
  window.StepJumper = StepJumper;
  window.QAReporter = QAReporter;
  window.CameraExplorer = CameraExplorer;
  StepJumper.init();
  QAReporter.init();
  CameraExplorer.init();

  // Backtick (`) toggles every dev/QA tool at once. CSS in index.html keys off
  // [data-dev-hidden="1"] on <html>. Ignored when typing in inputs.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "`") return;
    const ae = document.activeElement;
    const tag = ae && ae.tagName;
    if (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      (ae && ae.isContentEditable)
    ) {
      return;
    }
    e.preventDefault();
    const root = document.documentElement;
    if (root.getAttribute("data-dev-hidden") === "1") {
      root.removeAttribute("data-dev-hidden");
    } else {
      root.setAttribute("data-dev-hidden", "1");
    }
  });
}
