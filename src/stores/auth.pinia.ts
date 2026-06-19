/**
 * Auth Store — Pinia 版（cookie-based，无 localStorage token）
 * Access/Refresh Token 由后端以 httpOnly Cookie 下发，前端不存储 token。
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/api/client.js';

const USER_KEY = 'tp_user';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);

  /* 客户端初始化时从 localStorage 恢复用户信息（token 不在 localStorage） */
  const initFromStorage = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) user.value = JSON.parse(stored);
    } catch { /* ignore */ }
  };

  const isLoggedIn = computed(() => !!user.value);

  const setUser = (u) => {
    user.value = u;
    if (typeof window === 'undefined') return;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const data = res.data || res;
    if (data.user) {
      setUser(data.user);
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
      await apiClient.post('/auth/logout', {});
    } catch {
      // 后端 logout 失败仍继续清理本地状态
    }
    setUser(null);
  };

  const refreshToken = async () => {
    const res = await apiClient.post('/auth/refresh', {});
    const data = res.data || res;
    if (data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error('刷新失败');
  };

  return {
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
