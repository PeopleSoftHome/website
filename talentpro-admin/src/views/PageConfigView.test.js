import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus, { ElMessage } from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import PageConfigView from './PageConfigView.vue';
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

vi.mock('@/components/page-config/SectionConfigForm.vue', () => ({
  default: {
    name: 'SectionConfigForm',
    template: '<div class="section-config-form-stub">SectionConfigForm</div>',
    props: ['modelValue', 'schema'],
    emits: ['update:modelValue'],
  },
}));

vi.mock('@/components/ai/AiConfigAssistant.vue', () => ({
  default: {
    name: 'AiConfigAssistant',
    template: '<div class="ai-config-assistant-stub">AiConfigAssistant</div>',
    props: ['page', 'sections'],
    emits: ['applyImage', 'applyCopy'],
  },
}));

describe('PageConfigView', () => {
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
    mount(PageConfigView, {
      global: {
        plugins: [ElementPlus, i18n, createPinia()],
      },
      attachTo: document.body,
    });

  const mockPage = {
    id: 'p1',
    slug: 'home',
    title: '首页',
    isPublished: true,
    sections: [
      { id: 's1', type: 'hero', sortOrder: 0, isActive: true, config: { showDashboard: true } },
      { id: 's2', type: 'stats', sortOrder: 1, isActive: true, config: {} },
    ],
  };

  it('renders title and empty state when no page', async () => {
    client.get.mockResolvedValue({ data: null });
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain('首页配置管理');
    expect(wrapper.text()).toContain('暂无首页配置');
  });

  it('fetches page and renders section list', async () => {
    client.get.mockResolvedValue({ data: mockPage });
    wrapper = mountComponent();
    await flushPromises();
    expect(client.get).toHaveBeenCalledWith('/cms/pages/home');
    expect(wrapper.text()).toContain('Hero 首屏');
    expect(wrapper.text()).toContain('统计数据');
  });

  it('toggles section active state and enables save button', async () => {
    client.get.mockResolvedValue({ data: mockPage });
    wrapper = mountComponent();
    await flushPromises();
    const switches = wrapper.findAllComponents({ name: 'ElSwitch' });
    expect(switches.length).toBeGreaterThan(0);
    await switches[0].trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('保存更改');
  });

  it('opens config dialog for hero section', async () => {
    client.get.mockResolvedValue({ data: mockPage });
    wrapper = mountComponent();
    await flushPromises();
    const configBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('配置'));
    expect(configBtn).toBeTruthy();
    await configBtn.trigger('click');
    await flushPromises();
    expect(document.body.textContent).toContain('配置 Hero 首屏');
  });

  it('applies AI image to hero section', async () => {
    client.get.mockResolvedValue({ data: mockPage });
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.onApplyAiImage('https://cdn.example.com/ai-bg.png');
    await flushPromises();
    expect(document.body.textContent).toContain('配置 Hero 首屏');
    expect(wrapper.vm.editingConfig.backgroundImage).toBe('https://cdn.example.com/ai-bg.png');
  });

  it('applies AI copy to hero section', async () => {
    client.get.mockResolvedValue({ data: mockPage });
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.onApplyAiCopy({ field: 'title', value: 'AI 生成标题' });
    await flushPromises();
    expect(wrapper.vm.editingConfig.title).toBe('AI 生成标题');
  });

  it('saves section order and active state', async () => {
    client.get.mockResolvedValue({ data: mockPage });
    client.post.mockResolvedValue({ data: { success: true } });
    wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.hasChanges = true;
    await flushPromises();
    const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('保存更改'));
    expect(saveBtn).toBeTruthy();
    await saveBtn.trigger('click');
    await flushPromises();
    expect(client.post).toHaveBeenCalledWith('/cms/sections/batch', expect.any(Object));
  });

});
