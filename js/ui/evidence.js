import { AppData } from "../data/index.js";
import { MapController } from "../map/index.js";

export const methods = {
  showEvidencePreview(groupId, itemId) {
    const group = this.findEvidenceGroup(groupId);
    const item = group?.items.find((i) => i.id === itemId);
    if (!item) return;

    // Determine the image source (handle both `image` and `images` fields)
    const imageSrc = item.image || (item.images && item.images[0]) || null;

    let bodyHtml;
    if (imageSrc) {
      bodyHtml = `<img src="${imageSrc}" alt="${item.title}">`;
    } else {
      // Placeholder state for items without images
      bodyHtml = `
                <div class="evidence-preview-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <h3>${item.title}</h3>
                    <p>No preview available</p>
                </div>
            `;
    }

    this.elements.evidencePreviewBody.innerHTML = bodyHtml;
    this.elements.evidencePreview.classList.remove("hidden");

    // Focus management
    this.lastFocusedElement = document.activeElement;
    this.elements.evidencePreviewClose.focus();
  },

  /**
   * Hide the evidence preview overlay
   */
  hideEvidencePreview() {
    this.elements.evidencePreview.classList.add("hidden");
    this.elements.evidencePreviewBody.innerHTML = "";

    // Return focus to trigger element
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  },

  /**
   * Show property image in Quick Look modal (macOS pattern)
   * @param {string} imageUrl - URL of the image to display
   * @param {string} title - Title/alt text for the image
   */
  showEvidence(id, type) {
    let evidence;

    if (type === "resource") {
      evidence = AppData.resources[id]?.evidence;
    } else if (type === "sciencePark") {
      evidence = AppData.sciencePark.evidence;
    } else if (type === "company") {
      const company = AppData.companies.find((c) => c.id === id);
      evidence = company?.evidence;
    } else if (type === "zone") {
      const zone = AppData.futureZones.find((z) => z.id === id);
      evidence = zone?.evidence;
    } else if (type === "rental") {
      const property = AppData.properties.find((p) => p.id === id);
      evidence = property?.rentalReport;
    }

    if (evidence) {
      const img =
        evidence.image || (evidence.images && evidence.images[0]) || null;
      this.showGallery(
        evidence.title,
        evidence.type,
        evidence.description,
        img,
      );
    }
  },

  // ================================
  // DISCLOSURE GROUPS (macOS NSOutlineView pattern)
  // ================================

  /**
   * Generate disclosure group HTML
   * @param {Object} group - Evidence group data
   * @returns {string} HTML string
   */
  generateDisclosureGroup(group) {
    const isExpanded = this.disclosureState[group.id] || false;
    const itemCount = group.items.length;

    const itemsHtml = group.items
      .map(
        (item) => `
            <button class="disclosure-item"
                    data-group-id="${group.id}"
                    data-item-id="${item.id}"
                    onclick="UI.selectDisclosureItem('${group.id}', '${item.id}')">
                <span class="disclosure-item-icon" aria-hidden="true">
                    ${this.getDocTypeIcon(item.type)}
                </span>
                <span class="disclosure-item-title">${item.title}</span>
                <span class="disclosure-item-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </span>
            </button>
        `,
      )
      .join("");

    return `
            <div class="disclosure-group ${isExpanded ? "expanded" : ""}"
                 data-group-id="${group.id}">
                <button class="disclosure-header"
                        aria-expanded="${isExpanded}"
                        aria-controls="disclosure-content-${group.id}"
                        id="disclosure-header-${group.id}"
                        onclick="UI.toggleDisclosureGroup('${group.id}')">
                    <span class="disclosure-triangle" aria-hidden="true">
                        <svg class="triangle-collapsed" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 4l6 4-6 4V4z"/>
                        </svg>
                        <svg class="triangle-expanded" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4 6l4 6 4-6H4z"/>
                        </svg>
                    </span>
                    <span class="disclosure-icon" aria-hidden="true">
                        ${this.getLucideIcon(group.icon)}
                    </span>
                    <span class="disclosure-title">${group.title}</span>
                    <span class="disclosure-badge">${itemCount} item${itemCount !== 1 ? "s" : ""}</span>
                </button>
                <div class="disclosure-content"
                     id="disclosure-content-${group.id}"
                     role="region"
                     aria-labelledby="disclosure-header-${group.id}">
                    ${itemsHtml}
                </div>
            </div>
        `;
  },

  /**
   * Toggle disclosure group expanded state
   * @param {string} groupId - ID of the group to toggle
   */
  toggleDisclosureGroup(groupId) {
    this.disclosureState[groupId] = !this.disclosureState[groupId];

    const groupEl = document.querySelector(`[data-group-id="${groupId}"]`);
    if (groupEl) {
      const headerBtn = groupEl.querySelector(".disclosure-header");
      const isExpanded = this.disclosureState[groupId];

      groupEl.classList.toggle("expanded", isExpanded);
      headerBtn.setAttribute("aria-expanded", isExpanded.toString());
    }
  },

  /**
   * Select a sub-item and show its detail view
   * @param {string} groupId - Parent group ID
   * @param {string} itemId - Sub-item ID
   */
  selectDisclosureItem(groupId, itemId) {
    // Store current state for back navigation
    this.currentEvidenceGroup = groupId;
    this.currentEvidenceItem = itemId;

    // Find the item data
    const group = this.findEvidenceGroup(groupId);
    const item = group?.items.find((i) => i.id === itemId);

    if (!item) return;

    // Highlight corresponding marker if it has distinct coords
    if (item.coords) {
      MapController.highlightEvidenceMarker(groupId, itemId);
    }

    // Open evidence preview overlay
    this.showEvidencePreview(groupId, itemId);
  },

  /**
   * Show detail view for a sub-item
   * @param {Object} group - Parent group
   * @param {Object} item - Sub-item data
   */
  showDisclosureItemDetail(group, item) {
    const statsHtml = item.stats
      ? item.stats
          .map(
            (stat) => `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `,
          )
          .join("")
      : "";

    const content = `
            <div class="disclosure-detail-header">
                <button class="disclosure-back-btn" onclick="UI.backToDisclosureList('${group.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    ${group.title}
                </button>
            </div>
            <h2>${item.title}</h2>
            <p>${item.description}</p>
            ${statsHtml ? `<div class="stat-grid">${statsHtml}</div>` : ""}
            <button class="panel-btn primary" onclick="UI.showGallery('${item.title}', '${item.type}', '${item.description.replace(/'/g, "\\'")}', ${item.image ? "'" + item.image + "'" : "null"})">
                View ${this.getTypeLabel(item.type)}
            </button>
        `;

    this.showPanel(content);
  },

  /**
   * Navigate back to disclosure list with group still expanded
   * @param {string} groupId - Group to keep expanded
   */
  backToDisclosureList(groupId) {
    // Ensure the group stays expanded
    this.disclosureState[groupId] = true;

    // Clear marker highlight
    MapController.clearEvidenceMarkerHighlight();

    // Show the evidence list panel
    this.showEvidenceListPanel(groupId);
  },

  /**
   * Show panel with evidence list containing disclosure groups
   * @param {string} expandedGroupId - Optional group to ensure is expanded
   */
  showEvidenceListPanel(expandedGroupId = null) {
    // Ensure specified group is expanded
    if (expandedGroupId) {
      this.disclosureState[expandedGroupId] = true;
    }

    // Generate HTML for all evidence groups
    const groups = Object.values(AppData.evidenceGroups);
    const groupsHtml = groups
      .map((group) => this.generateDisclosureGroup(group))
      .join("");

    const content = `
            <div class="subtitle">Evidence library</div>
            <h2>Supporting documents</h2>
            <p>Explore detailed evidence and documentation for each category.</p>
            ${groupsHtml}
        `;

    this.showPanel(content);
  },

  /**
   * Find evidence group by ID across all data sources
   * @param {string} groupId - Group ID to find
   * @returns {Object|null} Group data or null
   */
  findEvidenceGroup(groupId) {
    // Check evidenceGroups at top level of AppData
    if (AppData.evidenceGroups && AppData.evidenceGroups[groupId]) {
      return AppData.evidenceGroups[groupId];
    }

    return null;
  },
};
