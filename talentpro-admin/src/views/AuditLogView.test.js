import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus, { ElMessage } from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import AuditLogView from './AuditLogView.vue';
import client from '@/api/client';

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

describe('AuditLogView', () => {
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
    mount(AuditLogView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
      },
    });

  const mockLogs = [
    {
      id: 1,
      userId: 'user-1',
      action: 'CREATE',
      resource: 'User',
      resourceId: 'u1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      userId: 'user-2',
      action: 'UPDATE',
      resource: 'Role',
      resourceId: 'r2',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120.0',
      createdAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  it('renders title', async () => {
    client.get.mockResolvedValue({ data: [], meta: { total: 0 } });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('审计日志');
  });

  it('fetches audit logs on mount', async () => {
    client.get.mockResolvedValue({ data: mockLogs, meta: { total: 2 } });
    wrapper = mountComponent();
    await flushPromises();
    expect(client.get).toHaveBeenCalledWith('/system/audit-logs?page=1&pageSize=20');
  });

  it('renders logs into el-table', async () => {
    client.get.mockResolvedValue({ data: mockLogs, meta: { total: 2 } });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('user-1');
    expect(wrapper.text()).toContain('CREATE');
    expect(wrapper.text()).toContain('user-2');
    expect(wrapper.text()).toContain('UPDATE');
  });

  it('shows total count in pagination', async () => {
    client.get.mockResolvedValue({ data: mockLogs, meta: { total: 42 } });
    wrapper = mountComponent();
    await flushPromises();
    const pagination = wrapper.findComponent({ name: 'ElPagination' });
    expect(pagination.exists()).toBe(true);
    expect(pagination.props('total')).toBe(42);
  });

  it('shows error message when api fails', async () => {
    vi.spyOn(ElMessage, 'error').mockImplementation(() => {});
    client.get.mockRejectedValue(new Error('network error'));
    wrapper = mountComponent();
    await flushPromises();
    expect(ElMessage.error).toHaveBeenCalled();
  });
});
