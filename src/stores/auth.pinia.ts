/**
 * Auth Store — Pinia 版（cookie-based，无 localStorage token）
 * Access/Refresh Token 由后端以 httpOnly Cookie 下发，前端不存储 token。
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/shared/api/client';
import { STORAGE_KEYS } from '@/constants/storage';
import { ENDPOINTS } from '@/constants/endpoints';

const USER_KEY = STORAGE_KEYS.USER;

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
  avatar?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null);

  /* 客户端初始化时从 localStorage 恢复用户信息（token 不在 localStorage） */
  const initFromStorage = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) user.value = JSON.parse(stored) as UserInfo;
    } catch { /* ignore */ }
  };

  const isLoggedIn = computed(() => !!user.value);

  const setUser = (u: UserInfo | null) => {
    user.value = u;
    if (typeof window === 'undefined') return;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };

  const login = async (email: string, password: string): Promise<UserInfo> => {
    const res = await apiClient.post(ENDPOINTS.AUTH_LOGIN, { email, password });
    const data = (res.data || res) as { user?: UserInfo };
    if (data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error('登录响应异常');
  };

  const register = async (data: Record<string, unknown>): Promise<unknown> => {
    const res = await apiClient.post(ENDPOINTS.AUTH_REGISTER, data);
    return res.data || res;
  };

  const fetchProfile = async (): Promise<UserInfo> => {
    const res = await apiClient.get(ENDPOINTS.AUTH_ME);
    const u = (res.data || res) as UserInfo;
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH_LOGOUT, {});
    } catch {
      // 后端 logout 失败仍继续清理本地状态
    }
    setUser(null);
  };

  const refreshToken = async (): Promise<UserInfo> => {
    const res = await apiClient.post(ENDPOINTS.AUTH_REFRESH, {});
    const data = (res.data || res) as { user?: UserInfo };
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
