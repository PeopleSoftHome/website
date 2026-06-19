import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Sticky TOC Scroll Spy
 * 监听章节元素，高亮当前可见章节
 * @param {string} selector - 章节元素选择器（如 '[data-section]'）
 * @returns {{ activeId: Ref<string> }}
 */
export function useSpyScroll(selector = '[data-section]') {
  const activeId = ref('');
  let observer = null;

  onMounted(() => {
    const sections = document.querySelectorAll(selector);
    if (!sections.length) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeId.value = entry.target.getAttribute('data-section') || '';
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  });

  onUnmounted(() => {
    if (observer) observer.disconnect();
  });

  return { activeId };
}
