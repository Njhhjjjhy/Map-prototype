/**
 * Infrastructure data: talent pipeline, science park, zone plans, grand airport.
 */

export const talentPipeline = {
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
      logo: "assets/Kyutech-logo.svg",
      role: "Established a cross-departmental semiconductor human resources center to train the next generation of chip engineers.",
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
      logo: "assets/Kyushu-university-logo.svg",
      role: "Established an adult semiconductor retraining center for working professionals seeking to transition into the chip industry.",
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
      logo: "assets/Oita-university-logo.svg",
      role: "Established a semiconductor core talent retraining center focused on upskilling working professionals through industry-led partnerships.",
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
      logo: "assets/Kumamoto-university-logo.svg",
      role: "Partnered with JASM (TSMC) to establish a semiconductor research center as a direct industry-academia collaboration.",
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
      logo: "assets/Prefectural-university-of-kumamoto-logo.svg",
      role: "Since 2023, all first-year science and engineering students are required to take semiconductor introductory courses taught by industry experts.",
      details: [
        { label: "Mandate start", value: "2023" },
        { label: "Scope", value: "All first-year students" },
        { label: "Instructors", value: "Industry experts" },
      ],
    },
  ],
};

export const employmentData = {
  summary:
    "JASM and major semiconductor employers are reshaping Kumamoto's wage landscape, offering salaries significantly above local and national averages to attract talent.",
  companies: [
    {
      id: "jasm",
      name: "JASM (TSMC)",
      coords: [32.88565, 130.84237],
      color: "#e74c3c",
      headline: "¥280,000/month",
      headlineLabel: "University graduate salary",
      description:
        "JASM offers ¥280,000/month for university graduates, ¥320,000/month for master's degrees, and ¥360,000/month for doctorates. Significantly higher than the local Kumamoto average for graduates (~¥201,000/month).",
      quote:
        "JASM's monthly salary is ¥50,000 or more higher than the national average.",
      quoteSource: "METI, July 2024",
      stats: [
        { value: "¥280K", label: "University graduate" },
        { value: "¥320K", label: "Master's degree" },
        { value: "¥360K", label: "Doctorate" },
        { value: "¥201K", label: "Kumamoto average" },
      ],
      evidence: {
        title: "METI semiconductor workforce report",
        type: "pdf",
        url: "https://www.meti.go.jp/english/policy/0704_001.pdf",
        date: "2024-07",
      },
    },
    {
      id: "tel",
      name: "Tokyo Electron (TEL)",
      coords: [32.85, 130.73],
      color: "#2980b9",
      headline: "+40%",
      headlineLabel: "Salary increase for new recruits",
      description:
        "TEL broke the ¥300,000 barrier for new recruits to stay competitive with TSMC and ASML. Effective April 2024, monthly salary for university graduates reached ¥304,800 (increase of ¥85,500/month).",
      stats: [
        { value: "¥304,800", label: "New graduate salary" },
        { value: "+¥85,500", label: "Monthly increase" },
        { value: "40%", label: "Salary increase" },
        { value: "Apr 2024", label: "Effective date" },
      ],
      evidence: {
        title: "TEL quarterly earnings report",
        type: "pdf",
        url: "https://www.tel.com/ir/library/report/ll4pka00000000l9-att/fy24q4presentations-e.pdf",
        date: "2024-Q4",
      },
    },
  ],
};

export const sciencePark = {
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
};

export const scienceParkZonePlans = [
  {
    id: "sp-gov-zone",
    name: "Government zone plan",
    description:
      "The prefectural government designated a special semiconductor zone within the Science Park boundary. This zone provides tax incentives, streamlined permitting, and dedicated infrastructure for semiconductor-related industries.",
    coords: [32.88, 130.82],
    polygon: null,
    color: "rgba(255, 59, 48, 0.12)",
    strokeColor: "#ff3b30",
    camera: {
      center: [130.82, 32.885],
      zoom: 11.2,
      pitch: 45,
      bearing: 5,
    },
    stats: [
      { value: "560ha", label: "Designated area" },
      { value: "¥1.2T", label: "Public investment" },
      { value: "2025", label: "Zoning enacted" },
      { value: "15", label: "Incentive programs" },
    ],
    // Industrial park zones from reference map (red circles)
    industrialZones: [
      {
        id: "cluster-area",
        name: "Semiconductor cluster area",
        subtitle: "Kochi municipal / Kikuyo Town-operated industrial park",
        coords: [32.888, 130.835],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
      },
      {
        id: "kikuyo-rezoned",
        name: "Kikuyo town rezoned development district",
        coords: [32.8795, 130.7469],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
      },
      {
        id: "kumamoto-pref-park",
        name: "Kumamoto Prefecture industrial park",
        subtitle: "Kikuchi city",
        coords: [32.9191, 130.8343],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
      },
      {
        id: "kyokushikawabe",
        name: "Kyokushikawabe business / industrial zone",
        coords: [32.9312, 130.8328],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
      },
      {
        id: "ozu-industrial",
        name: "Ozu town-operated industrial zone",
        coords: [32.9051, 130.8512],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
      },
    ],
    // Key company locations (dark dots on reference map)
    companyDots: [
      {
        id: "jasm",
        label: "JASM",
        coords: [32.8859, 130.8429],
        color: "#1a2744",
      },
      {
        id: "sck",
        label: "SCK",
        coords: [32.8908, 130.8384],
        color: "#1a2744",
      },
      {
        id: "tkl",
        label: "TKL",
        coords: [32.8874, 130.8324],
        color: "#1a2744",
      },
    ],
    // Infrastructure lines from reference map
    infrastructureLines: [
      {
        id: "higo-ozu-access-road",
        label: "Higo-Ozu new Kumamoto airport access road",
        coords: [32.8756, 130.8657],
        type: "point",
        color: "#34c759",
        icon: "route",
      },
      {
        id: "airport-monorail",
        label: "Kumamoto airport monorail",
        type: "polygon",
        color: "rgba(0, 122, 255, 0.25)",
        strokeColor: "#007aff",
        polygon: [
          [130.86810777, 32.87136523],
          [130.86817213, 32.86977927],
          [130.86826868, 32.86816962],
          [130.86839742, 32.86653628],
          [130.86855835, 32.86487926],
          [130.86875147, 32.86319854],
          [130.86897678, 32.86149414],
          [130.86923428, 32.85976606],
          [130.86952396, 32.85801428],
          [130.86984584, 32.85623882],
          [130.87004299, 32.85463008],
          [130.87011541, 32.85318807],
          [130.87006311, 32.85191279],
          [130.86988609, 32.85080423],
          [130.86958434, 32.8498624],
          [130.86915786, 32.8490873],
          [130.86860666, 32.84847892],
          [130.86793074, 32.84803727],
          [130.86715155, 32.8475359],
          [130.8662691, 32.84697481],
          [130.86528338, 32.84635399],
          [130.8641944, 32.84567346],
          [130.86300215, 32.8449332],
          [130.86170664, 32.84413322],
          [130.86030787, 32.84327351],
          [130.85880583, 32.84235409],
          [130.8574996, 32.84148987],
          [130.85638916, 32.84068086],
          [130.85547453, 32.83992705],
          [130.8547557, 32.83922845],
          [130.85423267, 32.83858506],
          [130.85390544, 32.83799687],
          [130.85377401, 32.83746389],
          [130.85383839, 32.83698611],
          [130.85403017, 32.83657595],
          [130.85434935, 32.8362334],
          [130.85479594, 32.83595845],
          [130.85536993, 32.83575112],
          [130.85607133, 32.8356114],
          [130.85690014, 32.83553929],
          [130.85785634, 32.83553479],
          [130.85893996, 32.83559791],
          [130.86016707, 32.83579623],
          [130.86153768, 32.83612976],
          [130.86305178, 32.83659851],
          [130.86470939, 32.83720247],
          [130.8665105, 32.83794163],
          [130.8684551, 32.83881601],
          [130.8705432, 32.8398256],
          [130.8727748, 32.8409704],
          [130.87463491, 32.84244186],
          [130.87612354, 32.84423998],
          [130.87724068, 32.84636477],
          [130.87798634, 32.84881621],
          [130.87836051, 32.85159431],
          [130.8783632, 32.85469908],
          [130.87799439, 32.85813051],
          [130.87725411, 32.86188859],
          [130.87650041, 32.8652062],
          [130.8757333, 32.86808334],
          [130.87495278, 32.87052],
          [130.87415885, 32.87251618],
          [130.8733515, 32.87407188],
          [130.87253075, 32.87518711],
          [130.87169659, 32.87586186],
          [130.87084901, 32.87609614],
          [130.87011543, 32.87610288],
          [130.86949584, 32.8758821],
          [130.86899024, 32.87543378],
          [130.86859863, 32.87475794],
          [130.86832102, 32.87385457],
          [130.8681574, 32.87272366],
          [130.86810777, 32.87136523],
        ],
      },
    ],
  },
  {
    id: "sp-kikuyo-plan",
    name: "Kikuyo long-term plan",
    description:
      "Kikuyo Town has approved rezoning for mixed-use development adjacent to the Science Park. New housing, retail, medical, and support services planned for semiconductor workers and their families.",
    coords: [32.88, 130.83],
    polygon: [
      [130.8333, 32.8222],
      [130.8256, 32.8256],
      [130.825, 32.8333],
      [130.8053, 32.8431],
      [130.8, 32.8523],
      [130.7814, 32.8667],
      [130.7877, 32.875],
      [130.8236, 32.8833],
      [130.8333, 32.8957],
      [130.8334, 32.8966],
      [130.849, 32.891],
      [130.85, 32.8704],
      [130.8583, 32.8667],
      [130.8636, 32.85],
      [130.8667, 32.8442],
      [130.8743, 32.8417],
      [130.8667, 32.8367],
      [130.8583, 32.8351],
      [130.8333, 32.8222],
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
      [130.875, 32.8368],
      [130.8742, 32.841],
      [130.8636, 32.85],
      [130.8644, 32.854],
      [130.8583, 32.8645],
      [130.8497, 32.8703],
      [130.8536, 32.8833],
      [130.85, 32.89],
      [130.8529, 32.9],
      [130.8387, 32.9167],
      [130.8583, 32.921],
      [130.8667, 32.9304],
      [130.8833, 32.935],
      [130.9, 32.93],
      [130.9167, 32.91],
      [130.92, 32.89],
      [130.915, 32.87],
      [130.9, 32.85],
      [130.885, 32.84],
      [130.875, 32.8368],
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
];

export const grandAirportData = {
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
};
