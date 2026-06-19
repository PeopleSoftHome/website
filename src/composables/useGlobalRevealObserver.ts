/**
 * useGlobalRevealObserver — 全局滚动入场动画观察器
 * 扫描所有 .reveal:not(.is-visible) 元素，进入视口后添加 is-visible class
 * 同时监听 MutationObserver 与路由切换，确保 Tab/路由变化后新元素能被扫描
 */
import { onMounted, onUnmounted } from 'vue';

interface AnalyticsStoreLike {
  track: (event: string, props?: Record<string, unknown>) => void;
}

interface UseGlobalRevealObserverOptions {
  analyticsStore: AnalyticsStoreLike;
}

export function useGlobalRevealObserver({ analyticsStore }: UseGlobalRevealObserverOptions) {
  onMounted(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const seenSections = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);

          const sectionId = entry.target.closest('section')?.id;
          if (sectionId && !seenSections.has(sectionId)) {
            seenSections.add(sectionId);
            analyticsStore.track('section_visible', { section: sectionId });
          }
        });
      },
      { threshold: 0.06 }
    );

    const scan = () => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        io.observe(el);
      });
    };

    scan();

    let scanTimer: ReturnType<typeof setTimeout> | undefined;
    const debouncedScan = () => {
      clearTimeout(scanTimer);
      scanTimer = setTimeout(scan, 150);
    };

    const mo = new MutationObserver(debouncedScan);
    const rootEl = document.querySelector('#__nuxt') || document.body || document.documentElement;
    if (rootEl) mo.observe(rootEl, { childList: true, subtree: true });

    const router = useRouter();
    const stopAfterEach = router.afterEach(() => {
      clearTimeout(scanTimer);
      scanTimer = setTimeout(scan, 100);
    });

    onUnmounted(() => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(scanTimer);
      stopAfterEach();
    });
  });
}
