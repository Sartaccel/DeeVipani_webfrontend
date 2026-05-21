// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// ── Attach token to EVERY request automatically ────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── If backend returns 401, clear storage and reload to login ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/Login";
    }
    return Promise.reject(error);
  }
);

export default api;