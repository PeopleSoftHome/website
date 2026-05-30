import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './baseUrl';

/**
 * API 客户端 — Axios 实例
 * ──────────────────────
 * 特性：
 * 1. 自动附加 Bearer Token（从 localStorage 读取）
 * 2. 统一解包后端响应 { success, data, meta }
 * 3. 401 自动刷新 token（单次重试）
 */

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

/* 请求拦截器：附加 Bearer Token */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('tp_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/* 响应拦截器：统一解包 + 401 自动刷新 */
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    // 后端已用 Symbol('transformed') 标记，此处判断解包
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data.data;
    }
    return data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('tp_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const data = res.data?.data || res.data;
        const newAccessToken = data.accessToken;

        localStorage.setItem('tp_access_token', newAccessToken);
        if (data.refreshToken) {
          localStorage.setItem('tp_refresh_token', data.refreshToken);
        }

        onRefreshed(newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('tp_access_token');
        localStorage.removeItem('tp_refresh_token');
        localStorage.removeItem('tp_user');
        window.location.reload();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function createRequestController(): AbortController {
  return new AbortController();
}
