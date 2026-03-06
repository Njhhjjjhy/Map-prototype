/**
 * Step definitions for the 12-step journey.
 */

export const STEPS = [
  {
    id: "resources",
    index: 1,
    title: "Resources",
    subtitle: "Water and power infrastructure",
    cameraKey: "A0",
    layers: ["resources"],
    panelTabs: ["Evidence"],
    subItems: [
      { id: "water", label: "Water resources", icon: "droplet" },
      { id: "power", label: "Power resources", icon: "zap" },
    ],
  },
  {
    id: "strategic-location",
    index: 2,
    title: "Strategic location",
    subtitle: "Kyushu position in Asia",
    cameraKey: "A3_location",
    layers: ["airlineRoutes"],
    panelTabs: ["Evidence"],
    subItems: [],
  },
  {
    id: "government-support",
    index: 3,
    title: "Government support",
    subtitle: "National to local commitment",
    cameraKey: "A4_government",
    layers: ["governmentChain"],
    panelTabs: ["Support", "Dashboard"],
    subItems: [
      { id: "central", label: "Central government", icon: "landmark" },
      { id: "prefectural", label: "Prefectural government", icon: "building" },
      { id: "local", label: "Local municipalities", icon: "home" },
    ],
  },
  {
    id: "corporate-investment",
    index: 4,
    title: "Corporate investment",
    subtitle: "Seven major players",
    cameraKey: "B4",
    layers: ["companies", "semiconductorNetwork"],
    panelTabs: ["Investment", "Companies"],
    subItems: [],
  },
  {
    id: "transport-access",
    index: 5,
    title: "Science park and grand airport",
    subtitle: "Development zones and airport connectivity",
    cameraKey: "B6_scienceParkAirport",
    layers: ["sciencePark"],
    panelTabs: ["Overview"],
    subItems: [
      {
        id: "science-park-group",
        label: "Science park",
        icon: "flask-conical",
        children: [
          {
            id: "sp-gov-zone",
            label: "Government zone plan",
            icon: "target",
          },
          {
            id: "sp-kikuyo-plan",
            label: "Kikuyo long-term plan",
            icon: "map-pin",
          },
          {
            id: "sp-ozu-plan",
            label: "Ozu long-term plan",
            icon: "map-pin",
          },
        ],
      },
      {
        id: "grand-airport-group",
        label: "Grand airport concept",
        icon: "plane",
        children: [
          {
            id: "ga-airport-access",
            label: "Airport access",
            icon: "plane",
          },
          {
            id: "ga-railway-stations",
            label: "New railway stations",
            icon: "train-front",
          },
          {
            id: "ga-road-extensions",
            label: "Road extensions",
            icon: "route",
          },
        ],
      },
    ],
  },
  {
    id: "education-pipeline",
    index: 6,
    title: "Education and talent pipeline",
    subtitle: "Universities, training, and employment",
    cameraKey: "A3_talent",
    layers: ["talentPipeline"],
    panelTabs: ["Education", "Employment"],
    subItems: [
      { id: "universities", label: "Universities", icon: "graduation-cap" },
      { id: "employment", label: "Employment data", icon: "briefcase" },
    ],
  },
  {
    id: "future-outlook",
    index: 7,
    title: "Future outlook",
    subtitle: "Composite 2030+ vision",
    cameraKey: "B6",
    layers: [
      "sciencePark",
      "futureZones",
      "infrastructureRoads",
      "investmentZones",
    ],
    panelTabs: ["Plans", "Timeline"],
    showTimeToggle: true,
    subItems: [],
  },
  {
    id: "investment-zones",
    index: 8,
    title: "Investment opportunity zones",
    subtitle: "Three zones in the silicon triangle",
    cameraKey: "corridor",
    layers: ["investmentZones"],
    panelTabs: ["Zones", "Metrics"],
    subItems: [
      { id: "kikuyo-zone", label: "Kikuyo", icon: "target" },
      { id: "ozu-zone", label: "Ozu", icon: "target" },
      { id: "koshi-zone", label: "Koshi", icon: "target" },
    ],
  },
  {
    id: "properties",
    index: 9,
    title: "Properties",
    subtitle: "Investment opportunities",
    cameraKey: "corridor",
    layers: ["investmentZones"],
    panelTabs: ["Truth engine", "Future outlook", "Financials", "Images"],
    subItems: [
      { id: "kikuyo-properties", label: "Kikuyo properties", icon: "house" },
      { id: "ozu-properties", label: "Ozu properties", icon: "house" },
    ],
  },
  {
    id: "final",
    index: 10,
    title: "Journey complete",
    subtitle: "Summary and Q&A",
    cameraKey: "complete",
    layers: [],
    panelTabs: [],
    subItems: [],
  },
];

export const STAGE_TABS = {};
STEPS.forEach((s) => {
  STAGE_TABS[s.index] = { label: s.subtitle, tabs: s.panelTabs };
});
