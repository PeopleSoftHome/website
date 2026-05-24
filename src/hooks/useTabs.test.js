import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabs } from './useTabs';

describe('useTabs', () => {
  it('initializes with default index 0', () => {
    const { result } = renderHook(() => useTabs());
    expect(result.current.activeIndex).toBe(0);
  });

  it('initializes with provided initialIndex', () => {
    const { result } = renderHook(() => useTabs(2));
    expect(result.current.activeIndex).toBe(2);
  });

  it('selectTab updates activeIndex', () => {
    const { result } = renderHook(() => useTabs(3));

    act(() => result.current.selectTab(1));
    expect(result.current.activeIndex).toBe(1);

    act(() => result.current.selectTab(2));
    expect(result.current.activeIndex).toBe(2);
  });

  it('accepts any index without clamping (hook is unopinionated)', () => {
    const { result } = renderHook(() => useTabs());

    act(() => result.current.selectTab(-1));
    expect(result.current.activeIndex).toBe(-1);

    act(() => result.current.selectTab(99));
    expect(result.current.activeIndex).toBe(99);
  });

  it('allows returning to index 0', () => {
    const { result } = renderHook(() => useTabs(3));

    act(() => result.current.selectTab(1));
    expect(result.current.activeIndex).toBe(1);

    act(() => result.current.selectTab(0));
    expect(result.current.activeIndex).toBe(0);
  });
});
