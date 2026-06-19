import { ref, computed, onMounted, onUnmounted } from 'vue';

/**
 * 页面顶部滚动进度条
 * @returns {{ progress: Ref<number>, progressStyle: ComputedRef<{width: string}> }}
 */
export function useScrollProgress() {
  const progress = ref(0);

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progress.value = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
  };

  onMounted(() => {
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', updateProgress);
  });

  const progressStyle = computed(() => ({ width: `${progress.value}%` }));

  return { progress, progressStyle };
}
