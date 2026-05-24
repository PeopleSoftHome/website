/**
 * useTheme — 亮色/暗色主题管理 Composable
 *
 * 优先级：localStorage → prefers-color-scheme → 'light'
 * 切换后自动同步 <html data-theme> + localStorage
 */
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';

export function useTheme() {
  const theme = ref('light');
  let mqHandler = null;

  onMounted(() => {
    // 初始化：localStorage → prefers-color-scheme → light
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('tp-theme');
      if (stored === 'dark' || stored === 'light') {
        theme.value = stored;
        return;
      }
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  });

  // 同步写入 DOM + localStorage
  watch(theme, (t) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('tp-theme', t);
  });

  // 监听系统主题变化（用户未手动设置时跟随系统）
  onMounted(() => {
    const stored = localStorage.getItem('tp-theme');
    if (stored) return; // 已手动设置，不跟随系统

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mqHandler = (e) => { theme.value = e.matches ? 'dark' : 'light'; };
    mq.addEventListener('change', mqHandler);
  });

  onUnmounted(() => {
    if (mqHandler) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.removeEventListener('change', mqHandler);
    }
  });

  const toggle = () => { theme.value = theme.value === 'dark' ? 'light' : 'dark'; };
  const setTheme = (t) => {
    if (t === 'dark' || t === 'light') theme.value = t;
  };

  return { theme, toggle, setTheme, isDark: computed(() => theme.value === 'dark') };
}
