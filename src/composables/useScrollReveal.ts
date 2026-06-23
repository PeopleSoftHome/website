/**
 * useScrollReveal — 滚动入场动画
 * 元素进入视口后添加 is-visible class，配合 reveal.css 使用
 *
 * @param {number} threshold - 触发阈值（默认 0.1 = 进入 10%）
 * @returns {{ ref: Ref<HTMLElement|null> }}
 */
import { ref } from 'vue';
import type { Ref } from 'vue';
import { useIntersectionObserver } from '@/composables/useIntersectionObserver';

export function useScrollReveal(threshold = 0.1) {
  const elRef: Ref<HTMLElement | null> = ref(null);

  useIntersectionObserver(
    () => elRef.value,
    ([entry]) => {
      if (!entry || !entry.isIntersecting || !elRef.value) return;
      elRef.value.classList.add('is-visible');
    },
    { threshold, once: true },
  );

  return { ref: elRef };
}
