/**
 * Resource data: water, power, sewage, silicon island, energy infrastructure.
 */

export const mapConfig = {
  center: [32.8, 130.75], // Kumamoto Prefecture center
  initialZoom: 10,
  resourceZoom: 12,
  propertyZoom: 14,
};

export const resources = {
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
      title: "TSMC ESG evidence",
      type: "pdf",
      description:
        "Official government report on groundwater sustainability and industrial allocation",
      items: [
        {
          type: "image",
          src: "assets/TSMC-esg-1.webp",
          title: "TSMC ESG report overview",
        },
        {
          type: "pdf",
          src: "assets/pdfs/2024-TSMC-esg-report.pdf",
          title: "2024 TSMC ESG report",
        },
      ],
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
};

export const sewageInfrastructure = {
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
};

export const siliconIsland = {
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
};

export const kyushuEnergy = {
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
};

