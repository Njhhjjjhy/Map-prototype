import { TIMING } from "../app.js";
import { AppData } from "../data/index.js";

export const methods = {
  initAIChat() {
    const form = document.getElementById("ai-chat-form");
    const input = document.getElementById("ai-chat-input");
    const suggestions = document.getElementById("ai-chat-suggestions");

    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (message) {
        this.sendAIMessage(message);
        input.value = "";
      }
    });

    // Handle suggestion chip clicks
    suggestions.addEventListener("click", (e) => {
      const chip = e.target.closest(".ai-chat-chip");
      if (chip) {
        const question = chip.dataset.question;
        this.sendAIMessage(question);
      }
    });
  },

  /**
   * Re-trigger CSS animation on an element by forcing reflow
   */
  showAIChat() {
    // Hide the step chatbox (without showing FAB)
    this.elements.chatbox.classList.add("hidden");

    // Hide FAB since we're showing AI chat
    this.hideChatFab();

    // Show AI chat with entrance animation
    const aiChat = document.getElementById("ai-chat");
    aiChat.classList.remove("hidden");
    this._retriggerAnimation(aiChat);

    // Hide CTAs in dashboard mode (no journey to summarize or restart)
    const ctasElement = document.getElementById("ai-chat-ctas");
    if (ctasElement) {
      if (this.dashboardMode) {
        ctasElement.classList.add("hidden");
      } else {
        ctasElement.classList.remove("hidden");
      }
    }

    // Initialize if not already done
    if (!this.aiChatInitialized) {
      this.initAIChat();
      this.aiChatInitialized = true;
    }

    // Focus the input
    setTimeout(() => {
      document.getElementById("ai-chat-input").focus();
    }, 400);
  },

  /**
   * Show AI chat configured for Q&A mode: hide chatbox, replace suggestion
   * chips with layer-topic questions, hide CTAs.
   */
  showQAChatbox() {
    // Hide the step chatbox
    this.elements.chatbox.classList.add("hidden");
    this.hideChatFab();

    const aiChat = document.getElementById("ai-chat");
    aiChat.classList.remove("hidden");
    this._retriggerAnimation(aiChat);

    // Hide CTAs in Q&A mode
    const ctasElement = document.getElementById("ai-chat-ctas");
    if (ctasElement) {
      ctasElement.classList.add("hidden");
    }

    // Replace suggestion chips with Q&A topics
    const suggestions = document.getElementById("ai-chat-suggestions");
    suggestions.classList.remove("hidden");
    suggestions.innerHTML = `
      <button class="ai-chat-chip" data-question="What about Kumamoto's water quality and supply?">Water quality?</button>
      <button class="ai-chat-chip" data-question="How strong is government support for the semiconductor corridor?">Government support?</button>
      <button class="ai-chat-chip" data-question="What are the projected property returns in Kumamoto?">Property returns?</button>
      <button class="ai-chat-chip" data-question="Tell me about the talent pipeline and workforce availability.">Talent pipeline?</button>
    `;

    // Clear previous messages
    const messages = document.getElementById("ai-chat-messages");
    messages.innerHTML = "";

    // Initialize if not already done
    if (!this.aiChatInitialized) {
      this.initAIChat();
      this.aiChatInitialized = true;
    }

    // Focus the input
    setTimeout(() => {
      document.getElementById("ai-chat-input").focus();
    }, 400);
  },

  /**
   * Show the AI chat panel with journey recap content (final step).
   * Hides the chat-specific elements (header, suggestions, input, messages).
   */
  showFinalRecap(recapHtml) {
    // Hide the step chatbox
    this.elements.chatbox.classList.add("hidden");
    this.hideChatFab();

    const aiChat = document.getElementById("ai-chat");
    const recap = document.getElementById("ai-chat-recap");
    const header = document.getElementById("ai-chat-header");
    const suggestions = document.getElementById("ai-chat-suggestions");
    const form = document.getElementById("ai-chat-form");
    const messages = document.getElementById("ai-chat-messages");
    const ctas = document.getElementById("ai-chat-ctas");
    const backBtn = document.getElementById("ai-chat-back");

    // Populate and show recap
    recap.innerHTML = recapHtml;
    recap.classList.remove("hidden");

    // Hide chat elements
    header.classList.add("hidden");
    suggestions.classList.add("hidden");
    form.classList.add("hidden");
    messages.classList.add("hidden");
    if (ctas) ctas.classList.add("hidden");
    backBtn.classList.add("hidden");

    // Show the panel
    aiChat.classList.remove("hidden");
    this._retriggerAnimation(aiChat);
  },

  /**
   * Switch AI chat panel from recap to Q&A mode.
   * Shows chat elements, hides recap, shows back button and download summary.
   */
  showQAMode() {
    // Hide the step chatbox
    this.elements.chatbox.classList.add("hidden");
    this.hideChatFab();

    const aiChat = document.getElementById("ai-chat");
    const recap = document.getElementById("ai-chat-recap");
    const header = document.getElementById("ai-chat-header");
    const suggestions = document.getElementById("ai-chat-suggestions");
    const form = document.getElementById("ai-chat-form");
    const messages = document.getElementById("ai-chat-messages");
    const ctas = document.getElementById("ai-chat-ctas");
    const backBtn = document.getElementById("ai-chat-back");

    // Hide recap, show chat elements
    recap.classList.add("hidden");
    header.classList.remove("hidden");
    form.classList.remove("hidden");
    messages.classList.remove("hidden");
    messages.innerHTML = "";
    backBtn.classList.remove("hidden");

    // Replace suggestions with Q&A topics
    suggestions.classList.remove("hidden");
    suggestions.innerHTML = `
      <button class="ai-chat-chip" data-question="What about Kumamoto's water quality and supply?">Water quality?</button>
      <button class="ai-chat-chip" data-question="How strong is government support for the semiconductor corridor?">Government support?</button>
      <button class="ai-chat-chip" data-question="What are the projected property returns in Kumamoto?">Property returns?</button>
      <button class="ai-chat-chip" data-question="Tell me about the talent pipeline and workforce availability.">Talent pipeline?</button>
    `;

    // Show download summary as border button in CTAs area
    if (ctas) {
      ctas.classList.remove("hidden");
    }

    // Initialize if not already done
    if (!this.aiChatInitialized) {
      this.initAIChat();
      this.aiChatInitialized = true;
    }

    // Show the panel
    aiChat.classList.remove("hidden");
    this._retriggerAnimation(aiChat);

    // Focus the input
    setTimeout(() => {
      document.getElementById("ai-chat-input").focus();
    }, 400);
  },

  hideAIChat() {
    const aiChat = document.getElementById("ai-chat");
    // Add closing animation class
    aiChat.classList.add("closing");
    this.lastChatType = "aiChat";

    // Wait for animation to complete, then hide
    const animationDuration = TIMING.fast; // matches --duration-fast
    setTimeout(() => {
      aiChat.classList.add("hidden");
      aiChat.classList.remove("closing");
      this.showChatFab();
    }, animationDuration);
  },
  sendAIMessage(message) {
    const suggestionsContainer = document.getElementById("ai-chat-suggestions");

    // Hide suggestions after first message
    suggestionsContainer.classList.add("hidden");

    // Add user message
    this.addChatMessage(message, "user");

    // Show typing indicator
    this.showTypingIndicator();

    // Generate response after delay
    setTimeout(
      () => {
        this.hideTypingIndicator();
        const response = this.generateAIResponse(message);
        this.addChatMessage(response, "assistant");
      },
      1200 + Math.random() * 800,
    );
  },
  addChatMessage(content, role) {
    const messagesContainer = document.getElementById("ai-chat-messages");

    const messageEl = document.createElement("div");
    messageEl.className = `ai-chat-message ${role}`;
    messageEl.innerHTML = `<div class="message-content">${content}</div>`;

    messagesContainer.appendChild(messageEl);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Reveal CTAs after first assistant response (not in dashboard mode)
    if (role === "assistant") {
      const ctas = document.getElementById("ai-chat-ctas");
      if (
        ctas &&
        !ctas.classList.contains("visible") &&
        !App?.state?.dashboardMode
      ) {
        setTimeout(() => ctas.classList.add("visible"), 500);
      }
    }
  },
  showTypingIndicator() {
    const messagesContainer = document.getElementById("ai-chat-messages");

    const typingEl = document.createElement("div");
    typingEl.className = "ai-chat-typing";
    typingEl.id = "ai-typing-indicator";
    typingEl.innerHTML = "<span></span><span></span><span></span>";

    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },
  hideTypingIndicator() {
    const typing = document.getElementById("ai-typing-indicator");
    if (typing) {
      typing.remove();
    }
  },
  generateAIResponse(question) {
    const q = question.toLowerCase();
    let response = "";
    const timestamp =
      '<div class="ai-data-timestamp">Based on Q3 2024 data</div>';

    // Risk questions
    if (q.includes("risk")) {
      response =
        "Key risks to consider:<br><br><strong>Natural disaster:</strong> The 2016 Kumamoto earthquake caused significant damage. Seismic building codes have since been upgraded.<br><br><strong>Construction delays:</strong> TSMC's second fab timeline could shift, affecting demand projections.<br><br><strong>Currency exposure:</strong> Yen-denominated assets carry FX risk for international investors.<br><br><strong>Liquidity:</strong> Regional Japanese real estate is less liquid than metro markets.<br><br>However, the ¥4T+ government commitment and TSMC's operational first fab provide strong downside protection.";
    }
    // How to invest
    else if (q.includes("how") && q.includes("invest")) {
      response =
        "The GKTK Fund offers a structured entry point:<br><br>1. <strong>Schedule a consultation</strong> with our Kumamoto specialists<br>2. Review the fund prospectus and individual property details<br>3. Complete KYC and accreditation verification<br>4. Fund commitment with quarterly capital calls<br><br>Minimum investment starts at ¥50M. Would you like to schedule a call with an advisor?";
    }
    // Semiconductor industry questions
    else if (
      q.includes("semiconductor") ||
      q.includes("reshaping") ||
      q.includes("chip")
    ) {
      response =
        "Japan committed ¥3.9 trillion to rebuild domestic chip production as part of national economic security strategy.<br><br>TSMC's Kumamoto fab is the centerpiece—bringing cutting-edge manufacturing back to Japan.";
    }
    // Kumamoto as hub
    else if (
      q.includes("kumamoto") &&
      (q.includes("chosen") || q.includes("hub") || q.includes("why"))
    ) {
      response =
        "Kumamoto was selected for three reasons: ultra-pure water from the Aso aquifer, reliable power infrastructure, and an existing semiconductor ecosystem with Sony's facility.<br><br>These natural advantages were decisive for chip fabrication requirements.";
    }
    // TSMC / JASM
    else if (q.includes("tsmc") || q.includes("jasm")) {
      response =
        "JASM is TSMC's joint venture with Sony and Denso. The first fab began production in 2024 with 22/28nm chips.<br><br>A second fab for 6nm chips is under construction—¥2 trillion total investment creating 3,400+ jobs.";
    }
    // Land prices
    else if (
      q.includes("land") ||
      q.includes("price") ||
      q.includes("property")
    ) {
      response =
        "Land prices have appreciated 15-25% annually since TSMC's announcement.<br><br>Kikuyo and Ozu areas see the strongest growth. Residential land near JASM has roughly doubled since 2021.";
    }
    // Traffic
    else if (
      q.includes("traffic") ||
      q.includes("commute") ||
      q.includes("transport")
    ) {
      response =
        "Traffic congestion has increased with JASM construction. The prefecture is investing ¥50 billion in infrastructure upgrades.<br><br>New expressway connections and the planned Kumamoto Airport rail link will reduce commute times.";
    }
    // Investment / returns
    else if (
      q.includes("invest") ||
      q.includes("return") ||
      q.includes("profit") ||
      q.includes("yield")
    ) {
      response =
        "Properties show 4-6% gross rental yields with projected appreciation of 8-15% annually through 2030.<br><br>Properties within 15 minutes of JASM command premium rents from engineers and technicians.";
    }
    // Default response
    else {
      response =
        "The Kumamoto corridor is experiencing unprecedented transformation with over ¥4 trillion in committed investment.<br><br>I can help with land prices, infrastructure plans, or specific investment opportunities.";
    }

    return response + timestamp;
  },

  /**
   * Exit path: Schedule a call
   */
  scheduleCall() {
    this.addChatMessage("I'd like to schedule a call with an advisor.", "user");
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();
      this.addChatMessage(
        "I'll connect you with one of our investment advisors. They'll reach out within 24 hours to discuss your specific interests.<br><br><strong>What's the best way to reach you?</strong>",
        "assistant",
      );
    }, 800);
  },

  /**
   * Show MoreHarvest grand entry — branded full-screen overlay
   * Appears before step 10 (properties) transition
   */
  showAIChatWithCTAs() {
    // Show standard AI chat first
    this.showAIChat();

    // Add CTAs section after a delay (when user might be finishing)
    // Note: CTAs are shown immediately in the enhanced version
  },
  getAIChatCTAsHtml() {
    return `
            <div class="ai-chat-ctas">
                <button class="ai-chat-cta" onclick="UI.downloadSummary()">
                    <span class="ai-chat-cta-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                    </span>
                    Download summary
                </button>
            </div>
        `;
  },

  /**
   * Handle download summary CTA — generates and downloads an HTML summary
   */
  downloadSummary() {
    this.addChatMessage(
      "I'd like to download a summary of this presentation.",
      "user",
    );
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();

      // Build summary content from app data
      const properties = AppData.properties || [];
      const companies = AppData.companies || [];
      const gktk = AppData.gktk || {};
      const sciencePark = AppData.sciencePark || {};

      let propertiesHtml = properties
        .map(
          (p) => `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.type || "—"}</td>
                    <td>${p.driveTime || "—"}</td>
                    <td>${p.basicStats?.find((s) => s.label === "Floor area")?.value || "—"}</td>
                </tr>
            `,
        )
        .join("");

      let companiesHtml = companies
        .map(
          (c) => `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.subtitle || "—"}</td>
                    <td>${c.stats?.[0]?.value || "—"}</td>
                    <td>${c.stats?.[1]?.value || "—"}</td>
                </tr>
            `,
        )
        .join("");

      const summaryHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <title>Kumamoto investment summary</title>
  <style>
  body { font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1e1f20; }
  h1 { font-size: 28px; margin-bottom: 8px; }
  h2 { font-size: 20px; margin-top: 32px; border-bottom: 2px solid #fbb931; padding-bottom: 8px; }
  .subtitle { color: #6e7073; font-size: 15px; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e8e8ed; }
  th { font-weight: 600; background: #f5f5f7; }
  .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
  .stat-card { background: #f5f5f7; border-radius: 8px; padding: 16px; }
  .stat-value { font-size: 22px; font-weight: 700; color: #1e1f20; }
  .stat-label { font-size: 13px; color: #6e7073; margin-top: 4px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e8e8ed; color: #6e7073; font-size: 13px; }
  </style>
  </head>
  <body>
  <h1>Kumamoto investment summary</h1>
  <p class="subtitle">Greater Kumamoto Technology Corridor — presentation summary</p>

  <h2>Fund overview</h2>
  <div class="stat-grid">
  ${(gktk.stats || []).map((s) => `<div class="stat-card"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join("")}
  </div>

  <h2>Science Park corridor</h2>
  <p>${sciencePark.description || ""}</p>
  <div class="stat-grid">
  ${(sciencePark.stats || []).map((s) => `<div class="stat-card"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join("")}
  </div>

  <h2>Corporate partners</h2>
  <table>
  <thead><tr><th>Company</th><th>Sector</th><th>Investment</th><th>Employees</th></tr></thead>
  <tbody>${companiesHtml}</tbody>
  </table>

  <h2>Investment properties</h2>
  <table>
  <thead><tr><th>Property</th><th>Type</th><th>Drive to JASM</th><th>Floor Area</th></tr></thead>
  <tbody>${propertiesHtml}</tbody>
  </table>

  <div class="footer">
  <p>Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  <p>This summary is for informational purposes only and does not constitute investment advice.</p>
  </div>
  </body>
  </html>`;

      // Trigger file download
      const blob = new Blob([summaryHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "kumamoto-investment-summary.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.addChatMessage(
        "Your summary has been downloaded. It includes the fund overview, corporate partners, and property details we reviewed.",
        "assistant",
      );
    }, 800);
  },

  // ================================
  // DASHBOARD MODE
  // ================================

};
