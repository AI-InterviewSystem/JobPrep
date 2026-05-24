import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/ai-interview';

const api = axios.create({
    baseURL: API_BASE_URL,
});

import { storage } from './storage';

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
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

export const jobDescriptionApi = {
    list: () => api.get('/job-descriptions'),
    get: (id) => api.get(`/job-descriptions/${id}`),
    create: (data) => api.post('/job-descriptions', data),
    delete: (id) => api.delete(`/job-descriptions/${id}`),
};

export const experienceLevelsApi = {
    getActive: () => api.get('/experience-levels'),
};

export const jobCategoryApi = {
    list: () => api.get('/jobs/categories'),
};

export const jobGroupApi = {
    list: () => api.get('/jobs/groups'),
};

export const adminPricingPlansApi = {
    getAll: () => api.get('/admin/pricing-plans'),
    create: (data) => api.post('/admin/pricing-plans', data),
    update: (id, data) => api.put(`/admin/pricing-plans/${id}`, data),
    delete: (id) => api.delete(`/admin/pricing-plans/${id}`)
};

export const adminDashboardApi = {
    getStats: () => api.get('/admin/dashboard/stats')
};

export const adminUsersApi = {
    getUsers: (params) => api.get('/admin/users', { params }),
    banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
    unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
};

export const adminJobsApi = {
    getGroups: () => api.get('/admin/jobs/groups'),
    createGroup: (data) => api.post('/admin/jobs/groups', data),
    updateGroup: (id, data) => api.put(`/admin/jobs/groups/${id}`, data),
    deleteGroup: (id) => api.delete(`/admin/jobs/groups/${id}`),
    getCategories: () => api.get('/admin/jobs/categories'),
    createCategory: (data) => api.post('/admin/jobs/categories', data),
    updateCategory: (id, data) => api.put(`/admin/jobs/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/admin/jobs/categories/${id}`),
    createRole: (data) => api.post('/admin/jobs/roles', data),
    updateRole: (id, data) => api.put(`/admin/jobs/roles/${id}`, data),
    deleteRole: (id) => api.delete(`/admin/jobs/roles/${id}`),
};

export const adminPromosApi = {
    getAll: () => api.get('/admin/promos'),
    create: (data) => api.post('/admin/promos', data),
    update: (id, data) => api.put(`/admin/promos/${id}`, data),
    delete: (id) => api.delete(`/admin/promos/${id}`),
};

export const adminExperienceLevelsApi = {
    getAll: () => api.get('/admin/experience-levels'),
    create: (data) => api.post('/admin/experience-levels', data),
    update: (id, data) => api.put(`/admin/experience-levels/${id}`, data),
    delete: (id) => api.delete(`/admin/experience-levels/${id}`),
};

export const publicPricingPlansApi = {
    getAll: () => api.get('/pricing-plans')
};

export const paymentApi = {
    subscribe: (data) => api.post('/payments/subscribe', data),
    getHistory: () => api.get('/payments/history'),
    getStatus: () => api.get('/payments/status'),
    cancel: () => api.post('/payments/cancel'),
    sync: (orderCode) => api.get(`/payments/sync/${orderCode}`),
    getCurrentSubscription: () => api.get('/payments/current'),
};

export const promoApi = {
    validate: (data) => api.post('/api/promo/validate', data),
};

export const feedbackApi = {
    submit: (data) => api.post('/feedbacks', data),
    getMine: () => api.get('/feedbacks/me'),
};

export const adminFeedbackApi = {
    getAll: () => api.get('/admin/feedbacks'),
    updateStatus: (id, data) => api.put(`/admin/feedbacks/${id}/status`, data),
    getHistory: (id) => api.get(`/admin/feedbacks/${id}/history`),
};

export const interviewSessionApi = {
    create: (data) => api.post('/interview-sessions', data),
    get: (id) => api.get(`/interview-sessions/${id}`),
    list: () => api.get('/interview-sessions'),
    start: (id) => api.post(`/interview-sessions/${id}/start`),
    submitAnswer: (id, data) => api.post(`/interview-sessions/${id}/answers`, data),
    complete: (id) => api.post(`/interview-sessions/${id}/complete`),
    delete: (id) => api.delete(`/interview-sessions/${id}`),
};

export const aiHelpersApi = {
    checkCvJd: (data) => api.post('/ai-helpers/check-cv-jd', data),
    checkCvJdFile: (data) => api.post('/ai-helpers/check-cv-jd-file', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    extractAndCheck: (data) => api.post('/ai-helpers/extract-and-check', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    generateQuestions: (data) => api.post('/ai-helpers/generate-questions', data),
};

export default api;

