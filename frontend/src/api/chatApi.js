import api from './axiosInstance';

/**
 * Chat API Module
 * 
 * Endpoints (PRD Section 9.3):
 * - GET    /chat-sessions
 * - POST   /chat-sessions
 * - GET    /chat-sessions/{id}
 * - DELETE /chat-sessions/{id}
 * - GET    /chat-sessions/{id}/messages
 * - POST   /chat-sessions/{id}/messages
 */

export const chatApi = {
  /**
   * Daftar chat sessions milik user
   * @param {{ per_page?: number, search?: string, page?: number }} params
   */
  getSessions: (params = {}) => api.get('/chat-sessions', { params }),

  /**
   * Buat chat session baru
   * @param {{ title?: string }} data
   */
  createSession: (data = {}) => api.post('/chat-sessions', data),

  /**
   * Detail satu chat session
   * @param {number} id
   */
  getSession: (id) => api.get(`/chat-sessions/${id}`),

  /**
   * Hapus chat session
   * @param {number} id
   */
  deleteSession: (id) => api.delete(`/chat-sessions/${id}`),

  /**
   * Daftar pesan dalam session
   * @param {number} sessionId
   * @param {{ per_page?: number, page?: number }} params
   */
  getMessages: (sessionId, params = {}) => 
    api.get(`/chat-sessions/${sessionId}/messages`, { params }),

  /**
   * Kirim pesan baru (trigger AI response)
   * @param {number} sessionId
   * @param {{ message: string }} data
   */
  sendMessage: (sessionId, data) => 
    api.post(`/chat-sessions/${sessionId}/messages`, data),
};
