/**
 * useIntersectionObserver — 通用 IntersectionObserver 封装
 * 统一处理滚动入场、懒加载、数字递增、TOC 高亮等可见性观察场景。
 */
import { onMounted, onUnmounted } from 'vue';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** 只触发一次回调（入场动画/数字递增场景） */
  once?: boolean;
}

export function useIntersectionObserver(
  target: () => Element | Element[] | null | undefined,
  onIntersect: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void,
  options: UseIntersectionObserverOptions = {},
) {
  const { once = false, root, rootMargin, threshold } = options;
  let observer: IntersectionObserver | null = null;

  const stop = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  onMounted(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const el = target();
    if (!el) return;

    observer = new IntersectionObserver((entries) => {
      onIntersect(entries, observer!);
      if (once) {
        entries.forEach((entry) => {
          if (entry.isIntersecting && observer) {
            observer.unobserve(entry.target);
          }
        });
      }
    }, { root, rootMargin, threshold });

    if (Array.isArray(el)) {
      el.forEach((e) => observer!.observe(e));
    } else {
      observer.observe(el);
    }
  });

  onUnmounted(stop);

  return { stop };
}

/** 快捷方法：监听单个元素是否在视口内 */
export function useElementVisibility(
  target: () => Element | null | undefined,
  onChange: (isVisible: boolean) => void,
  options?: IntersectionObserverInit,
) {
  return useIntersectionObserver(
    target,
    (entries) => {
      entries.forEach((entry) => onChange(entry.isIntersecting));
    },
    options,
  );
}
