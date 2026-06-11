import axios from 'axios';

import { API_BASE_URL } from './baseUrl.js';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request cancellation helper
export const createRequestController = () => new AbortController();

// Request interceptor: attach auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tp_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: unified error handling + data unwrap + 401 auto-refresh retry
apiClient.interceptors.response.use(
  (response) => {
    // Backend wrapper format: { success: true, data: ..., meta: ... }
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.error?.message || 'Request failed'));
      }
      return { ...response, data: body.data, meta: body.meta };
    }
    return response;
  },
  async (error) => {
    const originalConfig = error.config;
    const status = error.response?.status;

    // 401 auto-refresh token (single retry only)
    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        let rt = null;
        if (typeof window !== 'undefined') {
          rt = localStorage.getItem('tp_refresh_token');
        }
        if (!rt) throw new Error('No refresh token');
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: rt },
          { headers: { 'Content-Type': 'application/json' } },
        );
        const body = refreshRes.data;
        const data = body && typeof body === 'object' && 'success' in body ? body.data : body;
        if (data?.accessToken) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('tp_access_token', data.accessToken);
            if (data.refreshToken) localStorage.setItem('tp_refresh_token', data.refreshToken);
          }
          originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalConfig);
        }
      } catch {
        // Refresh failed, clear auth state and continue with original error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tp_access_token');
          localStorage.removeItem('tp_refresh_token');
          localStorage.removeItem('tp_user');
        }
      }
    }

    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Network request failed';
    if (import.meta.env.DEV) {
      console.error('[API Error]', message);
    }
    return Promise.reject(new Error(message));
  },
);
