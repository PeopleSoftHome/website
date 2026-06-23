import { describe, it, expect } from 'vitest';
import { ref, nextTick } from 'vue';
import { useTabs } from './useTabs.ts';

describe('useTabs', () => {
  it('defaults to index 0', () => {
    const { activeIndex } = useTabs();
    expect(activeIndex.value).toBe(0);
  });

  it('accepts custom initial index', () => {
    const { activeIndex } = useTabs(2);
    expect(activeIndex.value).toBe(2);
  });

  it('selectTab changes active index', () => {
    const { activeIndex, selectTab } = useTabs();
    selectTab(3);
    expect(activeIndex.value).toBe(3);
  });
});
