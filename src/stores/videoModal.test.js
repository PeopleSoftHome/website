import { describe, it, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { createVideoModal } from './videoModal.js';

describe('createVideoModal', () => {
  it('returns video modal state object', () => {
    const comp = defineComponent({
      setup() {
        const vm = createVideoModal();
        return { vm };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.vm.isOpen).toBeDefined();
    expect(wrapper.vm.vm.openVideo).toBeDefined();
    expect(wrapper.vm.vm.closeVideo).toBeDefined();
  });

  it('opens and closes video modal', () => {
    const comp = defineComponent({
      setup() {
        const vm = createVideoModal();
        return { vm };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.vm.isOpen.value).toBe(false);
    wrapper.vm.vm.openVideo();
    expect(wrapper.vm.vm.isOpen.value).toBe(true);
    wrapper.vm.vm.closeVideo();
    expect(wrapper.vm.vm.isOpen.value).toBe(false);
  });

  it('is idempotent', () => {
    const comp = defineComponent({
      setup() {
        const vm = createVideoModal();
        return { vm };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.vm.openVideo();
    wrapper.vm.vm.openVideo();
    expect(wrapper.vm.vm.isOpen.value).toBe(true);
    wrapper.vm.vm.closeVideo();
    wrapper.vm.vm.closeVideo();
    expect(wrapper.vm.vm.isOpen.value).toBe(false);
  });
});
