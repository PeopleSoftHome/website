/**
 * useScrollDepth — 滚动深度追踪
 * 动态加载，减少主包体积
 */
import { useRafThrottle } from '@/composables/useRafThrottle';

type TrackFn = (event: string, props?: Record<string, unknown>) => void;

export function useScrollDepth(track: TrackFn) {
  const { schedule } = useRafThrottle();

  const initScrollDepth = () => {
    if (typeof window === 'undefined') return;
    const checkpoints = [25, 50, 75, 90];
    const reached = new Set<number>();
    const handler = () => {
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / docHeight) * 100);
      for (const cp of checkpoints) {
        if (scrollPercent >= cp && !reached.has(cp)) {
          reached.add(cp);
          track('scroll_depth', { percent: cp });
        }
      }
    };
    const onScroll = () => schedule(handler);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  };

  return { initScrollDepth };
}
