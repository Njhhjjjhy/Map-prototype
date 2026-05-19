import { $sel } from "../shared/dom-scope.js";

const DEFAULT_TOUR_URL =
  "https://3d-vertical-test.vercel.app/value-add-journey.html";
const TOUR_Z_INDEX = 20000;

/**
 * Resolve the tour URL at click time so it can be reconfigured per
 * mount via `mountMap({ tourUrl })`. Returns `null` when the
 * consumer has explicitly disabled the tour by passing `tourUrl: null`.
 */
function resolveTourUrl() {
  if (typeof window === "undefined") return DEFAULT_TOUR_URL;
  if (Object.prototype.hasOwnProperty.call(window, "__GKTK_TOUR_URL")) {
    return window.__GKTK_TOUR_URL;
  }
  return DEFAULT_TOUR_URL;
}

export const methods = {
  openValueAddTour(options = {}) {
    if (this.valueAddTourIframe) return;
    if ($sel('iframe[data-value-add-tour="1"]')) return;

    const tourUrl = resolveTourUrl();
    if (!tourUrl) return;

    const iframe = document.createElement("iframe");
    iframe.src = tourUrl;
    iframe.setAttribute("data-value-add-tour", "1");
    iframe.setAttribute(
      "allow",
      "autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope",
    );
    iframe.setAttribute("title", "Property tour");

    Object.assign(iframe.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      border: "0",
      background: "#000",
      zIndex: String(TOUR_Z_INDEX),
    });

    this.valueAddTourPrevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const tourOrigin = (() => {
      try {
        return new URL(tourUrl).origin;
      } catch (_e) {
        return "";
      }
    })();
    const listener = (event) => {
      if (tourOrigin && event.origin !== tourOrigin) return;
      if (event.data?.type !== "journeyComplete") return;
      this.closeValueAddTour();
    };
    window.addEventListener("message", listener);

    this.valueAddTourIframe = iframe;
    this.valueAddTourListener = listener;
    this.valueAddTourTrigger = options.trigger || null;
    this.valueAddTourOnAfterClose = options.onAfterClose || null;

    document.body.appendChild(iframe);
  },

  closeValueAddTour() {
    if (!this.valueAddTourIframe) return;

    this.valueAddTourIframe.remove();

    if (this.valueAddTourListener) {
      window.removeEventListener("message", this.valueAddTourListener);
    }

    document.documentElement.style.overflow =
      this.valueAddTourPrevOverflow || "";

    const trigger = this.valueAddTourTrigger;
    const onAfterClose = this.valueAddTourOnAfterClose;

    this.valueAddTourIframe = null;
    this.valueAddTourListener = null;
    this.valueAddTourPrevOverflow = "";
    this.valueAddTourTrigger = null;
    this.valueAddTourOnAfterClose = null;

    if (trigger && typeof trigger.focus === "function") {
      try {
        trigger.focus();
      } catch (e) {
        // ignore
      }
    }

    if (typeof onAfterClose === "function") {
      onAfterClose();
    }
  },
};
