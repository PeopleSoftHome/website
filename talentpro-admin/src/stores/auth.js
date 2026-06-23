import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import client from '@/api/client.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('tp_admin_token') || '');
  const refreshToken = ref(localStorage.getItem('tp_admin_refresh_token') || '');
  const user = ref(null);

  const isLoggedIn = computed(() => !!token.value);

  // 将后端返回的 role 对象或字符串统一归一化为角色名
  const role = computed(() => {
    if (!user.value) return '';
    const r = user.value.role;
    if (typeof r === 'object' && r?.name) return r.name;
    return typeof r === 'string' ? r : '';
  });

  // RBAC：权限列表（从 user.role.permissions 推导，格式为 resource:action）
  const permissions = computed(() => {
    if (!user.value) return [];
    const perms = user.value.role?.permissions || user.value.permissions || [];
    // 后端返回 { resource, action } 对象数组，转换为 resource:action 字符串数组
    return perms.map((p) => (typeof p === 'string' ? p : `${p.resource}:${p.action}`));
  });

  const hasPermission = (perm) => {
    if (!user.value) return false;
    // SUPER_ADMIN 拥有全部权限
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

  const setToken = (t) => {
    token.value = t;
    localStorage.setItem('tp_admin_token', t);
  };

  const setRefreshToken = (rt) => {
    refreshToken.value = rt;
    localStorage.setItem('tp_admin_refresh_token', rt);
  };

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    token.value = res.data.accessToken;
    refreshToken.value = res.data.refreshToken;
    localStorage.setItem('tp_admin_token', token.value);
    localStorage.setItem('tp_admin_refresh_token', refreshToken.value);
    await fetchProfile();
    return res;
  };

  const devLogin = async () => {
    const res = await client.post('/auth/dev-login', {});
    const data = res.data || res;
    token.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    localStorage.setItem('tp_admin_token', token.value);
    localStorage.setItem('tp_admin_refresh_token', refreshToken.value);
    await fetchProfile();
    return res;
  };

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/me');
      const userData = res.data || res;
      // 后端 role 返回的是 { id, name, permissions } 对象，转换为字符串
      if (userData && typeof userData.role === 'object' && userData.role?.name) {
        userData.role = userData.role.name;
      }
      user.value = userData;
    } catch {
      logout();
    }
  };

  const logout = () => {
    token.value = '';
    refreshToken.value = '';
    user.value = null;
    localStorage.removeItem('tp_admin_token');
    localStorage.removeItem('tp_admin_refresh_token');
  };

  return { token, refreshToken, user, isLoggedIn, role, permissions, hasPermission, hasAnyPermission, hasAllPermissions, setToken, setRefreshToken, login, devLogin, logout, fetchProfile };
});
