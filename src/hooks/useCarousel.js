import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useCarousel — 证言轮播完整状态管理
 *
 * ✅ 修复 BUG-02：resize 后 transform 偏移错误
 *   原因：旧版闭包捕获了旧的宽度值；React 版通过 useRef 持有 track DOM，
 *   resize 防抖后 setCurrentIdx(prev => prev) 触发 effect 重新读取最新宽度。
 *
 * ✅ 修复 BUG-03：鼠标悬停时轮播未暂停
 *   通过 bindPauseEvents(el) 绑定 mouseenter/mouseleave，
 *   组件卸载时自动清理（返回 cleanup 函数）。
 */
export function useCarousel(itemCount, { autoPlayInterval = 4500 } = {}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const trackRef  = useRef(null);   // 轮播 track DOM 元素
  const timerRef  = useRef(null);   // autoPlay interval id

  // ── 获取当前列数（响应式，实时读取 DOM 宽度）──
  const getColCount = useCallback(() => {
    const w = trackRef.current?.parentElement?.offsetWidth ?? 1200;
    if (w > 900) return 3;
    if (w > 600) return 2;
    return 1;
  }, []);

  // ── 跳转到指定 idx ──
  const goTo = useCallback((idx) => {
    setCurrentIdx((prev) => {
      const max = Math.max(0, itemCount - getColCount());
      const next = typeof idx === 'number' ? idx : prev;
      return Math.max(0, Math.min(next, max));
    });
  }, [itemCount, getColCount]);

  // ── 自动播放 ──
  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => {
        const max = Math.max(0, itemCount - getColCount());
        return prev >= max ? 0 : prev + 1;
      });
    }, autoPlayInterval);
  }, [autoPlayInterval, itemCount, getColCount, stopAutoPlay]);

  // ── 初始化自动播放 ──
  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  // ── BUG-02 修复：resize 防抖 200ms，重新计算 offset ──
  useEffect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // setCurrentIdx(prev => prev) 触发 effect 重渲染，
        // 此时 getColCount() 读取的是最新 DOM 宽度
        setCurrentIdx((prev) => {
          const max = Math.max(0, itemCount - getColCount());
          return Math.min(prev, max);
        });
      }, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [itemCount, getColCount]);

  // ── BUG-03 修复：绑定悬停暂停事件 ──
  const bindPauseEvents = useCallback((el) => {
    if (!el) return () => {};
    el.addEventListener('mouseenter', stopAutoPlay);
    el.addEventListener('mouseleave', startAutoPlay);
    return () => {
      el.removeEventListener('mouseenter', stopAutoPlay);
      el.removeEventListener('mouseleave', startAutoPlay);
    };
  }, [stopAutoPlay, startAutoPlay]);

  // ── 计算当前 translateX 偏移量 ──
  const getOffset = useCallback(() => {
    if (!trackRef.current) return 0;
    const cols    = getColCount();
    const gap     = 20;
    const totalW  = trackRef.current.parentElement.offsetWidth;
    const cardW   = Math.floor((totalW - gap * (cols - 1)) / cols);
    return currentIdx * (cardW + gap);
  }, [currentIdx, getColCount]);

  return {
    currentIdx,
    goTo,
    trackRef,
    startAutoPlay,
    stopAutoPlay,
    bindPauseEvents,
    getColCount,
    getOffset,
  };
}
