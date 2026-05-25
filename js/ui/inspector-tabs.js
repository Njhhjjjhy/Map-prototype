/* Compact tabs dashboard
 * Source: playground/index.html (Variant A — Compact tabs)
 *   - CSS:    lines 678-765 (.panel-a, .panel-a-header, .panel-a-tabs,
 *             .panel-a-tab, .panel-a-body, .panel-a-footer, .commute-pill)
 *   - Markup: lines 1000-1042 (.variant-content[data-variant="a"] scaffold)
 *   - JS:     lines 1661-1694 renderVariantA, 1751-1791 wireTabGroup
 * Dependencies: design tokens from css/styles.css. No external module imports.
 *
 * Deviation from verbatim copy: the playground's renderVariantA accepts
 *   { tabs: [{ id, label, icon, blocks: [...] }] }
 * and renders blocks via its own renderBlocks() helper. In the real
 * app, the inspector already renders body content via renderStageTab()
 * which returns complete HTML. This module accepts pre-rendered HTML
 * strings for the body and only owns the panel-a chrome (header, tab
 * strip, body container, footer). The playground's block data shape is
 * incompatible with the real STAGE_TABS / renderStageTab pipeline, and
 * altering the rendering pipeline would violate the operating rule
 * "Do not alter step logic, demo content, map state".
 */

function buildScaffold() {
  return `
    <div class="panel-a-header" data-slot="header"></div>
    <div class="panel-a-tabs" role="tablist" data-slot="tabs"></div>
    <div class="panel-a-body" data-slot="body"></div>
    <div class="panel-a-footer" data-slot="footer"></div>
  `;
}

/**
 * Pure HTML builder for the Compact tabs scaffold. Use this when you
 * want to pass the result straight into UI.showPanel(html) and have it
 * inherit the existing panel-history/visibility bookkeeping. For
 * panels with no tab strip (most step-entry dashboards), no event
 * wiring is needed afterward. For panels with tabs, call
 * wireCompactTabsTabs() on the host once the markup is mounted.
 *
 * @param {Object} opts
 * @param {string} [opts.breadcrumb] - optional small label above title.
 * @param {string} opts.title        - large title text.
 * @param {string} [opts.navArrowsHtml] - optional nav arrows placed
 *   inside the header below the title.
 * @param {Array<{id:string,label:string,disabled?:boolean}>} [opts.tabs]
 *   Tab descriptors. Omit, pass [] or one item to skip the tab strip.
 * @param {number} [opts.activeIndex=0] - active tab index.
 * @param {string} [opts.bodyHtml=""]   - HTML for the body.
 * @param {string} [opts.footerHtml=""] - HTML for the footer.
 * @returns {string} HTML string.
 */
export function buildCompactTabsHtml(opts = {}) {
  const breadcrumb = opts.breadcrumb
    ? `<div class="breadcrumb">${opts.breadcrumb}</div>`
    : "";
  const navArrows = opts.navArrowsHtml || "";
  const tabs = Array.isArray(opts.tabs) ? opts.tabs : [];
  const activeIndex = typeof opts.activeIndex === "number" ? opts.activeIndex : 0;

  const tabsHtml =
    tabs.length > 1
      ? `<div class="panel-a-tabs" role="tablist">
          ${tabs
            .map((tab, i) => {
              const selected = i === activeIndex;
              const disabled = tab.disabled ? "disabled" : "";
              const onclickAttr = tab.onclick ? ` onclick="${tab.onclick}"` : "";
              return `<button
                class="panel-a-tab"
                role="tab"
                aria-selected="${selected ? "true" : "false"}"
                data-tab-index="${i}"
                ${disabled}${onclickAttr}>${tab.label}</button>`;
            })
            .join("")}
        </div>`
      : "";

  return `
    <div class="panel-a-header">
      ${breadcrumb}
      <h1 class="panel-title">${opts.title || ""}</h1>
      ${navArrows}
    </div>
    ${tabsHtml}
    <div class="panel-a-body">${opts.bodyHtml || ""}</div>
    <div class="panel-a-footer">${opts.footerHtml || ""}</div>
  `;
}

/**
 * Wire tab click handlers on a host that already contains panel-a
 * markup (typically from buildCompactTabsHtml). Use after showPanel
 * has mounted the HTML.
 */
export function wireCompactTabsTabs(host, onTabSelect) {
  if (!host) return;
  const tabsHost = host.querySelector(".panel-a-tabs");
  if (!tabsHost) return;
  const buttons = tabsHost.querySelectorAll(".panel-a-tab");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.hasAttribute("disabled")) return;
      const i = parseInt(btn.dataset.tabIndex, 10);
      buttons.forEach((b, idx) => {
        b.setAttribute("aria-selected", idx === i ? "true" : "false");
      });
      if (typeof onTabSelect === "function") onTabSelect(i);
    });
  });
}

/**
 * Render the Compact tabs scaffold into a host element.
 *
 * @param {HTMLElement} host - container that receives the panel-a scaffold
 *   (typically #panel-content).
 * @param {Object} opts
 * @param {string} [opts.breadcrumb] - small label above the title.
 * @param {string} opts.title        - large title shown in the header.
 * @param {string} [opts.navArrowsHtml] - optional pre-built navigation
 *   arrows (e.g. property prev/next), injected into the header below the
 *   title.
 * @param {Array<{id:string,label:string,disabled?:boolean}>} opts.tabs
 *   Tab descriptors. Pass [] or one item to omit the tab strip.
 * @param {number} opts.activeIndex  - currently-selected tab index.
 * @param {string} opts.bodyHtml     - pre-rendered HTML for the active tab.
 * @param {string} [opts.footerHtml] - pre-rendered HTML for the footer.
 * @param {(index:number) => void} [opts.onTabSelect] - called when the
 *   user activates a different tab.
 */
export function renderCompactTabsScaffold(host, opts) {
  if (!host) return;

  host.innerHTML = buildScaffold();
  host.classList.add("panel-a-host");

  const header = host.querySelector('[data-slot="header"]');
  const tabsHost = host.querySelector('[data-slot="tabs"]');
  const body = host.querySelector('[data-slot="body"]');
  const footer = host.querySelector('[data-slot="footer"]');

  const breadcrumbHtml = opts.breadcrumb
    ? `<div class="breadcrumb">${opts.breadcrumb}</div>`
    : "";
  const navArrows = opts.navArrowsHtml || "";

  header.innerHTML = `
    ${breadcrumbHtml}
    <h1 class="panel-title">${opts.title || ""}</h1>
    ${navArrows}
  `;

  const tabs = Array.isArray(opts.tabs) ? opts.tabs : [];
  const activeIndex = typeof opts.activeIndex === "number" ? opts.activeIndex : 0;

  if (tabs.length > 1) {
    tabsHost.style.display = "";
    tabsHost.innerHTML = tabs
      .map((tab, i) => {
        const selected = i === activeIndex;
        const disabled = tab.disabled ? "disabled" : "";
        return `<button
          class="panel-a-tab"
          role="tab"
          aria-selected="${selected ? "true" : "false"}"
          data-tab-index="${i}"
          ${disabled}>${tab.label}</button>`;
      })
      .join("");

    wireTabGroup(tabsHost, opts.onTabSelect);
  } else {
    tabsHost.style.display = "none";
    tabsHost.innerHTML = "";
  }

  body.innerHTML = opts.bodyHtml || "";
  footer.innerHTML = opts.footerHtml || "";
}

/**
 * Update only the body content and the active-tab visual state. Used
 * when switching between tabs so the header, tab strip, and footer
 * persist without flicker.
 */
export function updateCompactTabsBody(host, bodyHtml, activeIndex) {
  if (!host) return;
  const body = host.querySelector('[data-slot="body"]');
  if (body) body.innerHTML = bodyHtml || "";

  if (typeof activeIndex === "number") {
    host.querySelectorAll(".panel-a-tab").forEach((btn, i) => {
      btn.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
    });
  }
}

/**
 * Wire tab buttons inside a tabs host. Mirrors the playground's
 * wireTabGroup at lines 1751-1791 of playground/index.html. Click on a
 * tab updates aria-selected and notifies the caller. The body content
 * swap is delegated to the caller because the data shape differs per
 * use site (see header deviation note).
 */
function wireTabGroup(tabsHost, onTabSelect) {
  const buttons = tabsHost.querySelectorAll(".panel-a-tab");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.hasAttribute("disabled")) return;
      const i = parseInt(btn.dataset.tabIndex, 10);
      buttons.forEach((b, idx) => {
        b.setAttribute("aria-selected", idx === i ? "true" : "false");
      });
      if (typeof onTabSelect === "function") onTabSelect(i);
    });
  });
}
