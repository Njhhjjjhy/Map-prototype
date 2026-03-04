/**
 * Mock data for Kumamoto Investment Presentation
 * All data is placeholder for demonstration purposes
 */

/**
 * Linear 12-step journey definition.
 * Each step is a self-contained map scene.
 * `id` is the canonical identifier used by App.state.currentStep.
 * `cameraKey` references a CAMERA_STEPS entry in map-controller.js.
 * `layers` lists which marker/layer groups to show (all others hidden on step entry).
 * `subItems` defines clickable items within the step (shown in chatbox).
 * `panelTabs` defines the right panel tab set for the step.
 */
const STEPS = [
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
    title: "Education pipeline",
    subtitle: "Universities, training, and employment",
    cameraKey: "A3_talent",
    layers: ["talentPipeline"],
    panelTabs: ["Education", "Employment"],
    subItems: [
      { id: "universities", label: "Universities", icon: "graduation-cap" },
      { id: "training", label: "Training centers", icon: "school" },
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
      { id: "koshi-zone", label: "Koshi zone", icon: "target" },
      { id: "kikuyo-zone", label: "Kikuyo zone", icon: "target" },
      { id: "ozu-zone", label: "Ozu zone", icon: "target" },
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
      { id: "ozu-properties", label: "Ozu properties", icon: "house" },
      { id: "kikuyo-properties", label: "Kikuyo properties", icon: "house" },
      {
        id: "haramizu-developments",
        label: "Haramizu developments",
        icon: "house",
      },
    ],
  },
  {
    id: "final",
    index: 10,
    title: "Journey complete",
    subtitle: "Summary and Q&A",
    cameraKey: "complete",
    layers: [
      "companies",
      "investmentZones",
      "infrastructureRoads",
      "sciencePark",
    ],
    panelTabs: [],
    subItems: [],
  },
];

/**
 * Tab sets per step index (replaces old STAGE_TABS).
 */
const STAGE_TABS = {};
STEPS.forEach((s) => {
  STAGE_TABS[s.index] = { label: s.subtitle, tabs: s.panelTabs };
});

const AppData = {
  // Map center and zoom settings
  mapConfig: {
    center: [32.8, 130.75], // Kumamoto Prefecture center
    initialZoom: 10,
    resourceZoom: 12,
    propertyZoom: 14,
  },

  // Q1: Why Kumamoto? - Resources
  resources: {
    water: {
      id: "water",
      name: "Aso Groundwater Basin",
      coords: [32.88, 130.9],
      subtitle: "Natural water resources",
      description:
        "Kumamoto sits atop one of Japan's largest groundwater basins, fed by Mount Aso's volcanic soil. This pristine water supply is critical for semiconductor manufacturing, which requires enormous quantities of ultrapure water.",
      stats: [
        { value: "1.8B", label: "Cubic meters annual capacity" },
        { value: "99.99%", label: "Natural purity level" },
        { value: "¥0", label: "Water acquisition cost" },
        { value: "60%", label: "Lower than Tokyo rates" },
      ],
      evidence: {
        title: "Kumamoto water resources report",
        type: "pdf",
        description:
          "Official government report on groundwater sustainability and industrial allocation",
      },
      // Evidence markers proving water quality
      evidenceMarkers: [
        {
          id: "coca-cola",
          name: "Coca-Cola Bottlers Japan",
          coords: [32.802677, 130.7128],
          subtitle: "Kumamoto plant",
          description:
            "Major beverage manufacturer chose Kumamoto for exceptional water quality and abundance. The plant produces beverages for the entire Kyushu region.",
          stats: [
            { value: "1987", label: "Established" },
            { value: "Minami-ku", label: "Location" },
            { value: "500+", label: "Employees" },
            { value: "Kyushu", label: "Distribution" },
          ],
        },
        {
          id: "suntory",
          name: "Suntory Kyushu Kumamoto Factory",
          coords: [32.746801, 130.791987],
          subtitle: "Premium beverage production",
          description:
            "Suntory selected Kashima, Kamimashiki for its pristine groundwater. The facility produces premium beverages requiring the highest water purity standards.",
          stats: [
            { value: "1991", label: "Established" },
            { value: "Kashima", label: "Location" },
            { value: "Premium", label: "Product grade" },
            { value: "100%", label: "Local water" },
          ],
        },
      ],
    },
    power: {
      id: "power",
      name: "Kyushu Power Grid",
      coords: [32.75, 130.65],
      subtitle: "Power infrastructure",
      description:
        "Kyushu Electric provides stable, competitively priced power to the region. The diverse energy mix ensures grid stability critical for semiconductor manufacturing.",
      stats: [
        { value: "2.4GW", label: "Available industrial capacity" },
        { value: "99.999%", label: "Grid reliability" },
        { value: "¥12/kWh", label: "Industrial rate" },
        { value: "15%", label: "Renewable mix" },
      ],
      evidence: {
        title: "Kyushu Electric infrastructure plan",
        type: "pdf",
        description:
          "Investment roadmap for semiconductor corridor power infrastructure",
      },
      // NEW: Energy mix breakdown (shown in panel, not on map)
      energyMix: {
        description:
          "Kyushu leads Japan in energy diversity, providing the stable power semiconductor fabs require.",
        sources: [
          {
            type: "Solar",
            examples: "Kagoshima 24.7 MW, Fukuoka 22.9 MW, Nagasaki 10 MW",
            icon: "sun",
          },
          {
            type: "Wind",
            examples: "Miyazaki 65.55 MW, Saga/Nagasaki 27.2 MW, Goto offshore",
            icon: "wind",
          },
          {
            type: "Nuclear",
            examples: "Genkai (Saga), Sendai (Kagoshima)",
            icon: "atom",
          },
        ],
      },
    },
  },

  // Q1: Sewage infrastructure
  sewageInfrastructure: {
    id: "sewage",
    name: "Kumamoto Semicon public sewage",
    coords: [32.87, 130.8],
    subtitle: "Specified public sewage district",
    description:
      "Kumamoto Prefecture designated a Semicon Specified Public Sewage district to support expanded industrial and residential demand from the semiconductor corridor. The master plan covers multiple zones across the Koshi area.",
    stats: [
      { value: "1:12,000", label: "Plan scale" },
      { value: "Koshi", label: "Primary coverage" },
      { value: "Prefecture", label: "Decision authority" },
      { value: "Specified", label: "Sewage designation" },
    ],
    evidence: {
      title: "Kumamoto Semicon public sewage master plan",
      type: "pdf",
      description:
        "Kumamoto Prefecture urban plan sewerage change for Semicon Specified Public Sewage district",
      image: "assets/use-case-images/evidence-sewers-utility-systems.webp",
    },
  },

  // Q1: Japan semiconductor materials dominance
  siliconIsland: {
    id: "silicon-island",
    name: "Japan semiconductor materials dominance",
    coords: [33.0, 130.7],
    subtitle: "Global materials and equipment leadership",
    description:
      "Japanese companies hold 8% of global semiconductor production value (¥74.6 trillion market, 2022), but dominate critical materials and equipment: silicon wafers (~60%), photoresist (~70%), encapsulation materials (~80%), and coating equipment (~90%).",
    stats: [
      { value: "8%", label: "Japan production share" },
      { value: "~60-80%", label: "Materials global share" },
      { value: "~90%", label: "Coating equipment share" },
      { value: "¥74.6T", label: "Global market (2022)" },
    ],
    companies: [
      { name: "Mitsubishi Electric", coords: [32.82, 130.8] },
      { name: "Rohm", coords: [32.89, 130.76] },
      { name: "SUMCO", coords: [32.93, 130.7] },
      { name: "Toshiba", coords: [33.25, 130.42] },
      { name: "Sony", coords: [32.9, 130.82] },
    ],
    evidence: {
      title: "Japan semiconductor global market presence (JEITA/WSTS)",
      type: "pdf",
      description:
        "Japan global semiconductor production share and materials/equipment dominance data",
      image: "assets/use-case-images/evidence-silicon-island.webp",
    },
  },

  // Kyushu-wide Energy Infrastructure (for combined utility step)
  kyushuEnergy: {
    solar: [
      {
        id: "solar-kagoshima",
        name: "Kagoshima Solar Installations",
        coords: [31.56, 130.55],
        capacity: "24.7 MW",
        prefecture: "Kagoshima",
      },
      {
        id: "solar-fukuoka",
        name: "Fukuoka Solar Installations",
        coords: [33.59, 130.4],
        capacity: "22.9 MW",
        prefecture: "Fukuoka",
      },
      {
        id: "solar-nagasaki",
        name: "Nagasaki Solar Installations",
        coords: [32.75, 129.87],
        capacity: "10 MW",
        prefecture: "Nagasaki",
      },
    ],
    wind: [
      {
        id: "wind-miyazaki",
        name: "Miyazaki Wind Farm",
        coords: [31.91, 131.42],
        capacity: "65.55 MW",
        prefecture: "Miyazaki",
      },
      {
        id: "wind-saga",
        name: "Saga-Nagasaki Wind Farm",
        coords: [33.25, 129.95],
        capacity: "27.2 MW",
        prefecture: "Saga/Nagasaki",
      },
      {
        id: "wind-goto",
        name: "Goto Offshore Wind",
        coords: [32.7, 128.85],
        capacity: "Offshore",
        prefecture: "Nagasaki",
      },
    ],
    nuclear: [
      {
        id: "nuclear-genkai",
        name: "Genkai Nuclear Power Station",
        coords: [33.515, 129.836],
        capacity: "3.47 GW",
        prefecture: "Saga",
      },
      {
        id: "nuclear-sendai",
        name: "Sendai Nuclear Power Station",
        coords: [31.8336, 130.1894],
        capacity: "1.78 GW",
        prefecture: "Kagoshima",
      },
    ],
    // Per-type evidence summaries for the power sources panel
    evidence: {
      solar: {
        title: "Kyushu solar power capacity",
        subtitle: "Renewable energy base",
        description:
          "Kyushu solar generation capacity has grown steadily since the FIT system launched in 2012. As of September 2024, installed solar capacity across the region reached 12.24 GW, providing the bulk of renewable generation supporting the semiconductor corridor.",
        stats: [
          { value: "12.24GW", label: "Solar capacity (2024)" },
          { value: "57.7 MW", label: "Combined Kyushu sites" },
          { value: "+140MW", label: "Annual growth" },
          { value: "2012", label: "FIT system start" },
        ],
        image: "assets/use-case-images/evidence-renewable-energy.webp",
      },
      wind: {
        title: "Kyushu wind power capacity",
        subtitle: "Renewable energy complement",
        description:
          "Kyushu wind generation complements solar as part of the region's renewable energy base. As of September 2024, installed wind capacity reached 640 MW. The Goto offshore wind project brings deep-water floating turbine technology to the region.",
        stats: [
          { value: "640MW", label: "Wind capacity (2024)" },
          { value: "92.75 MW", label: "Combined Kyushu sites" },
          { value: "Offshore", label: "Goto floating turbines" },
          { value: "12.88GW", label: "Total renewable (solar+wind)" },
        ],
        image: "assets/use-case-images/evidence-renewable-energy.webp",
      },
      nuclear: {
        title: "Kyushu nuclear baseload",
        subtitle: "Grid stability backbone",
        description:
          "Genkai and Sendai nuclear power stations provide 5.25 GW of baseload electricity, ensuring the stable 24/7 power supply that semiconductor fabs require. Kyushu Electric's nuclear fleet delivers 99.97% reliability.",
        stats: [
          { value: "5.25GW", label: "Combined capacity" },
          { value: "99.97%", label: "Reliability rate" },
          { value: "24/7", label: "Baseload operation" },
          { value: "¥11/kWh", label: "Cost to grid" },
        ],
      },
    },
  },

  // Journey A: Talent Pipeline (Kyushu-wide scope)
  talentPipeline: {
    description:
      "The Kyushu Semiconductor Human Resources Development Alliance, led by METI, coordinates talent cultivation across the region to ensure a steady pipeline of semiconductor engineers and technicians.",
    government: {
      id: "meti",
      name: "Ministry of Economy, Trade and Industry",
      role: "Leads the Kyushu Semiconductor Human Resources Development Alliance",
      goals: "Strengthen talent cultivation and supply chain stability",
    },
    institutions: [
      {
        id: "kyutech",
        name: "Kyutech",
        fullName: "Kyushu Institute of Technology",
        city: "Kitakyushu",
        coords: [33.88, 130.84],
        color: "#e74c3c",
        role: "Established cross-departmental semiconductor human resources center",
        details: [
          { label: "Annual graduates", value: "300+" },
          { label: "Program scope", value: "Cross-departmental" },
          { label: "Core strength", value: "Research" },
        ],
      },
      {
        id: "kyushu-university",
        name: "Kyushu University",
        fullName: "Kyushu University",
        city: "Fukuoka",
        coords: [33.6, 130.42],
        color: "#8e44ad",
        role: "Established adult semiconductor retraining center",
        details: [
          { label: "Annual intake", value: "500+" },
          { label: "Target audience", value: "Working adults" },
          { label: "University rank", value: "Top 5 in Japan" },
        ],
      },
      {
        id: "oita-university",
        name: "Oita University",
        fullName: "Oita University",
        city: "Oita",
        coords: [33.23, 131.6],
        color: "#2980b9",
        role: "Established semiconductor core talent retraining center for working professionals",
        details: [
          { label: "Program focus", value: "Core talent development" },
          { label: "Target audience", value: "Working professionals" },
          { label: "Partnership model", value: "Industry-led" },
        ],
      },
      {
        id: "kumamoto-university",
        name: "Kumamoto University",
        fullName: "Kumamoto University",
        city: "Kumamoto",
        coords: [32.81, 130.73],
        color: "#27ae60",
        role: "Partnered with JASM (TSMC) on semiconductor research center as industry-academia collaboration",
        details: [
          { label: "Industry partner", value: "JASM (TSMC)" },
          { label: "Researchers", value: "400+" },
          { label: "Model", value: "Industry-academia" },
        ],
      },
      {
        id: "prefectural-kumamoto",
        name: "Prefectural University of Kumamoto",
        fullName: "Prefectural University of Kumamoto",
        city: "Kumamoto",
        coords: [32.83, 130.76],
        color: "#f39c12",
        role: "Since 2023, all first-year science and engineering students required to take semiconductor introductory courses taught by industry experts",
        details: [
          { label: "Mandate start", value: "2023" },
          { label: "Scope", value: "All first-year students" },
          { label: "Instructors", value: "Industry experts" },
        ],
      },
    ],
  },

  // Journey B: Infrastructure - Science Park
  sciencePark: {
    center: [32.87, 130.78],
    radius: 15000, // meters
    name: "Kumamoto Science Park Corridor",
    subtitle: "Government development zone",
    description:
      "The Kumamoto Prefectural Government has designated this area as a special semiconductor development zone, offering tax incentives, streamlined permitting, and infrastructure investments totaling ¥4.8 trillion.",
    stats: [
      { value: "¥4.8T", label: "Government investment" },
      { value: "2040", label: "Completion target" },
      { value: "50,000", label: "Projected new jobs" },
      { value: "12", label: "Major facilities planned" },
    ],
    evidence: {
      title: "Kumamoto Science Park master plan",
      type: "pdf",
      description: "Official development roadmap and zoning documentation",
    },
  },

  // Step 5: Science park zone plans (polygon overlays for sub-item highlights)
  scienceParkZonePlans: [
    {
      id: "sp-gov-zone",
      name: "Government zone plan",
      description:
        "The prefectural government designated a special semiconductor zone within the Science Park boundary. This zone provides tax incentives, streamlined permitting, and dedicated infrastructure for semiconductor-related industries.",
      coords: [32.88, 130.79],
      polygon: [
        [130.77, 32.895],
        [130.81, 32.895],
        [130.815, 32.875],
        [130.8, 32.865],
        [130.775, 32.87],
        [130.77, 32.895],
      ],
      color: "rgba(0, 122, 255, 0.25)",
      strokeColor: "#007aff",
      camera: {
        center: [130.8829, 32.8909],
        zoom: 11.5,
        pitch: 52,
        bearing: 9,
      },
      stats: [
        { value: "560ha", label: "Designated area" },
        { value: "¥1.2T", label: "Public investment" },
        { value: "2025", label: "Zoning enacted" },
        { value: "15", label: "Incentive programs" },
      ],
    },
    {
      id: "sp-kikuyo-plan",
      name: "Kikuyo long-term plan",
      description:
        "Kikuyo Town has approved rezoning for mixed-use development adjacent to the Science Park. New housing, retail, medical, and support services planned for semiconductor workers and their families.",
      coords: [32.88, 130.83],
      polygon: [
        [130.82, 32.895],
        [130.85, 32.895],
        [130.855, 32.875],
        [130.84, 32.865],
        [130.815, 32.87],
        [130.82, 32.895],
      ],
      color: "rgba(88, 86, 214, 0.25)",
      strokeColor: "#5856D6",
      camera: {
        center: [130.8912, 32.8674],
        zoom: 12.3,
        pitch: 52,
        bearing: 14,
      },
      stats: [
        { value: "320ha", label: "Rezoned area" },
        { value: "8,000", label: "New housing units" },
        { value: "2035", label: "Target completion" },
        { value: "¥280B", label: "Municipal budget" },
      ],
    },
    {
      id: "sp-ozu-plan",
      name: "Ozu long-term plan",
      description:
        "Ozu Town is developing new industrial parcels and logistics facilities to support the semiconductor supply chain. 120 hectares designated for industrial and logistics use.",
      coords: [32.86, 130.87],
      polygon: [
        [130.86, 32.875],
        [130.89, 32.875],
        [130.895, 32.855],
        [130.88, 32.845],
        [130.855, 32.85],
        [130.86, 32.875],
      ],
      color: "rgba(48, 176, 199, 0.25)",
      strokeColor: "#30B0C7",
      camera: {
        center: [130.946, 32.8724],
        zoom: 11.8,
        pitch: 52,
        bearing: 0,
      },
      stats: [
        { value: "120ha", label: "Industrial parcels" },
        { value: "¥150B", label: "Infrastructure spend" },
        { value: "2032", label: "Phase 1 complete" },
        { value: "3,500", label: "Logistics jobs" },
      ],
    },
  ],

  // Step 5: Grand airport access data (routes, railway, landmarks, cameras)
  grandAirportData: {
    // Two rail routes from Aso Kumamoto Airport to Higo-Ozu Station
    airportAccessRoutes: {
      // Fairly direct path - "previously announced route"
      previousRoute: [
        [32.8373, 130.8552], // Aso Kumamoto Airport
        [32.842, 130.856],
        [32.848, 130.8575],
        [32.854, 130.859],
        [32.86, 130.861],
        [32.865, 130.863],
        [32.87, 130.865],
        [32.8773, 130.8668], // Higo-Ozu Station
      ],
      // Sweeping curve east then north - "newly announced route"
      newRoute: {
        start: [32.8373, 130.8552], // Aso Kumamoto Airport
        control: [32.835, 130.9], // Arc control point (sweeps east)
        end: [32.8773, 130.8668], // Higo-Ozu Station
        numPoints: 60,
      },
      landmarks: [
        {
          id: "airport",
          name: "Aso Kumamoto Airport",
          coords: [32.8373, 130.8552],
          icon: "plane",
          color: "#007aff",
          description:
            "Kumamoto's primary airport handling 3.5 million passengers annually. The proposed rail link will cut travel time to the semiconductor corridor to under 15 minutes.",
          stats: [
            { value: "3.5M", label: "Annual passengers" },
            { value: "15 min", label: "Proposed rail time to JASM" },
          ],
        },
        {
          id: "higo-ozu",
          name: "Higo-Ozu Station",
          coords: [32.8773, 130.8668],
          icon: "train-front",
          color: "#007aff",
          description:
            "Key JR Hohi Line junction where the proposed airport access railway will terminate, connecting air and rail transit for the semiconductor corridor.",
          stats: [
            { value: "JR Hohi", label: "Railway line" },
            { value: "44 min", label: "To Kumamoto Station" },
          ],
        },
        {
          id: "semicon-tech-park",
          name: "Semiconductor Tech Park",
          coords: [32.876, 130.8],
          icon: "cpu",
          color: "#5856D6",
          description:
            "A dedicated technology park for semiconductor-related R&D and manufacturing support facilities, anchoring the northern end of the corridor.",
          stats: [
            { value: "120 ha", label: "Planned area" },
            { value: "2027", label: "Target completion" },
          ],
        },
        {
          id: "jasm-landmark",
          name: "JASM",
          coords: [32.874, 130.785],
          icon: "factory",
          color: "#ff3b30",
          description:
            "Japan Advanced Semiconductor Manufacturing, the TSMC joint venture. The anchor tenant driving infrastructure investment across the corridor.",
          stats: [
            { value: "$8.6B", label: "Total investment" },
            { value: "3,400+", label: "Direct employees" },
          ],
        },
        {
          id: "new-kikuyo-landmark",
          name: "New Kikuyo Station",
          coords: [32.88, 130.81],
          icon: "train-front",
          color: "#ff9500",
          description:
            "Planned new station on the JR Hohi Line serving the semiconductor corridor workforce. Will reduce commute times for thousands of employees.",
          stats: [
            { value: "2028", label: "Planned opening" },
            { value: "6,000+", label: "Projected daily riders" },
          ],
        },
        {
          id: "techno-research",
          name: "Techno Research Park",
          coords: [32.855, 130.86],
          icon: "microscope",
          color: "#5856D6",
          description:
            "Established research park housing semiconductor testing and advanced materials labs. Benefits directly from improved airport and rail connectivity.",
          stats: [
            { value: "50+", label: "Research tenants" },
            { value: "1996", label: "Established" },
          ],
        },
      ],
      // Metadata for route lines (for hover/click interactions)
      routes: [
        {
          id: "prev-route",
          sourceId: "ga-prev-route",
          name: "Previously announced route",
          color: "#007aff",
          description:
            "The initial proposed alignment for the airport access railway, following a direct path from Aso Kumamoto Airport to Higo-Ozu Station.",
          stats: [
            { value: "6.8 km", label: "Estimated length" },
            { value: "Direct", label: "Alignment type" },
          ],
        },
        {
          id: "new-route",
          sourceId: "ga-new-route",
          name: "Newly announced route",
          color: "#ff3b30",
          description:
            "The revised route announced in 2024, sweeping east to better serve the Techno Research Park area before connecting to Higo-Ozu Station.",
          stats: [
            { value: "8.2 km", label: "Estimated length" },
            { value: "Curved", label: "Alignment type" },
          ],
        },
        {
          id: "hohi-line",
          sourceId: "ga-access-hohi-line",
          name: "JR Hohi Line",
          color: "#6e7073",
          description:
            "The existing east-west JR railway connecting Kumamoto City to Oita Prefecture. The airport access railway will join this line at Higo-Ozu Station.",
          stats: [
            { value: "148 km", label: "Total length" },
            { value: "1914", label: "Established" },
          ],
        },
      ],
    },

    // JR Hohi Line and station data
    railway: {
      jrHohiLine: [
        [32.85, 130.78], // West end (approaching Mifunegaoka)
        [32.854, 130.79],
        [32.8556, 130.7979], // Mifunegaoka Station
        [32.86, 130.802],
        [32.8644, 130.8052], // Sanrigi Station
        [32.868, 130.81],
        [32.87, 130.815],
        [32.88, 130.81], // New Kikuyo Station (planned)
        [32.875, 130.82],
        [32.8698, 130.823], // Haramizu Station
        [32.872, 130.84],
        [32.875, 130.855],
        [32.8773, 130.8668], // Higo-Ozu Station
      ],
      stations: [
        {
          id: "new-kikuyo",
          name: "New Kikuyo station",
          coords: [32.88, 130.81],
          type: "planned",
          color: "#ff9500",
          description:
            "Planned new station on the JR Hohi Line between Mifunegaoka and Haramizu, directly serving the semiconductor corridor workforce. Expected to handle over 6,000 daily riders.",
          stats: [
            { value: "2028", label: "Planned opening" },
            { value: "6,000+", label: "Projected daily riders" },
          ],
        },
        {
          id: "haramizu",
          name: "Haramizu station",
          coords: [32.8698, 130.823],
          type: "existing",
          color: "#6e7073",
          description:
            "Existing station on the JR Hohi Line east of the semiconductor corridor. Serves as a key access point for the Kikuyo residential area.",
          stats: [
            { value: "JR Hohi", label: "Railway line" },
            { value: "850", label: "Daily riders" },
          ],
        },
        {
          id: "higo-ozu",
          name: "Higo-Ozu",
          coords: [32.8773, 130.8668],
          type: "existing",
          color: "#6e7073",
          description:
            "Key JR Hohi Line junction where the proposed airport access railway will terminate, connecting air and rail transit for the semiconductor corridor.",
          stats: [
            { value: "JR Hohi", label: "Railway line" },
            { value: "44 min", label: "To Kumamoto Station" },
          ],
        },
      ],
    },

    // Camera positions per child toggle
    cameras: {
      "ga-airport-access": {
        center: [130.9403, 32.8435],
        zoom: 11.5,
        pitch: 50,
        bearing: 19,
      },
      "ga-railway-stations": {
        center: [130.9479, 32.8796],
        zoom: 11.2,
        pitch: 52,
        bearing: 0,
      },
      "ga-road-extensions": {
        center: [130.82, 32.86],
        zoom: 11.5,
        pitch: 45,
        bearing: 0,
      },
    },

    // Road extensions data - new and expanded road segments
    roadExtensions: [
      {
        id: "north-connection",
        name: "Metropolitan north connection road",
        type: "new",
        color: "#e63f5a",
        coords: [
          [32.845, 130.73],
          [32.85, 130.742],
          [32.856, 130.755],
          [32.86, 130.77],
          [32.862, 130.785],
          [32.862, 130.8],
          [32.86, 130.815],
          [32.858, 130.83],
        ],
        description:
          "New high-standard road connecting provisional Kumamoto Kita JCT eastward through Nishi-Goshi, Goshi, and Ozu-Nishi interchanges. Part of the 10-minute ring concept linking the semiconductor corridor to the expressway network.",
        stats: [
          { value: "New", label: "Road type" },
          { value: "~12 km", label: "Length" },
          { value: "10-min ring", label: "Concept" },
        ],
      },
      {
        id: "airport-connection",
        name: "Airport connection road",
        type: "new",
        color: "#007aff",
        coords: [
          [32.814, 130.798],
          [32.818, 130.812],
          [32.824, 130.825],
          [32.83, 130.838],
          [32.835, 130.848],
          [32.837, 130.855],
        ],
        description:
          "New high-standard road connecting Kumamoto IC directly east to Aso Kumamoto Airport. Reduces airport access time from the city center to approximately 20 minutes, supporting semiconductor industry logistics and business travel.",
        stats: [
          { value: "New", label: "Road type" },
          { value: "~7 km", label: "Length" },
          { value: "20-min access", label: "Airport target" },
        ],
      },
      {
        id: "south-connection",
        name: "Metropolitan south connection road",
        type: "new",
        color: "#e63f5a",
        coords: [
          [32.78, 130.695],
          [32.773, 130.705],
          [32.766, 130.715],
          [32.758, 130.728],
          [32.75, 130.742],
          [32.744, 130.756],
        ],
        description:
          "New high-standard road extending south from Kumamoto city through provisional Shiroyama and Sunahara interchanges to Kashima JCT. Completes the southern leg of the metropolitan expressway ring.",
        stats: [
          { value: "New", label: "Road type" },
          { value: "~8 km", label: "Length" },
          { value: "10-min ring", label: "Concept" },
        ],
      },
    ],
  },

  // Journey B: Government Commitment Chain
  governmentChain: {
    intro: "Every level of government is aligned behind this corridor.",
    levels: [
      {
        id: "national",
        name: "Japan National Government",
        coords: [32.87, 130.7],
        subtitle: "Strategic semiconductor policy",
        type: "commitment",
        description:
          "The Japanese government designated semiconductors as critical infrastructure, committing ¥10 billion to support domestic chip production in Kumamoto.",
        stats: [
          { value: "¥10B", label: "Direct commitment" },
          { value: "2021", label: "Policy announced" },
          { value: "Critical", label: "Infrastructure status" },
          { value: "50%", label: "JASM subsidy" },
        ],
      },
      {
        id: "prefecture",
        name: "Kumamoto Prefecture",
        coords: [32.79, 130.74],
        subtitle: "Regional coordination",
        type: "commitment",
        description:
          "Kumamoto Prefecture allocated additional funds and streamlined permitting for semiconductor-related development across the region.",
        stats: [
          { value: "¥480B", label: "Infrastructure budget" },
          { value: "12", label: "Priority projects" },
          { value: "30%", label: "Permit time reduction" },
          { value: "2040", label: "Master plan horizon" },
        ],
      },
      {
        id: "kikuyo-city",
        name: "Kikuyo Town",
        coords: [32.88, 130.83],
        subtitle: "Local development plan",
        type: "commitment",
        description:
          "Kikuyo approved rezoning for 2,500 housing units and commercial centers to support semiconductor worker families.",
        stats: [
          { value: "2,500", label: "Housing units" },
          { value: "¥180B", label: "Infrastructure" },
          { value: "2028", label: "Phase 1 complete" },
          { value: "+45%", label: "Population target" },
        ],
      },
      {
        id: "ozu-city",
        name: "Ozu Town",
        coords: [32.86, 130.87],
        subtitle: "Industrial expansion",
        type: "commitment",
        description:
          "Ozu designated 120 hectares for industrial and logistics use, supporting the semiconductor supply chain.",
        stats: [
          { value: "120ha", label: "Industrial land" },
          { value: "¥95B", label: "Investment" },
          { value: "2027", label: "Phase 1" },
          { value: "3,000", label: "Jobs projected" },
        ],
      },
      {
        id: "grand-airport",
        name: "Grand airport concept",
        coords: [32.84, 130.86],
        subtitle: "New grand airport vision",
        type: "concept",
        description:
          'A new 6.8km rail connection will link Aso Kumamoto Airport directly to the JR Hohi Line, with an estimated travel time of 44 minutes from Kumamoto Station. The "New Grand Airport Vision" is a 10-year plan with four strategic pillars to position Kumamoto Airport as a gateway for the semiconductor ecosystem.',
        stats: [
          { value: "6.8km", label: "New rail link" },
          { value: "¥41B", label: "Rail investment" },
          { value: "44min", label: "Station to airport" },
          { value: "4 pillars", label: "Strategic plan" },
        ],
        pillars: [
          "Enhance domestic and international route network",
          "Improve ground transportation and airport access",
          "Strengthen cargo and logistics capabilities",
          "Develop airport area as regional gateway hub",
        ],
      },
    ],
  },

  // Journey B: Government Tiers (3-tier visual hierarchy)
  governmentTiers: [
    {
      id: "central",
      tier: "Central government",
      tierLabel: "National Policy",
      color: "#007aff",
      name: "Japan National Government",
      coords: [32.87, 130.7],
      tokyoCoords: [35.6762, 139.6503],
      description:
        "The Japanese government designated semiconductors as critical infrastructure, committing ¥10 billion to support domestic chip production in Kumamoto.",
      commitment: "¥10B",
      commitmentLabel: "Direct Investment",
      stats: [
        { value: "¥10B", label: "Direct commitment" },
        { value: "2021", label: "Policy announced" },
        { value: "Critical", label: "Infrastructure status" },
        { value: "50%", label: "JASM subsidy" },
      ],
    },
    {
      id: "prefectural",
      tier: "Prefectural government",
      tierLabel: "Regional Coordination",
      color: "#34c759",
      name: "Kumamoto Prefecture",
      coords: [32.79, 130.74],
      description:
        "Kumamoto Prefecture allocated additional funds and streamlined permitting for semiconductor-related development across the region.",
      commitment: "¥480B",
      commitmentLabel: "Infrastructure Budget",
      stats: [
        { value: "¥480B", label: "Infrastructure budget" },
        { value: "12", label: "Priority projects" },
        { value: "30%", label: "Permit time reduction" },
        { value: "2040", label: "Master plan horizon" },
      ],
    },
    {
      id: "local",
      tier: "Local municipalities",
      tierLabel: "Implementation",
      color: "#ff9500",
      name: "Local Municipalities",
      coords: [32.87, 130.85],
      description:
        "Three key local initiatives directly supporting the semiconductor corridor workforce and infrastructure.",
      commitment: "¥322B",
      commitmentLabel: "Combined Investment",
      stats: [
        { value: "¥322B", label: "Combined investment" },
        { value: "3", label: "Key municipalities" },
        { value: "2028", label: "Phase 1 targets" },
        { value: "5,500+", label: "Housing + jobs" },
      ],
      subItems: [
        {
          id: "kikuyo-city",
          name: "Kikuyo Town",
          subtitle: "Residential and commercial",
          coords: [32.88, 130.83],
          commitment: "¥180B",
          description:
            "Kikuyo approved rezoning for 2,500 housing units and commercial centers to support semiconductor worker families.",
          stats: [
            { value: "2,500", label: "Housing units" },
            { value: "¥180B", label: "Infrastructure" },
            { value: "2028", label: "Phase 1 complete" },
            { value: "+45%", label: "Population target" },
          ],
        },
        {
          id: "ozu-city",
          name: "Ozu Town",
          subtitle: "Industrial expansion",
          coords: [32.86, 130.87],
          commitment: "¥95B",
          description:
            "Ozu designated 120 hectares for industrial and logistics use, supporting the semiconductor supply chain.",
          stats: [
            { value: "120ha", label: "Industrial land" },
            { value: "¥95B", label: "Investment" },
            { value: "2027", label: "Phase 1" },
            { value: "3,000", label: "Jobs projected" },
          ],
        },
        {
          id: "koshi-town",
          name: "Koshi Town",
          subtitle: "TEL R&D hub and high-end rentals",
          coords: [32.884, 130.771],
          commitment: "¥47B",
          description:
            "Tokyo Electron (TEL) is building a major R&D hub in Fukuhara, Koshi Town. The ~27,000 sqm facility represents ~¥47 billion in investment, focused on coating, developing, and cleaning equipment R&D. This drives demand for high-income R&D engineers seeking family-size 2-3LDK mid-to-high-end rentals.",
          stats: [
            { value: "~27,000sqm", label: "Facility size" },
            { value: "¥47B", label: "Investment" },
            { value: "TEL", label: "Tokyo Electron" },
            { value: "2-3LDK", label: "Rental demand" },
          ],
        },
      ],
    },
  ],

  // Simplified Kumamoto prefecture boundary (approximate outline for map overlay)
  kumamotoPrefectureBoundary: {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [130.37, 33.15],
          [130.55, 33.18],
          [130.72, 33.15],
          [130.87, 33.1],
          [131.05, 33.0],
          [131.17, 32.87],
          [131.21, 32.7],
          [131.16, 32.55],
          [131.07, 32.4],
          [130.92, 32.25],
          [130.75, 32.13],
          [130.55, 32.07],
          [130.38, 32.12],
          [130.22, 32.28],
          [130.12, 32.48],
          [130.1, 32.65],
          [130.14, 32.8],
          [130.21, 32.93],
          [130.3, 33.04],
          [130.37, 33.15],
        ],
      ],
    },
  },

  // Journey B: Infrastructure - Companies
  companies: [
    {
      id: "jasm",
      name: "JASM (TSMC Japan)",
      coords: [32.874, 130.785],
      subtitle: "Semiconductor manufacturing",
      description:
        "Joint venture between TSMC, Sony, and Denso. Japan's most advanced semiconductor fab, producing chips for automotive and industrial applications.",
      stats: [
        { value: "¥1.2T", label: "Total investment" },
        { value: "3,400", label: "Direct employees" },
        { value: "2024", label: "Phase 1 operational" },
        { value: "22nm", label: "Process node" },
      ],
      evidence: {
        title: "JASM press release",
        type: "pdf",
        description: "Official announcement of Phase 2 expansion",
      },
    },
    {
      id: "sony",
      name: "Sony Semiconductor",
      coords: [32.9, 130.82],
      subtitle: "Image sensor production",
      description:
        "Sony's flagship image sensor facility supplies Apple, Samsung, and global smartphone manufacturers. Recent expansion doubled production capacity.",
      stats: [
        { value: "¥850B", label: "Expansion investment" },
        { value: "4,200", label: "Employees" },
        { value: "50%", label: "Global CMOS share" },
        { value: "2026", label: "Expansion complete" },
      ],
      evidence: {
        title: "Sony Kumamoto expansion",
        type: "pdf",
        description: "Facility expansion and hiring announcement",
      },
    },
    {
      id: "tokyo-electron",
      name: "Tokyo Electron",
      coords: [32.85, 130.73],
      subtitle: "Equipment manufacturing",
      description:
        "World's third-largest semiconductor equipment manufacturer. New Kumamoto facility will produce next-generation chip-making tools.",
      stats: [
        { value: "¥320B", label: "Investment" },
        { value: "1,200", label: "Projected jobs" },
        { value: "2025", label: "Opening" },
        { value: "#3", label: "Global equipment rank" },
      ],
      evidence: {
        title: "Tokyo Electron announcement",
        type: "pdf",
        description: "New facility press release",
      },
    },
    {
      id: "mitsubishi",
      name: "Mitsubishi Electric",
      coords: [32.82, 130.8],
      subtitle: "Power semiconductors",
      description:
        "Major expansion of power semiconductor production for electric vehicles and renewable energy systems.",
      stats: [
        { value: "¥260B", label: "Investment" },
        { value: "800", label: "New jobs" },
        { value: "2025", label: "Completion" },
        { value: "40%", label: "Capacity increase" },
      ],
      evidence: {
        title: "Mitsubishi power semiconductor plan",
        type: "pdf",
        description: "EV market expansion strategy",
      },
    },
    {
      id: "sumco",
      name: "SUMCO",
      coords: [32.93, 130.7],
      subtitle: "Silicon wafer manufacturing",
      description:
        "One of the world's largest silicon wafer manufacturers. SUMCO's Kyushu facilities produce high-purity wafers essential for advanced semiconductor fabrication.",
      stats: [
        { value: "¥180B", label: "Investment" },
        { value: "1,500", label: "Employees" },
        { value: "30%", label: "Global wafer share" },
        { value: "2026", label: "Expansion complete" },
      ],
      evidence: {
        title: "SUMCO Kyushu expansion",
        type: "pdf",
        description: "Wafer production capacity expansion plan",
      },
    },
    {
      id: "kyocera",
      name: "Kyocera",
      coords: [32.91, 130.88],
      subtitle: "Ceramic packages & components",
      description:
        "Kyocera manufactures ceramic packages and electronic components critical to semiconductor assembly. Their Kyushu operations serve the entire Asia-Pacific market.",
      stats: [
        { value: "¥95B", label: "Investment" },
        { value: "2,800", label: "Employees" },
        { value: "IC packages", label: "Core product" },
        { value: "Asia-Pacific", label: "Market served" },
      ],
      evidence: {
        title: "Kyocera component expansion",
        type: "pdf",
        description: "Regional manufacturing strategy",
      },
    },
    {
      id: "rohm-apollo",
      name: "Rohm Apollo",
      coords: [32.89, 130.76],
      subtitle: "Analog & power semiconductors",
      description:
        "Rohm Apollo Semiconductor produces analog ICs and power devices in Kumamoto. Expanding capacity to meet growing EV and industrial automation demand.",
      stats: [
        { value: "¥120B", label: "Investment" },
        { value: "1,100", label: "Employees" },
        { value: "SiC power", label: "Key technology" },
        { value: "+60%", label: "Capacity expansion" },
      ],
      evidence: {
        title: "Rohm Apollo SiC expansion",
        type: "pdf",
        description: "Silicon carbide power device production plan",
      },
    },
  ],

  // Journey B: Future Development Zones
  futureZones: [
    {
      id: "kikuyo",
      name: "Kikuyo Development Zone",
      coords: [32.88, 130.83],
      radius: 5000,
      color: "#5856D6",
      strokeColor: "#5856D6",
      subtitle: "Residential & commercial",
      description:
        "Kikuyo Town has approved rezoning for mixed-use development adjacent to the Science Park. New housing, retail, and support services for semiconductor workers.",
      stats: [
        { value: "2,500", label: "Housing units planned" },
        { value: "¥180B", label: "Infrastructure budget" },
        { value: "2028", label: "Phase 1 complete" },
        { value: "15min", label: "To JASM" },
      ],
      evidence: {
        title: "Kikuyo Town development plan",
        type: "pdf",
        description: "Official rezoning and infrastructure roadmap",
      },
      facilities: [
        { label: "Housing", coords: [32.885, 130.825] },
        { label: "Retail hub", coords: [32.876, 130.835] },
        { label: "School", coords: [32.882, 130.838] },
        { label: "Medical", coords: [32.878, 130.822] },
      ],
    },
    {
      id: "ozu",
      name: "Ozu Industrial Expansion",
      coords: [32.86, 130.87],
      radius: 4000,
      color: "#30B0C7",
      strokeColor: "#30B0C7",
      subtitle: "Industrial & logistics",
      description:
        "Ozu Town is developing new industrial parcels and logistics facilities to support the semiconductor supply chain.",
      stats: [
        { value: "120ha", label: "Industrial land" },
        { value: "¥95B", label: "Investment" },
        { value: "2027", label: "Available" },
        { value: "3,000", label: "Jobs projected" },
      ],
      evidence: {
        title: "Ozu industrial zone plan",
        type: "pdf",
        description: "Industrial development documentation",
      },
      facilities: [
        { label: "Logistics", coords: [32.864, 130.875] },
        { label: "Warehouse", coords: [32.856, 130.866] },
        { label: "Supplier park", coords: [32.862, 130.878] },
      ],
    },
  ],

  // Journey B: Investment Zones (spatial framework for property evaluation)
  // Silicon Triangle Investment Zones (step 9)
  investmentZones: [
    {
      id: "koshi-zone",
      name: "Koshi zone",
      role: "R&D / tools and process innovation",
      coords: [32.85, 130.78],
      radius: 3500,
      color: "rgba(0, 122, 255, 0.15)",
      strokeColor: "rgba(0, 122, 255, 0.4)",
    },
    {
      id: "kikuyo-zone",
      name: "Kikuyo zone",
      role: "Factory core / new urban core",
      coords: [32.88, 130.83],
      radius: 4500,
      color: "rgba(251, 185, 49, 0.15)",
      strokeColor: "rgba(251, 185, 49, 0.4)",
    },
    {
      id: "ozu-zone",
      name: "Ozu zone",
      role: "Gateway / office and logistics support",
      coords: [32.86, 130.87],
      radius: 4000,
      color: "rgba(52, 199, 89, 0.15)",
      strokeColor: "rgba(52, 199, 89, 0.4)",
    },
    {
      id: "haramizu-zone",
      name: "Haramizu zone",
      role: "Station-area development hub",
      coords: [32.8704, 130.8245],
      radius: 2000,
      color: "rgba(255, 149, 0, 0.15)",
      strokeColor: "rgba(255, 149, 0, 0.4)",
    },
  ],

  // GKTK Fund Vehicle
  gktk: {
    name: "GKTK Fund",
    fullName: "Greater Kumamoto Technology Corridor Fund",
    fundSize: "¥2.5B",
    fundSizeNote: "Target AUM",
    strategy: "Real estate investment in the semiconductor corridor",
    vintage: "2025",
    stats: [
      { value: "¥2.5B", label: "Fund size" },
      { value: "2025", label: "Vintage" },
      { value: "5-7yr", label: "Hold period" },
      { value: "12-18%", label: "Target IRR" },
    ],
  },

  // Q5: Investment Properties (card-based structure)
  properties: [
    {
      id: "ozu-1",
      name: "Ozu 1",
      coords: [32.865, 130.87],
      subtitle: "New construction (BTR)",
      type: "Build to rent",
      zone: "Ozu Development Zone",
      distanceToJasm: "5.2 km",
      driveTime: "8 min",
      address:
        "3542-81 Shimomizusako, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto",
      camera: {
        center: [130.87, 32.865],
        zoom: 14.0,
        pitch: 52,
        bearing: 15,
      },
      connections: {
        jasm: { coords: [32.874, 130.785], distance: "5.2 km", time: "8 min" },
        station: {
          id: "haramizu-station",
          name: "Haramizu station",
          coords: [32.8698, 130.823],
          distance: "4.8 km",
          time: "7 min",
        },
        airport: {
          coords: [32.8373, 130.8552],
          distance: "8.2 km",
          time: "14 min",
        },
        road: { id: "ozu-road", name: "Ozu Road", coords: [32.88, 130.87] },
      },

      cards: [
        {
          type: "images",
          data: {
            exterior: "assets/step-11-images/ozu-exterior.webp",
            interior: [
              "assets/step-11-images/ozu-1-interior-2.webp",
              "assets/step-11-images/ozu-1-interior-3.webp",
              "assets/step-11-images/ozu-1-interior-4.webp",
            ],
            site: "",
          },
        },
        {
          type: "truth-engine",
          data: {
            basicSettings: {
              propertyName: "Chateau Life Ozu 1",
              address:
                "3542-81 Shimomizusako, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto",
              propertyType: "Detached house (single-family)",
              landArea: "117.62 sqm (approx. 35.6 tsubo)",
              buildingArea:
                "89.10 sqm total (1F: 43.74 sqm, 2F: 45.36 sqm), 2 floors",
              layout: "4LDK, 3 parking spaces",
              availability: "May 2026 onwards",
            },
            designStrategy: {
              description: "Expat family standard spec",
              features: [
                "Large living/dining",
                "Dishwasher, floor heating, high insulation",
                "Ample storage, EV charging prep",
                "Standardized facade and modular floor plans",
                "Compressed construction period and cost volatility",
              ],
            },
            landStrategy: {
              description:
                "Three-factor balance: school district + living amenities + commute",
              risks: [
                "Fragmented land",
                "Site preparation costs",
                "Drainage/foundation improvement costs uncertain",
              ],
            },
          },
        },
        {
          type: "future-outlook",
          data: {
            description: "Area development plans affecting Ozu 1",
            factors: [
              {
                title: "Ozu industrial expansion",
                impact:
                  "120ha new logistics and supply chain facilities by 2027",
              },
              {
                title: "Naka-Kyushu Cross Road",
                impact:
                  "Ozu-Kumamoto Road segment under construction, expressway link through corridor",
              },
              {
                title: "Science park expansion",
                impact:
                  "Government commitment extends development corridor southward",
              },
            ],
          },
        },
        {
          type: "financial",
          data: {
            strategy: "BTR (build to rent)",
            acquisitionCost: 45600000,
            paths: {
              rental: {
                label: "Guaranteed rent (Plan B)",
                monthlyRent: 152000,
                annualRent: 1824000,
                yield: 0.04,
                guaranteePeriod: "5 years",
              },
              market: {
                label: "Market rent (Plan A)",
                monthlyRent: 190000,
                annualRent: 2280000,
                yield: 0.05,
              },
            },
            expenses: {
              fixedAssetTax: 100000,
              managementFee: 182400,
              insurance: 50000,
              internet: 50000,
              taxAccountant: 40000,
            },
            loan: {
              loanAmount: 22800000,
              loanTerm: 20,
              interestRate: 0.025,
              monthlyRepayment: 120818,
            },
            rentalEvidence: {
              title: "AI rent assessment (4LDK/89sqm)",
              type: "pdf",
              description:
                "Assessed rent ¥160,000/month from comparable properties",
              image:
                "assets/use-case-images/evidence-property-rent-evaluation.webp",
            },
          },
        },
      ],
    },
    {
      id: "ozu-2",
      name: "Ozu 2",
      coords: [32.862, 130.865],
      subtitle: "New construction (BTR)",
      type: "Build to rent",
      zone: "Ozu Development Zone",
      distanceToJasm: "5.5 km",
      driveTime: "9 min",
      address:
        "2813-1 Shimozuru, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto",
      camera: {
        center: [130.865, 32.862],
        zoom: 14.0,
        pitch: 52,
        bearing: 15,
      },
      connections: {
        jasm: { coords: [32.874, 130.785], distance: "5.5 km", time: "9 min" },
        station: {
          id: "haramizu-station",
          name: "Haramizu station",
          coords: [32.8698, 130.823],
          distance: "4.5 km",
          time: "6 min",
        },
        airport: {
          coords: [32.8373, 130.8552],
          distance: "8.5 km",
          time: "15 min",
        },
        road: { id: "ozu-road", name: "Ozu Road", coords: [32.88, 130.87] },
      },

      cards: [
        {
          type: "images",
          data: {
            exterior: "assets/step-11-images/ozu-exterior.webp",
            interior: [
              "assets/step-11-images/ozu-2-interior-1.webp",
              "assets/step-11-images/ozu-2-interior-2.webp",
              "assets/step-11-images/ozu-2-interior-3.webp",
              "assets/step-11-images/ozu-2-interior-4.webp",
            ],
            site: "",
          },
        },
        {
          type: "truth-engine",
          data: {
            basicSettings: {
              propertyName: "Chateau Life Ozu 2",
              address:
                "2813-1 Shimozuru, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto",
              propertyType: "Detached house (single-family)",
              landArea: "200.7 sqm (approx. 60.7 tsubo)",
              buildingArea: "94.81 sqm total, 2 floors",
              layout: "4LDK, 3 parking spaces",
              availability: "July 2026 onwards",
            },
            designStrategy: {
              description: "Expat family standard spec",
              features: [
                "Large living/dining",
                "Dishwasher, floor heating, high insulation",
                "Ample storage, EV charging prep",
                "Standardized facade and modular floor plans",
                "Compressed construction period and cost volatility",
              ],
            },
            landStrategy: {
              description:
                "Three-factor balance: school district + living amenities + commute",
              risks: [
                "Fragmented land",
                "Site preparation costs",
                "Drainage/foundation improvement costs uncertain",
              ],
            },
          },
        },
        {
          type: "future-outlook",
          data: {
            description: "Area development plans affecting Ozu 2",
            factors: [
              {
                title: "Ozu industrial expansion",
                impact:
                  "120ha new logistics and supply chain facilities by 2027",
              },
              {
                title: "Naka-Kyushu Cross Road",
                impact:
                  "Ozu-Kumamoto Road segment under construction, expressway link through corridor",
              },
              {
                title: "Science park expansion",
                impact:
                  "Government commitment extends development corridor southward",
              },
            ],
          },
        },
        {
          type: "financial",
          data: {
            strategy: "BTR (build to rent)",
            acquisitionCost: 45600000,
            paths: {
              rental: {
                label: "Guaranteed rent (Plan B)",
                monthlyRent: 152000,
                annualRent: 1824000,
                yield: 0.04,
                guaranteePeriod: "5 years",
              },
              market: {
                label: "Market rent (Plan A)",
                monthlyRent: 190000,
                annualRent: 2280000,
                yield: 0.05,
              },
            },
            expenses: {
              fixedAssetTax: 100000,
              managementFee: 182400,
              insurance: 50000,
              internet: 50000,
              taxAccountant: 40000,
            },
            loan: {
              loanAmount: 22800000,
              loanTerm: 20,
              interestRate: 0.025,
              monthlyRepayment: 120818,
            },
            rentalEvidence: {
              title: "AI rent assessment (4LDK/95sqm)",
              type: "pdf",
              description:
                "Assessed rent ¥152,000/month guaranteed, ¥190,000/month market estimate",
              image:
                "assets/use-case-images/evidence-property-rent-evaluation.webp",
            },
          },
        },
      ],
    },
    {
      id: "kikuyo-1",
      name: "Kikuyo 1",
      coords: [32.88, 130.825],
      subtitle: "Renovation opportunity",
      type: "Buy-renovate-rent/sell",
      zone: "Kikuyo Development Zone",
      distanceToJasm: "6.8 km",
      driveTime: "10 min",
      address:
        "1315-18, 23 Maeda, Aza Kubota, Kikuyo-machi, Kikuchi-gun, Kumamoto",
      camera: {
        center: [130.825, 32.88],
        zoom: 14.0,
        pitch: 52,
        bearing: 5,
      },
      connections: {
        jasm: { coords: [32.874, 130.785], distance: "6.8 km", time: "10 min" },
        station: {
          id: "kikuyo-station",
          name: "Kikuyo station",
          coords: [32.88, 130.81],
          distance: "1.2 km",
          time: "2 min",
        },
        airport: {
          coords: [32.8373, 130.8552],
          distance: "7.8 km",
          time: "13 min",
        },
        road: {
          id: "ozu-kumamoto-road",
          name: "Ozu-Kumamoto Road",
          coords: [32.87, 130.82],
        },
      },

      cards: [
        {
          type: "images",
          data: {
            exterior: "assets/step-11-images/kikuyo-exterior.webp",
            interior: [
              "assets/step-11-images/kikuyo-interior-1.webp",
              "assets/step-11-images/kikuyo-interior-2.webp",
              "assets/step-11-images/kikuyo-interior-3.webp",
            ],
            site: "",
          },
        },
        {
          type: "truth-engine",
          data: {
            basicSettings: {
              propertyName: "Chateau Life Kikuyo 1",
              address:
                "1315-18, 23 Maeda, Aza Kubota, Kikuyo-machi, Kikuchi-gun, Kumamoto",
              propertyType: "Detached house (single-family)",
              landArea: "201.6 sqm (approx. 60.98 tsubo)",
              buildingArea:
                "115.1 sqm total (1F: 62.93 sqm, 2F: 52.17 sqm), 2 floors",
              layout: "4LDK, 3 parking spaces",
              availability: "June 2026 onwards",
            },
            designStrategy: {
              description: "Convert to expat standard",
              features: [
                "Insulation and window upgrades",
                "Traffic flow reorganization",
                "Kitchen and bath quality improvement",
                "Storage optimization",
                "Lighting and moisture control",
              ],
            },
            landStrategy: {
              description:
                "Advantages: property tax and acquisition cost controllable, fast turnaround, can replicate across multiple small properties",
              risks: [
                "Hidden construction issues (leaks, termites, foundation)",
                "Resale market depth uncertainty",
                "Renovation cost overrun risk",
              ],
            },
          },
        },
        {
          type: "future-outlook",
          data: {
            description: "Area development plans affecting Kikuyo 1",
            factors: [
              {
                title: "Kikuyo Station expansion",
                impact:
                  "New train station with direct Kumamoto City line, completion 2026",
              },
              {
                title: "International school",
                impact:
                  "English-language school for TSMC engineer families, +8% rental premium",
              },
              {
                title: "JASM Phase 2",
                impact:
                  "Second fab adding 3,000 employees, +25% rental demand by 2027",
              },
              {
                title: "Haramizu 70ha development",
                impact: "Adjacent new urban core drives area transformation",
              },
            ],
          },
        },
        {
          type: "financial",
          data: {
            strategy: "BTR (build to rent)",
            acquisitionCost: 45600000,
            paths: {
              rental: {
                label: "Guaranteed rent (Plan B)",
                monthlyRent: 152000,
                annualRent: 1824000,
                yield: 0.04,
                guaranteePeriod: "5 years",
              },
              market: {
                label: "Market rent (Plan A)",
                monthlyRent: 190000,
                annualRent: 2280000,
                yield: 0.05,
              },
            },
            expenses: {
              fixedAssetTax: 100000,
              managementFee: 182400,
              insurance: 50000,
              internet: 50000,
              taxAccountant: 40000,
            },
            loan: {
              loanAmount: 22800000,
              loanTerm: 20,
              interestRate: 0.025,
              monthlyRepayment: 120818,
            },
            rentalEvidence: {
              title: "AI rent assessment (4LDK/115sqm)",
              type: "pdf",
              description:
                "Assessed rent ¥152,000/month guaranteed, ¥190,000/month market estimate",
              image:
                "assets/use-case-images/evidence-rental-assessment-report.webp",
            },
          },
        },
      ],
    },
    {
      id: "haramizu-1",
      name: "Haramizu 1",
      coords: [32.8698, 130.823],
      subtitle: "Land development",
      type: "Land acquisition",
      zone: "Haramizu Station Development Zone",
      distanceToJasm: "4.5 km",
      driveTime: "7 min",
      address:
        "1023-14 Minamijuke, Aza Haramizu, Kikuyo-machi, Kikuchi-gun, Kumamoto",
      camera: {
        center: [130.823, 32.8698],
        zoom: 14.2,
        pitch: 52,
        bearing: 10,
      },
      connections: {
        jasm: { coords: [32.874, 130.785], distance: "4.5 km", time: "7 min" },
        station: {
          id: "haramizu-station",
          name: "Haramizu station",
          coords: [32.8698, 130.823],
          distance: "0 km",
          time: "adjacent",
        },
        airport: {
          coords: [32.8373, 130.8552],
          distance: "7.2 km",
          time: "12 min",
        },
        road: {
          id: "ozu-kumamoto-road",
          name: "Ozu-Kumamoto Road",
          coords: [32.87, 130.82],
        },
      },

      cards: [
        {
          type: "images",
          data: {
            exterior: "assets/step-11-images/haramizu-1-exterior-1.webp",
            interior: [
              "assets/step-11-images/haramizu-1-interior-1.webp",
              "assets/step-11-images/haramizu-1-interior-2.webp",
              "assets/step-11-images/haramizu-1-interior-3.webp",
            ],
            site: "assets/step-11-images/haramizu-1-exterior-2.webp",
          },
        },
        {
          type: "truth-engine",
          data: {
            basicSettings: {
              propertyName: "Haramizu Land 1",
              propertyType: "Land (pre-sale / off-plan)",
              address:
                "1023-14 Minamijuke, Aza Haramizu, Kikuyo-machi, Kikuchi-gun, Kumamoto",
              landArea: "210.86 sqm (approx. 63.78 tsubo)",
              buildingArea: "Planned (spec to be confirmed)",
              parking: "4-5 spaces (planned)",
              availability: "6-9 months after contract signing",
            },
            designStrategy: {
              description: "Three-zone development concept",
              features: [
                "Vibrancy zone: station-front retail, F&B, international-friendly services",
                "Knowledge cluster: R&D offices, co-working, university satellite campus",
                "Live-work zone: mid-high density condos, serviced apartments for engineers",
                "Facility introduction: residential, apartments, hotels, university campus",
              ],
            },
            landStrategy: {
              description:
                "Long-term city-level project, not single housing development. JR Kyushu new station between Mitsuriki and Haramizu creates transport anchor.",
              risks: [
                "Land readjustment timeline uncertainty",
                "Zoning finalization dependent on municipal process",
                "Higher upfront capital requirement than renovation path",
              ],
            },
          },
        },
        {
          type: "future-outlook",
          data: {
            description:
              "70-hectare new urban core with national development partners",
            factors: [
              {
                title: "New JR station",
                impact:
                  "JR Kyushu confirmed new station between Mitsuriki and Haramizu, direct rail to Kumamoto City",
              },
              {
                title: "Mitsui Fudosan partnership",
                impact:
                  "Japan largest developer selected for long-term vision implementation",
              },
              {
                title: "Foreign consultation counter",
                impact:
                  "Kikuyo Town established bilingual support (Chinese/English) for international residents",
              },
              {
                title: "Science park adjacency",
                impact:
                  "Direct proximity to semiconductor cluster drives sustained demand",
              },
            ],
          },
        },
        {
          type: "financial",
          data: {
            strategy: "Land acquisition and hold/develop",
            landAcquisitionCost: 38000000,
            developmentBudget: 52000000,
            totalInvestment: 90000000,
            scenarios: {
              bear: {
                developedValue: 95000000,
                netProfit: 5000000,
                irr: 0.04,
                holdYears: 3,
              },
              average: {
                developedValue: 115000000,
                netProfit: 25000000,
                irr: 0.1,
                holdYears: 3,
              },
              bull: {
                developedValue: 140000000,
                netProfit: 50000000,
                irr: 0.17,
                holdYears: 3,
              },
            },
            rentalEvidence: {
              title: "Real estate investment analysis",
              type: "pdf",
              description:
                "Comprehensive land value and development ROI projections",
              image:
                "assets/use-case-images/evidence-real-estate-investment-analysis.webp",
            },
          },
        },
      ],
    },
    {
      id: "haramizu-2",
      name: "Haramizu 2",
      coords: [32.871, 130.826],
      subtitle: "Land development",
      type: "Land acquisition",
      zone: "Haramizu Station Development Zone",
      distanceToJasm: "4.3 km",
      driveTime: "7 min",
      address:
        "969-142 Mukaihara, Aza Haramizu, Kikuyo-machi, Kikuchi-gun, Kumamoto",
      camera: {
        center: [130.826, 32.871],
        zoom: 14.2,
        pitch: 52,
        bearing: 10,
      },
      connections: {
        jasm: { coords: [32.874, 130.785], distance: "4.3 km", time: "7 min" },
        station: {
          id: "haramizu-station",
          name: "Haramizu station",
          coords: [32.8698, 130.823],
          distance: "0.2 km",
          time: "1 min",
        },
        airport: {
          coords: [32.8373, 130.8552],
          distance: "7.5 km",
          time: "13 min",
        },
        road: {
          id: "ozu-kumamoto-road",
          name: "Ozu-Kumamoto Road",
          coords: [32.87, 130.82],
        },
      },

      cards: [
        {
          type: "images",
          data: {
            exterior: "assets/step-11-images/haramizu-2-exterior-1.webp",
            interior: [
              "assets/step-11-images/haramizu-2-interior-1.webp",
              "assets/step-11-images/haramizu-2-interior-2.webp",
              "assets/step-11-images/haramizu-2-interior-3.webp",
            ],
            site: "assets/step-11-images/haramizu-2-exterior-2.webp",
          },
        },
        {
          type: "truth-engine",
          data: {
            basicSettings: {
              propertyName: "Haramizu Land 2",
              propertyType: "Land (pre-sale / off-plan)",
              address:
                "969-142 Mukaihara, Aza Haramizu, Kikuyo-machi, Kikuchi-gun, Kumamoto",
              landArea: "224.88 sqm (approx. 68.02 tsubo)",
              buildingArea: "Planned (spec to be confirmed)",
              parking: "3-4 spaces (planned)",
              availability: "6-9 months after contract signing",
            },
            designStrategy: {
              description: "Three-zone development concept",
              features: [
                "Vibrancy zone: station-front retail, F&B, international-friendly services",
                "Knowledge cluster: R&D offices, co-working, university satellite campus",
                "Live-work zone: mid-high density condos, serviced apartments for engineers",
                "Facility introduction: residential, apartments, hotels, university campus",
              ],
            },
            landStrategy: {
              description:
                "Long-term city-level project, not single housing development. JR Kyushu new station between Mitsuriki and Haramizu creates transport anchor.",
              risks: [
                "Land readjustment timeline uncertainty",
                "Zoning finalization dependent on municipal process",
                "Higher upfront capital requirement than renovation path",
              ],
            },
          },
        },
        {
          type: "future-outlook",
          data: {
            description:
              "70-hectare new urban core with national development partners",
            factors: [
              {
                title: "New JR station",
                impact:
                  "JR Kyushu confirmed new station between Mitsuriki and Haramizu, direct rail to Kumamoto City",
              },
              {
                title: "Mitsui Fudosan partnership",
                impact:
                  "Japan largest developer selected for long-term vision implementation",
              },
              {
                title: "Foreign consultation counter",
                impact:
                  "Kikuyo Town established bilingual support (Chinese/English) for international residents",
              },
              {
                title: "Science park adjacency",
                impact:
                  "Direct proximity to semiconductor cluster drives sustained demand",
              },
            ],
          },
        },
        {
          type: "financial",
          data: {
            strategy: "Land acquisition and hold/develop",
            landAcquisitionCost: 40000000,
            developmentBudget: 55000000,
            totalInvestment: 95000000,
            scenarios: {
              bear: {
                developedValue: 100000000,
                netProfit: 5000000,
                irr: 0.04,
                holdYears: 3,
              },
              average: {
                developedValue: 120000000,
                netProfit: 25000000,
                irr: 0.1,
                holdYears: 3,
              },
              bull: {
                developedValue: 148000000,
                netProfit: 53000000,
                irr: 0.18,
                holdYears: 3,
              },
            },
            rentalEvidence: {
              title: "Real estate investment analysis",
              type: "pdf",
              description:
                "Comprehensive land value and development ROI projections",
              image:
                "assets/use-case-images/evidence-real-estate-investment-analysis.webp",
            },
          },
        },
      ],
    },
  ],

  // Area Statistics (for Journey C conclusion)
  areaStats: {
    avgAppreciation: "+8.5%",
    avgRentalYield: "+5.8%",
    occupancyRate: "97.2%",
    trackRecord: [
      { year: "2022", appreciation: "+6.2%" },
      { year: "2023", appreciation: "+9.1%" },
      { year: "2024", appreciation: "+11.3%" },
    ],
  },

  // JASM location for route drawing
  jasmLocation: [32.874, 130.785],

  // Journey A: Airline Routes (Strategic Location)
  airlineRoutes: {
    origin: {
      name: "Aso Kumamoto Airport",
      coords: [32.8373, 130.8551],
      code: "KMJ",
    },
    destinations: [
      {
        id: "seoul-incheon",
        name: "Seoul Incheon",
        coords: [37.4602, 126.4407],
        code: "ICN",
        country: "South Korea",
        region: "Korea",
        status: "active",
        flightTime: "1h 40m",
        airlines: ["Korean Air", "T'way Air"],
        significance: "Samsung memory division HQ link",
        description:
          "Direct service to Seoul's primary international airport. Year-round daily flights.",
        semiconductorLink: {
          company: "Samsung",
          role: "Memory Division HQ",
          color: "#34c759",
        },
      },
      {
        id: "busan-gimhae",
        name: "Busan Gimhae",
        coords: [35.1796, 128.9382],
        code: "PUS",
        country: "South Korea",
        region: "Korea",
        status: "active",
        flightTime: "1h 25m",
        airlines: ["Eastar Jet"],
        significance: "Korea's second-largest city",
        description: "Daily direct service on Boeing 737.",
      },
      {
        id: "taiwan-taoyuan",
        name: "Taiwan Taoyuan",
        coords: [24.8, 120.97],
        code: "TPE",
        country: "Taiwan",
        region: "Taiwan",
        status: "active",
        flightTime: "1h 40m",
        airlines: ["Starlux Airlines", "China Airlines"],
        significance: "TSMC headquarters connection",
        description: "Direct service to Taiwan's main international gateway.",
        semiconductorLink: {
          company: "TSMC",
          role: "Global Headquarters",
          color: "#007aff",
        },
      },
      {
        id: "kaohsiung",
        name: "Kaohsiung",
        coords: [22.5771, 120.35],
        code: "KHH",
        country: "Taiwan",
        region: "Taiwan",
        status: "active",
        flightTime: "2h 45m",
        airlines: ["China Airlines"],
        significance: "Southern Taiwan industrial access",
        description:
          "Direct service to Taiwan's second-largest city and southern semiconductor hub.",
      },
    ],
  },

  // Journey B: Infrastructure Roads
  infrastructureRoads: [
    {
      id: "ozu-kumamoto-road",
      name: "Ozu-Kumamoto Road",
      coords: [
        [32.86, 130.7],
        [32.87, 130.74],
        [32.87, 130.78],
        [32.87, 130.82],
      ],
      status: "Under Construction",
      completionDate: "TBD",
      budget: "Not disclosed",
      length: "13.8 km",
      driveToJasm: "Adjacent",
      commuteImpact: "13.8km",
      description:
        "Longest segment of the Naka-Kyushu Cross Road, connecting Koshi to Ozu-West IC in two sections (9.1km Koshi to Kumamoto, started 2020; 4.7km Ozu-West to Koshi, started 2022). Runs directly north of the semiconductor corridor.",
      documentLink: "#",
    },
    {
      id: "ozu-road",
      name: "Ozu Road",
      coords: [
        [32.87, 130.82],
        [32.875, 130.84],
        [32.88, 130.87],
      ],
      status: "Under Survey",
      completionDate: "TBD",
      budget: "Not disclosed",
      length: "4.8 km",
      driveToJasm: "Adjacent",
      commuteImpact: "4.8km",
      description:
        "Eastern segment connecting Ozu-West IC to the existing Ozu IC interchange. Project commenced in 2024 and is currently under survey. Completes the expressway link to the Ozu area east of the semiconductor corridor.",
      documentLink: "#",
    },
    {
      id: "kumamoto-ring-road",
      name: "Kumamoto Ring Road",
      coords: [
        [32.84, 130.65],
        [32.85, 130.67],
        [32.86, 130.7],
      ],
      status: "Under Survey",
      completionDate: "TBD",
      budget: "Not disclosed",
      length: "3.9 km",
      driveToJasm: "Western link",
      commuteImpact: "3.9km",
      description:
        "Western extension connecting the Ueki IC area to the Kumamoto-Kita junction. Project commenced in 2025 and is currently under survey. Will provide expressway access from western Kumamoto into the corridor.",
      documentLink: "#",
    },
  ],

  // Journey B: Infrastructure Stations (B7)
  infrastructureStation: {
    id: "kikuyo-station",
    name: "Kikuyo Station",
    coords: [32.88, 130.81],
    subtitle: "New rail connection",
    status: "Under Construction",
    completionDate: "2026",
    description:
      "New JR Hohi Line station providing direct rail access from Kumamoto City to the Science Park corridor. Reduces commute time for semiconductor workers.",
    stats: [
      { value: "18 min", label: "To Kumamoto City" },
      { value: "8 min", label: "To JASM" },
      { value: "15 min", label: "Train frequency" },
      { value: "8,000", label: "Daily passengers est." },
    ],
    commuteImpact: "Rail option",
    documentLink: "#",
  },

  haramizuStation: {
    id: "haramizu-station",
    name: "Haramizu Station Area",
    coords: [32.8698, 130.823],
    subtitle: "New development hub",
    status: "Under Development",
    description:
      "Haramizu Station area is being developed as a new urban core with 70ha of mixed-use land. Three development zones planned. Mitsui Fudosan and JR Kyushu selected as development partners.",
    stats: [
      { value: "70ha", label: "Development area" },
      { value: "3 zones", label: "Mixed-use plan" },
      { value: "Mitsui + JR", label: "Development partners" },
      { value: "2028", label: "Phase 1 target" },
    ],
    zones: [
      {
        name: "Vibrancy",
        description:
          "Station-front retail, F&B, international-friendly services",
      },
      {
        name: "Knowledge cluster",
        description: "R&D offices, co-working, university satellite",
      },
      {
        name: "Live-Work",
        description:
          "Mid-high density condos, serviced apartments for engineers",
      },
    ],
    commuteImpact: "New urban core",
    documentLink: "#",
  },

  // Evidence Groups - Hierarchical evidence with multiple sub-items
  evidenceGroups: {
    "energy-infrastructure": {
      id: "energy-infrastructure",
      title: "Energy infrastructure",
      icon: "zap",
      items: [
        {
          id: "solar-power",
          title: "Kyushu solar power capacity",
          type: "pdf",
          date: "2024-09",
          viewed: false,
          description:
            "Kyushu solar generation capacity has grown steadily since the FIT system launched in 2012. As of September 2024, installed solar capacity across the region reached 12.24 GW, providing the bulk of renewable generation supporting the semiconductor corridor.",
          coords: [32.95, 130.55],
          image: "assets/use-case-images/evidence-renewable-energy.webp",
          stats: [
            { value: "12.24GW", label: "Solar capacity (2024.9)" },
            { value: "1.54GW", label: "Solar capacity (2012)" },
            { value: "+140MW", label: "Growth from FY2023" },
            { value: "2012", label: "FIT system start" },
          ],
        },
        {
          id: "wind-power",
          title: "Kyushu wind power capacity",
          type: "pdf",
          date: "2024-09",
          viewed: false,
          description:
            "Kyushu wind generation complements solar as part of the region's renewable energy base. As of September 2024, installed wind capacity reached 640 MW. Combined with solar, total renewable capacity stands at 12.88 GW.",
          coords: [32.68, 130.42],
          image: "assets/use-case-images/evidence-renewable-energy.webp",
          stats: [
            { value: "640MW", label: "Wind capacity (2024.9)" },
            { value: "12.88GW", label: "Total renewable (solar+wind)" },
            { value: "430MW", label: "Wind capacity (2012)" },
            { value: "8.4x", label: "Total renewable growth since 2012" },
          ],
        },
        {
          id: "nuclear-kyushu",
          title: "Kyushu nuclear (Sendai)",
          type: "pdf",
          date: "2024-06",
          viewed: false,
          description:
            "Sendai Nuclear Power Plant provides baseload electricity for the region, ensuring stable power supply for high-demand semiconductor manufacturing.",
          coords: null,
          stats: [
            { value: "1.78GW", label: "Generation capacity" },
            { value: "99.97%", label: "Reliability rate" },
            { value: "24/7", label: "Baseload operation" },
            { value: "¥11/kWh", label: "Cost to grid" },
          ],
        },
        {
          id: "sewage-infrastructure",
          title: "Kumamoto Semicon public sewage plan",
          type: "pdf",
          date: "2024-10",
          viewed: false,
          description:
            "Kumamoto Prefecture urban plan sewerage change designating the Kumamoto Semicon Specified Public Sewage district. The 1:12,000 master plan map covers multiple zones across the Koshi and semiconductor corridor area to support expanded industrial and residential demand.",
          coords: [32.87, 130.8],
          image: "assets/use-case-images/evidence-sewers-utility-systems.webp",
          stats: [
            { value: "1:12,000", label: "Plan scale" },
            { value: "Koshi", label: "Primary coverage" },
            { value: "Prefecture", label: "Decision authority" },
            { value: "Specified", label: "Sewage designation" },
          ],
        },
      ],
    },
    "transportation-network": {
      id: "transportation-network",
      title: "Transportation network",
      icon: "route",
      items: [
        {
          id: "planned-roads",
          title: "Naka-Kyushu Cross Road extensions",
          type: "pdf",
          date: "2025-01",
          viewed: false,
          description:
            "Four-segment expressway system extending from Ueki IC through Koshi to Ozu IC, running north of the semiconductor corridor. Connects western Kumamoto to the existing expressway network at Ozu IC. Segments range from under survey to under construction.",
          coords: [32.87, 130.78],
          image:
            "assets/use-case-images/evidence-kumamoto-future-road-network.webp",
          stats: [
            { value: "22.5km", label: "Total extension" },
            { value: "4 segments", label: "Road sections" },
            { value: "Mixed", label: "Survey to construction" },
            { value: "Ueki IC to Ozu IC", label: "Route span" },
          ],
        },
        {
          id: "railway-expansion",
          title: "New JR Hohi Line station",
          type: "pdf",
          date: "2024-11",
          viewed: false,
          description:
            "A new station is planned on the JR Hohi Line between Sanrigi and Haramizu stations in Kikuyo Town. The station will serve the Semicon Techno Park corridor and the adjacent TSMC factory area, providing direct rail access from Kumamoto City to the semiconductor cluster.",
          coords: [32.88, 130.81],
          image: "assets/use-case-images/evidence-new-railway-system.webp",
          stats: [
            { value: "Planned", label: "Station status" },
            { value: "JR Hohi Line", label: "Railway line" },
            { value: "Sanrigi-Haramizu", label: "Between stations" },
            { value: "Semicon Techno Park", label: "Adjacent facility" },
          ],
        },
        {
          id: "airport-access",
          title: "Kumamoto Airport access rail",
          type: "pdf",
          date: "2025-02",
          viewed: false,
          description:
            "Planned 6.8km rail extension from Kumamoto Station to Aso Kumamoto Airport via the JR Hohi Line corridor. Estimated travel time of 44 minutes (39 minutes with express service). Projected daily ridership of 4,900 to 5,500 passengers by 2035.",
          coords: [32.84, 130.86],
          image: "assets/use-case-images/evidence-airport-to-city-railway.webp",
          stats: [
            { value: "6.8km", label: "Rail extension" },
            { value: "¥41B", label: "Estimated budget" },
            { value: "44min", label: "Kumamoto to airport" },
            { value: "5,500/day", label: "Ridership forecast" },
          ],
        },
        {
          id: "ring-road",
          title: "10-minute / 20-minute ring road concept",
          type: "pdf",
          date: "2025-01",
          viewed: false,
          description:
            "Government vision for a metropolitan ring road system centered on Kumamoto. Three connection roads (north, south, and airport) form a ring enabling highway interchange access within 10 minutes and airport access within 20 minutes from any point in the metro area. Integrates Shinkansen, light rail, bus, and Park and Ride facilities. Source: 3rd Kumamoto Metropolitan Road Network Study Committee (December 2019).",
          coords: [32.85, 130.82],
          images: [
            "assets/use-case-images/evidence-10-minute-ring-road-2.webp",
            "assets/use-case-images/evidence-10-minute-ring-road-3.webp",
          ],
          stats: [
            { value: "10 min", label: "IC access target" },
            { value: "20 min", label: "Airport access target" },
            { value: "3 routes", label: "North, south, airport" },
            { value: "Multi-modal", label: "Rail, bus, Park and Ride" },
          ],
        },
        {
          id: "transport-overview",
          title: "Kumamoto transport overview",
          type: "pdf",
          date: "2024-12",
          viewed: false,
          description:
            "Railway cost structure and community transport status across the Kumamoto metropolitan area. Facility maintenance accounts for 50% of railway operating costs, with direct transport at 39% and other costs at 11%. Community transport map shows suburban municipalities served by shared taxis and community buses, with many bus routes carrying only 0-7 passengers per vehicle per day, highlighting underserved corridors.",
          coords: null,
          image:
            "assets/use-case-images/evidence-kumamoto-transport-overview.webp",
          stats: [
            { value: "50%", label: "Railway costs on maintenance" },
            { value: "39%", label: "Direct transport costs" },
            { value: "0-7/day", label: "Low-density bus routes" },
            { value: "13", label: "Municipalities mapped" },
          ],
        },
        {
          id: "traffic-flow",
          title: "Regional traffic flow changes",
          type: "pdf",
          date: "2024-11",
          viewed: false,
          description:
            "Inter-regional traffic flow analysis from the Kumamoto Person Trip Survey comparing 2012 to 1997 baselines. Kikuyo-cho shows the highest growth at 1.67x, with the Kumamoto-to-Kikuyo corridor growing 1.54x. Overall Kumamoto metro traffic grew 1.13x to 1.67M trips/day. Commuting flows toward the northeast semiconductor cluster show the strongest growth, with Kikuyo-to-Ozu flows also at 1.67x.",
          coords: null,
          image:
            "assets/use-case-images/evidence-kumamoto-regional-traffic-flow.webp",
          stats: [
            { value: "1.67x", label: "Kikuyo traffic growth" },
            { value: "1.54x", label: "Kumamoto-Kikuyo corridor" },
            { value: "1.67M/day", label: "Kumamoto metro trips" },
            { value: "1997-2012", label: "Survey period" },
          ],
        },
        {
          id: "commuting-context",
          title: "Commuting challenges in Ozu-machi",
          type: "pdf",
          date: "2024-09",
          viewed: false,
          description:
            "Street-level view of road conditions near the semiconductor cluster in Ozu-machi. Single-lane roads with no sidewalks, shared with drainage infrastructure and bordered by residential apartment blocks. Illustrates the infrastructure gap between existing narrow roads and the traffic demands of the growing semiconductor workforce.",
          coords: null,
          image: "assets/use-case-images/evidence-commuting-hell.webp",
          stats: [
            { value: "Single lane", label: "Road width" },
            { value: "None", label: "Sidewalk provision" },
            { value: "Ozu-machi", label: "Location" },
            { value: "1.67x", label: "Area traffic growth" },
          ],
        },
      ],
    },
    "government-zones": {
      id: "government-zones",
      title: "Government zones",
      icon: "landmark",
      items: [
        {
          id: "science-park-plan",
          title: "Kumamoto Science Park",
          type: "pdf",
          date: "2024-03",
          viewed: false,
          description:
            "A distributed science park model connecting multiple industrial zones across Kumamoto. Five strategic pillars: advanced infrastructure, park management, talent development, startup incubation, and shared research facilities. Links university and industry collaboration at Semi-Con Techno Park, Kenei Industrial Park (Kikuchi), and Ozu-machi Industrial Park.",
          coords: [32.87, 130.78],
          image: "assets/use-case-images/evidence-science-park.webp",
          stats: [
            { value: "5", label: "Strategic pillars" },
            { value: "3+", label: "Industrial zones" },
            { value: "Distributed", label: "Park model" },
            { value: "AI, Robotics", label: "Focus sectors" },
          ],
        },
        {
          id: "kikuyo-plan",
          title: "Semiconductor cluster industrial parks",
          type: "pdf",
          date: "2024-07",
          viewed: false,
          description:
            "Map of semiconductor cluster areas and industrial parks around JASM/TSMC. Shows Koshi municipal industrial park, Kikuyo Town-operated industrial park, Kikuyo rezoned development district, Ozu town-operated industrial zone, Kumamoto Prefecture industrial park in Kikuchi, and Kyokushikawabe business zone. Transport links include Higo-Ozu access road, airport monorail, and Naka-Kyushu Cross Road.",
          coords: [32.88, 130.83],
          image: "assets/use-case-images/evidence-semiconductor-clusters.webp",
          stats: [
            { value: "6+", label: "Industrial zones" },
            { value: "Kikuyo", label: "Rezoned development" },
            { value: "Ozu", label: "Town-operated zone" },
            { value: "Kikuchi", label: "Prefecture park" },
          ],
        },
        {
          id: "ozu-plan",
          title: "TSMC area infrastructure and industrial parks",
          type: "pdf",
          date: "2024-05",
          viewed: false,
          description:
            "Overview of infrastructure status around TSMC expansion. Documents 13 planned industrial park sites across Kikuchi, Koshi, Ozu, Mashiki, and surrounding municipalities ranging from 8ha to 25ha, with opening dates from 2023 to 2028. Also summarizes four key infrastructure projects: Naka-Kyushu Cross Road, Ozu-Ueki Line road widening (2.4km to 6 lanes), airport access railway, and Kumamoto-Taiwan air routes.",
          coords: [32.86, 130.87],
          image:
            "assets/use-case-images/evidence-industrial-park-locations.webp",
          stats: [
            { value: "13", label: "Planned industrial sites" },
            { value: "8-25ha", label: "Site size range" },
            { value: "2023-28", label: "Opening timeline" },
            { value: "4", label: "Key infrastructure projects" },
          ],
        },
        {
          id: "grand-airport-plan",
          title: "New grand airport concept",
          type: "pdf",
          date: "2025-01",
          viewed: false,
          description:
            "Conceptual vision map for the New Grand Airport initiative. Identifies three development zones: north of airport (Kumamoto Science Park), south side of airport, and the Southern Prefecture Region. Shows strategic road connections to Fukuoka, Oita, Miyazaki, and Kagoshima via Kyushu Main Expressway, Central Kyushu Transversal Road, and Ariake Sea Coastal Road.",
          coords: [32.84, 130.86],
          image: "assets/use-case-images/evidence-new-grand-airport.webp",
          stats: [
            { value: "3", label: "Development zones" },
            { value: "North", label: "Science Park zone" },
            { value: "South", label: "Airport-side zone" },
            { value: "Regional", label: "Southern Prefecture" },
          ],
        },
        {
          id: "airport-master-plan",
          title: "East Asian route strategy",
          type: "pdf",
          date: "2025-01",
          viewed: false,
          description:
            "Strategic plan for attracting East Asian air routes to Kumamoto Airport. Targets 4.86 million passengers by 2027 (up from 3.92M in 2022) and 6.22 million by 2051. International routes planned to grow from 4 in 2022 to 11 by 2027 and 17 by 2051. Cargo volume targets 27,000 tons by 2027 and 42,000 tons by 2051. Includes new passenger terminal building and route network to major East Asian cities.",
          coords: [32.84, 130.86],
          image: "assets/use-case-images/evidence-airport-master-plan.webp",
          stats: [
            { value: "4.86M", label: "Passenger target 2027" },
            { value: "11", label: "International routes 2027" },
            { value: "27K tons", label: "Cargo target 2027" },
            { value: "6.22M", label: "Passenger target 2051" },
          ],
        },
      ],
    },
    "education-pipeline": {
      id: "education-pipeline",
      title: "Education pipeline",
      icon: "graduation-cap",
      items: [
        {
          id: "university-programs",
          title: "University partnerships with JASM",
          type: "pdf",
          date: "2024-10",
          viewed: false,
          description:
            "Regional university network feeding talent directly into JASM/TSMC operations. Multiple Kumamoto-area universities have established semiconductor engineering tracks, research partnerships, and internship pipelines linked to the JASM facility, creating a local talent supply chain for the expanding semiconductor cluster.",
          coords: [32.81, 130.73],
          stats: [
            { value: "JASM", label: "Primary employer link" },
            { value: "Multiple", label: "Partner universities" },
            { value: "Semiconductor", label: "Engineering focus" },
            { value: "Kumamoto", label: "Regional pipeline" },
          ],
        },
        {
          id: "training-centers",
          title: "International education and public school support",
          type: "web",
          date: "2025-01",
          viewed: false,
          description:
            "Dual-track system supporting families of foreign semiconductor engineers. International school expansion: Kyushu Lutheran Academy launched an International Elementary division with IB curriculum in English-Japanese bilingual environment; Kumamoto International School (KIS) is expanding facilities and hiring Taiwanese teachers for Taiwanese families. Public school transformation: Kumamoto City Board of Education deploys Japanese language instructors and translators to public schools to help foreign children integrate into local districts. Under the Internationalization Promotion Vision, foreign engineer families are treated as long-term residents, strengthening bilingual adaptability in public education.",
          coords: [32.86, 130.79],
          stats: [
            { value: "IB curriculum", label: "Kyushu Lutheran Academy" },
            { value: "Expanding", label: "Kumamoto International School" },
            { value: "Bilingual", label: "Public school support" },
            { value: "Dual track", label: "International and public" },
          ],
        },
        {
          id: "graduate-numbers",
          title: "College graduate wage gap",
          type: "pdf",
          date: "2024-12",
          viewed: false,
          description:
            "Bloomberg analysis showing widening wage gap between college graduates and overall workforce. In 2023, college graduate wage increase rate reached 3.1% versus 2.1% in the Shunto (spring wage negotiations), with the gap accelerating sharply from 2022. Sources: Institute of Labour Administration (graduates), RENGO (Shunto).",
          coords: [32.81, 130.73],
          image:
            "assets/use-case-images/vidence-wage-gap-college-graduates.webp",
          stats: [
            { value: "3.1%", label: "Graduate wage increase (2023)" },
            { value: "2.1%", label: "Shunto wage increase (2023)" },
            { value: "1.0%", label: "Gap widening" },
            { value: "2016-23", label: "Trend period" },
          ],
        },
      ],
    },
    "semiconductor-ecosystem": {
      id: "semiconductor-ecosystem",
      title: "Semiconductor ecosystem",
      icon: "cpu",
      items: [
        {
          id: "silicon-island",
          title: "Japan semiconductor materials dominance",
          type: "pdf",
          date: "2023-03",
          viewed: false,
          description:
            "JEITA/WSTS reference data showing Japan's global semiconductor presence. Japanese companies hold 8% of global semiconductor production (¥74.6 trillion market, 2022 estimate), but dominate materials and equipment: silicon wafers (~60% global share), photoresist (~70%), encapsulation materials (~80%), coating equipment (~90%), CVD equipment (~30%), etching equipment (~30%).",
          coords: null,
          image: "assets/use-case-images/evidence-silicon-island.webp",
          stats: [
            { value: "8%", label: "Japan production share" },
            { value: "~60-80%", label: "Materials global share" },
            { value: "~90%", label: "Coating equipment share" },
            { value: "¥74.6T", label: "Global market (2022)" },
          ],
        },
        {
          id: "existing-semiconductors",
          title: "Kyushu semiconductor factories",
          type: "pdf",
          date: "2024-06",
          viewed: false,
          description:
            "Map of major semiconductor-related factories across Kyushu. Semiconductor fabs (red): Mitsubishi Electric (Fukuoka), Sony (Nagasaki, Kumamoto x2, Kagoshima), Toshiba (Oita, Miyazaki), TSMC (Kumamoto), Renesas (Kumamoto), Tokyo Electron (Kumamoto), Rohm (near Saga). Materials and equipment makers (blue): SUMCO (Saga), Kyocera (Kagoshima). Company names include group companies.",
          coords: null,
          image: "assets/use-case-images/evidence-existing-semiconductors.webp",
          stats: [
            { value: "10+", label: "Semiconductor fabs" },
            { value: "7", label: "Prefectures covered" },
            { value: "Fabs", label: "Red markers" },
            { value: "Materials", label: "Blue markers" },
          ],
        },
        {
          id: "tsmc-infrastructure",
          title: "TSMC area industrial park schedule",
          type: "pdf",
          date: "2024-12",
          viewed: false,
          description:
            "Detailed map and table of 13 planned industrial parks around TSMC. Sites span Kikuchi, Koshi, Ozu, Mashiki, Tamana, Yamaga, and Kikuchi municipalities. Includes Kikuchi Techno Park (25ha, public, FY2026), Semicon Techno Park West (11.2ha, FY2025), Ozu site on Route 325 (7.9ha, FY2027), and JASM Phase 1 factory site (25ha). Mix of public and private development from 2023 to 2028.",
          coords: null,
          image:
            "assets/use-case-images/evidence-tsmc-infrastructure-overview.webp",
          stats: [
            { value: "13", label: "Planned park sites" },
            { value: "7.9-25ha", label: "Public site range" },
            { value: "2025-28", label: "Opening schedule" },
            { value: "6", label: "Municipalities" },
          ],
        },
        {
          id: "strategic-location",
          title: "East Asia supply chain proximity",
          type: "pdf",
          date: "2024-08",
          viewed: false,
          description:
            "Supply chain logistics map showing Kyushu as Japan's semiconductor hub and gateway to East Asia. Proximity to Taiwan (foundry), Korea (memory), and Shanghai (end-market and supply chain hinterland). All three connections within 1-2 days by sea and under 3 hours by air, offering shorter logistics times and integration advantages.",
          coords: null,
          image: "assets/use-case-images/evidence-strategic-location.webp",
          stats: [
            { value: "<3hrs", label: "Air to Taiwan/Korea/Shanghai" },
            { value: "1-2 days", label: "Sea freight" },
            { value: "3", label: "Key supply chain partners" },
            { value: "Hub", label: "Kyushu gateway role" },
          ],
        },
      ],
    },
    "investment-analysis": {
      id: "investment-analysis",
      title: "Investment analysis",
      icon: "trending-up",
      items: [
        {
          id: "demographic-trends",
          title: "TSMC area population and land prices",
          type: "pdf",
          date: "2025-01",
          viewed: false,
          description:
            "Population and land price trends around TSMC expansion. Ozu-machi land prices surged 33% (2023-2024), the highest increase nationally, rising from ¥43,000/sqm in 2014 to ¥77,000/sqm in 2024. Kikuyo-cho rose 30.8% to ¥95,600/sqm. TSMC corridor population has grown steadily, with Kikuyo reaching approximately 63,000 and showing 29% growth over the measured period.",
          coords: null,
          image:
            "assets/use-case-images/evidence-tsmc-area-demographic-trends.webp",
          stats: [
            { value: "33%", label: "Ozu land price surge (23-24)" },
            { value: "¥77K/sqm", label: "Ozu land price (2024)" },
            { value: "30.8%", label: "Kikuyo land price surge" },
            { value: "#1", label: "National increase rate" },
          ],
        },
        {
          id: "rental-assessment",
          title: "Rental assessment (4LDK/115sqm)",
          type: "pdf",
          date: "2025-01",
          viewed: false,
          description:
            "AI rent assessment for A-type 4LDK/115.1sqm property. Assessed rent: ¥170,000/month (¥1,477/sqm). Based on 30 comparable properties corrected to same conditions. Grade distribution: high ¥243K-259K (4 units), slightly high ¥208K-243K (4 units), average ¥174K-208K (13 units), slightly low ¥139K-174K (8 units). Correction factors include building age, floor area, walking distance, and amenities.",
          coords: null,
          image:
            "assets/use-case-images/evidence-rental-assessment-report.webp",
          stats: [
            { value: "¥170K", label: "Assessed monthly rent" },
            { value: "4LDK", label: "Property type" },
            { value: "115.1sqm", label: "Floor area" },
            { value: "30", label: "Comparable properties" },
          ],
        },
        {
          id: "rent-evaluation",
          title: "Rental assessment (4LDK/89sqm)",
          type: "pdf",
          date: "2025-02",
          viewed: false,
          description:
            "AI rent assessment for A-type 4LDK/89.1sqm property. Assessed rent: ¥160,000/month (¥1,796/sqm). Notes that comparable house rentals are rare in the area, and new construction in Ozu-machi is increasing with intense competition. Grade distribution: slightly high ¥196K-233K (8 units), average ¥158K-196K (8 units), slightly low ¥121K-158K (12 units).",
          coords: null,
          image:
            "assets/use-case-images/evidence-property-rent-evaluation.webp",
          stats: [
            { value: "¥160K", label: "Assessed monthly rent" },
            { value: "4LDK", label: "Property type" },
            { value: "89.1sqm", label: "Floor area" },
            { value: "¥1,796/sqm", label: "Unit rate" },
          ],
        },
        {
          id: "loan-analysis",
          title: "Acquisition loan analysis",
          type: "pdf",
          date: "2025-01",
          viewed: false,
          description:
            "Loan and yield analysis for existing property renovation scenarios at three price points (¥42M, ¥44M, ¥46M). Purchase incurs 7% fees; 1-2 months preparation with furnished rental fitout. Gross yield ranges from 4.26-5.22% depending on price and rent tier. Loan terms: 50% LTV, 20-year term, 2.50% interest rate, with monthly payments from ¥111,280 to ¥121,878.",
          coords: null,
          image:
            "assets/use-case-images/evidence-acquisition-loan-analysis.webp",
          stats: [
            { value: "4.26-5.22%", label: "Gross yield range" },
            { value: "50%", label: "Loan-to-value" },
            { value: "2.50%", label: "Interest rate" },
            { value: "20yr", label: "Loan term" },
          ],
        },
        {
          id: "investment-analysis-report",
          title: "Property P&L comparison (Ozu and Kikuyo)",
          type: "pdf",
          date: "2025-02",
          viewed: false,
          description:
            "Side-by-side profit and loss analysis for two properties in Ozu-machi and Kikuyo-machi. Total acquisition costs of 32.6-33.9M yen per unit including 7% purchase fees, 2-3M renovation, and 3M furniture/appliance package. Sale prices of 42-43M yen yield pre-tax profit of 4.0-4.4M yen per property (2.6-2.9M after 35% tax). Gross rental yields range from 4.40% to 5.16% based on assessed rents of 154K-185K/month.",
          coords: null,
          image:
            "assets/use-case-images/evidence-real-estate-investment-analysis.webp",
          stats: [
            { value: "4.40-5.16%", label: "Gross yield range" },
            { value: "¥42-43M", label: "Sale price per unit" },
            { value: "¥4.0-4.4M", label: "Pre-tax profit" },
            { value: "35%", label: "Tax rate applied" },
          ],
        },
      ],
    },
  },

  // ================================
  // DATA LAYERS - Mock data for toggleable map layers
  // ================================
  dataLayers: {
    sciencePark: {
      name: "Science Park",
      description:
        "Kumamoto Prefectural Government designated semiconductor development zone with tax incentives, streamlined permitting, and infrastructure investments.",
      stats: [
        { value: "¥4.8T", label: "Government investment" },
        { value: "2040", label: "Completion target" },
        { value: "50,000", label: "Projected new jobs" },
      ],
    },
    companies: {
      name: "Corporate sites",
      description:
        "Major semiconductor manufacturers operating within the Kumamoto corridor.",
      stats: [
        { value: "5", label: "Major fabs" },
        { value: "9,600+", label: "Direct employees" },
        { value: "¥3.2T", label: "Combined investment" },
      ],
    },
    properties: {
      name: "Properties",
      description:
        "Investment properties in the semiconductor corridor development zone.",
      stats: [
        { value: "+9.1%", label: "Avg appreciation" },
        { value: "5.5%", label: "Rental yield" },
        { value: "96%", label: "Occupancy" },
      ],
    },
    trafficFlow: {
      name: "Traffic flow",
      description:
        "Real-time and historical traffic patterns across the Kumamoto semiconductor corridor.",
      markers: [
        {
          id: "traffic-1",
          coords: [32.87, 130.8],
          name: "Route 57 Junction",
          congestion: "Moderate",
          peakHours: "7:30-9:00, 17:00-18:30",
          avgSpeed: "45 km/h",
        },
        {
          id: "traffic-2",
          coords: [32.88, 130.76],
          name: "JASM Access Road",
          congestion: "Heavy (peak)",
          peakHours: "8:00-9:30, 18:00-19:00",
          avgSpeed: "32 km/h",
        },
        {
          id: "traffic-3",
          coords: [32.84, 130.82],
          name: "Kikuyo Bypass",
          congestion: "Light",
          peakHours: "8:00-9:00",
          avgSpeed: "58 km/h",
        },
      ],
      routes: [
        {
          id: "route-57-main",
          name: "Route 57 Main",
          path: [
            [130.75, 32.85],
            [130.78, 32.86],
            [130.8, 32.87],
            [130.83, 32.88],
          ],
          level: "high",
          color: "#ef4444",
        },
        {
          id: "jasm-access",
          name: "JASM Access Road",
          path: [
            [130.76, 32.88],
            [130.77, 32.87],
            [130.785, 32.874],
          ],
          level: "high",
          color: "#ef4444",
        },
        {
          id: "kikuyo-bypass",
          name: "Kikuyo Bypass",
          path: [
            [130.8, 32.83],
            [130.82, 32.84],
            [130.84, 32.845],
            [130.86, 32.85],
          ],
          level: "medium",
          color: "#f97316",
        },
        {
          id: "local-roads-north",
          name: "Local roads north",
          path: [
            [130.78, 32.89],
            [130.8, 32.895],
            [130.82, 32.9],
          ],
          level: "low",
          color: "#fbbf24",
        },
        {
          id: "local-roads-south",
          name: "Local roads south",
          path: [
            [130.77, 32.82],
            [130.79, 32.825],
            [130.81, 32.83],
          ],
          level: "low",
          color: "#fbbf24",
        },
      ],
      stats: [
        { value: "23%", label: "Increase since 2023" },
        { value: "78%", label: "Work commuters" },
        { value: "Active", label: "Road expansion program" },
      ],
    },
    railCommute: {
      name: "Rail commute",
      description:
        "JR Kyushu rail network serving the semiconductor corridor workforce.",
      markers: [
        {
          id: "rail-1",
          coords: [32.79, 130.69],
          name: "Kumamoto Station",
          type: "Major Hub",
          toJasm: "28 min",
          frequency: "10 min",
        },
        {
          id: "rail-2",
          coords: [32.88, 130.81],
          name: "Kikuyo Station (Planned)",
          type: "New Station",
          toJasm: "8 min",
          frequency: "15 min",
          opening: "2026",
        },
        {
          id: "rail-3",
          coords: [32.84, 130.75],
          name: "Suizenji Station",
          type: "Transfer Hub",
          toJasm: "22 min",
          frequency: "12 min",
        },
      ],
      routes: [
        {
          id: "jr-hohi-line",
          name: "JR Hohi Line",
          path: [
            [130.69, 32.79],
            [130.72, 32.81],
            [130.75, 32.84],
            [130.78, 32.87],
            [130.81, 32.88],
          ],
          color: "#8b5cf6",
          type: "main",
        },
        {
          id: "jr-kagoshima-line",
          name: "JR Kagoshima Line",
          path: [
            [130.69, 32.79],
            [130.7, 32.77],
            [130.71, 32.75],
          ],
          color: "#a78bfa",
          type: "secondary",
        },
        {
          id: "planned-extension",
          name: "Planned Extension to Science Park",
          path: [
            [130.81, 32.88],
            [130.82, 32.885],
            [130.83, 32.89],
          ],
          color: "#c4b5fd",
          type: "planned",
        },
      ],
      stats: [
        { value: "12,000", label: "Daily commuters" },
        { value: "28 min", label: "Avg. to JASM" },
        { value: "2026", label: "Kikuyo Station" },
      ],
    },
    electricity: {
      name: "Electricity usage",
      description:
        "Regional power consumption and capacity for industrial operations.",
      markers: [
        {
          id: "elec-1",
          coords: [32.87, 130.78],
          name: "Science Park Grid",
          consumption: "1.8 GW",
          capacity: "2.4 GW",
          utilization: "75%",
        },
        {
          id: "elec-2",
          coords: [32.9, 130.82],
          name: "Sony Substation",
          consumption: "450 MW",
          capacity: "600 MW",
          utilization: "75%",
        },
        {
          id: "elec-3",
          coords: [32.85, 130.73],
          name: "Tokyo Electron Hub",
          consumption: "280 MW",
          capacity: "400 MW",
          utilization: "70%",
        },
      ],
      stats: [
        { value: "2.4 GW", label: "Grid capacity" },
        { value: "99.99%", label: "Uptime" },
        { value: "¥12/kWh", label: "Industrial rate" },
      ],
    },
    employment: {
      name: "Employment",
      description:
        "Semiconductor industry employment statistics and hiring trends.",
      markers: [
        {
          id: "emp-1",
          coords: [32.874, 130.785],
          name: "JASM",
          employees: "3,400",
          growth: "+850 (2025)",
          avgSalary: "¥6.8M",
        },
        {
          id: "emp-2",
          coords: [32.9, 130.82],
          name: "Sony Semiconductor",
          employees: "4,200",
          growth: "+600 (2025)",
          avgSalary: "¥6.2M",
        },
        {
          id: "emp-3",
          coords: [32.85, 130.73],
          name: "Tokyo Electron",
          employees: "1,200",
          growth: "+400 (2025)",
          avgSalary: "¥7.1M",
        },
        {
          id: "emp-4",
          coords: [32.82, 130.8],
          name: "Mitsubishi Electric",
          employees: "800",
          growth: "+200 (2025)",
          avgSalary: "¥5.9M",
        },
      ],
      stats: [
        { value: "9,600+", label: "Direct jobs" },
        { value: "+34%", label: "YoY growth" },
        { value: "¥6.5M", label: "Avg. salary" },
      ],
    },
    infrastructure: {
      name: "Infrastructure plan",
      description:
        "Planned and in-progress infrastructure development projects.",
      markers: [
        {
          id: "infra-1",
          coords: [32.88, 130.78],
          name: "New water treatment",
          status: "Under Construction",
          completion: "2025",
          budget: "¥28B",
        },
        {
          id: "infra-2",
          coords: [32.86, 130.84],
          name: "Logistics hub",
          status: "Planned",
          completion: "2027",
          budget: "¥45B",
        },
        {
          id: "infra-3",
          coords: [32.84, 130.72],
          name: "Data center complex",
          status: "Under Construction",
          completion: "2026",
          budget: "¥120B",
        },
      ],
      stats: [
        { value: "¥4.8T", label: "Total investment" },
        { value: "12", label: "Major projects" },
        { value: "2040", label: "Completion target" },
      ],
    },
    realEstate: {
      name: "Real estate",
      description:
        "Property market trends and investment activity in the corridor.",
      markers: [
        {
          id: "re-1",
          coords: [32.88, 130.82],
          name: "Kikuyo Residential Zone",
          trend: "+12% YoY",
          avgPrice: "¥48M",
          inventory: "Low",
        },
        {
          id: "re-2",
          coords: [32.85, 130.86],
          name: "Ozu Development Area",
          trend: "+8% YoY",
          avgPrice: "¥32M",
          inventory: "Medium",
        },
        {
          id: "re-3",
          coords: [32.82, 130.78],
          name: "Mashiki Township",
          trend: "+6% YoY",
          avgPrice: "¥28M",
          inventory: "High",
        },
      ],
      stats: [
        { value: "+9.1%", label: "Avg. appreciation" },
        { value: "5.5%", label: "Rental yield" },
        { value: "96%", label: "Occupancy rate" },
      ],
    },
    riskyArea: {
      name: "Risky area",
      description:
        "Flood zones, seismic risk areas, and natural hazard information.",
      markers: [
        {
          id: "risk-1",
          coords: [32.78, 130.72],
          name: "Shirakawa Flood Zone",
          risk: "Moderate",
          type: "Flood",
          mitigation: "Levee upgrade 2025",
        },
        {
          id: "risk-2",
          coords: [32.92, 130.88],
          name: "Volcanic Proximity",
          risk: "Low",
          type: "Volcanic",
          mitigation: "30km from Aso caldera",
        },
        {
          id: "risk-3",
          coords: [32.8, 130.65],
          name: "Liquefaction Zone",
          risk: "Moderate",
          type: "Seismic",
          mitigation: "Building code compliance",
        },
      ],
      stats: [
        { value: "Low", label: "Overall risk rating" },
        { value: "2016", label: "Last major event" },
        { value: "¥86B", label: "Mitigation investment" },
      ],
    },
    baseMap: {
      name: "Base map",
      description:
        "Standard geographic reference markers and points of interest.",
      markers: [
        {
          id: "base-1",
          coords: [32.79, 130.69],
          name: "Kumamoto City Center",
          type: "City",
          population: "740,000",
        },
        {
          id: "base-2",
          coords: [32.84, 130.86],
          name: "Kumamoto Airport",
          type: "Airport",
          routes: "12 international",
        },
        {
          id: "base-3",
          coords: [32.8842, 131.104],
          name: "Mount Aso",
          type: "Landmark",
          elevation: "1,592m",
        },
      ],
      stats: [
        { value: "740,000", label: "City population" },
        { value: "1.78M", label: "Prefecture pop." },
        { value: "#15", label: "Japan metro rank" },
      ],
    },
  },

  // Demand projections for stage 8 real estate thesis
  demandProjections: {
    rentalDemandForecast: [
      {
        year: "2024",
        units: 1200,
        growth: "+18%",
        driver: "JASM Phase 1 operational",
      },
      {
        year: "2025",
        units: 1850,
        growth: "+54%",
        driver: "Sony expansion + Tokyo Electron opening",
      },
      {
        year: "2026",
        units: 2400,
        growth: "+30%",
        driver: "JASM Phase 2 construction workforce",
      },
      {
        year: "2027",
        units: 3100,
        growth: "+29%",
        driver: "Full corridor operational",
      },
      {
        year: "2028",
        units: 3600,
        growth: "+16%",
        driver: "Stabilization at capacity",
      },
    ],
    inventoryConstraints:
      "Current housing stock serves 65% of projected demand. New construction permits lag behind workforce arrival by 12-18 months, creating sustained rental pressure through 2027.",
    seasonalNotes:
      "Semiconductor shift work creates year-round demand with no seasonal dip. April hiring cycles cause 15-20% rental inquiry spikes.",
  },
};
