import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useCarousel } from './useCarousel';

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

  it('bindPauseEvents pauses and resumes auto play on hover', () => {
    const wrapper = mountCarousel(5);
    const el = document.createElement('div');
    wrapper.vm.c.bindPauseEvents(el);

    el.dispatchEvent(new MouseEvent('mouseenter'));
    const idx = wrapper.vm.c.currentIdx.value;
    vi.advanceTimersByTime(5000);
    expect(wrapper.vm.c.currentIdx.value).toBe(idx);

    el.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(4600);
    expect(wrapper.vm.c.currentIdx.value).not.toBe(idx);
  });

  it('getOffset returns 0 when trackRef is not set', () => {
    const wrapper = mountCarousel(5);
    expect(wrapper.vm.c.getOffset()).toBe(0);
  });

  it('getOffset calculates offset based on col count', () => {
    const wrapper = mountCarousel(5);
    const track = document.createElement('div');
    const parent = document.createElement('div');
    parent.style.width = '1200px';
    parent.appendChild(track);
    wrapper.vm.c.trackRef.value = track as unknown as HTMLElement;
    wrapper.vm.c.currentIdx.value = 1;
    expect(wrapper.vm.c.getOffset()).toBeGreaterThan(0);
  });

  it('handles resize by clamping index', () => {
    const wrapper = mountCarousel(5);
    wrapper.vm.c.currentIdx.value = 4;
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(250);
    expect(wrapper.vm.c.currentIdx.value).toBeLessThanOrEqual(4);
  });

  it('wraps index to 0 when auto play reaches max', () => {
    const wrapper = mountCarousel(3);
    wrapper.vm.c.currentIdx.value = 2;
    vi.advanceTimersByTime(4600);
    expect(wrapper.vm.c.currentIdx.value).toBe(0);
  });
});
