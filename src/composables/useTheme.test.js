import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useTheme } from './useTheme.js';

function mountTheme() {
  const comp = defineComponent({
    setup() {
      const theme = useTheme();
      return { theme };
    },
    render() { return h('div'); },
  });
  return mount(comp);
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('starts with light default', () => {
    const wrapper = mountTheme();
    expect(wrapper.vm.theme.theme.value).toBe('light');
  });

  it('toggles theme', () => {
    const wrapper = mountTheme();
    wrapper.vm.theme.toggle();
    expect(wrapper.vm.theme.theme.value).toBe('dark');
    wrapper.vm.theme.toggle();
    expect(wrapper.vm.theme.theme.value).toBe('light');
  });

  it('reads from localStorage on mount', async () => {
    localStorage.setItem('tp-theme', 'dark');
    const wrapper = mountTheme();
    await nextTick();
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.vm.theme.theme.value).toBe('dark');
  });

  it('setTheme validates input', () => {
    const wrapper = mountTheme();
    wrapper.vm.theme.setTheme('dark');
    expect(wrapper.vm.theme.theme.value).toBe('dark');
    wrapper.vm.theme.setTheme('invalid');
    expect(wrapper.vm.theme.theme.value).toBe('dark'); // unchanged
  });

  it('exposes isDark computed', () => {
    const wrapper = mountTheme();
    expect(wrapper.vm.theme.isDark.value).toBe(false);
    wrapper.vm.theme.toggle();
    expect(wrapper.vm.theme.isDark.value).toBe(true);
  });
});
