import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnalytics } from './useAnalytics.js';

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    localStorage.clear();
    window.tp_analytics = { push: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not track when analytics consent is false', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ analytics: false, marketing: false }));
    const { track } = useAnalytics();
    track('test_event', { foo: 'bar' });
    expect(window.tp_analytics.push).not.toHaveBeenCalled();
  });

  it('tracks when analytics consent is true', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ analytics: true, marketing: false }));
    const { track } = useAnalytics();
    track('test_event', { foo: 'bar' });
    expect(window.tp_analytics.push).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'test_event', foo: 'bar', ts: expect.any(Number) })
    );
  });

  it('refreshConsent updates enabled state', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ analytics: false }));
    const { enabled, refreshConsent } = useAnalytics();
    expect(enabled.value).toBe(false);
    localStorage.getItem.mockReturnValue(JSON.stringify({ analytics: true }));
    refreshConsent();
    expect(enabled.value).toBe(true);
  });
});
