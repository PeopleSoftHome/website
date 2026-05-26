import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tp_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一错误处理 + 数据解包
apiClient.interceptors.response.use(
  (response) => {
    // 后端包装格式: { success: true, data: ..., meta: ... }
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.error?.message || '请求失败'));
      }
      return { ...response, data: body.data, meta: body.meta };
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      '网络请求失败';
    if (import.meta.env.DEV) {
      console.error('[API Error]', message, error.config?.url);
    }
    return Promise.reject(new Error(message));
  },
);
