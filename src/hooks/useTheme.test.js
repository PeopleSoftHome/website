import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  let storage = {};

  beforeEach(() => {
    storage = {};
    vi.stubGlobal('localStorage', {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => { storage[k] = v; },
    });
    document.documentElement.removeAttribute('data-theme');

    // Ensure matchMedia is available in jsdom
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query.includes('dark'),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads localStorage first', () => {
    storage['tp-theme'] = 'dark';
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('falls back to matchMedia when no localStorage', () => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const expected = mq.matches ? 'dark' : 'light';
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(expected);
  });

  it('toggles theme', () => {
    storage['tp-theme'] = 'light';
    const { result } = renderHook(() => useTheme());

    act(() => result.current.toggle());
    expect(result.current.theme).toBe('dark');
    expect(storage['tp-theme']).toBe('dark');

    act(() => result.current.toggle());
    expect(result.current.theme).toBe('light');
  });

  it('setTheme validates values', () => {
    storage['tp-theme'] = 'light';
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme('dark'));
    expect(result.current.theme).toBe('dark');

    act(() => result.current.setTheme('invalid'));
    expect(result.current.theme).toBe('dark'); // unchanged
  });

  it('syncs data-theme attribute', () => {
    storage['tp-theme'] = 'dark';
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
