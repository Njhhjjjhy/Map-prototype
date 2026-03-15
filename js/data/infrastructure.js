/**
 * Infrastructure data: talent pipeline, science park, zone plans, grand airport.
 */

import { t } from "../i18n/index.js";

export const talentPipeline = {
  description: t(
    "The Kyushu Semiconductor Human Resources Development Alliance, led by METI, coordinates talent cultivation across the region to ensure a steady pipeline of semiconductor engineers and technicians."
  ),
  government: {
    id: "meti",
    name: t("Ministry of Economy, Trade and Industry"),
    role: t("Leads the Kyushu Semiconductor Human Resources Development Alliance"),
    goals: t("Strengthen talent cultivation and supply chain stability"),
  },
  institutions: [
    {
      id: "kyutech",
      name: t("Kyutech"),
      fullName: t("Kyushu Institute of Technology"),
      city: t("Kitakyushu"),
      coords: [33.88, 130.84],
      color: "#e74c3c",
      logo: "assets/Kyutech-logo.svg",
      role: t("Established a cross-departmental semiconductor human resources center to train the next generation of chip engineers."),
      details: [
        { label: t("Annual graduates"), value: "300+" },
        { label: t("Program scope"), value: t("Cross-departmental") },
        { label: t("Core strength"), value: t("Research") },
      ],
    },
    {
      id: "kyushu-university",
      name: t("Kyushu University"),
      fullName: t("Kyushu University"),
      city: t("Fukuoka"),
      coords: [33.6, 130.42],
      color: "#8e44ad",
      logo: "assets/Kyushu-university-logo.svg",
      role: t("Established an adult semiconductor retraining center for working professionals seeking to transition into the chip industry."),
      details: [
        { label: t("Annual intake"), value: "500+" },
        { label: t("Target audience"), value: t("Working adults") },
        { label: t("University rank"), value: t("Top 5 in Japan") },
      ],
    },
    {
      id: "oita-university",
      name: t("Oita University"),
      fullName: t("Oita University"),
      city: t("Oita"),
      coords: [33.23, 131.6],
      color: "#2980b9",
      logo: "assets/Oita-university-logo.svg",
      role: t("Established a semiconductor core talent retraining center focused on upskilling working professionals through industry-led partnerships."),
      details: [
        { label: t("Program focus"), value: t("Core talent development") },
        { label: t("Target audience"), value: t("Working professionals") },
        { label: t("Partnership model"), value: t("Industry-led") },
      ],
    },
    {
      id: "prefectural-kumamoto",
      name: t("Prefectural University of Kumamoto"),
      fullName: t("Prefectural University of Kumamoto"),
      city: t("Kumamoto"),
      coords: [32.83, 130.76],
      color: "#f39c12",
      logo: "assets/Prefectural-university-of-kumamoto-logo.svg",
      role: t("Since 2023, all first-year science and engineering students are required to take semiconductor introductory courses taught by industry experts."),
      details: [
        { label: t("Mandate start"), value: "2023" },
        { label: t("Scope"), value: t("All first-year students") },
        { label: t("Instructors"), value: t("Industry experts") },
      ],
    },
    {
      id: "kumamoto-university",
      name: t("Kumamoto University"),
      fullName: t("Kumamoto University"),
      city: t("Kumamoto"),
      coords: [32.81, 130.73],
      color: "#27ae60",
      logo: "assets/Kumamoto-university-logo.svg",
      role: t("Partnered with JASM (TSMC) to establish a semiconductor research center as a direct industry-academia collaboration."),
      description: t("Kumamoto university has partnered with JASM (TSMC) to establish a semiconductor research center, enabling direct collaboration between industry and academia."),
      details: [
        { label: t("Industry partner"), value: "JASM (TSMC)" },
        { label: t("Researchers"), value: "400+" },
        { label: t("Model"), value: t("Industry-academia") },
      ],
    },
  ],
};

export const employmentData = {
  summary: t(
    "JASM and major semiconductor employers are reshaping Kumamoto's wage landscape, offering salaries significantly above local and national averages to attract talent."
  ),
  companies: [
    {
      id: "jasm",
      name: t("JASM (TSMC)"),
      coords: [32.88565, 130.84237],
      color: "#e74c3c",
      headline: t("¥280,000/month"),
      headlineLabel: t("University graduate salary"),
      description: t(
        "JASM offers ¥280,000/month for university graduates, ¥320,000/month for master's degrees, and ¥360,000/month for doctorates. Significantly higher than the local Kumamoto average for graduates (~¥201,000/month)."
      ),
      quote: t(
        "JASM's monthly salary is ¥50,000 or more higher than the national average."
      ),
      quoteSource: t("METI, July 2024"),
      stats: [
        { value: "¥280K", label: t("University graduate") },
        { value: "¥320K", label: t("Master's degree") },
        { value: "¥360K", label: t("Doctorate") },
        { value: "¥201K", label: t("Kumamoto average") },
      ],
      evidence: {
        title: t("METI semiconductor workforce report"),
        type: "pdf",
        url: "https://www.meti.go.jp/english/policy/0704_001.pdf",
        date: "2024-07",
      },
    },
    {
      id: "tel",
      name: t("Tokyo Electron (TEL)"),
      coords: [32.85, 130.73],
      color: "#2980b9",
      headline: t("+40%"),
      headlineLabel: t("Salary increase for new recruits"),
      description: t(
        "TEL broke the ¥300,000 barrier for new recruits to stay competitive with TSMC and ASML. Effective April 2024, monthly salary for university graduates reached ¥304,800."
      ),
      stats: [
        { value: "¥304,800", label: t("New graduate salary") },
        { value: "+¥85,500", label: t("Monthly increase") },
        { value: "40%", label: t("Salary increase") },
        { value: "Apr 2024", label: t("Effective date") },
      ],
      evidence: {
        title: t("TEL quarterly earnings report"),
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
  name: t("Kumamoto Science Park Corridor"),
  subtitle: t("Government development zone"),
  description: t(
    "The Kumamoto Prefectural Government has designated this area as a special semiconductor development zone, offering tax incentives, streamlined permitting, and infrastructure investments totaling ¥4.8 trillion."
  ),
  stats: [
    { value: "¥4.8T", label: t("Government investment") },
    { value: "2040", label: t("Completion target") },
    { value: "50,000", label: t("Projected new jobs") },
    { value: "12", label: t("Major facilities planned") },
  ],
  evidence: {
    title: t("Kumamoto Science Park master plan"),
    type: "pdf",
    description: t("Official development roadmap and zoning documentation"),
  },
};

export const scienceParkZonePlans = [
  {
    id: "sp-gov-zone",
    name: t("Government zone plan"),
    description: t(
      "The prefectural government designated a special semiconductor zone within the Science Park boundary. This zone provides tax incentives, streamlined permitting, and dedicated infrastructure for semiconductor-related industries."
    ),
    coords: [32.88, 130.82],
    polygon: null,
    color: "rgba(255, 59, 48, 0.12)",
    strokeColor: "#ff3b30",
    camera: {
      center: [130.7647, 32.8112],
      zoom: 11.8,
      pitch: 60,
      bearing: 61,
      duration: 2000,
    },
    stats: [
      { value: "560ha", label: t("Designated area") },
      { value: "¥2T", label: t("Public investment") },
      { value: "2025", label: t("Zoning enacted") },
      { value: "15", label: t("Incentive programs") },
    ],
    // Industrial park zones from reference map (red circles)
    industrialZones: [
      {
        id: "semiconductor-cluster-west",
        name: t("Semiconductor cluster area"),
        subtitle: t("Kochi municipal / Kikuyo Town industrial park"),
        direction: t("West of JASM"),
        coords: [32.8913, 130.8362],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
        description: t("The broader Semicon Techno Park zone straddling the Fukuhara–Haramizu boundary, west of JASM along Route 30 and the Kikuyo bypass. Includes Semicon Techno Park, Koshi Industrial Park, and Haramizu Industrial Park."),
        stats: [
          { value: "6+", label: t("Industrial parks") },
          { value: "FY2025", label: t("Phase 1 open") },
        ],
        image: "assets/use-case-images/evidence-semiconductor-clusters.webp",
        camera: { center: [130.8362, 32.8913], zoom: 13.1, pitch: 0, bearing: 0, duration: 2000 },
      },
      {
        id: "kumamoto-prefecture-park-north",
        name: t("Kumamoto Prefecture industrial park"),
        subtitle: t("Kikuchi City"),
        direction: t("North of JASM"),
        coords: [32.9172, 130.8323],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
        description: t("Prefecture-operated industrial park north of JASM, part of the distributed Science Park framework."),
        stats: [
          { value: "25ha", label: t("Site area") },
          { value: "FY2026", label: t("Opening") },
        ],
        image: "assets/use-case-images/evidence-industrial-park-locations.webp",
        camera: { center: [130.8323, 32.9172], zoom: 13.1, pitch: 0, bearing: 0, duration: 2000 },
      },
      {
        id: "kyokushikawabe-northeast",
        name: t("Kyokushikawabe zone"),
        direction: t("Northeast of JASM"),
        coords: [32.9090, 130.8365],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
        description: t("Kumamoto North Industrial Park northeast of JASM, forming part of the wider semiconductor corridor expansion across Kumamoto Prefecture."),
        stats: [],
        image: "assets/use-case-images/evidence-industrial-park-locations.webp",
        camera: { center: [130.8365, 32.9090], zoom: 13.1, pitch: 0, bearing: 0, duration: 2000 },
      },
      {
        id: "ozu-industrial-east",
        name: t("Ozu town-operated industrial zone"),
        direction: t("East of JASM"),
        coords: [32.8870, 130.8720],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
        description: t("Industrial corridor east of JASM including Honda Kumamoto Factory and Ozu South Industrial Park."),
        stats: [
          { value: "120ha", label: t("Industrial land") },
          { value: "¥95B", label: t("Investment") },
          { value: "2032", label: t("Phase 1") },
          { value: "3,000", label: t("Jobs") },
        ],
        image: "assets/use-case-images/evidence-semiconductor-clusters.webp",
        camera: { center: [130.8720, 32.8870], zoom: 13.1, pitch: 0, bearing: 0, duration: 2000 },
      },
      {
        id: "airport-area-southeast",
        name: t("Kumamoto airport area"),
        direction: t("Southeast of JASM"),
        coords: [32.8350, 130.8590],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
        description: t("Aso Kumamoto Airport and surrounding development zone, southeast of JASM."),
        stats: [],
        image: null,
        camera: { center: [130.8590, 32.8350], zoom: 13.1, pitch: 0, bearing: 0, duration: 2000 },
      },
      {
        id: "kikuyo-rezoned-southwest",
        name: t("Kikuyo town rezoned development district"),
        direction: t("Southwest of JASM"),
        coords: [32.8720, 130.8350],
        radius: 565,
        color: "rgba(255, 80, 80, 0.35)",
        strokeColor: "rgba(255, 60, 60, 0.6)",
        description: t("Planned land readjustment and rezoning area in the Kubota–Tsukure district of Kikuyo, southwest of JASM."),
        stats: [
          { value: "320ha", label: t("Rezoned area") },
          { value: "8,000", label: t("Housing units") },
          { value: "¥280B", label: t("Municipal budget") },
          { value: "2035", label: t("Target") },
        ],
        image: "assets/use-case-images/evidence-science-park.webp",
        camera: { center: [130.8350, 32.8720], zoom: 13.1, pitch: 0, bearing: 0, duration: 2000 },
      },
    ],
    // Key company locations — logo markers
    companyDots: [
      {
        id: "jasm",
        label: t("JASM"),
        logo: "assets/Jasm-logo.svg",
        coords: [32.88662326612072, 130.84268461365443],
      },
      {
        id: "sck",
        label: t("Sony Semiconductor Kumamoto"),
        logo: "assets/Sony-logo.svg",
        coords: [32.8908, 130.8384],
      },
    ],
    // Infrastructure lines from reference map
    infrastructureLines: [
      {
        id: "higo-ozu-access-road",
        label: t("Higo-Ozu airport access road"),
        type: "line",
        color: "#34c759",
        description: t("New access road connecting Kumamoto Airport to the Ozu development corridor and the semiconductor park."),
        status: t("Under planning"),
        path: [
          [32.8373, 130.8552],
          [32.843,  130.857 ],
          [32.853,  130.860 ],
          [32.862,  130.862 ],
          [32.871,  130.864 ],
          [32.877,  130.864 ],
        ],
      },
      {
        id: "airport-monorail",
        label: t("Kumamoto airport monorail"),
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
    name: t("Kikuyo long-term plan"),
    description: t(
      "Kikuyo Town has approved rezoning for mixed-use development adjacent to the Science Park. New housing, retail, medical, and support services planned for semiconductor workers and their families."
    ),
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
      { value: "320ha", label: t("Rezoned area") },
      { value: "8,000", label: t("New housing units") },
      { value: "2035", label: t("Target completion") },
      { value: "¥280B", label: t("Municipal budget") },
    ],
  },
  {
    id: "sp-ozu-plan",
    name: t("Ozu long-term plan"),
    description: t(
      "Ozu Town is developing new industrial parcels and logistics facilities to support the semiconductor supply chain. 120 hectares designated for industrial and logistics use."
    ),
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
      { value: "120ha", label: t("Industrial parcels") },
      { value: "¥150B", label: t("Infrastructure spend") },
      { value: "2032", label: t("Phase 1 complete") },
      { value: "3,500", label: t("Logistics jobs") },
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
        name: t("Kumamoto airport"),
        coords: [32.8373, 130.8552],
        icon: "plane",
        color: "#34c759",
        description: t(
          "Kumamoto's primary airport handling 3.5 million passengers annually. The proposed rail link will cut travel time to the semiconductor corridor to under 15 minutes."
        ),
        stats: [
          { value: "3.5M", label: t("Annual passengers") },
          { value: "15 min", label: t("Proposed rail time to JASM") },
        ],
      },
      {
        id: "higo-ozu",
        name: t("Higo-Ozu Station"),
        coords: [32.8773, 130.8668],
        icon: "train-front",
        color: "#ff9500",
        description: t(
          "Key JR Hohi Line junction where the proposed airport access railway will terminate, connecting air and rail transit for the semiconductor corridor."
        ),
        stats: [
          { value: "JR Hohi", label: t("Railway line") },
          { value: "44 min", label: t("To Kumamoto Station") },
        ],
      },
      {
        id: "semicon-tech-park",
        name: t("Semiconductor Tech Park"),
        coords: [32.876, 130.8],
        icon: "cpu",
        color: "#5856D6",
        description: t(
          "A dedicated technology park for semiconductor-related R&D and manufacturing support facilities, anchoring the northern end of the corridor."
        ),
        stats: [
          { value: "120 ha", label: t("Planned area") },
          { value: "2027", label: t("Target completion") },
        ],
      },
      {
        id: "new-kikuyo-landmark",
        name: t("New Kikuyo Station"),
        coords: [32.88, 130.81],
        icon: "train-front",
        color: "#ff9500",
        description: t(
          "Planned new station on the JR Hohi Line serving the semiconductor corridor workforce. Will reduce commute times for thousands of employees."
        ),
        stats: [
          { value: "2028", label: t("Planned opening") },
          { value: "6,000+", label: t("Projected daily riders") },
        ],
      },
      {
        id: "techno-research",
        name: t("Techno Research Park"),
        coords: [32.855, 130.86],
        icon: "microscope",
        color: "#5856D6",
        description: t(
          "Established research park housing semiconductor testing and advanced materials labs. Benefits directly from improved airport and rail connectivity."
        ),
        stats: [
          { value: "50+", label: t("Research tenants") },
          { value: "1996", label: t("Established") },
        ],
      },
    ],
    // Metadata for route lines (for hover/click interactions)
    routes: [
      {
        id: "prev-route",
        sourceId: "ga-prev-route",
        name: t("Previously announced route"),
        color: "#007aff",
        description: t(
          "The initial proposed alignment for the airport access railway, following a direct path from Aso Kumamoto Airport to Higo-Ozu Station."
        ),
        stats: [
          { value: "6.8 km", label: t("Estimated length") },
          { value: "Direct", label: t("Alignment type") },
        ],
      },
      {
        id: "new-route",
        sourceId: "ga-new-route",
        name: t("Newly announced monorail"),
        color: "#34c759",
        description: t(
          "The revised route announced in 2024, sweeping east to better serve the Techno Research Park area before connecting to Higo-Ozu Station."
        ),
        stats: [
          { value: "8.2 km", label: t("Estimated length") },
          { value: "Curved", label: t("Alignment type") },
        ],
      },
      {
        id: "hohi-line",
        sourceId: "ga-access-hohi-line",
        name: t("JR Hohi Line"),
        color: "#6e7073",
        description: t(
          "The existing east-west JR railway connecting Kumamoto City to Oita Prefecture. The airport access railway will join this line at Higo-Ozu Station."
        ),
        stats: [
          { value: "148 km", label: t("Total length") },
          { value: "1914", label: t("Established") },
        ],
      },
      {
        id: "airport-connection",
        sourceId: "ga-access-airport-road",
        name: t("Airport connection road"),
        color: "#34c759",
        description: t(
          "New high-standard road connecting Kumamoto IC directly east to Aso Kumamoto Airport. Reduces airport access time from the city center to approximately 20 minutes."
        ),
        stats: [
          { value: "~7 km", label: t("Length") },
          { value: "20-min access", label: t("Airport target") },
        ],
      },
    ],
  },

  // JR Hohi Main Line (Kumamoto to Higo-Ozu) and station data
  railway: {
    jrHohiLine: [
      [32.7904, 130.6885], // Kumamoto Station (start)
      [32.7980, 130.7050],
      [32.8080, 130.7200],
      [32.8200, 130.7380],
      [32.8350, 130.7550],
      [32.8480, 130.7750],
      [32.8618, 130.7970], // Sanrigi Station
      [32.8630, 130.8050],
      [32.8650, 130.8190], // Proposed new station
      [32.8680, 130.8240],
      [32.8706, 130.8291], // Haramizu Station
      [32.8730, 130.8400],
      [32.8750, 130.8530],
      [32.8774, 130.8662], // Higo-Ozu Station (end)
    ],
    stations: [
      {
        id: "kumamoto",
        name: t("Kumamoto station"),
        coords: [32.7904, 130.6885],
        type: "existing",
        icon: "train-front",
        color: "#ff9500",
        description: t(
          "Major terminal station and starting point of the JR Hohi Main Line. Principal rail hub for Kumamoto Prefecture with shinkansen connections."
        ),
        stats: [
          { value: "JR Hohi", label: t("Railway line") },
          { value: "32,000+", label: t("Daily riders") },
        ],
      },
      {
        id: "sanrigi",
        name: t("Sanrigi station"),
        coords: [32.8618, 130.7970],
        type: "existing",
        icon: "train-front",
        color: "#ff9500",
        description: t(
          "Station on the JR Hohi Main Line in the Kikuyo area, serving the growing residential district near the semiconductor corridor."
        ),
        stats: [
          { value: "JR Hohi", label: t("Railway line") },
          { value: "1,200", label: t("Daily riders") },
        ],
      },
      {
        id: "proposed-new",
        name: t("New Kikuyo station"),
        coords: [32.865, 130.819],
        type: "proposed",
        icon: "train-front",
        color: "#ff9500",
        description: t(
          "Planning-stage concept for a new station on the JR Hohi Main Line between Sanrigi and Haramizu, intended to serve the semiconductor corridor workforce directly."
        ),
        stats: [
          { value: "Concept", label: t("Status") },
          { value: "6,000+", label: t("Projected daily riders") },
        ],
      },
      {
        id: "haramizu",
        name: t("Haramizu station"),
        coords: [32.8706, 130.8291],
        type: "existing",
        icon: "train-front",
        color: "#ff9500",
        description: t(
          "Existing station on the JR Hohi Main Line east of the semiconductor corridor. Serves as a key access point for the Kikuyo residential area."
        ),
        stats: [
          { value: "JR Hohi", label: t("Railway line") },
          { value: "850", label: t("Daily riders") },
        ],
      },
      {
        id: "higo-ozu",
        name: t("Higo-Ozu station"),
        coords: [32.8774, 130.8662],
        type: "existing",
        icon: "train-front",
        color: "#ff9500",
        description: t(
          "Key JR Hohi Main Line junction where the proposed airport access railway will terminate, connecting air and rail transit for the semiconductor corridor."
        ),
        stats: [
          { value: "JR Hohi", label: t("Railway line") },
          { value: "44 min", label: t("To Kumamoto Station") },
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
      center: [130.7800, 32.8350],
      zoom: 11.0,
      pitch: 52,
      bearing: 30,
    },
    "ga-road-extensions": {
      center: [130.82, 32.86],
      zoom: 11.5,
      pitch: 45,
      bearing: 0,
    },
    "ga-ten-twenty-concept": {
      center: [130.7500, 32.8300],
      zoom: 10.8,
      pitch: 45,
      bearing: 0,
    },
  },

  // Road extensions data - new and expanded road segments
  roadExtensions: [
    {
      id: "airport-connection",
      name: t("Airport connection road"),
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
      description: t(
        "New high-standard road connecting Kumamoto IC directly east to Aso Kumamoto Airport. Reduces airport access time from the city center to approximately 20 minutes, supporting semiconductor industry logistics and business travel."
      ),
      stats: [
        { value: "New", label: t("Road type") },
        { value: "~7 km", label: t("Length") },
        { value: "20-min access", label: t("Airport target") },
      ],
    },
    {
      id: "ring-road-connector",
      name: t("Kumamoto ring road connector"),
      type: "new",
      color: "#e63f5a",
      coords: [
        [32.8974, 130.7178], // Kumamoto North JCT (start)
        [32.8820, 130.7220], // Kumamoto North IC
        [32.8910, 130.7445], // Nishi-Kamishi IC
        [32.8859, 130.7897], // Kamishi IC
        [32.8783, 130.8685], // Ozu West IC
        [32.8917, 130.8962], // Ozu IC (end)
      ],
      description: t(
        "Planned high-standard road running from Kumamoto North Junction westward to Ozu interchange. Part of the Kumamoto ring road network linking the semiconductor corridor to the expressway system."
      ),
      stats: [
        { value: "New", label: t("Road type") },
        { value: "~20 km", label: t("Length") },
        { value: "Ring road", label: t("Concept") },
      ],
    },
  ],

  // 10-20 minute concept data
  tenTwentyConcept: {
    lines: [
      {
        id: "northern-connecting",
        name: t("Northern connecting road"),
        coords: [
          [32.855, 130.67], [32.8554, 130.6702], [32.8558, 130.6704],
          [32.8564, 130.6707], [32.8571, 130.6711], [32.858, 130.6715],
          [32.8591, 130.6721], [32.8603, 130.6727], [32.8616, 130.6733],
          [32.863, 130.6741], [32.8645, 130.6749], [32.866, 130.6759],
          [32.8676, 130.6769], [32.8693, 130.6779], [32.8711, 130.6791],
          [32.873, 130.6803], [32.8748, 130.6816], [32.8765, 130.683],
          [32.8782, 130.6845], [32.8798, 130.686], [32.8813, 130.6876],
          [32.8827, 130.6893], [32.884, 130.6911], [32.8853, 130.693],
          [32.8864, 130.6949], [32.8872, 130.6969], [32.8878, 130.699],
          [32.8882, 130.7012], [32.8883, 130.7034], [32.8882, 130.7057],
          [32.8879, 130.7081], [32.8873, 130.7106], [32.8866, 130.7131],
          [32.8857, 130.7156], [32.8846, 130.7181], [32.8834, 130.7206],
          [32.8821, 130.7231], [32.8805, 130.7256], [32.8789, 130.7281],
          [32.877, 130.7306], [32.8752, 130.7331], [32.8735, 130.7356],
          [32.8718, 130.7381], [32.8702, 130.7406], [32.8687, 130.7431],
          [32.8673, 130.7456], [32.866, 130.7481], [32.8647, 130.7506],
          [32.8634, 130.7531], [32.8622, 130.7556], [32.8609, 130.7581],
          [32.8597, 130.7606], [32.8584, 130.7631], [32.8572, 130.7656],
          [32.8559, 130.7681], [32.8547, 130.7706], [32.8535, 130.7731],
          [32.8524, 130.7756], [32.8513, 130.7781], [32.8504, 130.7806],
          [32.8495, 130.7831], [32.8487, 130.7856], [32.848, 130.7881],
          [32.8473, 130.7906], [32.8468, 130.7931], [32.8465, 130.7956],
          [32.8463, 130.7981], [32.8463, 130.8006], [32.8464, 130.8031],
          [32.8466, 130.8056], [32.8471, 130.8081], [32.8477, 130.8106],
          [32.8482, 130.8129], [32.8487, 130.8148], [32.8491, 130.8165],
          [32.8495, 130.8178], [32.8497, 130.8188], [32.8499, 130.8195],
          [32.85, 130.82],
        ],
      },
      {
        id: "eastern-connecting",
        name: t("Eastern connecting road"),
        coords: [
          [32.85, 130.82], [32.8496, 130.8202], [32.8492, 130.8204],
          [32.8486, 130.8207], [32.8479, 130.8211], [32.847, 130.8215],
          [32.8459, 130.8221], [32.8447, 130.8227], [32.8434, 130.8232],
          [32.842, 130.8235], [32.8405, 130.8237], [32.839, 130.8238],
          [32.8374, 130.8236], [32.8357, 130.8234], [32.8339, 130.8229],
          [32.832, 130.8223], [32.8302, 130.8217], [32.8283, 130.8209],
          [32.8264, 130.8201], [32.8245, 130.8191], [32.8227, 130.8181],
          [32.8208, 130.8171], [32.8189, 130.8159], [32.817, 130.8147],
          [32.8152, 130.8134], [32.8133, 130.8122], [32.8114, 130.8109],
          [32.8095, 130.8097], [32.8077, 130.8084], [32.8058, 130.8072],
          [32.8039, 130.8059], [32.802, 130.8047], [32.8002, 130.8034],
          [32.7983, 130.802], [32.7964, 130.8005], [32.7945, 130.799],
          [32.7927, 130.7974], [32.7908, 130.7957], [32.7889, 130.7939],
          [32.787, 130.792], [32.7852, 130.7902], [32.7835, 130.7883],
          [32.7818, 130.7864], [32.7802, 130.7845], [32.7787, 130.7827],
          [32.7773, 130.7808], [32.776, 130.7789], [32.7747, 130.777],
          [32.7734, 130.7752], [32.7722, 130.7733], [32.7709, 130.7714],
          [32.7697, 130.7695], [32.7684, 130.7677], [32.7672, 130.7658],
          [32.7659, 130.7639], [32.7647, 130.762], [32.7635, 130.7602],
          [32.7624, 130.7583], [32.7613, 130.7564], [32.7604, 130.7545],
          [32.7595, 130.7527], [32.7587, 130.7508], [32.758, 130.7489],
          [32.7573, 130.747], [32.7568, 130.7453], [32.7563, 130.7439],
          [32.7559, 130.7426], [32.7555, 130.7416], [32.7553, 130.7409],
          [32.7551, 130.7404], [32.755, 130.74],
        ],
      },
      {
        id: "southern-connecting",
        name: t("Southern connecting road"),
        coords: [
          [32.755, 130.74], [32.755, 130.7396], [32.755, 130.7391],
          [32.755, 130.7384], [32.755, 130.7374], [32.755, 130.7361],
          [32.755, 130.7347], [32.755, 130.733], [32.755, 130.732],
          [32.7551, 130.7302], [32.7553, 130.7273], [32.7555, 130.7255],
          [32.7559, 130.7236], [32.7563, 130.7217], [32.7568, 130.7198],
          [32.7573, 130.718], [32.758, 130.7161], [32.7587, 130.7142],
          [32.7595, 130.7123], [32.7604, 130.7105], [32.7613, 130.7086],
          [32.7624, 130.7067], [32.7635, 130.7048], [32.7647, 130.703],
          [32.7659, 130.7011], [32.7672, 130.6992], [32.7684, 130.6973],
          [32.7697, 130.6955], [32.7709, 130.6936], [32.7722, 130.6917],
          [32.7734, 130.6898], [32.7747, 130.688], [32.776, 130.6861],
          [32.7774, 130.6843], [32.779, 130.6826], [32.7808, 130.681],
          [32.7827, 130.6795], [32.7848, 130.678], [32.787, 130.6766],
          [32.7894, 130.6753], [32.7919, 130.6741], [32.7944, 130.6729],
          [32.7969, 130.6719], [32.7994, 130.6709], [32.8019, 130.6699],
          [32.8044, 130.6691], [32.8069, 130.6683], [32.8094, 130.6677],
          [32.8119, 130.6671], [32.8144, 130.6666], [32.8169, 130.6662],
          [32.8194, 130.6659], [32.8219, 130.6658], [32.8244, 130.6657],
          [32.8269, 130.6658], [32.8294, 130.6659], [32.8319, 130.6662],
          [32.8343, 130.6665], [32.8366, 130.6667], [32.8388, 130.667],
          [32.841, 130.6674], [32.8431, 130.6677], [32.8451, 130.668],
          [32.847, 130.6684], [32.8488, 130.6688], [32.8504, 130.6691],
          [32.8518, 130.6694], [32.8529, 130.6696], [32.8538, 130.6698],
          [32.8544, 130.6699], [32.8548, 130.67], [32.855, 130.67],
        ],
      },
    ],
    circles: [
      { id: "city-hall", name: t("Kumamoto City Hall"), coords: [32.8031, 130.7079] },
      { id: "prefectural-office", name: t("Kumamoto Prefectural Office"), coords: [32.7898, 130.7415] },
      { id: "kumamoto-ic", name: t("Kumamoto IC"), coords: [32.8346, 130.7794] },
      { id: "mashiki", name: t("Mashiki area"), coords: [32.8080, 130.8050] },
    ],
  },
};
