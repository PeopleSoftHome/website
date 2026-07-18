/**
 * usePagedList — 服务端分页列表抽象
 *
 * 与 useListPage（全量拉取 + 客户端 loadMore）互补：
 * 本 composable 面向"页码翻页 + 服务端返回 meta.total"的列表（blog/forum 等）。
 *
 * 统一处理：page 状态与监听、API 失败/为空时回退静态数据、total 计算。
 * 调用方保留：fetchFn（闭包内组装 category/status 等参数）、错误文案映射、
 * fallback 的筛选逻辑（通过 fallbackData 传入 computed）。
 */
import { ref, computed, unref, type Ref, type WatchSource } from 'vue';

interface UsePagedListOptions<T> {
  /** useAsyncData key（函数形式可携带 locale 等动态段） */
  key: string | (() => string);
  /** 分页参数透传：fetchFn({ page, pageSize }) */
  fetchFn: (params: { page: number; pageSize: number }) => Promise<unknown>;
  pageSize: number;
  /** 额外监听源（如 activeCategory、locale），变化时自动重新获取 */
  watchSources?: WatchSource[];
  /** API 失败/为空时的静态回退数据（可传 computed 实现筛选） */
  fallbackData?: T[] | Ref<T[]>;
  /** useAsyncData 的 server 选项，默认 true */
  server?: boolean;
}

export function usePagedList<T = unknown>(options: UsePagedListOptions<T>) {
  const page = ref(1);
  const pageSize = options.pageSize;

  const asyncKey: () => string = typeof options.key === 'function'
    ? (options.key as () => string)
    : () => options.key as string;

  const { data, pending: isLoading, error, refresh } = useAsyncData(
    asyncKey,
    () => options.fetchFn({ page: page.value, pageSize }),
    {
      server: options.server ?? true,
      default: () => null,
      watch: [page, ...(options.watchSources || [])],
    },
  );

  const apiItems = computed<T[]>(() => {
    const res = data.value as { data?: unknown } | unknown[] | null;
    if (!res) return [];
    if (Array.isArray(res)) return res as T[];
    const list = (res as { data?: unknown }).data;
    return Array.isArray(list) ? (list as T[]) : [];
  });

  const hasApi = computed(() => apiItems.value.length > 0);

  const fallback = computed<T[]>(() => unref(options.fallbackData) || []);

  const items = computed<T[]>(() => (hasApi.value ? apiItems.value : fallback.value));

  const total = computed<number>(() => {
    if (hasApi.value) {
      const meta = (data.value as { meta?: { total?: number } } | null)?.meta;
      return meta?.total ?? apiItems.value.length;
    }
    return fallback.value.length;
  });

  const resetPage = () => {
    page.value = 1;
  };

  return {
    items,
    total,
    page,
    pageSize,
    isLoading,
    error,
    refresh,
    hasApi,
    resetPage,
  };
}
