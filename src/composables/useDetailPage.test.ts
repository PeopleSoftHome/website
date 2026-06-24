import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, nextTick, watch } from 'vue';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { useDetailPage } from './useDetailPage';

vi.stubGlobal('createError', (opts) => new Error(`404:${opts.statusMessage}`));

vi.mock('#app', () => ({
  useAsyncData: (keyFn, fetchFn, options) => {
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

    setTimeout(refresh, 0);

    return { data, pending, error, refresh };
  },
}));

describe('useDetailPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  const mountPage = (options) => {
    const comp = defineComponent({
      setup() {
        const page = useDetailPage(options);
        return { page };
      },
      render() { return h('div'); },
    });
    return mount(comp);
  };

  it('loads API detail and exposes data', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: { id: 1, title: 'API Item' } });
    const param = ref('slug-a');
    const wrapper = mountPage({
      keyFn: () => `detail-${param.value}`,
      fetchFn,
      param,
      fallbackMap: { 'slug-a': { id: 1, title: 'Fallback Item' } },
    });
    await vi.advanceTimersByTimeAsync(10);
    await nextTick();
    expect(fetchFn).toHaveBeenCalledWith('slug-a');
    expect(wrapper.vm.page.data.value).toEqual({ id: 1, title: 'API Item' });
  });

  it('falls back to static map when API fails', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('network'));
    const param = ref('slug-a');
    const wrapper = mountPage({
      keyFn: () => `detail-${param.value}`,
      fetchFn,
      param,
      fallbackMap: { 'slug-a': { id: 1, title: 'Fallback Item' } },
    });
    await vi.advanceTimersByTimeAsync(10);
    await nextTick();
    expect(wrapper.vm.page.data.value).toEqual({ id: 1, title: 'Fallback Item' });
  });

  it('sets error when neither API nor fallback exists', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('network'));
    const param = ref('missing');
    const wrapper = mountPage({
      keyFn: () => `detail-${param.value}`,
      fetchFn,
      param,
      fallbackMap: {},
    });
    await vi.advanceTimersByTimeAsync(10);
    await nextTick();
    expect(wrapper.vm.page.error.value).toBeTruthy();
  });
});
