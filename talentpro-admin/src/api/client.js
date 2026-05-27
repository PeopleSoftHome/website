import axios from 'axios';
import { useAuthStore } from '@/stores/auth.js';
import router from '@/router';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const originalConfig = err.config;
    const status = err.response?.status;

    // 401 自动刷新 token（仅一次重试）
    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const auth = useAuthStore();
        const rt = auth.refreshToken;
        if (!rt) throw new Error('无刷新令牌');
        const refreshRes = await axios.post(
          `${client.defaults.baseURL}/auth/refresh`,
          { refreshToken: rt },
          { headers: { 'Content-Type': 'application/json' } },
        );
        const data = refreshRes.data?.data || refreshRes.data;
        if (data?.accessToken) {
          auth.setToken(data.accessToken);
          if (data.refreshToken) auth.setRefreshToken(data.refreshToken);
          originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
          return client(originalConfig);
        }
      } catch {
        // 刷新失败，静默登出并跳转
      }
    }

    if (status === 401) {
      const auth = useAuthStore();
      auth.logout();
      router.push('/login');
    }

    const message = err.response?.data?.error?.message || err.message || '网络请求失败';
    return Promise.reject(new Error(message));
  }
);

export default client;
