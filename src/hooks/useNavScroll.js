import { useState, useEffect } from 'react';

/**
 * useNavScroll — 监听页面滚动位置（requestAnimationFrame 节流）
 * @returns {object} { scrolled, showBackTop }
 *   scrolled    - scrollY > 60：NavBar 进入白色毛玻璃态
 *   showBackTop - scrollY > 500：显示「回到顶部」按钮
 */
export function useNavScroll() {
  const [scrolled,    setScrolled]    = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60);
          setShowBackTop(window.scrollY > 500);
          ticking = false;
        });
        ticking = true;
      }
    };

    // 初始化执行一次，防止页面刷新后停留在中间
    handler();

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return { scrolled, showBackTop };
}
