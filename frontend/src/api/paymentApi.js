import axiosInstance from './axiosInstance';

/**
 * Payment API Module
 *
 * Endpoints (PRD Payment Gateway):
 * - GET  /pricing-plans         → Daftar pricing plan aktif
 * - POST /payments/checkout     → Buat order + dapat snap_token
 * - GET  /payments/{orderId}    → Detail order/payment
 * - GET  /payments              → Riwayat order user
 */

/**
 * Ambil semua pricing plan yang aktif
 */
export const getPricingPlans = () => axiosInstance.get('/pricing-plans');

/**
 * Checkout: buat order & dapatkan Midtrans snap_token
 * @param {{ pricing_plan_id: number }} data
 */
export const checkout = (data) => axiosInstance.post('/payments/checkout', data);

/**
 * Detail satu order/payment by orderId
 * @param {number} orderId
 */
export const getOrderDetail = (orderId) => axiosInstance.get(`/payments/${orderId}`);

/**
 * Riwayat semua order milik user yang login
 */
export const getOrders = () => axiosInstance.get('/payments');

/**
 * Sync status order dengan Midtrans (useful for localhost)
 * @param {number} orderId
 */
export const syncOrder = (orderId) => axiosInstance.post(`/payments/${orderId}/sync`);
