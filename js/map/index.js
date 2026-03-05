/**
 * MapController facade - composes all sub-modules into the public API.
 *
 * State from state.js is mixed in first so that `this.*` references
 * in method bodies resolve to the composed object's own properties.
 */

import { state } from "./state.js";
import {
  MAP_COLORS,
  CAMERA_FEELINGS,
  CINEMATIC_SCALE,
  CAMERA_STEPS,
} from "./constants.js";
import { methods as coreMethods } from "./core.js";
import { methods as cameraMethods } from "./camera.js";
import { methods as markerMethods } from "./markers.js";
import { methods as airlineMethods } from "./airlines.js";
import { methods as heartbeatMethods } from "./heartbeat.js";
import { methods as resourceMethods } from "./resources.js";
import { methods as zoneMethods } from "./zones.js";
import { methods as propertyMethods } from "./properties.js";
import { methods as infrastructureMethods } from "./infrastructure.js";
import { methods as dataLayerMethods } from "./data-layers.js";

const MapController = Object.assign(
  {},
  state,
  coreMethods,
  cameraMethods,
  markerMethods,
  airlineMethods,
  heartbeatMethods,
  resourceMethods,
  zoneMethods,
  propertyMethods,
  infrastructureMethods,
  dataLayerMethods,
);

export { MAP_COLORS, CAMERA_FEELINGS, CAMERA_STEPS, MapController };
