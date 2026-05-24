/**
 * Search Store — 全局搜索弹窗开关 + Cmd+K 监听
 * 独立于 useSearch composable（后者负责搜索逻辑）
 */
import { ref, onMounted, onUnmounted } from 'vue';

export function createSearch() {
  const isOpen = ref(false);
  const openSearch = () => { isOpen.value = true; };
  const closeSearch = () => { isOpen.value = false; };

  const handler = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isOpen.value = !isOpen.value;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handler);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handler);
  });

  return { isOpen, openSearch, closeSearch };
}
