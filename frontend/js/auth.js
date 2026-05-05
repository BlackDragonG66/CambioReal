import { api } from "./api.js";
import { showToast, showPage } from "./app.js";

export function initAuth() {
  const tabs    = document.querySelectorAll(".auth-tab");
  const loginForm  = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      loginForm.style.display    = tab.dataset.tab === "login"    ? "block" : "none";
      registerForm.style.display = tab.dataset.tab === "register" ? "block" : "none";
    });
  });

  // Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    try {
      const res = await api.login(email, password);
      localStorage.setItem("rd_token", res.token);
      localStorage.setItem("rd_user", JSON.stringify(res.user));
      showPage("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Register
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name     = document.getElementById("reg-name").value.trim();
    const email    = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    try {
      const res = await api.register(name, email, password);
      localStorage.setItem("rd_token", res.token);
      localStorage.setItem("rd_user", JSON.stringify(res.user));
      showPage("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

export function logout() {
  localStorage.removeItem("rd_token");
  localStorage.removeItem("rd_user");
  showPage("auth");
}
