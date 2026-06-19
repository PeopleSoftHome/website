import axios from 'axios';

import { API_BASE_URL } from './baseUrl.js';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request cancellation helper
export const createRequestController = () => new AbortController();

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
    // 后端使用 httpOnly Cookie，refresh 请求会自动携带 refresh token
    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const baseUrl = apiClient.defaults.baseURL.replace(/\/$/, '');
        await axios.post(
          `${baseUrl}/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
        );
        // 新 token 已通过 Set-Cookie 写入，直接重试原请求
        return apiClient(originalConfig);
      } catch {
        // Refresh failed, clear auth state and continue with original error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tp_user');
        }
      }
    }

    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Network request failed';
    if (import.meta.env.DEV && !originalConfig?.silent) {
      console.error('[API Error]', message);
    }
    return Promise.reject(new Error(message));
  },
);
