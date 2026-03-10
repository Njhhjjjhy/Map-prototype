/**
 * Data layers, airline routes, infrastructure, and demand projections.
 */

export const airlineRoutes = {
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
      flightTime: "2h 15m",
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
};

export const infrastructureRoads = [
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
];

export const infrastructureStation = {
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
};

export const haramizuStation = {
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
};

export const dataLayers = {
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
  scienceParkClusters: {
    name: "Science park clusters",
    description:
      "Kumamoto Science Park development zones with district-level plans for Kikuyo and Ozu municipalities.",
    stats: [
      { value: "3", label: "Zone plans" },
      { value: "2040", label: "Completion target" },
      { value: "¥4.8T", label: "Government investment" },
    ],
  },
  talentPipeline: {
    name: "Education & talent pipeline",
    description:
      "Universities, training centers, and employment data supporting the semiconductor corridor workforce.",
    stats: [
      { value: "5", label: "Universities" },
      { value: "3,400+", label: "Annual graduates" },
      { value: "¥6.5M", label: "Avg. salary" },
    ],
  },
  futureOutlook: {
    name: "Future outlook",
    description:
      "Composite 2030+ vision including science park expansion, road infrastructure, and development zones.",
    stats: [
      { value: "2030+", label: "Vision horizon" },
      { value: "12", label: "Major projects" },
      { value: "¥4.8T", label: "Total investment" },
    ],
  },
  investmentZones: {
    name: "Investment opportunity zones",
    description:
      "Three zones in the silicon triangle, each with a distinct role in the semiconductor ecosystem.",
    stats: [
      { value: "3", label: "Zones" },
      { value: "+9.1%", label: "Avg. appreciation" },
      { value: "96%", label: "Occupancy" },
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
};

export const demandProjections = {
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
};

