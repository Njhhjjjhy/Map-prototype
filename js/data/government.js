/**
 * Government data: commitment chain, tiers, prefecture boundary.
 */

import { t } from "../i18n/index.js";

export const governmentChain = {
  intro: t("Every level of government is aligned behind this corridor."),
  levels: [
    {
      id: "national",
      name: t("Japan National Government"),
      coords: [32.87, 130.7],
      subtitle: t("Strategic semiconductor policy"),
      type: "commitment",
      description: t(
        "The Japanese government designated semiconductors as critical infrastructure, committing ¥10 billion to support domestic chip production in Kumamoto."
      ),
      stats: [
        { value: "¥10B", label: t("Direct commitment") },
        { value: "2021", label: t("Policy announced") },
        { value: t("Critical"), label: t("Infrastructure status") },
        { value: "50%", label: t("JASM subsidy") },
      ],
    },
    {
      id: "prefecture",
      name: t("Kumamoto Prefecture"),
      coords: [32.79, 130.74],
      subtitle: t("Regional coordination"),
      type: "commitment",
      description: t(
        "Kumamoto Prefecture allocated additional funds and streamlined permitting for semiconductor-related development across the region."
      ),
      stats: [
        { value: "¥480B", label: t("Infrastructure budget") },
        { value: "2040", label: t("Master plan horizon") },
      ],
    },
    {
      id: "kikuyo-city",
      name: t("Kikuyo Town"),
      coords: [32.88, 130.83],
      subtitle: t("Local development plan"),
      type: "commitment",
      description: t(
        "Kikuyo approved rezoning for 2,500 housing units and commercial centers to support semiconductor worker families."
      ),
      stats: [
        { value: "2,500", label: t("Housing units") },
        { value: "¥180B", label: t("Infrastructure") },
        { value: "2028", label: t("Phase 1 complete") },
        { value: "+45%", label: t("Population target") },
      ],
    },
    {
      id: "ozu-city",
      name: t("Ozu Town"),
      coords: [32.86, 130.87],
      subtitle: t("Industrial expansion"),
      type: "commitment",
      description: t(
        "Ozu designated 120 hectares for industrial and logistics use, supporting the semiconductor supply chain."
      ),
      stats: [
        { value: "120ha", label: t("Industrial land") },
        { value: "¥95B", label: t("Investment") },
        { value: "2027", label: t("Phase 1") },
        { value: "3,000", label: t("Jobs projected") },
      ],
    },
    {
      id: "grand-airport",
      name: t("Grand airport concept"),
      coords: [32.84, 130.86],
      subtitle: t("New grand airport vision"),
      type: "concept",
      description: t(
        'A new 6.8km rail connection will link Aso Kumamoto Airport directly to the JR Hohi Line, with an estimated travel time of 44 minutes from Kumamoto Station. The "New Grand Airport Vision" is a 10-year plan with four strategic pillars to position Kumamoto Airport as a gateway for the semiconductor ecosystem.'
      ),
      stats: [
        { value: "6.8km", label: t("New rail link") },
        { value: "¥41B", label: t("Rail investment") },
        { value: "44min", label: t("Station to airport") },
        { value: t("4 pillars"), label: t("Strategic plan") },
      ],
      pillars: [
        t("Enhance domestic and international route network"),
        t("Improve ground transportation and airport access"),
        t("Strengthen cargo and logistics capabilities"),
        t("Develop airport area as regional gateway hub"),
      ],
    },
  ],
};

export const governmentTiers = [
  {
    id: "central",
    tier: t("Central government"),
    tierLabel: t("National Policy"),
    color: "#007aff",
    name: t("Japan National Government"),
    coords: [32.87, 130.7],
    tokyoCoords: [35.6762, 139.6503],
    description: t(
      "The Japanese government designated semiconductors as critical infrastructure, committing ¥10 billion to support domestic chip production in Kumamoto."
    ),
    commitment: "¥10B",
    commitmentLabel: t("Direct Investment"),
    stats: [
      { value: "¥10B", label: t("Direct commitment") },
      { value: "2021", label: t("Policy announced") },
      { value: t("Critical"), label: t("Infrastructure status") },
      { value: "50%", label: t("JASM subsidy") },
    ],
  },
  {
    id: "prefectural",
    tier: t("Prefectural government"),
    tierLabel: t("Regional Coordination"),
    color: "#34c759",
    name: t("Kumamoto Prefecture"),
    coords: [32.79, 130.74],
    description: t(
      "Kumamoto Prefecture allocated additional funds and streamlined permitting for semiconductor-related development across the region."
    ),
    commitment: "¥480B",
    commitmentLabel: t("Infrastructure Budget"),
    stats: [
      { value: "¥480B", label: t("Infrastructure budget") },
      { value: "2040", label: t("Master plan horizon") },
    ],
  },
  {
    id: "local",
    tier: t("Local municipalities"),
    tierLabel: t("Implementation"),
    color: "#ff9500",
    name: t("Local Municipalities"),
    coords: [32.87, 130.85],
    description: t(
      "Three key local initiatives directly supporting the semiconductor corridor workforce and infrastructure."
    ),
    commitment: "¥322B",
    commitmentLabel: t("Combined Investment"),
    stats: [
      { value: "¥322B", label: t("Combined investment") },
      { value: "5,500+", label: t("Housing + jobs") },
    ],
    subItems: [
      {
        id: "kikuyo-city",
        name: t("Kikuyo Town"),
        subtitle: t("JASM and science park"),
        coords: [32.88, 130.83],
        commitment: "¥180B",
        description: t(
          "Kikuyo approved rezoning for 2,500 housing units and commercial centers to support semiconductor worker families."
        ),
        stats: [
          { value: "2,500", label: t("Housing units") },
          { value: "¥180B", label: t("Infrastructure") },
          { value: "2028", label: t("Phase 1 complete") },
          { value: "+45%", label: t("Population target") },
        ],
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
        id: "ozu-city",
        name: t("Ozu Town"),
        subtitle: t("Airport and industrial zone"),
        coords: [32.86, 130.87],
        commitment: "¥95B",
        description: t(
          "Ozu designated 120 hectares for industrial and logistics use, supporting the semiconductor supply chain."
        ),
        stats: [
          { value: "120ha", label: t("Industrial land") },
          { value: "¥95B", label: t("Investment") },
          { value: "2027", label: t("Phase 1") },
          { value: "3,000", label: t("Jobs projected") },
        ],
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
        id: "koshi-town",
        name: t("Koshi Town"),
        subtitle: t("TEL R&D hub and residential area"),
        coords: [32.884, 130.771],
        commitment: "¥47B",
        description: t(
          "Tokyo Electron (TEL) is building a major R&D hub in Fukuhara, Koshi Town. The ~27,000 sqm facility represents ~¥47 billion in investment, focused on coating, developing, and cleaning equipment R&D. This drives demand for high-income R&D engineers seeking family-size 2-3LDK mid-to-high-end rentals."
        ),
        stats: [
          { value: "~27,000sqm", label: t("Facility size") },
          { value: "¥47B", label: t("Investment") },
          { value: "TEL", label: t("Tokyo Electron") },
          { value: "2-3LDK", label: t("Rental demand") },
        ],
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
    ],
  },
];

export const kumamotoPrefectureBoundary = {
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
};
