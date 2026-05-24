import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVideoModal } from './useVideoModal';

describe('useVideoModal', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useVideoModal());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens video modal', () => {
    const { result } = renderHook(() => useVideoModal());

    act(() => result.current.openVideo());
    expect(result.current.isOpen).toBe(true);
  });

  it('closes video modal', () => {
    const { result } = renderHook(() => useVideoModal());

    act(() => result.current.openVideo());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.closeVideo());
    expect(result.current.isOpen).toBe(false);
  });

  it('stays closed after multiple close calls', () => {
    const { result } = renderHook(() => useVideoModal());

    act(() => result.current.closeVideo());
    act(() => result.current.closeVideo());
    expect(result.current.isOpen).toBe(false);
  });
});
