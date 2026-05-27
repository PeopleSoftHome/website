import * as Sentry from '@sentry/vue';

export function initSentry(app) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.log('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    app,
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    environment: import.meta.env.VITE_APP_ENV || 'development',
    beforeSend(event) {
      // 过滤敏感信息
      if (event.request?.headers?.Authorization) {
        delete event.request.headers.Authorization;
      }
      if (event.request?.headers?.authorization) {
        delete event.request.headers.authorization;
      }
      return event;
    },
  });
}
