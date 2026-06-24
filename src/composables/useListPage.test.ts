import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick, computed } from 'vue';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { useListPage } from './useListPage';

vi.mock('#app', () => ({
  useAsyncData: (key, fetchFn, options) => {
    const data = ref(options?.default?.() ?? null);
    const pending = ref(false);
    const error = ref(null);

    const refresh = async () => {
      pending.value = true;
      error.value = null;
      try {
        data.value = await fetchFn();
      } catch (e) {
        error.value = e;
        data.value = options?.default?.() ?? null;
      } finally {
        pending.value = false;
      }
    };

    if (options?.watch) {
      options.watch.forEach((w) => {
        w && watch(w, refresh, { deep: true });
      });
    }

    // auto-refresh on mount-like call
    setTimeout(refresh, 0);

    return { data, pending, error, refresh };
  },
}));

import { watch } from 'vue';

describe('useListPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  const mountPage = (options) => {
    const comp = defineComponent({
      setup() {
        const page = useListPage(options);
        return { page };
      },
      render() { return h('div'); },
    });
    return mount(comp);
  };

  it('loads API items and exposes them', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [{ id: 1, name: 'A' }] });
    const wrapper = mountPage({
      key: 'test-list',
      fetchFn,
      filters: ref({}),
      fallbackData: [{ id: 2, name: 'Fallback' }],
    });
    await vi.advanceTimersByTimeAsync(10);
    await nextTick();
    expect(fetchFn).toHaveBeenCalled();
    expect(wrapper.vm.page.items.value).toEqual([{ id: 1, name: 'A' }]);
  });

  it('falls back to static data when API returns empty', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [] });
    const fallbackData = [{ id: 2, name: 'Fallback' }];
    const wrapper = mountPage({
      key: 'test-list-empty',
      fetchFn,
      filters: ref({}),
      fallbackData,
    });
    await vi.advanceTimersByTimeAsync(10);
    await nextTick();
    expect(wrapper.vm.page.items.value).toEqual(fallbackData);
  });

  it('applies filterFn', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      data: [
        { id: 1, category: 'a' },
        { id: 2, category: 'b' },
      ],
    });
    const filters = ref({ category: 'a' });
    const wrapper = mountPage({
      key: 'test-list-filter',
      fetchFn,
      filters,
      fallbackData: [],
      filterFn: (item, f) => item.category === f.category,
    });
    await vi.advanceTimersByTimeAsync(10);
    await nextTick();
    expect(wrapper.vm.page.filteredItems.value).toEqual([{ id: 1, category: 'a' }]);
  });

  it('supports loadMore pagination', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}` })),
    });
    const wrapper = mountPage({
      key: 'test-list-paging',
      fetchFn,
      filters: ref({}),
      fallbackData: [],
      pageSize: 3,
    });
    await vi.advanceTimersByTimeAsync(10);
    await nextTick();
    expect(wrapper.vm.page.displayedItems.value).toHaveLength(3);
    expect(wrapper.vm.page.hasMore.value).toBe(true);
    wrapper.vm.page.loadMore();
    await nextTick();
    expect(wrapper.vm.page.displayedItems.value).toHaveLength(6);
  });
});
