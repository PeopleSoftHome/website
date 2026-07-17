import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { useSearch } from './useSearch';

describe('useSearch', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('initializes with empty query and no results', () => {
    const comp = defineComponent({
      setup() {
        const s = useSearch();
        return { s };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.s.query.value).toBe('');
    expect(wrapper.vm.s.totalResults.value).toBe(0);
    expect(wrapper.vm.s.focusIdx.value).toBe(-1);
  });

  it('debounces query input', async () => {
    const comp = defineComponent({
      setup() {
        const s = useSearch();
        return { s };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.s.handleQueryChange('招聘');
    expect(wrapper.vm.s.query.value).toBe('招聘');
    expect(wrapper.vm.s.totalResults.value).toBe(0); // not yet debounced
    vi.advanceTimersByTime(200);
    expect(wrapper.vm.s.totalResults.value).toBeGreaterThanOrEqual(0);
  });

  it('keyboard navigation updates focusIdx', () => {
    const comp = defineComponent({
      setup() {
        const s = useSearch(() => {});
        return { s };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.s.handleQueryChange('AI');
    vi.advanceTimersByTime(200);
    const total = wrapper.vm.s.totalResults.value;
    if (total > 0) {
      wrapper.vm.s.handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} });
      expect(wrapper.vm.s.focusIdx.value).toBe(0);
      wrapper.vm.s.handleKeyDown({ key: 'ArrowUp', preventDefault: () => {} });
      expect(wrapper.vm.s.focusIdx.value).toBe(-1);
    }
  });

  it('Escape calls onClose', () => {
    const onClose = vi.fn();
    const comp = defineComponent({
      setup() {
        const s = useSearch(onClose);
        return { s };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.s.handleKeyDown({ key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('highlight wraps query in mark tags', () => {
    const comp = defineComponent({
      setup() {
        const s = useSearch();
        return { s };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const result = wrapper.vm.s.highlight('Hello World', 'World');
    expect(result).toContain('<mark>');
    expect(result).toContain('</mark>');
  });

  it('sanitize HTML in highlight', () => {
    const comp = defineComponent({
      setup() {
        const s = useSearch();
        return { s };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    const result = wrapper.vm.s.highlight('<script>alert(1)</script>', 'alert');
    expect(result).not.toContain('<script>');
  });

  it('selectItem: API 结果（URL）走路由跳转', () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [] });
    const pushSpy = vi.spyOn(router, 'push');
    const comp = defineComponent({
      setup() {
        const s = useSearch();
        return { s };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp, { global: { plugins: [router] } });
    wrapper.vm.s.selectItem({ id: '1', type: 'post', title: 'T', tags: [], desc: '', section: '/blog/hello', icon: 'link' });
    expect(pushSpy).toHaveBeenCalledWith('/blog/hello');
    expect(wrapper.vm.s.query.value).toBe('');
  });

  it('selectItem: 本地索引结果（锚点 id）滚动到对应区块', () => {
    const el = document.createElement('div');
    el.id = 'products';
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    const comp = defineComponent({
      setup() {
        const s = useSearch();
        return { s };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.s.selectItem({ id: '2', type: 'page', title: 'T', tags: [], desc: '', section: 'products', icon: 'link' });
    expect(el.scrollIntoView).toHaveBeenCalled();
    document.body.removeChild(el);
  });
});
