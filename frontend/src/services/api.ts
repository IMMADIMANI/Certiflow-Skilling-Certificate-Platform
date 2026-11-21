import axios from 'axios';

const rawApi = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
const API_BASE = rawApi.replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('certiflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('certiflow_token');
      localStorage.removeItem('certiflow_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/verify')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  profile: () => api.get('/auth/profile'),
  demoAccounts: () => api.get('/auth/demo-accounts'),
};

export const batchApi = {
  list: () => api.get('/batches'),
  get: (id: string) => api.get(`/batches/${id}`),
  create: (data: any) => api.post('/batches', data),
  upload: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/batches/${id}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  submit: (id: string) => api.post(`/batches/${id}/submit`),
  overdue: () => api.get('/batches/overdue'),
};

export const approvalApi = {
  list: () => api.get('/approvals'),
  approve: (id: string, remarks?: string) => api.post(`/approvals/${id}/approve`, { remarks }),
  reject: (id: string, remarks: string) => api.post(`/approvals/${id}/reject`, { remarks }),
  returnBatch: (id: string, remarks: string) => api.post(`/approvals/${id}/return`, { remarks }),
};

export const qualityApi = {
  list: () => api.get('/quality'),
  review: (id: string, decision: string, remarks: string) =>
    api.post(`/quality/${id}/review`, { decision, remarks }),
};

export const stateApi = {
  pending: () => api.get('/state/batches'),
  all: () => api.get('/state/all-batches'),
  stats: () => api.get('/state/stats'),
  approve: (id: string, remarks?: string) => api.post(`/state/batches/${id}/approve`, { remarks }),
  reject: (id: string, remarks: string) => api.post(`/state/batches/${id}/reject`, { remarks }),
  cancelCert: (certId: string, reason: string) =>
    api.post(`/state/certificates/${certId}/cancel`, { reason }),
};

export const certApi = {
  list: () => api.get('/certificates'),
  downloadUrl: (id: string) => `${API_BASE}/api/certificates/${id}/download`,
};

export const auditApi = {
  list: (page = 1) => api.get(`/audit?page=${page}`),
};

export const verifyApi = {
  verify: (id: string) => api.get(`/verify/${id}`),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
};

export default api;
