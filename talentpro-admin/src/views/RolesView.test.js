import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus, { ElMessageBox } from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import RolesView from './RolesView.vue';
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

describe('RolesView', () => {
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
    mount(RolesView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
      },
      attachTo: document.body,
    });

  const mockRoles = [
    {
      id: 1,
      name: 'admin',
      description: '管理员',
      permissions: [{ id: 1, resource: 'user', action: 'read' }],
    },
    {
      id: 2,
      name: 'editor',
      description: '编辑',
      permissions: [],
    },
  ];

  it('renders title and create button', async () => {
    client.get.mockResolvedValue({ data: [], meta: { total: 0 } });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('角色管理');
    expect(wrapper.text()).toContain('新建角色');
  });

  it('fetches roles and permissions on mount', async () => {
    client.get.mockResolvedValue({ data: mockRoles, meta: { total: 2 } });
    wrapper = mountComponent();
    await flushPromises();
    expect(client.get).toHaveBeenCalledWith('/roles');
  });

  it('renders list data into el-table', async () => {
    client.get.mockResolvedValue({ data: mockRoles, meta: { total: 2 } });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('admin');
    expect(wrapper.text()).toContain('editor');
    expect(wrapper.text()).toContain('user:read');
    expect(wrapper.text()).toContain('无权限');
  });

  it('opens create dialog on create button click', async () => {
    client.get.mockResolvedValue({ data: [], meta: { total: 0 } });
    wrapper = mountComponent();
    await flushPromises();
    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('新建角色'));
    expect(createBtn).toBeTruthy();
    await createBtn.trigger('click');
    await flushPromises();
    expect(wrapper.vm.crud.dialogVisible).toBe(true);
    expect(wrapper.vm.crud.isEdit).toBe(false);
    expect(document.body.textContent).toContain('新建角色');
  });

  it('prevents save when role name is empty', async () => {
    client.get.mockResolvedValue({ data: [], meta: { total: 0 } });
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.crud.openDialog();
    await flushPromises();
    wrapper.vm.crud.form.name = '';
    wrapper.vm.crud.handleSave();
    await flushPromises();
    expect(client.post).not.toHaveBeenCalled();
    expect(client.patch).not.toHaveBeenCalled();
  });

  it('backfills form when editing a role', async () => {
    client.get.mockResolvedValue({ data: mockRoles, meta: { total: 2 } });
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.crud.openDialog(mockRoles[0]);
    expect(wrapper.vm.crud.isEdit).toBe(true);
    expect(wrapper.vm.crud.form.name).toBe('admin');
    expect(wrapper.vm.crud.form.description).toBe('管理员');
  });

  it('calls delete api when delete button clicked', async () => {
    vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue();
    client.get.mockResolvedValue({ data: mockRoles, meta: { total: 2 } });
    client.delete.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();
    const deleteBtns = wrapper
      .findAll('button')
      .filter((b) => b.text().includes('删除'));
    expect(deleteBtns.length).toBeGreaterThan(0);
    await deleteBtns[0].trigger('click');
    await flushPromises();
    expect(ElMessageBox.confirm).toHaveBeenCalled();
    expect(client.delete).toHaveBeenCalledWith('/roles/1');
  });
});
