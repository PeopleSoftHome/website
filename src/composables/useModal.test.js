import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { useModal } from './useModal.js';

function mountModal() {
  const comp = defineComponent({
    setup() {
      const modal = useModal();
      return { modal };
    },
    render() { return h('div'); },
  });
  return mount(comp);
}

describe('useModal', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('initial state is closed', () => {
    const wrapper = mountModal();
    expect(wrapper.vm.modal.isOpen.value).toBe(false);
    expect(wrapper.vm.modal.step.value).toBe(0);
    expect(wrapper.vm.modal.isSuccess.value).toBe(false);
  });

  it('opens modal', () => {
    const wrapper = mountModal();
    wrapper.vm.modal.openModal();
    expect(wrapper.vm.modal.isOpen.value).toBe(true);
  });

  it('closes modal and resets after delay', () => {
    const wrapper = mountModal();
    wrapper.vm.modal.openModal();
    wrapper.vm.modal.nextStep();
    wrapper.vm.modal.submitForm();
    expect(wrapper.vm.modal.isSuccess.value).toBe(true);

    wrapper.vm.modal.closeModal();
    expect(wrapper.vm.modal.isOpen.value).toBe(false);
    // step and isSuccess reset after 350ms
    vi.advanceTimersByTime(400);
    expect(wrapper.vm.modal.step.value).toBe(0);
    expect(wrapper.vm.modal.isSuccess.value).toBe(false);
  });

  it('advances step up to max 2', () => {
    const wrapper = mountModal();
    wrapper.vm.modal.nextStep();
    expect(wrapper.vm.modal.step.value).toBe(1);
    wrapper.vm.modal.nextStep();
    expect(wrapper.vm.modal.step.value).toBe(2);
    wrapper.vm.modal.nextStep();
    expect(wrapper.vm.modal.step.value).toBe(2); // capped
  });

  it('submitForm triggers auto-close after 2500ms', () => {
    const wrapper = mountModal();
    wrapper.vm.modal.openModal();
    wrapper.vm.modal.submitForm();
    expect(wrapper.vm.modal.isSuccess.value).toBe(true);
    expect(wrapper.vm.modal.isOpen.value).toBe(true);
    vi.advanceTimersByTime(2600);
    expect(wrapper.vm.modal.isOpen.value).toBe(false);
  });

  it('clears timers on unmount', () => {
    const wrapper = mountModal();
    wrapper.vm.modal.openModal();
    wrapper.vm.modal.submitForm();
    wrapper.unmount();
    // should not throw
    vi.advanceTimersByTime(3000);
  });
});
