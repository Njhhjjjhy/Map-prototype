/**
 * Corporate investment data.
 */
import { t } from "../i18n/index.js";

export const companies = [
  {
    id: "jasm",
    name: t("JASM (TSMC Japan)"),
    coords: [32.874, 130.785],
    subtitle: t("Semiconductor manufacturing"),
    description: t(
      "Joint venture between TSMC, Sony, and Denso. Japan's most advanced semiconductor fab, producing chips for automotive and industrial applications."
    ),
    stats: [
      { value: "¥2T", label: t("Total investment") },
      { value: "3,400", label: t("Direct employees") },
      { value: "2024", label: t("Phase 1 operational") },
      { value: "22nm", label: t("Process node") },
    ],
    evidence: {
      title: t("JASM press release"),
      type: "pdf",
      description: t("Official announcement of Phase 2 expansion"),
      image: "assets/use-case-images/step-5-corporate-investment-JASM.webp",
    },
  },
  {
    id: "sony",
    name: t("Sony Semiconductor"),
    coords: [32.9, 130.82],
    subtitle: t("Image sensor production"),
    description: t(
      "Sony's flagship image sensor facility supplies Apple, Samsung, and global smartphone manufacturers. Recent expansion doubled production capacity."
    ),
    stats: [
      { value: "¥850B", label: t("Expansion investment") },
      { value: "4,200", label: t("Employees") },
      { value: "50%", label: t("Global CMOS share") },
      { value: "2026", label: t("Expansion complete") },
    ],
    evidence: {
      title: t("Sony Kumamoto expansion"),
      type: "pdf",
      description: t("Facility expansion and hiring announcement"),
      image: "assets/use-case-images/step-5-corporate-investment-SONY.webp",
    },
  },
  {
    id: "tokyo-electron",
    name: t("Tokyo Electron"),
    coords: [32.85, 130.73],
    subtitle: t("Equipment manufacturing"),
    description: t(
      "World's third-largest semiconductor equipment manufacturer. New Kumamoto facility will produce next-generation chip-making tools."
    ),
    stats: [
      { value: "¥320B", label: t("Investment") },
      { value: "1,200", label: t("Projected jobs") },
      { value: "2025", label: t("Opening") },
      { value: "#3", label: t("Global equipment rank") },
    ],
    evidence: {
      title: t("Tokyo Electron announcement"),
      type: "pdf",
      description: t("New facility press release"),
      image: "assets/use-case-images/step-5-corporate-investment-tokyo-electron.webp",
    },
  },
  {
    id: "mitsubishi",
    name: t("Mitsubishi Electric"),
    coords: [32.82, 130.8],
    subtitle: t("Power semiconductors"),
    description: t(
      "Major expansion of power semiconductor production for electric vehicles and renewable energy systems."
    ),
    stats: [
      { value: "¥260B", label: t("Investment") },
      { value: "800", label: t("New jobs") },
      { value: "2025", label: t("Completion") },
      { value: "40%", label: t("Capacity increase") },
    ],
    evidence: {
      title: t("Mitsubishi power semiconductor plan"),
      type: "pdf",
      description: t("EV market expansion strategy"),
      image: "assets/use-case-images/step-5-corporate-investment-mitsubishi-electric.webp",
    },
  },
  {
    id: "sumco",
    name: t("SUMCO"),
    coords: [32.93, 130.7],
    subtitle: t("Silicon wafer manufacturing"),
    description: t(
      "One of the world's largest silicon wafer manufacturers. SUMCO's Kyushu facilities produce high-purity wafers essential for advanced semiconductor fabrication."
    ),
    stats: [
      { value: "¥180B", label: t("Investment") },
      { value: "1,500", label: t("Employees") },
      { value: "30%", label: t("Global wafer share") },
      { value: "2026", label: t("Expansion complete") },
    ],
    evidence: {
      title: t("SUMCO Kyushu expansion"),
      type: "pdf",
      description: t("Wafer production capacity expansion plan"),
      image: "assets/use-case-images/step-5-corporate-investment-sumco.webp",
    },
  },
  {
    id: "kyocera",
    name: t("Kyocera"),
    coords: [32.91, 130.88],
    subtitle: t("Ceramic packages & components"),
    description: t(
      "Kyocera manufactures ceramic packages and electronic components critical to semiconductor assembly. Their Kyushu operations serve the entire Asia-Pacific market."
    ),
    stats: [
      { value: "¥95B", label: t("Investment") },
      { value: "2,800", label: t("Employees") },
      { value: "IC packages", label: t("Core product") },
      { value: t("Asia-Pacific"), label: t("Market served") },
    ],
    evidence: {
      title: t("Kyocera component expansion"),
      type: "pdf",
      description: t("Regional manufacturing strategy"),
      image: "assets/use-case-images/step-5-corporate-investment-kyocera.webp",
    },
  },
  {
    id: "rohm-apollo",
    name: t("Rohm Apollo"),
    coords: [32.89, 130.76],
    subtitle: t("Analog & power semiconductors"),
    description: t(
      "Rohm Apollo Semiconductor produces analog ICs and power devices in Kumamoto. Expanding capacity to meet growing EV and industrial automation demand."
    ),
    stats: [
      { value: "¥120B", label: t("Investment") },
      { value: "1,100", label: t("Employees") },
      { value: "SiC power", label: t("Key technology") },
      { value: "+60%", label: t("Capacity expansion") },
    ],
    evidence: {
      title: t("Rohm Apollo SiC expansion"),
      type: "pdf",
      description: t("Silicon carbide power device production plan"),
      image: "assets/use-case-images/step-5-corporate-investment-rohm-apollo.webp",
    },
  },
];
