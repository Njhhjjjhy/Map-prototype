/**
 * Evidence groups - hierarchical evidence with multiple sub-items.
 */

export const evidenceGroups = {
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
};

