import { api } from "./api.js";
import { showToast, renderActivityCard } from "./app.js";

const CAT_COLORS = {
  salud: "#22c55e", trabajo: "#6366f1", casa: "#f59e0b",
  estudio: "#3b82f6", pareja: "#ec4899", familia: "#f97316",
  dinero: "#14b8a6", habitos: "#8b5cf6", diversion: "#eab308", personal: "#64748b"
};

let currentDate = new Date();
let allActivities = [];
let selectedDate = null;

export async function loadCalendar() {
  try {
    // Fetch month range
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to   = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

    allActivities = await api.getActivities(from, to);
    renderCalendar();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function renderCalendar() {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  document.getElementById("cal-month-label").textContent = `${monthNames[month]} ${year}`;

  const grid = document.getElementById("cal-grid");
  grid.innerHTML = "";

  // Day names
  ["Do","Lu","Ma","Mi","Ju","Vi","Sa"].forEach(d => {
    const el = document.createElement("div");
    el.className = "cal-day-name";
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Empty slots
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement("div");
    el.className = "cal-day empty";
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const el = document.createElement("div");
    el.className = "cal-day";
    if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === d) {
      el.classList.add("today");
    }
    if (selectedDate === dateStr) el.classList.add("selected");

    el.innerHTML = `<span>${d}</span><div class="cal-dots"></div>`;

    // Dots for activities
    const dayActivities = allActivities.filter(a => a.date && a.date.startsWith(dateStr));
    const dots = el.querySelector(".cal-dots");
    dayActivities.slice(0, 3).forEach(a => {
      const dot = document.createElement("div");
      dot.className = "cal-dot";
      dot.style.background = CAT_COLORS[a.category] || "#64748b";
      dots.appendChild(dot);
    });

    el.addEventListener("click", () => {
      selectedDate = dateStr;
      renderCalendar();
      renderDayActivities(dateStr);
    });

    grid.appendChild(el);
  }

  if (selectedDate) renderDayActivities(selectedDate);
}

function renderDayActivities(dateStr) {
  const area = document.getElementById("cal-day-activities");
  area.innerHTML = `<h3>${dateStr}</h3>`;
  const acts = allActivities.filter(a => a.date && a.date.startsWith(dateStr));
  if (acts.length === 0) {
    area.innerHTML += `<div class="empty"><span>📅</span>Sin actividades este día.</div>`;
    return;
  }
  acts.forEach(a => area.appendChild(renderActivityCard(a)));
}

export function initCalendarNav() {
  document.getElementById("cal-prev").addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    loadCalendar();
  });
  document.getElementById("cal-next").addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    loadCalendar();
  });
}
