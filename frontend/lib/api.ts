import axios from 'axios';
import { getToken, clearToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Typed API Wrappers
export const chatApi = {
  sendMessage: async (message: string, options: { 
    conversation_id?: number; 
    ministry_context?: string; 
    language?: string; 
    model?: string 
  }) => {
    // For streaming, we use fetch directly since axios and streaming is complex
    const token = getToken();
    return fetch(`${API_BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, ...options }),
    });
  },
  
  getConversations: () => api.get('/api/chat/conversations'),
  getMessages: (id: number) => api.get(`/api/chat/conversations/${id}/messages`),
};

export const authApi = {
  login: (credentials: any) => api.post('/api/auth/login', credentials),
  getMe: () => api.get('/api/auth/me'),
};

export const adminApi = {
  getStats: () => api.get('/api/audit/stats'),
  getLogs: (params: any) => api.get('/api/audit/logs', { params }),
  exportLogs: () => `${API_BASE_URL}/api/audit/export`,
};

export const documentApi = {
  upload: (formData: FormData) => api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: () => api.get('/api/documents/list'),
};

export const policyApi = {
  getRules: () => api.get('/api/policy/rules'),
  createRule: (rule: any) => api.post('/api/policy/rules', rule),
  updateRule: (id: number, rule: any) => api.put(`/api/policy/rules/${id}`, rule),
  deleteRule: (id: number) => api.delete(`/api/policy/rules/${id}`),
  testRule: (payload: { query: string; ministry: string; clearance_level: number }) =>
    api.post('/api/policy/rules/test', payload),
};
