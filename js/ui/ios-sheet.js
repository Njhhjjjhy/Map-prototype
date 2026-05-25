/* iOS sheet (mobile dashboard)
 * Base: Apple HIG sheet behavior (developer.apple.com/design/human-interface-guidelines/sheets)
 * Adapted from: map-prototype/css/embed-mobile.css + map-prototype/js/map-core/embed-iphone.js
 *   (the existing Apple-Maps three-detent sheet used inside the iPhone embed)
 * Intentional deviations from the existing embed sheet, per user
 * decision "iOS modal sheet (dismissible)" in Phase 1 review:
 *   - Backdrop dimming: present (existing embed sheet has none).
 *   - Tap on backdrop dismisses: present (existing embed sheet has no
 *     dismiss path).
 *   - Drag-down past threshold dismisses: present (existing embed sheet
 *     "never lets the sheet fully close" per its source comment).
 *   - Single detent (fully open or dismissed) instead of peek/medium/large.
 *   - Reopen affordance: a circular glass button in the bottom-right
 *     when the sheet is dismissed.
 *
 * Activation: viewport <= 767.98px. CSS provides the visual transform
 * for the sheet position. This module owns the gesture handling, the
 * backdrop element, and the reopen button.
 *
 * Source detail mapping:
 *   - Pointer-event drag scaffolding mirrors embed-iphone.js:69-115.
 *   - Drag handle DOM injection mirrors embed-iphone.js:63-67.
 *   - Mobile-only media activation mirrors css/embed-mobile.css:42-83.
 */

const MOBILE_MEDIA = "(max-width: 767.98px)";
const DISMISS_DRAG_THRESHOLD_PX = 120;
const DISMISS_VELOCITY_THRESHOLD_PX_PER_MS = 0.4;

let attached = false;
let _panel = null;
let _backdrop = null;
let _reopen = null;
let _handle = null;
let _visibilityObserver = null;
let _contentObserver = null;
let _wasDismissedByUser = false;

function ensureBackdropAndReopen() {
  if (!_backdrop) {
    _backdrop = document.createElement("div");
    _backdrop.id = "sheet-backdrop";
    _backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(_backdrop);
    _backdrop.addEventListener("click", () => dismissSheet());
  }
  if (!_reopen) {
    _reopen = document.createElement("button");
    _reopen.id = "sheet-reopen";
    _reopen.type = "button";
    _reopen.setAttribute("aria-label", "Show panel");
    _reopen.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 15l-6-6-6 6" />
    </svg>`;
    document.body.appendChild(_reopen);
    _reopen.addEventListener("click", () => reopenSheet());
  }
}

function ensureDragHandle() {
  if (!_panel || _handle) return;
  _handle = document.createElement("div");
  _handle.className = "sheet-drag-handle";
  _handle.setAttribute("role", "separator");
  _handle.setAttribute("aria-label", "Drag to dismiss");
  _panel.insertBefore(_handle, _panel.firstChild);
  wireDragHandle();
}

function wireDragHandle() {
  if (!_handle || !_panel) return;

  let startY = 0;
  let startTimeMs = 0;
  let lastY = 0;
  let dragging = false;

  const onPointerDown = (e) => {
    if (e.cancelable) e.preventDefault();
    dragging = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startTimeMs = performance.now();
    lastY = startY;
    _panel.classList.add("sheet-dragging");
    document.addEventListener("touchmove", onPointerMove, { passive: false });
    document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("touchend", onPointerUp);
    document.addEventListener("mouseup", onPointerUp);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    lastY = y;
    const dy = Math.max(0, y - startY);
    _panel.style.transform = `translateY(${dy}px)`;
    if (e.cancelable) e.preventDefault();
  };

  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    _panel.classList.remove("sheet-dragging");
    document.removeEventListener("touchmove", onPointerMove);
    document.removeEventListener("mousemove", onPointerMove);
    document.removeEventListener("touchend", onPointerUp);
    document.removeEventListener("mouseup", onPointerUp);

    const dy = Math.max(0, lastY - startY);
    const dtMs = performance.now() - startTimeMs;
    const velocity = dtMs > 0 ? dy / dtMs : 0;

    const shouldDismiss =
      dy >= DISMISS_DRAG_THRESHOLD_PX ||
      velocity >= DISMISS_VELOCITY_THRESHOLD_PX_PER_MS;

    if (shouldDismiss) {
      _panel.style.transform = "";
      dismissSheet();
    } else {
      _panel.style.transform = "";
    }
  };

  _handle.addEventListener("touchstart", onPointerDown, { passive: false });
  _handle.addEventListener("mousedown", onPointerDown);
}

function dismissSheet() {
  if (!_panel) return;
  if (!_panel.classList.contains("visible")) return;
  _wasDismissedByUser = true;
  _panel.classList.remove("visible");
  _panel.classList.add("hidden");
  _backdrop?.classList.remove("visible");
  _reopen?.classList.add("visible");
}

function reopenSheet() {
  if (!_panel) return;
  _wasDismissedByUser = false;
  _panel.classList.remove("hidden");
  _panel.classList.add("visible");
  _backdrop?.classList.add("visible");
  _reopen?.classList.remove("visible");
}

function syncBackdropAndReopen() {
  if (!_panel) return;
  const visible = _panel.classList.contains("visible");
  if (visible) {
    _backdrop?.classList.add("visible");
    _reopen?.classList.remove("visible");
    _wasDismissedByUser = false;
  } else {
    _backdrop?.classList.remove("visible");
    if (_wasDismissedByUser) {
      _reopen?.classList.add("visible");
    } else {
      _reopen?.classList.remove("visible");
    }
  }
}

/**
 * Wire iOS sheet behavior on top of the existing #right-panel. Idempotent
 * and lazy: nothing renders or binds until the viewport actually matches
 * the mobile media query.
 *
 * @param {HTMLElement} panel  the #right-panel element to enhance.
 */
export function attachIosSheet(panel) {
  if (typeof window === "undefined") return;
  if (attached) return;
  if (!panel) return;
  _panel = panel;

  const mql = window.matchMedia(MOBILE_MEDIA);
  const apply = () => {
    if (mql.matches) {
      ensureBackdropAndReopen();
      ensureDragHandle();
      attached = true;
      // Sync state immediately in case the panel is already visible
      // when the breakpoint becomes active.
      syncBackdropAndReopen();
      observePanelVisibility();
      observeContentChanges();
    }
  };
  apply();
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", apply);
  } else if (typeof mql.addListener === "function") {
    mql.addListener(apply);
  }
}

function observePanelVisibility() {
  if (_visibilityObserver || !_panel) return;
  _visibilityObserver = new MutationObserver(() => {
    syncBackdropAndReopen();
  });
  _visibilityObserver.observe(_panel, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

function observeContentChanges() {
  if (_contentObserver || !_panel) return;
  const panelContent = _panel.querySelector("#panel-content");
  if (!panelContent) return;
  _contentObserver = new MutationObserver(() => {
    // New content arrived (a step transition rendered fresh content).
    // If the sheet was dismissed by the user, auto-reopen so the new
    // content is surfaced. Apple Maps behaves the same way when the
    // map context changes while the sheet is collapsed.
    if (_wasDismissedByUser) reopenSheet();
  });
  _contentObserver.observe(panelContent, {
    childList: true,
    subtree: false,
  });
}
