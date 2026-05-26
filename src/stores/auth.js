import { ref, computed } from 'vue';
import { apiClient } from '@/api/client.js';

const TOKEN_KEY = 'tp_access_token';
const USER_KEY = 'tp_user';

export function createAuth() {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '');
  const user = ref(null);

  try {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) user.value = JSON.parse(stored);
  } catch { /* ignore */ }

  const isLoggedIn = computed(() => !!token.value && !!user.value);

  const setToken = (t) => {
    token.value = t;
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  };

  const setUser = (u) => {
    user.value = u;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const data = res.data || res;
    if (data.accessToken) {
      setToken(data.accessToken);
      setUser(data.user);
      // refresh token 也可以存 localStorage
      if (data.refreshToken) localStorage.setItem('tp_refresh_token', data.refreshToken);
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

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('tp_refresh_token');
  };

  const refreshToken = async () => {
    const rt = localStorage.getItem('tp_refresh_token');
    if (!rt) throw new Error('无刷新令牌');
    const res = await apiClient.post('/auth/refresh', { refreshToken: rt });
    const data = res.data || res;
    if (data.accessToken) {
      setToken(data.accessToken);
      if (data.refreshToken) localStorage.setItem('tp_refresh_token', data.refreshToken);
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
  };
}
