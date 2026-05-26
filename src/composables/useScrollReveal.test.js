import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { useScrollReveal } from './useScrollReveal.js';

describe('useScrollReveal', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      constructor(cb, opts) { this.cb = cb; this.opts = opts; }
      observe(el) { this.cb([{ isIntersecting: true, target: el }]); }
      disconnect() {}
    });
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('returns a ref', () => {
    const comp = defineComponent({
      setup() {
        const { ref: elRef } = useScrollReveal();
        return { elRef };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.elRef).toBeDefined();
  });

  it('adds is-visible class on intersection', async () => {
    const comp = defineComponent({
      setup() {
        const { ref: elRef } = useScrollReveal();
        return { elRef };
      },
      render() { return h('div', { ref: 'elRef' }, 'content'); },
    });
    const wrapper = mount(comp);
    await wrapper.vm.$nextTick();
    const el = wrapper.find('div').element;
    expect(el.classList.contains('is-visible')).toBe(true);
  });

  it('accepts custom threshold', () => {
    const comp = defineComponent({
      setup() {
        const { ref: elRef } = useScrollReveal(0.5);
        return { elRef };
      },
      render() { return h('div', { ref: 'elRef' }); },
    });
    expect(() => mount(comp)).not.toThrow();
  });

  it('disconnects observer on unmount', () => {
    const disconnectSpy = vi.fn();
    const observeSpy = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      observe(el) { observeSpy(el); }
      disconnect() { disconnectSpy(); }
    });
    const comp = defineComponent({
      setup() {
        const { ref: elRef } = useScrollReveal();
        return { elRef };
      },
      render() { return h('div', { ref: 'elRef' }); },
    });
    const wrapper = mount(comp);
    expect(observeSpy).toHaveBeenCalled();
    wrapper.unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
