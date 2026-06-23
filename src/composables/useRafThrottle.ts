/**
 * useRafThrottle — 基于 requestAnimationFrame 的节流器
 * 适用于 scroll / resize 等高频事件，避免每帧重复计算。
 */
import { onMounted, onUnmounted } from 'vue';

export function useRafThrottle() {
  let ticking = false;
  let callbacks: (() => void)[] = [];

  const schedule = (cb: () => void) => {
    callbacks.push(cb);
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cbs = callbacks;
      callbacks = [];
      ticking = false;
      cbs.forEach((fn) => fn());
    });
  };

  return { schedule };
}

export function useWindowEvent(
  event: 'scroll' | 'resize' | string,
  handler: () => void,
  options?: AddEventListenerOptions,
) {
  const { schedule } = useRafThrottle();

  const onEvent = () => schedule(handler);

  onMounted(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener(event, onEvent, options);
  });

  onUnmounted(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener(event, onEvent, options);
  });

  return { schedule };
}
