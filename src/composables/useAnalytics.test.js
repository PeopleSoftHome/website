import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnalytics } from './useAnalytics.js';

const mockPost = vi.fn();

vi.mock('@/api/client.js', () => ({
  apiClient: {
    post: (...args) => mockPost(...args),
  },
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPost.mockReset();
    // 模拟同意 analytics
    localStorage.setItem('tp-cookie-consent', JSON.stringify({ analytics: true }));
    // 重置全局队列
    window.tp_analytics = { push: vi.fn(), _queue: [] };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns analytics API object', () => {
    const analytics = useAnalytics();
    expect(analytics.enabled).toBeDefined();
    expect(analytics.track).toBeDefined();
    expect(analytics.refreshConsent).toBeDefined();
  });

  it('track adds event to queue when consent is given', () => {
    const analytics = useAnalytics();
    analytics.track('test_event', { foo: 'bar' });

    const queue = window.tp_analytics._queue;
    expect(queue.length).toBeGreaterThanOrEqual(1);
    const lastEvent = queue[queue.length - 1];
    expect(lastEvent.event).toBe('test_event');
    expect(lastEvent.properties.foo).toBe('bar');
    expect(lastEvent.sessionId).toBeDefined();
  });

  it('track does nothing when consent is false', () => {
    localStorage.setItem('tp-cookie-consent', JSON.stringify({ analytics: false }));
    const analytics = useAnalytics();
    window.tp_analytics._queue = [];

    analytics.track('test_event');
    expect(window.tp_analytics._queue.length).toBe(0);
  });

  it('refreshConsent updates enabled state', () => {
    const analytics = useAnalytics();
    expect(analytics.enabled.value).toBe(true);

    localStorage.setItem('tp-cookie-consent', JSON.stringify({ analytics: false }));
    analytics.refreshConsent();
    expect(analytics.enabled.value).toBe(false);
  });

  it('track includes timestamp and url in properties', () => {
    const analytics = useAnalytics();
    analytics.track('page_view');

    const queue = window.tp_analytics._queue;
    const evt = queue[queue.length - 1];
    expect(evt.properties.ts).toBeDefined();
    expect(typeof evt.properties.ts).toBe('number');
    expect(evt.properties.url).toBeDefined();
  });
});
