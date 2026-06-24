/**
 * 在浏览器空闲时预加载关键弹窗 chunk，减少首次打开延迟。
 * 使用动态 import() 触发 Vite chunk 下载；相同模块二次 import 会命中缓存。
 */
export function usePrefetchModals() {
  if (typeof window === 'undefined') return;

  const schedule = (typeof window.requestIdleCallback === 'function')
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 2000);

  schedule(() => {
    void import('@/components/ui/SearchModal/SearchModal.vue');
    void import('@/components/ui/ContactModal/ContactModal.vue');
    void import('@/components/ui/AuthModal/AuthModal.vue');
    void import('@/components/ui/ChatBot/ChatBot.vue');
  });
}
