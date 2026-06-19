/**
 * Search Store — Pinia 版全局搜索弹窗开关
 * 负责 Cmd+K 监听与弹窗开关（搜索逻辑仍由 useSearch 负责）
 */
import { defineStore } from 'pinia';
import { ref, onMounted, onUnmounted } from 'vue';

export const useSearchStore = defineStore('search', () => {
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
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handler);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handler);
    }
  });

  return { isOpen, openSearch, closeSearch };
});
