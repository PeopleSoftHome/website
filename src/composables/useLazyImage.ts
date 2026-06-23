import { ref, onMounted } from 'vue';
import type { Ref } from 'vue';
import { useIntersectionObserver } from '@/composables/useIntersectionObserver';

export function useLazyImage(imgRef: Ref<HTMLImageElement | null>) {
  const isLoaded = ref(false);
  const isVisible = ref(false);

  onMounted(() => {
    const el = imgRef.value;
    if (!el) return;

    // Native lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
      el.loading = 'lazy';
    }
  });

  useIntersectionObserver(
    () => imgRef.value,
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
        }
      });
    },
    { rootMargin: '200px', once: true },
  );

  return { isLoaded, isVisible };
}
