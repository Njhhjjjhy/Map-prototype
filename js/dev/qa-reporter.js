// ============================================================
// QA Reporter - dev tool for logging and exporting QA issues
// ============================================================

import { App } from "../app.js";

const QAReporter = {
  active: false,
  issues: [],
  editingId: null,
  selectedCategory: null,

  STORAGE_KEY: "qa-reporter-issues",

  CATEGORIES: [
    { id: "markers", label: "Markers/icons", color: "#007aff" },
    { id: "chatbox", label: "Chatbox", color: "#ff9500" },
    { id: "panel", label: "Right panel", color: "#34c759" },
    { id: "dashboard", label: "Dashboard", color: "#af52de" },
    { id: "animation", label: "Animation", color: "#ff3b30" },
    { id: "other", label: "Other", color: "#6e7073" },
  ],

  init() {
    this.toggle = document.getElementById("qa-toggle");
    this.panel = document.getElementById("qa-panel");
    this.countBadge = document.getElementById("qa-count");
    this.stepIndicator = document.getElementById("qa-step-indicator");
    this.categoriesEl = document.getElementById("qa-categories");
    this.descriptionEl = document.getElementById("qa-description");
    this.addBtn = document.getElementById("qa-add");
    this.copyBtn = document.getElementById("qa-copy");
    this.issuesList = document.getElementById("qa-issues");

    if (!this.toggle || !this.panel) return;

    this._loadFromStorage();
    this._renderCategories();
    this._render();

    // Toggle panel
    this.toggle.addEventListener("click", () => {
      this.active = !this.active;
      this.panel.classList.toggle("hidden", !this.active);
      this.toggle.classList.toggle("active", this.active);
      if (this.active) this._updateStepIndicator();
    });

    // Add issue
    this.addBtn.addEventListener("click", () => this._addIssue());

    // Copy unsolved
    this.copyBtn.addEventListener("click", () => this._copyUnsolved());

    // Enable/disable add button based on form state
    this.descriptionEl.addEventListener("input", () => this._updateAddBtn());

    // Update step indicator when step changes (poll on panel open)
    this._stepPollInterval = null;
    const startPoll = () => {
      if (this._stepPollInterval) return;
      this._stepPollInterval = setInterval(() => {
        if (this.active) this._updateStepIndicator();
      }, 1000);
    };
    const stopPoll = () => {
      if (this._stepPollInterval) {
        clearInterval(this._stepPollInterval);
        this._stepPollInterval = null;
      }
    };

    // Start/stop polling when panel opens/closes
    const observer = new MutationObserver(() => {
      if (this.active) startPoll();
      else stopPoll();
    });
    observer.observe(this.panel, {
      attributes: true,
      attributeFilter: ["class"],
    });
  },

  _loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) this.issues = JSON.parse(stored);
    } catch (e) {
      this.issues = [];
    }
  },

  _saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.issues));
    } catch (e) {
      // Storage full or unavailable
    }
  },

  _getCurrentStepLabel() {
    if (!App || !App.state) return "Unknown";
    const step = App.state.currentStep;
    if (step === 0) return "0: Entry into map";

    // Use StepJumper steps if available
    if (window.StepJumper && window.StepJumper.steps) {
      const match = window.StepJumper.steps.find((s) => s.codeStep === step);
      if (match) return match.num + ": " + match.name;
    }

    return "Step " + step;
  },

  _updateStepIndicator() {
    if (this.stepIndicator) {
      this.stepIndicator.textContent = "Step: " + this._getCurrentStepLabel();
    }
  },

  _renderCategories() {
    if (!this.categoriesEl) return;
    this.categoriesEl.innerHTML = "";
    this.CATEGORIES.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "qa-cat-btn";
      btn.textContent = cat.label;
      btn.dataset.catId = cat.id;
      btn.addEventListener("click", () => {
        // Deselect all, select this one
        this.categoriesEl.querySelectorAll(".qa-cat-btn").forEach((b) => {
          b.classList.remove("selected");
          b.style.background = "";
          b.style.borderColor = "";
        });
        if (this.selectedCategory === cat.id) {
          this.selectedCategory = null;
        } else {
          this.selectedCategory = cat.id;
          btn.classList.add("selected");
          btn.style.background = cat.color;
          btn.style.borderColor = "transparent";
        }
        this._updateAddBtn();
      });
      this.categoriesEl.appendChild(btn);
    });
  },

  _updateAddBtn() {
    const hasCategory = !!this.selectedCategory;
    const hasText =
      this.descriptionEl && this.descriptionEl.value.trim().length > 0;
    if (this.addBtn) this.addBtn.disabled = !(hasCategory && hasText);
  },

  _addIssue() {
    if (!this.selectedCategory || !this.descriptionEl.value.trim()) return;

    const cat = this.CATEGORIES.find((c) => c.id === this.selectedCategory);
    const issue = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      step: App ? App.state.currentStep : 0,
      stepLabel: this._getCurrentStepLabel(),
      category: this.selectedCategory,
      categoryLabel: cat ? cat.label : this.selectedCategory,
      description: this.descriptionEl.value.trim(),
      solved: false,
      timestamp: Date.now(),
    };

    this.issues.unshift(issue);
    this._saveToStorage();
    this._render();

    // Reset form
    this.descriptionEl.value = "";
    this.selectedCategory = null;
    this.categoriesEl.querySelectorAll(".qa-cat-btn").forEach((b) => {
      b.classList.remove("selected");
      b.style.background = "";
      b.style.borderColor = "";
    });
    this._updateAddBtn();
  },

  _toggleSolved(id) {
    const issue = this.issues.find((i) => i.id === id);
    if (issue) {
      issue.solved = !issue.solved;
      this._saveToStorage();
      this._render();
    }
  },

  _deleteIssue(id) {
    this.issues = this.issues.filter((i) => i.id !== id);
    this._saveToStorage();
    this._render();
  },

  _startEdit(id) {
    this.editingId = id;
    this._render();
  },

  _saveEdit(id, newText) {
    const issue = this.issues.find((i) => i.id === id);
    if (issue && newText.trim()) {
      issue.description = newText.trim();
      this._saveToStorage();
    }
    this.editingId = null;
    this._render();
  },

  _copyUnsolved() {
    const unsolved = this.issues.filter((i) => !i.solved);
    if (unsolved.length === 0) {
      this._flashCopyBtn("empty");
      return;
    }

    // Group by step
    const grouped = {};
    unsolved.forEach((issue) => {
      const key = issue.stepLabel || "Step " + issue.step;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(issue);
    });

    let text = "## QA issues\n\n";
    Object.keys(grouped).forEach((stepLabel) => {
      text += "### " + stepLabel + "\n";
      grouped[stepLabel].forEach((issue) => {
        text += "- [" + issue.categoryLabel + "] " + issue.description + "\n";
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text.trim()).then(() => {
      this._flashCopyBtn("copied");
    });
  },

  _flashCopyBtn(state) {
    if (!this.copyBtn) return;
    this.copyBtn.classList.add(state);
    setTimeout(() => this.copyBtn.classList.remove(state), 1200);
  },

  _render() {
    // Update count badge
    const unsolvedCount = this.issues.filter((i) => !i.solved).length;
    if (this.countBadge) {
      this.countBadge.textContent = unsolvedCount;
      this.countBadge.classList.toggle("has-issues", unsolvedCount > 0);
    }

    // Render issue list
    if (!this.issuesList) return;
    this.issuesList.innerHTML = "";

    if (this.issues.length === 0) {
      const empty = document.createElement("div");
      empty.className = "qa-empty";
      empty.textContent = "No issues logged yet.";
      this.issuesList.appendChild(empty);
      return;
    }

    this.issues.forEach((issue) => {
      const cat = this.CATEGORIES.find((c) => c.id === issue.category);
      const catColor = cat ? cat.color : "#6e7073";

      const el = document.createElement("div");
      el.className = "qa-issue" + (issue.solved ? " solved" : "");

      // Top row: step + category + actions
      const top = document.createElement("div");
      top.className = "qa-issue-top";

      const stepSpan = document.createElement("span");
      stepSpan.className = "qa-issue-step";
      stepSpan.textContent = issue.stepLabel;

      const catSpan = document.createElement("span");
      catSpan.className = "qa-issue-cat";
      catSpan.textContent = issue.categoryLabel;
      catSpan.style.background = catColor;

      const actions = document.createElement("div");
      actions.className = "qa-issue-actions";

      // Solve button
      const solveBtn = document.createElement("button");
      solveBtn.className =
        "qa-issue-action solve" + (issue.solved ? " is-solved" : "");
      solveBtn.title = issue.solved ? "Mark unsolved" : "Mark solved";
      solveBtn.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      solveBtn.addEventListener("click", () => this._toggleSolved(issue.id));

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "qa-issue-action edit";
      editBtn.title = "Edit";
      editBtn.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>';
      editBtn.addEventListener("click", () => this._startEdit(issue.id));

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "qa-issue-action delete";
      deleteBtn.title = "Delete";
      deleteBtn.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
      deleteBtn.addEventListener("click", () => this._deleteIssue(issue.id));

      actions.appendChild(solveBtn);
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      top.appendChild(stepSpan);
      top.appendChild(catSpan);
      top.appendChild(actions);
      el.appendChild(top);

      // Description or edit textarea
      if (this.editingId === issue.id) {
        const textarea = document.createElement("textarea");
        textarea.className = "qa-issue-edit-textarea";
        textarea.value = issue.description;
        textarea.rows = 2;
        textarea.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this._saveEdit(issue.id, textarea.value);
          }
          if (e.key === "Escape") {
            this.editingId = null;
            this._render();
          }
        });
        textarea.addEventListener("blur", () => {
          // Small delay to allow button clicks to register
          setTimeout(() => {
            if (this.editingId === issue.id) {
              this._saveEdit(issue.id, textarea.value);
            }
          }, 150);
        });
        el.appendChild(textarea);
        // Focus textarea after render
        requestAnimationFrame(() => textarea.focus());
      } else {
        const desc = document.createElement("div");
        desc.className = "qa-issue-desc";
        desc.textContent = issue.description;
        el.appendChild(desc);
      }

      this.issuesList.appendChild(el);
    });
  },
};

export { QAReporter };
