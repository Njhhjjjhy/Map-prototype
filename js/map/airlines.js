import { AppData } from "../data/index.js";
import { MAP_COLORS } from "./constants.js";

export const methods = {
  async showAirlineRoutes() {
    const routes = AppData.airlineRoutes;
    const origin = routes.origin.coords;
    const activeRoutes = routes.destinations.filter(
      (d) => d.status === "active",
    );
    const suspendedRoutes = routes.destinations.filter(
      (d) => d.status === "suspended",
    );

    this.hideAirlineRoutes();

    // 1. Origin marker (placed immediately, visible as camera arrives)
    const originHtml = `<div style="display: flex; align-items: center; gap: var(--space-2); white-space: nowrap;">
          <div style="width: 10px; height: 10px; background: ${MAP_COLORS.primary}; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); flex-shrink: 0;"></div>
          <span style="font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--color-text-primary); text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;">Kumamoto</span>
      </div>`;
    const { marker: originMarker } = this._createMarker(origin, originHtml, {
      className: "airport-origin-marker",
      anchor: "left",
    });
    this.airlineOriginMarker = originMarker;

    // 1b. TSMC HQ marker at Hsinchu, Taiwan (appears immediately with origin)
    const tsmcHqCoords = [24.8, 120.97];
    const tsmcHqHtml = `<div style="display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer;">
          <div style="width: 48px; height: 48px; background: #ffffff; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; overflow: hidden;">
              <img src="assets/tsmc-logo.svg" alt="TSMC" style="width: 36px; height: 36px; object-fit: contain;" />
          </div>
          <span style="font-family: var(--font-display); font-size: 11px; font-weight: 600; color: var(--color-text-primary); text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white; white-space: nowrap;">Hsinchu</span>
      </div>`;
    const { marker: tsmcHqMarker } = this._createMarker(
      tsmcHqCoords,
      tsmcHqHtml,
      {
        className: "tsmc-hq-marker",
        ariaLabel: "TSMC headquarters, Hsinchu, Taiwan",
      },
    );
    this.tsmcHqMarker = tsmcHqMarker;

    // Camera fly is handled by goToStep() - no redundant flyToStep here.
    // Routes draw immediately as camera is arriving.

    // 2. Draw active routes sequentially with staggered reveal
    for (let i = 0; i < activeRoutes.length; i++) {
      await this._delay(150);
      const dest = activeRoutes[i];
      this._addAnimatedArcLine(
        origin,
        dest.coords,
        dest.status,
        dest.semiconductorLink,
        i,
      );
    }

    // 3. Destination markers for active routes
    //    Skip TSMC destinations - the TSMC HQ logo marker already covers them.
    await this._delay(100);
    activeRoutes.forEach((dest) => {
      if (dest.semiconductorLink?.company === "TSMC") return;
      const marker = dest.semiconductorLink
        ? this._createBrandedDestinationMarker(dest)
        : this._createDestinationMarker(dest);
      this.airlineDestinationMarkers.push(marker);
    });

    // 4. Suspended routes last, dimmer
    if (suspendedRoutes.length > 0) {
      await this._delay(200);
      for (let i = 0; i < suspendedRoutes.length; i++) {
        const dest = suspendedRoutes[i];
        const idx = activeRoutes.length + i;
        this._addArcLine(
          origin,
          dest.coords,
          dest.status,
          dest.semiconductorLink,
          idx,
        );
        const marker = this._createDestinationMarker(dest);
        this.airlineDestinationMarkers.push(marker);
      }
    }
  },

  _addArcLine(origin, destination, status, semiLink, index) {
    const midLat = (origin[0] + destination[0]) / 2;
    const midLng = (origin[1] + destination[1]) / 2;

    // Calculate arc height
    const dLat = destination[0] - origin[0];
    const dLng = destination[1] - origin[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    const arcHeight = Math.max(0.3, Math.min(2.0, distance * 0.15));

    const arcMid = [midLat + arcHeight, midLng];
    const points = this.generateBezierPoints(origin, arcMid, destination, 50);

    let routeColor = "#c0766e";
    let weight = 1.5;
    if (semiLink) {
      const brandColors = { TSMC: "#c4001a", Samsung: "#1428a0" };
      routeColor = brandColors[semiLink.company] || routeColor;
      weight = 2.5;
    }
    const opacity = status === "suspended" ? 0.4 : 0.7;

    const sourceId = `airline-route-${index}`;
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: points },
      },
    });

    this.map.addLayer({
      id: `${sourceId}-line`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": routeColor,
        "line-width": weight,
        "line-opacity": opacity,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    this._layerGroups.airlineRoutes.push(`${sourceId}-line`, sourceId);
  },

  _addAnimatedArcLine(origin, destination, status, semiLink, index) {
    const midLat = (origin[0] + destination[0]) / 2;
    const midLng = (origin[1] + destination[1]) / 2;

    const dLat = destination[0] - origin[0];
    const dLng = destination[1] - origin[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    const arcHeight = Math.max(0.3, Math.min(2.0, distance * 0.15));

    const arcMid = [midLat + arcHeight, midLng];
    const allPoints = this.generateBezierPoints(
      origin,
      arcMid,
      destination,
      50,
    );

    let routeColor = "#c0766e";
    let weight = 1.5;
    if (semiLink) {
      const brandColors = { TSMC: "#c4001a", Samsung: "#1428a0" };
      routeColor = brandColors[semiLink.company] || routeColor;
      weight = 2.5;
    }
    const opacity = status === "suspended" ? 0.4 : 0.7;

    const sourceId = `airline-route-${index}`;

    // Start with just the first two points (origin)
    this._safeAddSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: allPoints.slice(0, 2) },
      },
    });

    this.map.addLayer({
      id: `${sourceId}-line`,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": routeColor,
        "line-width": weight,
        "line-opacity": opacity,
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });

    this._layerGroups.airlineRoutes.push(`${sourceId}-line`, sourceId);

    // Progressively extend the line to simulate drawing outward
    const totalSteps = 12;
    const stepInterval = 50; // ~600ms total
    let currentStep = 0;

    const drawNext = () => {
      currentStep++;
      if (currentStep > totalSteps) return;
      const src = this.map.getSource(sourceId);
      if (!src) return;

      const pointCount = Math.round(
        (currentStep / totalSteps) * allPoints.length,
      );
      const pts = allPoints.slice(0, Math.max(2, pointCount));
      src.setData({
        type: "Feature",
        geometry: { type: "LineString", coordinates: pts },
      });

      if (currentStep < totalSteps) {
        setTimeout(drawNext, stepInterval);
      }
    };
    setTimeout(drawNext, stepInterval);
  },

  _createDestinationMarker(destination) {
    const dotColor = "#c0766e";
    const cityName = destination.name.replace(
      / (International|Airport|Gimhae|Pudong|Taoyuan)$/i,
      "",
    );

    const html = `<div style="display: flex; align-items: center; gap: var(--space-1); white-space: nowrap; cursor: pointer;">
          <div style="width: 8px; height: 8px; background: ${dotColor}; border-radius: 50%; flex-shrink: 0;"></div>
          <span style="font-family: var(--font-display); font-size: 12px; font-weight: 500; color: var(--color-text-primary); text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white;">${cityName}</span>
      </div>`;

    const { marker, element } = this._createMarker(destination.coords, html, {
      className: "airport-destination-marker",
      anchor: "left",
    });
    element.addEventListener("click", () =>
      UI.showAirlineRoutePanel(destination),
    );
    return marker;
  },

  _createBrandedDestinationMarker(destination) {
    const link = destination.semiconductorLink;
    const brandColors = { TSMC: "#c4001a", Samsung: "#1428a0" };
    const brandLogos = { TSMC: "assets/tsmc-logo.svg" };
    const color = brandColors[link.company] || "#c0766e";
    const abbrev = link.company === "Samsung" ? "SS" : link.company;
    const cityName = destination.name.replace(
      / (International|Airport|Gimhae|Pudong|Taoyuan)$/i,
      "",
    );

    const logoSrc = brandLogos[link.company];
    const iconHtml = logoSrc
      ? `<div style="width: 36px; height: 36px; background: #ffffff; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
              <img src="${logoSrc}" alt="${link.company}" style="width: 26px; height: 26px; object-fit: contain;" />
          </div>`
      : `<div style="width: 28px; height: 28px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="font-family: var(--font-display); font-size: 8px; font-weight: 800; color: white; letter-spacing: 0.3px;">${abbrev}</span>
          </div>`;

    const html = `<div style="display: flex; align-items: center; gap: var(--space-2); white-space: nowrap; cursor: pointer;">
          ${iconHtml}
          <div style="display: flex; flex-direction: column;">
              <span style="font-family: var(--font-display); font-size: 13px; font-weight: 600; color: var(--color-text-primary); text-shadow: 0 0 4px white, 0 0 4px white, 0 0 4px white;">${cityName}</span>
              <span style="font-family: var(--font-display); font-size: 10px; font-weight: 500; color: ${color}; text-shadow: 0 0 3px white, 0 0 3px white;">${link.company} ${link.role}</span>
          </div>
      </div>`;

    const { marker, element } = this._createMarker(destination.coords, html, {
      className: "airport-destination-marker branded-destination",
      anchor: "left",
    });
    element.addEventListener("click", () =>
      UI.showAirlineRoutePanel(destination),
    );
    return marker;
  },

  hideAirlineRoutes() {
    // Remove line layers/sources
    this._layerGroups.airlineRoutes.forEach((id) => {
      this._safeRemoveLayer(id);
      this._safeRemoveSource(id);
    });
    this._layerGroups.airlineRoutes = [];

    // Remove TSMC HQ marker
    if (this.tsmcHqMarker) {
      const tsmcEl = this.tsmcHqMarker.getElement();
      this.tsmcHqMarker.remove();
      if (tsmcEl && tsmcEl.parentNode) {
        tsmcEl.remove();
      }
      this.tsmcHqMarker = null;
    }

    // Remove markers
    if (this.airlineOriginMarker) {
      const element = this.airlineOriginMarker.getElement();
      this.airlineOriginMarker.remove();
      if (element && element.parentNode) {
        element.remove();
      }
      this.airlineOriginMarker = null;
    }
    this.airlineDestinationMarkers.forEach((m) => {
      const element = m.getElement();
      m.remove();
      if (element && element.parentNode) {
        element.remove();
      }
    });
    this.airlineDestinationMarkers = [];
  },
};
