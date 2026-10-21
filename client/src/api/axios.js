import axios from 'axios';

// Default to a relative `/api` path in development so Vite can proxy requests.
// In production, prefer an env var `VITE_API_URL`. If the page is loaded
// over HTTPS and the provided base URL uses HTTP, upgrade it to HTTPS to
// avoid mixed-content blocking by browsers.
let baseURL = import.meta.env.VITE_API_URL || '/api';
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && typeof baseURL === 'string' && baseURL.startsWith('http:')) {
  baseURL = baseURL.replace(/^http:/, 'https:');
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true;
      try {
        // Use the same `api` instance so the request goes through the dev proxy
        // and includes cookies (withCredentials is already enabled on `api`).
        await api.post('/auth/refresh-token', {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Let the application handle the auth failure (e.g., via ProtectedRoute redirect)
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Rewrite any absolute http URLs to https when the page is served over HTTPS
api.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        if (config.url && /^http:/i.test(config.url)) {
          config.url = config.url.replace(/^http:/i, 'https:');
          console.warn('[api] Upgraded request URL to HTTPS:', config.url);
        }

        if (config.baseURL && /^http:/i.test(config.baseURL)) {
          config.baseURL = config.baseURL.replace(/^http:/i, 'https:');
          console.warn('[api] Upgraded baseURL to HTTPS:', config.baseURL);
        }
      }
    } catch (e) {
      // ignore
    }

    return config;
  },
  (err) => Promise.reject(err)
);

export default api;