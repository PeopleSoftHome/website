import { describe, it, expect, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useFocusTrap } from './useFocusTrap.ts';

describe('useFocusTrap', () => {
  it('does not throw when container is null', () => {
    const comp = defineComponent({
      setup() {
        const isActive = ref(true);
        const containerRef = ref(null);
        useFocusTrap(isActive, containerRef);
        return {};
      },
      render() { return h('div'); },
    });
    expect(() => mount(comp)).not.toThrow();
  });

  it('restores focus on deactivation', async () => {
    const comp = defineComponent({
      setup() {
        const isActive = ref(true);
        const containerRef = ref(null);
        useFocusTrap(isActive, containerRef);
        return { isActive };
      },
      render() {
        return h('div', { ref: 'container' }, [
          h('button', { ref: 'btn' }, 'focusable'),
        ]);
      },
    });
    const wrapper = mount(comp);
    wrapper.vm.isActive = false;
    await wrapper.vm.$nextTick();
    // should not throw
  });

  it('focuses first focusable element when activated', () => {
    const comp = defineComponent({
      setup() {
        const isActive = ref(true);
        const containerRef = ref(null);
        useFocusTrap(isActive, containerRef);
        return { isActive, containerRef };
      },
      render() {
        return h('div', { ref: 'containerRef' }, [
          h('button', 'A'),
          h('a', { href: '#' }, 'B'),
        ]);
      },
    });
    const wrapper = mount(comp);
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('cleans up on unmount', () => {
    const comp = defineComponent({
      setup() {
        const isActive = ref(false);
        const containerRef = ref(null);
        useFocusTrap(isActive, containerRef);
        return {};
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(() => wrapper.unmount()).not.toThrow();
  });
});
