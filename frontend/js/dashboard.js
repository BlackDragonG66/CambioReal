import { api } from "./api.js";
import { showToast, renderActivityCard, getToday } from "./app.js";

export async function loadDashboard() {
  const user = JSON.parse(localStorage.getItem("rd_user") || "{}");
  document.getElementById("dash-greeting").textContent = `Hola, ${user.name || ""}`;

  // Cargar en paralelo
  try {
    const [activities, balance, rewards] = await Promise.all([
      api.getActivities(getToday(), getToday()),
      api.getBalance(),
      api.getRewards()
    ]);

    // Puntos del día
    document.getElementById("dash-points-today").textContent = balance.balance;

    // Progreso del día
    const completed = activities.filter(a => a.status === "completed").length;
    const total = activities.length;
    document.getElementById("dash-progress-text").textContent =
      `Completadas: ${completed} de ${total}`;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    document.getElementById("dash-progress-fill").style.width = `${pct}%`;

    // Próxima recompensa
    const nextReward = rewards
      .filter(r => r.is_active)
      .sort((a, b) => a.points_required - b.points_required)
      .find(r => r.points_required > balance.balance);
    if (nextReward) {
      const diff = nextReward.points_required - balance.balance;
      document.getElementById("dash-next-reward").textContent =
        `${nextReward.title} — faltan ${diff} pts`;
    } else {
      document.getElementById("dash-next-reward").textContent =
        rewards.length ? "¡Tienes recompensas disponibles!" : "Crea tu primera recompensa";
    }

    // Lista de actividades del día
    const list = document.getElementById("dash-activity-list");
    list.innerHTML = "";
    if (activities.length === 0) {
      list.innerHTML = `<div class="empty"><span>🎯</span>Sin actividades para hoy.<br>¡Crea tu primera!</div>`;
    } else {
      activities.forEach(a => {
        const card = renderActivityCard(a);
        list.appendChild(card);
      });
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}
