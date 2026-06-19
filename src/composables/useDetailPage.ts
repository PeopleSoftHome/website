/**
 * useDetailPage — 详情页数据加载抽象
 * 基于 useAsyncData，支持 API 获取、静态 fallback map、参数变化监听、404 处理。
 *
 * @param {Object} options
 * @param {Function} options.keyFn - () => string，基于当前参数生成 useAsyncData key
 * @param {Function} options.fetchFn - (paramValue) => Promise，API 调用函数
 * @param {Ref} options.param - 动态参数 ref/computed，如 slug
 * @param {Record<string, any>} [options.fallbackMap={}] - slug/id → fallback 数据映射
 * @param {Function} [options.transform] - 对 API 返回数据做转换
 * @param {Function} [options.mergeFn] - (apiData, fallbackData) => mergedData，自定义合并逻辑
 * @param {boolean} [options.server=false] - 是否服务端获取
 * @param {string} [options.notFoundMessage] - 404 状态消息
 * @returns {Object}
 */
import { computed } from 'vue';

export function useDetailPage(options) {
  const {
    keyFn,
    fetchFn,
    param,
    fallbackMap = {},
    transform = (data) => data,
    mergeFn,
    server = false,
    notFoundMessage = 'Not Found',
  } = options;

  const { data: apiRes, pending: isLoading, error: fetchError, refresh: asyncRefresh } = useAsyncData(
    keyFn,
    async () => {
      const value = param.value;
      let apiData = null;
      try {
        const res = await fetchFn(value);
        apiData = res?.data || res || null;
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn(`[useDetailPage] fetch failed for ${value}:`, e);
        }
      }

      const fallback = fallbackMap[value] || null;

      if (!apiData && !fallback) {
        throw createError({ statusCode: 404, statusMessage: notFoundMessage, fatal: true });
      }

      if (apiData && fallback && mergeFn) {
        return mergeFn(transform(apiData), fallback);
      }

      return apiData ? transform(apiData) : fallback;
    },
    { server, default: () => null, watch: [param] }
  );

  const data = computed(() => apiRes.value);

  const error = computed(() => {
    if (!fetchError.value) return null;
    return fetchError.value?.response?.data?.message || fetchError.value?.message || null;
  });

  return {
    data,
    isLoading,
    error,
    refresh: asyncRefresh,
  };
}
