/**
 * value-add-prototype embed host.
 *
 * Adds the behaviors the slideshow expects when the map is iframed
 * inside an iPad slide:
 *   - chromeless toggle via `chromeless` option or `{ type:
 *     "gktk-set-chromeless", value }` postMessage from the parent.
 *   - a `#__setup-cover` overlay that hides the bundle's first paint
 *     until the initial framing is in place, then fires
 *     `{ type: "gktk-map-ready" }` to `window.parent`.
 *   - capture-phase click interceptor on `#nav-back` / `#nav-forward`
 *     that fires `{ type: "gktk-map-back-to-content" }` at the first
 *     step (back) and `{ type: "gktk-map-complete" }` at the last
 *     step (forward), so the slideshow can transition out of the
 *     iframe instead of triggering internal navigation.
 *
 * Previously lived as an inline script in `index.html`. Moved into the
 * package in Stage 3 so consumers control the behavior via options.
 *
 * Returns `{ uncoverSetup, teardown }`:
 *   - `uncoverSetup()` removes the setup cover and notifies the parent.
 *     Called by `App.init()` after the initial camera flight settles.
 *   - `teardown()` removes the event listeners and any leftover DOM.
 */
export function setupValueAddEmbed({ onComplete } = {}) {
  const messageListener = (e) => {
    if (e.origin !== window.location.origin) return;
    const data = e.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "gktk-set-chromeless") {
      if (data.value) {
        document.documentElement.setAttribute("data-chromeless", "1");
      } else {
        document.documentElement.removeAttribute("data-chromeless");
      }
    }
  };
  window.addEventListener("message", messageListener);

  let cover = document.createElement("div");
  cover.id = "__setup-cover";
  cover.style.cssText = [
    "position:fixed",
    "inset:0",
    "background:#F9F9F9",
    "z-index:99999",
    "pointer-events:none",
  ].join(";");

  function uncoverSetup() {
    if (cover && cover.parentNode) cover.parentNode.removeChild(cover);
    cover = null;
    try {
      window.parent.postMessage({ type: "gktk-map-ready" }, "*");
    } catch (_e) {}
  }
  // Maintain the legacy global so the existing handoff in `App.init()` keeps
  // working until the consumers are migrated to lifecycle hooks.
  window.__uncoverSetup = uncoverSetup;
  const safetyTimer = setTimeout(uncoverSetup, 3000);

  if (document.body) {
    document.body.appendChild(cover);
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      function attach() {
        if (cover) document.body.appendChild(cover);
      },
      { once: true },
    );
  }

  const clickListener = (e) => {
    const target = e.target;
    const fwd = target && target.closest && target.closest("#nav-forward");
    const back = target && target.closest && target.closest("#nav-back");
    if (!fwd && !back) return;

    // Read total step count from the live STEPS array via window (set by
    // main.js). This stays in sync with `setScenes()` filtering.
    let totalSteps = 0;
    if (window.STEPS && window.STEPS.length) totalSteps = window.STEPS.length;
    if (!totalSteps) return;

    const current =
      (window.App && window.App.state && window.App.state.currentStep) || 1;
    if (fwd && current >= totalSteps) {
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        window.parent.postMessage({ type: "gktk-map-complete" }, "*");
      } catch (_e) {}
      if (typeof onComplete === "function") onComplete();
    } else if (back && current <= 1) {
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        window.parent.postMessage(
          { type: "gktk-map-back-to-content" },
          "*",
        );
      } catch (_e) {}
    }
  };
  document.addEventListener("click", clickListener, true);

  return {
    uncoverSetup,
    teardown() {
      clearTimeout(safetyTimer);
      window.removeEventListener("message", messageListener);
      document.removeEventListener("click", clickListener, true);
      if (cover && cover.parentNode) cover.parentNode.removeChild(cover);
      cover = null;
      if (window.__uncoverSetup === uncoverSetup) {
        delete window.__uncoverSetup;
      }
    },
  };
}
