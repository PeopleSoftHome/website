import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavScroll } from './useNavScroll';

describe('useNavScroll', () => {
  let rafCallbacks = [];

  beforeEach(() => {
    rafCallbacks = [];
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useNavScroll());
    expect(result.current.scrolled).toBe(false);
    expect(result.current.showBackTop).toBe(false);
  });

  it('sets scrolled true when scrollY > 60', () => {
    const { result } = renderHook(() => useNavScroll());

    Object.defineProperty(window, 'scrollY', { value: 100, writable: true, configurable: true });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      rafCallbacks.forEach(cb => cb());
    });

    expect(result.current.scrolled).toBe(true);
  });

  it('sets showBackTop true when scrollY > 500', () => {
    const { result } = renderHook(() => useNavScroll());

    Object.defineProperty(window, 'scrollY', { value: 600, writable: true, configurable: true });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      rafCallbacks.forEach(cb => cb());
    });

    expect(result.current.showBackTop).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useNavScroll());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
