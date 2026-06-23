/**
 * useAnalytics — 数据埋点 Composable
 * ──────────────────────────────────
 * 最小化埋点，服务业务决策。检查 Cookie 同意（analytics）后发送。
 * 开发模式打印日志，生产模式写入 window.tp_analytics 队列。
 */
import { ref, readonly } from 'vue';
import { apiClient } from '@/api/client.js';

interface AnalyticsPayload {
  event: string;
  properties: Record<string, unknown>;
  sessionId: string;
}

interface AnalyticsQueue {
  queue?: unknown[];
  push?: (evt: AnalyticsPayload) => void;
  flush?: () => void;
  _queue?: AnalyticsPayload[];
  [key: string]: unknown;
}

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
  const q = (window.tp_analytics?._queue || []) as AnalyticsPayload[];
  window.tp_analytics = {
    push: (evt) => {
      q.push(evt as AnalyticsPayload);
      if (import.meta.env.DEV) console.log('[Analytics]', evt);
    },
    _queue: q,
  } as Window['tp_analytics'];
}

const MAX_QUEUE_SIZE = 100;

// 批量上报到后端（防抖 + 空闲调度 + 队列上限）
let flushTimer: ReturnType<typeof setTimeout> | null = null;
function doFlush() {
  if (typeof window === 'undefined') return;
  const analytics = window.tp_analytics as AnalyticsQueue;
  const queue = analytics?._queue || [];
  if (queue.length === 0) return;
  analytics._queue = [];
  apiClient.post('/analytics/events', { events: queue }).catch(() => {});
}
function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(doFlush, { timeout: 3000 });
    } else {
      doFlush();
    }
  }, 5000);
}

function enqueue(payload: AnalyticsPayload) {
  if (typeof window === 'undefined') return;
  const analytics = window.tp_analytics as AnalyticsQueue;
  if (!analytics._queue) analytics._queue = [];
  (analytics?.push)?.(payload);
  // 兼容外部 push 被 mock/no-op 的场景：确保队列中至少包含当前事件。
  const last = analytics._queue[analytics._queue.length - 1];
  if (last !== payload) {
    analytics._queue.push(payload);
  }
  if (analytics._queue.length > MAX_QUEUE_SIZE) {
    analytics._queue.shift();
  }
  scheduleFlush();
}

export function useAnalytics() {
  const enabled = ref(readConsent());

  const track = (event: string, props: Record<string, unknown> = {}) => {
    if (!enabled.value) return;
    const payload: AnalyticsPayload = {
      event,
      properties: { ...props, ts: Date.now(), url: location.href },
      sessionId: getSessionId(),
    };
    enqueue(payload);
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
      const queue = ((window.tp_analytics as AnalyticsQueue)?._queue || []) as AnalyticsPayload[];
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
