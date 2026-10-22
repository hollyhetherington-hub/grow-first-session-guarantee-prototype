// ===================================================================
// Grow Therapy — First-Session Guarantee prototype
// Vanilla JS, no build step. Single-file-folder, double-click-to-open.
// ===================================================================

const GUARANTEE_ITEMS = [
  {
    title: "Your insurance changes",
    body: "You still pay the price we showed you.",
    icon: `<path d="M9 12L11 14L15.5 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2L4 5V11C4 16.5 7.4 21.3 12 22.5C16.6 21.3 20 16.5 20 11V5L12 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
  },
  {
    title: "Your insurer says no",
    body: "We handle it. Your price stays the same.",
    icon: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  },
  {
    title: "Billing codes change",
    body: "Any difference is on us, not you.",
    icon: `<rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  },
  {
    title: "Your deductible was different than expected",
    body: "You still pay what we quoted.",
    icon: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M9 15C9 15 10 13.5 12 13.5C14 13.5 15 15 15 15M9.5 9.5H9.51M14.5 9.5H14.51" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  },
];

function renderGuaranteeGrid(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = GUARANTEE_ITEMS.map(
    (item) => `
    <div class="guarantee-item">
      <div class="icon-wrap">
        <svg class="icon" viewBox="0 0 24 24" fill="none">${item.icon}</svg>
      </div>
      <div>
        <p class="guarantee-item-title">${item.title}</p>
        <p class="guarantee-item-body">${item.body}</p>
      </div>
    </div>`
  ).join("");
}

// ---------------------------------------------------------------
// Screen navigation
// ---------------------------------------------------------------
function goToScreen(name) {
  document.querySelectorAll("[data-screen]").forEach((el) => {
    el.hidden = el.id !== `screen-${name}`;
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

  if (name === "booking") {
    resetBookingFlow();
  }
}

document.addEventListener("click", (e) => {
  // Guarantee icon: toggle an inline explainer instead of letting the click
  // bubble up to the mini-card's whole-card data-goto="profile" navigation.
  const guaranteeToggle = e.target.closest("[data-guarantee-toggle]");
  if (guaranteeToggle) {
    const explainer = guaranteeToggle.closest(".mini-card-price").nextElementSibling;
    const wasHidden = explainer.hidden;
    document.querySelectorAll(".guarantee-explainer").forEach((el) => (el.hidden = true));
    document
      .querySelectorAll("[data-guarantee-toggle]")
      .forEach((b) => b.setAttribute("aria-expanded", "false"));
    if (wasHidden) {
      explainer.hidden = false;
      guaranteeToggle.setAttribute("aria-expanded", "true");
    }
    return;
  }
  if (!e.target.closest(".guarantee-explainer") && !e.target.closest("[data-guarantee-toggle]")) {
    document.querySelectorAll(".guarantee-explainer").forEach((el) => (el.hidden = true));
    document
      .querySelectorAll("[data-guarantee-toggle]")
      .forEach((b) => b.setAttribute("aria-expanded", "false"));
  }

  const gotoEl = e.target.closest("[data-goto]");
  if (gotoEl) {
    goToScreen(gotoEl.getAttribute("data-goto"));
  }
});

// ---------------------------------------------------------------
// Carousel arrow scroll (cosmetic — right arrow only, matches source)
// ---------------------------------------------------------------
document.addEventListener("click", (e) => {
  const nextArrow = e.target.closest(".carousel-nav .btn-icon-sm:not(:disabled)");
  if (nextArrow) {
    const row = nextArrow.closest(".carousel-section").querySelector(".carousel-row");
    row.scrollBy({ left: 240, behavior: "smooth" });
  }
});

// ---------------------------------------------------------------
// Homepage quote widget (mock coverage lookup)
// ---------------------------------------------------------------
const QUOTE_RATES = [
  { match: /aetna/i, min: 20, max: 35, label: "Aetna" },
  { match: /cigna/i, min: 25, max: 40, label: "Cigna" },
  { match: /united/i, min: 30, max: 45, label: "UnitedHealthcare" },
  { match: /blue\s*cross|bcbs/i, min: 22, max: 38, label: "Blue Cross Blue Shield" },
  { match: /humana/i, min: 18, max: 32, label: "Humana" },
  { match: /medicaid/i, min: 0, max: 0, label: "Medicaid" },
];

function lookupQuote(insurerRaw) {
  const insurer = insurerRaw.trim();
  const found = QUOTE_RATES.find((r) => r.match.test(insurer));
  if (found) return found;
  if (insurer) return { min: 18, max: 40, label: insurer };
  return { min: 18, max: 40, label: "your plan" };
}

function formatQuoteRange(quote) {
  if (quote.min === quote.max) return "$" + quote.min;
  return "$" + quote.min + "–$" + quote.max;
}

document.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-quote-form]");
  if (!form) return;
  e.preventDefault();

  const tile = form.closest(".quote-tile");
  const defaultEl = tile.querySelector("[data-quote-default]");
  const loadingEl = tile.querySelector("[data-quote-loading]");
  const resultEl = tile.querySelector("[data-quote-result]");
  const insurer = tile.querySelector("#quote-insurer").value;
  const name = tile.querySelector("#quote-name").value.trim();

  defaultEl.hidden = true;
  resultEl.hidden = true;
  loadingEl.hidden = false;

  window.setTimeout(() => {
    const quote = lookupQuote(insurer);
    const firstName = name.split(" ")[0];
    const greeting = firstName ? `Hi ${firstName} — ` : "";

    resultEl.querySelector("[data-quote-amount]").textContent = formatQuoteRange(quote);
    resultEl.querySelector("[data-quote-label]").textContent =
      quote.min === quote.max
        ? `${greeting}your estimated price with ${quote.label}`
        : `${greeting}your estimated range with ${quote.label}`;

    loadingEl.hidden = true;
    resultEl.hidden = false;
  }, 1200);
});

document.addEventListener("click", (e) => {
  const resetBtn = e.target.closest("[data-quote-reset]");
  if (resetBtn) {
    const tile = resetBtn.closest(".quote-tile");
    tile.querySelector("[data-quote-form]").reset();
    tile.querySelector("[data-quote-result]").hidden = true;
    tile.querySelector("[data-quote-default]").hidden = false;
  }
});

// ---------------------------------------------------------------
// Booking flow state
// ---------------------------------------------------------------
const STEP_ORDER = ["time", "details", "cost"];
let selectedSlot = "Thu, Oct 29 · 4:30 PM";

function resetBookingFlow() {
  showBookingStep("time");
}

function showBookingStep(stepName) {
  document.querySelectorAll(".booking-step").forEach((el) => {
    el.hidden = el.getAttribute("data-step") !== stepName;
  });
  document.querySelectorAll("[data-step-indicator]").forEach((el) => {
    const stepName_ = el.getAttribute("data-step-indicator");
    const idx = STEP_ORDER.indexOf(stepName_);
    const currentIdx = STEP_ORDER.indexOf(stepName);
    el.classList.remove("is-active", "is-complete");
    if (idx === currentIdx) el.classList.add("is-active");
    else if (idx < currentIdx) el.classList.add("is-complete");
  });

  if (stepName === "cost") {
    runCostCheck();
  }
}

document.addEventListener("click", (e) => {
  const slotBtn = e.target.closest(".slot");
  if (slotBtn) {
    document.querySelectorAll(".slot").forEach((s) => s.classList.remove("slot-selected"));
    slotBtn.classList.add("slot-selected");
    selectedSlot = slotBtn.getAttribute("data-slot");
    document.querySelectorAll('[data-summary="time"]').forEach((el) => (el.textContent = selectedSlot));
    return;
  }

  const nextBtn = e.target.closest("[data-step-next]");
  if (nextBtn) {
    const next = nextBtn.getAttribute("data-step-next");
    if (next === "details") {
      // lock in insurance row in summary once we move past Time
    }
    if (next === "cost") {
      revealInsuranceSummary();
    }
    showBookingStep(next);
    return;
  }

  const prevBtn = e.target.closest("[data-step-prev]");
  if (prevBtn) {
    showBookingStep(prevBtn.getAttribute("data-step-prev"));
    return;
  }
});

function revealInsuranceSummary() {
  const carrier = document.getElementById("carrier");
  const row = document.querySelector('[data-summary-row="insurance"]');
  if (carrier && row) {
    document.querySelector('[data-summary="insurance"]').textContent = carrier.value;
    row.hidden = false;
  }
}

function runCostCheck() {
  const loading = document.querySelector("[data-cost-loading]");
  const result = document.querySelector("[data-cost-result]");
  if (!loading || !result) return;

  loading.hidden = false;
  result.hidden = true;

  window.setTimeout(() => {
    loading.hidden = true;
    result.hidden = false;
    fillSummaryPrice();
  }, 1400);
}

function fillSummaryPrice() {
  const box = document.querySelector("[data-summary-price]");
  if (!box) return;
  box.classList.add("has-value");
  box.innerHTML = `
    <span class="body-sm ink-muted">Your guaranteed price</span>
    <span class="summary-price-amount">$20</span>
  `;
}

// ---------------------------------------------------------------
// Provider profile — "what will you pay" cost check (single provider)
// ---------------------------------------------------------------
const PROFILE_PROVIDER_RATES = [
  { match: /aetna/i, amount: 20, label: "Aetna" },
  { match: /cigna/i, amount: 25, label: "Cigna" },
  { match: /united/i, amount: 30, label: "UnitedHealthcare" },
  { match: /blue\s*cross|bcbs/i, amount: 22, label: "Blue Cross Blue Shield" },
  { match: /humana/i, amount: 18, label: "Humana" },
  { match: /medicaid/i, amount: 0, label: "Medicaid" },
];

function lookupProviderRate(insurerRaw) {
  const insurer = insurerRaw.trim();
  const found = PROFILE_PROVIDER_RATES.find((r) => r.match.test(insurer));
  if (found) return found;
  if (insurer) return { amount: 20, label: insurer };
  return { amount: 20, label: "your plan" };
}

document.addEventListener("click", (e) => {
  const checkBtn = e.target.closest("[data-profile-cost-check]");
  if (checkBtn) {
    const sidebar = checkBtn.closest(".profile-sidebar");
    const insurer = sidebar.querySelector("#profile-insurer").value;
    const rate = lookupProviderRate(insurer);

    sidebar.querySelector("[data-profile-cost-amount]").textContent = "$" + rate.amount;
    sidebar.querySelector("[data-profile-cost-label]").textContent = "per session with " + rate.label;

    sidebar.querySelector("[data-profile-cost-default]").hidden = true;
    sidebar.querySelector("[data-profile-cost-result]").hidden = false;
    return;
  }

  const resetBtn = e.target.closest("[data-profile-cost-reset]");
  if (resetBtn) {
    const sidebar = resetBtn.closest(".profile-sidebar");
    sidebar.querySelector("[data-profile-cost-result]").hidden = true;
    sidebar.querySelector("[data-profile-cost-default]").hidden = false;
    return;
  }
});

// ---------------------------------------------------------------
// Init
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderGuaranteeGrid("guarantee-grid-cost");
});
