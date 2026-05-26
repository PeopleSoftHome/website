import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { createI18n, LOCALES } from './i18n.js';

describe('createI18n', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('navigator', { language: 'zh-CN' });
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('returns i18n state object', () => {
    const comp = defineComponent({
      setup() {
        const i18n = createI18n();
        return { i18n };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.i18n.locale).toBeDefined();
    expect(wrapper.vm.i18n.setLocale).toBeDefined();
    expect(wrapper.vm.i18n.t).toBeDefined();
    expect(wrapper.vm.i18n.LOCALES).toBeDefined();
  });

  it('has all three locales', () => {
    expect(Object.keys(LOCALES)).toEqual(['zh', 'en', 'zh-TW']);
  });

  it('translates known keys', () => {
    const comp = defineComponent({
      setup() {
        const i18n = createI18n();
        return { i18n };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const text = wrapper.vm.i18n.t('nav.demo');
    expect(typeof text).toBe('string');
    expect(text).not.toBe('nav.demo'); // should resolve
  });

  it('falls back to key for missing translations', () => {
    const comp = defineComponent({
      setup() {
        const i18n = createI18n();
        return { i18n };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const text = wrapper.vm.i18n.t('this.does.not.exist');
    expect(text).toBe('this.does.not.exist');
  });

  it('switches locale', () => {
    const comp = defineComponent({
      setup() {
        const i18n = createI18n();
        return { i18n };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.i18n.setLocale('en');
    expect(wrapper.vm.i18n.locale.value).toBe('en');
    wrapper.vm.i18n.setLocale('zh');
    expect(wrapper.vm.i18n.locale.value).toBe('zh');
  });

  it('ignores invalid locale', () => {
    const comp = defineComponent({
      setup() {
        const i18n = createI18n();
        return { i18n };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const prev = wrapper.vm.i18n.locale.value;
    wrapper.vm.i18n.setLocale('invalid');
    expect(wrapper.vm.i18n.locale.value).toBe(prev);
  });
});
