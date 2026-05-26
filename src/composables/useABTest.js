/**
 * Lightweight A/B Testing Framework
 * ─────────────────────────────────
 * Assigns users to variants deterministically using localStorage + stable hash.
 * Persists assignment so the same user always sees the same variant.
 *
 * Usage:
 *   const variant = useABTest('hero-cta-2026q2', ['control', 'variant-a', 'variant-b']);
 *   // variant.value = 'control' | 'variant-a' | 'variant-b'
 */
import { ref, readonly } from 'vue';

const STORAGE_PREFIX = 'tp-ab-';

function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  return Math.abs(hash);
}

function getVisitorId() {
  let id = localStorage.getItem('tp-visitor-id');
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    try { localStorage.setItem('tp-visitor-id', id); } catch { /* ignore */ }
  }
  return id;
}

function readStoredVariant(testId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${testId}`);
    if (raw) return JSON.parse(raw).variant;
  } catch { /* ignore */ }
  return null;
}

function writeStoredVariant(testId, variant) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${testId}`, JSON.stringify({ variant, ts: Date.now() }));
  } catch { /* ignore */ }
}

/**
 * Assign a user to an A/B test variant.
 * @param {string} testId — unique test identifier
 * @param {string[]} variants — list of variant names (first = control)
 * @returns {Readonly<Ref<string>>} — assigned variant name
 */
export function useABTest(testId, variants) {
  if (!testId || !Array.isArray(variants) || variants.length === 0) {
    console.warn('[useABTest] Invalid arguments');
    return readonly(ref(''));
  }

  let variant = readStoredVariant(testId);

  if (!variant || !variants.includes(variant)) {
    const visitorId = getVisitorId();
    const hash = djb2Hash(`${testId}:${visitorId}`);
    const idx = hash % variants.length;
    variant = variants[idx];
    writeStoredVariant(testId, variant);
  }

  return readonly(ref(variant));
}

/**
 * Force a specific variant for testing / QA.
 * Call in browser console: useABTest.force('hero-cta-2026q2', 'variant-a')
 */
useABTest.force = (testId, variant) => {
  if (!testId || !variant) return;
  writeStoredVariant(testId, variant);
  console.log(`[useABTest] Forced ${testId} → ${variant}. Refresh to apply.`);
};

/**
 * Clear all stored A/B test assignments.
 */
useABTest.clearAll = () => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    console.log('[useABTest] All assignments cleared.');
  } catch { /* ignore */ }
};
