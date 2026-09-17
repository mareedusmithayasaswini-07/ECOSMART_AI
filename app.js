// EcoSmart AI - Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initClassifier();
  initRAGChatbot();
  initAgentWorkflow();
  initImpactCounters();
});

/* ----------------------------------------------------
   1. NAVIGATION TABS
---------------------------------------------------- */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

/* ----------------------------------------------------
   2. AI WASTE CLASSIFIER SIMULATOR
---------------------------------------------------- */
const wasteDatabase = {
  "plastic bottle": {
    name: "PET Plastic Water Bottle",
    category: "Recyclable Plastics",
    bin: "bin-recyclable",
    binName: "Blue Bin (Recyclables)",
    confidence: "98.4%",
    co2Saved: "0.45 kg CO2e",
    steps: [
      "Empty remaining liquid completely.",
      "Rinse with clean water to prevent contamination.",
      "Crush bottle flat and replace the cap.",
      "Deposit into the Dry Recyclables Blue Bin."
    ],
    ethicsCheck: "Pass (Non-hazardous, Standard Recyclable)",
    agentAction: "Standard collection log entry generated."
  },
  "banana peel": {
    name: "Organic Household Food Scrap",
    category: "Wet Organic Waste",
    bin: "bin-organic",
    binName: "Green Bin (Compost)",
    confidence: "99.1%",
    co2Saved: "0.22 kg CO2e",
    steps: [
      "Do NOT enclose in a non-biodegradable plastic bag.",
      "Place directly into your Green Wet Waste Bin or Home Compost Bin.",
      "Mix with dry leaves/sawdust for optimal carbon-nitrogen balance in composting."
    ],
    ethicsCheck: "Pass (Bio-degradable, Zero toxic hazard)",
    agentAction: "Logged for municipal composting pickup route."
  },
  "laptop battery": {
    name: "Lithium-Ion Battery / E-Waste",
    category: "Hazardous E-Waste",
    bin: "bin-ewaste",
    binName: "Amber/Yellow Bin (Special E-Waste)",
    confidence: "96.7%",
    co2Saved: "2.10 kg CO2e",
    steps: [
      "⚠️ DANGER: Swollen or damaged batteries pose thermal runway fire hazards.",
      "Cover metallic terminal contacts with non-conductive electrical tape.",
      "Do NOT crush, incinerate, or throw into standard household trash.",
      "Schedule specialized E-Waste pickup via local municipal portal."
    ],
    ethicsCheck: "Pass (High-hazard safety override triggered)",
    agentAction: "⚡ Agent Triggered: Automated dispatch notification sent to Certified E-Waste Facility #04."
  },
  "cardboard box": {
    name: "Corrugated Cardboard Packaging",
    category: "Dry Paper/Cardboard",
    bin: "bin-recyclable",
    binName: "Blue Bin (Paper & Cardboard)",
    confidence: "97.8%",
    co2Saved: "0.85 kg CO2e",
    steps: [
      "Remove all plastic tape, bubble wrap, and adhesive labels.",
      "Flatten the cardboard box completely to save space.",
      "Keep dry (wet cardboard loses fiber recycling value).",
      "Place in Paper & Cardboard Recycling Section."
    ],
    ethicsCheck: "Pass (Clean Dry Recyclable)",
    agentAction: "Logged for paper mill recycling stream."
  },
  "expired medicine": {
    name: "Unused Pharmaceutical Drug",
    category: "Biomedical / Hazardous Waste",
    bin: "bin-hazardous",
    binName: "Red Bin (Hazardous Disposal)",
    confidence: "95.2%",
    co2Saved: "0.60 kg CO2e",
    steps: [
      "⚠️ WARNING: Do NOT flush down the toilet or pour down drains (contaminates water tables).",
      "Keep in original packaging or sealed container.",
      "Return to designated Pharmacy Take-Back Box or Hazardous Waste Depot."
    ],
    ethicsCheck: "Pass (Water table contamination hazard flagged)",
    agentAction: "⚡ Agent Triggered: Hazardous take-back center locator active."
  }
};

function initClassifier() {
  const classifyBtn = document.getElementById('classify-btn');
  const wasteInput = document.getElementById('waste-input');
  const samplePills = document.querySelectorAll('.sample-pill');

  samplePills.forEach(pill => {
    pill.addEventListener('click', () => {
      wasteInput.value = pill.getAttribute('data-item');
      runClassification(pill.getAttribute('data-item'));
    });
  });

  if (classifyBtn) {
    classifyBtn.addEventListener('click', () => {
      const query = wasteInput.value.trim().toLowerCase();
      if (query) {
        runClassification(query);
      } else {
        alert('Please enter an item name or click a sample item!');
      }
    });
  }
}

function runClassification(query) {
  const resultCard = document.getElementById('result-card');
  let matchedData = null;

  // Search exact or partial match
  for (let key in wasteDatabase) {
    if (query.includes(key) || key.includes(query)) {
      matchedData = wasteDatabase[key];
      break;
    }
  }

  // Fallback if not found
  if (!matchedData) {
    matchedData = {
      name: query.toUpperCase() + " (Custom Item)",
      category: "General Mixed Waste",
      bin: "bin-recyclable",
      binName: "Blue Bin (Check Local Rules)",
      confidence: "91.0%",
      co2Saved: "0.30 kg CO2e",
      steps: [
        "Inspect item for recyclable resin symbols (#1 - #7).",
        "Clean and dry the item before disposal.",
        "Consult your local municipal waste directory for specific handling."
      ],
      ethicsCheck: "Pass (General Classification)",
      agentAction: "Standard classification logged."
    };
  }

  // Render UI
  document.getElementById('res-title').textContent = matchedData.name;
  document.getElementById('res-category').textContent = matchedData.category;
  document.getElementById('res-confidence').textContent = matchedData.confidence;
  document.getElementById('res-co2').textContent = matchedData.co2Saved;

  const binBadge = document.getElementById('res-bin-badge');
  binBadge.className = 'bin-badge ' + matchedData.bin;
  binBadge.textContent = matchedData.binName;

  const stepsList = document.getElementById('res-steps');
  stepsList.innerHTML = matchedData.steps.map(s => `<li>${s}</li>`).join('');

  document.getElementById('res-ethics').textContent = matchedData.ethicsCheck;
  document.getElementById('res-agent').textContent = matchedData.agentAction;

  resultCard.style.display = 'block';
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ----------------------------------------------------
   3. IBM GRANITE RAG KNOWLEDGE CHATBOT
---------------------------------------------------- */
const ragKnowledgeBase = [
  {
    keywords: ["compost", "wet waste", "organic", "food scrap"],
    response: "According to National Municipal Solid Waste Guidelines (2025): Organic food scraps (peels, leftover cooked food, tea leaves) should be segregated into Green Bins. When composting at home, maintain a 3:1 ratio of Brown (carbon-rich dry leaves) to Green (nitrogen-rich food) matter to eliminate odor and accelerate decomposition.",
    source: "📜 Source: Municipal Solid Waste Management Rules & Guidelines (Doc ID: RAG-MSW-2025-V2)"
  },
  {
    keywords: ["e-waste", "battery", "laptop", "mobile", "electronic", "lithium"],
    response: "E-Waste Handling Rules dictate that electronic waste (lithium batteries, circuit boards, chargers) must NEVER be mixed with household garbage. Batteries contain heavy metals like Cadmium and Cobalt. Always tape battery terminals and drop them at authorized E-Waste collection points or request an automated agent pickup.",
    source: "📜 Source: Central Pollution Control Board (CPCB) E-Waste Regulation Framework (Doc ID: RAG-CPCB-EW-88)"
  },
  {
    keywords: ["plastic", "bottle", "packaging", "single use"],
    response: "PET (Type 1) and HDPE (Type 2) plastics have high recycling recovery rates (over 85%). Rinse containers to remove food residues, flat-crush them to optimize logistics space, and place them in the Blue Dry Waste Bin.",
    source: "📜 Source: Plastic Waste Management Amendment Bylaws (Doc ID: RAG-PWM-2024-C)"
  },
  {
    keywords: ["medicine", "chemical", "paint", "hazardous"],
    response: "Expired pharmaceuticals and household chemicals pose severe toxic risks to groundwater tables if flushed. They must be collected in Red Bio-Hazardous Bins and incinerated in controlled municipal facilities.",
    source: "📜 Source: Bio-Medical Waste Management & Safety Directives (Doc ID: RAG-BMW-HEALTH-09)"
  }
];

function initRAGChatbot() {
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => handleChatSend());
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleChatSend();
    });
  }

  function handleChatSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Append user message
    appendMessage(text, 'user');
    chatInput.value = '';

    // Simulate RAG Retrieval delay
    setTimeout(() => {
      const botAnswer = queryRAG(text.toLowerCase());
      appendMessage(botAnswer.text, 'bot', botAnswer.source);
    }, 600);
  }

  function appendMessage(text, sender, source = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    
    let html = `<div>${text}</div>`;
    if (source) {
      html += `<div class="rag-source">${source}</div>`;
    }

    msgDiv.innerHTML = html;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function queryRAG(queryText) {
    for (let item of ragKnowledgeBase) {
      for (let kw of item.keywords) {
        if (queryText.includes(kw)) {
          return { text: item.response, source: item.source };
        }
      }
    }

    return {
      text: "Based on IBM Granite LLM + RAG vector search across Municipal Waste Guidelines: For general unclassified items, ensure the item is clean and dry. Check local municipal drop-off schedules for specialized recycling.",
      source: "📜 Source: IBM Granite RAG Knowledge Store (General Waste Policy DB)"
    };
  }
}

/* ----------------------------------------------------
   4. AGENTIC WORKFLOW SIMULATOR
---------------------------------------------------- */
function initAgentWorkflow() {
  const triggerAgentBtn = document.getElementById('trigger-agent-btn');
  const steps = document.querySelectorAll('.workflow-step');

  if (triggerAgentBtn) {
    triggerAgentBtn.addEventListener('click', () => {
      let currentStep = 0;
      triggerAgentBtn.disabled = true;
      triggerAgentBtn.textContent = '⏳ Executing AI Agent...';

      steps.forEach(s => s.classList.remove('active'));

      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          steps[currentStep].classList.add('active');
          currentStep++;
        } else {
          clearInterval(interval);
          triggerAgentBtn.disabled = false;
          triggerAgentBtn.textContent = '⚡ Run Agentic Dispatch Simulation';
        }
      }, 700);
    });
  }
}

/* ----------------------------------------------------
   5. IMPACT COUNTERS
---------------------------------------------------- */
function initImpactCounters() {
  const counterEl = document.getElementById('carbon-counter');
  if (counterEl) {
    let base = 1248.5;
    setInterval(() => {
      base += 0.1;
      counterEl.textContent = base.toFixed(1) + ' kg';
    }, 3000);
  }
}
