import api from './axiosInstance';

/**
 * Auth API Module
 * 
 * Endpoints (PRD Section 9.1):
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/logout
 * - GET  /auth/me
 */

export const authApi = {
  /**
   * Register pengguna baru
   * @param {{ name: string, email: string, password: string, password_confirmation: string }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Login pengguna
   * @param {{ email: string, password: string }} credentials
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Logout pengguna (menghapus token aktif)
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Mendapatkan data user yang sedang login
   */
  me: () => api.get('/auth/me'),
};
