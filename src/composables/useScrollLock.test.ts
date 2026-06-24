import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useScrollLock, __resetScrollLockState } from './useScrollLock';

describe('useScrollLock', () => {
  beforeEach(() => {
    __resetScrollLockState();
    document.body.style.overflow = '';
  });
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('locks body overflow when true', () => {
    const comp = defineComponent({
      setup() {
        useScrollLock(ref(true));
        return {};
      },
      render() { return h('div'); },
    });
    mount(comp);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when false', async () => {
    const comp = defineComponent({
      setup() {
        const locked = ref(true);
        useScrollLock(locked);
        return { locked };
      },
      render() { return h('div'); },
    });
    const wrapper = mount(comp);
    expect(document.body.style.overflow).toBe('hidden');
    wrapper.vm.locked = false;
    await wrapper.vm.$nextTick();
    expect(document.body.style.overflow).toBe('');
  });

  it('handles ref count correctly with multiple locks', async () => {
    const comp1 = defineComponent({
      setup() {
        const locked = ref(true);
        useScrollLock(locked);
        return { locked };
      },
      render() { return h('div'); },
    });
    const comp2 = defineComponent({
      setup() {
        const locked = ref(true);
        useScrollLock(locked);
        return { locked };
      },
      render() { return h('div'); },
    });
    const w1 = mount(comp1);
    const w2 = mount(comp2);
    expect(document.body.style.overflow).toBe('hidden');
    w1.vm.locked = false;
    await w1.vm.$nextTick();
    w1.unmount();
    // still locked by w2
    expect(document.body.style.overflow).toBe('hidden');
    w2.vm.locked = false;
    await w2.vm.$nextTick();
    w2.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
