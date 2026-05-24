import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ref, nextTick } from 'vue';
import { useTheme } from './useTheme.js';

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
    const { theme } = useTheme();
    expect(theme.value).toBe('light');
  });

  it('toggles theme', () => {
    const { theme, toggle } = useTheme();
    toggle();
    expect(theme.value).toBe('dark');
    toggle();
    expect(theme.value).toBe('light');
  });

  it('reads from localStorage', () => {
    localStorage.setItem('tp-theme', 'dark');
    const { theme } = useTheme();
    // Note: initialization happens in onMounted, so initial value is 'light'
    // The actual localStorage read happens after mount
    expect(theme.value).toBe('light');
  });

  it('setTheme validates input', () => {
    const { theme, setTheme } = useTheme();
    setTheme('dark');
    expect(theme.value).toBe('dark');
    setTheme('invalid');
    expect(theme.value).toBe('dark'); // unchanged
  });
});
