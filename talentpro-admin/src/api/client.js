/**
 * client 模块
 *
 * 位于: api/client.js
 */
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.js';
import router from '@/router';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  timeout: 15000,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  // 认证信息通过后端 httpOnly Cookie 自动携带，不在前端保存/发送 token
  config.withCredentials = true;
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const originalConfig = err.config;
    const status = err.response?.status;

    // 401 自动刷新 token（仅一次重试，跳过刷新/登出请求自身避免递归）
    if (status === 401 && originalConfig && !originalConfig._retry && !originalConfig._skipRefresh) {
      originalConfig._retry = true;
      try {
        await axios.post(
          `${client.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
        );
        // 新 token 已通过 Set-Cookie 写入，直接重试原请求
        return client(originalConfig);
      } catch {
        // 刷新失败，执行登出并跳转
      }
    }

    if (status === 401 && originalConfig && !originalConfig._skipRefresh) {
      const auth = useAuthStore();
      try {
        await auth.logout();
      } catch {
        // 登出请求失败也强制清理
        auth.setUser(null);
      }
      router.push('/login');
    }

    const message =
      err.response?.data?.error?.message || err.message || '网络请求失败';
    const error = new Error(message);
    error.response = err.response;
    error.status = err.response?.status;
    return Promise.reject(error);
  },
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
