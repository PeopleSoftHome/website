import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollLock } from './useScrollLock';

describe('useScrollLock', () => {
  it('locks body overflow when isLocked is true', () => {
    const original = document.body.style.overflow;
    const { rerender } = renderHook(({ locked }) => useScrollLock(locked), {
      initialProps: { locked: false },
    });

    expect(document.body.style.overflow).toBe(original);

    rerender({ locked: true });
    expect(document.body.style.overflow).toBe('hidden');

    rerender({ locked: false });
    expect(document.body.style.overflow).toBe(original);
  });

  it('handles multiple locks with reference counting', () => {
    const original = document.body.style.overflow;

    const { unmount: unmountA } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    const { unmount: unmountB } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    // 释放第一个锁，overflow 应保持 hidden（因为第二个锁还在）
    unmountA();
    expect(document.body.style.overflow).toBe('hidden');

    // 释放第二个锁，overflow 应恢复
    unmountB();
    expect(document.body.style.overflow).toBe(original);
  });
});
