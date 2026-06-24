/**
 * useCountUp — 数字递增动画 Composable
 * 元素进入视口 50% 后触发，ease-out cubic 缓动，只触发一次
 *
 * @param {number} target   - 目标数值
 * @param {object} options
 *   @param {number} duration  - 动画时长 ms（默认 1600）
 *   @param {string} suffix    - 数字后缀（默认 ''）
 * @returns {{ ref: Ref<HTMLElement|null> }}
 */
import { ref, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { useIntersectionObserver } from '@/composables/useIntersectionObserver';

interface UseCountUpOptions {
  duration?: number;
  suffix?: string;
}

export function useCountUp(target: number, { duration = 1600, suffix = '' }: UseCountUpOptions = {}) {
  const elRef: Ref<HTMLElement | null> = ref(null);
  let rafId: number | null = null;

  useIntersectionObserver(
    () => elRef.value,
    ([entry]) => {
      const el = elRef.value;
      if (!entry || !entry.isIntersecting || !el || el.dataset.done) return;
      el.dataset.done = '1';
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          el.textContent = target.toLocaleString() + suffix;
          rafId = null;
        }
      };

      rafId = requestAnimationFrame(tick);
    },
    { threshold: 0.5, once: true },
  );

  onUnmounted(() => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  return { ref: elRef };
}
