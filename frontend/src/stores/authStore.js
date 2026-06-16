import { create } from 'zustand';
import { authApi } from '../api/authApi';

/**
 * Auth Store (Zustand)
 * 
 * Mengelola state autentikasi global:
 * - Token disimpan di localStorage
 * - User data disimpan di state + localStorage
 * - Menyediakan actions: login, register, logout, fetchUser
 * 
 * Sesuai PRD Section 8.5 (token-based auth)
 */
const useAuthStore = create((set, get) => ({
  // State
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  token: localStorage.getItem('auth_token') || null,
  isLoading: false,
  error: null,

  // Computed
  get isAuthenticated() {
    return !!get().token;
  },

  /**
   * Login — POST /auth/login
   */
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const { user, token } = response.data.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      set({ user, token, isLoading: false, error: null });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal. Coba lagi.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  /**
   * Register — POST /auth/register
   */
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      set({ isLoading: false, error: null });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registrasi gagal. Coba lagi.';
      const errors = error.response?.data?.errors || null;
      set({ isLoading: false, error: message });
      throw { message, errors };
    }
  },

  /**
   * Logout — POST /auth/logout
   */
  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Tetap logout di frontend meski API gagal
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null, error: null });
    }
  },

  /**
   * Fetch User — GET /auth/me
   * Digunakan saat app pertama kali load untuk validasi token
   */
  fetchUser: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await authApi.me();
      const user = response.data.data;

      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, isLoading: false });
    } catch {
      // Token invalid, clear everything
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null, isLoading: false });
    }
  },

  /**
   * Clear error state
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
