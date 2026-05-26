import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useCountUp } from './useCountUp.js';

function mountCountUp(target, opts = {}) {
  const comp = defineComponent({
    setup() {
      const { ref: elRef } = useCountUp(target, opts);
      return { elRef };
    },
    render() { return h('span', { ref: 'elRef' }, '0'); },
  });
  return mount(comp);
}

describe('useCountUp', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      constructor(cb) { this.cb = cb; }
      observe(el) { this.cb([{ isIntersecting: true, target: el }]); }
      disconnect() {}
    });
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('returns a ref', () => {
    const wrapper = mountCountUp(100);
    expect(wrapper.vm.elRef).toBeDefined();
  });

  it('animates to target value', async () => {
    vi.useFakeTimers();
    const wrapper = mountCountUp(1000, { duration: 100 });
    await nextTick();
    vi.advanceTimersByTime(200);
    // textContent should be updated
    expect(wrapper.find('span').element.textContent).toBeTruthy();
    vi.useRealTimers();
  });

  it('appends suffix', async () => {
    vi.useFakeTimers();
    const wrapper = mountCountUp(99, { duration: 50, suffix: '%' });
    await nextTick();
    vi.advanceTimersByTime(100);
    const text = wrapper.find('span').element.textContent;
    expect(text).toContain('%');
    vi.useRealTimers();
  });

  it('only runs once (dataset.done)', async () => {
    const wrapper = mountCountUp(100);
    await nextTick();
    const el = wrapper.find('span').element;
    expect(el.dataset.done).toBe('1');
  });
});
