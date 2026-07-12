import { ref, onMounted } from 'vue';
import { useIntersectionObserver } from '@/composables/useIntersectionObserver';

/**
 * Sticky TOC Scroll Spy
 * 监听章节元素，高亮当前可见章节
 * @param {string} selector - 章节元素选择器（如 '[data-section]'）
 * @returns {{ activeId: Ref<string> }}
 */
export function useSpyScroll(selector = '[data-section]') {
  const activeId = ref('');
  const sectionsRef = ref<Element[]>([]);

  onMounted(() => {
    if (typeof document === 'undefined') return;
    sectionsRef.value = Array.from(document.querySelectorAll(selector));
  });

  useIntersectionObserver(
    () => sectionsRef.value,
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.getAttribute('data-section') || '';
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
  );

  return { activeId };
}
