import { useRef, useEffect } from 'react';

/**
 * useCountUp — 数字递增动画 Hook
 * 元素进入视口 50% 后触发，ease-out cubic 缓动，只触发一次
 *
 * @param {number} target   - 目标数值
 * @param {object} options
 *   @param {number} duration  - 动画时长 ms（默认 1600）
 *   @param {string} suffix    - 数字后缀（默认 ''）
 * @returns {{ ref }} - 绑定到目标 DOM 元素的 ref
 */
export function useCountUp(target, { duration = 1600, suffix = '' } = {}) {
  const ref = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !el.dataset.done) {
          el.dataset.done = '1';
          const start = performance.now();

          const tick = (now) => {
            const progress  = Math.min((now - start) / duration, 1);
            const eased     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current   = Math.floor(eased * target);
            el.textContent  = current.toLocaleString() + suffix;
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(tick);
            } else {
              el.textContent = target.toLocaleString() + suffix;
              rafRef.current = null;
            }
          };

          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, duration, suffix]);

  return { ref };
}
