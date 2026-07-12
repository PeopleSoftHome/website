import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import OrderManagerView from './OrderManagerView.vue';
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

describe('OrderManagerView', () => {
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
    mount(OrderManagerView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
      },
      attachTo: document.body,
    });

  const mockOrder = {
    id: 'o1',
    orderNo: 'ORD-2026-001',
    appName: '智能招聘',
    userId: 'u1',
    total: 1999,
    status: 'COMPLETED',
    provider: 'STRIPE',
    paidAt: '2026-07-01T00:00:00Z',
    createdAt: '2026-07-01T00:00:00Z',
    invoiceRequested: true,
    invoiceNo: 'INV-001',
    subscription: { app: { name: '智能招聘 Pro' } },
  };

  it('renders title and filter controls', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('订单管理');
    expect(wrapper.text()).toContain('全部状态');
  });

  it('computes status and provider labels', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.vm.statusLabel('COMPLETED')).toContain('已完成');
    expect(wrapper.vm.providerLabel('STRIPE')).toContain('Stripe');
    expect(wrapper.vm.statusType('FAILED')).toBe('danger');
  });

  it('opens detail dialog and displays order info', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.openDetailDialog(mockOrder);
    await flushPromises();

    expect(wrapper.vm.detailVisible).toBe(true);
    expect(wrapper.vm.detail.orderNo).toBe('ORD-2026-001');
    expect(wrapper.vm.detail.appName).toBe('智能招聘 Pro');
  });

  it('opens status dialog and updates order status', async () => {
    client.patch.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.openStatusDialog(mockOrder);
    await flushPromises();
    expect(wrapper.vm.statusDialogVisible).toBe(true);

    wrapper.vm.statusForm.status = 'REFUNDED';
    wrapper.vm.statusForm.reason = '客户退款';
    await wrapper.vm.handleStatusSave();
    await flushPromises();

    expect(client.patch).toHaveBeenCalledWith(
      '/payments/admin/marketplace/orders/o1/status',
      expect.objectContaining({ status: 'REFUNDED', reason: '客户退款' }),
    );
  });

  it('opens invoice dialog and updates invoice info', async () => {
    client.patch.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.openInvoiceDialog(mockOrder);
    await flushPromises();
    expect(wrapper.vm.invoiceDialogVisible).toBe(true);

    wrapper.vm.invoiceForm.invoiceNo = 'INV-002';
    await wrapper.vm.handleInvoiceSave();
    await flushPromises();

    expect(client.patch).toHaveBeenCalledWith(
      '/payments/admin/marketplace/orders/o1/invoice',
      expect.objectContaining({ invoiceRequested: true, invoiceNo: 'INV-002' }),
    );
  });

  it('applies status filter and refreshes table', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.filterStatus = 'PENDING';
    wrapper.vm.handleFilterChange();
    await flushPromises();

    expect(wrapper.vm.apiParams).toEqual({ status: 'PENDING' });
  });
});
