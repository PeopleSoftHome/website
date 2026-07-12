import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useFocusTrap } from './useFocusTrap';

function makeFocusableVisible(wrapper: ReturnType<typeof mount>) {
  wrapper.findAll('button, a, input').forEach((w) => {
    const el = w.element as HTMLElement;
    Object.defineProperty(el, 'offsetParent', {
      value: document.body,
      configurable: true,
    });
  });
}

function mountTrap(active = ref(false)) {
  const comp = defineComponent({
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      useFocusTrap(active, containerRef);
      return { containerRef };
    },
    render() {
      return h('div', { ref: 'containerRef' }, [
        h('button', { id: 'first' }, 'first'),
        h('a', { id: 'second', href: '#' }, 'second'),
        h('input', { id: 'third' }),
      ]);
    },
  });
  return mount(comp, { attachTo: document.body });
}

describe('useFocusTrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('focuses first focusable element when activated', async () => {
    const active = ref(false);
    const wrapper = mountTrap(active);
    await nextTick();
    makeFocusableVisible(wrapper);
    active.value = true;
    await nextTick();
    expect(document.activeElement?.id).toBe('first');
    wrapper.unmount();
  });

  it('does not trap when inactive', async () => {
    const wrapper = mountTrap(ref(false));
    await nextTick();
    expect(document.activeElement?.id).not.toBe('first');
    wrapper.unmount();
  });

  it('cycles focus backward on Shift+Tab from first element', async () => {
    const active = ref(false);
    const wrapper = mountTrap(active);
    await nextTick();
    makeFocusableVisible(wrapper);
    active.value = true;
    await nextTick();

    const first = wrapper.find('#first').element as HTMLElement;
    first.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    document.dispatchEvent(event);

    expect(preventDefault).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('cycles focus forward on Tab from last element', async () => {
    const active = ref(false);
    const wrapper = mountTrap(active);
    await nextTick();
    makeFocusableVisible(wrapper);
    active.value = true;
    await nextTick();

    const third = wrapper.find('#third').element as HTMLElement;
    third.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    document.dispatchEvent(event);

    expect(preventDefault).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('ignores non-Tab keys', async () => {
    const active = ref(false);
    const wrapper = mountTrap(active);
    await nextTick();
    makeFocusableVisible(wrapper);
    active.value = true;
    await nextTick();

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    document.dispatchEvent(event);

    expect(preventDefault).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('restores previous focus on deactivation', async () => {
    const prev = document.createElement('button');
    prev.id = 'prev';
    document.body.appendChild(prev);
    prev.focus();

    const active = ref(false);
    const wrapper = mountTrap(active);
    await nextTick();
    makeFocusableVisible(wrapper);
    active.value = true;
    await nextTick();
    expect(document.activeElement?.id).toBe('first');

    active.value = false;
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));
    expect(document.activeElement?.id).toBe('prev');

    wrapper.unmount();
  });
});
