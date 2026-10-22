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
// Init
// ---------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderGuaranteeGrid("guarantee-grid-cost");
});
