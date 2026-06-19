/**
 * useListPage — 列表页数据加载与筛选抽象
 * 基于 useAsyncData，统一处理 API 加载、静态 fallback、分类筛选、错误与刷新。
 *
 * @param {Object} options
 * @param {string} options.key - useAsyncData 唯一 key
 * @param {Function} options.fetchFn - (filters) => Promise，API 调用函数
 * @param {Ref|Object} [options.filters] - 响应式筛选条件（会触发重新获取）
 * @param {Array} [options.fallbackData=[]] - API 失败/为空时的静态 fallback
 * @param {Function} [options.transform] - 对 API 返回数组做转换
 * @param {Function} [options.filterFn] - (item, filters) => boolean
 * @param {number} [options.pageSize] - 每页条数；提供则启用 loadMore
 * @param {boolean} [options.server=false] - 是否服务端获取
 * @returns {Object}
 */
import { ref, computed, watch } from 'vue';

export function useListPage(options) {
  const {
    key,
    fetchFn,
    filters = ref({}),
    fallbackData = [],
    transform = (data) => data,
    filterFn = () => true,
    pageSize,
    server = false,
  } = options;

  const displayLimit = ref(pageSize || Infinity);

  const { data: apiRes, pending: isLoading, error: fetchError, refresh: asyncRefresh } = useAsyncData(
    key,
    () => fetchFn(filters.value),
    { server, default: () => null, watch: [filters] }
  );

  const apiItems = computed(() => {
    if (!apiRes.value) return [];
    const data = Array.isArray(apiRes.value) ? apiRes.value : (apiRes.value?.data || []);
    return transform(data);
  });

  const items = computed(() => {
    if (fetchError.value || apiItems.value.length === 0) return fallbackData;
    return apiItems.value;
  });

  const filteredItems = computed(() => items.value.filter((item) => filterFn(item, filters.value)));

  const displayedItems = computed(() => {
    if (!pageSize || displayLimit.value >= filteredItems.value.length) return filteredItems.value;
    return filteredItems.value.slice(0, displayLimit.value);
  });

  const hasMore = computed(() => pageSize && filteredItems.value.length > displayLimit.value);

  const loadMore = () => {
    if (!pageSize) return;
    displayLimit.value += pageSize;
  };

  const resetLimit = () => { displayLimit.value = pageSize || Infinity; };

  watch(filters, () => { resetLimit(); }, { deep: true });

  const refresh = () => {
    resetLimit();
    return asyncRefresh();
  };

  return {
    apiItems,
    items,
    filteredItems,
    displayedItems,
    isLoading,
    error: fetchError,
    hasMore,
    loadMore,
    refresh,
    resetLimit,
  };
}
