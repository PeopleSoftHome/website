import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { createModal } from './modal.js';

vi.mock('@/api/lead.js', () => ({
  leadApi: { createBooking: vi.fn(() => Promise.resolve({ id: 1 })) },
}));

describe('createModal', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns modal state object', () => {
    const comp = defineComponent({
      setup() {
        const modal = createModal();
        return { modal };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(wrapper.vm.modal.isOpen).toBeDefined();
    expect(wrapper.vm.modal.openModal).toBeDefined();
    expect(wrapper.vm.modal.closeModal).toBeDefined();
    expect(wrapper.vm.modal.step).toBeDefined();
    expect(wrapper.vm.modal.isSuccess).toBeDefined();
    expect(wrapper.vm.modal.nextStep).toBeDefined();
    expect(wrapper.vm.modal.submitForm).toBeDefined();
  });

  it('opens and closes modal', () => {
    const comp = defineComponent({
      setup() {
        const modal = createModal();
        return { modal };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.modal.openModal();
    expect(wrapper.vm.modal.isOpen.value).toBe(true);
    wrapper.vm.modal.closeModal();
    expect(wrapper.vm.modal.isOpen.value).toBe(false);
  });

  it('advances through steps', async () => {
    const comp = defineComponent({
      setup() {
        const modal = createModal();
        return { modal };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    wrapper.vm.modal.openModal();
    wrapper.vm.modal.nextStep();
    expect(wrapper.vm.modal.step.value).toBe(1);
    await wrapper.vm.modal.submitForm();
    await nextTick();
    expect(wrapper.vm.modal.isSuccess.value).toBe(true);
  });
});
