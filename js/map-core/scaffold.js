/**
 * Map-core DOM scaffold.
 *
 * Auto-extracted (then iterated on) from index.html's <body> contents.
 * mountMap() injects this HTML into the target element when a target
 * is provided, so consumers don't need to replicate index.html.
 *
 * Embedded behavior preserved by this scaffold:
 *  - All elements queried by id from js/map/, js/ui/, js/app.js.
 *  - All overlay containers App/UI populates dynamically.
 *  - The rotate-overlay landscape prompt.
 *
 * Excluded from this scaffold (must come from the host page):
 *  - Skip link (host page accessibility concern).
 *  - All <script> tags (mountMap callers are already executing JS).
 *  - DEV-ONLY blocks (step jumper / QA reporter — standalone only).
 */
export const SCAFFOLD_HTML = `
    <!-- Embed-mode behavior (data-embed / data-embed-host / data-chromeless
         attributes, iPhone bottom sheet, valueadd postMessage contract, setup
         cover, click intercepts) now lives in \`js/map-core/\` and is applied
         by \`mountMap\` based on the resolved \`embedHost\` option. URL fallbacks
         (\`?embed=1\`, \`?host=valueadd\`, \`?chromeless=1\`) preserved by
         \`js/map-core/options.js\`. See docs/architecture-and-sync-workflow.md
         and docs/plans/map-core-extraction-execution-plan.md. -->

    <style>
      /* Dev tools are always hidden in any embed mode. */
      [data-embed="1"] #camera-debug-toggle,
      [data-embed="1"] #camera-debug,
      [data-embed="1"] #qa-toggle,
      [data-embed="1"] #qa-panel,
      [data-embed="1"] #camera-explorer-toggle,
      [data-embed="1"] #camera-explorer,
      [data-embed="1"] #step-jumper-toggle,
      [data-embed="1"] #step-jumper,
      [data-embed="1"] #layers-toggle {
        display: none !important;
      }

      /* Language toggle is hidden in every embed context (iPhone and
         value-add). The other three controls below are hidden only in
         the iPhone embed; the value-add host keeps them visible. */
      [data-embed="1"] #lang-toggle,
      [data-embed="1"]:not([data-embed-host="valueadd"]) #panel-toggle,
      [data-embed="1"]:not([data-embed-host="valueadd"]) #time-toggle,
      [data-embed="1"]:not([data-embed-host="valueadd"]) #journey-progress {
        display: none !important;
      }

      /* Dev-only QA tool toggle. Cmd+Shift+1 flips data-dev-hidden on <html>
         so the local presenter can clear the screen without leaving the
         browser. Handler is gated by import.meta.env.DEV in main.js, so this
         attribute is only ever set in development. */
      [data-dev-hidden="1"] #camera-debug-toggle,
      [data-dev-hidden="1"] #camera-debug,
      [data-dev-hidden="1"] #qa-toggle,
      [data-dev-hidden="1"] #qa-panel,
      [data-dev-hidden="1"] #camera-explorer-toggle,
      [data-dev-hidden="1"] #camera-explorer,
      [data-dev-hidden="1"] #step-jumper-toggle,
      [data-dev-hidden="1"] #step-jumper {
        display: none !important;
      }

      /* ───── Embed mode: iPhone 17 Pro frame ─────
         Matches the JSX PhoneFrame used by the other playground
         prototypes. The iframe viewport is 440 x 900 (playground
         constant). We paint the neutral page on <html>, center a
         380 x 732 bezel on <body>, and the app fills the 368 x 720
         screen inside. The \`transform\` on body makes body the
         containing block for descendants with \`position: fixed\`,
         so the right panel, gallery, and overlays stay inside the
         phone screen instead of escaping to the iframe viewport. */
      [data-embed="1"] {
        background: #EDEEF1;
      }
      html[data-embed="1"] {
        min-height: 100%;
      }
      [data-embed="1"] body {
        width: 380px;
        height: 732px;
        padding: 6px;
        margin: 0 auto;
        box-sizing: border-box;
        background: #1A1A1E;
        border-radius: 44px;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        overflow: hidden;
        position: relative;
        transform: translate(0, 0);
      }
      [data-embed="1"] #app-container {
        position: relative;
        top: auto;
        left: auto;
        width: 100%;
        height: 100%;
        border-radius: 40px;
        overflow: hidden;
        background: #F9F9F9;
      }
      [data-embed="1"] #map-container {
        border-radius: 40px;
        overflow: hidden;
      }

      /* Full-screen modal overlays stay inside the phone screen. The
         bottom sheet (#right-panel) and the nav arrows are styled in
         embed-mobile.css. */
      [data-embed="1"] #gallery-modal,
      [data-embed="1"] #property-quick-look,
      [data-embed="1"] #evidence-preview {
        position: absolute;
        inset: 0;
        width: auto;
        height: auto;
        border-radius: 40px;
        overflow: hidden;
      }

      /* ───── value-add-prototype embed host overrides ─────
         Activated by ?embed=1&host=valueadd. Overrides the iPhone phone
         frame above and lets the iframe fill its container — the slideshow
         draws its own iPad frame around the iframe. */
      [data-embed-host="valueadd"] {
        background: #F9F9F9;
      }
      html[data-embed-host="valueadd"],
      [data-embed-host="valueadd"] body {
        width: 100%;
        height: 100%;
        min-height: 0;
        margin: 0;
        padding: 0;
        overflow: hidden;
        box-sizing: border-box;
      }
      [data-embed-host="valueadd"] body {
        background: #F9F9F9;
        border-radius: 0;
        box-shadow: none;
        position: relative;
        transform: translate(0, 0);
      }
      [data-embed-host="valueadd"] #app-container {
        border-radius: 0;
      }
      [data-embed-host="valueadd"] #map-container {
        border-radius: 0;
      }
      [data-embed-host="valueadd"] #gallery-modal,
      [data-embed-host="valueadd"] #property-quick-look,
      [data-embed-host="valueadd"] #evidence-preview {
        border-radius: 0;
      }

      /* Chromeless mode (toggled via ?chromeless=1 or postMessage). Hides
         every interactive overlay so the map reads as a pure visual
         surface during transitions. */
      [data-chromeless="1"] #right-panel,
      [data-chromeless="1"] #nav-arrows,
      [data-chromeless="1"] #view-mode-toggle,
      [data-chromeless="1"] #lang-toggle {
        display: none !important;
      }
    </style>

    <!-- Skip Link for keyboard users -->
    

    <!-- Start screen removed - map loads directly -->
    <div id="start-screen" style="display: none"></div>

    <!-- Main App Container -->
    <div id="app-container">
      <!-- Map Container -->
      <div id="map-container" tabindex="-1">
        <div
          id="map"
          role="application"
          aria-label="熊本投資區域互動地圖"
        ></div>
        <!-- Screen reader announcements for map interactions -->
        <div
          id="map-announcements"
          class="sr-only"
          aria-live="polite"
          aria-atomic="true"
        ></div>

        <!-- Journey Progress Bar (populated dynamically by UI.updateJourneyProgress) -->
        <nav
          id="journey-progress"
          class="hidden"
          role="progressbar"
          aria-valuemin="1"
          aria-label="旅程進度"
        ></nav>

        <!-- Time Toggle -->
        <div
          id="time-toggle"
          class="hidden"
          role="radiogroup"
          aria-label="地圖時間檢視"
        >
          <button
            id="present-btn"
            class="time-btn active"
            role="radio"
            aria-checked="true"
          >
            Now
          </button>
          <button
            id="future-btn"
            class="time-btn"
            role="radio"
            aria-checked="false"
          >
            Future
          </button>
        </div>

        <!-- Nav arrows (replaces chatbox + FAB) -->
        <div class="nav-arrows" id="nav-arrows" style="display: none;">
          <button class="nav-btn back" id="nav-back" aria-label="Previous step">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <button class="nav-btn forward" id="nav-forward" aria-label="Next step">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        

        

        

        

        

        <!-- Dashboard Toggle Button (right side) -->
        <button
          id="panel-toggle"
          class="hidden"
          aria-label="切換儀表板"
          aria-expanded="false"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M15 3v18" />
          </svg>
        </button>

        <!-- Dashboard Toggle Button - removed in v2 overhaul -->
      </div>

      <!-- Dashboard -->
      <aside
        id="right-panel"
        class="hidden"
        role="complementary"
        aria-label="儀表板"
      >
        <div class="panel-toolbar">
          <button id="panel-home" class="hidden" aria-label="回到儀表板首頁">
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </button>
          <button id="panel-close" aria-label="關閉儀表板">
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div id="panel-content"></div>
      </aside>
    </div>

    <!-- Gallery Modal -->
    <div
      id="gallery-modal"
      class="hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-title"
    >
      <div id="gallery-overlay"></div>
      <div id="gallery-content">
        <button id="gallery-close" aria-label="關閉圖庫">
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="14" y1="2" x2="2" y2="14"></line>
            <line x1="2" y1="2" x2="14" y2="14"></line>
          </svg>
        </button>
        <h2 id="gallery-title" class="sr-only">文件檢視器</h2>
        <div id="gallery-body"></div>
      </div>
    </div>

    <!-- Property Image Quick Look Modal (macOS pattern) -->
    <div
      id="property-quick-look"
      class="hidden"
      role="dialog"
      aria-modal="true"
      aria-label="物件圖片放大檢視"
    >
      <div
        id="quick-look-overlay"
        onclick="UI.hidePropertyImageQuickLook()"
      ></div>
      <div id="quick-look-content">
        <button
          id="quick-look-close"
          aria-label="關閉圖片"
          onclick="UI.hidePropertyImageQuickLook()"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="14" y1="2" x2="2" y2="14"></line>
            <line x1="2" y1="2" x2="14" y2="14"></line>
          </svg>
        </button>
        <img id="quick-look-image" src="" alt="" />
      </div>
    </div>

    <!-- Evidence Preview Overlay -->
    <div
      id="evidence-preview"
      class="hidden"
      role="dialog"
      aria-modal="true"
      aria-label="佐證資料預覽"
    >
      <div
        id="evidence-preview-overlay"
        onclick="UI.hideEvidencePreview()"
      ></div>
      <div id="evidence-preview-content">
        <button
          id="evidence-preview-close"
          aria-label="關閉預覽"
          onclick="UI.hideEvidencePreview()"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="14" y1="2" x2="2" y2="14"></line>
            <line x1="2" y1="2" x2="14" y2="14"></line>
          </svg>
        </button>
        <div id="evidence-preview-body"></div>
      </div>
    </div>


    <!-- Chart.js for data visualization -->
    

    <!-- Mapbox GL JS. Token resolution (parent-window injection, URL param,
         bundled fallback) now lives in \`js/map-core/options.js\` and is
         applied by \`mountMap\` via \`window.MAPBOX_ACCESS_TOKEN\` before
         \`MapController.init()\` runs. -->
    

    <!-- Language toggle (top-right) -->
    <button id="lang-toggle" aria-label="切換語言">EN</button>
    

    <!-- Rotate-to-landscape overlay (touch devices in portrait).
         The app is designed for landscape; this overlay covers the
         broken portrait layout until the user rotates the iPad. -->
    <div id="rotate-overlay" aria-hidden="true">
      <div class="rotate-overlay-inner">
        <svg
          class="rotate-overlay-icon"
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="30"
            y="10"
            width="36"
            height="54"
            rx="5"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
          />
          <circle cx="48" cy="58" r="1.6" fill="currentColor" />
          <path
            d="M16 66 Q16 84 34 84 L62 84 Q80 84 80 66"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
          />
          <path
            d="M74 70 L80 64 L86 70"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <h2 class="rotate-overlay-title">Rotate to Landscape</h2>
        <p class="rotate-overlay-body">
          This experience is designed for landscape orientation.
        </p>
      </div>
    </div>

    <!-- App JS (ES modules) -->
    
  `;
