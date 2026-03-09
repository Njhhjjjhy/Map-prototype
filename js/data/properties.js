/**
 * Property and investment zone data.
 */

export const futureZones = [
  {
    id: "kikuyo",
    name: "Kikuyo Development Zone",
    coords: [32.88, 130.83],
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
      { label: "Logistics", coords: [32.864, 130.875] },
      { label: "Warehouse", coords: [32.856, 130.866] },
      { label: "Supplier park", coords: [32.862, 130.878] },
    ],
  },
  {
    id: "koshi",
    name: "Koshi R&D Corridor",
    coords: [32.905, 130.76],
    color: "#4A90D9",
    strokeColor: "#4A90D9",
    subtitle: "R&D and innovation",
    description:
      "Koshi City is emerging as an R&D hub with Tokyo Electron's new facility and supporting tech infrastructure for the semiconductor corridor.",
    stats: [
      { value: "¥47B", label: "TEL investment" },
      { value: "~27,000sqm", label: "R&D facility" },
      { value: "2028", label: "Phase 1 complete" },
      { value: "1,500", label: "R&D jobs" },
    ],
    evidence: {
      title: "Koshi City development plan",
      type: "pdf",
      description: "R&D corridor expansion documentation",
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

export const investmentZones = [
  {
    id: "kikuyo-zone",
    name: "Kikuyo",
    role: "Factory core / new urban core",
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
    name: "Ozu",
    role: "Gateway / office and logistics support",
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
    name: "Koshi",
    role: "R&D / tools and process innovation",
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
};

export const properties = [
  {
    id: "ozu-1",
    name: "Chateau Life Ozu 1",
    coords: [32.865, 130.87],
    subtitle: "New construction (BTR)",
    type: "Build to rent",
    zone: "Ozu",
    subArea: "Sugitmizu",
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
          exterior: "assets/step-11-images/ozu-1-exterior.webp",
          interior: [
            "assets/step-11-images/ozu-1-interior-1.webp",
            "assets/step-11-images/ozu-1-interior-2.webp",
            "assets/step-11-images/ozu-1-interior-3.webp",
            "assets/step-11-images/ozu-1-interior-4.webp",
            "assets/step-11-images/ozu-1-interior-5.webp",
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
            rentBear: "¥160,000/mo",
            rentAverage: "¥190,000/mo",
            rentBull: "¥210,000/mo",
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
              impact: "120ha new logistics and supply chain facilities by 2027",
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
    name: "Chateau Life Ozu 2",
    coords: [32.862, 130.865],
    subtitle: "New construction (BTR)",
    type: "Build to rent",
    zone: "Ozu",
    subArea: "Sugitmizu",
    distanceToJasm: "5.5 km",
    driveTime: "9 min",
    address: "2813-1 Shimozuru, Aza Sugimizu, Ozu-machi, Kikuchi-gun, Kumamoto",
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
          exterior: "assets/step-11-images/ozu-2-exterior.webp",
          interior: [
            "assets/step-11-images/ozu-2-interior-1.webp",
            "assets/step-11-images/ozu-2-interior-2.webp",
            "assets/step-11-images/ozu-2-interior-3.webp",
            "assets/step-11-images/ozu-2-interior-4.webp",
            "assets/step-11-images/ozu-2-interior-5.webp",
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
            rentBear: "¥160,000/mo",
            rentAverage: "¥190,000/mo",
            rentBull: "¥210,000/mo",
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
              impact: "120ha new logistics and supply chain facilities by 2027",
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
            title: "AI rent assessment (4LDK/95sqm)",
            type: "pdf",
            description: "Assessed rent from comparable properties",
            image:
              "assets/use-case-images/evidence-property-rent-evaluation.webp",
          },
        },
      },
    ],
  },
  {
    id: "kikuyo-1",
    name: "Chateau Life Kikuyo 1",
    coords: [32.88, 130.825],
    subtitle: "Renovation opportunity",
    type: "Buy-renovate-rent/sell",
    zone: "Kikuyo",
    subArea: "Kubota",
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
            "assets/step-11-images/kikuyo-interior-4.webp",
            "assets/step-11-images/kikuyo-interior-5.webp",
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
            rentBear: "¥170,000/mo",
            rentAverage: "¥190,000/mo",
            rentBull: "¥210,000/mo",
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
            title: "AI rent assessment (4LDK/115sqm)",
            type: "pdf",
            description: "Assessed rent from comparable properties",
            image:
              "assets/use-case-images/evidence-rental-assessment-report.webp",
          },
        },
      },
    ],
  },
  {
    id: "haramizu-1",
    name: "Chateau Life Haramizu 1",
    coords: [32.8698, 130.823],
    subtitle: "Land development",
    type: "Land acquisition",
    zone: "Kikuyo",
    subArea: "Haramizu",
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
          exterior: "assets/step-11-images/haramizu-1-exterior.webp",
          interior: [
            "assets/step-11-images/haramizu-1-interior-1.webp",
            "assets/step-11-images/haramizu-1-interior-2.webp",
            "assets/step-11-images/haramizu-1-interior-3.webp",
            "assets/step-11-images/haramizu-1-interior-4.webp",
            "assets/step-11-images/haramizu-1-interior-5.webp",
          ],
          site: "assets/step-11-images/haramizu-1-site.webp",
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
            rentBear: "¥170,000/mo",
            rentAverage: "¥190,000/mo",
            rentBull: "¥210,000/mo",
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
    name: "Chateau Life Haramizu 2",
    coords: [32.871, 130.826],
    subtitle: "Land development",
    type: "Land acquisition",
    zone: "Kikuyo",
    subArea: "Haramizu",
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
          exterior: "assets/step-11-images/haramizu-2-exterior.webp",
          interior: [
            "assets/step-11-images/haramizu-2-interior-1.webp",
            "assets/step-11-images/haramizu-2-interior-2.webp",
            "assets/step-11-images/haramizu-2-interior-3.webp",
            "assets/step-11-images/haramizu-2-interior-4.webp",
            "assets/step-11-images/haramizu-2-interior-5.webp",
          ],
          site: "assets/step-11-images/haramizu-2-site.webp",
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
            rentBear: "¥170,000/mo",
            rentAverage: "¥190,000/mo",
            rentBull: "¥210,000/mo",
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
