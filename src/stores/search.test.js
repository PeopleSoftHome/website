import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { createSearch } from './search.js';

describe('createSearch', () => {
  beforeEach(() => {
    vi.stubGlobal('addEventListener', vi.fn());
    vi.stubGlobal('removeEventListener', vi.fn());
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('returns search state object', () => {
    const comp = defineComponent({
      setup() {
        const search = createSearch();
        return { search };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.search.isOpen).toBeDefined();
    expect(wrapper.vm.search.openSearch).toBeDefined();
    expect(wrapper.vm.search.closeSearch).toBeDefined();
  });

  it('toggles isOpen via open/close', () => {
    const comp = defineComponent({
      setup() {
        const search = createSearch();
        return { search };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.search.isOpen.value).toBe(false);
    wrapper.vm.search.openSearch();
    expect(wrapper.vm.search.isOpen.value).toBe(true);
    wrapper.vm.search.closeSearch();
    expect(wrapper.vm.search.isOpen.value).toBe(false);
  });

  it('registers keydown listener for Cmd+K', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const comp = defineComponent({
      setup() { createSearch(); return {}; },
      render() { return h('div'); },
    });
    mount(comp);
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const comp = defineComponent({
      setup() { createSearch(); return {}; },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
