/**
 * Auth Store — Pinia 版
 * 替代 legacy createAuth() factory，支持 SSR/SSG 安全
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/api/client.js';

const TOKEN_KEY = 'tp_access_token';
const USER_KEY = 'tp_user';
const REFRESH_KEY = 'tp_refresh_token';

export const useAuthStore = defineStore('auth', () => {
  const token = ref('');
  const user = ref(null);

  /* 客户端初始化时从 localStorage 恢复 */
  const initFromStorage = () => {
    if (typeof window === 'undefined') return;
    token.value = localStorage.getItem(TOKEN_KEY) || '';
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) user.value = JSON.parse(stored);
    } catch { /* ignore */ }
  };

  const isLoggedIn = computed(() => !!token.value && !!user.value);

  const setToken = (t) => {
    token.value = t;
    if (typeof window === 'undefined') return;
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  };

  const setUser = (u) => {
    user.value = u;
    if (typeof window === 'undefined') return;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const data = res.data || res;
    if (data.accessToken) {
      setToken(data.accessToken);
      setUser(data.user);
      if (data.refreshToken && typeof window !== 'undefined') {
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
      }
      return data.user;
    }
    throw new Error('登录响应异常');
  };

  const register = async (data) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data || res;
  };

  const fetchProfile = async () => {
    const res = await apiClient.get('/auth/me');
    const u = res.data || res;
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      const rt = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
      if (rt) await apiClient.post('/auth/logout', { refreshToken: rt });
    } catch {
      // 后端 logout 失败仍继续清理本地状态
    }
    setToken('');
    setUser(null);
    if (typeof window !== 'undefined') localStorage.removeItem(REFRESH_KEY);
  };

  const refreshToken = async () => {
    const rt = typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
    if (!rt) throw new Error('No refresh token');
    const res = await apiClient.post('/auth/refresh', { refreshToken: rt });
    const data = res.data || res;
    if (data.accessToken) {
      setToken(data.accessToken);
      if (data.refreshToken && typeof window !== 'undefined') {
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
      }
      return data.accessToken;
    }
    throw new Error('刷新失败');
  };

  return {
    token,
    user,
    isLoggedIn,
    setUser,
    login,
    register,
    fetchProfile,
    logout,
    refreshToken,
    initFromStorage,
  };
});
