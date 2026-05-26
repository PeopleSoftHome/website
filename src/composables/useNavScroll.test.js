import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { useNavScroll } from './useNavScroll.js';

describe('useNavScroll', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollY', 0);
    vi.stubGlobal('addEventListener', vi.fn());
    vi.stubGlobal('removeEventListener', vi.fn());
    vi.stubGlobal('requestAnimationFrame', (cb) => cb());
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('initializes scrolled and showBackTop as false', () => {
    const comp = defineComponent({
      setup() {
        const nav = useNavScroll();
        return { nav };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.nav.scrolled.value).toBe(false);
    expect(wrapper.vm.nav.showBackTop.value).toBe(false);
  });

  it('registers scroll listener on mount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const comp = defineComponent({
      setup() { useNavScroll(); return {}; },
      render() { return h('div'); },
    });
    mount(comp);
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
  });

  it('removes scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const comp = defineComponent({
      setup() { useNavScroll(); return {}; },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('returns reactive refs', () => {
    const comp = defineComponent({
      setup() {
        const nav = useNavScroll();
        return { nav };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.nav.scrolled).toBeDefined();
    expect(wrapper.vm.nav.showBackTop).toBeDefined();
  });
});
