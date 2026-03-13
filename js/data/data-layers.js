/**
 * Data layers, airline routes, infrastructure, and demand projections.
 */
import { t } from "../i18n/index.js";

export const airlineRoutes = {
  origin: {
    name: t("Aso Kumamoto Airport"),
    coords: [32.8373, 130.8551],
    code: "KMJ",
  },
  destinations: [
    {
      id: "seoul-incheon",
      name: t("Seoul Incheon"),
      coords: [37.4602, 126.4407],
      code: "ICN",
      country: t("South Korea"),
      region: t("Korea"),
      status: "active",
      flightTime: "1h 40m",
      airlines: [t("Korean Air"), t("T'way Air")],
      significance: t("Samsung memory division HQ link"),
      description: t(
        "Direct service to Seoul's primary international airport. Year-round daily flights."
      ),
      semiconductorLink: {
        company: t("Samsung"),
        role: t("Memory Division HQ"),
        color: "#34c759",
      },
    },
    {
      id: "busan-gimhae",
      name: t("Busan Gimhae"),
      coords: [35.1796, 128.9382],
      code: "PUS",
      country: t("South Korea"),
      region: t("Korea"),
      status: "active",
      flightTime: "1h 25m",
      airlines: [t("Eastar Jet")],
      significance: t("Korea's second-largest city"),
      description: t("Daily direct service on Boeing 737."),
    },
    {
      id: "taiwan-taoyuan",
      name: t("Taiwan Taoyuan"),
      coords: [24.8, 120.97],
      code: "TPE",
      country: t("Taiwan"),
      region: t("Taiwan"),
      status: "active",
      flightTime: "2h 15m",
      airlines: [t("Starlux Airlines"), t("China Airlines")],
      significance: t("TSMC headquarters connection"),
      description: t(
        "Direct service to Taiwan's main international gateway."
      ),
      semiconductorLink: {
        company: t("TSMC"),
        role: t("Global Headquarters"),
        color: "#007aff",
      },
    },
    {
      id: "kaohsiung",
      name: t("Kaohsiung"),
      coords: [22.5771, 120.35],
      code: "KHH",
      country: t("Taiwan"),
      region: t("Taiwan"),
      status: "active",
      flightTime: "2h 45m",
      airlines: [t("China Airlines")],
      significance: t("Southern Taiwan industrial access"),
      description: t(
        "Direct service to Taiwan's second-largest city and southern semiconductor hub."
      ),
    },
  ],
};

export const infrastructureRoads = [
  {
    id: "ozu-kumamoto-road",
    name: t("Ozu-Kumamoto Road"),
    coords: [
      [32.86, 130.7],
      [32.87, 130.74],
      [32.87, 130.78],
      [32.87, 130.82],
    ],
    status: t("Under Construction"),
    completionDate: t("TBD"),
    budget: t("Not disclosed"),
    length: "13.8 km",
    driveToJasm: t("Adjacent"),
    commuteImpact: "13.8km",
    description: t(
      "Longest segment of the Naka-Kyushu Cross Road, connecting Koshi to Ozu-West IC in two sections (9.1km Koshi to Kumamoto, started 2020; 4.7km Ozu-West to Koshi, started 2022). Runs directly north of the semiconductor corridor."
    ),
    documentLink: "#",
  },
  {
    id: "ozu-road",
    name: t("Ozu Road"),
    coords: [
      [32.87, 130.82],
      [32.875, 130.84],
      [32.88, 130.87],
    ],
    status: t("Under Survey"),
    completionDate: t("TBD"),
    budget: t("Not disclosed"),
    length: "4.8 km",
    driveToJasm: t("Adjacent"),
    commuteImpact: "4.8km",
    description: t(
      "Eastern segment connecting Ozu-West IC to the existing Ozu IC interchange. Project commenced in 2024 and is currently under survey. Completes the expressway link to the Ozu area east of the semiconductor corridor."
    ),
    documentLink: "#",
  },
  {
    id: "kumamoto-ring-road",
    name: t("Kumamoto Ring Road"),
    coords: [
      [32.84, 130.65],
      [32.85, 130.67],
      [32.86, 130.7],
    ],
    status: t("Under Survey"),
    completionDate: t("TBD"),
    budget: t("Not disclosed"),
    length: "3.9 km",
    driveToJasm: t("Western link"),
    commuteImpact: "3.9km",
    description: t(
      "Western extension connecting the Ueki IC area to the Kumamoto-Kita junction. Project commenced in 2025 and is currently under survey. Will provide expressway access from western Kumamoto into the corridor."
    ),
    documentLink: "#",
  },
];

export const infrastructureStation = {
  id: "kikuyo-station",
  name: t("Kikuyo Station"),
  coords: [32.8654, 130.8099],
  subtitle: t("New rail connection"),
  status: t("Under Construction"),
  completionDate: "2026",
  description: t(
    "New JR Hohi Line station providing direct rail access from Kumamoto City to the Science Park corridor. Reduces commute time for semiconductor workers."
  ),
  stats: [
    { value: "18 min", label: t("To Kumamoto City") },
    { value: "8 min", label: t("To JASM") },
    { value: "15 min", label: t("Train frequency") },
    { value: "8,000", label: t("Daily passengers est.") },
  ],
  commuteImpact: t("Rail option"),
  documentLink: "#",
};

export const haramizuStation = {
  id: "haramizu-station",
  name: t("Haramizu Station Area"),
  coords: [32.87079200721318, 130.82919294020132],
  subtitle: t("New development hub"),
  status: t("Under Development"),
  description: t(
    "Haramizu Station area is being developed as a new urban core with 70ha of mixed-use land. Three development zones planned. Mitsui Fudosan and JR Kyushu selected as development partners."
  ),
  stats: [
    { value: "70ha", label: t("Development area") },
    { value: "3 zones", label: t("Mixed-use plan") },
    { value: "Mitsui + JR", label: t("Development partners") },
    { value: "2028", label: t("Phase 1 target") },
  ],
  zones: [
    {
      name: t("Vibrancy"),
      description: t(
        "Station-front retail, F&B, international-friendly services"
      ),
    },
    {
      name: t("Knowledge cluster"),
      description: t("R&D offices, co-working, university satellite"),
    },
    {
      name: t("Live-Work"),
      description: t(
        "Mid-high density condos, serviced apartments for engineers"
      ),
    },
  ],
  commuteImpact: t("New urban core"),
  documentLink: "#",
};

export const dataLayers = {
  sciencePark: {
    name: t("Science Park"),
    description: t(
      "Kumamoto Prefectural Government designated semiconductor development zone with tax incentives, streamlined permitting, and infrastructure investments."
    ),
    stats: [
      { value: "¥4.8T", label: t("Government investment") },
      { value: "2040", label: t("Completion target") },
      { value: "50,000", label: t("Projected new jobs") },
    ],
  },
  companies: {
    name: t("Corporate sites"),
    description: t(
      "Major semiconductor manufacturers operating within the Kumamoto corridor."
    ),
    stats: [
      { value: "5", label: t("Major fabs") },
      { value: "9,600+", label: t("Direct employees") },
      { value: "¥3.2T", label: t("Combined investment") },
    ],
  },
  properties: {
    name: t("Properties"),
    description: t(
      "Investment properties in the semiconductor corridor development zone."
    ),
    stats: [
      { value: "+9.1%", label: t("Avg appreciation") },
      { value: "5.5%", label: t("Rental yield") },
      { value: "96%", label: t("Occupancy") },
    ],
  },
  trafficFlow: {
    name: t("Traffic flow"),
    description: t(
      "Real-time and historical traffic patterns across the Kumamoto semiconductor corridor."
    ),
    markers: [
      {
        id: "traffic-1",
        coords: [32.87, 130.8],
        name: t("Route 57 Junction"),
        congestion: t("Moderate"),
        peakHours: "7:30-9:00, 17:00-18:30",
        avgSpeed: "45 km/h",
      },
      {
        id: "traffic-2",
        coords: [32.88, 130.76],
        name: t("JASM Access Road"),
        congestion: t("Heavy (peak)"),
        peakHours: "8:00-9:30, 18:00-19:00",
        avgSpeed: "32 km/h",
      },
      {
        id: "traffic-3",
        coords: [32.84, 130.82],
        name: t("Kikuyo Bypass"),
        congestion: t("Light"),
        peakHours: "8:00-9:00",
        avgSpeed: "58 km/h",
      },
    ],
    routes: [
      {
        id: "route-57-main",
        name: t("Route 57 Main"),
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
        name: t("JASM Access Road"),
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
        name: t("Kikuyo Bypass"),
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
        name: t("Local roads north"),
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
        name: t("Local roads south"),
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
      { value: "23%", label: t("Increase since 2023") },
      { value: "78%", label: t("Work commuters") },
      { value: "Active", label: t("Road expansion program") },
    ],
  },
  railCommute: {
    name: t("Rail commute"),
    description: t(
      "JR Kyushu rail network serving the semiconductor corridor workforce."
    ),
    markers: [
      {
        id: "rail-1",
        coords: [32.79, 130.69],
        name: t("Kumamoto Station"),
        type: t("Major Hub"),
        toJasm: "28 min",
        frequency: "10 min",
      },
      {
        id: "rail-2",
        coords: [32.8654, 130.8099],
        name: t("Kikuyo Station (Planned)"),
        type: t("New Station"),
        toJasm: "8 min",
        frequency: "15 min",
        opening: "2026",
      },
      {
        id: "rail-3",
        coords: [32.84, 130.75],
        name: t("Suizenji Station"),
        type: t("Transfer Hub"),
        toJasm: "22 min",
        frequency: "12 min",
      },
    ],
    routes: [
      {
        id: "jr-hohi-line",
        name: t("JR Hohi Line"),
        path: [
          [130.69, 32.79],
          [130.72, 32.81],
          [130.75, 32.84],
          [130.78, 32.87],
          [130.81, 32.88],
        ],
        color: "#8b5cf6",
        type: t("main"),
      },
      {
        id: "jr-kagoshima-line",
        name: t("JR Kagoshima Line"),
        path: [
          [130.69, 32.79],
          [130.7, 32.77],
          [130.71, 32.75],
        ],
        color: "#a78bfa",
        type: t("secondary"),
      },
      {
        id: "planned-extension",
        name: t("Planned Extension to Science Park"),
        path: [
          [130.81, 32.88],
          [130.82, 32.885],
          [130.83, 32.89],
        ],
        color: "#c4b5fd",
        type: t("planned"),
      },
    ],
    stats: [
      { value: "12,000", label: t("Daily commuters") },
      { value: "28 min", label: t("Avg. to JASM") },
      { value: "2026", label: t("Kikuyo Station") },
    ],
  },
  electricity: {
    name: t("Electricity usage"),
    description: t(
      "Regional power consumption and capacity for industrial operations."
    ),
    markers: [
      {
        id: "elec-1",
        coords: [32.87, 130.78],
        name: t("Science Park Grid"),
        consumption: "1.8 GW",
        capacity: "2.4 GW",
        utilization: "75%",
      },
      {
        id: "elec-2",
        coords: [32.9, 130.82],
        name: t("Sony Substation"),
        consumption: "450 MW",
        capacity: "600 MW",
        utilization: "75%",
      },
      {
        id: "elec-3",
        coords: [32.85, 130.73],
        name: t("Tokyo Electron Hub"),
        consumption: "280 MW",
        capacity: "400 MW",
        utilization: "70%",
      },
    ],
    stats: [
      { value: "2.4 GW", label: t("Grid capacity") },
      { value: "99.99%", label: t("Uptime") },
      { value: "¥12/kWh", label: t("Industrial rate") },
    ],
  },
  employment: {
    name: t("Employment"),
    description: t(
      "Semiconductor industry employment statistics and hiring trends."
    ),
    markers: [
      {
        id: "emp-1",
        coords: [32.89232977461037, 130.84458372026097],
        name: t("JASM"),
        employees: "3,400",
        growth: "+850 (2025)",
        avgSalary: "¥6.8M",
      },
      {
        id: "emp-2",
        coords: [32.9, 130.82],
        name: t("Sony Semiconductor"),
        employees: "4,200",
        growth: "+600 (2025)",
        avgSalary: "¥6.2M",
      },
      {
        id: "emp-3",
        coords: [32.85, 130.73],
        name: t("Tokyo Electron"),
        employees: "1,200",
        growth: "+400 (2025)",
        avgSalary: "¥7.1M",
      },
      {
        id: "emp-4",
        coords: [32.82, 130.8],
        name: t("Mitsubishi Electric"),
        employees: "800",
        growth: "+200 (2025)",
        avgSalary: "¥5.9M",
      },
    ],
    stats: [
      { value: "9,600+", label: t("Direct jobs") },
      { value: "+34%", label: t("YoY growth") },
      { value: "¥6.5M", label: t("Avg. salary") },
    ],
  },
  infrastructure: {
    name: t("Infrastructure plan"),
    description: t(
      "Planned and in-progress infrastructure development projects."
    ),
    markers: [
      {
        id: "infra-1",
        coords: [32.88, 130.78],
        name: t("New water treatment"),
        status: t("Under Construction"),
        completion: "2025",
        budget: "¥28B",
      },
      {
        id: "infra-2",
        coords: [32.86, 130.84],
        name: t("Logistics hub"),
        status: t("Planned"),
        completion: "2027",
        budget: "¥45B",
      },
      {
        id: "infra-3",
        coords: [32.84, 130.72],
        name: t("Data center complex"),
        status: t("Under Construction"),
        completion: "2026",
        budget: "¥120B",
      },
    ],
    stats: [
      { value: "¥4.8T", label: t("Total investment") },
      { value: "12", label: t("Major projects") },
      { value: "2040", label: t("Completion target") },
    ],
  },
  realEstate: {
    name: t("Real estate"),
    description: t(
      "Property market trends and investment activity in the corridor."
    ),
    markers: [
      {
        id: "re-1",
        coords: [32.88, 130.82],
        name: t("Kikuyo Residential Zone"),
        trend: "+12% YoY",
        avgPrice: "¥48M",
        inventory: "Low",
      },
      {
        id: "re-2",
        coords: [32.85, 130.86],
        name: t("Ozu Development Area"),
        trend: "+8% YoY",
        avgPrice: "¥32M",
        inventory: "Medium",
      },
      {
        id: "re-3",
        coords: [32.82, 130.78],
        name: t("Mashiki Township"),
        trend: "+6% YoY",
        avgPrice: "¥28M",
        inventory: "High",
      },
    ],
    stats: [
      { value: "+9.1%", label: t("Avg. appreciation") },
      { value: "5.5%", label: t("Rental yield") },
      { value: "96%", label: t("Occupancy rate") },
    ],
  },
  riskyArea: {
    name: t("Risky area"),
    description: t(
      "Flood zones, seismic risk areas, and natural hazard information."
    ),
    markers: [
      {
        id: "risk-1",
        coords: [32.78, 130.72],
        name: t("Shirakawa Flood Zone"),
        risk: t("Moderate"),
        type: t("Flood"),
        mitigation: t("Levee upgrade 2025"),
      },
      {
        id: "risk-2",
        coords: [32.92, 130.88],
        name: t("Volcanic Proximity"),
        risk: t("Low"),
        type: t("Volcanic"),
        mitigation: t("30km from Aso caldera"),
      },
      {
        id: "risk-3",
        coords: [32.8, 130.65],
        name: t("Liquefaction Zone"),
        risk: t("Moderate"),
        type: t("Seismic"),
        mitigation: t("Building code compliance"),
      },
    ],
    stats: [
      { value: "Low", label: t("Overall risk rating") },
      { value: "2016", label: t("Last major event") },
      { value: "¥86B", label: t("Mitigation investment") },
    ],
  },
  scienceParkClusters: {
    name: t("Science park clusters"),
    description: t(
      "Kumamoto Science Park development zones with district-level plans for Kikuyo and Ozu municipalities."
    ),
    stats: [
      { value: "3", label: t("Zone plans") },
      { value: "2040", label: t("Completion target") },
      { value: "¥4.8T", label: t("Government investment") },
    ],
  },
  talentPipeline: {
    name: t("Education & talent pipeline"),
    description: t(
      "Universities, training centers, and employment data supporting the semiconductor corridor workforce."
    ),
    stats: [
      { value: "5", label: t("Universities") },
      { value: "3,400+", label: t("Annual graduates") },
      { value: "¥6.5M", label: t("Avg. salary") },
    ],
  },
  futureOutlook: {
    name: t("Future outlook"),
    description: t(
      "Composite 2030+ vision including science park expansion, road infrastructure, and development zones."
    ),
    stats: [
      { value: "2030+", label: t("Vision horizon") },
      { value: "12", label: t("Major projects") },
      { value: "¥4.8T", label: t("Total investment") },
    ],
  },
  investmentZones: {
    name: t("Investment opportunity zones"),
    description: t(
      "Three zones in the silicon triangle, each with a distinct role in the semiconductor ecosystem."
    ),
    stats: [
      { value: "3", label: t("Zones") },
      { value: "+9.1%", label: t("Avg. appreciation") },
      { value: "96%", label: t("Occupancy") },
    ],
  },
  baseMap: {
    name: t("Base map"),
    description: t(
      "Standard geographic reference markers and points of interest."
    ),
    markers: [
      {
        id: "base-1",
        coords: [32.79, 130.69],
        name: t("Kumamoto City Center"),
        type: t("City"),
        population: "740,000",
      },
      {
        id: "base-2",
        coords: [32.84, 130.86],
        name: t("Kumamoto Airport"),
        type: t("Airport"),
        routes: "12 international",
      },
      {
        id: "base-3",
        coords: [32.8842, 131.104],
        name: t("Mount Aso"),
        type: t("Landmark"),
        elevation: "1,592m",
      },
    ],
    stats: [
      { value: "740,000", label: t("City population") },
      { value: "1.78M", label: t("Prefecture pop.") },
      { value: "#15", label: t("Japan metro rank") },
    ],
  },
};

export const demandProjections = {
  rentalDemandForecast: [
    {
      year: "2024",
      units: 1200,
      growth: "+18%",
      driver: t("JASM Phase 1 operational"),
    },
    {
      year: "2025",
      units: 1850,
      growth: "+54%",
      driver: t("Sony expansion + Tokyo Electron opening"),
    },
    {
      year: "2026",
      units: 2400,
      growth: "+30%",
      driver: t("JASM Phase 2 construction workforce"),
    },
    {
      year: "2027",
      units: 3100,
      growth: "+29%",
      driver: t("Full corridor operational"),
    },
    {
      year: "2028",
      units: 3600,
      growth: "+16%",
      driver: t("Stabilization at capacity"),
    },
  ],
  inventoryConstraints: t(
    "Current housing stock serves 65% of projected demand. New construction permits lag behind workforce arrival by 12-18 months, creating sustained rental pressure through 2027."
  ),
  seasonalNotes: t(
    "Semiconductor shift work creates year-round demand with no seasonal dip. April hiring cycles cause 15-20% rental inquiry spikes."
  ),
};
