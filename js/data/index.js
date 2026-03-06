/**
 * Data index - re-exports all data as the AppData object plus STEPS and STAGE_TABS.
 */

import { STEPS, STAGE_TABS } from "./steps.js";
import {
  mapConfig,
  resources,
  sewageInfrastructure,
  siliconIsland,
  kyushuEnergy,
} from "./resources.js";
import {
  talentPipeline,
  employmentData,
  sciencePark,
  scienceParkZonePlans,
  grandAirportData,
} from "./infrastructure.js";
import {
  governmentChain,
  governmentTiers,
  kumamotoPrefectureBoundary,
} from "./government.js";
import { companies } from "./companies.js";
import {
  futureZones,
  investmentZones,
  gktk,
  properties,
  areaStats,
  jasmLocation,
} from "./properties.js";
import { evidenceGroups } from "./evidence.js";
import {
  airlineRoutes,
  infrastructureRoads,
  infrastructureStation,
  haramizuStation,
  dataLayers,
  demandProjections,
} from "./data-layers.js";

const AppData = {
  mapConfig,
  resources,
  sewageInfrastructure,
  siliconIsland,
  kyushuEnergy,
  talentPipeline,
  employmentData,
  sciencePark,
  scienceParkZonePlans,
  grandAirportData,
  governmentChain,
  governmentTiers,
  kumamotoPrefectureBoundary,
  companies,
  futureZones,
  investmentZones,
  gktk,
  properties,
  areaStats,
  jasmLocation,
  airlineRoutes,
  infrastructureRoads,
  infrastructureStation,
  haramizuStation,
  evidenceGroups,
  dataLayers,
  demandProjections,
};

export { STEPS, STAGE_TABS, AppData };
