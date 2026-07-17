/**
 * useDetailPage — 详情页数据加载抽象
 * 基于 useAsyncData，支持 API 获取、静态 fallback map、参数变化监听、404 处理。
 *
 * @param {Object} options
 * @param {Function} options.keyFn - () => string，基于当前参数生成 useAsyncData key
 * @param {Function} options.fetchFn - (paramValue) => Promise，API 调用函数
 * @param {Ref} options.param - 动态参数 ref/computed，如 slug
 * @param {Record<string, any>|Ref|Function} [options.fallbackMap={}] - slug/id → fallback 数据映射；
 *   可传 computed/getter，使 handler 每次执行时读取最新值（如随 locale 切换的静态数据）
 * @param {Function} [options.transform] - 对 API 返回数据做转换
 * @param {Function} [options.mergeFn] - (apiData, fallbackData) => mergedData，自定义合并逻辑
 * @param {boolean} [options.server=false] - 是否服务端获取
 * @param {string} [options.notFoundMessage] - 404 状态消息
 * @returns {Object}
 */
import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue';

interface UseDetailPageOptions<T = unknown> {
  keyFn: () => string;
  fetchFn: (value: string) => Promise<unknown>;
  param: Ref<string | undefined>;
  fallbackMap?: MaybeRefOrGetter<Record<string, T>>;
  transform?: (data: unknown) => T;
  mergeFn?: (apiData: T, fallbackData: T) => T;
  server?: boolean;
  notFoundMessage?: string;
}

export function useDetailPage<T = unknown>(options: UseDetailPageOptions<T>) {
  const {
    keyFn,
    fetchFn,
    param,
    fallbackMap = {},
    transform = (data: unknown): T => data as T,
    mergeFn,
    server = false,
    notFoundMessage = 'Not Found',
  } = options;

  const { data: apiRes, pending: isLoading, error: fetchError, refresh: asyncRefresh } = useAsyncData(
    keyFn,
    async () => {
      const value = param.value;
      if (!value) {
        throw createError({ statusCode: 404, statusMessage: notFoundMessage, fatal: true });
      }
      let apiData: unknown = null;
      try {
        const res = await fetchFn(value);
        apiData = (res as { data?: unknown })?.data || res || null;
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn(`[useDetailPage] fetch failed for ${value}:`, e);
        }
      }

      const fallback = toValue(fallbackMap)[value] || null;

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

  const data = computed(() => apiRes.value as T | null);

  const error = computed(() => {
    if (!fetchError.value) return null;
    const err = fetchError.value as unknown as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return err.response?.data?.message || err.message || null;
  });

  return {
    data,
    isLoading,
    error,
    refresh: asyncRefresh,
  };
}
