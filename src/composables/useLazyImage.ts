import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export function useLazyImage(imgRef: Ref<HTMLImageElement | null>) {
  const isLoaded = ref(false);
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const el = imgRef.value;
    if (!el) return;

    // Native lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
      el.loading = 'lazy';
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true;
            if (observer) observer.unobserve(el);
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
  });

  onUnmounted(() => {
    if (observer) observer.disconnect();
  });

  return { isLoaded, isVisible };
}
