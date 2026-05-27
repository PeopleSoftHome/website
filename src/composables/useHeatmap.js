/**
 * useHeatmap — 热力图点击追踪
 * 动态加载，减少主包体积
 */
export function useHeatmap(track) {
  const initHeatmap = () => {
    if (typeof window === 'undefined') return;
    const handler = (e) => {
      const el = e.target.closest('[data-track]') || e.target;
      const section = el.closest('section')?.id || el.closest('[id]')?.id || 'unknown';
      track('heatmap_click', {
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        section,
        tag: el.tagName,
        id: el.id || undefined,
        class: el.className?.slice?.(0, 100) || undefined,
      });
    };
    document.addEventListener('click', handler, { passive: true });
    return () => document.removeEventListener('click', handler);
  };

  return { initHeatmap };
}
