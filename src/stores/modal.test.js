import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { useModalStore } from './modal.pinia.js';

vi.mock('@/api/lead.js', () => ({
  leadApi: { createBooking: vi.fn(() => Promise.resolve({ id: 1 })) },
}));

vi.mock('@/composables/usePublicConfig.js', () => ({
  usePublicConfig: () => ({ recaptchaSiteKey: '' }),
}));

describe('useModalStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
  });
  afterEach(() => { vi.useRealTimers(); });

  const mountStore = () => {
    const comp = defineComponent({
      setup() {
        const modal = useModalStore();
        return { modal };
      },
      render() { return h('div'); },
    });
    return mount(comp);
  };

  it('returns modal state object', () => {
    const wrapper = mountStore();
    const modal = wrapper.vm.modal;
    expect(modal.isOpen).toBeDefined();
    expect(modal.openModal).toBeDefined();
    expect(modal.closeModal).toBeDefined();
    expect(modal.step).toBeDefined();
    expect(modal.isSuccess).toBeDefined();
    expect(modal.nextStep).toBeDefined();
    expect(modal.submitForm).toBeDefined();
  });

  it('opens and closes modal', () => {
    const wrapper = mountStore();
    const modal = wrapper.vm.modal;
    modal.openModal();
    expect(modal.isOpen).toBe(true);
    modal.closeModal();
    expect(modal.isOpen).toBe(false);
  });

  it('advances through steps', async () => {
    const wrapper = mountStore();
    const modal = wrapper.vm.modal;
    modal.openModal();
    modal.nextStep();
    expect(modal.step).toBe(1);
    await modal.submitForm();
    expect(modal.isSuccess).toBe(true);
  });
});
