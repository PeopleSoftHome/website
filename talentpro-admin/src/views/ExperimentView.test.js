import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import { useAuthStore } from '@/stores/auth.js';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import ExperimentView from './ExperimentView.vue';
import client from '@/api/client.js';
import { permissionDirective } from '@/directives/permission.js';

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

describe('ExperimentView', () => {
  let wrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    useAuthStore().setUser({ id: '1', role: 'SUPER_ADMIN' });
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  const mountComponent = () =>
    mount(ExperimentView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
        directives: { permission: permissionDirective },
      },
      attachTo: document.body,
    });

  const mockExperiments = [
    {
      id: '1',
      key: 'hero-cta-v1',
      name: 'Hero CTA 文案实验',
      trafficSplit: 0.3,
      status: 'running',
    },
    {
      id: '2',
      key: 'pricing-page-v2',
      name: '定价页实验',
      trafficSplit: 0.5,
      status: 'draft',
    },
  ];

  it('renders title and create button', async () => {
    client.get.mockResolvedValue({ data: [] });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('A/B 测试管理');
    expect(wrapper.text()).toContain('新建实验');
  });

  it('fetches experiments on mount', async () => {
    client.get.mockResolvedValue({ data: mockExperiments });
    wrapper = mountComponent();
    await flushPromises();
    expect(client.get).toHaveBeenCalledWith('/experiments');
    expect(wrapper.text()).toContain('Hero CTA 文案实验');
  });

  it('computes traffic allocation text correctly', async () => {
    client.get.mockResolvedValue({ data: mockExperiments });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('A: 70.0% / B: 30%');
    expect(wrapper.text()).toContain('A: 50.0% / B: 50%');
  });

  it('changes experiment status', async () => {
    client.get.mockResolvedValue({ data: mockExperiments });
    client.post.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.vm.changeStatus('1', 'paused');
    await flushPromises();

    expect(client.post).toHaveBeenCalledWith('/experiments/1/status', { status: 'paused' });
  });

  it('fetches stats when viewing experiment', async () => {
    client.get.mockResolvedValueOnce({ data: mockExperiments });
    client.get.mockResolvedValueOnce({
      data: {
        impressions: [{ variant: 'A', _count: { variant: 100 } }],
        conversions: [{ variant: 'B', _count: { variant: 20 } }],
      },
    });
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.vm.viewStats(mockExperiments[0]);
    await flushPromises();

    expect(client.get).toHaveBeenCalledWith('/experiments/1/stats');
    expect(wrapper.vm.selectedExp.id).toBe('1');
  });

  it('opens create dialog and submits new experiment', async () => {
    client.get.mockResolvedValue({ data: [] });
    client.post.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    const createBtn = wrapper.findAll('button').find((b) => b.text().includes('新建实验'));
    expect(createBtn).toBeTruthy();
    await createBtn.trigger('click');
    await flushPromises();

    expect(document.body.textContent).toContain('新建 A/B 实验');

    wrapper.vm.form.key = 'new-exp';
    wrapper.vm.form.name = '新实验';
    wrapper.vm.form.trafficSplit = 0.4;
    wrapper.vm.variantAJson = '{"text":"A"}';
    wrapper.vm.variantBJson = '{"text":"B"}';

    await wrapper.vm.createExp();
    await flushPromises();

    expect(client.post).toHaveBeenCalledWith(
      '/experiments',
      expect.objectContaining({
        key: 'new-exp',
        name: '新实验',
        trafficSplit: 0.4,
        variantA: { text: 'A' },
        variantB: { text: 'B' },
      }),
    );
  });

  it('shows json error for invalid variant config', async () => {
    client.get.mockResolvedValue({ data: [] });
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.showCreate = true;
    wrapper.vm.variantAJson = 'not-json';
    await wrapper.vm.createExp();
    await flushPromises();

    expect(client.post).not.toHaveBeenCalled();
  });
});
