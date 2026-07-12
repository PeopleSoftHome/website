import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ElementPlus from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import AiConfigAssistant from './AiConfigAssistant.vue';
import * as aiModule from '@/api/ai.js';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: { zh: zhCN },
});

vi.mock('@/api/ai.js', () => ({
  aiApi: {
    adminChat: vi.fn(),
  },
}));

describe('AiConfigAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = (props = {}) =>
    mount(AiConfigAssistant, {
      props: { page: null, sections: [], ...props },
      global: {
        plugins: [ElementPlus, i18n],
      },
    });

  it('renders empty hint initially', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('输入问题或点击快捷操作');
  });

  it('sends message and displays assistant response', async () => {
    const wrapper = mountComponent();
    aiModule.aiApi.adminChat.mockResolvedValue({ content: '建议如下：...' });

    wrapper.vm.input = '如何配置首页';
    wrapper.vm.sendMessage();

    await flushPromises();
    expect(aiModule.aiApi.adminChat).toHaveBeenCalledWith({
      message: '如何配置首页',
      history: [],
      context: { page: null, sections: [] },
    });
    expect(wrapper.vm.messages.length).toBe(2);
    expect(wrapper.text()).toContain('建议如下：...');
  });

  it('emits applyImage when image url is returned and apply button clicked', async () => {
    const url = 'https://cdn.example.com/hero-bg.png';
    const wrapper = mountComponent();
    aiModule.aiApi.adminChat.mockResolvedValue({ content: `![hero](${url})` });

    wrapper.vm.input = '生成背景图';
    wrapper.vm.sendMessage();

    await flushPromises();
    expect(wrapper.vm.messages[1].imageUrl).toBe(url);

    const applyButton = wrapper.find('button');
    await applyButton.trigger('click');
    expect(wrapper.emitted('applyImage')).toBeTruthy();
    expect(wrapper.emitted('applyImage')[0]).toEqual([url]);
  });

  it('quick action sends predefined prompt', async () => {
    const wrapper = mountComponent();
    aiModule.aiApi.adminChat.mockResolvedValue({ content: '优化结果' });

    const quickButton = wrapper.findAll('button').find((b) => b.text().includes('优化 Hero 文案'));
    expect(quickButton).toBeTruthy();
    await quickButton.trigger('click');

    await flushPromises();
    expect(wrapper.vm.messages[0].content).toContain('优化 Hero 首屏');
    expect(wrapper.text()).toContain('优化结果');
  });

  it('emits applyCopy when suggestion button is clicked', async () => {
    const wrapper = mountComponent();
    aiModule.aiApi.adminChat.mockResolvedValue({
      content: '主标题：AI 标题\n副标题：AI 副标题\n主按钮文案：立即体验\n次按钮文案：了解更多',
    });

    wrapper.vm.input = '优化文案';
    wrapper.vm.sendMessage();
    await flushPromises();

    const suggestionButton = wrapper.findAll('button').find((b) => b.text().includes('应用为主标题'));
    expect(suggestionButton).toBeTruthy();
    await suggestionButton.trigger('click');

    expect(wrapper.emitted('applyCopy')).toBeTruthy();
    expect(wrapper.emitted('applyCopy')[0]).toEqual([{ field: 'title', value: 'AI 标题' }]);
  });

  it('shows fallback message when adminChat fails', async () => {
    const wrapper = mountComponent();
    aiModule.aiApi.adminChat.mockRejectedValue(new Error('network error'));

    wrapper.vm.input = '生成背景图';
    wrapper.vm.sendMessage();

    await flushPromises();
    expect(wrapper.vm.messages.length).toBe(2);
    expect(wrapper.vm.messages[1].content).toBe('发送失败，请稍后重试');
  });
});
