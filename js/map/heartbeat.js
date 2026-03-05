
export const methods = {
startHeartbeat() {
  if (this.reducedMotion || !this.initialized || !this.map) return;
  this._heartbeat.active = true;
  this._resetIdleTimer();

  // Listen for user interaction to pause drift
  if (!this._heartbeat._boundReset) {
    this._heartbeat._boundReset = () => this._resetIdleTimer();
    this.map.on("mousedown", this._heartbeat._boundReset);
    this.map.on("touchstart", this._heartbeat._boundReset);
    this.map.on("wheel", this._heartbeat._boundReset);
  }
},

stopHeartbeat() {
  this._heartbeat.active = false;
  this._stopDrift();
  this.clearMarkerPulse();
  clearTimeout(this._heartbeat.idleTimeout);
  this._heartbeat.idleTimeout = null;
},

pauseHeartbeat() {
  this._stopDrift();
  clearTimeout(this._heartbeat.idleTimeout);
  this._heartbeat.idleTimeout = null;
},

_resetIdleTimer() {
  if (!this._heartbeat.active) return;
  this._stopDrift();
  clearTimeout(this._heartbeat.idleTimeout);
  this._heartbeat.idleTimeout = setTimeout(() => {
    this._startDrift();
  }, this._heartbeat.idleThreshold);
},

_startDrift() {
  if (!this._heartbeat.active || !this.map || this._heartbeat.driftInterval)
    return;
  this._heartbeat.driftInterval = setInterval(() => {
    if (!this.map) return;
    const current = this.map.getBearing();
    this.map.setBearing(current + this._heartbeat.bearingPerTick);
  }, this._heartbeat.tickMs);
},

_stopDrift() {
  if (this._heartbeat.driftInterval) {
    clearInterval(this._heartbeat.driftInterval);
    this._heartbeat.driftInterval = null;
  }
},

setActiveMarkerPulse(groupName) {
  if (this.reducedMotion) return;
  this.clearMarkerPulse();
  const ids = this._layerGroups[groupName] || [];
  ids.forEach((id) => {
    const marker = this.markers[id];
    if (marker) {
      const el = marker.getElement();
      if (el) {
        el.classList.add("marker-pulse");
        this._heartbeat.pulsingMarkers.push(el);
      }
    }
  });
},

clearMarkerPulse() {
  this._heartbeat.pulsingMarkers.forEach((el) => {
    el.classList.remove("marker-pulse");
  });
  this._heartbeat.pulsingMarkers = [];
},

_startLineGrow(sourceId, fullCoords, duration, delay) {
  const self = this;
  const startTime = performance.now() + (delay || 0);

  const animate = (now) => {
    if (!self.map || !self.map.getSource(sourceId)) return;
    const elapsed = now - startTime;
    if (elapsed < 0) {
      self._lineGrowAnimations[sourceId] = requestAnimationFrame(animate);
      return;
    }
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const partial = self._subPath(fullCoords, eased);

    try {
      self.map.getSource(sourceId).setData({
        type: "Feature",
        geometry: { type: "LineString", coordinates: partial },
      });
    } catch (e) {
      return;
    }

    if (progress < 1) {
      self._lineGrowAnimations[sourceId] = requestAnimationFrame(animate);
    } else {
      delete self._lineGrowAnimations[sourceId];
    }
  };
  this._lineGrowAnimations[sourceId] = requestAnimationFrame(animate);
},

_stopLineGrow(sourceId) {
  if (this._lineGrowAnimations[sourceId]) {
    cancelAnimationFrame(this._lineGrowAnimations[sourceId]);
    delete this._lineGrowAnimations[sourceId];
  }
},

_startRouteAnimation() {
  if (this._animationFrame || this.reducedMotion) return;

  const animate = () => {
    this._animationOffset = (this._animationOffset + 1) % 100;

    // Update all active animated layers
    Object.entries(this._animatedLayers).forEach(
      ([layerName, layerState]) => {
        if (!layerState.active) return;

        layerState.routes.forEach((route) => {
          if (!route._layerIds) return;

          const speed = route._speed || 100;
          const spacing = route._dotSpacing || 30;

          // Calculate animated offset
          const dashOffset =
            ((this._animationOffset * speed) / 100) % spacing;
          const dashPhase = dashOffset / spacing;

          // Update the dash array to create flowing dot effect
          const dotsLayerId = route._layerIds.dots;
          if (this.map.getLayer(dotsLayerId)) {
            this.map.setPaintProperty(dotsLayerId, "line-dasharray", [
              0,
              dashPhase * 4,
              0.5,
              (1 - dashPhase) * 4,
            ]);
          }
        });
      },
    );

    this._animationFrame = requestAnimationFrame(animate);
  };

  this._animationFrame = requestAnimationFrame(animate);
},

_stopRouteAnimation() {
  if (this._animationFrame) {
    cancelAnimationFrame(this._animationFrame);
    this._animationFrame = null;
  }
  this._animationOffset = 0;
},

};
