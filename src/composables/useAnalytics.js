/**
 * useAnalytics — 数据埋点 Composable
 * ──────────────────────────────────
 * 最小化埋点，服务业务决策。检查 Cookie 同意（analytics）后发送。
 * 开发模式打印日志，生产模式写入 window.tp_analytics 队列。
 */
import { ref, readonly } from 'vue';

const QUEUE_KEY = 'tp_analytics_queue';

function readConsent() {
  try {
    const raw = localStorage.getItem('tp-cookie-consent');
    if (raw) return JSON.parse(raw).analytics === true;
  } catch { /* ignore */ }
  return false;
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

export function useAnalytics() {
  const enabled = ref(readConsent());

  const track = (event, props = {}) => {
    if (!enabled.value) return;
    const payload = { event, ...props, ts: Date.now(), url: location.href };
    if (typeof window !== 'undefined') {
      window.tp_analytics?.push?.(payload);
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
  }

  return { enabled: readonly(enabled), track, refreshConsent };
}

// 初始化全局队列
flushQueue();
