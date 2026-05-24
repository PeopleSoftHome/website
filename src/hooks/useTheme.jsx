import { useState, useCallback, useEffect } from 'react';

/**
 * useTheme — 亮色/暗色主题管理 Hook
 *
 * 优先级：localStorage → prefers-color-scheme → 'light'
 * 切换后自动同步 <html data-theme> + localStorage
 */
export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('tp-theme');
      if (stored === 'dark' || stored === 'light') return stored;
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // 同步写入 DOM + localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tp-theme', theme);
  }, [theme]);

  // 监听系统主题变化（用户未手动设置时跟随系统）
  useEffect(() => {
    const stored = localStorage.getItem('tp-theme');
    if (stored) return; // 已手动设置，不跟随系统

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setThemeState(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle    = useCallback(() => setThemeState(t => t === 'dark' ? 'light' : 'dark'), []);
  const setTheme  = useCallback((t) => {
    if (t === 'dark' || t === 'light') setThemeState(t);
  }, []);

  return { theme, toggle, setTheme, isDark: theme === 'dark' };
}
