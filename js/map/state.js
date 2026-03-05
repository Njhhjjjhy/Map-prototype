/**
 * Shared state for MapController sub-modules.
 *
 * core.js owns and initializes the state. Sub-modules import
 * the `state` object to read and mutate shared values.
 */

const state = {
  map: null,
  initialized: false,
  _initStarted: false,
  _readyPromise: null,
  _currentAnimation: null,
  reducedMotion: false,
  revealing: false,
  corridorMode: false,
  _corridorView: null,
  _previousView: null,

  // Marker tracking
  markers: {},
  _markerElements: {},
  popups: {},

  // Layer tracking
  _layerGroups: {
    resources: [],
    sciencePark: [],
    companies: [],
    futureZones: [],
    properties: [],
    route: [],
    evidenceMarkers: [],
    infrastructureRoads: [],
    airlineRoutes: [],
    kyushuEnergy: [],
    energySolar: [],
    energyWind: [],
    energyNuclear: [],
    governmentChain: [],
    governmentArc: [],
    prefectureHighlight: [],
    municipalityCircles: [],
    investmentZones: [],
    semiconductorNetwork: [],
    talentPipeline: [],
    resourceArcs: [],
    zonePlanHighlight: [],
    grandAirportAccess: [],
    grandAirportRailway: [],
    grandAirportRoads: [],
    propertyContextLines: [],
    railCommute: [],
    infraPlan: [],
  },

  // Road extension animation tracking
  _roadDrawRafs: [],
  _roadPulseTimeout: null,

  // Infrastructure road tracking
  selectedInfrastructureRoad: null,
  infrastructureRoadPolylines: {},
  infrastructureMarkers: [],

  // Airline route tracking
  airlineRoutePolylines: [],
  airlineDestinationMarkers: [],
  airlineOriginMarker: null,

  // Data layer tracking
  dataLayerMarkers: {},
  _dataLayerGroups: {},

  // Animated route layer tracking
  _animatedLayers: {
    trafficFlow: { active: false, routes: [] },
    railCommute: { active: false, routes: [] },
  },
  _animationFrame: null,
  _animationOffset: 0,

  // Energy type line animation tracking
  _energyLineAnimations: {},

  // Evidence marker tracking
  highlightedEvidenceMarker: null,

  // Pre-data-layer view save
  preDataLayerView: null,

  // Infrastructure plan cache
  _infraPlanCache: null,

  // Airport route tracking
  _airportRoutePulseTimer: null,
  _airportRoutePopup: null,
  _airportRouteHandlers: [],

  // Railway pulse tracking
  _railwayPulseTimer: null,

  // Road extension tracking
  _roadExtPopup: null,
  _roadExtHandlers: [],
  _roadExtPulseTimer: null,

  // Road index map
  _roadIndexMap: null,

  // Energy station highlight
  _highlightedEnergyStation: null,

  // Line grow animations
  _lineGrowAnimations: {},

  // TSMC HQ marker
  tsmcHqMarker: null,

  // Route shimmer state
  _routeShimmerActive: false,

  // Rail commute inline data
  _railCommuteData: {
    routes: [
      {
        id: "kumamoto-hikarinomori",
        name: "Kumamoto to Hikarinomori",
        color: "#4A90D9",
        path: [
          [32.7904, 130.6885],
          [32.812, 130.725],
          [32.842, 130.768],
          [32.8582, 130.7867],
        ],
      },
      {
        id: "kumamoto-haramizu",
        name: "Kumamoto to Haramizu",
        color: "#5DBB63",
        path: [
          [32.7904, 130.6885],
          [32.812, 130.725],
          [32.842, 130.768],
          [32.8582, 130.7867],
          [32.8707, 130.8292],
        ],
      },
      {
        id: "kumamoto-higo-ozu",
        name: "Kumamoto to Higo-Ozu",
        color: "#E85D4C",
        path: [
          [32.7904, 130.6885],
          [32.812, 130.725],
          [32.842, 130.768],
          [32.8582, 130.7867],
          [32.8707, 130.8292],
          [32.8776, 130.8662],
        ],
      },
    ],
  },

  // Infrastructure plan metadata
  _infraPlanMeta: {
    "north-liaison-road": {
      name: "North Liaison Road",
      color: "#FBB931",
    },
    "airport-liaison-road": {
      name: "Airport Liaison Road",
      color: "#00D4FF",
    },
  },

  // Heartbeat
  _heartbeat: {
    active: false,
    driftInterval: null,
    bearingPerTick: 0.05,
    tickMs: 1000,
    idleTimeout: null,
    idleThreshold: 5000,
    pulsingMarkers: [],
  },

  // Camera debug (dev only)
  _cameraDebug: {
    active: false,
    rafId: null,
  },
};

export { state };
