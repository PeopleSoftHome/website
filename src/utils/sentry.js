// Sentry 错误监控配置占位
// 安装依赖后取消注释: npm install @sentry/vue @sentry/tracing

/*
import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry(app) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    environment: import.meta.env.VITE_APP_ENV || 'development',
    beforeSend(event) {
      // 过滤敏感信息
      if (event.request?.headers?.Authorization) {
        delete event.request.headers.Authorization;
      }
      return event;
    },
  });
}
*/

export function initSentry() {
  // 占位：待接入 Sentry 后启用
  console.log('[Sentry] Monitoring not configured. Set VITE_SENTRY_DSN to enable.');
}
