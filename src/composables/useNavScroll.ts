/**
 * useNavScroll — 监听页面滚动位置（requestAnimationFrame 节流）
 * @returns {object} { scrolled: Ref<boolean>, showBackTop: Ref<boolean> }
 *   scrolled    - scrollY > 60：NavBar 进入白色毛玻璃态
 *   showBackTop - scrollY > 500：显示「回到顶部」按钮
 */
import { ref, onMounted, onUnmounted } from 'vue';

export function useNavScroll() {
  const scrolled = ref(false);
  const showBackTop = ref(false);
  let ticking = false;

  const handler = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        scrolled.value = window.scrollY > 60;
        showBackTop.value = window.scrollY > 500;
        ticking = false;
      });
      ticking = true;
    }
  };

  onMounted(() => {
    handler(); // 初始化执行一次
    window.addEventListener('scroll', handler, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handler);
  });

  return { scrolled, showBackTop };
}
