import axios from 'axios';
import { storage } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/ai-interview';

const api = axios.create({
    baseURL: API_BASE_URL,
});

const isExpiredJwt = (token) => {
    const parts = token?.split('.');
    if (!parts || parts.length !== 3) return true;

    try {
        const payloadPart = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const paddedPayload = payloadPart.padEnd(payloadPart.length + (4 - payloadPart.length % 4) % 4, '=');
        const payload = JSON.parse(window.atob(paddedPayload));
        return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
};

const getUsableToken = () => {
    const token = storage.getToken();
    if (!token) return null;
    if (isExpiredJwt(token)) {
        storage.clearAuth();
        window.dispatchEvent(new Event('jobprep:user-updated'));
        return null;
    }
    return token;
};

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = config.skipAuth ? null : getUsableToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (import.meta.env.DEV && config.url?.startsWith('/admin/')) {
            console.debug('[JobPrep API]', config.method?.toUpperCase(), config.url, {
                hasToken: Boolean(token),
                hasAuthorization: Boolean(config.headers.Authorization),
            });
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url || '';
        const skipAuthRedirect = Boolean(error?.config?.skipAuthRedirect);
        const skipAuth = Boolean(error?.config?.skipAuth);
        if (status === 401 && !requestUrl.startsWith('/auth/') && !skipAuthRedirect && !skipAuth) {
            storage.clearAuth();
            window.dispatchEvent(new Event('jobprep:user-updated'));
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
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
    getParsedData: () => api.get('/cvs/current/parsed-data'),
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
    getActive: (config = {}) => api.get('/experience-levels', { skipAuth: true, ...config }),
};

export const dashboardApi = {
    get: () => api.get('/dashboard'),
};

export const notificationApi = {
    list: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    get: (id) => api.get(`/notifications/${id}`),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    getPreferences: () => api.get('/notifications/preferences'),
    updatePreferences: (data) => api.put('/notifications/preferences', data),
};

export const questionBankApi = {
    list: (params, config = {}) => api.get('/question-bank', { ...config, params }),
    get: (id, config = {}) => api.get(`/question-bank/${id}`, config),
    getTopics: (config = {}) => api.get('/question-bank/topics', { skipAuth: true, ...config }),
    getRoles: (config = {}) => api.get('/question-bank/roles', { skipAuth: true, ...config }),
    getBookmarks: (config = {}) => api.get('/question-bank/bookmarks', config),
    bookmark: (id) => api.post(`/question-bank/${id}/bookmark`),
    removeBookmark: (id) => api.delete(`/question-bank/${id}/bookmark`),
    startPractice: (data) => api.post('/question-bank/practice/sessions', data),
    submitPracticeAnswer: (sessionId, data) => api.post(`/question-bank/practice/sessions/${sessionId}/answers`, data),
    getPracticeAnswers: (sessionId) => api.get(`/question-bank/practice/sessions/${sessionId}/answers`),
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

export const adminInterviewApi = {
    getSessions: (params) => api.get('/admin/interviews/sessions', { params }),
    getSession: (id) => api.get(`/admin/interviews/sessions/${id}`),
    getAnalytics: () => api.get('/admin/interviews/analytics'),
    getReports: () => api.get('/admin/interviews/reports'),
    exportReports: () => api.get('/admin/interviews/reports/export', { responseType: 'blob' }),
};

export const adminUsersApi = {
    getUsers: (params) => api.get('/admin/users', { params }),
    banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
    unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
};

export const adminJobsApi = {
    getGroups: () => api.get('/admin/jobs/groups', { skipAuthRedirect: true }),
    createGroup: (data) => api.post('/admin/jobs/groups', data, { skipAuthRedirect: true }),
    updateGroup: (id, data) => api.put(`/admin/jobs/groups/${id}`, data, { skipAuthRedirect: true }),
    deleteGroup: (id) => api.delete(`/admin/jobs/groups/${id}`, { skipAuthRedirect: true }),
    getCategories: (params) => api.get('/admin/jobs/categories', { params, skipAuthRedirect: true }),
    createCategory: (data) => api.post('/admin/jobs/categories', data, { skipAuthRedirect: true }),
    updateCategory: (id, data) => api.put(`/admin/jobs/categories/${id}`, data, { skipAuthRedirect: true }),
    deleteCategory: (id) => api.delete(`/admin/jobs/categories/${id}`, { skipAuthRedirect: true }),
    getRoles: (params) => api.get('/admin/jobs/roles', { params, skipAuthRedirect: true }),
    createRole: (data) => api.post('/admin/jobs/roles', data, { skipAuthRedirect: true }),
    updateRole: (id, data) => api.put(`/admin/jobs/roles/${id}`, data, { skipAuthRedirect: true }),
    deleteRole: (id) => api.delete(`/admin/jobs/roles/${id}`, { skipAuthRedirect: true }),
};

export const adminQuestionBankApi = {
    getAll: (params) => api.get('/admin/question-bank', { params, skipAuthRedirect: true }),
    create: (data) => api.post('/admin/question-bank', data, { skipAuthRedirect: true }),
    update: (id, data) => api.put(`/admin/question-bank/${id}`, data, { skipAuthRedirect: true }),
    delete: (id) => api.delete(`/admin/question-bank/${id}`, { skipAuthRedirect: true }),
    setActive: (id, isActive) => api.patch(`/admin/question-bank/${id}/active`, { isActive }, { skipAuthRedirect: true }),
    import: (data) => api.post('/admin/question-bank/import', data, { skipAuthRedirect: true }),
};

export const adminPromosApi = {
    getAll: () => api.get('/admin/promos'),
    create: (data) => api.post('/admin/promos', data),
    update: (id, data) => api.put(`/admin/promos/${id}`, data),
    delete: (id) => api.delete(`/admin/promos/${id}`),
};

export const adminExperienceLevelsApi = {
    getAll: () => api.get('/admin/experience-levels', { skipAuthRedirect: true }),
    create: (data) => api.post('/admin/experience-levels', data, { skipAuthRedirect: true }),
    update: (id, data) => api.put(`/admin/experience-levels/${id}`, data, { skipAuthRedirect: true }),
    delete: (id) => api.delete(`/admin/experience-levels/${id}`, { skipAuthRedirect: true }),
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
    getCurrentSubscription: (config = {}) => api.get('/payments/current', config),
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
    list: (params) => api.get('/interview-sessions', { params }),
    start: (id, data) => api.post(`/interview-sessions/${id}/start`, data || {}),
    submitAnswer: (id, data) => api.post(`/interview-sessions/${id}/answers`, data),
    uploadRecording: (id, data) => {
        const token = storage.getToken();
        if (token && data instanceof FormData && !data.has('authToken')) {
            data.append('authToken', token);
        }
        return api.post(`/interview-sessions/${id}/recordings`, data, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            skipAuthRedirect: true
        });
    },
    complete: (id) => api.post(`/interview-sessions/${id}/complete`),
    delete: (id) => api.delete(`/interview-sessions/${id}`),
};

export const behaviorApi = {
    /** Start a new behavior monitoring session on the AI server */
    start: () => api.post('/behavior/start'),

    /** Upload one webcam frame for face/gaze analysis
     * @param {string} sessionId  behavior session id from /behavior/start
     * @param {Blob}   frameBlob  JPEG/PNG image blob
     * @param {number} [timestamp] optional unix timestamp in seconds
     */
    sendFrame: (sessionId, frameBlob, timestamp) => {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('file', frameBlob, 'frame.jpg');
        if (timestamp != null) formData.append('timestamp', String(timestamp));
        return api.post('/behavior/frame', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /** End a behavior monitoring session and get the full behavior report */
    end: (sessionId) => api.post('/behavior/end', { session_id: sessionId }),
};

export const aiHelpersApi = {
    checkCvJd: (data) => api.post('/ai-helpers/check-cv-jd', data),
    checkCurrentCvJd: (data) => api.post('/ai-helpers/check-current-cv-jd', data),
    checkCvJdFile: (file, jobDescription, outputLanguage = 'en') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('job_description', jobDescription);
        formData.append('output_language', outputLanguage);
        return api.post('/ai-helpers/check-cv-jd-file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    extractAndCheck: (file, jobDescription, outputLanguage = 'en') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('job_description', jobDescription);
        formData.append('output_language', outputLanguage);
        return api.post('/ai-helpers/extract-and-check', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    generateQuestions: (data) => api.post('/ai-helpers/generate-questions', data),
};

export default api;

