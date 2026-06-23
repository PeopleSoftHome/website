import { ref, onMounted, computed } from 'vue';
import { cmsApi } from '@/api/cms';

/**
 * Fallback 数据异步加载注册表
 * 将 CMS 各内容类型的 fallback 静态数据改为按需异步加载，
 * 避免首屏 bundle 强制打包全部 data 文件。
 */
const FALLBACK_MODULES: Record<string, () => Promise<unknown[]>> = {
  products: () => import('@/data/products').then((m) => m.PRODUCT_TABS as unknown[]),
  industries: () => import('@/data/industries').then((m) => m.INDUSTRY_TABS as unknown[]),
  testimonials: () => import('@/data/testimonials').then((m) => m.TESTIMONIALS as unknown[]),
  stats: () => import('@/data/stats').then((m) => m.STATS_DATA as unknown[]),
  logos: () => import('@/data/logos').then((m) => m.LOGO_ITEMS as unknown[]),
  'ai-cards': () => import('@/data/aiFamily').then((m) => m.AI_CARDS as unknown[]),
  resources: () => import('@/data/resources').then((m) => m.RESOURCES as unknown[]),
  'why-us': () => import('@/data/whyUs').then((m) => m.WHY_US_TABS as unknown[]),
};

export function registerFallbackModule(key: string, loader: () => Promise<unknown[]>) {
  FALLBACK_MODULES[key] = loader;
}

interface UseCmsDataOptions {
  transform?: (data: unknown[]) => unknown[];
  filterActive?: boolean;
  immediate?: boolean;
  fallbackKey?: string;
}

interface CmsItem {
  isActive?: boolean;
  [key: string]: unknown;
}

type CmsFetchResult = unknown[] | { data?: unknown[] };
type CmsFetcher = () => Promise<CmsFetchResult>;

/**
 * CMS 数据获取的统一封装
 * @param fetchFn - 返回 Promise 的 API 调用函数
 * @param options - 配置项
 * @returns { items, displayItems, isLoading, error, reload }
 */
export function useCmsData(
  fetchFn: CmsFetcher,
  options: UseCmsDataOptions = {},
) {
  // CMS 原始数据
  const items = ref<CmsItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const fallbackLoaded = ref(false);
  const fallbackData = ref<CmsItem[]>([]);

  const loadFallback = async () => {
    if (!options.fallbackKey || fallbackLoaded.value) return;
    const loader = FALLBACK_MODULES[options.fallbackKey];
    if (!loader) return;
    try {
      fallbackData.value = (await loader()) as CmsItem[];
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn(`[useCmsData] Fallback load failed: ${options.fallbackKey}`, e);
      }
      fallbackData.value = [];
    } finally {
      fallbackLoaded.value = true;
    }
  };

  /**
   * 判断当前 CMS 数据是否应回退到静态 fallback
   * 优先级：CMS 返回有效数据 > fallback > 空。
   * 当 CMS 已返回数据时优先使用 CMS；CMS 为空/失败时才使用 fallback。
   */
  const shouldUseFallback = () => {
    if (!options.fallbackKey) return false;
    if (!fallbackLoaded.value) return false;
    if (items.value.length > 0) return false;
    return fallbackData.value.length > 0;
  };

  const load = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const raw = await fetchFn();
      const data = Array.isArray(raw) ? raw : ((raw as { data?: unknown[] }).data ?? []);
      const filtered = options.filterActive !== false
        ? (data as CmsItem[]).filter((item) => item.isActive === undefined || item.isActive === true)
        : data;
      const transformed = options.transform ? options.transform(filtered as unknown[]) : filtered;
      items.value = transformed as CmsItem[];
    } catch (e) {
      const err = e as Error;
      error.value = err.message || 'Loading failed';
      if (import.meta.env.DEV) {
        console.warn(`[useCmsData] ${err.message}`);
      }
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    if (options.immediate === false) {
      if (options.fallbackKey) loadFallback();
      return;
    }
    // API 优先：先请求 CMS，若返回为空/失败再加载本地 fallback，
    // 避免每次同时下载/解析 fallback 静态数据块，降低首屏网络开销。
    load().finally(() => {
      if (options.fallbackKey && items.value.length === 0) loadFallback();
    });
  });

  const displayItems = computed(() =>
    shouldUseFallback() ? fallbackData.value : items.value
  );

  return { items, displayItems, isLoading, error, reload: load };
}

/**
 * 按 CMS key 便捷获取数据（无需手写 fetchFn）
 * @param key - CMS 内容类型: products|industries|testimonials|stats|logos|ai-cards|resources|why-us
 * @param options - 同 useCmsData
 */
const CMS_FETCHERS: Record<string, CmsFetcher> = {
  products: cmsApi.getProducts as unknown as CmsFetcher,
  industries: cmsApi.getIndustries as unknown as CmsFetcher,
  testimonials: cmsApi.getTestimonials as unknown as CmsFetcher,
  stats: cmsApi.getStats as unknown as CmsFetcher,
  logos: cmsApi.getLogos as unknown as CmsFetcher,
  'ai-cards': cmsApi.getAiCards as unknown as CmsFetcher,
  resources: cmsApi.getResources as unknown as CmsFetcher,
  'why-us': cmsApi.getWhyUs as unknown as CmsFetcher,
};

export function registerCmsFetcher(
  key: string,
  fetcher: CmsFetcher,
) {
  CMS_FETCHERS[key] = fetcher;
}

export function useCmsDataByKey(key: string, options: UseCmsDataOptions = {}) {
  const fetchFn = CMS_FETCHERS[key];
  if (!fetchFn) {
    throw new Error(`[useCmsDataByKey] Unknown CMS key: "${key}". Available: ${Object.keys(CMS_FETCHERS).join(', ')}`);
  }
  return useCmsData(fetchFn, options);
}
