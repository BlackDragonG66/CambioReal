import { initAuth } from "./auth.js";
import { loadDashboard } from "./dashboard.js";
import { loadCalendar, initCalendarNav } from "./calendar.js";
import { loadRewards, initRewardForm } from "./rewards.js";
import { loadProfile } from "./profile.js";
import { api } from "./api.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

export function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${name}`).classList.add("active");

  document.querySelectorAll(".nav-bar button").forEach(b => b.classList.remove("active"));
  const navBtn = document.querySelector(`.nav-bar button[data-page="${name}"]`);
  if (navBtn) navBtn.classList.add("active");

  document.getElementById("main-nav").style.display =
    name === "auth" ? "none" : "flex";

  document.querySelector(".fab") &&
    (document.querySelector(".fab").style.display =
      ["dashboard", "calendar"].includes(name) ? "flex" : "none");

  // Cargar datos según la página
  if (name === "dashboard")  loadDashboard();
  if (name === "calendar")   loadCalendar();
  if (name === "rewards")    loadRewards();
  if (name === "profile")    loadProfile();
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

export function renderActivityCard(activity) {
  const card = document.createElement("div");
  card.className = `activity-card cat-${activity.category} ${activity.status === "completed" ? "completed" : ""}`;
  card.dataset.id = activity.id;

  const timeStr = activity.time ? activity.time.slice(0, 5) : "";
  card.innerHTML = `
    <div class="activity-dot dot-${activity.category}"></div>
    <div class="activity-info">
      <h3>${escHtml(activity.title)}</h3>
      <small>${timeStr ? `${timeStr} · ` : ""}${escHtml(activity.category)}</small>
    </div>
    <span class="activity-pts">+${activity.points}</span>
    <button class="btn-check ${activity.status === "completed" ? "done" : ""}"
            data-id="${activity.id}" aria-label="Completar actividad">
      ${activity.status === "completed" ? "✓" : ""}
    </button>`;

  const checkBtn = card.querySelector(".btn-check");
  checkBtn.addEventListener("click", async () => {
    if (activity.status === "completed") return;
    try {
      await api.completeActivity(activity.id);
      activity.status = "completed";
      card.classList.add("completed");
      checkBtn.classList.add("done");
      checkBtn.textContent = "✓";
      showToast(`✅ +${activity.points} puntos ganados`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  return card;
}

// ─── Modal Crear Actividad ─────────────────────────────────────────────────────

function initActivityModal() {
  const modal = document.getElementById("modal-activity");
  const form  = document.getElementById("activity-form");

  // Fecha mínima = hoy
  document.getElementById("act-date").min = getToday();
  document.getElementById("act-date").value = getToday();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title:            document.getElementById("act-title").value.trim(),
      description:      document.getElementById("act-desc").value.trim() || undefined,
      date:             document.getElementById("act-date").value,
      time:             document.getElementById("act-time").value || undefined,
      points:           Number(document.getElementById("act-points").value),
      category:         document.getElementById("act-category").value,
      repeat_type:      document.getElementById("act-repeat").value,
      reminder_minutes: document.getElementById("act-reminder").value
                        ? Number(document.getElementById("act-reminder").value)
                        : undefined
    };
    try {
      await api.createActivity(payload);
      showToast("Actividad creada ✅", "success");
      form.reset();
      document.getElementById("act-date").value = getToday();
      modal.classList.remove("open");
      loadDashboard();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  document.getElementById("close-modal-activity").addEventListener("click", () => {
    modal.classList.remove("open");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });
}

function initRewardModal() {
  document.getElementById("open-modal-reward").addEventListener("click", () => {
    document.getElementById("modal-reward").classList.add("open");
  });
  document.getElementById("close-modal-reward").addEventListener("click", () => {
    document.getElementById("modal-reward").classList.remove("open");
  });
  document.getElementById("modal-reward").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-reward"))
      document.getElementById("modal-reward").classList.remove("open");
  });
}

// ─── Arranque ─────────────────────────────────────────────────────────────────

function init() {
  // Service Worker PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  }

  // Auth
  initAuth();

  // Navegación
  document.querySelectorAll(".nav-bar button[data-page]").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
  });

  // FAB → abre modal de actividad
  document.querySelector(".fab").addEventListener("click", () => {
    document.getElementById("modal-activity").classList.add("open");
  });

  // Modales
  initActivityModal();
  initRewardModal();
  initRewardForm();
  initCalendarNav();

  // Ruta inicial
  const token = localStorage.getItem("rd_token");
  showPage(token ? "dashboard" : "auth");
}

document.addEventListener("DOMContentLoaded", init);
