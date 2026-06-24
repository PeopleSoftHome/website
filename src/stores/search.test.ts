import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { useSearchStore } from './search.pinia';

describe('useSearchStore', () => {
  beforeEach(() => {
    vi.stubGlobal('addEventListener', vi.fn());
    vi.stubGlobal('removeEventListener', vi.fn());
    setActivePinia(createPinia());
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  const mountStore = () => {
    const comp = defineComponent({
      setup() {
        const search = useSearchStore();
        return { search };
      },
      render() { return h('div'); },
    });
    return mount(comp);
  };

  it('returns search state object', () => {
    const wrapper = mountStore();
    const search = wrapper.vm.search;
    expect(search.isOpen).toBeDefined();
    expect(search.openSearch).toBeDefined();
    expect(search.closeSearch).toBeDefined();
  });

  it('toggles isOpen via open/close', () => {
    const wrapper = mountStore();
    const search = wrapper.vm.search;
    expect(search.isOpen).toBe(false);
    search.openSearch();
    expect(search.isOpen).toBe(true);
    search.closeSearch();
    expect(search.isOpen).toBe(false);
  });

  it('registers keydown listener on mount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    mountStore();
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const wrapper = mountStore();
    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
