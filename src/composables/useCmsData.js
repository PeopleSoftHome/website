import { ref, onMounted, computed } from 'vue';
import { cmsApi } from '@/api/cms.js';

/**
 * Fallback 数据异步加载注册表
 * 将 CMS 各内容类型的 fallback 静态数据改为按需异步加载，
 * 避免首屏 bundle 强制打包全部 data 文件。
 */
const FALLBACK_MODULES = {
  products: () => import('@/data/products.js').then((m) => m.PRODUCT_TABS),
  industries: () => import('@/data/industries.js').then((m) => m.INDUSTRY_TABS),
  testimonials: () => import('@/data/testimonials.js').then((m) => m.TESTIMONIALS),
  stats: () => import('@/data/stats.js').then((m) => m.STATS_DATA),
  logos: () => import('@/data/logos.js').then((m) => m.LOGO_ITEMS),
  'ai-cards': () => import('@/data/aiFamily.js').then((m) => m.AI_CARDS),
  resources: () => import('@/data/resources.js').then((m) => m.RESOURCES),
  'why-us': () => import('@/data/whyUs.js').then((m) => m.WHY_US_TABS),
};

export function registerFallbackModule(key, loader) {
  FALLBACK_MODULES[key] = loader;
}

/**
 * CMS 数据获取的统一封装
 * @param {Function} fetchFn - 返回 Promise 的 API 调用函数
 * @param {Object} options
 * @param {Function} [options.transform] - 数据转换函数
 * @param {boolean} [options.filterActive=true] - 是否过滤 isActive=true
 * @param {boolean} [options.immediate=true] - 是否在 onMounted 立即调用
 * @param {string} [options.fallbackKey] - fallback 数据 key（对应 FALLBACK_MODULES）
 * @returns {Object} { items, displayItems, isLoading, error, reload }
 */
export function useCmsData(fetchFn, options = {}) {
  const items = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const fallbackLoaded = ref(false);
  const fallbackData = ref([]);

  const loadFallback = async () => {
    if (!options.fallbackKey || fallbackLoaded.value) return;
    const loader = FALLBACK_MODULES[options.fallbackKey];
    if (!loader) return;
    try {
      fallbackData.value = await loader();
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn(`[useCmsData] Fallback load failed: ${options.fallbackKey}`, e);
      }
      fallbackData.value = [];
    } finally {
      fallbackLoaded.value = true;
    }
  };

  const load = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const raw = await fetchFn();
      const data = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const filtered = options.filterActive !== false
        ? data.filter((item) => item.isActive === undefined || item.isActive === true)
        : data;
      const transformed = options.transform ? options.transform(filtered) : filtered;
      items.value = transformed;
    } catch (e) {
      error.value = e.message || 'Loading failed';
      if (import.meta.env.DEV) {
        console.warn(`[useCmsData] ${e.message}`);
      }
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    // 同时预加载 fallback 数据和 API 数据
    if (options.fallbackKey) loadFallback();
    if (options.immediate !== false) load();
  });

  const displayItems = computed(() =>
    items.value.length > 0 ? items.value : fallbackData.value
  );

  return { items, displayItems, isLoading, error, reload: load };
}

/**
 * 按 CMS key 便捷获取数据（无需手写 fetchFn）
 * @param {string} key - CMS 内容类型: products|industries|testimonials|stats|logos|ai-cards|resources|why-us
 * @param {Object} options - 同 useCmsData
 */
const CMS_FETCHERS = {
  products: cmsApi.getProducts,
  industries: cmsApi.getIndustries,
  testimonials: cmsApi.getTestimonials,
  stats: cmsApi.getStats,
  logos: cmsApi.getLogos,
  'ai-cards': cmsApi.getAiCards,
  resources: cmsApi.getResources,
  'why-us': cmsApi.getWhyUs,
};

export function registerCmsFetcher(key, fetcher) {
  CMS_FETCHERS[key] = fetcher;
}

export function useCmsDataByKey(key, options = {}) {
  const fetchFn = CMS_FETCHERS[key];
  if (!fetchFn) {
    throw new Error(`[useCmsDataByKey] Unknown CMS key: "${key}". Available: ${Object.keys(CMS_FETCHERS).join(', ')}`);
  }
  return useCmsData(fetchFn, options);
}
