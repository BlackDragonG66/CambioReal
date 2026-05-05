// Configuración del API base
const API_BASE = "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("rd_token");
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// Auth
export const api = {
  register: (name, email, password) =>
    request("POST", "/auth/register", { name, email, password }),

  login: (email, password) =>
    request("POST", "/auth/login", { email, password }),

  // Activities
  getActivities: (from, to) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to)   params.set("to", to);
    return request("GET", `/activities?${params}`);
  },

  createActivity: (data) => request("POST", "/activities", data),

  completeActivity: (id) => request("PATCH", `/activities/${id}/complete`, {}),

  updateActivity: (id, data) => request("PUT", `/activities/${id}`, data),

  deleteActivity: (id) => request("DELETE", `/activities/${id}`),

  // Points
  getBalance: () => request("GET", "/points/balance"),

  getHistory: () => request("GET", "/points/history"),

  // Rewards
  getRewards: () => request("GET", "/rewards"),

  createReward: (data) => request("POST", "/rewards", data),

  redeemReward: (id) => request("POST", `/rewards/${id}/redeem`, {}),

  deleteReward: (id) => request("DELETE", `/rewards/${id}`),

  // Profile
  getProfile: () => request("GET", "/profile")
};
