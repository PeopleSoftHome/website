/**
 * Nuxt Plugin — Sentry 初始化
 * 替代原 main.js 中的 initSentry
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const sentryDsn = config.public.sentryDsn;

  if (!sentryDsn || import.meta.env.DEV) return;

  // 动态导入 Sentry，避免开发环境加载
  import('@/utils/sentry.js').then(({ initSentry }) => {
    initSentry(nuxtApp.vueApp, { dsn: sentryDsn, appEnv: config.public.appEnv || 'development' });
  }).catch(() => {
    // Sentry 初始化失败静默处理
  });
});
