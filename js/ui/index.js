/**
 * UI facade - composes all sub-modules into the public API.
 *
 * State from state.js is mixed in first so that `this.*` references
 * in method bodies resolve to the composed object's own properties.
 */

import { state } from "./state.js";
import { methods as coreMethods } from "./core.js";
import { methods as cardMethods } from "./cards.js";
import { methods as chartMethods } from "./charts.js";
import { methods as dataLayerMethods } from "./data-layers.js";
import { methods as aiChatMethods } from "./ai-chat.js";
import { methods as overlayMethods } from "./overlays.js";
import { methods as evidenceMethods } from "./evidence.js";
import { methods as inspectorMethods } from "./inspector.js";

const UI = Object.assign(
  {},
  state,
  coreMethods,
  cardMethods,
  chartMethods,
  dataLayerMethods,
  aiChatMethods,
  overlayMethods,
  evidenceMethods,
  inspectorMethods,
);

export { UI };
