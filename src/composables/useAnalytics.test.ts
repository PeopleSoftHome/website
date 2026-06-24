import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnalytics } from './useAnalytics';

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn().mockResolvedValue({}) }));

vi.mock('@/api/client', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    defaults: { baseURL: 'http://localhost:4000/api/v1' },
  },
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPost.mockClear();
    mockPost.mockResolvedValue({});
    localStorage.setItem('tp-cookie-consent', JSON.stringify({ analytics: true }));
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

  it('respects queue size limit by shifting old events', () => {
    const analytics = useAnalytics();
    for (let i = 0; i < 105; i += 1) {
      analytics.track(`event_${i}`);
    }
    expect(window.tp_analytics._queue.length).toBeLessThanOrEqual(100);
  });

  it('flushes queue after schedule delay', () => {
    vi.useFakeTimers();
    const analytics = useAnalytics();
    analytics.track('flush_event');

    vi.advanceTimersByTime(6000);
    expect(mockPost).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('sendBeacon on beforeunload when queue not empty', () => {
    const sendBeacon = vi.fn();
    vi.stubGlobal('navigator', { sendBeacon });

    const analytics = useAnalytics();
    analytics.track('beacon_event');

    window.dispatchEvent(new Event('beforeunload'));
    expect(sendBeacon).toHaveBeenCalled();
  });

  it('updates enabled on storage change for cookie consent', () => {
    const analytics = useAnalytics();
    expect(analytics.enabled.value).toBe(true);

    localStorage.setItem('tp-cookie-consent', JSON.stringify({ analytics: false }));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'tp-cookie-consent',
      newValue: JSON.stringify({ analytics: false }),
    }));

    expect(analytics.enabled.value).toBe(false);
  });
});
