import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCookieConsent } from './useCookieConsent';

const STORAGE_KEY = 'tp-cookie-consent';

describe('useCookieConsent', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'removeItem');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows banner when no stored consent', () => {
    localStorage.getItem.mockReturnValue(null);
    const cc = useCookieConsent();
    expect(cc.showBanner.value).toBe(true);
    expect(cc.hasConsent.value).toBe(false);
  });

  it('hides banner when stored consent exists', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ analytics: true, marketing: false, timestamp: Date.now() }));
    const cc = useCookieConsent();
    expect(cc.showBanner.value).toBe(false);
    expect(cc.hasConsent.value).toBe(true);
    expect(cc.analytics.value).toBe(true);
    expect(cc.marketing.value).toBe(false);
  });

  it('acceptAll enables analytics and marketing', () => {
    localStorage.getItem.mockReturnValue(null);
    const cc = useCookieConsent();
    cc.acceptAll();
    expect(cc.hasConsent.value).toBe(true);
    expect(cc.analytics.value).toBe(true);
    expect(cc.marketing.value).toBe(true);
    expect(cc.showBanner.value).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('"analytics":true')
    );
  });

  it('rejectAll disables analytics and marketing', () => {
    localStorage.getItem.mockReturnValue(null);
    const cc = useCookieConsent();
    cc.rejectAll();
    expect(cc.hasConsent.value).toBe(true);
    expect(cc.analytics.value).toBe(false);
    expect(cc.marketing.value).toBe(false);
    expect(cc.showBanner.value).toBe(false);
  });

  it('savePreferences stores selected choices', () => {
    localStorage.getItem.mockReturnValue(null);
    const cc = useCookieConsent();
    cc.savePreferences({ analytics: true, marketing: false });
    expect(cc.analytics.value).toBe(true);
    expect(cc.marketing.value).toBe(false);
    expect(cc.showPreferences.value).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('"analytics":true')
    );
  });

  it('openPreferences shows banner and preferences panel', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify({ analytics: false, marketing: false, timestamp: 1 }));
    const cc = useCookieConsent();
    expect(cc.showBanner.value).toBe(false);
    cc.openPreferences();
    expect(cc.showBanner.value).toBe(true);
    expect(cc.showPreferences.value).toBe(true);
  });
});
