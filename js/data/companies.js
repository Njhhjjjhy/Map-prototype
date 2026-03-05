/**
 * Corporate investment data.
 */

export const companies = [
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
];

