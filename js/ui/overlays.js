import { AppData } from "../data/index.js";
import { MapController } from "../map/index.js";
import { t } from "../i18n/index.js";

export const methods = {
  _ensureTransitionOverlay() {
    let overlay = document.getElementById("transition-overlay");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "transition-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
            <img class="transition-img transition-img-a" src="" alt="">
            <img class="transition-img transition-img-b" src="" alt="">
            <button class="transition-back-to-map" aria-label="${t("Back to map")}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                ${t("Back to map")}
            </button>
            <div class="transition-label">
                <span class="transition-name"></span>
                <span class="transition-type"></span>
            </div>
            <div class="transition-property-nav hidden">
                <button class="transition-prop-prev" aria-label="${t("Previous property")}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span class="transition-prop-prev-label"></span>
                </button>
                <button class="transition-prop-next" aria-label="${t("Next property")}">
                    <span class="transition-prop-next-label"></span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
                </button>
            </div>
            <div class="transition-gallery-nav hidden">
                <button class="transition-prev" aria-label="${t("Previous image")}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <span class="transition-counter"></span>
                <button class="transition-next" aria-label="${t("Next image")}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                    </svg>
                </button>
            </div>
        `;

    // Back to map handler
    overlay
      .querySelector(".transition-back-to-map")
      .addEventListener("click", () => this.cancelDrillDown());

    // Property nav handlers
    overlay
      .querySelector(".transition-prop-prev")
      .addEventListener("click", () => this._goToPrevProperty());
    overlay
      .querySelector(".transition-prop-next")
      .addEventListener("click", () => this._goToNextProperty());

    // Gallery navigation handlers
    overlay
      .querySelector(".transition-prev")
      .addEventListener("click", () => this._galleryPrev());
    overlay
      .querySelector(".transition-next")
      .addEventListener("click", () => this._galleryNext());

    document.getElementById("map-container").appendChild(overlay);
    return overlay;
  },

  /**
   * Set the initial transition image (img-a active)
   * @private
   */
  _setTransitionImage(overlay, src, alt) {
    const imgA = overlay.querySelector(".transition-img-a");
    const imgB = overlay.querySelector(".transition-img-b");
    imgA.src = src;
    imgA.alt = alt;
    imgA.classList.add("active");
    imgB.classList.remove("active");
    this._activeTransitionImg = "a";
  },

  /**
   * Set the label text on the transition overlay
   * @private
   */
  _setTransitionLabel(overlay, name, type) {
    overlay.querySelector(".transition-name").textContent = name;
    overlay.querySelector(".transition-type").textContent = type;
  },

  /**
   * True crossfade: swap active between img-a and img-b
   * @private
   */
  _crossfadeTransitionImage(overlay, src, alt) {
    const isA = this._activeTransitionImg === "a";
    const incoming = overlay.querySelector(
      isA ? ".transition-img-b" : ".transition-img-a",
    );
    const outgoing = overlay.querySelector(
      isA ? ".transition-img-a" : ".transition-img-b",
    );

    incoming.src = src;
    incoming.alt = alt;
    incoming.classList.add("active");
    outgoing.classList.remove("active");

    this._activeTransitionImg = isA ? "b" : "a";
  },

  /**
   * Show gallery prev/next nav and update counter
   * @private
   */
  _showGalleryNav(overlay) {
    const nav = overlay.querySelector(".transition-gallery-nav");
    nav.classList.remove("hidden");
    this._updateGalleryCounter(overlay);
  },

  _updateGalleryCounter(overlay) {
    const counter = overlay.querySelector(".transition-counter");
    const total = this._drillDownImages ? this._drillDownImages.length : 0;
    const current = (this._drillDownImageIndex || 0) + 1;
    counter.textContent = `${current} / ${total}`;
  },

  _galleryPrev() {
    if (!this._drillDownImages || this._drillDownImageIndex <= 0) return;
    this._drillDownImageIndex--;
    const overlay = document.getElementById("transition-overlay");
    const src = this._drillDownImages[this._drillDownImageIndex];
    const name = this._drillDown?.property?.name || "";
    this._crossfadeTransitionImage(overlay, src, `${name} ${t("view")}`);
    this._updateGalleryCounter(overlay);
  },

  _galleryNext() {
    if (
      !this._drillDownImages ||
      this._drillDownImageIndex >= this._drillDownImages.length - 1
    )
      return;
    this._drillDownImageIndex++;
    const overlay = document.getElementById("transition-overlay");
    const src = this._drillDownImages[this._drillDownImageIndex];
    const name = this._drillDown?.property?.name || "";
    this._crossfadeTransitionImage(overlay, src, `${name} ${t("view")}`);
    this._updateGalleryCounter(overlay);
  },

  /**
   * Get current property index within AppData.properties
   * @private
   */
  _getCurrentPropertyIndex() {
    if (!this._drillDown?.property) return -1;
    return AppData.properties.findIndex(
      (p) => p.id === this._drillDown.property.id,
    );
  },

  /**
   * Update property nav button labels and visibility
   * @private
   */
  _updatePropertyNav(overlay) {
    const nav = overlay.querySelector(".transition-property-nav");
    if (!nav) return;

    const idx = this._getCurrentPropertyIndex();
    if (idx < 0) {
      nav.classList.add("hidden");
      return;
    }

    nav.classList.remove("hidden");

    const prevBtn = nav.querySelector(".transition-prop-prev");
    const nextBtn = nav.querySelector(".transition-prop-next");
    const prevLabel = nav.querySelector(".transition-prop-prev-label");
    const nextLabel = nav.querySelector(".transition-prop-next-label");

    if (idx > 0) {
      prevBtn.style.display = "";
      prevLabel.textContent = AppData.properties[idx - 1].name;
    } else {
      prevBtn.style.display = "none";
    }

    if (idx < AppData.properties.length - 1) {
      nextBtn.style.display = "";
      nextLabel.textContent = AppData.properties[idx + 1].name;
    } else {
      nextBtn.style.display = "none";
    }
  },

  /**
   * Navigate to previous property without exiting to corridor
   * @private
   */
  async _goToPrevProperty() {
    const idx = this._getCurrentPropertyIndex();
    if (idx <= 0) return;
    await this._crossPropertyTransition(AppData.properties[idx - 1]);
  },

  /**
   * Navigate to next property without exiting to corridor
   * @private
   */
  async _goToNextProperty() {
    const idx = this._getCurrentPropertyIndex();
    if (idx < 0 || idx >= AppData.properties.length - 1) return;
    await this._crossPropertyTransition(AppData.properties[idx + 1]);
  },

  /**
   * Cross-property transition: fade to black, fly, fade to new exterior
   * @private
   */
  async _crossPropertyTransition(newProperty) {
    if (this._propertyTransitioning) return;
    this._propertyTransitioning = true;

    const overlay = document.getElementById("transition-overlay");
    if (!overlay) {
      this._propertyTransitioning = false;
      return;
    }

    // Cancel current drill-down state
    if (this._drillDown) {
      this._drillDown.cancelled = true;
    }

    // Fade images to black (300ms) by removing active class from both images
    const imgA = overlay.querySelector(".transition-img-a");
    const imgB = overlay.querySelector(".transition-img-b");
    imgA.classList.remove("active");
    imgB.classList.remove("active");

    // Hide gallery nav during transition
    const galleryNav = overlay.querySelector(".transition-gallery-nav");
    if (galleryNav) galleryNav.classList.add("hidden");

    await this._delay(300);

    // Set up new drill-down state
    const drillDown = { cancelled: false, property: newProperty };
    this._drillDown = drillDown;
    App.state.activeProperty = newProperty.id;

    // Fly to new property (1.5s)
    MapController.forwardReveal(newProperty);
    await this._delay(1500);
    if (drillDown.cancelled) {
      this._propertyTransitioning = false;
      return;
    }

    // Update inspector panel
    this.renderInspectorPanel(9, {
      title: newProperty.name,
      property: newProperty,
    });

    // Load new exterior and fade in (600ms)
    const imgs = this._getImagesData(newProperty);
    const exteriorSrc = imgs.exterior;
    this._setTransitionImage(
      overlay,
      exteriorSrc,
      `${newProperty.name} ${t("exterior")}`,
    );
    this._setTransitionLabel(overlay, newProperty.name, newProperty.subtitle);

    // Set up gallery images for manual navigation
    const interiorImages = imgs.interior || [];
    this._drillDownImages = [exteriorSrc, ...interiorImages];
    this._drillDownImageIndex = 0;

    await this._delay(600);
    if (drillDown.cancelled) {
      this._propertyTransitioning = false;
      return;
    }

    // Show gallery nav if multiple images
    if (this._drillDownImages.length > 1) {
      this._showGalleryNav(overlay);
    }

    // Update property nav labels
    this._updatePropertyNav(overlay);

    this._propertyTransitioning = false;
  },

  /**
   * Promise-based delay helper
   */
  showGallery(title, type, description, imageSrc) {
    let bodyHtml;

    if (imageSrc) {
      // Render real image
      bodyHtml = `
                <div class="gallery-header">
                    <h3>${title}</h3>
                </div>
                <div class="gallery-image-container">
                    <img src="${imageSrc}" alt="${title}" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: var(--radius-medium);">
                </div>
                <p style="margin-top: var(--space-4); font-size: var(--text-sm); color: var(--color-text-secondary);">${description}</p>
            `;
    } else {
      // Placeholder for items without images
      const icons = {
        pdf: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        image: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
        web: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
      };

      bodyHtml = `
                <div class="gallery-header">
                    <h3>${title}</h3>
                </div>
                <div class="placeholder-doc">
                    <div class="icon" style="color: var(--color-text-tertiary);">${icons[type] || icons.pdf}</div>
                    <p>${description}</p>
                    <p style="margin-top: var(--space-6); font-size: var(--text-sm); color: var(--color-text-tertiary);">
                        ${t("Document preview not yet available.")}
                    </p>
                </div>
            `;
    }

    this.elements.galleryBody.innerHTML = bodyHtml;
    this.elements.galleryModal.classList.remove("hidden");
    document.getElementById("map-container").classList.add("immersive-active");

    // Focus management for accessibility
    this.lastFocusedElement = document.activeElement;
    this.elements.galleryClose.focus();

    // Set up focus trap
    this.setupFocusTrap(this.elements.galleryModal);
  },
  /**
   * Show gallery with multiple navigable items (images and PDFs).
   * @param {string} title - Gallery heading
   * @param {Array} items - Array of {type, src, title}
   */
  showGalleryItems(title, items) {
    this._galleryItems = items;
    this._galleryItemIndex = 0;

    const bodyHtml = `
      <div class="gallery-items-viewport">
        <button class="gallery-items-chevron gallery-items-prev" aria-label="${t("Previous item")}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="gallery-items-content"></div>
        <button class="gallery-items-chevron gallery-items-next" aria-label="${t("Next item")}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="gallery-items-counter"></div>
    `;

    this.elements.galleryBody.innerHTML = bodyHtml;
    this._renderGalleryItem(0);

    // Bind chevron clicks
    this.elements.galleryBody
      .querySelector(".gallery-items-prev")
      .addEventListener("click", () => {
        if (this._galleryItemIndex > 0) {
          this._galleryItemIndex--;
          this._renderGalleryItem(this._galleryItemIndex);
        }
      });
    this.elements.galleryBody
      .querySelector(".gallery-items-next")
      .addEventListener("click", () => {
        if (this._galleryItemIndex < this._galleryItems.length - 1) {
          this._galleryItemIndex++;
          this._renderGalleryItem(this._galleryItemIndex);
        }
      });

    this.elements.galleryModal.classList.remove("hidden");
    document.getElementById("map-container").classList.add("immersive-active");

    this.lastFocusedElement = document.activeElement;
    this.elements.galleryClose.focus();
    this.setupFocusTrap(this.elements.galleryModal);
  },

  /**
   * Render a single gallery item by index into the viewport.
   */
  _renderGalleryItem(index) {
    const item = this._galleryItems[index];
    const container = this.elements.galleryBody.querySelector(
      ".gallery-items-content",
    );
    const counter = this.elements.galleryBody.querySelector(
      ".gallery-items-counter",
    );
    const prevBtn = this.elements.galleryBody.querySelector(
      ".gallery-items-prev",
    );
    const nextBtn = this.elements.galleryBody.querySelector(
      ".gallery-items-next",
    );

    if (item.type === "image") {
      container.innerHTML = `
        <img src="${item.src}" alt="${item.title}" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: var(--radius-medium);">
      `;
    } else if (item.type === "pdf") {
      container.innerHTML = `
        <iframe src="${item.src}" title="${item.title}" style="width: 100%; height: 70vh; border: none; border-radius: var(--radius-medium);"></iframe>
      `;
    }

    // Update counter
    counter.textContent = `${index + 1} ${t("of")} ${this._galleryItems.length}`;

    // Update chevron visibility
    prevBtn.classList.toggle("hidden", index === 0);
    nextBtn.classList.toggle("hidden", index === this._galleryItems.length - 1);
  },

  showGalleryFromUrl(url, title) {
    const bodyHtml = `
            <div class="gallery-header">
                <h3>${title}</h3>
            </div>
            <div class="placeholder-doc">
                <div class="icon" style="color: var(--color-text-tertiary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <p style="font-size: var(--text-sm); color: var(--color-text-secondary);">${title}</p>
                <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: var(--space-2); margin-top: var(--space-6); font-size: var(--text-sm); color: var(--color-info); text-decoration: none; font-weight: 500;">
                    ${t("Open source document")}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
            </div>
        `;

    this.elements.galleryBody.innerHTML = bodyHtml;
    this.elements.galleryModal.classList.remove("hidden");
    document.getElementById("map-container").classList.add("immersive-active");

    this.lastFocusedElement = document.activeElement;
    this.elements.galleryClose.focus();
    this.setupFocusTrap(this.elements.galleryModal);
  },
  hideGallery() {
    this.elements.galleryModal.classList.add("hidden");
    document
      .getElementById("map-container")
      .classList.remove("immersive-active");

    // Remove focus trap
    this.removeFocusTrap();

    // Return focus to trigger element
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  },

  /**
   * Show evidence preview overlay with image or placeholder
   * @param {string} groupId - Evidence group ID
   * @param {string} itemId - Evidence item ID
   */
  showPropertyImageQuickLook(imageUrl, title) {
    const quickLook = document.getElementById("property-quick-look");
    const quickLookImage = document.getElementById("quick-look-image");

    if (!quickLook || !quickLookImage) return;

    // Set image source and alt
    quickLookImage.src = imageUrl;
    quickLookImage.alt = title;

    // Store current scroll position in panel (to restore later)
    this.panelScrollPosition =
      this.elements.panelContent.parentElement.scrollTop;

    // Store last focused element
    this.lastFocusedElement = document.activeElement;

    // Show the modal
    quickLook.classList.remove("hidden");

    // Focus the close button
    const closeBtn = document.getElementById("quick-look-close");
    if (closeBtn) {
      closeBtn.focus();
    }

    // Set up focus trap
    this.setupFocusTrap(quickLook);
  },

  /**
   * Hide property image Quick Look modal
   */
  hidePropertyImageQuickLook() {
    const quickLook = document.getElementById("property-quick-look");
    if (quickLook) {
      quickLook.classList.add("hidden");
      quickLook.classList.remove("evidence-lightbox", "quick-look--pdf");
    }

    // Remove focus trap
    this.removeFocusTrap();

    // Restore panel scroll position
    if (this.panelScrollPosition !== undefined) {
      this.elements.panelContent.parentElement.scrollTop =
        this.panelScrollPosition;
    }

    // Return focus
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  },

  /**
   * Set up focus trap within a modal element
   */
  setupFocusTrap(element) {
    this.focusTrapHandler = (e) => {
      if (e.key !== "Tab") return;

      const focusable = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", this.focusTrapHandler);
  },

  /**
   * Remove focus trap
   */
  removeFocusTrap() {
    if (this.focusTrapHandler) {
      document.removeEventListener("keydown", this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  },

  /**
   * Show evidence based on type
   */
  showMoreHarvestEntry() {
    return new Promise((resolve) => {
      // Remove any existing overlays to prevent accumulation
      const existingOverlays = document.querySelectorAll(".moreharvest-entry");
      existingOverlays.forEach((el) => el.remove());

      const overlay = document.createElement("div");
      overlay.className = "moreharvest-entry";
      overlay.innerHTML = `
                <img class="moreharvest-entry-logo" src="assets/Assets4-white.svg" alt="MoreHarvest" draggable="false">
                <div class="moreharvest-entry-tagline">${t("Japanese property investment made easy.")}</div>
            `;
      document.body.appendChild(overlay);

      // Fade in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add("visible");
        });
      });

      // Fade out after 2.5 seconds
      setTimeout(() => {
        overlay.classList.remove("visible");
        setTimeout(() => {
          // Ensure removal with fallback
          if (overlay.parentNode) {
            overlay.remove();
          }
          resolve();
        }, 350);
      }, 2500);
    });
  },

  // ================================
  // PORTFOLIO SUMMARY (Peak Experience)
  // ================================

  /**
   * Calculate and display portfolio summary card
   * Shows combined potential across all explored properties
   */
  showQuickLook(options = {}) {
    const quickLook = document.getElementById("property-quick-look");
    if (!quickLook) return;
    const content = document.getElementById("quick-look-content");
    if (!content) return;

    const type = options.type || "image";

    if (type === "image") {
      content.innerHTML = `
                <button id="quick-look-close" aria-label="${t("Close")}" onclick="UI.hideQuickLook()">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="2" x2="2" y2="14"></line><line x1="2" y1="2" x2="14" y2="14"></line></svg>
                </button>
                <img id="quick-look-image" src="${options.src || ""}" alt="${options.title || ""}" />
            `;
    } else if (type === "gallery") {
      const images = options.images || [];
      const idx = options.startIndex || 0;
      quickLook.dataset.galleryImages = JSON.stringify(images);
      quickLook.dataset.galleryIndex = idx;
      const src = images[idx] || "";
      content.innerHTML = `
                <button id="quick-look-close" aria-label="${t("Close")}" onclick="UI.hideQuickLook()">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="2" x2="2" y2="14"></line><line x1="2" y1="2" x2="14" y2="14"></line></svg>
                </button>
                <button id="quick-look-prev" aria-label="${t("Previous")}" onclick="UI._quickLookNav(-1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <img id="quick-look-image" src="${src}" alt="${options.title || ""}" />
                <button id="quick-look-next" aria-label="${t("Next")}" onclick="UI._quickLookNav(1)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <div style="position: absolute; bottom: var(--space-3); left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.7); font-size: var(--text-xs);">${idx + 1} / ${images.length}</div>
            `;
      this._quickLookKeyHandler = (e) => {
        if (e.key === "ArrowLeft") this._quickLookNav(-1);
        else if (e.key === "ArrowRight") this._quickLookNav(1);
        else if (e.key === "Escape") this.hideQuickLook();
      };
      document.addEventListener("keydown", this._quickLookKeyHandler);
    } else if (type === "pdf") {
      quickLook.classList.add("quick-look--pdf");
      content.innerHTML = `
                <button id="quick-look-close" aria-label="${t("Close")}" onclick="UI.hideQuickLook()" style="position: absolute; top: var(--space-3); right: var(--space-3); z-index: 10;">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="2" x2="2" y2="14"></line><line x1="2" y1="2" x2="14" y2="14"></line></svg>
                </button>
                <iframe src="${options.src}" style="width: 100%; height: 100%; border: none; border-radius: var(--radius-large);"></iframe>
            `;
    } else if (type === "doc") {
      content.innerHTML = `
                <div class="quick-look-doc">
                    <button id="quick-look-close" aria-label="${t("Close")}" onclick="UI.hideQuickLook()">
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="2" x2="2" y2="14"></line><line x1="2" y1="2" x2="14" y2="14"></line></svg>
                    </button>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <h3>${options.title || t("Document")}</h3>
                    ${options.source ? `<p>${options.source}</p>` : ""}
                </div>
            `;
    }

    quickLook.classList.remove("hidden");
  },
  _quickLookNav(direction) {
    const quickLook = document.getElementById("property-quick-look");
    if (!quickLook) return;
    let images;
    try {
      images = JSON.parse(quickLook.dataset.galleryImages || "[]");
    } catch (e) {
      return;
    }
    if (!images.length) return;
    let idx = parseInt(quickLook.dataset.galleryIndex, 10) || 0;
    idx += direction;
    if (idx < 0) idx = images.length - 1;
    if (idx >= images.length) idx = 0;
    quickLook.dataset.galleryIndex = idx;
    const img = document.getElementById("quick-look-image");
    if (img) img.src = images[idx] || "";
    const counter = quickLook.querySelector('[style*="bottom"]');
    if (counter) counter.textContent = `${idx + 1} / ${images.length}`;
  },
  hideQuickLook() {
    const quickLook = document.getElementById("property-quick-look");
    if (quickLook) {
      quickLook.classList.add("hidden");
      quickLook.classList.remove("evidence-lightbox", "quick-look--pdf");
    }
    if (this._quickLookKeyHandler) {
      document.removeEventListener("keydown", this._quickLookKeyHandler);
      this._quickLookKeyHandler = null;
    }
  },

  /**
   * Show evidence image in a lightweight lightbox (20% black overlay)
   */
  showEvidenceLightbox(src, alt) {
    const quickLook = document.getElementById("property-quick-look");
    if (!quickLook) return;
    quickLook.classList.add("evidence-lightbox");
    this.showQuickLook({ type: "image", src, title: alt || "" });
  },
};
