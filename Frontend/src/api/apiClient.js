const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("chumpatin_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "omit", // Using JWT in Authorization header for reliability across ports
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Error en la solicitud (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Autenticación
  register: (data) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (credentials) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
  getProfile: () => apiRequest("/auth/profile"),
  requestRecovery: (email) => apiRequest("/auth/request-recovery", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (payload) => apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) }),

  // Ventas y Boletos
  getSales: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/sales${query ? `?${query}` : ""}`);
  },
  getSaleById: (id) => apiRequest(`/sales/${id}`),
  createSale: (saleData) => apiRequest("/sales", { method: "POST", body: JSON.stringify(saleData) }),
  updateSale: (id, saleData) => apiRequest(`/sales/${id}`, { method: "PUT", body: JSON.stringify(saleData) }),
  togglePaymentStatus: (id) => apiRequest(`/sales/${id}/toggle-status`, { method: "PATCH" }),
  deliverWristband: (id, payload = {}) => apiRequest(`/sales/${id}/deliver-wristband`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteSale: (id) => apiRequest(`/sales/${id}`, { method: "DELETE" }),
  importExcel: (payload) => apiRequest("/sales/import-excel", { method: "POST", body: JSON.stringify(payload) }),
  clearAllData: () => apiRequest("/sales/clear-all", { method: "POST" }),

  // Reportes y Dashboard
  getDashboardStats: () => apiRequest("/reports/dashboard-stats"),

  // Configuración del Evento
  getSettings: () => apiRequest("/settings"),
  updateSettings: (settings) => apiRequest("/settings", { method: "PUT", body: JSON.stringify(settings) }),
};
