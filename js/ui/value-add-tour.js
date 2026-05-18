const TOUR_ORIGIN = "https://3d-vertical-test.vercel.app";
const TOUR_URL = `${TOUR_ORIGIN}/value-add-journey.html`;
const TOUR_Z_INDEX = 20000;

export const methods = {
  openValueAddTour(options = {}) {
    if (this.valueAddTourIframe) return;
    if (document.querySelector('iframe[data-value-add-tour="1"]')) return;

    const iframe = document.createElement("iframe");
    iframe.src = TOUR_URL;
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

    const listener = (event) => {
      if (event.origin !== TOUR_ORIGIN) return;
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
