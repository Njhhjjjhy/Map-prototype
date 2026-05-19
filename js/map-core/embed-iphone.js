/**
 * iPhone embed host (used by the gktk-prototype playground iframe).
 *
 * Previously lived as an inline script in `index.html`. Moved into the
 * package in Stage 3 so the standalone HTML stays neutral and the
 * gktk-prototype iframe gets the same behavior driven by options.
 *
 * Responsibilities:
 *   - Reparent the right panel, gallery, quick-look, and evidence preview
 *     into `#app-container` so their `position: absolute` resolves against
 *     the phone screen rather than the iframe viewport.
 *   - Attach an Apple Maps-style bottom sheet with three detents
 *     (peek / medium / large) and a drag handle.
 *
 * Returns a `teardown()` function that removes the drag listeners and
 * any DOM the setup created. Called from `destroy()`.
 */
export function setupIPhoneEmbed() {
  const host = document.getElementById("app-container");
  if (host) {
    ["right-panel", "gallery-modal", "property-quick-look", "evidence-preview"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) host.appendChild(el);
      },
    );
  }

  const panel = document.getElementById("right-panel");
  if (!panel) return () => {};

  const DETENT_PCT = { peek: 0.28, medium: 0.56, large: 0.88 };
  const DETENT_ORDER = ["peek", "medium", "large"];
  let currentDetent = "peek";

  function setDetent(name) {
    currentDetent = name;
    panel.classList.remove("sheet-peek", "sheet-medium", "sheet-large");
    panel.classList.add("sheet-" + name);
    panel.style.height = "";
  }
  function cycleDetentUp() {
    const i = DETENT_ORDER.indexOf(currentDetent);
    if (i < DETENT_ORDER.length - 1) setDetent(DETENT_ORDER[i + 1]);
    else setDetent(DETENT_ORDER[0]);
  }
  function snapToNearest(pixelHeight, parentHeight) {
    const ratio = pixelHeight / parentHeight;
    let nearest = DETENT_ORDER[0];
    let bestDelta = Infinity;
    DETENT_ORDER.forEach((name) => {
      const d = Math.abs(DETENT_PCT[name] - ratio);
      if (d < bestDelta) {
        bestDelta = d;
        nearest = name;
      }
    });
    setDetent(nearest);
  }

  setDetent("peek");

  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "sheet-handle-hit";
  handle.setAttribute("aria-label", "Resize sheet");
  panel.appendChild(handle);

  let dragging = false;
  let startY = 0;
  let startHeight = 0;
  let moved = 0;

  function getParentHeight() {
    return panel.parentElement
      ? panel.parentElement.getBoundingClientRect().height
      : 720;
  }
  function onPointerDown(e) {
    dragging = true;
    moved = 0;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startHeight = panel.getBoundingClientRect().height;
    panel.classList.add("sheet-dragging");
    if (e.cancelable) e.preventDefault();
  }
  function onPointerMove(e) {
    if (!dragging) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const dy = y - startY;
    moved = Math.abs(dy);
    const parentH = getParentHeight();
    const maxH = parentH - 60;
    const minH = parentH * 0.18;
    const nextH = Math.max(minH, Math.min(maxH, startHeight - dy));
    panel.style.height = nextH + "px";
    if (e.cancelable) e.preventDefault();
  }
  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove("sheet-dragging");
    if (moved < 6) {
      cycleDetentUp();
      return;
    }
    const h = panel.getBoundingClientRect().height;
    snapToNearest(h, getParentHeight());
  }

  handle.addEventListener("touchstart", onPointerDown, { passive: false });
  handle.addEventListener("mousedown", onPointerDown);
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchend", onPointerUp);
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchcancel", onPointerUp);

  function onPanelClick(e) {
    if (currentDetent !== "peek") return;
    if (e.target.closest("button, a, input, label, .sheet-handle-hit")) return;
    setDetent("medium");
  }
  panel.addEventListener("click", onPanelClick);

  const content = document.getElementById("panel-content");
  const mo = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.type !== "childList") return;
      if (m.target.id !== "panel-content") return;
      if (panel.classList.contains("visible")) setDetent("peek");
    });
  });
  if (content) mo.observe(content, { childList: true });

  return function teardown() {
    window.removeEventListener("touchmove", onPointerMove);
    window.removeEventListener("mousemove", onPointerMove);
    window.removeEventListener("touchend", onPointerUp);
    window.removeEventListener("mouseup", onPointerUp);
    window.removeEventListener("touchcancel", onPointerUp);
    panel.removeEventListener("click", onPanelClick);
    mo.disconnect();
    if (handle.parentNode) handle.parentNode.removeChild(handle);
    panel.classList.remove("sheet-peek", "sheet-medium", "sheet-large", "sheet-dragging");
    panel.style.height = "";
  };
}
