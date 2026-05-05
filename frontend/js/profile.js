import { api } from "./api.js";
import { showToast } from "./app.js";
import { logout } from "./auth.js";

export async function loadProfile() {
  const container = document.getElementById("profile-content");
  container.innerHTML = `<div class="spinner"></div>`;
  try {
    const profile = await api.getProfile();
    container.innerHTML = `
      <div class="card" style="text-align:center">
        <div style="font-size:52px;margin-bottom:8px">👤</div>
        <h2 style="font-size:20px;font-weight:700">${escHtml(profile.name)}</h2>
        <p style="color:var(--text-muted);font-size:13px">${escHtml(profile.email)}</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 20px;margin-top:12px;">
        <div class="card">
          <div class="card-title">Puntos actuales</div>
          <div class="card-value" style="font-size:22px">${profile.balance}</div>
        </div>
        <div class="card">
          <div class="card-title">Total ganados</div>
          <div class="card-value" style="font-size:22px">${profile.total_earned}</div>
        </div>
      </div>

      <div class="card" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="card-title">Racha actual</div>
          <div class="streak-badge">🔥 ${profile.streak} días</div>
        </div>
        <span style="font-size:40px">🏅</span>
      </div>

      <div style="padding:20px;">
        <button id="btn-logout" class="btn btn-danger btn-full">Cerrar sesión</button>
      </div>`;

    document.getElementById("btn-logout").addEventListener("click", logout);
  } catch (err) {
    showToast(err.message, "error");
    container.innerHTML = "";
  }
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
