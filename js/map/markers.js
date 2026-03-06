import { AppData } from "../data/index.js";
import { MAP_COLORS } from "./constants.js";

export const methods = {
  _createMarker(coords, html, options = {}) {
    // Defensive check: ensure map exists before creating markers
    if (!this.map || !this.initialized) {
      console.warn(
        "MapController: Attempted to create marker before map initialized",
      );
      return { marker: null, element: null };
    }

    const el = document.createElement("div");
    el.className = options.className || "mapbox-marker-wrapper";
    el.innerHTML = html;

    // Apply entrance animation to inner element (not wrapper)
    // to avoid interfering with Mapbox's transform positioning
    if (options.entrance && el.firstElementChild) {
      el.firstElementChild.classList.add(`marker-${options.entrance}`);
    }

    // Keyboard accessibility
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    if (options.ariaLabel) {
      el.setAttribute("aria-label", options.ariaLabel);
    }
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });

    try {
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: options.anchor || "center",
        offset: options.offset || [0, 0],
      })
        .setLngLat(this._toMapbox(coords))
        .addTo(this.map);

      return { marker, element: el };
    } catch (error) {
      console.error("MapController: Failed to create marker:", error);
      // Clean up the orphaned element
      if (el.parentNode) el.remove();
      return { marker: null, element: null };
    }
  },

  _elevatedMarkerHtml(
    innerHtml,
    color,
    size = 36,
    extraStyles = {},
    shape = "circle",
  ) {
    const borderWidth = size > 32 ? 3 : 2;
    const extra = Object.entries(extraStyles)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
    return `<div class="custom-marker-hitarea marker-shape-${shape}" style="
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
      "><div class="elevated-marker" style="
          width: ${size}px; height: ${size}px;
          background: ${color};
          border: ${borderWidth}px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
          transition: transform var(--duration-fast) var(--easing-standard),
                      box-shadow var(--duration-fast) var(--easing-standard);
          ${extra}
      ">${innerHtml}</div></div>`;
  },

  _markerIconHtml(type, subtype = null, customColor = null) {
    const colors = {
      resource: MAP_COLORS.resource,
      company: MAP_COLORS.company,
      property: MAP_COLORS.property,
      zone: MAP_COLORS.zone,
    };

    const shapes = {
      resource: "circle",
      company: "square",
      property: "pin",
      zone: "diamond",
    };

    const icons = {
      property: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z"/></svg>`,
      company: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M22 22H2V10l7-3v3l7-3v3l6-3v15zM4 20h16v-8l-4 2v-2l-5 2v-2l-5 2v-2l-2 1v7z"/><rect x="6" y="14" width="3" height="3"/><rect x="11" y="14" width="3" height="3"/><rect x="16" y="14" width="3" height="3"/></svg>`,
      water: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 2c-5.33 8-8 12-8 15a8 8 0 1 0 16 0c0-3-2.67-7-8-15z"/></svg>`,
      power: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M13 2L4 14h7v8l9-12h-7V2z"/></svg>`,
      zone: `<svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M4 4h4V2H2v6h2V4zm16 0v4h2V2h-6v2h4zM4 20v-4H2v6h6v-2H4zm16 0h-4v2h6v-6h-2v4z"/><circle cx="12" cy="12" r="4"/></svg>`,
    };

    const icon = icons[subtype] || icons[type] || "";
    const color = customColor || colors[type] || MAP_COLORS.primary;
    const shape = shapes[type] || "circle";

    return this._elevatedMarkerHtml(icon, color, 36, {}, shape);
  },

  _brandedMarkerHtml(companyId) {
    const brands = {
      jasm: {
        text: "JASM",
        logo: "assets/Jasm-logo.svg",
        bg: "#ffffff",
        size: 56,
        imgSize: 44,
      },
      sony: {
        text: "Sony",
        logo: "assets/Sony-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      "tokyo-electron": {
        text: "Tokyo Electron",
        logo: "assets/Tokyo-electron-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      mitsubishi: {
        text: "Mitsubishi Electric",
        logo: "assets/Mitsubishi-electric-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      sumco: {
        text: "SUMCO",
        logo: "assets/Sumco-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      kyocera: {
        text: "Kyocera",
        logo: "assets/Kyocera-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
      "rohm-apollo": {
        text: "Rohm",
        logo: "assets/Rohm-logo.svg",
        bg: "#ffffff",
        size: 44,
        imgSize: 34,
      },
    };

    const brand = brands[companyId];
    if (!brand) return this._markerIconHtml("company");

    const innerHtml = `<img src="${brand.logo}" alt="${brand.text}" style="
          width: ${brand.imgSize}px;
          height: ${brand.imgSize}px;
          object-fit: contain;
      ">`;

    return this._elevatedMarkerHtml(
      innerHtml,
      brand.bg,
      brand.size,
      {},
      "square",
    );
  },

  _addTooltip(marker, element, text, offset = [0, -24]) {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: offset,
      className: "mapbox-tooltip",
    }).setText(text);

    element.addEventListener("mouseenter", () => {
      popup.setLngLat(marker.getLngLat()).addTo(this.map);
    });
    element.addEventListener("mouseleave", () => {
      popup.remove();
    });

    return popup;
  },

  _evidenceMarkerHtml(type, highlighted = false, groupIcon = null) {
    const contentColors = {
      zap: "#ff9500",
      route: "#5ac8fa",
      landmark: "#007aff",
      "graduation-cap": "#34c759",
    };
    const docColors = {
      pdf: MAP_COLORS.evidencePdf,
      image: MAP_COLORS.evidenceImage,
      web: MAP_COLORS.evidenceWeb,
    };
    const color =
      (groupIcon && contentColors[groupIcon]) ||
      docColors[type] ||
      MAP_COLORS.evidencePdf;

    const contentIcons = {
      zap: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
      route: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12"/></svg>`,
      landmark: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
      "graduation-cap": `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>`,
    };
    const docIcons = {
      pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      image: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
      web: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    };
    const iconSvg =
      (groupIcon && contentIcons[groupIcon]) ||
      docIcons[type] ||
      docIcons["pdf"];

    const highlightStyle = highlighted
      ? `box-shadow: 0 0 0 4px rgba(251, 185, 49, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3); transform: scale(1.2);`
      : `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);`;

    return `<div style="
          width: 28px; height: 28px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          ${highlightStyle}
          transition: box-shadow 0.15s ease, transform 0.15s ease;
      "><div style="width: 14px; height: 14px;">${iconSvg}</div></div>`;
  },

  _dataLayerMarkerHtml(layerName, color) {
    const icons = {
      trafficFlow: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
      railCommute: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 3 L4 7 L8 11"/><path d="M4 7 L20 7"/><rect x="6" y="11" width="12" height="10" rx="2"/><path d="M9 21v-2h6v2"/></svg>`,
      electricity: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      employment: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      infrastructure: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
      realEstate: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
      riskyArea: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
      baseMap: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    };
    const iconSvg = icons[layerName] || icons.baseMap;

    return `<div style="
          width: 36px; height: 36px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform var(--duration-fast) var(--easing-standard);
      "><div style="width: 18px; height: 18px;">${iconSvg}</div></div>`;
  },

  showPropertyMarkers() {
    // Group properties by zone for staggered cascade
    const zoneOrder = [];
    const zoneMap = {};
    AppData.properties.forEach((property) => {
      const zone = property.zone || "Other";
      if (!zoneMap[zone]) {
        zoneMap[zone] = [];
        zoneOrder.push(zone);
      }
      zoneMap[zone].push(property);
    });

    // Stagger: 300ms between zones, 100ms between items within a zone
    let baseDelay = 0;
    zoneOrder.forEach((zone) => {
      const properties = zoneMap[zone];
      properties.forEach((property, indexInZone) => {
        const delay = baseDelay + indexInZone * 100;
        setTimeout(() => {
          const html = this._markerIconHtml("property");
          const { marker, element } = this._createMarker(
            property.coords,
            html,
            {
              entrance: "emerge",
              ariaLabel: property.name,
            },
          );

          this._addTooltip(marker, element, property.name);

          element.addEventListener("mouseover", () =>
            this.preloadImages(property),
          );
          element.addEventListener("click", () => {
            UI.showPropertyReveal(property);
          });

          this.markers[property.id] = marker;
          this._layerGroups.properties.push(property.id);
        }, delay);
      });
      baseDelay += properties.length * 100 + 300;
    });
  },

  showSinglePropertyMarker(property) {
    // Use a larger marker (48px) so properties are clearly visible on the map
    const icon = `<svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z"/></svg>`;
    const html = this._elevatedMarkerHtml(
      icon,
      MAP_COLORS.property,
      48,
      {},
      "pin",
    );
    const { marker, element } = this._createMarker(property.coords, html);
    this._addTooltip(marker, element, property.name);

    // Click marker to select this property and show dashboard
    element.addEventListener("click", () => {
      if (typeof App !== "undefined") {
        App.selectProperty(property.id);
      }
    });

    this.markers[property.id] = marker;
    this._layerGroups.properties.push(property.id);
  },

  showSingleCompanyMarker(company) {
    const html = this._brandedMarkerHtml(company.id);
    const { marker, element } = this._createMarker(company.coords, html);
    this._addTooltip(marker, element, company.name);
    this.markers[company.id] = marker;
    this._layerGroups.companies.push(company.id);
  },

  showEvidenceGroupMarkers(group) {
    this.clearEvidenceMarkers();

    let evidenceIndex = 0;
    group.items.forEach((item) => {
      if (item.coords) {
        const html = this._evidenceMarkerHtml(item.type, false, group.icon);
        const delay = evidenceIndex * 60;
        evidenceIndex++;
        const { marker, element } = this._createMarker(item.coords, html, {
          className: "evidence-marker-wrapper",
          entrance: "emerge",
        });
        if (delay > 0) {
          element.style.animationDelay = `${delay}ms`;
        }

        element.addEventListener("click", () => {
          UI.selectDisclosureItem(group.id, item.id);
        });

        const id = `evidence-${group.id}-${item.id}`;
        this.markers[id] = marker;
        this._markerElements[id] = element;
        this._layerGroups.evidenceMarkers.push(id);
      }
    });
  },

  clearEvidenceMarkers() {
    this._layerGroups.evidenceMarkers.forEach((id) => {
      if (this.markers[id]) {
        this.markers[id].remove();
        delete this.markers[id];
      }
      delete this._markerElements[id];
    });
    this._layerGroups.evidenceMarkers = [];
    this.highlightedEvidenceMarker = null;
  },

  highlightEvidenceMarker(groupId, itemId) {
    const markerId = `evidence-${groupId}-${itemId}`;
    const marker = this.markers[markerId];

    if (marker) {
      this.clearEvidenceMarkerHighlight();

      const group = AppData.evidenceGroups[groupId];
      const item = group?.items.find((i) => i.id === itemId);
      const type = item?.type || "pdf";

      // Update marker HTML to highlighted state
      const element = this._markerElements[markerId];
      if (element) {
        element.innerHTML = this._evidenceMarkerHtml(type, true, group?.icon);
      }

      this.highlightedEvidenceMarker = { marker, groupId, itemId };

      // Pan to marker
      this.map.panTo(marker.getLngLat(), { duration: 500 });
    }
  },

  clearEvidenceMarkerHighlight() {
    if (this.highlightedEvidenceMarker) {
      const { groupId, itemId } = this.highlightedEvidenceMarker;
      const markerId = `evidence-${groupId}-${itemId}`;

      const group = AppData.evidenceGroups[groupId];
      const item = group?.items.find((i) => i.id === itemId);
      const type = item?.type || "pdf";

      const element = this._markerElements[markerId];
      if (element) {
        element.innerHTML = this._evidenceMarkerHtml(type, false, group?.icon);
      }

      this.highlightedEvidenceMarker = null;
    }
  },

  ensureLayerMarkers(layerName, opts = {}) {
    const group = this._layerGroups[layerName];
    const hasMarkers =
      group && group.length > 0 && group.some((id) => this.markers[id]);

    if (hasMarkers) {
      // Markers exist, just re-add them to the map
      this.showLayer(layerName);
      return;
    }

    // Create markers on demand with bounce entrance
    if (layerName === "sciencePark") {
      // Create science park circle and marker (skip circles in QA mode)
      this.showSciencePark({ skipCircles: opts.skipCircles });
      // Apply bounce entrance to any newly created markers in the group
      this._applyBounceToGroup("sciencePark");
    } else if (layerName === "companies") {
      // Create company markers with bounce instead of staggered ripple
      this._layerGroups.companies = [];
      AppData.companies.forEach((company, index) => {
        const html = this._brandedMarkerHtml(company.id);
        const { marker, element } = this._createMarker(company.coords, html, {
          entrance: "data-bounce",
          ariaLabel: company.name,
        });
        if (!marker || !element) return;

        // Stagger bounce entrance
        if (element.firstElementChild) {
          element.firstElementChild.style.animationDelay = `${index * 60}ms`;
        }

        const tooltipText =
          (company.stats && company.stats[0] && company.stats[0].value) ||
          company.name;
        this._addTooltip(marker, element, tooltipText);
        element.addEventListener("click", () =>
          UI.showCompanyDetailPanel(company),
        );

        this.markers[company.id] = marker;
        this._layerGroups.companies.push(company.id);
      });
    } else if (layerName === "resources" || layerName === "waterResources") {
      // Create water resource layer with bounce
      this.showWaterResourceLayer();
    } else if (layerName === "properties") {
      // Properties are managed by journey steps; just show existing
      this.showLayer(layerName);
      return;
    } else {
      // Unknown map layer, try showing existing
      this.showLayer(layerName);
      return;
    }

    // Fit bounds around the layer's markers (skip in Q&A mode)
    if (!opts.skipFitBounds) {
      this._fitBoundsForLayer(layerName);
    }
  },

  _applyBounceToGroup(layerName) {
    const group = this._layerGroups[layerName];
    if (!group) return;
    group.forEach((id, index) => {
      const marker = this.markers[id];
      if (!marker) return;
      const el = marker.getElement();
      if (el && el.firstElementChild) {
        el.firstElementChild.classList.add("marker-data-bounce");
        el.firstElementChild.style.animationDelay = `${index * 60}ms`;
      }
    });
  },
};
