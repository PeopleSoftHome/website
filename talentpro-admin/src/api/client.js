import axios from 'axios';
import { useAuthStore } from '@/stores/auth.js';
import router from '@/router';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const originalConfig = err.config;
    const status = err.response?.status;

    // 401 自动刷新 token（仅一次重试）
    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const auth = useAuthStore();
        const rt = auth.refreshToken;
        if (!rt) throw new Error('无刷新令牌');
        const refreshRes = await axios.post(
          `${client.defaults.baseURL}/auth/refresh`,
          { refreshToken: rt },
          { headers: { 'Content-Type': 'application/json' } },
        );
        const data = refreshRes.data?.data || refreshRes.data;
        if (data?.accessToken) {
          auth.setToken(data.accessToken);
          if (data.refreshToken) auth.setRefreshToken(data.refreshToken);
          originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
          return client(originalConfig);
        }
      } catch {
        // 刷新失败，静默登出并跳转
      }
    }

    if (status === 401) {
      const auth = useAuthStore();
      auth.logout();
      router.push('/login');
    }

    const message = err.response?.data?.error?.message || err.message || '网络请求失败';
    const error = new Error(message);
    error.response = err.response;
    error.status = err.response?.status;
    return Promise.reject(error);
  }
);

/**
 * 统一分页响应解析
 * 支持后端多种分页返回格式：
 *   { data: Array, meta: { total } }      — CMS 通用
 *   { data: { items: Array, total: N } }   — Blog / Forum
 *   { data: Array }                        — 无分页（如 roles）
 */
export function normalizePaginationResponse(res) {
  if (!res) return { items: [], total: 0 };
  const data = res.data;
  if (Array.isArray(data)) {
    return { items: data, total: res.meta?.total ?? data.length };
  }
  if (data && typeof data === 'object') {
    return {
      items: data.items || data.data || [],
      total: data.total ?? data.meta?.total ?? 0,
    };
  }
  return { items: [], total: 0 };
}

export default client;
