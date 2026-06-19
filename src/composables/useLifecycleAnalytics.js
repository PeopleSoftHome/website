/**
 * useLifecycleAnalytics — 页面生命周期与全局交互埋点
 * 包括 page_view、heatmap、scrollDepth、语言/主题切换、弹窗行为
 */
import { onMounted, onUnmounted, watch } from 'vue';

export function useLifecycleAnalytics({
  analyticsStore,
  locale,
  theme,
  modalStore,
  videoModalStore,
  searchStore,
}) {
  /* 页面加载埋点 + 热力图 + 滚动深度（动态加载，降低主包体积） */
  onMounted(() => {
    if (typeof document === 'undefined') return;
    analyticsStore.track('page_view', { title: document.title });

    let cleanupHeatmap = null;
    let cleanupScroll = null;

    import('@/composables/useHeatmap.js').then(({ useHeatmap }) => {
      cleanupHeatmap = useHeatmap(analyticsStore.track).initHeatmap();
    });
    import('@/composables/useScrollDepth.js').then(({ useScrollDepth }) => {
      cleanupScroll = useScrollDepth(analyticsStore.track).initScrollDepth();
    });

    onUnmounted(() => {
      cleanupHeatmap?.();
      cleanupScroll?.();
    });
  });

  /* 语言/主题切换埋点 */
  watch(locale, (loc, prev) => {
    if (prev !== undefined) analyticsStore.track('lang_switch', { from: prev, to: loc });
  });
  watch(() => theme.theme.value, (th, prev) => {
    if (prev !== undefined) analyticsStore.track('theme_switch', { theme: th });
  });

  /* 弹窗行为埋点 */
  watch(() => modalStore.isOpen.value, (open) => {
    if (open) analyticsStore.track('demo_modal_open');
  });
  watch(() => modalStore.step.value, (step, prev) => {
    if (step > prev && prev !== undefined) analyticsStore.track('demo_step_complete', { step });
  });
  watch(() => modalStore.isSuccess.value, (success) => {
    if (success) analyticsStore.track('demo_submit', { products: modalStore.formData.value.products });
  });
  watch(() => videoModalStore.isOpen.value, (open) => {
    if (open) analyticsStore.track('video_play');
  });
  watch(() => searchStore.isOpen.value, (open) => {
    if (open) analyticsStore.track('search_open');
  });
}
