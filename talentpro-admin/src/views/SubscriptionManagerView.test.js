import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import SubscriptionManagerView from './SubscriptionManagerView.vue';
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

vi.mock('@/components/CmsTable.vue', () => ({
  default: {
    name: 'CmsTable',
    template: '<div class="cms-table-stub"><slot /></div>',
    props: ['apiUrl', 'columns', 'formFields', 'apiParams'],
    methods: {
      setParams(params) { this.$emit('update:apiParams', params); },
      refresh() {},
    },
  },
}));

describe('SubscriptionManagerView', () => {
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
    mount(SubscriptionManagerView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
      },
      attachTo: document.body,
    });

  const mockSubscription = {
    id: 'sub1',
    appName: '智能招聘',
    app: { name: '智能招聘 Pro' },
    workspaceId: 'ws1',
    tierName: '专业版',
    pricingModel: 'SUBSCRIPTION',
    amount: 999,
    interval: 'month',
    status: 'ACTIVE',
    trialEndsAt: '2026-07-10T00:00:00Z',
    currentPeriodEnd: '2026-08-01T00:00:00Z',
    createdAt: '2026-06-01T00:00:00Z',
  };

  it('renders title and filter controls', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('订阅管理');
    expect(wrapper.text()).toContain('全部状态');
  });

  it('computes status and pricing labels', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.vm.statusLabel('ACTIVE')).toContain('生效中');
    expect(wrapper.vm.pricingLabel('SUBSCRIPTION')).toContain('订阅制');
    expect(wrapper.vm.statusType('PAST_DUE')).toBe('danger');
  });

  it('opens detail dialog and displays subscription info', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.openDetailDialog(mockSubscription);
    await flushPromises();

    expect(wrapper.vm.detailVisible).toBe(true);
    expect(wrapper.vm.detail.id).toBe('sub1');
    expect(wrapper.vm.detail.appName).toBe('智能招聘 Pro');
  });

  it('opens status dialog and updates subscription status', async () => {
    client.patch.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.openStatusDialog(mockSubscription);
    await flushPromises();
    expect(wrapper.vm.statusDialogVisible).toBe(true);

    wrapper.vm.statusForm.status = 'CANCELLED';
    await wrapper.vm.handleStatusSave();
    await flushPromises();

    expect(client.patch).toHaveBeenCalledWith(
      '/admin/marketplace/subscriptions/sub1/status',
      expect.objectContaining({ status: 'CANCELLED' }),
    );
  });

  it('applies status filter and refreshes table', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.filterStatus = 'TRIAL';
    wrapper.vm.handleFilterChange();
    await flushPromises();

    expect(wrapper.vm.apiParams).toEqual({ status: 'TRIAL' });
  });
});
