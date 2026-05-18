const state = {
  elements: {},
  currentScenario: "average",
  currentProperty: null,
  charts: {},

  // Disclosure group state
  disclosureState: {},
  currentEvidenceGroup: null,
  currentEvidenceItem: null,

  // Navigation history for back button support
  panelHistory: [],
  currentPanelView: null,
  currentPanelViewFunction: null,

  // Data layer state
  activeDataLayers: {},
  _dataLayerDashboardActive: false,
  _currentStepForLayers: null,
  _qaActiveTab: null,

  // Dashboard state
  dashboardMode: false,
  dashboardPanelOpen: false,

  // Panel state
  panelOpen: false,
  panelScrollPosition: 0,
  _onPanelClose: null,
  _drillDown: null,

  // Layers panel
  layersPanelOpen: false,


  // Inspector state
  inspectorStage: null,
  inspectorTab: null,
  inspectorTitle: null,
  inspectorView: null,

  // Transition overlay state
  _activeTransitionImg: null,
  _drillDownImages: null,
  _drillDownImageIndex: 0,
  _propertyTransitioning: false,
  cancelDrillDown: false,
  _crossPropertyTransition: false,
  _goToNextProperty: null,
  _goToPrevProperty: null,

  // Quick look state
  _quickLookKeyHandler: null,

  // Focus trap
  focusTrapHandler: null,
  lastFocusedElement: null,

  // Value-add tour iframe state
  valueAddTourIframe: null,
  valueAddTourListener: null,
  valueAddTourPrevOverflow: "",
  valueAddTourTrigger: null,
  valueAddTourOnAfterClose: null,
};

export { state };
