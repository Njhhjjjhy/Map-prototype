/**
 * Property and investment zone data.
 */
import { t } from "../i18n/index.js";

export const futureZones = [
  {
    id: "kikuyo",
    name: t("Kikuyo Development Zone"),
    coords: [32.88, 130.83],
    color: "#5856D6",
    strokeColor: "#5856D6",
    subtitle: t("Residential & commercial"),
    description: t(
      "Kikuyo Town has approved rezoning for mixed-use development adjacent to the Science Park. New housing, retail, and support services for semiconductor workers."
    ),
    stats: [
      { value: "2,500", label: t("Housing units planned") },
      { value: "¥180B", label: t("Infrastructure budget") },
      { value: "2028", label: t("Phase 1 complete") },
      { value: "15min", label: t("To JASM") },
    ],
    evidence: {
      title: t("Kikuyo Town development plan"),
      type: "pdf",
      description: t("Official rezoning and infrastructure roadmap"),
    },
    boundary: [
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
    facilities: [
      { label: t("Housing"), coords: [32.885, 130.825] },
      { label: t("Retail hub"), coords: [32.876, 130.835] },
      { label: t("School"), coords: [32.882, 130.838] },
      { label: t("Medical"), coords: [32.878, 130.822] },
    ],
  },
  {
    id: "ozu",
    name: t("Ozu Industrial Expansion"),
    coords: [32.86, 130.87],
    color: "#30B0C7",
    strokeColor: "#30B0C7",
    subtitle: t("Industrial & logistics"),
    description: t(
      "Ozu Town is developing new industrial parcels and logistics facilities to support the semiconductor supply chain."
    ),
    stats: [
      { value: "120ha", label: t("Industrial land") },
      { value: "¥95B", label: t("Investment") },
      { value: "2027", label: t("Available") },
      { value: "3,000", label: t("Jobs projected") },
    ],
    evidence: {
      title: t("Ozu industrial zone plan"),
      type: "pdf",
      description: t("Industrial development documentation"),
    },
    boundary: [
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
    facilities: [
      { label: t("Logistics"), coords: [32.864, 130.875] },
      { label: t("Warehouse"), coords: [32.856, 130.866] },
      { label: t("Supplier park"), coords: [32.862, 130.878] },
    ],
  },
  {
    id: "koshi",
    name: t("Koshi R&D Corridor"),
    coords: [32.905, 130.76],
    color: "#4A90D9",
    strokeColor: "#4A90D9",
    subtitle: t("R&D and innovation"),
    description: t(
      "Koshi City is emerging as an R&D hub with Tokyo Electron's new facility and supporting tech infrastructure for the semiconductor corridor."
    ),
    stats: [
      { value: "¥47B", label: t("TEL investment") },
      { value: "~27,000sqm", label: t("R&D facility") },
      { value: "2028", label: t("Phase 1 complete") },
      { value: "1,500", label: t("R&D jobs") },
    ],
    evidence: {
      title: t("Koshi City development plan"),
      type: "pdf",
      description: t("R&D corridor expansion documentation"),
    },
    boundary: [
      [130.72, 32.897],
      [130.7228, 32.9],
      [130.7224, 32.9035],
      [130.723, 32.9105],
      [130.7242, 32.9143],
      [130.7262, 32.9207],
      [130.7281, 32.925],
      [130.732, 32.9271],
      [130.7333, 32.9263],
      [130.7417, 32.9248],
      [130.75, 32.9265],
      [130.775, 32.9181],
      [130.7917, 32.9121],
      [130.8083, 32.9093],
      [130.8236, 32.8833],
      [130.7877, 32.875],
      [130.7814, 32.8667],
      [130.725, 32.8879],
      [130.7225, 32.8917],
      [130.72, 32.897],
    ],
    facilities: [],
  },
];

// Step 9 zones (circle overlays)
export const corridorZones = [
  {
    id: "central-city-zone",
    name: t("Central city"),
    center: [32.8016, 130.7014],
    radius: 7,
    color: "rgba(52, 199, 89, 0.15)",
    strokeColor: "rgba(52, 199, 89, 0.4)",
  },
  {
    id: "middle-zone",
    name: t("Middle zone"),
    center: [32.8364, 130.7575],
    radius: 7,
    color: "rgba(255, 149, 0, 0.15)",
    strokeColor: "rgba(255, 149, 0, 0.4)",
  },
  {
    id: "jasm-zone",
    name: t("JASM"),
    center: [32.8678, 130.8419],
    radius: 7,
    color: "rgba(251, 185, 49, 0.15)",
    strokeColor: "rgba(251, 185, 49, 0.4)",
  },
];

// Step 10 zones (polygon boundaries for property drill-down)
export const investmentZones = [
  {
    id: "kikuyo-zone",
    name: t("Kikuyo"),
    role: t("Factory core / new urban core"),
    center: [32.86, 130.83],
    color: "rgba(232, 93, 76, 0.15)",
    strokeColor: "rgba(232, 93, 76, 0.4)",
    boundary: [
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
  },
  {
    id: "ozu-zone",
    name: t("Ozu"),
    role: t("Gateway / office and logistics support"),
    center: [32.88, 130.87],
    color: "rgba(93, 187, 99, 0.15)",
    strokeColor: "rgba(93, 187, 99, 0.4)",
    boundary: [
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
  },
  {
    id: "koshi-zone",
    name: t("Koshi"),
    role: t("R&D / tools and process innovation"),
    center: [32.905, 130.76],
    color: "rgba(74, 144, 217, 0.15)",
    strokeColor: "rgba(74, 144, 217, 0.4)",
    boundary: [
      [130.72, 32.897],
      [130.7228, 32.9],
      [130.7224, 32.9035],
      [130.723, 32.9105],
      [130.7242, 32.9143],
      [130.7262, 32.9207],
      [130.7281, 32.925],
      [130.732, 32.9271],
      [130.7333, 32.9263],
      [130.7417, 32.9248],
      [130.75, 32.9265],
      [130.775, 32.9181],
      [130.7917, 32.9121],
      [130.8083, 32.9093],
      [130.8236, 32.8833],
      [130.7877, 32.875],
      [130.7814, 32.8667],
      [130.725, 32.8879],
      [130.7225, 32.8917],
      [130.72, 32.897],
    ],
  },
];

export const gktk = {
  name: t("GKTK Fund"),
  fullName: t("Greater Kumamoto Technology Corridor Fund"),
  fundSize: "¥2.5B",
  fundSizeNote: t("Target AUM"),
  strategy: t("Real estate investment in the semiconductor corridor"),
  vintage: "2025",
  stats: [
    { value: "¥2.5B", label: t("Fund size") },
    { value: "2025", label: t("Vintage") },
    { value: "5-7yr", label: t("Hold period") },
    { value: "12-18%", label: t("Target IRR") },
  ],
};

export const properties = [
  {
    id: "ozu-1",
    name: t("Chateau Life Ozu 1"),
    coords: [32.8969721, 130.8513891],
    subtitle: t("Renovation"),
    type: t("Build to rent"),
    zone: "Ozu",
    subArea: t("Sugimizu"),
    distanceToJasm: "3.3 km",
    driveTime: "7 min",
    address:
      "3542-81 Shimomizusako, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto",
    camera: {
      center: [130.85025552883533, 32.914715306464416],
      zoom: 14.0,
      pitch: 52,
      bearing: 15,
    },
    connections: {
      jasm: { coords: [32.88615077755822, 130.84277124622932], distance: "3.3 km", time: "7 min" },
      station: {
        id: "haramizu-station",
        name: t("Haramizu station"),
        coords: [32.87079200721318, 130.82919294020132],
        distance: "5.3 km",
        time: "11 min",
      },
      airport: {
        coords: [32.83514194156781, 130.8590315178461],
        distance: "8.9 km",
        time: "18 min",
      },
      road: {
        id: "ozu-road",
        name: t("Ozu Road"),
        coords: [32.88, 130.87],
        distance: "4.3 km",
        time: "9 min",
      },
    },

    cards: [
      {
        type: "images",
        data: {
          exterior: "assets/step-11-images/ozu-1-exterior.webp",
          interior: [
            "assets/step-11-images/ozu-1-interior-1.webp",
            "assets/step-11-images/ozu-1-interior-2.webp",
            "assets/step-11-images/ozu-1-interior-3.webp",
            "assets/step-11-images/ozu-1-interior-4.webp",
            "assets/step-11-images/ozu-1-interior-5.webp",
            "assets/step-11-images/ozu-1-interior-6.webp",
            "assets/step-11-images/ozu-1-interior-7.webp",
          ],
          site: "",
        },
      },
      {
        type: "truth-engine",
        data: {
          basicSettings: {
            propertyName: t("Chateau Life Ozu 1"),
            address: t(
              "3542-81 Shimomizusako, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto"
            ),
            propertyType: t("Detached house (single-family)"),
            landArea: t("117.62 sqm (approx. 35.6 tsubo)"),
            buildingArea: t(
              "89.10 sqm total (1F: 43.74 sqm, 2F: 45.36 sqm), 2 floors"
            ),
            layout: t("4LDK, 3 parking spaces"),
            availability: t("May 2026 onwards"),
            rentBear: t("¥160,000/mo"),
            rentAverage: t("¥190,000/mo"),
            rentBull: t("¥210,000/mo"),
          },
          designStrategy: {
            description: t("Expat family standard spec"),
            features: [
              t("Large living/dining"),
              t("Dishwasher, floor heating, high insulation"),
              t("Ample storage, EV charging prep"),
              t("Standardized facade and modular floor plans"),
              t("Compressed construction period and cost volatility"),
            ],
          },
          landStrategy: {
            description: t(
              "Three-factor balance: school district + living amenities + commute"
            ),
            risks: [
              t("Fragmented land"),
              t("Site preparation costs"),
              t("Drainage/foundation improvement costs uncertain"),
            ],
          },
        },
      },
      {
        type: "future-outlook",
        data: {
          description: t("Area development plans affecting Ozu 1"),
          factors: [
            {
              title: t("Ozu industrial expansion"),
              impact: t(
                "120ha new logistics and supply chain facilities by 2027"
              ),
            },
            {
              title: t("Naka-Kyushu Cross Road"),
              impact: t(
                "Ozu-Kumamoto Road segment under construction, expressway link through corridor"
              ),
            },
            {
              title: t("Science park expansion"),
              impact: t(
                "Government commitment extends development corridor southward"
              ),
            },
          ],
        },
      },
      {
        type: "financial",
        data: {
          strategy: t("BTR (build to rent)"),
          acquisitionCost: 45600000,
          scenarios: {
            bear: {
              annualRent: 1920000,
              irr: 0.042,
              holdYears: 5,
            },
            average: {
              annualRent: 2280000,
              irr: 0.05,
              holdYears: 5,
            },
            bull: {
              annualRent: 2520000,
              irr: 0.055,
              holdYears: 5,
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
            title: t("AI rent assessment (4LDK/89sqm)"),
            type: "pdf",
            description: t(
              "Assessed rent ¥160,000/month from comparable properties"
            ),
            image:
              "assets/use-case-images/evidence-property-rent-evaluation.webp",
          },
        },
      },
    ],
  },
  {
    id: "ozu-2",
    name: t("Chateau Life Ozu 2"),
    coords: [32.914382, 130.860216],
    subtitle: t("Renovation"),
    type: t("Build to rent"),
    zone: "Ozu",
    subArea: t("Sugimizu"),
    distanceToJasm: "3.3 km",
    driveTime: "7 min",
    address: "2813-1 Shimozuru, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto",
    camera: {
      center: [130.85029844417664, 32.914778352968796],
      zoom: 14.0,
      pitch: 52,
      bearing: 15,
    },
    connections: {
      jasm: { coords: [32.88615077755822, 130.84277124622932], distance: "3.3 km", time: "7 min" },
      station: {
        id: "haramizu-station",
        name: t("Haramizu station"),
        coords: [32.87079200721318, 130.82919294020132],
        distance: "5.3 km",
        time: "11 min",
      },
      airport: {
        coords: [32.83514194156781, 130.8590315178461],
        distance: "8.9 km",
        time: "18 min",
      },
      road: {
        id: "ozu-road",
        name: t("Ozu Road"),
        coords: [32.88, 130.87],
        distance: "4.3 km",
        time: "9 min",
      },
    },

    cards: [
      {
        type: "images",
        data: {
          exterior: "assets/step-11-images/ozu-2-exterior.webp",
          interior: [
            "assets/step-11-images/ozu-2-interior-1.webp",
            "assets/step-11-images/ozu-2-interior-2.webp",
            "assets/step-11-images/ozu-2-interior-3.webp",
            "assets/step-11-images/ozu-2-interior-4.webp",
            "assets/step-11-images/ozu-2-interior-5.webp",
            "assets/step-11-images/ozu-2-interior-6.webp",
            "assets/step-11-images/ozu-2-interior-7.webp",
          ],
          site: "",
        },
      },
      {
        type: "truth-engine",
        data: {
          basicSettings: {
            propertyName: t("Chateau Life Ozu 2"),
            address: t(
              "2813-1 Shimozuru, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto"
            ),
            propertyType: t("Detached house (single-family)"),
            landArea: t("200.7 sqm (approx. 60.7 tsubo)"),
            buildingArea: t("94.81 sqm total, 2 floors"),
            layout: t("4LDK, 3 parking spaces"),
            availability: t("July 2026 onwards"),
            rentBear: t("¥160,000/mo"),
            rentAverage: t("¥190,000/mo"),
            rentBull: t("¥210,000/mo"),
          },
          designStrategy: {
            description: t("Expat family standard spec"),
            features: [
              t("Large living/dining"),
              t("Dishwasher, floor heating, high insulation"),
              t("Ample storage, EV charging prep"),
              t("Standardized facade and modular floor plans"),
              t("Compressed construction period and cost volatility"),
            ],
          },
          landStrategy: {
            description: t(
              "Three-factor balance: school district + living amenities + commute"
            ),
            risks: [
              t("Fragmented land"),
              t("Site preparation costs"),
              t("Drainage/foundation improvement costs uncertain"),
            ],
          },
        },
      },
      {
        type: "future-outlook",
        data: {
          description: t("Area development plans affecting Ozu 2"),
          factors: [
            {
              title: t("Ozu industrial expansion"),
              impact: t(
                "120ha new logistics and supply chain facilities by 2027"
              ),
            },
            {
              title: t("Naka-Kyushu Cross Road"),
              impact: t(
                "Ozu-Kumamoto Road segment under construction, expressway link through corridor"
              ),
            },
            {
              title: t("Science park expansion"),
              impact: t(
                "Government commitment extends development corridor southward"
              ),
            },
          ],
        },
      },
      {
        type: "financial",
        data: {
          strategy: t("BTR (build to rent)"),
          acquisitionCost: 45600000,
          scenarios: {
            bear: {
              annualRent: 1920000,
              irr: 0.042,
              holdYears: 5,
            },
            average: {
              annualRent: 2280000,
              irr: 0.05,
              holdYears: 5,
            },
            bull: {
              annualRent: 2520000,
              irr: 0.055,
              holdYears: 5,
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
            title: t("AI rent assessment (4LDK/95sqm)"),
            type: "pdf",
            description: t("Assessed rent from comparable properties"),
            image:
              "assets/use-case-images/evidence-property-rent-evaluation.webp",
          },
        },
      },
    ],
  },
  {
    id: "kikuyo-1",
    name: t("Chateau Life Kikuyo 1"),
    coords: [32.85619131225209, 130.84545339429738],
    subtitle: t("Renovation"),
    type: t("Buy-renovate-rent/sell"),
    zone: "Kikuyo",
    subArea: t("Kubota"),
    distanceToJasm: "3.3 km",
    driveTime: "7 min",
    address:
      "1315-18, 23 Maeda, Aza Kubota, Kikuyo-machi, Kikuchi-gun, Kumamoto",
    camera: {
      center: [130.84545339429738, 32.85619131225209],
      zoom: 14.0,
      pitch: 52,
      bearing: 5,
    },
    connections: {
      jasm: { coords: [32.88615077755822, 130.84277124622932], distance: "3.3 km", time: "7 min" },
      station: {
        id: "kikuyo-station",
        name: t("Kikuyo station"),
        coords: [32.8654, 130.8099],
        distance: "3.5 km",
        time: "7 min",
      },
      airport: {
        coords: [32.83514194156781, 130.8590315178461],
        distance: "2.7 km",
        time: "5 min",
      },
      road: {
        id: "ozu-road",
        name: t("Ozu Road"),
        coords: [32.875, 130.84],
        distance: "2.2 km",
        time: "4 min",
      },
    },

    cards: [
      {
        type: "images",
        data: {
          exterior: "assets/step-11-images/kikuyo-1-exterior.webp",
          interior: [
            "assets/step-11-images/kikuyo-1-interior-1.webp",
            "assets/step-11-images/kikuyo-1-interior-2.webp",
            "assets/step-11-images/kikuyo-1-interior-3.webp",
            "assets/step-11-images/kikuyo-1-interior-4.webp",
            "assets/step-11-images/kikuyo-1-interior-5.webp",
            "assets/step-11-images/kikuyo-1-interior-6.webp",
            "assets/step-11-images/kikuyo-1-interior-7.webp",
          ],
          site: "",
        },
      },
      {
        type: "truth-engine",
        data: {
          basicSettings: {
            propertyName: t("Chateau Life Kikuyo 1"),
            address: t(
              "1315-18, 23 Maeda, Aza Kubota, Kikuyo-machi, Kikuchi-gun, Kumamoto"
            ),
            propertyType: t("Detached house (single-family)"),
            landArea: t("201.6 sqm (approx. 60.98 tsubo)"),
            buildingArea: t(
              "115.1 sqm total (1F: 62.93 sqm, 2F: 52.17 sqm), 2 floors"
            ),
            layout: t("4LDK, 3 parking spaces"),
            availability: t("June 2026 onwards"),
            rentBear: t("¥170,000/mo"),
            rentAverage: t("¥190,000/mo"),
            rentBull: t("¥210,000/mo"),
          },
          designStrategy: {
            description: t("Convert to expat standard"),
            features: [
              t("Insulation and window upgrades"),
              t("Traffic flow reorganization"),
              t("Kitchen and bath quality improvement"),
              t("Storage optimization"),
              t("Lighting and moisture control"),
            ],
          },
          landStrategy: {
            description: t(
              "Advantages: property tax and acquisition cost controllable, fast turnaround, can replicate across multiple small properties"
            ),
            risks: [
              t("Hidden construction issues (leaks, termites, foundation)"),
              t("Resale market depth uncertainty"),
              t("Renovation cost overrun risk"),
            ],
          },
        },
      },
      {
        type: "future-outlook",
        data: {
          description: t("Area development plans affecting Kikuyo 1"),
          factors: [
            {
              title: t("Kikuyo Station expansion"),
              impact: t(
                "New train station with direct Kumamoto City line, completion 2026"
              ),
            },
            {
              title: t("International school"),
              impact: t(
                "English-language school for TSMC engineer families, +8% rental premium"
              ),
            },
            {
              title: t("JASM Phase 2"),
              impact: t(
                "Second fab adding 3,000 employees, +25% rental demand by 2027"
              ),
            },
            {
              title: t("Haramizu 70ha development"),
              impact: t(
                "Adjacent new urban core drives area transformation"
              ),
            },
          ],
        },
      },
      {
        type: "financial",
        data: {
          strategy: t("BTR (build to rent)"),
          acquisitionCost: 45600000,
          scenarios: {
            bear: {
              annualRent: 2040000,
              irr: 0.045,
              holdYears: 5,
            },
            average: {
              annualRent: 2280000,
              irr: 0.05,
              holdYears: 5,
            },
            bull: {
              annualRent: 2520000,
              irr: 0.055,
              holdYears: 5,
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
            title: t("AI rent assessment (4LDK/115sqm)"),
            type: "pdf",
            description: t("Assessed rent from comparable properties"),
            image:
              "assets/use-case-images/evidence-rental-assessment-report.webp",
          },
        },
      },
    ],
  },
  {
    id: "haramizu-1",
    name: t("Chateau Life Haramizu 1"),
    coords: [32.86806132535452, 130.82964025582334],
    subtitle: t("Land development"),
    type: t("Land acquisition"),
    zone: "Kikuyo",
    subArea: t("Haramizu"),
    distanceToJasm: "2.4 km",
    driveTime: "5 min",
    address:
      "1023-14 Minamijuke, Aza Haramizu, Kikuyo-machi, Kikuchi-gun, Kumamoto",
    camera: {
      center: [130.82964025582334, 32.86806132535452],
      zoom: 14.2,
      pitch: 52,
      bearing: 10,
    },
    connections: {
      jasm: { coords: [32.88615077755822, 130.84277124622932], distance: "2.4 km", time: "5 min" },
      station: {
        id: "haramizu-station",
        name: t("Haramizu station"),
        coords: [32.87079200721318, 130.82919294020132],
        distance: "0.3 km",
        time: "1 min",
      },
      airport: {
        coords: [32.83514194156781, 130.8590315178461],
        distance: "4.6 km",
        time: "9 min",
      },
      road: {
        id: "ozu-kumamoto-road",
        name: t("Ozu-Kumamoto Road"),
        coords: [32.87, 130.82],
        distance: "0.9 km",
        time: "2 min",
      },
    },

    cards: [
      {
        type: "images",
        data: {
          exterior: "assets/step-11-images/haramizu-1-exterior.webp",
          interior: [
            "assets/step-11-images/haramizu-1-interior-1.webp",
            "assets/step-11-images/haramizu-1-interior-2.webp",
            "assets/step-11-images/haramizu-1-interior-3.webp",
            "assets/step-11-images/haramizu-1-interior-4.webp",
          ],
          site: "assets/step-11-images/haramizu-1-site.webp",
        },
      },
      {
        type: "truth-engine",
        data: {
          basicSettings: {
            propertyName: t("Haramizu Land 1"),
            propertyType: t("Land (pre-sale / off-plan)"),
            address: t(
              "1023-14 Minamijuke, Aza Haramizu, Kikuyo-machi, Kikuchi-gun, Kumamoto"
            ),
            landArea: t("210.86 sqm (approx. 63.78 tsubo)"),
            buildingArea: t("Planned (spec to be confirmed)"),
            parking: t("4-5 spaces (planned)"),
            availability: t("6-9 months after contract signing"),
            // rentBear: t("¥170,000/mo"),
            // rentAverage: t("¥190,000/mo"),
            // rentBull: t("¥210,000/mo"),
          },
          designStrategy: {
            description: t("Three-zone development concept"),
            features: [
              t("Vibrancy zone: station-front retail, F&B, international-friendly services"),
              t("Knowledge cluster: R&D offices, co-working, university satellite campus"),
              t("Live-work zone: mid-high density condos, serviced apartments for engineers"),
              t("Facility introduction: residential, apartments, hotels, university campus"),
            ],
          },
          landStrategy: {
            description: t(
              "Long-term city-level project, not single housing development. JR Kyushu new station between Mitsuriki and Haramizu creates transport anchor."
            ),
            risks: [
              t("Land readjustment timeline uncertainty"),
              t("Zoning finalization dependent on municipal process"),
              t("Higher upfront capital requirement than renovation path"),
            ],
          },
        },
      },
      {
        type: "future-outlook",
        data: {
          description: t(
            "70-hectare new urban core with national development partners"
          ),
          factors: [
            {
              title: t("New JR station"),
              impact: t(
                "JR Kyushu confirmed new station between Mitsuriki and Haramizu, direct rail to Kumamoto City"
              ),
            },
            {
              title: t("Mitsui Fudosan partnership"),
              impact: t(
                "Japan largest developer selected for long-term vision implementation"
              ),
            },
            {
              title: t("Foreign consultation counter"),
              impact: t(
                "Kikuyo Town established bilingual support (Chinese/English) for international residents"
              ),
            },
            {
              title: t("Science park adjacency"),
              impact: t(
                "Direct proximity to semiconductor cluster drives sustained demand"
              ),
            },
          ],
        },
      },
      {
        type: "financial",
        data: {
          strategy: t("Land acquisition and hold/develop"),
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
            title: t("Real estate investment analysis"),
            type: "pdf",
            description: t(
              "Comprehensive land value and development ROI projections"
            ),
            image:
              "assets/use-case-images/evidence-real-estate-investment-analysis.webp",
          },
        },
      },
    ],
  },
  {
    id: "haramizu-2",
    name: t("Chateau Life Haramizu 2"),
    coords: [32.86806132535452, 130.82964025582334],
    subtitle: t("Land development"),
    type: t("Land acquisition"),
    zone: "Kikuyo",
    subArea: t("Haramizu"),
    distanceToJasm: "2.4 km",
    driveTime: "5 min",
    address:
      "969-142 Mukaihara, Aza Haramizu, Kikuyo-machi, Kikuchi-gun, Kumamoto",
    camera: {
      center: [130.82964025582334, 32.86806132535452],
      zoom: 14.2,
      pitch: 52,
      bearing: 10,
    },
    connections: {
      jasm: { coords: [32.88615077755822, 130.84277124622932], distance: "2.4 km", time: "5 min" },
      station: {
        id: "haramizu-station",
        name: t("Haramizu station"),
        coords: [32.87079200721318, 130.82919294020132],
        distance: "0.3 km",
        time: "1 min",
      },
      airport: {
        coords: [32.83514194156781, 130.8590315178461],
        distance: "4.6 km",
        time: "9 min",
      },
      road: {
        id: "ozu-kumamoto-road",
        name: t("Ozu-Kumamoto Road"),
        coords: [32.87, 130.82],
        distance: "0.9 km",
        time: "2 min",
      },
    },

    cards: [
      {
        type: "images",
        data: {
          exterior: "assets/step-11-images/haramizu-2-exterior.webp",
          interior: [
            "assets/step-11-images/haramizu-2-interior-1.webp",
            "assets/step-11-images/haramizu-2-interior-2.webp",
            "assets/step-11-images/haramizu-2-interior-3.webp",
            "assets/step-11-images/haramizu-2-interior-4.webp",
          ],
          site: "assets/step-11-images/haramizu-2-site.webp",
        },
      },
      {
        type: "truth-engine",
        data: {
          basicSettings: {
            propertyName: t("Haramizu Land 2"),
            propertyType: t("Land (pre-sale / off-plan)"),
            address: t(
              "969-142 Mukaihara, Aza Haramizu, Kikuyo-machi, Kikuchi-gun, Kumamoto"
            ),
            landArea: t("224.88 sqm (approx. 68.02 tsubo)"),
            buildingArea: t("Planned (spec to be confirmed)"),
            parking: t("3-4 spaces (planned)"),
            availability: t("6-9 months after contract signing"),
            // rentBear: t("¥170,000/mo"),
            // rentAverage: t("¥190,000/mo"),
            // rentBull: t("¥210,000/mo"),
          },
          designStrategy: {
            description: t("Three-zone development concept"),
            features: [
              t("Vibrancy zone: station-front retail, F&B, international-friendly services"),
              t("Knowledge cluster: R&D offices, co-working, university satellite campus"),
              t("Live-work zone: mid-high density condos, serviced apartments for engineers"),
              t("Facility introduction: residential, apartments, hotels, university campus"),
            ],
          },
          landStrategy: {
            description: t(
              "Long-term city-level project, not single housing development. JR Kyushu new station between Mitsuriki and Haramizu creates transport anchor."
            ),
            risks: [
              t("Land readjustment timeline uncertainty"),
              t("Zoning finalization dependent on municipal process"),
              t("Higher upfront capital requirement than renovation path"),
            ],
          },
        },
      },
      {
        type: "future-outlook",
        data: {
          description: t(
            "70-hectare new urban core with national development partners"
          ),
          factors: [
            {
              title: t("New JR station"),
              impact: t(
                "JR Kyushu confirmed new station between Mitsuriki and Haramizu, direct rail to Kumamoto City"
              ),
            },
            {
              title: t("Mitsui Fudosan partnership"),
              impact: t(
                "Japan largest developer selected for long-term vision implementation"
              ),
            },
            {
              title: t("Foreign consultation counter"),
              impact: t(
                "Kikuyo Town established bilingual support (Chinese/English) for international residents"
              ),
            },
            {
              title: t("Science park adjacency"),
              impact: t(
                "Direct proximity to semiconductor cluster drives sustained demand"
              ),
            },
          ],
        },
      },
      {
        type: "financial",
        data: {
          strategy: t("Land acquisition and hold/develop"),
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
            title: t("Real estate investment analysis"),
            type: "pdf",
            description: t(
              "Comprehensive land value and development ROI projections"
            ),
            image:
              "assets/use-case-images/evidence-real-estate-investment-analysis.webp",
          },
        },
      },
    ],
  },
];

export const areaStats = {
  avgAppreciation: "+8.5%",
  avgRentalYield: "+5.8%",
  occupancyRate: "97.2%",
  trackRecord: [
    { year: "2022", appreciation: "+6.2%" },
    { year: "2023", appreciation: "+9.1%" },
    { year: "2024", appreciation: "+11.3%" },
  ],
};

export const jasmLocation = [32.88565294085959, 130.84237152850676];
