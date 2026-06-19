import * as Sentry from '@sentry/vue';
import type { App } from 'vue';

interface SentryOptions {
  dsn?: string;
  appEnv?: string;
}

export function initSentry(app: App, options: SentryOptions = {}) {
  const { dsn, appEnv = 'development' } = options;
  if (!dsn) {
    if (appEnv === 'development') {
      console.log('[Sentry] DSN not configured, skipping initialization');
    }
    return;
  }

  Sentry.init({
    app,
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: appEnv === 'production' ? 0.1 : 1.0,
    environment: appEnv,
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
