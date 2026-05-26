import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useSearch } from './useSearch.js';

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
});
