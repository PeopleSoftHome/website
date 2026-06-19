/**
 * useGlobalErrorReporter — 全局 JS/Vue 错误捕获并上报
 * 仅在客户端生效，生产环境通过 sendBeacon/fetch 上报到 /analytics/client-errors
 */
import { onErrorCaptured, onMounted, onUnmounted } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { apiClient } from '@/api/client.js';

export function useGlobalErrorReporter() {
  const reportError = (type: string, message: unknown, stack?: unknown) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      const sensitiveParams = ['token', 'refreshToken', 'invite', 'reset', 'password'];
      sensitiveParams.forEach((p) => url.searchParams.delete(p));

      const payload = {
        type,
        message: String(message).slice(0, 500),
        stack: String(stack).slice(0, 2000),
        url: url.toString(),
        ua: navigator.userAgent,
        time: new Date().toISOString(),
      };
      const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${baseUrl}/analytics/client-errors`, JSON.stringify(payload));
      } else {
        fetch(`${baseUrl}/analytics/client-errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // 上报失败静默处理
    }
  };

  onErrorCaptured((err, instance, info) => {
    if (import.meta.env.DEV) {
      const compName = instance?.$options?.name || (instance as unknown as { __name?: string })?.__name || 'unknown';
      console.error(`[Vue Error] Component: ${compName} | Info: ${info}`, err);
      console.trace('Error trace');
      throw err;
    }
    reportError('vue', err?.message, err?.stack);
    return false;
  });

  onMounted(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      reportError('js', message, error?.stack);
    };
    window.onunhandledrejection = (event) => {
      reportError('promise', event.reason?.message || event.reason, event.reason?.stack);
    };
  });

  onUnmounted(() => {
    window.onerror = null;
    window.onunhandledrejection = null;
  });

  return { reportError };
}
