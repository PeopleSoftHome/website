import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { useThemeStore } from './theme.pinia';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    setActivePinia(createPinia());
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  const mountStore = () => {
    const comp = defineComponent({
      setup() {
        const theme = useThemeStore();
        return { theme };
      },
      render() { return h('div'); },
    });
    return mount(comp);
  };

  it('returns theme state object', () => {
    const wrapper = mountStore();
    const theme = wrapper.vm.theme;
    expect(theme.theme).toBeDefined();
    expect(theme.toggle).toBeDefined();
    expect(theme.setTheme).toBeDefined();
    expect(theme.isDark).toBeDefined();
  });

  it('toggles between light and dark', () => {
    const wrapper = mountStore();
    const theme = wrapper.vm.theme;
    theme.toggle();
    expect(theme.theme).toBe('dark');
  });

  it('syncs data-theme attribute on toggle', async () => {
    const wrapper = mountStore();
    const theme = wrapper.vm.theme;
    theme.toggle();
    await nextTick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
