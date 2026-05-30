/**
 * useApiList — 列表分页数据获取封装
 * 基于 useApiData，内置 page / total / pageSize 管理
 * @param {string} key — 缓存 key
 * @param {Function} fetchFn — 接收 { page, pageSize } 返回 Promise
 * @param {Object} options
 * @param {number} [options.pageSize=20] — 每页条数
 * @param {*} [options.defaultValue=[]] — 默认数据
 * @param {Function} [options.transform] — 额外数据转换
 */
import { ref } from 'vue';
import { useApiData } from './useApiData.js';

export function useApiList(key, fetchFn, options = {}) {
  const {
    pageSize = 20,
    defaultValue = [],
    transform = (d) => d,
  } = options;

  const page = ref(1);
  const total = ref(0);

  const { data, loading, error, refresh } = useApiData(
    key,
    () => fetchFn({ page: page.value, pageSize }),
    {
      defaultValue,
      transform: (res) => {
        total.value = res.meta?.total || 0;
        return transform(res.data || res || []);
      },
    }
  );

  return { data, loading, error, refresh, page, total, pageSize };
}
