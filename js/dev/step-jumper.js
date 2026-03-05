/* ================================
   Step Jumper (dev only)
   Maps the 13 presentation steps to internal code calls.
   Does NOT modify any existing code or the STEPS array.
   ================================ */

import { STEPS } from "../data/index.js";
import { TIMING, App } from "../app.js";
import { MapController } from "../map/index.js";
import { UI } from "../ui/index.js";

const StepJumper = {
  active: false,

  /**
   * The 13 presentation steps mapped to internal code calls.
   * codeStep: which goToStep() index to call (null = special handling)
   * subItem: sub-item to auto-select after goToStep (optional)
   * implemented: false if the step has no code equivalent yet
   */
  steps: [
    {
      num: 0,
      name: "Entry into map",
      codeStep: null,
      subItem: null,
      implemented: true,
    },
    {
      num: 1,
      name: "Water resources",
      codeStep: 1,
      subItem: "water",
      implemented: true,
    },
    {
      num: 2,
      name: "Power resources",
      codeStep: 1,
      subItem: "power",
      implemented: true,
    },
    {
      num: 3,
      name: "Strategic location",
      codeStep: 2,
      subItem: null,
      implemented: true,
    },
    {
      num: 4,
      name: "Government support",
      codeStep: 3,
      subItem: null,
      implemented: true,
    },
    {
      num: 5,
      name: "Corporate investment",
      codeStep: 4,
      subItem: null,
      implemented: true,
    },
    {
      num: 6,
      name: "Science park and grand airport",
      codeStep: 5,
      subItem: null,
      implemented: true,
    },
    {
      num: 7,
      name: "Clusters around science park",
      codeStep: null,
      subItem: null,
      implemented: false,
    },
    {
      num: 8,
      name: "Education and talent pipeline",
      codeStep: 6,
      subItem: null,
      implemented: true,
    },
    {
      num: 9,
      name: "Future outlook",
      codeStep: 7,
      subItem: null,
      implemented: true,
    },
    {
      num: 10,
      name: "Investment opportunity zones",
      codeStep: 8,
      subItem: null,
      implemented: true,
    },
    {
      num: 11,
      name: "Investment properties",
      codeStep: 9,
      subItem: null,
      implemented: true,
    },
    {
      num: 12,
      name: "Q&A mode",
      codeStep: 10,
      subItem: null,
      implemented: true,
    },
  ],

  init() {
    const toggle = document.getElementById("step-jumper-toggle");
    const panel = document.getElementById("step-jumper");
    if (!toggle || !panel) return;

    // Populate the list
    const list = panel.querySelector(".step-jumper-list");
    this.steps.forEach((s) => {
      const btn = document.createElement("button");
      btn.className =
        "step-jumper-item" + (s.implemented ? "" : " not-implemented");
      btn.innerHTML = `<span class="step-jumper-num">${s.num}</span><span class="step-jumper-name">${s.name}</span>`;
      btn.addEventListener("click", () => this._jumpTo(s));
      list.appendChild(btn);
    });

    // Toggle panel visibility
    toggle.addEventListener("click", () => {
      this.active = !this.active;
      panel.classList.toggle("hidden", !this.active);
      toggle.classList.toggle("active", this.active);
      if (this.active) this._highlightCurrent();
    });
  },

  /**
   * Jump to a presentation step by calling the correct internal functions.
   */
  async _jumpTo(step) {
    if (!step.implemented) return;
    if (App._transitioning) return;

    // Step 0: return to welcome/entry state
    if (step.num === 0) {
      App._transitioning = true;
      const current = App.state.currentStep;
      if (current > 0) {
        await App._exitStep(current);
      }
      App.state.currentStep = 0;
      App.state.subItemsExplored = [];
      App.state.expandedGroups = [];
      App.state.activeProperty = null;
      UI.updateJourneyProgress(0, STEPS.length);
      UI.showChatbox(`
        <h3>Kumamoto investment guide</h3>
        <p>Explore the map and use the data layers to learn about investment opportunities in Kumamoto's semiconductor corridor.</p>
        <button class="chatbox-continue primary" onclick="App.goToStep(1)">Start Journey <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
      `);
      MapController.startHeartbeat();
      this._highlightCurrent();
      App._transitioning = false;
      return;
    }

    // All other steps: call goToStep then optionally select sub-item
    await App.goToStep(step.codeStep);

    if (step.subItem) {
      App.selectSubItem(step.subItem);
    }

    this._highlightCurrent();
  },

  /**
   * Highlight the currently active step in the list.
   */
  _highlightCurrent() {
    const items = document.querySelectorAll(".step-jumper-item");
    const currentCodeStep = App.state.currentStep;

    items.forEach((item, i) => {
      const s = this.steps[i];
      let isActive = false;

      if (currentCodeStep === 0 && s.num === 0) {
        isActive = true;
      } else if (s.codeStep === currentCodeStep && s.codeStep !== null) {
        // For steps 1 & 2 (both map to codeStep 1), check sub-item
        if (s.codeStep === 1) {
          if (
            s.subItem === "water" &&
            App.state.subItemsExplored.includes("water") &&
            !App.state.subItemsExplored.includes("power")
          ) {
            isActive = true;
          } else if (
            s.subItem === "power" &&
            App.state.subItemsExplored.includes("power")
          ) {
            isActive = true;
          } else if (
            s.subItem === "water" &&
            App.state.subItemsExplored.length === 0
          ) {
            // Just entered step 1, water not yet selected - highlight water as starting point
            isActive = s.num === 1;
          }
        } else {
          isActive = true;
        }
      }

      item.classList.toggle("active", isActive);
    });
  },
};

export { StepJumper };
