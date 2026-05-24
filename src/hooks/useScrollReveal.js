import { useRef, useEffect } from 'react';

/**
 * useScrollReveal — 滚动入场动画
 * 元素进入视口后添加 is-visible class，配合 reveal.css 使用
 *
 * @param {number} threshold - 触发阈值（默认 0.1 = 进入 10%）
 * @returns {{ ref }}
 */
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          obs.disconnect(); // 只触发一次，触发后停止观察
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref };
}
