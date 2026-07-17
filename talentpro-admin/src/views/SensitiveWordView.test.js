import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus, { ElMessageBox } from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import SensitiveWordView from './SensitiveWordView.vue';
import client from '@/api/client';
import { permissionDirective } from '@/directives/permission';

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

describe('SensitiveWordView', () => {
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
    mount(SensitiveWordView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
        directives: { permission: permissionDirective },
      },
      attachTo: document.body,
    });

  const mockWords = [
    { id: '1', word: '微信', category: 'spam', severity: 2 },
    { id: '2', word: '优惠', category: 'ad', severity: 1 },
  ];

  it('renders title and word list card', async () => {
    client.get.mockResolvedValue({ data: [] });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('敏感词管理');
    expect(wrapper.text()).toContain('词库列表');
  });

  it('fetches sensitive words on mount', async () => {
    client.get.mockResolvedValue({ data: mockWords });
    wrapper = mountComponent();
    await flushPromises();
    expect(client.get).toHaveBeenCalledWith('/system/sensitive-words');
    expect(wrapper.text()).toContain('微信');
    expect(wrapper.text()).toContain('优惠');
  });

  it('adds a new sensitive word', async () => {
    client.get.mockResolvedValue({ data: [] });
    client.post.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.newWord.word = 'test-word';
    wrapper.vm.newWord.category = 'offensive';
    wrapper.vm.newWord.severity = 3;
    await wrapper.vm.addWord();
    await flushPromises();

    expect(client.post).toHaveBeenCalledWith(
      '/system/sensitive-words',
      expect.objectContaining({
        word: 'test-word',
        category: 'offensive',
        severity: 3,
      }),
    );
  });

  it('does not add empty word', async () => {
    client.get.mockResolvedValue({ data: [] });
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.newWord.word = '   ';
    await wrapper.vm.addWord();
    await flushPromises();

    expect(client.post).not.toHaveBeenCalled();
  });

  it('deletes a word after confirmation', async () => {
    vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue();
    client.get.mockResolvedValue({ data: mockWords });
    client.delete.mockResolvedValue({});
    wrapper = mountComponent();
    await flushPromises();

    const deleteBtns = wrapper.findAll('button').filter((b) => b.text().includes('删除'));
    expect(deleteBtns.length).toBe(2);
    await deleteBtns[0].trigger('click');
    await flushPromises();

    expect(ElMessageBox.confirm).toHaveBeenCalled();
    expect(client.delete).toHaveBeenCalledWith('/system/sensitive-words/1');
  });

  it('tests moderation and shows risk score', async () => {
    client.get.mockResolvedValue({ data: [] });
    client.post.mockResolvedValue({
      data: { riskScore: 0.6, flags: ['spam'], autoApprove: false },
    });
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.testContent = '加我微信';
    await wrapper.vm.testModeration();
    await flushPromises();

    expect(client.post).toHaveBeenCalledWith(
      '/system/moderation-test',
      expect.objectContaining({ content: '加我微信' }),
    );
    expect(wrapper.vm.testResult.riskScore).toBe(0.6);
    expect(wrapper.vm.testResult.flags).toContain('spam');
  });

  it('falls back to local simulation when moderation api fails', async () => {
    client.get.mockResolvedValue({ data: [] });
    client.post.mockRejectedValue(new Error('network'));
    wrapper = mountComponent();
    await flushPromises();

    wrapper.vm.testContent = '加我微信：12345';
    await wrapper.vm.testModeration();
    await flushPromises();

    expect(wrapper.vm.testResult.flags).toContain('spam');
    expect(wrapper.vm.testResult.riskScore).toBeGreaterThan(0);
  });
});
