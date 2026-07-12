import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus, { ElMessageBox } from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import FeatureFlagView from './FeatureFlagView.vue';
import client from '@/api/client.js';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: { zh: zhCN },
});

vi.mock('@/api/client.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  normalizePaginationResponse: (res) => {
    if (!res) return { items: [], total: 0 };
    const data = res.data;
    if (Array.isArray(data)) {
      return { items: data, total: res.meta?.total ?? data.length };
    }
    if (data && typeof data === 'object') {
      return {
        items: data.items || data.data || [],
        total: data.total ?? data.meta?.total ?? 0,
      };
    }
    return { items: [], total: 0 };
  },
}));

describe('FeatureFlagView', () => {
  let wrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  const mountComponent = () =>
    mount(FeatureFlagView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
      },
      attachTo: document.body,
    });

  it('renders title and description', async () => {
    client.get.mockResolvedValue({ data: { data: [] } });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('功能开关');
    expect(wrapper.text()).toContain('管理灰度发布与模块启停');
  });

  it('fetches feature flags on mount', async () => {
    client.get.mockResolvedValue({
      data: {
        data: [{ key: 'featureFlags', value: { enableNewPricing: true } }],
      },
    });
    wrapper = mountComponent();
    await flushPromises();
    expect(client.get).toHaveBeenCalledWith('/system/settings');
    expect(wrapper.text()).toContain('enableNewPricing');
  });

  it('toggles flag value and saves', async () => {
    client.get.mockResolvedValue({
      data: {
        data: [{ key: 'featureFlags', value: { enableNewPricing: true } }],
      },
    });
    client.post.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    const switches = wrapper.findAllComponents({ name: 'ElSwitch' });
    expect(switches.length).toBeGreaterThan(0);
    await switches[0].trigger('click');
    await flushPromises();

    expect(client.post).toHaveBeenCalledWith(
      '/system/settings',
      expect.objectContaining({
        key: 'featureFlags',
        value: { enableNewPricing: false },
      }),
    );
  });

  it('opens add flag dialog and creates a new flag', async () => {
    client.get.mockResolvedValue({ data: { data: [] } });
    client.post.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    const addBtn = wrapper.findAll('button').find((b) => b.text().includes('新增开关'));
    expect(addBtn).toBeTruthy();
    await addBtn.trigger('click');
    await flushPromises();

    expect(document.body.textContent).toContain('新增功能开关');

    wrapper.vm.form.key = 'newFeature';
    wrapper.vm.form.value = true;
    await wrapper.vm.addFlag();
    await flushPromises();

    expect(client.post).toHaveBeenCalledWith(
      '/system/settings',
      expect.objectContaining({
        key: 'featureFlags',
        value: { newFeature: true },
      }),
    );
  });

  it('deletes flag after confirmation', async () => {
    vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue();
    client.get.mockResolvedValue({
      data: {
        data: [{ key: 'featureFlags', value: { enableNewPricing: true } }],
      },
    });
    client.post.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    const deleteBtn = wrapper.findAll('button').find((b) => b.text().includes('删除'));
    expect(deleteBtn).toBeTruthy();
    await deleteBtn.trigger('click');
    await flushPromises();

    expect(ElMessageBox.confirm).toHaveBeenCalled();
    expect(client.post).toHaveBeenCalledWith(
      '/system/settings',
      expect.objectContaining({
        key: 'featureFlags',
        value: {},
      }),
    );
  });
});
