import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, h, ref, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { usePagedList } from './usePagedList';

// useAsyncData 由 src/test/setup.ts 全局 stub（立即执行 fetcher 并返回 ref 数据）

interface Post {
  id: number;
  title: string;
}

function mountList(fetchFn: ReturnType<typeof vi.fn>, fallback: Post[] = []) {
  let exposed: ReturnType<typeof usePagedList<Post>> | undefined;
  const comp = defineComponent({
    setup() {
      exposed = usePagedList<Post>({
        key: 'test-list',
        fetchFn,
        pageSize: 10,
        fallbackData: fallback,
      });
      return () => h('div');
    },
  });
  mount(comp);
  return exposed as ReturnType<typeof usePagedList<Post>>;
}

describe('usePagedList', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('API 有数据时使用 API 结果与 meta.total', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [{ id: 1, title: 'A' }], meta: { total: 42 } });
    const list = mountList(fetchFn, [{ id: 9, title: 'F' }]);
    await flushPromises();

    expect(fetchFn).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
    expect(list.items.value).toEqual([{ id: 1, title: 'A' }]);
    expect(list.total.value).toBe(42);
    expect(list.hasApi.value).toBe(true);
  });

  it('API 为空/失败时回退静态数据与 fallback 长度', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } });
    const fallback = [{ id: 1, title: 'F1' }, { id: 2, title: 'F2' }];
    const list = mountList(fetchFn, fallback);
    await flushPromises();

    expect(list.items.value).toEqual(fallback);
    expect(list.total.value).toBe(2);
    expect(list.hasApi.value).toBe(false);
  });

  it('meta.total 缺失时回退为当前页数据长度', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] });
    const list = mountList(fetchFn);
    await flushPromises();

    expect(list.total.value).toBe(3);
  });

  it('resetPage 将页码重置为 1', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [{ id: 1 }], meta: { total: 5 } });
    const list = mountList(fetchFn);
    await flushPromises();

    list.page.value = 3;
    await nextTick();
    list.resetPage();
    expect(list.page.value).toBe(1);
  });
});
