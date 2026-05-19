/**
 * Step definitions for the presentation journey.
 *
 * Stage 3 of the map-core extraction: scene filtering moved out of a
 * module-load IIFE and into a runtime `setScenes()` call that mountMap
 * invokes after applying options. STEPS and STAGE_TABS are still
 * exported as live, mutable references — `setScenes()` mutates them
 * in place so existing consumers (which import these eagerly) see the
 * updated state without needing a fresh import.
 */
import { t } from "../i18n/index.js";

function buildSteps() {
  return [
    {
      id: "resources",
      index: 1,
      title: t("Resources"),
      subtitle: t("Water and power infrastructure"),
      cameraKey: "A0",
      layers: ["resources"],
      panelTabs: [t("Evidence")],
      subItems: [
        { id: "water", label: t("Water resources"), icon: "droplet" },
        { id: "power", label: t("Power resources"), icon: "zap" },
      ],
    },
    {
      id: "strategic-location",
      index: 2,
      title: t("Strategic location"),
      subtitle: t("Kyushu position in Asia"),
      cameraKey: "A3_location",
      layers: ["airlineRoutes"],
      panelTabs: [t("Evidence")],
      subItems: [],
    },
    {
      id: "government-support",
      index: 3,
      title: t("Government support"),
      subtitle: t("National to local commitment"),
      cameraKey: "A4_government",
      layers: ["governmentChain"],
      panelTabs: [t("Support"), t("Dashboard")],
      subItems: [
        { id: "central", label: t("Central government"), icon: "landmark" },
        { id: "prefectural", label: t("Prefectural government"), icon: "building" },
        { id: "local", label: t("Local municipalities"), icon: "home" },
      ],
    },
    {
      id: "corporate-investment",
      index: 4,
      title: t("Corporate investment"),
      subtitle: t("Seven major players"),
      cameraKey: "B4",
      layers: ["companies", "semiconductorNetwork"],
      panelTabs: [t("Investment"), t("Companies")],
      subItems: [],
    },
    {
      id: "transport-access",
      index: 5,
      title: t("Science park and grand airport"),
      subtitle: t("Development zones and airport connectivity"),
      cameraKey: "B6_scienceParkAirport",
      layers: ["sciencePark"],
      panelTabs: [t("Overview")],
      subItems: [
        {
          id: "science-park-group",
          label: t("Science park"),
          icon: "flask-conical",
          children: [
            {
              id: "sp-gov-zone",
              label: t("Government zone plan"),
              icon: "target",
            },
            {
              id: "sp-kikuyo-plan",
              label: t("Kikuyo long-term plan"),
              icon: "map-pin",
            },
            {
              id: "sp-ozu-plan",
              label: t("Ozu long-term plan"),
              icon: "map-pin",
            },
          ],
        },
        {
          id: "grand-airport-group",
          label: t("Grand airport concept"),
          icon: "plane",
          children: [
            {
              id: "ga-airport-access",
              label: t("Airport access"),
              icon: "plane",
            },
            {
              id: "ga-railway-stations",
              label: t("New railway stations"),
              icon: "train-front",
            },
            {
              id: "ga-road-extensions",
              label: t("Road extensions"),
              icon: "route",
            },
            {
              id: "ga-ten-twenty-concept",
              label: t("10-20 minute concept"),
              icon: "clock",
            },
          ],
        },
      ],
    },
    {
      id: "education-pipeline",
      index: 6,
      title: t("Education and talent pipeline"),
      subtitle: t("Universities, training, and employment"),
      cameraKey: "A3_talent",
      layers: ["talentPipeline"],
      panelTabs: [t("Education"), t("Employment")],
      subItems: [
        { id: "universities", label: t("Universities"), icon: "graduation-cap" },
        { id: "employment", label: t("Employment data"), icon: "briefcase" },
      ],
    },
    {
      id: "future-outlook",
      index: 7,
      title: t("Future outlook"),
      subtitle: t("Composite 2030+ vision"),
      cameraKey: "B6",
      layers: [],
      panelTabs: [t("Plans"), t("Timeline")],
      showTimeToggle: true,
      subItems: [],
    },
    {
      id: "investment-zones",
      index: 8,
      title: t("Investment opportunity zones"),
      subtitle: t("Three zones in the silicon triangle"),
      cameraKey: "corridor",
      layers: ["investmentZones"],
      panelTabs: [t("Zones"), t("Metrics")],
      subItems: [
        { id: "central-city-zone", label: t("Central city"), icon: "target" },
        { id: "middle-zone", label: t("Middle zone"), icon: "target" },
        { id: "jasm-zone", label: t("JASM"), icon: "target" },
      ],
    },
    {
      id: "properties",
      index: 9,
      title: t("Properties"),
      subtitle: t("Investment opportunities"),
      cameraKey: "corridor",
      layers: ["investmentZones"],
      panelTabs: [t("Truth engine"), t("Future outlook"), t("Financials"), t("Images")],
      subItems: [
        { id: "kikuyo-properties", label: t("Kikuyo properties"), icon: "house" },
        { id: "ozu-properties", label: t("Ozu properties"), icon: "house" },
      ],
    },
    {
      id: "final",
      index: 10,
      title: t("Journey complete"),
      subtitle: t("Summary and Q&A"),
      cameraKey: "complete",
      layers: [],
      panelTabs: [],
      subItems: [],
    },
  ];
}

/**
 * Live, mutable arrays. Other modules import these eagerly and read
 * them at runtime. `setScenes()` rebuilds the contents in place so
 * those references stay valid.
 */
export const STEPS = buildSteps();
export const STAGE_TABS = {};
rebuildStageTabs();

function rebuildStageTabs() {
  Object.keys(STAGE_TABS).forEach((k) => delete STAGE_TABS[k]);
  STEPS.forEach((s) => {
    STAGE_TABS[s.index] = { label: s.subtitle, tabs: s.panelTabs };
  });
}

/**
 * Configure which scenes (by id, in order) are active for this mount.
 *
 * Pass `undefined`, an empty array, or no argument to use the full set
 * of steps. When `sceneIds` is given, STEPS is filtered down to those
 * ids in the requested order and `index` is renumbered 1..N. This was
 * previously a module-load IIFE driven by the `?steps=` URL param.
 */
export function setScenes(sceneIds) {
  const fresh = buildSteps();

  let filtered = fresh;
  if (Array.isArray(sceneIds) && sceneIds.length > 0) {
    const byId = new Map(fresh.map((s) => [s.id, s]));
    const picked = sceneIds.map((id) => byId.get(id)).filter(Boolean);
    if (picked.length > 0) filtered = picked;
  }
  filtered.forEach((s, i) => {
    s.index = i + 1;
  });

  STEPS.splice(0, STEPS.length, ...filtered);
  rebuildStageTabs();
}
