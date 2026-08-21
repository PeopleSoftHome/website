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

export const createRequestController = () => new AbortController();

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

// Request interceptor: session tracking + double-submit CSRF token.
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID) || localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (sessionId) config.headers['X-Session-Id'] = sessionId;

    const method = (config.method || 'get').toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = readCookie('tp_csrf_token');
      if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

// Response interceptor: unified error handling + 401 auto-refresh retry
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
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

    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
        await axios.post(
          `${baseUrl}/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
        );
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:refresh'));
        }
        return apiClient(originalConfig);
      } catch {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }

    return Promise.reject(error);
  },
);
