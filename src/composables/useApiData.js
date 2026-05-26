import { ref, onMounted } from 'vue';

/**
 * useApiData — 通用 API 数据获取 Composable
 * 自动在 onMounted 调用 API，失败时保持 fallback 数据不变
 */
export function useApiData(fetchFn, fallbackRef, options = {}) {
  const loading = ref(false);
  const error = ref(null);

  const load = async () => {
    if (options.immediate === false) return;
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchFn();
      if (data && Array.isArray(data)) {
        fallbackRef.value = data;
      } else if (data && typeof data === 'object') {
        // 分页或包装结构
        fallbackRef.value = data.data ?? data;
      }
    } catch (e) {
      error.value = e.message || '加载失败';
      if (import.meta.env.DEV) {
        console.warn('[useApiData]', e.message);
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    load();
  });

  return { loading, error, reload: load };
}
