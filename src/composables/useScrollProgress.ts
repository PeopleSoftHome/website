import { ref, computed, onMounted } from 'vue';
import { useWindowEvent } from '@/composables/useRafThrottle';

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

  useWindowEvent('scroll', updateProgress, { passive: true });

  onMounted(() => {
    updateProgress();
  });

  const progressStyle = computed(() => ({ width: `${progress.value}%` }));

  return { progress, progressStyle };
}
