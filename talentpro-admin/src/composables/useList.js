/**
 * use List 模块
 *
 * 位于: composables/useList.js
 */
import { ref, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { normalizePaginationResponse } from '@/api/client.js';

/**
 * 通用列表状态管理 Composable
 *
 * @param {Object} options
 * @param {Function} options.fetchFn - (params: { page, pageSize, ...filters }) => Promise<response>
 * @param {Function} [options.responseAdapter] - (res) => { items, total }
 *   默认支持：{ data: Array, meta: { total } } / { data: { items, total } } / { data: Array }
 * @param {Object} [options.defaultParams] - 默认查询参数（filters）
 * @param {number} [options.pageSize=20]
 * @param {boolean} [options.immediate=true] - 是否在 onMounted 立即加载
 *
 * @returns {Object}
 *   items, total, page, pageSize, loading, error, params,
 *   fetch, refresh, setParams
 */
export function useList(options) {
  const items = ref([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(options.pageSize || 20);
  const loading = ref(false);
  const error = ref(null);
  const params = ref({ ...(options.defaultParams || {}) });

  const normalize = (res) => {
    if (options.responseAdapter) {
      return options.responseAdapter(res);
    }
    return normalizePaginationResponse(res);
  };

  const fetch = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await options.fetchFn({
        page: page.value,
        pageSize: pageSize.value,
        ...params.value,
      });
      const adapted = normalize(res);
      items.value = adapted.items || [];
      total.value = adapted.total || 0;
    } catch (e) {
      error.value = e.message || '加载失败';
      if (import.meta.env.DEV) {
        console.error('[useList]', e);
      }
      ElMessage.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => fetch();

  const setParams = (newParams) => {
    params.value = { ...params.value, ...newParams };
    page.value = 1;
    fetch();
  };

  // 分页变化时自动重新加载
  watch([page, pageSize], fetch, { immediate: false });

  if (options.immediate !== false) {
    onMounted(fetch);
  }

  return {
    items,
    total,
    page,
    pageSize,
    loading,
    error,
    params,
    fetch,
    refresh,
    setParams,
  };
}
