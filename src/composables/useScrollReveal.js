/**
 * useScrollReveal — 滚动入场动画
 * 元素进入视口后添加 is-visible class，配合 reveal.css 使用
 *
 * @param {number} threshold - 触发阈值（默认 0.1 = 进入 10%）
 * @returns {{ ref: Ref<HTMLElement|null> }}
 */
import { ref, onMounted, onUnmounted } from 'vue';

export function useScrollReveal(threshold = 0.1) {
  const elRef = ref(null);
  let obs = null;

  onMounted(() => {
    const el = elRef.value;
    if (!el) return;

    obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          obs.disconnect(); // 只触发一次
        }
      },
      { threshold }
    );

    obs.observe(el);
  });

  onUnmounted(() => {
    if (obs) obs.disconnect();
  });

  return { ref: elRef };
}
