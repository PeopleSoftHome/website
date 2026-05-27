import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求取消帮助函数
export const createRequestController = () => new AbortController();

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

// 响应拦截器：统一错误处理 + 数据解包 + 401 自动刷新重试
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
  async (error) => {
    const originalConfig = error.config;
    const status = error.response?.status;

    // 401 自动刷新 token（仅一次重试）
    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const rt = localStorage.getItem('tp_refresh_token');
        if (!rt) throw new Error('无刷新令牌');
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: rt },
          { headers: { 'Content-Type': 'application/json' } },
        );
        const body = refreshRes.data;
        const data = body && typeof body === 'object' && 'success' in body ? body.data : body;
        if (data?.accessToken) {
          localStorage.setItem('tp_access_token', data.accessToken);
          if (data.refreshToken) localStorage.setItem('tp_refresh_token', data.refreshToken);
          originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalConfig);
        }
      } catch (refreshErr) {
        // 刷新失败，清除登录态并继续抛出原错误
        localStorage.removeItem('tp_access_token');
        localStorage.removeItem('tp_refresh_token');
        localStorage.removeItem('tp_user');
      }
    }

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
