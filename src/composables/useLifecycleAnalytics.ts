/**
 * useLifecycleAnalytics — 页面生命周期与全局交互埋点
 * 包括 page_view、heatmap、scrollDepth、语言/主题切换、弹窗行为
 */
import { onMounted, onUnmounted, watch, toValue } from 'vue';
import type { Ref, MaybeRef } from 'vue';

interface AnalyticsStore {
  track: (event: string, props?: Record<string, unknown>) => void;
}

interface ModalStore {
  isOpen: MaybeRef<boolean>;
  step: MaybeRef<number>;
  isSuccess: MaybeRef<boolean>;
  formData: MaybeRef<{ products: unknown[] }>;
}

interface VideoModalStore {
  isOpen: MaybeRef<boolean>;
}

interface SearchStore {
  isOpen: MaybeRef<boolean>;
}

interface ThemeStore {
  theme: MaybeRef<string>;
}

interface UseLifecycleAnalyticsOptions {
  analyticsStore: AnalyticsStore;
  locale: Ref<string>;
  theme: ThemeStore;
  modalStore: ModalStore;
  videoModalStore: VideoModalStore;
  searchStore: SearchStore;
}

export function useLifecycleAnalytics({
  analyticsStore,
  locale,
  theme,
  modalStore,
  videoModalStore,
  searchStore,
}: UseLifecycleAnalyticsOptions) {
  /* 页面加载埋点 + 热力图 + 滚动深度（动态加载，降低主包体积） */
  onMounted(() => {
    if (typeof document === 'undefined') return;
    analyticsStore.track('page_view', { title: document.title });

    let cleanupHeatmap: (() => void) | undefined = undefined;
    let cleanupScroll: (() => void) | undefined = undefined;

    import('@/composables/useHeatmap').then(({ useHeatmap }) => {
      cleanupHeatmap = useHeatmap(analyticsStore.track).initHeatmap();
    });
    import('@/composables/useScrollDepth').then(({ useScrollDepth }) => {
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
  watch(() => toValue(theme.theme), (th, prev) => {
    if (prev !== undefined) analyticsStore.track('theme_switch', { theme: th });
  });

  /* 弹窗行为埋点 */
  watch(() => toValue(modalStore.isOpen), (open) => {
    if (open) analyticsStore.track('demo_modal_open');
  });
  watch(() => toValue(modalStore.step), (step, prev) => {
    if (step > prev && prev !== undefined) analyticsStore.track('demo_step_complete', { step });
  });
  watch(() => toValue(modalStore.isSuccess), (success) => {
    if (success) analyticsStore.track('demo_submit', { products: toValue(modalStore.formData).products });
  });
  watch(() => toValue(videoModalStore.isOpen), (open) => {
    if (open) analyticsStore.track('video_play');
  });
  watch(() => toValue(searchStore.isOpen), (open) => {
    if (open) analyticsStore.track('search_open');
  });
}
