/**
 * Shared timing constants - semantic names for setTimeout values.
 * CSS token equivalents noted in comments.
 */
export const TIMING = {
  scene: 1500, // --duration-scene (journey transition hold)
  fast: 150, // --duration-fast
  normal: 250, // --duration-normal
  slow: 350, // --duration-slow
  flyDuration: 2000, // Mapbox flyTo milliseconds
  flyEase: 0.15, // Deprecated (kept for reference)
  revealDelay: 1200, // science park after gov chain
  buttonDelay: 2500, // continue button after markers
  infraStagger: 100, // infrastructure road stagger
  restartDelay: 500, // delay before restart

  // Narrative breathing room - rest pauses between beats
  breath: 600, // full pause: let a scene register before the next begins
  breathMedium: 400, // marker cluster to next content
  breathShort: 300, // quick pause: let an exit complete before a transition starts
};
