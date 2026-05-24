import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  it('returns a ref', () => {
    const { result } = renderHook(() => useCountUp(100));
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() => useCountUp(500, { duration: 800, suffix: '%' }));
    expect(result.current.ref).toBeDefined();
  });

  it('unmounts without throwing', () => {
    const { unmount } = renderHook(() => useCountUp(100));
    expect(() => unmount()).not.toThrow();
  });
});
