/**
 * useAnalytics — 数据埋点 Composable
 * ──────────────────────────────────
 * 最小化埋点，服务业务决策。检查 Cookie 同意（analytics）后发送。
 * 开发模式打印日志，生产模式写入 window.tp_analytics 队列。
 */
import { ref, readonly } from 'vue';
import { apiClient } from '@/api/client.js';

function readConsent() {
  try {
    const raw = localStorage.getItem('tp-cookie-consent');
    if (raw) return JSON.parse(raw).analytics === true;
  } catch { /* ignore */ }
  return false;
}

function getSessionId() {
  if (typeof window === 'undefined') return 'server';
  let sid = localStorage.getItem('tp-session-id');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('tp-session-id', sid);
  }
  return sid;
}

function flushQueue() {
  if (typeof window === 'undefined') return;
  const q = window.tp_analytics || [];
  window.tp_analytics = {
    push: (evt) => {
      q.push(evt);
      if (import.meta.env.DEV) console.log('[Analytics]', evt);
    },
  };
}

// 批量上报到后端（防抖）
let flushTimer = null;
function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    const queue = window.tp_analytics?._queue || [];
    if (queue.length === 0) return;
    window.tp_analytics._queue = [];
    apiClient.post('/analytics/events', { events: queue }).catch(() => {});
  }, 5000);
}

export function useAnalytics() {
  const enabled = ref(readConsent());

  const track = (event, props = {}) => {
    if (!enabled.value) return;
    const payload = {
      event,
      properties: { ...props, ts: Date.now(), url: location.href },
      sessionId: getSessionId(),
    };
    if (typeof window !== 'undefined') {
      window.tp_analytics?.push?.(payload);
      if (!window.tp_analytics._queue) window.tp_analytics._queue = [];
      window.tp_analytics._queue.push(payload);
      scheduleFlush();
    }
  };

  const refreshConsent = () => {
    enabled.value = readConsent();
  };

  // 自动刷新 consent（Cookie 横幅可能稍后设置）
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === 'tp-cookie-consent') refreshConsent();
    });
    // 页面卸载前立即上报
    window.addEventListener('beforeunload', () => {
      const queue = window.tp_analytics?._queue || [];
      if (queue.length === 0) return;
      const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
      navigator.sendBeacon?.(
        `${baseUrl}/analytics/events`,
        JSON.stringify({ events: queue.map((e) => ({ ...e, sessionId: e.sessionId || getSessionId() })) }),
      );
    });
  }

  return { enabled: readonly(enabled), track, refreshConsent };
}

// 初始化全局队列
flushQueue();
