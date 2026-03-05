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
import { UI } from "./ui.js";
import { TIMING, App } from "./app.js";
import { StepJumper } from "./dev/step-jumper.js";
import { QAReporter } from "./dev/qa-reporter.js";

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
window.StepJumper = StepJumper;
window.QAReporter = QAReporter;

// Module scripts are deferred, so the DOM is ready at this point.
App.init();
StepJumper.init();
QAReporter.init();
