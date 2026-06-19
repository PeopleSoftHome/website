import { ref, onMounted, onUnmounted } from 'vue';

export function useLazyImage(imgRef) {
  const isLoaded = ref(false);
  const isVisible = ref(false);
  let observer = null;

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
            observer.unobserve(el);
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
