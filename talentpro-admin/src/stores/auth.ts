/**
 * auth 模块
 *
 * 位于: stores/auth.ts
 */
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import client from '@/api/client';

const USER_KEY = 'tp_admin_user';

export interface PermissionObject {
  resource: string;
  action: string;
}

export interface AdminRole {
  name: string;
  permissions?: Array<string | PermissionObject>;
}

export interface AdminUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string | AdminRole;
  permissions?: Array<string | PermissionObject>;
  [key: string]: unknown;
}

const loadUserFromStorage = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
};

const saveUserToStorage = (user: AdminUser | null): void => {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(loadUserFromStorage());

  const isLoggedIn = computed(() => !!user.value);

  const role = computed<string>(() => {
    if (!user.value) return '';
    const r = user.value.role;
    if (typeof r === 'object' && r?.name) return r.name;
    return typeof r === 'string' ? r : '';
  });

  const permissions = computed<string[]>(() => {
    if (!user.value) return [];
    const rolePerms = typeof user.value.role === 'object' ? user.value.role?.permissions : undefined;
    const perms = rolePerms || user.value.permissions || [];
    return perms.map((p) => (typeof p === 'string' ? p : `${p.resource}:${p.action}`));
  });

  const hasPermission = (perm: string): boolean => {
    if (!user.value) return false;
    if (role.value === 'SUPER_ADMIN') return true;
    return permissions.value.includes(perm);
  };

  const hasAnyPermission = (perms: string | string[]): boolean => {
    if (!Array.isArray(perms)) return hasPermission(perms);
    return perms.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (perms: string | string[]): boolean => {
    if (!Array.isArray(perms)) return hasPermission(perms);
    return perms.every((p) => hasPermission(p));
  };

  const setUser = (u: AdminUser | null): void => {
    user.value = u || null;
    saveUserToStorage(u);
  };

  const normalizeUser = (userData: AdminUser): AdminUser => {
    if (userData && typeof userData.role === 'object' && userData.role?.name) {
      userData.role = userData.role.name;
    }
    return userData;
  };

  const login = async (email: string, password: string) => {
    const res = await client.post('/auth/login', { email, password }, { _skipRefresh: true } as Record<string, unknown>);
    const data = (res as { data?: { user: AdminUser } }).data || (res as unknown as { user: AdminUser });
    setUser(normalizeUser(data.user));
    return res;
  };

  const devLogin = async () => {
    const res = await client.post('/auth/dev-login', {}, { _skipRefresh: true } as Record<string, unknown>);
    const data = (res as { data?: { user: AdminUser } }).data || (res as unknown as { user: AdminUser });
    setUser(normalizeUser(data.user));
    return res;
  };

  const fetchProfile = async (): Promise<AdminUser> => {
    try {
      const res = await client.get('/auth/me');
      const userData = ((res as { data?: AdminUser }).data || res) as AdminUser;
      setUser(normalizeUser(userData));
      return userData;
    } catch {
      await logout();
      throw new Error('获取用户信息失败');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await client.post('/auth/logout', {}, { _skipRefresh: true } as Record<string, unknown>);
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
