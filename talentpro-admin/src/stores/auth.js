import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import client from '@/api/client.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('tp_admin_token') || '');
  const user = ref(null);

  const isLoggedIn = computed(() => !!token.value);

  // RBAC：权限列表（从 user.permissions 或 user.role 推导）
  const permissions = computed(() => {
    if (!user.value) return [];
    return user.value.permissions || [];
  });

  const hasPermission = (perm) => {
    if (!user.value) return false;
    // SUPER_ADMIN 拥有全部权限
    if (user.value.role === 'SUPER_ADMIN') return true;
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

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    token.value = res.data.accessToken;
    localStorage.setItem('tp_admin_token', token.value);
    await fetchProfile();
    return res;
  };

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/me');
      user.value = res.data;
    } catch {
      logout();
    }
  };

  const logout = () => {
    token.value = '';
    user.value = null;
    localStorage.removeItem('tp_admin_token');
  };

  return { token, user, isLoggedIn, permissions, hasPermission, hasAnyPermission, hasAllPermissions, login, logout, fetchProfile };
});
