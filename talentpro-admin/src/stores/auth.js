import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import client from '@/api/client.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('tp_admin_token') || '');
  const user = ref(null);

  const isLoggedIn = computed(() => !!token.value);

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

  return { token, user, isLoggedIn, login, logout, fetchProfile };
});
