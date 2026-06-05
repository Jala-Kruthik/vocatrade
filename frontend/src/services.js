import api from './client';

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Training Modules ──────────────────────────────
export const moduleAPI = {
  getAll: () => api.get('/modules'),
  getById: (id) => api.get(`/modules/${id}`),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
  signOff: (id) => api.put(`/modules/${id}/signoff`),
};

// ── Field Logs ────────────────────────────────────
export const logAPI = {
  getAll: () => api.get('/logs'),
  getSummary: () => api.get('/logs/summary'),
  create: (data) => api.post('/logs', data),
  update: (id, data) => api.put(`/logs/${id}`, data),
  delete: (id) => api.delete(`/logs/${id}`),
};

// ── AI Drills ─────────────────────────────────────
export const drillAPI = {
  getAll: () => api.get('/drills'),
  generate: (data) => api.post('/drills/generate', data),
  respond: (id, data) => api.post(`/drills/${id}/respond`, data),
  injectAnomaly: (moduleId) => api.post('/drills/inject-anomaly', { moduleId }),
  chat: (message, history) => api.post('/drills/chat', { message, history }),
};