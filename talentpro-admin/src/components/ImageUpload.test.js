import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import { createI18n } from 'vue-i18n';
import zhCN from '@/i18n/locales/zh-CN.json';
import ImageUpload from './ImageUpload.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: { zh: zhCN },
});

describe('ImageUpload', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountComponent = (props = {}) =>
    mount(ImageUpload, {
      props: { modelValue: '', ...props },
      global: {
        plugins: [ElementPlus, i18n],
      },
    });

  it('beforeUpload rejects non-image files', () => {
    const wrapper = mountComponent();
    const file = new File(['x'], 'doc.txt', { type: 'text/plain' });
    const result = wrapper.vm.beforeUpload(file);
    expect(result).toBe(false);
  });

  it('beforeUpload rejects oversized images', () => {
    const wrapper = mountComponent();
    const file = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });
    const result = wrapper.vm.beforeUpload(file);
    expect(result).toBe(false);
  });

  it('beforeUpload accepts valid images', () => {
    const wrapper = mountComponent();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });
    const result = wrapper.vm.beforeUpload(file);
    expect(result).toBe(true);
  });

  it('emits update:modelValue with url on upload success', () => {
    const wrapper = mountComponent();
    const url = 'https://cdn.example.com/image.png';
    wrapper.vm.handleSuccess({ data: { url } });
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([url]);
  });

  it('falls back to res.url when data wrapper is absent', () => {
    const wrapper = mountComponent();
    const url = 'https://cdn.example.com/direct.png';
    wrapper.vm.handleSuccess({ url });
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([url]);
  });

  it('clears modelValue on remove', () => {
    const wrapper = mountComponent({ modelValue: 'https://cdn.example.com/old.png' });
    wrapper.vm.handleRemove();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['']);
  });
});
