/**
 * Resolve mountMap options. Combines caller-provided options with URL-param
 * fallbacks so the standalone app keeps working when its inline scripts in
 * `index.html` are removed.
 *
 * Resolution precedence (first-wins):
 *   1. Explicit option value passed to `mountMap(_, options)`.
 *   2. URL query-string parameter (kept for the standalone where the user
 *      copies a link like `?embed=1&host=valueadd&startStep=2`).
 *   3. Documented default.
 *
 * Embed hosts:
 *   - `null`     → standalone shell, no embed wrappers.
 *   - `"iphone"` → iPhone 17 Pro frame and bottom-sheet panel
 *                  (used by the gktk-prototype playground iframe).
 *   - `"valueadd"` → fills the iframe, postMessage contract with the
 *                    value-add-prototype slideshow.
 *
 * URL fallbacks intentionally read `?embed=1` (any truthy host) and
 * `?host=valueadd|playground` to mirror what `index.html` used to do.
 */

const DEFAULT_TOUR_URL = "https://3d-vertical-test.vercel.app/value-add-journey.html";
const DEFAULT_MAPBOX_TOKEN =
  "pk.eyJ1IjoicmlhYW5tb2hhMTc5IiwiYSI6ImNtbGo0ODRlbzA4ZXozZXI3c2tlbXBnZnYifQ.egy_O1eRdw5ucojXIA4vmQ";

function readUrlParams() {
  if (
    typeof window === "undefined" ||
    typeof URLSearchParams === "undefined" ||
    !window.location
  ) {
    return new URLSearchParams("");
  }
  return new URLSearchParams(window.location.search);
}

function parseIntOrNull(raw) {
  if (raw == null) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function resolveMapboxToken(opt) {
  if (typeof opt === "string" && opt) return opt;

  // 1. Token injected by an embedding host (parent window).
  try {
    if (
      typeof window !== "undefined" &&
      window.parent &&
      window.parent !== window &&
      window.parent.__GKTK_MAPBOX_ACCESS_TOKEN
    ) {
      return window.parent.__GKTK_MAPBOX_ACCESS_TOKEN;
    }
  } catch (_) {
    // Cross-origin parent access throws — fall through.
  }

  // 2. Existing window global (set by the standalone HTML before the
  //    inline-script move).
  if (typeof window !== "undefined" && window.MAPBOX_ACCESS_TOKEN) {
    return window.MAPBOX_ACCESS_TOKEN;
  }

  // 3. URL param.
  const params = readUrlParams();
  const fromUrl = params.get("mapbox_access_token");
  if (fromUrl) return fromUrl;

  // 4. Bundled fallback (standalone repo only; consumers should pass a token).
  return DEFAULT_MAPBOX_TOKEN;
}

function resolveEmbedHost(opt) {
  // Caller-provided wins. Allow `null` to explicitly disable embed mode
  // even if URL params say otherwise.
  if (Object.prototype.hasOwnProperty.call(opt, "embedHost")) {
    return opt.embedHost || null;
  }

  const params = readUrlParams();
  if (params.get("embed") !== "1") return null;
  const host = params.get("host") || "";
  return host === "valueadd" ? "valueadd" : "iphone";
}

function resolveScenes(opt) {
  if (Array.isArray(opt.scenes)) return opt.scenes;

  const params = readUrlParams();
  const raw = params.get("steps");
  if (!raw) return null;
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length > 0 ? list : null;
}

function resolveStartStep(opt) {
  if (typeof opt.startStep === "number" && Number.isFinite(opt.startStep)) {
    return opt.startStep;
  }
  const params = readUrlParams();
  return parseIntOrNull(params.get("startStep"));
}

function resolveLang(opt) {
  if (opt.lang === "en" || opt.lang === "zh-TW") return opt.lang;
  const params = readUrlParams();
  const fromUrl = params.get("lang");
  if (fromUrl === "en" || fromUrl === "zh-TW") return fromUrl;
  return null;
}

function resolveChromeless(opt) {
  if (typeof opt.chromeless === "boolean") return opt.chromeless;
  const params = readUrlParams();
  return params.get("chromeless") === "1";
}

function noop() {}

export function resolveOptions(rawOptions) {
  const opt = rawOptions || {};
  return {
    mapboxToken: resolveMapboxToken(opt),
    scenes: resolveScenes(opt),
    startStep: resolveStartStep(opt),
    lang: resolveLang(opt),
    embedHost: resolveEmbedHost(opt),
    chromeless: resolveChromeless(opt),
    tourUrl:
      typeof opt.tourUrl === "string" || opt.tourUrl === null
        ? opt.tourUrl
        : DEFAULT_TOUR_URL,
    onReady: typeof opt.onReady === "function" ? opt.onReady : noop,
    onComplete: typeof opt.onComplete === "function" ? opt.onComplete : noop,
    onError: typeof opt.onError === "function" ? opt.onError : noop,
  };
}

export const DEFAULTS = {
  tourUrl: DEFAULT_TOUR_URL,
  mapboxToken: DEFAULT_MAPBOX_TOKEN,
};
