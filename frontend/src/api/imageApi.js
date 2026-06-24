import axiosInstance from './axiosInstance';

export const generateImage = async (data) => {
    const response = await axiosInstance.post('/images/generate', data);
    return response.data;
};

export const getImageStatus = async (id) => {
    const response = await axiosInstance.get(`/images/${id}/status`);
    return response.data;
};
