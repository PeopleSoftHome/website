/**
 * useApiData — Nuxt useAsyncData 通用封装
 * 兼容现有模板的 loading / error / data 接口
 * @param {string} key — 缓存 key
 * @param {Function} fetchFn — 返回 Promise 的获取函数
 * @param {Object} options
 * @param {boolean} [options.server=false] — SSR 开关（当前项目默认 false）
 * @param {boolean} [options.immediate=true] — 是否立即执行
 * @param {*} [options.defaultValue=null] — 默认值
 * @param {Function} [options.transform] — 数据转换函数
 */
import { computed } from 'vue';

export function useApiData(key, fetchFn, options = {}) {
  const {
    server = false,
    immediate = true,
    defaultValue = null,
    transform = (d) => d,
  } = options;

  const { data: rawData, pending, error: rawError, refresh, execute } = useAsyncData(
    key,
    async () => {
      const res = await fetchFn();
      return transform(res.data ?? res);
    },
    { server, immediate }
  );

  const data = computed(() => rawData.value ?? defaultValue);
  const error = computed(() => {
    if (!rawError.value) return null;
    return rawError.value?.response?.data?.message || rawError.value.message || '加载失败';
  });

  return { data, loading: pending, error, refresh, execute };
}
