/**
 * use List 模块
 *
 * 位于: composables/useList.ts
 */
import { ref, watch, onMounted, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import { normalizePaginationResponse } from '@/api/client';

export interface ListPage<T> {
  items: T[];
  total: number;
}

export interface UseListOptions<T, P extends Record<string, unknown>> {
  fetchFn: (params: P & { page: number; pageSize: number }) => Promise<unknown>;
  responseAdapter?: (res: unknown) => ListPage<T>;
  defaultParams?: Partial<P>;
  pageSize?: number;
  immediate?: boolean;
}

/**
 * 通用列表状态管理 Composable
 *
 * @returns items, total, page, pageSize, loading, error, params, fetch, refresh, setParams
 */
export function useList<T = unknown, P extends Record<string, unknown> = Record<string, unknown>>(
  options: UseListOptions<T, P>,
) {
  const items: Ref<T[]> = ref([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(options.pageSize || 20);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);
  const params = ref({ ...(options.defaultParams || {}) }) as Ref<Partial<P>>;

  const normalize = (res: unknown): ListPage<T> => {
    if (options.responseAdapter) {
      return options.responseAdapter(res);
    }
    return normalizePaginationResponse<T>(res);
  };

  const fetch = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    try {
      const res = await options.fetchFn({
        page: page.value,
        pageSize: pageSize.value,
        ...params.value,
      } as P & { page: number; pageSize: number });
      const adapted = normalize(res);
      items.value = adapted.items || [];
      total.value = adapted.total || 0;
    } catch (e) {
      error.value = (e as Error).message || '加载失败';
      if (import.meta.env.DEV) {
        console.error('[useList]', e);
      }
      ElMessage.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  const refresh = (): Promise<void> => fetch();

  const setParams = (newParams: Partial<P>): void => {
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
