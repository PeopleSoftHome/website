import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import client from '@/api/client.js';

const USER_KEY = 'tp_admin_user';

const loadUserFromStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveUserToStorage = (user) => {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

export const useAuthStore = defineStore('auth', () => {
  const user = ref(loadUserFromStorage());

  const isLoggedIn = computed(() => !!user.value);

  const role = computed(() => {
    if (!user.value) return '';
    const r = user.value.role;
    if (typeof r === 'object' && r?.name) return r.name;
    return typeof r === 'string' ? r : '';
  });

  const permissions = computed(() => {
    if (!user.value) return [];
    const perms = user.value.role?.permissions || user.value.permissions || [];
    return perms.map((p) => (typeof p === 'string' ? p : `${p.resource}:${p.action}`));
  });

  const hasPermission = (perm) => {
    if (!user.value) return false;
    if (role.value === 'SUPER_ADMIN') return true;
    return permissions.value.includes(perm);
  };

  const hasAnyPermission = (perms) => {
    if (!Array.isArray(perms)) return hasPermission(perms);
    return perms.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (perms) => {
    if (!Array.isArray(perms)) return hasPermission(perms);
    return perms.every((p) => hasPermission(p));
  };

  const setUser = (u) => {
    user.value = u || null;
    saveUserToStorage(u);
  };

  const normalizeUser = (userData) => {
    if (userData && typeof userData.role === 'object' && userData.role?.name) {
      userData.role = userData.role.name;
    }
    return userData;
  };

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password }, { _skipRefresh: true });
    const data = res.data || res;
    setUser(normalizeUser(data.user));
    return res;
  };

  const devLogin = async () => {
    const res = await client.post('/auth/dev-login', {}, { _skipRefresh: true });
    const data = res.data || res;
    setUser(normalizeUser(data.user));
    return res;
  };

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/me');
      const userData = res.data || res;
      setUser(normalizeUser(userData));
      return userData;
    } catch {
      await logout();
      throw new Error('获取用户信息失败');
    }
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout', {}, { _skipRefresh: true });
    } catch {
      // 后端登出失败仍继续清理本地状态
    }
    setUser(null);
  };

  return {
    user,
    isLoggedIn,
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    setUser,
    login,
    devLogin,
    logout,
    fetchProfile,
  };
});
