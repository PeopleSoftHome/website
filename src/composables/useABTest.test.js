import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useABTest } from './useABTest.js';

describe('useABTest', () => {
  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'removeItem');
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useABTest.clearAll?.();
  });

  it('returns a variant from the list', () => {
    localStorage.getItem.mockReturnValue(null);
    const variant = useABTest('test-1', ['control', 'v1', 'v2']);
    expect(['control', 'v1', 'v2']).toContain(variant.value);
  });

  it('persists the same variant for the same visitor', () => {
    const store = {};
    localStorage.getItem.mockImplementation((key) => store[key] ?? null);
    localStorage.setItem.mockImplementation((key, value) => { store[key] = value; });
    const v1 = useABTest('test-2', ['a', 'b']);
    // Re-create should read from storage
    const v2 = useABTest('test-2', ['a', 'b']);
    expect(v1.value).toBe(v2.value);
  });

  it('re-assigns if stored variant is invalid', () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'tp-ab-test-3') return JSON.stringify({ variant: 'old-variant', ts: 1 });
      if (key === 'tp-visitor-id') return JSON.stringify('visitor-123');
      return null;
    });
    const variant = useABTest('test-3', ['control', 'v1']);
    expect(['control', 'v1']).toContain(variant.value);
    expect(variant.value).not.toBe('old-variant');
  });

  it('force() overrides variant', () => {
    // use a real in-memory store so force() writes and reads back
    const store = {};
    localStorage.getItem.mockImplementation((key) => store[key] ?? null);
    localStorage.setItem.mockImplementation((key, value) => { store[key] = value; });
    useABTest.force('test-4', 'variant-x');
    const variant = useABTest('test-4', ['control', 'variant-x', 'variant-y']);
    expect(variant.value).toBe('variant-x');
  });

  it('clearAll removes all test assignments', () => {
    localStorage.setItem('tp-ab-test-a', JSON.stringify({ variant: 'control', ts: 1 }));
    localStorage.setItem('tp-ab-test-b', JSON.stringify({ variant: 'v1', ts: 1 }));
    useABTest.clearAll();
    expect(localStorage.removeItem).toHaveBeenCalledWith('tp-ab-test-a');
    expect(localStorage.removeItem).toHaveBeenCalledWith('tp-ab-test-b');
  });

  it('handles invalid arguments gracefully', () => {
    const variant = useABTest('', []);
    expect(variant.value).toBe('');
  });
});
