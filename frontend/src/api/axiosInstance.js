import axios from 'axios';

/**
 * Axios Instance — Konfigurasi global HTTP client
 * 
 * Sesuai PRD Section 8:
 * - Base URL: http://localhost:8000/api/v1
 * - Format: JSON
 * - Authorization: Bearer {token}
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

/**
 * Request Interceptor
 * Menambahkan token Authorization ke setiap request
 * (PRD Section 8.5)
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handle 401 Unauthorized → redirect ke login
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Redirect ke login jika belum di halaman auth
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
