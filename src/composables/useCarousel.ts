/**
 * useCarousel — 证言轮播完整状态管理 Composable
 *
 * ✅ 修复 resize 后 transform 偏移错误
 * ✅ 鼠标悬停时轮播暂停
 */
import { ref, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

interface UseCarouselOptions {
  autoPlayInterval?: number;
}

export function useCarousel(itemCount: number, { autoPlayInterval = 4500 }: UseCarouselOptions = {}) {
  const currentIdx = ref(0);
  const trackRef: Ref<HTMLElement | null> = ref(null);
  let timer: ReturnType<typeof setInterval> | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  const pauseCleanups: (() => void)[] = [];

  // ── 获取当前列数（响应式，实时读取 DOM 宽度）──
  const getColCount = () => {
    const w = trackRef.value?.parentElement?.offsetWidth ?? 1200;
    if (w > 900) return 3;
    if (w > 600) return 2;
    return 1;
  };

  // ── 跳转到指定 idx ──
  const goTo = (idx: number) => {
    const max = Math.max(0, itemCount - getColCount());
    const next = typeof idx === 'number' ? idx : currentIdx.value;
    currentIdx.value = Math.max(0, Math.min(next, max));
  };

  // ── 自动播放 ──
  const stopAutoPlay = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    timer = setInterval(() => {
      const max = Math.max(0, itemCount - getColCount());
      currentIdx.value = currentIdx.value >= max ? 0 : currentIdx.value + 1;
    }, autoPlayInterval);
  };

  // ── resize 防抖 200ms ──
  const onResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const max = Math.max(0, itemCount - getColCount());
      currentIdx.value = Math.min(currentIdx.value, max);
    }, 200);
  };

  onMounted(() => {
    startAutoPlay();
    window.addEventListener('resize', onResize);
  });

  onUnmounted(() => {
    stopAutoPlay();
    window.removeEventListener('resize', onResize);
    if (resizeTimer) clearTimeout(resizeTimer);
    pauseCleanups.forEach(fn => fn());
    pauseCleanups.length = 0;
  });

  // ── 绑定悬停暂停事件 ──
  const bindPauseEvents = (el: HTMLElement | null) => {
    if (!el) return () => {};
    const onEnter = () => stopAutoPlay();
    const onLeave = () => startAutoPlay();
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    const cleanup = () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
    pauseCleanups.push(cleanup);
    return cleanup;
  };

  // ── 计算当前 translateX 偏移量 ──
  const getOffset = () => {
    if (!trackRef.value) return 0;
    const cols = getColCount();
    const gap = 20;
    const totalW = trackRef.value.parentElement?.offsetWidth ?? 0;
    const cardW = Math.floor((totalW - gap * (cols - 1)) / cols);
    return currentIdx.value * (cardW + gap);
  };

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
