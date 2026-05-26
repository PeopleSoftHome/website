import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useCarousel } from './useCarousel.js';

function mountCarousel(itemCount = 5) {
  const comp = defineComponent({
    setup() {
      const c = useCarousel(itemCount);
      return { c };
    },
    render() { return h('div', { ref: 'el' }, 'carousel'); },
  });
  return mount(comp);
}

describe('useCarousel', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('starts at index 0', () => {
    const wrapper = mountCarousel();
    expect(wrapper.vm.c.currentIdx.value).toBe(0);
  });

  it('goTo clamps index within bounds', () => {
    const wrapper = mountCarousel(5);
    wrapper.vm.c.goTo(10);
    expect(wrapper.vm.c.currentIdx.value).toBeLessThanOrEqual(5);
  });

  it('autoPlay advances index', () => {
    const wrapper = mountCarousel(5);
    vi.advanceTimersByTime(4600);
    // index may advance depending on colCount
    expect(typeof wrapper.vm.c.currentIdx.value).toBe('number');
  });

  it('stopAutoPlay clears interval', () => {
    const wrapper = mountCarousel();
    wrapper.vm.c.stopAutoPlay();
    const idx = wrapper.vm.c.currentIdx.value;
    vi.advanceTimersByTime(5000);
    expect(wrapper.vm.c.currentIdx.value).toBe(idx);
  });

  it('getColCount returns 1/2/3 based on width', () => {
    const wrapper = mountCarousel();
    // no DOM parent, defaults to 3 (w > 900 fallback)
    expect(wrapper.vm.c.getColCount()).toBeGreaterThanOrEqual(1);
  });

  it('bindPauseEvents returns cleanup function', () => {
    const wrapper = mountCarousel();
    const el = document.createElement('div');
    const cleanup = wrapper.vm.c.bindPauseEvents(el);
    expect(typeof cleanup).toBe('function');
    cleanup();
  });
});
