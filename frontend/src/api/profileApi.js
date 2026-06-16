import api from './axiosInstance';

/**
 * Profile API Module
 * 
 * Endpoints (PRD Section 9.2):
 * - GET /profile
 * - PUT /profile
 * - PUT /profile/password
 * - GET /profile/stats
 */

export const profileApi = {
  /**
   * Lihat data profile user
   */
  getProfile: () => api.get('/profile'),

  /**
   * Update nama user
   * @param {{ name: string }} data
   */
  updateProfile: (data) => api.put('/profile', data),

  /**
   * Update password user
   * @param {{ current_password: string, password: string, password_confirmation: string }} data
   */
  updatePassword: (data) => api.put('/profile/password', data),

  /**
   * Statistik akun (jumlah chat, gambar, sisa kuota)
   */
  getStats: () => api.get('/profile/stats'),
};
