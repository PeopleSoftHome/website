/**
 * useRum — Real User Monitoring (真实用户性能监控)
 * ──────────────────────────────────────────────────
 * 基于 web-vitals 库采集 Core Web Vitals，并上报到后端 Analytics API。
 *
 * 采集指标：
 * - LCP  (Largest Contentful Paint) — 最大内容绘制
 * - INP  (Interaction to Next Paint) — 交互到下一次绘制
 * - CLS  (Cumulative Layout Shift)   — 累积布局偏移
 * - TTFB (Time to First Byte)        — 首字节时间
 * - FCP  (First Contentful Paint)    — 首次内容绘制
 */
import { onMounted, onUnmounted } from 'vue';
import { onLCP, onINP, onCLS, onTTFB, onFCP } from 'web-vitals';
import { apiClient } from '@/api/client.js';

const SESSION_KEY = 'tp-rum-session';

function getRumEndpoint() {
  const baseUrl = (apiClient.defaults.baseURL || '').replace(/\/$/, '');
  return `${baseUrl}/analytics/web-vitals`;
}

function getSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function sendToAnalytics(metric) {
  const payload = {
    event: 'web_vital',
    properties: {
      name: metric.name,
      value: metric.value,
      rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      url: location.href,
      pathname: location.pathname,
    },
    sessionId: getSessionId(),
    ts: Date.now(),
  };

  const endpoint = getRumEndpoint();

  // 优先使用 sendBeacon（不阻塞页面卸载）
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
  } else {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}

/**
 * 初始化 RUM 监控
 * @param {Object} options
 * @param {boolean} options.reportAllChanges - 是否报告每次变化（默认 false，仅报告最终值）
 */
export function useRum(options = {}) {
  const { reportAllChanges = false } = options;

  const opts = { reportAllChanges };
  let cleanupLCP, cleanupINP, cleanupCLS, cleanupTTFB, cleanupFCP;

  onMounted(() => {
    cleanupLCP = onLCP(sendToAnalytics, opts);
    cleanupINP = onINP(sendToAnalytics, opts);
    cleanupCLS = onCLS(sendToAnalytics, opts);
    cleanupTTFB = onTTFB(sendToAnalytics, opts);
    cleanupFCP = onFCP(sendToAnalytics, opts);
  });

  onUnmounted(() => {
    cleanupLCP?.();
    cleanupINP?.();
    cleanupCLS?.();
    cleanupTTFB?.();
    cleanupFCP?.();
  });
}
