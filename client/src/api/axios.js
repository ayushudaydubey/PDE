import axios from 'axios';

// For single deployment on Render, frontend and backend share the same domain,
// so requests to `/api` automatically route to the backend's `/api/*` endpoints.
let baseURL = import.meta.env.VITE_API_URL || '/api';

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

        await api.post('/auth/refresh-token', {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


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

    }

    return config;
  },
  (err) => Promise.reject(err)
);

export default api;