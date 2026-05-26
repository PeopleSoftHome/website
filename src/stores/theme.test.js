import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createTheme } from './theme.js';

describe('createTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('returns theme state object', () => {
    const comp = defineComponent({
      setup() {
        const theme = createTheme();
        return { theme };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.theme.theme).toBeDefined();
    expect(wrapper.vm.theme.toggle).toBeDefined();
    expect(wrapper.vm.theme.setTheme).toBeDefined();
    expect(wrapper.vm.theme.isDark).toBeDefined();
  });

  it('toggles between light and dark', () => {
    const comp = defineComponent({
      setup() {
        const theme = createTheme();
        return { theme };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.theme.toggle();
    expect(wrapper.vm.theme.theme.value).toBe('dark');
  });

  it('syncs data-theme attribute on toggle', async () => {
    const comp = defineComponent({
      setup() {
        const theme = createTheme();
        return { theme };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.theme.toggle();
    await nextTick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
