import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import RevenueAnalyticsView from './RevenueAnalyticsView.vue';
import client from '@/api/client';
import VChart from 'vue-echarts';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: { zh: zhCN },
});

vi.mock('@/api/client', () => ({
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

vi.mock('vue-echarts', () => ({
  default: {
    name: 'VChart',
    template: '<div class="v-chart-stub" />',
    props: ['option'],
  },
}));

describe('RevenueAnalyticsView', () => {
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
    mount(RevenueAnalyticsView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
        components: { 'v-chart': VChart },
      },
      attachTo: document.body,
    });

  const mockData = {
    totalRevenue: 125000,
    totalOrders: 320,
    completedOrders: 280,
    refundedOrders: 12,
    dailyRevenue: [
      { date: '2026-06-01T00:00:00Z', revenue: 3000 },
      { date: '2026-06-02T00:00:00Z', revenue: 5000 },
    ],
    byProvider: [
      { provider: 'STRIPE', revenue: 100000, count: 250 },
      { provider: 'ALIPAY', revenue: 25000, count: 70 },
    ],
    topApps: [
      { appName: '智能招聘', orders: 120, revenue: 50000 },
      { appName: '薪酬管理', orders: 80, revenue: 30000 },
    ],
  };

  it('renders title and overview cards', async () => {
    client.get.mockResolvedValue({ data: mockData });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('收入分析');
    expect(wrapper.text()).toContain('GMV');
    expect(wrapper.text()).toContain('¥ 125,000');
    expect(wrapper.text()).toContain('320');
  });

  it('fetches revenue analytics on mount from primary endpoint', async () => {
    client.get.mockResolvedValue({ data: mockData });
    wrapper = mountComponent();
    await flushPromises();
    expect(client.get).toHaveBeenCalledWith('/payments/analytics/revenue?days=30');
  });

  it('falls back to secondary endpoint when primary fails', async () => {
    client.get.mockRejectedValueOnce(new Error('primary failed'));
    client.get.mockResolvedValueOnce({ data: mockData });
    wrapper = mountComponent();
    await flushPromises();
    expect(client.get).toHaveBeenCalledWith('/analytics/marketplace-revenue?days=30');
    expect(wrapper.vm.overview.totalRevenue).toBe(125000);
  });

  it('renders top apps table', async () => {
    client.get.mockResolvedValue({ data: mockData });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('智能招聘');
    expect(wrapper.text()).toContain('薪酬管理');
    expect(wrapper.text()).toContain('50,000');
  });

  it('builds chart options from fetched data', async () => {
    client.get.mockResolvedValue({ data: mockData });
    wrapper = mountComponent();
    await flushPromises();
    const option = wrapper.vm.revenueChartOption;
    expect(option.xAxis.data.length).toBe(2);
    expect(option.series[0].data).toEqual([3000, 5000]);
  });

  it('formats short date correctly', async () => {
    client.get.mockResolvedValue({ data: mockData });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.vm.formatShortDate('2026-07-05T00:00:00Z')).toBe('7/5');
    expect(wrapper.vm.formatShortDate(null)).toBe('-');
  });
});
