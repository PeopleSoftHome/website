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
import { ref, onMounted, onUnmounted } from 'vue';

export function useCountUp(target, { duration = 1600, suffix = '' } = {}) {
  const elRef = ref(null);
  let rafId = null;
  let obs = null;

  onMounted(() => {
    const el = elRef.value;
    if (!el) return;

    obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !el.dataset.done) {
          el.dataset.done = '1';
          const start = performance.now();

          const tick = (now) => {
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
        }
      },
      { threshold: 0.5 }
    );

    obs.observe(el);
  });

  onUnmounted(() => {
    if (obs) obs.disconnect();
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  return { ref: elRef };
}
