import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/ai-interview';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    verifyOtp: (data) => api.post('/auth/verify-otp', data),
    logout: () => api.post('/auth/logout'),
};

export const profileApi = {
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    changePassword: (data) => api.post('/profile/change-password', data),
    uploadFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
};

export const cvApi = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/cvs/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    list: () => api.get('/cvs'),
    delete: (id) => api.delete(`/cvs/${id}`),
    setCurrent: (id) => api.put(`/cvs/${id}/set-current`),
};

export const adminPricingPlansApi = {
    getAll: () => api.get('/admin/pricing-plans'),
    create: (data) => api.post('/admin/pricing-plans', data),
    update: (id, data) => api.put(`/admin/pricing-plans/${id}`, data),
    delete: (id) => api.delete(`/admin/pricing-plans/${id}`)
};

export const publicPricingPlansApi = {
    getAll: () => api.get('/pricing-plans')
};

export const paymentApi = {
    subscribe: (planId) => api.post('/payments/subscribe', { planId }),
};

export default api;
