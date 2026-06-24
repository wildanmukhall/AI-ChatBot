import axiosInstance from './axiosInstance';

// ── Text-to-Image Generate ────────────────────────────────────────────────────

export const generateImage = async (data) => {
    const response = await axiosInstance.post('/images/generate', data);
    return response.data;
};

export const getImageStatus = async (id) => {
    const response = await axiosInstance.get(`/images/${id}/status`);
    return response.data;
};

// ── Image Gallery ─────────────────────────────────────────────────────────────

/**
 * Get paginated list of generated images with optional filters
 * @param {Object} params - { page, per_page, search, status, date_from, date_to, sort_by, sort_order }
 */
export const getImages = async (params = {}) => {
    const response = await axiosInstance.get('/images', { params });
    return response.data;
};

/**
 * Get detail of a single generated image
 * @param {number} id
 */
export const getImage = async (id) => {
    const response = await axiosInstance.get(`/images/${id}`);
    return response.data;
};

/**
 * Delete a generated image by id
 * @param {number} id
 */
export const deleteImage = async (id) => {
    const response = await axiosInstance.delete(`/images/${id}`);
    return response.data;
};
