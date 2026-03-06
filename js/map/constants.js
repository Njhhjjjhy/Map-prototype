/**
 * Map constants - colors, camera presets, step positions.
 */

const MAP_COLORS = {
  primary: "#fbb931",
  error: "#ff3b30",
  info: "#007aff",
  warning: "#ff9500",
  success: "#34c759",
  resource: "#ff3b30",
  company: "#007aff",
  property: "#ff9500",
  zone: "#5856D6",
  route: "#64748b",
  infrastructure: "#5ac8fa",
  evidencePdf: "#6e7073",
  evidenceImage: "#007aff",
  evidenceWeb: "#34c759",
};

const CAMERA_FEELINGS = {
  smooth: {
    label: "Smooth",
    easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t), // ease-in-out
    durationMultiplier: 1.0,
  },
  snappy: {
    label: "Snappy",
    easing: (t) => 1 - Math.pow(1 - t, 3), // fast deceleration
    durationMultiplier: 0.6,
  },
  dramatic: {
    label: "Dramatic",
    easing: (t) => t * t * (3 - 2 * t), // smoothstep — slow build, slow settle
    durationMultiplier: 1.8,
  },
  gentle: {
    label: "Gentle",
    easing: (t) => t * (2 - t), // ease-out — soft deceleration
    durationMultiplier: 1.4,
  },
};

const CINEMATIC_SCALE = {
  // Duration multiplier: level 1 = 0.3x, level 5 = 1.0x, level 10 = 2.0x
  durationMultiplier(level) {
    return 0.3 + (level - 1) * (1.7 / 9);
  },
  // Bearing sweep: how much extra bearing rotation during flight
  bearingSweep(level) {
    return (level - 1) * 2; // 0° at level 1, 18° at level 10
  },
  // Pitch offset: slight extra tilt for drama
  pitchBoost(level) {
    return (level - 1) * 0.5; // 0° at level 1, 4.5° at level 10
  },
};

const CAMERA_STEPS = {
  // Intro sequence: close-in on investment area, then smooth zoom-out to reveal region
  intro_close: {
    center: [130.8063, 32.7361],
    zoom: 12.0,
    pitch: 52,
    bearing: 29,
    duration: 2000,
  },
  intro_wide: {
    center: [131.658, 32.3559],
    zoom: 8.2,
    pitch: 54,
    bearing: 42,
    duration: 2500,
  },

  A0: {
    center: [130.78, 32.82],
    zoom: 11.5,
    pitch: 45,
    bearing: 10,
    duration: 2000,
  },
  A1: {
    center: [130.78, 32.83],
    zoom: 11.5,
    pitch: 45,
    bearing: -5,
    duration: 1500,
  },
  A2_overview: {
    center: [130.75, 32.8],
    zoom: 8.5,
    pitch: 35,
    bearing: 0,
    duration: 2500,
  },
  A2_water: {
    center: [130.9932, 32.5486],
    zoom: 10,
    pitch: 56,
    bearing: 56,
    duration: 2000,
  },
  A2_power: {
    center: [132.5772, 32.9895],
    zoom: 6.8,
    pitch: 37,
    bearing: 0,
    duration: 2000,
  },
  A3_ecosystem: {
    center: [130.78, 32.84],
    zoom: 11.5,
    pitch: 50,
    bearing: 20,
    duration: 2000,
  },
  A3_location: {
    center: [131.3969, 29.4475],
    zoom: 5.0,
    pitch: 22,
    bearing: 4,
    duration: 3000,
  },
  A3_talent: {
    center: [130.5683, 31.5349],
    zoom: 6.4,
    pitch: 0,
    bearing: 0,
    duration: 2000,
  },
  A4_government: {
    center: [136.0188, 28.8513],
    zoom: 5.5,
    pitch: 47,
    bearing: 9,
    duration: 3000,
  },
  A_to_B: {
    center: [130.75, 32.84],
    zoom: 11,
    pitch: 48,
    bearing: -10,
    duration: 2500,
  },
  B1: {
    center: [130.78, 32.84],
    zoom: 11.5,
    pitch: 48,
    bearing: -10,
    duration: 2000,
  },
  B1_sciencePark: {
    center: [130.78, 32.87],
    zoom: 11,
    pitch: 45,
    bearing: 5,
    duration: 1500,
  },
  B4: {
    center: [130.9345, 32.7499],
    zoom: 10.5,
    pitch: 54,
    bearing: 34,
    duration: 2500,
  },
  B6_scienceParkAirport: {
    center: [131.1104, 32.7376],
    zoom: 9.8,
    pitch: 47,
    bearing: 9,
    duration: 2500,
  },
  B7: {
    center: [130.8, 32.86],
    zoom: 12,
    pitch: 55,
    bearing: 15,
    duration: 2500,
  },
  B_to_C: {
    center: [130.82, 32.82],
    zoom: 12.5,
    pitch: 50,
    bearing: -15,
    duration: 2000,
  },
  corridor: {
    center: [131.0329, 32.855],
    zoom: 10.7,
    pitch: 54,
    bearing: 0,
    duration: 2000,
  },
  complete: {
    center: [130.78, 32.84],
    zoom: 11,
    pitch: 40,
    bearing: 0,
    duration: 2000,
  },

  // 12-step additions (some alias existing positions)
  resources: {
    center: [130.78, 32.83],
    zoom: 11.5,
    pitch: 45,
    bearing: -5,
    duration: 2000,
  },
  strategic: {
    center: [129.5, 31.5],
    zoom: 5,
    pitch: 20,
    bearing: 0,
    duration: 3000,
  },
  government: {
    center: [130.78, 32.84],
    zoom: 11.5,
    pitch: 48,
    bearing: -10,
    duration: 2000,
  },
  corporate: {
    center: [130.8, 32.86],
    zoom: 12,
    pitch: 52,
    bearing: 30,
    duration: 2500,
  },
  scienceParkZones: {
    center: [130.78, 32.87],
    zoom: 11,
    pitch: 45,
    bearing: 5,
    duration: 2000,
  },
  transport: {
    center: [130.8, 32.86],
    zoom: 12,
    pitch: 55,
    bearing: 15,
    duration: 2500,
  },
  education: {
    center: [130.7, 32.5],
    zoom: 7,
    pitch: 25,
    bearing: 0,
    duration: 2500,
  },
  futureOutlook: {
    center: [130.83, 32.87],
    zoom: 11.5,
    pitch: 50,
    bearing: -20,
    duration: 2000,
  },
  zones: {
    center: [130.82, 32.82],
    zoom: 12.5,
    pitch: 50,
    bearing: -15,
    duration: 2000,
  },
  areaChanges: {
    center: [130.83, 32.87],
    zoom: 11.5,
    pitch: 50,
    bearing: -20,
    duration: 2000,
  },
};

export { MAP_COLORS, CAMERA_FEELINGS, CINEMATIC_SCALE, CAMERA_STEPS };
