import { apiClient } from '@/shared/api/client';

/**
 * 在 Nuxt 应用启动时，将 axios 实例的 baseURL 设置为 runtimeConfig.public.apiBaseUrl。
 * 这样 SSG 生产构建后也能使用 NUXT_PUBLIC_API_BASE_URL 指向真实后端。
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  if (config.public.apiBaseUrl) {
    apiClient.defaults.baseURL = config.public.apiBaseUrl;
  }
});
