import { api } from "./api.js";
import { showToast } from "./app.js";

export async function loadRewards() {
  const container = document.getElementById("rewards-list");
  container.innerHTML = `<div class="spinner"></div>`;

  try {
    const [rewards, balanceData] = await Promise.all([api.getRewards(), api.getBalance()]);
    const balance = balanceData.balance;

    document.getElementById("rewards-balance").textContent = `Tus puntos: ${balance}`;

    container.innerHTML = "";
    if (rewards.length === 0) {
      container.innerHTML = `<div class="empty"><span>🎁</span>Sin recompensas todavía.<br>¡Crea la primera!</div>`;
      return;
    }

    rewards.filter(r => r.is_active).forEach(r => {
      const unlocked = balance >= r.points_required;
      const card = document.createElement("div");
      card.className = `reward-card ${unlocked ? "" : "locked"}`;
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div>
            <h3 style="font-size:16px;font-weight:700;margin-bottom:4px;">${escHtml(r.title)}</h3>
            ${r.description ? `<p style="font-size:13px;color:var(--text-muted)">${escHtml(r.description)}</p>` : ""}
          </div>
          <span class="reward-pts">${r.points_required} pts</span>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;">
          ${unlocked
            ? `<button class="btn btn-success" data-id="${r.id}" data-action="redeem">Canjear 🎉</button>`
            : `<span style="font-size:12px;color:var(--text-muted)">Faltan ${r.points_required - balance} puntos</span>`}
          <button class="btn btn-ghost" data-id="${r.id}" data-action="delete" style="font-size:12px;padding:8px 12px;">Eliminar</button>
        </div>`;
      container.appendChild(card);
    });

    container.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const { id, action } = btn.dataset;
      try {
        if (action === "redeem") {
          const res = await api.redeemReward(id);
          showToast(res.message, "success");
          loadRewards();
        } else if (action === "delete") {
          await api.deleteReward(id);
          showToast("Recompensa eliminada", "success");
          loadRewards();
        }
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  } catch (err) {
    showToast(err.message, "error");
    container.innerHTML = "";
  }
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

export function initRewardForm() {
  document.getElementById("reward-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title  = document.getElementById("rw-title").value.trim();
    const desc   = document.getElementById("rw-desc").value.trim();
    const points = document.getElementById("rw-points").value;
    try {
      await api.createReward({ title, description: desc, points_required: Number(points) });
      showToast("Recompensa creada ✅", "success");
      document.getElementById("reward-form").reset();
      document.getElementById("modal-reward").classList.remove("open");
      loadRewards();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}
