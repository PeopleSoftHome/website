import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import SectionConfigForm from './SectionConfigForm.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: { zh: zhCN },
});

describe('SectionConfigForm', () => {
  const schema = [
    { prop: 'title', label: '主标题', type: 'input' },
    { prop: 'subtitle', label: '副标题', type: 'textarea', rows: 3 },
    { prop: 'showDashboard', label: '显示仪表盘视觉', type: 'switch', default: true },
    { prop: 'backgroundImage', label: '背景图', type: 'image-upload' },
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountComponent = (props = {}) =>
    mount(SectionConfigForm, {
      props: { schema, modelValue: {}, ...props },
      global: {
        plugins: [ElementPlus, i18n],
      },
    });

  it('renders all schema fields', () => {
    const wrapper = mountComponent();
    expect(wrapper.findAll('.el-form-item').length).toBe(schema.length);
    expect(wrapper.text()).toContain('主标题');
    expect(wrapper.text()).toContain('副标题');
    expect(wrapper.text()).toContain('显示仪表盘视觉');
    expect(wrapper.text()).toContain('背景图');
  });

  it('initializes local values from modelValue and defaults', async () => {
    const wrapper = mountComponent({ modelValue: { title: 'Hello' } });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.local.title).toBe('Hello');
    expect(wrapper.vm.local.showDashboard).toBe(true);
  });

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mountComponent();
    const input = wrapper.find('input');
    await input.setValue('New Title');
    await input.trigger('change');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([{ ...wrapper.vm.local }]);
  });

  it('emits update:modelValue when switch changes', async () => {
    const wrapper = mountComponent();
    const switchInput = wrapper.find('.el-switch');
    await switchInput.trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('emits update:modelValue when image-upload changes', async () => {
    const wrapper = mountComponent();
    const imageUpload = wrapper.findComponent({ name: 'ImageUpload' });
    expect(imageUpload.exists()).toBe(true);

    const url = 'https://cdn.example.com/hero-bg.png';
    await imageUpload.vm.$emit('update:modelValue', url);
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([{ ...wrapper.vm.local, backgroundImage: url }]);
  });
});
