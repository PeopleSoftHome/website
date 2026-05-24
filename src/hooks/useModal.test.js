import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from './useModal';

describe('useModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts closed at step 0', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.step).toBe(0);
    expect(result.current.isSuccess).toBe(false);
  });

  it('opens modal', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.openModal());
    expect(result.current.isOpen).toBe(true);
  });

  it('closes modal and resets after delay', () => {
    const { result } = renderHook(() => useModal());

    act(() => result.current.openModal());
    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    expect(result.current.step).toBe(2);

    act(() => result.current.closeModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.step).toBe(2); // not yet reset

    act(() => vi.advanceTimersByTime(400));
    expect(result.current.step).toBe(0);
    expect(result.current.isSuccess).toBe(false);
  });

  it('advances step up to max 2', () => {
    const { result } = renderHook(() => useModal());

    act(() => result.current.openModal());
    act(() => result.current.nextStep());
    expect(result.current.step).toBe(1);
    act(() => result.current.nextStep());
    expect(result.current.step).toBe(2);
    act(() => result.current.nextStep());
    expect(result.current.step).toBe(2);
  });

  it('submits form and auto-closes after timeout', () => {
    const { result } = renderHook(() => useModal());

    act(() => result.current.openModal());
    act(() => result.current.submitForm());
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isOpen).toBe(true);

    act(() => vi.advanceTimersByTime(2600));
    expect(result.current.isOpen).toBe(false);
  });

  it('clears timers on unmount', () => {
    const { result, unmount } = renderHook(() => useModal());
    act(() => result.current.submitForm());
    unmount();
    // should not throw
    act(() => vi.advanceTimersByTime(3000));
  });
});
