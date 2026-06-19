/**
 * 读取 Nuxt 3 runtimeConfig.public 中的公开配置
 * 统一替代 import.meta.env.VITE_*，确保 SSG 生产构建也能正确注入
 */
export function usePublicConfig() {
  const config = useRuntimeConfig();
  return {
    apiBaseUrl: config.public.apiBaseUrl || 'http://localhost:4000/api/v1',
    appEnv: config.public.appEnv || 'development',
    recaptchaSiteKey: config.public.recaptchaSiteKey || '',
    sentryDsn: config.public.sentryDsn || '',
    assetBaseUrl: config.public.assetBaseUrl || '/',
  };
}
