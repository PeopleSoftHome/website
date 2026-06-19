/**
 * Cookie Consent State Management
 * ──────────────────────────────
 * Stores consent in localStorage['tp-cookie-consent'] as:
 *   { analytics: boolean, marketing: boolean, timestamp: number }
 * Tracks: necessary (always true), analytics (optional), marketing (optional)
 */
import { ref, readonly } from 'vue';

const STORAGE_KEY = 'tp-cookie-consent';

function readStoredConsent() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function writeStoredConsent(value) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function useCookieConsent() {
  const stored = readStoredConsent();

  const hasConsent = ref(!!stored);
  const analytics = ref(stored?.analytics ?? false);
  const marketing = ref(stored?.marketing ?? false);
  const showBanner = ref(!stored);
  const showPreferences = ref(false);

  const acceptAll = () => {
    analytics.value = true;
    marketing.value = true;
    hasConsent.value = true;
    showBanner.value = false;
    writeStoredConsent({ analytics: true, marketing: true, timestamp: Date.now() });
  };

  const rejectAll = () => {
    analytics.value = false;
    marketing.value = false;
    hasConsent.value = true;
    showBanner.value = false;
    writeStoredConsent({ analytics: false, marketing: false, timestamp: Date.now() });
  };

  const savePreferences = (prefs) => {
    analytics.value = !!prefs.analytics;
    marketing.value = !!prefs.marketing;
    hasConsent.value = true;
    showBanner.value = false;
    showPreferences.value = false;
    writeStoredConsent({
      analytics: analytics.value,
      marketing: marketing.value,
      timestamp: Date.now(),
    });
  };

  const openPreferences = () => {
    showPreferences.value = true;
    showBanner.value = true;
  };

  return {
    hasConsent: readonly(hasConsent),
    analytics: readonly(analytics),
    marketing: readonly(marketing),
    showBanner: readonly(showBanner),
    showPreferences: readonly(showPreferences),
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
  };
}
