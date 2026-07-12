import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

import { API_BASE_URL } from './baseUrl';
import { STORAGE_KEYS } from '@/constants/storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: { message?: string };
}

// Request cancellation helper
export const createRequestController = () => new AbortController();

// Response interceptor: unified error handling + data unwrap + 401 auto-refresh retry
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend wrapper format: { success: true, data: ..., meta: ... }
    const body = response.data as ApiResponseBody;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.error?.message || 'Request failed'));
      }
      return { ...response, data: body.data, meta: body.meta };
    }
    return response;
  },
  async (error) => {
    const originalConfig = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;

    // 401 auto-refresh token (single retry only)
    // 后端使用 httpOnly Cookie，refresh 请求会自动携带 refresh token
    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
        await axios.post(
          `${baseUrl}/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
        );
        // 新 token 已通过 Set-Cookie 写入；通知应用层重新同步用户状态
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:refresh'));
        }
        return apiClient(originalConfig);
      } catch {
        // Refresh failed, clear auth state and continue with original error
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }

    return Promise.reject(error);
  },
);

// Request interceptor: attach session id header for anonymous tracking
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID) || localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId;
    }
  }
  return config;
});
