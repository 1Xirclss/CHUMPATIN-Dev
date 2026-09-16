// Detección dinámica y robusta de la URL del Backend
const getBaseUrl = () => {
  // 1. Si Vercel tiene configurada la variable VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }

  // 2. Si estamos navegando desde un celular o dominio web externo (ej. vercel.app)
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    // URL por defecto en Render si no se configuró en Vercel
    return "https://chumpatin-backend.onrender.com/api";
  }

  // 3. Entorno local en PC
  return "http://localhost:5000/api";
};

export const BASE_URL = getBaseUrl();

/**
 * Traduce y especifica cualquier error de red o de la API de forma humana y clara
 */
export const formatErrorMessage = (error, targetEndpoint = "") => {
  if (!error) return "Ocurrió un error inesperado al procesar la solicitud.";

  // Errores de conexión de red (Safari: 'Load failed', Chrome: 'Failed to fetch')
  if (
    error.name === "TypeError" ||
    error.message === "Load failed" ||
    error.message?.includes("Failed to fetch") ||
    error.message?.includes("NetworkError") ||
    error.isNetworkError
  ) {
    const isConnectingToLocalhost =
      BASE_URL.includes("localhost") || BASE_URL.includes("127.0.0.1");
    const isFromMobileOrWeb =
      typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1");

    if (isFromMobileOrWeb && isConnectingToLocalhost) {
      return `⚠️ Error de conexión: El frontend en Vercel está intentando conectar a '${BASE_URL}', que es local de tu PC. Debes configurar la variable de entorno VITE_API_URL en Vercel con la URL de Render.`;
    }

    return `⚠️ No se pudo conectar con el servidor backend (${BASE_URL}). Si el servidor está alojado en Render (plan gratuito), suele 'dormirse' tras 15 minutos y tarda 45 segundos en despertar. Por favor espera 30 segundos y vuelve a intentar.`;
  }

  // Mensaje explícito devuelto por el backend
  if (error.data?.message) {
    return error.data.message;
  }

  // Códigos de estado HTTP
  if (error.status === 400) {
    return error.data?.message || "Los datos ingresados son inválidos o faltan campos obligatorios.";
  }
  if (error.status === 401) {
    return error.data?.message || "Credenciales inválidas o sesión vencida.";
  }
  if (error.status === 403) {
    return error.data?.message || "Acceso restringido: Cuenta pendiente de verificación con código OTP.";
  }
  if (error.status === 404) {
    return `Ruta no encontrada en el servidor: ${targetEndpoint}`;
  }
  if (error.status === 429) {
    return "Límite de peticiones alcanzado. Por favor espera un minuto antes de reintentar.";
  }
  if (error.status >= 500) {
    return `Error interno del servidor (${error.status}). Si el servicio en Render acaba de desplegarse, espera un momento.`;
  }

  return error.message || "Error de comunicación con el servidor.";
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("chumpatin_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "omit", // Usar Authorization Header para evitar conflictos de cookies entre dominios
    });
  } catch (networkError) {
    const detailedMessage = formatErrorMessage(networkError, endpoint);
    const err = new Error(detailedMessage);
    err.isNetworkError = true;
    err.originalError = networkError;
    throw err;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || `Error del servidor (${response.status}): ${response.statusText || "Respuesta no exitosa"}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Autenticación
  register: (data) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  verifyRegistration: (payload) => apiRequest("/auth/verify-registration", { method: "POST", body: JSON.stringify(payload) }),
  resendVerification: (email) => apiRequest("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),
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
