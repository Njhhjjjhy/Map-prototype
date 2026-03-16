import { STEPS, STAGE_TABS, AppData } from "../data/index.js";
import { TIMING } from "../app.js";
import { t } from "../i18n/index.js";

export const methods = {
  init() {
    this.elements = {
      startScreen: document.getElementById("start-screen"),
      appContainer: document.getElementById("app-container"),
      timeToggle: document.getElementById("time-toggle"),
      presentBtn: document.getElementById("present-btn"),
      futureBtn: document.getElementById("future-btn"),
      chatbox: document.getElementById("chatbox"),
      chatboxTitle: document.getElementById("chatbox-title"),
      chatboxContent: document.getElementById("chatbox-content"),
      chatboxClose: document.getElementById("chatbox-close"),
      chatboxBack: document.getElementById("chatbox-back"),
      rightPanel: document.getElementById("right-panel"),
      panelClose: document.getElementById("panel-close"),
      panelHome: document.getElementById("panel-home"),
      panelContent: document.getElementById("panel-content"),
      galleryModal: document.getElementById("gallery-modal"),
      galleryClose: document.getElementById("gallery-close"),
      galleryOverlay: document.getElementById("gallery-overlay"),
      galleryBody: document.getElementById("gallery-body"),
      layersToggle: document.getElementById("layers-toggle"),
      dataLayers: document.getElementById("data-layers"),
      aiChat: document.getElementById("ai-chat"),
      aiChatClose: document.getElementById("ai-chat-close"),
      chatFab: document.getElementById("chat-fab"),
      panelToggle: document.getElementById("panel-toggle"),
      evidencePreview: document.getElementById("evidence-preview"),
      evidencePreviewBody: document.getElementById("evidence-preview-body"),
      evidencePreviewClose: document.getElementById("evidence-preview-close"),
    };

    this.layersPanelOpen = false;
    this.panelOpen = false;
    this.lastChatType = "chatbox"; // Track which chat was last shown
    this.bindEvents();
    this.initDraggableModals();
  },

  // ================================
  // DRAGGABLE MODALS
  // ================================

  /**
   * Initialize draggable functionality for modals
   */
  initDraggableModals() {
    // Make chatbox draggable (drag from header)
    this.makeDraggable(this.elements.chatbox, "#chatbox-body");

    // Make right panel draggable (drag from header area)
    this.makeDraggable(
      this.elements.rightPanel,
      "#panel-content .subtitle, #panel-content h2",
    );

    // Make AI chat draggable (drag from header)
    this.makeDraggable(this.elements.aiChat, ".ai-chat-header");

    // Make gallery modal draggable (drag from content area header)
    this.makeDraggable(
      document.getElementById("gallery-content"),
      ".placeholder-doc h3",
    );
  },

  /**
   * Make an element draggable
   * @param {HTMLElement} element - The element to make draggable
   * @param {string} handleSelector - CSS selector for the drag handle within the element
   */
  makeDraggable(element, handleSelector) {
    if (!element) return;

    let isDragging = false;
    let startX, startY, startLeft, startTop;
    let hasBeenDragged = false;

    // Store original position info
    const originalPosition = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      transform: element.style.transform,
    };

    const onMouseDown = (e) => {
      // Only start drag if clicking on the handle
      const handle = element.querySelector(handleSelector);
      if (!handle || !handle.contains(e.target)) return;

      // Don't drag if clicking on buttons or interactive elements
      if (e.target.closest("button, a, input, select, textarea")) return;

      isDragging = true;
      hasBeenDragged = true;

      // Get current position
      const rect = element.getBoundingClientRect();

      if (!element.dataset.draggable) {
        // First drag - convert from centered position to absolute
        element.dataset.draggable = "true";
        element.style.position = "fixed";
        element.style.left = rect.left + "px";
        element.style.top = rect.top + "px";
        element.style.transform = "none";
        element.style.bottom = "auto";
        element.style.right = "auto";
      }

      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(element.style.left) || rect.left;
      startTop = parseInt(element.style.top) || rect.top;

      // Add grabbing cursor
      element.style.cursor = "grabbing";
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;

      // Constrain to viewport
      const rect = element.getBoundingClientRect();
      const minTop = 0;
      const maxTop = window.innerHeight - 50; // Keep at least 50px visible
      const minLeft = -rect.width + 50;
      const maxLeft = window.innerWidth - 50;

      newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
      newTop = Math.max(minTop, Math.min(maxTop, newTop));

      element.style.left = newLeft + "px";
      element.style.top = newTop + "px";
    };

    const onMouseUp = () => {
      if (!isDragging) return;

      isDragging = false;
      element.style.cursor = "";
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    // Add event listeners
    element.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    // Store reset function for later use
    element.resetDragPosition = () => {
      if (hasBeenDragged) {
        element.dataset.draggable = "";
        element.style.position = originalPosition.position;
        element.style.left = originalPosition.left;
        element.style.top = originalPosition.top;
        element.style.transform = originalPosition.transform;
        element.style.bottom = "";
        element.style.right = "";
        hasBeenDragged = false;
      }
    };
  },

  /**
   * Bind UI events
   */
  bindEvents() {
    // Panel close
    this.elements.panelClose.addEventListener("click", () => {
      this.hidePanel();
    });

    // Panel home - reset to root view for current step
    this.elements.panelHome.addEventListener("click", () => {
      this.navigateHome();
    });

    // Gallery close
    this.elements.galleryClose.addEventListener("click", () => {
      this.hideGallery();
    });

    this.elements.galleryOverlay.addEventListener("click", () => {
      this.hideGallery();
    });

    // Chatbox close
    this.elements.chatboxClose.addEventListener("click", () => {
      this.hideChatbox();
    });

    // AI Chat close
    this.elements.aiChatClose.addEventListener("click", () => {
      this.hideAIChat();
    });

    // Unified Escape key handler: closes only the topmost overlay.
    // Checks from highest z-index to lowest, returns after the first match.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      // Quick Look (z-index 2000)
      const quickLook = document.getElementById("property-quick-look");
      if (quickLook && !quickLook.classList.contains("hidden")) {
        this.hidePropertyImageQuickLook();
        return;
      }

      // Evidence preview modal (z-index 1000)
      if (
        this.elements.evidencePreview &&
        !this.elements.evidencePreview.classList.contains("hidden")
      ) {
        this.hideEvidencePreview();
        return;
      }

      // Gallery modal (z-index 1000)
      if (!this.elements.galleryModal.classList.contains("hidden")) {
        this.hideGallery();
        return;
      }

      // Panel (z-index 200)
      if (!this.elements.rightPanel.classList.contains("hidden")) {
        this.hidePanel();
        return;
      }

      // 3D camera drill-down
      if (this._drillDown) {
        this.cancelDrillDown();
        return;
      }
    });

    // Delegated click handler for zone property rows (survives innerHTML restore)
    this.elements.panelContent.addEventListener("click", (e) => {
      const row = e.target.closest(".zone-property-row");
      if (row) {
        const propId = row.dataset.propertyId;
        if (propId && typeof App !== "undefined") {
          App.selectProperty(propId);
        }
      }
    });

    // Time toggle buttons
    this.elements.presentBtn.addEventListener("click", () => {
      this.setTimeView("present");
    });

    this.elements.futureBtn.addEventListener("click", () => {
      this.setTimeView("future");
    });

    // Layers toggle button
    this.elements.layersToggle.addEventListener("click", () => {
      this.toggleLayersPanel();
    });

    // Chat FAB - reopen chatbox or AI chat
    this.elements.chatFab.addEventListener("click", () => {
      this.reopenChat();
    });

    // Panel toggle button
    this.elements.panelToggle.addEventListener("click", () => {
      this.togglePanel();
    });
  },

  /**
   * Reopen the last closed chat (chatbox or AI chat)
   */
  reopenChat() {
    this.hideChatFab();

    if (this.lastChatType === "aiChat") {
      this.showAIChat();
    } else {
      // Restore appropriate chatbox content based on current journey state
      if (typeof App !== "undefined" && App.state) {
        App.restoreChatbox();

        // If data layer dashboard was showing, restore journey panel content
        // Data layer markers stay on map
        if (this._dataLayerDashboardActive && App.state.currentStep > 0) {
          this._dataLayerDashboardActive = false;
          App._renderStepPanel(STEPS[App.state.currentStep - 1]);
        }
      } else {
        this.elements.chatbox.classList.remove("hidden");
        this._retriggerAnimation(this.elements.chatbox);
      }
    }
  },

  /**
   * Show the chat FAB button with icon matching the chat type it will reopen
   */
  showChatFab() {
    const fab = this.elements.chatFab;

    // Swap icon: sparkles for AI chat, message-square for chatbox
    if (this.lastChatType === "aiChat") {
      fab.innerHTML = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                <path d="M5 3v4"></path><path d="M19 17v4"></path>
                <path d="M3 5h4"></path><path d="M17 19h4"></path>
            </svg>`;
      fab.setAttribute("aria-label", t("Reopen AI chat"));
    } else {
      fab.innerHTML = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>`;
      fab.setAttribute("aria-label", t("Reopen guide"));
    }

    fab.classList.remove("hidden");
    this._retriggerAnimation(fab);
  },

  /**
   * Hide the chat FAB button
   */
  hideChatFab() {
    this.elements.chatFab.classList.add("hidden");
  },

  // ================================
  // CHART RENDERING (Dataviz)
  // ================================

  /**
   * Destroy existing chart to prevent memory leaks
   */
  showAppDirect() {
    // Remove start screen immediately
    if (this.elements.startScreen && this.elements.startScreen.parentNode) {
      this.elements.startScreen.remove();
    }

    // Show app container with fade-in
    this.elements.appContainer.classList.remove("hidden");
    this.elements.appContainer.style.opacity = "0";
    this.elements.appContainer.classList.add("visible");

    // Subtle fade-in
    requestAnimationFrame(() => {
      this.elements.appContainer.style.transition = "opacity 600ms ease";
      this.elements.appContainer.style.opacity = "1";
    });
  },

  // ================================
  // CHATBOX
  // ================================

  /**
   * Show chatbox with content
   * @param {string} content - HTML content to display
   * @param {Object} options - { preserveHistory: boolean, skipHistory: boolean }
   *   - preserveHistory: true = save current content to history before showing new
   *   - skipHistory: true = don't touch history at all (for transitions)
   *   - default = clear history (for fresh starts)
   */
  showChatbox(content, options = {}) {
    const { preserveHistory = false, skipHistory = false } = options;

    if (skipHistory) {
      // Don't touch history at all (for transition screens)
    } else if (preserveHistory) {
      // Save current content to history before updating (for cross-journey navigation)
      const currentTitle = this.elements.chatboxTitle.textContent;
      const currentContent = this.elements.chatboxContent.innerHTML;

      if (currentTitle || currentContent.trim()) {
        const historyContent = currentTitle
          ? `<h3>${currentTitle}</h3>${currentContent}`
          : currentContent;
        this.chatboxHistory.push(historyContent);
      }
    } else {
      // Clear history when showing chatbox fresh (new journey start)
      this.chatboxHistory = [];
    }

    this._setChatboxContent(content);
    this._updateChatboxBackButton();
    this.elements.chatbox.classList.remove("hidden");
    this._retriggerAnimation(this.elements.chatbox);
    this.hideChatFab();
  },
  hideChatbox() {
    const chatbox = this.elements.chatbox;
    // Add closing animation class
    chatbox.classList.add("closing");
    this.lastChatType = "chatbox";

    // DON'T clear history when hiding - preserve for back navigation across journeys

    // Wait for animation to complete, then hide
    const animationDuration = TIMING.fast; // matches --duration-fast
    setTimeout(() => {
      chatbox.classList.add("hidden");
      chatbox.classList.remove("closing");
      this.showChatFab();
    }, animationDuration);
  },

  /**
   * Update chatbox content, saving current content to history
   */
  updateChatbox(content) {
    // Save current content to history before updating
    const currentTitle = this.elements.chatboxTitle.textContent;
    const currentContent = this.elements.chatboxContent.innerHTML;

    if (currentTitle || currentContent.trim()) {
      // Build the full content string for history
      const historyContent = currentTitle
        ? `<h3>${currentTitle}</h3>${currentContent}`
        : currentContent;

      // Don't push if same as last history item (avoid duplicates)
      const lastHistory = this.chatboxHistory[this.chatboxHistory.length - 1];
      if (!lastHistory || lastHistory !== historyContent) {
        this.chatboxHistory.push(historyContent);
      }
    }

    this._setChatboxContent(content);
    this._updateChatboxBackButton();
  },

  /**
   * Navigate back to previous chatbox content
   */
  chatboxBack() {
    if (this.chatboxHistory.length === 0) return;

    const previousContent = this.chatboxHistory.pop();
    if (previousContent) {
      this._setChatboxContent(previousContent);
      this._updateChatboxBackButton();
    }
  },

  /**
   * Save current chatbox content to history (for cross-journey navigation)
   * Call this BEFORE transitioning to a new journey
   */
  saveChatboxToHistory() {
    const currentTitle = this.elements.chatboxTitle.textContent;
    const currentContent = this.elements.chatboxContent.innerHTML;

    if (currentTitle || currentContent.trim()) {
      const historyContent = currentTitle
        ? `<h3>${currentTitle}</h3>${currentContent}`
        : currentContent;

      // Don't push duplicates
      const lastHistory = this.chatboxHistory[this.chatboxHistory.length - 1];
      if (!lastHistory || lastHistory !== historyContent) {
        this.chatboxHistory.push(historyContent);
      }
    }
  },

  /**
   * Enable/disable chatbox back button based on current journey step.
   * Enabled when on any step > 0, disabled at step 0 (welcome).
   */
  _updateChatboxBackButton() {
    const canGoBack =
      typeof App !== "undefined" && App.state && App.state.currentStep > 0;
    this.elements.chatboxBack.disabled = !canGoBack;
  },

  _setChatboxContent(content) {
    // Parse content to extract h3 title
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const h3 = tempDiv.querySelector("h3");

    if (h3) {
      this.elements.chatboxTitle.textContent = h3.textContent;
      h3.remove();
      this.elements.chatboxContent.innerHTML = tempDiv.innerHTML;
    } else {
      this.elements.chatboxTitle.textContent = "";
      this.elements.chatboxContent.innerHTML = content;
    }
  },

  // ================================
  // RIGHT PANEL
  // ================================

  /**
   * Show panel with content and automatic history tracking
   * History is automatically tracked when navigating between panels
   * @param {string} content - HTML content to display
   * @param {Object} options - Optional settings: { clearHistory }
   */
  showPanel(content, options = {}) {
    const { clearHistory = false } = options;

    // Clear history if requested (for starting a new flow)
    if (clearHistory) {
      this.panelHistory = [];
    }

    // Automatically save current content to history if panel is open with content
    if (this.panelOpen && this.elements.panelContent.innerHTML.trim()) {
      // Don't push if content is the same (avoid duplicates)
      const currentContent = this.elements.panelContent.innerHTML;
      const lastHistory = this.panelHistory[this.panelHistory.length - 1];
      const lastContent = lastHistory ? lastHistory.content : "";

      if (currentContent !== lastContent) {
        this.panelHistory.push({
          content: currentContent,
          scrollTop: this.elements.rightPanel.scrollTop,
        });
      }
    }

    this.elements.panelContent.innerHTML = content;
    this.elements.rightPanel.classList.remove("hidden");
    this.elements.rightPanel.classList.add("visible");
    this.panelOpen = true;

    // Capture first panel content as home snapshot (for sub-item steps)
    if (this._panelAtHome && !this._panelHomeContent && !this._isNavigatingHome) {
      this._panelHomeContent = content;
    }

    // Track whether we've navigated away from home
    if (!this._isNavigatingHome && (this._panelHomeFn || this._panelHomeContent)) {
      // Not at home if content differs from saved home
      if (this._panelHomeContent && content !== this._panelHomeContent) {
        this._panelAtHome = false;
      }
    }

    // Update toolbar back button and home button based on history
    this._updateToolbarBackButton();

    // Show panel toggle button (will be visible/active when panel is open)
    // Skip in dashboard mode — dashboard uses its own toggle
    if (!this.dashboardMode) {
      this.showPanelToggle();
    }
    this.updatePanelToggleState();

    // Announce dashboard opening to screen readers
    const titleEl = this.elements.panelContent.querySelector("h2");
    if (titleEl) {
      this.announceToScreenReader(t("Dashboard opened: ") + titleEl.textContent);
    }
  },

  /**
   * Inject back button into panel toolbar
   */
  injectBackButton(content) {
    // Back button is now injected into .panel-toolbar, not into content
    // This is handled in showPanel via _updateToolbarBackButton
    return content;
  },

  /**
   * Update toolbar back and home buttons based on history state
   */
  _updateToolbarBackButton() {
    const toolbar = document.querySelector(".panel-toolbar");
    if (!toolbar) return;

    const hasHistory = this.panelHistory.length > 0;

    // Remove existing back button
    const existing = toolbar.querySelector(".panel-back-btn");
    if (existing) existing.remove();

    if (hasHistory) {
      const backBtn = document.createElement("button");
      backBtn.className = "panel-back-btn";
      backBtn.setAttribute("aria-label", t("Go back"));
      backBtn.onclick = () => this.navigateBack();
      backBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      toolbar.insertBefore(backBtn, toolbar.firstChild);
    }

    // Also update home button
    this._updateHomeButton();
  },

  /**
   * Show or hide the home button. Visible whenever a home mechanism is available.
   */
  _updateHomeButton() {
    if (!this.elements.panelHome) return;
    const hasHome = this._panelHomeFn || this._panelHomeContent;
    this.elements.panelHome.classList.toggle("hidden", !hasHome);
  },

  /**
   * Navigate back to previous panel view
   */
  navigateBack() {
    if (this.panelHistory.length === 0) return;

    const previousView = this.panelHistory.pop();
    if (previousView) {
      this.elements.panelContent.innerHTML = previousView.content;

      // If history is now empty, we're back at the root
      if (this.panelHistory.length === 0) {
        this._panelAtHome = true;
      }

      // Update toolbar back and home buttons
      this._updateToolbarBackButton();

      // Restore scroll position
      if (previousView.scrollTop !== undefined) {
        this.elements.rightPanel.scrollTop = previousView.scrollTop;
      }
    }
  },

  /**
   * Set the panel home function for the current step.
   * Called when a step first renders its panel, or when dashboard mode starts.
   */
  /**
   * Set the panel home function for the current step.
   * Called when a step renders its own panel (inspector or showPanel).
   */
  setPanelHome(fn) {
    this._panelHomeFn = fn;
    this._panelHomeContent = null;
    this._panelAtHome = true;
    this._updateHomeButton();
  },

  /**
   * Clear home function and prepare for content-based home capture.
   * Called for sub-item steps where the panel is shown later on sub-item click.
   */
  clearPanelHome() {
    this._panelHomeFn = null;
    this._panelHomeContent = null;
    this._panelAtHome = true;
    this._updateHomeButton();
  },

  /**
   * Navigate home - reset panel to root view for current step
   */
  navigateHome() {
    // Prefer function-based home (for inspector panels and dashboard mode)
    if (this._panelHomeFn) {
      this._isNavigatingHome = true;
      this._panelHomeFn();
      this._isNavigatingHome = false;
      this._panelAtHome = true;
      this._updateHomeButton();
    } else if (this._panelHomeContent) {
      // Fallback: restore saved home content (for sub-item panel steps)
      this.panelHistory = [];
      this.elements.panelContent.innerHTML = this._panelHomeContent;
      this._panelAtHome = true;
      this._updateToolbarBackButton();
    }
  },

  /**
   * Clear panel history (call when starting a new panel flow)
   */
  clearPanelHistory() {
    this.panelHistory = [];
    this.currentPanelView = null;
    this.currentPanelViewFunction = null;
  },
  hidePanel() {
    const panel = this.elements.rightPanel;
    // Add closing class for exit animation (uses accelerate easing)
    panel.classList.add("closing");
    this.announceToScreenReader(t("Dashboard closed"));

    // If drill-down is active, cancel and reverse (to corridor or 2D map)
    // In corridor mode, only reverse if an actual drill-down is in progress
    if (this._drillDown) {
      this.cancelDrillDown();
    }

    // Clear panel history and home state when closing
    this.clearPanelHistory();
    this._panelHomeFn = null;
    this._panelHomeContent = null;
    this._updateHomeButton();

    // Wait for animation to complete, then remove visible
    const animationDuration = TIMING.fast; // matches --duration-fast
    setTimeout(() => {
      panel.classList.remove("visible");
      panel.classList.remove("closing");
      panel.classList.add("hidden");
      this.panelOpen = false;
      this.updatePanelToggleState();
      MapController.clearRoute();

      // Also reset dashboard state if in dashboard mode
      if (this.dashboardPanelOpen || this.dashboardMode) {
        this.dashboardPanelOpen = false;
      }

      // Fire onPanelClose callback if set
      if (this._onPanelClose) {
        const cb = this._onPanelClose;
        this._onPanelClose = null;
        cb();
      }
    }, animationDuration);
  },

  /**
   * Set a one-time callback for when the panel closes
   * @param {Function} callback
   */
  onPanelClose(callback) {
    this._onPanelClose = callback;
  },

  /**
   * Toggle the right panel open/closed
   */
  togglePanel() {
    if (this.panelOpen) {
      this.hidePanel();
    } else {
      // If there's existing content, just show the panel
      if (this.elements.panelContent.innerHTML.trim()) {
        this.elements.rightPanel.classList.remove("hidden");
        this.elements.rightPanel.classList.add("visible");
        this.panelOpen = true;
        this.updatePanelToggleState();
      } else {
        // Render panel for current step
        const stepIndex = App.state.currentStep;
        if (stepIndex > 0) {
          const stepDef = STEPS[stepIndex - 1];
          if (stepDef) {
            App._renderStepPanel(stepDef);
          }
        }
      }
    }
  },

  /**
   * Update the panel toggle button state
   */
  updatePanelToggleState() {
    if (this.panelOpen) {
      this.elements.panelToggle.classList.add("active");
      this.elements.panelToggle.setAttribute("aria-expanded", "true");
      // Hide toggle when panel is open (it sits behind the panel at lower z-index)
      this.elements.panelToggle.setAttribute("tabindex", "-1");
      this.elements.panelToggle.style.pointerEvents = "none";
      this.elements.panelToggle.style.visibility = "hidden";
    } else {
      this.elements.panelToggle.classList.remove("active");
      this.elements.panelToggle.setAttribute("aria-expanded", "false");
      // Restore toggle when panel is closed
      this.elements.panelToggle.removeAttribute("tabindex");
      this.elements.panelToggle.style.pointerEvents = "";
      this.elements.panelToggle.style.visibility = "";
    }
  },

  /**
   * Show the panel toggle button
   */
  showPanelToggle() {
    this.elements.panelToggle.classList.remove("hidden");
  },

  /**
   * Hide the panel toggle button
   */
  hidePanelToggle() {
    this.elements.panelToggle.classList.add("hidden");
  },

  /**
   * Show resource panel (step 1)
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Navigate back from property detail to corridor/map view
   */
  getConfidenceInfo(scenario) {
    const confidenceLevels = {
      bear: { level: t("High"), variance: 0.05 },
      average: { level: t("Medium"), variance: 0.1 },
      bull: { level: t("Low"), variance: 0.15 },
    };
    return confidenceLevels[scenario] || confidenceLevels.average;
  },

  /**
   * Format value with confidence range
   */
  formatWithConfidence(value, scenario, isYen = true) {
    const confidence = this.getConfidenceInfo(scenario);
    const variance = value * confidence.variance;
    const low = Math.round(value - variance);
    const high = Math.round(value + variance);

    const formatVal = (v) => {
      if (!isYen) return v.toLocaleString();
      if (v >= 1000000) return "¥" + (v / 1000000).toFixed(1) + "M";
      return "¥" + v.toLocaleString();
    };

    return {
      display: isYen ? "¥" + value.toLocaleString() : value.toLocaleString(),
      range: `${formatVal(low)} - ${formatVal(high)}`,
      confidence: confidence.level,
    };
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ${days > 1 ? t("days ago") : t("day ago")}`;
    if (hours > 0) return `${hours} ${hours > 1 ? t("hours ago") : t("hour ago")}`;
    return t("Just now");
  },

  /**
   * Update calculator with scenario
   */
  getLucideIcon(iconName) {
    const icons = {
      zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
            </svg>`,
      route: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="6" cy="19" r="3"/>
                <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
                <circle cx="18" cy="5" r="3"/>
            </svg>`,
      landmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" x2="21" y1="22" y2="22"/>
                <line x1="6" x2="6" y1="18" y2="11"/>
                <line x1="10" x2="10" y1="18" y2="11"/>
                <line x1="14" x2="14" y1="18" y2="11"/>
                <line x1="18" x2="18" y1="18" y2="11"/>
                <polygon points="12 2 20 7 4 7"/>
            </svg>`,
      "graduation-cap": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>`,
      "file-text": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>`,
      target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>`,
      "map-pin": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>`,
      plane: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>`,
      "train-front": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/>
                <path d="m9 15-1-1"/><path d="m15 15 1-1"/>
                <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/>
                <path d="m8 19-2 3"/><path d="m16 19 2 3"/>
            </svg>`,
      "flask-conical": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
                <path d="M8.5 2h7"/><path d="M7 16h10"/>
            </svg>`,
    };
    return icons[iconName] || icons["file-text"];
  },

  /**
   * Get document type icon
   * @param {string} type - Document type (pdf, image, web)
   * @returns {string} SVG string
   */
  getDocTypeIcon(type) {
    const icons = {
      pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>`,
      image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>`,
      web: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>`,
    };
    return icons[type] || icons["pdf"];
  },

  /**
   * Get human-readable label for document type
   * @param {string} type - Document type
   * @returns {string} Label
   */
  getTypeLabel(type) {
    const labels = {
      pdf: t("Document"),
      image: t("Gallery"),
      web: t("Source"),
    };
    return labels[type] || t("Evidence");
  },

  // ================================
  // TIME TOGGLE
  // ================================
  showTimeToggle() {
    this.elements.timeToggle.classList.remove("hidden");

    // Pulse coachmark to draw presenter attention (3 pulses, ~3.6s)
    this.elements.timeToggle.classList.add("coachmark");
    this.elements.timeToggle.addEventListener(
      "animationend",
      () => {
        this.elements.timeToggle.classList.remove("coachmark");
      },
      { once: true },
    );
  },
  hideTimeToggle() {
    this.elements.timeToggle.classList.add("hidden");
  },
  setTimeView(view) {
    if (view === "future") {
      this.elements.presentBtn.classList.remove("active");
      this.elements.presentBtn.setAttribute("aria-checked", "false");
      this.elements.futureBtn.classList.add("active");
      this.elements.futureBtn.setAttribute("aria-checked", "true");
      this.hideChatbox();
      App._renderFutureOutlookDashboard();
      MapController.showFutureZones();

      // Toggle on science park circles
      if (!App.state.activeFutureLayers) {
        App.state.activeFutureLayers = [];
      }
      if (!App.state.activeFutureLayers.includes("futureSciencePark")) {
        App.state.activeFutureLayers.push("futureSciencePark");
        MapController.showSciencePark({ skipFly: true });
        this.updateFutureOutlookPanel(App.state.activeFutureLayers);
      }

      const flightDuration = 2000;
      MapController.flyToStep({
        center: [130.7304, 32.7665],
        zoom: 10.3,
        pitch: 41,
        bearing: 47,
        duration: flightDuration,
      });
      App.state.futureView = true;

      // Re-show chatbox with Continue button after camera flight completes
      setTimeout(() => {
        const content = `
          <h3>${t("Future outlook")}</h3>
          <p>${t("See the 2030+ completed state: science park expansion, grand airport, road completions, and new stations.")}</p>
          <div class="chatbox-options">
            <button class="chatbox-continue primary" onclick="App.goToStep(9)">${t("Continue")}</button>
          </div>
        `;
        this.showChatbox(content, { skipHistory: true });
      }, flightDuration + 300);
    } else {
      this.elements.futureBtn.classList.remove("active");
      this.elements.futureBtn.setAttribute("aria-checked", "false");
      this.elements.presentBtn.classList.add("active");
      this.elements.presentBtn.setAttribute("aria-checked", "true");
      MapController.hideFutureZones();
      App.state.futureView = false;
    }
  },

  // ================================
  // HOLD TO CONFIRM (Future/Present toggle replacement)
  // ================================

  // ================================
  // JOURNEY PROGRESS BAR
  // ================================

  /**
   * Update the journey progress bar for the linear step flow.
   * @param {number} currentStep - Current step (1-based)
   */
  updateJourneyProgress(currentStep, totalSteps = 10) {
    let progressBar = document.getElementById("journey-progress");
    if (!progressBar) return;

    progressBar.setAttribute("aria-valuenow", currentStep);
    progressBar.setAttribute("aria-valuemax", totalSteps);
    progressBar.setAttribute(
      "aria-label",
      `${t("Step")} ${currentStep} ${t("of")} ${totalSteps}`,
    );

    let html = "";
    for (let i = 1; i <= totalSteps; i++) {
      const state =
        i < currentStep ? "completed" : i === currentStep ? "active" : "";
      html += `<div class="progress-segment ${state}" data-step="${i}"></div>`;
    }
    progressBar.innerHTML = html;
    progressBar.classList.remove("hidden");
  },

  /**
   * Hide the journey progress bar
   */
  hideJourneyProgress() {
    const progressBar = document.getElementById("journey-progress");
    if (progressBar) progressBar.classList.add("hidden");
  },

  // ================================
  // DATA LAYERS PANEL
  // ================================
  announceToScreenReader(message) {
    const announcer = document.getElementById("map-announcements");
    if (announcer) {
      announcer.textContent = message;
      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        announcer.textContent = "";
      }, 1000);
    }
  },

  // ================================
  // ================================
  // AI CHAT (Post-Journey)
  // ================================
  _retriggerAnimation(el) {
    el.style.animation = "none";
    el.offsetHeight; // force reflow
    el.style.animation = "";
  },
  formatYen(amount) {
    if (!amount) return "\u00a50";
    const abs = Math.abs(amount);
    const sign = amount < 0 ? "-" : "";
    if (abs >= 1e12) return sign + "\u00a5" + (abs / 1e12).toFixed(1) + "T";
    if (abs >= 1e9) return sign + "\u00a5" + (abs / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return sign + "\u00a5" + (abs / 1e6).toFixed(1) + "M";
    return sign + "\u00a5" + abs.toLocaleString();
  },

  // ---- Inspector event handlers ----
  formatStatLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  },
};
